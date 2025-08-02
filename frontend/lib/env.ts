/**
 * AEON AI Video Generation Platform - Environment Configuration
 * Based on MIT-licensed ai-video-generator
 * License: MIT (see LICENSE file)
 * 
 * Centralized environment variable validation and configuration
 */

import { z } from 'zod'

// Environment validation schema
const envSchema = z.object({
  // Next.js Configuration
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url().default(
    process.env.NODE_ENV === 'production'
      ? 'https://smart4technology.com'
      : 'http://localhost:3000'
  ),

  // Backend Configuration
  BACKEND_URL: z.string().url().default('http://localhost:8000'),
  NEXT_PUBLIC_BACKEND_URL: z.string().url().default('http://localhost:8000'),
  
  // Supabase Configuration
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  
  // Stripe Configuration
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
  
  // AI Services Configuration
  OPENAI_API_KEY: z.string().min(1),
  REPLICATE_API_TOKEN: z.string().min(1),
  ELEVENLABS_API_KEY: z.string().optional(),
  
  // Storage Configuration
  VERCEL_BLOB_READ_WRITE_TOKEN: z.string().min(1),
  
  // Authentication
  NEXTAUTH_SECRET: z.string().min(32),
  
  // Optional Services
  SENDGRID_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),
  REDIS_URL: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_GA_ID: z.string().optional(),
  
  // Feature Flags
  FEATURE_MAGIC_LINK_AUTH: z.string().transform(val => val === 'true').default('true'),
  FEATURE_SUBSCRIPTION_PLANS: z.string().transform(val => val === 'true').default('true'),
  FEATURE_ADMIN_DASHBOARD: z.string().transform(val => val === 'true').default('true'),
  FEATURE_VIDEO_CAPTIONS: z.string().transform(val => val === 'true').default('true'),
  FEATURE_BACKGROUND_MUSIC: z.string().transform(val => val === 'true').default('true'),
  FEATURE_CUSTOM_BRANDING: z.string().transform(val => val === 'true').default('true'),
  
  // Video Configuration
  DEFAULT_VIDEO_DURATION: z.string().transform(val => parseInt(val)).default('60'),
  DEFAULT_SCENE_COUNT: z.string().transform(val => parseInt(val)).default('6'),
  DEFAULT_VIDEO_RESOLUTION: z.string().default('1920x1080'),
  DEFAULT_VIDEO_FPS: z.string().transform(val => parseInt(val)).default('30'),
  
  // Credit System
  CREDITS_30S: z.string().transform(val => parseInt(val)).default('50'),
  CREDITS_60S: z.string().transform(val => parseInt(val)).default('100'),
  CREDITS_120S: z.string().transform(val => parseInt(val)).default('150'),
  
  STARTER_MONTHLY_CREDITS: z.string().transform(val => parseInt(val)).default('1000'),
  PRO_MONTHLY_CREDITS: z.string().transform(val => parseInt(val)).default('3000'),
  BUSINESS_MONTHLY_CREDITS: z.string().transform(val => parseInt(val)).default('8000'),
  
  // Rate Limiting
  RATE_LIMIT_FREE: z.string().transform(val => parseInt(val)).default('5'),
  RATE_LIMIT_STARTER: z.string().transform(val => parseInt(val)).default('20'),
  RATE_LIMIT_PRO: z.string().transform(val => parseInt(val)).default('60'),
  RATE_LIMIT_BUSINESS: z.string().transform(val => parseInt(val)).default('200'),
  
  // Queue Configuration
  MAX_CONCURRENT_JOBS: z.string().transform(val => parseInt(val)).default('5'),
  JOB_TIMEOUT: z.string().transform(val => parseInt(val)).default('15'),
  
  // AI Models
  RUNWAY_MODEL: z.string().default('runway-ml/runway-gen3-alpha'),
  PIKA_MODEL: z.string().default('pika-labs/pika-1.0'),
  STABLE_VIDEO_MODEL: z.string().default('stability-ai/stable-video-diffusion'),
  LUMA_MODEL: z.string().default('lumalabs/dream-machine'),
  MINIMAX_MODEL: z.string().default('minimax/video-01'),
  KLING_MODEL: z.string().default('kling-ai/kling-1.0'),
})

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid environment variables:')
    if (error instanceof z.ZodError) {
      error.errors.forEach((err) => {
        console.error(`  ${err.path.join('.')}: ${err.message}`)
      })
    }
    process.exit(1)
  }
}

// Export validated environment
export const env = validateEnv()

