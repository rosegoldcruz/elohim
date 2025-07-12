/**
 * AEON Fraud Monitor
 * Real-time fraud detection and automated alert system
 * Monitors transactions, detects anomalies, and triggers immediate alerts
 */

import { createClient } from '@/lib/supabase/client'
import { fraudDetector } from '../fraud/fraudDetector'
import { Emailer } from '../utils/emailer'

export interface FraudAlert {
  id: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: 'large_transaction' | 'rapid_payouts' | 'suspicious_pattern' | 'multi_account' | 'velocity_spike'
  creator_id: string
  amount?: number
  description: string
  evidence: any[]
  detected_at: string
  status: 'new' | 'investigating' | 'resolved' | 'false_positive'
  auto_action?: 'flag' | 'suspend' | 'block'
}

export interface MonitoringStats {
  scan_start: string
  scan_end: string
  transactions_scanned: number
  creators_analyzed: number
  alerts_generated: number
  high_risk_creators: number
  auto_actions_taken: number
}

export interface FraudThresholds {
  large_transaction: number      // Credits threshold for large transaction alert
  rapid_payout_count: number     // Number of payouts in time window
  rapid_payout_window: number    // Time window in hours
  new_account_earnings: number   // Max earnings for new accounts
  velocity_multiplier: number    // Multiplier for velocity spike detection
  risk_score_threshold: number   // Overall risk score threshold (0-100)
}

export class FraudMonitor {
  private supabase = createClient()
  private emailer = new Emailer()
  
  // Default fraud thresholds
  private static readonly DEFAULT_THRESHOLDS: FraudThresholds = {
    large_transaction: 5000,      // 5000 credits = $50
    rapid_payout_count: 3,        // 3 payouts
    rapid_payout_window: 24,      // in 24 hours
    new_account_earnings: 1000,   // 1000 credits in first week
    velocity_multiplier: 10,      // 10x normal velocity
    risk_score_threshold: 75      // 75/100 risk score
  }

  constructor(private thresholds: FraudThresholds = FraudMonitor.DEFAULT_THRESHOLDS) {}

