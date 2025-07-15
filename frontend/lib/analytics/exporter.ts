/**
 * AEON Automated Exporter
 * Handles scheduled data exports for finance, compliance, and investor reporting
 * Supports multiple formats and storage options with automated scheduling
 */

import { createClient } from '@/lib/supabase/client'

// Only import server-side modules when not in browser
let Parser: any = null
let fs: any = null
let path: any = null

if (typeof window === 'undefined') {
  const json2csv = require('json2csv')
  Parser = json2csv.Parser
  fs = require('fs/promises')
  path = require('path')
}

export interface ExportConfig {
  type: 'transactions' | 'revenue' | 'creators' | 'full_report'
  format: 'csv' | 'json' | 'xlsx'
  schedule: 'daily' | 'weekly' | 'monthly'
  recipients: string[]
  storage: 'local' | 's3' | 'both'
  retention_days: number
}

export interface ExportResult {
  success: boolean
  file_path?: string
  file_size?: number
  record_count?: number
  export_id: string
  generated_at: string
  error?: string
}

export interface ScheduledExport {
  id: string
  name: string
  config: ExportConfig
  last_run?: string
  next_run: string
  enabled: boolean
  created_by: string
}

export class Exporter {
  private supabase = createClient()
  private exportDir = process.env.EXPORT_DIR || './exports'

  constructor() {
    // Only initialize on server side
    if (typeof window === 'undefined') {
      this.ensureExportDirectory()
    }
  }

  /**
   * Generate daily transaction export (most common use case)
   */
  async generateDailyCSV(): Promise<ExportResult> {
    if (typeof window !== 'undefined' || !Parser || !fs || !path) {
      return {
        success: false,
        export_id: `daily_transactions_${Date.now()}`,
        generated_at: new Date().toISOString(),
        error: 'Server-side only operation'
      }
    }

    const exportId = `daily_transactions_${Date.now()}`

    try {
      // Get yesterday's transactions
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const startDate = yesterday.toISOString().split('T')[0] + 'T00:00:00.000Z'
      const endDate = yesterday.toISOString().split('T')[0] + 'T23:59:59.999Z'

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

      // Convert to CSV
      const csvFields = [
        'id',
        'created_at',
        'transaction_type',
        'amount',
        'creator_id',
        'creator_email',
        'status',
        'description',
        'reference_id'
      ]

      const csvData = (transactions || []).map(tx => ({
        id: tx.id,
        created_at: tx.created_at,
        transaction_type: tx.transaction_type,
        amount: tx.amount,
        creator_id: tx.creator_id || '',
        creator_email: tx.profiles?.email || '',
        status: tx.status,
        description: tx.description || '',
        reference_id: tx.reference_id || ''
      }))

      const parser = new Parser({ fields: csvFields })
      const csv = parser.parse(csvData)

      // Generate filename
      const fileName = `transactions_${yesterday.toISOString().split('T')[0]}.csv`
      const filePath = path.join(this.exportDir, fileName)

      // Write file
      await fs.writeFile(filePath, csv)
      const stats = await fs.stat(filePath)

      return {
        success: true,
        file_path: filePath,
        file_size: stats.size,
        record_count: csvData.length,
        export_id: exportId,
        generated_at: new Date().toISOString()
      }

    } catch (error) {
      console.error('Daily CSV export failed:', error)
      return {
        success: false,
        export_id: exportId,
        generated_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Export failed'
      }
    }
  }

  /**
   * Generate weekly revenue report
   */
  async generateWeeklyRevenue(): Promise<ExportResult> {
    const exportId = `weekly_revenue_${Date.now()}`
    
    try {
      // Get last 7 days
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 7)

      // Get revenue data
      const { data: transactions, error } = await this.supabase
        .from('credit_transactions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())

      if (error) throw error

      // Calculate metrics
      const purchases = transactions?.filter(tx => tx.transaction_type === 'purchase') || []
      const royalties = transactions?.filter(tx => tx.transaction_type === 'royalty') || []
      const payouts = transactions?.filter(tx => tx.transaction_type === 'payout') || []

      const grossRevenue = purchases.reduce((sum, tx) => sum + (tx.amount || 0), 0)
      const totalRoyalties = royalties.reduce((sum, tx) => sum + (tx.amount || 0), 0)
      const totalPayouts = Math.abs(payouts.reduce((sum, tx) => sum + (tx.amount || 0), 0))
      const netRevenue = grossRevenue - totalRoyalties

      // Group by day
      const dailyData: { [date: string]: any } = {}
      transactions?.forEach(tx => {
        const date = new Date(tx.created_at).toISOString().split('T')[0]
        if (!dailyData[date]) {
          dailyData[date] = { purchases: 0, royalties: 0, payouts: 0, transactions: 0 }
        }
        
        if (tx.transaction_type === 'purchase') dailyData[date].purchases += tx.amount || 0
        if (tx.transaction_type === 'royalty') dailyData[date].royalties += tx.amount || 0
        if (tx.transaction_type === 'payout') dailyData[date].payouts += Math.abs(tx.amount || 0)
        dailyData[date].transactions += 1
      })

      const reportData = {
        summary: {
          period: `${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`,
          gross_revenue: grossRevenue,
          net_revenue: netRevenue,
          total_royalties: totalRoyalties,
          total_payouts: totalPayouts,
          total_transactions: transactions?.length || 0
        },
        daily_breakdown: Object.entries(dailyData).map(([date, data]) => ({
          date,
          ...data,
          net_flow: data.purchases - data.royalties - data.payouts
        }))
      }

      // Generate filename
      const fileName = `revenue_weekly_${endDate.toISOString().split('T')[0]}.json`
      const filePath = path.join(this.exportDir, fileName)

      // Write file
      await fs.writeFile(filePath, JSON.stringify(reportData, null, 2))
      const stats = await fs.stat(filePath)

      return {
        success: true,
        file_path: filePath,
        file_size: stats.size,
        record_count: Object.keys(dailyData).length,
        export_id: exportId,
        generated_at: new Date().toISOString()
      }

    } catch (error) {
      console.error('Weekly revenue export failed:', error)
      return {
        success: false,
        export_id: exportId,
        generated_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Export failed'
      }
    }
  }

