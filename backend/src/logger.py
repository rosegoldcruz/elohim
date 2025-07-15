"""
Logging configuration for AEON Video Processing Agent
"""

import logging
import os
import sys
from datetime import datetime
from logging.handlers import RotatingFileHandler


def setup_logging():
    """Setup application logging"""
    
    # Get log level from environment
    log_level = os.getenv("LOG_LEVEL", "INFO").upper()
    
    # Create logs directory
    log_dir = os.getenv("LOG_DIR", "/app/logs")
    os.makedirs(log_dir, exist_ok=True)
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            # Console handler
            logging.StreamHandler(sys.stdout),
            # File handler with rotation
            RotatingFileHandler(
                os.path.join(log_dir, "aeon-agent.log"),
                maxBytes=10*1024*1024,  # 10MB
                backupCount=5
            )
        ]
    )
    
    # Set specific logger levels
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    
    # Create application logger
    logger = logging.getLogger("aeon-agent")
    logger.info(f"Logging initialized at {log_level} level")
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance"""
    return logging.getLogger(f"aeon-agent.{name}")


class JobLogger:
    """Logger for individual job processing"""
    
    def __init__(self, job_id: str):
        self.job_id = job_id
        self.logger = get_logger(f"job.{job_id}")
    
    def info(self, message: str):
        self.logger.info(f"[{self.job_id}] {message}")
    
    def warning(self, message: str):
        self.logger.warning(f"[{self.job_id}] {message}")
    
    def error(self, message: str):
        self.logger.error(f"[{self.job_id}] {message}")
    
    def debug(self, message: str):
        self.logger.debug(f"[{self.job_id}] {message}")
    
    def exception(self, message: str):
        self.logger.exception(f"[{self.job_id}] {message}")
