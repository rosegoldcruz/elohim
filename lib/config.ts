import { env } from '../env.mjs'

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

// Authentication Configuration
export const AUTH_CONFIG = {
  clerk: {
    publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    secretKey: env.CLERK_SECRET_KEY,
  },
} as const

// Payment Configuration
export const PAYMENT_CONFIG = {
  stripe: {
    secretKey: env.STRIPE_SECRET_KEY,
    publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_API,
    webhookSecret: env.STRIPE_WEBHOOK_SECRET,
    plans: {
      freeTrial: env.NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID,
      pro: {
        monthly: env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
        yearly: env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
      },
      business: {
        monthly: env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
        yearly: env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID,
      },
      studio: {
        monthly: env.NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID,
        yearly: env.NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID,
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
    pro: {
      monthly: { credits: 1000, price: 19.99 },
      yearly: { credits: 12000, price: 199.99 },
    },
    business: {
      monthly: { credits: 2500, price: 49.99 },
      yearly: { credits: 30000, price: 499.99 },
    },
    studio: {
      monthly: { credits: 5000, price: 99.99 },
      yearly: { credits: 60000, price: 999.99 },
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
