import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  // Core public pages
  '/',                    // Homepage - always public
  '/sign-in(.*)',        // Clerk sign-in pages
  '/sign-up(.*)',        // Clerk sign-up pages

  // Custom auth routes (if using custom auth alongside Clerk)
  '/auth/login(.*)',     // Custom login page
  '/auth/verify(.*)',    // Email verification page

  // Marketing and public pages
  '/pricing(.*)',        // Pricing page - usually public
  '/marketing(.*)',      // Marketing pages

  // Instant video purchase (public for non-authenticated users)
  '/instant(.*)',        // Instant video generation
  '/instant/success(.*)', // Payment success page

  // Public API routes (webhooks, etc.)
  '/api/webhooks(.*)',   // Stripe webhooks - must be public
  '/api/auth(.*)',       // Auth API routes
]);

export default clerkMiddleware(async (auth, req) => {
  // Only protect routes that are not public
  if (!isPublicRoute(req)) {
    await auth().protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
