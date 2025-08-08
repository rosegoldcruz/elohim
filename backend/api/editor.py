"""
Editor API - Accept timeline edits and trigger re-render jobs
"""
from __future__ import annotations

import uuid
import asyncio
import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from utils.auth import verify_clerk_jwt
from services.job_store import job_store
from agents.editor_orchestrator import EditorRenderOrchestrator

logger = logging.getLogger(__name__)
router = APIRouter()


class RenderTimelineRequest(BaseModel):
    timeline: Dict[str, Any]
    settings: Dict[str, Any] | None = None


class RenderTimelineResponse(BaseModel):
    job_id: str
    status: str


@router.post("/editor/render", response_model=RenderTimelineResponse)
async def render_timeline(payload: RenderTimelineRequest, current_user: dict = Depends(verify_clerk_jwt)):
    user_id = current_user.get("user_id")
    if not isinstance(payload.timeline, dict):
        raise HTTPException(status_code=400, detail="Invalid timeline")

    job_id = f"render_{uuid.uuid4().hex[:10]}"

    await job_store.create_job(job_id, user_id, meta={
        "mode": "editor_render",
        "timeline": payload.timeline,
        "settings": payload.settings or {},
    })

    orchestrator = EditorRenderOrchestrator()
    asyncio.create_task(orchestrator.run(job_id))

    return RenderTimelineResponse(job_id=job_id, status="queued")