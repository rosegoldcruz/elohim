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
    const { data: user, error } = await supabase
      .from('users')
      .select('credits_balance')
      .eq('id', userId)
      .single()

    if (error) {
      // If user doesn't exist, return free tier credits (250)
      return { data: 250, error: null }
    }

    return { data: user.credits_balance || 250, error: null }
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
      .from('users')
      .upsert({
        id: userId,
        credits_balance: credits,
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

// Credit system constants
export const CREDIT_COSTS = {
  VIDEO_GENERATION: 100, // 100 credits = 1 complete 60-second video
  RUSH_DELIVERY: 50,     // +50 credits for priority processing
  AI_VOICEOVER: 25,      // +25 credits for ElevenLabs voiceover
  SOCIAL_SHARE_REWARD: 50, // 50 credits back for sharing
  REFERRAL_REWARD: 500   // 500 credits for successful referral
}

export const SUBSCRIPTION_TIERS = {
  FREE: { credits: 250, price: 0, name: "Free Forever" },
  STARTER: { credits: 2000, price: 19.99, name: "Starter" },
  CREATOR: { credits: 6000, price: 49.99, name: "Creator" },
  STUDIO: { credits: 15000, price: 99.99, name: "Studio" }
}

// Deduct credits for video generation
export async function deductCredits(userId: string, amount: number, description: string): Promise<ApiResponse<boolean>> {
  try {
    // Use Supabase function for atomic credit deduction
    const { data, error } = await supabase.rpc('update_user_credits', {
      user_uuid: userId,
      credit_amount: -amount,
      transaction_type: 'deduction',
      description: description
    })

    if (error) {
      console.error('Error deducting credits:', error)
      return { data: null, error: 'Insufficient credits or update failed' }
    }

    return { data: true, error: null }
  } catch (error) {
    console.error('Error deducting credits:', error)
    return { data: null, error: 'Failed to deduct credits' }
  }
}

// Add credits (for purchases, rewards, etc.)
export async function addCredits(userId: string, amount: number, description: string): Promise<ApiResponse<boolean>> {
  try {
    const { data, error } = await supabase.rpc('update_user_credits', {
      user_uuid: userId,
      credit_amount: amount,
      transaction_type: 'addition',
      description: description
    })

    if (error) {
      console.error('Error adding credits:', error)
      return { data: null, error: 'Failed to add credits' }
    }

    return { data: true, error: null }
  } catch (error) {
    console.error('Error adding credits:', error)
    return { data: null, error: 'Failed to add credits' }
  }
}

// Get credit transaction history
export async function getCreditHistory(userId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching credit history:', error)
      return { data: null, error: 'Failed to fetch credit history' }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Error fetching credit history:', error)
    return { data: null, error: 'Failed to fetch credit history' }
  }
}

// Check if user has enough credits for an operation
export async function checkCreditsAvailable(userId: string, requiredCredits: number): Promise<ApiResponse<boolean>> {
  try {
    const creditsResult = await fetchCredits(userId)
    if (creditsResult.error || creditsResult.data === null) {
      return { data: false, error: 'Could not check credit balance' }
    }

    return { data: creditsResult.data >= requiredCredits, error: null }
  } catch (error) {
    console.error('Error checking credits:', error)
    return { data: false, error: 'Failed to check credits' }
  }
}

// Hook for using API functions in React components
export function useApi() {
  return {
    fetchCredits,
    getUser,
    updateUserCredits,
    generateVideo,
    deductCredits,
    addCredits,
    getCreditHistory,
    checkCreditsAvailable,
    CREDIT_COSTS,
    SUBSCRIPTION_TIERS
  }
}