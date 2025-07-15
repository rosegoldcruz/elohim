/**
 * AEON OptimizerAgent - Viral Transition Score Optimization
 * Analyzes transition performance data and updates viral scores for continuous improvement
 */

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type TransitionAnalytics = Database['public']['Tables']['transition_analytics']['Row'];
type Transition = Database['public']['Tables']['transitions']['Row'];

export interface TransitionPerformanceData {
  transitionId: string;
  totalUsage: number;
  avgRetentionImpact: number;
  avgEngagementBoost: number;
  avgViralScoreImpact: number;
  recentPerformance: number;
  trendDirection: 'up' | 'down' | 'stable';
  confidenceScore: number;
}

export interface OptimizationResult {
  transitionsUpdated: number;
  avgScoreChange: number;
  topPerformers: string[];
  underperformers: string[];
  recommendations: string[];
}

export class OptimizerAgent {
  private supabase = createClient();
  private readonly SCORE_DECAY_FACTOR = 0.95; // Decay old performance data
  private readonly MIN_USAGE_THRESHOLD = 5; // Minimum usage for reliable scoring
  private readonly CONFIDENCE_THRESHOLD = 0.7; // Minimum confidence for score updates

  constructor() {
    console.log('🎯 OptimizerAgent initialized for viral transition optimization');
  }

  /**
   * Main optimization function - analyzes all transition data and updates scores
   */
  async optimizeTransitionScores(): Promise<OptimizationResult> {
    console.log('🚀 Starting transition score optimization...');
    
    try {
      // Fetch all transition analytics data
      const analyticsData = await this.fetchTransitionAnalytics();
      
      // Group and analyze by transition
      const performanceData = await this.analyzeTransitionPerformance(analyticsData);
      
      // Update viral scores in database
      const updateResults = await this.updateViralScores(performanceData);
      
      // Generate optimization insights
      const result = await this.generateOptimizationReport(performanceData, updateResults);
      
      console.log(`✅ Optimization complete: ${result.transitionsUpdated} transitions updated`);
      return result;
      
    } catch (error) {
      console.error('❌ Optimization failed:', error);
      throw error;
    }
  }

