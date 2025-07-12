/**
 * AEON Creator Agent - Creator Payout & Wallet Management
 * Handles creator wallet operations, transaction history, and payout processing
 * Integrates with Stripe Connect and blockchain services for comprehensive payout options
 */

import { createClient } from '@/lib/supabase/client'
import { StripeConnectService } from '../payments/StripeConnectService'
import { TransitionNFTService } from '../blockchain/TransitionNFTService'
import { creditEngine } from '../payments/CreditEngine'

export interface CreatorWallet {
  id: string
  creator_id: string
  balance: number
  pending_payouts: number
  total_earnings: number
  total_payouts: number
  payout_method: 'stripe' | 'crypto' | 'bank'
  payout_threshold: number
  auto_payout: boolean
  stripe_account_id?: string
  stripe_account_status?: string
  crypto_wallet_address?: string
  crypto_wallet_type?: string
  created_at: string
  updated_at: string
}

export interface CreatorTransaction {
  id: string
  creator_id: string
  type: 'earning' | 'payout' | 'bonus' | 'refund' | 'fee'
  amount: number
  description: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  payout_method?: string
  transaction_hash?: string
  stripe_transfer_id?: string
  created_at: string
}

export interface PayoutRequest {
  creator_id: string
  amount: number
  method: 'stripe' | 'crypto'
  crypto_token?: 'ETH' | 'USDC'
}

export interface PayoutResult {
  success: boolean
  transaction_id?: string
  payout_id?: string
  error?: string
  estimated_arrival?: string
}

export class CreatorAgent {
  private supabase = createClient()
  private stripeConnect = new StripeConnectService()
  private nftService = new TransitionNFTService()

  constructor() {
    // Initialize services
  }

