/**
 * AEON Video Platform - API Client
 * Centralized API client for communicating with the backend
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smart4technology.com:8000';

export interface CreateJobRequest {
  text: string;
  video_length: 30 | 60 | 90 | 120;
  scene_duration: 5 | 10;
  style?: 'tiktok' | 'cinematic' | 'tutorial' | 'comedy' | 'lifestyle';
  model_preset?: string | null;
}

export interface CreateJobResponse {
  job_id: string;
  status: string;
  scene_count: number;
}

export interface JobStatus {
  job_id: string;
  status: string;
  progress: number;
  created_at: string;
  updated_at: string;
  video_url?: string;
  error?: string;
  meta?: Record<string, any>;
}

export interface RenderTimelineRequest {
  timeline: Record<string, any>;
  settings?: Record<string, any>;
}

export interface RenderTimelineResponse {
  job_id: string;
  status: string;
}

export interface ProductBatchResponse {
  jobs: string[];
  scraped: { title: string; images: string[]; bullets: string[]; description: string; url: string };
}

export interface TalkingHeadRequest {
  image_url: string;
  audio_url: string;
  style?: string;
}

export interface MediaUploadResponse { url: string }

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

  // Jobs API
  async createJob(payload: CreateJobRequest, token: string): Promise<CreateJobResponse> {
    return this.authenticatedRequest<CreateJobResponse>('/jobs', token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getJobStatus(jobId: string, token: string): Promise<JobStatus> {
    return this.authenticatedRequest<JobStatus>(`/status/${jobId}`, token);
    }

  getDownloadUrl(jobId: string): string {
    return `${this.baseURL}/download/${jobId}`;
  }

  async renderTimeline(payload: RenderTimelineRequest, token: string): Promise<RenderTimelineResponse> {
    return this.authenticatedRequest<RenderTimelineResponse>(`/editor/render`, token, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async productBatch(url: string, variants: number, token: string): Promise<ProductBatchResponse> {
    const params = new URLSearchParams({ url, variants: String(variants) });
    return this.authenticatedRequest<ProductBatchResponse>(`/marketing/product-batch?${params.toString()}`, token, { method: 'POST' });
  }

  async talkingHead(payload: TalkingHeadRequest, token: string): Promise<{ path: string; url?: string }> {
    return this.authenticatedRequest(`/vision/talking-head`, token, { method: 'POST', body: JSON.stringify(payload) });
  }

  async tts(text: string, voice: string | undefined, language: string | undefined, token: string): Promise<{ url?: string; path?: string }> {
    return this.authenticatedRequest(`/audio/tts`, token, { method: 'POST', body: JSON.stringify({ text, voice, language }) });
  }

  async music(prompt: string, duration: number | undefined, token: string): Promise<{ url?: string; path?: string }> {
    return this.authenticatedRequest(`/audio/music`, token, { method: 'POST', body: JSON.stringify({ prompt, duration }) });
  }

  async upscale(file: File, scale: number, token: string): Promise<{ url?: string; path?: string }> {
    const form = new FormData();
    form.append('file', file);
    form.append('scale', String(scale));
    const res = await fetch(`${this.baseURL}/vision/upscale?scale=${scale}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) throw new APIError(`HTTP ${res.status}`, res.status);
    return res.json();
  }

  async mediaUpload(file: File): Promise<MediaUploadResponse> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${this.baseURL}/media/upload`, { method: 'POST', body: form });
    if (!res.ok) throw new APIError(`HTTP ${res.status}`, res.status);
    return res.json();
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export types
export type { APIError };
