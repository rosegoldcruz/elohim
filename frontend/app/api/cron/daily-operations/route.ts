/**
 * AEON Daily Operations Cron Job
 * Runs daily exports, fraud monitoring, and maintenance tasks
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminAgent } from '@/lib/agents/adminAgent'

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

    console.log('🤖 Starting daily operations cron job...')
    
    // Run daily operations
    const result = await adminAgent.runDailyOps()
    
    console.log('✅ Daily operations completed:', {
      exports: Object.keys(result.exports).length,
      fraud_alerts: result.fraud_scan.alerts,
      notifications_sent: result.notifications_sent
    })

    return NextResponse.json({
      success: true,
      message: 'Daily operations completed successfully',
      data: {
        exports_generated: Object.keys(result.exports).length,
        fraud_alerts: result.fraud_scan.alerts,
        actions_taken: result.fraud_scan.actions_taken,
        notifications_sent: result.notifications_sent,
        completed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Daily operations cron job failed:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Daily operations failed',
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
