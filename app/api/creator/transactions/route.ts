/**
 * AEON Creator Transactions API
 * Handles creator transaction history and analytics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { creatorAgent } from '@/lib/agents/creatorAgent'
import { z } from 'zod'

// Request validation schemas
const GetTransactionsSchema = z.object({
  creatorId: z.string().uuid().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
  type: z.enum(['earning', 'payout', 'bonus', 'refund', 'fee']).optional(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled']).optional()
})

/**
 * GET /api/creator/transactions
 * Get creator transaction history with filtering and pagination
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

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url)
    const queryParams = {
      creatorId: searchParams.get('creatorId') || userId,
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      type: searchParams.get('type'),
      status: searchParams.get('status')
    }

    const validatedParams = GetTransactionsSchema.parse(queryParams)

    // Validate creator access (users can only access their own transactions)
    if (validatedParams.creatorId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get transactions
    const transactions = await creatorAgent.getTransactions(
      validatedParams.creatorId,
      validatedParams.limit,
      validatedParams.offset
    )

    // Apply additional filters if specified
    let filteredTransactions = transactions
    
    if (validatedParams.type) {
      filteredTransactions = filteredTransactions.filter(t => t.type === validatedParams.type)
    }
    
    if (validatedParams.status) {
      filteredTransactions = filteredTransactions.filter(t => t.status === validatedParams.status)
    }

    // Calculate summary statistics
    const totalEarnings = transactions
      .filter(t => t.type === 'earning' && t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalPayouts = transactions
      .filter(t => t.type === 'payout' && t.status === 'completed')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    const pendingPayouts = transactions
      .filter(t => t.type === 'payout' && t.status === 'pending')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Calculate monthly trends
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const monthlyEarnings = transactions
      .filter(t => 
        t.type === 'earning' && 
        t.status === 'completed' &&
        new Date(t.created_at) >= thirtyDaysAgo
      )
      .reduce((sum, t) => sum + t.amount, 0)

    const monthlyPayouts = transactions
      .filter(t => 
        t.type === 'payout' && 
        t.status === 'completed' &&
        new Date(t.created_at) >= thirtyDaysAgo
      )
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)

    return NextResponse.json({
      success: true,
      data: {
        transactions: filteredTransactions,
        pagination: {
          limit: validatedParams.limit,
          offset: validatedParams.offset,
          total: filteredTransactions.length,
          hasMore: transactions.length === validatedParams.limit
        },
        summary: {
          totalEarnings,
          totalPayouts,
          pendingPayouts,
          monthlyEarnings,
          monthlyPayouts,
          netEarnings: totalEarnings - totalPayouts
        }
      }
    })

  } catch (error) {
    console.error('Creator transactions API error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: error.errors
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Failed to fetch transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/creator/transactions
 * Export transaction history (CSV/JSON)
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
    const { format = 'json', dateFrom, dateTo } = body

    // Validate format
    if (!['json', 'csv'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "json" or "csv"' },
        { status: 400 }
      )
    }

    // Get all transactions for export
    const transactions = await creatorAgent.getTransactions(userId, 1000, 0)

    // Filter by date range if provided
    let filteredTransactions = transactions
    if (dateFrom) {
      const fromDate = new Date(dateFrom)
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.created_at) >= fromDate
      )
    }
    if (dateTo) {
      const toDate = new Date(dateTo)
      filteredTransactions = filteredTransactions.filter(t => 
        new Date(t.created_at) <= toDate
      )
    }

    if (format === 'csv') {
      // Convert to CSV format
      const csvHeaders = [
        'Date',
        'Type',
        'Amount',
        'Description',
        'Status',
        'Payout Method',
        'Transaction ID'
      ].join(',')

      const csvRows = filteredTransactions.map(t => [
        new Date(t.created_at).toISOString().split('T')[0],
        t.type,
        t.amount,
        `"${t.description.replace(/"/g, '""')}"`,
        t.status,
        t.payout_method || '',
        t.transaction_hash || t.stripe_transfer_id || ''
      ].join(','))

      const csvContent = [csvHeaders, ...csvRows].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="creator-transactions-${userId}-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Return JSON format
    return NextResponse.json({
      success: true,
      data: {
        transactions: filteredTransactions,
        exportedAt: new Date().toISOString(),
        totalRecords: filteredTransactions.length
      }
    })

  } catch (error) {
    console.error('Export transactions API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to export transactions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/creator/transactions
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
