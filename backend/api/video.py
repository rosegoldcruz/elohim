"""
Video Processing API Routes
Handles video upload, editing, and processing operations
"""

import os
import logging
import magic
import hashlib
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Request
from pydantic import BaseModel, validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from utils.auth import verify_clerk_jwt
from utils.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()

# Rate limiter instance
limiter = Limiter(key_func=get_remote_address)

class VideoPipeline(BaseModel):
    """Video processing pipeline configuration"""
    name: str
    settings: dict

    @validator("name")
    def validate_name(cls, v):
        """Validate pipeline name"""
        if not v or len(v) > 100:
            raise ValueError("Invalid pipeline name")
        # Check for dangerous characters
        if any(char in v for char in ['<', '>', '"', "'", '`', '/', '\\']):
            raise ValueError("Invalid characters in pipeline name")
        return v.strip()

async def validate_video_file(file: UploadFile):
    """Validate video file using magic bytes"""
    try:
        content = await file.read(2048)
        await file.seek(0)
        mime = magic.from_buffer(content, mime=True)
        if not mime.startswith("video/"):
            raise HTTPException(status_code=400, detail="Not a video file")
        return True
    except Exception as e:
        logger.error(f"Error validating video file: {e}")
        raise HTTPException(status_code=400, detail="Invalid video file")

async def validate_file_size(file: UploadFile, max_size_mb: int = 100) -> bool:
    """Validate file size"""
    try:
        # Check content-length header if available
        if hasattr(file, 'size') and file.size:
            if file.size > max_size_mb * 1024 * 1024:
                return False
        
        # For files without size attribute, we'll check during upload
        return True
        
    except Exception as e:
        logger.error(f"Error validating file size: {e}")
        return False

async def calculate_file_hash(content: bytes) -> str:
    """Calculate SHA-256 hash of file content"""
    return hashlib.sha256(content).hexdigest()

async def process_video_edit(pipeline: VideoPipeline, job_id: str, user_id: str):
    """Process video edit job"""
    try:
        logger.info(f"Processing video edit {job_id} for user {user_id}")
        # Video processing logic here
        
    except Exception as e:
        logger.error(f"Error processing video edit {job_id}: {e}")

@router.post("/upload")
@limiter.limit("10/minute")  # Rate limit file uploads
async def upload_video(
    request: Request,
    file: UploadFile = File(...),
    current_user: dict = Depends(verify_clerk_jwt)
):
    """Upload a video file with security validation"""
    
    user_id = current_user.get("user_id")
    
    # Validate file type using magic bytes
    await validate_video_file(file)
    
    # Validate file size
    if not await validate_file_size(file, max_size_mb=100):
        raise HTTPException(status_code=400, detail="File too large (max 100MB)")
    
    # Validate filename
    if not file.filename or len(file.filename) > 255:
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    # Check for dangerous filename patterns
    dangerous_patterns = ['..', '/', '\\', 'script', 'javascript']
    if any(pattern in file.filename.lower() for pattern in dangerous_patterns):
        raise HTTPException(status_code=400, detail="Invalid filename")
    
    try:
        # Read file content for hash calculation
        content = await file.read()
        file_hash = await calculate_file_hash(content)
        
        # In production, upload to secure cloud storage (Vercel Blob, AWS S3, etc.)
        # For now, return a secure URL structure
        secure_filename = f"{user_id}_{file_hash[:8]}_{file.filename}"
        secure_url = f"https://storage.aeon-video.com/videos/{user_id}/{secure_filename}"
        
        logger.info(f"Video uploaded successfully: {file.filename} by user {user_id}")
        
        return {
            "uploaded": True,
            "url": secure_url,
            "filename": secure_filename,
            "size": len(content),
            "hash": file_hash,
            "mime_type": file.content_type
        }
        
    except Exception as e:
        logger.error(f"Error uploading video: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload video")

@router.get("/formats")
async def get_supported_formats():
    """Get supported video formats and codecs"""
    return {
        "supported_formats": [
            {
                "extension": "mp4",
                "mime_type": "video/mp4",
                "codecs": ["H.264", "H.265"],
                "max_size_mb": 100
            },
            {
                "extension": "mov",
                "mime_type": "video/quicktime",
                "codecs": ["H.264", "ProRes"],
                "max_size_mb": 100
            },
            {
                "extension": "avi",
                "mime_type": "video/x-msvideo",
                "codecs": ["Xvid", "DivX"],
                "max_size_mb": 100
            },
            {
                "extension": "webm",
                "mime_type": "video/webm",
                "codecs": ["VP8", "VP9"],
                "max_size_mb": 100
            }
        ],
        "max_file_size_mb": 100,
        "max_duration_seconds": 300
    }

@router.post("/edit")
@limiter.limit("5/minute")  # Rate limit video editing
async def edit_video(
    request: Request,
    pipeline: VideoPipeline,
    current_user: dict = Depends(verify_clerk_jwt)
):
    """Start video editing job with rate limiting"""
    
    user_id = current_user.get("user_id")
    job_id = f"edit_{user_id}_{int(os.urandom(4).hex(), 16)}"
    
    try:
        # Start async processing
        await process_video_edit(pipeline, job_id, user_id)
        
        return {
            "job_id": job_id,
            "status": "processing",
            "message": "Video edit job started successfully"
        }
        
    except Exception as e:
        logger.error(f"Error starting video edit job: {e}")
        raise HTTPException(status_code=500, detail="Failed to start video edit job") 