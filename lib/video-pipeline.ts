/**
 * AEON AI Video Generation Platform - Video Pipeline Orchestrator
 * Based on MIT-licensed ai-video-generator
 * License: MIT (see LICENSE file)
 * 
 * Orchestrates the 6-model AI video generation pipeline with FFmpeg post-processing
 */

import { config } from './env'

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

export const VIDEO_MODELS: VideoModel[] = [
  {
    id: 'runway',
    name: 'Runway Gen-3 Alpha',
    provider: 'replicate',
    modelId: config.video.models.runway,
    maxDuration: 10,
    resolution: '1280x768',
    strengths: ['cinematic', 'realistic', 'smooth motion'],
    costMultiplier: 1.0,
    priority: 1,
  },
  {
    id: 'pika',
    name: 'Pika Labs 1.0',
    provider: 'replicate',
    modelId: config.video.models.pika,
    maxDuration: 8,
    resolution: '1024x576',
    strengths: ['creative', 'artistic', 'stylized'],
    costMultiplier: 0.8,
    priority: 2,
  },
  {
    id: 'stable_video',
    name: 'Stable Video Diffusion',
    provider: 'replicate',
    modelId: config.video.models.stableVideo,
    maxDuration: 4,
    resolution: '1024x576',
    strengths: ['consistent', 'stable', 'detailed'],
    costMultiplier: 0.6,
    priority: 3,
  },
  {
    id: 'luma',
    name: 'Luma Dream Machine',
    provider: 'replicate',
    modelId: config.video.models.luma,
    maxDuration: 5,
    resolution: '1280x720',
    strengths: ['natural', 'fluid', 'photorealistic'],
    costMultiplier: 1.2,
    priority: 4,
  },
  {
    id: 'minimax',
    name: 'Minimax Video-01',
    provider: 'minimax',
    modelId: config.video.models.minimax,
    maxDuration: 6,
    resolution: '1280x720',
    strengths: ['fast', 'efficient', 'good quality'],
    costMultiplier: 0.7,
    priority: 5,
  },
  {
    id: 'kling',
    name: 'Kling AI 1.0',
    provider: 'kling',
    modelId: config.video.models.kling,
    maxDuration: 10,
    resolution: '1280x720',
    strengths: ['versatile', 'high quality', 'long duration'],
    costMultiplier: 1.1,
    priority: 6,
  },
]

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

// Pipeline orchestrator class
export class VideoPipeline {
  private models: VideoModel[]
  private maxRetries: number = 3
  private timeoutMs: number = 300000 // 5 minutes

  constructor() {
    this.models = VIDEO_MODELS.sort((a, b) => a.priority - b.priority)
  }

