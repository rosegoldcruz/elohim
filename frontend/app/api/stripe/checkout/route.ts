import { NextRequest, NextResponse } from 'next/server'
// import { stripe } from '@/lib/stripe'
// import { getSession } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { priceId, successUrl, cancelUrl } = await request.json()

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      )
    }

    // TODO: Restore Stripe checkout integration after deployment
    return NextResponse.json(
      {
        error: 'Stripe checkout temporarily disabled during build optimization',
        message: 'Stripe integration will be restored after deployment',
        requested_price_id: priceId
      },
      { status: 503 }
    )
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
