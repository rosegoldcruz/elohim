"""
AEON Viral Python Editing Agent - Enhanced FastAPI Main Entry Point
GPU-accelerated, TikTok-optimized video editing microservice with async processing
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from app.pipeline import process_video_edit
from app.utils import cleanup_temp_files
from app.monitoring import (
    performance_monitor, video_profiler, gpu_memory_manager,
    get_system_health, record_error, REQUEST_COUNT, REQUEST_DURATION, PROCESSING_JOBS
)
import uvicorn
import uuid
import os
import asyncio
import logging
from typing import List, Optional, Dict, Any
import time
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
import psutil

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AEON Viral Editor Agent",
    description="GPU-accelerated, TikTok-optimized video edit agent blessed for viral domination",
    version="2.0.0",
    docs_url="/editor/docs",
    redoc_url=None
)

# CORS middleware for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global job tracker for async processing
ACTIVE_JOBS: Dict[str, Dict[str, Any]] = {}

# Health check endpoint
@app.get("/health")
async def health_check():
    """Enhanced health check endpoint with comprehensive monitoring"""
    try:
        health = get_system_health()
        health["active_jobs"] = len(ACTIVE_JOBS)
        health["monitoring"] = {
            "performance_monitor_active": performance_monitor.monitoring_active,
            "gpu_memory_manager_available": gpu_memory_manager.check_gpu_memory()['available']
        }
        return health
    except Exception as e:
        record_error("health_check", "main", e)
        return {"status": "unhealthy", "error": str(e)}

# Metrics endpoint for Prometheus
@app.get("/metrics")
async def metrics():
    """Enhanced Prometheus metrics endpoint"""
    try:
        metrics_data = performance_monitor.get_prometheus_metrics()
        return StreamingResponse(
            iter([metrics_data]),
            media_type=CONTENT_TYPE_LATEST
        )
    except Exception as e:
        record_error("metrics", "main", e)
        return StreamingResponse(
            iter([generate_latest()]),
            media_type=CONTENT_TYPE_LATEST
        )

@app.post("/edit")
async def edit_video(
    background_tasks: BackgroundTasks,
    project_name: str = Form(..., description="Project name for output file"),
    video_clips: List[UploadFile] = File(..., description="Video clips to edit (MP4 format)"),
    transitions: str = Form("zoom_punch", description="Transition type: zoom_punch, glitch, slide, 3d_flip, viral_cut"),
    fade_in_out: bool = Form(True, description="Apply fade in/out effects"),
    bgm: Optional[UploadFile] = File(None, description="Background music (MP3/WAV)"),
    avatar_overlay: Optional[UploadFile] = File(None, description="Avatar/logo overlay (PNG)"),
    watermark_text: str = Form("", description="Watermark text to overlay"),
    aspect_ratio: str = Form("9:16", description="Aspect ratio: 9:16, 16:9, 1:1"),
    captions: Optional[UploadFile] = File(None, description="Captions file (SRT format)"),
    viral_mode: bool = Form(True, description="Enable viral TikTok optimizations"),
    beat_sync: bool = Form(True, description="Sync cuts to audio beats"),
    velocity_editing: bool = Form(True, description="Progressive velocity editing"),
    asmr_layer: bool = Form(True, description="Add ASMR sound effects"),
    kinetic_captions: bool = Form(True, description="Bouncing/kinetic caption animations"),
    first_frame_hook: bool = Form(True, description="First frame freeze hook"),
    quality: str = Form("high", description="Output quality: low, medium, high, ultra"),
    preview: bool = Form(False, description="Generate preview only (faster processing)")
):
    """
    Enhanced video editing endpoint with async processing and job tracking
    """
    REQUEST_COUNT.labels(method='POST', endpoint='/edit').inc()
    start_time = time.time()

    try:
        logger.info(f"🎬 Starting edit job: {project_name}")
        
        # Validate inputs
        if not video_clips:
            raise HTTPException(status_code=400, detail="At least one video clip is required")
        
        if len(video_clips) > 20:
            raise HTTPException(status_code=400, detail="Maximum 20 video clips allowed")
        
        # Create job directory and initialize tracking
        job_id = str(uuid.uuid4())
        input_dir = f"/tmp/aeon_{job_id}"
        os.makedirs(input_dir, exist_ok=True)

        # Initialize job tracking
        ACTIVE_JOBS[job_id] = {
            "status": "processing",
            "progress": 0,
            "output": None,
            "created_at": time.time(),
            "project_name": project_name
        }

        logger.info(f"📁 Created job directory: {input_dir}")
        
        # Save video clips
        clip_paths = []
        for i, clip in enumerate(video_clips):
            if not clip.filename.lower().endswith(('.mp4', '.mov', '.avi', '.mkv')):
                raise HTTPException(status_code=400, detail=f"Invalid video format: {clip.filename}")
            
            clip_path = os.path.join(input_dir, f"clip_{i:03d}.mp4")
            with open(clip_path, "wb") as f:
                content = await clip.read()
                f.write(content)
            clip_paths.append(clip_path)
            logger.info(f"💾 Saved clip {i+1}/{len(video_clips)}: {clip.filename}")

            # Update progress
            ACTIVE_JOBS[job_id]["progress"] = (i + 1) * 10 / len(video_clips)
        
        # Save background music
        bgm_path = None
        if bgm:
            if not bgm.filename.lower().endswith(('.mp3', '.wav', '.m4a', '.aac')):
                raise HTTPException(status_code=400, detail=f"Invalid audio format: {bgm.filename}")
            
            bgm_path = os.path.join(input_dir, "bgm.mp3")
            with open(bgm_path, "wb") as f:
                content = await bgm.read()
                f.write(content)
            logger.info(f"🎵 Saved BGM: {bgm.filename}")
        
        # Save avatar overlay
        overlay_path = None
        if avatar_overlay:
            if not avatar_overlay.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                raise HTTPException(status_code=400, detail=f"Invalid image format: {avatar_overlay.filename}")
            
            overlay_path = os.path.join(input_dir, "overlay.png")
            with open(overlay_path, "wb") as f:
                content = await avatar_overlay.read()
                f.write(content)
            logger.info(f"🖼️ Saved overlay: {avatar_overlay.filename}")
        
        # Save captions
        captions_path = None
        if captions:
            if not captions.filename.lower().endswith(('.srt', '.vtt', '.json')):
                raise HTTPException(status_code=400, detail=f"Invalid captions format: {captions.filename}")
            
            captions_path = os.path.join(input_dir, "captions.srt")
            with open(captions_path, "wb") as f:
                content = await captions.read()
                f.write(content)
            logger.info(f"📝 Saved captions: {captions.filename}")
        
        # Prepare output path
        output_path = os.path.join(input_dir, f"{project_name}_final.mp4")
        
        # Build edit configuration
        edit_config = {
            "transitions": transitions,
            "fade_in_out": fade_in_out,
            "aspect_ratio": aspect_ratio,
            "viral_mode": viral_mode,
            "beat_sync": beat_sync,
            "velocity_editing": velocity_editing,
            "asmr_layer": asmr_layer,
            "kinetic_captions": kinetic_captions,
            "first_frame_hook": first_frame_hook,
            "quality": quality,
            "watermark_text": watermark_text
        }
        
        logger.info(f"⚙️ Edit config: {edit_config}")
        
        # Run pipeline in background
        background_tasks.add_task(
            run_edit_pipeline,
            job_id,
            clip_paths,
            bgm_path,
            overlay_path,
            captions_path,
            output_path,
            edit_config,
            preview
        )

        # Record processing duration
        REQUEST_DURATION.observe(time.time() - start_time)
        PROCESSING_JOBS.labels(status='started').inc()

        return JSONResponse(content={
            "job_id": job_id,
            "status": "processing",
            "status_url": f"/status/{job_id}",
            "download_url": f"/download/{job_id}",
            "message": "Video processing started. Check status_url for progress."
        })
    
    except HTTPException:
        if 'job_id' in locals():
            ACTIVE_JOBS[job_id] = {"status": "failed", "error": "Validation error"}
            PROCESSING_JOBS.labels(status='failed').inc()
        raise
    except Exception as e:
        logger.error(f"💥 Unexpected error: {str(e)}")
        if 'job_id' in locals():
            ACTIVE_JOBS[job_id] = {"status": "failed", "error": str(e)}
            PROCESSING_JOBS.labels(status='failed').inc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


async def run_edit_pipeline(
    job_id: str,
    clip_paths: List[str],
    bgm_path: Optional[str],
    overlay_path: Optional[str],
    captions_path: Optional[str],
    output_path: str,
    edit_config: Dict[str, Any],
    preview: bool = False
):
    """Enhanced background task with performance monitoring"""
    try:
        logger.info(f"🚀 Starting background processing for job {job_id}")

        # Start performance profiling
        video_profiler.start_profile(job_id, "video_edit", {
            'quality': edit_config.get('quality', 'high'),
            'transition_type': edit_config.get('transitions', 'unknown'),
            'clip_count': len(clip_paths),
            'has_bgm': bgm_path is not None,
            'has_overlay': overlay_path is not None,
            'viral_mode': edit_config.get('viral_mode', True)
        })

        # Check GPU memory before processing
        gpu_status = gpu_memory_manager.check_gpu_memory()
        if gpu_status['available'] and not gpu_status.get('can_allocate', True):
            logger.warning(f"⚠️ GPU memory usage high: {gpu_status['memory_usage']:.1%}")

        ACTIVE_JOBS[job_id]["progress"] = 20
        video_profiler.add_checkpoint(job_id, "preprocessing_complete")

        result = await process_video_edit(
            clip_paths=clip_paths,
            bgm_path=bgm_path,
            overlay_path=overlay_path,
            captions_path=captions_path,
            output_path=output_path,
            config=edit_config
        )

        video_profiler.add_checkpoint(job_id, "video_processing_complete")

        if result["success"]:
            ACTIVE_JOBS[job_id] = {
                "status": "completed",
                "output": output_path,
                "processing_time": result.get("processing_time", 0),
                "viral_score": result.get("viral_score", 100),
                "completed_at": time.time()
            }

            # End profiling with success
            profile_result = video_profiler.end_profile(
                job_id,
                success=True,
                viral_score=result.get("viral_score")
            )

            PROCESSING_JOBS.labels(status='completed').inc()
            logger.info(f"✅ Job {job_id} completed successfully in {profile_result['duration']:.2f}s")
        else:
            ACTIVE_JOBS[job_id] = {
                "status": "failed",
                "error": result.get("error", "Unknown error")
            }

            # End profiling with failure
            video_profiler.end_profile(job_id, success=False)
            PROCESSING_JOBS.labels(status='failed').inc()
            record_error("video_processing", "pipeline", Exception(result.get("error", "Unknown error")))
            logger.error(f"❌ Job {job_id} failed: {result.get('error')}")

    except Exception as e:
        ACTIVE_JOBS[job_id] = {
            "status": "failed",
            "error": str(e)
        }

        # End profiling with exception
        video_profiler.end_profile(job_id, success=False)
        PROCESSING_JOBS.labels(status='failed').inc()
        record_error("video_processing", "pipeline", e)
        logger.error(f"💥 Job {job_id} crashed: {str(e)}")
    finally:
        # Schedule cleanup after 1 hour
        asyncio.get_event_loop().call_later(
            3600,
            cleanup_temp_files,
            os.path.dirname(output_path)
        )


@app.on_event("startup")
async def startup_event():
    """Initialize monitoring and services on startup"""
    logger.info("🚀 AEON Viral Editor Agent starting up...")

    # Start performance monitoring
    performance_monitor.start_monitoring(interval=15.0)

    # Log system capabilities
    gpu_status = gpu_memory_manager.check_gpu_memory()
    if gpu_status['available']:
        logger.info(f"🎮 GPU available: {gpu_status['memory_free']:.0f}MB free / {gpu_status['memory_total']:.0f}MB total")
    else:
        logger.info("💻 Running in CPU-only mode")

    logger.info("✅ AEON startup complete")


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up resources on shutdown"""
    logger.info("🛑 AEON Viral Editor Agent shutting down...")

    # Stop monitoring
    performance_monitor.stop_monitoring()

    # Clean up any remaining jobs
    if ACTIVE_JOBS:
        logger.info(f"🧹 Cleaning up {len(ACTIVE_JOBS)} active jobs")
        for job_id in list(ACTIVE_JOBS.keys()):
            ACTIVE_JOBS[job_id]["status"] = "cancelled"

    logger.info("✅ AEON shutdown complete")


