/**
 * AEON MarketplaceAgent - User-Created Transitions Marketplace
 * Handles creator uploads, validation, publishing, and royalty management
 */

import { createClient } from '@/lib/supabase/client';
import { transitionCore } from '../transitions/core';
import { optimizerAgent } from './OptimizerAgent';
import { creditEngine } from '../payments/CreditEngine';
import type { Database } from '@/types/supabase';

type Transition = Database['public']['Tables']['transitions']['Row'];
type TransitionInsert = Database['public']['Tables']['transitions']['Insert'];

export interface CreatorTransition {
  id?: string;
  name: string;
  description: string;
  glslCode: string;
  ffmpegParams?: Record<string, any>;
  creatorId: string;
  category: string;
  tags: string[];
  previewUrl?: string;
  thumbnailUrl?: string;
  price: number; // Credits required
  royaltyPercentage: number; // 0.0 to 1.0
  isPublic: boolean;
  isApproved: boolean;
  viralScore?: number;
}

export interface MarketplaceStats {
  totalTransitions: number;
  totalCreators: number;
  totalRevenue: number;
  topTransitions: CreatorTransition[];
  topCreators: Array<{
    creatorId: string;
    creatorName: string;
    transitionsCount: number;
    totalEarnings: number;
    avgViralScore: number;
  }>;
}

export interface PublishResult {
  success: boolean;
  transitionId?: string;
  error?: string;
  requiresApproval?: boolean;
}

export class MarketplaceAgent {
  private supabase = createClient();
  private readonly DEFAULT_ROYALTY = 0.15; // 15% to creator
  private readonly APPROVAL_THRESHOLD = 6.0; // Auto-approve if viral score > 6.0
  private readonly MAX_GLSL_SIZE = 10000; // Max GLSL code size in characters

  constructor() {
    console.log('🏪 MarketplaceAgent initialized for creator transitions');
  }

  /**
   * Publish a new creator transition to the marketplace
   */
  async publishTransition(transition: CreatorTransition): Promise<PublishResult> {
    try {
      console.log(`📤 Publishing transition: ${transition.name} by ${transition.creatorId}`);

      // Validate transition
      const validation = await this.validateTransition(transition);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error
        };
      }

      // Compile and test GLSL
      const compilationResult = await this.compileAndTestGLSL(transition.glslCode);
      if (!compilationResult.success) {
        return {
          success: false,
          error: `GLSL compilation failed: ${compilationResult.error}`
        };
      }

      // Generate preview
      const previewUrl = await this.generateTransitionPreview(transition);

      // Determine if auto-approval is possible
      const estimatedViralScore = await this.estimateViralScore(transition);
      const requiresApproval = estimatedViralScore < this.APPROVAL_THRESHOLD;

