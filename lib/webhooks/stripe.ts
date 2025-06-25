import Stripe from 'stripe'
import { supabase } from '@/lib/database'
import { SUBSCRIPTION_TIERS } from '@/lib/api'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

export async function handleStripeWebhook(event: Stripe.Event) {
  console.log('Processing Stripe webhook:', event.type)

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as Stripe.Subscription)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }
  } catch (error) {
    console.error('Error processing webhook:', error)
    throw error
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string
  const subscriptionId = session.subscription as string

  if (!customerId || !subscriptionId) {
    console.error('Missing customer or subscription ID in checkout session')
    return
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id

  // Map price ID to credit amount
  const creditAmount = getCreditAmountFromPriceId(priceId)

  if (creditAmount === 0) {
    console.error('Unknown price ID:', priceId)
    return
  }

  // Find user by Stripe customer ID
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) {
    console.error('User not found for customer ID:', customerId)
    return
  }

  // Add credits to user account
  await addCreditsToUser(user.id, creditAmount, `Subscription purchase: ${getTierNameFromPriceId(priceId)}`)

  // Update subscription status
  await updateUserSubscription(user.id, subscription)
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string
  const subscriptionId = invoice.subscription as string

  if (!customerId || !subscriptionId) return

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const priceId = subscription.items.data[0]?.price.id
  const creditAmount = getCreditAmountFromPriceId(priceId)

  if (creditAmount === 0) return

  // Find user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) return

  // Add monthly credits
  await addCreditsToUser(user.id, creditAmount, `Monthly subscription: ${getTierNameFromPriceId(priceId)}`)
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  // Find user and update subscription status
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) return

  // Update subscription status to indicate payment failure
  await supabase
    .from('users')
    .update({
      subscription_status: 'past_due',
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) return

  await updateUserSubscription(user.id, subscription)
}

async function handleSubscriptionCanceled(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('stripe_customer_id', customerId)
    .single()

  if (userError || !user) return

  // Update user to free tier
  await supabase
    .from('users')
    .update({
      subscription_status: 'canceled',
      plan_type: 'free',
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)
}

// Helper functions
function getCreditAmountFromPriceId(priceId: string): number {
  // Map your Stripe price IDs to credit amounts
  const priceMap: Record<string, number> = {
    'price_starter': SUBSCRIPTION_TIERS.STARTER.credits,
    'price_creator': SUBSCRIPTION_TIERS.CREATOR.credits,
    'price_studio': SUBSCRIPTION_TIERS.STUDIO.credits,
  }

  return priceMap[priceId] || 0
}

function getTierNameFromPriceId(priceId: string): string {
  const nameMap: Record<string, string> = {
    'price_starter': 'Starter',
    'price_creator': 'Creator',
    'price_studio': 'Studio',
  }

  return nameMap[priceId] || 'Unknown'
}

async function addCreditsToUser(userId: string, amount: number, description: string) {
  // Use the Supabase function for atomic credit updates
  const { error } = await supabase.rpc('update_user_credits', {
    user_uuid: userId,
    credit_amount: amount,
    transaction_type: 'purchase',
    description: description
  })

  if (error) {
    console.error('Error adding credits:', error)
    throw error
  }
}

async function updateUserSubscription(userId: string, subscription: Stripe.Subscription) {
  const priceId = subscription.items.data[0]?.price.id
  const planType = getTierNameFromPriceId(priceId).toLowerCase()

  await supabase
    .from('users')
    .update({
      subscription_status: subscription.status,
      plan_type: planType,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
}