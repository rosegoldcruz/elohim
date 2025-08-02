"""
AEON Modular Video Generation Routes
Handles parallel scene generation with multiple AI models
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import httpx
import asyncio
import os
import logging

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter()

class SceneInput(BaseModel):
    segment_id: str
    prompt_text: str
    duration: int
    model: str
    width: int = 576
    height: int = 1024

class ModularRequest(BaseModel):
    scenes: List[SceneInput]

# Model mapping for Replicate API
MODEL_MAPPING = {
    "minimax": "minimax/video-01",
    "kling": "kwaivgi/kling-v1.6-standard", 
    "haiper": "haiper-ai/haiper-video-2",
    "luma": "luma/ray-flash-2-540p",
    "gen3": "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb1a4919c746e16d22e4d4a6e9c5a5b56b0c2786c5",
    "pika": "pika-labs/pika-1.0:3f0457e4619daac51203dedb1a4919c746e16d22e4d4a6e9c5a5b56b0c2786c5"
}

@router.post("/generate/modular")
async def generate_modular(req: ModularRequest):
    """
    Generate multiple video scenes in parallel using different AI models
    """
    replicate_token = os.getenv("REPLICATE_API_TOKEN")
    if not replicate_token:
        raise HTTPException(status_code=500, detail="Replicate API token not configured")
    
    if not req.scenes:
        raise HTTPException(status_code=400, detail="No scenes provided")
    
    headers = {
        "Authorization": f"Token {replicate_token}",
        "Content-Type": "application/json"
    }

    async def launch_scene(scene: SceneInput) -> Dict[str, Any]:
        """Launch a single scene generation"""
        try:
            # Get the actual Replicate model ID
            model_id = MODEL_MAPPING.get(scene.model.lower())
            if not model_id:
                # Fallback to the provided model if not in mapping
                model_id = scene.model
            
            payload = {
                "version": model_id,
                "input": {
                    "prompt": scene.prompt_text,
                    "duration": scene.duration,
                    "width": scene.width,
                    "height": scene.height,
                    "aspect_ratio": f"{scene.width}:{scene.height}",
                    "quality": "high"
                }
            }
            
            logger.info(f"Starting scene generation: {scene.segment_id} with model {scene.model}")
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.replicate.com/v1/predictions", 
                    headers=headers, 
                    json=payload
                )
                
                if response.status_code != 201:
                    logger.error(f"Replicate API error for scene {scene.segment_id}: {response.status_code} - {response.text}")
                    return {
                        "scene_id": scene.segment_id,
                        "model": scene.model,
                        "status": "failed",
                        "error": f"API error: {response.status_code}",
                        "prediction_id": None,
                        "poll_url": None,
                        "prompt_used": scene.prompt_text,
                        "duration": scene.duration
                    }
                
                res = response.json()
                
                return {
                    "scene_id": scene.segment_id,
                    "model": scene.model,
                    "status": res.get("status", "unknown"),
                    "prediction_id": res.get("id"),
                    "poll_url": res.get("urls", {}).get("get"),
                    "prompt_used": scene.prompt_text,
                    "duration": scene.duration,
                    "created_at": res.get("created_at")
                }
                
        except Exception as e:
            logger.error(f"Error launching scene {scene.segment_id}: {str(e)}")
            return {
                "scene_id": scene.segment_id,
                "model": scene.model,
                "status": "failed",
                "error": str(e),
                "prediction_id": None,
                "poll_url": None,
                "prompt_used": scene.prompt_text,
                "duration": scene.duration
            }

    # Launch all scenes in parallel
    try:
        logger.info(f"Starting parallel generation of {len(req.scenes)} scenes")
        results = await asyncio.gather(*[launch_scene(scene) for scene in req.scenes])
        
        # Count successful launches
        successful = sum(1 for r in results if r["status"] != "failed")
        failed = len(results) - successful
        
        logger.info(f"Scene launch complete: {successful} successful, {failed} failed")
        
        return {
            "status": "started",
            "total_scenes": len(req.scenes),
            "successful_launches": successful,
            "failed_launches": failed,
            "scenes": results
        }
        
    except Exception as e:
        logger.error(f"Error in modular generation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@router.get("/generate/models")
async def get_available_models():
    """Get list of available models for scene generation"""
    return {
        "fast_models_5s": [
            {"id": "minimax", "name": "Minimax Video", "max_duration": 6},
            {"id": "kling", "name": "Kling Pro", "max_duration": 10},
            {"id": "haiper", "name": "Haiper Video", "max_duration": 8}
        ],
        "stable_models_10s": [
            {"id": "haiper", "name": "Haiper Video", "max_duration": 8},
            {"id": "luma", "name": "Luma Dream", "max_duration": 10},
            {"id": "gen3", "name": "Runway Gen-3", "max_duration": 10}
        ],
        "model_mapping": MODEL_MAPPING
    }