// Environment-specific configurations
export const config = {
  // Database
  database: {
    url: env.SUPABASE_URL,
    serviceKey: env.SUPABASE_SERVICE_KEY,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // Payments
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
  },
  
  // AI Services
  ai: {
    openai: {
      apiKey: env.OPENAI_API_KEY,
    },
    replicate: {
      apiToken: env.REPLICATE_API_TOKEN,
    },
    elevenlabs: {
      apiKey: env.ELEVENLABS_API_KEY,
    },
  },
  
  // Storage
  storage: {
    vercelBlob: {
      token: env.VERCEL_BLOB_READ_WRITE_TOKEN,
    },
  },
  
  // Video Settings
  video: {
    defaultDuration: env.DEFAULT_VIDEO_DURATION,
    defaultSceneCount: env.DEFAULT_SCENE_COUNT,
    defaultResolution: env.DEFAULT_VIDEO_RESOLUTION,
    defaultFps: env.DEFAULT_VIDEO_FPS,
    models: {
      runway: env.RUNWAY_MODEL,
      pika: env.PIKA_MODEL,
      stableVideo: env.STABLE_VIDEO_MODEL,
      luma: env.LUMA_MODEL,
      minimax: env.MINIMAX_MODEL,
      kling: env.KLING_MODEL,
    },
  },
  
  // Credit System
  credits: {
    costs: {
      '30s': env.CREDITS_30S,
      '60s': env.CREDITS_60S,
      '120s': env.CREDITS_120S,
    },
    monthly: {
      starter: env.STARTER_MONTHLY_CREDITS,
      pro: env.PRO_MONTHLY_CREDITS,
      business: env.BUSINESS_MONTHLY_CREDITS,
    },
  },
  
  // Rate Limits
  rateLimits: {
    free: env.RATE_LIMIT_FREE,
    starter: env.RATE_LIMIT_STARTER,
    pro: env.RATE_LIMIT_PRO,
    business: env.RATE_LIMIT_BUSINESS,
  },
  
  // Queue
  queue: {
    maxConcurrentJobs: env.MAX_CONCURRENT_JOBS,
    jobTimeout: env.JOB_TIMEOUT,
  },
  
  // Feature Flags
  features: {
    magicLinkAuth: env.FEATURE_MAGIC_LINK_AUTH,
    subscriptionPlans: env.FEATURE_SUBSCRIPTION_PLANS,
    adminDashboard: env.FEATURE_ADMIN_DASHBOARD,
    videoCaptions: env.FEATURE_VIDEO_CAPTIONS,
    backgroundMusic: env.FEATURE_BACKGROUND_MUSIC,
    customBranding: env.FEATURE_CUSTOM_BRANDING,
  },
  
  // URLs
  urls: {
    app: env.NEXT_PUBLIC_APP_URL,
    backend: env.BACKEND_URL,
    publicBackend: env.NEXT_PUBLIC_BACKEND_URL,
  },
  
  // Environment Info
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',
}

// Utility functions
export const getApiUrl = (path: string) => {
  const baseUrl = typeof window !== 'undefined' 
    ? env.NEXT_PUBLIC_BACKEND_URL 
    : env.BACKEND_URL
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

export const getAppUrl = (path: string = '') => {
  return `${env.NEXT_PUBLIC_APP_URL}${path.startsWith('/') ? path : `/${path}`}`
}

export const getCreditCost = (duration: number): number => {
  if (duration <= 30) return config.credits.costs['30s']
  if (duration <= 60) return config.credits.costs['60s']
  if (duration <= 120) return config.credits.costs['120s']
  
  // For longer videos, calculate proportionally
  return Math.ceil((duration / 60) * config.credits.costs['60s'])
}

export const getRateLimit = (tier: string): number => {
  switch (tier) {
    case 'free': return config.rateLimits.free
    case 'starter': return config.rateLimits.starter
    case 'pro': return config.rateLimits.pro
    case 'business': return config.rateLimits.business
    default: return config.rateLimits.free
  }
}

export const getMonthlyCredits = (tier: string): number => {
  switch (tier) {
    case 'starter': return config.credits.monthly.starter
    case 'pro': return config.credits.monthly.pro
    case 'business': return config.credits.monthly.business
    default: return 0
  }
}

// Environment validation for client-side
export const validateClientEnv = () => {
  const requiredClientVars = [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_BACKEND_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  ]
  
  const missing = requiredClientVars.filter(
    (varName) => !process.env[varName]
  )
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required client environment variables: ${missing.join(', ')}`
    )
  }
}

// Log environment status
if (config.isDevelopment) {
  console.log('🔧 Environment Configuration:')
  console.log(`  Mode: ${env.NODE_ENV}`)
  console.log(`  App URL: ${env.NEXT_PUBLIC_APP_URL}`)
  console.log(`  Backend URL: ${env.BACKEND_URL}`)
  console.log(`  Features: ${Object.entries(config.features)
    .filter(([, enabled]) => enabled)
    .map(([name]) => name)
    .join(', ')}`)
}
