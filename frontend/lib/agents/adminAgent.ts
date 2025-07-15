/**
 * AEON Admin Agent - Platform Revenue & Analytics Management
 * Provides comprehensive oversight of platform financial flows, creator analytics,
 * and fraud detection for administrative control
 */

import { createClient } from '@/lib/supabase/client'
import { exporter } from '../analytics/exporter'
import { fraudMonitor } from '../analytics/fraudMonitor'
import { emailer } from '../utils/emailer'

export interface PlatformRevenue {
  gross_revenue: number
  net_revenue: number
  total_royalties_paid: number
  total_payouts_processed: number
  platform_fees_collected: number
  active_creators: number
  total_transactions: number
  period_start: string
  period_end: string
}

export interface CreatorAnalytics {
  creator_id: string
  creator_email?: string
  total_earnings: number
  total_payouts: number
  pending_balance: number
  video_count: number
  avg_earnings_per_video: number
  last_payout_date?: string
  payout_method: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
}

export interface TransactionSummary {
  date: string
  purchases: number
  royalties: number
  payouts: number
  net_flow: number
  transaction_count: number
}

export interface AnomalyAlert {
  id: string
  type: 'large_transaction' | 'unusual_pattern' | 'rapid_payouts' | 'suspicious_creator'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affected_entity: string
  amount?: number
  detected_at: string
  status: 'new' | 'investigating' | 'resolved' | 'false_positive'
}

export interface AdminMetrics {
  revenue: PlatformRevenue
  top_creators: CreatorAnalytics[]
  recent_transactions: any[]
  daily_summaries: TransactionSummary[]
  anomaly_alerts: AnomalyAlert[]
  growth_metrics: {
    revenue_growth: number
    creator_growth: number
    transaction_growth: number
  }
}

export interface DailyOperationsResult {
  exports: {
    daily_csv: any
    weekly_revenue: any
    monthly_creators: any
  }
  fraud_scan: {
    alerts: number
    actions_taken: number
    high_risk_creators: number
  }
  platform_health: any
  notifications_sent: boolean
}

export class AdminAgent {
  private supabase = createClient()

  constructor() {
    // Initialize admin agent with automated services
  }

