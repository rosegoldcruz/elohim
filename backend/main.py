"""
AEON Video Generation Platform - FastAPI Backend
Production-ready backend for AI video generation with modular architecture
"""

import os
import logging
from datetime import datetime
from typing import Optional
from dotenv import load_dotenv
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import uvicorn
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
from fastapi.responses import Response

# Import API routes
from api.generate import router as generate_router
from api.modular import router as modular_router
from api.status import router as status_router
from api.auth import router as auth_router
from api.video import router as video_router
from api.jobs import router as jobs_router
from api.editor import router as editor_router
from api.marketing import router as marketing_router

# Import utilities
from utils.auth import verify_clerk_jwt
from utils.config import get_settings

# Load environment variables
load_dotenv()

# Configure logging for production
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('aeon-api.log')
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AEON Video Generation API",
    description="Production-ready AI video generation platform with modular architecture",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Security
security = HTTPBearer()

# Rate limiting setup
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware - configurable
settings = get_settings()
allow_origins = []
try:
    allow_origins = [o.strip() for o in settings.allowed_origins.split(',') if o.strip()] if isinstance(settings.allowed_origins, str) else settings.allowed_origins
except Exception:
    allow_origins = ["https://smart4technology.com", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
)

# Request size limiter middleware
@app.middleware("http")
async def limit_request_size(request: Request, call_next):
    size = int(request.headers.get("content-length", 0))
    if size > 100 * 1024 * 1024:  # 100MB
        raise HTTPException(status_code=413, detail="Too large")
    return await call_next(request)

# Dependency for JWT verification
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify Clerk JWT and return user data"""
    try:
        user_data = await verify_clerk_jwt(credentials.credentials)
        return user_data
    except Exception as e:
        logger.error(f"JWT verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Health check endpoint
@app.get("/")
async def root():
    return {
        "message": "AEON Video Generation API",
        "version": "2.0.0",
        "status": "running",
        "timestamp": datetime.now().isoformat(),
        "environment": os.getenv("ENVIRONMENT", "production")
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "running",
            "replicate": "available" if os.getenv("REPLICATE_API_TOKEN") else "not_configured",
            "supabase": "available" if os.getenv("SUPABASE_URL") else "not_configured",
            "clerk": "available" if os.getenv("CLERK_SECRET_KEY") else "not_configured"
        }
    }

@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Include API routers
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication"])
app.include_router(jobs_router, tags=["Jobs"])
app.include_router(editor_router, tags=["Editor"])
app.include_router(marketing_router, tags=["Marketing"])
app.include_router(generate_router, prefix="/api/generate", tags=["Video Generation"])
app.include_router(modular_router, prefix="/api/modular", tags=["Modular Generation"])
app.include_router(status_router, prefix="/api/status", tags=["Status & Monitoring"])
app.include_router(video_router, prefix="/api/video", tags=["Video Processing"])

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return JSONResponse(status_code=exc.status_code, content={"error": exc.detail, "timestamp": datetime.now().isoformat()})

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"General Exception: {str(exc)}")
    return JSONResponse(status_code=500, content={"error": "Internal server error", "timestamp": datetime.now().isoformat()})

if __name__ == "__main__":
    logger.info(f"Starting AEON Video API on {settings.host}:{settings.port}")
    logger.info(f"Environment: {settings.environment}")
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=settings.environment == "development", log_level="info")
