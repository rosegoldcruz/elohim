import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import Replicate from 'replicate'
import { env } from '@/env.mjs'

// OpenAI Configuration
export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

// Claude/Anthropic Configuration
export const claude = new Anthropic({
  apiKey: env.CLAUDE_API_KEY,
})

// Replicate Configuration
export const replicate = new Replicate({
  auth: env.REPLICATE_API_TOKEN,
})

// ElevenLabs Configuration
export class ElevenLabsClient {
  private apiKey: string
  private baseUrl = 'https://api.elevenlabs.io/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateSpeech(text: string, voiceId: string = 'pNInz6obpgDQGcFmaJgB') {
    const response = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': this.apiKey,
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    return response.arrayBuffer()
  }

  async getVoices() {
    const response = await fetch(`${this.baseUrl}/voices`, {
      headers: {
        'xi-api-key': this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.statusText}`)
    }

    return response.json()
  }
}

export const elevenlabs = new ElevenLabsClient(env.ELEVENLABS_API_KEY)

// AI Model Configurations for Video Generation
export const VIDEO_MODELS = {
  RUNWAY: 'runway-ml/runway-gen3-alpha',
  PIKA: 'pika-labs/pika-1.0',
  STABLE_VIDEO: 'stability-ai/stable-video-diffusion',
  LUMA: 'lumalabs/dream-machine',
  MINIMAX: 'minimax/video-01',
  KLING: 'kling-ai/kling-1.0',
} as const

export type VideoModel = keyof typeof VIDEO_MODELS

// Helper function to generate video with fallback models
export async function generateVideoWithFallback(
  prompt: string,
  model: VideoModel = 'RUNWAY',
  options: any = {}
) {
  const modelOrder: VideoModel[] = ['RUNWAY', 'PIKA', 'STABLE_VIDEO', 'LUMA', 'MINIMAX', 'KLING']
  const startIndex = modelOrder.indexOf(model)
  const orderedModels = [...modelOrder.slice(startIndex), ...modelOrder.slice(0, startIndex)]

  for (const currentModel of orderedModels) {
    try {
      console.log(`🎬 Attempting video generation with ${currentModel}...`)
      
      const output = await replicate.run(VIDEO_MODELS[currentModel], {
        input: {
          prompt,
          ...options,
        },
      })

      console.log(`✅ Video generated successfully with ${currentModel}`)
      return {
        success: true,
        model: currentModel,
        output,
      }
    } catch (error) {
      console.error(`❌ ${currentModel} failed:`, error)
      
      // If this is the last model, throw the error
      if (currentModel === orderedModels[orderedModels.length - 1]) {
        throw new Error(`All video models failed. Last error: ${error}`)
      }
      
      // Continue to next model
      continue
    }
  }

  throw new Error('All video generation models failed')
}

// Helper function to generate script with AI
export async function generateScript(prompt: string, useOpenAI: boolean = true) {
  try {
    if (useOpenAI) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: 'You are a professional video script writer. Create engaging, cinematic scripts for AI video generation.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      })

      return completion.choices[0]?.message?.content || ''
    } else {
      const message = await claude.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `You are a professional video script writer. Create an engaging, cinematic script for AI video generation based on this prompt: ${prompt}`,
          },
        ],
      })

      return message.content[0]?.type === 'text' ? message.content[0].text : ''
    }
  } catch (error) {
    console.error('Script generation failed:', error)
    throw error
  }
}

// Helper function to generate audio narration
export async function generateNarration(text: string, voiceId?: string) {
  try {
    const audioBuffer = await elevenlabs.generateSpeech(text, voiceId)
    return audioBuffer
  } catch (error) {
    console.error('Narration generation failed:', error)
    throw error
  }
}
