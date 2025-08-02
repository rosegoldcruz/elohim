"""
Video Generation API Routes
Handles single video generation requests with Replicate API
"""

import os
import logging
import httpx
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from utils.auth import verify_clerk_jwt, get_user_id_from_token
from utils.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Rate limiter instance
limiter = Limiter(key_func=get_remote_address)

class VideoGenerationRequest(BaseModel):
    """Request model for video generation with input validation"""
    prompt: str
    style: str = "tiktok"
    duration: int = 30
    width: int = 576
    height: int = 1024
    model: str = "kling"

    @validator("prompt")
    def check_prompt(cls, v):
        """Sanitize and validate prompt input"""
        if not v or not v.strip():
            raise ValueError("Prompt cannot be empty")
        
        if len(v) > 1000 or any(x in v for x in ['<', '>', 'script']):
            raise ValueError("Invalid prompt content")
        
        return v.strip()

    @validator("style")
    def validate_style(cls, v):
        """Validate style parameter"""
        allowed_styles = ["tiktok", "youtube", "instagram", "professional", "cinematic", "viral"]
        if v.lower() not in allowed_styles:
            raise ValueError(f"Invalid style. Must be one of: {', '.join(allowed_styles)}")
        return v.lower()

    @validator("duration")
    def validate_duration(cls, v):
        """Validate duration parameter"""
        if v < 1 or v > 60:
            raise ValueError("Duration must be between 1 and 60 seconds")
        return v

    @validator("width", "height")
    def validate_dimensions(cls, v):
        """Validate width and height parameters"""
        if v < 64 or v > 1920:
            raise ValueError("Dimensions must be between 64 and 1920 pixels")
        return v

class VideoGenerationResponse(BaseModel):
    """Response model for video generation"""
    prediction_id: str
    status: str
    message: str
    video_url: Optional[str] = None

@router.post("/", response_model=VideoGenerationResponse)
@limiter.limit("5/minute")  # ✅ Per-IP rate limit
async def generate_video(
    request: Request,
    video_request: VideoGenerationRequest,
    auth_header: str = Depends(lambda x: x.headers.get("Authorization")),
    current_user: dict = Depends(verify_clerk_jwt)
):
    """Generate a single video using Replicate API with rate limiting"""
    
    settings = get_settings()
    replicate_token = settings.replicate_api_token
    
    if not replicate_token:
        logger.error("Replicate API token not configured")
        raise HTTPException(status_code=500, detail="Replicate API not configured")
    
    user_id = current_user.get("user_id")
    logger.info(f"Video generation request from user {user_id}: {video_request.prompt[:50]}...")  # Truncate log
    
    # Model mapping for different styles
    model_mapping = {
        "tiktok": "kwaivgi/kling-v1.6-standard",
        "youtube": "kwaivgi/kling-v1.6-standard", 
        "instagram": "kwaivgi/kling-v1.6-standard",
        "professional": "kwaivgi/kling-v1.6-standard",
        "cinematic": "kwaivgi/kling-v1.6-standard",
        "viral": "kwaivgi/kling-v1.6-standard"
    }
    
    # Dimension mapping
    dimensions = {
        "tiktok": {"width": 576, "height": 1024},
        "youtube": {"width": 1920, "height": 1080},
        "instagram": {"width": 1080, "height": 1080},
        "professional": {"width": 1920, "height": 1080},
        "cinematic": {"width": 1920, "height": 1080},
        "viral": {"width": 576, "height": 1024}
    }
    
    model_id = model_mapping.get(video_request.style.lower(), "kwaivgi/kling-v1.6-standard")
    dims = dimensions.get(video_request.style.lower(), {"width": video_request.width, "height": video_request.height})
    
    endpoint = "https://api.replicate.com/v1/predictions"
    headers = {
        "Authorization": f"Token {replicate_token}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "version": model_id,
        "input": {
            "prompt": f"{video_request.prompt}, style: {video_request.style}, duration: {video_request.duration}s",
            "width": dims["width"],
            "height": dims["height"],
            "duration": min(video_request.duration, 60)
        }
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(endpoint, headers=headers, json=payload)
            
        if response.status_code != 201:
            logger.error(f"Replicate API error: {response.status_code}")
            raise HTTPException(status_code=500, detail="Failed to start video generation")
        
        prediction_data = response.json()
        prediction_id = prediction_data.get("id")
        
        if not prediction_id:
            logger.error("No prediction ID returned from Replicate")
            raise HTTPException(status_code=500, detail="Invalid response from video generation service")
        
        return VideoGenerationResponse(
            prediction_id=prediction_id,
            status="processing",
            message="Video generation started successfully",
            video_url=None
        )
        
    except httpx.TimeoutException:
        logger.error("Replicate API timeout")
        raise HTTPException(status_code=504, detail="Video generation service timeout")
    except httpx.RequestError as e:
        logger.error(f"Replicate API request error: {e}")
        raise HTTPException(status_code=503, detail="Video generation service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error in video generation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/status/{prediction_id}")
@limiter.limit("30/minute")  # Higher limit for status checks
async def get_generation_status(
    request: Request,
    prediction_id: str,
    current_user: dict = Depends(verify_clerk_jwt)
):
    """Get status of video generation with rate limiting"""
    
    # Validate prediction_id format
    if not prediction_id or len(prediction_id) < 10:
        raise HTTPException(status_code=400, detail="Invalid prediction ID")
    
    settings = get_settings()
    replicate_token = settings.replicate_api_token
    
    if not replicate_token:
        raise HTTPException(status_code=500, detail="Replicate API not configured")
    
    endpoint = f"https://api.replicate.com/v1/predictions/{prediction_id}"
    headers = {"Authorization": f"Token {replicate_token}"}
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(endpoint, headers=headers)
        
        if response.status_code == 404:
            raise HTTPException(status_code=404, detail="Prediction not found")
        
        if response.status_code != 200:
            logger.error(f"Replicate API error: {response.status_code}")
            raise HTTPException(status_code=500, detail="Failed to get generation status")
        
        data = response.json()
        status = data.get("status", "unknown")
        output = data.get("output")
        
        return {
            "prediction_id": prediction_id,
            "status": status,
            "output": output,
            "created_at": data.get("created_at"),
            "logs": data.get("logs", [])
        }
        
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Status check timeout")
    except httpx.RequestError:
        raise HTTPException(status_code=503, detail="Status service unavailable")
    except Exception as e:
        logger.error(f"Error checking generation status: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/models")
async def get_available_models():
    """Get available video generation models"""
    return {
        "models": {
            "kling": "kwaivgi/kling-v1.6-standard",
            "runway": "runway/stable-diffusion-v1-5",
            "pika": "pika-labs/pika",
            "stable": "stability-ai/stable-diffusion",
            "luma": "luma-ai/luma",
            "minimax": "minimax-ai/minimax"
        },
        "styles": ["tiktok", "youtube", "instagram", "professional", "cinematic", "viral"],
        "dimensions": {
            "tiktok": {"width": 576, "height": 1024},
            "youtube": {"width": 1920, "height": 1080},
            "instagram": {"width": 1080, "height": 1080},
            "professional": {"width": 1920, "height": 1080},
            "cinematic": {"width": 1920, "height": 1080},
            "viral": {"width": 576, "height": 1024}
        }
    } 