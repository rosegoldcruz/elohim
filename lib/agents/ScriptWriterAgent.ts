/**
 * AEON ScriptWriterAgent - TikTok/Viral Video Script Generation
 * Generates viral-optimized video scripts with TikTok-native techniques
 */

import { OpenAI } from 'openai';
import { env } from '@/env.mjs';

const SYSTEM_PROMPT = `
You are a professional TikTok/Uber-viral video scriptwriter.
Break the following topic into exactly {sceneCount} scenes, each with:
- Unique narrative or cinematic function (no repetition)
- Narrative escalation or increasing curiosity
- 1 cold open/hook, 1 payoff, 1 CTA
- At least 2 TikTok-native viral techniques: first-frame hook, meme, irony, ASMR, rapid cut, on-screen text, punch-in, etc.
- Camera direction, audio, and overlay for each scene

OUTPUT FORMAT STRICTLY:
Scene {#}:
Function: [e.g. Hook, Escalation, Reveal, CTA, etc.]
Description: [Vivid visual action, not just facts]
Camera: [Angle, movement, or effect]
Audio/SFX: [Sound, meme, or ASMR]
Text/Overlay: [On-screen caption, emoji, meme text]
`;

export interface VideoScript {
  scenes: ScriptScene[];
  metadata: {
    topic: string;
    style: string;
    duration: number;
    sceneCount: number;
    viralTechniques: string[];
    generatedAt: string;
  };
}

export interface ScriptScene {
  scene: string;
  function: string;
  description: string;
  camera: string;
  audio: string;
  overlay: string;
  sceneNumber: number;
}

export interface ScriptOptions {
  duration?: number;
  tone?: 'conversational' | 'dramatic' | 'educational' | 'entertaining';
  platform?: 'tiktok' | 'instagram' | 'youtube' | 'general';
  sceneCount?: number;
  style?: string;
}

