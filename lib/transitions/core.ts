/**
 * AEON Transition Core Utilities
 * Manages GLSL shaders, transition cache, and GPU/CPU fallback logic
 */

import { createClient } from '@/lib/supabase/client';
import type { Transition, TransitionRenderOptions } from '@/types/video-editor';
import { marketplaceAgent, type CreatorTransition } from '../agents/MarketplaceAgent';

export interface TransitionCache {
  [key: string]: {
    transition: Transition;
    glslCode: string;
    compiledShader?: WebGLShader;
    lastUsed: Date;
    usageCount: number;
  };
}

export interface GLSLShaderProgram {
  program: WebGLProgram;
  uniforms: { [key: string]: WebGLUniformLocation };
  attributes: { [key: string]: number };
}

export class TransitionCore {
  private cache: TransitionCache = {};
  private gl: WebGLRenderingContext | null = null;
  private shaderPrograms: Map<string, GLSLShaderProgram> = new Map();
  private supabase = createClient();

  constructor() {
    this.initializeWebGL();
  }

  /**
   * Initialize WebGL context for GPU shader processing
   */
  private initializeWebGL(): void {
    try {
      const canvas = document.createElement('canvas');
      this.gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!this.gl) {
        console.warn('WebGL not available, falling back to CPU processing');
        return;
      }

      // Enable required extensions
      const extensions = [
        'OES_texture_float',
        'OES_texture_float_linear',
        'WEBGL_color_buffer_float'
      ];

      extensions.forEach(ext => {
        const extension = this.gl!.getExtension(ext);
        if (!extension) {
          console.warn(`WebGL extension ${ext} not available`);
        }
      });

      console.log('✅ WebGL initialized for GPU transitions');
    } catch (error) {
      console.error('WebGL initialization failed:', error);
      this.gl = null;
    }
  }

  /**
   * Load transition from cache or database (supports both official and creator transitions)
   */
  async loadTransition(transitionId: string): Promise<Transition> {
    // Check cache first
    if (this.cache[transitionId]) {
      this.cache[transitionId].lastUsed = new Date();
      this.cache[transitionId].usageCount++;
      return this.cache[transitionId].transition;
    }

    try {
      // Load from Supabase (includes both official and creator transitions)
      const { data: transition, error } = await this.supabase
        .from('transitions')
        .select(`
          *,
          creator_profile:creator_id(creator_name, avatar_url, is_verified)
        `)
        .eq('id', transitionId)
        .eq('is_active', true)
        .single();

      if (error) {
        throw new Error(`Failed to load transition: ${error.message}`);
      }

      if (!transition) {
        throw new Error(`Transition ${transitionId} not found`);
      }

      // Check if user has access to this transition (for paid transitions)
      if (!transition.is_official && transition.price_credits > 0) {
        const hasAccess = await this.checkTransitionAccess(transitionId);
        if (!hasAccess) {
          throw new Error(`Access denied to transition ${transitionId}`);
        }
      }

      // Cache the transition
      this.cache[transitionId] = {
        transition,
        glslCode: transition.glsl_code || '',
        lastUsed: new Date(),
        usageCount: 1
      };

      // Track usage for creator transitions
      if (!transition.is_official) {
        await this.trackCreatorTransitionUsage(transitionId, transition.creator_id);
      }

      return transition;
    } catch (error) {
      console.error(`Error loading transition ${transitionId}:`, error);

      // Return fallback transition
      return this.getFallbackTransition(transitionId);
    }
  }

  /**
   * Check if current user has access to a paid transition
   */
  private async checkTransitionAccess(transitionId: string): Promise<boolean> {
    try {
      // Get current user
      const { data: { user } } = await this.supabase.auth.getUser();
      if (!user) return false;

      // Check if user has purchased this transition
      const { data: purchase } = await this.supabase
        .from('transition_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('transition_id', transitionId)
        .single();

      return !!purchase;
    } catch (error) {
      console.error('Failed to check transition access:', error);
      return false;
    }
  }

  /**
   * Track usage of creator transitions for royalty calculation
   */
  private async trackCreatorTransitionUsage(transitionId: string, creatorId: string): Promise<void> {
    try {
      // Increment usage count
      await this.supabase.rpc('increment_transition_usage', {
        transition_id: transitionId
      });

      // Track for creator earnings (would integrate with royalty system)
      console.log(`📊 Creator transition used: ${transitionId} by ${creatorId}`);
    } catch (error) {
      console.error('Failed to track creator transition usage:', error);
    }
  }

  /**
   * Compile GLSL shader for GPU processing
   */
  async compileShader(transitionId: string, glslCode: string): Promise<GLSLShaderProgram | null> {
    if (!this.gl) {
      console.warn('WebGL not available, cannot compile shader');
      return null;
    }

    try {
      // Check if already compiled
      if (this.shaderPrograms.has(transitionId)) {
        return this.shaderPrograms.get(transitionId)!;
      }

      const vertexShaderSource = `
        attribute vec2 a_position;
        attribute vec2 a_texCoord;
        varying vec2 v_texCoord;
        
        void main() {
          gl_Position = vec4(a_position, 0.0, 1.0);
          v_texCoord = a_texCoord;
        }
      `;

      const fragmentShaderSource = `
        precision mediump float;
        uniform sampler2D u_texture1;
        uniform sampler2D u_texture2;
        uniform float u_progress;
        uniform float u_intensity;
        uniform vec2 u_resolution;
        varying vec2 v_texCoord;
        
        ${glslCode}
        
        void main() {
          gl_FragColor = transition(u_texture1, u_texture2, v_texCoord, u_progress);
        }
      `;

      // Compile shaders
      const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
      const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

      if (!vertexShader || !fragmentShader) {
        throw new Error('Failed to compile shaders');
      }

      // Create program
      const program = this.gl.createProgram();
      if (!program) {
        throw new Error('Failed to create shader program');
      }

      this.gl.attachShader(program, vertexShader);
      this.gl.attachShader(program, fragmentShader);
      this.gl.linkProgram(program);

      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        const error = this.gl.getProgramInfoLog(program);
        this.gl.deleteProgram(program);
        throw new Error(`Shader program linking failed: ${error}`);
      }

      // Get uniform and attribute locations
      const shaderProgram: GLSLShaderProgram = {
        program,
        uniforms: {
          u_texture1: this.gl.getUniformLocation(program, 'u_texture1')!,
          u_texture2: this.gl.getUniformLocation(program, 'u_texture2')!,
          u_progress: this.gl.getUniformLocation(program, 'u_progress')!,
          u_intensity: this.gl.getUniformLocation(program, 'u_intensity')!,
          u_resolution: this.gl.getUniformLocation(program, 'u_resolution')!,
        },
        attributes: {
          a_position: this.gl.getAttribLocation(program, 'a_position'),
          a_texCoord: this.gl.getAttribLocation(program, 'a_texCoord'),
        }
      };

      this.shaderPrograms.set(transitionId, shaderProgram);
      return shaderProgram;

    } catch (error) {
      console.error(`Failed to compile shader for ${transitionId}:`, error);
      return null;
    }
  }

  /**
   * Create and compile a WebGL shader
   */
  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;

    const shader = this.gl.createShader(type);
    if (!shader) return null;

    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader);
      console.error('Shader compilation error:', error);
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  /**
   * Apply GPU transition using compiled shader
   */
  async applyGPUTransition(
    texture1: WebGLTexture,
    texture2: WebGLTexture,
    transitionId: string,
    progress: number,
    intensity: number = 1.0
  ): Promise<ImageData | null> {
    if (!this.gl) return null;

    const shaderProgram = this.shaderPrograms.get(transitionId);
    if (!shaderProgram) {
      console.warn(`No compiled shader for transition ${transitionId}`);
      return null;
    }

    try {
      // Use the shader program
      this.gl.useProgram(shaderProgram.program);

      // Set up geometry (full-screen quad)
      const positions = new Float32Array([
        -1, -1,  1, -1,  -1, 1,
        -1,  1,  1, -1,   1, 1,
      ]);

      const texCoords = new Float32Array([
        0, 0,  1, 0,  0, 1,
        0, 1,  1, 0,  1, 1,
      ]);

      // Create and bind buffers
      const positionBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW);
      this.gl.enableVertexAttribArray(shaderProgram.attributes.a_position);
      this.gl.vertexAttribPointer(shaderProgram.attributes.a_position, 2, this.gl.FLOAT, false, 0, 0);

      const texCoordBuffer = this.gl.createBuffer();
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texCoordBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, texCoords, this.gl.STATIC_DRAW);
      this.gl.enableVertexAttribArray(shaderProgram.attributes.a_texCoord);
      this.gl.vertexAttribPointer(shaderProgram.attributes.a_texCoord, 2, this.gl.FLOAT, false, 0, 0);

      // Bind textures
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture1);
      this.gl.uniform1i(shaderProgram.uniforms.u_texture1, 0);

      this.gl.activeTexture(this.gl.TEXTURE1);
      this.gl.bindTexture(this.gl.TEXTURE_2D, texture2);
      this.gl.uniform1i(shaderProgram.uniforms.u_texture2, 1);

      // Set uniforms
      this.gl.uniform1f(shaderProgram.uniforms.u_progress, progress);
      this.gl.uniform1f(shaderProgram.uniforms.u_intensity, intensity);
      this.gl.uniform2f(shaderProgram.uniforms.u_resolution, this.gl.canvas.width, this.gl.canvas.height);

      // Render
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);

      // Read pixels
      const pixels = new Uint8ClampedArray(this.gl.canvas.width * this.gl.canvas.height * 4);
      this.gl.readPixels(0, 0, this.gl.canvas.width, this.gl.canvas.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);

      return new ImageData(pixels, this.gl.canvas.width, this.gl.canvas.height);

    } catch (error) {
      console.error(`GPU transition failed for ${transitionId}:`, error);
      return null;
    }
  }

  /**
   * Get fallback transition when loading fails
   */
  private getFallbackTransition(transitionId: string): Transition {
    return {
      id: transitionId,
      name: 'Crossfade',
      category: 'cinematic',
      duration: 0.5,
      intensity: 'moderate',
      viralScore: 5.0,
      previewUrl: '',
      glslCode: `
        vec4 transition(sampler2D tex1, sampler2D tex2, vec2 uv, float progress) {
          vec4 color1 = texture2D(tex1, uv);
          vec4 color2 = texture2D(tex2, uv);
          return mix(color1, color2, progress);
        }
      `,
      parameters: [],
      description: 'Simple crossfade transition',
      tags: ['basic', 'crossfade'],
      isActive: true
    };
  }

  /**
   * Track transition usage in analytics
   */
  async trackTransitionUsage(
    transitionId: string,
    projectId: string,
    userId: string,
    processingTimeMs: number,
    gpuAccelerated: boolean,
    viralScoreImpact: number = 0
  ): Promise<void> {
    try {
      await this.supabase
        .from('transition_analytics')
        .insert({
          transition_id: transitionId,
          project_id: projectId,
          user_id: userId,
          usage_count: 1,
          viral_score_impact: viralScoreImpact,
          processing_time_ms: processingTimeMs,
          gpu_accelerated: gpuAccelerated,
        });
    } catch (error) {
      console.error('Failed to track transition usage:', error);
    }
  }

  /**
   * Get transition analytics
   */
  async getTransitionAnalytics(transitionId: string): Promise<{
    totalUsage: number;
    avgViralScore: number;
    avgProcessingTime: number;
    gpuUsageRate: number;
  }> {
    try {
      const { data, error } = await this.supabase
        .from('transition_analytics')
        .select('usage_count, viral_score_impact, processing_time_ms, gpu_accelerated')
        .eq('transition_id', transitionId);

      if (error) throw error;

      if (!data || data.length === 0) {
        return {
          totalUsage: 0,
          avgViralScore: 0,
          avgProcessingTime: 0,
          gpuUsageRate: 0
        };
      }

      const totalUsage = data.reduce((sum, record) => sum + record.usage_count, 0);
      const avgViralScore = data.reduce((sum, record) => sum + record.viral_score_impact, 0) / data.length;
      const avgProcessingTime = data.reduce((sum, record) => sum + record.processing_time_ms, 0) / data.length;
      const gpuUsageRate = data.filter(record => record.gpu_accelerated).length / data.length;

      return {
        totalUsage,
        avgViralScore,
        avgProcessingTime,
        gpuUsageRate
      };
    } catch (error) {
      console.error('Failed to get transition analytics:', error);
      return {
        totalUsage: 0,
        avgViralScore: 0,
        avgProcessingTime: 0,
        gpuUsageRate: 0
      };
    }
  }

  /**
   * Clear cache and cleanup resources
   */
  cleanup(): void {
    // Clear shader programs
    if (this.gl) {
      this.shaderPrograms.forEach(program => {
        this.gl!.deleteProgram(program.program);
      });
    }
    this.shaderPrograms.clear();

    // Clear cache
    this.cache = {};
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalTransitions: number;
    totalUsage: number;
    memoryUsage: number;
  } {
    const totalTransitions = Object.keys(this.cache).length;
    const totalUsage = Object.values(this.cache).reduce((sum, item) => sum + item.usageCount, 0);
    const memoryUsage = JSON.stringify(this.cache).length; // Rough estimate

    return {
      totalTransitions,
      totalUsage,
      memoryUsage
    };
  }
}

