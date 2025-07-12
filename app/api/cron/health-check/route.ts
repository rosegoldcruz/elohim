/**
 * AEON Health Check Cron Job
 * Monitors system health every hour
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

    console.log('🏥 Starting health check cron job...')
    
    // Run system health monitoring
    await adminAgent.monitorSystemHealth()
    
    // Get current health status
    const health = await adminAgent.getPlatformHealth()
    
    console.log('✅ Health check completed:', {
      status: health.system_status,
      error_rate: health.error_rate,
      pending_payouts: health.pending_payouts_count
    })

    return NextResponse.json({
      success: true,
      message: 'Health check completed successfully',
      data: {
        system_status: health.system_status,
        active_users_24h: health.active_users_24h,
        error_rate: health.error_rate,
        pending_payouts: health.pending_payouts_count,
        avg_payout_time: health.avg_payout_time,
        checked_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Health check cron job failed:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Health check failed',
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
