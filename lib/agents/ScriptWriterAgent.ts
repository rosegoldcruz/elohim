// /lib/agents/ScriptWriterAgent.ts

import { OpenAI } from 'openai'; // or your preferred LLM client
import { validateScriptStructure } from './ScenePlannerAgent';

const CINEMATIC_PROMPT = `
You are the AEON Scriptwriter Agent for TikTok-optimized, cinematic, chronological videos.

TASK: Write a 1-minute video script and a detailed scene list for the following topic:
[TARGET TOPIC AND STYLE INJECTED HERE]

Output only JSON with this exact format:
{
  "narration": "<60-second narration, with hooks in first and last line. Chronological, no filler.>",
  "scenes": [
    {
      "scene_number": 1,
      "function": "Hook",
      "timestamp": "0-4s",
      "visual": "Describe first visual/camera/angle/movement",
      "audio": "Relevant background/foley/transition audio",
      "overlay": "TikTok text/font/emoji overlays",
      "transition": "First-frame freeze, pop, or viral effect",
      "text_on_screen": "Short, bold, TikTok-native text"
    },
    {
      "scene_number": 2,
      "function": "World Setup",
      "timestamp": "4-8s",
      "visual": "...",
      "audio": "...",
      "overlay": "...",
      "transition": "...",
      "text_on_screen": "..."
    }
    // continue up to scene 10–12 (ending with Resolution/CTA)
  ]
}

Rules:
- Scenes MUST be in correct narrative order: Hook → Setup → Conflict → Escalation → Climax → Resolution → CTA.
- Each scene MUST have all schema fields and escalate the story.
- No summaries, no bullet lists, no non-JSON output. If you can't follow, throw an error and retry.
`;

export interface CinematicScene {
  scene_number: number;
  function: string;
  timestamp: string;
  visual: string;
  audio: string;
  overlay: string;
  transition: string;
  text_on_screen: string;
}

export interface CinematicScript {
  narration: string;
  scenes: CinematicScene[];
}

export async function generateCinematicScript(topic: string, style: string): Promise<CinematicScript> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "" });
  const prompt = CINEMATIC_PROMPT.replace('[TARGET TOPIC AND STYLE INJECTED HERE]', `${topic} in the style of ${style}`);
  let tries = 0;
  let script: CinematicScript | null = null;
  let lastErr: any = null;

  while (tries < 3 && !script) {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: 'You are a disciplined cinematic script generator for TikTok and AEON.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1200,
        temperature: 0.7
      });

      // Find the first valid JSON in the response
      const raw = response.choices[0].message.content || "";
      const match = raw.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON block found in LLM output.");
      script = JSON.parse(match[0]);

      // Validate schema before returning
      if (!validateScriptStructure(script)) {
        throw new Error("Output does not match required cinematic schema.");
      }
      return script;

    } catch (err) {
      tries += 1;
      lastErr = err;
      if (tries >= 3) throw new Error(`ScriptWriterAgent failed after 3 attempts: ${err}`);
    }
  }
  throw lastErr || new Error("Unknown failure in ScriptWriterAgent.");
}