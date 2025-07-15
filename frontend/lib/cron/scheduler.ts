/**
 * AEON Cron Job Scheduler
 * Handles automated tasks including daily exports, fraud monitoring,
 * and scheduled maintenance operations
 */

// Only import cron on server side
let cron: any = null
if (typeof window === 'undefined') {
  cron = require('node-cron')
}
import { adminAgent } from '../agents/adminAgent'
import { fraudMonitor } from '../analytics/fraudMonitor'
import { exporter } from '../analytics/exporter'
import { emailer } from '../utils/emailer'

export interface ScheduledTask {
  id: string
  name: string
  schedule: string // Cron expression
  enabled: boolean
  lastRun?: string
  nextRun?: string
  runCount: number
  errorCount: number
}

export class CronScheduler {
  private tasks: Map<string, cron.ScheduledTask> = new Map()
  private taskInfo: Map<string, ScheduledTask> = new Map()

  constructor() {
    // Only initialize on server side
    if (typeof window === 'undefined' && cron) {
      this.initializeDefaultTasks()
    }
  }

  /**
   * Initialize default scheduled tasks
   */
  private initializeDefaultTasks(): void {
    // Daily operations at 2 AM
    this.scheduleTask({
      id: 'daily_operations',
      name: 'Daily Operations',
      schedule: '0 2 * * *', // 2:00 AM every day
      enabled: true,
      runCount: 0,
      errorCount: 0
    }, this.runDailyOperations.bind(this))

    // Fraud monitoring every 4 hours
    this.scheduleTask({
      id: 'fraud_monitoring',
      name: 'Fraud Monitoring',
      schedule: '0 */4 * * *', // Every 4 hours
      enabled: true,
      runCount: 0,
      errorCount: 0
    }, this.runFraudMonitoring.bind(this))

    // System health check every hour
    this.scheduleTask({
      id: 'health_check',
      name: 'System Health Check',
      schedule: '0 * * * *', // Every hour
      enabled: true,
      runCount: 0,
      errorCount: 0
    }, this.runHealthCheck.bind(this))

    // Weekly executive report on Mondays at 9 AM
    this.scheduleTask({
      id: 'weekly_report',
      name: 'Weekly Executive Report',
      schedule: '0 9 * * 1', // 9:00 AM every Monday
      enabled: true,
      runCount: 0,
      errorCount: 0
    }, this.runWeeklyReport.bind(this))

    // Export cleanup every Sunday at 3 AM
    this.scheduleTask({
      id: 'export_cleanup',
      name: 'Export Cleanup',
      schedule: '0 3 * * 0', // 3:00 AM every Sunday
      enabled: true,
      runCount: 0,
      errorCount: 0
    }, this.runExportCleanup.bind(this))

    // Emergency fraud sweep (can be triggered manually)
    this.scheduleTask({
      id: 'emergency_fraud_sweep',
      name: 'Emergency Fraud Sweep',
      schedule: '0 0 31 2 *', // Never runs automatically (Feb 31st)
      enabled: false,
      runCount: 0,
      errorCount: 0
    }, this.runEmergencyFraudSweep.bind(this))

    console.log('✅ Cron scheduler initialized with default tasks')
  }

  /**
   * Schedule a new task
   */
  scheduleTask(taskInfo: ScheduledTask, handler: () => Promise<void>): void {
    try {
      // Stop existing task if it exists
      if (this.tasks.has(taskInfo.id)) {
        this.tasks.get(taskInfo.id)?.stop()
      }

      // Create new scheduled task
      const task = cron.schedule(taskInfo.schedule, async () => {
        await this.executeTask(taskInfo.id, handler)
      }, {
        scheduled: taskInfo.enabled,
        timezone: process.env.TIMEZONE || 'UTC'
      })

      this.tasks.set(taskInfo.id, task)
      this.taskInfo.set(taskInfo.id, {
        ...taskInfo,
        nextRun: this.getNextRunTime(taskInfo.schedule)
      })

      console.log(`📅 Scheduled task: ${taskInfo.name} (${taskInfo.schedule})`)

    } catch (error) {
      console.error(`Failed to schedule task ${taskInfo.id}:`, error)
    }
  }

  /**
   * Execute a scheduled task with error handling and logging
   */
  private async executeTask(taskId: string, handler: () => Promise<void>): Promise<void> {
    const taskInfo = this.taskInfo.get(taskId)
    if (!taskInfo) return

    console.log(`🚀 Executing scheduled task: ${taskInfo.name}`)
    const startTime = Date.now()

    try {
      await handler()
      
      // Update task info on success
      taskInfo.runCount++
      taskInfo.lastRun = new Date().toISOString()
      taskInfo.nextRun = this.getNextRunTime(taskInfo.schedule)
      this.taskInfo.set(taskId, taskInfo)

      const duration = Date.now() - startTime
      console.log(`✅ Task completed: ${taskInfo.name} (${duration}ms)`)

    } catch (error) {
      // Update error count
      taskInfo.errorCount++
      taskInfo.lastRun = new Date().toISOString()
      this.taskInfo.set(taskId, taskInfo)

      console.error(`❌ Task failed: ${taskInfo.name}`, error)

      // Send error alert for critical tasks
      if (['daily_operations', 'fraud_monitoring'].includes(taskId)) {
        await emailer.sendSystemAlert(
          'system_down',
          `Scheduled task failed: ${taskInfo.name}`,
          { 
            task_id: taskId,
            error: error instanceof Error ? error.message : 'Unknown error',
            run_count: taskInfo.runCount,
            error_count: taskInfo.errorCount
          }
        )
      }
    }
  }

