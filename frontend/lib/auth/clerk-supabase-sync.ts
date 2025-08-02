import { createClient } from '@/lib/supabase/client'
import { User } from '@clerk/nextjs/server'

export interface SupabaseUserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  full_name?: string
  avatar_url?: string
  clerk_user_id: string
  created_at?: string
  updated_at?: string
  credits?: number
  subscription_tier?: string
  subscription_status?: string
}

/**
 * Sync Clerk user data with Supabase database
 * This ensures user data is available in Supabase for database operations
 */
export async function syncClerkUserToSupabase(clerkUser: User): Promise<void> {
  try {
    const supabase = createClient()
    
    // Extract user data from Clerk
    const userProfile: Partial<SupabaseUserProfile> = {
      id: clerkUser.id,
      clerk_user_id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      first_name: clerkUser.firstName || '',
      last_name: clerkUser.lastName || '',
      full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
      avatar_url: clerkUser.imageUrl || '',
      credits: 100, // Default credits for new users
      subscription_tier: 'free',
      subscription_status: 'active',
      updated_at: new Date().toISOString()
    }

    // Upsert user data to Supabase
    const { error } = await supabase
      .from('users')
      .upsert(userProfile, {
        onConflict: 'clerk_user_id',
        ignoreDuplicates: false
      })

    if (error) {
      console.error('Error syncing user to Supabase:', error)
      throw error
    }

    console.log('User synced to Supabase successfully:', clerkUser.id)
  } catch (error) {
    console.error('Failed to sync user to Supabase:', error)
    throw error
  }
}

/**
 * Get Supabase user profile by Clerk user ID
 */
export async function getSupabaseUserProfile(clerkUserId: string): Promise<SupabaseUserProfile | null> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to get user profile:', error)
    return null
  }
}

/**
 * Update user credits in Supabase
 */
export async function updateUserCredits(clerkUserId: string, credits: number): Promise<void> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('users')
      .update({ 
        credits,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_user_id', clerkUserId)

    if (error) {
      console.error('Error updating user credits:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to update user credits:', error)
    throw error
  }
}

/**
 * Create or update user profile when Clerk user is created/updated
 */
export async function handleClerkUserChange(clerkUser: User): Promise<void> {
  try {
    await syncClerkUserToSupabase(clerkUser)
  } catch (error) {
    console.error('Failed to handle Clerk user change:', error)
  }
} 