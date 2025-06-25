import { supabase } from '@/lib/database'
import { addCredits, CREDIT_COSTS } from '@/lib/api'

// Growth system constants
export const GROWTH_REWARDS = {
  REFERRAL_REWARD: 500,        // 500 credits for successful referral
  SOCIAL_SHARE_REWARD: 50,     // 50 credits for sharing generated video
  FIRST_VIDEO_BONUS: 100,      // 100 bonus credits for first video
  STREAK_BONUS: 25,            // 25 credits for daily creation streak
  REVIEW_BONUS: 200,           // 200 credits for app store review
  FEEDBACK_BONUS: 100          // 100 credits for product feedback
}

// Referral system
export class ReferralSystem {
  // Generate unique referral code for user
  static async generateReferralCode(userId: string): Promise<string> {
    const code = `AEON${userId.slice(-6).toUpperCase()}${Math.random().toString(36).slice(-4).toUpperCase()}`
    
    // Store referral code in user record
    await supabase
      .from('users')
      .update({ referral_code: code })
      .eq('id', userId)
    
    return code
  }

  // Process referral when new user signs up
  static async processReferral(newUserId: string, referralCode: string): Promise<boolean> {
    try {
      // Find referring user
      const { data: referrer, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('referral_code', referralCode)
        .single()

      if (error || !referrer) {
        console.log('Invalid referral code:', referralCode)
        return false
      }

      // Check if new user has made their first video (to prevent abuse)
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', newUserId)
        .eq('status', 'completed')
        .limit(1)

      if (!projects || projects.length === 0) {
        // Store pending referral to process after first video
        await supabase
          .from('credit_transactions')
          .insert({
            user_id: referrer.id,
            amount: 0, // Will be updated when referral completes
            transaction_type: 'referral_pending',
            description: `Pending referral from user ${newUserId}`,
            metadata: { referred_user_id: newUserId, status: 'pending' }
          })
        return true
      }

      // Process completed referral
      return await this.completeReferral(referrer.id, newUserId)

    } catch (error) {
      console.error('Error processing referral:', error)
      return false
    }
  }

  // Complete referral after new user creates first video
  static async completeReferral(referrerId: string, newUserId: string): Promise<boolean> {
    try {
      // Add credits to referrer
      const result = await addCredits(
        referrerId,
        GROWTH_REWARDS.REFERRAL_REWARD,
        `Referral bonus: User ${newUserId} created their first video`
      )

      if (result.data) {
        // Update pending transaction
        await supabase
          .from('credit_transactions')
          .update({
            amount: GROWTH_REWARDS.REFERRAL_REWARD,
            transaction_type: 'referral_completed'
          })
          .eq('user_id', referrerId)
          .eq('transaction_type', 'referral_pending')
          .contains('metadata', { referred_user_id: newUserId })

        console.log(`Referral completed: ${GROWTH_REWARDS.REFERRAL_REWARD} credits to ${referrerId}`)
        return true
      }

      return false
    } catch (error) {
      console.error('Error completing referral:', error)
      return false
    }
  }

  // Get referral stats for user
  static async getReferralStats(userId: string) {
    const { data: referrals } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .in('transaction_type', ['referral_completed', 'referral_pending'])

    const completed = referrals?.filter(r => r.transaction_type === 'referral_completed').length || 0
    const pending = referrals?.filter(r => r.transaction_type === 'referral_pending').length || 0
    const totalEarned = completed * GROWTH_REWARDS.REFERRAL_REWARD

    return { completed, pending, totalEarned }
  }
}

// Social sharing system
export class SocialSharingSystem {
  // Track video share and reward credits
  static async trackVideoShare(userId: string, projectId: string, platform: string): Promise<boolean> {
    try {
      // Check if user already got credits for sharing this video
      const { data: existingShare } = await supabase
        .from('credit_transactions')
        .select('id')
        .eq('user_id', userId)
        .eq('transaction_type', 'social_share')
        .contains('metadata', { project_id: projectId })
        .single()

      if (existingShare) {
        console.log('User already received credits for sharing this video')
        return false
      }

      // Add social sharing credits
      const result = await addCredits(
        userId,
        GROWTH_REWARDS.SOCIAL_SHARE_REWARD,
        `Social share bonus: Shared video on ${platform}`
      )

      if (result.data) {
        // Update transaction with metadata
        await supabase
          .from('credit_transactions')
          .update({
            metadata: { project_id: projectId, platform: platform }
          })
          .eq('user_id', userId)
          .eq('description', `Social share bonus: Shared video on ${platform}`)
          .order('created_at', { ascending: false })
          .limit(1)

        console.log(`Social share reward: ${GROWTH_REWARDS.SOCIAL_SHARE_REWARD} credits to ${userId}`)
        return true
      }

      return false
    } catch (error) {
      console.error('Error tracking video share:', error)
      return false
    }
  }

