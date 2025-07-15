/**
 * AEON Supabase Server
 * Server-side Supabase client with service role access
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createClient = async () => {
  const cookieStore = await cookies()

  return createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        )
      },
    },
  })
}

export function createServiceClient() {
  // Use service role key for admin operations
  const serviceKey = process.env.SERVICE_ROLE_KEY!

  return createServerClient(supabaseUrl, serviceKey, {
    cookies: {
      getAll() {
        return []
      },
      setAll() {
        // No-op for service client
      },
    },
  })
}

