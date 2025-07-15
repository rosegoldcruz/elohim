import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

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

    // Find user in Clerk by email
    const users = await clerkClient.users.getUserList({
      emailAddress: [customerEmail]
    })

    if (users.data.length === 0) {
      // User not found in Clerk - they need to sign up first
      return NextResponse.json({
        error: 'User not found. Please sign up first.',
        redirect: '/sign-up'
      }, { status: 404 })
    }

    const user = users.data[0]

    // Update user metadata in Clerk with subscription info
    await clerkClient.users.updateUser(user.id, {
      publicMetadata: {
        ...user.publicMetadata,
        credits: (user.publicMetadata?.credits as number || 0) + 1000, // Add AEON PRO credits
        subscription_tier: 'aeon_pro',
        subscription_status: isTrial ? 'trialing' : 'active',
        stripe_customer_id: typeof session.customer === 'string' ? session.customer : session.customer?.id,
        stripe_subscription_id: typeof session.subscription === 'string' ? session.subscription : session.subscription?.id,
        updated_at: new Date().toISOString(),
      }
    })

    return NextResponse.json({
      success: true,
      trial: isTrial,
      plan: planName,
      user: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        full_name: user.fullName || user.firstName || 'User',
        credits: (user.publicMetadata?.credits as number || 0) + 1000,
        subscription_tier: 'aeon_pro',
        subscription_status: isTrial ? 'trialing' : 'active',
      },
      message: isTrial ? 'Free trial started successfully' : 'Subscription activated successfully'
    })
  } catch (error) {
    console.error('Checkout verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify checkout session' },
      { status: 500 }
    )
  }
}
