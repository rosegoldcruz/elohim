/**
 * AEON Transition Analyzer - Advanced analytics for viral transition optimization
 * Processes transition performance data and provides insights for viral score optimization
 */

import { createClient } from '@/lib/supabase/client';
import type { Database } from '@/types/supabase';

type TransitionAnalytics = Database['public']['Tables']['transition_analytics']['Row'];

export interface TransitionInsight {
  transitionId: string;
  performanceScore: number;
  viralPotential: number;
  retentionScore: number;
  engagementScore: number;
  usageFrequency: number;
  trendDirection: 'rising' | 'falling' | 'stable';
  recommendation: 'promote' | 'optimize' | 'deprecate' | 'monitor';
  confidenceLevel: number;
}

export interface ContentTypeAnalysis {
  contentType: string;
  topTransitions: string[];
  avgViralScore: number;
  totalUsage: number;
  successRate: number;
  recommendations: string[];
}

export interface PerformanceMetrics {
  totalTransitions: number;
  avgProcessingTime: number;
  gpuAccelerationRate: number;
  beatSyncUsage: number;
  viralScoreDistribution: { [score: string]: number };
  topPerformers: TransitionInsight[];
  underperformers: TransitionInsight[];
}

export class TransitionAnalyzer {
  private supabase = createClient();
  private readonly VIRAL_THRESHOLD = 7.0;
  private readonly CONFIDENCE_THRESHOLD = 0.6;
  private readonly TREND_WINDOW_DAYS = 14;

  constructor() {
    console.log('📊 TransitionAnalyzer initialized for viral optimization insights');
  }

  /**
   * Analyze all transitions and generate comprehensive insights
   */
  async analyzeAllTransitions(): Promise<TransitionInsight[]> {
    try {
      const analyticsData = await this.fetchAllAnalytics();
      const groupedData = this.groupByTransition(analyticsData);
      
      const insights: TransitionInsight[] = [];
      
      for (const [transitionId, records] of Object.entries(groupedData)) {
        const insight = await this.generateTransitionInsight(transitionId, records);
        insights.push(insight);
      }
      
      return insights.sort((a, b) => b.performanceScore - a.performanceScore);
    } catch (error) {
      console.error('Failed to analyze transitions:', error);
      throw error;
    }
  }

