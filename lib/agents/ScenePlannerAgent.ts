// /lib/agents/ScenePlannerAgent.ts

import type { CinematicScript } from './ScriptWriterAgent';

const NARRATIVE_ORDER = [
  "Hook", "World Setup", "Conflict", "Escalation", "Climax", "Resolution", "CTA"
];

export function validateScriptStructure(scriptObj: any): boolean {
  if (!scriptObj || typeof scriptObj.narration !== "string" || !Array.isArray(scriptObj.scenes)) return false;
  if (scriptObj.scenes.length < 8) return false;

  let hasEscalation = false;
  let prevNum = 0;

  for (let i = 0; i < scriptObj.scenes.length; i++) {
    const s = scriptObj.scenes[i];
    if (
      typeof s.scene_number !== "number" ||
      typeof s.function !== "string" ||
      typeof s.timestamp !== "string" ||
      typeof s.visual !== "string" ||
      typeof s.audio !== "string" ||
      typeof s.overlay !== "string" ||
      typeof s.transition !== "string" ||
      typeof s.text_on_screen !== "string"
    ) return false;
    if (s.scene_number !== i + 1) return false; // Must be sequential

    if (s.function.toLowerCase().includes("escalation")) hasEscalation = true;
    prevNum = s.scene_number;
  }

  // Must contain at least one Escalation, Climax, and Resolution/CTA
  const fnList = scriptObj.scenes.map(s => s.function.toLowerCase());
  if (
    !fnList.some(f => f.includes("hook")) ||
    !fnList.some(f => f.includes("climax")) ||
    !fnList.some(f => f.includes("resolution") || f.includes("cta"))
  ) return false;
  return true;
}