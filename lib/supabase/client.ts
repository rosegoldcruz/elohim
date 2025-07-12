/**
 * AEON Supabase Client
 * Browser-safe Supabase client for client-side operations
 */

import { createBrowserClient } from '@supabase/ssr'
import { env } from '@/env.mjs'

export function createClient() {
  // Use environment variables with fallbacks for development
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Export singleton instance
export const supabase = createClient()
