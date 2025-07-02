/**
 * AEON ScenePlannerAgent - Breaks scripts into visual scenes for video generation
 * Optimizes scene planning for AI video generation models
 */

import { openai } from '@/lib/ai-services';
import type { VideoScript, ScriptSection } from './ScriptWriterAgent';

export interface Scene {
  id: number;
  narration: string;
  visual_prompt: string;
  duration: number;
  transition: string;
  mood: string;
  camera_angle: string;
  lighting: string;
  style: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ScenePlan {
  total_scenes: number;
  total_duration: number;
  scenes: Scene[];
  visual_style: string;
  consistency_notes: string[];
  generation_settings: {
    aspect_ratio: string;
    fps: number;
    quality: string;
  };
}

export interface PlanningOptions {
  max_scenes?: number;
  scene_duration?: number;
  visual_style?: 'realistic' | 'animated' | 'cinematic' | 'documentary' | 'artistic';
  consistency_level?: 'high' | 'medium' | 'low';
  transition_style?: 'smooth' | 'dynamic' | 'minimal';
}

export class ScenePlannerAgent {
  private readonly defaultOptions: PlanningOptions = {
    max_scenes: 16,
    scene_duration: 4,
    visual_style: 'cinematic',
    consistency_level: 'high',
    transition_style: 'smooth'
  };

  /**
   * Plan scenes from a video script
   */
  async planScenes(script: VideoScript | string, options: PlanningOptions = {}): Promise<ScenePlan> {
    console.log("🎬 ScenePlannerAgent: Breaking script into scenes...");
    
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      let scriptContent: string;
      let totalDuration: number;
      
      if (typeof script === 'string') {
        scriptContent = script;
        totalDuration = opts.scene_duration! * opts.max_scenes!;
      } else {
        scriptContent = script.sections.map(s => s.content).join(' ');
        totalDuration = script.total_duration;
      }
      
      const scenePlan = await this.generateScenePlan(scriptContent, totalDuration, opts);
      
      console.log(`✅ ScenePlannerAgent: Created ${scenePlan.scenes.length} scenes`);
      return scenePlan;
      
    } catch (error) {
      console.error('❌ ScenePlannerAgent error:', error);
      return this.generateFallbackPlan(script, opts);
    }
  }

  /**
   * Optimize scenes for specific AI video models
   */
  async optimizeForModel(scenePlan: ScenePlan, model: 'runway' | 'pika' | 'stable' | 'luma' | 'minimax' | 'kling'): Promise<ScenePlan> {
    console.log(`🎯 ScenePlannerAgent: Optimizing scenes for ${model}`);
    
    const modelOptimizations = {
      runway: {
        maxDuration: 4,
        preferredStyle: 'cinematic',
        promptStyle: 'detailed and specific',
        specialFeatures: ['camera movements', 'realistic lighting']
      },
      pika: {
        maxDuration: 3,
        preferredStyle: 'dynamic',
        promptStyle: 'action-focused',
        specialFeatures: ['motion effects', 'transformations']
      },
      stable: {
        maxDuration: 4,
        preferredStyle: 'artistic',
        promptStyle: 'style-heavy',
        specialFeatures: ['artistic styles', 'consistent characters']
      },
      luma: {
        maxDuration: 5,
        preferredStyle: 'realistic',
        promptStyle: 'natural descriptions',
        specialFeatures: ['natural motion', 'realistic physics']
      },
      minimax: {
        maxDuration: 6,
        preferredStyle: 'versatile',
        promptStyle: 'balanced',
        specialFeatures: ['long sequences', 'complex scenes']
      },
      kling: {
        maxDuration: 5,
        preferredStyle: 'high-quality',
        promptStyle: 'detailed',
        specialFeatures: ['high resolution', 'smooth motion']
      }
    };
    
    const optimization = modelOptimizations[model];
    
    const optimizedScenes = scenePlan.scenes.map(scene => ({
      ...scene,
      duration: Math.min(scene.duration, optimization.maxDuration),
      visual_prompt: this.optimizePromptForModel(scene.visual_prompt, optimization),
      style: optimization.preferredStyle
    }));
    
    return {
      ...scenePlan,
      scenes: optimizedScenes,
      generation_settings: {
        ...scenePlan.generation_settings,
        quality: model === 'kling' ? 'ultra' : 'high'
      }
    };
  }

  /**
   * Generate scene transitions and continuity
   */
  async planTransitions(scenePlan: ScenePlan): Promise<ScenePlan> {
    console.log("🔄 ScenePlannerAgent: Planning scene transitions...");
    
    const scenesWithTransitions = scenePlan.scenes.map((scene, index) => {
      const nextScene = scenePlan.scenes[index + 1];
      
      if (!nextScene) {
        return { ...scene, transition: 'fade_out' };
      }
      
      // Determine transition based on mood and content change
      const transition = this.determineTransition(scene, nextScene);
      
      return { ...scene, transition };
    });
    
    return {
      ...scenePlan,
      scenes: scenesWithTransitions
    };
  }

