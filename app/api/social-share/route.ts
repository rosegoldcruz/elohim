import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/database'
import { addCredits } from '@/lib/api'

const SOCIAL_SHARE_REWARD = 50

export async function POST(request: NextRequest) {
  try {
    const { projectId, platform } = await request.json()

    if (!projectId || !platform) {
      return NextResponse.json(
        { error: 'Project ID and platform are required' },
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

    // Verify user owns the project
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id, user_id, title')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Check if user already got credits for sharing this video
    const { data: existingShare } = await supabase
      .from('credit_transactions')
      .select('id')
      .eq('user_id', user.id)
      .eq('transaction_type', 'addition')
      .ilike('description', `%Social share%${projectId}%`)
      .single()

    if (existingShare) {
      return NextResponse.json(
        { error: 'Credits already awarded for sharing this video' },
        { status: 400 }
      )
    }

    // Add social sharing credits
    const result = await addCredits(
      user.id,
      SOCIAL_SHARE_REWARD,
      `Social share bonus: Shared video ${projectId} on ${platform}`
    )

    if (result.data) {
      return NextResponse.json({
        success: true,
        message: `🎉 ${SOCIAL_SHARE_REWARD} credits earned for sharing!`,
        creditsEarned: SOCIAL_SHARE_REWARD,
        platform: platform,
        projectTitle: project.title
      })
    }

    return NextResponse.json(
      { error: 'Failed to award credits' },
      { status: 500 }
    )

  } catch (error) {
    console.error('Social share API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

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

    // Get user's sharing stats
    const { data: shares } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('transaction_type', 'addition')
      .ilike('description', '%Social share%')

    const totalShares = shares?.length || 0
    const totalEarned = totalShares * SOCIAL_SHARE_REWARD

    // Extract platforms from descriptions
    const platforms = shares?.map(share => {
      const match = share.description.match(/on (\w+)/)
      return match ? match[1] : 'unknown'
    }).filter(Boolean) || []

    const platformCounts = platforms.reduce((acc: any, platform: string) => {
      acc[platform] = (acc[platform] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      stats: {
        totalShares,
        totalEarned,
        rewardPerShare: SOCIAL_SHARE_REWARD,
        platformBreakdown: platformCounts
      }
    })

  } catch (error) {
    console.error('Error getting sharing stats:', error)
    return NextResponse.json(
      { error: 'Failed to get sharing stats' },
      { status: 500 }
    )
  }
}
