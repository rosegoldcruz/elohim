/**
 * AEON Creator Stripe Payout API
 * Handles Stripe Connect payouts for creators
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { creatorAgent } from '@/lib/agents/creatorAgent'
import { z } from 'zod'

// Request validation schema
const StripePayoutSchema = z.object({
  amount: z.number().min(1).max(10000), // Credits to payout
  creatorId: z.string().uuid().optional()
})

/**
 * POST /api/creator/payout/stripe
 * Process Stripe payout for creator
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const { amount, creatorId = userId } = StripePayoutSchema.parse(body)

    // Validate creator access (users can only payout their own funds)
    if (creatorId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get current wallet to validate balance
    const wallet = await creatorAgent.getWallet(creatorId)
    if (!wallet) {
      return NextResponse.json(
        { error: 'Creator wallet not found' },
        { status: 404 }
      )
    }

    // Validate sufficient balance
    if (wallet.balance < amount) {
      return NextResponse.json(
        { 
          error: 'Insufficient balance',
          details: {
            requested: amount,
            available: wallet.balance
          }
        },
        { status: 400 }
      )
    }

    // Check minimum payout threshold
    if (amount < wallet.payout_threshold) {
      return NextResponse.json(
        { 
          error: 'Amount below minimum payout threshold',
          details: {
            requested: amount,
            minimum: wallet.payout_threshold
          }
        },
        { status: 400 }
      )
    }

    // Check Stripe account status
    if (!wallet.stripe_account_id) {
      return NextResponse.json(
        { 
          error: 'Stripe account not connected',
          details: 'Please connect your Stripe account to receive payouts'
        },
        { status: 400 }
      )
    }

    // Process the payout
    const payoutResult = await creatorAgent.payoutStripe(creatorId, amount)

    if (!payoutResult.success) {
      return NextResponse.json(
        { 
          error: 'Payout failed',
          details: payoutResult.error
        },
        { status: 400 }
      )
    }

    // Get updated wallet balance
    const updatedWallet = await creatorAgent.getWallet(creatorId)

    return NextResponse.json({
      success: true,
      data: {
        payout: {
          amount,
          transactionId: payoutResult.transaction_id,
          estimatedArrival: payoutResult.estimated_arrival,
          method: 'stripe'
        },
        wallet: updatedWallet
      },
      message: 'Stripe payout processed successfully'
    })

  } catch (error) {
    console.error('Stripe payout API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to process Stripe payout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/creator/payout/stripe
 * Get Stripe account status and payout information
 */
export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get creator wallet
    const wallet = await creatorAgent.getWallet(userId)
    if (!wallet) {
      return NextResponse.json(
        { error: 'Creator wallet not found' },
        { status: 404 }
      )
    }

    // Check Stripe account status
    const stripeStatus = {
      connected: !!wallet.stripe_account_id,
      accountId: wallet.stripe_account_id,
      status: wallet.stripe_account_status,
      payoutsEnabled: wallet.stripe_account_status === 'active',
      minimumPayout: wallet.payout_threshold
    }

    // Get recent Stripe payouts
    const recentTransactions = await creatorAgent.getTransactions(userId, 10)
    const stripePayouts = recentTransactions.filter(t => 
      t.type === 'payout' && t.payout_method === 'stripe'
    )

    return NextResponse.json({
      success: true,
      data: {
        stripeStatus,
        recentPayouts: stripePayouts,
        availableBalance: wallet.balance,
        canPayout: wallet.balance >= wallet.payout_threshold && stripeStatus.payoutsEnabled
      }
    })

  } catch (error) {
    console.error('Stripe status API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get Stripe status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/creator/payout/stripe
 * Update Stripe payout settings
 */
export async function PUT(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { payout_threshold, auto_payout } = body

    // Validate payout threshold
    if (payout_threshold !== undefined) {
      if (typeof payout_threshold !== 'number' || payout_threshold < 1 || payout_threshold > 1000) {
        return NextResponse.json(
          { error: 'Payout threshold must be between 1 and 1000 credits' },
          { status: 400 }
        )
      }
    }

    // Update preferences
    const success = await creatorAgent.updatePayoutPreferences(userId, {
      payout_method: 'stripe',
      payout_threshold,
      auto_payout
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update Stripe settings' },
        { status: 500 }
      )
    }

    // Return updated wallet
    const wallet = await creatorAgent.getWallet(userId)

    return NextResponse.json({
      success: true,
      data: { wallet },
      message: 'Stripe settings updated successfully'
    })

  } catch (error) {
    console.error('Update Stripe settings API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update Stripe settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/creator/payout/stripe
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
