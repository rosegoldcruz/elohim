"""
Database operations for AEON Video Processing Agent
"""

import asyncio
from typing import List, Optional, Dict, Any
from supabase import create_client, Client
from src.config import Config
from src.logger import get_logger

logger = get_logger("database")


class Database:
    """Database client for Supabase operations"""
    
    def __init__(self, config: Config):
        self.config = config
        self.client: Client = create_client(
            config.SUPABASE_URL,
            config.SUPABASE_SERVICE_ROLE_KEY
        )
    
    async def get_pending_jobs(self) -> List[Dict[str, Any]]:
        """Get jobs with status 'created' that need processing"""
        try:
            response = self.client.table("agent_jobs").select("*").eq("status", "created").order("created_at").execute()
            return response.data
        except Exception as e:
            logger.error(f"Failed to fetch pending jobs: {e}")
            return []
    
    async def update_job_status(self, job_id: str, status: str, **kwargs) -> bool:
        """Update job status and optional additional fields"""
        try:
            update_data = {"status": status}
            update_data.update(kwargs)
            
            response = self.client.table("agent_jobs").update(update_data).eq("id", job_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Failed to update job {job_id} status to {status}: {e}")
            return False
    
    async def mark_job_processing(self, job_id: str) -> bool:
        """Mark job as processing"""
        return await self.update_job_status(
            job_id, 
            "processing",
            started_at="now()"
        )
    
    async def mark_job_completed(self, job_id: str, output_url: str, metadata: Optional[Dict] = None) -> bool:
        """Mark job as completed with output URL"""
        update_data = {
            "output_url": output_url,
            "completed_at": "now()"
        }
        if metadata:
            update_data["output_metadata"] = metadata
        
        return await self.update_job_status(job_id, "completed", **update_data)
    
    async def mark_job_failed(self, job_id: str, error_message: str) -> bool:
        """Mark job as failed with error message"""
        return await self.update_job_status(
            job_id,
            "failed",
            error_message=error_message,
            completed_at="now()"
        )
    
    async def get_job_by_id(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Get job by ID"""
        try:
            response = self.client.table("agent_jobs").select("*").eq("id", job_id).single().execute()
            return response.data
        except Exception as e:
            logger.error(f"Failed to fetch job {job_id}: {e}")
            return None
    
    async def get_user_credits(self, user_id: str) -> int:
        """Get user's available credits"""
        try:
            response = self.client.table("users").select("credits").eq("id", user_id).single().execute()
            return response.data.get("credits", 0) if response.data else 0
        except Exception as e:
            logger.error(f"Failed to fetch credits for user {user_id}: {e}")
            return 0
    
    async def deduct_credits(self, user_id: str, amount: int) -> bool:
        """Deduct credits from user account"""
        try:
            # Get current credits
            current_credits = await self.get_user_credits(user_id)
            if current_credits < amount:
                logger.warning(f"User {user_id} has insufficient credits: {current_credits} < {amount}")
                return False
            
            # Deduct credits
            new_credits = current_credits - amount
            response = self.client.table("users").update({"credits": new_credits}).eq("id", user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Failed to deduct {amount} credits from user {user_id}: {e}")
            return False
    
    async def add_credits(self, user_id: str, amount: int) -> bool:
        """Add credits to user account (for refunds)"""
        try:
            current_credits = await self.get_user_credits(user_id)
            new_credits = current_credits + amount
            response = self.client.table("users").update({"credits": new_credits}).eq("id", user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Failed to add {amount} credits to user {user_id}: {e}")
            return False
    
    async def log_job_progress(self, job_id: str, progress: int, message: str = "") -> bool:
        """Log job progress (0-100)"""
        try:
            update_data = {"progress": progress}
            if message:
                update_data["progress_message"] = message
            
            response = self.client.table("agent_jobs").update(update_data).eq("id", job_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Failed to log progress for job {job_id}: {e}")
            return False
