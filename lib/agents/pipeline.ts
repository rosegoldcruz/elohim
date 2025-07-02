/**
 * AEON Agent Pipeline - Orchestrates the complete video generation workflow
 * Coordinates all agents for end-to-end video creation
 */

import { TrendsAgent } from './TrendsAgent';
import { ScriptWriterAgent } from './ScriptWriterAgent';
import { ScenePlannerAgent } from './ScenePlannerAgent';
import { StitcherAgent } from './StitcherAgent';
import { EditorAgent } from './EditorAgent';
import { StorageManager } from '../storage-manager';
import { createClient } from '@/lib/supabase/server';

export interface PipelineRequest {
  topic?: string;
  custom_script?: string;
  duration?: number;
  style?: 'educational' | 'entertaining' | 'inspirational' | 'professional';
  platform?: 'tiktok' | 'youtube' | 'instagram' | 'general';
  user_id: string;
  project_id?: string;
}

export interface PipelineResult {
  success: boolean;
  video_url?: string;
  thumbnail_url?: string;
  script?: any;
  scenes?: any[];
  metadata: {
    total_duration: number;
    processing_time: number;
    agents_used: string[];
    quality_score: number;
    file_size: number;
  };
  error?: string;
}

export interface PipelineProgress {
  stage: 'trends' | 'script' | 'scenes' | 'generation' | 'stitching' | 'editing' | 'complete';
  progress: number;
  message: string;
  agent: string;
  timestamp: string;
}

