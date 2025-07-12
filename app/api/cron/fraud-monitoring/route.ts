/**
 * AEON Fraud Monitoring Cron Job
 * Runs fraud detection scans every 4 hours
 */

import { NextRequest, NextResponse } from 'next/server'
import { fraudMonitor } from '@/lib/analytics/fraudMonitor'

export async function GET(req: NextRequest) {
  try {
    // Verify this is a legitimate cron request
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔍 Starting fraud monitoring cron job...')
    
    // Run fraud detection
    const result = await fraudMonitor?.checkForFraud()
    
    if (!result) {
      return NextResponse.json({
        success: false,
        error: 'Fraud monitor not available (server-side only)'
      }, { status: 500 })
    }
    
    console.log('✅ Fraud monitoring completed:', {
      alerts: result.alerts.length,
      actions_taken: result.actions_taken.length,
      high_risk_creators: result.stats.high_risk_creators
    })

    return NextResponse.json({
      success: true,
      message: 'Fraud monitoring completed successfully',
      data: {
        alerts_generated: result.alerts.length,
        critical_alerts: result.alerts.filter(a => a.severity === 'critical').length,
        actions_taken: result.actions_taken.length,
        high_risk_creators: result.stats.high_risk_creators,
        transactions_scanned: result.stats.transactions_scanned,
        completed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Fraud monitoring cron job failed:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Fraud monitoring failed',
        details: error instanceof Error ? error.message : 'Unknown error',
        failed_at: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

// Also handle POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req)
}
