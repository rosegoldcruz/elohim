"""
Configuration management for AEON Video Processing Agent
"""

import os
from typing import Optional


class Config:
    """Application configuration"""
    
    def __init__(self):
        # Supabase Configuration
        self.SUPABASE_URL = self._get_required_env("SUPABASE_URL")
        self.SUPABASE_SERVICE_ROLE_KEY = self._get_required_env("SUPABASE_SERVICE_ROLE_KEY")
        self.SUPABASE_JWT_SECRET = self._get_required_env("SUPABASE_JWT_SECRET")
        
        # Storage Configuration
        self.BLOB_READ_WRITE_TOKEN = self._get_required_env("BLOB_READ_WRITE_TOKEN")
        
        # AI Services (Optional)
        self.OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
        self.REPLICATE_API_TOKEN = os.getenv("REPLICATE_API_TOKEN")
        
        # Application Configuration
        self.ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
        self.LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
        self.POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "5"))
        self.MAX_CONCURRENT_JOBS = int(os.getenv("MAX_CONCURRENT_JOBS", "3"))
        self.PORT = int(os.getenv("PORT", "8000"))
        
        # Directory Configuration
        self.TEMP_DIR = os.getenv("TEMP_DIR", "/tmp/aeon")
        self.OUTPUT_DIR = os.getenv("OUTPUT_DIR", "/tmp/aeon/output")
        
        # Create directories if they don't exist
        os.makedirs(self.TEMP_DIR, exist_ok=True)
        os.makedirs(self.OUTPUT_DIR, exist_ok=True)
        
        # Video Processing Configuration
        self.MAX_VIDEO_DURATION = int(os.getenv("MAX_VIDEO_DURATION", "300"))  # 5 minutes
        self.DEFAULT_FPS = int(os.getenv("DEFAULT_FPS", "30"))
        self.DEFAULT_RESOLUTION = os.getenv("DEFAULT_RESOLUTION", "1080p")
        
        # Quality Settings
        self.VIDEO_CODEC = os.getenv("VIDEO_CODEC", "libx264")
        self.AUDIO_CODEC = os.getenv("AUDIO_CODEC", "aac")
        self.VIDEO_BITRATE = os.getenv("VIDEO_BITRATE", "2M")
        self.AUDIO_BITRATE = os.getenv("AUDIO_BITRATE", "128k")
    
    def _get_required_env(self, key: str) -> str:
        """Get required environment variable or raise error"""
        value = os.getenv(key)
        if not value:
            raise ValueError(f"Required environment variable {key} is not set")
        return value
    
    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT.lower() == "production"
    
    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENVIRONMENT.lower() == "development"
    
    def get_resolution_dimensions(self) -> tuple[int, int]:
        """Get resolution dimensions as (width, height)"""
        resolution_map = {
            "720p": (1280, 720),
            "1080p": (1920, 1080),
            "1440p": (2560, 1440),
            "4k": (3840, 2160),
        }
        return resolution_map.get(self.DEFAULT_RESOLUTION, (1920, 1080))
