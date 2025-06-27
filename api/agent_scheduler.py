"""
AEON AI Video Generation SaaS Platform - Scheduler Agent
Based on MIT-licensed ai-video-generator, restructured for 7-agent architecture
License: MIT (see LICENSE file)

Agent 4/7: Scheduler
- Handles async task queues and job status updates
- Manages video generation pipeline orchestration
- Provides real-time job progress tracking
- Implements queue management and priority handling
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from models import JobStatusResponse
from database import db

logger = logging.getLogger(__name__)

class SchedulerAgent:
    def __init__(self):
        self.agent_name = "scheduler"
        self.background_tasks = set()
        self.job_queue = asyncio.Queue()
        self.active_jobs = {}
        self.is_running = False
    
    async def start_background_tasks(self):
        """Start background task processing"""
        self.is_running = True
        
        # Start queue processor
        task = asyncio.create_task(self._process_queue())
        self.background_tasks.add(task)
        task.add_done_callback(self.background_tasks.discard)
        
        # Start status updater
        task = asyncio.create_task(self._update_job_statuses())
        self.background_tasks.add(task)
        task.add_done_callback(self.background_tasks.discard)
        
        logger.info("Scheduler background tasks started")
    
    async def stop_background_tasks(self):
        """Stop background task processing"""
        self.is_running = False
        
        # Cancel all background tasks
        for task in self.background_tasks:
            task.cancel()
        
        # Wait for tasks to complete
        await asyncio.gather(*self.background_tasks, return_exceptions=True)
        self.background_tasks.clear()
        
        logger.info("Scheduler background tasks stopped")
    
    async def queue_video_job(self, video_id: str, priority: int = 0) -> bool:
        """Queue a video generation job"""
        try:
            job_data = {
                "video_id": video_id,
                "priority": priority,
                "queued_at": datetime.now(),
                "status": "queued"
            }
            
            await self.job_queue.put(job_data)
            self.active_jobs[video_id] = job_data
            
            # Update video status in database
            await db.update_video_status(video_id, "queued")
            
            logger.info(f"Video job {video_id} queued with priority {priority}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to queue video job {video_id}: {str(e)}")
            return False
    
    async def get_job_status(self, video_id: str) -> Dict[str, Any]:
        """Get current job status and progress"""
        try:
            # Get video from database
            video = await db.get_video(video_id)
            if not video:
                return JobStatusResponse(
                    video_id=video_id,
                    status="not_found",
                    progress=0.0,
                    error_message="Video not found"
                ).model_dump()
            
            # Calculate progress based on agent completion
            progress = await self._calculate_progress(video_id)
            
            # Get current agent
            current_agent = await self._get_current_agent(video_id)
            
            # Estimate completion time
            estimated_completion = await self._estimate_completion_time(video_id, video["status"])
            
            return JobStatusResponse(
                video_id=video_id,
                status=video["status"],
                progress=progress,
                current_agent=current_agent,
                estimated_completion=estimated_completion,
                error_message=video.get("error_message")
            ).model_dump()
            
        except Exception as e:
            logger.error(f"Failed to get job status for {video_id}: {str(e)}")
            return JobStatusResponse(
                video_id=video_id,
                status="error",
                progress=0.0,
                error_message=str(e)
            ).model_dump()
    
    async def get_queue_status(self) -> Dict[str, Any]:
        """Get overall queue status and statistics"""
        try:
            queue_data = await db.get_video_queue()
            
            # Calculate average processing time
            avg_processing_time = await self._calculate_avg_processing_time()
            
            # Get queue position for each pending video
            pending_videos = queue_data.get("pending_videos", [])
            for i, video in enumerate(pending_videos):
                video["queue_position"] = i + 1
                video["estimated_wait_time"] = avg_processing_time * i if avg_processing_time else None
            
            return {
                "queue_length": queue_data.get("queue_length", 0),
                "processing_count": len(queue_data.get("processing_videos", [])),
                "pending_videos": pending_videos,
                "processing_videos": queue_data.get("processing_videos", []),
                "avg_processing_time": avg_processing_time,
                "active_jobs": len(self.active_jobs)
            }
            
        except Exception as e:
            logger.error(f"Failed to get queue status: {str(e)}")
            return {
                "queue_length": 0,
                "processing_count": 0,
                "pending_videos": [],
                "processing_videos": [],
                "avg_processing_time": None,
                "active_jobs": 0,
                "error": str(e)
            }
    
    async def _process_queue(self):
        """Background task to process the job queue"""
        while self.is_running:
            try:
                # Wait for job with timeout
                job_data = await asyncio.wait_for(self.job_queue.get(), timeout=1.0)
                
                # Process the job
                await self._process_video_job(job_data)
                
            except asyncio.TimeoutError:
                # No jobs in queue, continue
                continue
            except Exception as e:
                logger.error(f"Queue processing error: {str(e)}")
                await asyncio.sleep(1)
    
    async def _process_video_job(self, job_data: Dict[str, Any]):
        """Process a single video generation job"""
        video_id = job_data["video_id"]
        
        try:
            logger.info(f"Processing video job: {video_id}")
            
            # Update job status
            self.active_jobs[video_id]["status"] = "processing"
            await db.update_video_status(video_id, "processing")
            
            # This would typically trigger the video generation pipeline
            # For now, we'll simulate the process
            await self._simulate_video_processing(video_id)
            
            # Remove from active jobs
            if video_id in self.active_jobs:
                del self.active_jobs[video_id]
            
            logger.info(f"Video job completed: {video_id}")
            
        except Exception as e:
            logger.error(f"Video job failed: {video_id} - {str(e)}")
            
            # Update job status to failed
            await db.update_video_status(video_id, "failed", error_message=str(e))
            
            # Remove from active jobs
            if video_id in self.active_jobs:
                del self.active_jobs[video_id]
    
    async def _simulate_video_processing(self, video_id: str):
        """Simulate video processing (replace with actual pipeline)"""
        # This is a placeholder - in production, this would:
        # 1. Call ScriptWriter agent
        # 2. Call VisualGen agent
        # 3. Call Editor agent
        # 4. Update final status
        
        stages = ["scriptwriter", "visualgen", "editor"]
        
        for i, stage in enumerate(stages):
            # Simulate processing time
            await asyncio.sleep(2)  # 2 seconds per stage for demo
            
            # Update progress
            progress = (i + 1) / len(stages)
            logger.info(f"Video {video_id} - {stage} stage: {progress:.1%}")
        
        # Mark as completed
        await db.update_video_status(video_id, "completed")
    
    async def _update_job_statuses(self):
        """Background task to update job statuses"""
        while self.is_running:
            try:
                # Update stale jobs (jobs that have been processing too long)
                await self._check_stale_jobs()
                
                # Sleep for 30 seconds before next check
                await asyncio.sleep(30)
                
            except Exception as e:
                logger.error(f"Status update error: {str(e)}")
                await asyncio.sleep(30)
    
    async def _check_stale_jobs(self):
        """Check for jobs that have been processing too long"""
        try:
            # Get jobs that have been processing for more than 10 minutes
            stale_threshold = datetime.now() - timedelta(minutes=10)
            
            # This would query the database for stale jobs
            # For now, we'll just check our active jobs
            stale_jobs = []
            for video_id, job_data in self.active_jobs.items():
                if job_data.get("queued_at", datetime.now()) < stale_threshold:
                    stale_jobs.append(video_id)
            
            # Mark stale jobs as failed
            for video_id in stale_jobs:
                logger.warning(f"Marking stale job as failed: {video_id}")
                await db.update_video_status(
                    video_id, 
                    "failed", 
                    error_message="Job timed out"
                )
                
                if video_id in self.active_jobs:
                    del self.active_jobs[video_id]
                    
        except Exception as e:
            logger.error(f"Stale job check failed: {str(e)}")
    
    async def _calculate_progress(self, video_id: str) -> float:
        """Calculate job progress based on completed agents"""
        try:
            # Get agent logs for this video
            # This would query the agents table
            # For now, return a simple calculation based on status
            
            video = await db.get_video(video_id)
            if not video:
                return 0.0
            
            status = video.get("status", "pending")
            
            progress_map = {
                "pending": 0.0,
                "queued": 0.1,
                "processing": 0.5,
                "completed": 1.0,
                "failed": 0.0
            }
            
            return progress_map.get(status, 0.0)
            
        except Exception as e:
            logger.error(f"Progress calculation failed for {video_id}: {str(e)}")
            return 0.0
    
    async def _get_current_agent(self, video_id: str) -> Optional[str]:
        """Get the currently processing agent for a video"""
        try:
            # This would query the agents table for the latest running agent
            # For now, return a simple status-based agent
            
            video = await db.get_video(video_id)
            if not video:
                return None
            
            status = video.get("status", "pending")
            
            if status == "processing":
                return "visualgen"  # Assume we're in the visual generation phase
            elif status == "queued":
                return "scheduler"
            else:
                return None
                
        except Exception as e:
            logger.error(f"Current agent lookup failed for {video_id}: {str(e)}")
            return None
    
    async def _estimate_completion_time(self, video_id: str, status: str) -> Optional[str]:
        """Estimate job completion time"""
        try:
            if status == "completed":
                return "Completed"
            elif status == "failed":
                return "Failed"
            elif status == "pending":
                # Estimate based on queue position
                queue_position = await self._get_queue_position(video_id)
                avg_time = await self._calculate_avg_processing_time()
                
                if queue_position and avg_time:
                    estimated_minutes = queue_position * avg_time
                    return f"{estimated_minutes:.0f} minutes"
                else:
                    return "5-10 minutes"
            else:
                return "3-5 minutes"
                
        except Exception as e:
            logger.error(f"Completion time estimation failed for {video_id}: {str(e)}")
            return None
    
    async def _get_queue_position(self, video_id: str) -> Optional[int]:
        """Get position in queue for a video"""
        try:
            # This would calculate actual queue position
            # For now, return a placeholder
            return 1
            
        except Exception as e:
            logger.error(f"Queue position lookup failed for {video_id}: {str(e)}")
            return None
    
    async def _calculate_avg_processing_time(self) -> Optional[float]:
        """Calculate average processing time in minutes"""
        try:
            # This would query completed videos and calculate average processing time
            # For now, return a placeholder
            return 5.0  # 5 minutes average
            
        except Exception as e:
            logger.error(f"Average processing time calculation failed: {str(e)}")
            return None
