import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/database'
import { addCredits } from '@/lib/api'

const REFERRAL_REWARD = 500

export async function POST(request: NextRequest) {
  try {
    const { action, referralCode } = await request.json()

    // Get authenticated user
    const supabaseClient = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (action === 'generate') {
      // Generate referral code for user
      const code = `AEON${user.id.slice(-6).toUpperCase()}${Math.random().toString(36).slice(-4).toUpperCase()}`
      
      await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email,
          referral_code: code,
          updated_at: new Date().toISOString()
        })

      return NextResponse.json({
        success: true,
        referralCode: code,
        referralUrl: `${request.nextUrl.origin}?ref=${code}`,
        reward: REFERRAL_REWARD
      })
    }

    if (action === 'process' && referralCode) {
      // Process referral for new user
      const { data: referrer, error } = await supabase
        .from('users')
        .select('id, email')
        .eq('referral_code', referralCode)
        .single()

      if (error || !referrer) {
        return NextResponse.json(
          { error: 'Invalid referral code' },
          { status: 400 }
        )
      }

      // Add credits to referrer
      const result = await addCredits(
        referrer.id,
        REFERRAL_REWARD,
        `Referral bonus: User ${user.id} joined AEON`
      )

      if (result.data) {
        return NextResponse.json({
          success: true,
          message: `${REFERRAL_REWARD} credits awarded to referrer`,
          referrerId: referrer.id
        })
      }

      return NextResponse.json(
        { error: 'Failed to process referral' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Referral API error:', error)
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

    // Get user's referral stats
    const { data: userData } = await supabase
      .from('users')
      .select('referral_code')
      .eq('id', user.id)
      .single()

    const { data: referrals } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('transaction_type', 'addition')
      .ilike('description', '%Referral bonus%')

    const totalReferrals = referrals?.length || 0
    const totalEarned = totalReferrals * REFERRAL_REWARD

    return NextResponse.json({
      success: true,
      referralCode: userData?.referral_code,
      referralUrl: userData?.referral_code ? `${request.nextUrl.origin}?ref=${userData.referral_code}` : null,
      stats: {
        totalReferrals,
        totalEarned,
        rewardPerReferral: REFERRAL_REWARD
      }
    })

  } catch (error) {
    console.error('Error getting referral stats:', error)
    return NextResponse.json(
      { error: 'Failed to get referral stats' },
      { status: 500 }
    )
  }
}
