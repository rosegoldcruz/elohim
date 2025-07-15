/**
 * AEON Pipeline Optimizer - Integrates OptimizerAgent into the main video pipeline
 * Creates a continuous feedback loop for viral transition optimization
 */

import { optimizerAgent } from './OptimizerAgent';
import { transitionAnalyzer } from '../analytics/transition_analyzer';
import { transitionAnalytics } from '../supabase/transition-analytics';
import { createClient } from '@/lib/supabase/client';

export interface PipelineOptimizationConfig {
  enableAutoOptimization: boolean;
  optimizationInterval: number; // minutes
  minDataThreshold: number; // minimum analytics records before optimization
  confidenceThreshold: number; // minimum confidence for score updates
  enableABTesting: boolean;
}

export interface OptimizationReport {
  timestamp: Date;
  transitionsAnalyzed: number;
  scoresUpdated: number;
  topPerformers: string[];
  recommendations: string[];
  nextOptimization: Date;
}

export class PipelineOptimizer {
  private supabase = createClient();
  private optimizationTimer: NodeJS.Timeout | null = null;
  private isOptimizing = false;
  
  private config: PipelineOptimizationConfig = {
    enableAutoOptimization: true,
    optimizationInterval: 60, // 1 hour
    minDataThreshold: 10,
    confidenceThreshold: 0.6,
    enableABTesting: false
  };

  constructor(config?: Partial<PipelineOptimizationConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    console.log('🔄 PipelineOptimizer initialized with feedback loop');
    
    if (this.config.enableAutoOptimization) {
      this.startOptimizationLoop();
    }
  }

  /**
   * Start the continuous optimization loop
   */
  startOptimizationLoop(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
    }

    const intervalMs = this.config.optimizationInterval * 60 * 1000;
    
    this.optimizationTimer = setInterval(async () => {
      if (!this.isOptimizing) {
        await this.runOptimizationCycle();
      }
    }, intervalMs);

