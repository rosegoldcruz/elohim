/**
 * AEON Unified Generation Agent
 * Orchestrates script, video, and music generation from a single creative prompt
 */

import { generateCinematicScript } from './ScriptWriterAgent';
import { VisualGeneratorAgent } from './VisualGeneratorAgent';
import { MusicGeneratorAgent } from './MusicGeneratorAgent';
import type { CinematicScript } from './ScriptWriterAgent';
import type { VideoGenerationRequest, VideoGenerationResult } from './VisualGeneratorAgent';
import type { MusicGenerationRequest, MusicGenerationResult } from './MusicGeneratorAgent';

export interface UnifiedGenerationRequest {
  user_id: string;
  project_id?: string;
  creative_prompt: string;
  style: 'viral' | 'cinematic' | 'educational' | 'entertainment' | 'commercial';
  platform: 'tiktok' | 'reels' | 'shorts' | 'youtube';
  duration: number; // in seconds
  preferences?: {
    music_genre?: string;
    video_style?: string;
    caption_style?: string;
    preferred_models?: {
      video?: string;
      music?: string;
    };
  };
}

export interface GeneratedAsset {
  id: string;
  type: 'script' | 'video' | 'music';
  url?: string;
  content?: any;
  metadata: {
    model_used?: string;
    processing_time: number;
    cost_estimate?: number;
  };
  success: boolean;
  error?: string;
}

export interface UnifiedGenerationResult {
  success: boolean;
  project_id: string;
  assets: {
    script?: GeneratedAsset;
    video?: GeneratedAsset;
    music?: GeneratedAsset;
  };
  total_processing_time: number;
  total_cost_estimate: number;
  ready_for_editing: boolean;
  error?: string;
}

export class UnifiedGenerationAgent {
  private visualAgent: VisualGeneratorAgent;
  private musicAgent: MusicGeneratorAgent;

  constructor() {
    this.visualAgent = new VisualGeneratorAgent();
    this.musicAgent = new MusicGeneratorAgent();
  }

  /**
   * Generate complete video project from single creative prompt
   */
  async generateProject(request: UnifiedGenerationRequest): Promise<UnifiedGenerationResult> {
    console.log(`🚀 UnifiedGenerationAgent: Starting project generation for user ${request.user_id}`);
    console.log(`🎯 Creative prompt: "${request.creative_prompt}"`);
    console.log(`🎬 Style: ${request.style}, Platform: ${request.platform}, Duration: ${request.duration}s`);

    const startTime = Date.now();
    const project_id = request.project_id || `project_${Date.now()}_${request.user_id}`;
    
    const result: UnifiedGenerationResult = {
      success: false,
      project_id,
      assets: {},
      total_processing_time: 0,
      total_cost_estimate: 0,
      ready_for_editing: false
    };

    try {
      // Step 1: Generate script (foundation for everything else)
      console.log('📝 Step 1: Generating cinematic script...');
      const scriptAsset = await this.generateScript(request);
      result.assets.script = scriptAsset;

      if (!scriptAsset.success || !scriptAsset.content) {
        throw new Error('Script generation failed - cannot proceed');
      }

      // Step 2: Generate video and music in parallel
      console.log('🎬🎵 Step 2: Generating video and music in parallel...');
      const [videoAsset, musicAsset] = await Promise.allSettled([
        this.generateVideo(request, scriptAsset.content),
        this.generateMusic(request, scriptAsset.content)
      ]);

      // Process video result
      if (videoAsset.status === 'fulfilled') {
        result.assets.video = videoAsset.value;
      } else {
        console.error('❌ Video generation failed:', videoAsset.reason);
        result.assets.video = {
          id: `video_${Date.now()}`,
          type: 'video',
          metadata: { processing_time: 0 },
          success: false,
          error: videoAsset.reason?.message || 'Video generation failed'
        };
      }

      // Process music result
      if (musicAsset.status === 'fulfilled') {
        result.assets.music = musicAsset.value;
      } else {
        console.error('❌ Music generation failed:', musicAsset.reason);
        result.assets.music = {
          id: `music_${Date.now()}`,
          type: 'music',
          metadata: { processing_time: 0 },
          success: false,
          error: musicAsset.reason?.message || 'Music generation failed'
        };
      }

      // Calculate totals
      result.total_processing_time = Date.now() - startTime;
      result.total_cost_estimate = this.calculateTotalCost(result.assets);
      
      // Determine if project is ready for editing
      result.ready_for_editing = !!(
        result.assets.script?.success && 
        (result.assets.video?.success || result.assets.music?.success)
      );
      
      result.success = result.ready_for_editing;

      console.log(`✅ UnifiedGenerationAgent: Project generated in ${result.total_processing_time}ms`);
      console.log(`💰 Total cost estimate: $${result.total_cost_estimate.toFixed(4)}`);
      console.log(`🎯 Ready for editing: ${result.ready_for_editing}`);

      return result;

    } catch (error) {
      console.error('❌ UnifiedGenerationAgent: Critical error:', error);
      
      result.total_processing_time = Date.now() - startTime;
      result.error = error instanceof Error ? error.message : 'Unknown error';
      result.success = false;
      
      return result;
    }
  }

