#!/usr/bin/env python3
"""
AEON Video Processing Agent - Main Entry Point
Polls Supabase for video generation jobs and processes them
"""

import asyncio
import logging
import os
import signal
import sys
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI
from uvicorn import run

from src.job_processor import JobProcessor
from src.config import Config
from src.logger import setup_logging

# Load environment variables
load_dotenv()

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)

# Global job processor instance
job_processor: Optional[JobProcessor] = None

# FastAPI app for health checks
app = FastAPI(title="AEON Video Processing Agent", version="1.0.0")

@app.get("/health")
async def health_check():
    """Health check endpoint for Railway/Docker"""
    return {
        "status": "healthy",
        "service": "aeon-video-processor",
        "version": "1.0.0",
        "processor_running": job_processor is not None and job_processor.is_running
    }

@app.get("/status")
async def status():
    """Status endpoint with detailed information"""
    if not job_processor:
        return {"status": "not_initialized"}
    
    return {
        "status": "running" if job_processor.is_running else "stopped",
        "jobs_processed": job_processor.jobs_processed,
        "jobs_failed": job_processor.jobs_failed,
        "current_jobs": len(job_processor.current_jobs),
        "max_concurrent": job_processor.max_concurrent_jobs
    }

async def start_processor():
    """Start the job processor"""
    global job_processor
    
    try:
        config = Config()
        job_processor = JobProcessor(config)
        
        logger.info("Starting AEON Video Processing Agent...")
        logger.info(f"Polling interval: {config.POLL_INTERVAL} seconds")
        logger.info(f"Max concurrent jobs: {config.MAX_CONCURRENT_JOBS}")
        
        await job_processor.start()
        
    except Exception as e:
        logger.error(f"Failed to start job processor: {e}")
        sys.exit(1)

async def stop_processor():
    """Stop the job processor gracefully"""
    global job_processor
    
    if job_processor:
        logger.info("Stopping job processor...")
        await job_processor.stop()
        logger.info("Job processor stopped")

def signal_handler(signum, frame):
    """Handle shutdown signals"""
    logger.info(f"Received signal {signum}, shutting down...")
    asyncio.create_task(stop_processor())

async def main():
    """Main application entry point"""
    # Register signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Start the processor in the background
    processor_task = asyncio.create_task(start_processor())
    
    # Start the FastAPI server
    config = Config()
    server_config = {
        "app": app,
        "host": "0.0.0.0",
        "port": config.PORT,
        "log_level": config.LOG_LEVEL.lower(),
        "access_log": False
    }
    
    try:
        # Run both the processor and the web server
        await asyncio.gather(
            processor_task,
            asyncio.create_task(run_server(server_config))
        )
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt, shutting down...")
    except Exception as e:
        logger.error(f"Application error: {e}")
    finally:
        await stop_processor()

async def run_server(config):
    """Run the FastAPI server"""
    import uvicorn
    server = uvicorn.Server(uvicorn.Config(**config))
    await server.serve()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
    except Exception as e:
        logger.error(f"Application failed: {e}")
        sys.exit(1)
