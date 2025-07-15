/**
 * AEON Admin Export API
 * Handles data export for accounting, tax filings, and investor reports
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminAgent } from '@/lib/agents/adminAgent'
import { z } from 'zod'

// Request validation schemas
const ExportQuerySchema = z.object({
  type: z.enum(['transactions', 'revenue', 'creators', 'full_report']).default('transactions'),
  format: z.enum(['csv', 'json', 'xlsx']).default('csv'),
  startDate: z.string(),
  endDate: z.string(),
  includeMetadata: z.coerce.boolean().default(true)
})

/**
 * Check if user has admin privileges
 */
async function checkAdminAccess(userId: string): Promise<boolean> {
  const adminUsers = process.env.ADMIN_USER_IDS?.split(',') || []
  return adminUsers.includes(userId)
}

/**
 * GET /api/admin/export
 * Export platform data for external use
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

    // Admin access check
    const isAdmin = await checkAdminAccess(userId)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url)
    const queryParams = {
      type: searchParams.get('type'),
      format: searchParams.get('format'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      includeMetadata: searchParams.get('includeMetadata')
    }

    const { type, format, startDate, endDate, includeMetadata } = ExportQuerySchema.parse(queryParams)

    // Validate date range
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    
    if (start >= end) {
      return NextResponse.json(
        { error: 'Start date must be before end date' },
        { status: 400 }
      )
    }

    // Generate filename
    const dateStr = `${start.toISOString().split('T')[0]}_to_${end.toISOString().split('T')[0]}`
    const filename = `aeon_${type}_${dateStr}.${format}`

    let exportData: any = null
    let contentType = 'application/json'
    let headers: { [key: string]: string } = {}

    switch (type) {
      case 'transactions':
        exportData = await exportTransactions(startDate, endDate, format, includeMetadata)
        break
      
      case 'revenue':
        exportData = await exportRevenue(startDate, endDate, format, includeMetadata)
        break
      
      case 'creators':
        exportData = await exportCreators(format, includeMetadata)
        break
      
      case 'full_report':
        exportData = await exportFullReport(startDate, endDate, format, includeMetadata)
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid export type' },
          { status: 400 }
        )
    }

    // Set appropriate content type and headers
    if (format === 'csv') {
      contentType = 'text/csv'
      headers['Content-Disposition'] = `attachment; filename="${filename}"`
    } else if (format === 'xlsx') {
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      headers['Content-Disposition'] = `attachment; filename="${filename}"`
    } else {
      contentType = 'application/json'
      headers['Content-Disposition'] = `attachment; filename="${filename}"`
    }

    // Log export activity
    console.log(`Admin ${userId} exported ${type} data (${format}) for period ${startDate} to ${endDate}`)

    return new NextResponse(exportData, {
      headers: {
        'Content-Type': contentType,
        ...headers
      }
    })

  } catch (error) {
    console.error('Admin export API error:', error)
    
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
        error: 'Failed to export data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Export transaction data
 */
async function exportTransactions(
  startDate: string, 
  endDate: string, 
  format: string, 
  includeMetadata: boolean
): Promise<string | any> {
  const data = await adminAgent.exportTransactionData(startDate, endDate, format as 'csv' | 'json')
  
  if (format === 'json' && includeMetadata) {
    return JSON.stringify({
      metadata: {
        export_type: 'transactions',
        period: { startDate, endDate },
        generated_at: new Date().toISOString(),
        record_count: Array.isArray(data) ? data.length : 0
      },
      data
    }, null, 2)
  }
  
  return format === 'json' ? JSON.stringify(data, null, 2) : data
}

/**
 * Export revenue data
 */
