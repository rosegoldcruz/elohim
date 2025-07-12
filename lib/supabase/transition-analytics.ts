/**
 * AEON Supabase Transition Analytics
 * Functions for tracking transition usage, viral score impact, and performance metrics
 */

import { createClient } from './client';
import type { Database } from '@/types/supabase';

type TransitionAnalytics = Database['public']['Tables']['transition_analytics']['Row'];
type TransitionAnalyticsInsert = Database['public']['Tables']['transition_analytics']['Insert'];

export interface TransitionUsageMetrics {
  transitionId: string;
  totalUsage: number;
  avgViralScoreImpact: number;
  avgRetentionImpact: number;
  avgEngagementBoost: number;
  avgProcessingTime: number;
  gpuUsageRate: number;
  beatSyncRate: number;
  lastUsed: Date;
}

export interface ViralScoreAnalysis {
  transitionId: string;
  contentType: string;
  avgViralScore: number;
  successRate: number;
  recommendationScore: number;
}

export class TransitionAnalyticsService {
  private supabase = createClient();

  /**
   * Track transition usage with viral score impact
   */
  async trackTransitionUsage(params: {
    transitionId: string;
    projectId: string;
    userId: string;
    videoId?: string;
    viralScoreImpact?: number;
    retentionImpact?: number;
    engagementBoost?: number;
    beatSynced?: boolean;
    syncAccuracy?: number;
    processingTimeMs?: number;
    gpuAccelerated?: boolean;
  }): Promise<void> {
    try {
      const analyticsData: TransitionAnalyticsInsert = {
        transition_id: params.transitionId,
        project_id: params.projectId,
        user_id: params.userId,
        video_id: params.videoId,
        usage_count: 1,
        viral_score_impact: params.viralScoreImpact || 0,
        retention_impact: params.retentionImpact || 0,
        engagement_boost: params.engagementBoost || 0,
        beat_synced: params.beatSynced || false,
        sync_accuracy: params.syncAccuracy,
        processing_time_ms: params.processingTimeMs,
        gpu_accelerated: params.gpuAccelerated || false,
      };

      const { error } = await this.supabase
        .from('transition_analytics')
        .insert(analyticsData);

      if (error) {
        throw error;
      }

      console.log(`📊 Tracked transition usage: ${params.transitionId}`);
    } catch (error) {
      console.error('Failed to track transition usage:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive transition usage metrics
   */
  async getTransitionMetrics(transitionId: string): Promise<TransitionUsageMetrics> {
    try {
      const { data, error } = await this.supabase
        .from('transition_analytics')
        .select('*')
        .eq('transition_id', transitionId);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          transitionId,
          totalUsage: 0,
          avgViralScoreImpact: 0,
          avgRetentionImpact: 0,
          avgEngagementBoost: 0,
          avgProcessingTime: 0,
          gpuUsageRate: 0,
          beatSyncRate: 0,
          lastUsed: new Date()
        };
      }

      const totalUsage = data.reduce((sum, record) => sum + record.usage_count, 0);
      const avgViralScoreImpact = data.reduce((sum, record) => sum + (record.viral_score_impact || 0), 0) / data.length;
      const avgRetentionImpact = data.reduce((sum, record) => sum + (record.retention_impact || 0), 0) / data.length;
      const avgEngagementBoost = data.reduce((sum, record) => sum + (record.engagement_boost || 0), 0) / data.length;
      const avgProcessingTime = data.reduce((sum, record) => sum + (record.processing_time_ms || 0), 0) / data.length;
      const gpuUsageRate = data.filter(record => record.gpu_accelerated).length / data.length;
      const beatSyncRate = data.filter(record => record.beat_synced).length / data.length;
      const lastUsed = new Date(Math.max(...data.map(record => new Date(record.created_at).getTime())));

      return {
        transitionId,
        totalUsage,
        avgViralScoreImpact,
        avgRetentionImpact,
        avgEngagementBoost,
        avgProcessingTime,
        gpuUsageRate,
        beatSyncRate,
        lastUsed
      };
    } catch (error) {
      console.error('Failed to get transition metrics:', error);
      throw error;
    }
  }

  /**
   * Get viral score analysis for transition recommendations
   */
  async getViralScoreAnalysis(contentType?: string): Promise<ViralScoreAnalysis[]> {
    try {
      let query = this.supabase
        .from('transition_analytics')
        .select(`
          transition_id,
          viral_score_impact,
          retention_impact,
          engagement_boost,
          transitions!inner(name, category, viral_score)
        `);

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return [];
      }

      // Group by transition_id and calculate metrics
      const transitionGroups = data.reduce((groups, record) => {
        const transitionId = record.transition_id;
        if (!groups[transitionId]) {
          groups[transitionId] = [];
        }
        groups[transitionId].push(record);
        return groups;
      }, {} as Record<string, any[]>);

      const analysis: ViralScoreAnalysis[] = Object.entries(transitionGroups).map(([transitionId, records]) => {
        const avgViralScore = records.reduce((sum, r) => sum + (r.viral_score_impact || 0), 0) / records.length;
        const successRate = records.filter(r => (r.viral_score_impact || 0) > 0).length / records.length;
        
        // Calculate recommendation score based on viral impact, retention, and engagement
        const avgRetention = records.reduce((sum, r) => sum + (r.retention_impact || 0), 0) / records.length;
        const avgEngagement = records.reduce((sum, r) => sum + (r.engagement_boost || 0), 0) / records.length;
        const recommendationScore = (avgViralScore * 0.4) + (avgRetention * 0.3) + (avgEngagement * 0.3);

        return {
          transitionId,
          contentType: contentType || 'general',
          avgViralScore,
          successRate,
          recommendationScore
        };
      });

      // Sort by recommendation score
      return analysis.sort((a, b) => b.recommendationScore - a.recommendationScore);
    } catch (error) {
      console.error('Failed to get viral score analysis:', error);
      throw error;
    }
  }

