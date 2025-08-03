/**
 * URL Configuration for AEON Platform
 * Handles dynamic URL generation based on environment
 */

// Get the base URL for the application
export const getBaseUrl = () => {
  // In production, use the production domain
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_APP_URL || 'https://smart4technology.com'
  }
  
  // In development, use localhost
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
}

// Get the API base URL
export const getApiUrl = (path: string = '') => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/api${path.startsWith('/') ? path : `/${path}`}`
}

// Get full URL for any path
export const getFullUrl = (path: string = '') => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`
}

// Auth callback URLs for Supabase
export const getAuthUrls = () => {
  const baseUrl = getBaseUrl()
  return {
    siteUrl: baseUrl,
    redirectUrls: [
      baseUrl,
      `${baseUrl}/auth/callback`,
      `${baseUrl}/login`,
      `${baseUrl}/api/auth/callback`,
      `${baseUrl}/studio`,
      `${baseUrl}/dashboard`
    ]
  }
}

// Environment-specific configurations
export const URL_CONFIG = {
  production: {
    app: process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000',
    api: `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:3000'}/api`,
  },
  development: {
    app: 'http://localhost:3000',
    api: 'http://localhost:3000/api',
  }
} as const

// Export commonly used URLs
export const URLS = {
  home: getFullUrl('/'),
  studio: getFullUrl('/studio'),
  login: getFullUrl('/login'),
  signup: getFullUrl('/signup'),
  dashboard: getFullUrl('/dashboard'),
  pricing: getFullUrl('/pricing'),
  api: {
    auth: getApiUrl('/auth'),
    user: getApiUrl('/user'),
    studio: getApiUrl('/studio'),
    video: getApiUrl('/video'),
    health: getApiUrl('/health'),
  }
} as const
