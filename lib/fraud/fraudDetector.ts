/**
 * AEON Fraud Detection System
 * Advanced anomaly detection and suspicious activity monitoring
 * for platform security and financial protection
 */

import { createClient } from '@/lib/supabase/client'
import { AnomalyAlert } from '../agents/adminAgent'

export interface FraudRule {
  id: string
  name: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  enabled: boolean
  threshold: number
  timeWindow: number // in hours
  action: 'flag' | 'suspend' | 'block' | 'notify'
}

export interface FraudScore {
  creator_id: string
  overall_score: number // 0-100
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  contributing_factors: {
    factor: string
    score: number
    weight: number
  }[]
  last_calculated: string
}

export interface SuspiciousActivity {
  id: string
  creator_id: string
  activity_type: string
  description: string
  risk_score: number
  evidence: any[]
  detected_at: string
  status: 'new' | 'investigating' | 'resolved' | 'false_positive'
  assigned_to?: string
}

export class FraudDetector {
  private supabase = createClient()
  
  // Default fraud detection rules
  private static readonly DEFAULT_RULES: FraudRule[] = [
    {
      id: 'large_single_transaction',
      name: 'Large Single Transaction',
      description: 'Single transaction exceeds threshold',
      severity: 'medium',
      enabled: true,
      threshold: 1000, // credits
      timeWindow: 1,
      action: 'flag'
    },
    {
      id: 'rapid_payouts',
      name: 'Rapid Payouts',
      description: 'Multiple payouts in short time period',
      severity: 'high',
      enabled: true,
      threshold: 3, // number of payouts
      timeWindow: 24,
      action: 'suspend'
    },
    {
      id: 'new_account_high_earnings',
      name: 'New Account High Earnings',
      description: 'New account with unusually high earnings',
      severity: 'high',
      enabled: true,
      threshold: 500, // credits within first week
      timeWindow: 168, // 7 days
      action: 'flag'
    },
    {
      id: 'round_number_pattern',
      name: 'Round Number Pattern',
      description: 'High frequency of round number transactions',
      severity: 'low',
      enabled: true,
      threshold: 0.7, // 70% of transactions are round numbers
      timeWindow: 168,
      action: 'flag'
    },
    {
      id: 'velocity_spike',
      name: 'Transaction Velocity Spike',
      description: 'Sudden increase in transaction frequency',
      severity: 'medium',
      enabled: true,
      threshold: 5, // 5x normal velocity
      timeWindow: 24,
      action: 'flag'
    }
  ]

  /**
   * Run comprehensive fraud detection on all creators
   */
  async runFraudDetection(): Promise<{
    alerts: AnomalyAlert[]
    suspicious_activities: SuspiciousActivity[]
    fraud_scores: FraudScore[]
  }> {
    try {
      console.log('🔍 Starting fraud detection scan...')

      // Get recent transactions for analysis
      const { data: transactions, error } = await this.supabase
        .from('credit_transactions')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      const alerts: AnomalyAlert[] = []
      const suspicious_activities: SuspiciousActivity[] = []
      const fraud_scores: FraudScore[] = []

      // Group transactions by creator
      const creatorTransactions = this.groupTransactionsByCreator(transactions || [])

      // Analyze each creator
      for (const [creatorId, creatorTxs] of Object.entries(creatorTransactions)) {
        // Run fraud rules
        const creatorAlerts = await this.runFraudRules(creatorId, creatorTxs)
        alerts.push(...creatorAlerts)

        // Detect suspicious activities
        const activities = await this.detectSuspiciousActivities(creatorId, creatorTxs)
        suspicious_activities.push(...activities)

        // Calculate fraud score
        const fraudScore = await this.calculateFraudScore(creatorId, creatorTxs)
        fraud_scores.push(fraudScore)
      }

      console.log(`✅ Fraud detection complete: ${alerts.length} alerts, ${suspicious_activities.length} suspicious activities`)

      return {
        alerts,
        suspicious_activities,
        fraud_scores
      }

    } catch (error) {
      console.error('❌ Fraud detection failed:', error)
      throw error
    }
  }

