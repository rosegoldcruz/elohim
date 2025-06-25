import { Queue, Worker, Job } from 'bullmq'
import Redis from 'ioredis'
import { supabase } from '@/lib/database'
import { deductCredits, CREDIT_COSTS } from '@/lib/api'

// Redis connection
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Video generation models configuration
export const VIDEO_MODELS = {
  RUNWAY_GEN3: {
    name: 'RunwayML Gen-3',
    provider: 'replicate',
    model: 'runway-ml/runway-gen3-alpha',
    maxDuration: 10,
    strengths: ['cinematic', 'realistic', 'high-quality']
  },
  PIKA_LABS: {
    name: 'Pika Labs 1.5',
    provider: 'replicate',
    model: 'pika-labs/pika-1.5',
    maxDuration: 10,
    strengths: ['creative', 'artistic', 'dynamic']
  },
  STABLE_VIDEO: {
    name: 'Stable Video Diffusion',
    provider: 'replicate',
    model: 'stability-ai/stable-video-diffusion',
    maxDuration: 10,
    strengths: ['stable', 'consistent', 'smooth']
  },
  LUMA_DREAM: {
    name: 'Luma Dream Machine',
    provider: 'replicate',
    model: 'luma-ai/dream-machine',
    maxDuration: 10,
    strengths: ['dreamy', 'surreal', 'imaginative']
  },
  MINIMAX_VIDEO: {
    name: 'Minimax Video-01',
    provider: 'replicate',
    model: 'minimax/video-01',
    maxDuration: 10,
    strengths: ['fast', 'efficient', 'versatile']
  },
  KLING_AI: {
    name: 'Kling AI',
    provider: 'replicate',
    model: 'kling-ai/kling-video',
    maxDuration: 10,
    strengths: ['innovative', 'experimental', 'unique']
  }
}

// Job queues
export const videoQueue = new Queue('video-generation', { connection: redis })
export const assemblyQueue = new Queue('video-assembly', { connection: redis })

// Job types
export interface VideoGenerationJob {
  projectId: string
  userId: string
  prompt: string
  sceneNumber: number
  models: string[] // Array of model keys to use
  options: {
    duration?: number
    style?: string
    quality?: 'standard' | 'high' | 'ultra'
    rushDelivery?: boolean
  }
}

export interface VideoAssemblyJob {
  projectId: string
  userId: string
  sceneClips: Array<{
    sceneNumber: number
    modelName: string
    videoUrl: string
    score: number
  }>
  options: {
    addIntro?: boolean
    addOutro?: boolean
    addCaptions?: boolean
    addMusic?: boolean
    voiceover?: boolean
  }
}

// Orchestra Mode: Generate with all 6 models simultaneously
export async function orchestrateVideoGeneration(
  userId: string,
  prompt: string,
  options: VideoGenerationJob['options'] = {}
): Promise<{ projectId: string; success: boolean; error?: string }> {
  try {
    // Check credits first
    const requiredCredits = CREDIT_COSTS.VIDEO_GENERATION +
      (options.rushDelivery ? CREDIT_COSTS.RUSH_DELIVERY : 0)

    // Deduct credits upfront
    const creditResult = await deductCredits(
      userId,
      requiredCredits,
      `Video generation: ${prompt.substring(0, 50)}...`
    )

    if (!creditResult.data) {
      return {
        projectId: '',
        success: false,
        error: 'Insufficient credits'
      }
    }

    // Create project in database
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id: userId,
        title: `Video: ${prompt.substring(0, 30)}...`,
        prompt: prompt,
        status: 'processing',
        video_style: options.style || 'cinematic',
        target_duration: 60, // Complete 60-second video
        total_scenes: 6, // One scene per model
        credits_used: requiredCredits
      })
      .select()
      .single()

    if (projectError || !project) {
      console.error('Error creating project:', projectError)
      return {
        projectId: '',
        success: false,
        error: 'Failed to create project'
      }
    }

    // Create scenes for each model
    const modelKeys = Object.keys(VIDEO_MODELS)
    const scenePromises = modelKeys.map(async (modelKey, index) => {
      const { error: sceneError } = await supabase
        .from('scenes')
        .insert({
          project_id: project.id,
          scene_number: index + 1,
          script_text: prompt,
          visual_description: prompt,
          duration_seconds: 10,
          status: 'pending',
          generation_provider: VIDEO_MODELS[modelKey as keyof typeof VIDEO_MODELS].provider,
          generation_model: VIDEO_MODELS[modelKey as keyof typeof VIDEO_MODELS].model
        })

      if (sceneError) {
        console.error(`Error creating scene ${index + 1}:`, sceneError)
      }
    })

    await Promise.all(scenePromises)

    // Queue video generation jobs for all models
    const jobPromises = modelKeys.map((modelKey, index) => {
      const jobData: VideoGenerationJob = {
        projectId: project.id,
        userId: userId,
        prompt: prompt,
        sceneNumber: index + 1,
        models: [modelKey],
        options: options
      }

      return videoQueue.add(
        'generate-scene',
        jobData,
        {
          priority: options.rushDelivery ? 1 : 10,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
        }
      )
    })

    await Promise.all(jobPromises)

    // Queue assembly job (will wait for all scenes to complete)
    await assemblyQueue.add(
      'assemble-video',
      {
        projectId: project.id,
        userId: userId,
        sceneClips: [], // Will be populated when scenes complete
        options: {
          addIntro: true,
          addOutro: true,
          addCaptions: options.style !== 'minimal',
          addMusic: true,
          voiceover: false // Can be upgraded
        }
      } as VideoAssemblyJob,
      {
        delay: 30000, // Wait 30 seconds for scenes to start processing
        attempts: 3
      }
    )

    return {
      projectId: project.id,
      success: true
    }

  } catch (error) {
    console.error('Error orchestrating video generation:', error)
    return {
      projectId: '',
      success: false,
      error: 'Failed to start video generation'
    }
  }
}