  /**
   * Get top performing transitions for a specific content type
   */
  async getTopTransitionsForContent(
    contentType: 'high_energy' | 'smooth_flow' | 'dramatic' | 'tech_gaming' | 'lifestyle',
    limit: number = 5
  ): Promise<string[]> {
    try {
      const analysis = await this.getViralScoreAnalysis(contentType);
      return analysis.slice(0, limit).map(a => a.transitionId);
    } catch (error) {
      console.error('Failed to get top transitions:', error);
      return ['crossfade', 'zoom_punch', 'slide']; // Fallback
    }
  }

  /**
   * Update viral score impact after video performance analysis
   */
  async updateViralScoreImpact(
    transitionId: string,
    projectId: string,
    actualViralScore: number,
    retentionRate: number,
    engagementRate: number
  ): Promise<void> {
    try {
      // Find the most recent analytics record for this transition and project
      const { data: existingRecord, error: selectError } = await this.supabase
        .from('transition_analytics')
        .select('id')
        .eq('transition_id', transitionId)
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (selectError || !existingRecord) {
        console.warn('No existing analytics record found to update');
        return;
      }

      // Update the record with actual performance metrics
      const { error: updateError } = await this.supabase
        .from('transition_analytics')
        .update({
          viral_score_impact: actualViralScore,
          retention_impact: retentionRate,
          engagement_boost: engagementRate,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id);

      if (updateError) {
        throw updateError;
      }

      console.log(`📈 Updated viral score impact for transition: ${transitionId}`);
    } catch (error) {
      console.error('Failed to update viral score impact:', error);
      throw error;
    }
  }

  /**
   * Get transition performance dashboard data
   */
  async getTransitionDashboard(userId: string): Promise<{
    totalTransitionsUsed: number;
    avgViralScoreImpact: number;
    topPerformingTransition: string;
    gpuAccelerationRate: number;
    beatSyncUsage: number;
    recentActivity: TransitionAnalytics[];
  }> {
    try {
      const { data, error } = await this.supabase
        .from('transition_analytics')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return {
          totalTransitionsUsed: 0,
          avgViralScoreImpact: 0,
          topPerformingTransition: 'crossfade',
          gpuAccelerationRate: 0,
          beatSyncUsage: 0,
          recentActivity: []
        };
      }

      const totalTransitionsUsed = data.reduce((sum, record) => sum + record.usage_count, 0);
      const avgViralScoreImpact = data.reduce((sum, record) => sum + (record.viral_score_impact || 0), 0) / data.length;
      const gpuAccelerationRate = data.filter(record => record.gpu_accelerated).length / data.length;
      const beatSyncUsage = data.filter(record => record.beat_synced).length / data.length;

      // Find top performing transition
      const transitionPerformance = data.reduce((acc, record) => {
        const transitionId = record.transition_id;
        if (!acc[transitionId]) {
          acc[transitionId] = { totalImpact: 0, count: 0 };
        }
        acc[transitionId].totalImpact += record.viral_score_impact || 0;
        acc[transitionId].count += 1;
        return acc;
      }, {} as Record<string, { totalImpact: number; count: number }>);

      const topPerformingTransition = Object.entries(transitionPerformance)
        .map(([id, perf]) => ({ id, avgImpact: perf.totalImpact / perf.count }))
        .sort((a, b) => b.avgImpact - a.avgImpact)[0]?.id || 'crossfade';

      return {
        totalTransitionsUsed,
        avgViralScoreImpact,
        topPerformingTransition,
        gpuAccelerationRate,
        beatSyncUsage,
        recentActivity: data.slice(0, 10)
      };
    } catch (error) {
      console.error('Failed to get transition dashboard:', error);
      throw error;
    }
  }