  // Get sharing stats for user
  static async getSharingStats(userId: string) {
    const { data: shares } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('transaction_type', 'social_share')

    const totalShares = shares?.length || 0
    const totalEarned = totalShares * GROWTH_REWARDS.SOCIAL_SHARE_REWARD
    const platforms = shares?.map(s => s.metadata?.platform).filter(Boolean) || []

    return { totalShares, totalEarned, platforms }
  }
}

// Competitive positioning system
export class CompetitivePositioning {
  // Calculate value comparison vs Hailuo
  static calculateValueComparison(userCredits: number, userPlan: string) {
    const aeonValue = {
      credits: userCredits,
      videosPerMonth: Math.floor(userCredits / CREDIT_COSTS.VIDEO_GENERATION),
      videoLength: 60, // seconds
      creditsExpire: false,
      modelsUsed: 6
    }

    // Hailuo equivalent (approximate)
    const hailuoEquivalent = {
      credits: userCredits * 0.45, // Hailuo gives fewer credits for same price
      videosPerMonth: Math.floor((userCredits * 0.45) / 50), // Hailuo uses ~50 credits per 10-second clip
      videoLength: 10, // seconds
      creditsExpire: true,
      modelsUsed: 1
    }

    const savings = {
      creditsAdvantage: aeonValue.credits - hailuoEquivalent.credits,
      videosAdvantage: aeonValue.videosPerMonth - hailuoEquivalent.videosPerMonth,
      lengthAdvantage: aeonValue.videoLength - hailuoEquivalent.videoLength,
      valueMultiplier: Math.round((aeonValue.videosPerMonth * 60) / (hailuoEquivalent.videosPerMonth * 10))
    }

    return { aeonValue, hailuoEquivalent, savings }
  }

  // Generate competitive messaging
  static generateCompetitiveMessage(comparison: any) {
    const messages = [
      `🎬 You get ${comparison.savings.videosAdvantage} more complete videos than Hailuo users!`,
      `⚡ Your videos are ${comparison.aeonValue.videoLength / comparison.hailuoEquivalent.videoLength}x longer than Hailuo's clips`,
      `💎 Your credits never expire - Hailuo resets monthly (you save ${comparison.savings.creditsAdvantage} credits)`,
      `🎭 6 AI Directors vs Hailuo's 1 model = ${comparison.savings.valueMultiplier}x more creative power`,
      `🚀 Complete 60-second videos vs 10-second clips - show your friends the full story!`
    ]

    return messages[Math.floor(Math.random() * messages.length)]
  }
}

// Gamification system
export class GamificationSystem {
  // Track user streaks and milestones
  static async trackCreationStreak(userId: string): Promise<number> {
    try {
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      // Check if user created video today
      const { data: todayVideos } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('completed_at', today)

      if (!todayVideos || todayVideos.length === 0) {
        return 0 // No video today, streak broken
      }

      // Check yesterday's video to continue streak
      const { data: yesterdayVideos } = await supabase
        .from('projects')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('completed_at', yesterday)
        .lt('completed_at', today)

      // Calculate current streak (simplified - in production, store streak in user profile)
      let currentStreak = 1
      if (yesterdayVideos && yesterdayVideos.length > 0) {
        // Get stored streak or calculate
        const { data: user } = await supabase
          .from('users')
          .select('metadata')
          .eq('id', userId)
          .single()

        currentStreak = (user?.metadata?.creation_streak || 0) + 1
      }

      // Update user streak
      await supabase
        .from('users')
        .update({
          metadata: { creation_streak: currentStreak, last_creation_date: today }
        })
        .eq('id', userId)

      // Reward streak bonus
      if (currentStreak >= 3) {
        await addCredits(
          userId,
          GROWTH_REWARDS.STREAK_BONUS,
          `${currentStreak}-day creation streak bonus!`
        )
      }

      return currentStreak
    } catch (error) {
      console.error('Error tracking creation streak:', error)
      return 0
    }
  }

  // Check and reward milestones
  static async checkMilestones(userId: string) {
    const { data: projects } = await supabase
      .from('projects')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed')

    const videoCount = projects?.length || 0
    const milestones = [
      { count: 1, reward: GROWTH_REWARDS.FIRST_VIDEO_BONUS, message: "First video created! 🎉" },
      { count: 5, reward: 250, message: "5 videos milestone! 🌟" },
      { count: 10, reward: 500, message: "10 videos milestone! 🚀" },
      { count: 25, reward: 1000, message: "25 videos milestone! 👑" },
      { count: 50, reward: 2000, message: "50 videos milestone! 🎭" }
    ]

    for (const milestone of milestones) {
      if (videoCount === milestone.count) {
        await addCredits(userId, milestone.reward, milestone.message)
        return milestone
      }
    }

    return null
  }
}
