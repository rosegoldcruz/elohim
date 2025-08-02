"""
Status and Monitoring API Routes
Handles job tracking, system health, and monitoring endpoints
"""

import os
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.auth import verify_clerk_jwt
from utils.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()

class JobStatus(BaseModel):
    """Job status model"""
    job_id: str
    user_id: str
    status: str
    progress: float
    created_at: datetime
    updated_at: datetime
    video_url: Optional[str] = None
    error: Optional[str] = None

class SystemHealth(BaseModel):
    """System health model"""
    status: str
    timestamp: datetime
    services: Dict[str, str]
    uptime: float
    memory_usage: float
    cpu_usage: float

# In-memory job storage (in production, use Redis or database)
job_store: Dict[str, JobStatus] = {}

@router.get("/jobs")
async def get_user_jobs(
    current_user: dict = Depends(verify_clerk_jwt),
    limit: int = 10,
    offset: int = 0
):
    """Get user's video generation jobs"""
    
    user_id = current_user.get("user_id")
    
    # Filter jobs by user
    user_jobs = [
        job for job in job_store.values() 
        if job.user_id == user_id
    ]
    
    # Sort by creation date (newest first)
    user_jobs.sort(key=lambda x: x.created_at, reverse=True)
    
    # Apply pagination
    paginated_jobs = user_jobs[offset:offset + limit]
    
    return {
        "jobs": paginated_jobs,
        "total": len(user_jobs),
        "limit": limit,
        "offset": offset
    }

@router.get("/jobs/{job_id}")
async def get_job_status(
    job_id: str,
    current_user: dict = Depends(verify_clerk_jwt)
):
    """Get status of a specific job"""
    
    user_id = current_user.get("user_id")
    
    if job_id not in job_store:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = job_store[job_id]
    
    # Ensure user can only access their own jobs
    if job.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return job

@router.delete("/jobs/{job_id}")
async def cancel_job(
    job_id: str,
    current_user: dict = Depends(verify_clerk_jwt)
):
    """Cancel a running job"""
    
    user_id = current_user.get("user_id")
    
    if job_id not in job_store:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = job_store[job_id]
    
    # Ensure user can only cancel their own jobs
    if job.user_id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Only allow cancellation of running jobs
    if job.status not in ["starting", "processing"]:
        raise HTTPException(status_code=400, detail="Job cannot be cancelled")
    
    # Update job status
    job.status = "cancelled"
    job.updated_at = datetime.now()
    
    return {"message": "Job cancelled successfully"}

@router.get("/health")
async def get_system_health():
    """Get system health status"""
    
    settings = get_settings()
    
    # Check service availability
    services = {
        "api": "healthy",
        "replicate": "available" if settings.replicate_api_token else "not_configured",
        "supabase": "available" if settings.supabase_url else "not_configured",
        "clerk": "available" if settings.clerk_secret_key else "not_configured"
    }
    
    # Mock system metrics (in production, get from monitoring system)
    import psutil
    
    try:
        memory_usage = psutil.virtual_memory().percent
        cpu_usage = psutil.cpu_percent(interval=1)
        uptime = (datetime.now() - datetime.fromtimestamp(psutil.boot_time())).total_seconds()
    except:
        memory_usage = 0.0
        cpu_usage = 0.0
        uptime = 0.0
    
    return SystemHealth(
        status="healthy",
        timestamp=datetime.now(),
        services=services,
        uptime=uptime,
        memory_usage=memory_usage,
        cpu_usage=cpu_usage
    )

@router.get("/metrics")
async def get_system_metrics():
    """Get system performance metrics"""
    
    # Count jobs by status
    job_counts = {
        "total": len(job_store),
        "completed": len([j for j in job_store.values() if j.status == "completed"]),
        "processing": len([j for j in job_store.values() if j.status in ["starting", "processing"]]),
        "failed": len([j for j in job_store.values() if j.status == "failed"]),
        "cancelled": len([j for j in job_store.values() if j.status == "cancelled"])
    }
    
    # Recent activity (last 24 hours)
    cutoff_time = datetime.now() - timedelta(hours=24)
    recent_jobs = [
        j for j in job_store.values() 
        if j.created_at > cutoff_time
    ]
    
    return {
        "job_counts": job_counts,
        "recent_activity": {
            "last_24h": len(recent_jobs),
            "last_hour": len([j for j in recent_jobs if j.created_at > datetime.now() - timedelta(hours=1)])
        },
        "timestamp": datetime.now()
    }

# Utility functions for job management
def create_job(job_id: str, user_id: str) -> JobStatus:
    """Create a new job"""
    now = datetime.now()
    job = JobStatus(
        job_id=job_id,
        user_id=user_id,
        status="starting",
        progress=0.0,
        created_at=now,
        updated_at=now
    )
    job_store[job_id] = job
    return job

def update_job(job_id: str, status: str, progress: float = None, video_url: str = None, error: str = None):
    """Update job status"""
    if job_id in job_store:
        job = job_store[job_id]
        job.status = status
        job.updated_at = datetime.now()
        
        if progress is not None:
            job.progress = progress
        if video_url is not None:
            job.video_url = video_url
        if error is not None:
            job.error = error 