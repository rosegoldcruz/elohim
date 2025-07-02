/**
 * AEON ScriptWriterAgent - Generates compelling video scripts using AI
 * Integrates with OpenAI GPT-4 and Claude for high-quality content creation
 */

import { openai, claude } from '@/lib/ai-services';

export interface ScriptSection {
  type: 'hook' | 'body' | 'cta' | 'transition';
  content: string;
  duration: number;
  visual_cue: string;
  emotion: string;
}

export interface VideoScript {
  title: string;
  description: string;
  total_duration: number;
  target_audience: string;
  tone: string;
  sections: ScriptSection[];
  hashtags: string[];
  thumbnail_suggestion: string;
}

export interface ScriptOptions {
  duration?: number;
  tone?: 'educational' | 'entertaining' | 'inspirational' | 'conversational' | 'professional';
  platform?: 'tiktok' | 'youtube' | 'instagram' | 'general';
  target_audience?: string;
  include_cta?: boolean;
  style?: 'storytelling' | 'listicle' | 'tutorial' | 'review' | 'commentary';
}

export class ScriptWriterAgent {
  private readonly defaultOptions: ScriptOptions = {
    duration: 60,
    tone: 'conversational',
    platform: 'general',
    target_audience: 'general audience',
    include_cta: true,
    style: 'storytelling'
  };

  /**
   * Generate a complete video script from a topic
   */
  async generateScript(topic: string, options: ScriptOptions = {}): Promise<VideoScript> {
    console.log(`✍️ ScriptWriterAgent: Generating script for topic: ${topic}`);
    
    const opts = { ...this.defaultOptions, ...options };
    
    try {
      // Use GPT-4 for script generation
      const script = await this.generateWithOpenAI(topic, opts);
      
      console.log(`✅ ScriptWriterAgent: Generated ${script.sections.length}-section script`);
      return script;
      
    } catch (error) {
      console.error('❌ ScriptWriterAgent OpenAI error:', error);
      
      try {
        // Fallback to Claude
        console.log('🔄 ScriptWriterAgent: Trying Claude fallback...');
        return await this.generateWithClaude(topic, opts);
        
      } catch (claudeError) {
        console.error('❌ ScriptWriterAgent Claude error:', claudeError);
        return this.generateFallbackScript(topic, opts);
      }
    }
  }

  /**
   * Generate script variations for A/B testing
   */
  async generateScriptVariations(topic: string, count: number = 3, options: ScriptOptions = {}): Promise<VideoScript[]> {
    console.log(`🎭 ScriptWriterAgent: Generating ${count} script variations for: ${topic}`);
    
    const variations: VideoScript[] = [];
    const tones: Array<ScriptOptions['tone']> = ['educational', 'entertaining', 'inspirational'];
    const styles: Array<ScriptOptions['style']> = ['storytelling', 'listicle', 'tutorial'];
    
    for (let i = 0; i < count; i++) {
      const variationOptions = {
        ...options,
        tone: tones[i % tones.length],
        style: styles[i % styles.length]
      };
      
      try {
        const script = await this.generateScript(topic, variationOptions);
        script.title = `${script.title} (Variation ${i + 1})`;
        variations.push(script);
      } catch (error) {
        console.error(`Failed to generate variation ${i + 1}:`, error);
      }
    }
    
    return variations;
  }

  /**
   * Optimize script for specific platform
   */
  async optimizeForPlatform(script: VideoScript, platform: 'tiktok' | 'youtube' | 'instagram'): Promise<VideoScript> {
    console.log(`🎯 ScriptWriterAgent: Optimizing script for ${platform}`);
    
    const platformGuidelines = {
      tiktok: {
        maxDuration: 60,
        hookDuration: 3,
        fastPaced: true,
        trendy: true
      },
      youtube: {
        maxDuration: 300,
        hookDuration: 15,
        fastPaced: false,
        trendy: false
      },
      instagram: {
        maxDuration: 90,
        hookDuration: 5,
        fastPaced: true,
        trendy: true
      }
    };
    
    const guidelines = platformGuidelines[platform];
    
    try {
      const prompt = `
        Optimize this video script for ${platform}:
        
        Original Script: ${JSON.stringify(script, null, 2)}
        
        Platform Guidelines:
        - Max Duration: ${guidelines.maxDuration}s
        - Hook Duration: ${guidelines.hookDuration}s
        - Fast Paced: ${guidelines.fastPaced}
        - Trendy Language: ${guidelines.trendy}
        
        Return optimized script in the same JSON format.
      `;

      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 2000,
      });

