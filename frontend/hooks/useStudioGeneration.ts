/**
 * React hook for AEON Studio unified generation
 * Handles complete project generation (script + video + music) from single prompt
 */

import { useState, useCallback } from 'react';

export interface StudioGenerationOptions {
  creative_prompt: string;
  style?: 'viral' | 'cinematic' | 'educational' | 'entertainment' | 'commercial';
  platform?: 'tiktok' | 'reels' | 'shorts' | 'youtube';
  duration?: number;
  preferences?: {
    music_genre?: string;
    video_style?: string;
    caption_style?: string;
    preferred_models?: {
      video?: string;
      music?: string;
    };
  };
  project_id?: string;
}

export interface GeneratedProject {
  project_id: string;
  assets: {
    script?: {
      content: any;
      processing_time: number;
    };
    video?: {
      url: string;
      scenes: any[];
      model_used: string;
      processing_time: number;
    };
    music?: {
      url: string;
      duration: number;
      style: string;
      model_used: string;
      processing_time: number;
    };
  };
  metrics: {
    total_processing_time: number;
    total_cost_estimate: number;
    ready_for_editing: boolean;
  };
  editor_url: string;
}

export interface UserProject {
  id: string;
  name: string;
  description: string;
  style: string;
  platform: string;
  duration: number;
  status: 'generating' | 'completed' | 'failed';
  ready_for_editing: boolean;
  script_content?: any;
  video_url?: string;
  music_url?: string;
  created_at: string;
  updated_at: string;
}

export interface StudioGenerationState {
  isGenerating: boolean;
  progress: number;
  currentStep: string;
  result: GeneratedProject | null;
  error: string | null;
  projects: UserProject[];
  loadingProjects: boolean;
}

export function useStudioGeneration(user_id: string) {
  const [state, setState] = useState<StudioGenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: '',
    result: null,
    error: null,
    projects: [],
    loadingProjects: false
  });

  /**
   * Generate complete video project from creative prompt
   */
  const generateProject = useCallback(async (options: StudioGenerationOptions) => {
    if (!user_id) {
      setState(prev => ({ ...prev, error: 'User ID is required' }));
      return null;
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null, 
      result: null, 
      progress: 0,
      currentStep: 'Initializing...'
    }));

    try {
      setState(prev => ({ ...prev, progress: 10, currentStep: 'Generating script...' }));

      const response = await fetch('/api/studio/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...options,
          user_id,
          style: options.style || 'viral',
          platform: options.platform || 'tiktok',
          duration: options.duration || 60
        }),
      });

      setState(prev => ({ ...prev, progress: 50, currentStep: 'Generating video and music...' }));

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Project generation failed');
      }

      const data = await response.json();
      
      setState(prev => ({ ...prev, progress: 100, currentStep: 'Complete!' }));

      if (data.success) {
        setState(prev => ({
          ...prev,
          isGenerating: false,
          result: data,
          progress: 100
        }));
        
        // Refresh projects list
        await fetchProjects();
        
        return data;
      } else {
        throw new Error(data.error || 'Project generation failed');
      }

    } catch (error) {
      console.error('Studio generation error:', error);
      setState(prev => ({
        ...prev,
        isGenerating: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        progress: 0,
        currentStep: ''
      }));
      return null;
    }
  }, [user_id]);

  /**
   * Fetch user's projects
   */
  const fetchProjects = useCallback(async () => {
    if (!user_id) return;

    setState(prev => ({ ...prev, loadingProjects: true }));

    try {
      const response = await fetch(`/api/studio/generate?action=projects&user_id=${user_id}`);
      
      if (response.ok) {
        const data = await response.json();
        setState(prev => ({ 
          ...prev, 
          projects: data.projects || [],
          loadingProjects: false
        }));
      } else {
        throw new Error('Failed to fetch projects');
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
      setState(prev => ({ 
        ...prev, 
        loadingProjects: false,
        error: error instanceof Error ? error.message : 'Failed to fetch projects'
      }));
    }
  }, [user_id]);

  /**
   * Get specific project details
   */
  const getProject = useCallback(async (project_id: string) => {
    try {
      const response = await fetch(`/api/studio/generate?action=project&project_id=${project_id}`);
      
      if (response.ok) {
        const data = await response.json();
        return data.project;
      } else {
        throw new Error('Failed to fetch project');
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to fetch project'
      }));
      return null;
    }
  }, []);

  /**
   * Delete project
   */
  const deleteProject = useCallback(async (project_id: string) => {
    try {
      const response = await fetch(`/api/studio/generate?project_id=${project_id}&user_id=${user_id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        // Refresh projects list
        await fetchProjects();
        return true;
      } else {
        throw new Error('Failed to delete project');
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to delete project'
      }));
      return false;
    }
  }, [user_id, fetchProjects]);

  /**
   * Reset generation state
   */
  const reset = useCallback(() => {
    setState(prev => ({
      ...prev,
      isGenerating: false,
      progress: 0,
      currentStep: '',
      result: null,
      error: null
    }));
  }, []);

  /**
   * Quick generation presets
   */
  const generatePreset = useCallback(async (preset: 'viral-tiktok' | 'educational' | 'commercial' | 'cinematic', prompt: string) => {
    const presets = {
      'viral-tiktok': {
        creative_prompt: prompt,
        style: 'viral' as const,
        platform: 'tiktok' as const,
        duration: 30,
        preferences: {
          music_genre: 'electronic',
          video_style: 'energetic'
        }
      },
      'educational': {
        creative_prompt: prompt,
        style: 'educational' as const,
        platform: 'youtube' as const,
        duration: 90,
        preferences: {
          music_genre: 'ambient',
          video_style: 'clean'
        }
      },
      'commercial': {
        creative_prompt: prompt,
        style: 'commercial' as const,
        platform: 'reels' as const,
        duration: 45,
        preferences: {
          music_genre: 'upbeat',
          video_style: 'professional'
        }
      },
      'cinematic': {
        creative_prompt: prompt,
        style: 'cinematic' as const,
        platform: 'youtube' as const,
        duration: 120,
        preferences: {
          music_genre: 'orchestral',
          video_style: 'dramatic'
        }
      }
    };

    return generateProject(presets[preset]);
  }, [generateProject]);

  return {
    // State
    ...state,
    
    // Actions
    generateProject,
    generatePreset,
    fetchProjects,
    getProject,
    deleteProject,
    reset,
    
    // Computed
    isReady: !state.isGenerating && !state.error,
    hasResult: !!state.result,
    progressPercentage: Math.round(state.progress),
    canEdit: state.result?.metrics.ready_for_editing || false
  };
}
