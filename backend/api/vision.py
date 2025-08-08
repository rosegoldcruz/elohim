"""
Vision API - Avatars and Upscaling
"""
from __future__ import annotations

import os
import tempfile
import logging
from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel

from utils.auth import verify_clerk_jwt
from services.replicate_client import ReplicateClient
from app.utils import download_file

logger = logging.getLogger(__name__)
router = APIRouter()


class TalkingHeadRequest(BaseModel):
    image_url: str
    audio_url: str
    style: str | None = None


@router.post('/vision/talking-head')
async def talking_head(req: TalkingHeadRequest, current_user: Dict[str, Any] = Depends(verify_clerk_jwt)):
    try:
        client = ReplicateClient()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replicate not configured: {e}")

    version = os.getenv('REPLICATE_TALKING_HEAD_VERSION', '')
    if not version:
        raise HTTPException(status_code=500, detail='Talking head model not configured (REPLICATE_TALKING_HEAD_VERSION)')

    inputs = {
        'image': req.image_url,
        'audio': req.audio_url,
    }
    if req.style:
        inputs['style'] = req.style

    result = client.run(version=version, inputs=inputs)
    if result.get('status') != 'succeeded':
        raise HTTPException(status_code=500, detail=f"Talking head failed: {result.get('error')}")

    output = result.get('output')
    url = output[0] if isinstance(output, list) and output else (output if isinstance(output, str) else None)
    if not url:
        raise HTTPException(status_code=500, detail='No video output')

    with tempfile.TemporaryDirectory() as tmp:
        local = os.path.abspath(os.path.join(tmp, 'avatar.mp4'))
        if not download_file(url, local):
            raise HTTPException(status_code=500, detail='Failed to download talking head video')
        final = os.path.abspath(os.path.join(os.getcwd(), f"avatar_{current_user.get('user_id')}.mp4"))
        os.replace(local, final)
        return { 'path': final }


@router.post('/vision/upscale')
async def upscale(file: UploadFile = File(...), scale: int = 2, current_user: Dict[str, Any] = Depends(verify_clerk_jwt)):
    try:
        client = ReplicateClient()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replicate not configured: {e}")

    version = os.getenv('REPLICATE_UPSCALE_VERSION', '')
    if not version:
        raise HTTPException(status_code=500, detail='Upscale model not configured (REPLICATE_UPSCALE_VERSION)')

    # Save upload to temp
    with tempfile.TemporaryDirectory() as tmp:
        temp_path = os.path.join(tmp, file.filename)
        content = await file.read()
        with open(temp_path, 'wb') as f:
            f.write(content)

        # In production, you would upload temp_path to a presigned URL and pass that URL; for now assume direct file path supported
        inputs = {
            'image': open(temp_path, 'rb'),
            'scale': max(2, min(scale, 4)),
        }

        # Some replicate models accept file streams; others require URLs. Adjust per model in env.
        result = client.run(version=version, inputs=inputs)

    if result.get('status') != 'succeeded':
        raise HTTPException(status_code=500, detail=f"Upscale failed: {result.get('error')}")

    output = result.get('output')
    url = output[0] if isinstance(output, list) and output else (output if isinstance(output, str) else None)
    if not url:
        raise HTTPException(status_code=500, detail='No upscale output')

    with tempfile.TemporaryDirectory() as tmp2:
        local = os.path.abspath(os.path.join(tmp2, 'upscaled.png'))
        if not download_file(url, local):
            raise HTTPException(status_code=500, detail='Failed to download upscaled image')
        final = os.path.abspath(os.path.join(os.getcwd(), f"upscaled_{current_user.get('user_id')}_{file.filename}.png"))
        os.replace(local, final)
        return { 'path': final }