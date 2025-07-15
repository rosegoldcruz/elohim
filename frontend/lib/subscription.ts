/**
 * AEON AI Video Generation Platform - Subscription & Credit System
 * Based on MIT-licensed ai-video-generator
 * License: MIT (see LICENSE file)
 * 
 * Handles subscription tiers, credit management, and billing logic
 */

import { config } from './env'

// Subscription tier definitions
export interface SubscriptionTier {
  id: string
  name: string
  price: number
  credits: number
  features: string[]
  limits: {
    videosPerMonth: number
    maxDuration: number
    queuePriority: number
    apiCalls: number
  }
  stripePriceId?: string
}

export const SUBSCRIPTION_TIERS: Record<string, SubscriptionTier> = {
  free: {
    id: 'free',
    name: 'Free',
    price: 0,
    credits: 0,
    features: [
      'Basic video generation',
      'Standard quality (1080p)',
      'Watermark included',
      'Email support',
    ],
    limits: {
      videosPerMonth: 2,
      maxDuration: 30,
      queuePriority: 1,
      apiCalls: 5,
    },
  },
  starter: {
    id: 'starter',
    name: 'AEON Starter Pass',
    price: 5.99,
    credits: 100,
    features: [
      '100 credits one-time',
      'HD video quality (720p)',
      'Basic video styles',
      'Email support',
      'Standard processing queue',
      'Watermark included',
    ],
    limits: {
      videosPerMonth: 10,
      maxDuration: 60,
      queuePriority: 2,
      apiCalls: 10,
    },
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_PASS,
  },
  pro: {
    id: 'pro',
    name: 'AEON Pro',
    price: 29.99,
    credits: 1000,
    features: [
      '1,000 credits/month',
      'HD video quality (1080p)',
      'Basic Analytics',
      'Email Support',
      'Standard Processing',
      'Commercial License',
    ],
    limits: {
      videosPerMonth: 40,
      maxDuration: 120,
      queuePriority: 3,
      apiCalls: 40,
    },
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
  },
  creator: {
    id: 'creator',
    name: 'AEON Creator',
    price: 59.99,
    credits: 3000,
    features: [
      '3,000 credits/month',
      '4K Ultra HD Quality',
      'Advanced Analytics',
      'Priority Support',
      'Voice Cloning',
      'Custom Avatars',
      'API Access',
      'Commercial License',
    ],
    limits: {
      videosPerMonth: 120,
      maxDuration: 300,
      queuePriority: 4,
      apiCalls: 120,
    },
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY,
  },
  studio: {
    id: 'studio',
    name: 'AEON Studio',
    price: 149.99,
    credits: 8000,
    features: [
      '8,000 credits/month',
      'All Creator Features',
      'White-label Solution',
      'Dedicated Account Manager',
      'Custom Integrations',
      'SLA Guarantee',
      'Advanced Security',
      'Team Collaboration',
      'Priority Rendering',
    ],
    limits: {
      videosPerMonth: 320,
      maxDuration: 600,
      queuePriority: 5,
      apiCalls: 320,
    },
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_MONTHLY,
  },
}

// Credit cost calculation
export interface CreditCost {
  duration: number
  cost: number
  description: string
}

export const CREDIT_COSTS: CreditCost[] = [
  { duration: 30, cost: config.credits.costs['30s'], description: '30-second video' },
  { duration: 60, cost: config.credits.costs['60s'], description: '60-second video' },
  { duration: 120, cost: config.credits.costs['120s'], description: '2-minute video' },
]

// Utility functions
export const getTierById = (tierId: string): SubscriptionTier | null => {
  return SUBSCRIPTION_TIERS[tierId] || null
}

export const getTierByName = (tierName: string): SubscriptionTier | null => {
  return Object.values(SUBSCRIPTION_TIERS).find(tier => 
    tier.name.toLowerCase() === tierName.toLowerCase()
  ) || null
}

export const calculateCreditCost = (duration: number): number => {
  // Find the appropriate credit cost tier
  const costTier = CREDIT_COSTS.find(tier => duration <= tier.duration)
  
  if (costTier) {
    return costTier.cost
  }
  
  // For videos longer than 120s, calculate proportionally
  const baseCost = config.credits.costs['60s']
  return Math.ceil((duration / 60) * baseCost)
}

export const canUserGenerateVideo = (
  userTier: string,
  userCredits: number,
  videoDuration: number,
  videosThisMonth: number
): { canGenerate: boolean; reason?: string } => {
  const tier = getTierById(userTier)
  
  if (!tier) {
    return { canGenerate: false, reason: 'Invalid subscription tier' }
  }
  
  // Check monthly video limit
  if (videosThisMonth >= tier.limits.videosPerMonth) {
    return { 
      canGenerate: false, 
      reason: `Monthly video limit reached (${tier.limits.videosPerMonth})` 
    }
  }
  
  // Check duration limit
  if (videoDuration > tier.limits.maxDuration) {
    return { 
      canGenerate: false, 
      reason: `Video duration exceeds limit (${tier.limits.maxDuration}s)` 
    }
  }
  
  // Check credit balance
  const creditCost = calculateCreditCost(videoDuration)
  if (userCredits < creditCost) {
    return { 
      canGenerate: false, 
      reason: `Insufficient credits (need ${creditCost}, have ${userCredits})` 
    }
  }
  
  return { canGenerate: true }
}