// Singleton instance - only create on client side to prevent server-side WebGL errors
export const transitionCore = typeof window !== 'undefined' ? new TransitionCore() : ({
  compileShader: () => Promise.resolve(null),
  applyTransition: () => Promise.resolve(null),
  applyGPUTransition: () => Promise.resolve(null),
  preloadTransition: () => Promise.resolve(),
  clearCache: () => {},
} as any);

// Utility functions
export function isGPUAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  } catch {
    return false;
  }
}

/**
 * Get marketplace transitions for content type
 */
export async function getMarketplaceTransitionsForContent(
  contentType: 'high_energy' | 'smooth_flow' | 'dramatic' | 'tech_gaming' | 'lifestyle',
  viralScore: number,
  includeCreatorTransitions: boolean = true
): Promise<string[]> {
  try {
    if (!includeCreatorTransitions) {
      return getOptimalTransitionForContent(contentType, viralScore);
    }

    // Get marketplace transitions for this content type
    const marketplaceTransitions = await marketplaceAgent.getMarketplaceTransitions({
      category: contentType === 'high_energy' ? 'tiktok-essentials' :
                contentType === 'dramatic' ? '3d-transforms' :
                contentType === 'tech_gaming' ? 'glitch' : 'cinematic',
      minViralScore: viralScore > 7 ? 7 : 5,
      sortBy: 'viral_score',
      sortOrder: 'desc',
      limit: 10
    });

    // Combine official and creator transitions
    const officialTransitions = getOptimalTransitionForContent(contentType, viralScore);
    const creatorTransitionIds = marketplaceTransitions
      .filter(t => t.isApproved && t.viralScore && t.viralScore >= 6)
      .map(t => t.id!)
      .slice(0, 5); // Top 5 creator transitions

    return [...officialTransitions, ...creatorTransitionIds];
  } catch (error) {
    console.error('Failed to get marketplace transitions:', error);
    return getOptimalTransitionForContent(contentType, viralScore);
  }
}