  /**
   * Generate comprehensive scene plan using AI
   */
  private async generateScenePlan(scriptContent: string, totalDuration: number, options: PlanningOptions): Promise<ScenePlan> {
    const prompt = `
      Create a detailed scene plan for this video script:
      
      Script: "${scriptContent}"
      Total Duration: ${totalDuration} seconds
      Max Scenes: ${options.max_scenes}
      Visual Style: ${options.visual_style}
      
      Break the script into ${options.max_scenes} or fewer scenes. For each scene provide:
      1. Narration (what's being said)
      2. Visual prompt (detailed description for AI video generation)
      3. Duration (seconds)
      4. Mood/emotion
      5. Camera angle
      6. Lighting description
      7. Priority (high/medium/low)
      
      Make visual prompts specific and detailed for AI video generation.
      Ensure visual consistency across scenes.
      
      Return as JSON:
      {
        "total_scenes": number,
        "total_duration": number,
        "visual_style": "${options.visual_style}",
        "consistency_notes": ["note1", "note2"],
        "scenes": [
          {
            "id": number,
            "narration": "string",
            "visual_prompt": "detailed visual description",
            "duration": number,
            "transition": "string",
            "mood": "string",
            "camera_angle": "string",
            "lighting": "string",
            "style": "string",
            "priority": "high|medium|low"
          }
        ],
        "generation_settings": {
          "aspect_ratio": "16:9",
          "fps": 30,
          "quality": "high"
        }
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional video director and scene planner. Create detailed, AI-generation-ready scene descriptions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const planData = JSON.parse(response.choices[0].message.content || '{}');
    return this.validateScenePlan(planData, options);
  }

  /**
   * Optimize visual prompt for specific AI model
   */
  private optimizePromptForModel(prompt: string, optimization: any): string {
    const { promptStyle, specialFeatures } = optimization;
    
    let optimizedPrompt = prompt;
    
    switch (promptStyle) {
      case 'detailed and specific':
        optimizedPrompt = `${prompt}, professional cinematography, detailed lighting, high quality`;
        break;
      case 'action-focused':
        optimizedPrompt = `${prompt}, dynamic movement, energetic, fast-paced action`;
        break;
      case 'style-heavy':
        optimizedPrompt = `${prompt}, artistic style, creative composition, stylized`;
        break;
      case 'natural descriptions':
        optimizedPrompt = `${prompt}, natural lighting, realistic motion, organic feel`;
        break;
      case 'balanced':
        optimizedPrompt = `${prompt}, balanced composition, smooth motion`;
        break;
      case 'detailed':
        optimizedPrompt = `${prompt}, ultra detailed, high resolution, crisp quality`;
        break;
    }
    
    // Add special features
    if (specialFeatures.includes('camera movements')) {
      optimizedPrompt += ', smooth camera movement';
    }
    if (specialFeatures.includes('realistic lighting')) {
      optimizedPrompt += ', cinematic lighting';
    }
    
    return optimizedPrompt;
  }

  /**
   * Determine appropriate transition between scenes
   */
  private determineTransition(currentScene: Scene, nextScene: Scene): string {
    // Analyze mood and content change
    const moodChange = currentScene.mood !== nextScene.mood;
    const styleChange = currentScene.style !== nextScene.style;
    
    if (moodChange && styleChange) {
      return 'cross_fade';
    } else if (moodChange) {
      return 'fade_through_black';
    } else if (styleChange) {
      return 'wipe';
    } else {
      return 'cut';
    }
  }

  /**
   * Validate and format scene plan
   */
  private validateScenePlan(planData: any, options: PlanningOptions): ScenePlan {
    const scenes = (planData.scenes || []).map((scene: any, index: number) => ({
      id: scene.id || index + 1,
      narration: scene.narration || `Scene ${index + 1}`,
      visual_prompt: scene.visual_prompt || 'Generic scene description',
      duration: Math.min(scene.duration || options.scene_duration || 4, 10),
      transition: scene.transition || 'cut',
      mood: scene.mood || 'neutral',
      camera_angle: scene.camera_angle || 'medium shot',
      lighting: scene.lighting || 'natural',
      style: scene.style || options.visual_style || 'cinematic',
      priority: scene.priority || 'medium'
    }));

    return {
      total_scenes: scenes.length,
      total_duration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
      scenes,
      visual_style: planData.visual_style || options.visual_style || 'cinematic',
      consistency_notes: planData.consistency_notes || ['Maintain consistent lighting', 'Keep similar color palette'],
      generation_settings: planData.generation_settings || {
        aspect_ratio: '16:9',
        fps: 30,
        quality: 'high'
      }
    };
  }

  /**
   * Generate fallback scene plan
   */
  private generateFallbackPlan(script: VideoScript | string, options: PlanningOptions): ScenePlan {
    console.log("⚠️ ScenePlannerAgent: Using fallback scene planning");
    
    let scriptContent: string;
    if (typeof script === 'string') {
      scriptContent = script;
    } else {
      scriptContent = script.sections.map(s => s.content).join(' ');
    }
    
    // Split by sentences or periods
    const parts = scriptContent.split(/[.!?]+/).filter(Boolean);
    const maxScenes = Math.min(parts.length, options.max_scenes || 16);
    
    const scenes: Scene[] = parts.slice(0, maxScenes).map((part, index) => ({
      id: index + 1,
      narration: part.trim(),
      visual_prompt: `Scene showing: ${part.trim().substring(0, 100)}`,
      duration: options.scene_duration || 4,
      transition: 'cut',
      mood: 'neutral',
      camera_angle: 'medium shot',
      lighting: 'natural',
      style: options.visual_style || 'cinematic',
      priority: 'medium'
    }));

    return {
      total_scenes: scenes.length,
      total_duration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
      scenes,
      visual_style: options.visual_style || 'cinematic',
      consistency_notes: ['Basic scene consistency'],
      generation_settings: {
        aspect_ratio: '16:9',
        fps: 30,
        quality: 'high'
      }
    };
  }
}
