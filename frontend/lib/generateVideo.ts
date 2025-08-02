/**
 * AEON Video Generation API Client
 * Handles communication with the backend video generation service
 */

export interface GenerateVideoRequest {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface VideoGenerationStatus {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  output?: string[];
  error?: string;
  created_at?: string;
  completed_at?: string;
  logs?: string[];
  metrics?: {
    predict_time?: number;
  };
}

/**
 * Start video generation with the backend
 */
export async function generateVideo(
  prompt: string, 
  model = "kling", 
  duration = 4,
  width = 576,
  height = 1024
): Promise<string> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smart4technology.com:8000';
  
  const res = await fetch(`${backendUrl}/generate`, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({ 
      prompt, 
      model, 
      duration,
      width,
      height
    }),
  });

  const data = await res.json();
  
  if (!res.ok || !data.id) {
    throw new Error(data.error || "Failed to start generation");
  }

  return data.id;
}

/**
 * Check the status of a video generation job
 */
export async function checkStatus(predictionId: string): Promise<VideoGenerationStatus> {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smart4technology.com:8000';
  
  const res = await fetch(`${backendUrl}/generate/status/${predictionId}`, {
    method: "GET",
    headers: {
      "Accept": "application/json"
    }
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
  }

  return await res.json();
}

/**
 * Poll for video generation completion
 */
export async function pollForCompletion(
  predictionId: string,
  onProgress?: (status: VideoGenerationStatus) => void,
  maxAttempts = 60,
  intervalMs = 3000
): Promise<VideoGenerationStatus> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    try {
      const status = await checkStatus(predictionId);
      
      if (onProgress) {
        onProgress(status);
      }
      
      if (status.status === 'succeeded') {
        return status;
      }
      
      if (status.status === 'failed' || status.status === 'canceled') {
        throw new Error(status.error || `Generation ${status.status}`);
      }
      
      // Continue polling if still processing
      if (status.status === 'starting' || status.status === 'processing') {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
        attempts++;
        continue;
      }
      
      // Unknown status
      throw new Error(`Unknown status: ${status.status}`);
      
    } catch (error) {
      if (attempts >= maxAttempts - 1) {
        throw error;
      }
      
      // Wait before retrying on error
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      attempts++;
    }
  }
  
  throw new Error('Polling timeout: Video generation took too long');
}

/**
 * Get video dimensions based on aspect ratio
 */
export function getVideoDimensions(aspectRatio: string): { width: number; height: number } {
  switch (aspectRatio) {
    case '16:9':
      return { width: 1024, height: 576 };
    case '9:16':
      return { width: 576, height: 1024 };
    case '1:1':
      return { width: 768, height: 768 };
    default:
      return { width: 576, height: 1024 }; // Default to portrait
  }
}

/**
 * Parse duration string to seconds
 */
export function parseDuration(durationStr: string): number {
  const match = durationStr.match(/(\d+)\s*seconds?/i);
  return match ? parseInt(match[1]) : 4; // Default to 4 seconds
}
