'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { usePostHog } from 'posthog-js/react'

function PageViewTrackerClient() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthog = usePostHog()

  useEffect(() => {
    if (pathname && posthog) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }

      // Track page view with AEON-specific context
      posthog.capture('$pageview', {
        $current_url: url,
        page_name: getPageName(pathname),
        page_category: getPageCategory(pathname),
        timestamp: new Date().toISOString(),
      })
    }
  }, [pathname, searchParams, posthog])

  return null
}

export default function PageViewTracker() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return null
  }

  return <PageViewTrackerClient />
}



function getPageName(pathname: string): string {
  const routes: Record<string, string> = {
    '/': 'Home',
    '/studio': 'Studio',
    '/generate': 'Generate Video',
    '/pricing': 'Pricing',
    '/account': 'Account',
    '/dashboard': 'Dashboard',
    '/projects': 'Projects',
    '/templates': 'Templates',
    '/analytics': 'Analytics',
    '/settings': 'Settings',
    '/help': 'Help',
    '/sign-in': 'Sign In',
    '/sign-up': 'Sign Up',
  }

  // Handle dynamic routes
  if (pathname.startsWith('/project/')) return 'Project Detail'
  if (pathname.startsWith('/video/')) return 'Video Detail'
  if (pathname.startsWith('/template/')) return 'Template Detail'
  
  return routes[pathname] || pathname
}

function getPageCategory(pathname: string): string {
  if (pathname === '/') return 'marketing'
  if (pathname.startsWith('/studio') || pathname.startsWith('/generate')) return 'creation'
  if (pathname.startsWith('/project') || pathname.startsWith('/video')) return 'content'
  if (pathname.startsWith('/account') || pathname.startsWith('/settings')) return 'account'
  if (pathname.startsWith('/pricing')) return 'billing'
  if (pathname.startsWith('/sign-')) return 'auth'
  if (pathname.startsWith('/help')) return 'support'
  
  return 'other'
}
