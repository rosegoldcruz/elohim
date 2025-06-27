"""
AEON AI Video Generation SaaS Platform - Dashboard Agent
Based on MIT-licensed ai-video-generator, restructured for 7-agent architecture
License: MIT (see LICENSE file)

Agent 7/7: Dashboard
- Returns user credit balance, video order history, and account data
- Provides admin analytics (MRR, churn, queue load, user stats)
- Generates business intelligence and operational metrics
- Handles both user and admin dashboard data
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List
from models import DashboardRequest, DashboardResponse, AdminAnalytics, VideoQueue
from database import db

logger = logging.getLogger(__name__)

class DashboardAgent:
    def __init__(self):
        self.agent_name = "dashboard"
    
    async def get_user_dashboard(self, user_id: str) -> Dict[str, Any]:
        """Get user dashboard data including credits, videos, and account info"""
        try:
            # Get user data
            user = await db.client.table("users").select("*").eq("id", user_id).single().execute()
            if not user.data:
                raise Exception("User not found")
            
            user_data = user.data
            
            # Get user videos
            videos = await db.get_user_videos(user_id)
            
            # Get credit history
            credits_result = await db.client.table("credits").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
            credit_history = credits_result.data or []
            
            # Get orders
            orders_result = await db.client.table("orders").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
            orders = orders_result.data or []
            
            # Calculate usage statistics
            usage_stats = await self._calculate_user_usage_stats(user_id)
            
            dashboard_data = {
                "user": {
                    "id": user_data["id"],
                    "email": user_data["email"],
                    "full_name": user_data.get("full_name"),
                    "credits": user_data.get("credits", 0),
                    "subscription_tier": user_data.get("subscription_tier", "free"),
                    "subscription_status": user_data.get("subscription_status", "inactive"),
                    "created_at": user_data["created_at"]
                },
                "videos": {
                    "total": len(videos),
                    "completed": len([v for v in videos if v.get("status") == "completed"]),
                    "processing": len([v for v in videos if v.get("status") == "processing"]),
                    "failed": len([v for v in videos if v.get("status") == "failed"]),
                    "recent": videos[:5]  # Last 5 videos
                },
                "credits": {
                    "current_balance": user_data.get("credits", 0),
                    "total_earned": sum(c["amount"] for c in credit_history if c["amount"] > 0),
                    "total_spent": abs(sum(c["amount"] for c in credit_history if c["amount"] < 0)),
                    "recent_transactions": credit_history
                },
                "orders": {
                    "total": len(orders),
                    "total_spent": sum(o["amount"] for o in orders if o.get("status") == "completed"),
                    "recent": orders
                },
                "usage_stats": usage_stats
            }
            
            return DashboardResponse(
                success=True,
                user_data=dashboard_data,
                admin_data=None
            ).model_dump()
            
        except Exception as e:
            logger.error(f"User dashboard failed for {user_id}: {str(e)}")
            return {
                "success": False,
                "user_data": None,
                "admin_data": None,
                "error": str(e)
            }
    
    async def get_admin_dashboard(self) -> Dict[str, Any]:
        """Get admin dashboard with business metrics and operational data"""
        try:
            # Get admin analytics
            analytics = await self._get_admin_analytics()
            
            # Get video queue status
            queue_status = await self._get_video_queue_status()
            
            # Get user growth metrics
            user_metrics = await self._get_user_growth_metrics()
            
            # Get revenue metrics
            revenue_metrics = await self._get_revenue_metrics()
            
            # Get system health metrics
            system_metrics = await self._get_system_health_metrics()
            
            admin_data = {
                "analytics": analytics,
                "queue": queue_status,
                "users": user_metrics,
                "revenue": revenue_metrics,
                "system": system_metrics,
                "generated_at": datetime.now().isoformat()
            }
            
            return DashboardResponse(
                success=True,
                user_data=None,
                admin_data=admin_data
            ).model_dump()
            
        except Exception as e:
            logger.error(f"Admin dashboard failed: {str(e)}")
            return {
                "success": False,
                "user_data": None,
                "admin_data": None,
                "error": str(e)
            }
    
    async def _calculate_user_usage_stats(self, user_id: str) -> Dict[str, Any]:
        """Calculate user usage statistics"""
        try:
            # Get videos from last 30 days
            thirty_days_ago = datetime.now() - timedelta(days=30)
            
            videos_result = await db.client.table("videos").select("*").eq("user_id", user_id).gte("created_at", thirty_days_ago.isoformat()).execute()
            recent_videos = videos_result.data or []
            
            # Calculate stats
            total_duration = sum(v.get("duration", 0) for v in recent_videos if v.get("status") == "completed")
            avg_processing_time = await self._calculate_avg_processing_time(user_id)
            
            return {
                "videos_this_month": len(recent_videos),
                "total_video_duration": total_duration,
                "avg_processing_time": avg_processing_time,
                "favorite_duration": self._get_most_common_duration(recent_videos),
                "success_rate": len([v for v in recent_videos if v.get("status") == "completed"]) / max(len(recent_videos), 1)
            }
            
        except Exception as e:
            logger.error(f"Usage stats calculation failed: {str(e)}")
            return {}
    
    async def _get_admin_analytics(self) -> Dict[str, Any]:
        """Get admin analytics from database view"""
        try:
            # This would use the admin_analytics view from the database
            analytics_result = await db.get_admin_analytics()
            
            return {
                "total_users": analytics_result.get("total_users", 0),
                "new_users_30d": analytics_result.get("new_users_30d", 0),
                "total_videos": analytics_result.get("total_videos", 0),
                "completed_videos": analytics_result.get("completed_videos", 0),
                "videos_24h": analytics_result.get("videos_24h", 0),
                "total_revenue": float(analytics_result.get("total_revenue", 0)),
                "revenue_30d": float(analytics_result.get("revenue_30d", 0)),
                "avg_processing_time": analytics_result.get("avg_processing_time")
            }
            
        except Exception as e:
            logger.error(f"Admin analytics failed: {str(e)}")
            return {}
    
    async def _get_video_queue_status(self) -> Dict[str, Any]:
        """Get current video queue status"""
        try:
            queue_data = await db.get_video_queue()
            
            return {
                "pending_count": len(queue_data.get("pending_videos", [])),
                "processing_count": len(queue_data.get("processing_videos", [])),
                "queue_length": queue_data.get("queue_length", 0),
                "pending_videos": queue_data.get("pending_videos", [])[:10],  # Last 10
                "processing_videos": queue_data.get("processing_videos", [])
            }
            
        except Exception as e:
            logger.error(f"Queue status failed: {str(e)}")
            return {}
    
    async def _get_user_growth_metrics(self) -> Dict[str, Any]:
        """Get user growth and engagement metrics"""
        try:
            # Users by day for last 30 days
            thirty_days_ago = datetime.now() - timedelta(days=30)
            seven_days_ago = datetime.now() - timedelta(days=7)
            
            # Total users
            total_users_result = await db.client.table("users").select("id", count="exact").execute()
            total_users = total_users_result.count or 0
            
            # New users last 30 days
            new_users_30d_result = await db.client.table("users").select("id", count="exact").gte("created_at", thirty_days_ago.isoformat()).execute()
            new_users_30d = new_users_30d_result.count or 0
            
            # New users last 7 days
            new_users_7d_result = await db.client.table("users").select("id", count="exact").gte("created_at", seven_days_ago.isoformat()).execute()
            new_users_7d = new_users_7d_result.count or 0
            
            # Active users (users with videos in last 30 days)
            active_users_result = await db.client.table("videos").select("user_id").gte("created_at", thirty_days_ago.isoformat()).execute()
            active_user_ids = set(v["user_id"] for v in (active_users_result.data or []))
            active_users = len(active_user_ids)
            
            return {
                "total_users": total_users,
                "new_users_30d": new_users_30d,
                "new_users_7d": new_users_7d,
                "active_users_30d": active_users,
                "growth_rate_30d": (new_users_30d / max(total_users - new_users_30d, 1)) * 100,
                "activation_rate": (active_users / max(total_users, 1)) * 100
            }
            
        except Exception as e:
            logger.error(f"User growth metrics failed: {str(e)}")
            return {}
    
    async def _get_revenue_metrics(self) -> Dict[str, Any]:
        """Get revenue and subscription metrics"""
        try:
            thirty_days_ago = datetime.now() - timedelta(days=30)
            
            # Total revenue
            total_revenue_result = await db.client.table("orders").select("amount").eq("status", "completed").execute()
            total_revenue = sum(o["amount"] for o in (total_revenue_result.data or []))
            
            # Revenue last 30 days
            revenue_30d_result = await db.client.table("orders").select("amount").eq("status", "completed").gte("created_at", thirty_days_ago.isoformat()).execute()
            revenue_30d = sum(o["amount"] for o in (revenue_30d_result.data or []))
            
            # Subscription metrics
            subscription_users_result = await db.client.table("users").select("subscription_tier", count="exact").neq("subscription_tier", "free").execute()
            subscription_users = subscription_users_result.count or 0
            
            # MRR calculation (simplified)
            mrr = revenue_30d  # This would be more sophisticated in production
            
            return {
                "total_revenue": total_revenue,
                "revenue_30d": revenue_30d,
                "mrr": mrr,
                "subscription_users": subscription_users,
                "avg_order_value": total_revenue / max(len(total_revenue_result.data or []), 1),
                "revenue_growth_30d": ((revenue_30d / max(total_revenue - revenue_30d, 1)) * 100) if total_revenue > revenue_30d else 0
            }
            
        except Exception as e:
            logger.error(f"Revenue metrics failed: {str(e)}")
            return {}
    
    async def _get_system_health_metrics(self) -> Dict[str, Any]:
        """Get system health and performance metrics"""
        try:
            # Video generation success rate
            total_videos_result = await db.client.table("videos").select("status", count="exact").execute()
            total_videos = total_videos_result.count or 0
            
            completed_videos_result = await db.client.table("videos").select("id", count="exact").eq("status", "completed").execute()
            completed_videos = completed_videos_result.count or 0
            
            failed_videos_result = await db.client.table("videos").select("id", count="exact").eq("status", "failed").execute()
            failed_videos = failed_videos_result.count or 0
            
            success_rate = (completed_videos / max(total_videos, 1)) * 100
            failure_rate = (failed_videos / max(total_videos, 1)) * 100
            
            # Average processing time
            avg_processing_time = await self._calculate_system_avg_processing_time()
            
            return {
                "total_videos_processed": total_videos,
                "success_rate": success_rate,
                "failure_rate": failure_rate,
                "avg_processing_time": avg_processing_time,
                "system_uptime": "99.9%",  # This would come from monitoring
                "api_response_time": "150ms"  # This would come from monitoring
            }
            
        except Exception as e:
            logger.error(f"System health metrics failed: {str(e)}")
            return {}
    
    async def _calculate_avg_processing_time(self, user_id: str) -> float:
        """Calculate average processing time for a user"""
        try:
            # This would calculate based on processing_started_at and processing_completed_at
            # For now, return a placeholder
            return 5.2  # 5.2 minutes average
            
        except Exception as e:
            logger.error(f"Avg processing time calculation failed: {str(e)}")
            return 0.0
    
    async def _calculate_system_avg_processing_time(self) -> float:
        """Calculate system-wide average processing time"""
        try:
            # This would calculate based on all completed videos
            # For now, return a placeholder
            return 4.8  # 4.8 minutes average
            
        except Exception as e:
            logger.error(f"System avg processing time calculation failed: {str(e)}")
            return 0.0
    
    def _get_most_common_duration(self, videos: List[Dict[str, Any]]) -> int:
        """Get the most commonly requested video duration"""
        try:
            durations = [v.get("duration", 60) for v in videos if v.get("duration")]
            if not durations:
                return 60
            
            # Count occurrences
            duration_counts = {}
            for duration in durations:
                duration_counts[duration] = duration_counts.get(duration, 0) + 1
            
            # Return most common
            return max(duration_counts, key=duration_counts.get)
            
        except Exception as e:
            logger.error(f"Most common duration calculation failed: {str(e)}")
            return 60