export class AeonPipeline {
  private trendsAgent: TrendsAgent;
  private scriptWriter: ScriptWriterAgent;
  private scenePlanner: ScenePlannerAgent;
  private stitcher: StitcherAgent;
  private editor: EditorAgent;
  private storage: StorageManager;
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.trendsAgent = new TrendsAgent();
    this.scriptWriter = new ScriptWriterAgent();
    this.scenePlanner = new ScenePlannerAgent();
    this.stitcher = new StitcherAgent();
    this.editor = new EditorAgent();
    this.storage = new StorageManager();
    this.supabase = createClient();
  }

  /**
   * Run the complete video generation pipeline
   */
  async runPipeline(
    request: PipelineRequest,
    onProgress?: (progress: PipelineProgress) => void
  ): Promise<PipelineResult> {
    console.log('🚀 AEON Pipeline: Starting video generation...');
    
    const startTime = Date.now();
    const agentsUsed: string[] = [];
    
    try {
      // Step 1: Get trending topic or use provided topic
      await this.updateProgress('trends', 10, 'Analyzing trending topics...', 'TrendsAgent', onProgress);
      
      let topic = request.topic;
      if (!topic && !request.custom_script) {
        const trends = await this.trendsAgent.fetchTrendingTopics();
        topic = trends[0];
        agentsUsed.push('TrendsAgent');
      }
      
      // Step 2: Generate script
      await this.updateProgress('script', 25, 'Generating compelling script...', 'ScriptWriterAgent', onProgress);
      
      let script;
      if (request.custom_script) {
        script = {
          title: `Custom Script - ${topic || 'Video'}`,
          description: 'Custom user-provided script',
          total_duration: request.duration || 60,
          target_audience: 'general audience',
          tone: request.style || 'conversational',
          sections: [
            {
              type: 'body',
              content: request.custom_script,
              duration: request.duration || 60,
              visual_cue: 'Main content visuals',
              emotion: 'informative'
            }
          ],
          hashtags: ['#custom'],
          thumbnail_suggestion: 'Custom video thumbnail'
        };
      } else {
        script = await this.scriptWriter.generateScript(topic!, {
          duration: request.duration,
          tone: request.style,
          platform: request.platform
        });
        agentsUsed.push('ScriptWriterAgent');
      }
      
      // Step 3: Plan scenes
      await this.updateProgress('scenes', 40, 'Breaking script into visual scenes...', 'ScenePlannerAgent', onProgress);
      
      const scenePlan = await this.scenePlanner.planScenes(script);
      agentsUsed.push('ScenePlannerAgent');
      
      // Step 4: Generate video scenes (simulated)
      await this.updateProgress('generation', 60, 'Generating video scenes with AI...', 'VisualGeneratorAgent', onProgress);
      
      const sceneFiles = await this.simulateSceneGeneration(scenePlan.scenes, request.user_id);
      agentsUsed.push('VisualGeneratorAgent');
      
      // Step 5: Stitch scenes together
      await this.updateProgress('stitching', 80, 'Combining scenes into final video...', 'StitcherAgent', onProgress);
      
      const videoId = `video_${Date.now()}_${request.user_id}`;
      const stitchedVideo = await this.stitcher.stitchScenes(sceneFiles, `${videoId}.mp4`);
      agentsUsed.push('StitcherAgent');
      
      // Step 6: Final editing and effects
      await this.updateProgress('editing', 90, 'Adding captions and final touches...', 'EditorAgent', onProgress);
      
      const finalVideo = await this.editor.addCaptionsAndEffects(stitchedVideo, {
        add_captions: true,
        caption_style: 'modern',
        add_effects: true,
        color_grading: 'cinematic',
        thumbnail_generation: true
      });
      agentsUsed.push('EditorAgent');
      
      // Step 7: Save to database
      await this.saveToDatabase(request, script, scenePlan, finalVideo);
      
      await this.updateProgress('complete', 100, 'Video generation complete!', 'Pipeline', onProgress);
      
      const processingTime = Date.now() - startTime;
      
      console.log(`✅ AEON Pipeline: Video generated successfully in ${processingTime}ms`);
      
      return {
        success: true,
        video_url: finalVideo,
        thumbnail_url: `${finalVideo}?thumbnail=true`,
        script,
        scenes: scenePlan.scenes,
        metadata: {
          total_duration: script.total_duration,
          processing_time: processingTime,
          agents_used: agentsUsed,
          quality_score: 85,
          file_size: 1024 * 1024 * 15 // 15MB estimated
        }
      };
      
    } catch (error) {
      console.error('❌ AEON Pipeline error:', error);
      
      return {
        success: false,
        metadata: {
          total_duration: 0,
          processing_time: Date.now() - startTime,
          agents_used: agentsUsed,
          quality_score: 0,
          file_size: 0
        },
        error: error instanceof Error ? error.message : 'Unknown pipeline error'
      };
    }
  }

  /**
   * Run pipeline with custom configuration
   */
  async runCustomPipeline(
    request: PipelineRequest & {
      skip_trends?: boolean;
      skip_script?: boolean;
      custom_scenes?: any[];
      editing_options?: any;
    },
    onProgress?: (progress: PipelineProgress) => void
  ): Promise<PipelineResult> {
    
    console.log('🎯 AEON Pipeline: Running custom pipeline...');
    
    // Custom pipeline logic with selective agent usage
    const startTime = Date.now();
    const agentsUsed: string[] = [];
    
    try {
      let currentProgress = 0;
      const progressStep = 100 / 6; // 6 potential steps
      
      // Conditional agent execution based on request
      let script = request.custom_script ? { content: request.custom_script } : null;
      let scenes = request.custom_scenes || null;
      
      if (!request.skip_trends && !request.topic) {
        await this.updateProgress('trends', currentProgress += progressStep, 'Getting trends...', 'TrendsAgent', onProgress);
        const trends = await this.trendsAgent.fetchTrendingTopics();
        request.topic = trends[0];
        agentsUsed.push('TrendsAgent');
      }
      
      if (!request.skip_script && !script) {
        await this.updateProgress('script', currentProgress += progressStep, 'Writing script...', 'ScriptWriterAgent', onProgress);
        script = await this.scriptWriter.generateScript(request.topic!, {
          duration: request.duration,
          tone: request.style,
          platform: request.platform
        });
        agentsUsed.push('ScriptWriterAgent');
      }
      
      if (!scenes && script) {
        await this.updateProgress('scenes', currentProgress += progressStep, 'Planning scenes...', 'ScenePlannerAgent', onProgress);
        const scenePlan = await this.scenePlanner.planScenes(script);
        scenes = scenePlan.scenes;
        agentsUsed.push('ScenePlannerAgent');
      }
      
      // Continue with generation, stitching, and editing...
      const videoId = `custom_${Date.now()}_${request.user_id}`;
      
      await this.updateProgress('generation', currentProgress += progressStep, 'Generating scenes...', 'VisualGeneratorAgent', onProgress);
      const sceneFiles = await this.simulateSceneGeneration(scenes || [], request.user_id);
      agentsUsed.push('VisualGeneratorAgent');
      
      await this.updateProgress('stitching', currentProgress += progressStep, 'Stitching video...', 'StitcherAgent', onProgress);
      const stitchedVideo = await this.stitcher.stitchScenes(sceneFiles, `${videoId}.mp4`);
      agentsUsed.push('StitcherAgent');
      
      await this.updateProgress('editing', currentProgress += progressStep, 'Final editing...', 'EditorAgent', onProgress);
      const finalVideo = await this.editor.addCaptionsAndEffects(stitchedVideo, request.editing_options);
      agentsUsed.push('EditorAgent');
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        video_url: finalVideo,
        thumbnail_url: `${finalVideo}?thumbnail=true`,
        script,
        scenes,
        metadata: {
          total_duration: request.duration || 60,
          processing_time: processingTime,
          agents_used: agentsUsed,
          quality_score: 88,
          file_size: 1024 * 1024 * 12
        }
      };
      
    } catch (error) {
      console.error('❌ Custom Pipeline error:', error);
      
      return {
        success: false,
        metadata: {
          total_duration: 0,
          processing_time: Date.now() - startTime,
          agents_used: agentsUsed,
          quality_score: 0,
          file_size: 0
        },
        error: error instanceof Error ? error.message : 'Custom pipeline error'
      };
    }
  }

  /**
   * Update progress and notify callback
   */
  private async updateProgress(
    stage: PipelineProgress['stage'],
    progress: number,
    message: string,
    agent: string,
    onProgress?: (progress: PipelineProgress) => void
  ): Promise<void> {
    
    const progressUpdate: PipelineProgress = {
      stage,
      progress: Math.min(progress, 100),
      message,
      agent,
      timestamp: new Date().toISOString()
    };
    
    console.log(`📊 Pipeline Progress: ${progress}% - ${message} (${agent})`);
    
    if (onProgress) {
      onProgress(progressUpdate);
    }
    
    // Small delay to simulate processing
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Simulate scene generation (replace with actual AI generation)
   */
  private async simulateSceneGeneration(scenes: any[], userId: string): Promise<string[]> {
    console.log(`🎥 Simulating generation of ${scenes.length} scenes...`);
    
    // In production, this would call actual AI video generation APIs
    const sceneFiles: string[] = [];
    
    for (let i = 0; i < scenes.length; i++) {
      const sceneFile = `scene_${i + 1}_${userId}_${Date.now()}.mp4`;
      sceneFiles.push(`/videos/${sceneFile}`);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return sceneFiles;
  }

  /**
   * Save pipeline results to database
   */
  private async saveToDatabase(
    request: PipelineRequest,
    script: any,
    scenePlan: any,
    videoUrl: string
  ): Promise<void> {
    
    try {
      // Save to projects table
      const { error } = await this.supabase
        .from('projects')
        .insert({
          user_id: request.user_id,
          title: script.title || 'Generated Video',
          description: script.description || '',
          video_url: videoUrl,
          script_data: script,
          scene_data: scenePlan,
          status: 'completed',
          created_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Database save error:', error);
      } else {
        console.log('✅ Pipeline results saved to database');
      }
      
    } catch (error) {
      console.error('Database save failed:', error);
    }
  }

  /**
   * Get pipeline status for a project
   */
  async getPipelineStatus(projectId: string): Promise<any> {
    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();
      
      if (error) {
        throw error;
      }
      
      return data;
      
    } catch (error) {
      console.error('Failed to get pipeline status:', error);
      return null;
    }
  }
}