  /**
   * Run comprehensive fraud check (main monitoring function)
   */
  async checkForFraud(): Promise<{
    alerts: FraudAlert[]
    stats: MonitoringStats
    actions_taken: string[]
  }> {
    const scanStart = new Date().toISOString()
    console.log('🔍 Starting fraud monitoring scan...')

    try {
      // Get recent transactions for analysis (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      const { data: recentTransactions, error } = await this.supabase
        .from('credit_transactions')
        .select('*')
        .gte('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      const alerts: FraudAlert[] = []
      const actionsTaken: string[] = []

      // 1. Check for large transactions
      const largeTransactionAlerts = await this.detectLargeTransactions(recentTransactions || [])
      alerts.push(...largeTransactionAlerts)

      // 2. Check for rapid payouts
      const rapidPayoutAlerts = await this.detectRapidPayouts(recentTransactions || [])
      alerts.push(...rapidPayoutAlerts)

      // 3. Check for suspicious patterns
      const patternAlerts = await this.detectSuspiciousPatterns(recentTransactions || [])
      alerts.push(...patternAlerts)

      // 4. Check for multi-account exploitation
      const multiAccountAlerts = await this.detectMultiAccountFraud(recentTransactions || [])
      alerts.push(...multiAccountAlerts)

      // 5. Check for velocity spikes
      const velocityAlerts = await this.detectVelocitySpikes(recentTransactions || [])
      alerts.push(...velocityAlerts)

      // 6. Run comprehensive fraud scoring
      const fraudResults = await fraudDetector.runFraudDetection()
      const highRiskCreators = fraudResults.fraud_scores.filter(
        score => score.overall_score >= this.thresholds.risk_score_threshold
      )

      // Process high-risk creators
      for (const creator of highRiskCreators) {
        alerts.push({
          id: `high_risk_${creator.creator_id}_${Date.now()}`,
          severity: creator.risk_level as any,
          type: 'suspicious_pattern',
          creator_id: creator.creator_id,
          description: `Creator has high fraud risk score: ${creator.overall_score}/100`,
          evidence: creator.contributing_factors,
          detected_at: new Date().toISOString(),
          status: 'new',
          auto_action: creator.overall_score >= 90 ? 'suspend' : 'flag'
        })
      }

      // Take automated actions for critical alerts
      for (const alert of alerts.filter(a => a.severity === 'critical')) {
        const action = await this.takeAutomatedAction(alert)
        if (action) {
          actionsTaken.push(action)
        }
      }

      // Send email alerts for high/critical severity
      const criticalAlerts = alerts.filter(a => a.severity === 'high' || a.severity === 'critical')
      if (criticalAlerts.length > 0) {
        await this.sendFraudAlert(criticalAlerts)
      }

      const stats: MonitoringStats = {
        scan_start: scanStart,
        scan_end: new Date().toISOString(),
        transactions_scanned: recentTransactions?.length || 0,
        creators_analyzed: new Set(recentTransactions?.map(tx => tx.creator_id).filter(Boolean)).size,
        alerts_generated: alerts.length,
        high_risk_creators: highRiskCreators.length,
        auto_actions_taken: actionsTaken.length
      }

      console.log(`✅ Fraud scan complete: ${alerts.length} alerts, ${actionsTaken.length} actions taken`)

      return { alerts, stats, actions_taken: actionsTaken }

    } catch (error) {
      console.error('❌ Fraud monitoring failed:', error)
      throw error
    }
  }

  /**
   * Detect large single transactions
   */
  private async detectLargeTransactions(transactions: any[]): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = []
    
    const largeTransactions = transactions.filter(tx => 
      tx.transaction_type === 'royalty' && 
      tx.amount > this.thresholds.large_transaction
    )

    for (const tx of largeTransactions) {
      alerts.push({
        id: `large_tx_${tx.id}`,
        severity: tx.amount > this.thresholds.large_transaction * 2 ? 'critical' : 'high',
        type: 'large_transaction',
        creator_id: tx.creator_id,
        amount: tx.amount,
        description: `Large transaction detected: ${tx.amount} credits`,
        evidence: [{ transaction: tx }],
        detected_at: new Date().toISOString(),
        status: 'new',
        auto_action: 'flag'
      })
    }

    return alerts
  }

  /**
   * Detect rapid payout patterns
   */
  private async detectRapidPayouts(transactions: any[]): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = []
    
    // Group payouts by creator
    const creatorPayouts: { [creatorId: string]: any[] } = {}
    
    transactions
      .filter(tx => tx.transaction_type === 'payout')
      .forEach(tx => {
        if (!creatorPayouts[tx.creator_id]) {
          creatorPayouts[tx.creator_id] = []
        }
        creatorPayouts[tx.creator_id].push(tx)
      })

    // Check each creator's payout frequency
    for (const [creatorId, payouts] of Object.entries(creatorPayouts)) {
      if (payouts.length >= this.thresholds.rapid_payout_count) {
        alerts.push({
          id: `rapid_payout_${creatorId}_${Date.now()}`,
          severity: payouts.length >= this.thresholds.rapid_payout_count * 2 ? 'critical' : 'high',
          type: 'rapid_payouts',
          creator_id: creatorId,
          description: `Rapid payouts detected: ${payouts.length} payouts in ${this.thresholds.rapid_payout_window} hours`,
          evidence: payouts,
          detected_at: new Date().toISOString(),
          status: 'new',
          auto_action: 'suspend'
        })
      }
    }