  /**
   * Analyze transitions by content type
   */
  async analyzeByContentType(contentType?: string): Promise<ContentTypeAnalysis[]> {
    try {
      const analyticsData = await this.fetchAllAnalytics();
      
      // Group by content type (would need to be added to analytics table)
      // For now, simulate content type analysis
      const contentTypes = ['high_energy', 'smooth_flow', 'dramatic', 'tech_gaming', 'lifestyle'];
      const analyses: ContentTypeAnalysis[] = [];
      
      for (const type of contentTypes) {
        if (contentType && type !== contentType) continue;
        
        const analysis = await this.analyzeContentTypePerformance(type, analyticsData);
        analyses.push(analysis);
      }
      
      return analyses;
    } catch (error) {
      console.error('Failed to analyze by content type:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive performance metrics
   */
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const analyticsData = await this.fetchAllAnalytics();
      const insights = await this.analyzeAllTransitions();
      
      const totalTransitions = new Set(analyticsData.map(r => r.transition_id)).size;
      const avgProcessingTime = this.calculateAverage(analyticsData, 'processing_time_ms');
      const gpuAccelerationRate = analyticsData.filter(r => r.gpu_accelerated).length / analyticsData.length;
      const beatSyncUsage = analyticsData.filter(r => r.beat_synced).length / analyticsData.length;
      
      const viralScoreDistribution = this.calculateViralScoreDistribution(analyticsData);
      const topPerformers = insights.slice(0, 5);
      const underperformers = insights.slice(-5).reverse();
      
      return {
        totalTransitions,
        avgProcessingTime,
        gpuAccelerationRate,
        beatSyncUsage,
        viralScoreDistribution,
        topPerformers,
        underperformers
      };
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      throw error;
    }
  }

  /**
   * Generate insights for a specific transition
   */
  private async generateTransitionInsight(
    transitionId: string,
    records: TransitionAnalytics[]
  ): Promise<TransitionInsight> {
    const performanceScore = this.calculatePerformanceScore(records);
    const viralPotential = this.calculateViralPotential(records);
    const retentionScore = this.calculateAverage(records, 'retention_impact');
    const engagementScore = this.calculateAverage(records, 'engagement_boost');
    const usageFrequency = records.length;
    const trendDirection = this.calculateTrendDirection(records);
    const recommendation = this.generateRecommendation(performanceScore, viralPotential, usageFrequency);
    const confidenceLevel = this.calculateConfidenceLevel(records);

    return {
      transitionId,
      performanceScore,
      viralPotential,
      retentionScore,
      engagementScore,
      usageFrequency,
      trendDirection,
      recommendation,
      confidenceLevel
    };
  }

  /**
   * Calculate overall performance score
   */
  private calculatePerformanceScore(records: TransitionAnalytics[]): number {
    const viralScore = this.calculateAverage(records, 'viral_score_impact');
    const retentionScore = this.calculateAverage(records, 'retention_impact');
    const engagementScore = this.calculateAverage(records, 'engagement_boost');
    const usageBonus = Math.min(records.length / 100, 1); // Usage frequency bonus
    
    return (viralScore * 0.4) + (retentionScore * 0.3) + (engagementScore * 0.2) + (usageBonus * 0.1);
  }

  /**
   * Calculate viral potential based on recent performance
   */
  private calculateViralPotential(records: TransitionAnalytics[]): number {
    const recentRecords = this.getRecentRecords(records, this.TREND_WINDOW_DAYS);
    if (recentRecords.length === 0) return 0;
    
    const recentViralScore = this.calculateAverage(recentRecords, 'viral_score_impact');
    const recentRetention = this.calculateAverage(recentRecords, 'retention_impact');
    const recentEngagement = this.calculateAverage(recentRecords, 'engagement_boost');
    const gpuUsage = recentRecords.filter(r => r.gpu_accelerated).length / recentRecords.length;
    const beatSyncUsage = recentRecords.filter(r => r.beat_synced).length / recentRecords.length;
    
    return (recentViralScore * 0.4) + 
           (recentRetention * 0.25) + 
           (recentEngagement * 0.25) + 
           (gpuUsage * 0.05) + 
           (beatSyncUsage * 0.05);
  }

  /**
   * Calculate trend direction
   */
  private calculateTrendDirection(records: TransitionAnalytics[]): 'rising' | 'falling' | 'stable' {
    if (records.length < 4) return 'stable';
    
    const sortedRecords = records.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
    
    const midpoint = Math.floor(records.length / 2);
    const firstHalf = sortedRecords.slice(0, midpoint);
    const secondHalf = sortedRecords.slice(midpoint);
    
    const firstHalfScore = this.calculateAverage(firstHalf, 'viral_score_impact');
    const secondHalfScore = this.calculateAverage(secondHalf, 'viral_score_impact');
    
    const difference = secondHalfScore - firstHalfScore;
    const threshold = 0.5;
    
    if (difference > threshold) return 'rising';
    if (difference < -threshold) return 'falling';
    return 'stable';
  }

  /**
   * Generate recommendation based on performance metrics
   */
  private generateRecommendation(
    performanceScore: number,
    viralPotential: number,
    usageFrequency: number
  ): 'promote' | 'optimize' | 'deprecate' | 'monitor' {
    if (performanceScore > 8 && viralPotential > 7) return 'promote';
    if (performanceScore < 3 && usageFrequency < 10) return 'deprecate';
    if (performanceScore > 5 && viralPotential < 5) return 'optimize';
    return 'monitor';
  }

  /**
   * Calculate confidence level based on data quality
   */
  private calculateConfidenceLevel(records: TransitionAnalytics[]): number {
    const dataVolume = Math.min(records.length / 50, 1); // Max confidence at 50+ records
    const timeSpan = this.calculateTimeSpan(records) / 30; // 30 days for max confidence
    const consistency = this.calculateDataConsistency(records);
    
    return (dataVolume * 0.4) + (Math.min(timeSpan, 1) * 0.3) + (consistency * 0.3);
  }

  /**
   * Analyze content type performance
   */
  private async analyzeContentTypePerformance(
    contentType: string,
    analyticsData: TransitionAnalytics[]
  ): Promise<ContentTypeAnalysis> {
    // Simulate content type filtering (would need actual content type data)
    const filteredData = analyticsData.filter((_, index) => index % 5 === ['high_energy', 'smooth_flow', 'dramatic', 'tech_gaming', 'lifestyle'].indexOf(contentType));
    
    const transitionGroups = this.groupByTransition(filteredData);
    const transitionScores = Object.entries(transitionGroups).map(([id, records]) => ({
      id,
      score: this.calculatePerformanceScore(records)
    }));
    
    const topTransitions = transitionScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(t => t.id);
    
    const avgViralScore = this.calculateAverage(filteredData, 'viral_score_impact');
    const totalUsage = filteredData.reduce((sum, r) => sum + r.usage_count, 0);
    const successRate = filteredData.filter(r => (r.viral_score_impact || 0) > this.VIRAL_THRESHOLD).length / filteredData.length;
    
    const recommendations = this.generateContentTypeRecommendations(contentType, transitionScores);
    
    return {
      contentType,
      topTransitions,
      avgViralScore,
      totalUsage,
      successRate,
      recommendations
    };
  }

  /**
   * Generate content type specific recommendations
   */
  private generateContentTypeRecommendations(
    contentType: string,
    transitionScores: Array<{ id: string; score: number }>
  ): string[] {
    const recommendations: string[] = [];
    const topPerformer = transitionScores[0];
    const avgScore = transitionScores.reduce((sum, t) => sum + t.score, 0) / transitionScores.length;
    
    if (topPerformer && topPerformer.score > 8) {
      recommendations.push(`Promote ${topPerformer.id} as signature transition for ${contentType} content`);
    }
    
    if (avgScore < 5) {
      recommendations.push(`Consider developing new transitions optimized for ${contentType} content`);
    }
    
    const lowPerformers = transitionScores.filter(t => t.score < 3);
    if (lowPerformers.length > 0) {
      recommendations.push(`Review underperforming transitions: ${lowPerformers.map(t => t.id).join(', ')}`);
    }
    
    return recommendations;
  }

  /**
   * Utility methods
   */
  private async fetchAllAnalytics(): Promise<TransitionAnalytics[]> {
    const { data, error } = await this.supabase
      .from('transition_analytics')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  private groupByTransition(records: TransitionAnalytics[]): Record<string, TransitionAnalytics[]> {
    return records.reduce((acc, record) => {
      const id = record.transition_id;
      if (!acc[id]) acc[id] = [];
      acc[id].push(record);
      return acc;
    }, {} as Record<string, TransitionAnalytics[]>);
  }

  private calculateAverage(records: TransitionAnalytics[], field: keyof TransitionAnalytics): number {
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, record) => acc + ((record[field] as number) || 0), 0);
    return sum / records.length;
  }

