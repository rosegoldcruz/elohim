/**
 * AEON Modular Video Generation API Client
 * Handles parallel scene generation with multiple AI models
 */

export interface SceneInput {
  segment_id: string;
  prompt_text: string;
  duration: number;
  model: string;
  width?: number;
  height?: number;
}

export interface ModularRequest {
  scenes: SceneInput[];
}

export interface SceneResult {
  scene_id: string;
  model: string;
  status: string;
  prediction_id: string;
  poll_url: string;
  prompt_used: string;
  duration: number;
  error?: string;
  created_at?: string;
}

export interface ModularResponse {
  status: string;
  total_scenes: number;
  successful_launches: number;
  failed_launches: number;
  scenes: SceneResult[];
}

export interface SceneStatus {
  prediction_id: string;
  status: string;
  output_url?: string;
  error?: string;
  progress?: number;
  logs?: string[];
  metrics?: Record<string, any>;
}

export interface StatusSummary {
  total: number;
  completed: number;
  failed: number;
  in_progress: number;
  status_breakdown: Record<string, number>;
}

export interface PollResponse {
  scenes: SceneStatus[];
  summary: StatusSummary;
}

/**
 * Model configurations for different scene durations
 */
export const MODEL_CONFIGS = {
  fast_5s: [
    { id: 'minimax', name: 'Minimax Video', max_duration: 6 },
    { id: 'kling', name: 'Kling Pro', max_duration: 10 },
    { id: 'haiper', name: 'Haiper Video', max_duration: 8 }
  ],
  stable_10s: [
    { id: 'haiper', name: 'Haiper Video', max_duration: 8 },
    { id: 'luma', name: 'Luma Dream', max_duration: 10 }
  ]
};

/**
 * Get the appropriate model for a scene based on duration and index
 */
export function getModelForScene(sceneIndex: number, sceneDuration: number): string {
  const models = sceneDuration <= 5 ? MODEL_CONFIGS.fast_5s : MODEL_CONFIGS.stable_10s;
  return models[sceneIndex % models.length].id;
}

/**
 * Create scene inputs for modular generation
 */
export function createSceneInputs(
  basePrompt: string,
  totalDuration: number,
  sceneDuration: number,
  width = 576,
  height = 1024
): SceneInput[] {
  const sceneCount = Math.ceil(totalDuration / sceneDuration);
  
  return Array.from({ length: sceneCount }, (_, i) => ({
    segment_id: `scene_${Date.now()}_${i}`,
    prompt_text: `${basePrompt} — Scene ${i + 1} of ${sceneCount}`,
    duration: sceneDuration,
    model: getModelForScene(i, sceneDuration),
    width,
    height
  }));
}

/**
 * Start modular video generation
 */
export async function startModularGeneration(request: ModularRequest): Promise<ModularResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smart4technology.com:8000';
  
  const response = await fetch(`${backendUrl}/api/generate/modular`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Poll multiple scenes for status updates
 */
export async function pollSceneStatus(pollUrls: string[]): Promise<PollResponse> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smart4technology.com:8000';
  
  const response = await fetch(`${backendUrl}/api/poll/modular-status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ poll_urls: pollUrls })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Poll until all scenes are complete or failed
 */
export async function pollUntilComplete(
  pollUrls: string[],
  onProgress?: (response: PollResponse) => void,
  maxAttempts = 60,
  intervalMs = 4000
): Promise<PollResponse> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const response = await pollSceneStatus(pollUrls);
      
      if (onProgress) {
        onProgress(response);
      }
      
      const { summary } = response;
      const totalProcessed = summary.completed + summary.failed;
      
      // Check if all scenes are done (completed or failed)
      if (totalProcessed >= summary.total) {
        return response;
      }
      
      // Continue polling if scenes are still processing
      if (summary.in_progress > 0) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        attempts++;
        continue;
      }
      
      // If no scenes are in progress but not all are complete, something went wrong
      throw new Error('Polling stalled: no scenes in progress but not all complete');
      
    } catch (error) {
      if (attempts >= maxAttempts - 1) {
        throw error;
      }
      
      // Wait before retrying on error
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    }
  }
  
  throw new Error('Polling timeout: Scene generation took too long');
}

/**
 * Get available models from the backend
 */
export async function getAvailableModels(): Promise<any> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smart4technology.com:8000';
  
  const response = await fetch(`${backendUrl}/api/generate/models`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch models: ${response.status}`);
  }

  return await response.json();
}

/**
 * Calculate estimated generation time based on scene count and models
 */
export function estimateGenerationTime(sceneCount: number, sceneDuration: number): {
  min: number;
  max: number;
  average: number;
} {
  // Base time per scene varies by model and duration
  const baseTimePerScene = sceneDuration <= 5 ? 45 : 90; // seconds
  const varianceMultiplier = 0.5; // ±50% variance
  
  const average = baseTimePerScene * sceneCount;
  const min = Math.round(average * (1 - varianceMultiplier));
  const max = Math.round(average * (1 + varianceMultiplier));
  
  return { min, max, average: Math.round(average) };
}

/**
 * Format time in seconds to human readable format
 */
export function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
}
