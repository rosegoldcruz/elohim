import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import { ScriptWriterRequest, ScriptWriterResponse, TONES, PACING, CTA_TYPES } from '../../../types/aeon'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScriptWriterResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { topic }: ScriptWriterRequest = req.body

    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required and must be a non-empty string' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' })
    }

    const prompt = `Create a viral TikTok script about "${topic}". 

Structure it with:
1. HOOK (3-5 seconds): Attention-grabbing opener that makes people stop scrolling
2. BODY (8-12 seconds): Main content with valuable information or entertainment  
3. CTA (2-3 seconds): Clear call-to-action that encourages engagement

Requirements:
- Total length: 13-20 seconds when spoken
- Use conversational, energetic tone
- Include pattern interrupts and curiosity gaps
- Make it shareable and memorable
- Focus on one clear message

Available tones: ${TONES.join(', ')}
Available pacing: ${PACING.join(', ')}
Available CTA types: ${CTA_TYPES.join(', ')}

Format your response as JSON with this exact structure:
{
  "script": "full script text",
  "breakdown": {
    "hook": "hook text only",
    "body": "body text only", 
    "cta": "cta text only"
  },
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "tone": "one of the available tones",
  "pacing": "one of the available pacing options",
  "cta_type": "one of the available CTA types"
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a viral content creator who specializes in TikTok scripts. You understand what makes content go viral and how to structure scripts for maximum engagement. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 1200,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let parsedResponse: ScriptWriterResponse
    try {
      parsedResponse = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText)
      throw new Error('Invalid response format from OpenAI')
    }

    // Validate the response structure
    if (!parsedResponse.script || !parsedResponse.breakdown || !parsedResponse.hashtags) {
      throw new Error('Incomplete response from OpenAI')
    }

    if (!parsedResponse.breakdown.hook || !parsedResponse.breakdown.body || !parsedResponse.breakdown.cta) {
      throw new Error('Incomplete breakdown in response')
    }

    // Validate enum values
    if (!TONES.includes(parsedResponse.tone as any)) {
      parsedResponse.tone = 'energetic' // Default fallback
    }

    if (!PACING.includes(parsedResponse.pacing as any)) {
      parsedResponse.pacing = 'fast' // Default fallback
    }

    if (!CTA_TYPES.includes(parsedResponse.cta_type as any)) {
      parsedResponse.cta_type = 'follow' // Default fallback
    }

    console.log(`Script writer: Generated script for topic "${topic}"`)

    return res.status(200).json(parsedResponse)

  } catch (error) {
    console.error('Script writer error:', error)
    
    if (error instanceof Error) {
      return res.status(500).json({ error: `Script generation failed: ${error.message}` })
    }
    
    return res.status(500).json({ error: 'Script generation failed due to an unknown error' })
  }
}

export const config = {
  api: {
    responseLimit: '2mb',
  },
}
