import { NextRequest, NextResponse } from 'next/server'
// import { stripe } from '@/lib/stripe'
// import { createClient } from '@/lib/supabase/server'
// import { env } from '@/env.mjs'
import { z } from 'zod'

const SubscriptionCheckoutSchema = z.object({
  price_id: z.string().min(1),
  plan: z.string().min(1),
  trial: z.boolean().optional().default(false),
  email: z.string().email().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const price_id = searchParams.get('price_id')
    const plan = searchParams.get('plan')
    const trial = searchParams.get('trial') === 'true'
    const email = searchParams.get('email')

    // TODO: Implement Stripe checkout when environment is properly configured
    return NextResponse.json(
      {
        error: 'Checkout temporarily disabled during build optimization',
        message: 'Stripe integration will be restored after deployment',
        requested_plan: plan,
        requested_price_id: price_id,
        trial_requested: trial
      },
      { status: 503 }
    )
  } catch (error) {
    console.error('Subscription checkout error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = SubscriptionCheckoutSchema.parse(body)

    // TODO: Implement Stripe checkout when environment is properly configured
    return NextResponse.json(
      {
        error: 'Checkout temporarily disabled during build optimization',
        message: 'Stripe integration will be restored after deployment',
        requested_plan: validatedData.plan,
        requested_price_id: validatedData.price_id,
        trial_requested: validatedData.trial
      },
      { status: 503 }
    )
  } catch (error) {
    console.error('Subscription checkout error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