// Video generation worker
export function startVideoGenerationWorker() {
  const worker = new Worker(
    'video-generation',
    async (job: Job<VideoGenerationJob>) => {
      const { projectId, userId, prompt, sceneNumber, models, options } = job.data

      console.log(`Processing video generation job for project ${projectId}, scene ${sceneNumber}`)

      try {
        // Update scene status
        await supabase
          .from('scenes')
          .update({ status: 'processing' })
          .eq('project_id', projectId)
          .eq('scene_number', sceneNumber)

        const modelKey = models[0] // Single model for this job
        const model = VIDEO_MODELS[modelKey as keyof typeof VIDEO_MODELS]

        if (!model) {
          throw new Error(`Unknown model: ${modelKey}`)
        }

        // Generate video using Replicate
        const videoUrl = await generateVideoWithModel(model, prompt, options)

        // Update scene with result
        await supabase
          .from('scenes')
          .update({
            status: 'completed',
            video_url: videoUrl,
            updated_at: new Date().toISOString()
          })
          .eq('project_id', projectId)
          .eq('scene_number', sceneNumber)

        // Create agent job record
        await supabase
          .from('agent_jobs')
          .insert({
            project_id: projectId,
            scene_id: null, // We could get the scene ID if needed
            agent_type: 'video_generator',
            status: 'completed',
            input_data: { prompt, model: model.name },
            output_data: { video_url: videoUrl },
            credits_consumed: 0, // Already deducted upfront
            completed_at: new Date().toISOString()
          })

        console.log(`Completed video generation for scene ${sceneNumber}`)
        return { success: true, videoUrl }

      } catch (error) {
        console.error(`Error generating video for scene ${sceneNumber}:`, error)

        // Update scene status to failed
        await supabase
          .from('scenes')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('project_id', projectId)
          .eq('scene_number', sceneNumber)

        // Create failed agent job record
        await supabase
          .from('agent_jobs')
          .insert({
            project_id: projectId,
            agent_type: 'video_generator',
            status: 'failed',
            input_data: { prompt, model: models[0] },
            error_message: error instanceof Error ? error.message : 'Unknown error',
            credits_consumed: 0,
            completed_at: new Date().toISOString()
          })

        throw error
      }
    },
    { connection: redis, concurrency: 3 }
  )

  worker.on('completed', (job) => {
    console.log(`Video generation job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`Video generation job ${job?.id} failed:`, err)
  })

  return worker
}

// Generate video using specific model
async function generateVideoWithModel(
  model: typeof VIDEO_MODELS[keyof typeof VIDEO_MODELS],
  prompt: string,
  options: VideoGenerationJob['options']
): Promise<string> {
  // For now, we'll use mock generation since we need actual API keys
  // In production, this would call the actual Replicate API

  console.log(`Generating video with ${model.name} for prompt: ${prompt}`)

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 5000 + Math.random() * 10000))

  // Return mock video URL (in production, this would be the actual generated video)
  return `https://example.com/videos/${Date.now()}-${model.name.toLowerCase().replace(/\s+/g, '-')}.mp4`
}

// Get project status and progress
export async function getProjectStatus(projectId: string) {
  try {
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single()

    if (projectError || !project) {
      return { error: 'Project not found' }
    }

    const { data: scenes, error: scenesError } = await supabase
      .from('scenes')
      .select('*')
      .eq('project_id', projectId)
      .order('scene_number')

    if (scenesError) {
      return { error: 'Failed to fetch scenes' }
    }

    const completedScenes = scenes?.filter(scene => scene.status === 'completed') || []
    const failedScenes = scenes?.filter(scene => scene.status === 'failed') || []
    const processingScenes = scenes?.filter(scene => scene.status === 'processing') || []

    const progress = {
      total: scenes?.length || 0,
      completed: completedScenes.length,
      failed: failedScenes.length,
      processing: processingScenes.length,
      percentage: scenes?.length ? Math.round((completedScenes.length / scenes.length) * 100) : 0
    }

    return {
      project,
      scenes: scenes || [],
      progress,
      isComplete: completedScenes.length === scenes?.length,
      hasFailed: failedScenes.length > 0
    }

  } catch (error) {
    console.error('Error getting project status:', error)
    return { error: 'Failed to get project status' }
  }
}

// Start all workers
export function startAllWorkers() {
  console.log('Starting AEON video generation workers...')

  const videoWorker = startVideoGenerationWorker()

  // Import and start assembly worker
  import('@/lib/video-assembly').then(({ startVideoAssemblyWorker }) => {
    const assemblyWorker = startVideoAssemblyWorker()
    console.log('Video assembly worker started')
  })

  console.log('All workers started successfully')
  return { videoWorker }
}