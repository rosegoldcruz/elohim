import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { fetchCredits, CREDIT_COSTS } from '@/lib/api'

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabaseClient = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get user's current credits
    const creditsResult = await fetchCredits(user.id)
    const userCredits = creditsResult.data || 0

    // Calculate AEON value
    const aeonValue = {
      credits: userCredits,
      videosPerMonth: Math.floor(userCredits / CREDIT_COSTS.VIDEO_GENERATION),
      videoLength: 60, // seconds
      creditsExpire: false,
      modelsUsed: 6,
      costPerVideo: CREDIT_COSTS.VIDEO_GENERATION
    }

    // Hailuo equivalent (approximate based on their pricing)
    const hailuoEquivalent = {
      credits: Math.floor(userCredits * 0.45), // Hailuo gives fewer credits for same price
      videosPerMonth: Math.floor((userCredits * 0.45) / 50), // Hailuo uses ~50 credits per 10-second clip
      videoLength: 10, // seconds
      creditsExpire: true,
      modelsUsed: 1,
      costPerVideo: 50
    }

    // Calculate savings and advantages
    const savings = {
      creditsAdvantage: aeonValue.credits - hailuoEquivalent.credits,
      videosAdvantage: aeonValue.videosPerMonth - hailuoEquivalent.videosPerMonth,
      lengthAdvantage: aeonValue.videoLength - hailuoEquivalent.videoLength,
      valueMultiplier: Math.round((aeonValue.videosPerMonth * 60) / Math.max(hailuoEquivalent.videosPerMonth * 10, 1)),
      totalVideoMinutes: aeonValue.videosPerMonth * 1, // 1 minute per video
      hailuoVideoMinutes: Math.round(hailuoEquivalent.videosPerMonth * 0.167) // 10 seconds = 0.167 minutes
    }

    // Generate competitive messages
    const messages = [
      `🎬 You get ${savings.videosAdvantage} more complete videos than Hailuo users!`,
      `⚡ Your videos are ${aeonValue.videoLength / hailuoEquivalent.videoLength}x longer than Hailuo's clips`,
      `💎 Your credits never expire - Hailuo resets monthly (you save ${savings.creditsAdvantage} credits)`,
      `🎭 6 AI Directors vs Hailuo's 1 model = ${savings.valueMultiplier}x more creative power`,
      `🚀 Complete 60-second videos vs 10-second clips - show your friends the full story!`,
      `📈 You create ${savings.totalVideoMinutes} minutes of content vs Hailuo's ${savings.hailuoVideoMinutes} minutes`,
      `🎯 Orchestra Mode: All 6 models for the price of 1 - Hailuo can't compete!`
    ]

    const randomMessage = messages[Math.floor(Math.random() * messages.length)]

    // Pricing comparison
    const pricingComparison = {
      aeon: {
        starter: { price: 19.99, credits: 2000, videos: 20, videoLength: 60 },
        creator: { price: 49.99, credits: 6000, videos: 60, videoLength: 60 },
        studio: { price: 99.99, credits: 15000, videos: 150, videoLength: 60 }
      },
      hailuo: {
        basic: { price: 35, credits: 900, videos: 18, videoLength: 10 },
        pro: { price: 105, credits: 2700, videos: 54, videoLength: 10 },
        premium: { price: 315, credits: 8100, videos: 162, videoLength: 10 }
      }
    }

    return NextResponse.json({
      success: true,
      comparison: {
        aeonValue,
        hailuoEquivalent,
        savings,
        competitiveMessage: randomMessage,
        pricingComparison,
        keyAdvantages: [
          "Complete 60-second videos vs 10-second clips",
          "6 AI models working together vs 1 model",
          "Credits never expire vs monthly reset",
          "Orchestra Mode: All models for price of 1",
          "Professional video assembly with transitions",
          "Free tier with 250 monthly credits"
        ]
      }
    })

  } catch (error) {
    console.error('Error generating competitive comparison:', error)
    return NextResponse.json(
      { error: 'Failed to generate comparison' },
      { status: 500 }
    )
  }
}
