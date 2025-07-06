/**
 * AEON Agent Pipeline - Orchestrates the complete video generation workflow
 * Coordinates all agents for end-to-end video creation
 */

import { generateCinematicScript } from './ScriptWriterAgent';
import { validateScriptStructure } from './ScenePlannerAgent';
import { TrendsAgent } from './TrendsAgent';
import { ScriptWriterAgent, VideoScript, ScriptScene } from './ScriptWriterAgent';
import { ScenePlannerAgent, PlannedScene, ScenePlan } from './ScenePlannerAgent';
import { VisualGeneratorAgent } from './VisualGeneratorAgent';
import { ParallelVisualGenerationAgent, generateVideoParallel } from './ParallelVisualGenerationAgent';
import { StitcherAgent } from './StitcherAgent';
import { EditorAgent } from './EditorAgent';
import { StorageManager } from '../storage-manager';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/env.mjs';
import { getDefaultModelNames } from '@/config/videoModels';

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

export async function runScriptGeneration(topic: string, style: string) {
  const script = await generateCinematicScript(topic, style);
  if (!validateScriptStructure(script)) {
    throw new Error("Generated script does not match cinematic schema. Manual fix or re-run required.");
  }
  // Pass script object to ScenePlannerAgent, VisualGeneratorAgent, etc.
  // ...
  return script;
}

export class AeonPipeline {
  private trendsAgent: TrendsAgent;
  private scriptWriter: ScriptWriterAgent;
  private scenePlanner: ScenePlannerAgent;
  private visualGenerator: VisualGeneratorAgent;
  private parallelVisualGenerator: ParallelVisualGenerationAgent;
  private stitcher: StitcherAgent;
  private editor: EditorAgent;
  private storage: StorageManager;
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.trendsAgent = new TrendsAgent();
    this.scriptWriter = new ScriptWriterAgent();
    this.scenePlanner = new ScenePlannerAgent();
    this.visualGenerator = new VisualGeneratorAgent();
    this.parallelVisualGenerator = new ParallelVisualGenerationAgent();
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
      
      // Step 4: Generate video scenes with AI (Parallel or Sequential)
      await this.updateProgress('generation', 60, 'Generating video scenes with AI...', 'ParallelVisualGenerationAgent', onProgress);

      let sceneFiles: string[] = [];

      // Use parallel generation for exactly 10 scenes (5 agents × 2 scenes each)
      if (scenePlan.scenes.length === 10) {
        console.log('🚀 Using parallel generation for 10 scenes (5 agents × 2 scenes each)');

        const scenePrompts = scenePlan.scenes.map(scene => scene.description);
        const modelNames = getDefaultModelNames();

        // Create custom inputs for each scene
        const customSceneInputs = scenePlan.scenes.map(scene => ({
          first_frame_image: scene.visualElements?.includes('text-overlay') ? undefined : undefined,
          aspect_ratio: '16:9',
          duration: Math.min(scene.duration, 6)
        }));

        const parallelResult = await generateVideoParallel(
          scenePrompts,
          5, // 5 agents
          2, // 2 scenes per agent
          modelNames,
          customSceneInputs,
          (progress) => {
            const progressPercent = Math.floor(60 + (progress.completedScenes / progress.totalScenes) * 25);
            this.updateProgress('generation', progressPercent,
              `Parallel generation: ${progress.completedScenes}/${progress.totalScenes} scenes (Agent ${progress.currentAgent + 1})`,
              'ParallelVisualGenerationAgent', onProgress);
          }
        );

        if (!parallelResult.success) {
          throw new Error(`Parallel video generation failed: ${parallelResult.error}`);
        }

        sceneFiles = parallelResult.sceneResults
          .filter(scene => scene.success)
          .sort((a, b) => a.sceneIndex - b.sceneIndex)
          .map(scene => scene.videoUrl);

        agentsUsed.push('ParallelVisualGenerationAgent');
        console.log(`✅ Parallel generation: ${parallelResult.sceneResults.filter(s => s.success).length}/${parallelResult.sceneResults.length} scenes successful`);
        console.log(`💰 Total cost: $${parallelResult.totalCost.toFixed(2)}`);

      } else {
        // Use sequential generation for other scene counts
        console.log(`🔄 Using sequential generation for ${scenePlan.scenes.length} scenes`);

        const generationResult = await this.visualGenerator.generateScenes({
          scenes: scenePlan.scenes,
          user_id: request.user_id,
          style: request.style,
          quality: 'high'
        });

        if (!generationResult.success) {
          throw new Error(`Video generation failed: ${generationResult.error}`);
        }

        sceneFiles = generationResult.scenes
          .filter(scene => scene.success)
          .map(scene => scene.videoUrl);

        agentsUsed.push('VisualGeneratorAgent');
        console.log(`✅ Sequential generation: ${generationResult.successfulScenes}/${generationResult.totalScenes} scenes successful`);
      }
      
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
      