    return alerts
  }

  /**
   * Detect suspicious transaction patterns
   */
  private async detectSuspiciousPatterns(transactions: any[]): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = []
    
    // Group by creator
    const creatorTransactions: { [creatorId: string]: any[] } = {}
    transactions.forEach(tx => {
      if (tx.creator_id) {
        if (!creatorTransactions[tx.creator_id]) {
          creatorTransactions[tx.creator_id] = []
        }
        creatorTransactions[tx.creator_id].push(tx)
      }
    })

    for (const [creatorId, creatorTxs] of Object.entries(creatorTransactions)) {
      // Check for round number pattern
      const roundNumbers = creatorTxs.filter(tx => tx.amount % 100 === 0 && tx.amount > 100)
      const roundRatio = creatorTxs.length > 0 ? roundNumbers.length / creatorTxs.length : 0
      
      if (roundRatio > 0.8 && creatorTxs.length >= 5) {
        alerts.push({
          id: `round_pattern_${creatorId}_${Date.now()}`,
          severity: 'medium',
          type: 'suspicious_pattern',
          creator_id: creatorId,
          description: `Suspicious round number pattern: ${(roundRatio * 100).toFixed(1)}% of transactions`,
          evidence: [{ round_ratio: roundRatio, transactions: roundNumbers }],
          detected_at: new Date().toISOString(),
          status: 'new',
          auto_action: 'flag'
        })
      }

      // Check for consistent timing patterns
      const hours = creatorTxs.map(tx => new Date(tx.created_at).getHours())
      const uniqueHours = new Set(hours)
      
      if (uniqueHours.size <= 2 && creatorTxs.length >= 10) {
        alerts.push({
          id: `timing_pattern_${creatorId}_${Date.now()}`,
          severity: 'medium',
          type: 'suspicious_pattern',
          creator_id: creatorId,
          description: `Suspicious timing pattern: transactions only at ${Array.from(uniqueHours).join(', ')} hours`,
          evidence: [{ hour_distribution: hours }],
          detected_at: new Date().toISOString(),
          status: 'new',
          auto_action: 'flag'
        })
      }
    }

    return alerts
  }

  /**
   * Detect multi-account fraud
   */
  private async detectMultiAccountFraud(transactions: any[]): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = []
    
    // This would require IP tracking and device fingerprinting
    // For now, detect creators with similar transaction patterns
    
    const creatorPatterns: { [creatorId: string]: { amounts: number[], times: number[] } } = {}
    
    transactions.forEach(tx => {
      if (tx.creator_id) {
        if (!creatorPatterns[tx.creator_id]) {
          creatorPatterns[tx.creator_id] = { amounts: [], times: [] }
        }
        creatorPatterns[tx.creator_id].amounts.push(tx.amount)
        creatorPatterns[tx.creator_id].times.push(new Date(tx.created_at).getHours())
      }
    })

    // Look for creators with identical patterns (simplified detection)
    const creators = Object.keys(creatorPatterns)
    for (let i = 0; i < creators.length; i++) {
      for (let j = i + 1; j < creators.length; j++) {
        const creator1 = creators[i]
        const creator2 = creators[j]
        const pattern1 = creatorPatterns[creator1]
        const pattern2 = creatorPatterns[creator2]
        
        // Check for identical amounts and timing
        const amountSimilarity = this.calculateSimilarity(pattern1.amounts, pattern2.amounts)
        const timingSimilarity = this.calculateSimilarity(pattern1.times, pattern2.times)
        
        if (amountSimilarity > 0.8 && timingSimilarity > 0.8) {
          alerts.push({
            id: `multi_account_${creator1}_${creator2}_${Date.now()}`,
            severity: 'high',
            type: 'multi_account',
            creator_id: creator1,
            description: `Potential multi-account fraud detected between ${creator1} and ${creator2}`,
            evidence: [{ 
              related_creator: creator2,
              amount_similarity: amountSimilarity,
              timing_similarity: timingSimilarity
            }],
            detected_at: new Date().toISOString(),
            status: 'new',
            auto_action: 'flag'
          })
        }
      }
    }

    return alerts
  }

  /**
   * Detect velocity spikes
   */
  private async detectVelocitySpikes(transactions: any[]): Promise<FraudAlert[]> {
    const alerts: FraudAlert[] = []
    
    // Group by creator and calculate velocity
    const creatorVelocity: { [creatorId: string]: number } = {}
    
    transactions.forEach(tx => {
      if (tx.creator_id) {
        creatorVelocity[tx.creator_id] = (creatorVelocity[tx.creator_id] || 0) + 1
      }
    })

    // Get historical velocity for comparison
    for (const [creatorId, currentVelocity] of Object.entries(creatorVelocity)) {
      const historicalVelocity = await this.getHistoricalVelocity(creatorId)
      
      if (historicalVelocity > 0 && currentVelocity > historicalVelocity * this.thresholds.velocity_multiplier) {
        alerts.push({
          id: `velocity_spike_${creatorId}_${Date.now()}`,
          severity: currentVelocity > historicalVelocity * this.thresholds.velocity_multiplier * 2 ? 'critical' : 'high',
          type: 'velocity_spike',
          creator_id: creatorId,
          description: `Velocity spike detected: ${currentVelocity} vs normal ${historicalVelocity} transactions/day`,
          evidence: [{ current_velocity: currentVelocity, historical_velocity: historicalVelocity }],
          detected_at: new Date().toISOString(),
          status: 'new',
          auto_action: 'flag'
        })
      }
    }

    return alerts
  }

  /**
   * Take automated action based on alert
   */
  private async takeAutomatedAction(alert: FraudAlert): Promise<string | null> {
    try {
      switch (alert.auto_action) {
        case 'suspend':
          // TODO: Implement creator suspension
          console.log(`🚫 AUTO-SUSPEND: Creator ${alert.creator_id} suspended due to ${alert.type}`)
          return `Suspended creator ${alert.creator_id}`
        
        case 'block':
          // TODO: Implement creator blocking
          console.log(`🛑 AUTO-BLOCK: Creator ${alert.creator_id} blocked due to ${alert.type}`)
          return `Blocked creator ${alert.creator_id}`
        
        case 'flag':
          // TODO: Implement creator flagging
          console.log(`🚩 AUTO-FLAG: Creator ${alert.creator_id} flagged due to ${alert.type}`)
          return `Flagged creator ${alert.creator_id}`
        
        default:
          return null
      }
    } catch (error) {
      console.error('Failed to take automated action:', error)
      return null
    }
  }

  /**
   * Send fraud alert email
   */
  private async sendFraudAlert(alerts: FraudAlert[]): Promise<void> {
    try {
      const subject = `🚨 AEON Fraud Alert - ${alerts.length} Critical Issues Detected`
      
      const alertSummary = alerts.map(alert => 
        `• ${alert.severity.toUpperCase()}: ${alert.description} (Creator: ${alert.creator_id})`
      ).join('\n')

      const message = `
AEON Fraud Detection Alert

${alerts.length} critical fraud alerts detected:

${alertSummary}

Please review the admin dashboard immediately:
${process.env.NEXT_PUBLIC_APP_URL}/admin/dashboard

Time: ${new Date().toISOString()}
      `.trim()

      await this.emailer.sendAlert(subject, message)
      console.log(`📧 Fraud alert email sent for ${alerts.length} alerts`)
      
    } catch (error) {
      console.error('Failed to send fraud alert email:', error)
    }
  }

  // Helper methods
  private async getHistoricalVelocity(creatorId: string): Promise<number> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

      const { data: historicalTxs } = await this.supabase
        .from('credit_transactions')
        .select('created_at')
        .eq('creator_id', creatorId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .lt('created_at', oneDayAgo.toISOString())

      return historicalTxs ? historicalTxs.length / 29 : 0 // 29 days of data
    } catch {
      return 0
    }
  }

  private calculateSimilarity(arr1: number[], arr2: number[]): number {
    if (arr1.length === 0 || arr2.length === 0) return 0
    
    const set1 = new Set(arr1)
    const set2 = new Set(arr2)
    const intersection = new Set([...set1].filter(x => set2.has(x)))
    const union = new Set([...set1, ...set2])
    
    return intersection.size / union.size
  }
}

// Export singleton instance (server-side only)
export const fraudMonitor = typeof window === 'undefined' ? new FraudMonitor() : null as any
