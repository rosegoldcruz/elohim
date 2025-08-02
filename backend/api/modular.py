"""
Modular Video Generation API Routes
Handles multi-scene video generation with parallel processing
"""

import os
import logging
import asyncio
import httpx
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from utils.auth import verify_clerk_jwt
from utils.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Rate limiter instance
limiter = Limiter(key_func=get_remote_address)

class SceneRequest(BaseModel):
    """Request model for a single scene with validation"""
    segment_id: str
    prompt_text: str
    duration: int = 5
    model: str = "kling"
    width: int = 576
    height: int = 1024

    @validator("segment_id")
    def validate_segment_id(cls, v):
        """Validate segment ID"""
        if not v or len(v) > 50:
            raise ValueError("Invalid segment ID")
        # Check for dangerous characters
        if any(char in v for char in ['<', '>', '"', "'", '`', '/', '\\']):
            raise ValueError("Invalid characters in segment ID")
        return v.strip()

    @validator("prompt_text")
    def check_prompt_text(cls, v):
        """Sanitize and validate prompt text"""
        if not v or not v.strip():
            raise ValueError("Prompt text cannot be empty")
        
        if len(v) > 1000 or any(x in v for x in ['<', '>', 'script']):
            raise ValueError("Invalid prompt content")
        
        return v.strip()

    @validator("duration")
    def validate_duration(cls, v):
        """Validate duration parameter"""
        if v < 1 or v > 60:
            raise ValueError("Duration must be between 1 and 60 seconds")
        return v

    @validator("model")
    def validate_model(cls, v):
        """Validate model parameter"""
        allowed_models = ["kling", "runway", "pika", "stable", "luma", "minimax"]
        if v.lower() not in allowed_models:
            raise ValueError(f"Invalid model. Must be one of: {', '.join(allowed_models)}")
        return v.lower()

    @validator("width", "height")
    def validate_dimensions(cls, v):
        """Validate width and height parameters"""
        if v < 64 or v > 1920:
            raise ValueError("Dimensions must be between 64 and 1920 pixels")
        return v

class ModularGenerationRequest(BaseModel):
    """Request model for modular video generation with validation"""
    scenes: List[SceneRequest]
    total_duration: Optional[int] = None
    style: str = "tiktok"

    @validator("scenes")
    def validate_scenes(cls, v):
        """Validate scenes list"""
        if not v or len(v) == 0:
            raise ValueError("At least one scene is required")
        
        if len(v) > 20:
            raise ValueError("Maximum 20 scenes allowed")
        
        # Check for duplicate segment IDs
        segment_ids = [scene.segment_id for scene in v]
        if len(segment_ids) != len(set(segment_ids)):
            raise ValueError("Duplicate segment IDs are not allowed")
        
        return v

    @validator("style")
    def validate_style(cls, v):
        """Validate style parameter"""
        allowed_styles = ["tiktok", "youtube", "instagram", "professional", "cinematic", "viral"]
        if v.lower() not in allowed_styles:
            raise ValueError(f"Invalid style. Must be one of: {', '.join(allowed_styles)}")
        return v.lower()

    @validator("total_duration")
    def validate_total_duration(cls, v):
        """Validate total duration if provided"""
        if v is not None and (v < 1 or v > 300):
            raise ValueError("Total duration must be between 1 and 300 seconds")
        return v

class SceneResult(BaseModel):
    """Result model for a single scene"""
    segment_id: str
    prediction_id: str
    status: str
    poll_url: str
    error: Optional[str] = None

class ModularGenerationResponse(BaseModel):
    """Response model for modular generation"""
    status: str
    total_scenes: int
    successful_launches: int
    failed_launches: int
    scenes: List[SceneResult]

