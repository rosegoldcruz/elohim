/**
 * AEON Admin Revenue API
 * Provides comprehensive platform revenue analytics and metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminAgent } from '@/lib/agents/adminAgent'
import { RevenueAnalyzer } from '@/lib/analytics/revenueAnalyzer'
import { z } from 'zod'

// Request validation schemas
const RevenueQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  includeAnalytics: z.coerce.boolean().default(false)
})

/**
 * Check if user has admin privileges
 */
async function checkAdminAccess(userId: string): Promise<boolean> {
  // TODO: Implement proper admin role checking
  // For now, check if user is in admin list or has admin role
  const adminUsers = process.env.ADMIN_USER_IDS?.split(',') || []
  return adminUsers.includes(userId)
}

/**
 * GET /api/admin/revenue
 * Get platform revenue metrics and analytics
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
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
      includeAnalytics: searchParams.get('includeAnalytics')
    }

    const { startDate, endDate, includeAnalytics } = RevenueQuerySchema.parse(queryParams)

    // Get platform revenue data
    const revenue = await adminAgent.getPlatformRevenue(startDate, endDate)

    let analytics = null
    if (includeAnalytics) {
      // Get recent transactions for analysis
      const recentTransactions = await adminAgent.getRecentTransactions(1000)
      
      // Generate analytics
      const patterns = RevenueAnalyzer.analyzeCreatorPatterns(recentTransactions)
      const insights = RevenueAnalyzer.generateInsights(recentTransactions, patterns)
      const anomalies = RevenueAnalyzer.detectAnomalies(recentTransactions)

      analytics = {
        patterns: patterns.slice(0, 20), // Top 20 patterns
        insights,
        anomalies,
        summary: {
          total_creators_analyzed: patterns.length,
          high_risk_creators: patterns.filter(p => p.volatility_score > 0.7).length,
          trending_up_creators: patterns.filter(p => p.trend_direction === 'up').length,
          trending_down_creators: patterns.filter(p => p.trend_direction === 'down').length
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        revenue,
        analytics,
        generated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Admin revenue API error:', error)
    
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
        error: 'Failed to fetch revenue data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/revenue
 * Generate custom revenue report
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

    // Admin access check
    const isAdmin = await checkAdminAccess(userId)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { 
      startDate, 
      endDate, 
      includeCreatorBreakdown = false,
      includeTransactionDetails = false,
      groupBy = 'day' // day, week, month
    } = body

    // Validate date range
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      )
    }

    // Get comprehensive revenue data
    const [revenue, dailySummaries, topCreators] = await Promise.all([
      adminAgent.getPlatformRevenue(startDate, endDate),
      adminAgent.getDailySummaries(30),
      includeCreatorBreakdown ? adminAgent.getTopCreators(50) : Promise.resolve([])
    ])

    // Get transaction details if requested
    let transactionDetails = null
    if (includeTransactionDetails) {
      transactionDetails = await adminAgent.getRecentTransactions(500)
    }

    // Group daily summaries by requested period
    let groupedSummaries = dailySummaries
    if (groupBy === 'week') {
      groupedSummaries = this.groupSummariesByWeek(dailySummaries)
    } else if (groupBy === 'month') {
      groupedSummaries = this.groupSummariesByMonth(dailySummaries)
    }

    return NextResponse.json({
      success: true,
      data: {
        report: {
          period: { startDate, endDate },
          revenue,
          summaries: groupedSummaries,
          creators: topCreators,
          transactions: transactionDetails
        },
        metadata: {
          generated_at: new Date().toISOString(),
          generated_by: userId,
          report_type: 'custom',
          group_by: groupBy
        }
      }
    })

  } catch (error) {
    console.error('Custom revenue report API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate revenue report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Helper function to group summaries by week
 */
function groupSummariesByWeek(dailySummaries: any[]): any[] {
  const weeklyGroups: { [week: string]: any[] } = {}
  
  dailySummaries.forEach(summary => {
    const date = new Date(summary.date)
    const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
    
    if (!weeklyGroups[week]) {
      weeklyGroups[week] = []
    }
    weeklyGroups[week].push(summary)
  })

  return Object.entries(weeklyGroups).map(([week, summaries]) => ({
    period: week,
    purchases: summaries.reduce((sum, s) => sum + s.purchases, 0),
    royalties: summaries.reduce((sum, s) => sum + s.royalties, 0),
    payouts: summaries.reduce((sum, s) => sum + s.payouts, 0),
    net_flow: summaries.reduce((sum, s) => sum + s.net_flow, 0),
    transaction_count: summaries.reduce((sum, s) => sum + s.transaction_count, 0)
  }))
}

/**
 * Helper function to group summaries by month
 */
function groupSummariesByMonth(dailySummaries: any[]): any[] {
  const monthlyGroups: { [month: string]: any[] } = {}
  
  dailySummaries.forEach(summary => {
    const date = new Date(summary.date)
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    
    if (!monthlyGroups[month]) {
      monthlyGroups[month] = []
    }
    monthlyGroups[month].push(summary)
  })

  return Object.entries(monthlyGroups).map(([month, summaries]) => ({
    period: month,
    purchases: summaries.reduce((sum, s) => sum + s.purchases, 0),
    royalties: summaries.reduce((sum, s) => sum + s.royalties, 0),
    payouts: summaries.reduce((sum, s) => sum + s.payouts, 0),
    net_flow: summaries.reduce((sum, s) => sum + s.net_flow, 0),
    transaction_count: summaries.reduce((sum, s) => sum + s.transaction_count, 0)
  }))
}

/**
 * OPTIONS /api/admin/revenue
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
