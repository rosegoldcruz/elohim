import { Worker, Job } from 'bullmq'
import { supabase } from '@/lib/database'
import { assemblyQueue, VideoAssemblyJob } from '@/lib/agents/orchestrator'
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

// Video assembly configuration
export const ASSEMBLY_CONFIG = {
  INTRO_DURATION: 3, // 3 second AEON branded intro
  OUTRO_DURATION: 3, // 3 second AEON branded outro
  SCENE_DURATION: 10, // Each AI model generates 10 seconds
  TRANSITION_DURATION: 0.5, // 0.5 second transitions between scenes
  TARGET_TOTAL_DURATION: 60, // Complete 60-second video
  OUTPUT_RESOLUTION: '1920x1080',
  OUTPUT_FPS: 30,
  OUTPUT_BITRATE: '5000k'
}

// Start the video assembly worker
export function startVideoAssemblyWorker() {
  const worker = new Worker(
    'video-assembly',
    async (job: Job<VideoAssemblyJob>) => {
      const { projectId, userId, options } = job.data
      
      console.log(`Starting video assembly for project ${projectId}`)
      
      try {
        // Get all completed scenes for this project
        const { data: scenes, error: scenesError } = await supabase
          .from('scenes')
          .select('*')
          .eq('project_id', projectId)
          .eq('status', 'completed')
          .order('scene_number')

        if (scenesError || !scenes || scenes.length === 0) {
          throw new Error('No completed scenes found for assembly')
        }

        // Update project status
        await supabase
          .from('projects')
          .update({ status: 'assembling' })
          .eq('id', projectId)

        // Score and select best clips
        const scoredClips = await scoreVideoClips(scenes)
        const selectedClips = selectBestClips(scoredClips, 6) // Select top 6 clips

        // Generate assembly plan
        const assemblyPlan = createAssemblyPlan(selectedClips, options)
        
        // Assemble the final video
        const finalVideoUrl = await assembleVideo(assemblyPlan, projectId)
        
        // Generate thumbnail
        const thumbnailUrl = await generateThumbnail(finalVideoUrl, projectId)
        
        // Update project with final video
        await supabase
          .from('projects')
          .update({
            status: 'completed',
            final_video_url: finalVideoUrl,
            thumbnail_url: thumbnailUrl,
            completed_at: new Date().toISOString()
          })
          .eq('id', projectId)

        // Create final agent job record
        await supabase
          .from('agent_jobs')
          .insert({
            project_id: projectId,
            agent_type: 'video_assembler',
            status: 'completed',
            input_data: { 
              scenes_count: scenes.length,
              selected_clips: selectedClips.length,
              options 
            },
            output_data: { 
              final_video_url: finalVideoUrl,
              thumbnail_url: thumbnailUrl,
              duration: ASSEMBLY_CONFIG.TARGET_TOTAL_DURATION
            },
            credits_consumed: 0,
            completed_at: new Date().toISOString()
          })

        console.log(`Video assembly completed for project ${projectId}`)
        return { success: true, finalVideoUrl, thumbnailUrl }

      } catch (error) {
        console.error(`Video assembly failed for project ${projectId}:`, error)
        
        // Update project status to failed
        await supabase
          .from('projects')
          .update({ status: 'failed' })
          .eq('id', projectId)

        throw error
      }
    },
    { connection: redis, concurrency: 2 }
  )

  worker.on('completed', (job) => {
    console.log(`Video assembly job ${job.id} completed`)
  })

  worker.on('failed', (job, err) => {
    console.error(`Video assembly job ${job?.id} failed:`, err)
  })

  return worker
}