@router.post("/", response_model=ModularGenerationResponse)
@limiter.limit("3/minute")  # Lower limit for modular generation (more complex)
async def start_modular_generation(
    request: Request,
    modular_request: ModularGenerationRequest,
    current_user: dict = Depends(verify_clerk_jwt)
):
    """Start modular video generation with multiple scenes and rate limiting"""
    
    settings = get_settings()
    replicate_token = settings.replicate_api_token
    
    if not replicate_token:
        logger.error("Replicate API token not configured")
        raise HTTPException(status_code=500, detail="Replicate API not configured")
    
    user_id = current_user.get("user_id")
    logger.info(f"Modular generation request from user {user_id}: {len(modular_request.scenes)} scenes")
    
    # Model mapping
    model_mapping = {
        "kling": "kwaivgi/kling-v1.6-standard",
        "runway": "runway/stable-diffusion-v1-5",
        "pika": "pika-labs/pika",
        "stable": "stability-ai/stable-diffusion",
        "luma": "luma-ai/luma",
        "minimax": "minimax-ai/minimax"
    }
    
    # Process scenes in parallel
    scene_results = []
    successful_launches = 0
    failed_launches = 0
    
    async def process_scene(scene: SceneRequest) -> SceneResult:
        """Process a single scene"""
        try:
            model_id = model_mapping.get(scene.model, "kwaivgi/kling-v1.6-standard")
            
            endpoint = "https://api.replicate.com/v1/predictions"
            headers = {
                "Authorization": f"Token {replicate_token}",
                "Content-Type": "application/json"
            }
            
            payload = {
                "version": model_id,
                "input": {
                    "prompt": f"{scene.prompt_text}, style: {modular_request.style}, duration: {scene.duration}s",
                    "width": scene.width,
                    "height": scene.height,
                    "duration": min(scene.duration, 60)
                }
            }
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(endpoint, headers=headers, json=payload)
            
            if response.status_code == 201:
                prediction_data = response.json()
                prediction_id = prediction_data.get("id")
                poll_url = prediction_data.get("urls", {}).get("get")
                
                return SceneResult(
                    segment_id=scene.segment_id,
                    prediction_id=prediction_id,
                    status="processing",
                    poll_url=poll_url,
                    error=None
                )
            else:
                logger.error(f"Failed to start scene {scene.segment_id}: {response.status_code}")
                return SceneResult(
                    segment_id=scene.segment_id,
                    prediction_id="",
                    status="failed",
                    poll_url="",
                    error=f"API error: {response.status_code}"
                )
                
        except Exception as e:
            logger.error(f"Error processing scene {scene.segment_id}: {e}")
            return SceneResult(
                segment_id=scene.segment_id,
                prediction_id="",
                status="failed",
                poll_url="",
                error=str(e)
            )
    
    # Process all scenes concurrently
    tasks = [process_scene(scene) for scene in modular_request.scenes]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Process results
    for result in results:
        if isinstance(result, SceneResult):
            scene_results.append(result)
            if result.status == "processing":
                successful_launches += 1
            else:
                failed_launches += 1
        else:
            # Handle exceptions
            failed_launches += 1
            scene_results.append(SceneResult(
                segment_id="unknown",
                prediction_id="",
                status="failed",
                poll_url="",
                error=str(result)
            ))
    
    return ModularGenerationResponse(
        status="processing" if successful_launches > 0 else "failed",
        total_scenes=len(modular_request.scenes),
        successful_launches=successful_launches,
        failed_launches=failed_launches,
        scenes=scene_results
    )

@router.post("/status")
@limiter.limit("30/minute")  # Higher limit for status checks
async def poll_modular_status(
    request: Request,
    poll_urls: List[str],
    current_user: dict = Depends(verify_clerk_jwt)
):
    """Poll status of multiple video generation jobs with rate limiting"""
    
    # Validate poll URLs
    if not poll_urls or len(poll_urls) > 20:
        raise HTTPException(status_code=400, detail="Invalid number of poll URLs")
    
    # Validate URL format
    for url in poll_urls:
        if not url.startswith("https://api.replicate.com/"):
            raise HTTPException(status_code=400, detail="Invalid poll URL format")
    
    settings = get_settings()
    replicate_token = settings.replicate_api_token
    
    if not replicate_token:
        raise HTTPException(status_code=500, detail="Replicate API not configured")
    
    headers = {"Authorization": f"Token {replicate_token}"}
    
    async def check_scene_status(poll_url: str):
        """Check status of a single scene"""
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(poll_url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                return {
                    "url": poll_url,
                    "status": data.get("status", "unknown"),
                    "output": data.get("output"),
                    "error": data.get("error")
                }
            else:
                return {
                    "url": poll_url,
                    "status": "error",
                    "output": None,
                    "error": f"HTTP {response.status_code}"
                }
                
        except Exception as e:
            return {
                "url": poll_url,
                "status": "error",
                "output": None,
                "error": str(e)
            }
    
    # Check all URLs concurrently
    tasks = [check_scene_status(url) for url in poll_urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # Process results
    status_results = []
    for result in results:
        if isinstance(result, dict):
            status_results.append(result)
        else:
            status_results.append({
                "url": "unknown",
                "status": "error",
                "output": None,
                "error": str(result)
            })
    
    return {
        "total_urls": len(poll_urls),
        "results": status_results
    } 