  /**
   * Run fraud detection rules on creator transactions
   */
  private async runFraudRules(creatorId: string, transactions: any[]): Promise<AnomalyAlert[]> {
    const alerts: AnomalyAlert[] = []

    for (const rule of FraudDetector.DEFAULT_RULES) {
      if (!rule.enabled) continue

      try {
        const ruleAlert = await this.evaluateRule(rule, creatorId, transactions)
        if (ruleAlert) {
          alerts.push(ruleAlert)
        }
      } catch (error) {
        console.error(`Error evaluating rule ${rule.id}:`, error)
      }
    }

    return alerts
  }

  /**
   * Evaluate a specific fraud rule
   */
  private async evaluateRule(
    rule: FraudRule, 
    creatorId: string, 
    transactions: any[]
  ): Promise<AnomalyAlert | null> {
    const timeWindowMs = rule.timeWindow * 60 * 60 * 1000
    const cutoffTime = new Date(Date.now() - timeWindowMs)
    const recentTxs = transactions.filter(tx => new Date(tx.created_at) >= cutoffTime)

    switch (rule.id) {
      case 'large_single_transaction':
        const largeTx = recentTxs.find(tx => 
          tx.transaction_type === 'royalty' && tx.amount > rule.threshold
        )
        if (largeTx) {
          return {
            id: `${rule.id}_${creatorId}_${Date.now()}`,
            type: 'large_transaction',
            severity: rule.severity,
            description: `Creator received ${largeTx.amount} credits in single transaction`,
            affected_entity: creatorId,
            amount: largeTx.amount,
            detected_at: new Date().toISOString(),
            status: 'new'
          }
        }
        break

      case 'rapid_payouts':
        const payouts = recentTxs.filter(tx => tx.transaction_type === 'payout')
        if (payouts.length >= rule.threshold) {
          return {
            id: `${rule.id}_${creatorId}_${Date.now()}`,
            type: 'rapid_payouts',
            severity: rule.severity,
            description: `Creator made ${payouts.length} payouts in ${rule.timeWindow} hours`,
            affected_entity: creatorId,
            detected_at: new Date().toISOString(),
            status: 'new'
          }
        }
        break

      case 'new_account_high_earnings':
        const accountAge = await this.getAccountAge(creatorId)
        if (accountAge <= 7) { // Account less than 7 days old
          const totalEarnings = recentTxs
            .filter(tx => tx.transaction_type === 'royalty')
            .reduce((sum, tx) => sum + tx.amount, 0)
          
          if (totalEarnings > rule.threshold) {
            return {
              id: `${rule.id}_${creatorId}_${Date.now()}`,
              type: 'suspicious_creator',
              severity: rule.severity,
              description: `New account (${accountAge} days) earned ${totalEarnings} credits`,
              affected_entity: creatorId,
              amount: totalEarnings,
              detected_at: new Date().toISOString(),
              status: 'new'
            }
          }
        }
        break

      case 'round_number_pattern':
        const roundTxs = recentTxs.filter(tx => tx.amount % 100 === 0 && tx.amount > 100)
        const roundRatio = recentTxs.length > 0 ? roundTxs.length / recentTxs.length : 0
        
        if (roundRatio >= rule.threshold) {
          return {
            id: `${rule.id}_${creatorId}_${Date.now()}`,
            type: 'unusual_pattern',
            severity: rule.severity,
            description: `${(roundRatio * 100).toFixed(1)}% of transactions are round numbers`,
            affected_entity: creatorId,
            detected_at: new Date().toISOString(),
            status: 'new'
          }
        }
        break

      case 'velocity_spike':
        const normalVelocity = await this.calculateNormalVelocity(creatorId)
        const currentVelocity = recentTxs.length / (rule.timeWindow / 24) // transactions per day
        
        if (normalVelocity > 0 && currentVelocity > normalVelocity * rule.threshold) {
          return {
            id: `${rule.id}_${creatorId}_${Date.now()}`,
            type: 'unusual_pattern',
            severity: rule.severity,
            description: `Transaction velocity ${currentVelocity.toFixed(1)}/day vs normal ${normalVelocity.toFixed(1)}/day`,
            affected_entity: creatorId,
            detected_at: new Date().toISOString(),
            status: 'new'
          }
        }
        break
    }

    return null
  }

