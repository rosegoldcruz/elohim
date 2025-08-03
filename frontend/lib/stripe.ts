import Stripe from 'stripe'
import { env } from '../env.mjs'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Stripe pricing configuration
export const STRIPE_PLANS = {
  STARTER: {
    name: 'AEON STARTER',
    oneTime: {
      priceId: env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_PASS || 'price_1RiUVxL0i8aKDQ0rtsV8jP',
      credits: 100,
      price: 5.99,
    },
  },
  PRO: {
    name: 'AEON PRO',
    monthly: {
      priceId: env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_1ReF56L0i8aKDQ0rZzEwTzVD',
      credits: 1000,
      price: 29.99,
    },
    yearly: {
      priceId: env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_1ReF6DL0i8aKDQ0rV0VJ7tx8',
      credits: 12000,
      price: 288.00,
    },
  },
  CREATOR: {
    name: 'AEON CREATOR',
    monthly: {
      priceId: env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY || 'price_1ReF9hL0i8aKDQ0riUb3x64F',
      credits: 3000,
      price: 59.99,
    },
    yearly: {
      priceId: env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY || 'price_1ReFAZL0i8aKDQ0rXHYNfLbw',
      credits: 36000,
      price: 588.00,
    },
  },
  STUDIO: {
    name: 'AEON STUDIO',
    monthly: {
      priceId: env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_MONTHLY || 'price_1ReFCML0i8aKDQ0rwmFoSEZP',
      credits: 8000,
      price: 149.99,
    },
    yearly: {
      priceId: env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_YEARLY || 'price_1ReFGlL0i8aKDQ0riqTF84UA',
      credits: 96000,
      price: 1140.00,
    },
  },
} as const

export type StripePlan = keyof typeof STRIPE_PLANS
export type StripePlanConfig = typeof STRIPE_PLANS[StripePlan]

// Helper function to get plan by price ID
export function getPlanByPriceId(priceId: string) {
  for (const [planKey, planConfig] of Object.entries(STRIPE_PLANS)) {
    const config = planConfig as any
    if (config.monthly?.priceId === priceId ||
        config.yearly?.priceId === priceId ||
        config.oneTime?.priceId === priceId) {
      return { key: planKey as StripePlan, config: planConfig }
    }
  }
  return null
}

// Helper function to format price
export function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price)
}
