import { createEnv } from "@t3-oss/env-nextjs";
import * as z from "zod";

export const env = createEnv({
  shared: {
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_API: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID: z.string().optional(),
    NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID: z.string().optional(),
  },
  server: {
    // Email Configuration (optional for builds)
    RESEND_API_KEY: z.string().optional(),

    // Clerk Authentication (optional for builds)
    CLERK_SECRET_KEY: z.string().optional(),
  },
  // Client side variables gets destructured here due to Next.js static analysis
  // Shared ones are also included here for good measure since the behavior has been inconsistent
  runtimeEnv: {
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_API: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_API,
    NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_STUDIO_MONTHLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_STUDIO_YEARLY_PRICE_ID,
    NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID: process.env.NEXT_PUBLIC_STRIPE_FREE_TRIAL_PRICE_ID,
  },
  skipValidation:
    !!process.env.SKIP_ENV_VALIDATION ||
    process.env.npm_lifecycle_event === "lint",
});
