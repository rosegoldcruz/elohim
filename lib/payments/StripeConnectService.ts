/**
 * AEON Stripe Connect Service - Creator Payout System
 * Handles Stripe Connect integration for creator fiat payouts
 * Enables automatic royalty distribution to creator bank accounts
 */

import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/client';
import { creditEngine } from './CreditEngine';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export interface StripeConnectAccount {
  accountId: string;
  creatorId: string;
  status: 'pending' | 'active' | 'restricted' | 'rejected';
  country: string;
  currency: string;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
}

export interface PayoutResult {
  success: boolean;
  payoutId?: string;
  amount?: number;
  currency?: string;
  estimatedArrival?: Date;
  error?: string;
}

export class StripeConnectService {
  private supabase = createClient();
  private readonly CREDIT_TO_USD_RATE = 0.01; // 1 credit = $0.01
  private readonly MIN_PAYOUT_USD = 10; // Minimum $10 payout

  constructor() {
    console.log('💳 StripeConnectService initialized for creator payouts');
  }

  /**
   * Create Stripe Connect account for creator
   */
  async createConnectAccount(
    creatorId: string,
    email: string,
    country: string = 'US'
  ): Promise<{
    success: boolean;
    accountId?: string;
    onboardingUrl?: string;
    error?: string;
  }> {
    try {
      // Check if account already exists
      const { data: existingWallet } = await this.supabase
        .from('creator_wallets')
        .select('stripe_account_id, stripe_account_status')
        .eq('creator_id', creatorId)
        .single();

      if (existingWallet?.stripe_account_id) {
        return {
          success: false,
          error: 'Stripe account already exists for this creator'
        };
      }

      // Create Stripe Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country,
        email,
        capabilities: {
          transfers: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          creator_id: creatorId,
          platform: 'aeon'
        }
      });

