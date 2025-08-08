"""
Jobs API - Create and manage video generation jobs
"""
from __future__ import annotations

import os
import uuid
import asyncio
import logging
from typing import Optional, Literal
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel, field_validator

from utils.auth import verify_clerk_jwt
from utils.config import get_settings
from services.job_store import job_store
from agents.orchestrator import VideoJobOrchestrator

logger = logging.getLogger(__name__)
router = APIRouter()


class CreateJobRequest(BaseModel):
    text: str
    video_length: int  # seconds, e.g., 30, 60, 90, 120
    scene_duration: int  # seconds, e.g., 5, 10
    style: Literal["tiktok", "cinematic", "tutorial", "comedy", "lifestyle"] | None = "tiktok"
    model_preset: Optional[str] = None  # ignored in local mode

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        v = (v or "").strip()
        if not v:
            raise ValueError("text is required")
        if len(v) > 8000:
            raise ValueError("text too long (max 8000 chars)")
        dangerous = ["<", ">", "script", "javascript:"]
        if any(x in v.lower() for x in dangerous):
            raise ValueError("invalid characters in text")
        return v

    @field_validator("video_length")
    @classmethod
    def validate_video_length(cls, v: int) -> int:
        if v not in [30, 60, 90, 120]:
            raise ValueError("video_length must be one of 30, 60, 90, 120")
        return v

    @field_validator("scene_duration")
    @classmethod
    def validate_scene_duration(cls, v: int) -> int:
        if v not in [5, 10]:
            raise ValueError("scene_duration must be 5 or 10 seconds")
        return v


class CreateJobResponse(BaseModel):
    job_id: str
    status: str
    scene_count: int


@router.post("/jobs", response_model=CreateJobResponse)
async def create_job(payload: CreateJobRequest, current_user: dict = Depends(verify_clerk_jwt)):
    settings = get_settings()
    user_id = current_user.get("user_id")

    scene_count = payload.video_length // payload.scene_duration
    job_id = uuid.uuid4().hex[:12]

    # record job
    await job_store.create_job(
        job_id=job_id,
        user_id=user_id,
        meta={
            "text": payload.text,
            "video_length": payload.video_length,
            "scene_duration": payload.scene_duration,
            "scene_count": scene_count,
            "style": payload.style,
            "model_preset": payload.model_preset,
        },
    )

    # fire-and-forget orchestrator
    orchestrator = VideoJobOrchestrator(settings)
    asyncio.create_task(orchestrator.run(job_id))

    return CreateJobResponse(job_id=job_id, status="queued", scene_count=scene_count)


@router.get("/status/{job_id}")
async def get_status(job_id: str, current_user: dict = Depends(verify_clerk_jwt)):
    rec = await job_store.get_job(job_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Job not found")
    if rec.user_id != current_user.get("user_id"):
        raise HTTPException(status_code=403, detail="Access denied")
    return {
        "job_id": rec.job_id,
        "status": rec.status,
        "progress": rec.progress,
        "created_at": rec.created_at,
        "updated_at": rec.updated_at,
        "video_url": rec.video_url,
        "error": rec.error,
        "meta": rec.meta,
    }


@router.get("/download/{job_id}")
async def download(job_id: str, current_user: dict = Depends(verify_clerk_jwt)):
    rec = await job_store.get_job(job_id)
    if not rec:
        raise HTTPException(status_code=404, detail="Job not found")
    if rec.user_id != current_user.get("user_id"):
        raise HTTPException(status_code=403, detail="Access denied")
    if rec.status != "completed" or not rec.video_url:
        raise HTTPException(status_code=400, detail="Job not completed")

    # Support returning a local file
    file_path = rec.video_url
    if not os.path.isabs(file_path):
        file_path = os.path.abspath(file_path)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    filename = os.path.basename(file_path)
    return FileResponse(path=file_path, filename=filename, media_type="video/mp4")