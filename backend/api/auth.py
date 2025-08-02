"""
Authentication API Routes
Handles Clerk authentication and user management
"""

import os
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from utils.auth import verify_clerk_jwt
from utils.config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()

class UserProfile(BaseModel):
    """User profile model"""
    user_id: str
    email: str
    email_verified: bool
    created_at: str
    updated_at: str

class AuthResponse(BaseModel):
    """Authentication response model"""
    authenticated: bool
    user: Optional[UserProfile] = None
    message: str

@router.get("/me", response_model=AuthResponse)
async def get_current_user(
    current_user: dict = Depends(verify_clerk_jwt)
):
    """Get current authenticated user profile"""
    
    try:
        user_profile = UserProfile(
            user_id=current_user.get("user_id"),
            email=current_user.get("email", ""),
            email_verified=current_user.get("email_verified", False),
            created_at=current_user.get("iat", ""),
            updated_at=current_user.get("exp", "")
        )
        
        return AuthResponse(
            authenticated=True,
            user=user_profile,
            message="User authenticated successfully"
        )
        
    except Exception as e:
        logger.error(f"Error getting user profile: {e}")
        return AuthResponse(
            authenticated=False,
            user=None,
            message="Failed to get user profile"
        )

@router.post("/verify")
async def verify_token(
    token: str
):
    """Verify a JWT token"""
    
    try:
        user_data = await verify_clerk_jwt(token)
        return {
            "valid": True,
            "user": user_data,
            "message": "Token is valid"
        }
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        return {
            "valid": False,
            "user": None,
            "message": "Token is invalid"
        }

@router.get("/config")
async def get_auth_config():
    """Get authentication configuration (public)"""
    
    settings = get_settings()
    
    return {
        "clerk_publishable_key": settings.clerk_publishable_key,
        "clerk_jwt_issuer": settings.clerk_jwt_issuer,
        "allowed_origins": settings.allowed_origins.split(",")
    }

@router.post("/logout")
async def logout_user(
    current_user: dict = Depends(verify_clerk_jwt)
):
    """Logout user (backend cleanup)"""
    
    user_id = current_user.get("user_id")
    logger.info(f"User {user_id} logged out")
    
    # In a real implementation, you might:
    # - Invalidate refresh tokens
    # - Clear session data
    # - Log the logout event
    
    return {
        "message": "Logged out successfully",
        "user_id": user_id
    } 