  /**
   * Detect suspicious activities beyond rule-based detection
   */
  private async detectSuspiciousActivities(
    creatorId: string, 
    transactions: any[]
  ): Promise<SuspiciousActivity[]> {
    const activities: SuspiciousActivity[] = []

    // Pattern 1: Consistent timing patterns (possible automation)
    const timingPattern = this.analyzeTimingPatterns(transactions)
    if (timingPattern.suspicion_score > 0.7) {
      activities.push({
        id: `timing_pattern_${creatorId}_${Date.now()}`,
        creator_id: creatorId,
        activity_type: 'timing_pattern',
        description: 'Transactions show consistent timing patterns suggesting automation',
        risk_score: timingPattern.suspicion_score * 100,
        evidence: timingPattern.evidence,
        detected_at: new Date().toISOString(),
        status: 'new'
      })
    }

    // Pattern 2: Unusual geographic patterns (if IP data available)
    // This would require IP tracking implementation

    // Pattern 3: Coordinated activity with other creators
    const coordinationScore = await this.detectCoordinatedActivity(creatorId, transactions)
    if (coordinationScore > 0.6) {
      activities.push({
        id: `coordination_${creatorId}_${Date.now()}`,
        creator_id: creatorId,
        activity_type: 'coordinated_activity',
        description: 'Activity patterns suggest coordination with other creators',
        risk_score: coordinationScore * 100,
        evidence: [],
        detected_at: new Date().toISOString(),
        status: 'new'
      })
    }

    return activities
  }

  /**
   * Calculate comprehensive fraud score for creator
   */
  private async calculateFraudScore(creatorId: string, transactions: any[]): Promise<FraudScore> {
    const factors = []
    let totalScore = 0

    // Factor 1: Account age vs earnings ratio
    const accountAge = await this.getAccountAge(creatorId)
    const totalEarnings = transactions
      .filter(tx => tx.transaction_type === 'royalty')
      .reduce((sum, tx) => sum + tx.amount, 0)
    
    const earningsPerDay = accountAge > 0 ? totalEarnings / accountAge : 0
    const ageScore = Math.min(earningsPerDay / 50, 1) * 30 // Max 30 points
    factors.push({ factor: 'account_age_earnings_ratio', score: ageScore, weight: 0.3 })
    totalScore += ageScore

    // Factor 2: Transaction pattern regularity
    const patternScore = this.analyzeTransactionPatterns(transactions) * 25 // Max 25 points
    factors.push({ factor: 'transaction_patterns', score: patternScore, weight: 0.25 })
    totalScore += patternScore

    // Factor 3: Payout behavior
    const payoutScore = this.analyzePayoutBehavior(transactions) * 20 // Max 20 points
    factors.push({ factor: 'payout_behavior', score: payoutScore, weight: 0.2 })
    totalScore += payoutScore

    // Factor 4: Volume anomalies
    const volumeScore = this.analyzeVolumeAnomalies(transactions) * 25 // Max 25 points
    factors.push({ factor: 'volume_anomalies', score: volumeScore, weight: 0.25 })
    totalScore += volumeScore

    // Determine risk level
    let risk_level: 'low' | 'medium' | 'high' | 'critical' = 'low'
    if (totalScore > 75) risk_level = 'critical'
    else if (totalScore > 50) risk_level = 'high'
    else if (totalScore > 25) risk_level = 'medium'

    return {
      creator_id: creatorId,
      overall_score: Math.min(totalScore, 100),
      risk_level,
      contributing_factors: factors,
      last_calculated: new Date().toISOString()
    }
  }

