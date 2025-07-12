/**
 * AEON Cron Startup Script
 * Initializes and starts all scheduled tasks for automated operations
 */

import { cronScheduler } from '../lib/cron/scheduler'
import { emailer } from '../lib/utils/emailer'

async function startCronJobs() {
  console.log('🚀 Starting AEON Cron Jobs...')
  
  try {
    // Test email configuration first
    console.log('📧 Testing email configuration...')
    await cronScheduler.testEmailConfiguration()
    
    // Start all enabled cron tasks
    console.log('⏰ Starting scheduled tasks...')
    cronScheduler.startAll()
    
    // Send startup notification
    await emailer.sendCustomEmail({
      to: process.env.ADMIN_EMAILS?.split(',') || ['admin@aeon.com'],
      subject: '🚀 AEON Cron Jobs Started',
      text: `
AEON Platform Cron Jobs Started Successfully

Started at: ${new Date().toISOString()}
Server: ${process.env.NODE_ENV || 'development'}

Active Tasks:
• Daily Operations (2:00 AM daily)
• Fraud Monitoring (Every 4 hours)
• System Health Check (Every hour)
• Weekly Executive Report (Mondays 9:00 AM)
• Export Cleanup (Sundays 3:00 AM)

All systems operational.
      `.trim(),
      priority: 'normal'
    })
    
    console.log('✅ AEON Cron Jobs started successfully')
    
    // Log task status
    const tasks = cronScheduler.getTaskStatus()
    console.log('\n📋 Scheduled Tasks Status:')
    tasks.forEach(task => {
      const status = task.enabled ? '✅ ENABLED' : '❌ DISABLED'
      console.log(`  ${status} ${task.name} (${task.schedule})`)
    })
    
  } catch (error) {
    console.error('❌ Failed to start cron jobs:', error)
    
    // Send error notification
    try {
      await emailer.sendSystemAlert(
        'system_down',
        'Failed to start AEON cron jobs',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )
    } catch (emailError) {
      console.error('Failed to send error notification:', emailError)
    }
    
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down cron jobs...')
  cronScheduler.stopAll()
  process.exit(0)
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down cron jobs...')
  cronScheduler.stopAll()
  process.exit(0)
})

// Start if this script is run directly
if (require.main === module) {
  startCronJobs()
}

export { startCronJobs }
