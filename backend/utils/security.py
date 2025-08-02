"""
Security utilities for AEON Video Backend
Additional security functions and middleware
"""

import re
import hashlib
import secrets
from typing import Optional, List
from fastapi import HTTPException, Request
import logging

logger = logging.getLogger(__name__)

class SecurityUtils:
    """Security utility functions"""
    
    @staticmethod
    def sanitize_input(text: str, max_length: int = 1000) -> str:
        """Sanitize user input to prevent XSS and injection attacks"""
        if not text:
            return ""
        
        # Remove null bytes
        text = text.replace('\x00', '')
        
        # Remove control characters except newlines and tabs
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        
        # Basic HTML tag removal (for safety)
        text = re.sub(r'<[^>]*>', '', text)
        
        # Remove potentially dangerous patterns
        dangerous_patterns = [
            r'script\s*:', r'javascript\s*:', r'vbscript\s*:', r'data\s*:',
            r'expression\s*\(', r'url\s*\(', r'import\s*\(', r'include\s*\('
        ]
        
        for pattern in dangerous_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        
        # Truncate if too long
        if len(text) > max_length:
            text = text[:max_length]
        
        return text.strip()
    
    @staticmethod
    def validate_filename(filename: str) -> bool:
        """Validate filename for security"""
        if not filename:
            return False
        
        # Check for dangerous patterns
        dangerous_patterns = [
            r'\.\.', r'/', r'\\', r'<', r'>', r':', r'"', r'|', r'\?', r'\*',
            r'script', r'javascript', r'vbscript', r'data:'
        ]
        
        for pattern in dangerous_patterns:
            if re.search(pattern, filename, re.IGNORECASE):
                return False
        
        # Check length
        if len(filename) > 255:
            return False
        
        return True
    
    @staticmethod
    def generate_secure_token(length: int = 32) -> str:
        """Generate a cryptographically secure token"""
        return secrets.token_urlsafe(length)
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using SHA-256 (use bcrypt in production)"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    @staticmethod
    def validate_url(url: str) -> bool:
        """Validate URL format and security"""
        if not url:
            return False
        
        # Basic URL validation
        url_pattern = r'^https?://[^\s/$.?#].[^\s]*$'
        if not re.match(url_pattern, url):
            return False
        
        # Check for dangerous protocols
        dangerous_protocols = ['javascript:', 'data:', 'vbscript:', 'file:']
        for protocol in dangerous_protocols:
            if url.lower().startswith(protocol):
                return False
        
        return True
    
    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        if not email:
            return False
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_pattern, email))
    
    @staticmethod
    def check_rate_limit_key(request: Request) -> str:
        """Generate rate limit key based on request"""
        # Use IP address for rate limiting
        client_ip = request.client.host if request.client else "unknown"
        
        # Add user agent hash for additional uniqueness
        user_agent = request.headers.get("user-agent", "")
        user_agent_hash = hashlib.md5(user_agent.encode()).hexdigest()[:8]
        
        return f"{client_ip}:{user_agent_hash}"

class SecurityMiddleware:
    """Security middleware for additional protection"""
    
    @staticmethod
    async def validate_request_headers(request: Request):
        """Validate request headers for security"""
        # Check for suspicious headers
        suspicious_headers = [
            'x-forwarded-for', 'x-real-ip', 'x-forwarded-host',
            'x-forwarded-proto', 'x-forwarded-port'
        ]
        
        for header in suspicious_headers:
            if header in request.headers:
                logger.warning(f"Suspicious header detected: {header}")
        
        # Validate content-type for POST requests
        if request.method == "POST":
            content_type = request.headers.get("content-type", "")
            if not content_type.startswith(("application/json", "multipart/form-data")):
                raise HTTPException(status_code=400, detail="Invalid content type")
    
    @staticmethod
    async def log_security_event(event_type: str, details: dict, request: Request):
        """Log security events for monitoring"""
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "")
        
        security_log = {
            "event_type": event_type,
            "timestamp": "now()",
            "client_ip": client_ip,
            "user_agent": user_agent,
            "details": details
        }
        
        logger.warning(f"Security event: {security_log}")
        
        # In production, send to security monitoring service
        # await send_to_security_monitoring(security_log)

class InputValidator:
    """Input validation utilities"""
    
    @staticmethod
    def validate_prompt(prompt: str) -> str:
        """Validate and sanitize video generation prompt"""
        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty")
        
        # Sanitize input
        sanitized = SecurityUtils.sanitize_input(prompt, max_length=1000)
        
        if not sanitized:
            raise ValueError("Prompt is empty after sanitization")
        
        return sanitized
    
    @staticmethod
    def validate_dimensions(width: int, height: int) -> tuple:
        """Validate video dimensions"""
        if not isinstance(width, int) or not isinstance(height, int):
            raise ValueError("Dimensions must be integers")
        
        if width < 64 or width > 1920:
            raise ValueError("Width must be between 64 and 1920 pixels")
        
        if height < 64 or height > 1920:
            raise ValueError("Height must be between 64 and 1920 pixels")
        
        return width, height
    
    @staticmethod
    def validate_duration(duration: int) -> int:
        """Validate video duration"""
        if not isinstance(duration, int):
            raise ValueError("Duration must be an integer")
        
        if duration < 1 or duration > 60:
            raise ValueError("Duration must be between 1 and 60 seconds")
        
        return duration
    
    @staticmethod
    def validate_model_name(model: str) -> str:
        """Validate AI model name"""
        allowed_models = [
            "kling", "runway", "pika", "stable", "luma", "minimax"
        ]
        
        if not model or model.lower() not in allowed_models:
            raise ValueError(f"Invalid model. Must be one of: {', '.join(allowed_models)}")
        
        return model.lower()
    
    @staticmethod
    def validate_style(style: str) -> str:
        """Validate video style"""
        allowed_styles = [
            "tiktok", "youtube", "instagram", "professional", "cinematic", "viral"
        ]
        
        if not style or style.lower() not in allowed_styles:
            raise ValueError(f"Invalid style. Must be one of: {', '.join(allowed_styles)}")
        
        return style.lower() 