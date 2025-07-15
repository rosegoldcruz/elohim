/**
 * AEON Admin Creators API
 * Provides creator analytics, performance metrics, and management tools
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminAgent } from '@/lib/agents/adminAgent'
import { RevenueAnalyzer } from '@/lib/analytics/revenueAnalyzer'
import { z } from 'zod'

// Request validation schemas
const CreatorsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(['earnings', 'payouts', 'balance', 'created_at']).default('earnings'),
  order: z.enum(['asc', 'desc']).default('desc'),
  includeAnalytics: z.coerce.boolean().default(false),
  riskAssessment: z.coerce.boolean().default(false)
})

const CreatorActionSchema = z.object({
  creatorId: z.string().uuid(),
  action: z.enum(['suspend', 'activate', 'investigate', 'clear_flags']),
  reason: z.string().optional(),
  notes: z.string().optional()
})

/**
 * Check if user has admin privileges
 */
async function checkAdminAccess(userId: string): Promise<boolean> {
  const adminUsers = process.env.ADMIN_USER_IDS?.split(',') || []
  return adminUsers.includes(userId)
}

/**
 * GET /api/admin/creators
 * Get creator analytics and performance metrics
 */
export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Admin access check
    const isAdmin = await checkAdminAccess(user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse and validate query parameters
    const { searchParams } = new URL(req.url)
    const queryParams = {
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      order: searchParams.get('order'),
      includeAnalytics: searchParams.get('includeAnalytics'),
      riskAssessment: searchParams.get('riskAssessment')
    }

    const { limit, sortBy, order, includeAnalytics, riskAssessment } = CreatorsQuerySchema.parse(queryParams)

    // Get top creators
    const creators = await adminAgent.getTopCreators(limit)

    let analytics = null
    let riskAssessments = null

    if (includeAnalytics || riskAssessment) {
      // Get recent transactions for analysis
      const recentTransactions = await adminAgent.getRecentTransactions(2000)
      
      if (includeAnalytics) {
        // Generate creator patterns and insights
        const patterns = RevenueAnalyzer.analyzeCreatorPatterns(recentTransactions)
        
        analytics = {
          patterns: patterns.slice(0, limit),
          summary: {
            total_creators: patterns.length,
            high_volatility: patterns.filter(p => p.volatility_score > 0.5).length,
            trending_up: patterns.filter(p => p.trend_direction === 'up').length,
            trending_down: patterns.filter(p => p.trend_direction === 'down').length,
            stable: patterns.filter(p => p.trend_direction === 'stable').length
          }
        }
      }

      if (riskAssessment) {
        // Assess fraud risk for top creators
        const riskAssessments = creators.map(creator => 
          RevenueAnalyzer.assessFraudRisk(creator.creator_id, recentTransactions)
        )

        riskAssessments = {
          assessments: riskAssessments,
          summary: {
            high_risk: riskAssessments.filter(r => r.risk_score > 50).length,
            medium_risk: riskAssessments.filter(r => r.risk_score > 30 && r.risk_score <= 50).length,
            low_risk: riskAssessments.filter(r => r.risk_score <= 30).length,
            requires_investigation: riskAssessments.filter(r => r.recommended_action === 'investigate').length,
            requires_suspension: riskAssessments.filter(r => r.recommended_action === 'suspend').length
          }
        }
      }
    }

    // Sort creators if different from default
    if (sortBy !== 'earnings') {
      creators.sort((a, b) => {
        const aVal = a[sortBy as keyof typeof a] || 0
        const bVal = b[sortBy as keyof typeof b] || 0
        return order === 'desc' ? (bVal as number) - (aVal as number) : (aVal as number) - (bVal as number)
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        creators,
        analytics,
        risk_assessments: riskAssessments,
        metadata: {
          total_returned: creators.length,
          sorted_by: sortBy,
          order,
          generated_at: new Date().toISOString()
        }
      }
    })

  } catch (error) {
    console.error('Admin creators API error:', error)
    
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
        error: 'Failed to fetch creator data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/creators
 * Perform admin actions on creators
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Admin access check
    const isAdmin = await checkAdminAccess(user.id)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const { creatorId, action, reason, notes } = CreatorActionSchema.parse(body)

    // Log admin action (you would implement actual logging)
    console.log(`Admin ${user.id} performed action ${action} on creator ${creatorId}`, {
      reason,
      notes,
      timestamp: new Date().toISOString()
    })

    // Perform the requested action
    let result = null
    switch (action) {
      case 'suspend':
        // TODO: Implement creator suspension logic
        result = { message: 'Creator suspended successfully' }
        break
      
      case 'activate':
        // TODO: Implement creator activation logic
        result = { message: 'Creator activated successfully' }
        break
      
      case 'investigate':
        // TODO: Flag creator for investigation
        result = { message: 'Creator flagged for investigation' }
        break
      
      case 'clear_flags':
        // TODO: Clear investigation flags
        result = { message: 'Investigation flags cleared' }
        break
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      data: {
        action_performed: action,
        creator_id: creatorId,
        result,
        performed_by: user.id,
        performed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Admin creator action API error:', error)
    
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
        error: 'Failed to perform admin action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/admin/creators/[creatorId]
 * Get detailed analytics for a specific creator
 */
export async function getCreatorDetails(creatorId: string, userId: string) {
  try {
    // Admin access check
    const isAdmin = await checkAdminAccess(userId)
    if (!isAdmin) {
      throw new Error('Admin access required')
    }

    // Get creator performance data
    const performance = await adminAgent.getCreatorPerformance(creatorId)
    
    // Get recent transactions for risk assessment
    const recentTransactions = await adminAgent.getRecentTransactions(500, undefined, creatorId)
    
    // Assess fraud risk
    const riskAssessment = RevenueAnalyzer.assessFraudRisk(creatorId, recentTransactions)
    
    // Analyze patterns
    const patterns = RevenueAnalyzer.analyzeCreatorPatterns(recentTransactions)
    const creatorPattern = patterns.find(p => p.creator_id === creatorId)

    return {
      creator_id: creatorId,
      performance,
      risk_assessment: riskAssessment,
      pattern_analysis: creatorPattern,
      recent_transactions: recentTransactions.slice(0, 20),
      generated_at: new Date().toISOString()
    }

  } catch (error) {
    console.error('Error getting creator details:', error)
    throw error
  }
}

/**
 * OPTIONS /api/admin/creators
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
