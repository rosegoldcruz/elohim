/**
 * AEON DeepSeek + SceneWriter Unified Pipeline
 * Complete pipeline for TikTok script generation and scene planning
 * Uses DeepSeek for creative scripting and OpenAI GPT-4o for scene planning
 */

import { OpenAI } from "openai";
import { z } from "zod";
import { env } from "@/env";
import { StorageManager } from "@/lib/storage-manager";

// Enhanced script schema for TikTok viral content
const ScriptSchema = z.object({
  script_id: z.string(),
  hook: z.object({
    text: z.string(),
    duration_seconds: z.number(),
    emotion_tags: z.array(z.string()),
    friction_level: z.number().min(1).max(10),
  }),
  body: z.object({
    text: z.string(),
    duration_seconds: z.number(),
    narrative_beats: z.array(z.string()),
    complexity: z.string(),
  }),
  cta: z.object({
    text: z.string(),
    duration_seconds: z.number(),
    cta_type: z.string(),
    engagement_target: z.string(),
  }),
  metadata: z.object({
    pacing: z.string(),
    tone: z.string(),
    total_duration: z.number(),
    retention_optimization: z.array(z.string()),
  }),
});

export interface TrendPackage {
  topic: string;
  hashtags: string[];
  viral_elements: string[];
  target_audience: string;
  platform_specific_tips: string[];
}

export interface ScriptAndScenePlan {
  script: string;
  scenePlan: string;
  metadata: {
    generatedAt: string;
    scriptModel: string;
    sceneModel: string;
    totalDuration: number;
    viralTechniques: string[];
  };
}

export class DeepSeekScriptScenePipeline {
  private deepseek: OpenAI;
  private openai: OpenAI;
  private storage: StorageManager;