export function getOptimalTransitionForContent(
  contentType: 'high_energy' | 'smooth_flow' | 'dramatic' | 'tech_gaming' | 'lifestyle',
  viralScore: number
): string[] {
  const presets = {
    high_energy: ['zoom_punch', 'glitch_blast', 'viral_cut'],
    smooth_flow: ['crossfade', 'slide', 'film_burn'],
    dramatic: ['3d_flip', 'zoom_punch', 'cube_rotate'],
    tech_gaming: ['glitch_blast', 'viral_cut', 'digital_noise'],
    lifestyle: ['slide', 'crossfade', 'zoom_punch']
  };

  let transitions = presets[contentType] || presets.smooth_flow;

  // Boost viral transitions for high viral score content
  if (viralScore > 7.0) {
    transitions = ['zoom_punch', 'glitch_blast', ...transitions];
  }

  return transitions;
}

/**
 * Get trending creator transitions
 */
export async function getTrendingCreatorTransitions(limit: number = 10): Promise<CreatorTransition[]> {
  try {
    return await marketplaceAgent.getMarketplaceTransitions({
      sortBy: 'viral_score',
      sortOrder: 'desc',
      minViralScore: 7,
      limit
    });
  } catch (error) {
    console.error('Failed to get trending creator transitions:', error);
    return [];
  }
}

/**
 * Get user's purchased transitions
 */
export async function getUserPurchasedTransitions(userId: string): Promise<string[]> {
  try {
    const supabase = createClient();
    const { data: purchases } = await supabase
      .from('transition_purchases')
      .select('transition_id')
      .eq('user_id', userId);

    return purchases?.map(p => p.transition_id) || [];
  } catch (error) {
    console.error('Failed to get user purchased transitions:', error);
    return [];
  }
}