  /**
   * Get comprehensive platform revenue metrics
   */
  async getPlatformRevenue(
    startDate?: string, 
    endDate?: string
  ): Promise<PlatformRevenue> {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const end = endDate || new Date().toISOString()

      // Get all transactions in period
      const { data: transactions, error } = await this.supabase
        .from('credit_transactions')
        .select('*')
        .gte('created_at', start)
        .lte('created_at', end)

      if (error) throw error

      // Calculate revenue metrics
      const purchases = transactions.filter(t => t.transaction_type === 'purchase')
      const royalties = transactions.filter(t => t.transaction_type === 'royalty')
      const payouts = transactions.filter(t => t.transaction_type === 'payout')
      const fees = transactions.filter(t => t.transaction_type === 'fee')

      const gross_revenue = purchases.reduce((sum, t) => sum + (t.amount || 0), 0)
      const total_royalties_paid = royalties.reduce((sum, t) => sum + (t.amount || 0), 0)
      const total_payouts_processed = Math.abs(payouts.reduce((sum, t) => sum + (t.amount || 0), 0))
      const platform_fees_collected = fees.reduce((sum, t) => sum + (t.amount || 0), 0)
      const net_revenue = gross_revenue - total_royalties_paid - platform_fees_collected

      // Get active creators count
      const { count: active_creators } = await this.supabase
        .from('creator_wallets')
        .select('*', { count: 'exact', head: true })
        .gt('total_earnings', 0)

      return {
        gross_revenue,
        net_revenue,
        total_royalties_paid,
        total_payouts_processed,
        platform_fees_collected,
        active_creators: active_creators || 0,
        total_transactions: transactions.length,
        period_start: start,
        period_end: end
      }
    } catch (error) {
      console.error('Error getting platform revenue:', error)
      throw error
    }
  }

  /**
   * Get top creators by earnings with detailed analytics
   */
  async getTopCreators(limit: number = 20): Promise<CreatorAnalytics[]> {
    try {
      const { data: creators, error } = await this.supabase
        .from('creator_wallets')
        .select(`
          creator_id,
          balance,
          total_earnings,
          total_payouts,
          payout_method,
          created_at,
          updated_at
        `)
        .order('total_earnings', { ascending: false })
        .limit(limit)

      if (error) throw error

      // Enhance with additional analytics
      const enhancedCreators = await Promise.all(
        creators.map(async (creator) => {
          // Get creator email from auth users (if available)
          const { data: userProfile } = await this.supabase
            .from('profiles')
            .select('email')
            .eq('id', creator.creator_id)
            .single()

          // Get recent payout info
          const { data: lastPayout } = await this.supabase
            .from('credit_transactions')
            .select('created_at')
            .eq('creator_id', creator.creator_id)
            .eq('transaction_type', 'payout')
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          // Calculate video count and avg earnings (placeholder - would need actual video table)
          const video_count = 0 // TODO: Query actual video count
          const avg_earnings_per_video = video_count > 0 ? creator.total_earnings / video_count : 0

          return {
            creator_id: creator.creator_id,
            creator_email: userProfile?.email,
            total_earnings: creator.total_earnings,
            total_payouts: creator.total_payouts,
            pending_balance: creator.balance,
            video_count,
            avg_earnings_per_video,
            last_payout_date: lastPayout?.created_at,
            payout_method: creator.payout_method,
            status: creator.total_earnings > 0 ? 'active' : 'inactive',
            created_at: creator.created_at
          } as CreatorAnalytics
        })
      )

      return enhancedCreators
    } catch (error) {
      console.error('Error getting top creators:', error)
      throw error
    }
  }

  /**
   * Get daily transaction summaries for trend analysis
   */
  async getDailySummaries(days: number = 30): Promise<TransactionSummary[]> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
      
      const { data: transactions, error } = await this.supabase
        .from('credit_transactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group transactions by date
      const dailyGroups: { [date: string]: any[] } = {}
      
      transactions.forEach(transaction => {
        const date = new Date(transaction.created_at).toISOString().split('T')[0]
        if (!dailyGroups[date]) {
          dailyGroups[date] = []
        }
        dailyGroups[date].push(transaction)
      })

      // Calculate daily summaries
      const summaries: TransactionSummary[] = Object.entries(dailyGroups).map(([date, dayTransactions]) => {
        const purchases = dayTransactions
          .filter(t => t.transaction_type === 'purchase')
          .reduce((sum, t) => sum + (t.amount || 0), 0)
        
        const royalties = dayTransactions
          .filter(t => t.transaction_type === 'royalty')
          .reduce((sum, t) => sum + (t.amount || 0), 0)
        
        const payouts = Math.abs(dayTransactions
          .filter(t => t.transaction_type === 'payout')
          .reduce((sum, t) => sum + (t.amount || 0), 0))

        return {
          date,
          purchases,
          royalties,
          payouts,
          net_flow: purchases - royalties - payouts,
          transaction_count: dayTransactions.length
        }
      })

      return summaries.sort((a, b) => a.date.localeCompare(b.date))
    } catch (error) {
      console.error('Error getting daily summaries:', error)
      throw error
    }
  }

  /**
   * Get recent transactions with filtering
   */
  async getRecentTransactions(
    limit: number = 100,
    type?: string,
    creatorId?: string
  ): Promise<any[]> {
    try {
      let query = this.supabase
        .from('credit_transactions')
        .select(`
          *,
          profiles!creator_id(email)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (type) {
        query = query.eq('transaction_type', type)
      }

      if (creatorId) {
        query = query.eq('creator_id', creatorId)
      }

      const { data: transactions, error } = await query

      if (error) throw error

      return transactions || []
    } catch (error) {
      console.error('Error getting recent transactions:', error)
      throw error
    }
  }

  /**
   * Get comprehensive admin metrics dashboard
   */
  async getAdminMetrics(): Promise<AdminMetrics> {
    try {
      const [
        revenue,
        top_creators,
        recent_transactions,
        daily_summaries
      ] = await Promise.all([
        this.getPlatformRevenue(),
        this.getTopCreators(10),
        this.getRecentTransactions(50),
        this.getDailySummaries(30)
      ])

      // Calculate growth metrics (comparing last 30 days to previous 30 days)
      const previousRevenue = await this.getPlatformRevenue(
        new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      )

      const revenue_growth = previousRevenue.gross_revenue > 0 
        ? ((revenue.gross_revenue - previousRevenue.gross_revenue) / previousRevenue.gross_revenue) * 100
        : 0

      const creator_growth = previousRevenue.active_creators > 0
        ? ((revenue.active_creators - previousRevenue.active_creators) / previousRevenue.active_creators) * 100
        : 0

      const transaction_growth = previousRevenue.total_transactions > 0
        ? ((revenue.total_transactions - previousRevenue.total_transactions) / previousRevenue.total_transactions) * 100
        : 0

      return {
        revenue,
        top_creators,
        recent_transactions,
        daily_summaries,
        anomaly_alerts: [], // Will be populated by fraud detection system
        growth_metrics: {
          revenue_growth,
          creator_growth,
          transaction_growth
        }
      }
    } catch (error) {
      console.error('Error getting admin metrics:', error)
      throw error
    }
  }

  /**
   * Export transaction data for accounting/tax purposes
   */
  async exportTransactionData(
    startDate: string,
    endDate: string,
    format: 'csv' | 'json' = 'csv'
  ): Promise<string | any[]> {
    try {
      const { data: transactions, error } = await this.supabase
        .from('credit_transactions')
        .select(`
          *,
          profiles!creator_id(email)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (format === 'json') {
        return transactions || []
      }

      // Convert to CSV format
      const csvHeaders = [
        'Date',
        'Transaction ID',
        'Type',
        'Creator ID',
        'Creator Email',
        'Amount',
        'Status',
        'Description',
        'Reference ID'
      ].join(',')

      const csvRows = (transactions || []).map(t => [
        new Date(t.created_at).toISOString().split('T')[0],
        t.id,
        t.transaction_type,
        t.creator_id || '',
        t.profiles?.email || '',
        t.amount,
        t.status,
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.reference_id || ''
      ].join(','))

      return [csvHeaders, ...csvRows].join('\n')
    } catch (error) {
      console.error('Error exporting transaction data:', error)
      throw error
    }
  }

  /**
   * Get creator performance analytics
   */
  async getCreatorPerformance(creatorId: string): Promise<{
    earnings_trend: { date: string; amount: number }[]
    payout_history: any[]
    performance_metrics: {
      total_videos: number
      avg_earnings_per_video: number
      best_performing_video: any
      earnings_rank: number
    }
  }> {
    try {
      // Get earnings trend (last 90 days)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)

      const { data: earnings, error: earningsError } = await this.supabase
        .from('credit_transactions')
        .select('created_at, amount')
        .eq('creator_id', creatorId)
        .eq('transaction_type', 'royalty')
        .gte('created_at', ninetyDaysAgo.toISOString())
        .order('created_at', { ascending: true })

      if (earningsError) throw earningsError

      // Group earnings by date
      const earningsMap: { [date: string]: number } = {}
      earnings?.forEach(e => {
        const date = new Date(e.created_at).toISOString().split('T')[0]
        earningsMap[date] = (earningsMap[date] || 0) + e.amount
      })

      const earnings_trend = Object.entries(earningsMap).map(([date, amount]) => ({
        date,
        amount
      }))

      // Get payout history
      const { data: payout_history, error: payoutError } = await this.supabase
        .from('credit_transactions')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('transaction_type', 'payout')
        .order('created_at', { ascending: false })
        .limit(20)

      if (payoutError) throw payoutError

      // Get creator rank
      const { data: allCreators, error: rankError } = await this.supabase
        .from('creator_wallets')
        .select('creator_id, total_earnings')
        .order('total_earnings', { ascending: false })

      if (rankError) throw rankError

      const earnings_rank = (allCreators?.findIndex(c => c.creator_id === creatorId) || -1) + 1

      return {
        earnings_trend,
        payout_history: payout_history || [],
        performance_metrics: {
          total_videos: 0, // TODO: Query actual video count
          avg_earnings_per_video: 0, // TODO: Calculate from actual data
          best_performing_video: null, // TODO: Query best video
          earnings_rank
        }
      }
    } catch (error) {
      console.error('Error getting creator performance:', error)
      throw error
    }
  }

  /**
   * Get platform health metrics
   */
  async getPlatformHealth(): Promise<{
    system_status: 'healthy' | 'warning' | 'critical'
    active_users_24h: number
    failed_transactions_rate: number
    avg_payout_time: number
    pending_payouts_count: number
    error_rate: number
  }> {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

      // Get recent transaction stats
      const { data: recentTransactions, error } = await this.supabase
        .from('credit_transactions')
        .select('status, created_at')
        .gte('created_at', twentyFourHoursAgo.toISOString())

      if (error) throw error

      const total_transactions = recentTransactions?.length || 0
      const failed_transactions = recentTransactions?.filter(t => t.status === 'failed').length || 0
      const failed_transactions_rate = total_transactions > 0 ? (failed_transactions / total_transactions) * 100 : 0

      // Get pending payouts
      const { count: pending_payouts_count } = await this.supabase
        .from('payout_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      // Determine system status
      let system_status: 'healthy' | 'warning' | 'critical' = 'healthy'
      if (failed_transactions_rate > 10) system_status = 'critical'
      else if (failed_transactions_rate > 5) system_status = 'warning'

      return {
        system_status,
        active_users_24h: 0, // TODO: Query actual active users
        failed_transactions_rate,
        avg_payout_time: 0, // TODO: Calculate from payout data
        pending_payouts_count: pending_payouts_count || 0,
        error_rate: failed_transactions_rate
      }
    } catch (error) {
      console.error('Error getting platform health:', error)
      throw error
    }
  }

  /**
   * Run daily automated operations
   */
  async runDailyOps(): Promise<DailyOperationsResult> {
    console.log('🤖 Starting daily automated operations...')

    if (typeof window !== 'undefined') {
      throw new Error('Daily operations can only run on server side')
    }

    try {
      // 1. Generate daily exports
      console.log('📊 Generating daily exports...')
      const [dailyCsv, weeklyRevenue, monthlyCreators] = await Promise.all([
        exporter?.generateDailyCSV() || { success: false, export_id: 'failed', generated_at: new Date().toISOString(), error: 'Exporter not available' },
        exporter?.generateWeeklyRevenue() || { success: false, export_id: 'failed', generated_at: new Date().toISOString(), error: 'Exporter not available' },
        exporter?.generateMonthlyCreators() || { success: false, export_id: 'failed', generated_at: new Date().toISOString(), error: 'Exporter not available' }
      ])

      // 2. Run fraud detection scan
      console.log('🔍 Running fraud detection scan...')
      const fraudScan = await fraudMonitor?.checkForFraud() || { alerts: [], stats: { high_risk_creators: 0 }, actions_taken: [] }

      // 3. Get platform health metrics
      console.log('🏥 Checking platform health...')
      const platformHealth = await this.getPlatformHealth()

      // 4. Calculate daily summary metrics
      const revenue = await this.getPlatformRevenue()
      const recentTransactions = await this.getRecentTransactions(1000)

      // 5. Send daily summary email
      console.log('📧 Sending daily summary...')
      const notificationsSent = await emailer?.sendDailySummary(
        revenue.gross_revenue,
        revenue.total_transactions,
        fraudScan.alerts.length,
        [
          dailyCsv.success ? `Daily CSV: ${dailyCsv.record_count} records` : 'Daily CSV: Failed',
          weeklyRevenue.success ? `Weekly Revenue: ${weeklyRevenue.record_count} days` : 'Weekly Revenue: Failed',
          monthlyCreators.success ? `Monthly Creators: ${monthlyCreators.record_count} creators` : 'Monthly Creators: Failed'
        ]
      ) || false

      // 6. Send export notifications
      if (dailyCsv.success && dailyCsv.file_path) {
        await emailer?.sendExportNotification(
          'Daily Transactions',
          dailyCsv.file_path,
          dailyCsv.file_size || 0,
          dailyCsv.record_count || 0
        )
      }

      // 7. Clean up old exports
      await exporter?.cleanupOldExports(30)

      const result: DailyOperationsResult = {
        exports: {
          daily_csv: dailyCsv,
          weekly_revenue: weeklyRevenue,
          monthly_creators: monthlyCreators
        },
        fraud_scan: {
          alerts: fraudScan.alerts.length,
          actions_taken: fraudScan.actions_taken.length,
          high_risk_creators: fraudScan.stats.high_risk_creators
        },
        platform_health: platformHealth,
        notifications_sent: notificationsSent
      }

      console.log('✅ Daily operations completed successfully')
      return result

    } catch (error) {
      console.error('❌ Daily operations failed:', error)

      // Send error alert
      await emailer?.sendSystemAlert(
        'system_down',
        'Daily operations failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )

      throw error
    }
  }

  /**
   * Run emergency fraud sweep
   */
  async runEmergencyFraudSweep(): Promise<{
    critical_alerts: number
    suspended_creators: number
    actions_taken: string[]
  }> {
    console.log('🚨 Running emergency fraud sweep...')

    try {
      const fraudScan = await fraudMonitor?.checkForFraud() || { alerts: [], actions_taken: [], stats: { high_risk_creators: 0 } }

      const criticalAlerts = fraudScan.alerts.filter(a => a.severity === 'critical')
      const suspendedCreators = fraudScan.actions_taken.filter(a => a.includes('Suspended')).length

      // Send immediate alert if critical issues found
      if (criticalAlerts.length > 0) {
        await emailer?.sendSystemAlert(
          'security_breach',
          `Emergency fraud sweep detected ${criticalAlerts.length} critical alerts`,
          { alerts: criticalAlerts }
        )
      }

      return {
        critical_alerts: criticalAlerts.length,
        suspended_creators: suspendedCreators,
        actions_taken: fraudScan.actions_taken
      }

    } catch (error) {
      console.error('Emergency fraud sweep failed:', error)
      throw error
    }
  }

  /**
   * Generate and send weekly executive report
   */
  async generateWeeklyReport(): Promise<boolean> {
    console.log('📈 Generating weekly executive report...')

    try {
      // Get 7-day metrics
      const endDate = new Date().toISOString()
      const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [revenue, creators, dailySummaries] = await Promise.all([
        this.getPlatformRevenue(startDate, endDate),
        this.getTopCreators(20),
        this.getDailySummaries(7)
      ])

      // Calculate week-over-week growth
      const previousWeekStart = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      const previousWeekEnd = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const previousRevenue = await this.getPlatformRevenue(previousWeekStart, previousWeekEnd)

      const revenueGrowth = previousRevenue.gross_revenue > 0
        ? ((revenue.gross_revenue - previousRevenue.gross_revenue) / previousRevenue.gross_revenue) * 100
        : 0

      // Generate comprehensive report
      const reportData = {
        period: { startDate, endDate },
        revenue: {
          current: revenue,
          previous: previousRevenue,
          growth: revenueGrowth
        },
        top_creators: creators.slice(0, 10),
        daily_breakdown: dailySummaries,
        key_metrics: {
          avg_daily_revenue: revenue.gross_revenue / 7,
          creator_retention: creators.filter(c => c.status === 'active').length,
          transaction_volume: revenue.total_transactions
        }
      }

      // Generate export
      const reportResult = await exporter?.generateFullReport()

      // Send executive summary email
      const subject = `📊 AEON Weekly Executive Report - ${new Date().toLocaleDateString()}`
      const text = `
AEON Platform Weekly Report

REVENUE PERFORMANCE
• Current Week: $${(revenue.gross_revenue * 0.01).toFixed(2)}
• Previous Week: $${(previousRevenue.gross_revenue * 0.01).toFixed(2)}
• Growth: ${revenueGrowth >= 0 ? '+' : ''}${revenueGrowth.toFixed(1)}%

KEY METRICS
• Total Transactions: ${revenue.total_transactions.toLocaleString()}
• Active Creators: ${revenue.active_creators}
• Average Daily Revenue: $${((revenue.gross_revenue / 7) * 0.01).toFixed(2)}

TOP PERFORMERS
${creators.slice(0, 5).map((c, i) =>
  `${i + 1}. ${c.creator_email || c.creator_id.slice(0, 8)} - $${(c.total_earnings * 0.01).toFixed(2)}`
).join('\n')}

Full report attached.
Dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard
      `.trim()

      await emailer?.sendCustomEmail({
        to: process.env.EXECUTIVE_EMAILS?.split(',') || process.env.ADMIN_EMAILS?.split(',') || ['admin@aeon.com'],
        subject,
        text,
        priority: 'normal'
      })

      console.log('✅ Weekly executive report sent')
      return true

    } catch (error) {
      console.error('Failed to generate weekly report:', error)
      return false
    }
  }

  /**
   * Monitor system health and send alerts if needed
   */
  async monitorSystemHealth(): Promise<void> {
    try {
      const health = await this.getPlatformHealth()

      // Check for critical issues
      if (health.system_status === 'critical') {
        await emailer?.sendSystemAlert(
          'system_down',
          'Platform health check failed - critical status detected',
          health
        )
      }

      // Check error rates
      if (health.error_rate > 10) {
        await emailer?.sendSystemAlert(
          'database_error',
          `High error rate detected: ${health.error_rate}%`,
          { error_rate: health.error_rate }
        )
      }

      // Check pending payouts
      if (health.pending_payouts_count > 100) {
        await emailer?.sendAlert(
          'High Pending Payouts',
          `${health.pending_payouts_count} payouts are pending processing`
        )
      }

    } catch (error) {
      console.error('System health monitoring failed:', error)
      await emailer?.sendSystemAlert(
        'system_down',
        'System health monitoring failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      )
    }
  }
}

// Export singleton instance
export const adminAgent = new AdminAgent()
