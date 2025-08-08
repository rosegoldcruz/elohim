"""
Assistant API - Live AI Agent Assist
"""
from __future__ import annotations

import os
import logging
from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from utils.auth import verify_clerk_jwt
from services.replicate_client import ReplicateClient

logger = logging.getLogger(__name__)
router = APIRouter()


class AssistantRequest(BaseModel):
  message: str
  timeline: Dict[str, Any] | None = None

class AssistantResponse(BaseModel):
  reply: str
  operations: List[Dict[str, Any]]


@router.post('/assistant/chat', response_model=AssistantResponse)
async def assistant_chat(payload: AssistantRequest, current_user: Dict[str, Any] = Depends(verify_clerk_jwt)):
  message = (payload.message or '').strip()
  if not message:
    raise HTTPException(status_code=400, detail='message required')

  ops: List[Dict[str, Any]] = []
  reply = ''

  version = os.getenv('REPLICATE_LLM_VERSION')
  if version:
    try:
      client = ReplicateClient()
      prompt = (
        "You are an expert video editor agent. Given a user request and the timeline JSON, "
        "propose concrete timeline operations in JSON array form (operations), and a brief reply.\n"
        f"User: {message}\n"
        f"Timeline: {payload.timeline or {}}\n"
        "Operations schema examples: \n"
        "{type:'add_transition', between:'video-main', style:'slide'};\n"
        "{type:'add_caption', text:'...', start:sec, duration:sec, track:'text-captions'};\n"
        "{type:'speed', clipIndex:0, factor:1.2};\n"
        "{type:'add_sfx', name:'whoosh', start:sec};\n"
        "Return JSON with keys reply and operations."
      )
      res = client.run(version=version, inputs={'prompt': prompt})
      content = res.get('output')
      if isinstance(content, list):
        content = ''.join(str(x) for x in content)
      import json
      parsed = None
      try:
        parsed = json.loads(content)
      except Exception:
        # try to extract JSON substring
        import re
        m = re.search(r'\{[\s\S]*\}', content)
        if m:
          try:
            parsed = json.loads(m.group(0))
          except Exception:
            parsed = None
      if isinstance(parsed, dict):
        reply = parsed.get('reply', '') or 'Applied suggestions.'
        ops = parsed.get('operations', []) or []
      else:
        reply = 'Here are recommended edits.'
        ops = [{ 'type':'add_transition', 'between':'video-main', 'style':'slide'}]
    except Exception as e:
      logger.warning(f'Assistant LLM failed: {e}')

  if not reply:
    # deterministic simple suggestions
    reply = 'Speed up the opening scene and add a slide transition.'
    ops = [
      { 'type':'speed', 'clipIndex': 0, 'factor': 1.2 },
      { 'type':'add_transition', 'between':'video-main', 'style':'slide' }
    ]

  return AssistantResponse(reply=reply, operations=ops)