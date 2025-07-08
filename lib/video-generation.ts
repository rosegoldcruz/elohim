import { replicate } from './ai-services'
// Supabase removed - using Clerk for authentication
import { put } from '@vercel/blob'
import { logInfo, logError, logVideoGeneration } from './telemetry'

interface VideoJob {
  id: string
  user_id: string
  prompt: string
  style: string
  duration: number
  quality_tier: string
  includes_watermark: boolean
  includes_voiceover: boolean
  includes_captions: boolean
}

interface VideoModel {
  slug: string
  replicate_model: string
  max_duration: number
  priority: number
  is_active: boolean
}

export class VideoGenerationService {
  private models: VideoModel[] = []
  private modelsLoaded = false

  constructor() {
    // Don't load models in constructor to avoid build-time calls
  }

  private async loadModels() {
    if (this.modelsLoaded) return

    const { data: models, error } = await supabaseAdmin
      .from('video_models')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true })

    if (error) {
      console.error('Error loading video models:', error)
      return
    }

    this.models = models
    this.modelsLoaded = true
  }

  async processVideoJob(jobId: string) {
    console.log(`Processing video job: ${jobId}`)

    // Ensure models are loaded
    await this.loadModels()

    try {
      // Get job details
      const { data: job, error: jobError } = await supabaseAdmin
        .from('video_jobs')
        .select('*')
        .eq('id', jobId)
        .single()

      if (jobError || !job) {
        throw new Error(`Job not found: ${jobId}`)
      }

      // Update job status to processing
      await this.updateJobStatus(jobId, 'processing')

      // Log video generation start
      await logVideoGeneration({
        userId: job.user_id,
        projectId: jobId,
        model: 'ensemble',
        prompt: job.prompt,
        status: 'started',
      })

      // Generate video scenes
      const scenes = await this.generateScenes(job)

      // Combine scenes into final video
      const finalVideoUrl = await this.combineScenes(job, scenes)

      // Update job with final video
      await supabaseAdmin
        .from('video_jobs')
        .update({
          status: 'completed',
          video_url: finalVideoUrl,
          processing_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      // Update order status
      if (job.order_id) {
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'completed',
            video_url: finalVideoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.order_id)
      }

      // Log completion
      await logVideoGeneration({
        userId: job.user_id,
        projectId: jobId,
        model: 'ensemble',
        prompt: job.prompt,
        status: 'completed',
        duration: Date.now() - new Date(job.created_at).getTime(),
        creditsUsed: job.credits_used,
      })

      console.log(`Video job completed: ${jobId}`)
      return finalVideoUrl

    } catch (error) {
      console.error(`Video job failed: ${jobId}`, error)

      // Update job status to failed
      await supabaseAdmin
        .from('video_jobs')
        .update({
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error',
          processing_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)

      // Update order status if exists
      const { data: job } = await supabaseAdmin
        .from('video_jobs')
        .select('order_id, user_id')
        .eq('id', jobId)
        .single()

      if (job?.order_id) {
        await supabaseAdmin
          .from('orders')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', job.order_id)
      }

      // Log error
      await logVideoGeneration({
        userId: job?.user_id || 'unknown',
        projectId: jobId,
        model: 'ensemble',
        prompt: 'failed',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      })

      throw error
    }
  }

  private async generateScenes(job: VideoJob) {
    const sceneDuration = Math.ceil(job.duration / 6) // 6 scenes
    const scenes = []

    // Get video style template
    const { data: style } = await supabaseAdmin
      .from('video_styles')
      .select('prompt_template')
      .eq('slug', job.style)
      .single()

    const promptTemplate = style?.prompt_template || '{prompt}'
    const enhancedPrompt = promptTemplate.replace('{prompt}', job.prompt)

    for (let i = 0; i < 6; i++) {
      const scenePrompt = `${enhancedPrompt} (Scene ${i + 1}/6, ${sceneDuration} seconds)`
      
      // Create scene record
      const { data: scene, error: sceneError } = await supabaseAdmin
        .from('video_scenes')
        .insert({
          video_job_id: job.id,
          scene_number: i + 1,
          prompt: scenePrompt,
          status: 'pending',
        })
        .select()
        .single()

      if (sceneError) {
        console.error('Error creating scene:', sceneError)
        continue
      }

      try {
        // Generate scene with model fallback
        const sceneUrl = await this.generateSceneWithFallback(scene.id, scenePrompt, sceneDuration)
        
        // Update scene with result
        await supabaseAdmin
          .from('video_scenes')
          .update({
            status: 'completed',
            scene_url: sceneUrl,
            duration: sceneDuration,
            completed_at: new Date().toISOString(),
          })
          .eq('id', scene.id)

        scenes.push({
          id: scene.id,
          url: sceneUrl,
          duration: sceneDuration,
        })

        // Update job progress
        await this.updateJobProgress(job.id, i + 1)

      } catch (error) {
        console.error(`Scene ${i + 1} generation failed:`, error)
        
        await supabaseAdmin
          .from('video_scenes')
          .update({
            status: 'failed',
            error_message: error instanceof Error ? error.message : 'Generation failed',
            completed_at: new Date().toISOString(),
          })
          .eq('id', scene.id)
      }
    }

    return scenes
  }

  private async generateSceneWithFallback(sceneId: string, prompt: string, duration: number) {
    // Ensure models are loaded
    await this.loadModels()

    const maxRetries = this.models.length
    let lastError: Error | null = null

    for (let i = 0; i < maxRetries; i++) {
      const model = this.models[i]
      
      try {
        console.log(`Attempting scene generation with ${model.slug}`)

        // Update scene with current model
        await supabaseAdmin
          .from('video_scenes')
          .update({
            model_used: model.slug,
            status: 'generating',
            started_at: new Date().toISOString(),
          })
          .eq('id', sceneId)

        // Generate with Replicate
        const output = await replicate.run(model.replicate_model, {
          input: {
            prompt,
            duration: Math.min(duration, model.max_duration),
            aspect_ratio: '16:9',
            quality: 'high',
          },
        })

        if (output && typeof output === 'string') {
          return output
        } else if (Array.isArray(output) && output.length > 0) {
          return output[0]
        } else {
          throw new Error('Invalid output from model')
        }

      } catch (error) {
        console.error(`${model.slug} failed:`, error)
        lastError = error as Error
        
        // Continue to next model
        continue
      }
    }

    throw lastError || new Error('All models failed')
  }

  private async combineScenes(job: VideoJob, scenes: any[]) {
    // This is a simplified version - in production you'd use FFmpeg or similar
    // For now, we'll just return the first scene URL as a placeholder
    
    if (scenes.length === 0) {
      throw new Error('No scenes generated')
    }

    // In a real implementation, you would:
    // 1. Download all scene videos
    // 2. Use FFmpeg to combine them with transitions
    // 3. Add intro/outro branding
    // 4. Add background music
    // 5. Add captions if requested
    // 6. Add watermark if required
    // 7. Render final video
    // 8. Upload to blob storage

    const finalVideoContent = `Combined video from ${scenes.length} scenes`
    const fileName = `video-${job.id}.mp4`

    // Upload placeholder to Vercel Blob
    const { url } = await put(fileName, Buffer.from(finalVideoContent), {
      access: 'public',
      contentType: 'video/mp4',
    })

    return url
  }

  private async updateJobStatus(jobId: string, status: string) {
    await supabaseAdmin.rpc('update_video_progress', {
      p_job_id: jobId,
      p_status: status,
    })
  }

  private async updateJobProgress(jobId: string, scenesCompleted: number) {
    await supabaseAdmin.rpc('update_video_progress', {
      p_job_id: jobId,
      p_status: 'processing',
      p_scenes_completed: scenesCompleted,
    })
  }
}

// Lazy-loaded singleton instance
let videoGenerationServiceInstance: VideoGenerationService | null = null

function getVideoGenerationService(): VideoGenerationService {
  if (!videoGenerationServiceInstance) {
    videoGenerationServiceInstance = new VideoGenerationService()
  }
  return videoGenerationServiceInstance
}

// Helper function to queue video generation job
export async function queueVideoGeneration(jobId: string) {
  try {
    // In production, this would add to a proper job queue (Redis, BullMQ, etc.)
    // For now, we'll process immediately in the background
    setTimeout(async () => {
      try {
        const service = getVideoGenerationService()
        await service.processVideoJob(jobId)
      } catch (error) {
        console.error('Background video generation failed:', error)
      }
    }, 1000) // Small delay to ensure webhook processing completes

    return true
  } catch (error) {
    console.error('Error queuing video generation:', error)
    return false
  }
}