  /**
   * Fetch all transition analytics data from Supabase
   */
  private async fetchTransitionAnalytics(): Promise<TransitionAnalytics[]> {
    const { data, error } = await this.supabase
      .from('transition_analytics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch analytics: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Analyze transition performance and calculate new viral scores
   */
  private async analyzeTransitionPerformance(
    analyticsData: TransitionAnalytics[]
  ): Promise<TransitionPerformanceData[]> {
    const grouped = this.groupByTransition(analyticsData);
    const performanceData: TransitionPerformanceData[] = [];

    for (const [transitionId, records] of Object.entries(grouped)) {
      const performance = this.calculateTransitionPerformance(transitionId, records);
      performanceData.push(performance);
    }

    return performanceData.filter(p => p.totalUsage >= this.MIN_USAGE_THRESHOLD);
  }

  /**
   * Group analytics records by transition ID
   */
  private groupByTransition(records: TransitionAnalytics[]): Record<string, TransitionAnalytics[]> {
    return records.reduce((acc, record) => {
      const transitionId = record.transition_id;
      if (!acc[transitionId]) {
        acc[transitionId] = [];
      }
      acc[transitionId].push(record);
      return acc;
    }, {} as Record<string, TransitionAnalytics[]>);
  }

  /**
   * Calculate comprehensive performance metrics for a transition
   */
  private calculateTransitionPerformance(
    transitionId: string,
    records: TransitionAnalytics[]
  ): TransitionPerformanceData {
    const totalUsage = records.reduce((sum, r) => sum + r.usage_count, 0);
    const avgRetentionImpact = this.calculateWeightedAverage(records, 'retention_impact');
    const avgEngagementBoost = this.calculateWeightedAverage(records, 'engagement_boost');
    const avgViralScoreImpact = this.calculateWeightedAverage(records, 'viral_score_impact');
    
    // Calculate recent performance (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRecords = records.filter(r => new Date(r.created_at) > thirtyDaysAgo);
    const recentPerformance = recentRecords.length > 0 
      ? this.calculateWeightedAverage(recentRecords, 'viral_score_impact')
      : avgViralScoreImpact;

    // Determine trend direction
    const trendDirection = this.calculateTrendDirection(records);
    
    // Calculate confidence score based on usage volume and consistency
    const confidenceScore = this.calculateConfidenceScore(records);

    return {
      transitionId,
      totalUsage,
      avgRetentionImpact,
      avgEngagementBoost,
      avgViralScoreImpact,
      recentPerformance,
      trendDirection,
      confidenceScore
    };
  }

  /**
   * Calculate weighted average with time decay
   */
  private calculateWeightedAverage(
    records: TransitionAnalytics[],
    field: keyof TransitionAnalytics
  ): number {
    if (records.length === 0) return 0;

    const now = Date.now();
    let weightedSum = 0;
    let totalWeight = 0;

    records.forEach(record => {
      const value = (record[field] as number) || 0;
      const age = now - new Date(record.created_at).getTime();
      const daysSinceCreation = age / (1000 * 60 * 60 * 24);
      const weight = Math.pow(this.SCORE_DECAY_FACTOR, daysSinceCreation);
      
      weightedSum += value * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? weightedSum / totalWeight : 0;
  }

  /**
   * Calculate trend direction based on recent vs historical performance
   */
  private calculateTrendDirection(records: TransitionAnalytics[]): 'up' | 'down' | 'stable' {
    if (records.length < 4) return 'stable';

    const sortedRecords = records.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );

    const firstHalf = sortedRecords.slice(0, Math.floor(records.length / 2));
    const secondHalf = sortedRecords.slice(Math.floor(records.length / 2));

    const firstHalfAvg = this.calculateSimpleAverage(firstHalf, 'viral_score_impact');
    const secondHalfAvg = this.calculateSimpleAverage(secondHalf, 'viral_score_impact');

    const difference = secondHalfAvg - firstHalfAvg;
    const threshold = 0.5; // Minimum difference to consider significant

    if (difference > threshold) return 'up';
    if (difference < -threshold) return 'down';
    return 'stable';
  }

  /**
   * Calculate simple average for a field
   */
  private calculateSimpleAverage(
    records: TransitionAnalytics[],
    field: keyof TransitionAnalytics
  ): number {
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, record) => acc + ((record[field] as number) || 0), 0);
    return sum / records.length;
  }

  /**
   * Calculate confidence score based on data quality and volume
   */
  private calculateConfidenceScore(records: TransitionAnalytics[]): number {
    const usageVolume = records.length;
    const timeSpan = this.calculateTimeSpan(records);
    const dataConsistency = this.calculateDataConsistency(records);

    // Normalize factors (0-1 scale)
    const volumeScore = Math.min(usageVolume / 50, 1); // Max confidence at 50+ uses
    const timeScore = Math.min(timeSpan / 30, 1); // Max confidence with 30+ days of data
    const consistencyScore = dataConsistency;

    return (volumeScore * 0.4) + (timeScore * 0.3) + (consistencyScore * 0.3);
  }

  /**
   * Calculate time span of data in days
   */
  private calculateTimeSpan(records: TransitionAnalytics[]): number {
    if (records.length < 2) return 0;

    const dates = records.map(r => new Date(r.created_at).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);

    return (maxDate - minDate) / (1000 * 60 * 60 * 24);
  }

  /**
   * Calculate data consistency (lower variance = higher consistency)
   */
  private calculateDataConsistency(records: TransitionAnalytics[]): number {
    if (records.length < 2) return 0;

    const values = records.map(r => r.viral_score_impact || 0);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const standardDeviation = Math.sqrt(variance);

    // Convert to consistency score (0-1, where 1 is most consistent)
    return Math.max(0, 1 - (standardDeviation / 10)); // Assuming max std dev of 10
  }

  /**
   * Update viral scores in the transitions table
   */
  private async updateViralScores(
    performanceData: TransitionPerformanceData[]
  ): Promise<{ updated: number; skipped: number }> {
    let updated = 0;
    let skipped = 0;

    for (const performance of performanceData) {
      if (performance.confidenceScore < this.CONFIDENCE_THRESHOLD) {
        skipped++;
        continue;
      }

      const newViralScore = this.calculateNewViralScore(performance);
      
      try {
        const { error } = await this.supabase
          .from('transitions')
          .update({ 
            viral_score: newViralScore,
            updated_at: new Date().toISOString()
          })
          .eq('id', performance.transitionId);

        if (error) {
          console.error(`Failed to update transition ${performance.transitionId}:`, error);
          skipped++;
        } else {
          updated++;
          console.log(`📈 Updated ${performance.transitionId}: viral_score = ${newViralScore.toFixed(2)}`);
        }
      } catch (error) {
        console.error(`Error updating transition ${performance.transitionId}:`, error);
        skipped++;
      }
    }

    return { updated, skipped };
  }

  /**
   * Calculate new viral score based on performance data
   */
  private calculateNewViralScore(performance: TransitionPerformanceData): number {
    const {
      avgRetentionImpact,
      avgEngagementBoost,
      avgViralScoreImpact,
      recentPerformance,
      trendDirection,
      totalUsage
    } = performance;

    // Base score from performance metrics
    let baseScore = (avgRetentionImpact * 0.4) + 
                   (avgEngagementBoost * 0.3) + 
                   (avgViralScoreImpact * 0.3);

    // Apply recent performance weighting
    const recentWeight = 0.3;
    baseScore = (baseScore * (1 - recentWeight)) + (recentPerformance * recentWeight);

    // Apply trend adjustment
    const trendMultiplier = trendDirection === 'up' ? 1.1 : 
                           trendDirection === 'down' ? 0.9 : 1.0;
    baseScore *= trendMultiplier;

    // Apply usage volume bonus (popular transitions get slight boost)
    const usageBonus = Math.min(totalUsage / 1000, 0.5); // Max 0.5 bonus
    baseScore += usageBonus;

    // Normalize to 0-10 scale
    return Math.max(0, Math.min(10, baseScore));
  }

  /**
   * Generate comprehensive optimization report
   */
  private async generateOptimizationReport(
    performanceData: TransitionPerformanceData[],
    updateResults: { updated: number; skipped: number }
  ): Promise<OptimizationResult> {
    const sortedByScore = performanceData.sort((a, b) => b.avgViralScoreImpact - a.avgViralScoreImpact);
    
    const topPerformers = sortedByScore.slice(0, 5).map(p => p.transitionId);
    const underperformers = sortedByScore.slice(-5).map(p => p.transitionId);
    
    const avgScoreChange = performanceData.reduce((sum, p) => 
      sum + this.calculateNewViralScore(p), 0
    ) / performanceData.length;

    const recommendations = this.generateRecommendations(performanceData);

    return {
      transitionsUpdated: updateResults.updated,
      avgScoreChange,
      topPerformers,
      underperformers,
      recommendations
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(performanceData: TransitionPerformanceData[]): string[] {
    const recommendations: string[] = [];

    const highPerformers = performanceData.filter(p => p.avgViralScoreImpact > 7);
    const lowPerformers = performanceData.filter(p => p.avgViralScoreImpact < 3);
    const trendingUp = performanceData.filter(p => p.trendDirection === 'up');

    if (highPerformers.length > 0) {
      recommendations.push(`Promote high-performing transitions: ${highPerformers.slice(0, 3).map(p => p.transitionId).join(', ')}`);
    }

    if (lowPerformers.length > 0) {
      recommendations.push(`Consider deprecating low-performing transitions: ${lowPerformers.slice(0, 3).map(p => p.transitionId).join(', ')}`);
    }

    if (trendingUp.length > 0) {
      recommendations.push(`Monitor trending transitions: ${trendingUp.slice(0, 3).map(p => p.transitionId).join(', ')}`);
    }

    return recommendations;
  }

  /**
   * Get current transition rankings
   */
  async getTransitionRankings(limit: number = 10): Promise<Array<{
    transitionId: string;
    viralScore: number;
    rank: number;
  }>> {
    const { data, error } = await this.supabase
      .from('transitions')
      .select('id, viral_score')
      .order('viral_score', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch rankings: ${error.message}`);
    }

    return (data || []).map((transition, index) => ({
      transitionId: transition.id,
      viralScore: transition.viral_score || 0,
      rank: index + 1
    }));
  }

  /**
   * Schedule automatic optimization (would be called by cron job)
   */
  async scheduleOptimization(): Promise<void> {
    try {
      console.log('⏰ Running scheduled transition optimization...');
      await this.optimizeTransitionScores();
      console.log('✅ Scheduled optimization completed');
    } catch (error) {
      console.error('❌ Scheduled optimization failed:', error);
    }
  }
}

// Export singleton instance
export const optimizerAgent = new OptimizerAgent();
