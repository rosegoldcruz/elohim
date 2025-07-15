/**
 * AEON VisualGeneratorAgent - Real AI Video Generation
 * Generates actual videos using Replicate, Minimax, and Kling APIs
 */

import { env } from '@/env.mjs';
import { PlannedScene } from './ScenePlannerAgent';

export interface VideoGenerationRequest {
  scenes: PlannedScene[];
  user_id: string;
  style?: string;
  quality?: 'standard' | 'high' | 'ultra';
}

export interface GeneratedScene {
  sceneIndex: number;
  sceneId: string;
  prompt: string;
  videoUrl: string;
  duration: number;
  modelUsed: string;
  success: boolean;
  error?: string;
  processingTime: number;
}

export interface VideoGenerationResult {
  success: boolean;
  scenes: GeneratedScene[];
  totalScenes: number;
  successfulScenes: number;
  failedScenes: number;
  totalProcessingTime: number;
  error?: string;
}

interface VideoModel {
  name: string;
  provider: 'replicate' | 'minimax' | 'kling';
  modelId: string;
  maxDuration: number;
  aspectRatio: string;
}

export class VisualGeneratorAgent {
  private readonly models: VideoModel[] = [
    {
      name: 'Runway Gen-3',
      provider: 'replicate',
      modelId: 'runway-ml/runway-gen3-alpha:b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2dbe',
      maxDuration: 10,
      aspectRatio: '16:9'
    },
    {
      name: 'Stable Video Diffusion',
      provider: 'replicate',
      modelId: 'stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb1a4c069c4c7e0e5e',
      maxDuration: 4,
      aspectRatio: '16:9'
    },
    {
      name: 'Minimax Video-01',
      provider: 'minimax',
      modelId: 'video-01',
      maxDuration: 6,
      aspectRatio: '16:9'
    },
    {
      name: 'Kling v1.6',
      provider: 'kling',
      modelId: 'kling-v1.6-standard',
      maxDuration: 5,
      aspectRatio: '16:9'
    },
    {
      name: 'Luma Dream Machine',
      provider: 'replicate',
      modelId: 'lumalabs/dream-machine:b49c4d9e0d7c4e8b9a8b9c8d9e0f1a2b3c4d5e6f',
      maxDuration: 5,
      aspectRatio: '16:9'
    },
    {
      name: 'Haiper Video',
      provider: 'replicate',
      modelId: 'haiper-ai/haiper-video-v2:c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3',
      maxDuration: 4,
      aspectRatio: '16:9'
    }
  ];

