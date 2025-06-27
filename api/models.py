"""
AEON AI Video Generation SaaS Platform - Pydantic Models
Based on MIT-licensed ai-video-generator, restructured for 7-agent architecture
License: MIT (see LICENSE file)

7-Agent Architecture Data Models:
- ScriptWriter, VisualGen, Editor, Scheduler, Payments, Auth, Dashboard
"""

from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any, Literal
from datetime import datetime
from enum import Enum
import uuid

# Enums
class VideoStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class AgentName(str, Enum):
    SCRIPTWRITER = "scriptwriter"
    VISUALGEN = "visualgen"
    EDITOR = "editor"
    SCHEDULER = "scheduler"
    PAYMENTS = "payments"
    AUTH = "auth"
    DASHBOARD = "dashboard"

class AgentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class OrderStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class ProductType(str, Enum):
    VIDEO = "video"
    SUBSCRIPTION = "subscription"
    CREDITS = "credits"

class SubscriptionTier(str, Enum):
    FREE = "free"
    STARTER = "starter"
    PRO = "pro"
    BUSINESS = "business"

# Base Models
class User(BaseModel):
    id: uuid.UUID
    email: EmailStr
    full_name: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    credits: int = 0
    subscription_tier: SubscriptionTier = SubscriptionTier.FREE
    subscription_status: str = "inactive"
    created_at: datetime
    updated_at: datetime

class UserCreate(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class Video(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    prompt: str
    duration: int
    status: VideoStatus
    scene_urls: List[str] = []
    final_video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    file_size_mb: Optional[float] = None
    resolution: str = "1080p"
    includes_audio: bool = True
    includes_captions: bool = True
    processing_started_at: Optional[datetime] = None
    processing_completed_at: Optional[datetime] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime

class VideoCreate(BaseModel):
    title: str
    prompt: str = Field(..., min_length=10, max_length=1000)
    duration: int = Field(..., ge=30, le=180)  # 30-180 seconds
    resolution: str = "1080p"
    includes_audio: bool = True
    includes_captions: bool = True

    @validator('prompt')
    def validate_prompt(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('Prompt must be at least 10 characters long')
        return v.strip()

class Order(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    stripe_payment_intent_id: Optional[str] = None
    stripe_session_id: Optional[str] = None
    product_type: ProductType
    amount: float
    credits_purchased: int = 0
    video_id: Optional[uuid.UUID] = None
    video_prompt: Optional[str] = None
    video_duration: Optional[int] = None
    status: OrderStatus
    created_at: datetime

class OrderCreate(BaseModel):
    product_type: ProductType
    amount: float
    credits_purchased: int = 0
    video_prompt: Optional[str] = None
    video_duration: Optional[int] = None

class Credit(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    amount: int
    type: str
    description: Optional[str] = None
    order_id: Optional[uuid.UUID] = None
    video_id: Optional[uuid.UUID] = None
    created_at: datetime

class Agent(BaseModel):
    id: uuid.UUID
    video_id: uuid.UUID
    agent_name: AgentName
    status: AgentStatus
    input_data: Optional[Dict[str, Any]] = None
    output_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    runtime_seconds: Optional[int] = None
    created_at: datetime

class VideoScene(BaseModel):
    id: uuid.UUID
    video_id: uuid.UUID
    scene_number: int
    model_name: str
    prompt: str
    status: str
    scene_url: Optional[str] = None
    duration: Optional[float] = None
    replicate_prediction_id: Optional[str] = None
    model_input: Optional[Dict[str, Any]] = None
    model_output: Optional[Dict[str, Any]] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime

# Request/Response Models
class GenerateVideoRequest(BaseModel):
    email: EmailStr
    prompt: str = Field(..., min_length=10, max_length=1000)
    duration: int = Field(60, ge=30, le=180)
    title: Optional[str] = None

class GenerateVideoResponse(BaseModel):
    success: bool
    video_id: Optional[uuid.UUID] = None
    message: str
    credits_used: Optional[int] = None
    estimated_completion_time: Optional[str] = None

class ScriptWriterRequest(BaseModel):
    prompt: str
    duration: int
    scene_count: int = 6

class ScriptWriterResponse(BaseModel):
    success: bool
    scenes: List[str]
    total_scenes: int
    estimated_duration_per_scene: float

class VisualGenRequest(BaseModel):
    scenes: List[str]
    video_id: uuid.UUID

class VisualGenResponse(BaseModel):
    success: bool
    scene_urls: List[str]
    failed_scenes: List[int] = []
    message: str

class EditorRequest(BaseModel):
    video_id: uuid.UUID
    scene_urls: List[str]
    includes_audio: bool = True
    includes_captions: bool = True

class EditorResponse(BaseModel):
    success: bool
    final_video_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    file_size_mb: Optional[float] = None
    message: str

class PaymentRequest(BaseModel):
    email: EmailStr
    product_type: ProductType
    amount: float
    credits: Optional[int] = None
    video_prompt: Optional[str] = None
    video_duration: Optional[int] = None

class PaymentResponse(BaseModel):
    success: bool
    checkout_url: Optional[str] = None
    order_id: Optional[uuid.UUID] = None
    message: str

class AuthRequest(BaseModel):
    email: EmailStr
    action: Literal["send_magic_link", "verify_token"]
    token: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[User] = None
    auth_token: Optional[str] = None

class DashboardRequest(BaseModel):
    user_id: Optional[uuid.UUID] = None
    admin: bool = False

class DashboardResponse(BaseModel):
    success: bool
    user_data: Optional[Dict[str, Any]] = None
    admin_data: Optional[Dict[str, Any]] = None

class JobStatusResponse(BaseModel):
    video_id: uuid.UUID
    status: VideoStatus
    progress: float  # 0.0 to 1.0
    current_agent: Optional[str] = None
    estimated_completion: Optional[str] = None
    error_message: Optional[str] = None

# Webhook Models
class StripeWebhookEvent(BaseModel):
    id: str
    type: str
    data: Dict[str, Any]
    created: int

# Admin Models
class AdminAnalytics(BaseModel):
    total_users: int
    new_users_30d: int
    total_videos: int
    completed_videos: int
    videos_24h: int
    total_revenue: float
    revenue_30d: float
    avg_processing_time: Optional[float] = None

class VideoQueue(BaseModel):
    pending_videos: List[Video]
    processing_videos: List[Video]
    queue_length: int
    avg_wait_time: Optional[float] = None

# Error Models
class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    details: Optional[Dict[str, Any]] = None

# Success Models
class SuccessResponse(BaseModel):
    success: bool = True
    message: str
    data: Optional[Dict[str, Any]] = None
