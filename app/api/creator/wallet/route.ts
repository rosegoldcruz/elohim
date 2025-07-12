/**
 * AEON Creator Wallet API
 * Handles creator wallet operations and balance management
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { creatorAgent } from '@/lib/agents/creatorAgent'
import { z } from 'zod'

// Request validation schemas
const GetWalletSchema = z.object({
  creatorId: z.string().uuid().optional()
})

const UpdatePreferencesSchema = z.object({
  payout_method: z.enum(['stripe', 'crypto', 'bank']).optional(),
  payout_threshold: z.number().min(1).max(1000).optional(),
  auto_payout: z.boolean().optional(),
  crypto_wallet_address: z.string().optional(),
  crypto_wallet_type: z.string().optional()
})

/**
 * GET /api/creator/wallet
 * Get creator wallet information and summary
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

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const creatorId = searchParams.get('creatorId') || userId

    // Validate creator access (users can only access their own wallet)
    if (creatorId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get wallet summary
    const walletSummary = await creatorAgent.getWalletSummary(creatorId)

    return NextResponse.json({
      success: true,
      data: walletSummary
    })

  } catch (error) {
    console.error('Creator wallet API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch wallet information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/creator/wallet
 * Update creator wallet preferences
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

    // Parse and validate request body
    const body = await req.json()
    const preferences = UpdatePreferencesSchema.parse(body)

    // Update preferences
    const success = await creatorAgent.updatePayoutPreferences(userId, preferences)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update preferences' },
        { status: 500 }
      )
    }

    // Return updated wallet
    const wallet = await creatorAgent.getWallet(userId)

    return NextResponse.json({
      success: true,
      data: { wallet },
      message: 'Preferences updated successfully'
    })

  } catch (error) {
    console.error('Update preferences API error:', error)
    
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
        error: 'Failed to update preferences',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/creator/wallet
 * Add earnings to creator wallet (internal use)
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

    // Parse request body
    const body = await req.json()
    const { amount, description, source } = body

    // Validate required fields
    if (!amount || !description) {
      return NextResponse.json(
        { error: 'Amount and description are required' },
        { status: 400 }
      )
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be positive' },
        { status: 400 }
      )
    }

    // Add earnings
    const success = await creatorAgent.addEarnings(
      userId,
      amount,
      description,
      source
    )

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to add earnings' },
        { status: 500 }
      )
    }

    // Return updated wallet
    const wallet = await creatorAgent.getWallet(userId)

    return NextResponse.json({
      success: true,
      data: { wallet },
      message: 'Earnings added successfully'
    })

  } catch (error) {
    console.error('Add earnings API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to add earnings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/creator/wallet
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
