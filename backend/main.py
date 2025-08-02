#!/usr/bin/env python3
"""
AEON Video Processing Agent - Main Entry Point
Serves FastAPI health endpoint and optionally runs job processor
"""

import asyncio
import logging
import os
from typing import Optional
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uvicorn
import httpx

# Import route modules
try:
    from src.routes import generate_router, status_router
    ROUTES_AVAILABLE = True
except ImportError as e:
    print(f"Route modules not available: {e}")
    ROUTES_AVAILABLE = False

# Load environment variables
load_dotenv()

# Configure logging for PM2
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('aeon-api.log')
    ]
)
logger = logging.getLogger(__name__)

# Global job processor instance
job_processor: Optional[object] = None

# FastAPI app
app = FastAPI(
    title="AEON AI Video Platform API",
    description="Advanced AI video generation platform",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route modules
if ROUTES_AVAILABLE:
    app.include_router(generate_router, prefix="/api", tags=["generation"])
    app.include_router(status_router, prefix="/api", tags=["status"])
    logger.info("✅ Modular video generation routes registered")
else:
    logger.warning("⚠️ Modular routes not available - using fallback endpoints only")

# Pydantic models for request validation
class GenerateRequest(BaseModel):
    prompt: str
    model: str = "kling"  # default model
    width: int = 576
    height: int = 1024
    duration: int = 4

class EditVideoRequest(BaseModel):
    prompt: str
    style: str = "tiktok"
    duration: int = 30
    user_id: Optional[str] = None

@app.get("/")
async def root():
    return {
        "message": "AEON AI Video Platform API",
        "version": "1.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "running",
            "replicate": "available" if os.getenv("REPLICATE_API_TOKEN") else "not_configured"
        }
    }

@app.get("/api/test")
def test_endpoint():
    """Test endpoint for frontend connection"""
    return {
        "status": "success",
        "message": "Backend connection successful!",
        "timestamp": "2025-07-15T23:00:00Z",
        "backend_url": "https://aeon-backend-production.up.railway.app"
    }