  /**
   * Generate script from creative prompt
   */
  private async generateScript(request: UnifiedGenerationRequest): Promise<GeneratedAsset> {
    const startTime = Date.now();
    
    try {
      // Enhance prompt based on platform and style
      const enhancedPrompt = this.enhancePromptForScript(request);
      
      const script = await generateCinematicScript(enhancedPrompt, request.style);
      
      return {
        id: `script_${Date.now()}`,
        type: 'script',
        content: script,
        metadata: {
          model_used: 'gpt-4o',
          processing_time: Date.now() - startTime,
          cost_estimate: 0.02 // Approximate cost for script generation
        },
        success: true
      };
      
    } catch (error) {
      return {
        id: `script_${Date.now()}`,
        type: 'script',
        metadata: {
          processing_time: Date.now() - startTime
        },
        success: false,
        error: error instanceof Error ? error.message : 'Script generation failed'
      };
    }
  }

  /**
   * Generate video from script
   */
  private async generateVideo(request: UnifiedGenerationRequest, script: CinematicScript): Promise<GeneratedAsset> {
    const startTime = Date.now();
    
    try {
      const videoRequest: VideoGenerationRequest = {
        user_id: request.user_id,
        project_id: request.project_id,
        scenes: script.scenes.map((scene, index) => ({
          description: scene.description,
          duration: scene.duration,
          sceneNumber: index + 1,
          visualStyle: request.preferences?.video_style || request.style,
          mood: scene.mood || 'neutral'
        })),
        style: request.style,
        platform: request.platform,
        preferredModel: request.preferences?.preferred_models?.video
      };

      const videoResult = await this.visualAgent.generateScenes(videoRequest);
      
      if (!videoResult.success) {
        throw new Error(videoResult.error || 'Video generation failed');
      }

      // Combine all scene URLs (in a real implementation, you'd stitch them together)
      const videoUrls = videoResult.scenes
        .filter(scene => scene.success)
        .map(scene => scene.videoUrl);

      return {
        id: `video_${Date.now()}`,
        type: 'video',
        url: videoUrls[0], // For now, return first scene URL
        content: {
          scenes: videoResult.scenes,
          totalScenes: videoResult.totalScenes,
          successfulScenes: videoResult.successfulScenes
        },
        metadata: {
          model_used: 'multi-provider',
          processing_time: Date.now() - startTime,
          cost_estimate: this.visualAgent.estimateCost(videoResult.totalScenes)
        },
        success: true
      };
      
    } catch (error) {
      return {
        id: `video_${Date.now()}`,
        type: 'video',
        metadata: {
          processing_time: Date.now() - startTime
        },
        success: false,
        error: error instanceof Error ? error.message : 'Video generation failed'
      };
    }
  }

