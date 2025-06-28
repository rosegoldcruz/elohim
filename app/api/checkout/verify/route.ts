import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Retrieve the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    // Check if this is a trial subscription
    const isTrial = session.metadata?.trial === 'true'
    const planName = session.metadata?.plan || 'aeon_pro'

    // Get customer email
    const customerEmail = session.customer_details?.email || 
                         (typeof session.customer === 'object' ? session.customer?.email : null)

    if (!customerEmail) {
      return NextResponse.json(
        { error: 'Customer email not found' },
        { status: 400 }
      )
    }

    // Update user in database
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', customerEmail)
      .single()

    if (userError || !user) {
      // Create new user if not exists
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert({
          email: customerEmail,
          full_name: customerEmail.split('@')[0],
          credits: 1000, // AEON PRO credits
          subscription_tier: 'aeon_pro',
          subscription_status: isTrial ? 'trialing' : 'active',
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
          stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
        })
        .select()
        .single()

      if (createError) {
        console.error('Error creating user:', createError)
        return NextResponse.json(
          { error: 'Failed to create user account' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        trial: isTrial,
        plan: planName,
        user: newUser,
        message: isTrial ? 'Free trial started successfully' : 'Subscription activated successfully'
      })
    } else {
      // Update existing user
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({
          credits: user.credits + 1000, // Add AEON PRO credits
          subscription_tier: 'aeon_pro',
          subscription_status: isTrial ? 'trialing' : 'active',
          stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
          stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (updateError) {
        console.error('Error updating user:', updateError)
        return NextResponse.json(
          { error: 'Failed to update user account' },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        trial: isTrial,
        plan: planName,
        user: user,
        message: isTrial ? 'Free trial started successfully' : 'Subscription activated successfully'
      })
    }
  } catch (error) {
    console.error('Checkout verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify checkout session' },
      { status: 500 }
    )
  }
}
