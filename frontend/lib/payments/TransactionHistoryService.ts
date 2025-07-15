/**
 * AEON Transaction History Service
 * Comprehensive audit trail and transaction history for credit system
 * Provides detailed tracking, reporting, and analytics for all credit movements
 */

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type CreditTransaction = Database['public']['Tables']['credit_transactions']['Row'];

export interface TransactionSummary {
  totalTransactions: number;
  totalCreditsIn: number;
  totalCreditsOut: number;
  netBalance: number;
  transactionsByType: Record<string, number>;
  recentTransactions: CreditTransaction[];
}

export interface TransactionFilter {
  userId?: string;
  creatorId?: string;
  transactionType?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minAmount?: number;
  maxAmount?: number;
  transitionId?: string;
}

export interface TransactionAnalytics {
  dailyVolume: Array<{ date: string; volume: number; count: number }>;
  topTransactionTypes: Array<{ type: string; volume: number; count: number }>;
  topCreators: Array<{ creatorId: string; earnings: number; transactions: number }>;
  platformRevenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  };
}

export class TransactionHistoryService {
  private supabase = createClient();

  constructor() {
    console.log('📊 TransactionHistoryService initialized for audit trail');
  }

  /**
   * Get comprehensive transaction history with filtering
   */
  async getTransactionHistory(
    filter: TransactionFilter = {},
    limit: number = 50,
    offset: number = 0
  ): Promise<{
    transactions: CreditTransaction[];
    totalCount: number;
    summary: TransactionSummary;
  }> {
    try {
      let query = this.supabase
        .from('credit_transactions')
        .select(`
          *,
          user_profile:user_id(name, email),
          creator_profile:creator_id(creator_name),
          transition:transition_id(name, category)
        `, { count: 'exact' });

      // Apply filters
      if (filter.userId) {
        query = query.eq('user_id', filter.userId);
      }

      if (filter.creatorId) {
        query = query.eq('creator_id', filter.creatorId);
      }

      if (filter.transactionType) {
        query = query.eq('transaction_type', filter.transactionType);
      }

      if (filter.status) {
        query = query.eq('status', filter.status);
      }

      if (filter.dateFrom) {
        query = query.gte('created_at', filter.dateFrom.toISOString());
      }

      if (filter.dateTo) {
        query = query.lte('created_at', filter.dateTo.toISOString());
      }

      if (filter.minAmount) {
        query = query.gte('amount', filter.minAmount);
      }

      if (filter.maxAmount) {
        query = query.lte('amount', filter.maxAmount);
      }

      if (filter.transitionId) {
        query = query.eq('transition_id', filter.transitionId);
      }

      // Apply pagination and sorting
      const { data: transactions, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw error;
      }

      // Generate summary
      const summary = await this.generateTransactionSummary(filter);

      return {
        transactions: transactions || [],
        totalCount: count || 0,
        summary
      };

    } catch (error) {
      console.error('Failed to get transaction history:', error);
      return {
        transactions: [],
        totalCount: 0,
        summary: {
          totalTransactions: 0,
          totalCreditsIn: 0,
          totalCreditsOut: 0,
          netBalance: 0,
          transactionsByType: {},
          recentTransactions: []
        }
      };
    }
  }

