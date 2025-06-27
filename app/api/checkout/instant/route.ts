import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { env } from '@/env.mjs'
import { z } from 'zod'

const InstantCheckoutSchema = z.object({
  email: z.string().email(),
  video_prompt: z.string().min(10).max(1000),
  video_style: z.string(),
  duration: z.number().min(30).max(180),
  amount: z.number().positive(),
  credits: z.number().positive(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = InstantCheckoutSchema.parse(body)

    const { email, video_prompt, video_style, duration, amount, credits } = validatedData

    // Check if user exists, create if not
    let user = null
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      user = existingUser
    } else {
      // Create new user
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert({
          email,
          full_name: email.split('@')[0], // Use email prefix as name
          credits: 0,
          subscription_tier: 'free_trial',
          subscription_status: 'inactive',
        })
        .select()
        .single()

      if (userError) {
        console.error('Error creating user:', userError)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
      }

      user = newUser
    }

    // Create or get Stripe customer
    let stripeCustomerId = user.stripe_customer_id

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        name: user.full_name || email.split('@')[0],
        metadata: {
          user_id: user.id,
        },
      })

      stripeCustomerId = customer.id

      // Update user with Stripe customer ID
      await supabaseAdmin
        .from('users')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id)
    }

    // Create pending order
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: user.id,
        email,
        amount,
        credits_purchased: credits,
        video_prompt,
        video_style,
        status: 'pending',
        video_duration: duration,
      })
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `AEON Video Generation - ${duration}s`,
              description: `${video_style} style video: "${video_prompt.substring(0, 100)}..."`,
              images: [`${env.NEXT_PUBLIC_APP_URL}/placeholder-video.jpg`],
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${env.NEXT_PUBLIC_APP_URL}/instant/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/instant?canceled=true`,
      metadata: {
        order_id: order.id,
        user_id: user.id,
        video_prompt,
        video_style,
        duration: duration.toString(),
        credits: credits.toString(),
      },
      customer_email: email,
      billing_address_collection: 'auto',
    })

    // Update order with session ID
    await supabaseAdmin
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', order.id)

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
