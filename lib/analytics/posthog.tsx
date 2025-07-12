'use client'

import { useEffect } from 'react'
// Removed Clerk dependency
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
    person_profiles: 'identified_only',
    capture_pageview: false, // Disable automatic pageview capture, as we capture manually
    capture_pageleave: true,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    }
  })
}

export function CSPostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <PostHogAuthWrapper>{children}</PostHogAuthWrapper>
    </PostHogProvider>
  )
}

function PostHogAuthWrapper({ children }: { children: React.ReactNode }) {
  // No auth needed - just return children
  return <>{children}</>
}

// Custom hooks for AEON analytics
export const usePostHogAnalytics = () => {
  const trackProjectCreated = (data: {
    projectId: string
    projectName: string
    description?: string
    sceneCount: number
  }) => {
    posthog.capture('project_created', {
      project_id: data.projectId,
      project_name: data.projectName,
      description: data.description,
      scene_count: data.sceneCount,
      timestamp: new Date().toISOString(),
    })
  }

  const trackVideoGeneration = (data: {
    projectId: string
    topic: string
    style: string
    duration: number
    model: string
    creditsUsed: number
  }) => {
    posthog.capture('video_generation_started', {
      project_id: data.projectId,
      topic: data.topic,
      style: data.style,
      duration: data.duration,
      model: data.model,
      credits_used: data.creditsUsed,
      timestamp: new Date().toISOString(),
    })
  }

  const trackVideoCompleted = (data: {
    projectId: string
    videoId: string
    processingTime: number
    success: boolean
    errorMessage?: string
    finalAssetUrl?: string
  }) => {
    posthog.capture('video_generation_completed', {
      project_id: data.projectId,
      video_id: data.videoId,
      processing_time_seconds: data.processingTime,
      success: data.success,
      error_message: data.errorMessage,
      final_asset_url: data.finalAssetUrl,
      timestamp: new Date().toISOString(),
    })
  }

  const trackAgentJob = (data: {
    projectId: string
    sceneId?: string
    agentType: 'script_writer' | 'visual_gen' | 'editor' | 'scheduler' | 'business' | 'monetization'
    status: 'pending' | 'processing' | 'complete' | 'error'
    processingTime?: number
    errorMessage?: string
  }) => {
    posthog.capture('agent_job_update', {
      project_id: data.projectId,
      scene_id: data.sceneId,
      agent_type: data.agentType,
      status: data.status,
      processing_time_ms: data.processingTime,
      error_message: data.errorMessage,
      timestamp: new Date().toISOString(),
    })
  }

  const trackCreditsUsed = (data: {
    userId: string
    creditsUsed: number
    creditsRemaining: number
    operation: string
    projectId?: string
  }) => {
    posthog.capture('credits_used', {
      user_id: data.userId,
      credits_used: data.creditsUsed,
      credits_remaining: data.creditsRemaining,
      operation: data.operation,
      project_id: data.projectId,
      timestamp: new Date().toISOString(),
    })
  }

  const trackSubscriptionEvent = (data: {
    event: 'upgrade' | 'downgrade' | 'cancel' | 'reactivate'
    fromPlan: string
    toPlan: string
    amount?: number
    stripeCustomerId?: string
  }) => {
    posthog.capture('subscription_changed', {
      event: data.event,
      from_plan: data.fromPlan,
      to_plan: data.toPlan,
      amount: data.amount,
      stripe_customer_id: data.stripeCustomerId,
      timestamp: new Date().toISOString(),
    })
  }

  const trackAssetGenerated = (data: {
    projectId: string
    assetType: 'video' | 'image' | 'audio' | 'json'
    assetUrl: string
    fileSize?: number
    duration?: number
  }) => {
    posthog.capture('asset_generated', {
      project_id: data.projectId,
      asset_type: data.assetType,
      asset_url: data.assetUrl,
      file_size_bytes: data.fileSize,
      duration_seconds: data.duration,
      timestamp: new Date().toISOString(),
    })
  }

  const trackFeatureUsage = (feature: string, metadata?: Record<string, any>) => {
    posthog.capture('feature_used', {
      feature,
      ...metadata,
      timestamp: new Date().toISOString(),
    })
  }

  const trackPageView = (pageName: string, properties?: Record<string, any>) => {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      page_name: pageName,
      ...properties,
    })
  }

  return {
    trackProjectCreated,
    trackVideoGeneration,
    trackVideoCompleted,
    trackAgentJob,
    trackCreditsUsed,
    trackSubscriptionEvent,
    trackAssetGenerated,
    trackFeatureUsage,
    trackPageView,
  }
}