    console.log(`⏰ Optimization loop started (interval: ${this.config.optimizationInterval} minutes)`);
  }

  /**
   * Stop the optimization loop
   */
  stopOptimizationLoop(): void {
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
      this.optimizationTimer = null;
      console.log('⏹️ Optimization loop stopped');
    }
  }

  /**
   * Run a complete optimization cycle
   */
  async runOptimizationCycle(): Promise<OptimizationReport> {
    if (this.isOptimizing) {
      throw new Error('Optimization cycle already in progress');
    }

    this.isOptimizing = true;
    const startTime = new Date();

    try {
      console.log('🚀 Starting optimization cycle...');

      // Step 1: Check if we have enough data
      const dataCheck = await this.checkDataAvailability();
      if (!dataCheck.hasEnoughData) {
        console.log(`⏳ Insufficient data for optimization (${dataCheck.recordCount} < ${this.config.minDataThreshold})`);
        return this.createSkippedReport(startTime, dataCheck.recordCount);
      }

      // Step 2: Run transition analysis
      const insights = await transitionAnalyzer.analyzeAllTransitions();
      console.log(`📊 Analyzed ${insights.length} transitions`);

      // Step 3: Update viral scores using OptimizerAgent
      const optimizationResult = await optimizerAgent.optimizeTransitionScores();
      console.log(`📈 Updated ${optimizationResult.transitionsUpdated} transition scores`);

      // Step 4: Update performance summary table
      await this.updatePerformanceSummary(insights);

      // Step 5: Generate recommendations
      const recommendations = await this.generatePipelineRecommendations(insights);

      // Step 6: Log optimization results
      await this.logOptimizationResults(optimizationResult, insights);

      const report: OptimizationReport = {
        timestamp: startTime,
        transitionsAnalyzed: insights.length,
        scoresUpdated: optimizationResult.transitionsUpdated,
        topPerformers: optimizationResult.topPerformers,
        recommendations,
        nextOptimization: new Date(Date.now() + this.config.optimizationInterval * 60 * 1000)
      };

      console.log('✅ Optimization cycle completed successfully');
      return report;

    } catch (error) {
      console.error('❌ Optimization cycle failed:', error);
      throw error;
    } finally {
      this.isOptimizing = false;
    }
  }

  /**
   * Manual optimization trigger (for testing or immediate updates)
   */
  async triggerOptimization(): Promise<OptimizationReport> {
    console.log('🔧 Manual optimization triggered');
    return this.runOptimizationCycle();
  }

  /**
   * Check if we have enough data for meaningful optimization
   */
  private async checkDataAvailability(): Promise<{
    hasEnoughData: boolean;
    recordCount: number;
    oldestRecord: Date | null;
  }> {
    const { data, error } = await this.supabase
      .from('transition_analytics')
      .select('id, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Failed to check data availability: ${error.message}`);
    }

    const recordCount = data?.length || 0;
    const hasEnoughData = recordCount >= this.config.minDataThreshold;
    const oldestRecord = data && data.length > 0 ? new Date(data[0].created_at) : null;

    return { hasEnoughData, recordCount, oldestRecord };
  }

  /**
   * Update the performance summary table with latest insights
   */
  private async updatePerformanceSummary(insights: any[]): Promise<void> {
    console.log('📝 Updating performance summary table...');

    for (const insight of insights) {
      const summaryData = {
        transition_id: insight.transitionId,
        content_type: 'general', // Would be determined from analytics
        total_usage: insight.usageFrequency,
        avg_viral_score: insight.viralPotential,
        avg_retention: insight.retentionScore,
        avg_engagement: insight.engagementScore,
        success_rate: insight.viralPotential > 7 ? 0.8 : 0.4, // Estimated
        trend_direction: insight.trendDirection,
        trend_strength: insight.confidenceLevel,
        recommendation: insight.recommendation,
        confidence_score: insight.confidenceLevel,
        last_calculated: new Date().toISOString()
      };

      // Upsert performance summary
      const { error } = await this.supabase
        .from('transition_performance_summary')
        .upsert(summaryData, { 
          onConflict: 'transition_id,content_type',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error(`Failed to update summary for ${insight.transitionId}:`, error);
      }
    }

    console.log(`✅ Updated performance summary for ${insights.length} transitions`);
  }

  /**
   * Generate pipeline-level recommendations
   */
  private async generatePipelineRecommendations(insights: any[]): Promise<string[]> {
    const recommendations: string[] = [];

    // Analyze overall performance
    const avgPerformance = insights.reduce((sum, i) => sum + i.performanceScore, 0) / insights.length;
    const highPerformers = insights.filter(i => i.performanceScore > 8);
    const lowPerformers = insights.filter(i => i.performanceScore < 3);
    const risingTrends = insights.filter(i => i.trendDirection === 'rising');

    if (avgPerformance < 5) {
      recommendations.push('Overall transition performance is below average - consider reviewing transition library');
    }

    if (highPerformers.length > 0) {
      recommendations.push(`Promote high-performing transitions: ${highPerformers.slice(0, 3).map(h => h.transitionId).join(', ')}`);
    }

    if (lowPerformers.length > insights.length * 0.3) {
      recommendations.push('High number of underperforming transitions - consider deprecating or optimizing');
    }

    if (risingTrends.length > 0) {
      recommendations.push(`Monitor rising trends: ${risingTrends.slice(0, 3).map(r => r.transitionId).join(', ')}`);
    }

    // GPU acceleration recommendations
    const performanceMetrics = await transitionAnalyzer.getPerformanceMetrics();
    if (performanceMetrics.gpuAccelerationRate < 0.5) {
      recommendations.push('Consider increasing GPU acceleration usage for better performance');
    }

    if (performanceMetrics.beatSyncUsage < 0.3) {
      recommendations.push('Increase beat-synchronized transitions for higher viral potential');
    }

    return recommendations;
  }

  /**
   * Log optimization results for monitoring
   */
  private async logOptimizationResults(optimizationResult: any, insights: any[]): Promise<void> {
    const logData = {
      optimization_timestamp: new Date().toISOString(),
      transitions_analyzed: insights.length,
      scores_updated: optimizationResult.transitionsUpdated,
      avg_score_change: optimizationResult.avgScoreChange,
      top_performers: optimizationResult.topPerformers,
      recommendations: optimizationResult.recommendations,
      system_performance: await this.getSystemPerformanceMetrics()
    };

    // In production, this would log to a monitoring system
    console.log('📊 Optimization Results:', JSON.stringify(logData, null, 2));
  }

  /**
   * Create a report for skipped optimization cycles
   */
  private createSkippedReport(timestamp: Date, recordCount: number): OptimizationReport {
    return {
      timestamp,
      transitionsAnalyzed: 0,
      scoresUpdated: 0,
      topPerformers: [],
      recommendations: [`Insufficient data for optimization (${recordCount} records)`],
      nextOptimization: new Date(Date.now() + this.config.optimizationInterval * 60 * 1000)
    };
  }

  /**
   * Get system performance metrics
   */
  private async getSystemPerformanceMetrics(): Promise<{
    totalTransitions: number;
    avgProcessingTime: number;
    gpuUsageRate: number;
    errorRate: number;
  }> {
    try {
      const metrics = await transitionAnalyzer.getPerformanceMetrics();
      return {
        totalTransitions: metrics.totalTransitions,
        avgProcessingTime: metrics.avgProcessingTime,
        gpuUsageRate: metrics.gpuAccelerationRate,
        errorRate: 0.05 // Would be calculated from actual error logs
      };
    } catch (error) {
      console.error('Failed to get system metrics:', error);
      return {
        totalTransitions: 0,
        avgProcessingTime: 0,
        gpuUsageRate: 0,
        errorRate: 0
      };
    }
  }

  /**
   * Get optimization status
   */
  getStatus(): {
    isRunning: boolean;
    isOptimizing: boolean;
    config: PipelineOptimizationConfig;
    nextOptimization: Date | null;
  } {
    return {
      isRunning: this.optimizationTimer !== null,
      isOptimizing: this.isOptimizing,
      config: this.config,
      nextOptimization: this.optimizationTimer 
        ? new Date(Date.now() + this.config.optimizationInterval * 60 * 1000)
        : null
    };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PipelineOptimizationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    if (this.config.enableAutoOptimization && !this.optimizationTimer) {
      this.startOptimizationLoop();
    } else if (!this.config.enableAutoOptimization && this.optimizationTimer) {
      this.stopOptimizationLoop();
    }
    
    console.log('⚙️ Pipeline optimizer configuration updated');
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.stopOptimizationLoop();
    console.log('🧹 Pipeline optimizer destroyed');
  }
}

// Export singleton instance
export const pipelineOptimizer = new PipelineOptimizer();

// Hook for integration with main pipeline
export async function initializePipelineOptimization(): Promise<void> {
  console.log('🔗 Initializing pipeline optimization feedback loop...');
  
  // Start the optimization loop
  pipelineOptimizer.startOptimizationLoop();
  
  // Run initial optimization if enough data exists
  try {
    const report = await pipelineOptimizer.triggerOptimization();
    console.log('✅ Initial optimization completed:', report);
  } catch (error) {
    console.log('⏳ Initial optimization skipped (insufficient data)');
  }
}

// Utility function for manual testing
export async function runManualOptimization(): Promise<OptimizationReport> {
  return pipelineOptimizer.triggerOptimization();
}
