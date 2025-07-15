/**
 * AEON Admin Fraud Detection API
 * Handles fraud detection, anomaly alerts, and security monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { fraudDetector } from '@/lib/fraud/fraudDetector'
import { z } from 'zod'

// Request validation schemas
const FraudScanSchema = z.object({
  scope: z.enum(['all', 'creator', 'recent']).default('recent'),
  creatorId: z.string().uuid().optional(),
  timeRange: z.enum(['24h', '7d', '30d']).default('7d')
})

const AlertActionSchema = z.object({
  alertId: z.string(),
  action: z.enum(['investigate', 'resolve', 'false_positive']),
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
 * GET /api/admin/fraud
 * Get fraud detection results and anomaly alerts
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

    // Parse query parameters
    const { searchParams } = new URL(req.url)
    const queryParams = {
      scope: searchParams.get('scope'),
      creatorId: searchParams.get('creatorId'),
      timeRange: searchParams.get('timeRange')
    }

    const { scope, creatorId, timeRange } = FraudScanSchema.parse(queryParams)

    // Run fraud detection
    console.log(`🔍 Running fraud detection scan (scope: ${scope}, range: ${timeRange})`)
    
    const fraudResults = await fraudDetector.runFraudDetection()

    // Filter results based on scope
    let filteredResults = fraudResults
    if (scope === 'creator' && creatorId) {
      filteredResults = {
        alerts: fraudResults.alerts.filter(a => a.affected_entity === creatorId),
        suspicious_activities: fraudResults.suspicious_activities.filter(a => a.creator_id === creatorId),
        fraud_scores: fraudResults.fraud_scores.filter(s => s.creator_id === creatorId)
      }
    }

    // Calculate summary statistics
    const summary = {
      total_alerts: filteredResults.alerts.length,
      critical_alerts: filteredResults.alerts.filter(a => a.severity === 'critical').length,
      high_risk_creators: filteredResults.fraud_scores.filter(s => s.risk_level === 'high' || s.risk_level === 'critical').length,
      suspicious_activities: filteredResults.suspicious_activities.length,
      avg_fraud_score: filteredResults.fraud_scores.length > 0 
        ? filteredResults.fraud_scores.reduce((sum, s) => sum + s.overall_score, 0) / filteredResults.fraud_scores.length
        : 0
    }

    return NextResponse.json({
      success: true,
      data: {
        ...filteredResults,
        summary,
        scan_info: {
          scope,
          time_range: timeRange,
          scanned_at: new Date().toISOString(),
          scanned_by: userId
        }
      }
    })

  } catch (error) {
    console.error('Fraud detection API error:', error)
    
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
        error: 'Failed to run fraud detection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/fraud
 * Perform actions on fraud alerts or run targeted scans
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
    const { action_type, ...actionData } = body

    switch (action_type) {
      case 'alert_action':
        return await handleAlertAction(actionData, userId)
      
      case 'manual_scan':
        return await handleManualScan(actionData, userId)
      
      case 'update_rules':
        return await handleUpdateRules(actionData, userId)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action type' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Fraud action API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform fraud action',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Handle alert actions (investigate, resolve, false positive)
 */
async function handleAlertAction(actionData: any, userId: string) {
  const { alertId, action, notes } = AlertActionSchema.parse(actionData)

  // Log the action (in production, you'd update a database)
  console.log(`Admin ${userId} performed action ${action} on alert ${alertId}`, {
    notes,
    timestamp: new Date().toISOString()
  })

  // TODO: Implement actual alert status updates in database
  // This would update the alert status and log the admin action

  return NextResponse.json({
    success: true,
    data: {
      alert_id: alertId,
      action_performed: action,
      performed_by: userId,
      performed_at: new Date().toISOString(),
      notes
    }
  })
}

/**
 * Handle manual fraud detection scans
 */
async function handleManualScan(actionData: any, userId: string) {
  const { target_creator, scan_depth = 'standard' } = actionData

  console.log(`Admin ${userId} initiated manual fraud scan`, {
    target_creator,
    scan_depth,
    timestamp: new Date().toISOString()
  })

  // Run targeted fraud detection
  const fraudResults = await fraudDetector.runFraudDetection()

  // Filter for target creator if specified
  let results = fraudResults
  if (target_creator) {
    results = {
      alerts: fraudResults.alerts.filter(a => a.affected_entity === target_creator),
      suspicious_activities: fraudResults.suspicious_activities.filter(a => a.creator_id === target_creator),
      fraud_scores: fraudResults.fraud_scores.filter(s => s.creator_id === target_creator)
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      scan_results: results,
      scan_info: {
        type: 'manual',
        target_creator,
        scan_depth,
        initiated_by: userId,
        completed_at: new Date().toISOString()
      }
    }
  })
}

/**
 * Handle fraud rule updates
 */
async function handleUpdateRules(actionData: any, userId: string) {
  const { rules } = actionData

  console.log(`Admin ${userId} updated fraud detection rules`, {
    rules_count: rules?.length || 0,
    timestamp: new Date().toISOString()
  })

  // TODO: Implement rule persistence in database
  // For now, just acknowledge the update

  return NextResponse.json({
    success: true,
    data: {
      rules_updated: rules?.length || 0,
      updated_by: userId,
      updated_at: new Date().toISOString()
    }
  })
}

/**
 * PUT /api/admin/fraud
 * Update fraud detection settings and rules
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
    const { settings } = body

    // TODO: Implement settings persistence
    console.log(`Admin ${userId} updated fraud detection settings`, {
      settings,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      data: {
        settings_updated: true,
        updated_by: userId,
        updated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Fraud settings update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update fraud settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/admin/fraud
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
