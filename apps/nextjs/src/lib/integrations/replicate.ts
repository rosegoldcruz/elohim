// Replicate AI Integration for AEON Video Generation
import Replicate from 'replicate';

export class ReplicateVideoGenerator {
  private replicate: Replicate;

  constructor(apiToken?: string) {
    this.replicate = new Replicate({
      auth: apiToken || process.env.REPLICATE_API_TOKEN || '',
    });
  }

  async generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
    try {
      const { prompt, style, duration, resolution } = options;

      // Use different models based on style
      const model = this.selectModel(style);
      
      const prediction = await this.replicate.predictions.create({
        version: model.version,
        input: {
          prompt,
          width: this.getResolutionWidth(resolution),
          height: this.getResolutionHeight(resolution),
          num_frames: this.calculateFrames(duration),
          fps: 24,
          ...model.defaultParams,
          ...options.customParams
        }
      });

      // Wait for completion
      const result = await this.waitForCompletion(prediction.id);
      
      return {
        id: prediction.id,
        url: result.output,
        status: 'completed',
        metadata: {
          model: model.name,
          prompt,
          duration,
          resolution,
          createdAt: new Date()
        }
      };

    } catch (error) {
      console.error('Replicate video generation error:', error);
      throw new Error(`Video generation failed: ${error}`);
    }
  }

  async generateImage(prompt: string, style: ImageStyle = 'realistic'): Promise<ImageGenerationResult> {
    try {
      const model = this.selectImageModel(style);
      
      const prediction = await this.replicate.predictions.create({
        version: model.version,
        input: {
          prompt,
          width: 1024,
          height: 1024,
          ...model.defaultParams
        }
      });

      const result = await this.waitForCompletion(prediction.id);
      
      return {
        id: prediction.id,
        url: result.output[0], // Most image models return array
        status: 'completed',
        metadata: {
          model: model.name,
          prompt,
          style,
          createdAt: new Date()
        }
      };

    } catch (error) {
      console.error('Replicate image generation error:', error);
      throw new Error(`Image generation failed: ${error}`);
    }
  }

  private selectModel(style: VideoStyle): ModelConfig {
    const models: Record<VideoStyle, ModelConfig> = {
      realistic: {
        name: 'stable-video-diffusion',
        version: 'stable-video-diffusion-img2vid-xt-1-1',
        defaultParams: {
          motion_bucket_id: 127,
          cond_aug: 0.02,
          decoding_t: 14,
          seed: Math.floor(Math.random() * 1000000)
        }
      },
      animated: {
        name: 'animatediff',
        version: 'animatediff-lightning-4-step',
        defaultParams: {
          guidance_scale: 7.5,
          num_inference_steps: 4,
          seed: Math.floor(Math.random() * 1000000)
        }
      },
      abstract: {
        name: 'stable-video-diffusion',
        version: 'stable-video-diffusion-img2vid-xt-1-1',
        defaultParams: {
          motion_bucket_id: 180,
          cond_aug: 0.1,
          decoding_t: 20,
          seed: Math.floor(Math.random() * 1000000)
        }
      },
      cinematic: {
        name: 'zeroscope-v2-xl',
        version: 'zeroscope-v2-xl',
        defaultParams: {
          guidance_scale: 17.5,
          num_inference_steps: 40,
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    };

    return models[style];
  }

  private selectImageModel(style: ImageStyle): ModelConfig {
    const models: Record<ImageStyle, ModelConfig> = {
      realistic: {
        name: 'sdxl',
        version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
        defaultParams: {
          guidance_scale: 7.5,
          num_inference_steps: 50,
          seed: Math.floor(Math.random() * 1000000)
        }
      },
      animated: {
        name: 'midjourney-style',
        version: 'midjourney-style',
        defaultParams: {
          guidance_scale: 7,
          num_inference_steps: 30,
          seed: Math.floor(Math.random() * 1000000)
        }
      },
      abstract: {
        name: 'kandinsky-2.2',
        version: 'kandinsky-2.2',
        defaultParams: {
          guidance_scale: 4,
          num_inference_steps: 75,
          seed: Math.floor(Math.random() * 1000000)
        }
      },
      cinematic: {
        name: 'sdxl-cinematic',
        version: 'sdxl-cinematic',
        defaultParams: {
          guidance_scale: 8,
          num_inference_steps: 40,
          seed: Math.floor(Math.random() * 1000000)
        }
      }
    };

    return models[style];
  }

  private async waitForCompletion(predictionId: string, maxWaitTime = 300000): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const prediction = await this.replicate.predictions.get(predictionId);
      
      if (prediction.status === 'succeeded') {
        return prediction;
      }
      
      if (prediction.status === 'failed') {
        throw new Error(`Prediction failed: ${prediction.error}`);
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('Prediction timed out');
  }

  private getResolutionWidth(resolution: VideoResolution): number {
    const resolutions = {
      '720p': 1280,
      '1080p': 1920,
      '4k': 3840
    };
    return resolutions[resolution];
  }

  private getResolutionHeight(resolution: VideoResolution): number {
    const resolutions = {
      '720p': 720,
      '1080p': 1080,
      '4k': 2160
    };
    return resolutions[resolution];
  }

  private calculateFrames(duration: number, fps: number = 24): number {
    return Math.floor(duration * fps);
  }

  async getModelStatus(): Promise<ModelStatus[]> {
    // Check status of available models
    try {
      const models = await this.replicate.models.list();
      return models.results.map(model => ({
        name: model.name,
        status: 'available',
        description: model.description,
        lastUpdated: new Date(model.created_at)
      }));
    } catch (error) {
      console.error('Error fetching model status:', error);
      return [];
    }
  }
}

// Types
export type VideoStyle = 'realistic' | 'animated' | 'abstract' | 'cinematic';
export type ImageStyle = 'realistic' | 'animated' | 'abstract' | 'cinematic';
export type VideoResolution = '720p' | '1080p' | '4k';

export interface VideoGenerationOptions {
  prompt: string;
  style: VideoStyle;
  duration: number; // in seconds
  resolution: VideoResolution;
  customParams?: Record<string, any>;
}

export interface VideoGenerationResult {
  id: string;
  url: string;
  status: 'completed' | 'failed';
  metadata: {
    model: string;
    prompt: string;
    duration: number;
    resolution: VideoResolution;
    createdAt: Date;
  };
}

export interface ImageGenerationResult {
  id: string;
  url: string;
  status: 'completed' | 'failed';
  metadata: {
    model: string;
    prompt: string;
    style: ImageStyle;
    createdAt: Date;
  };
}

interface ModelConfig {
  name: string;
  version: string;
  defaultParams: Record<string, any>;
}

interface ModelStatus {
  name: string;
  status: 'available' | 'unavailable';
  description: string;
  lastUpdated: Date;
}

// Export singleton instance
export const replicateGenerator = new ReplicateVideoGenerator();
