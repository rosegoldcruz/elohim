/**
 * Supabase Analytics Integration
 * Automatically tracks PostHog events when database operations occur
 */

import { createClient } from '@/lib/supabase/client'
import posthog from 'posthog-js'

export class SupabaseAnalytics {
  private supabase = createClient()

  /**
   * Create a new project and track the event
   */
  async createProject(data: {
    userId: string
    name: string
    description?: string
  }) {
    try {
      const { data: project, error } = await this.supabase
        .from('projects')
        .insert({
          user_id: data.userId,
          name: data.name,
          description: data.description,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      // Track project creation
      posthog.capture('project_created', {
        project_id: project.id,
        project_name: data.name,
        description: data.description,
        user_id: data.userId,
        timestamp: new Date().toISOString(),
      })

      return { data: project, error: null }
    } catch (error) {
      console.error('Failed to create project:', error)
      return { data: null, error }
    }
  }

  /**
   * Update project status and track the event
   */
  async updateProjectStatus(projectId: string, status: string) {
    try {
      const { data: project, error } = await this.supabase
        .from('projects')
        .update({ status })
        .eq('id', projectId)
        .select()
        .single()

      if (error) throw error

      // Track status change
      posthog.capture('project_status_changed', {
        project_id: projectId,
        new_status: status,
        timestamp: new Date().toISOString(),
      })

      return { data: project, error: null }
    } catch (error) {
      console.error('Failed to update project status:', error)
      return { data: null, error }
    }
  }

  /**
   * Create agent job and track the event
   */
  async createAgentJob(data: {
    projectId: string
    sceneId?: string
    agentType: string
    status?: string
  }) {
    try {
      const { data: job, error } = await this.supabase
        .from('agent_jobs')
        .insert({
          project_id: data.projectId,
          scene_id: data.sceneId,
          agent_type: data.agentType,
          status: data.status || 'pending',
          started_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Track agent job creation
      posthog.capture('agent_job_created', {
        project_id: data.projectId,
        scene_id: data.sceneId,
        agent_type: data.agentType,
        job_id: job.id,
        timestamp: new Date().toISOString(),
      })

      return { data: job, error: null }
    } catch (error) {
      console.error('Failed to create agent job:', error)
      return { data: null, error }
    }
  }

  /**
   * Update agent job status and track the event
   */
  async updateAgentJob(jobId: string, data: {
    status: string
    result?: any
    errorMessage?: string
  }) {
    try {
      const updateData: any = {
        status: data.status,
        finished_at: new Date().toISOString()
      }

      if (data.result) updateData.result = data.result

      const { data: job, error } = await this.supabase
        .from('agent_jobs')
        .update(updateData)
        .eq('id', jobId)
        .select()
        .single()

      if (error) throw error

      // Calculate processing time
      const processingTime = job.started_at 
        ? new Date().getTime() - new Date(job.started_at).getTime()
        : 0

      // Track agent job completion
      posthog.capture('agent_job_completed', {
        job_id: jobId,
        project_id: job.project_id,
        agent_type: job.agent_type,
        status: data.status,
        processing_time_ms: processingTime,
        success: data.status === 'complete',
        error_message: data.errorMessage,
        timestamp: new Date().toISOString(),
      })

      return { data: job, error: null }
    } catch (error) {
      console.error('Failed to update agent job:', error)
      return { data: null, error }
    }
  }

  /**
   * Create asset and track the event
   */
  async createAsset(data: {
    projectId: string
    type: string
    url: string
    meta?: any
  }) {
    try {
      const { data: asset, error } = await this.supabase
        .from('assets')
        .insert({
          project_id: data.projectId,
          type: data.type,
          url: data.url,
          meta: data.meta
        })
        .select()
        .single()

      if (error) throw error

      // Track asset creation
      posthog.capture('asset_created', {
        project_id: data.projectId,
        asset_id: asset.id,
        asset_type: data.type,
        asset_url: data.url,
        file_size_bytes: data.meta?.fileSize,
        duration_seconds: data.meta?.duration,
        timestamp: new Date().toISOString(),
      })

      return { data: asset, error: null }
    } catch (error) {
      console.error('Failed to create asset:', error)
      return { data: null, error }
    }
  }

  /**
   * Update user credits and track the event
   */
  async updateCredits(userId: string, creditsUsed: number, operation: string, projectId?: string) {
    try {
      // Get current credits
      const { data: currentCredits } = await this.supabase
        .from('credits')
        .select('balance')
        .eq('user_id', userId)
        .single()

      const newBalance = (currentCredits?.balance || 0) - creditsUsed

      // Update credits
      const { data: credits, error } = await this.supabase
        .from('credits')
        .upsert({
          user_id: userId,
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) throw error

      // Track credit usage
      posthog.capture('credits_used', {
        user_id: userId,
        credits_used: creditsUsed,
        credits_remaining: newBalance,
        operation: operation,
        project_id: projectId,
        timestamp: new Date().toISOString(),
      })

      return { data: credits, error: null }
    } catch (error) {
      console.error('Failed to update credits:', error)
      return { data: null, error }
    }
  }

  /**
   * Get project analytics data
   */
  async getProjectAnalytics(projectId: string) {
    try {
      const [
        { data: project },
        { data: scenes },
        { data: jobs },
        { data: assets }
      ] = await Promise.all([
        this.supabase.from('projects').select('*').eq('id', projectId).single(),
        this.supabase.from('scenes').select('*').eq('project_id', projectId),
        this.supabase.from('agent_jobs').select('*').eq('project_id', projectId),
        this.supabase.from('assets').select('*').eq('project_id', projectId)
      ])

      const analytics = {
        project,
        sceneCount: scenes?.length || 0,
        jobCount: jobs?.length || 0,
        completedJobs: jobs?.filter(j => j.status === 'complete').length || 0,
        assetCount: assets?.length || 0,
        totalProcessingTime: jobs?.reduce((acc, job) => {
          if (job.started_at && job.finished_at) {
            return acc + (new Date(job.finished_at).getTime() - new Date(job.started_at).getTime())
          }
          return acc
        }, 0) || 0
      }

      return { data: analytics, error: null }
    } catch (error) {
      console.error('Failed to get project analytics:', error)
      return { data: null, error }
    }
  }
}

// Export singleton instance
export const supabaseAnalytics = new SupabaseAnalytics()
