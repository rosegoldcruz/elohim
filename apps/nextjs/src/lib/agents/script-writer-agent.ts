import { AeonAgent } from './base-agent';
import type { ScriptWriterInput, ScriptWriterOutput, ScriptScene } from './types';
import { runLocalLLM, type LocalLLMMessage } from '../integrations/local-llm';

export class ScriptWriterAgent extends AeonAgent {
  constructor(id: string = 'script-writer-001') {
    super(
      id,
      'ScriptWriter Agent',
      'ScriptWriterAgent',
      [
        'Script Generation',
        'Content Planning',
        'Narrative Structure',
        'Scene Breakdown',
        'Keyword Integration',
        'Tone Adaptation'
      ],
      {
        model: 'gpt-4',
        parameters: {
          temperature: 0.7,
          maxTokens: 2000,
          topP: 0.9
        }
      }
    );
  }

  async execute(input: ScriptWriterInput): Promise<ScriptWriterOutput> {
    await this.updateStatus('processing');

    try {
      if (!await this.validateInput(input)) {
        throw new Error('Invalid input for ScriptWriter Agent');
      }

      // Generate script content
      const script = await this.generateScript(input);
      
      // Break down into scenes
      const scenes = await this.generateScenes(script, input);
      
      // Create metadata
      const metadata = this.generateMetadata(script, scenes);

      const output: ScriptWriterOutput = {
        script,
        scenes,
        metadata
      };

      await this.updateStatus('completed');
      return output;

    } catch (error) {
      await this.handleError(error as Error);
      throw error;
    }
  }

  async validateInput(input: ScriptWriterInput): Promise<boolean> {
    return !!(
      input &&
      input.topic &&
      input.tone &&
      input.duration > 0 &&
      input.targetAudience
    );
  }

  private async generateScript(input: ScriptWriterInput): Promise<string> {
    // This would integrate with OpenAI API or similar
    const prompt = this.buildScriptPrompt(input);
    
    // Simulated API call - replace with actual implementation
    const script = await this.callLLMAPI(prompt);
    
    return script;
  }

  private buildScriptPrompt(input: ScriptWriterInput): string {
    const keywordText = input.keywords ? `Keywords to include: ${input.keywords.join(', ')}` : '';
    
    return `
Create a ${input.tone} video script about "${input.topic}" for ${input.targetAudience}.

Requirements:
- Duration: approximately ${input.duration} seconds
- Tone: ${input.tone}
- Target audience: ${input.targetAudience}
${keywordText}

The script should be engaging, well-structured, and suitable for video production.
Include clear visual cues and maintain viewer engagement throughout.

Format the output as a cohesive script with natural flow and compelling narrative.
    `.trim();
  }

  private async generateScenes(script: string, input: ScriptWriterInput): Promise<ScriptScene[]> {
    // Break script into logical scenes
    const sentences = script.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sceneDuration = input.duration / Math.max(sentences.length, 1);
    
    const scenes: ScriptScene[] = sentences.map((sentence, index) => ({
      id: `scene-${index + 1}`,
      text: sentence.trim(),
      duration: sceneDuration,
      visualCues: this.generateVisualCues(sentence.trim()),
      voiceoverNotes: this.generateVoiceoverNotes(sentence.trim(), input.tone)
    }));

    return scenes;
  }

  private generateVisualCues(text: string): string[] {
    // Simple keyword-based visual cue generation
    const cues: string[] = [];
    
    if (text.toLowerCase().includes('show') || text.toLowerCase().includes('display')) {
      cues.push('Close-up shot');
    }
    if (text.toLowerCase().includes('explain') || text.toLowerCase().includes('understand')) {
      cues.push('Diagram or illustration');
    }
    if (text.toLowerCase().includes('example') || text.toLowerCase().includes('instance')) {
      cues.push('Real-world example footage');
    }
    
    // Default visual cue
    if (cues.length === 0) {
      cues.push('Medium shot with engaging visuals');
    }
    
    return cues;
  }

  private generateVoiceoverNotes(text: string, tone: string): string {
    const toneInstructions = {
      professional: 'Clear, authoritative delivery with measured pace',
      casual: 'Conversational, friendly tone with natural inflection',
      educational: 'Clear enunciation, slightly slower pace for comprehension',
      entertaining: 'Dynamic delivery with varied intonation and energy'
    };

    return toneInstructions[tone as keyof typeof toneInstructions] || 'Natural, engaging delivery';
  }

