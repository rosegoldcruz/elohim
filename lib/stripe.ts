import Stripe from 'stripe'
import { env } from '../env.mjs'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Stripe pricing configuration
export const STRIPE_PLANS = {
  FREE_TRIAL: {
    name: 'Free Trial',
    priceId: env.NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID,
    credits: 100,
    price: 0,
  },
  PRO: {
    name: 'Pro',
    monthly: {
      priceId: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      credits: 1000,
      price: 19.99,
    },
    yearly: {
      priceId: env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
      credits: 12000,
      price: 199.99,
    },
  },
  BUSINESS: {
    name: 'Creator',
    monthly: {
      priceId: env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
      credits: 2500,
      price: 49.99,
    },
    yearly: {
      priceId: env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID,
      credits: 30000,
      price: 499.99,
    },
  },
  STUDIO: {
    name: 'Studio',
    monthly: {
      priceId: env.NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID,
      credits: 5000,
      price: 99.99,
    },
    yearly: {
      priceId: env.NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID,
      credits: 60000,
      price: 999.99,
    },
  },
} as const

export type StripePlan = keyof typeof STRIPE_PLANS
export type StripePlanConfig = typeof STRIPE_PLANS[StripePlan]

// Helper function to get plan by price ID
export function getPlanByPriceId(priceId: string) {
  for (const [planKey, planConfig] of Object.entries(STRIPE_PLANS)) {
    if (planKey === 'FREE_TRIAL') {
      if (planConfig.priceId === priceId) {
        return { key: planKey as StripePlan, config: planConfig }
      }
    } else {
      const config = planConfig as any
      if (config.monthly?.priceId === priceId || config.yearly?.priceId === priceId) {
        return { key: planKey as StripePlan, config: planConfig }
      }
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