  /**
   * Get creator wallet with current balance and stats
   */
  async getWallet(creatorId: string): Promise<CreatorWallet | null> {
    try {
      const { data: wallet, error } = await this.supabase
        .from('creator_wallets')
        .select('*')
        .eq('creator_id', creatorId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      // Create wallet if doesn't exist
      if (!wallet) {
        return await this.createWallet(creatorId)
      }

      return wallet
    } catch (error) {
      console.error('Error fetching creator wallet:', error)
      return null
    }
  }

  /**
   * Create new creator wallet
   */
  private async createWallet(creatorId: string): Promise<CreatorWallet> {
    const { data: wallet, error } = await this.supabase
      .from('creator_wallets')
      .insert({
        creator_id: creatorId,
        balance: 0,
        pending_payouts: 0,
        total_earnings: 0,
        total_payouts: 0,
        payout_method: 'stripe',
        payout_threshold: 10.00,
        auto_payout: false
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create creator wallet: ${error.message}`)
    }

    return wallet
  }

  /**
   * Get creator transaction history
   */
  async getTransactions(
    creatorId: string, 
    limit: number = 50, 
    offset: number = 0
  ): Promise<CreatorTransaction[]> {
    try {
      const { data: transactions, error } = await this.supabase
        .from('credit_transactions')
        .select('*')
        .eq('creator_id', creatorId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) {
        throw error
      }

      return transactions || []
    } catch (error) {
      console.error('Error fetching creator transactions:', error)
      return []
    }
  }

  /**
   * Process Stripe payout
   */
  async payoutStripe(creatorId: string, amountCredits: number): Promise<PayoutResult> {
    try {
      // Get creator wallet
      const wallet = await this.getWallet(creatorId)
      if (!wallet) {
        return { success: false, error: 'Creator wallet not found' }
      }

      // Check sufficient balance
      if (wallet.balance < amountCredits) {
        return { success: false, error: 'Insufficient balance' }
      }

      // Check minimum payout threshold
      if (amountCredits < wallet.payout_threshold) {
        return { 
          success: false, 
          error: `Minimum payout is ${wallet.payout_threshold} credits` 
        }
      }

      // Process Stripe payout
      const payoutResult = await this.stripeConnect.processCreatorPayout(
        creatorId,
        amountCredits
      )

      if (!payoutResult.success) {
        return payoutResult
      }

      // Update wallet balance
      await this.updateWalletBalance(creatorId, -amountCredits, amountCredits)

      // Log transaction
      await this.logTransaction({
        creator_id: creatorId,
        type: 'payout',
        amount: -amountCredits,
        description: `Stripe payout: ${amountCredits} credits`,
        status: 'completed',
        payout_method: 'stripe',
        stripe_transfer_id: payoutResult.transferId
      })

      return {
        success: true,
        transaction_id: payoutResult.transferId,
        estimated_arrival: '1-3 business days'
      }
    } catch (error) {
      console.error('Stripe payout error:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Payout failed' 
      }
    }
  }

  /**
   * Process crypto payout
   */
  async payoutCrypto(
    creatorId: string, 
    amountCredits: number, 
    tokenType: 'ETH' | 'USDC' = 'USDC'
  ): Promise<PayoutResult> {
    try {
      // Get creator wallet
      const wallet = await this.getWallet(creatorId)
      if (!wallet) {
        return { success: false, error: 'Creator wallet not found' }
      }

      // Check sufficient balance
      if (wallet.balance < amountCredits) {
        return { success: false, error: 'Insufficient balance' }
      }

      // Check crypto wallet setup
      if (!wallet.crypto_wallet_address) {
        return { success: false, error: 'Crypto wallet not connected' }
      }

      // Process crypto payout
      const payoutResult = await this.nftService.processCryptoPayout(
        creatorId,
        amountCredits,
        wallet.crypto_wallet_address,
        tokenType
      )

      if (!payoutResult.success) {
        return payoutResult
      }

      // Update wallet balance
      await this.updateWalletBalance(creatorId, -amountCredits, amountCredits)

      // Log transaction
      await this.logTransaction({
        creator_id: creatorId,
        type: 'payout',
        amount: -amountCredits,
        description: `${tokenType} payout: ${amountCredits} credits`,
        status: 'completed',
        payout_method: 'crypto',
        transaction_hash: payoutResult.transactionHash
      })

      return {
        success: true,
        transaction_id: payoutResult.transactionHash,
        estimated_arrival: '5-15 minutes'
      }
    } catch (error) {
      console.error('Crypto payout error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payout failed'
      }
    }
  }

  /**
   * Add earnings to creator wallet
   */
  async addEarnings(
    creatorId: string,
    amount: number,
    description: string,
    source?: string
  ): Promise<boolean> {
    try {
      // Update wallet balance
      await this.updateWalletBalance(creatorId, amount, 0)

      // Log transaction
      await this.logTransaction({
        creator_id: creatorId,
        type: 'earning',
        amount: amount,
        description: description,
        status: 'completed'
      })

      return true
    } catch (error) {
      console.error('Error adding earnings:', error)
      return false
    }
  }

  /**
   * Update wallet balance and totals
   */
  private async updateWalletBalance(
    creatorId: string,
    balanceChange: number,
    payoutAmount: number = 0
  ): Promise<void> {
    const { error } = await this.supabase.rpc('update_creator_wallet', {
      p_creator_id: creatorId,
      p_balance_change: balanceChange,
      p_payout_amount: payoutAmount
    })

    if (error) {
      throw new Error(`Failed to update wallet balance: ${error.message}`)
    }
  }

  /**
   * Log transaction to credit_transactions table
   */
  private async logTransaction(transaction: Omit<CreatorTransaction, 'id' | 'created_at'>): Promise<void> {
    const { error } = await this.supabase
      .from('credit_transactions')
      .insert({
        ...transaction,
        created_at: new Date().toISOString()
      })

    if (error) {
      throw new Error(`Failed to log transaction: ${error.message}`)
    }
  }

  /**
   * Get wallet summary with analytics
   */
  async getWalletSummary(creatorId: string): Promise<{
    wallet: CreatorWallet | null
    recentTransactions: CreatorTransaction[]
    monthlyEarnings: number
    totalVideosCreated: number
    averageEarningsPerVideo: number
  }> {
    try {
      const [wallet, transactions] = await Promise.all([
        this.getWallet(creatorId),
        this.getTransactions(creatorId, 10)
      ])

      // Calculate monthly earnings
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const monthlyEarnings = transactions
        .filter(t =>
          t.type === 'earning' &&
          new Date(t.created_at) >= thirtyDaysAgo
        )
        .reduce((sum, t) => sum + t.amount, 0)

      // Get video creation stats (placeholder - would need actual video table)
      const totalVideosCreated = 0 // TODO: Query actual video count
      const averageEarningsPerVideo = totalVideosCreated > 0
        ? (wallet?.total_earnings || 0) / totalVideosCreated
        : 0

      return {
        wallet,
        recentTransactions: transactions,
        monthlyEarnings,
        totalVideosCreated,
        averageEarningsPerVideo
      }
    } catch (error) {
      console.error('Error getting wallet summary:', error)
      return {
        wallet: null,
        recentTransactions: [],
        monthlyEarnings: 0,
        totalVideosCreated: 0,
        averageEarningsPerVideo: 0
      }
    }
  }

  /**
   * Update payout preferences
   */
  async updatePayoutPreferences(
    creatorId: string,
    preferences: {
      payout_method?: 'stripe' | 'crypto' | 'bank'
      payout_threshold?: number
      auto_payout?: boolean
      crypto_wallet_address?: string
      crypto_wallet_type?: string
    }
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('creator_wallets')
        .update({
          ...preferences,
          updated_at: new Date().toISOString()
        })
        .eq('creator_id', creatorId)

      if (error) {
        throw error
      }

      return true
    } catch (error) {
      console.error('Error updating payout preferences:', error)
      return false
    }
  }

  /**
   * Check if auto-payout should be triggered
   */
  async checkAutoPayout(creatorId: string): Promise<void> {
    try {
      const wallet = await this.getWallet(creatorId)
      if (!wallet || !wallet.auto_payout) {
        return
      }

      if (wallet.balance >= wallet.payout_threshold) {
        // Trigger auto-payout based on preferred method
        if (wallet.payout_method === 'stripe') {
          await this.payoutStripe(creatorId, wallet.balance)
        } else if (wallet.payout_method === 'crypto') {
          await this.payoutCrypto(creatorId, wallet.balance)
        }
      }
    } catch (error) {
      console.error('Auto-payout check failed:', error)
    }
  }
}

// Export singleton instance
export const creatorAgent = new CreatorAgent()