  // Helper methods
  private groupTransactionsByCreator(transactions: any[]): { [creatorId: string]: any[] } {
    return transactions.reduce((groups, tx) => {
      const creatorId = tx.creator_id || 'unknown'
      if (!groups[creatorId]) groups[creatorId] = []
      groups[creatorId].push(tx)
      return groups
    }, {})
  }

  private async getAccountAge(creatorId: string): Promise<number> {
    try {
      const { data: wallet } = await this.supabase
        .from('creator_wallets')
        .select('created_at')
        .eq('creator_id', creatorId)
        .single()

      if (!wallet) return 0

      const ageMs = Date.now() - new Date(wallet.created_at).getTime()
      return Math.floor(ageMs / (24 * 60 * 60 * 1000)) // Age in days
    } catch {
      return 0
    }
  }

  private async calculateNormalVelocity(creatorId: string): Promise<number> {
    // Calculate average transactions per day over last 30 days (excluding last 24 hours)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    try {
      const { data: historicalTxs } = await this.supabase
        .from('credit_transactions')
        .select('created_at')
        .eq('creator_id', creatorId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .lt('created_at', oneDayAgo.toISOString())

      return historicalTxs ? historicalTxs.length / 29 : 0 // 29 days of historical data
    } catch {
      return 0
    }
  }

  private analyzeTimingPatterns(transactions: any[]): { suspicion_score: number; evidence: any[] } {
    if (transactions.length < 5) return { suspicion_score: 0, evidence: [] }

    // Analyze hour-of-day patterns
    const hourCounts: { [hour: number]: number } = {}
    transactions.forEach(tx => {
      const hour = new Date(tx.created_at).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })

    // Check for overly consistent timing
    const hours = Object.keys(hourCounts).map(Number)
    const variance = this.calculateVariance(hours)
    const suspicion_score = variance < 2 ? 0.8 : 0 // Low variance = suspicious

    return {
      suspicion_score,
      evidence: [{ hour_distribution: hourCounts, variance }]
    }
  }

  private async detectCoordinatedActivity(creatorId: string, transactions: any[]): Promise<number> {
    // This would analyze patterns across multiple creators
    // For now, return 0 (no coordination detected)
    return 0
  }

  private analyzeTransactionPatterns(transactions: any[]): number {
    // Analyze for suspicious patterns in transaction amounts and timing
    const amounts = transactions.map(tx => tx.amount)
    const variance = this.calculateVariance(amounts)
    const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
    
    // Low variance relative to mean suggests artificial patterns
    return mean > 0 ? Math.min(variance / mean, 1) : 0
  }

  private analyzePayoutBehavior(transactions: any[]): number {
    const payouts = transactions.filter(tx => tx.transaction_type === 'payout')
    const earnings = transactions.filter(tx => tx.transaction_type === 'royalty')
    
    if (earnings.length === 0) return 0
    
    // Suspicious: immediate payouts after earnings
    let suspiciousPayouts = 0
    payouts.forEach(payout => {
      const payoutTime = new Date(payout.created_at).getTime()
      const recentEarning = earnings.find(earning => {
        const earningTime = new Date(earning.created_at).getTime()
        return payoutTime - earningTime < 60 * 60 * 1000 // Within 1 hour
      })
      if (recentEarning) suspiciousPayouts++
    })
    
    return payouts.length > 0 ? suspiciousPayouts / payouts.length : 0
  }

  private analyzeVolumeAnomalies(transactions: any[]): number {
    if (transactions.length < 3) return 0
    
    const amounts = transactions.map(tx => tx.amount)
    const mean = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
    const outliers = amounts.filter(amt => amt > mean * 3) // 3x above average
    
    return amounts.length > 0 ? outliers.length / amounts.length : 0
  }

  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length
  }
}

// Export singleton instance
export const fraudDetector = new FraudDetector()
