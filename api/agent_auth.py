"""
AEON AI Video Generation SaaS Platform - Auth Agent
Based on MIT-licensed ai-video-generator, restructured for 7-agent architecture
License: MIT (see LICENSE file)

Agent 6/7: Auth
- Implements Supabase-based magic link authentication
- Handles access token validation and user sessions
- Manages passwordless login flow
- Provides user authentication for all other agents
"""

import os
import secrets
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from models import AuthRequest, AuthResponse, User
from database import db

logger = logging.getLogger(__name__)

class AuthAgent:
    def __init__(self):
        self.agent_name = "auth"
        self.magic_link_expiry_minutes = 15
        self.auth_token_expiry_days = 30
    
    async def send_magic_link(self, request: AuthRequest) -> Dict[str, Any]:
        """Send magic link to user's email"""
        try:
            if request.action != "send_magic_link":
                raise ValueError("Invalid action for send_magic_link")
            
            # Get or create user
            user = await db.get_user_by_email(request.email)
            if not user:
                user = await db.create_user(request.email)
                if not user:
                    raise Exception("Failed to create user")
            
            # Generate magic link token
            magic_token = secrets.token_urlsafe(32)
            expires_at = datetime.now() + timedelta(minutes=self.magic_link_expiry_minutes)
            
            # Store magic link token
            await self._store_magic_link_token(user["id"], magic_token, expires_at)
            
            # Send magic link email (placeholder - implement actual email sending)
            magic_link_url = await self._generate_magic_link_url(magic_token, request.email)
            await self._send_magic_link_email(request.email, magic_link_url)
            
            return AuthResponse(
                success=True,
                message=f"Magic link sent to {request.email}",
                user=None,
                auth_token=None
            ).model_dump()
            
        except Exception as e:
            logger.error(f"Magic link sending failed: {str(e)}")
            return {
                "success": False,
                "message": f"Failed to send magic link: {str(e)}",
                "user": None,
                "auth_token": None
            }
    
    async def verify_token(self, request: AuthRequest) -> Dict[str, Any]:
        """Verify magic link token and create auth session"""
        try:
            if request.action != "verify_token" or not request.token:
                raise ValueError("Invalid action or missing token")
            
            # Verify magic link token
            user = await self._verify_magic_link_token(request.token, request.email)
            if not user:
                raise Exception("Invalid or expired magic link")
            
            # Generate auth token
            auth_token = secrets.token_urlsafe(32)
            expires_at = datetime.now() + timedelta(days=self.auth_token_expiry_days)
            
            # Store auth token
            await self._store_auth_token(user["id"], auth_token, expires_at)
            
            # Invalidate magic link token
            await self._invalidate_magic_link_token(request.token)
            
            # Convert user data to User model
            user_model = User(
                id=user["id"],
                email=user["email"],
                full_name=user.get("full_name"),
                stripe_customer_id=user.get("stripe_customer_id"),
                credits=user.get("credits", 0),
                subscription_tier=user.get("subscription_tier", "free"),
                subscription_status=user.get("subscription_status", "inactive"),
                created_at=datetime.fromisoformat(user["created_at"].replace("Z", "+00:00")),
                updated_at=datetime.fromisoformat(user["updated_at"].replace("Z", "+00:00"))
            )
            
            return AuthResponse(
                success=True,
                message="Authentication successful",
                user=user_model,
                auth_token=auth_token
            ).model_dump()
            
        except Exception as e:
            logger.error(f"Token verification failed: {str(e)}")
            return {
                "success": False,
                "message": f"Authentication failed: {str(e)}",
                "user": None,
                "auth_token": None
            }
    
    async def authenticate_user(self, email: str, auth_token: str = None) -> Dict[str, Any]:
        """Authenticate user by email or auth token"""
        try:
            if auth_token:
                # Validate auth token
                user = await self._validate_auth_token(auth_token)
                if user:
                    return {"success": True, "user": user, "message": "Token authentication successful"}
            
            # Fallback to email lookup
            user = await db.get_user_by_email(email)
            if user:
                return {"success": True, "user": user, "message": "User found"}
            else:
                return {"success": False, "user": None, "message": "User not found"}
                
        except Exception as e:
            logger.error(f"User authentication failed: {str(e)}")
            return {"success": False, "user": None, "message": f"Authentication failed: {str(e)}"}
    
    async def validate_request_auth(self, email: str = None, auth_token: str = None) -> Optional[Dict[str, Any]]:
        """Validate authentication for API requests"""
        try:
            if auth_token:
                user = await self._validate_auth_token(auth_token)
                if user:
                    return user
            
            if email:
                user = await db.get_user_by_email(email)
                if user:
                    return user
            
            return None
            
        except Exception as e:
            logger.error(f"Request auth validation failed: {str(e)}")
            return None
    
    async def logout_user(self, auth_token: str) -> bool:
        """Logout user by invalidating auth token"""
        try:
            await self._invalidate_auth_token(auth_token)
            return True
            
        except Exception as e:
            logger.error(f"Logout failed: {str(e)}")
            return False
    
    async def _store_magic_link_token(self, user_id: str, token: str, expires_at: datetime):
        """Store magic link token in database"""
        try:
            await db.client.table("users").update({
                "magic_link_token": token,
                "magic_link_expires": expires_at.isoformat()
            }).eq("id", user_id).execute()
            
        except Exception as e:
            logger.error(f"Failed to store magic link token: {str(e)}")
            raise e
    
    async def _verify_magic_link_token(self, token: str, email: str) -> Optional[Dict[str, Any]]:
        """Verify magic link token and return user if valid"""
        try:
            result = await db.client.table("users").select("*").eq("email", email).eq("magic_link_token", token).single().execute()
            
            if not result.data:
                return None
            
            user = result.data
            
            # Check if token is expired
            if user.get("magic_link_expires"):
                expires_at = datetime.fromisoformat(user["magic_link_expires"].replace("Z", "+00:00"))
                if datetime.now() > expires_at:
                    return None
            
            return user
            
        except Exception as e:
            logger.error(f"Magic link token verification failed: {str(e)}")
            return None
    
    async def _store_auth_token(self, user_id: str, token: str, expires_at: datetime):
        """Store auth token in database"""
        try:
            await db.client.table("users").update({
                "auth_token": token,
                "auth_token_expires": expires_at.isoformat()
            }).eq("id", user_id).execute()
            
        except Exception as e:
            logger.error(f"Failed to store auth token: {str(e)}")
            raise e
    
    async def _validate_auth_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Validate auth token and return user if valid"""
        try:
            result = await db.client.table("users").select("*").eq("auth_token", token).single().execute()
            
            if not result.data:
                return None
            
            user = result.data
            
            # Check if token is expired
            if user.get("auth_token_expires"):
                expires_at = datetime.fromisoformat(user["auth_token_expires"].replace("Z", "+00:00"))
                if datetime.now() > expires_at:
                    return None
            
            return user
            
        except Exception as e:
            logger.error(f"Auth token validation failed: {str(e)}")
            return None
    
    async def _invalidate_magic_link_token(self, token: str):
        """Invalidate magic link token"""
        try:
            await db.client.table("users").update({
                "magic_link_token": None,
                "magic_link_expires": None
            }).eq("magic_link_token", token).execute()
            
        except Exception as e:
            logger.error(f"Failed to invalidate magic link token: {str(e)}")
    
    async def _invalidate_auth_token(self, token: str):
        """Invalidate auth token"""
        try:
            await db.client.table("users").update({
                "auth_token": None,
                "auth_token_expires": None
            }).eq("auth_token", token).execute()
            
        except Exception as e:
            logger.error(f"Failed to invalidate auth token: {str(e)}")
    
    async def _generate_magic_link_url(self, token: str, email: str) -> str:
        """Generate magic link URL"""
        base_url = os.getenv("NEXT_PUBLIC_APP_URL", "http://localhost:3000")
        return f"{base_url}/auth/verify?token={token}&email={email}"
    
    async def _send_magic_link_email(self, email: str, magic_link_url: str):
        """Send magic link email (placeholder implementation)"""
        try:
            # This would integrate with an email service like:
            # - SendGrid
            # - Mailgun
            # - AWS SES
            # - Supabase Auth (built-in)
            
            logger.info(f"Magic link email would be sent to {email}: {magic_link_url}")
            
            # For development, just log the magic link
            print(f"\n🔗 MAGIC LINK for {email}:")
            print(f"   {magic_link_url}")
            print(f"   Expires in {self.magic_link_expiry_minutes} minutes\n")
            
        except Exception as e:
            logger.error(f"Failed to send magic link email: {str(e)}")
            raise e
