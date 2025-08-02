"""
Configuration utilities for AEON Video Backend
Handles environment variables and application settings
"""

import os
from typing import Optional
from pydantic import BaseSettings

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Server Configuration
    host: str = "0.0.0.0"
    port: int = 8000
    environment: str = "production"
    
    # Clerk Authentication
    clerk_secret_key: Optional[str] = None
    clerk_publishable_key: Optional[str] = None
    clerk_jwt_issuer: Optional[str] = None
    
    # Supabase Database
    supabase_url: Optional[str] = None
    supabase_service_role_key: Optional[str] = None
    supabase_anon_key: Optional[str] = None
    
    # Replicate API
    replicate_api_token: Optional[str] = None
    
    # OpenAI API
    openai_api_key: Optional[str] = None
    
    # ElevenLabs API
    elevenlabs_api_key: Optional[str] = None
    
    # Vercel Blob Storage
    vercel_blob_read_write_token: Optional[str] = None
    
    # Stripe
    stripe_secret_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    
    # CORS Origins
    allowed_origins: str = "https://smart4technology.com,https://vercel.app,http://localhost:3000"
    
    class Config:
        env_file = ".env"
        case_sensitive = False

def get_settings() -> Settings:
    """Get application settings"""
    return Settings()

def validate_required_settings():
    """Validate that all required environment variables are set"""
    settings = get_settings()
    required_vars = [
        "clerk_secret_key",
        "supabase_url", 
        "supabase_service_role_key",
        "replicate_api_token"
    ]
    
    missing_vars = []
    for var in required_vars:
        if not getattr(settings, var):
            missing_vars.append(var)
    
    if missing_vars:
        raise ValueError(f"Missing required environment variables: {', '.join(missing_vars)}")
    
    return settings 