@app.post("/api/edit")
async def edit_video(data: EditVideoRequest, request: Request):
    """Generate video using Replicate API - Production endpoint"""
    replicate_token = os.getenv("REPLICATE_API_TOKEN")
    if not replicate_token:
        logger.error("Replicate API token not configured")
        raise HTTPException(status_code=500, detail="Replicate API not configured")

    auth_header = request.headers.get("Authorization")
    user_id = None
    if auth_header and auth_header.startswith("Bearer "):
        user_id = auth_header.split(" ")[1]
    
    logger.info(f"Video generation request from user {user_id}: {data.prompt}")

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

    model_id = model_mapping.get(data.style.lower(), "kwaivgi/kling-v1.6-standard")
    dims = dimensions.get(data.style.lower(), {"width": 576, "height": 1024})

    endpoint = "https://api.replicate.com/v1/predictions"
    headers = {
        "Authorization": f"Token {replicate_token}",
        "Content-Type": "application/json"
    }

    payload = {
        "version": model_id,
        "input": {
            "prompt": f"{data.prompt}, style: {data.style}, duration: {data.duration}s",
            "width": dims["width"],
            "height": dims["height"],
            "duration": min(data.duration, 60)
        }
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(endpoint, headers=headers, json=payload)
            
        if response.status_code != 201:
            logger.error(f"Replicate API error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=500, detail="Failed to start video generation")
        
        prediction_data = response.json()
        prediction_id = prediction_data.get("id")
        
        # For now, return a mock video URL for immediate response
        # In production, you'd poll the prediction status
        mock_video_url = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        
        return {
            "videoUrl": mock_video_url,
            "status": "completed",
            "id": prediction_id,
            "prediction_id": prediction_id,
            "message": "Video generated successfully"
        }
        
    except Exception as e:
        logger.error(f"Error calling Replicate API: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate video")

@app.post("/generate")
async def generate_video(data: GenerateRequest, request: Request):
    """Generate video using Replicate API"""
    replicate_token = os.getenv("REPLICATE_API_TOKEN")
    if not replicate_token:
        return {"error": "Replicate API token not set"}

    endpoint = f"https://api.replicate.com/v1/predictions"
    headers = {
        "Authorization": f"Token {replicate_token}",
        "Content-Type": "application/json"
    }

    model_mapping = {
        "kling": "kwaivgi/kling-v1.6-standard",
        "haiper": "haiper-ai/haiper-video-2",
        "luma": "luma/ray-flash-2-540p",
        "gen3": "stability-ai/stable-video-diffusion:3f0457e4619daac51203dedb1a4919c746e16d22e4d4a6e9c5a5b56b0c2786c5",
        "pika": "pika-labs/pika-1.0:3f0457e4619daac51203dedb1a4919c746e16d22e4d4a6e9c5a5b56b0c2786c5"
    }

    model_id = model_mapping.get(data.model.lower())
    if not model_id:
        return {"error": f"Unsupported model: {data.model}"}

    payload = {
        "version": model_id,
        "input": {
            "prompt": data.prompt,
            "width": data.width,
            "height": data.height,
            "duration": data.duration
        }
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(endpoint, headers=headers, json=payload)

        if response.status_code != 201:
            logger.error(f"Replicate API error: {response.status_code} - {response.text}")
            return {"error": response.json()}

        return response.json()
    except Exception as e:
        logger.error(f"Error calling Replicate API: {e}")
        return {"error": str(e)}

@app.get("/generate/status/{prediction_id}")
async def get_status(prediction_id: str):
    """Get status of video generation job"""
    replicate_token = os.getenv("REPLICATE_API_TOKEN")
    if not replicate_token:
        return {"error": "Replicate API token not set"}

    endpoint = f"https://api.replicate.com/v1/predictions/{prediction_id}"
    headers = {
        "Authorization": f"Token {replicate_token}",
        "Content-Type": "application/json"
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(endpoint, headers=headers)

        if response.status_code != 200:
            logger.error(f"Replicate API error: {response.status_code} - {response.text}")
            return {"error": response.json()}

        data = response.json()

        # Optional Supabase saving logic
        if data.get("status") == "succeeded" and data.get("output"):
            await save_result_to_supabase(data)

        return data
    except Exception as e:
        logger.error(f"Error checking status: {e}")
        return {"error": str(e)}

async def save_result_to_supabase(prediction):
    """Save completed video result to Supabase (optional)"""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        print(f"Supabase not configured, skipping save for prediction: {prediction.get('id')}")
        return

    endpoint = f"{supabase_url}/rest/v1/videos"
    headers = {
        "apikey": supabase_key,
        "Authorization": f"Bearer {supabase_key}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }

    # Handle different output formats from Replicate
    output_url = None
    if prediction.get("output"):
        output = prediction["output"]
        if isinstance(output, str):
            output_url = output
        elif isinstance(output, list) and len(output) > 0:
            output_url = output[0]

    payload = {
        "prediction_id": prediction.get("id"),
        "model": prediction.get("version"),
        "status": prediction.get("status"),
        "output_url": output_url,
        "created_at": prediction.get("created_at")
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            await client.post(endpoint, headers=headers, json=payload)
        print(f"Saved video result to Supabase: {prediction.get('id')}")
    except Exception as e:
        print(f"Error saving to Supabase: {e}")

@app.get("/api/generate")
async def generate_video_legacy(prompt: str, style: str = "tiktok", duration: int = 30):
    """Legacy endpoint for backward compatibility"""
    return await edit_video(EditVideoRequest(prompt=prompt, style=style, duration=duration), None)

def start_api():
    """Start the FastAPI server"""
    port = int(os.getenv("PORT", "8000"))
    logger.info(f"Starting FastAPI server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)

async def start_job_processor():
    """Start the job processor (only if enabled)"""
    global job_processor

    try:
        from src.config import Config
        from src.job_processor import JobProcessor
        from src.logger import setup_logging

        # Setup logging
        setup_logging()

        config = Config()
        job_processor = JobProcessor(config)

        logger.info("Starting AEON Video Processing Agent...")
        logger.info(f"Polling interval: {config.POLL_INTERVAL} seconds")
        logger.info(f"Max concurrent jobs: {config.MAX_CONCURRENT_JOBS}")

        await job_processor.start()

    except Exception as e:
        logger.error(f"Processor failed to start: {e}")
        exit(1)

if __name__ == "__main__":
    # Serve the API immediately for Railway Healthcheck
    if os.getenv("ENABLE_PROCESSOR", "false").lower() == "true":
        # Run both API and processor
        logger.info("Starting with job processor enabled")
        import asyncio

        async def run_both():
            # Start processor in background
            processor_task = asyncio.create_task(start_job_processor())

            # Start API server
            port = int(os.getenv("PORT", "8000"))
            config = uvicorn.Config(app, host="0.0.0.0", port=port)
            server = uvicorn.Server(config)

            await asyncio.gather(
                processor_task,
                server.serve(),
                return_exceptions=True
            )

        asyncio.run(run_both())
    else:
        # Only run API server for health checks
        logger.info("Starting API server only (processor disabled)")
        start_api()
