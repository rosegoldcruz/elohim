/**
 * AEON Transition Publishing API
 * Handles publishing user-created transitions to the marketplace
 */

import { NextRequest, NextResponse } from 'next/server';
import { marketplaceAgent } from '@/lib/agents/MarketplaceAgent';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const {
      name,
      description,
      glslCode,
      category,
      tags,
      price,
      isPublic
    } = await request.json();

    // Validate required fields
    if (!name || !glslCode || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, glslCode, category' },
        { status: 400 }
      );
    }

    // Validate user permissions
    const canPublish = await checkPublishPermissions(user.id);
    if (!canPublish.allowed) {
      return NextResponse.json(
        { success: false, error: canPublish.reason },
        { status: 403 }
      );
    }

    // Create transition object
    const transition = {
      name,
      description: description || '',
      glslCode,
      creatorId: user.id,
      category,
      tags: tags || [],
      price: price || 0,
      royaltyPercentage: 0.15, // 15% default royalty
      isPublic: isPublic !== false, // Default to true
      isApproved: false
    };

    // Publish through MarketplaceAgent
    const result = await marketplaceAgent.publishTransition(transition);

    if (result.success) {
      // Track publishing activity
      await trackPublishingActivity(user.id, result.transitionId!, {
        category,
        price: price || 0,
        requiresApproval: result.requiresApproval || false
      });

      return NextResponse.json({
        success: true,
        transitionId: result.transitionId,
        requiresApproval: result.requiresApproval,
        message: result.requiresApproval 
          ? 'Transition submitted for approval' 
          : 'Transition published successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Transition publishing failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check if user has permission to publish transitions
 */
async function checkPublishPermissions(userId: string): Promise<{
  allowed: boolean;
  reason?: string;
}> {
  const supabase = createClient();

  try {
    // Check if user has a creator profile
    const { data: profile, error: profileError } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    // Create creator profile if it doesn't exist
    if (!profile) {
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase
          .from('creator_profiles')
          .insert({
            user_id: userId,
            creator_name: user.user.user_metadata?.name || 'Anonymous Creator',
            bio: '',
            total_transitions: 0,
            total_sales: 0,
            total_earnings: 0
          });
      }
    }

    // Check publishing limits (e.g., max transitions per day)
    const { data: recentTransitions, error: transitionsError } = await supabase
      .from('transitions')
      .select('id')
      .eq('creator_id', userId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (transitionsError) {
      throw transitionsError;
    }

    const dailyLimit = 10; // Max 10 transitions per day
    if (recentTransitions && recentTransitions.length >= dailyLimit) {
      return {
        allowed: false,
        reason: `Daily publishing limit reached (${dailyLimit} transitions per day)`
      };
    }

    // Check if user is banned or restricted
    if (profile && profile.tier === 'banned') {
      return {
        allowed: false,
        reason: 'Account is restricted from publishing'
      };
    }

    return { allowed: true };

  } catch (error) {
    console.error('Permission check failed:', error);
    return {
      allowed: false,
      reason: 'Unable to verify permissions'
    };
  }
}

/**
 * Track publishing activity for analytics
 */
async function trackPublishingActivity(
  userId: string,
  transitionId: string,
  metadata: {
    category: string;
    price: number;
    requiresApproval: boolean;
  }
): Promise<void> {
  const supabase = createClient();

  try {
    // Update creator profile stats
    await supabase.rpc('increment_creator_transitions', {
      creator_user_id: userId
    });

    // Log publishing event (would integrate with analytics system)
    console.log(`📊 Transition published: ${transitionId} by ${userId}`, metadata);

    // In production, this would also:
    // - Send notification to admins if approval required
    // - Update creator tier based on activity
    // - Track publishing trends

  } catch (error) {
    console.error('Failed to track publishing activity:', error);
    // Don't fail the request if analytics tracking fails
  }
}

/**
 * GET endpoint to check publishing status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's publishing stats
    const { data: profile } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const { data: transitions } = await supabase
      .from('transitions')
      .select('id, name, approval_status, created_at, viral_score, usage_count')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false });

    const { data: recentTransitions } = await supabase
      .from('transitions')
      .select('id')
      .eq('creator_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    const dailyLimit = 10;
    const remainingToday = dailyLimit - (recentTransitions?.length || 0);

    return NextResponse.json({
      success: true,
      profile: profile || {
        creator_name: user.user_metadata?.name || 'Anonymous Creator',
        total_transitions: 0,
        total_sales: 0,
        total_earnings: 0,
        tier: 'bronze'
      },
      transitions: transitions || [],
      limits: {
        dailyLimit,
        remainingToday: Math.max(0, remainingToday)
      }
    });

  } catch (error) {
    console.error('Failed to get publishing status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