  /**
   * Generate video using the 6-model pipeline
   */
  async generateVideo(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🎬 Starting video generation for ${request.videoId}`)
      
      // Step 1: Generate scenes in parallel using multiple models
      const sceneResults = await this.generateScenes(request)
      
      // Step 2: Filter successful scenes
      const successfulScenes = sceneResults.filter(scene => scene.success)
      
      if (successfulScenes.length === 0) {
        throw new Error('No scenes were generated successfully')
      }
      
      // Step 3: Assemble final video with FFmpeg
      const assemblyResult = await this.assembleVideo(request.videoId, successfulScenes)
      
      const processingTime = Date.now() - startTime
      
      return {
        success: true,
        videoId: request.videoId,
        sceneResults,
        finalVideoUrl: assemblyResult.videoUrl,
        thumbnailUrl: assemblyResult.thumbnailUrl,
        metadata: {
          totalDuration: request.duration,
          resolution: '1920x1080',
          fileSize: assemblyResult.fileSize,
          format: 'mp4',
          fps: 30,
          hasAudio: true,
          hasCaptions: true,
          processingTime,
          modelsUsed: successfulScenes.map(scene => scene.modelUsed),
        },
      }
      
    } catch (error) {
      console.error(`❌ Video generation failed for ${request.videoId}:`, error)
      
      return {
        success: false,
        videoId: request.videoId,
        sceneResults: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Generate individual scenes using different AI models
   */
  private async generateScenes(request: VideoGenerationRequest): Promise<SceneResult[]> {
    const sceneDuration = Math.ceil(request.duration / request.scenes.length)
    const results: SceneResult[] = []
    
    // Generate scenes in parallel with model diversity
    const scenePromises = request.scenes.map(async (scenePrompt, index) => {
      const model = this.selectModelForScene(index, scenePrompt, sceneDuration)
      return this.generateSingleScene(scenePrompt, index, model, sceneDuration)
    })
    
    const sceneResults = await Promise.allSettled(scenePromises)
    
    sceneResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        results.push({
          sceneIndex: index,
          prompt: request.scenes[index],
          modelUsed: 'failed',
          duration: sceneDuration,
          success: false,
          error: result.reason?.message || 'Scene generation failed',
          processingTime: 0,
        })
      }
    })
    
    return results
  }

  /**
   * Select the best model for a specific scene
   */
  private selectModelForScene(sceneIndex: number, prompt: string, duration: number): VideoModel {
    // Filter models that can handle the required duration
    const compatibleModels = this.models.filter(model => model.maxDuration >= duration)
    
    if (compatibleModels.length === 0) {
      // Fallback to the model with the longest duration support
      return this.models.reduce((prev, current) => 
        current.maxDuration > prev.maxDuration ? current : prev
      )
    }
    
    // Use different models for different scenes to ensure diversity
    const modelIndex = sceneIndex % compatibleModels.length
    return compatibleModels[modelIndex]
  }

  /**
   * Generate a single scene using the specified model
   */
  private async generateSingleScene(
    prompt: string,
    sceneIndex: number,
    model: VideoModel,
    duration: number
  ): Promise<SceneResult> {
    const startTime = Date.now()
    
    try {
      console.log(`🎥 Generating scene ${sceneIndex} with ${model.name}`)
      
      let videoUrl: string
      
      switch (model.provider) {
        case 'replicate':
          videoUrl = await this.generateWithReplicate(model.modelId, prompt, duration)
          break
        case 'minimax':
          videoUrl = await this.generateWithMinimax(model.modelId, prompt, duration)
          break
        case 'kling':
          videoUrl = await this.generateWithKling(model.modelId, prompt, duration)
          break
        default:
          throw new Error(`Unsupported provider: ${model.provider}`)
      }
      
      const processingTime = Date.now() - startTime
      
      return {
        sceneIndex,
        prompt,
        modelUsed: model.name,
        videoUrl,
        duration,
        success: true,
        processingTime,
      }
      
    } catch (error) {
      const processingTime = Date.now() - startTime
      
      return {
        sceneIndex,
        prompt,
        modelUsed: model.name,
        duration,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
      }
    }
  }

  /**
   * Generate video using Replicate API
   */
  private async generateWithReplicate(modelId: string, prompt: string, duration: number): Promise<string> {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${config.ai.replicate.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: modelId,
        input: {
          prompt,
          duration,
          aspect_ratio: '16:9',
          fps: 30,
        },
      }),
    })
    
    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`)
    }
    
    const prediction = await response.json()
    
    // Poll for completion
    return this.pollReplicatePrediction(prediction.id)
  }

  /**
   * Poll Replicate prediction until completion
   */
  private async pollReplicatePrediction(predictionId: string): Promise<string> {
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    let attempts = 0
    
    while (attempts < maxAttempts) {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${config.ai.replicate.apiToken}`,
        },
      })
      
      if (!response.ok) {
        throw new Error(`Replicate polling error: ${response.statusText}`)
      }
      
      const prediction = await response.json()
      
      if (prediction.status === 'succeeded') {
        return prediction.output
      }
      
      if (prediction.status === 'failed') {
        throw new Error(`Replicate prediction failed: ${prediction.error}`)
      }
      
      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000))
      attempts++
    }
    
    throw new Error('Replicate prediction timed out')
  }

  /**
   * Generate video using Minimax API (placeholder)
   */
  private async generateWithMinimax(modelId: string, prompt: string, duration: number): Promise<string> {
    // Placeholder implementation - replace with actual Minimax API calls
    console.log(`Generating with Minimax: ${modelId}, ${prompt}, ${duration}s`)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    // Return placeholder URL
    return 'https://example.com/minimax-video.mp4'
  }

  /**
   * Generate video using Kling API (placeholder)
   */
  private async generateWithKling(modelId: string, prompt: string, duration: number): Promise<string> {
    // Placeholder implementation - replace with actual Kling API calls
    console.log(`Generating with Kling: ${modelId}, ${prompt}, ${duration}s`)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 8000))
    
    // Return placeholder URL
    return 'https://example.com/kling-video.mp4'
  }

  /**
   * Assemble final video using FFmpeg
   */
  private async assembleVideo(
    videoId: string,
    scenes: SceneResult[]
  ): Promise<{ videoUrl: string; thumbnailUrl: string; fileSize: number }> {
    try {
      console.log(`🎞️ Assembling final video for ${videoId}`)
      
      // Extract scene URLs
      const sceneUrls = scenes
        .filter(scene => scene.videoUrl)
        .map(scene => scene.videoUrl!)
      
      if (sceneUrls.length === 0) {
        throw new Error('No scene URLs available for assembly')
      }
      
      // Call FFmpeg worker (this would be implemented in the backend)
      const response = await fetch(`${config.urls.backend}/editor/merge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          video_id: videoId,
          scene_urls: sceneUrls,
          includes_audio: true,
          includes_captions: true,
        }),
      })
      
      if (!response.ok) {
        throw new Error(`Video assembly failed: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.message || 'Video assembly failed')
      }
      
      return {
        videoUrl: result.final_video_url,
        thumbnailUrl: result.thumbnail_url,
        fileSize: result.file_size_mb * 1024 * 1024, // Convert MB to bytes
      }
      
    } catch (error) {
      console.error('Video assembly error:', error)
      throw error
    }
  }

  /**
   * Get model statistics
   */
  getModelStats(): { model: string; priority: number; strengths: string[] }[] {
    return this.models.map(model => ({
      model: model.name,
      priority: model.priority,
      strengths: model.strengths,
    }))
  }

  /**
   * Estimate generation time
   */
  estimateGenerationTime(sceneCount: number, duration: number): number {
    // Base time per scene (in seconds)
    const baseTimePerScene = 30
    
    // Additional time based on duration
    const durationMultiplier = Math.max(1, duration / 60)
    
    // Parallel processing reduces total time
    const parallelEfficiency = 0.7
    
    const estimatedTime = (sceneCount * baseTimePerScene * durationMultiplier) * parallelEfficiency
    
    return Math.ceil(estimatedTime)
  }
}

// Export singleton instance
export const videoPipeline = new VideoPipeline()
