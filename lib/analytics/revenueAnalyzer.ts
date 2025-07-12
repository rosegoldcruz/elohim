/**
 * AEON Revenue Analyzer - Advanced Analytics & Fraud Detection
 * Provides sophisticated analysis of transaction patterns, anomaly detection,
 * and revenue insights for platform oversight
 */

import { AnomalyAlert } from '../agents/adminAgent'

export interface TransactionPattern {
  creator_id: string
  daily_average: number
  weekly_average: number
  monthly_average: number
  volatility_score: number
  trend_direction: 'up' | 'down' | 'stable'
  last_spike_date?: string
  spike_frequency: number
}

export interface RevenueInsight {
  type: 'growth_opportunity' | 'risk_factor' | 'optimization' | 'trend_alert'
  title: string
  description: string
  impact: 'low' | 'medium' | 'high'
  recommended_action: string
  data_points: any[]
}

export interface FraudIndicator {
  creator_id: string
  risk_score: number // 0-100
  indicators: string[]
  suspicious_transactions: any[]
  recommended_action: 'monitor' | 'investigate' | 'suspend' | 'clear'
}

export class RevenueAnalyzer {
  
  /**
   * Detect transaction anomalies and suspicious patterns
   */
  static detectAnomalies(transactions: any[]): AnomalyAlert[] {
    const alerts: AnomalyAlert[] = []
    
    // Group transactions by creator and date
    const creatorTransactions = this.groupTransactionsByCreator(transactions)
    
    for (const [creatorId, creatorTxs] of Object.entries(creatorTransactions)) {
      // Detect large single transactions
      const largeTransactions = creatorTxs.filter(tx => 
        tx.amount > 1000 && tx.transaction_type === 'royalty'
      )
      
      if (largeTransactions.length > 0) {
        alerts.push({
          id: `large_tx_${creatorId}_${Date.now()}`,
          type: 'large_transaction',
          severity: largeTransactions[0].amount > 5000 ? 'high' : 'medium',
          description: `Creator ${creatorId} received ${largeTransactions.length} large transaction(s)`,
          affected_entity: creatorId,
          amount: Math.max(...largeTransactions.map(tx => tx.amount)),
          detected_at: new Date().toISOString(),
          status: 'new'
        })
      }
      
      // Detect rapid payout patterns
      const payouts = creatorTxs.filter(tx => tx.transaction_type === 'payout')
      const recentPayouts = payouts.filter(tx => 
        new Date(tx.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      )
      
      if (recentPayouts.length > 3) {
        alerts.push({
          id: `rapid_payout_${creatorId}_${Date.now()}`,
          type: 'rapid_payouts',
          severity: 'medium',
          description: `Creator ${creatorId} made ${recentPayouts.length} payouts in 24 hours`,
          affected_entity: creatorId,
          detected_at: new Date().toISOString(),
          status: 'new'
        })
      }
      
      // Detect unusual earning patterns
      const earnings = creatorTxs.filter(tx => tx.transaction_type === 'royalty')
      if (earnings.length > 0) {
        const avgEarning = earnings.reduce((sum, tx) => sum + tx.amount, 0) / earnings.length
        const unusualEarnings = earnings.filter(tx => tx.amount > avgEarning * 5)
        
        if (unusualEarnings.length > 0) {
          alerts.push({
            id: `unusual_pattern_${creatorId}_${Date.now()}`,
            type: 'unusual_pattern',
            severity: 'low',
            description: `Creator ${creatorId} has earnings significantly above average`,
            affected_entity: creatorId,
            detected_at: new Date().toISOString(),
            status: 'new'
          })
        }
      }
    }
    
    return alerts
  }
  
  /**
   * Analyze creator transaction patterns
   */
  static analyzeCreatorPatterns(transactions: any[]): TransactionPattern[] {
    const creatorTransactions = this.groupTransactionsByCreator(transactions)
    const patterns: TransactionPattern[] = []
    
    for (const [creatorId, creatorTxs] of Object.entries(creatorTransactions)) {
      const earnings = creatorTxs.filter(tx => tx.transaction_type === 'royalty')
      
      if (earnings.length === 0) continue
      
      // Calculate averages
      const totalEarnings = earnings.reduce((sum, tx) => sum + tx.amount, 0)
      const dailyEarnings = this.groupByDate(earnings)
      const weeklyEarnings = this.groupByWeek(earnings)
      const monthlyEarnings = this.groupByMonth(earnings)
      
      const daily_average = Object.values(dailyEarnings).reduce((sum: number, day: any) => 
        sum + day.reduce((daySum: number, tx: any) => daySum + tx.amount, 0), 0
      ) / Object.keys(dailyEarnings).length
      
      const weekly_average = Object.values(weeklyEarnings).reduce((sum: number, week: any) => 
        sum + week.reduce((weekSum: number, tx: any) => weekSum + tx.amount, 0), 0
      ) / Object.keys(weeklyEarnings).length
      
      const monthly_average = Object.values(monthlyEarnings).reduce((sum: number, month: any) => 
        sum + month.reduce((monthSum: number, tx: any) => monthSum + tx.amount, 0), 0
      ) / Object.keys(monthlyEarnings).length
      
      // Calculate volatility
      const dailyAmounts = Object.values(dailyEarnings).map((day: any) => 
        day.reduce((sum: number, tx: any) => sum + tx.amount, 0)
      )
      const volatility_score = this.calculateVolatility(dailyAmounts)
      
      // Determine trend
      const recentEarnings = earnings.slice(-7) // Last 7 transactions
      const olderEarnings = earnings.slice(-14, -7) // Previous 7 transactions
      const recentAvg = recentEarnings.reduce((sum, tx) => sum + tx.amount, 0) / recentEarnings.length
      const olderAvg = olderEarnings.reduce((sum, tx) => sum + tx.amount, 0) / olderEarnings.length
      
      let trend_direction: 'up' | 'down' | 'stable' = 'stable'
      if (recentAvg > olderAvg * 1.1) trend_direction = 'up'
      else if (recentAvg < olderAvg * 0.9) trend_direction = 'down'
      
      // Detect spikes
      const spikes = earnings.filter(tx => tx.amount > daily_average * 3)
      const spike_frequency = spikes.length / earnings.length
      const last_spike_date = spikes.length > 0 ? spikes[spikes.length - 1].created_at : undefined
      
      patterns.push({
        creator_id: creatorId,
        daily_average,
        weekly_average,
        monthly_average,
        volatility_score,
        trend_direction,
        last_spike_date,
        spike_frequency
      })
    }
    
    return patterns
  }
  
  /**
   * Generate revenue insights and recommendations
   */
  static generateInsights(
    transactions: any[], 
    patterns: TransactionPattern[]
  ): RevenueInsight[] {
    const insights: RevenueInsight[] = []
    
    // Analyze overall revenue trends
    const totalRevenue = transactions
      .filter(tx => tx.transaction_type === 'purchase')
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    const totalRoyalties = transactions
      .filter(tx => tx.transaction_type === 'royalty')
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    const royaltyRate = totalRevenue > 0 ? (totalRoyalties / totalRevenue) * 100 : 0
    
    // High royalty rate insight
    if (royaltyRate > 30) {
      insights.push({
        type: 'risk_factor',
        title: 'High Royalty Rate',
        description: `Platform is paying ${royaltyRate.toFixed(1)}% in royalties, which may impact profitability`,
        impact: 'high',
        recommended_action: 'Consider adjusting royalty rates or platform fees',
        data_points: [{ royalty_rate: royaltyRate, total_revenue: totalRevenue }]
      })
    }
    
    // Top performer insights
    const topPerformers = patterns
      .filter(p => p.trend_direction === 'up' && p.monthly_average > 100)
      .sort((a, b) => b.monthly_average - a.monthly_average)
      .slice(0, 5)
    
    if (topPerformers.length > 0) {
      insights.push({
        type: 'growth_opportunity',
        title: 'Rising Star Creators',
        description: `${topPerformers.length} creators showing strong upward trends`,
        impact: 'medium',
        recommended_action: 'Consider featuring these creators or offering incentives',
        data_points: topPerformers
      })
    }
    
    // Volatility insights
    const highVolatilityCreators = patterns.filter(p => p.volatility_score > 0.5)
    if (highVolatilityCreators.length > patterns.length * 0.2) {
      insights.push({
        type: 'risk_factor',
        title: 'High Creator Volatility',
        description: `${highVolatilityCreators.length} creators have highly volatile earnings`,
        impact: 'medium',
        recommended_action: 'Investigate causes of volatility and consider stabilization measures',
        data_points: highVolatilityCreators
      })
    }
    
    return insights
  }
  
  /**
   * Assess fraud risk for creators
   */
  static assessFraudRisk(creatorId: string, transactions: any[]): FraudIndicator {
    const creatorTxs = transactions.filter(tx => tx.creator_id === creatorId)
    let risk_score = 0
    const indicators: string[] = []
    const suspicious_transactions: any[] = []
    
    // Check for rapid account creation and immediate high earnings
    const accountAge = this.getAccountAge(creatorTxs)
    const totalEarnings = creatorTxs
      .filter(tx => tx.transaction_type === 'royalty')
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    if (accountAge < 7 && totalEarnings > 500) {
      risk_score += 30
      indicators.push('New account with high immediate earnings')
    }
    
    // Check for unusual payout patterns
    const payouts = creatorTxs.filter(tx => tx.transaction_type === 'payout')
    const rapidPayouts = payouts.filter(tx => 
      new Date(tx.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )
    
    if (rapidPayouts.length > 2) {
      risk_score += 20
      indicators.push('Multiple rapid payouts')
      suspicious_transactions.push(...rapidPayouts)
    }
    
    // Check for round number transactions (potential manipulation)
    const roundTransactions = creatorTxs.filter(tx => tx.amount % 100 === 0 && tx.amount > 100)
    if (roundTransactions.length > creatorTxs.length * 0.5) {
      risk_score += 15
      indicators.push('High frequency of round-number transactions')
    }
    
    // Determine recommended action
    let recommended_action: 'monitor' | 'investigate' | 'suspend' | 'clear' = 'clear'
    if (risk_score > 50) recommended_action = 'suspend'
    else if (risk_score > 30) recommended_action = 'investigate'
    else if (risk_score > 15) recommended_action = 'monitor'
    
    return {
      creator_id: creatorId,
      risk_score: Math.min(risk_score, 100),
      indicators,
      suspicious_transactions,
      recommended_action
    }
  }
  
  // Helper methods
  private static groupTransactionsByCreator(transactions: any[]): { [creatorId: string]: any[] } {
    return transactions.reduce((groups, tx) => {
      const creatorId = tx.creator_id || 'unknown'
      if (!groups[creatorId]) groups[creatorId] = []
      groups[creatorId].push(tx)
      return groups
    }, {})
  }
  
  private static groupByDate(transactions: any[]): { [date: string]: any[] } {
    return transactions.reduce((groups, tx) => {
      const date = new Date(tx.created_at).toISOString().split('T')[0]
      if (!groups[date]) groups[date] = []
      groups[date].push(tx)
      return groups
    }, {})
  }
  
  private static groupByWeek(transactions: any[]): { [week: string]: any[] } {
    return transactions.reduce((groups, tx) => {
      const date = new Date(tx.created_at)
      const week = `${date.getFullYear()}-W${Math.ceil(date.getDate() / 7)}`
      if (!groups[week]) groups[week] = []
      groups[week].push(tx)
      return groups
    }, {})
  }
  
  private static groupByMonth(transactions: any[]): { [month: string]: any[] } {
    return transactions.reduce((groups, tx) => {
      const date = new Date(tx.created_at)
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!groups[month]) groups[month] = []
      groups[month].push(tx)
      return groups
    }, {})
  }
  
  private static calculateVolatility(values: number[]): number {
    if (values.length < 2) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
    const standardDeviation = Math.sqrt(variance)
    
    return mean > 0 ? standardDeviation / mean : 0
  }
  
  private static getAccountAge(transactions: any[]): number {
    if (transactions.length === 0) return 0
    
    const oldestTransaction = transactions.reduce((oldest, tx) => 
      new Date(tx.created_at) < new Date(oldest.created_at) ? tx : oldest
    )
    
    const ageMs = Date.now() - new Date(oldestTransaction.created_at).getTime()
    return Math.floor(ageMs / (24 * 60 * 60 * 1000)) // Age in days
  }
}