      // Create onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/creator/stripe/refresh`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/creator/stripe/success`,
        type: 'account_onboarding',
      });

      // Update creator wallet
      await this.supabase
        .from('creator_wallets')
        .update({
          stripe_account_id: account.id,
          stripe_account_status: 'pending',
          payout_method: 'stripe'
        })
        .eq('creator_id', creatorId);

      console.log(`🔗 Stripe Connect account created: ${account.id} for creator ${creatorId}`);

      return {
        success: true,
        accountId: account.id,
        onboardingUrl: accountLink.url
      };

    } catch (error) {
      console.error('Failed to create Stripe Connect account:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Account creation failed'
      };
    }
  }

  /**
   * Check Stripe Connect account status
   */
  async checkAccountStatus(accountId: string): Promise<StripeConnectAccount | null> {
    try {
      const account = await stripe.accounts.retrieve(accountId);

      return {
        accountId: account.id,
        creatorId: account.metadata?.creator_id || '',
        status: account.charges_enabled && account.payouts_enabled ? 'active' : 
                account.details_submitted ? 'pending' : 'restricted',
        country: account.country || '',
        currency: account.default_currency || 'usd',
        payoutsEnabled: account.payouts_enabled || false,
        chargesEnabled: account.charges_enabled || false,
        detailsSubmitted: account.details_submitted || false
      };

    } catch (error) {
      console.error('Failed to check account status:', error);
      return null;
    }
  }

  /**
   * Process payout to creator Stripe account
   */
  async processCreatorPayout(
    creatorId: string,
    creditAmount: number
  ): Promise<PayoutResult> {
    try {
      // Get creator wallet and Stripe account
      const { data: wallet, error: walletError } = await this.supabase
        .from('creator_wallets')
        .select('*')
        .eq('creator_id', creatorId)
        .single();

      if (walletError || !wallet) {
        return { success: false, error: 'Creator wallet not found' };
      }

      if (!wallet.stripe_account_id) {
        return { success: false, error: 'Stripe account not connected' };
      }

      // Check account status
      const accountStatus = await this.checkAccountStatus(wallet.stripe_account_id);
      if (!accountStatus?.payoutsEnabled) {
        return { success: false, error: 'Stripe account not ready for payouts' };
      }

      // Convert credits to USD
      const usdAmount = creditAmount * this.CREDIT_TO_USD_RATE;
      if (usdAmount < this.MIN_PAYOUT_USD) {
        return { 
          success: false, 
          error: `Minimum payout is $${this.MIN_PAYOUT_USD}` 
        };
      }

      // Check sufficient balance
      if (wallet.balance < creditAmount) {
        return { success: false, error: 'Insufficient balance' };
      }

      // Create Stripe transfer
      const transfer = await stripe.transfers.create({
        amount: Math.round(usdAmount * 100), // Convert to cents
        currency: 'usd',
        destination: wallet.stripe_account_id,
        metadata: {
          creator_id: creatorId,
          credit_amount: creditAmount.toString(),
          payout_type: 'creator_earnings'
        }
      });

      // Update creator wallet (deduct from balance, add to pending)
      await creditEngine.requestPayout({
        creatorId,
        amount: creditAmount,
        method: 'stripe',
        destination: wallet.stripe_account_id
      });

      // Record payout transaction
      await this.recordPayoutTransaction(
        creatorId,
        creditAmount,
        usdAmount,
        transfer.id
      );

      console.log(`💸 Payout processed: $${usdAmount} to creator ${creatorId}`);

      return {
        success: true,
        payoutId: transfer.id,
        amount: usdAmount,
        currency: 'usd',
        estimatedArrival: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) // 2 days
      };

    } catch (error) {
      console.error('Payout processing failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payout failed'
      };
    }
  }

  /**
   * Handle Stripe webhooks for payout status updates
   */
  async handleWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'transfer.paid':
          await this.handleTransferPaid(event.data.object as Stripe.Transfer);
          break;
        
        case 'transfer.failed':
          await this.handleTransferFailed(event.data.object as Stripe.Transfer);
          break;
        
        case 'account.updated':
          await this.handleAccountUpdated(event.data.object as Stripe.Account);
          break;
        
        default:
          console.log(`Unhandled webhook event: ${event.type}`);
      }
    } catch (error) {
      console.error('Webhook handling failed:', error);
    }
  }

  /**
   * Get creator payout history
   */
  async getPayoutHistory(creatorId: string): Promise<Array<{
    id: string;
    amount: number;
    currency: string;
    status: string;
    created: Date;
    arrival_date?: Date;
  }>> {
    try {
      const { data: wallet } = await this.supabase
        .from('creator_wallets')
        .select('stripe_account_id')
        .eq('creator_id', creatorId)
        .single();

      if (!wallet?.stripe_account_id) {
        return [];
      }

      // Get transfers from Stripe
      const transfers = await stripe.transfers.list({
        destination: wallet.stripe_account_id,
        limit: 50
      });

      return transfers.data.map(transfer => ({
        id: transfer.id,
        amount: transfer.amount / 100, // Convert from cents
        currency: transfer.currency,
        status: transfer.status || 'pending',
        created: new Date(transfer.created * 1000),
        arrival_date: transfer.arrival_date ? new Date(transfer.arrival_date * 1000) : undefined
      }));

    } catch (error) {
      console.error('Failed to get payout history:', error);
      return [];
    }
  }

  /**
   * Private helper methods
   */
  private async handleTransferPaid(transfer: Stripe.Transfer): Promise<void> {
    const creatorId = transfer.metadata?.creator_id;
    if (!creatorId) return;

    // Update payout status to completed
    await this.supabase
      .from('payout_requests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        stripe_transfer_id: transfer.id
      })
      .eq('creator_id', creatorId)
      .eq('stripe_transfer_id', transfer.id);

    console.log(`✅ Transfer completed: ${transfer.id} for creator ${creatorId}`);
  }

  private async handleTransferFailed(transfer: Stripe.Transfer): Promise<void> {
    const creatorId = transfer.metadata?.creator_id;
    if (!creatorId) return;

    // Update payout status to failed and refund balance
    const creditAmount = parseFloat(transfer.metadata?.credit_amount || '0');
    
    await this.supabase
      .from('payout_requests')
      .update({
        status: 'failed',
        failure_reason: 'Transfer failed',
        stripe_transfer_id: transfer.id
      })
      .eq('creator_id', creatorId)
      .eq('stripe_transfer_id', transfer.id);

    // Refund credits to creator balance
    if (creditAmount > 0) {
      await creditEngine.addCredits(
        creatorId,
        creditAmount,
        'refund',
        'Payout failed - balance restored'
      );
    }

    console.log(`❌ Transfer failed: ${transfer.id} for creator ${creatorId}`);
  }

  private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    const creatorId = account.metadata?.creator_id;
    if (!creatorId) return;

    // Update account status in database
    const status = account.charges_enabled && account.payouts_enabled ? 'active' : 
                  account.details_submitted ? 'pending' : 'restricted';

    await this.supabase
      .from('creator_wallets')
      .update({
        stripe_account_status: status
      })
      .eq('stripe_account_id', account.id);

    console.log(`🔄 Account updated: ${account.id} status: ${status}`);
  }

  private async recordPayoutTransaction(
    creatorId: string,
    creditAmount: number,
    usdAmount: number,
    transferId: string
  ): Promise<void> {
    await this.supabase
      .from('credit_transactions')
      .insert({
        creator_id: creatorId,
        amount: -creditAmount, // Negative for payout
        transaction_type: 'payout',
        status: 'completed',
        description: `Stripe payout: $${usdAmount}`,
        reference_id: transferId
      });
  }
}

// Export singleton instance
export const stripeConnectService = new StripeConnectService();