  /**
   * Generate music from script and request
   */
  private async generateMusic(request: UnifiedGenerationRequest, script: CinematicScript): Promise<GeneratedAsset> {
    const startTime = Date.now();
    
    try {
      const musicPrompt = this.buildMusicPrompt(request, script);
      
      const musicRequest: MusicGenerationRequest = {
        prompt: musicPrompt,
        duration: Math.min(request.duration, 30), // Cap at 30 seconds
        style: this.mapStyleToMusicStyle(request.style),
        user_id: request.user_id,
        project_id: request.project_id,
        model_preference: request.preferences?.preferred_models?.music as any
      };

      const musicResult = await this.musicAgent.generateMusic(musicRequest);
      
      if (!musicResult.success) {
        throw new Error(musicResult.error || 'Music generation failed');
      }

      return {
        id: `music_${Date.now()}`,
        type: 'music',
        url: musicResult.audio_url,
        content: {
          duration: musicResult.duration,
          style: musicResult.style,
          metadata: musicResult.metadata
        },
        metadata: {
          model_used: musicResult.model_used,
          processing_time: Date.now() - startTime,
          cost_estimate: this.musicAgent.estimateCost(request.duration)
        },
        success: true
      };
      
    } catch (error) {
      return {
        id: `music_${Date.now()}`,
        type: 'music',
        metadata: {
          processing_time: Date.now() - startTime
        },
        success: false,
        error: error instanceof Error ? error.message : 'Music generation failed'
      };
    }
  }

  /**
   * Enhance creative prompt for script generation
   */
  private enhancePromptForScript(request: UnifiedGenerationRequest): string {
    const platformContext = {
      tiktok: 'viral TikTok content with strong hooks and trending elements',
      reels: 'Instagram Reels optimized for engagement and shareability',
      shorts: 'YouTube Shorts with clear value proposition and retention',
      youtube: 'YouTube video with educational or entertainment value'
    };

    const styleContext = {
      viral: 'designed to go viral with pattern interrupts and engagement hooks',
      cinematic: 'with cinematic storytelling and visual appeal',
      educational: 'that educates while entertaining',
      entertainment: 'focused on pure entertainment value',
      commercial: 'with clear commercial intent and call-to-action'
    };

    return `Create ${platformContext[request.platform]} ${styleContext[request.style]} about: ${request.creative_prompt}. Duration: ${request.duration} seconds.`;
  }

  /**
   * Build music prompt from request and script
   */
  private buildMusicPrompt(request: UnifiedGenerationRequest, script: CinematicScript): string {
    const mood = script.scenes[0]?.mood || 'energetic';
    const genre = request.preferences?.music_genre || 'electronic';
    
    return `${genre} music with ${mood} mood for ${request.platform} video about ${request.creative_prompt}`;
  }

  /**
   * Map generation style to music style
   */
  private mapStyleToMusicStyle(style: string): 'upbeat' | 'chill' | 'dramatic' | 'ambient' | 'electronic' | 'orchestral' | 'rock' | 'jazz' {
    const mapping: Record<string, any> = {
      viral: 'upbeat',
      cinematic: 'dramatic',
      educational: 'ambient',
      entertainment: 'upbeat',
      commercial: 'electronic'
    };
    
    return mapping[style] || 'upbeat';
  }

  /**
   * Calculate total cost estimate
   */
  private calculateTotalCost(assets: UnifiedGenerationResult['assets']): number {
    let total = 0;
    
    if (assets.script?.metadata.cost_estimate) {
      total += assets.script.metadata.cost_estimate;
    }
    
    if (assets.video?.metadata.cost_estimate) {
      total += assets.video.metadata.cost_estimate;
    }
    
    if (assets.music?.metadata.cost_estimate) {
      total += assets.music.metadata.cost_estimate;
    }
    
    return total;
  }
}
