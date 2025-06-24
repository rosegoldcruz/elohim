export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          stripe_customer_id: string | null
          subscription_status: string
          plan_type: string
          credits_balance: number
          total_credits_purchased: number
          created_at: string
          updated_at: string
          last_login_at: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          email: string
          stripe_customer_id?: string | null
          subscription_status?: string
          plan_type?: string
          credits_balance?: number
          total_credits_purchased?: number
          last_login_at?: string | null
          is_active?: boolean
        }
        Update: {
          email?: string
          stripe_customer_id?: string | null
          subscription_status?: string
          plan_type?: string
          credits_balance?: number
          total_credits_purchased?: number
          last_login_at?: string | null
          is_active?: boolean
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          title: string
          prompt: string
          status: string
          video_style: string
          target_duration: number
          total_scenes: number
          credits_used: number
          final_video_url: string | null
          thumbnail_url: string | null
          metadata: Record<string, any> | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          user_id: string
          title: string
          prompt: string
          status?: string
          video_style: string
          target_duration: number
          total_scenes: number
          credits_used?: number
          final_video_url?: string | null
          thumbnail_url?: string | null
          metadata?: Record<string, any> | null
          completed_at?: string | null
        }
        Update: {
          title?: string
          prompt?: string
          status?: string
          video_style?: string
          target_duration?: number
          total_scenes?: number
          credits_used?: number
          final_video_url?: string | null
          thumbnail_url?: string | null
          metadata?: Record<string, any> | null
          completed_at?: string | null
        }
      }
      scenes: {
        Row: {
          id: string
          project_id: string
          scene_number: number
          script_text: string | null
          visual_description: string | null
          duration_seconds: number | null
          video_url: string | null
          status: string
          generation_provider: string | null
          generation_model: string | null
          generation_params: Record<string, any> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          project_id: string
          scene_number: number
          script_text?: string | null
          visual_description?: string | null
          duration_seconds?: number | null
          video_url?: string | null
          status?: string
          generation_provider?: string | null
          generation_model?: string | null
          generation_params?: Record<string, any> | null
        }
        Update: {
          script_text?: string | null
          visual_description?: string | null
          duration_seconds?: number | null
          video_url?: string | null
          status?: string
          generation_provider?: string | null
          generation_model?: string | null
          generation_params?: Record<string, any> | null
        }
      }
      agent_jobs: {
        Row: {
          id: string
          project_id: string
          scene_id: string | null
          agent_type: string
          status: string
          input_data: Record<string, any> | null
          output_data: Record<string, any> | null
          error_message: string | null
          credits_consumed: number
          execution_time_ms: number | null
          retry_count: number
          max_retries: number
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          scene_id?: string | null
          agent_type: string
          status?: string
          input_data?: Record<string, any> | null
          output_data?: Record<string, any> | null
          error_message?: string | null
          credits_consumed?: number
          execution_time_ms?: number | null
          retry_count?: number
          max_retries?: number
          started_at?: string | null
          completed_at?: string | null
        }
        Update: {
          status?: string
          input_data?: Record<string, any> | null
          output_data?: Record<string, any> | null
          error_message?: string | null
          credits_consumed?: number
          execution_time_ms?: number | null
          retry_count?: number
          started_at?: string | null
          completed_at?: string | null
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          transaction_type: string
          payment_method: string | null
          stripe_payment_intent_id: string | null
          crypto_transaction_hash: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          user_id: string
          amount: number
          transaction_type: string
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          crypto_transaction_hash?: string | null
          description?: string | null
        }
        Update: {
          amount?: number
          transaction_type?: string
          payment_method?: string | null
          stripe_payment_intent_id?: string | null
          crypto_transaction_hash?: string | null
          description?: string | null
        }
      }
    }
    Functions: {
      update_user_credits: {
        Args: {
          user_uuid: string
          credit_amount: number
          transaction_type: string
        }
        Returns: void
      }
      get_project_progress: {
        Args: {
          project_uuid: string
        }
        Returns: {
          total_scenes: number
          completed_scenes: number
          failed_scenes: number
          completion_percentage: number
        }[]
      }
    }
  }
}