      // Insert into database
      const transitionData: TransitionInsert = {
        id: transition.id || `creator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: transition.name,
        category: transition.category as any,
        duration: 0.5, // Default duration
        intensity: 'moderate',
        viral_score: estimatedViralScore,
        preview_url: previewUrl,
        glsl_code: transition.glslCode,
        parameters: [],
        description: transition.description,
        tags: transition.tags,
        is_active: !requiresApproval, // Auto-activate if approved
        // Creator-specific fields (would be added to schema)
        creator_id: transition.creatorId,
        royalty_percentage: transition.royaltyPercentage || this.DEFAULT_ROYALTY,
        is_official: false,
        is_public: transition.isPublic,
        price_credits: transition.price,
        approval_status: requiresApproval ? 'pending' : 'approved',
        created_at: new Date().toISOString()
      };

      const { data, error } = await this.supabase
        .from('transitions')
        .insert(transitionData)
        .select()
        .single();

      if (error) {
        throw new Error(`Database insert failed: ${error.message}`);
      }

      // Track creator activity
      await this.trackCreatorActivity(transition.creatorId, 'publish', data.id);

      console.log(`✅ Transition published: ${data.id} (approval: ${!requiresApproval})`);

      return {
        success: true,
        transitionId: data.id,
        requiresApproval
      };

    } catch (error) {
      console.error('❌ Failed to publish transition:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get marketplace transitions with filtering and sorting
   */
  async getMarketplaceTransitions(filters: {
    category?: string;
    creatorId?: string;
    minViralScore?: number;
    maxPrice?: number;
    tags?: string[];
    sortBy?: 'viral_score' | 'created_at' | 'usage_count' | 'price';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
  } = {}): Promise<CreatorTransition[]> {
    try {
      let query = this.supabase
        .from('transitions')
        .select(`
          *,
          creator_profile:creator_id(name, avatar_url),
          transition_analytics(viral_score_impact, usage_count)
        `)
        .eq('is_public', true)
        .eq('approval_status', 'approved');

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.creatorId) {
        query = query.eq('creator_id', filters.creatorId);
      }

      if (filters.minViralScore) {
        query = query.gte('viral_score', filters.minViralScore);
      }

      if (filters.maxPrice) {
        query = query.lte('price_credits', filters.maxPrice);
      }

      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags);
      }

      // Apply sorting
      const sortBy = filters.sortBy || 'viral_score';
      const sortOrder = filters.sortOrder || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return (data || []).map(this.mapToCreatorTransition);

    } catch (error) {
      console.error('Failed to get marketplace transitions:', error);
      return [];
    }
  }

  /**
   * Purchase a creator transition with automated credit processing
   */
  async purchaseTransition(
    transitionId: string,
    userId: string
  ): Promise<{
    success: boolean;
    error?: string;
    creditsUsed?: number;
    royaltyPaid?: number;
    purchaseId?: string;
    userBalance?: number;
  }> {
    try {
      console.log(`🛒 Processing purchase: ${transitionId} by user ${userId}`);

      // Get transition details
      const { data: transition, error: fetchError } = await this.supabase
        .from('transitions')
        .select('*')
        .eq('id', transitionId)
        .eq('is_active', true)
        .eq('approval_status', 'approved')
        .single();

      if (fetchError || !transition) {
        return { success: false, error: 'Transition not found or not available' };
      }

      const price = transition.price_credits || 0;
      const royaltyRate = transition.royalty_percentage || this.DEFAULT_ROYALTY;

      // Free transitions
      if (price === 0) {
        await this.grantFreeTransitionAccess(userId, transitionId, transition.creator_id);
        return {
          success: true,
          creditsUsed: 0,
          royaltyPaid: 0
        };
      }

      // Process paid purchase through CreditEngine
      const purchaseResult = await creditEngine.processPurchase(
        userId,
        transition.creator_id,
        transitionId,
        price,
        royaltyRate
      );

      if (!purchaseResult.success) {
        return {
          success: false,
          error: purchaseResult.error
        };
      }

      // Grant access to transition
      await this.grantTransitionAccess(userId, transitionId, purchaseResult.purchaseId!);

      // Track marketplace metrics
      await this.trackMarketplaceMetrics(transitionId, transition.creator_id, price);

      console.log(`✅ Purchase completed: ${transitionId} for ${price} credits`);

      return {
        success: true,
        creditsUsed: price,
        royaltyPaid: purchaseResult.creatorEarnings,
        purchaseId: purchaseResult.purchaseId,
        userBalance: purchaseResult.userBalance
      };

    } catch (error) {
      console.error('Failed to purchase transition:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Purchase failed'
      };
    }
  }

  /**
   * Check if user has access to a transition
   */
  async checkTransitionAccess(userId: string, transitionId: string): Promise<boolean> {
    try {
      // Check if transition is free or official
      const { data: transition } = await this.supabase
        .from('transitions')
        .select('is_official, price_credits')
        .eq('id', transitionId)
        .single();

      if (!transition) return false;

      // Official transitions are always accessible
      if (transition.is_official) return true;

      // Free transitions are accessible
      if (transition.price_credits === 0) return true;

      // Check if user has purchased this transition
      const { data: purchase } = await this.supabase
        .from('transition_purchases')
        .select('id')
        .eq('user_id', userId)
        .eq('transition_id', transitionId)
        .eq('status', 'completed')
        .single();

      return !!purchase;

    } catch (error) {
      console.error('Failed to check transition access:', error);
      return false;
    }
  }

  /**
   * Get marketplace statistics
   */
  async getMarketplaceStats(): Promise<MarketplaceStats> {
    try {
      // Get total transitions
      const { count: totalTransitions } = await this.supabase
        .from('transitions')
        .select('*', { count: 'exact', head: true })
        .eq('is_official', false)
        .eq('is_public', true);

      // Get total creators
      const { data: creatorsData } = await this.supabase
        .from('transitions')
        .select('creator_id')
        .eq('is_official', false)
        .eq('is_public', true);

      const totalCreators = new Set(creatorsData?.map(t => t.creator_id)).size;

      // Get top transitions
      const { data: topTransitionsData } = await this.supabase
        .from('transitions')
        .select('*')
        .eq('is_official', false)
        .eq('is_public', true)
        .order('viral_score', { ascending: false })
        .limit(10);

      const topTransitions = (topTransitionsData || []).map(this.mapToCreatorTransition);

      // Calculate revenue and top creators (would need purchase tracking)
      const totalRevenue = 0; // Would be calculated from actual purchases
      const topCreators: any[] = []; // Would be calculated from creator earnings

      return {
        totalTransitions: totalTransitions || 0,
        totalCreators,
        totalRevenue,
        topTransitions,
        topCreators
      };

    } catch (error) {
      console.error('Failed to get marketplace stats:', error);
      return {
        totalTransitions: 0,
        totalCreators: 0,
        totalRevenue: 0,
        topTransitions: [],
        topCreators: []
      };
    }
  }

  /**
   * Validate transition before publishing
   */
  private async validateTransition(transition: CreatorTransition): Promise<{
    isValid: boolean;
    error?: string;
  }> {
    // Check required fields
    if (!transition.name || !transition.glslCode || !transition.creatorId) {
      return { isValid: false, error: 'Missing required fields' };
    }

    // Check GLSL size
    if (transition.glslCode.length > this.MAX_GLSL_SIZE) {
      return { isValid: false, error: 'GLSL code too large' };
    }

    // Check for malicious code patterns
    const maliciousPatterns = [
      /while\s*\(\s*true\s*\)/i, // Infinite loops
      /for\s*\([^)]*;\s*true\s*;/i, // Infinite for loops
      /discard/i, // Potentially problematic discard statements
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(transition.glslCode)) {
        return { isValid: false, error: 'GLSL contains potentially harmful patterns' };
      }
    }

    // Check price range
    if (transition.price < 0 || transition.price > 1000) {
      return { isValid: false, error: 'Price must be between 0 and 1000 credits' };
    }

    return { isValid: true };
  }

  /**
   * Compile and test GLSL code
   */
  private async compileAndTestGLSL(glslCode: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // This would integrate with the WebGL compilation system
      // For now, basic syntax validation
      if (!glslCode.includes('vec4 transition(')) {
        return {
          success: false,
          error: 'GLSL must contain a transition function'
        };
      }

      // Test compilation using transitionCore
      const testTransitionId = `test_${Date.now()}`;
      const compilationResult = await transitionCore.compileShader(testTransitionId, glslCode);
      
      if (!compilationResult) {
        return {
          success: false,
          error: 'GLSL compilation failed'
        };
      }

      return { success: true };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Compilation error'
      };
    }
  }

  /**
   * Generate preview for transition
   */
  private async generateTransitionPreview(transition: CreatorTransition): Promise<string> {
    // This would generate an actual preview video
    // For now, return placeholder
    return `/api/transitions/preview/${transition.name.toLowerCase().replace(/\s+/g, '-')}`;
  }

  /**
   * Estimate viral score for new transition
   */
  private async estimateViralScore(transition: CreatorTransition): Promise<number> {
    let score = 5.0; // Base score

    // Category-based scoring
    const categoryScores: Record<string, number> = {
      'tiktok-essentials': 8.0,
      'glitch': 7.5,
      '3d-transforms': 7.0,
      'cinematic': 6.0,
      'organic': 5.5
    };

    score = categoryScores[transition.category] || score;

    // Tag-based adjustments
    const viralTags = ['viral', 'trending', 'explosive', 'punch', 'blast'];
    const viralTagCount = transition.tags.filter(tag => 
      viralTags.some(vTag => tag.toLowerCase().includes(vTag))
    ).length;

    score += viralTagCount * 0.5;

    // GLSL complexity bonus (more complex = potentially more viral)
    const complexityScore = Math.min(transition.glslCode.length / 1000, 2);
    score += complexityScore;

    return Math.max(0, Math.min(10, score));
  }

  /**
   * Grant access to free transition
   */
  private async grantFreeTransitionAccess(
    userId: string,
    transitionId: string,
    creatorId: string
  ): Promise<void> {
    // Record free access
    await this.supabase
      .from('transition_purchases')
      .insert({
        user_id: userId,
        transition_id: transitionId,
        creator_id: creatorId,
        credits_paid: 0,
        status: 'completed',
        payment_method: 'free'
      });

    // Track free usage for creator
    await this.trackCreatorActivity(creatorId, 'free_download', transitionId);
  }

  /**
   * Grant access to purchased transition
   */
  private async grantTransitionAccess(
    userId: string,
    transitionId: string,
    purchaseId: string
  ): Promise<void> {
    // Update purchase record with access granted
    await this.supabase
      .from('transition_purchases')
      .update({
        access_granted_at: new Date().toISOString(),
        status: 'completed'
      })
      .eq('id', purchaseId);

    // Increment transition usage count
    await this.supabase.rpc('increment_transition_usage', {
      p_transition_id: transitionId
    });
  }

  /**
   * Track marketplace metrics
   */
  private async trackMarketplaceMetrics(
    transitionId: string,
    creatorId: string,
    price: number
  ): Promise<void> {
    try {
      // Update transition purchase count
      await this.supabase
        .from('transitions')
        .update({
          purchase_count: this.supabase.raw('purchase_count + 1'),
          total_earnings: this.supabase.raw(`total_earnings + ${price}`)
        })
        .eq('id', transitionId);

      // Update creator profile stats
      await this.supabase
        .from('creator_profiles')
        .update({
          total_sales: this.supabase.raw('total_sales + 1')
        })
        .eq('user_id', creatorId);

      console.log(`📊 Marketplace metrics updated for transition ${transitionId}`);
    } catch (error) {
      console.error('Failed to track marketplace metrics:', error);
    }
  }

  /**
   * Track creator activity
   */
  private async trackCreatorActivity(
    creatorId: string,
    activity: 'publish' | 'purchase' | 'earnings',
    transitionId: string
  ): Promise<void> {
    // This would track creator metrics for analytics
    console.log(`📊 Creator activity: ${creatorId} - ${activity} - ${transitionId}`);
  }

  /**
   * Track transition purchase
   */
  private async trackTransitionPurchase(
    transitionId: string,
    userId: string,
    creditsUsed: number
  ): Promise<void> {
    // This would integrate with the transition analytics system
    console.log(`💰 Transition purchased: ${transitionId} by ${userId} for ${creditsUsed} credits`);
  }

  /**
   * Map database row to CreatorTransition
   */
  private mapToCreatorTransition(data: any): CreatorTransition {
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      glslCode: data.glsl_code || '',
      ffmpegParams: data.ffmpeg_params || {},
      creatorId: data.creator_id,
      category: data.category,
      tags: data.tags || [],
      previewUrl: data.preview_url,
      thumbnailUrl: data.thumbnail_url,
      price: data.price_credits || 0,
      royaltyPercentage: data.royalty_percentage || this.DEFAULT_ROYALTY,
      isPublic: data.is_public || false,
      isApproved: data.approval_status === 'approved',
      viralScore: data.viral_score
    };
  }
}

// Export singleton instance
export const marketplaceAgent = new MarketplaceAgent();
