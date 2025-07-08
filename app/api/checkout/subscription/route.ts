import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { clerkClient } from '@clerk/nextjs/server'
import { env } from '@/env.mjs'
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

    const validatedData = SubscriptionCheckoutSchema.parse({
      price_id,
      plan,
      trial,
      email,
    })

    // Map price IDs to environment variables
    const priceIdMap: Record<string, string> = {
      'pro_monthly': process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!,
      'pro_yearly': process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID!,
      'creator_monthly': process.env.NEXT_PUBLIC_STRIPE_CREATOR_MONTHLY_PRICE_ID || 'price_creator_monthly',
      'creator_yearly': process.env.NEXT_PUBLIC_STRIPE_CREATOR_YEARLY_PRICE_ID || 'price_creator_yearly',
      'studio_monthly': process.env.NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID || 'price_studio_monthly',
      'studio_yearly': process.env.NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID || 'price_studio_yearly',
    }

    // For free trial, always use AEON PRO Monthly price ID
    const finalPriceId = trial
      ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!
      : priceIdMap[validatedData.price_id] || validatedData.price_id

    // Create or get Stripe customer
    let customer
    if (validatedData.email) {
      // Try to find existing customer
      const existingCustomers = await stripe.customers.list({
        email: validatedData.email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: validatedData.email,
          metadata: {
            plan: validatedData.plan,
            trial: trial.toString(),
          },
        })
      }
    }

    // Create checkout session
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        plan: validatedData.plan,
        trial: trial.toString(),
      },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
    }

    // Add customer if we have one
    if (customer) {
      sessionConfig.customer = customer.id
    } else {
      sessionConfig.customer_email = validatedData.email
    }

    // Add trial period for free trial
    if (trial) {
      sessionConfig.subscription_data = {
        trial_period_days: 7,
        metadata: {
          plan: 'aeon_pro',
          trial: 'true',
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.redirect(session.url!)
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

    // Map price IDs to environment variables
    const priceIdMap: Record<string, string> = {
      'pro_monthly': process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!,
      'pro_yearly': process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID!,
      'creator_monthly': process.env.NEXT_PUBLIC_STRIPE_CREATOR_MONTHLY_PRICE_ID || 'price_creator_monthly',
      'creator_yearly': process.env.NEXT_PUBLIC_STRIPE_CREATOR_YEARLY_PRICE_ID || 'price_creator_yearly',
      'studio_monthly': process.env.NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID || 'price_studio_monthly',
      'studio_yearly': process.env.NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID || 'price_studio_yearly',
    }

    // For free trial, always use AEON PRO Monthly price ID
    const finalPriceId = validatedData.trial
      ? process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID!
      : priceIdMap[validatedData.price_id] || validatedData.price_id

    // Create or get Stripe customer
    let customer
    if (validatedData.email) {
      // Try to find existing customer
      const existingCustomers = await stripe.customers.list({
        email: validatedData.email,
        limit: 1,
      })

      if (existingCustomers.data.length > 0) {
        customer = existingCustomers.data[0]
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: validatedData.email,
          metadata: {
            plan: validatedData.plan,
            trial: validatedData.trial.toString(),
          },
        })
      }
    }

    // Create checkout session
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: finalPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: {
        plan: validatedData.plan,
        trial: validatedData.trial.toString(),
      },
      billing_address_collection: 'auto',
      allow_promotion_codes: true,
    }

    // Add customer if we have one
    if (customer) {
      sessionConfig.customer = customer.id
    } else {
      sessionConfig.customer_email = validatedData.email
    }

    // Add trial period for free trial
    if (validatedData.trial) {
      sessionConfig.subscription_data = {
        trial_period_days: 7,
        metadata: {
          plan: 'aeon_pro',
          trial: 'true',
        },
      }
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    return NextResponse.json({ url: session.url })
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