  /**
   * Generate transaction summary for given filter
   */
  async generateTransactionSummary(filter: TransactionFilter = {}): Promise<TransactionSummary> {
    try {
      let query = this.supabase
        .from('credit_transactions')
        .select('amount, transaction_type, created_at');

      // Apply same filters as main query
      if (filter.userId) query = query.eq('user_id', filter.userId);
      if (filter.creatorId) query = query.eq('creator_id', filter.creatorId);
      if (filter.transactionType) query = query.eq('transaction_type', filter.transactionType);
      if (filter.status) query = query.eq('status', filter.status);
      if (filter.dateFrom) query = query.gte('created_at', filter.dateFrom.toISOString());
      if (filter.dateTo) query = query.lte('created_at', filter.dateTo.toISOString());

      const { data: transactions, error } = await query;

      if (error) throw error;

      if (!transactions || transactions.length === 0) {
        return {
          totalTransactions: 0,
          totalCreditsIn: 0,
          totalCreditsOut: 0,
          netBalance: 0,
          transactionsByType: {},
          recentTransactions: []
        };
      }

      // Calculate summary metrics
      const totalTransactions = transactions.length;
      const totalCreditsIn = transactions
        .filter(t => (t.amount || 0) > 0)
        .reduce((sum, t) => sum + (t.amount || 0), 0);
      const totalCreditsOut = Math.abs(transactions
        .filter(t => (t.amount || 0) < 0)
        .reduce((sum, t) => sum + (t.amount || 0), 0));
      const netBalance = totalCreditsIn - totalCreditsOut;

      // Group by transaction type
      const transactionsByType = transactions.reduce((acc, t) => {
        const type = t.transaction_type || 'unknown';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Get recent transactions
      const recentTransactions = transactions
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      return {
        totalTransactions,
        totalCreditsIn,
        totalCreditsOut,
        netBalance,
        transactionsByType,
        recentTransactions
      };

    } catch (error) {
      console.error('Failed to generate transaction summary:', error);
      return {
        totalTransactions: 0,
        totalCreditsIn: 0,
        totalCreditsOut: 0,
        netBalance: 0,
        transactionsByType: {},
        recentTransactions: []
      };
    }
  }

  /**
   * Get transaction analytics for dashboard
   */
  async getTransactionAnalytics(days: number = 30): Promise<TransactionAnalytics> {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      // Daily volume analysis
      const { data: dailyData } = await this.supabase
        .from('credit_transactions')
        .select('amount, created_at')
        .gte('created_at', startDate.toISOString())
        .eq('status', 'completed');

      const dailyVolume = this.aggregateDailyVolume(dailyData || []);

      // Transaction type analysis
      const { data: typeData } = await this.supabase
        .from('credit_transactions')
        .select('transaction_type, amount')
        .gte('created_at', startDate.toISOString())
        .eq('status', 'completed');

      const topTransactionTypes = this.aggregateTransactionTypes(typeData || []);

      // Top creators analysis
      const { data: creatorData } = await this.supabase
        .from('credit_transactions')
        .select('creator_id, amount')
        .gte('created_at', startDate.toISOString())
        .eq('transaction_type', 'royalty')
        .eq('status', 'completed');

      const topCreators = this.aggregateTopCreators(creatorData || []);

      // Platform revenue analysis
      const platformRevenue = await this.calculatePlatformRevenue();

      return {
        dailyVolume,
        topTransactionTypes,
        topCreators,
        platformRevenue
      };

    } catch (error) {
      console.error('Failed to get transaction analytics:', error);
      return {
        dailyVolume: [],
        topTransactionTypes: [],
        topCreators: [],
        platformRevenue: { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 }
      };
    }
  }

  /**
   * Audit specific transaction
   */
  async auditTransaction(transactionId: string): Promise<{
    transaction: CreditTransaction | null;
    relatedTransactions: CreditTransaction[];
    auditTrail: Array<{
      timestamp: Date;
      action: string;
      details: string;
      userId?: string;
    }>;
  }> {
    try {
      // Get main transaction
      const { data: transaction, error } = await this.supabase
        .from('credit_transactions')
        .select(`
          *,
          user_profile:user_id(name, email),
          creator_profile:creator_id(creator_name),
          transition:transition_id(name, category)
        `)
        .eq('id', transactionId)
        .single();

      if (error) throw error;

      // Get related transactions (same purchase_id or reference_id)
      const { data: relatedTransactions } = await this.supabase
        .from('credit_transactions')
        .select('*')
        .or(`purchase_id.eq.${transaction?.purchase_id},reference_id.eq.${transaction?.reference_id}`)
        .neq('id', transactionId);

      // Generate audit trail
      const auditTrail = [
        {
          timestamp: new Date(transaction?.created_at || ''),
          action: 'Transaction Created',
          details: `${transaction?.transaction_type} transaction for ${transaction?.amount} credits`,
          userId: transaction?.user_id || transaction?.creator_id
        },
        ...(transaction?.updated_at !== transaction?.created_at ? [{
          timestamp: new Date(transaction?.updated_at || ''),
          action: 'Transaction Updated',
          details: `Status changed to ${transaction?.status}`,
          userId: transaction?.user_id || transaction?.creator_id
        }] : [])
      ];

      return {
        transaction,
        relatedTransactions: relatedTransactions || [],
        auditTrail
      };

    } catch (error) {
      console.error('Failed to audit transaction:', error);
      return {
        transaction: null,
        relatedTransactions: [],
        auditTrail: []
      };
    }
  }

  /**
   * Export transaction data for accounting
   */
  async exportTransactions(
    filter: TransactionFilter,
    format: 'csv' | 'json' = 'csv'
  ): Promise<string> {
    try {
      const { transactions } = await this.getTransactionHistory(filter, 10000, 0);

      if (format === 'json') {
        return JSON.stringify(transactions, null, 2);
      }

      // CSV format
      const headers = [
        'ID', 'Date', 'User ID', 'Creator ID', 'Type', 'Amount', 'Status', 
        'Description', 'Transition ID', 'Reference ID'
      ];

      const csvRows = transactions.map(t => [
        t.id,
        t.created_at,
        t.user_id || '',
        t.creator_id || '',
        t.transaction_type,
        t.amount,
        t.status,
        t.description || '',
        t.transition_id || '',
        t.reference_id || ''
      ]);

      return [headers, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

    } catch (error) {
      console.error('Failed to export transactions:', error);
      return '';
    }
  }

  /**
   * Private helper methods
   */
  private aggregateDailyVolume(transactions: any[]): Array<{ date: string; volume: number; count: number }> {
    const dailyMap = new Map<string, { volume: number; count: number }>();

    transactions.forEach(t => {
      const date = new Date(t.created_at).toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { volume: 0, count: 0 };
      dailyMap.set(date, {
        volume: existing.volume + Math.abs(t.amount || 0),
        count: existing.count + 1
      });
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private aggregateTransactionTypes(transactions: any[]): Array<{ type: string; volume: number; count: number }> {
    const typeMap = new Map<string, { volume: number; count: number }>();

    transactions.forEach(t => {
      const type = t.transaction_type || 'unknown';
      const existing = typeMap.get(type) || { volume: 0, count: 0 };
      typeMap.set(type, {
        volume: existing.volume + Math.abs(t.amount || 0),
        count: existing.count + 1
      });
    });

    return Array.from(typeMap.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.volume - a.volume);
  }

  private aggregateTopCreators(transactions: any[]): Array<{ creatorId: string; earnings: number; transactions: number }> {
    const creatorMap = new Map<string, { earnings: number; transactions: number }>();

    transactions.forEach(t => {
      if (!t.creator_id) return;
      const existing = creatorMap.get(t.creator_id) || { earnings: 0, transactions: 0 };
      creatorMap.set(t.creator_id, {
        earnings: existing.earnings + (t.amount || 0),
        transactions: existing.transactions + 1
      });
    });

    return Array.from(creatorMap.entries())
      .map(([creatorId, data]) => ({ creatorId, ...data }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10);
  }

  private async calculatePlatformRevenue(): Promise<{
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  }> {
    try {
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      // Get platform earnings
      const { data: totalData } = await this.supabase
        .from('platform_earnings')
        .select('amount');

      const { data: thisMonthData } = await this.supabase
        .from('platform_earnings')
        .select('amount')
        .gte('created_at', thisMonthStart.toISOString());

      const { data: lastMonthData } = await this.supabase
        .from('platform_earnings')
        .select('amount')
        .gte('created_at', lastMonthStart.toISOString())
        .lte('created_at', lastMonthEnd.toISOString());

      const total = totalData?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const thisMonth = thisMonthData?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const lastMonth = lastMonthData?.reduce((sum, r) => sum + (r.amount || 0), 0) || 0;
      const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

      return { total, thisMonth, lastMonth, growth };

    } catch (error) {
      console.error('Failed to calculate platform revenue:', error);
      return { total: 0, thisMonth: 0, lastMonth: 0, growth: 0 };
    }
  }
}

// Export singleton instance
export const transactionHistoryService = new TransactionHistoryService();
