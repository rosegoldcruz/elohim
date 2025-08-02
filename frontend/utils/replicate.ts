export interface ReplicateVideoRequest {
  prompt: string
  style: string
  duration: number
  user_id?: string
}

export interface ReplicateVideoResponse {
  id: string
  status: string
  output?: string
  error?: string
}

export class ReplicateAPI {
  private apiToken: string
  private baseUrl = 'https://api.replicate.com/v1'

  constructor(apiToken: string) {
    this.apiToken = apiToken
  }

  async generateVideo(request: ReplicateVideoRequest): Promise<ReplicateVideoResponse> {
    try {
      // This is a placeholder for the actual Replicate model
      // You'll need to replace this with the correct model version ID
      const modelVersion = process.env.REPLICATE_MODEL_VERSION || "YOUR_MODEL_VERSION_ID"
      
      const response = await fetch(`${this.baseUrl}/predictions`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${this.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: modelVersion,
          input: {
            prompt: `${request.prompt}, style: ${request.style}, duration: ${request.duration}s`,
            // Add any other model-specific parameters here
          },
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Replicate API error: ${error}`)
      }

      const data = await response.json()
      
      return {
        id: data.id,
        status: data.status,
        output: data.output,
      }
    } catch (error) {
      console.error('Replicate API error:', error)
      throw error
    }
  }

  async getPrediction(predictionId: string): Promise<ReplicateVideoResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${this.apiToken}`,
        },
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Replicate API error: ${error}`)
      }

      const data = await response.json()
      
      return {
        id: data.id,
        status: data.status,
        output: data.output,
        error: data.error,
      }
    } catch (error) {
      console.error('Replicate API error:', error)
      throw error
    }
  }

  async pollPrediction(predictionId: string, maxAttempts = 60): Promise<ReplicateVideoResponse> {
    let attempts = 0
    
    while (attempts < maxAttempts) {
      const prediction = await this.getPrediction(predictionId)
      
      if (prediction.status === 'succeeded') {
        return prediction
      }
      
      if (prediction.status === 'failed') {
        throw new Error(`Video generation failed: ${prediction.error}`)
      }
      
      // Wait 2 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }
    
    throw new Error('Video generation timed out')
  }
}

// Helper function to create a Replicate API instance
export function createReplicateAPI(): ReplicateAPI {
  const apiToken = process.env.REPLICATE_API_TOKEN
  if (!apiToken) {
    throw new Error('REPLICATE_API_TOKEN environment variable is required')
  }
  return new ReplicateAPI(apiToken)
}

// Mock function for development/testing
export async function mockVideoGeneration(request: ReplicateVideoRequest): Promise<ReplicateVideoResponse> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 3000))
  
  return {
    id: `mock_${Date.now()}`,
    status: 'succeeded',
    output: 'https://example.com/mock-video.mp4',
  }
} 