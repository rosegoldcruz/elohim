import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Get the current path
  const path = req.nextUrl.pathname

  // ONLY protect these specific routes (require login)
  const protectedRoutes = [
    '/studio',
    '/account',
    '/dashboard'
  ]

  // PUBLIC routes that should NOT require login
  const publicRoutes = [
    '/',
    '/pricing',
    '/marketing', 
    '/analytics',
    '/image',
    '/audio',
    '/gallery',
    '/launch-ai-campaign',
    '/login',
    '/signup'
  ]

  // If it's a public route, let it through
  if (publicRoutes.includes(path)) {
    return res
  }

  // If it's an API route, let it through
  if (path.startsWith('/api/')) {
    return res
  }

  // Only check authentication for protected routes
  if (protectedRoutes.includes(path)) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If no user and trying to access protected route, redirect to login
    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}