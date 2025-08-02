"""
AEON Video Backend Configuration
Centralized configuration for security and deployment settings
"""

import os
from typing import List

class Config:
    """Application configuration"""
    
    # Frontend Domain (CORRECTED)
    FRONTEND_DOMAIN = "https://smart4technology.com"
    
    # Backend IP Address
    BACKEND_IP = "http://159.223.198.119:8000"
    
    # CORS Configuration
    ALLOWED_ORIGINS = [FRONTEND_DOMAIN]
    ALLOWED_METHODS = ["GET", "POST", "PUT", "DELETE"]
    ALLOWED_HEADERS = ["Authorization", "Content-Type"]
    
    # Security Settings
    MAX_REQUEST_SIZE = 100 * 1024 * 1024  # 100MB
    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
    MAX_PROMPT_LENGTH = 1000
    
    # Rate Limiting
    RATE_LIMITS = {
        "video_generation": "5/minute",
        "modular_generation": "3/minute", 
        "status_checks": "30/minute",
        "file_uploads": "10/minute"
    }
    
    # File Upload Security
    ALLOWED_VIDEO_TYPES = [
        'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
        'video/flv', 'video/webm', 'video/mkv', 'video/m4v'
    ]
    
    # Dangerous patterns to block
    DANGEROUS_PATTERNS = ['<', '>', 'script', 'javascript', 'vbscript']
    
    # Environment
    ENVIRONMENT = os.getenv("ENVIRONMENT", "production")
    DEBUG = ENVIRONMENT == "development"
    
    # Logging
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")
    LOG_FILE = "aeon-video.log"

# Global config instance
config = Config() 