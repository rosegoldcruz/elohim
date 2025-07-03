/**
 * AEON ScenePlannerAgent - Advanced Scene Planning and Timing
 * Converts script scenes into detailed production plans with timing, emotions, and camera work
 */

import { ScriptScene } from './ScriptWriterAgent';

export interface PlannedScene extends ScriptScene {
  timestamp: number;
  duration: number;
  emotion: string;
  shotType: string;
  transition: string;
  visualElements: string[];
  audioElements: string[];
  pacing: 'slow' | 'medium' | 'fast' | 'rapid';
  energy: number; // 1-10 scale
}

export interface ScenePlan {
  scenes: PlannedScene[];
  metadata: {
    totalDuration: number;
    averageSceneDuration: number;
    emotionalArc: string[];
    pacingPattern: string[];
    viralMoments: number[];
    generatedAt: string;
  };
}

export interface PlanningOptions {
  totalDuration?: number;
  emotionalArc?: 'linear' | 'crescendo' | 'rollercoaster' | 'hook-heavy';
  pacingStyle?: 'consistent' | 'accelerating' | 'varied' | 'tiktok-native';
  transitionStyle?: 'smooth' | 'sharp' | 'viral' | 'cinematic';
}

export class ScenePlannerAgent {

  /**
   * Convert script scenes into detailed production plan
   */
  async planScenes(scriptScenes: ScriptScene[], options: PlanningOptions = {}): Promise<ScenePlan> {
    const {
      totalDuration = 60,
      emotionalArc = 'crescendo',
      pacingStyle = 'tiktok-native',
      transitionStyle = 'viral'
    } = options;

    console.log(`🎬 ScenePlannerAgent: Planning ${scriptScenes.length} scenes for ${totalDuration}s video`);

    try {
      // Calculate base timing
      const baseSceneDuration = Math.floor(totalDuration / scriptScenes.length);

      // Plan each scene with detailed timing and production notes
      const plannedScenes = scriptScenes.map((scene, index) =>
        this.planIndividualScene(scene, index, baseSceneDuration, totalDuration, emotionalArc, pacingStyle, transitionStyle)
      );

      // Adjust timing to fit exact duration
      this.adjustTiming(plannedScenes, totalDuration);

      // Generate metadata
      const metadata = this.generatePlanMetadata(plannedScenes, totalDuration);

      console.log(`✅ ScenePlannerAgent: Generated detailed plan with ${plannedScenes.length} scenes`);

      return {
        scenes: plannedScenes,
        metadata
      };

    } catch (error) {
      console.error('❌ ScenePlannerAgent error:', error);
      throw new Error(`Scene planning failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Plan individual scene with detailed production notes
   */
  private planIndividualScene(
    scene: ScriptScene,
    index: number,
    baseDuration: number,
    totalDuration: number,
    emotionalArc: string,
    pacingStyle: string,
    transitionStyle: string
  ): PlannedScene {

    const timestamp = index * baseDuration;
    const duration = this.calculateSceneDuration(scene, index, baseDuration, pacingStyle);
    const emotion = this.determineEmotion(scene, index, emotionalArc);
    const shotType = this.selectShotType(scene, index);
    const transition = this.selectTransition(scene, index, transitionStyle);
    const pacing = this.determinePacing(scene, index, pacingStyle);
    const energy = this.calculateEnergy(scene, index, emotionalArc);

    return {
      ...scene,
      timestamp,
      duration,
      emotion,
      shotType,
      transition,
      visualElements: this.extractVisualElements(scene),
      audioElements: this.extractAudioElements(scene),
      pacing,
      energy
    };
  }

  /**
   * Calculate optimal duration for each scene based on function and pacing
   */
  private calculateSceneDuration(scene: ScriptScene, index: number, baseDuration: number, pacingStyle: string): number {
    let multiplier = 1.0;

    // Adjust based on scene function
    switch (scene.function?.toLowerCase()) {
      case 'hook':
        multiplier = 0.6; // Hooks should be short and punchy
        break;
      case 'escalation':
      case 'reveal':
        multiplier = 1.2; // Give more time for key moments
        break;
      case 'cta':
        multiplier = 0.8; // CTAs should be concise
        break;
      default:
        multiplier = 1.0;
    }

    // Adjust based on pacing style
    switch (pacingStyle) {
      case 'tiktok-native':
        // First scene extra short, accelerate through middle, slow for CTA
        if (index === 0) multiplier *= 0.5;
        else if (index === 1) multiplier *= 0.7;
        else multiplier *= 1.1;
        break;
      case 'accelerating':
        multiplier *= (1.0 - (index * 0.1));
        break;
      case 'varied':
        multiplier *= (index % 2 === 0) ? 0.8 : 1.2;
        break;
    }

    return Math.max(3, Math.floor(baseDuration * multiplier));
  }

  /**
   * Determine emotional tone for scene based on arc
   */
  private determineEmotion(scene: ScriptScene, index: number, emotionalArc: string): string {
    const description = scene.description?.toLowerCase() || '';

    // First check for explicit emotional cues in the scene
    if (/shock|surprise|twist|reveal/i.test(description)) return "surprise";
    if (/fun|meme|joke|laugh/i.test(description)) return "humor";
    if (/intense|urgent|scandal|dramatic/i.test(description)) return "tension";
    if (/calm|peaceful|soothing/i.test(description)) return "calm";
    if (/exciting|energy|pump/i.test(description)) return "excitement";

    // Then apply emotional arc pattern
    switch (emotionalArc) {
      case 'crescendo':
        const emotions = ['curiosity', 'interest', 'engagement', 'excitement', 'climax'];
        return emotions[Math.min(index, emotions.length - 1)];

      case 'rollercoaster':
        return index % 2 === 0 ? 'tension' : 'relief';

      case 'hook-heavy':
        return index === 0 ? 'shock' : 'engagement';

      default:
        return 'neutral';
    }
  }

  /**
   * Select optimal shot type based on scene content and position
   */
  private selectShotType(scene: ScriptScene, index: number): string {
    const camera = scene.camera?.toLowerCase() || '';
    const description = scene.description?.toLowerCase() || '';

    // Use existing camera direction if specific
    if (camera.includes('close-up') || camera.includes('macro')) return 'extreme-close-up';
    if (camera.includes('wide') || camera.includes('establishing')) return 'wide-shot';
    if (camera.includes('medium')) return 'medium-shot';

    // Determine based on scene function and content
    if (scene.function?.toLowerCase() === 'hook') return 'punch-in-close-up';
    if (description.includes('reveal') || description.includes('show')) return 'reveal-shot';
    if (description.includes('action') || description.includes('movement')) return 'dynamic-tracking';

    // Default pattern to avoid monotony
    const shotTypes = [
      'macro-close-up', 'sudden-punch-in', 'whip-pan', 'static-wide',
      'split-screen', 'freeze-frame', 'dutch-angle', 'overhead'
    ];
    return shotTypes[index % shotTypes.length];
  }

  /**
   * Select transition style between scenes
   */
  private selectTransition(scene: ScriptScene, index: number, transitionStyle: string): string {
    if (index === 0) return 'none'; // First scene has no transition

    switch (transitionStyle) {
      case 'viral':
        const viralTransitions = ['quick-cut', 'glitch', 'zoom-blur', 'whip-pan', 'freeze-pop'];
        return viralTransitions[index % viralTransitions.length];

      case 'sharp':
        return index % 2 === 0 ? 'hard-cut' : 'snap-zoom';

      case 'cinematic':
        return index % 3 === 0 ? 'fade' : 'dissolve';

      default:
        return 'cut';
    }
  }

  /**
   * Determine pacing for scene
   */
  private determinePacing(scene: ScriptScene, index: number, pacingStyle: string): 'slow' | 'medium' | 'fast' | 'rapid' {
    const audio = scene.audio?.toLowerCase() || '';
    const description = scene.description?.toLowerCase() || '';

    // Check for explicit pacing cues
    if (audio.includes('rapid') || description.includes('fast')) return 'rapid';
    if (audio.includes('slow') || description.includes('calm')) return 'slow';

    // Apply pacing style
    switch (pacingStyle) {
      case 'tiktok-native':
        return index === 0 ? 'rapid' : (index < 3 ? 'fast' : 'medium');

      case 'accelerating':
        if (index < 2) return 'medium';
        if (index < 4) return 'fast';
        return 'rapid';

      case 'varied':
        return index % 2 === 0 ? 'fast' : 'medium';

      default:
        return 'medium';
    }
  }

  /**
   * Calculate energy level (1-10) for scene
   */
  private calculateEnergy(scene: ScriptScene, index: number, emotionalArc: string): number {
    let baseEnergy = 5;

    // Adjust based on scene function
    switch (scene.function?.toLowerCase()) {
      case 'hook':
        baseEnergy = 9;
        break;
      case 'escalation':
        baseEnergy = 7;
        break;
      case 'reveal':
        baseEnergy = 8;
        break;
      case 'cta':
        baseEnergy = 6;
        break;
    }

    // Apply emotional arc
    switch (emotionalArc) {
      case 'crescendo':
        baseEnergy += Math.floor(index * 1.5);
        break;
      case 'rollercoaster':
        baseEnergy += index % 2 === 0 ? 2 : -1;
        break;
    }

    return Math.max(1, Math.min(10, baseEnergy));
  }

  /**
   * Extract visual elements from scene description
   */
  private extractVisualElements(scene: ScriptScene): string[] {
    const elements: string[] = [];
    const text = `${scene.description} ${scene.overlay}`.toLowerCase();

    if (text.includes('text') || text.includes('overlay')) elements.push('text-overlay');
    if (text.includes('emoji')) elements.push('emoji-graphics');
    if (text.includes('split') || text.includes('comparison')) elements.push('split-screen');
    if (text.includes('zoom') || text.includes('punch')) elements.push('dynamic-zoom');
    if (text.includes('freeze') || text.includes('pause')) elements.push('freeze-frame');

    return elements.length > 0 ? elements : ['standard-visuals'];
  }

  /**
   * Extract audio elements from scene
   */
  private extractAudioElements(scene: ScriptScene): string[] {
    const elements: string[] = [];
    const audio = scene.audio?.toLowerCase() || '';

    if (audio.includes('music')) elements.push('background-music');
    if (audio.includes('sfx') || audio.includes('sound')) elements.push('sound-effects');
    if (audio.includes('asmr')) elements.push('asmr-audio');
    if (audio.includes('meme')) elements.push('meme-sound');
    if (audio.includes('voice')) elements.push('voiceover');

    return elements.length > 0 ? elements : ['standard-audio'];
  }

  /**
   * Adjust scene timing to fit exact total duration
   */
  private adjustTiming(scenes: PlannedScene[], targetDuration: number): void {
    const currentTotal = scenes.reduce((sum, scene) => sum + scene.duration, 0);
    const adjustment = targetDuration / currentTotal;

    let runningTime = 0;
    scenes.forEach(scene => {
      scene.timestamp = runningTime;
      scene.duration = Math.max(2, Math.floor(scene.duration * adjustment));
      runningTime += scene.duration;
    });

    // Final adjustment for any rounding errors
    const finalTotal = scenes.reduce((sum, scene) => sum + scene.duration, 0);
    if (finalTotal !== targetDuration) {
      const diff = targetDuration - finalTotal;
      scenes[scenes.length - 1].duration += diff;
    }
  }

  /**
   * Generate metadata for the scene plan
   */
  private generatePlanMetadata(scenes: PlannedScene[], totalDuration: number) {
    return {
      totalDuration,
      averageSceneDuration: Math.floor(totalDuration / scenes.length),
      emotionalArc: scenes.map(s => s.emotion),
      pacingPattern: scenes.map(s => s.pacing),
      viralMoments: scenes
        .map((scene, index) => scene.energy >= 8 ? index : -1)
        .filter(index => index >= 0),
      generatedAt: new Date().toISOString()
    };
  }
}