// Score video clips based on quality metrics
async function scoreVideoClips(scenes: any[]): Promise<Array<{ scene: any; score: number }>> {
  return scenes.map(scene => {
    let score = 50 // Base score
    
    // Score based on model strengths
    const modelName = scene.generation_model?.toLowerCase() || ''
    
    if (modelName.includes('runway')) score += 20 // High quality, cinematic
    if (modelName.includes('pika')) score += 15 // Creative, artistic
    if (modelName.includes('stable')) score += 10 // Stable, consistent
    if (modelName.includes('luma')) score += 12 // Dreamy, imaginative
    if (modelName.includes('minimax')) score += 8 // Fast, efficient
    if (modelName.includes('kling')) score += 10 // Innovative
    
    // Add randomness for variety
    score += Math.random() * 10
    
    return { scene, score }
  })
}

// Select the best clips for final video
function selectBestClips(scoredClips: Array<{ scene: any; score: number }>, count: number) {
  return scoredClips
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(item => item.scene)
}

// Create video assembly plan
function createAssemblyPlan(clips: any[], options: VideoAssemblyJob['options']) {
  const plan = {
    intro: options.addIntro ? {
      type: 'intro',
      duration: ASSEMBLY_CONFIG.INTRO_DURATION,
      content: 'AEON branded intro animation'
    } : null,
    
    scenes: clips.map((clip, index) => ({
      type: 'scene',
      sceneNumber: index + 1,
      videoUrl: clip.video_url,
      duration: ASSEMBLY_CONFIG.SCENE_DURATION,
      transition: index < clips.length - 1 ? {
        type: 'crossfade',
        duration: ASSEMBLY_CONFIG.TRANSITION_DURATION
      } : null
    })),
    
    outro: options.addOutro ? {
      type: 'outro', 
      duration: ASSEMBLY_CONFIG.OUTRO_DURATION,
      content: 'AEON branded outro with social sharing prompt'
    } : null,
    
    enhancements: {
      captions: options.addCaptions,
      music: options.addMusic,
      voiceover: options.voiceover,
      colorGrading: true,
      stabilization: true
    }
  }
  
  return plan
}

// Assemble the final video (mock implementation)
async function assembleVideo(plan: any, projectId: string): Promise<string> {
  console.log('Assembling video with plan:', JSON.stringify(plan, null, 2))
  
  // In production, this would use FFmpeg to:
  // 1. Download all scene videos
  // 2. Create intro/outro animations
  // 3. Apply transitions between scenes
  // 4. Add background music
  // 5. Generate and overlay captions
  // 6. Apply color grading and filters
  // 7. Render final 60-second video
  
  // Mock processing time
  await new Promise(resolve => setTimeout(resolve, 10000 + Math.random() * 20000))
  
  // Return mock final video URL
  return `https://aeon-videos.s3.amazonaws.com/final/${projectId}-complete-video.mp4`
}

// Generate video thumbnail
async function generateThumbnail(videoUrl: string, projectId: string): Promise<string> {
  console.log(`Generating thumbnail for video: ${videoUrl}`)
  
  // In production, this would extract a frame from the video
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  return `https://aeon-videos.s3.amazonaws.com/thumbnails/${projectId}-thumbnail.jpg`
}

// Enhanced video processing functions for production
export const VideoProcessor = {
  // Add captions using Whisper API
  async addCaptions(videoUrl: string, transcript?: string): Promise<string> {
    // Implementation would use OpenAI Whisper or similar
    console.log('Adding captions to video:', videoUrl)
    return videoUrl
  },
  
  // Add background music based on video mood
  async addBackgroundMusic(videoUrl: string, mood: string = 'cinematic'): Promise<string> {
    // Implementation would analyze video and add appropriate royalty-free music
    console.log('Adding background music with mood:', mood)
    return videoUrl
  },
  
  // Apply professional color grading
  async applyColorGrading(videoUrl: string, style: string = 'cinematic'): Promise<string> {
    // Implementation would apply LUTs and color correction
    console.log('Applying color grading style:', style)
    return videoUrl
  },
  
  // Add AI voiceover using ElevenLabs
  async addVoiceover(videoUrl: string, script: string, voice: string = 'professional'): Promise<string> {
    // Implementation would use ElevenLabs API
    console.log('Adding voiceover with voice:', voice)
    return videoUrl
  }
}