export class ScriptWriterAgent {
  private openai: OpenAI;

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || env.OPENAI_API_KEY
    });
  }

  /**
   * Generate viral video script with TikTok-optimized scenes
   */
  async generateScript(topic: string, options: ScriptOptions = {}): Promise<VideoScript> {
    const {
      duration = 60,
      style = "TikTok/Documentary",
      sceneCount = Math.max(4, Math.min(8, Math.floor(duration / 8)))
    } = options;

    console.log(`🎬 ScriptWriterAgent: Generating ${sceneCount} scenes for "${topic}"`);
    try {
      const scenes = await this.generateScenes(topic, style, duration, sceneCount);

      // Validate viral techniques
      if (!this.hasViralTechniques(scenes)) {
        console.warn('⚠️ Insufficient viral techniques detected, regenerating...');
        // Retry once with more explicit viral instruction
        const retryScenes = await this.generateScenes(
          topic,
          `${style} (MUST include viral hooks, memes, ASMR, rapid cuts)`,
          duration,
          sceneCount
        );

        if (!this.hasViralTechniques(retryScenes)) {
          console.warn('⚠️ Still insufficient viral techniques after retry');
        }

        return this.buildVideoScript(topic, style, duration, sceneCount, retryScenes);
      }

      return this.buildVideoScript(topic, style, duration, sceneCount, scenes);

    } catch (error) {
      console.error('❌ ScriptWriterAgent error:', error);
      throw new Error(`Script generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate scenes using OpenAI
   */
  async generateScenes(topic: string, style: string, duration: number, sceneCount: number): Promise<ScriptScene[]> {
    const userPrompt = `
Topic: ${topic}
Visual Style: ${style}
Duration: ${duration}s
Scene Count: ${sceneCount}

REQUIREMENTS:
- Each scene must be visually distinct and escalate narrative tension
- Include viral TikTok techniques: hooks, memes, ASMR, rapid cuts, overlays, punch-ins
- First scene MUST be a powerful hook that stops scrolling
- Final scene MUST include clear call-to-action
- Use vivid, action-oriented descriptions
`;

    const prompt = SYSTEM_PROMPT.replace('{sceneCount}', sceneCount.toString());

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.9,
      max_tokens: 1800,
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content generated from OpenAI');
    }

    let scenes = this.parseScenes(content);

    // Remove duplicate scenes by description similarity
    scenes = this.removeDuplicateScenes(scenes);

    // Ensure we have the right number of scenes
    if (scenes.length < sceneCount) {
      console.warn(`⚠️ Generated ${scenes.length} scenes, expected ${sceneCount}`);
    }

    return scenes;
  }

  /**
   * Parse OpenAI response into structured scenes
   */
  parseScenes(content: string): ScriptScene[] {
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    const scenes: ScriptScene[] = [];
    let current: Partial<ScriptScene> = {};
    let sceneNumber = 1;

    for (const line of lines) {
      if (/^Scene\s+\d+:/.test(line)) {
        // Save previous scene if it exists
        if (Object.keys(current).length > 0 && current.description) {
          scenes.push(current as ScriptScene);
        }

        // Start new scene
        current = {
          scene: line,
          sceneNumber: sceneNumber++
        };
      } else if (line.startsWith('Function:')) {
        current.function = line.replace('Function:', '').trim();
      } else if (line.startsWith('Description:')) {
        current.description = line.replace('Description:', '').trim();
      } else if (line.startsWith('Camera:')) {
        current.camera = line.replace('Camera:', '').trim();
      } else if (line.startsWith('Audio/SFX:')) {
        current.audio = line.replace('Audio/SFX:', '').trim();
      } else if (line.startsWith('Text/Overlay:')) {
        current.overlay = line.replace('Text/Overlay:', '').trim();
      }
    }

    // Don't forget the last scene
    if (Object.keys(current).length > 0 && current.description) {
      scenes.push(current as ScriptScene);
    }

    return scenes.filter(scene => scene.description && scene.description.length > 10);
  }

  /**
   * Remove scenes with highly similar descriptions
   */
  removeDuplicateScenes(scenes: ScriptScene[]): ScriptScene[] {
    const filtered: ScriptScene[] = [];

    for (const scene of scenes) {
      let isDuplicate = false;

      for (const existing of filtered) {
        const similarity = this.calculateSimilarity(
          scene.description || "",
          existing.description || ""
        );

        if (similarity > 0.75) {
          isDuplicate = true;
          break;
        }
      }

      if (!isDuplicate) {
        filtered.push(scene);
      }
    }

    return filtered;
  }
  /**
   * Simple string similarity calculation
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Check if scenes contain sufficient viral TikTok techniques
   */
  hasViralTechniques(scenes: ScriptScene[]): boolean {
    let viralCount = 0;
    const viralWords = [
      "hook", "punch", "asmr", "irony", "meme", "rapid cut", "overlay", "split screen",
      "glitch", "freeze-frame", "first-frame", "pattern interrupt", "zoom", "whip pan",
      "close-up", "macro", "text overlay", "emoji", "trending", "viral", "shocking"
    ];

    scenes.forEach(scene => {
      const text = `${scene.function} ${scene.camera} ${scene.audio} ${scene.overlay}`.toLowerCase();
      if (viralWords.some(word => text.includes(word))) {
        viralCount++;
      }
    });

    console.log(`🎯 Detected ${viralCount} viral techniques in ${scenes.length} scenes`);
    return viralCount >= 2;
  }

  /**
   * Build final video script object
   */
  private buildVideoScript(topic: string, style: string, duration: number, sceneCount: number, scenes: ScriptScene[]): VideoScript {
    const viralTechniques = this.extractViralTechniques(scenes);

    return {
      scenes,
      metadata: {
        topic,
        style,
        duration,
        sceneCount: scenes.length,
        viralTechniques,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Extract viral techniques used in the script
   */
  private extractViralTechniques(scenes: ScriptScene[]): string[] {
    const techniques = new Set<string>();
    const viralPatterns = {
      "hook": /hook|attention|stop scrolling/i,
      "meme": /meme|trending|viral/i,
      "asmr": /asmr|whisper|satisfying/i,
      "rapid_cut": /rapid|quick cut|fast/i,
      "overlay": /overlay|text|caption/i,
      "punch_in": /punch|zoom|close-up/i,
      "freeze_frame": /freeze|pause|stop/i,
      "split_screen": /split|dual|comparison/i
    };

    scenes.forEach(scene => {
      const text = `${scene.function} ${scene.camera} ${scene.audio} ${scene.overlay}`.toLowerCase();

      Object.entries(viralPatterns).forEach(([technique, pattern]) => {
        if (pattern.test(text)) {
          techniques.add(technique);
        }
      });
    });

    return Array.from(techniques);
  }
}
