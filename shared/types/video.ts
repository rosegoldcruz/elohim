/**
 * AEON Shared Video Types
 * Common interfaces used by both frontend and backend
 */

// Video generation models configuration
export interface VideoModel {
  id: string
  name: string
  provider: 'replicate' | 'minimax' | 'kling'
  modelId: string
  maxDuration: number
  resolution: string
  strengths: string[]
  costMultiplier: number
  priority: number
}

// Video generation request
export interface VideoGenerationRequest {
  videoId: string
  userId: string
  prompt: string
  duration: number
  style?: string
  scenes: string[]
  priority: number
}

// Video generation result
export interface VideoGenerationResult {
  success: boolean
  videoId: string
  sceneResults: SceneResult[]
  finalVideoUrl?: string
  thumbnailUrl?: string
  metadata?: VideoMetadata
  error?: string
}

export interface SceneResult {
  sceneIndex: number
  prompt: string
  modelUsed: string
  videoUrl?: string
  duration: number
  success: boolean
  error?: string
  processingTime: number
}

export interface VideoMetadata {
  totalDuration: number
  resolution: string
  fileSize: number
  format: string
  fps: number
  hasAudio: boolean
  hasCaptions: boolean
  processingTime: number
  modelsUsed: string[]
}

// Job status types
export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'

// Video job interface
export interface VideoJob {
  id: string
  user_id: string
  prompt: string
  style: string
  duration: number
  quality_tier: string
  includes_watermark: boolean
  includes_voiceover: boolean
  includes_captions: boolean
  status: JobStatus
  created_at: string
  updated_at: string
  video_url?: string
  thumbnail_url?: string
  credits_used?: number
}

// Scene input for parallel generation
export interface SceneInput {
  prompt: string
  sceneIndex: number
  customInputs?: Record<string, any>
}

// Agent job types
export interface AgentJob {
  id: string
  user_id: string
  type: 'video_generation' | 'video_editing' | 'script_generation'
  status: JobStatus
  input_data: Record<string, any>
  output_data?: Record<string, any>
  error_message?: string
  created_at: string
  updated_at: string
  processing_started_at?: string
  processing_completed_at?: string
}

// Credit transaction types
export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: 'purchase' | 'usage' | 'refund' | 'bonus'
  description: string
  created_at: string
}

// User subscription types
export type SubscriptionTier = 'free_trial' | 'starter' | 'pro' | 'creator' | 'studio'
export type SubscriptionStatus = 'active' | 'inactive' | 'cancelled' | 'past_due'

export interface UserSubscription {
  id: string
  user_id: string
  tier: SubscriptionTier
  status: SubscriptionStatus
  stripe_subscription_id?: string
  current_period_start?: string
  current_period_end?: string
  trial_ends_at?: string
  created_at: string
  updated_at: string
}
