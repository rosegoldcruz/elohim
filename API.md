# AEON AI Video Generation Platform - API Documentation

Complete API reference for the AEON 7-agent video generation system.

## 🔗 Base URLs

- **Production**: `https://your-backend.railway.app`
- **Development**: `http://localhost:8000`
- **API Docs**: `https://your-backend.railway.app/docs`

## 🔐 Authentication

AEON uses email-based magic link authentication. Include the auth token in requests:

```bash
curl -H "Authorization: Bearer your-auth-token" \
     -H "Content-Type: application/json" \
     https://api.aeon.ai/endpoint
```

## 📋 Core Endpoints

### 🎬 Video Generation

#### Generate Video (Main Endpoint)
```http
POST /generate
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "prompt": "A serene mountain landscape at sunset with birds flying",
  "duration": 60,
  "title": "Mountain Sunset Video"
}
```

**Response:**
```json
{
  "success": true,
  "video_id": "uuid-video-id",
  "message": "Video generation started",
  "credits_used": 100,
  "estimated_completion_time": "3-5 minutes"
}
```

**Status Codes:**
- `200` - Success
- `401` - Authentication required
- `402` - Insufficient credits
- `500` - Server error

---

### 🤖 Individual Agents

#### 1. ScriptWriter Agent
```http
POST /scriptwriter/generate
```

**Request:**
```json
{
  "prompt": "A peaceful sunset over mountains",
  "duration": 60,
  "scene_count": 6
}
```

**Response:**
```json
{
  "success": true,
  "scenes": [
    "Wide shot of mountain range during golden hour...",
    "Close-up of birds flying across the sunset sky...",
    "Panoramic view of valley below the mountains...",
    "Time-lapse of sun setting behind peaks...",
    "Silhouette of trees against orange sky...",
    "Final shot of stars appearing in twilight..."
  ],
  "total_scenes": 6,
  "estimated_duration_per_scene": 10.0
}
```

#### 2. VisualGen Agent
```http
POST /visualgen/generate
```

**Request:**
```json
{
  "scenes": [
    "Wide shot of mountain range during golden hour",
    "Close-up of birds flying across sunset sky"
  ],
  "video_id": "uuid-video-id"
}
```

**Response:**
```json
{
  "success": true,
  "scene_urls": [
    "https://replicate.delivery/scene1.mp4",
    "https://replicate.delivery/scene2.mp4"
  ],
  "failed_scenes": [],
  "message": "Generated 2/2 scenes successfully"
}
```

#### 3. Editor Agent
```http
POST /editor/merge
```

**Request:**
```json
{
  "video_id": "uuid-video-id",
  "scene_urls": [
    "https://replicate.delivery/scene1.mp4",
    "https://replicate.delivery/scene2.mp4"
  ],
  "includes_audio": true,
  "includes_captions": true
}
```

**Response:**
```json
{
  "success": true,
  "final_video_url": "https://blob.vercel-storage.com/final-video.mp4",
  "thumbnail_url": "https://blob.vercel-storage.com/thumbnail.jpg",
  "file_size_mb": 45.2,
  "message": "Video edited and uploaded successfully"
}
```

---

### 💳 Payments

#### Create Checkout Session
```http
POST /payments/create-checkout
```

**Request:**
```json
{
  "email": "user@example.com",
  "product_type": "video",
  "amount": 29.95,
  "credits": 150,
  "video_prompt": "Mountain sunset video",
  "video_duration": 60
}
```

**Response:**
```json
{
  "success": true,
  "checkout_url": "https://checkout.stripe.com/session_id",
  "order_id": "uuid-order-id",
  "message": "Checkout session created successfully"
}
```

#### Stripe Webhook
```http
POST /payments/webhook
```

Handles Stripe webhook events:
- `checkout.session.completed`
- `invoice.payment_succeeded`
- `customer.subscription.*`
- `payment_intent.payment_failed`

---

### 🔐 Authentication

#### Send Magic Link
```http
POST /auth/magic-link
```

**Request:**
```json
{
  "email": "user@example.com",
  "action": "send_magic_link"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Magic link sent to user@example.com",
  "user": null,
  "auth_token": null
}
```

#### Verify Magic Link
```http
POST /auth/verify
```

**Request:**
```json
{
  "email": "user@example.com",
  "action": "verify_token",
  "token": "magic-link-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "user": {
    "id": "uuid-user-id",
    "email": "user@example.com",
    "credits": 150,
    "subscription_tier": "pro"
  },
  "auth_token": "auth-token-string"
}
```

---

### 📊 Dashboard

#### User Dashboard
```http
GET /dashboard/user/{user_id}
```

