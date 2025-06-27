"""
AEON AI Video Generation SaaS Platform - FastAPI Main Application
Based on MIT-licensed ai-video-generator, restructured for 7-agent architecture
License: MIT (see LICENSE file)

7-Agent Architecture Backend:
- ScriptWriter, VisualGen, Editor, Scheduler, Payments, Auth, Dashboard
"""

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from contextlib import asynccontextmanager

# Import all agents
from agent_scriptwriter import ScriptWriterAgent
from agent_visualgen import VisualGenAgent
from agent_editor import EditorAgent
from agent_scheduler import SchedulerAgent
from agent_payments import PaymentsAgent
from agent_auth import AuthAgent
from agent_dashboard import DashboardAgent

# Import models
from models import *
from database import db

# Global agent instances
scriptwriter = ScriptWriterAgent()
visualgen = VisualGenAgent()
editor = EditorAgent()
scheduler = SchedulerAgent()
payments = PaymentsAgent()
auth = AuthAgent()
dashboard = DashboardAgent()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 AEON SaaS Video Generation Platform Starting...")
    print("🤖 Initializing 7-Agent Architecture...")
    
    # Initialize scheduler background tasks
    await scheduler.start_background_tasks()
    
    yield
    
    # Shutdown
    print("🛑 AEON Platform Shutting Down...")
    await scheduler.stop_background_tasks()

# Create FastAPI app
app = FastAPI(
    title="AEON SaaS Video Generation Platform",
    description="7-Agent Architecture for AI Video Generation",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "agents": 7}

# Main video generation endpoint
@app.post("/generate", response_model=GenerateVideoResponse)
async def generate_video(request: GenerateVideoRequest, background_tasks: BackgroundTasks):
    """Main endpoint to generate a video using all 7 agents"""
    try:
        # 1. Authenticate user
        auth_result = await auth.authenticate_user(request.email)
        if not auth_result["success"]:
            raise HTTPException(status_code=401, detail=auth_result["message"])
        
        user = auth_result["user"]
        
        # 2. Check credits
        credits_needed = calculate_credits_needed(request.duration)
        if user["credits"] < credits_needed:
            raise HTTPException(
                status_code=402, 
                detail=f"Insufficient credits. Need {credits_needed}, have {user['credits']}"
            )
        
        # 3. Create video record
        video = await db.create_video(
            user_id=user["id"],
            title=request.title or f"Video from: {request.prompt[:50]}...",
            prompt=request.prompt,
            duration=request.duration
        )
        
        if not video:
            raise HTTPException(status_code=500, detail="Failed to create video record")
        
        # 4. Use credits
        await db.use_credits(
            user_id=user["id"],
            amount=credits_needed,
            description=f"Video generation - {request.duration}s",
            video_id=video["id"]
        )
        
        # 5. Queue video processing
        background_tasks.add_task(process_video_pipeline, video["id"])
        
        return GenerateVideoResponse(
            success=True,
            video_id=video["id"],
            message="Video generation started",
            credits_used=credits_needed,
            estimated_completion_time="3-5 minutes"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def process_video_pipeline(video_id: str):
    """Background task to process video through all agents"""
    try:
        # Update video status
        await db.update_video_status(video_id, "processing", processing_started_at=datetime.utcnow().isoformat())
        
        # Get video details
        video = await db.get_video(video_id)
        if not video:
            raise Exception("Video not found")
        
        # 1. ScriptWriter Agent - Generate scene prompts
        script_result = await scriptwriter.generate_scenes(
            ScriptWriterRequest(
                prompt=video["prompt"],
                duration=video["duration"],
                scene_count=6
            ),
            video_id
        )
        
        if not script_result["success"]:
            raise Exception(f"ScriptWriter failed: {script_result['message']}")
        
        # 2. VisualGen Agent - Generate video scenes
        visual_result = await visualgen.generate_scenes(
            VisualGenRequest(
                scenes=script_result["scenes"],
                video_id=video_id
            ),
            video_id
        )
        
        if not visual_result["success"]:
            raise Exception(f"VisualGen failed: {visual_result['message']}")
        
        # 3. Editor Agent - Merge scenes
        editor_result = await editor.merge_scenes(
            EditorRequest(
                video_id=video_id,
                scene_urls=visual_result["scene_urls"],
                includes_audio=video.get("includes_audio", True),
                includes_captions=video.get("includes_captions", True)
            ),
            video_id
        )
        
        if not editor_result["success"]:
            raise Exception(f"Editor failed: {editor_result['message']}")
        
        # 4. Update video with final result
        await db.update_video_status(
            video_id,
            "completed",
            final_video_url=editor_result["final_video_url"],
            thumbnail_url=editor_result["thumbnail_url"],
            file_size_mb=editor_result["file_size_mb"],
            processing_completed_at=datetime.utcnow().isoformat()
        )
        
        print(f"✅ Video {video_id} completed successfully")
        
    except Exception as e:
        print(f"❌ Video {video_id} failed: {str(e)}")
        await db.update_video_status(
            video_id,
            "failed",
            error_message=str(e),
            processing_completed_at=datetime.utcnow().isoformat()
        )

def calculate_credits_needed(duration: int) -> int:
    """Calculate credits needed based on video duration"""
    # 100 credits per 60 seconds
    return max(100, int((duration / 60) * 100))

# Individual agent endpoints
@app.post("/scriptwriter/generate", response_model=ScriptWriterResponse)
async def scriptwriter_generate(request: ScriptWriterRequest):
    return await scriptwriter.generate_scenes(request)

@app.post("/visualgen/generate", response_model=VisualGenResponse)
async def visualgen_generate(request: VisualGenRequest):
    return await visualgen.generate_scenes(request)

@app.post("/editor/merge", response_model=EditorResponse)
async def editor_merge(request: EditorRequest):
    return await editor.merge_scenes(request)

@app.post("/payments/create-checkout", response_model=PaymentResponse)
async def payments_create_checkout(request: PaymentRequest):
    return await payments.create_checkout_session(request)

@app.post("/payments/webhook")
async def payments_webhook(request: dict, background_tasks: BackgroundTasks):
    background_tasks.add_task(payments.handle_webhook, request)
    return {"received": True}

@app.post("/auth/magic-link", response_model=AuthResponse)
async def auth_magic_link(request: AuthRequest):
    return await auth.send_magic_link(request)

@app.post("/auth/verify", response_model=AuthResponse)
async def auth_verify(request: AuthRequest):
    return await auth.verify_token(request)

@app.get("/dashboard/user/{user_id}", response_model=DashboardResponse)
async def dashboard_user(user_id: str):
    return await dashboard.get_user_dashboard(user_id)

@app.get("/dashboard/admin", response_model=DashboardResponse)
async def dashboard_admin():
    return await dashboard.get_admin_dashboard()

@app.get("/status/{video_id}", response_model=JobStatusResponse)
async def get_video_status(video_id: str):
    return await scheduler.get_job_status(video_id)

@app.get("/queue")
async def get_video_queue():
    return await scheduler.get_queue_status()

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": "Internal server error"}
    )

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=True
    )