      const optimizedScript = JSON.parse(response.choices[0].message.content || '{}');
      return { ...script, ...optimizedScript };
      
    } catch (error) {
      console.error('Script optimization failed:', error);
      return script;
    }
  }

  /**
   * Generate script using OpenAI GPT-4
   */
  private async generateWithOpenAI(topic: string, options: ScriptOptions): Promise<VideoScript> {
    const prompt = this.buildScriptPrompt(topic, options);
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional video script writer specializing in viral, engaging content. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 2500,
    });

    const scriptData = JSON.parse(response.choices[0].message.content || '{}');
    return this.validateAndFormatScript(scriptData, topic, options);
  }

  /**
   * Generate script using Claude
   */
  private async generateWithClaude(topic: string, options: ScriptOptions): Promise<VideoScript> {
    const prompt = this.buildScriptPrompt(topic, options);
    
    const response = await claude.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2500,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const scriptData = JSON.parse(content.text);
      return this.validateAndFormatScript(scriptData, topic, options);
    }
    
    throw new Error('Invalid Claude response format');
  }

  /**
   * Build comprehensive script generation prompt
   */
  private buildScriptPrompt(topic: string, options: ScriptOptions): string {
    return `
      Create a compelling ${options.duration}-second video script about "${topic}".
      
      Requirements:
      - Tone: ${options.tone}
      - Platform: ${options.platform}
      - Style: ${options.style}
      - Target Audience: ${options.target_audience}
      - Include CTA: ${options.include_cta}
      
      Structure the script with these sections:
      1. Hook (first 3-5 seconds) - grab attention immediately
      2. Body (main content) - deliver value/entertainment
      3. CTA (call-to-action) - if requested
      4. Transitions between sections
      
      For each section, provide:
      - Content (exact words to say)
      - Duration (seconds)
      - Visual cue (what should be shown)
      - Emotion (feeling to convey)
      
      Also include:
      - Compelling title
      - Description
      - Target audience
      - Relevant hashtags
      - Thumbnail suggestion
      
      Return as JSON with this structure:
      {
        "title": "string",
        "description": "string", 
        "total_duration": number,
        "target_audience": "string",
        "tone": "string",
        "sections": [
          {
            "type": "hook|body|cta|transition",
            "content": "string",
            "duration": number,
            "visual_cue": "string",
            "emotion": "string"
          }
        ],
        "hashtags": ["string"],
        "thumbnail_suggestion": "string"
      }
    `;
  }

  /**
   * Validate and format script data
   */
  private validateAndFormatScript(scriptData: any, topic: string, options: ScriptOptions): VideoScript {
    return {
      title: scriptData.title || `${topic} - Video Script`,
      description: scriptData.description || `Engaging video about ${topic}`,
      total_duration: scriptData.total_duration || options.duration || 60,
      target_audience: scriptData.target_audience || options.target_audience || 'general audience',
      tone: scriptData.tone || options.tone || 'conversational',
      sections: scriptData.sections || this.generateFallbackSections(topic),
      hashtags: scriptData.hashtags || [`#${topic.replace(/\s+/g, '')}`],
      thumbnail_suggestion: scriptData.thumbnail_suggestion || `Eye-catching visual related to ${topic}`,
    };
  }

  /**
   * Generate fallback script when AI fails
   */
  private generateFallbackScript(topic: string, options: ScriptOptions): VideoScript {
    console.log("⚠️ ScriptWriterAgent: Using fallback script generation");
    
    return {
      title: `${topic} - Must Watch!`,
      description: `Everything you need to know about ${topic}`,
      total_duration: options.duration || 60,
      target_audience: options.target_audience || 'general audience',
      tone: options.tone || 'conversational',
      sections: this.generateFallbackSections(topic),
      hashtags: [`#${topic.replace(/\s+/g, '')}`, '#viral', '#trending'],
      thumbnail_suggestion: `Bold text overlay on relevant background image`,
    };
  }

  /**
   * Generate basic script sections as fallback
   */
  private generateFallbackSections(topic: string): ScriptSection[] {
    return [
      {
        type: 'hook',
        content: `You won't believe what I discovered about ${topic}!`,
        duration: 5,
        visual_cue: 'Attention-grabbing opener',
        emotion: 'excitement'
      },
      {
        type: 'body',
        content: `Let me break down everything you need to know about ${topic}. This is going to change how you think about it completely.`,
        duration: 45,
        visual_cue: 'Main content visuals',
        emotion: 'informative'
      },
      {
        type: 'cta',
        content: `If this helped you, make sure to follow for more insights like this!`,
        duration: 10,
        visual_cue: 'Follow button or subscribe prompt',
        emotion: 'encouraging'
      }
    ];
  }
}