@app.get("/status/{job_id}")
def job_status(job_id: str):
    """Get the status of a processing job"""
    job = ACTIVE_JOBS.get(job_id, {"status": "not_found"})
    return JSONResponse(content=job)


@app.get("/download/{job_id}")
async def download_result(job_id: str):
    """Download the processed video result"""
    job = ACTIVE_JOBS.get(job_id)
    if not job or job["status"] != "completed":
        return JSONResponse(
            content={"error": "Job not completed or invalid"},
            status_code=404
        )

    return FileResponse(
        job["output"],
        media_type="video/mp4",
        filename=os.path.basename(job["output"]),
        headers={
            "X-Processing-Time": str(job.get("processing_time", 0)),
            "X-Viral-Score": str(job.get("viral_score", 100))
        }
    )


@app.post("/transitions")
async def get_available_transitions():
    """
    Get list of available viral transitions
    """
    return {
        "transitions": [
            {
                "name": "zoom_punch",
                "description": "Aggressive zoom with punch effect",
                "viral_score": 95,
                "best_for": "action, reveals, dramatic moments"
            },
            {
                "name": "glitch",
                "description": "Digital glitch transition",
                "viral_score": 90,
                "best_for": "tech, gaming, modern content"
            },
            {
                "name": "slide",
                "description": "Smooth slide transition",
                "viral_score": 80,
                "best_for": "lifestyle, tutorials, smooth flow"
            },
            {
                "name": "3d_flip",
                "description": "3D cube flip transition",
                "viral_score": 85,
                "best_for": "reveals, comparisons, transformations"
            },
            {
                "name": "viral_cut",
                "description": "Quick cut with viral timing",
                "viral_score": 100,
                "best_for": "maximum engagement, TikTok algorithm"
            }
        ]
    }

