import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    // Stripe Configuration (optional for builds)
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),

    // AI Services (optional for builds)
    OPENAI_API_KEY: z.string().optional(),
    REPLICATE_API_TOKEN: z.string().optional(),

    // Supabase Configuration (optional for builds)
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

    // Vercel Blob Storage (optional for builds)
    BLOB_READ_WRITE_TOKEN: z.string().optional(),

    // LLM Configuration (optional for builds, defaults for Docker Model Runner)
    LLM_MODE: z.enum(['local', 'openai', 'claude', 'replicate']).optional().default('openai'),
    LOCAL_LLM_HOST: z.string().url().optional().default('http://localhost:12434'),

    // Admin Configuration (optional)
    ADMIN_EMAIL: z.string().optional(),
  },
  client: {
    // App URL (optional for builds, will use Vercel URL in production)
    NEXT_PUBLIC_APP_URL: z.string().optional(),

    // Clerk Authentication (handled by Clerk automatically)
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().optional(),

    // Supabase Client Configuration (optional for builds)
    NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

    // Stripe Product Configuration (optional)
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_API: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID: z.string().optional(),

    // Analytics (optional)
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
  },
  runtimeEnv: {
    // Server variables
    STRIPE_API_KEY: process.env.STRIPE_API_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
    LLM_MODE: process.env.LLM_MODE,
    LOCAL_LLM_HOST: process.env.LOCAL_LLM_HOST,
    ADMIN_EMAIL: process.env.ADMIN_EMAIL,

    // Client variables
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
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
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION || process.env.NODE_ENV === 'production',
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
