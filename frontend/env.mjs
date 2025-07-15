import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    // Supabase
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_JWT_SECRET: z.string().min(1),

    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),

    // AI Service APIs
    OPENAI_API_KEY: z.string().min(1),
    REPLICATE_API_TOKEN: z.string().min(1),
    DEEPSEEK_API_KEY: z.string().min(1).optional(),
    CLAUDE_API_KEY: z.string().min(1).optional(),
    ELEVENLABS_API_KEY: z.string().min(1).optional(),

    // Vercel Blob
    BLOB_READ_WRITE_TOKEN: z.string().min(1),

    // App Config
    APP_ENV: z.enum(["development", "production", "test"]).default("development"),
    ALLOWED_ORIGINS: z.string().default("*"),
  },

  client: {
    // Frontend
    NEXT_PUBLIC_APP_URL: z.string().url(),
    
    // Supabase Public
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    
    // Stripe Public
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PRICE_STARTER_PASS: z.string().min(1).optional(),
    NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY: z.string().min(1).optional(),
    NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY: z.string().min(1).optional(),
    NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY: z.string().min(1).optional(),
    NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY: z.string().min(1).optional(),
    NEXT_PUBLIC_STRIPE_PRICE_STUDIO_MONTHLY: z.string().min(1).optional(),
    NEXT_PUBLIC_STRIPE_PRICE_STUDIO_YEARLY: z.string().min(1).optional(),
  },

  runtimeEnv: {
    // Server
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,

    // AI Service APIs
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,

    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    APP_ENV: process.env.APP_ENV,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    
    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_STRIPE_PRICE_STARTER_PASS: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_PASS,
    NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY,
    NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY,
    NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY,
    NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY,
    NEXT_PUBLIC_STRIPE_PRICE_STUDIO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_MONTHLY,
    NEXT_PUBLIC_STRIPE_PRICE_STUDIO_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_YEARLY,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
})
