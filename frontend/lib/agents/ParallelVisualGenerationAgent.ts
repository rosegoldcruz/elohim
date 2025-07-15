/**
 * AEON Parallel Visual Generation Agent
 * Orchestrates 5 video generation agents running 10 scenes in parallel (2 scenes per agent)
 * Real Replicate API integration with proper error handling and progress tracking
 */

import Replicate from "replicate";
import { videoModels, getModelByName, validateModelConfig, type VideoModel } from "@/config/videoModels";
import { env } from "@/env.mjs";

// Initialize Replicate client
const replicate = new Replicate({
  auth: env.REPLICATE_API_TOKEN,
});

export interface SceneInput {
  prompt: string;
  sceneIndex: number;
  customInputs?: Record<string, any>;
}

export interface ParallelGenerationOptions {
  agentCount?: number;
  scenesPerAgent?: number;
  modelNames?: string[];
  customSceneInputs?: Record<number, any>[];
  progressCallback?: (progress: ParallelGenerationProgress) => void;
}

export interface ParallelGenerationProgress {
  stage: 'initializing' | 'generating' | 'completed' | 'failed';
  totalScenes: number;
  completedScenes: number;
  failedScenes: number;
  currentAgent: number;
  agentProgress: AgentProgress[];
  estimatedTimeRemaining?: number;
}

export interface AgentProgress {
  agentId: number;
  modelName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scenesAssigned: number;
  scenesCompleted: number;
  scenesFailed: number;
  currentScene?: number;
  error?: string;
}

export interface GenerationResult {
  success: boolean;
  sceneResults: SceneResult[];
  totalProcessingTime: number;
  totalCost: number;
  agentResults: AgentResult[];
  error?: string;
}

export interface SceneResult {
  sceneIndex: number;
  prompt: string;
  videoUrl: string;
  success: boolean;
  agentId: number;
  modelUsed: string;
  processingTime: number;
  error?: string;
}

export interface AgentResult {
  agentId: number;
  modelName: string;
  success: boolean;
  scenesProcessed: number;
  totalProcessingTime: number;
  cost: number;
  error?: string;
}

export class ParallelVisualGenerationAgent {
  private progressCallback?: (progress: ParallelGenerationProgress) => void;