      await this.updateProgress('generation', currentProgress += progressStep, 'Generating scenes...', 'ParallelVisualGenerationAgent', onProgress);

      let sceneFiles: string[] = [];

      // Use parallel generation for exactly 10 scenes
      if (scenes && scenes.length === 10) {
        console.log('🚀 Custom script: Using parallel generation for 10 scenes');

        const scenePrompts = scenes.map(scene => scene.description);
        const modelNames = getDefaultModelNames();

        const customSceneInputs = scenes.map(scene => ({
          aspect_ratio: '16:9',
          duration: Math.min(scene.duration, 6)
        }));

        const parallelResult = await generateVideoParallel(
          scenePrompts,
          5,
          2,
          modelNames,
          customSceneInputs
        );

        if (!parallelResult.success) {
          throw new Error(`Parallel video generation failed: ${parallelResult.error}`);
        }

        sceneFiles = parallelResult.sceneResults
          .filter(scene => scene.success)
          .sort((a, b) => a.sceneIndex - b.sceneIndex)
          .map(scene => scene.videoUrl);

        agentsUsed.push('ParallelVisualGenerationAgent');

      } else {
        // Use sequential generation
        const generationResult = await this.visualGenerator.generateScenes({
          scenes: scenes || [],
          user_id: request.user_id,
          style: request.style,
          quality: 'high'
        });

        if (!generationResult.success) {
          throw new Error(`Video generation failed: ${generationResult.error}`);
        }

        sceneFiles = generationResult.scenes
          .filter(scene => scene.success)
          .map(scene => scene.videoUrl);

        agentsUsed.push('VisualGeneratorAgent');
      }
      
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
   * REMOVED: simulateSceneGeneration - Now using real VisualGeneratorAgent
   */

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

/**
 * Viral TikTok Video Script Pipeline
 * Creates TikTok-optimized video scripts with viral techniques
 */
export async function createVideoScriptPipeline(
  topic: string,
  style: string = "TikTok/Documentary",
  duration: number = 60,
  sceneCount?: number
): Promise<{ script: VideoScript; plan: ScenePlan }> {

  console.log(`🎬 Starting Viral TikTok Pipeline for: "${topic}"`);

  try {
    // Initialize agents (ScriptWriterAgent now uses DeepSeek)
    const scriptAgent = new ScriptWriterAgent();
    const planner = new ScenePlannerAgent();

    // Generate viral script with TikTok techniques
    console.log('📝 Generating viral script...');
    const script = await scriptAgent.generateScript(topic, {
      duration,
      style,
      sceneCount: sceneCount || Math.max(4, Math.min(8, Math.floor(duration / 8))),
      tone: 'entertaining',
      platform: 'tiktok'
    });

    console.log(`✅ Generated script with ${script.scenes.length} scenes`);
    console.log(`🎯 Viral techniques detected: ${script.metadata.viralTechniques.join(', ')}`);

    // Plan scenes with detailed timing and production notes
    console.log('🎬 Planning scene production...');
    const plan = await planner.planScenes(script.scenes, {
      totalDuration: duration,
      emotionalArc: 'crescendo',
      pacingStyle: 'tiktok-native',
      transitionStyle: 'viral'
    });

    console.log(`✅ Scene plan complete with ${plan.scenes.length} planned scenes`);
    console.log(`⚡ Viral moments at scenes: ${plan.metadata.viralMoments.join(', ')}`);

    return { script, plan };

  } catch (error) {
    console.error('❌ Viral TikTok Pipeline failed:', error);
    throw new Error(`Pipeline failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