  constructor() {
    // DeepSeek for creative script generation
    this.deepseek = new OpenAI({
      apiKey: env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com/v1",
    });

    // OpenAI GPT-4o for scene planning
    this.openai = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });

    this.storage = new StorageManager("2_script-writer");
  }

  /**
   * Create complete TikTok script and scene plan
   */
  async createTikTokScriptAndScene(
    trendPackage: TrendPackage, 
    tone: string = "engaging",
    onScriptChunk?: (chunk: string) => void,
    onSceneChunk?: (chunk: string) => void
  ): Promise<ScriptAndScenePlan> {
    console.log('🚀 Starting DeepSeek + OpenAI unified pipeline...');
    
    // ✅ Generate script with DeepSeek
    console.log('📝 Generating viral TikTok script with DeepSeek...');
    const scriptResponse = await this.deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are the SCRIPT WRITER AGENT. Create a viral 3-act TikTok script with:
          
          ACT 1 - HOOK (0-3s): Powerful attention-grabbing opener that stops scrolling
          ACT 2 - BODY (3-45s): Engaging content with narrative escalation and viral techniques
          ACT 3 - CTA (45-60s): Clear call-to-action that drives engagement
          
          VIRAL TECHNIQUES TO INCLUDE:
          - First-frame hook with pattern interrupt
          - Meme references and trending audio cues
          - ASMR elements or satisfying visuals
          - Rapid cuts and dynamic pacing
          - On-screen text overlays with emojis
          - Punch-in effects and close-ups
          - Irony, surprise, or plot twists
          
          OUTPUT FORMAT:
          Hook: [Powerful 3-second opener]
          Body: [Main content with viral elements]
          CTA: [Clear engagement call-to-action]
          
          Viral Techniques Used: [List techniques]
          Target Retention: [Specific retention strategies]`,
        },
        {
          role: "user",
          content: `TREND PACKAGE: ${JSON.stringify(trendPackage)}
          TONE: ${tone}
          
          Create a script that leverages these trending elements while maintaining authentic storytelling.`,
        },
      ],
      temperature: 1.2,
      max_tokens: 1500,
      stream: !!onScriptChunk,
    });

    let scriptContent = '';
    if (onScriptChunk && 'choices' in scriptResponse) {
      // Non-streaming response
      scriptContent = scriptResponse.choices[0].message.content || '';
    } else {
      // Streaming response
      for await (const chunk of scriptResponse as any) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          scriptContent += delta;
          onScriptChunk?.(delta);
        }
      }
    }

    if (!scriptContent) {
      throw new Error('No script content generated from DeepSeek');
    }

    // Save script to storage
    const scriptId = `script_${Date.now()}`;
    await this.storage.save(scriptId, scriptContent);
    console.log('✅ Script generated and saved');

    // ✅ Generate scene plan with OpenAI GPT-4o
    console.log('🎬 Generating cinematic scene plan with GPT-4o...');
    const sceneResponse = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are the SCENE WRITER AGENT. Convert the script into timestamped cinematic scene instructions.
          
          For each scene, provide:
          - Timestamp (e.g., 0:00-0:03)
          - Camera angle and movement
          - Visual elements and composition
          - Audio/SFX requirements
          - Text overlays and graphics
          - Transition effects
          - Production notes
          
          OUTPUT FORMAT:
          Scene 1 (0:00-0:03): [Hook Scene]
          Camera: [Specific camera direction]
          Visual: [Detailed visual description]
          Audio: [Sound design requirements]
          Text: [On-screen text/graphics]
          Transition: [How to transition to next scene]
          
          Continue for all scenes with precise timing.`,
        },
        {
          role: "user",
          content: `Convert this script into detailed scene instructions:
          
          ${scriptContent}
          
          Total duration: 60 seconds
          Platform: TikTok (vertical 9:16 format)
          Style: Viral, engaging, retention-optimized`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: !!onSceneChunk,
    });

    let scenePlan = '';
    if (onSceneChunk && 'choices' in sceneResponse) {
      // Non-streaming response
      scenePlan = sceneResponse.choices[0].message.content || '';
    } else {
      // Streaming response
      for await (const chunk of sceneResponse as any) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          scenePlan += delta;
          onSceneChunk?.(delta);
        }
      }
    }

    if (!scenePlan) {
      throw new Error('No scene plan generated from OpenAI');
    }

    // Save scene plan to storage
    const scenePlanId = `scene_plan_${Date.now()}`;
    await this.storage.save(scenePlanId, scenePlan);
    console.log('✅ Scene plan generated and saved');

    // Extract viral techniques from script
    const viralTechniques = this.extractViralTechniques(scriptContent);

    return {
      script: scriptContent,
      scenePlan,
      metadata: {
        generatedAt: new Date().toISOString(),
        scriptModel: "deepseek-chat",
        sceneModel: "gpt-4o",
        totalDuration: 60,
        viralTechniques,
      },
    };
  }

  /**
   * Generate script only with DeepSeek (for standalone use)
   */
  async generateScriptOnly(
    topic: string, 
    tone: string = "engaging",
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    console.log('📝 Generating script with DeepSeek...');
    
    const completion = await this.deepseek.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: "You are the SCRIPT WRITER AGENT. Create a 3-act viral TikTok script with hook, body, CTA.",
        },
        {
          role: "user",
          content: `Topic: ${topic} | Tone: ${tone}`,
        },
      ],
      temperature: 1.2,
      stream: !!onChunk,
    });

    if (onChunk) {
      let content = '';
      for await (const chunk of completion as any) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) {
          content += delta;
          onChunk(delta);
        }
      }
      return content;
    } else {
      return (completion as any).choices[0].message.content || '';
    }
  }

  /**
   * Extract viral techniques from script content
   */
  private extractViralTechniques(scriptContent: string): string[] {
    const techniques: string[] = [];
    const content = scriptContent.toLowerCase();
    
    const viralPatterns = [
      { pattern: /hook|attention|stop scrolling/i, technique: "First-frame hook" },
      { pattern: /meme|trending|viral/i, technique: "Meme integration" },
      { pattern: /asmr|satisfying|smooth/i, technique: "ASMR elements" },
      { pattern: /rapid|quick|fast/i, technique: "Rapid cuts" },
      { pattern: /text|overlay|caption/i, technique: "Text overlays" },
      { pattern: /punch|zoom|close-up/i, technique: "Punch-in effects" },
      { pattern: /irony|twist|surprise/i, technique: "Plot twist" },
      { pattern: /emoji|graphics/i, technique: "Visual graphics" },
    ];

    viralPatterns.forEach(({ pattern, technique }) => {
      if (pattern.test(content)) {
        techniques.push(technique);
      }
    });

    return techniques;
  }
}

// Export type for external use
export type { ScriptSchema };