  /**
   * Generate monthly creator report
   */
  async generateMonthlyCreators(): Promise<ExportResult> {
    const exportId = `monthly_creators_${Date.now()}`
    
    try {
      // Get creator wallets with earnings
      const { data: creators, error } = await this.supabase
        .from('creator_wallets')
        .select(`
          *,
          profiles!creator_id(email)
        `)
        .order('total_earnings', { ascending: false })

      if (error) throw error

      // Get monthly transaction counts
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const creatorData = await Promise.all(
        (creators || []).map(async (creator) => {
          const { data: monthlyTxs } = await this.supabase
            .from('credit_transactions')
            .select('transaction_type, amount')
            .eq('creator_id', creator.creator_id)
            .gte('created_at', thirtyDaysAgo.toISOString())

          const monthlyEarnings = monthlyTxs
            ?.filter(tx => tx.transaction_type === 'royalty')
            .reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0

          const monthlyPayouts = Math.abs(monthlyTxs
            ?.filter(tx => tx.transaction_type === 'payout')
            .reduce((sum, tx) => sum + (tx.amount || 0), 0) || 0)

          return {
            creator_id: creator.creator_id,
            email: creator.profiles?.email || '',
            total_earnings: creator.total_earnings,
            total_payouts: creator.total_payouts,
            current_balance: creator.balance,
            monthly_earnings: monthlyEarnings,
            monthly_payouts: monthlyPayouts,
            payout_method: creator.payout_method,
            status: creator.total_earnings > 0 ? 'active' : 'inactive',
            created_at: creator.created_at
          }
        })
      )

      // Convert to CSV
      const csvFields = [
        'creator_id',
        'email',
        'total_earnings',
        'total_payouts',
        'current_balance',
        'monthly_earnings',
        'monthly_payouts',
        'payout_method',
        'status',
        'created_at'
      ]

      const parser = new Parser({ fields: csvFields })
      const csv = parser.parse(creatorData)

      // Generate filename
      const fileName = `creators_monthly_${new Date().toISOString().split('T')[0]}.csv`
      const filePath = path.join(this.exportDir, fileName)

      // Write file
      await fs.writeFile(filePath, csv)
      const stats = await fs.stat(filePath)

      return {
        success: true,
        file_path: filePath,
        file_size: stats.size,
        record_count: creatorData.length,
        export_id: exportId,
        generated_at: new Date().toISOString()
      }

    } catch (error) {
      console.error('Monthly creators export failed:', error)
      return {
        success: false,
        export_id: exportId,
        generated_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Export failed'
      }
    }
  }

  /**
   * Generate comprehensive platform report
   */
  async generateFullReport(): Promise<ExportResult> {
    const exportId = `full_report_${Date.now()}`
    
    try {
      const [dailyResult, weeklyResult, monthlyResult] = await Promise.all([
        this.generateDailyCSV(),
        this.generateWeeklyRevenue(),
        this.generateMonthlyCreators()
      ])

      const reportSummary = {
        generated_at: new Date().toISOString(),
        exports: {
          daily_transactions: dailyResult,
          weekly_revenue: weeklyResult,
          monthly_creators: monthlyResult
        },
        platform_status: 'operational',
        total_files: 3,
        total_size: (dailyResult.file_size || 0) + (weeklyResult.file_size || 0) + (monthlyResult.file_size || 0)
      }

      // Generate summary file
      const fileName = `platform_report_${new Date().toISOString().split('T')[0]}.json`
      const filePath = path.join(this.exportDir, fileName)

      await fs.writeFile(filePath, JSON.stringify(reportSummary, null, 2))
      const stats = await fs.stat(filePath)

      return {
        success: true,
        file_path: filePath,
        file_size: stats.size,
        record_count: 1,
        export_id: exportId,
        generated_at: new Date().toISOString()
      }

    } catch (error) {
      console.error('Full report export failed:', error)
      return {
        success: false,
        export_id: exportId,
        generated_at: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Export failed'
      }
    }
  }

  /**
   * Clean up old export files
   */
  async cleanupOldExports(retentionDays: number = 30): Promise<void> {
    try {
      const files = await fs.readdir(this.exportDir)
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

      for (const file of files) {
        const filePath = path.join(this.exportDir, file)
        const stats = await fs.stat(filePath)
        
        if (stats.mtime < cutoffDate) {
          await fs.unlink(filePath)
          console.log(`Cleaned up old export: ${file}`)
        }
      }
    } catch (error) {
      console.error('Export cleanup failed:', error)
    }
  }

  /**
   * Ensure export directory exists
   */
  private async ensureExportDirectory(): Promise<void> {
    if (typeof window !== 'undefined' || !fs) return

    try {
      await fs.access(this.exportDir)
    } catch {
      await fs.mkdir(this.exportDir, { recursive: true })
    }
  }
}

// Export singleton instance (server-side only)
export const exporter = typeof window === 'undefined' ? new Exporter() : null as any
