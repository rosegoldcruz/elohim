/**
 * AEON Credit Engine - Automated Payment & Royalty System
 * Handles credit validation, deduction, royalty distribution, and transaction tracking
 * Ensures trustless marketplace payments with zero manual intervention
 */

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row'];
type CreatorWallet = Database['public']['Tables']['creator_wallets']['Row'];

export interface CreditBalance {
  userId: string;
  credits: number;
  pendingCredits: number;
  totalEarned: number;
  totalSpent: number;
}

export interface TransactionResult {
  success: boolean;
  transactionId?: string;
  newBalance?: number;
  error?: string;
}

export interface RoyaltyDistribution {
  creatorId: string;
  amount: number;
  transitionId: string;
  purchaseId: string;
  royaltyRate: number;
}

export interface PayoutRequest {
  creatorId: string;
  amount: number;
  method: 'stripe' | 'crypto' | 'bank';
  destination: string;
}

export class CreditEngine {
  private supabase = createClient();
  private readonly PLATFORM_FEE_RATE = 0.025; // 2.5% platform fee
  private readonly MIN_PAYOUT_AMOUNT = 10; // Minimum $10 for payout
  private readonly CREDIT_TO_USD_RATE = 0.01; // 1 credit = $0.01

  constructor() {
    console.log('💳 CreditEngine initialized for automated payments');
  }

  /**
   * Get user's credit balance with detailed breakdown
   */
  async getCreditBalance(userId: string): Promise<CreditBalance> {
    try {
      // Get user profile with credits
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw new Error(`Failed to get user profile: ${profileError.message}`);
      }

      // Get transaction history for totals
      const { data: transactions, error: transError } = await this.supabase
        .from('credit_transactions')
        .select('amount, transaction_type')
        .eq('user_id', userId);

      if (transError) {
        throw new Error(`Failed to get transactions: ${transError.message}`);
      }

      // Calculate totals
      const totalEarned = transactions
        ?.filter(t => ['royalty', 'bonus', 'refund'].includes(t.transaction_type))
        .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      const totalSpent = transactions
        ?.filter(t => ['purchase', 'fee'].includes(t.transaction_type))
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) || 0;

