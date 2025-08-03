import { env } from '@/env.mjs'

// Application Configuration
export const APP_CONFIG = {
  name: 'AEON',
  description: 'AI Video Generation Platform',
  version: '1.0.0',
  url: env.NEXT_PUBLIC_APP_URL,
  environment: env.APP_ENV,
  port: env.PORT,
} as const

// Database Configuration
export const DATABASE_CONFIG = {
  url: env.DATABASE_URL,
  postgresUrl: env.POSTGRES_URL,
} as const

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: env.SUPABASE_URL,
  anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  jwtSecret: env.SUPABASE_JWT_SECRET,
} as const

// Authentication Configuration (using Supabase)
export const AUTH_CONFIG = {
  supabase: {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
} as const

// Payment Configuration
export const PAYMENT_CONFIG = {
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_API,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    plans: {
      starter: {
        pass: env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_PASS || 'price_1RiUVxL0i8aKDQ0rtsV8jP',
      },
      pro: {
        monthly: env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_1ReF56L0i8aKDQ0rZzEwTzVD',
        yearly: env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || 'price_1ReF6DL0i8aKDQ0rV0VJ7tx8',
      },
      creator: {
        monthly: env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY || 'price_1ReF9hL0i8aKDQ0riUb3x64F',
        yearly: env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY || 'price_1ReFAZL0i8aKDQ0rXHYNfLbw',
      },
      studio: {
        monthly: env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_MONTHLY || 'price_1ReFCML0i8aKDQ0rwmFoSEZP',
        yearly: env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_YEARLY || 'price_1ReFGlL0i8aKDQ0riqTF84UA',
      },
    },
  },
} as const

// AI Services Configuration
export const AI_CONFIG = {
  openai: {
    apiKey: env.OPENAI_API_KEY,
  },
  claude: {
    apiKey: env.CLAUDE_API_KEY,
  },
  replicate: {
    apiToken: env.REPLICATE_API_TOKEN,
  },
  elevenlabs: {
    apiKey: env.ELEVENLABS_API_KEY,
  },
} as const

// Email Configuration
export const EMAIL_CONFIG = {
  emailjs: {
    serviceId: env.EMAILJS_SERVICE_ID,
    templateId: env.EMAILJS_TEMPLATE_ID,
  },
} as const

// Telemetry Configuration
export const TELEMETRY_CONFIG = {
  dash0: {
    authToken: env.DASH0_AUTH_TOKEN,
    endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
    logDrainEndpoint: env.DASH0_LOG_DRAIN_ENDPOINT,
    dataset: env.DASH0_DATASET,
    compression: env.OTEL_EXPORTER_OTLP_COMPRESSION,
  },
  elohim: {
    authToken: env.elohim_DASH0_AUTH_TOKEN,
    endpoint: env.elohim_OTEL_EXPORTER_OTLP_ENDPOINT,
    logDrainEndpoint: env.elohim_DASH0_LOG_DRAIN_ENDPOINT,
    dataset: env.elohim_DASH0_DATASET,
    compression: env.elohim_OTEL_EXPORTER_OTLP_COMPRESSION,
    headers: env.elohim_OTEL_EXPORTER_OTLP_HEADERS,
  },
} as const

// Credit System Configuration
export const CREDIT_CONFIG = {
  videoGenerationCost: 100, // 100 credits per 60-second video
  freeTrialCredits: 100,
  plans: {
    starter: {
      oneTime: { credits: 100, price: 5.99 },
    },
    pro: {
      monthly: { credits: 1000, price: 29.99 },
      yearly: { credits: 12000, price: 288.00 },
    },
    creator: {
      monthly: { credits: 3000, price: 59.99 },
      yearly: { credits: 36000, price: 588.00 },
    },
    studio: {
      monthly: { credits: 8000, price: 149.99 },
      yearly: { credits: 96000, price: 1140.00 },
    },
  },
} as const

// Video Generation Configuration
export const VIDEO_CONFIG = {
  maxDuration: 60, // seconds
  supportedFormats: ['mp4', 'webm', 'mov'],
  maxFileSize: 100 * 1024 * 1024, // 100MB
  models: {
    runway: 'runway-ml/runway-gen3-alpha',
    pika: 'pika-labs/pika-1.0',
    stableVideo: 'stability-ai/stable-video-diffusion',
    luma: 'lumalabs/dream-machine',
    minimax: 'minimax/video-01',
    kling: 'kling-ai/kling-1.0',
  },
} as const

// API Rate Limits
export const RATE_LIMITS = {
  videoGeneration: {
    free: 5, // per day
    pro: 50, // per day
    business: 100, // per day
    studio: 500, // per day
  },
  apiCalls: {
    perMinute: 60,
    perHour: 1000,
    perDay: 10000,
  },
} as const

// Feature Flags
export const FEATURES = {
  enableVideoGeneration: true,
  enableAudioGeneration: true,
  enableImageGeneration: true,
  enableBatchProcessing: true,
  enableAdvancedEditing: true,
  enableCollaboration: false, // Coming soon
  enableAPIAccess: true,
} as const

// Export all configurations
export const CONFIG = {
  app: APP_CONFIG,
  database: DATABASE_CONFIG,
  supabase: SUPABASE_CONFIG,
  auth: AUTH_CONFIG,
  payment: PAYMENT_CONFIG,
  ai: AI_CONFIG,
  email: EMAIL_CONFIG,
  telemetry: TELEMETRY_CONFIG,
  credits: CREDIT_CONFIG,
  video: VIDEO_CONFIG,
  rateLimits: RATE_LIMITS,
  features: FEATURES,
} as const

export default CONFIG
