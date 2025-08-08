"""
Audio API - TTS and Music Generation
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


class TTSRequest(BaseModel):
    text: str
    voice: str | None = None
    language: str | None = "en"


@router.post('/audio/tts')
async def tts(payload: TTSRequest, current_user: Dict[str, Any] = Depends(verify_clerk_jwt)):
    try:
        client = ReplicateClient()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replicate not configured: {e}")

    version = os.getenv('REPLICATE_TTS_VERSION', '')
    if not version:
        raise HTTPException(status_code=500, detail='TTS model not configured (REPLICATE_TTS_VERSION)')

    inputs = {
        'text': payload.text,
        'voice': payload.voice or 'female_en_1',
        'language': payload.language or 'en'
    }
    result = client.run(version=version, inputs=inputs)
    if result.get('status') != 'succeeded':
        raise HTTPException(status_code=500, detail=f"TTS failed: {result.get('error')}")

    output = result.get('output')
    if isinstance(output, list) and output:
        url = output[0]
    elif isinstance(output, str):
        url = output
    else:
        raise HTTPException(status_code=500, detail='No TTS output')

    with tempfile.TemporaryDirectory() as tmp:
        local = os.path.abspath(os.path.join(tmp, 'tts.wav'))
        if not download_file(url, local):
            raise HTTPException(status_code=500, detail='Failed to download TTS output')
        final = os.path.abspath(os.path.join(os.getcwd(), f"tts_{current_user.get('user_id')}_{os.path.basename(local)}"))
        os.replace(local, final)
        return { 'path': final }


class MusicRequest(BaseModel):
    prompt: str
    duration: int | None = 15


@router.post('/audio/music')
async def music(payload: MusicRequest, current_user: Dict[str, Any] = Depends(verify_clerk_jwt)):
    try:
        client = ReplicateClient()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replicate not configured: {e}")

    version = os.getenv('REPLICATE_MUSIC_VERSION', '')
    if not version:
        raise HTTPException(status_code=500, detail='Music model not configured (REPLICATE_MUSIC_VERSION)')

    inputs = {
        'prompt': payload.prompt,
        'duration': min(max(payload.duration or 15, 5), 60)
    }
    result = client.run(version=version, inputs=inputs)
    if result.get('status') != 'succeeded':
        raise HTTPException(status_code=500, detail=f"Music generation failed: {result.get('error')}")

    output = result.get('output')
    url = output[0] if isinstance(output, list) and output else (output if isinstance(output, str) else None)
    if not url:
        raise HTTPException(status_code=500, detail='No music output')

    with tempfile.TemporaryDirectory() as tmp:
        local = os.path.abspath(os.path.join(tmp, 'music.wav'))
        if not download_file(url, local):
            raise HTTPException(status_code=500, detail='Failed to download music output')
        final = os.path.abspath(os.path.join(os.getcwd(), f"music_{current_user.get('user_id')}_{os.path.basename(local)}"))
        os.replace(local, final)
        return { 'path': final }


class STTResponse(BaseModel):
    text: str


@router.post('/audio/stt')
async def stt(file: UploadFile = File(...), current_user: Dict[str, Any] = Depends(verify_clerk_jwt)) -> STTResponse:
    try:
        client = ReplicateClient()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Replicate not configured: {e}")

    version = os.getenv('REPLICATE_STT_VERSION', '')
    if not version:
        raise HTTPException(status_code=500, detail='STT model not configured (REPLICATE_STT_VERSION)')

    import tempfile
    with tempfile.TemporaryDirectory() as tmp:
        temp_path = os.path.join(tmp, file.filename or 'audio.wav')
        content = await file.read()
        with open(temp_path, 'wb') as f:
            f.write(content)
        # Some models require URL; for simplicity, assume local file streams allowed
        result = client.run(version=version, inputs={'audio': open(temp_path, 'rb')})

    output = result.get('output')
    if isinstance(output, str):
        text = output
    elif isinstance(output, dict) and 'text' in output:
        text = output['text']
    else:
        raise HTTPException(status_code=500, detail='No STT output')

    return STTResponse(text=text)