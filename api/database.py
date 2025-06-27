"""
AEON SaaS Video Generation Platform - Database Connection
Supabase integration for FastAPI backend
"""

import os
from supabase import create_client, Client
from typing import Optional, Dict, Any, List
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class Database:
    def __init__(self):
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not self.supabase_url or not self.supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set")
        
        self.client: Client = create_client(self.supabase_url, self.supabase_key)
    
    # User operations
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.client.table("users").select("*").eq("email", email).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting user by email: {e}")
            return None
    
    async def create_user(self, email: str, full_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        try:
            user_data = {
                "email": email,
                "full_name": full_name or email.split("@")[0],
                "credits": 0,
                "subscription_tier": "free",
                "subscription_status": "inactive"
            }
            response = self.client.table("users").insert(user_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return None
    
    async def update_user_credits(self, user_id: str, credits: int) -> bool:
        try:
            response = self.client.table("users").update({"credits": credits}).eq("id", user_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating user credits: {e}")
            return False
    
    # Video operations
    async def create_video(self, user_id: str, title: str, prompt: str, duration: int) -> Optional[Dict[str, Any]]:
        try:
            video_data = {
                "user_id": user_id,
                "title": title,
                "prompt": prompt,
                "duration": duration,
                "status": "pending"
            }
            response = self.client.table("videos").insert(video_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating video: {e}")
            return None
    
    async def get_video(self, video_id: str) -> Optional[Dict[str, Any]]:
        try:
            response = self.client.table("videos").select("*").eq("id", video_id).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error getting video: {e}")
            return None
    
    async def update_video_status(self, video_id: str, status: str, **kwargs) -> bool:
        try:
            update_data = {"status": status, "updated_at": datetime.utcnow().isoformat()}
            update_data.update(kwargs)
            response = self.client.table("videos").update(update_data).eq("id", video_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating video status: {e}")
            return False
    
    async def get_user_videos(self, user_id: str) -> List[Dict[str, Any]]:
        try:
            response = self.client.table("videos").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting user videos: {e}")
            return []
    
    # Order operations
    async def create_order(self, user_id: str, product_type: str, amount: float, **kwargs) -> Optional[Dict[str, Any]]:
        try:
            order_data = {
                "user_id": user_id,
                "product_type": product_type,
                "amount": amount,
                "status": "pending",
                **kwargs
            }
            response = self.client.table("orders").insert(order_data).execute()
            return response.data[0] if response.data else None
        except Exception as e:
            logger.error(f"Error creating order: {e}")
            return None
    
    async def update_order_status(self, order_id: str, status: str, **kwargs) -> bool:
        try:
            update_data = {"status": status, **kwargs}
            response = self.client.table("orders").update(update_data).eq("id", order_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating order status: {e}")
            return False
    
    # Credit operations
    async def add_credits(self, user_id: str, amount: int, credit_type: str, description: str = None, **kwargs) -> bool:
        try:
            # Use the database function
            response = self.client.rpc("add_credits", {
                "p_user_id": user_id,
                "p_amount": amount,
                "p_type": credit_type,
                "p_description": description,
                **kwargs
            }).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error adding credits: {e}")
            return False
    
    async def use_credits(self, user_id: str, amount: int, description: str, video_id: str = None) -> bool:
        try:
            # Use the database function
            response = self.client.rpc("use_credits", {
                "p_user_id": user_id,
                "p_amount": amount,
                "p_description": description,
                "p_video_id": video_id
            }).execute()
            return response.data
        except Exception as e:
            logger.error(f"Error using credits: {e}")
            return False
    
    async def get_user_credits(self, user_id: str) -> int:
        try:
            response = self.client.table("users").select("credits").eq("id", user_id).execute()
            return response.data[0]["credits"] if response.data else 0
        except Exception as e:
            logger.error(f"Error getting user credits: {e}")
            return 0
    
    # Agent operations
    async def create_agent_log(self, video_id: str, agent_name: str, input_data: Dict[str, Any] = None) -> Optional[str]:
        try:
            agent_data = {
                "video_id": video_id,
                "agent_name": agent_name,
                "status": "pending",
                "input_data": input_data
            }
            response = self.client.table("agents").insert(agent_data).execute()
            return response.data[0]["id"] if response.data else None
        except Exception as e:
            logger.error(f"Error creating agent log: {e}")
            return None
    
    async def update_agent_log(self, agent_id: str, status: str, output_data: Dict[str, Any] = None, error_message: str = None) -> bool:
        try:
            update_data = {
                "status": status,
                "output_data": output_data,
                "error_message": error_message
            }
            
            if status == "running":
                update_data["started_at"] = datetime.utcnow().isoformat()
            elif status in ["completed", "failed"]:
                update_data["completed_at"] = datetime.utcnow().isoformat()
            
            response = self.client.table("agents").update(update_data).eq("id", agent_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating agent log: {e}")
            return False
    
    # Video scene operations
    async def create_video_scene(self, video_id: str, scene_number: int, model_name: str, prompt: str) -> Optional[str]:
        try:
            scene_data = {
                "video_id": video_id,
                "scene_number": scene_number,
                "model_name": model_name,
                "prompt": prompt,
                "status": "pending"
            }
            response = self.client.table("video_scenes").insert(scene_data).execute()
            return response.data[0]["id"] if response.data else None
        except Exception as e:
            logger.error(f"Error creating video scene: {e}")
            return None
    
    async def update_video_scene(self, scene_id: str, status: str, **kwargs) -> bool:
        try:
            update_data = {"status": status, **kwargs}
            response = self.client.table("video_scenes").update(update_data).eq("id", scene_id).execute()
            return len(response.data) > 0
        except Exception as e:
            logger.error(f"Error updating video scene: {e}")
            return False
    
    async def get_video_scenes(self, video_id: str) -> List[Dict[str, Any]]:
        try:
            response = self.client.table("video_scenes").select("*").eq("video_id", video_id).order("scene_number").execute()
            return response.data or []
        except Exception as e:
            logger.error(f"Error getting video scenes: {e}")
            return []
    
    # Admin operations
    async def get_admin_analytics(self) -> Dict[str, Any]:
        try:
            response = self.client.table("admin_analytics").select("*").execute()
            return response.data[0] if response.data else {}
        except Exception as e:
            logger.error(f"Error getting admin analytics: {e}")
            return {}
    
    async def get_video_queue(self) -> Dict[str, Any]:
        try:
            pending = self.client.table("videos").select("*").eq("status", "pending").order("created_at").execute()
            processing = self.client.table("videos").select("*").eq("status", "processing").order("created_at").execute()
            
            return {
                "pending_videos": pending.data or [],
                "processing_videos": processing.data or [],
                "queue_length": len(pending.data or [])
            }
        except Exception as e:
            logger.error(f"Error getting video queue: {e}")
            return {"pending_videos": [], "processing_videos": [], "queue_length": 0}

# Global database instance
db = Database()