  /**
   * Batch update transition analytics for multiple videos
   */
  async batchUpdateAnalytics(updates: Array<{
    transitionId: string;
    projectId: string;
    viralScore: number;
    retentionRate: number;
    engagementRate: number;
  }>): Promise<void> {
    try {
      const promises = updates.map(update =>
        this.updateViralScoreImpact(
          update.transitionId,
          update.projectId,
          update.viralScore,
          update.retentionRate,
          update.engagementRate
        )
      );

      await Promise.all(promises);
      console.log(`📊 Batch updated ${updates.length} transition analytics`);
    } catch (error) {
      console.error('Failed to batch update analytics:', error);
      throw error;
    }
  }
}

// Singleton instance
export const transitionAnalytics = new TransitionAnalyticsService();

// Utility functions
export function calculateViralScoreImpact(
  beforeScore: number,
  afterScore: number,
  transitionIntensity: number = 1.0
): number {
  const baseImpact = afterScore - beforeScore;
  return baseImpact * transitionIntensity;
}

export function getTransitionRecommendation(
  contentType: 'high_energy' | 'smooth_flow' | 'dramatic' | 'tech_gaming' | 'lifestyle',
  targetViralScore: number,
  currentPerformance: number
): string {
  const recommendations = {
    high_energy: {
      high: ['zoom_punch', 'glitch_blast', 'viral_cut'],
      medium: ['slide', 'zoom_punch', 'crossfade'],
      low: ['crossfade', 'slide', 'fade']
    },
    smooth_flow: {
      high: ['slide', 'crossfade', 'film_burn'],
      medium: ['crossfade', 'fade', 'slide'],
      low: ['fade', 'crossfade', 'cut']
    },
    dramatic: {
      high: ['3d_flip', 'zoom_punch', 'cube_rotate'],
      medium: ['zoom_punch', 'slide', 'crossfade'],
      low: ['crossfade', 'fade', 'slide']
    },
    tech_gaming: {
      high: ['glitch_blast', 'viral_cut', 'digital_noise'],
      medium: ['glitch_blast', 'zoom_punch', 'slide'],
      low: ['crossfade', 'slide', 'fade']
    },
    lifestyle: {
      high: ['slide', 'crossfade', 'zoom_punch'],
      medium: ['crossfade', 'slide', 'fade'],
      low: ['fade', 'crossfade', 'cut']
    }
  };

  const performanceLevel = currentPerformance > 7 ? 'high' : currentPerformance > 4 ? 'medium' : 'low';
  const options = recommendations[contentType][performanceLevel];
  
  return options[0]; // Return top recommendation
}
