import Stripe from 'stripe'
import { env } from '../env.mjs'

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
  typescript: true,
})

// Stripe pricing configuration
export const STRIPE_PLANS = {
  PRO: {
    name: 'AEON PRO',
    monthly: {
      priceId: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
      credits: 1000,
      price: 29.99,
    },
    yearly: {
      priceId: env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
      credits: 12000,
      price: 288,
    },
  },
  CREATOR: {
    name: 'AEON CREATOR',
    monthly: {
      priceId: env.NEXT_PUBLIC_STRIPE_CREATOR_MONTHLY_PRICE_ID || 'price_creator_monthly',
      credits: 3000,
      price: 59.99,
    },
    yearly: {
      priceId: env.NEXT_PUBLIC_STRIPE_CREATOR_YEARLY_PRICE_ID || 'price_creator_yearly',
      credits: 36000,
      price: 588,
    },
  },
  STUDIO: {
    name: 'AEON STUDIO',
    monthly: {
      priceId: env.NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID || 'price_studio_monthly',
      credits: 8000,
      price: 149.99,
    },
    yearly: {
      priceId: env.NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID || 'price_studio_yearly',
      credits: 96000,
      price: 1440,
    },
  },
} as const

export type StripePlan = keyof typeof STRIPE_PLANS
export type StripePlanConfig = typeof STRIPE_PLANS[StripePlan]

// Helper function to get plan by price ID
export function getPlanByPriceId(priceId: string) {
  for (const [planKey, planConfig] of Object.entries(STRIPE_PLANS)) {
    const config = planConfig as any
    if (config.monthly?.priceId === priceId || config.yearly?.priceId === priceId) {
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
