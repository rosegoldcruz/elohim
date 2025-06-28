import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // Supabase
    SUPABASE_URL: z.string().url(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
    SUPABASE_JWT_SECRET: z.string().min(1),
    DATABASE_URL: z.string().url(),
    POSTGRES_URL: z.string().url(),
    
    // Authentication (Supabase handles this)
    
    // Stripe
    STRIPE_SECRET_KEY: z.string().min(1),
    STRIPE_WEBHOOK_SECRET: z.string().min(1),
    
    // AI APIs
    OPENAI_API_KEY: z.string().min(1),
    CLAUDE_API_KEY: z.string().min(1),
    REPLICATE_API_TOKEN: z.string().min(1),
    ELEVENLABS_API_KEY: z.string().min(1),
    
    // EmailJS
    EMAILJS_SERVICE_ID: z.string().min(1),
    EMAILJS_TEMPLATE_ID: z.string().min(1),
    
    // Dash0 Telemetry
    DASH0_AUTH_TOKEN: z.string().min(1),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url(),
    DASH0_LOG_DRAIN_ENDPOINT: z.string().url(),
    DASH0_DATASET: z.string().min(1),
    OTEL_EXPORTER_OTLP_COMPRESSION: z.string().min(1),
    AUTHORIZATION: z.string().optional(),
    
    // Elohim specific Dash0
    elohim_OTEL_EXPORTER_OTLP_HEADERS: z.string().min(1),
    elohim_DASH0_DATASET: z.string().min(1),
    elohim_OTEL_EXPORTER_OTLP_COMPRESSION: z.string().min(1),
    elohim_DASH0_AUTH_TOKEN: z.string().min(1),
    elohim_DASH0_LOG_DRAIN_ENDPOINT: z.string().url(),
    elohim_OTEL_EXPORTER_OTLP_ENDPOINT: z.string().url(),
    
    // App Config
    APP_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT: z.string().transform(Number).pipe(z.number().int().positive()).default("3000"),
    ALLOWED_ORIGINS: z.string().default("*"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // Frontend
    NEXT_PUBLIC_APP_URL: z.string().url(),
    
    // Supabase Public
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    
    // Authentication handled by Supabase
    
    // Stripe Public
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_API: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_CREATOR_MONTHLY_PRICE_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_CREATOR_YEARLY_PRICE_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID: z.string().min(1),
    NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID: z.string().min(1),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    // Server
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    SUPABASE_JWT_SECRET: process.env.SUPABASE_JWT_SECRET,
    DATABASE_URL: process.env.DATABASE_URL,
    POSTGRES_URL: process.env.POSTGRES_URL,

    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    ELEVENLABS_API_KEY: process.env.ELEVENLABS_API_KEY,
    EMAILJS_SERVICE_ID: process.env.EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID,
    DASH0_AUTH_TOKEN: process.env.DASH0_AUTH_TOKEN,
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    DASH0_LOG_DRAIN_ENDPOINT: process.env.DASH0_LOG_DRAIN_ENDPOINT,
    DASH0_DATASET: process.env.DASH0_DATASET,
    OTEL_EXPORTER_OTLP_COMPRESSION: process.env.OTEL_EXPORTER_OTLP_COMPRESSION,
    AUTHORIZATION: process.env.AUTHORIZATION,
    elohim_OTEL_EXPORTER_OTLP_HEADERS: process.env.elohim_OTEL_EXPORTER_OTLP_HEADERS,
    elohim_DASH0_DATASET: process.env.elohim_DASH0_DATASET,
    elohim_OTEL_EXPORTER_OTLP_COMPRESSION: process.env.elohim_OTEL_EXPORTER_OTLP_COMPRESSION,
    elohim_DASH0_AUTH_TOKEN: process.env.elohim_DASH0_AUTH_TOKEN,
    elohim_DASH0_LOG_DRAIN_ENDPOINT: process.env.elohim_DASH0_LOG_DRAIN_ENDPOINT,
    elohim_OTEL_EXPORTER_OTLP_ENDPOINT: process.env.elohim_OTEL_EXPORTER_OTLP_ENDPOINT,
    APP_ENV: process.env.APP_ENV,
    PORT: process.env.PORT,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
    
    // Client
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,

    NEXT_PUBLIC_STRIPE_PUBLISHABLE_API: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_API,
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID,
  },
  /**
   * Run `build` or `dev` with SKIP_ENV_VALIDATION to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
})