  /**
   * Generate videos for all scenes using AI models
   */
  async generateScenes(request: VideoGenerationRequest): Promise<VideoGenerationResult> {
    console.log(`🎥 VisualGeneratorAgent: Generating ${request.scenes.length} scenes for user ${request.user_id}`);
    
    const startTime = Date.now();
    const results: GeneratedScene[] = [];
    
    try {
      // Validate API keys
      this.validateApiKeys();
      
      // Process each scene
      for (let i = 0; i < request.scenes.length; i++) {
        const scene = request.scenes[i];
        console.log(`🎬 Generating scene ${i + 1}/${request.scenes.length}: ${scene.description.substring(0, 50)}...`);
        
        try {
          const result = await this.generateSingleScene(scene, i, request);
          results.push(result);
          
          if (result.success) {
            console.log(`✅ Scene ${i + 1} generated successfully: ${result.videoUrl}`);
          } else {
            console.error(`❌ Scene ${i + 1} failed: ${result.error}`);
          }
        } catch (error) {
          console.error(`❌ Scene ${i + 1} generation error:`, error);
          results.push({
            sceneIndex: i,
            sceneId: `scene_${i}_${Date.now()}`,
            prompt: scene.description,
            videoUrl: '',
            duration: scene.duration,
            modelUsed: 'none',
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            processingTime: 0
          });
        }
      }
      
      const totalProcessingTime = Date.now() - startTime;
      const successfulScenes = results.filter(r => r.success).length;
      const failedScenes = results.length - successfulScenes;
      
      console.log(`🎯 VisualGeneratorAgent: Completed ${successfulScenes}/${results.length} scenes in ${totalProcessingTime}ms`);
      
      return {
        success: successfulScenes > 0,
        scenes: results,
        totalScenes: results.length,
        successfulScenes,
        failedScenes,
        totalProcessingTime,
        error: failedScenes > 0 ? `${failedScenes} scenes failed to generate` : undefined
      };
      
    } catch (error) {
      console.error('❌ VisualGeneratorAgent: Critical error:', error);
      return {
        success: false,
        scenes: results,
        totalScenes: request.scenes.length,
        successfulScenes: 0,
        failedScenes: request.scenes.length,
        totalProcessingTime: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate a single scene video with multi-provider fallback
   */
  private async generateSingleScene(
    scene: PlannedScene,
    sceneIndex: number,
    request: VideoGenerationRequest
  ): Promise<GeneratedScene> {
    const startTime = Date.now();

    // Build optimized prompt
    const prompt = this.buildVideoPrompt(scene, request.style);

    console.log(`🎥 Generating scene ${sceneIndex + 1} with multi-provider fallback: "${prompt.substring(0, 100)}..."`);

    // Get provider priority order
    const providerPriority = this.getProviderPriority(request.preferredModel);
    let lastError: Error | null = null;

    // Try each provider in order until one succeeds
    for (const provider of providerPriority) {
      const model = this.models.find(m => m.provider === provider);
      if (!model) {
        console.warn(`⚠️ No model found for provider: ${provider}`);
        continue;
      }

      try {
        console.log(`🔄 Attempting scene ${sceneIndex + 1} with ${model.name}`);

        let videoUrl: string;

        switch (model.provider) {
          case 'replicate':
            videoUrl = await this.generateWithReplicate(model.modelId, prompt, scene.duration);
            break;
          case 'minimax':
            videoUrl = await this.generateWithMinimax(model.modelId, prompt, scene.duration);
            break;
          case 'kling':
            videoUrl = await this.generateWithKling(model.modelId, prompt, scene.duration);
            break;
          default:
            throw new Error(`Unsupported provider: ${model.provider}`);
        }

        const processingTime = Date.now() - startTime;

        console.log(`✅ Scene ${sceneIndex + 1} generated successfully with ${model.name}`);

        return {
          sceneIndex,
          sceneId: `scene_${sceneIndex}_${Date.now()}`,
          prompt,
          videoUrl,
          duration: scene.duration,
          modelUsed: model.name,
          success: true,
          processingTime
        };

      } catch (error) {
        console.warn(`⚠️ ${model.name} failed for scene ${sceneIndex + 1}:`, error);
        lastError = error instanceof Error ? error : new Error(`${model.name} generation failed`);
        // Continue to next provider
        continue;
      }
    }

    // If all providers failed, return error result
    console.error(`❌ Scene ${sceneIndex + 1} failed with all providers`);
    return {
      sceneIndex,
      sceneId: `scene_${sceneIndex}_${Date.now()}`,
      prompt,
      videoUrl: '',
      duration: scene.duration,
      modelUsed: 'none',
      success: false,
      error: lastError?.message || 'All video generation providers failed',
      processingTime: Date.now() - startTime
    };
  }

  /**
   * Get provider priority order based on preferences
   */
  private getProviderPriority(preferredModel?: string): string[] {
    const allProviders = ['replicate', 'minimax', 'kling'];

    if (preferredModel) {
      const preferredProvider = this.models.find(m =>
        m.name.toLowerCase().includes(preferredModel.toLowerCase())
      )?.provider;

      if (preferredProvider) {
        return [preferredProvider, ...allProviders.filter(p => p !== preferredProvider)];
      }
    }

    // Default priority: Replicate (most reliable) -> Minimax -> Kling
    return allProviders;
  }

  /**
   * Generate video using Replicate API
   */
  private async generateWithReplicate(modelId: string, prompt: string, duration: number): Promise<string> {
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: modelId,
        input: {
          prompt,
          duration: Math.min(duration, 10), // Replicate max duration
          aspect_ratio: '16:9',
          fps: 30,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`);
    }

    const prediction = await response.json();
    
    // Poll for completion
    return this.pollReplicatePrediction(prediction.id);
  }

  /**
   * Poll Replicate prediction until complete
   */
  private async pollReplicatePrediction(predictionId: string): Promise<string> {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${env.REPLICATE_API_TOKEN}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Replicate polling error: ${response.statusText}`);
      }
      
      const prediction = await response.json();
      
      if (prediction.status === 'succeeded') {
        return prediction.output;
      } else if (prediction.status === 'failed') {
        throw new Error(`Replicate generation failed: ${prediction.error}`);
      }
      
      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    
    throw new Error('Replicate generation timeout');
  }

  /**
   * Generate video using Minimax API via Replicate
   */
  private async generateWithMinimax(modelId: string, prompt: string, duration: number): Promise<string> {
    console.log(`🎬 Minimax generation: ${modelId}, ${prompt}, ${duration}s`);

    // Map modelId to actual Replicate model
    const replicateModel = this.getMinimaxReplicateModel(modelId);

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: replicateModel,
        input: {
          prompt,
          duration: Math.min(duration, 6), // Minimax max duration
          prompt_optimizer: true,
          aspect_ratio: '16:9'
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Minimax API error: ${response.statusText}`);
    }

    const prediction = await response.json();

    // Poll for completion
    return this.pollReplicatePrediction(prediction.id);
  }

  /**
   * Generate video using Kling API via Replicate
   */
  private async generateWithKling(modelId: string, prompt: string, duration: number): Promise<string> {
    console.log(`🎬 Kling generation: ${modelId}, ${prompt}, ${duration}s`);

    // Map modelId to actual Replicate model
    const replicateModel = this.getKlingReplicateModel(modelId);

    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: replicateModel,
        input: {
          prompt,
          duration: Math.min(duration, 5), // Kling max duration
          aspect_ratio: '16:9',
          cfg_scale: 7.5
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Kling API error: ${response.statusText}`);
    }

    const prediction = await response.json();

    // Poll for completion
    return this.pollReplicatePrediction(prediction.id);
  }

  /**
   * Select the best model for a specific scene
   */
  private selectModelForScene(scene: PlannedScene): VideoModel {
    // For high-energy scenes, prefer Runway
    if (scene.energy >= 8) {
      return this.models.find(m => m.name.includes('Runway')) || this.models[0];
    }
    
    // For longer scenes, prefer Minimax
    if (scene.duration > 5) {
      return this.models.find(m => m.provider === 'minimax') || this.models[0];
    }
    
    // Default to first available model
    return this.models[0];
  }

  /**
   * Build optimized video prompt from scene data
   */
  private buildVideoPrompt(scene: PlannedScene, style?: string): string {
    let prompt = scene.description;
    
    // Add camera direction
    if (scene.camera) {
      prompt += `, ${scene.camera}`;
    }
    
    // Add shot type
    if (scene.shotType) {
      prompt += `, ${scene.shotType}`;
    }
    
    // Add style
    if (style) {
      prompt += `, ${style} style`;
    }
    
    // Add quality enhancers
    prompt += ', high quality, professional cinematography, 4K';
    
    return prompt;
  }

  /**
   * Validate required API keys
   */
  private validateApiKeys(): void {
    if (!env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is required for video generation');
    }
    
    // Add other API key validations as needed
    console.log('✅ API keys validated');
  }
}
