import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { orchestrateVideoGeneration } from '@/lib/agents/orchestrator'
import { checkCreditsAvailable, CREDIT_COSTS } from '@/lib/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, options = {} } = body

    // Basic validation
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Valid prompt is required' },
        { status: 400 }
      )
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabaseClient = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has enough credits
    const requiredCredits = CREDIT_COSTS.VIDEO_GENERATION +
      (options.rushDelivery ? CREDIT_COSTS.RUSH_DELIVERY : 0)

    const creditsCheck = await checkCreditsAvailable(user.id, requiredCredits)
    if (!creditsCheck.data) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: requiredCredits,
          message: `You need ${requiredCredits} credits to generate this video. Upgrade your plan to continue.`
        },
        { status: 402 }
      )
    }

    // Start Orchestra Mode video generation
    const result = await orchestrateVideoGeneration(user.id, prompt.trim(), options)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to start video generation' },
        { status: 500 }
      )
    }

    const response = {
      success: true,
      message: '🎬 Orchestra Mode activated! 6 AI Directors are collaborating on your vision.',
      data: {
        projectId: result.projectId,
        prompt: prompt.trim(),
        status: 'processing',
        estimatedCompletion: '2-5 minutes',
        modelsUsed: 6,
        creditsUsed: requiredCredits,
        timestamp: new Date().toISOString()
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Video generator error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Video Generator API is running',
    status: 'active'
  })
}