/**
 * AEON MusicGeneratorAgent - Production AI Music Generation
 * Generates original music using Replicate's MusicGen, Riffusion, and Bark models
 */

import { env } from '../../env.mjs';

export interface MusicGenerationRequest {
  prompt: string;
  duration: number;
  style: 'upbeat' | 'chill' | 'dramatic' | 'ambient' | 'electronic' | 'orchestral' | 'rock' | 'jazz' | 'custom';
  user_id: string;
  project_id?: string;
  model_preference?: 'musicgen' | 'riffusion' | 'bark' | 'auto';
  tempo?: number;
  key?: string;
  instruments?: string[];
}

export interface MusicGenerationResult {
  success: boolean;
  audio_url: string;
  duration: number;
  model_used: string;
  style: string;
  processing_time: number;
  metadata: {
    tempo?: number;
    key?: string;
    format: string;
    file_size?: number;
  };
  error?: string;
}

export interface MusicModel {
  name: string;
  replicate_model: string;
  max_duration: number;
  supported_styles: string[];
  description: string;
  price_per_second: number;
}

export class MusicGeneratorAgent {
  private models: MusicModel[] = [
    {
      name: 'MusicGen Large',
      replicate_model: 'meta/musicgen-large:b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2dbe',
      max_duration: 30,
      supported_styles: ['upbeat', 'chill', 'dramatic', 'ambient', 'electronic', 'orchestral', 'rock', 'jazz'],
      description: 'High-quality music generation with excellent coherence',
      price_per_second: 0.05
    },
    {
      name: 'MusicGen Melody',
      replicate_model: 'meta/musicgen-melody:b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2dbe',
      max_duration: 30,
      supported_styles: ['upbeat', 'chill', 'dramatic', 'ambient'],
      description: 'Melody-conditioned music generation',
      price_per_second: 0.05
    },
    {
      name: 'Riffusion',
      replicate_model: 'riffusion/riffusion:8cf61ea6c56afd61d8f5b9ffd14d7c216c0a93844ce2d82ac1c9ecc9c7f24e05',
      max_duration: 10,
      supported_styles: ['electronic', 'ambient', 'rock', 'jazz'],
      description: 'Spectrogram-based music generation',
      price_per_second: 0.03
    },
    {
      name: 'Bark Audio',
      replicate_model: 'suno-ai/bark:b76242b40d67c76ab6742e987628a2a9ac019e11d56ab96c4e91ce03b79b2787',
      max_duration: 15,
      supported_styles: ['ambient', 'electronic', 'custom'],
      description: 'Text-to-audio with music capabilities',
      price_per_second: 0.04
    }
  ];

  constructor() {
    this.validateApiKeys();
  }

  /**
   * Validate required API keys
   */
  private validateApiKeys(): void {
    if (!env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is required for music generation');
    }
  }

