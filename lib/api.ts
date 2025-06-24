import { supabase } from './database'

// Define proper TypeScript interfaces
export interface User {
  id: string
  email: string
  name: string
  credits: number
  created_at: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export async function fetchCredits(userId: string): Promise<ApiResponse<number>> {
  try {
    // Check if user exists in our database first
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', userId)
      .single()

    if (error) {
      // If profile doesn't exist, return default credits
      return { data: 15, error: null }
    }

    return { data: profile.credits || 15, error: null }
  } catch (error) {
    console.error('Error fetching credits:', error)
    return { data: null, error: 'Failed to fetch credits' }
  }
}

export async function getUser(): Promise<ApiResponse<User>> {
  try {
    // Get current user from Supabase auth
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return { data: null, error: 'User not authenticated' }
    }

    // Try to get user profile from our database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // If no profile exists, create one
    if (profileError) {
      const newProfile = {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || 'User',
        credits: 15,
        created_at: user.created_at
      }

      // Insert new profile
      const { error: insertError } = await supabase
        .from('profiles')
        .insert(newProfile)

      if (!insertError) {
        return { data: newProfile, error: null }
      }
    }

    // Return existing profile or fallback data
    const userData: User = {
      id: user.id,
      email: user.email || 'user@example.com',
      name: profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || 'User',
      credits: profile?.credits || 15,
      created_at: user.created_at
    }

    return { data: userData, error: null }
  } catch (error) {
    console.error('Error getting user:', error)
    return { data: null, error: 'Failed to fetch user data' }
  }
}

export async function updateUserCredits(userId: string, credits: number): Promise<ApiResponse<boolean>> {
  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({ 
        id: userId, 
        credits: credits,
        updated_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error updating credits:', error)
      return { data: null, error: 'Failed to update credits' }
    }

    return { data: true, error: null }
  } catch (error) {
    console.error('Error updating user credits:', error)
    return { data: null, error: 'Failed to update credits' }
  }
}

// Generate video function
export async function generateVideo(prompt: string): Promise<ApiResponse<any>> {
  try {
    const response = await fetch('/api/v1/agents/video-generator', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { data: null, error: result.error || 'Failed to generate video' }
    }

    return { data: result, error: null }
  } catch (error) {
    console.error('Error generating video:', error)
    return { data: null, error: 'Failed to generate video' }
  }
}

// Hook for using API functions in React components
export function useApi() {
  return {
    fetchCredits,
    getUser,
    updateUserCredits,
    generateVideo
  }
}