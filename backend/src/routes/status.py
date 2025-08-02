"""
AEON Modular Video Status Routes
Handles polling and status checking for parallel scene generation
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import httpx
import asyncio
import os
import logging

# Setup logging
logger = logging.getLogger(__name__)

router = APIRouter()

class PollInput(BaseModel):
    poll_urls: List[str]

class SceneStatusInput(BaseModel):
    prediction_id: str
    scene_id: Optional[str] = None

class BatchStatusInput(BaseModel):
    scenes: List[SceneStatusInput]

@router.post("/poll/modular-status")
async def poll_modular_status(data: PollInput):
    """
    Poll multiple Replicate predictions for status updates
    """
    replicate_token = os.getenv("REPLICATE_API_TOKEN")
    if not replicate_token:
        raise HTTPException(status_code=500, detail="Replicate API token not configured")
    
    if not data.poll_urls:
        raise HTTPException(status_code=400, detail="No poll URLs provided")
    
    headers = {
        "Authorization": f"Token {replicate_token}",
        "Content-Type": "application/json"
    }

    async def poll_one(url: str) -> Dict[str, Any]:
        """Poll a single prediction URL"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers)
                
                if response.status_code != 200:
                    logger.error(f"Poll error for {url}: {response.status_code}")
                    return {
                        "prediction_id": url.split('/')[-1] if '/' in url else url,
                        "status": "failed",
                        "output_url": None,
                        "error": f"HTTP {response.status_code}",
                        "progress": None
                    }
                
                res = response.json()
                
                # Handle different output formats
                output_url = None
                if res.get("output"):
                    output = res["output"]
                    if isinstance(output, str):
                        output_url = output
                    elif isinstance(output, list) and len(output) > 0:
                        output_url = output[0]
                
                return {
                    "prediction_id": res.get("id"),
                    "status": res.get("status", "unknown"),
                    "output_url": output_url,
                    "error": res.get("error"),
                    "progress": res.get("progress"),
                    "logs": res.get("logs", []),
                    "created_at": res.get("created_at"),
                    "started_at": res.get("started_at"),
                    "completed_at": res.get("completed_at"),
                    "metrics": res.get("metrics", {})
                }
                
        except Exception as e:
            logger.error(f"Error polling {url}: {str(e)}")
            return {
                "prediction_id": url.split('/')[-1] if '/' in url else url,
                "status": "failed",
                "output_url": None,
                "error": str(e),
                "progress": None
            }

    try:
        logger.info(f"Polling {len(data.poll_urls)} predictions")
        results = await asyncio.gather(*[poll_one(url) for url in data.poll_urls])
        
        # Calculate summary statistics
        status_counts = {}
        completed_count = 0
        failed_count = 0
        
        for result in results:
            status = result["status"]
            status_counts[status] = status_counts.get(status, 0) + 1
            
            if status == "succeeded":
                completed_count += 1
            elif status == "failed":
                failed_count += 1
        
        return {
            "scenes": results,
            "summary": {
                "total": len(results),
                "completed": completed_count,
                "failed": failed_count,
                "in_progress": len(results) - completed_count - failed_count,
                "status_breakdown": status_counts
            }
        }
        
    except Exception as e:
        logger.error(f"Error in modular status polling: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Polling failed: {str(e)}")

@router.post("/poll/batch-status")
async def poll_batch_status(data: BatchStatusInput):
    """
    Poll multiple predictions by prediction ID with scene mapping
    """
    replicate_token = os.getenv("REPLICATE_API_TOKEN")
    if not replicate_token:
        raise HTTPException(status_code=500, detail="Replicate API token not configured")
    
    if not data.scenes:
        raise HTTPException(status_code=400, detail="No scenes provided")
    
    headers = {
        "Authorization": f"Token {replicate_token}",
        "Content-Type": "application/json"
    }

    async def poll_scene(scene_input: SceneStatusInput) -> Dict[str, Any]:
        """Poll a single scene by prediction ID"""
        try:
            url = f"https://api.replicate.com/v1/predictions/{scene_input.prediction_id}"
            
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.get(url, headers=headers)
                
                if response.status_code != 200:
                    logger.error(f"Poll error for scene {scene_input.scene_id}: {response.status_code}")
                    return {
                        "scene_id": scene_input.scene_id,
                        "prediction_id": scene_input.prediction_id,
                        "status": "failed",
                        "output_url": None,
                        "error": f"HTTP {response.status_code}"
                    }
                
                res = response.json()
                
                # Handle different output formats
                output_url = None
                if res.get("output"):
                    output = res["output"]
                    if isinstance(output, str):
                        output_url = output
                    elif isinstance(output, list) and len(output) > 0:
                        output_url = output[0]
                
                return {
                    "scene_id": scene_input.scene_id,
                    "prediction_id": scene_input.prediction_id,
                    "status": res.get("status", "unknown"),
                    "output_url": output_url,
                    "error": res.get("error"),
                    "progress": res.get("progress"),
                    "logs": res.get("logs", [])[-3:] if res.get("logs") else [],  # Last 3 logs
                    "metrics": res.get("metrics", {})
                }
                
        except Exception as e:
            logger.error(f"Error polling scene {scene_input.scene_id}: {str(e)}")
            return {
                "scene_id": scene_input.scene_id,
                "prediction_id": scene_input.prediction_id,
                "status": "failed",
                "output_url": None,
                "error": str(e)
            }

    try:
        results = await asyncio.gather(*[poll_scene(scene) for scene in data.scenes])
        
        # Calculate summary
        completed = [r for r in results if r["status"] == "succeeded"]
        failed = [r for r in results if r["status"] == "failed"]
        in_progress = [r for r in results if r["status"] in ["starting", "processing"]]
        
        return {
            "scenes": results,
            "summary": {
                "total": len(results),
                "completed": len(completed),
                "failed": len(failed),
                "in_progress": len(in_progress),
                "completion_rate": len(completed) / len(results) if results else 0
            }
        }
        
    except Exception as e:
        logger.error(f"Error in batch status polling: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch polling failed: {str(e)}")

@router.get("/poll/prediction/{prediction_id}")
async def get_prediction_status(prediction_id: str):
    """
    Get status of a single prediction
    """
    replicate_token = os.getenv("REPLICATE_API_TOKEN")
    if not replicate_token:
        raise HTTPException(status_code=500, detail="Replicate API token not configured")
    
    headers = {
        "Authorization": f"Token {replicate_token}",
        "Content-Type": "application/json"
    }
    
    try:
        url = f"https://api.replicate.com/v1/predictions/{prediction_id}"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=headers)
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=response.text)
            
            return response.json()
            
    except httpx.HTTPError as e:
        logger.error(f"HTTP error polling prediction {prediction_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Network error: {str(e)}")
    except Exception as e:
        logger.error(f"Error polling prediction {prediction_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