  private getRecentRecords(records: TransitionAnalytics[], days: number): TransitionAnalytics[] {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return records.filter(r => new Date(r.created_at) > cutoff);
  }

  private calculateTimeSpan(records: TransitionAnalytics[]): number {
    if (records.length < 2) return 0;
    const dates = records.map(r => new Date(r.created_at).getTime());
    return (Math.max(...dates) - Math.min(...dates)) / (1000 * 60 * 60 * 24);
  }

  private calculateDataConsistency(records: TransitionAnalytics[]): number {
    if (records.length < 2) return 0;
    const values = records.map(r => r.viral_score_impact || 0);
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.max(0, 1 - Math.sqrt(variance) / 10);
  }

  private calculateViralScoreDistribution(records: TransitionAnalytics[]): { [score: string]: number } {
    const distribution: { [score: string]: number } = {
      '0-2': 0, '2-4': 0, '4-6': 0, '6-8': 0, '8-10': 0
    };
    
    records.forEach(record => {
      const score = record.viral_score_impact || 0;
      if (score < 2) distribution['0-2']++;
      else if (score < 4) distribution['2-4']++;
      else if (score < 6) distribution['4-6']++;
      else if (score < 8) distribution['6-8']++;
      else distribution['8-10']++;
    });
    
    return distribution;
  }
}

// Export singleton instance
export const transitionAnalyzer = new TransitionAnalyzer();
