/**
 * AEON Creator Crypto Payout API
 * Handles cryptocurrency payouts for creators
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { creatorAgent } from '@/lib/agents/creatorAgent'
import { z } from 'zod'

// Request validation schema
const CryptoPayoutSchema = z.object({
  amount: z.number().min(1).max(10000), // Credits to payout
  tokenType: z.enum(['ETH', 'USDC']).default('USDC'),
  creatorId: z.string().uuid().optional()
})

const UpdateCryptoSettingsSchema = z.object({
  crypto_wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address').optional(),
  crypto_wallet_type: z.enum(['metamask', 'walletconnect', 'coinbase']).optional(),
  payout_threshold: z.number().min(1).max(1000).optional(),
  auto_payout: z.boolean().optional()
})

/**
 * POST /api/creator/payout/crypto
 * Process cryptocurrency payout for creator
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
    const { amount, tokenType, creatorId = userId } = CryptoPayoutSchema.parse(body)

    // Validate creator access (users can only payout their own funds)
    if (creatorId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get current wallet to validate balance and crypto setup
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

    // Check crypto wallet setup
    if (!wallet.crypto_wallet_address) {
      return NextResponse.json(
        { 
          error: 'Crypto wallet not connected',
          details: 'Please connect your crypto wallet to receive payouts'
        },
        { status: 400 }
      )
    }

    // Validate Ethereum address format
    const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/
    if (!ethAddressRegex.test(wallet.crypto_wallet_address)) {
      return NextResponse.json(
        { 
          error: 'Invalid crypto wallet address',
          details: 'Please update your wallet address'
        },
        { status: 400 }
      )
    }

    // Process the crypto payout
    const payoutResult = await creatorAgent.payoutCrypto(creatorId, amount, tokenType)

    if (!payoutResult.success) {
      return NextResponse.json(
        { 
          error: 'Crypto payout failed',
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
          tokenType,
          transactionHash: payoutResult.transaction_id,
          estimatedArrival: payoutResult.estimated_arrival,
          method: 'crypto',
          walletAddress: wallet.crypto_wallet_address
        },
        wallet: updatedWallet
      },
      message: `${tokenType} payout processed successfully`
    })

  } catch (error) {
    console.error('Crypto payout API error:', error)
    
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
        error: 'Failed to process crypto payout',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/creator/payout/crypto
 * Get crypto wallet status and payout information
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

    // Check crypto wallet status
    const cryptoStatus = {
      connected: !!wallet.crypto_wallet_address,
      walletAddress: wallet.crypto_wallet_address,
      walletType: wallet.crypto_wallet_type,
      payoutsEnabled: !!wallet.crypto_wallet_address,
      minimumPayout: wallet.payout_threshold,
      supportedTokens: ['ETH', 'USDC']
    }

    // Get recent crypto payouts
    const recentTransactions = await creatorAgent.getTransactions(userId, 10)
    const cryptoPayouts = recentTransactions.filter(t => 
      t.type === 'payout' && t.payout_method === 'crypto'
    )

    // Calculate gas fee estimates (placeholder - would integrate with actual gas price API)
    const gasEstimates = {
      ETH: { low: 0.005, medium: 0.008, high: 0.012 },
      USDC: { low: 0.008, medium: 0.012, high: 0.018 }
    }

    return NextResponse.json({
      success: true,
      data: {
        cryptoStatus,
        recentPayouts: cryptoPayouts,
        availableBalance: wallet.balance,
        canPayout: wallet.balance >= wallet.payout_threshold && cryptoStatus.payoutsEnabled,
        gasEstimates
      }
    })

  } catch (error) {
    console.error('Crypto status API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get crypto status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/creator/payout/crypto
 * Update crypto payout settings
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
    const settings = UpdateCryptoSettingsSchema.parse(body)

    // Update preferences
    const success = await creatorAgent.updatePayoutPreferences(userId, {
      payout_method: 'crypto',
      ...settings
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update crypto settings' },
        { status: 500 }
      )
    }

    // Return updated wallet
    const wallet = await creatorAgent.getWallet(userId)

    return NextResponse.json({
      success: true,
      data: { wallet },
      message: 'Crypto settings updated successfully'
    })

  } catch (error) {
    console.error('Update crypto settings API error:', error)
    
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
        error: 'Failed to update crypto settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/creator/payout/crypto
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