  private generateMetadata(script: string, scenes: ScriptScene[]) {
    const words = script.split(/\s+/).filter(word => word.length > 0);
    const estimatedDuration = scenes.reduce((total, scene) => total + scene.duration, 0);
    
    // Extract key points (simplified)
    const keyPoints = scenes
      .map(scene => scene.text)
      .filter(text => text.length > 50)
      .slice(0, 5);

    return {
      wordCount: words.length,
      estimatedDuration,
      keyPoints
    };
  }

  private async callLLMAPI(prompt: string): Promise<string> {
    const llmMode = process.env.LLM_MODE || 'openai';

    try {
      switch (llmMode.toLowerCase()) {
        case 'local':
          return await this.callLocalLLM(prompt);
        case 'openai':
          return await this.callOpenAI(prompt);
        case 'claude':
          return await this.callClaude(prompt);
        case 'replicate':
          return await this.callReplicate(prompt);
        default:
          console.warn(`Unknown LLM_MODE: ${llmMode}, falling back to OpenAI`);
          return await this.callOpenAI(prompt);
      }
    } catch (error) {
      console.error(`Error with ${llmMode} LLM:`, error);

      // Fallback to simulated response if all else fails
      return this.getFallbackResponse(prompt);
    }
  }

  private async callLocalLLM(prompt: string): Promise<string> {
    const messages: LocalLLMMessage[] = [
      {
        role: 'system',
        content: 'You are a professional video script writer. Create engaging, well-structured scripts that are suitable for video production. Focus on clear narrative flow, compelling content, and viewer engagement.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    return await runLocalLLM(messages, {
      temperature: this.config.parameters.temperature,
      maxTokens: this.config.parameters.maxTokens,
      topP: this.config.parameters.topP
    });
  }

  private async callOpenAI(prompt: string): Promise<string> {
    // TODO: Implement OpenAI API integration
    // For now, return a placeholder that indicates OpenAI mode
    return `[OpenAI Mode] Welcome to our comprehensive guide on ${prompt.includes('topic') ? 'the topic' : 'this subject'}.

In this video, we'll explore the key concepts and provide you with actionable insights.

First, let's understand the fundamentals and why this matters to you.

Next, we'll dive into practical examples that you can apply immediately.

Finally, we'll wrap up with key takeaways and next steps for your journey.

Thank you for watching, and don't forget to subscribe for more valuable content!`;
  }

  private async callClaude(prompt: string): Promise<string> {
    // TODO: Implement Claude API integration
    // For now, return a placeholder that indicates Claude mode
    return `[Claude Mode] Welcome to our comprehensive guide on ${prompt.includes('topic') ? 'the topic' : 'this subject'}.

In this video, we'll explore the key concepts and provide you with actionable insights.

First, let's understand the fundamentals and why this matters to you.

Next, we'll dive into practical examples that you can apply immediately.

Finally, we'll wrap up with key takeaways and next steps for your journey.

Thank you for watching, and don't forget to subscribe for more valuable content!`;
  }

  private async callReplicate(prompt: string): Promise<string> {
    // TODO: Implement Replicate API integration for text generation
    // For now, return a placeholder that indicates Replicate mode
    return `[Replicate Mode] Welcome to our comprehensive guide on ${prompt.includes('topic') ? 'the topic' : 'this subject'}.

In this video, we'll explore the key concepts and provide you with actionable insights.

First, let's understand the fundamentals and why this matters to you.

Next, we'll dive into practical examples that you can apply immediately.

Finally, we'll wrap up with key takeaways and next steps for your journey.

Thank you for watching, and don't forget to subscribe for more valuable content!`;
  }

  private getFallbackResponse(prompt: string): string {
    return `Welcome to our comprehensive guide on ${prompt.includes('topic') ? 'the topic' : 'this subject'}.

In this video, we'll explore the key concepts and provide you with actionable insights.

First, let's understand the fundamentals and why this matters to you.

Next, we'll dive into practical examples that you can apply immediately.

Finally, we'll wrap up with key takeaways and next steps for your journey.

Thank you for watching, and don't forget to subscribe for more valuable content!`;
  }

  /**
   * Get the current LLM mode for UI display
   */
  public getCurrentLLMMode(): string {
    const mode = process.env.LLM_MODE || 'openai';
    return mode.charAt(0).toUpperCase() + mode.slice(1).toLowerCase();
  }

  /**
   * Get available LLM modes
   */
  public static getAvailableLLMModes(): Array<{value: string, label: string}> {
    return [
      { value: 'local', label: 'Local' },
      { value: 'openai', label: 'OpenAI' },
      { value: 'claude', label: 'Claude' },
      { value: 'replicate', label: 'Replicate' }
    ];
  }
}