@app.post("/preview")
async def generate_preview(
    video_clips: List[UploadFile] = File(...),
    transitions: str = Form("zoom_punch"),
    duration: int = Form(15, description="Preview duration in seconds")
):
    """
    Generate a quick preview of the edit (first 15 seconds)
    """
    try:
        job_id = str(uuid.uuid4())
        input_dir = f"/tmp/preview_{job_id}"
        os.makedirs(input_dir, exist_ok=True)
        
        # Save clips (limit to first 3 for preview)
        clip_paths = []
        for i, clip in enumerate(video_clips[:3]):
            clip_path = os.path.join(input_dir, f"clip_{i}.mp4")
            with open(clip_path, "wb") as f:
                content = await clip.read()
                f.write(content)
            clip_paths.append(clip_path)
        
        output_path = os.path.join(input_dir, "preview.mp4")
        
        # Quick preview config
        preview_config = {
            "transitions": transitions,
            "fade_in_out": True,
            "aspect_ratio": "9:16",
            "viral_mode": True,
            "quality": "medium",
            "preview_mode": True,
            "max_duration": duration
        }
        
        result = await process_video_edit(
            clip_paths=clip_paths,
            bgm_path=None,
            overlay_path=None,
            captions_path=None,
            output_path=output_path,
            config=preview_config
        )
        
        if result["success"]:
            return FileResponse(
                output_path,
                media_type="video/mp4",
                filename="preview.mp4"
            )
        else:
            raise HTTPException(status_code=500, detail=result.get("error", "Preview generation failed"))
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Preview error: {str(e)}")

@app.get("/health")
def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "blessed",
        "service": "AEON Viral Editor Agent",
        "version": "1.0.0",
        "gpu_enabled": True,
        "viral_mode": "maximum",
        "message": "AEON Editor Agent online and ready for viral domination 🚀"
    }

@app.get("/")
def root():
    """
    Root endpoint
    """
    return {
        "service": "AEON Viral Editor Agent",
        "status": "blessed",
        "endpoints": {
            "edit": "/edit - Main video editing endpoint",
            "preview": "/preview - Generate quick preview",
            "transitions": "/transitions - Available transitions",
            "health": "/health - Health check",
            "docs": "/docs - API documentation"
        },
        "message": "Ready to create viral TikTok content 🎬✨"
    }

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8080,
        reload=True,
        log_level="info"
    )
