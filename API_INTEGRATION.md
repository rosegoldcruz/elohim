# 🚀 AEON Frontend + API Integration

Complete integration between AEON Next.js frontend and FastAPI backend for video generation.

## ✅ **What's Been Implemented**

### 1. **API Route Handler** (`/app/api/video-request/route.ts`)
- **Endpoint**: `POST /api/video-request`
- **Purpose**: Bridge between frontend form and FastAPI backend
- **Input**: `{ topic, style, email, duration }`
- **Output**: `{ success, video_id, message, estimated_completion_time }`

### 2. **Frontend Integration** (`/app/instant/page.tsx`)
- **Updated Form Submission**: Now calls `/api/video-request` instead of direct backend
- **Enhanced Error Handling**: Proper error messages and user feedback
- **Status Redirection**: Redirects to `/status/{video_id}` on success

### 3. **Environment Configuration** (`.env.local`)
- **Added**: `AEON_SCHEDULER_URL=http://localhost:8000`
- **Purpose**: Configure backend URL for API route handler

## 🔄 **Request Flow**

```mermaid
graph LR
    A[User Form] --> B[/api/video-request]
    B --> C[FastAPI /generate]
    C --> D[7-Agent Pipeline]
    D --> E[Status Page]
```

### Detailed Flow:
1. **User submits form** with topic, style, email, duration
2. **Frontend calls** `/api/video-request` API route
3. **API route transforms** data and calls FastAPI `/generate` endpoint
4. **FastAPI backend** processes with 7-agent architecture
5. **Response returns** video_id and status information
6. **Frontend redirects** to status page for tracking

## 📡 **API Specifications**

### Frontend → API Route
```typescript
POST /api/video-request
Content-Type: application/json

{
  "topic": "A peaceful sunset over mountains",
  "style": "cinematic", 
  "email": "user@example.com",
  "duration": 60
}
```

### API Route → FastAPI Backend
```typescript
POST ${AEON_SCHEDULER_URL}/generate
Content-Type: application/json

{
  "email": "user@example.com",
  "prompt": "A peaceful sunset over mountains in cinematic style",
  "duration": 60,
  "title": "Video: A peaceful sunset over mountains..."
}
```

### Response Format
```typescript
{
  "success": true,
  "video_id": "uuid-string",
  "message": "Video generation started successfully",
  "estimated_completion_time": "2-3 minutes"
}
```

## 🛠️ **Technical Details**

### API Route Handler Features:
- **Prompt Combination**: Merges topic and style into single prompt
- **Error Handling**: Catches and formats backend errors
- **Type Safety**: TypeScript with proper error types
- **Environment Variables**: Uses `AEON_SCHEDULER_URL` for backend URL

### Frontend Updates:
- **Form Data Mapping**: Maps form fields to API expectations
- **Success Handling**: Shows toast notifications and redirects
- **Error Handling**: Displays user-friendly error messages
- **Loading States**: Proper loading indicators during submission

## 🧪 **Testing the Integration**

### Prerequisites:
1. **Frontend Running**: `pnpm dev` (http://localhost:3000)
2. **Backend Running**: FastAPI server (http://localhost:8000)
3. **Environment**: `.env.local` with `AEON_SCHEDULER_URL`

### Test Steps:
1. **Visit**: http://localhost:3000/instant
2. **Fill Form**: 
   - Email: test@example.com
   - Topic: "A robot dancing in space"
   - Style: "Cinematic"
   - Duration: 60 seconds
3. **Submit**: Click "Generate Video"
4. **Verify**: Should redirect to status page with video ID

### Expected Behavior:
- ✅ Form submits without errors
- ✅ Success toast notification appears
- ✅ Redirects to `/status/{video_id}`
- ✅ Status page shows video generation progress

## 🔧 **Backend Requirements**

For full functionality, the FastAPI backend needs:

### Environment Variables:
```bash
# Required for database
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Required for AI generation
OPENAI_API_KEY=your_openai_key
REPLICATE_API_TOKEN=your_replicate_token
ELEVENLABS_API_KEY=your_elevenlabs_key
```

### Start Backend:
```bash
cd api
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

## 🚨 **Error Handling**

### Common Issues:

1. **Backend Not Running**:
   - Error: "fetch failed" or connection refused
   - Solution: Start FastAPI backend on port 8000

2. **Missing Environment Variables**:
   - Error: "SUPABASE_URL must be set"
   - Solution: Configure backend environment variables

3. **Invalid Form Data**:
   - Error: Validation errors from Pydantic
   - Solution: Check form field requirements

### Error Response Format:
```typescript
{
  "detail": "Error message description",
  "status": 400 // HTTP status code
}
```

## 🎯 **Next Steps**

### Immediate:
- [ ] Test with real FastAPI backend
- [ ] Verify status page integration
- [ ] Test error scenarios

### Future Enhancements:
- [ ] Add request validation middleware
- [ ] Implement rate limiting
- [ ] Add request logging
- [ ] Create webhook endpoints for status updates
- [ ] Add authentication middleware

## 📝 **File Structure**

```
app/
├── api/
│   └── video-request/
│       └── route.ts          # API route handler
├── instant/
│   └── page.tsx             # Updated form with API integration
└── status/
    └── [videoId]/
        └── page.tsx         # Status tracking page

.env.local                   # Environment configuration
```

## 🔗 **Related Documentation**

- [Script Generator](./SCRIPT_GENERATOR.md) - AI script generation feature
- [Development Guide](./DEVELOPMENT.md) - Full development setup
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment

---

**🎬 AEON AI Video Generation Platform - Frontend + API Integration Complete!**
