import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { handleStripeWebhook } from '@/lib/webhooks/stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing Stripe signature')
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      )
    }

    // Log the webhook for debugging
    console.log('Received Stripe webhook:', {
      type: event.type,
      id: event.id,
      created: event.created
    })

    // Process the webhook
    await handleStripeWebhook(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error processing Stripe webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Disable body parsing for webhooks
export const runtime = 'nodejs'
