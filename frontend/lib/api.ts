/**
 * AEON AI Video Generation Platform - API Integration
 * Based on MIT-licensed ai-video-generator
 * License: MIT (see LICENSE file)
 * 
 * Frontend API client with proper error handling and type safety
 */

import { config, getApiUrl } from './env'

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface VideoGenerationResponse {
  success: boolean
  video_id: string
  message: string
  credits_used: number
  estimated_completion_time: string
}

export interface VideoStatusResponse {
  video_id: string
  status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  current_agent?: string
  estimated_completion?: string
  error_message?: string
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: {
    id: string
    email: string
    credits: number
    subscription_tier: string
    subscription_status: string
  }
  auth_token?: string
}

export interface DashboardResponse {
  success: boolean
  user_data?: any
  admin_data?: any
  error?: string
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// API Client class
export class ApiClient {
  private baseUrl: string
  private authToken: string | null = null

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.urls.publicBackend
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null) {
    this.authToken = token
  }

  /**
   * Get authentication token from localStorage
   */
  private getStoredAuthToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('aeon_auth_token')
  }

  /**
   * Store authentication token in localStorage
   */
  private storeAuthToken(token: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem('aeon_auth_token', token)
  }

  /**
   * Remove authentication token from localStorage
   */
  private removeAuthToken() {
    if (typeof window === 'undefined') return
    localStorage.removeItem('aeon_auth_token')
  }

  /**
   * Make HTTP request with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`
    
    // Get auth token
    const token = this.authToken || this.getStoredAuthToken()
    
    // Prepare headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('application/json')) {
        if (!response.ok) {
          throw new ApiError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          )
        }
        return response.text() as unknown as T
      }

      const data = await response.json()

      // Handle HTTP errors
      if (!response.ok) {
        throw new ApiError(
          data.message || data.error || `HTTP ${response.status}`,
          response.status,
          data.code,
          data.details
        )
      }

      return data
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiError('Network error - please check your connection', 0)
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Unknown error',
        0
      )
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  // === Authentication Methods ===

  /**
   * Send magic link to email
   */
  async sendMagicLink(email: string): Promise<AuthResponse> {
    return this.post<AuthResponse>('/auth/magic-link', {
      email,
      action: 'send_magic_link',
    })
  }

  /**
   * Verify magic link token
   */
  async verifyMagicLink(email: string, token: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/verify', {
      email,
      token,
      action: 'verify_token',
    })

    // Store auth token if successful
    if (response.success && response.auth_token) {
      this.storeAuthToken(response.auth_token)
      this.setAuthToken(response.auth_token)
    }

    return response
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const token = this.authToken || this.getStoredAuthToken()
    if (token) {
      try {
        await this.post('/auth/logout', { auth_token: token })
      } catch (error) {
        // Ignore logout errors
        console.warn('Logout error:', error)
      }
    }
    
    this.removeAuthToken()
    this.setAuthToken(null)
  }

  // === Video Generation Methods ===

  /**
   * Generate video
   */
  async generateVideo(data: {
    email: string
    prompt: string
    duration: number
    title?: string
  }): Promise<VideoGenerationResponse> {
    return this.post<VideoGenerationResponse>('/generate', data)
  }

  /**
   * Get video status
   */
  async getVideoStatus(videoId: string): Promise<VideoStatusResponse> {
    return this.get<VideoStatusResponse>(`/status/${videoId}`)
  }

  /**
   * Get queue status
   */
  async getQueueStatus(): Promise<any> {
    return this.get('/queue')
  }

  // === Dashboard Methods ===

  /**
   * Get user dashboard data
   */
  async getUserDashboard(userId: string): Promise<DashboardResponse> {
    return this.get<DashboardResponse>(`/dashboard/user/${userId}`)
  }

  /**
   * Get admin dashboard data
   */
  async getAdminDashboard(): Promise<DashboardResponse> {
    return this.get<DashboardResponse>('/dashboard/admin')
  }

  // === Payment Methods ===

  /**
   * Create checkout session
   */
  async createCheckoutSession(data: {
    email: string
    product_type: string
    amount: number
    credits?: number
    video_prompt?: string
    video_duration?: number
  }): Promise<any> {
    return this.post('/payments/create-checkout', data)
  }

  // === Health Check ===

  /**
   * Check API health
   */
  async healthCheck(): Promise<{ status: string; agents: number; timestamp: string }> {
    return this.get('/health')
  }
}

// Create singleton API client
export const api = new ApiClient()

// Utility functions for error handling
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  
  if (error instanceof Error) {
    return error.message
  }
  
  return 'An unexpected error occurred'
}

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof ApiError && error.status === 0
}

export const isAuthError = (error: unknown): boolean => {
  return error instanceof ApiError && error.status === 401
}

export const isRateLimitError = (error: unknown): boolean => {
  return error instanceof ApiError && error.status === 429
}

// React hook for API calls (optional)
export const useApi = () => {
  return {
    api,
    handleApiError,
    isNetworkError,
    isAuthError,
    isRateLimitError,
  }
}

// Retry utility for failed requests
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: unknown

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      lastError = error
      
      // Don't retry auth errors or client errors
      if (error instanceof ApiError && error.status >= 400 && error.status < 500) {
        throw error
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }

  throw lastError
}

// Batch API calls utility
export const batchApiCalls = async <T>(
  calls: (() => Promise<T>)[],
  concurrency: number = 3
): Promise<(T | Error)[]> => {
  const results: (T | Error)[] = []
  
  for (let i = 0; i < calls.length; i += concurrency) {
    const batch = calls.slice(i, i + concurrency)
    const batchResults = await Promise.allSettled(
      batch.map(call => call())
    )
    
    batchResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value)
      } else {
        results.push(result.reason)
      }
    })
  }
  
  return results
}