async function exportRevenue(
  startDate: string, 
  endDate: string, 
  format: string, 
  includeMetadata: boolean
): Promise<string | any> {
  const [revenue, dailySummaries] = await Promise.all([
    adminAgent.getPlatformRevenue(startDate, endDate),
    adminAgent.getDailySummaries(30)
  ])

  const exportData = {
    revenue_summary: revenue,
    daily_breakdown: dailySummaries
  }

  if (format === 'csv') {
    // Convert revenue data to CSV
    const csvHeaders = [
      'Date',
      'Gross Revenue',
      'Net Revenue',
      'Royalties Paid',
      'Payouts Processed',
      'Platform Fees',
      'Active Creators',
      'Total Transactions'
    ].join(',')

    const csvRow = [
      new Date().toISOString().split('T')[0],
      revenue.gross_revenue,
      revenue.net_revenue,
      revenue.total_royalties_paid,
      revenue.total_payouts_processed,
      revenue.platform_fees_collected,
      revenue.active_creators,
      revenue.total_transactions
    ].join(',')

    const dailyCsvHeaders = [
      'Date',
      'Purchases',
      'Royalties',
      'Payouts',
      'Net Flow',
      'Transaction Count'
    ].join(',')

    const dailyCsvRows = dailySummaries.map(day => [
      day.date,
      day.purchases,
      day.royalties,
      day.payouts,
      day.net_flow,
      day.transaction_count
    ].join(','))

    return [
      '# Revenue Summary',
      csvHeaders,
      csvRow,
      '',
      '# Daily Breakdown',
      dailyCsvHeaders,
      ...dailyCsvRows
    ].join('\n')
  }

  const result = includeMetadata ? {
    metadata: {
      export_type: 'revenue',
      period: { startDate, endDate },
      generated_at: new Date().toISOString()
    },
    ...exportData
  } : exportData

  return JSON.stringify(result, null, 2)
}

/**
 * Export creator data
 */
async function exportCreators(format: string, includeMetadata: boolean): Promise<string | any> {
  const creators = await adminAgent.getTopCreators(100)

  if (format === 'csv') {
    const csvHeaders = [
      'Creator ID',
      'Email',
      'Total Earnings',
      'Total Payouts',
      'Pending Balance',
      'Payout Method',
      'Status',
      'Created At',
      'Last Payout Date'
    ].join(',')

    const csvRows = creators.map(creator => [
      creator.creator_id,
      creator.creator_email || '',
      creator.total_earnings,
      creator.total_payouts,
      creator.pending_balance,
      creator.payout_method,
      creator.status,
      creator.created_at,
      creator.last_payout_date || ''
    ].join(','))

    return [csvHeaders, ...csvRows].join('\n')
  }

  const result = includeMetadata ? {
    metadata: {
      export_type: 'creators',
      generated_at: new Date().toISOString(),
      total_creators: creators.length
    },
    data: creators
  } : creators

  return JSON.stringify(result, null, 2)
}

/**
 * Export full platform report
 */
async function exportFullReport(
  startDate: string, 
  endDate: string, 
  format: string, 
  includeMetadata: boolean
): Promise<string | any> {
  const [revenue, creators, dailySummaries, platformHealth] = await Promise.all([
    adminAgent.getPlatformRevenue(startDate, endDate),
    adminAgent.getTopCreators(50),
    adminAgent.getDailySummaries(30),
    adminAgent.getPlatformHealth()
  ])

  const fullReport = {
    revenue,
    top_creators: creators,
    daily_summaries: dailySummaries,
    platform_health: platformHealth
  }

  if (format === 'csv') {
    // For full report in CSV, create multiple sections
    const sections = [
      '# AEON Platform Full Report',
      `# Generated: ${new Date().toISOString()}`,
      `# Period: ${startDate} to ${endDate}`,
      '',
      '# Revenue Summary',
      'Metric,Value',
      `Gross Revenue,${revenue.gross_revenue}`,
      `Net Revenue,${revenue.net_revenue}`,
      `Royalties Paid,${revenue.total_royalties_paid}`,
      `Payouts Processed,${revenue.total_payouts_processed}`,
      `Platform Fees,${revenue.platform_fees_collected}`,
      `Active Creators,${revenue.active_creators}`,
      '',
      '# Top Creators',
      'Creator ID,Email,Total Earnings,Status',
      ...creators.slice(0, 20).map(c => 
        `${c.creator_id},${c.creator_email || ''},${c.total_earnings},${c.status}`
      )
    ]

    return sections.join('\n')
  }

  const result = includeMetadata ? {
    metadata: {
      export_type: 'full_report',
      period: { startDate, endDate },
      generated_at: new Date().toISOString()
    },
    ...fullReport
  } : fullReport

  return JSON.stringify(result, null, 2)
}

/**
 * OPTIONS /api/admin/export
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
