import { NextApiRequest, NextApiResponse } from 'next'
import { v4 as uuidv4 } from 'uuid'
import OpenAI from 'openai'
import { 
  ScenePlannerRequest, 
  ScenePlannerResponse, 
  Scene,
  EMOTIONS, 
  VISUAL_STYLES, 
  CAMERA_MOTIONS 
} from '../../../types/aeon'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ScenePlannerResponse | { error: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { script }: ScenePlannerRequest = req.body

    if (!script || typeof script !== 'string' || script.trim().length === 0) {
      return res.status(400).json({ error: 'Script is required and must be a non-empty string' })
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' })
    }

    const prompt = `Break down this TikTok script into exactly 6 scenes for video generation:

"${script}"

Requirements:
- Each scene should be ~2-3 seconds of narration
- Distribute the script content evenly across 6 scenes
- Each scene needs appropriate emotion, visual style, and camera motion
- Timestamps should be: 0, 3, 6, 9, 12, 15 seconds

Available emotions: ${EMOTIONS.join(', ')}
Available visual styles: ${VISUAL_STYLES.join(', ')}
Available camera motions: ${CAMERA_MOTIONS.join(', ')}

Format as JSON array with this exact structure:
[
  {
    "narration": "text for this 2-3 second segment",
    "emotion": "one of the available emotions",
    "visual_style": "one of the available visual styles",
    "camera_motion": "one of the available camera motions"
  }
]

Make sure the narration flows naturally when combined and matches the original script's meaning and tone.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a video production expert who breaks down scripts into scenes for video generation. You understand pacing, visual storytelling, and how to match emotions, visual styles, and camera movements to content. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse the JSON response
    let rawScenes: Omit<Scene, 'id' | 'timestamp'>[]
    try {
      rawScenes = JSON.parse(responseText)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', responseText)
      throw new Error('Invalid response format from OpenAI')
    }

    // Validate and transform the response
    if (!Array.isArray(rawScenes) || rawScenes.length !== 6) {
      throw new Error('Response must contain exactly 6 scenes')
    }

    const scenes: Scene[] = rawScenes.map((scene, index) => {
      // Validate required fields
      if (!scene.narration || !scene.emotion || !scene.visual_style || !scene.camera_motion) {
        throw new Error(`Scene ${index + 1} is missing required fields`)
      }

      // Validate enum values with fallbacks
      let emotion = scene.emotion
      if (!EMOTIONS.includes(emotion as any)) {
        emotion = EMOTIONS[index % EMOTIONS.length] // Cycle through emotions as fallback
      }

      let visualStyle = scene.visual_style
      if (!VISUAL_STYLES.includes(visualStyle as any)) {
        visualStyle = VISUAL_STYLES[index % VISUAL_STYLES.length] // Cycle through styles as fallback
      }

      let cameraMotion = scene.camera_motion
      if (!CAMERA_MOTIONS.includes(cameraMotion as any)) {
        cameraMotion = CAMERA_MOTIONS[index % CAMERA_MOTIONS.length] // Cycle through motions as fallback
      }

      return {
        id: uuidv4(),
        timestamp: index * 3, // 0, 3, 6, 9, 12, 15
        narration: scene.narration.trim(),
        emotion: emotion,
        visual_style: visualStyle,
        camera_motion: cameraMotion
      }
    })

    console.log(`Scene planner: Generated ${scenes.length} scenes from script`)

    return res.status(200).json({ scenes })

  } catch (error) {
    console.error('Scene planner error:', error)
    
    if (error instanceof Error) {
      return res.status(500).json({ error: `Scene planning failed: ${error.message}` })
    }
    
    return res.status(500).json({ error: 'Scene planning failed due to an unknown error' })
  }
}

export const config = {
  api: {
    responseLimit: '2mb',
  },
}