export const getQueuePriority = (userTier: string): number => {
  const tier = getTierById(userTier)
  return tier?.limits.queuePriority || 1
}

export const getRateLimit = (userTier: string): number => {
  const tier = getTierById(userTier)
  return tier?.limits.apiCalls || 5
}

export const getUpgradeRecommendation = (
  currentTier: string,
  usage: {
    videosThisMonth: number
    creditsUsed: number
    avgDuration: number
  }
): { shouldUpgrade: boolean; recommendedTier?: string; reason?: string } => {
  const current = getTierById(currentTier)
  
  if (!current) {
    return { shouldUpgrade: false }
  }
  
  // Check if user is hitting limits
  const videoLimitUsage = usage.videosThisMonth / current.limits.videosPerMonth
  const creditUsage = usage.creditsUsed / current.credits
  
  // Recommend upgrade if user is using >80% of limits
  if (videoLimitUsage > 0.8 || creditUsage > 0.8) {
    const nextTier = getNextTier(currentTier)
    
    if (nextTier) {
      return {
        shouldUpgrade: true,
        recommendedTier: nextTier.id,
        reason: videoLimitUsage > 0.8 
          ? 'Approaching monthly video limit'
          : 'Running low on credits'
      }
    }
  }
  
  return { shouldUpgrade: false }
}

export const getNextTier = (currentTier: string): SubscriptionTier | null => {
  const tierOrder = ['free', 'starter', 'pro', 'business']
  const currentIndex = tierOrder.indexOf(currentTier)
  
  if (currentIndex >= 0 && currentIndex < tierOrder.length - 1) {
    return SUBSCRIPTION_TIERS[tierOrder[currentIndex + 1]]
  }
  
  return null
}

export const getPreviousTier = (currentTier: string): SubscriptionTier | null => {
  const tierOrder = ['free', 'starter', 'pro', 'business']
  const currentIndex = tierOrder.indexOf(currentTier)
  
  if (currentIndex > 0) {
    return SUBSCRIPTION_TIERS[tierOrder[currentIndex - 1]]
  }
  
  return null
}

// Credit transaction types
export type CreditTransactionType = 
  | 'purchase'
  | 'subscription'
  | 'video_generation'
  | 'refund'
  | 'bonus'
  | 'admin_adjustment'

export interface CreditTransaction {
  id: string
  userId: string
  amount: number
  type: CreditTransactionType
  description: string
  orderId?: string
  videoId?: string
  createdAt: Date
}

// Billing cycle utilities
export const getNextBillingDate = (subscriptionStart: Date): Date => {
  const nextBilling = new Date(subscriptionStart)
  nextBilling.setMonth(nextBilling.getMonth() + 1)
  return nextBilling
}

export const getDaysUntilBilling = (subscriptionStart: Date): number => {
  const nextBilling = getNextBillingDate(subscriptionStart)
  const now = new Date()
  const diffTime = nextBilling.getTime() - now.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export const calculateProration = (
  oldTier: SubscriptionTier,
  newTier: SubscriptionTier,
  daysRemaining: number
): number => {
  const daysInMonth = 30
  const oldDailyRate = oldTier.price / daysInMonth
  const newDailyRate = newTier.price / daysInMonth
  
  const refund = oldDailyRate * daysRemaining
  const charge = newDailyRate * daysRemaining
  
  return Math.max(0, charge - refund)
}

// Feature access utilities
export const hasFeature = (userTier: string, feature: string): boolean => {
  const tier = getTierById(userTier)
  return tier?.features.includes(feature) || false
}

export const getFeatureList = (userTier: string): string[] => {
  const tier = getTierById(userTier)
  return tier?.features || []
}

// Usage analytics
export interface UsageAnalytics {
  videosGenerated: number
  creditsUsed: number
  avgProcessingTime: number
  successRate: number
  popularDurations: number[]
  peakUsageHours: number[]
}

export const calculateUsageEfficiency = (
  analytics: UsageAnalytics,
  tier: SubscriptionTier
): {
  videoEfficiency: number
  creditEfficiency: number
  overallScore: number
} => {
  const videoEfficiency = analytics.videosGenerated / tier.limits.videosPerMonth
  const creditEfficiency = analytics.creditsUsed / tier.credits
  const overallScore = (videoEfficiency + creditEfficiency) / 2
  
  return {
    videoEfficiency: Math.min(1, videoEfficiency),
    creditEfficiency: Math.min(1, creditEfficiency),
    overallScore: Math.min(1, overallScore)
  }
}

// Export all tiers for easy access
export const ALL_TIERS = Object.values(SUBSCRIPTION_TIERS)
export const PAID_TIERS = ALL_TIERS.filter(tier => tier.price > 0)
export const FREE_TIER = SUBSCRIPTION_TIERS.free
