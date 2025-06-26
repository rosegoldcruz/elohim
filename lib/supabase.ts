import { createClient } from '@supabase/supabase-js'
import { env } from '../env.mjs'

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Server-side client with service role key for admin operations
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types (you can generate these with `supabase gen types typescript`)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          credits: number
          subscription_tier: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          subscription_tier?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          subscription_tier?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          status: string
          video_url: string | null
          thumbnail_url: string | null
          credits_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          status?: string
          video_url?: string | null
          thumbnail_url?: string | null
          credits_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          status?: string
          video_url?: string | null
          thumbnail_url?: string | null
          credits_used?: number
          created_at?: string
          updated_at?: string
        }
      }
      scenes: {
        Row: {
          id: string
          project_id: string
          scene_number: number
          prompt: string
          video_url: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          scene_number: number
          prompt: string
          video_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          scene_number?: number
          prompt?: string
          video_url?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      agent_jobs: {
        Row: {
          id: string
          project_id: string
          agent_type: string
          status: string
          input_data: any
          output_data: any | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          agent_type: string
          status?: string
          input_data: any
          output_data?: any | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          agent_type?: string
          status?: string
          input_data?: any
          output_data?: any | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          project_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          project_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string | null
          project_id?: string | null
          created_at?: string
        }
      }
      llm_outputs: {
        Row: {
          id: string
          timestamp: string
          blob_url: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          timestamp: string
          blob_url: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          timestamp?: string
          blob_url?: string
          content?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
