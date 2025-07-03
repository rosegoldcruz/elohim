import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { env } from '../env.mjs'

/**
 * Standard server-side Supabase client factory
 * Use this in API routes and server components
 */
export function createClient() {
  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

// Legacy singleton client for backward compatibility
export const supabase = createSupabaseClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Server-side admin client with service role key for admin operations
export const supabaseAdmin = createSupabaseClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Database types (generated from AEON SaaS schema)
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
          subscription_tier: string
          subscription_status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_ends_at: string | null
          subscription_current_period_start: string | null
          subscription_current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          subscription_tier?: string
          subscription_status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          subscription_current_period_start?: string | null
          subscription_current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          credits?: number
          subscription_tier?: string
          subscription_status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_ends_at?: string | null
          subscription_current_period_start?: string | null
          subscription_current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          slug: string
          stripe_price_id: string
          price_monthly: number | null
          price_yearly: number | null
          credits_monthly: number
          features: any
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          stripe_price_id: string
          price_monthly?: number | null
          price_yearly?: number | null
          credits_monthly: number
          features?: any
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          stripe_price_id?: string
          price_monthly?: number | null
          price_yearly?: number | null
          credits_monthly?: number
          features?: any
          is_active?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          email: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          amount: number
          credits_purchased: number
          video_prompt: string
          video_style: string | null
          status: string
          video_url: string | null
          video_duration: number | null
          credits_used: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          amount: number
          credits_purchased: number
          video_prompt: string
          video_style?: string | null
          status?: string
          video_url?: string | null
          video_duration?: number | null
          credits_used?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          amount?: number
          credits_purchased?: number
          video_prompt?: string
          video_style?: string | null
          status?: string
          video_url?: string | null
          video_duration?: number | null
          credits_used?: number
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
          order_id: string | null
          video_job_id: string | null
          stripe_payment_intent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          order_id?: string | null
          video_job_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string | null
          order_id?: string | null
          video_job_id?: string | null
          stripe_payment_intent_id?: string | null
          created_at?: string
        }
      }
      video_jobs: {
        Row: {
          id: string
          user_id: string
          order_id: string | null
          prompt: string
          style: string | null
          duration: number
          status: string
          priority: number
          scenes_generated: number
          scenes_total: number
          current_model: string | null
          models_attempted: string[] | null
          processing_started_at: string | null
          processing_completed_at: string | null
          error_message: string | null
          retry_count: number
          video_url: string | null
          thumbnail_url: string | null
          final_duration: number | null
          file_size_mb: number | null
          resolution: string | null
          credits_used: number
          quality_tier: string | null
          includes_watermark: boolean
          includes_voiceover: boolean
          includes_captions: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          order_id?: string | null
          prompt: string
          style?: string | null
          duration: number
          status?: string
          priority?: number
          scenes_generated?: number
          scenes_total?: number
          current_model?: string | null
          models_attempted?: string[] | null
          processing_started_at?: string | null
          processing_completed_at?: string | null
          error_message?: string | null
          retry_count?: number
          video_url?: string | null
          thumbnail_url?: string | null
          final_duration?: number | null
          file_size_mb?: number | null
          resolution?: string | null
          credits_used?: number
          quality_tier?: string | null
          includes_watermark?: boolean
          includes_voiceover?: boolean
          includes_captions?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          order_id?: string | null
          prompt?: string
          style?: string | null
          duration?: number
          status?: string
          priority?: number
          scenes_generated?: number
          scenes_total?: number
          current_model?: string | null
          models_attempted?: string[] | null
          processing_started_at?: string | null
          processing_completed_at?: string | null
          error_message?: string | null
          retry_count?: number
          video_url?: string | null
          thumbnail_url?: string | null
          final_duration?: number | null
          file_size_mb?: number | null
          resolution?: string | null
          credits_used?: number
          quality_tier?: string | null
          includes_watermark?: boolean
          includes_voiceover?: boolean
          includes_captions?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      video_scenes: {
        Row: {
          id: string
          video_job_id: string
          scene_number: number
          prompt: string
          model_used: string | null
          status: string
          replicate_prediction_id: string | null
          model_input: any | null
          model_output: any | null
          scene_url: string | null
          duration: number | null
          file_size_mb: number | null
          started_at: string | null
          completed_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          video_job_id: string
          scene_number: number
          prompt: string
          model_used?: string | null
          status?: string
          replicate_prediction_id?: string | null
          model_input?: any | null
          model_output?: any | null
          scene_url?: string | null
          duration?: number | null
          file_size_mb?: number | null
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          video_job_id?: string
          scene_number?: number
          prompt?: string
          model_used?: string | null
          status?: string
          replicate_prediction_id?: string | null
          model_input?: any | null
          model_output?: any | null
          scene_url?: string | null
          duration?: number | null
          file_size_mb?: number | null
          started_at?: string | null
          completed_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
      subscription_history: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string | null
          plan_name: string | null
          status: string | null
          current_period_start: string | null
          current_period_end: string | null
          canceled_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id?: string | null
          plan_name?: string | null
          status?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          canceled_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string | null
          plan_name?: string | null
          status?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          canceled_at?: string | null
          created_at?: string
        }
      }
      referrals: {
        Row: {
          id: string
          referrer_id: string
          referred_email: string
          referred_user_id: string | null
          credits_awarded: number
          status: string
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          referrer_id: string
          referred_email: string
          referred_user_id?: string | null
          credits_awarded?: number
          status?: string
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          referrer_id?: string
          referred_email?: string
          referred_user_id?: string | null
          credits_awarded?: number
          status?: string
          completed_at?: string | null
          created_at?: string
        }
      }
      video_models: {
        Row: {
          id: string
          name: string
          slug: string
          replicate_model: string
          is_active: boolean
          priority: number
          max_duration: number
          cost_multiplier: number
          features: any
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          replicate_model: string
          is_active?: boolean
          priority?: number
          max_duration?: number
          cost_multiplier?: number
          features?: any
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          replicate_model?: string
          is_active?: boolean
          priority?: number
          max_duration?: number
          cost_multiplier?: number
          features?: any
          created_at?: string
        }
      }
      credit_bundles: {
        Row: {
          id: string
          name: string
          credits: number
          price: number
          bonus_credits: number
          stripe_price_id: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          credits: number
          price: number
          bonus_credits?: number
          stripe_price_id?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          credits?: number
          price?: number
          bonus_credits?: number
          stripe_price_id?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
      }
      video_styles: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          prompt_template: string
          thumbnail_url: string | null
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          prompt_template: string
          thumbnail_url?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          prompt_template?: string
          thumbnail_url?: string | null
          is_active?: boolean
          sort_order?: number
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