  /**
   * Generate music based on user request
   */
  async generateMusic(request: MusicGenerationRequest): Promise<MusicGenerationResult> {
    console.log(`🎵 MusicGeneratorAgent: Generating ${request.duration}s of ${request.style} music for user ${request.user_id}`);
    console.log(`🎯 Prompt: "${request.prompt}"`);
    
    const startTime = Date.now();
    
    try {
      // Select optimal model
      const model = this.selectOptimalModel(request);
      console.log(`🎼 Selected model: ${model.name}`);
      
      // Generate music
      const audioUrl = await this.generateWithModel(model, request);
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        audio_url: audioUrl,
        duration: request.duration,
        model_used: model.name,
        style: request.style,
        processing_time: processingTime,
        metadata: {
          tempo: request.tempo,
          key: request.key,
          format: 'mp3',
        }
      };
      
    } catch (error) {
      console.error('❌ Music generation failed:', error);
      
      return {
        success: false,
        audio_url: '',
        duration: 0,
        model_used: 'none',
        style: request.style,
        processing_time: Date.now() - startTime,
        metadata: {
          format: 'mp3'
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Select optimal model based on request parameters
   */
  private selectOptimalModel(request: MusicGenerationRequest): MusicModel {
    // If user specified a model preference
    if (request.model_preference && request.model_preference !== 'auto') {
      const preferredModel = this.models.find(m => 
        m.name.toLowerCase().includes(request.model_preference!)
      );
      if (preferredModel) return preferredModel;
    }
    
    // Filter models by style support and duration
    const compatibleModels = this.models.filter(model => 
      model.supported_styles.includes(request.style) &&
      model.max_duration >= Math.min(request.duration, 30)
    );
    
    if (compatibleModels.length === 0) {
      // Fallback to MusicGen Large
      return this.models[0];
    }
    
    // Select best model based on style optimization
    if (request.style === 'electronic' || request.style === 'ambient') {
      return compatibleModels.find(m => m.name === 'Riffusion') || compatibleModels[0];
    }
    
    if (request.style === 'orchestral' || request.style === 'dramatic') {
      return compatibleModels.find(m => m.name === 'MusicGen Large') || compatibleModels[0];
    }
    
    // Default to highest quality model
    return compatibleModels[0];
  }

  /**
   * Generate music using selected model
   */
  private async generateWithModel(model: MusicModel, request: MusicGenerationRequest): Promise<string> {
    const enhancedPrompt = this.buildMusicPrompt(request);
    const duration = Math.min(request.duration, model.max_duration);
    
    console.log(`🎹 Generating with ${model.name}: "${enhancedPrompt}" (${duration}s)`);
    
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${env.REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: model.replicate_model,
        input: this.buildModelInput(model, enhancedPrompt, duration, request),
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
   * Build enhanced music prompt
   */
  private buildMusicPrompt(request: MusicGenerationRequest): string {
    let prompt = request.prompt;
    
    // Add style descriptors
    const styleDescriptors = {
      upbeat: 'energetic, fast-paced, positive',
      chill: 'relaxed, mellow, smooth',
      dramatic: 'intense, emotional, cinematic',
      ambient: 'atmospheric, ethereal, spacious',
      electronic: 'synthesized, digital, modern',
      orchestral: 'classical instruments, symphonic, grand',
      rock: 'guitar-driven, powerful, rhythmic',
      jazz: 'improvised, sophisticated, swing'
    };
    
    if (styleDescriptors[request.style]) {
      prompt += `, ${styleDescriptors[request.style]}`;
    }
    
    // Add tempo if specified
    if (request.tempo) {
      const tempoDesc = request.tempo > 120 ? 'fast tempo' : 
                       request.tempo > 90 ? 'medium tempo' : 'slow tempo';
      prompt += `, ${tempoDesc}`;
    }
    
    // Add key if specified
    if (request.key) {
      prompt += `, in ${request.key}`;
    }
    
    // Add instruments if specified
    if (request.instruments && request.instruments.length > 0) {
      prompt += `, featuring ${request.instruments.join(', ')}`;
    }
    
    return prompt;
  }

  /**
   * Build model-specific input parameters
   */
  private buildModelInput(model: MusicModel, prompt: string, duration: number, request: MusicGenerationRequest): any {
    const baseInput = {
      prompt,
      duration,
    };
    
    // Model-specific parameters
    if (model.name.includes('MusicGen')) {
      return {
        ...baseInput,
        model_version: 'large',
        output_format: 'mp3',
        normalization_strategy: 'peak'
      };
    }
    
    if (model.name === 'Riffusion') {
      return {
        prompt_a: prompt,
        prompt_b: prompt,
        denoising: 0.75,
        num_inference_steps: 50
      };
    }
    
    if (model.name === 'Bark Audio') {
      return {
        prompt: `♪ ${prompt} ♪`,
        text_temp: 0.7,
        waveform_temp: 0.7
      };
    }
    
    return baseInput;
  }

  /**
   * Poll Replicate prediction until completion
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
        // Handle different output formats
        if (typeof prediction.output === 'string') {
          return prediction.output;
        } else if (Array.isArray(prediction.output) && prediction.output.length > 0) {
          return prediction.output[0];
        } else {
          throw new Error('Invalid output format from Replicate');
        }
      }
      
      if (prediction.status === 'failed') {
        throw new Error(`Music generation failed: ${prediction.error}`);
      }
      
      // Wait 5 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }
    
    throw new Error('Music generation timeout');
  }

  /**
   * Get available models and their capabilities
   */
  getAvailableModels(): MusicModel[] {
    return this.models;
  }

  /**
   * Estimate generation cost
   */
  estimateCost(duration: number, model_preference?: string): number {
    const model = model_preference 
      ? this.models.find(m => m.name.toLowerCase().includes(model_preference.toLowerCase())) || this.models[0]
      : this.models[0];
    
    return duration * model.price_per_second;
  }
}
