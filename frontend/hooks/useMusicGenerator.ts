/**
 * React hook for AEON Music Generation
 * Provides easy interface for generating music in React components
 */

import { useState, useCallback } from 'react';

export interface MusicGenerationOptions {
  prompt: string;
  duration?: number;
  style?: 'upbeat' | 'chill' | 'dramatic' | 'ambient' | 'electronic' | 'orchestral' | 'rock' | 'jazz' | 'custom';
  model_preference?: 'musicgen' | 'riffusion' | 'bark' | 'auto';
  tempo?: number;
  key?: string;
  instruments?: string[];
  project_id?: string;
}

export interface MusicResult {
  audio_url: string;
  duration: number;
  style: string;
  model_used: string;
  processing_time: number;
  metadata: {
    tempo?: number;
    key?: string;
    format: string;
    file_size?: number;
  };
}

export interface MusicGenerationState {
  isGenerating: boolean;
  result: MusicResult | null;
  error: string | null;
  progress: number;
  costEstimate: number;
}

export interface AvailableModel {
  name: string;
  max_duration: number;
  supported_styles: string[];
  description: string;
  price_per_second: number;
}

export function useMusicGenerator(user_id: string) {
  const [state, setState] = useState<MusicGenerationState>({
    isGenerating: false,
    result: null,
    error: null,
    progress: 0,
    costEstimate: 0
  });

  const [availableModels, setAvailableModels] = useState<AvailableModel[]>([]);

  /**
   * Generate music from prompt
   */
  const generateMusic = useCallback(async (options: MusicGenerationOptions) => {
    if (!user_id) {
      setState(prev => ({ ...prev, error: 'User ID is required' }));
      return null;
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null, 
      result: null, 
      progress: 0 
    }));

    try {
      // Get cost estimate first
      const costResponse = await fetch(
        `/api/music/generate?action=estimate&duration=${options.duration || 30}&model=${options.model_preference || 'auto'}`
      );
      
      if (costResponse.ok) {
        const costData = await costResponse.json();
        setState(prev => ({ ...prev, costEstimate: costData.cost_estimate }));
      }

      setState(prev => ({ ...prev, progress: 10 }));

      // Generate music
      const response = await fetch('/api/music/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...options,
          user_id,
          duration: options.duration || 30,
          style: options.style || 'upbeat',
          model_preference: options.model_preference || 'auto'
        }),
      });

      setState(prev => ({ ...prev, progress: 50 }));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Music generation failed');
      }

      const data = await response.json();
      
      setState(prev => ({ ...prev, progress: 100 }));

      if (data.success) {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          result: data.music,
          progress: 100
        }));
        
        return data.music;
      } else {
        throw new Error(data.error || 'Music generation failed');
      }

    } catch (error) {
      console.error('Music generation error:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        progress: 0
      }));
      return null;
    }
  }, [user_id]);

  /**
   * Get available models and their capabilities
   */
  const fetchAvailableModels = useCallback(async () => {
    try {
      const response = await fetch('/api/music/generate?action=models');
      
      if (response.ok) {
        const data = await response.json();
        setAvailableModels(data.models || []);
        return data.models;
      }
    } catch (error) {
      console.error('Failed to fetch available models:', error);
    }
    return [];
  }, []);

  /**
   * Estimate cost for music generation
   */
  const estimateCost = useCallback(async (duration: number, model?: string) => {
    try {
      const response = await fetch(
        `/api/music/generate?action=estimate&duration=${duration}&model=${model || 'auto'}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return data.cost_estimate;
      }
    } catch (error) {
      console.error('Failed to estimate cost:', error);
    }
    return 0;
  }, []);

  /**
   * Reset generation state
   */
  const reset = useCallback(() => {
    setState({
      isGenerating: false,
      result: null,
      error: null,
      progress: 0,
      costEstimate: 0
    });
  }, []);

  /**
   * Quick generation presets
   */
  const generatePreset = useCallback(async (preset: 'background' | 'intro' | 'outro' | 'transition', prompt?: string) => {
    const presets = {
      background: {
        prompt: prompt || 'ambient background music for video',
        duration: 60,
        style: 'ambient' as const,
        model_preference: 'musicgen' as const
      },
      intro: {
        prompt: prompt || 'energetic intro music with build-up',
        duration: 10,
        style: 'upbeat' as const,
        model_preference: 'musicgen' as const
      },
      outro: {
        prompt: prompt || 'satisfying outro music with resolution',
        duration: 15,
        style: 'chill' as const,
        model_preference: 'musicgen' as const
      },
      transition: {
        prompt: prompt || 'smooth transition music',
        duration: 5,
        style: 'electronic' as const,
        model_preference: 'riffusion' as const
      }
    };

    return generateMusic(presets[preset]);
  }, [generateMusic]);

  return {
    // State
    ...state,
    availableModels,
    
    // Actions
    generateMusic,
    generatePreset,
    fetchAvailableModels,
    estimateCost,
    reset,
    
    // Computed
    isReady: !state.isGenerating && !state.error,
    hasResult: !!state.result,
    progressPercentage: Math.round(state.progress)
  };
}
