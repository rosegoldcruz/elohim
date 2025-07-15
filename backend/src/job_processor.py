"""
Job processor for AEON Video Processing Agent
Polls Supabase for jobs and processes them
"""

import asyncio
import time
from typing import Dict, Any, Set
from datetime import datetime

from src.config import Config
from src.database import Database
from src.storage import get_storage_client
from src.video_processor import ViralVideoProcessor
from src.logger import get_logger, JobLogger

logger = get_logger("job_processor")


class JobProcessor:
    """Main job processing engine"""
    
    def __init__(self, config: Config):
        self.config = config
        self.db = Database(config)
        self.storage = get_storage_client(config)
        self.is_running = False
        self.current_jobs: Set[str] = set()
        self.max_concurrent_jobs = config.MAX_CONCURRENT_JOBS
        self.poll_interval = config.POLL_INTERVAL
        
        # Statistics
        self.jobs_processed = 0
        self.jobs_failed = 0
        self.start_time = None
    
    async def start(self):
        """Start the job processor"""
        self.is_running = True
        self.start_time = datetime.now()
        logger.info("Job processor started")
        
        while self.is_running:
            try:
                await self._process_pending_jobs()
                await asyncio.sleep(self.poll_interval)
            except Exception as e:
                logger.error(f"Error in job processing loop: {e}")
                await asyncio.sleep(self.poll_interval)
    
    async def stop(self):
        """Stop the job processor gracefully"""
        self.is_running = False
        
        # Wait for current jobs to complete
        while self.current_jobs:
            logger.info(f"Waiting for {len(self.current_jobs)} jobs to complete...")
            await asyncio.sleep(1)
        
        logger.info("Job processor stopped")
    
    async def _process_pending_jobs(self):
        """Process pending jobs from the database"""
        if len(self.current_jobs) >= self.max_concurrent_jobs:
            return
        
        # Get pending jobs
        pending_jobs = await self.db.get_pending_jobs()
        
        if not pending_jobs:
            return
        
        logger.info(f"Found {len(pending_jobs)} pending jobs")
        
        # Process jobs up to the concurrent limit
        for job in pending_jobs:
            if len(self.current_jobs) >= self.max_concurrent_jobs:
                break
            
            job_id = job["id"]
            if job_id not in self.current_jobs:
                # Start processing job in background
                asyncio.create_task(self._process_job(job))
                self.current_jobs.add(job_id)
    
    async def _process_job(self, job_data: Dict[str, Any]):
        """Process a single job"""
        job_id = job_data["id"]
        job_logger = JobLogger(job_id)
        
        try:
            job_logger.info("Starting job processing")
            
            # Mark job as processing
            await self.db.mark_job_processing(job_id)
            await self.db.log_job_progress(job_id, 10, "Job started")
            
            # Validate job data
            if not self._validate_job_data(job_data):
                raise ValueError("Invalid job data")
            
            await self.db.log_job_progress(job_id, 20, "Job validated")
            
            # Process the video
            processor = ViralVideoProcessor(self.config, job_logger)
            video_path = await processor.process_video(job_data)
            
            await self.db.log_job_progress(job_id, 80, "Video processing completed")
            
            # Upload to storage
            job_logger.info("Uploading video to storage")
            output_url = await self.storage.upload_video(video_path, job_id)
            
            if not output_url:
                raise Exception("Failed to upload video to storage")
            
            await self.db.log_job_progress(job_id, 95, "Video uploaded")
            
            # Mark job as completed
            metadata = {
                "file_size": self._get_file_size(video_path),
                "processing_time": time.time() - job_data.get("started_at", time.time()),
                "resolution": self.config.get_resolution_dimensions(),
                "duration": job_data.get("input_data", {}).get("duration", 60)
            }
            
            await self.db.mark_job_completed(job_id, output_url, metadata)
            await self.db.log_job_progress(job_id, 100, "Job completed successfully")
            
            job_logger.info(f"Job completed successfully: {output_url}")
            self.jobs_processed += 1
            
            # Clean up temporary files
            await self._cleanup_temp_files(video_path)
            
        except Exception as e:
            job_logger.error(f"Job processing failed: {e}")
            
            # Mark job as failed
            await self.db.mark_job_failed(job_id, str(e))
            self.jobs_failed += 1
            
            # Clean up any temporary files
            try:
                await self._cleanup_temp_files(video_path if 'video_path' in locals() else None)
            except:
                pass
        
        finally:
            # Remove from current jobs
            self.current_jobs.discard(job_id)
    
    def _validate_job_data(self, job_data: Dict[str, Any]) -> bool:
        """Validate job data structure"""
        required_fields = ["id", "user_id", "title", "description", "input_data"]
        
        for field in required_fields:
            if field not in job_data:
                logger.error(f"Missing required field: {field}")
                return False
        
        input_data = job_data.get("input_data", {})
        
        # Validate input data
        if not isinstance(input_data, dict):
            logger.error("input_data must be a dictionary")
            return False
        
        # Check duration
        duration = input_data.get("duration", 60)
        if not isinstance(duration, (int, float)) or duration <= 0 or duration > self.config.MAX_VIDEO_DURATION:
            logger.error(f"Invalid duration: {duration}")
            return False
        
        # Check style
        valid_styles = ["viral", "cinematic", "casual", "professional"]
        style = input_data.get("style", "viral")
        if style not in valid_styles:
            logger.error(f"Invalid style: {style}")
            return False
        
        return True
    
    def _get_file_size(self, file_path: str) -> int:
        """Get file size in bytes"""
        try:
            import os
            return os.path.getsize(file_path)
        except:
            return 0
    
    async def _cleanup_temp_files(self, video_path: str = None):
        """Clean up temporary files"""
        try:
            import os
            
            if video_path and os.path.exists(video_path):
                os.remove(video_path)
                logger.debug(f"Cleaned up temporary file: {video_path}")
                
        except Exception as e:
            logger.warning(f"Failed to clean up temporary files: {e}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get processor statistics"""
        uptime = (datetime.now() - self.start_time).total_seconds() if self.start_time else 0
        
        return {
            "is_running": self.is_running,
            "uptime_seconds": uptime,
            "jobs_processed": self.jobs_processed,
            "jobs_failed": self.jobs_failed,
            "current_jobs": len(self.current_jobs),
            "max_concurrent_jobs": self.max_concurrent_jobs,
            "success_rate": (
                self.jobs_processed / (self.jobs_processed + self.jobs_failed) * 100
                if (self.jobs_processed + self.jobs_failed) > 0 else 0
            )
        }