**Response:**
```json
{
  "success": true,
  "user_data": {
    "user": {
      "id": "uuid-user-id",
      "email": "user@example.com",
      "credits": 1500,
      "subscription_tier": "pro"
    },
    "videos": {
      "total": 25,
      "completed": 23,
      "processing": 1,
      "failed": 1,
      "recent": [...]
    },
    "credits": {
      "current_balance": 1500,
      "total_earned": 3000,
      "total_spent": 1500,
      "recent_transactions": [...]
    },
    "usage_stats": {
      "videos_this_month": 8,
      "total_video_duration": 480,
      "avg_processing_time": 4.2,
      "success_rate": 0.92
    }
  }
}
```

#### Admin Dashboard
```http
GET /dashboard/admin
```

**Response:**
```json
{
  "success": true,
  "admin_data": {
    "analytics": {
      "total_users": 1250,
      "new_users_30d": 180,
      "total_videos": 5420,
      "completed_videos": 5100,
      "total_revenue": 45230.50,
      "revenue_30d": 8940.25
    },
    "queue": {
      "pending_count": 3,
      "processing_count": 2,
      "queue_length": 3
    },
    "users": {
      "growth_rate_30d": 16.8,
      "activation_rate": 78.4
    },
    "revenue": {
      "mrr": 28450.00,
      "avg_order_value": 34.95
    }
  }
}
```

---

### 📈 Status & Monitoring

#### Video Status
```http
GET /status/{video_id}
```

**Response:**
```json
{
  "video_id": "uuid-video-id",
  "status": "processing",
  "progress": 0.65,
  "current_agent": "editor",
  "estimated_completion": "2 minutes",
  "error_message": null
}
```

#### Queue Status
```http
GET /queue
```

**Response:**
```json
{
  "queue_length": 5,
  "processing_count": 3,
  "pending_videos": [...],
  "processing_videos": [...],
  "avg_processing_time": 4.8,
  "active_jobs": 3
}
```

#### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "agents": 7,
  "timestamp": "2024-01-15T10:30:00Z",
  "version": "1.0.0"
}
```

---

## 📝 Data Models

### Video Status Values
- `pending` - Waiting to start
- `queued` - In processing queue
- `processing` - Currently generating
- `completed` - Ready for download
- `failed` - Generation failed

### Agent Names
- `scriptwriter` - Scene prompt generation
- `visualgen` - Video scene creation
- `editor` - Video assembly
- `scheduler` - Job management
- `payments` - Payment processing
- `auth` - Authentication
- `dashboard` - Analytics

### Credit Costs
- **30s video**: 50 credits
- **60s video**: 100 credits
- **120s video**: 150 credits

### Subscription Tiers
- `free` - Trial tier
- `starter` - $19/month, 1,000 credits
- `pro` - $49/month, 3,000 credits
- `business` - $99/month, 8,000 credits

---

## 🚨 Error Handling

### Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    "code": "INSUFFICIENT_CREDITS",
    "required": 100,
    "available": 50
  }
}
```

### Common Error Codes
- `INVALID_REQUEST` - Malformed request
- `AUTHENTICATION_REQUIRED` - Missing auth token
- `INSUFFICIENT_CREDITS` - Not enough credits
- `VIDEO_NOT_FOUND` - Invalid video ID
- `GENERATION_FAILED` - AI model error
- `RATE_LIMITED` - Too many requests

---

## 🔧 Rate Limits

- **Free tier**: 5 requests/minute
- **Starter**: 20 requests/minute
- **Pro**: 60 requests/minute
- **Business**: 200 requests/minute

Rate limit headers:
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1642234567
```

---

## 📚 SDKs & Examples

### JavaScript/TypeScript
```typescript
import { AeonClient } from '@aeon/sdk'

const client = new AeonClient({
  apiKey: 'your-api-key',
  baseUrl: 'https://api.aeon.ai'
})

const video = await client.generateVideo({
  prompt: 'A serene mountain landscape',
  duration: 60
})
```

### Python
```python
from aeon_sdk import AeonClient

client = AeonClient(api_key='your-api-key')

video = client.generate_video(
    prompt='A serene mountain landscape',
    duration=60
)
```

### cURL Examples
```bash
# Generate video
curl -X POST "https://api.aeon.ai/generate" \
  -H "Authorization: Bearer your-token" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "prompt": "Mountain sunset",
    "duration": 60
  }'

# Check status
curl "https://api.aeon.ai/status/video-id" \
  -H "Authorization: Bearer your-token"
```

---

## 🆘 Support

- **API Status**: [status.aeon.ai](https://status.aeon.ai)
- **Documentation**: [docs.aeon.ai](https://docs.aeon.ai)
- **Discord**: [discord.gg/aeon](https://discord.gg/aeon)
- **Email**: api@aeon.ai

---

**🎬 Start creating amazing videos with AEON's 7-agent AI system!**
