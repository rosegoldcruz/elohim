/**
 * AEON Video Platform - API Client
 * Centralized API client for communicating with the backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smart4technology.com:8000';

export interface VideoGenerationRequest {
  prompt: string;
  style?: string;
  duration?: number;
  width?: number;
  height?: number;
  model?: string;
}

export interface VideoGenerationResponse {
  prediction_id: string;
  status: string;
  message: string;
  video_url?: string;
}

export interface SceneRequest {
  segment_id: string;
  prompt_text: string;
  duration?: number;
  model?: string;
  width?: number;
  height?: number;
}

export interface ModularGenerationRequest {
  scenes: SceneRequest[];
  total_duration?: number;
  style?: string;
}

export interface SceneResult {
  segment_id: string;
  prediction_id: string;
  status: string;
  poll_url: string;
  error?: string;
}

export interface ModularGenerationResponse {
  status: string;
  total_scenes: number;
  successful_launches: number;
  failed_launches: number;
  scenes: SceneResult[];
}

export interface JobStatus {
  job_id: string;
  user_id: string;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
  video_url?: string;
  error?: string;
}

class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = BACKEND_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new APIError(
          errorData.detail || `HTTP ${response.status}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof APIError) {
        throw error;
      }
      throw new APIError(
        `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        0
      );
    }
  }

  private async authenticatedRequest<T>(
    endpoint: string,
    token: string,
    options: RequestInit = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Video Generation
  async generateVideo(
    request: VideoGenerationRequest,
    token: string
  ): Promise<VideoGenerationResponse> {
    return this.authenticatedRequest<VideoGenerationResponse>(
      '/api/generate/',
      token,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async getGenerationStatus(
    predictionId: string,
    token: string
  ): Promise<any> {
    return this.authenticatedRequest(
      `/api/generate/status/${predictionId}`,
      token
    );
  }

  async getAvailableModels(): Promise<any> {
    return this.request('/api/generate/models');
  }

  // Modular Generation
  async startModularGeneration(
    request: ModularGenerationRequest,
    token: string
  ): Promise<ModularGenerationResponse> {
    return this.authenticatedRequest<ModularGenerationResponse>(
      '/api/modular/',
      token,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  async pollModularStatus(
    pollUrls: string[],
    token: string
  ): Promise<any> {
    return this.authenticatedRequest(
      '/api/modular/status',
      token,
      {
        method: 'POST',
        body: JSON.stringify({ poll_urls: pollUrls }),
      }
    );
  }

  // Job Management
  async getUserJobs(
    token: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<{ jobs: JobStatus[]; total: number }> {
    return this.authenticatedRequest(
      `/api/status/jobs?limit=${limit}&offset=${offset}`,
      token
    );
  }

  async getJobStatus(
    jobId: string,
    token: string
  ): Promise<JobStatus> {
    return this.authenticatedRequest<JobStatus>(
      `/api/status/jobs/${jobId}`,
      token
    );
  }

  async cancelJob(
    jobId: string,
    token: string
  ): Promise<{ message: string }> {
    return this.authenticatedRequest(
      `/api/status/jobs/${jobId}`,
      token,
      { method: 'DELETE' }
    );
  }

  // Authentication
  async getCurrentUser(token: string): Promise<any> {
    return this.authenticatedRequest('/api/auth/me', token);
  }

  async verifyToken(token: string): Promise<any> {
    return this.request('/api/auth/verify', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async logout(token: string): Promise<{ message: string }> {
    return this.authenticatedRequest(
      '/api/auth/logout',
      token,
      { method: 'POST' }
    );
  }

  // System Health
  async getSystemHealth(): Promise<any> {
    return this.request('/api/status/health');
  }

  async getSystemMetrics(): Promise<any> {
    return this.request('/api/status/metrics');
  }

  // Video Processing
  async editVideo(
    request: any,
    token: string
  ): Promise<any> {
    return this.authenticatedRequest('/api/video/edit', token, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async uploadVideo(
    file: File,
    token: string
  ): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const url = `${this.baseURL}/api/video/upload`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.detail || `HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    return response.json();
  }

  async getSupportedFormats(): Promise<any> {
    return this.request('/api/video/formats');
  }

  async applyTransitions(
    videoUrl: string,
    transitions: string[],
    token: string
  ): Promise<any> {
    return this.authenticatedRequest('/api/video/transitions', token, {
      method: 'POST',
      body: JSON.stringify({ video_url: videoUrl, transitions }),
    });
  }

  async generateCaptions(
    videoUrl: string,
    language: string = 'en',
    token: string
  ): Promise<any> {
    return this.authenticatedRequest('/api/video/captions', token, {
      method: 'POST',
      body: JSON.stringify({ video_url: videoUrl, language }),
    });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export types
export type { APIError };
