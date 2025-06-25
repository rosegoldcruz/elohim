// AEON Platform - Shared TypeScript Types
// Production-grade types for AI video generation system

export interface Trend {
  trend_id: string
  title: string
  virality_score: number
  topic_tags: string[]
  timestamp: string
}

export interface Script {
  script: string
  breakdown: {
    hook: string
    body: string
    cta: string
  }
  hashtags: string[]
  tone: string
  pacing: string
  cta_type: string
}

export interface Scene {
  id: string
  timestamp: number
  narration: string
  emotion: string
  visual_style: string
  camera_motion: string
}

export interface RenderJob {
  id: string
  url: string
  model_used: string
  render_status: string
}

export interface VideoClip {
  id: string
  url: string
}

export interface FinalVideo {
  final_video_url: string
  duration: number
  transition_style: string
}

export interface DeliveryResult {
  status: "sent"
  sent_at: string
  delivery_id: string
}

export interface PerformanceMetrics {
  video_id: string
  retention_rate: number
  avg_watch_time: number
  engagement_score: number
}

// API Request/Response Types
export interface TrendsRequest {
  // No input required
}

export interface TrendsResponse {
  trends: Trend[]
}

export interface ScriptWriterRequest {
  topic: string
}

export interface ScriptWriterResponse extends Script {}

export interface ScenePlannerRequest {
  script: string
}

export interface ScenePlannerResponse {
  scenes: Scene[]
}

export interface RenderAgentRequest {
  scenes: Scene[]
}

export interface RenderAgentResponse {
  renders: RenderJob[]
}

export interface EditorAgentRequest {
  clips: VideoClip[]
}

export interface EditorAgentResponse extends FinalVideo {}

export interface SchedulerAgentRequest {
  final_video_url: string
  metadata: any
}

export interface SchedulerAgentResponse extends DeliveryResult {}

export interface OptimizerAgentRequest {
  video_id: string
}

export interface OptimizerAgentResponse extends PerformanceMetrics {}

// Enums for validation
export const EMOTIONS = ['mystery', 'awe', 'curiosity', 'empowerment', 'excitement', 'suspense'] as const
export const VISUAL_STYLES = ['cinematic', 'dreamlike', 'gritty', 'clean', 'vibrant', 'minimal'] as const
export const CAMERA_MOTIONS = ['static', 'pan_left', 'pan_right', 'zoom_in', 'zoom_out', 'dolly'] as const
export const TONES = ['energetic', 'mysterious', 'educational', 'humorous', 'inspirational'] as const
export const PACING = ['fast', 'medium', 'slow', 'variable'] as const
export const CTA_TYPES = ['follow', 'like', 'comment', 'share', 'visit_link', 'subscribe'] as const
export const TRANSITION_STYLES = ['cut', 'fade', 'slide', 'zoom', 'crossfade'] as const

export type Emotion = typeof EMOTIONS[number]
export type VisualStyle = typeof VISUAL_STYLES[number]
export type CameraMotion = typeof CAMERA_MOTIONS[number]
export type Tone = typeof TONES[number]
export type Pacing = typeof PACING[number]
export type CTAType = typeof CTA_TYPES[number]
export type TransitionStyle = typeof TRANSITION_STYLES[number]