  /**
   * Daily operations task handler
   */
  private async runDailyOperations(): Promise<void> {
    console.log('🤖 Running daily operations...')
    await adminAgent.runDailyOps()
  }

  /**
   * Fraud monitoring task handler
   */
  private async runFraudMonitoring(): Promise<void> {
    console.log('🔍 Running fraud monitoring...')
    const results = await fraudMonitor.checkForFraud()
    
    // Log results
    console.log(`Fraud scan: ${results.alerts.length} alerts, ${results.actions_taken.length} actions taken`)
  }

  /**
   * System health check task handler
   */
  private async runHealthCheck(): Promise<void> {
    console.log('🏥 Running system health check...')
    await adminAgent.monitorSystemHealth()
  }

  /**
   * Weekly report task handler
   */
  private async runWeeklyReport(): Promise<void> {
    console.log('📊 Generating weekly report...')
    await adminAgent.generateWeeklyReport()
  }

  /**
   * Export cleanup task handler
   */
  private async runExportCleanup(): Promise<void> {
    console.log('🧹 Running export cleanup...')
    await exporter.cleanupOldExports(30) // Keep 30 days
  }

  /**
   * Emergency fraud sweep task handler
   */
  private async runEmergencyFraudSweep(): Promise<void> {
    console.log('🚨 Running emergency fraud sweep...')
    await adminAgent.runEmergencyFraudSweep()
  }

  /**
   * Start all enabled tasks
   */
  startAll(): void {
    for (const [taskId, task] of this.tasks) {
      const taskInfo = this.taskInfo.get(taskId)
      if (taskInfo?.enabled) {
        task.start()
        console.log(`▶️ Started task: ${taskInfo.name}`)
      }
    }
    console.log('✅ All enabled cron tasks started')
  }

  /**
   * Stop all tasks
   */
  stopAll(): void {
    for (const [taskId, task] of this.tasks) {
      task.stop()
      const taskInfo = this.taskInfo.get(taskId)
      console.log(`⏹️ Stopped task: ${taskInfo?.name || taskId}`)
    }
    console.log('🛑 All cron tasks stopped')
  }

  /**
   * Enable/disable a specific task
   */
  toggleTask(taskId: string, enabled: boolean): boolean {
    const task = this.tasks.get(taskId)
    const taskInfo = this.taskInfo.get(taskId)
    
    if (!task || !taskInfo) {
      console.error(`Task not found: ${taskId}`)
      return false
    }

    taskInfo.enabled = enabled
    this.taskInfo.set(taskId, taskInfo)

    if (enabled) {
      task.start()
      console.log(`▶️ Enabled task: ${taskInfo.name}`)
    } else {
      task.stop()
      console.log(`⏸️ Disabled task: ${taskInfo.name}`)
    }

    return true
  }

  /**
   * Manually trigger a task
   */
  async triggerTask(taskId: string): Promise<boolean> {
    const taskInfo = this.taskInfo.get(taskId)
    if (!taskInfo) {
      console.error(`Task not found: ${taskId}`)
      return false
    }

    console.log(`🔧 Manually triggering task: ${taskInfo.name}`)
    
    try {
      switch (taskId) {
        case 'daily_operations':
          await this.runDailyOperations()
          break
        case 'fraud_monitoring':
          await this.runFraudMonitoring()
          break
        case 'health_check':
          await this.runHealthCheck()
          break
        case 'weekly_report':
          await this.runWeeklyReport()
          break
        case 'export_cleanup':
          await this.runExportCleanup()
          break
        case 'emergency_fraud_sweep':
          await this.runEmergencyFraudSweep()
          break
        default:
          console.error(`Unknown task: ${taskId}`)
          return false
      }

      console.log(`✅ Manual task execution completed: ${taskInfo.name}`)
      return true

    } catch (error) {
      console.error(`❌ Manual task execution failed: ${taskInfo.name}`, error)
      return false
    }
  }

  /**
   * Get status of all tasks
   */
  getTaskStatus(): ScheduledTask[] {
    return Array.from(this.taskInfo.values())
  }

  /**
   * Get next run time for a cron expression
   */
  private getNextRunTime(cronExpression: string): string {
    try {
      // This is a simplified implementation
      // In production, you'd use a proper cron parser
      return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Placeholder
    } catch {
      return 'Unknown'
    }
  }

  /**
   * Test email configuration on startup
   */
  async testEmailConfiguration(): Promise<void> {
    try {
      const isValid = await emailer.testConnection()
      if (isValid) {
        console.log('✅ Email configuration is valid')
      } else {
        console.warn('⚠️ Email configuration may have issues')
      }
    } catch (error) {
      console.error('❌ Email configuration test failed:', error)
    }
  }
}

// Export singleton instance (server-side only)
export const cronScheduler = typeof window === 'undefined' ? new CronScheduler() : null as any
