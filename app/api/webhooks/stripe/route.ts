import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { env } from '@/env.mjs'
import { sendVideoCompleteEmail } from '@/lib/email'
import { logInfo, logError } from '@/lib/telemetry'
import { queueVideoGeneration } from '@/lib/video-generation'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break

      case 'invoice.payment_succeeded':
        await handleSubscriptionPayment(event.data.object)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object)
        break

      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    await logError(error as Error, {
      metadata: { event_type: event.type, event_id: event.id }
    })
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: any) {
  console.log('Processing checkout completion:', session.id)

  const { order_id, user_id, video_prompt, video_style, duration, credits } = session.metadata

  if (!order_id) {
    console.error('No order_id in session metadata')
    return
  }

  try {
    // Update order status
    const { error: orderError } = await supabaseAdmin
      .from('orders')
      .update({
        status: 'processing',
        stripe_payment_intent_id: session.payment_intent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order_id)

    if (orderError) {
      console.error('Error updating order:', orderError)
      return
    }

    // Add credits to user account
    const { error: creditError } = await supabaseAdmin.rpc('add_credits', {
      p_user_id: user_id,
      p_amount: parseInt(credits),
      p_type: 'purchase',
      p_description: `Instant video purchase - ${duration}s video`,
      p_order_id: order_id,
      p_stripe_payment_intent_id: session.payment_intent,
    })

    if (creditError) {
      console.error('Error adding credits:', creditError)
    }

    // Create video generation job
    const videoCost = Math.ceil(parseInt(duration) / 60) * 100 // 100 credits per 60s
    
    const { data: videoJob, error: jobError } = await supabaseAdmin
      .from('video_jobs')
      .insert({
        user_id,
        order_id,
        prompt: video_prompt,
        style: video_style,
        duration: parseInt(duration),
        status: 'queued',
        priority: 1, // Instant purchases get priority
        scenes_total: 6,
        credits_used: videoCost,
        quality_tier: 'pro',
        includes_watermark: false,
        includes_voiceover: false,
        includes_captions: true,
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error creating video job:', jobError)
      return
    }

    // Deduct credits for video generation
    const { error: deductError } = await supabaseAdmin.rpc('use_credits', {
      p_user_id: user_id,
      p_amount: videoCost,
      p_description: `Video generation - ${duration}s ${video_style} style`,
      p_video_job_id: videoJob.id,
    })

    if (deductError) {
      console.error('Error deducting credits:', deductError)
    }

    // Send confirmation email
    try {
      // This would integrate with your email service
      console.log(`Sending confirmation email to ${session.customer_email}`)
      
      // Log successful processing
      await logInfo('Instant video order processed', {
        order_id,
        user_id,
        video_job_id: videoJob.id,
        amount: session.amount_total / 100,
      })
    } catch (emailError) {
      console.error('Error sending email:', emailError)
    }

    // Trigger video generation
    await queueVideoGeneration(videoJob.id)

  } catch (error) {
    console.error('Error processing checkout completion:', error)
    
    // Update order status to failed
    await supabaseAdmin
      .from('orders')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', order_id)
  }
}

async function handleSubscriptionPayment(invoice: any) {
  console.log('Processing subscription payment:', invoice.id)

  const customerId = invoice.customer
  const subscriptionId = invoice.subscription

  // Get user by Stripe customer ID
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id

  // Get plan details
  const { data: plan, error: planError } = await supabaseAdmin
    .from('subscription_plans')
    .select('*')
    .eq('stripe_price_id', priceId)
    .single()

  if (planError || !plan) {
    console.error('Plan not found for price:', priceId)
    return
  }

  // Process subscription renewal
  const { error: renewalError } = await supabaseAdmin.rpc('process_subscription_renewal', {
    p_user_id: user.id,
    p_stripe_subscription_id: subscriptionId,
    p_plan_slug: plan.slug,
    p_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    p_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  })

  if (renewalError) {
    console.error('Error processing subscription renewal:', renewalError)
  } else {
    await logInfo('Subscription renewed', {
      user_id: user.id,
      plan: plan.slug,
      credits_added: plan.credits_monthly,
    })
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  console.log('Processing subscription update:', subscription.id)

  const customerId = subscription.customer

  // Get user by Stripe customer ID
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Update user subscription status
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      subscription_status: subscription.status,
      stripe_subscription_id: subscription.id,
      subscription_current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      subscription_current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating user subscription:', updateError)
  }
}

async function handleSubscriptionCanceled(subscription: any) {
  console.log('Processing subscription cancellation:', subscription.id)

  const customerId = subscription.customer

  // Get user by Stripe customer ID
  const { data: user, error: userError } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer:', customerId)
    return
  }

  // Update user subscription status
  const { error: updateError } = await supabaseAdmin
    .from('users')
    .update({
      subscription_status: 'canceled',
      subscription_tier: 'free',
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('Error updating user subscription:', updateError)
  } else {
    await logInfo('Subscription canceled', {
      user_id: user.id,
      subscription_id: subscription.id,
    })
  }
}

async function handlePaymentFailed(paymentIntent: any) {
  console.log('Processing payment failure:', paymentIntent.id)

  // Find order by payment intent
  const { data: order, error: orderError } = await supabaseAdmin
    .from('orders')
    .select('*')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single()

  if (orderError || !order) {
    console.error('Order not found for payment intent:', paymentIntent.id)
    return
  }

  // Update order status to failed
  const { error: updateError } = await supabaseAdmin
    .from('orders')
    .update({
      status: 'failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  if (updateError) {
    console.error('Error updating failed order:', updateError)
  }
}