      // Get pending credits (processing transactions)
      const { data: pendingTrans } = await this.supabase
        .from('credit_transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('status', 'pending');

      const pendingCredits = pendingTrans?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      return {
        userId,
        credits: profile?.credits || 0,
        pendingCredits,
        totalEarned,
        totalSpent
      };

    } catch (error) {
      console.error('Failed to get credit balance:', error);
      return {
        userId,
        credits: 0,
        pendingCredits: 0,
        totalEarned: 0,
        totalSpent: 0
      };
    }
  }

  /**
   * Validate user has sufficient credits for purchase
   */
  async validateCredits(userId: string, amount: number): Promise<{
    valid: boolean;
    currentBalance: number;
    error?: string;
  }> {
    try {
      const balance = await this.getCreditBalance(userId);
      const availableCredits = balance.credits - balance.pendingCredits;

      if (availableCredits < amount) {
        return {
          valid: false,
          currentBalance: availableCredits,
          error: `Insufficient credits. Required: ${amount}, Available: ${availableCredits}`
        };
      }

      return {
        valid: true,
        currentBalance: availableCredits
      };

    } catch (error) {
      return {
        valid: false,
        currentBalance: 0,
        error: error instanceof Error ? error.message : 'Validation failed'
      };
    }
  }

  /**
   * Deduct credits from user account (atomic transaction)
   */
  async deductCredits(
    userId: string,
    amount: number,
    transitionId: string,
    description?: string
  ): Promise<TransactionResult> {
    try {
      // Validate credits first
      const validation = await this.validateCredits(userId, amount);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Start transaction
      const { data: transaction, error: transError } = await this.supabase.rpc(
        'deduct_user_credits',
        {
          p_user_id: userId,
          p_amount: amount,
          p_transition_id: transitionId,
          p_description: description || `Purchase transition ${transitionId}`
        }
      );

      if (transError) {
        throw new Error(`Credit deduction failed: ${transError.message}`);
      }

      console.log(`💳 Credits deducted: ${amount} from user ${userId}`);

      return {
        success: true,
        transactionId: transaction?.transaction_id,
        newBalance: transaction?.new_balance
      };

    } catch (error) {
      console.error('Failed to deduct credits:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Deduction failed'
      };
    }
  }

  /**
   * Add credits to user account
   */
  async addCredits(
    userId: string,
    amount: number,
    transactionType: 'purchase' | 'bonus' | 'refund' | 'royalty',
    description?: string
  ): Promise<TransactionResult> {
    try {
      const { data: transaction, error } = await this.supabase.rpc(
        'add_user_credits',
        {
          p_user_id: userId,
          p_amount: amount,
          p_transaction_type: transactionType,
          p_description: description || `${transactionType} credits`
        }
      );

      if (error) {
        throw new Error(`Credit addition failed: ${error.message}`);
      }

      console.log(`💰 Credits added: ${amount} to user ${userId}`);

      return {
        success: true,
        transactionId: transaction?.transaction_id,
        newBalance: transaction?.new_balance
      };

    } catch (error) {
      console.error('Failed to add credits:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Addition failed'
      };
    }
  }

  /**
   * Record royalty payment to creator
   */
  async recordRoyalty(distribution: RoyaltyDistribution): Promise<TransactionResult> {
    try {
      // Calculate platform fee
      const platformFee = distribution.amount * this.PLATFORM_FEE_RATE;
      const creatorAmount = distribution.amount - platformFee;

      // Update creator wallet
      const { data: wallet, error: walletError } = await this.supabase.rpc(
        'update_creator_wallet',
        {
          p_creator_id: distribution.creatorId,
          p_amount: creatorAmount,
          p_transition_id: distribution.transitionId,
          p_purchase_id: distribution.purchaseId,
          p_royalty_rate: distribution.royaltyRate
        }
      );

      if (walletError) {
        throw new Error(`Royalty recording failed: ${walletError.message}`);
      }

      // Record platform fee
      await this.recordPlatformFee(platformFee, distribution.transitionId);

      console.log(`👑 Royalty recorded: ${creatorAmount} to creator ${distribution.creatorId}`);

      return {
        success: true,
        transactionId: wallet?.transaction_id,
        newBalance: wallet?.new_balance
      };

    } catch (error) {
      console.error('Failed to record royalty:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Royalty recording failed'
      };
    }
  }

  /**
   * Process complete purchase transaction (deduct + royalty)
   */
  async processPurchase(
    userId: string,
    creatorId: string,
    transitionId: string,
    price: number,
    royaltyRate: number
  ): Promise<{
    success: boolean;
    purchaseId?: string;
    userBalance?: number;
    creatorEarnings?: number;
    error?: string;
  }> {
    try {
      // Generate purchase ID
      const purchaseId = `purchase_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Step 1: Deduct credits from user
      const deductionResult = await this.deductCredits(
        userId,
        price,
        transitionId,
        `Purchase transition ${transitionId}`
      );

      if (!deductionResult.success) {
        return {
          success: false,
          error: deductionResult.error
        };
      }

      // Step 2: Calculate and record royalty
      const royaltyAmount = price * royaltyRate;
      const royaltyResult = await this.recordRoyalty({
        creatorId,
        amount: royaltyAmount,
        transitionId,
        purchaseId,
        royaltyRate
      });

      if (!royaltyResult.success) {
        // Rollback user deduction if royalty fails
        await this.addCredits(userId, price, 'refund', 'Royalty processing failed - refund');
        return {
          success: false,
          error: `Royalty processing failed: ${royaltyResult.error}`
        };
      }

      // Step 3: Record purchase in marketplace
      await this.recordPurchaseTransaction(userId, creatorId, transitionId, price, purchaseId);

      console.log(`✅ Purchase completed: ${transitionId} by ${userId} for ${price} credits`);

      return {
        success: true,
        purchaseId,
        userBalance: deductionResult.newBalance,
        creatorEarnings: royaltyAmount - (royaltyAmount * this.PLATFORM_FEE_RATE)
      };

    } catch (error) {
      console.error('Purchase processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed'
      };
    }
  }

  /**
   * Get creator wallet balance
   */
  async getCreatorWallet(creatorId: string): Promise<{
    balance: number;
    pendingPayouts: number;
    totalEarnings: number;
    canPayout: boolean;
  }> {
    try {
      const { data: wallet, error } = await this.supabase
        .from('creator_wallets')
        .select('*')
        .eq('creator_id', creatorId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      // Create wallet if doesn't exist
      if (!wallet) {
        await this.createCreatorWallet(creatorId);
        return {
          balance: 0,
          pendingPayouts: 0,
          totalEarnings: 0,
          canPayout: false
        };
      }

      const balanceUSD = wallet.balance * this.CREDIT_TO_USD_RATE;
      const canPayout = balanceUSD >= this.MIN_PAYOUT_AMOUNT;

      return {
        balance: wallet.balance,
        pendingPayouts: wallet.pending_payouts || 0,
        totalEarnings: wallet.total_earnings || 0,
        canPayout
      };

    } catch (error) {
      console.error('Failed to get creator wallet:', error);
      return {
        balance: 0,
        pendingPayouts: 0,
        totalEarnings: 0,
        canPayout: false
      };
    }
  }

  /**
   * Request payout for creator
   */
  async requestPayout(request: PayoutRequest): Promise<{
    success: boolean;
    payoutId?: string;
    estimatedAmount?: number;
    error?: string;
  }> {
    try {
      const wallet = await this.getCreatorWallet(request.creatorId);
      
      if (!wallet.canPayout) {
        return {
          success: false,
          error: `Minimum payout amount is $${this.MIN_PAYOUT_AMOUNT}`
        };
      }

      if (wallet.balance < request.amount) {
        return {
          success: false,
          error: 'Insufficient balance for payout'
        };
      }

      // Create payout request
      const payoutId = `payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { error } = await this.supabase
        .from('payout_requests')
        .insert({
          id: payoutId,
          creator_id: request.creatorId,
          amount: request.amount,
          method: request.method,
          destination: request.destination,
          status: 'pending',
          estimated_usd: request.amount * this.CREDIT_TO_USD_RATE
        });

      if (error) {
        throw error;
      }

      // Update wallet pending amount
      await this.supabase.rpc('update_creator_pending_payout', {
        p_creator_id: request.creatorId,
        p_amount: request.amount
      });

      console.log(`💸 Payout requested: ${request.amount} credits for creator ${request.creatorId}`);

      return {
        success: true,
        payoutId,
        estimatedAmount: request.amount * this.CREDIT_TO_USD_RATE
      };

    } catch (error) {
      console.error('Payout request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payout request failed'
      };
    }
  }

  /**
   * Get transaction history for user
   */
  async getTransactionHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<CreditTransaction[]> {
    try {
      const { data: transactions, error } = await this.supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      return transactions || [];

    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return [];
    }
  }

  /**
   * Private helper methods
   */
  private async createCreatorWallet(creatorId: string): Promise<void> {
    await this.supabase
      .from('creator_wallets')
      .insert({
        creator_id: creatorId,
        balance: 0,
        pending_payouts: 0,
        total_earnings: 0
      });
  }

  private async recordPlatformFee(amount: number, transitionId: string): Promise<void> {
    await this.supabase
      .from('platform_earnings')
      .insert({
        amount,
        source: 'transition_fee',
        transition_id: transitionId,
        created_at: new Date().toISOString()
      });
  }

  private async recordPurchaseTransaction(
    userId: string,
    creatorId: string,
    transitionId: string,
    price: number,
    purchaseId: string
  ): Promise<void> {
    await this.supabase
      .from('transition_purchases')
      .insert({
        id: purchaseId,
        user_id: userId,
        creator_id: creatorId,
        transition_id: transitionId,
        credits_paid: price,
        status: 'completed'
      });
  }
}

// Export singleton instance
export const creditEngine = new CreditEngine();