  /**
   * Generate videos for 10 scenes using 5 parallel agents (2 scenes per agent)
   */
  async generateVideoParallel(
    scenePrompts: string[],
    options: ParallelGenerationOptions = {}
  ): Promise<GenerationResult> {
    const {
      agentCount = 5,
      scenesPerAgent = 2,
      modelNames = videoModels.map(m => m.name),
      customSceneInputs = [],
      progressCallback
    } = options;

    this.progressCallback = progressCallback;

    console.log(`🎬 ParallelVisualGenerationAgent: Starting parallel generation`);
    console.log(`📊 Configuration: ${agentCount} agents, ${scenesPerAgent} scenes per agent`);
    console.log(`🎯 Total scenes: ${scenePrompts.length}, Expected: ${agentCount * scenesPerAgent}`);

    const startTime = Date.now();

    try {
      // Validate inputs
      this.validateInputs(scenePrompts, agentCount, scenesPerAgent, modelNames);

      // Initialize progress tracking
      const agentProgress: AgentProgress[] = this.initializeAgentProgress(agentCount, modelNames, scenesPerAgent);
      
      this.updateProgress({
        stage: 'initializing',
        totalScenes: scenePrompts.length,
        completedScenes: 0,
        failedScenes: 0,
        currentAgent: 0,
        agentProgress
      });

      // Divide scenes across agents
      const agentJobs = this.createAgentJobs(scenePrompts, agentCount, scenesPerAgent, modelNames, customSceneInputs);

      // Execute all agents in parallel
      this.updateProgress({
        stage: 'generating',
        totalScenes: scenePrompts.length,
        completedScenes: 0,
        failedScenes: 0,
        currentAgent: 0,
        agentProgress: agentProgress.map(ap => ({ ...ap, status: 'running' }))
      });

      const agentResults = await Promise.all(
        agentJobs.map((job, index) => 
          this.runAgentForScenes(job, index, agentProgress)
        )
      );

      // Flatten and sort results by scene index
      const allSceneResults = agentResults
        .flat()
        .sort((a, b) => a.sceneIndex - b.sceneIndex);

      const totalProcessingTime = Date.now() - startTime;
      const successfulScenes = allSceneResults.filter(r => r.success);
      const failedScenes = allSceneResults.filter(r => !r.success);

      // Calculate total cost
      const totalCost = agentResults.reduce((sum, agent) => sum + agent.cost, 0);

      console.log(`✅ Parallel generation completed in ${totalProcessingTime}ms`);
      console.log(`📊 Results: ${successfulScenes.length}/${allSceneResults.length} scenes successful`);
      console.log(`💰 Total cost: $${totalCost.toFixed(2)}`);

      this.updateProgress({
        stage: 'completed',
        totalScenes: scenePrompts.length,
        completedScenes: successfulScenes.length,
        failedScenes: failedScenes.length,
        currentAgent: agentCount,
        agentProgress: agentProgress.map(ap => ({ ...ap, status: 'completed' }))
      });

      return {
        success: successfulScenes.length > 0,
        sceneResults: allSceneResults,
        totalProcessingTime,
        totalCost,
        agentResults,
        error: failedScenes.length > 0 ? `${failedScenes.length} scenes failed to generate` : undefined
      };

    } catch (error) {
      console.error('❌ Parallel generation failed:', error);
      
      this.updateProgress({
        stage: 'failed',
        totalScenes: scenePrompts.length,
        completedScenes: 0,
        failedScenes: scenePrompts.length,
        currentAgent: 0,
        agentProgress: []
      });

      return {
        success: false,
        sceneResults: [],
        totalProcessingTime: Date.now() - startTime,
        totalCost: 0,
        agentResults: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Validate input parameters
   */
  private validateInputs(
    scenePrompts: string[],
    agentCount: number,
    scenesPerAgent: number,
    modelNames: string[]
  ): void {
    const expectedScenes = agentCount * scenesPerAgent;
    
    if (scenePrompts.length !== expectedScenes) {
      throw new Error(
        `Scene count mismatch: Expected ${expectedScenes} scenes (${agentCount} agents × ${scenesPerAgent} scenes), got ${scenePrompts.length}`
      );
    }

    if (modelNames.length !== agentCount) {
      throw new Error(
        `Model count mismatch: Expected ${agentCount} models for ${agentCount} agents, got ${modelNames.length}`
      );
    }

    // Validate each model configuration
    for (const modelName of modelNames) {
      if (!validateModelConfig(modelName)) {
        throw new Error(`Invalid model configuration: ${modelName}`);
      }
    }

    // Validate API token
    if (!env.REPLICATE_API_TOKEN) {
      throw new Error('REPLICATE_API_TOKEN is required for video generation');
    }

    console.log('✅ Input validation passed');
  }

  /**
   * Initialize agent progress tracking
   */
  private initializeAgentProgress(agentCount: number, modelNames: string[], scenesPerAgent: number): AgentProgress[] {
    return Array.from({ length: agentCount }, (_, index) => ({
      agentId: index,
      modelName: modelNames[index],
      status: 'pending',
      scenesAssigned: scenesPerAgent,
      scenesCompleted: 0,
      scenesFailed: 0
    }));
  }

  /**
   * Create agent job configurations
   */
  private createAgentJobs(
    scenePrompts: string[],
    agentCount: number,
    scenesPerAgent: number,
    modelNames: string[],
    customSceneInputs: Record<number, any>[]
  ) {
    const jobs = [];
    let sceneIndex = 0;

    for (let agentId = 0; agentId < agentCount; agentId++) {
      const agentScenes = scenePrompts.slice(sceneIndex, sceneIndex + scenesPerAgent);
      const model = getModelByName(modelNames[agentId]);
      
      if (!model) {
        throw new Error(`Model not found: ${modelNames[agentId]}`);
      }

      const agentCustomInputs = customSceneInputs.slice(sceneIndex, sceneIndex + scenesPerAgent);

      jobs.push({
        agentId,
        model,
        scenes: agentScenes.map((prompt, idx) => ({
          prompt,
          sceneIndex: sceneIndex + idx,
          customInputs: agentCustomInputs[idx] || {}
        }))
      });

      sceneIndex += scenesPerAgent;
    }

    return jobs;
  }

  /**
   * Run a single agent for its assigned scenes
   */
  private async runAgentForScenes(
    job: any,
    agentIndex: number,
    agentProgress: AgentProgress[]
  ): Promise<AgentResult> {
    const { agentId, model, scenes } = job;
    const startTime = Date.now();

    console.log(`🤖 Agent ${agentId}: Starting generation with ${model.name} for ${scenes.length} scenes`);

    try {
      const sceneResults: SceneResult[] = [];

      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        
        // Update progress
        agentProgress[agentIndex].currentScene = scene.sceneIndex;
        this.updateProgress({
          stage: 'generating',
          totalScenes: agentProgress.reduce((sum, ap) => sum + ap.scenesAssigned, 0),
          completedScenes: agentProgress.reduce((sum, ap) => sum + ap.scenesCompleted, 0),
          failedScenes: agentProgress.reduce((sum, ap) => sum + ap.scenesFailed, 0),
          currentAgent: agentId,
          agentProgress: [...agentProgress]
        });

        try {
          const sceneResult = await this.generateSingleScene(scene, model, agentId);
          sceneResults.push(sceneResult);
          
          if (sceneResult.success) {
            agentProgress[agentIndex].scenesCompleted++;
            console.log(`✅ Agent ${agentId}: Scene ${scene.sceneIndex} completed`);
          } else {
            agentProgress[agentIndex].scenesFailed++;
            console.error(`❌ Agent ${agentId}: Scene ${scene.sceneIndex} failed: ${sceneResult.error}`);
          }
        } catch (error) {
          agentProgress[agentIndex].scenesFailed++;
          console.error(`❌ Agent ${agentId}: Scene ${scene.sceneIndex} error:`, error);
          
          sceneResults.push({
            sceneIndex: scene.sceneIndex,
            prompt: scene.prompt,
            videoUrl: '',
            success: false,
            agentId,
            modelUsed: model.name,
            processingTime: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      const processingTime = Date.now() - startTime;
      const successfulScenes = sceneResults.filter(r => r.success).length;

      agentProgress[agentIndex].status = 'completed';

      console.log(`✅ Agent ${agentId}: Completed ${successfulScenes}/${scenes.length} scenes in ${processingTime}ms`);

      return {
        agentId,
        modelName: model.name,
        success: successfulScenes > 0,
        scenesProcessed: scenes.length,
        totalProcessingTime: processingTime,
        cost: model.price * scenes.length,
        sceneResults
      } as AgentResult & { sceneResults: SceneResult[] };

    } catch (error) {
      console.error(`❌ Agent ${agentId}: Critical error:`, error);
      
      agentProgress[agentIndex].status = 'failed';
      agentProgress[agentIndex].error = error instanceof Error ? error.message : 'Unknown error';

      return {
        agentId,
        modelName: model.name,
        success: false,
        scenesProcessed: 0,
        totalProcessingTime: Date.now() - startTime,
        cost: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate a single scene using Replicate API
   */
  private async generateSingleScene(
    scene: SceneInput,
    model: VideoModel,
    agentId: number
  ): Promise<SceneResult> {
    const startTime = Date.now();

    console.log(`🎬 Agent ${agentId}: Generating scene ${scene.sceneIndex} with ${model.name}`);
    console.log(`📝 Prompt: "${scene.prompt.substring(0, 100)}..."`);

    try {
      // Build input object based on model fields
      const input = this.buildModelInput(scene, model);

      console.log(`🔧 Agent ${agentId}: Input fields:`, Object.keys(input));

      // Call Replicate API
      const output = await replicate.run(model.name as any, { input });

      // Handle different output formats
      const videoUrl = this.extractVideoUrl(output);

      if (!videoUrl) {
        throw new Error('No video URL returned from Replicate API');
      }

      const processingTime = Date.now() - startTime;

      console.log(`✅ Agent ${agentId}: Scene ${scene.sceneIndex} generated in ${processingTime}ms`);
      console.log(`🎥 Video URL: ${videoUrl}`);

      return {
        sceneIndex: scene.sceneIndex,
        prompt: scene.prompt,
        videoUrl,
        success: true,
        agentId,
        modelUsed: model.name,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`❌ Agent ${agentId}: Scene ${scene.sceneIndex} failed:`, error);

      return {
        sceneIndex: scene.sceneIndex,
        prompt: scene.prompt,
        videoUrl: '',
        success: false,
        agentId,
        modelUsed: model.name,
        processingTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Build model input based on model fields and scene data
   */
  private buildModelInput(scene: SceneInput, model: VideoModel): Record<string, any> {
    const input: Record<string, any> = {
      prompt: scene.prompt
    };

    // Add default parameters from model configuration
    if (model.defaultParams) {
      Object.assign(input, model.defaultParams);
    }

    // Add custom inputs for this scene
    if (scene.customInputs) {
      for (const field of model.fields) {
        if (field === 'prompt') continue; // Already set

        if (scene.customInputs[field] !== undefined) {
          input[field] = scene.customInputs[field];
        }
      }
    }

    // Apply model-specific defaults
    this.applyModelSpecificDefaults(input, model);

    return input;
  }

  /**
   * Apply model-specific default values
   */
  private applyModelSpecificDefaults(input: Record<string, any>, model: VideoModel): void {
    // MiniMax models
    if (model.name.includes('minimax')) {
      if (model.fields.includes('prompt_optimizer') && input.prompt_optimizer === undefined) {
        input.prompt_optimizer = true;
      }
    }

    // Kling models
    if (model.name.includes('kling')) {
      if (input.aspect_ratio === undefined) {
        input.aspect_ratio = '16:9';
      }
      if (input.cfg_scale === undefined) {
        input.cfg_scale = 7.5;
      }
      if (input.duration === undefined) {
        input.duration = model.duration;
      }
    }

    // Wan Video models
    if (model.name.includes('wan-video')) {
      if (input.frame_num === undefined) {
        input.frame_num = 120;
      }
      if (input.sample_steps === undefined) {
        input.sample_steps = 20;
      }
      if (input.sample_guide_scale === undefined) {
        input.sample_guide_scale = 7.5;
      }
    }
  }

  /**
   * Extract video URL from Replicate output
   */
  private extractVideoUrl(output: any): string {
    // Handle different output formats from different models
    if (typeof output === 'string') {
      return output;
    }

    if (Array.isArray(output) && output.length > 0) {
      return output[0];
    }

    if (output && typeof output === 'object') {
      // Check common field names
      if (output.video_url) return output.video_url;
      if (output.url) return output.url;
      if (output.output) return output.output;
      if (output.result) return output.result;
    }

    throw new Error(`Unexpected output format: ${JSON.stringify(output)}`);
  }

  /**
   * Update progress and call callback if provided
   */
  private updateProgress(progress: ParallelGenerationProgress): void {
    if (this.progressCallback) {
      this.progressCallback(progress);
    }
  }
}

/**
 * Convenience function for parallel video generation
 */
export async function generateVideoParallel(
  scenePrompts: string[],
  agentCount: number = 5,
  scenesPerAgent: number = 2,
  modelNames: string[] = videoModels.map(m => m.name),
  customSceneInputs?: Record<number, any>[],
  progressCallback?: (progress: ParallelGenerationProgress) => void
): Promise<GenerationResult> {
  const agent = new ParallelVisualGenerationAgent();

  return agent.generateVideoParallel(scenePrompts, {
    agentCount,
    scenesPerAgent,
    modelNames,
    customSceneInputs,
    progressCallback
  });
}

// Usage Example:
// const scenePrompts = [
//   "A cinematic shot of a lone astronaut on Mars",
//   "Close-up of alien technology glowing in the dark",
//   // ... 8 more prompts for total of 10
// ];
//
// const modelNames = [
//   "minimax/video-01",
//   "minimax/video-01-director",
//   "minimax/video-01-live",
//   "kwaivgi/kling-v1.6-standard",
//   "wan-video/wan-2.1-1.3b"
// ];
//
// const customInputs = [
//   { first_frame_image: "https://example.com/frame1.jpg" }, // Scene 0
//   { first_frame_image: "https://example.com/frame2.jpg" }, // Scene 1
//   // ... more custom inputs
// ];
//
// const result = await generateVideoParallel(
//   scenePrompts,
//   5,
//   2,
//   modelNames,
//   customInputs,
//   (progress) => console.log('Progress:', progress)
// );
//
// // Pass result.sceneResults to StitcherAgent
// const videoUrls = result.sceneResults
//   .filter(scene => scene.success)
//   .map(scene => scene.videoUrl);
