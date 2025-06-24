import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create the client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export as 'db' for compatibility
export const db = supabase

// Default export
export default supabase