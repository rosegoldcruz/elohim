import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login', '/signup', '/privacy', '/terms', '/pricing', '/docs']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith(route))

  // Check for Clerk session token
  const sessionToken = request.cookies.get('__session')?.value

  // If accessing protected route without session, redirect to sign-in
  if (!isPublicRoute && !sessionToken) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // If accessing auth routes with session, redirect to studio
  if ((pathname === '/sign-in' || pathname === '/sign-up') && sessionToken) {
    return NextResponse.redirect(new URL('/studio', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
