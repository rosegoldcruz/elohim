'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from './client'
import type { SupabaseClient } from '@supabase/supabase-js'

type SupabaseContext = {
  supabase: SupabaseClient
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export function SupabaseProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [supabase] = useState(() => createClient())

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)

        // Handle auth state changes without page reload
        if (event === 'SIGNED_IN') {
          // User just signed in - redirect to studio
          if (typeof window !== 'undefined') {
            window.location.href = '/studio'
          }
        } else if (event === 'SIGNED_OUT') {
          // User signed out - redirect to home
          if (typeof window !== 'undefined') {
            window.location.href = '/'
          }
        }
        // Remove automatic reload for TOKEN_REFRESHED to prevent loops
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  return (
    <Context.Provider value={{ supabase }}>
      {children}
    </Context.Provider>
  )
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error('useSupabase must be used inside SupabaseProvider')
  }
  return context
}