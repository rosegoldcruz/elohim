# AEON AI Video Generation Platform - Development Guide

Complete setup guide for local development of the AEON platform with 7-agent architecture.

## 🛠️ Prerequisites

### Required Software
- **Node.js 18+** - [Download](https://nodejs.org/)
- **Python 3.11+** - [Download](https://python.org/)
- **FFmpeg** - [Download](https://ffmpeg.org/)
- **Git** - [Download](https://git-scm.com/)

### Required Accounts & API Keys
- **Supabase** - [supabase.com](https://supabase.com)
- **Stripe** - [stripe.com](https://stripe.com)
- **OpenAI** - [platform.openai.com](https://platform.openai.com)
- **Replicate** - [replicate.com](https://replicate.com)
- **ElevenLabs** - [elevenlabs.io](https://elevenlabs.io)
- **Vercel** - [vercel.com](https://vercel.com)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/your-org/aeon-platform.git
cd aeon-platform
```

### 2. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd api
pip install -r requirements.txt
cd ..
```

### 3. Environment Setup
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your API keys
nano .env.local
```

### 4. Database Setup
```bash
# Install Supabase CLI
npm install -g supabase

# Initialize and link project
supabase init
supabase link --project-ref your-project-ref

# Push database schema
supabase db push
```

### 5. Start Development Servers
```bash
# Terminal 1: Backend (FastAPI)
cd api
uvicorn main:app --reload --port 8000

# Terminal 2: Frontend (Next.js)
npm run dev
```

Visit:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📁 Project Structure

```
aeon-platform/
├── api/                          # FastAPI Backend
│   ├── agent_scriptwriter.py     # Agent 1: Scene generation
│   ├── agent_visualgen.py        # Agent 2: Video creation
│   ├── agent_editor.py           # Agent 3: Video assembly
│   ├── agent_scheduler.py        # Agent 4: Job management
│   ├── agent_payments.py         # Agent 5: Stripe integration
│   ├── agent_auth.py             # Agent 6: Authentication
│   ├── agent_dashboard.py        # Agent 7: Analytics
│   ├── models.py                 # Pydantic models
│   ├── database.py               # Supabase integration
│   ├── main.py                   # FastAPI application
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile                # Backend container
├── app/                          # Next.js Frontend
│   ├── page.tsx                  # Landing page
│   ├── instant/                  # Video generation
│   ├── pricing/                  # Pricing plans
│   ├── dashboard/                # User dashboard
│   └── status/[videoId]/         # Generation status
├── components/                   # React components
├── lib/                          # Utilities
├── supabase/                     # Database
│   └── schema.sql                # Database schema
├── ffmpeg_worker.py              # Video processing
├── docker-compose.yml            # Local development
├── .env.example                  # Environment template
└── README.md                     # Project documentation
```

## 🔧 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-agent

# Make changes
# Test locally
npm run dev

# Commit and push
git add .
git commit -m "feat: add new agent functionality"
git push origin feature/new-agent
```

### 2. Testing
```bash
# Frontend tests
npm run test

# Backend tests
cd api
pytest

# Type checking
npm run type-check
```

### 3. Code Quality
```bash
# Lint frontend
npm run lint

# Format backend
cd api
black .
flake8 .
```

## 🧪 Testing the 7-Agent System

### 1. Test ScriptWriter Agent
```bash
curl -X POST "http://localhost:8000/scriptwriter/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A peaceful sunset over mountains",
    "duration": 60,
    "scene_count": 6
  }'
```

### 2. Test VisualGen Agent
```bash
curl -X POST "http://localhost:8000/visualgen/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "scenes": ["Scene 1 prompt", "Scene 2 prompt"],
    "video_id": "test-video-id"
  }'
```

### 3. Test Full Pipeline
```bash
curl -X POST "http://localhost:8000/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "prompt": "A serene mountain landscape at sunset",
    "duration": 60
  }'
```

## 🗄️ Database Development

### Local Database (Optional)
```bash
# Start local PostgreSQL with Docker
docker-compose up postgres -d

# Connect to local database
psql postgresql://postgres:postgres@localhost:5432/aeon
```

### Supabase Development
```bash
# Start local Supabase
supabase start

# View local dashboard
open http://localhost:54323

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --local > types/database.ts
```

### Database Migrations
```bash
# Create migration
supabase migration new add_new_table

# Apply migration
supabase db push

# Rollback migration
supabase db reset --db-url postgresql://...
```

## 🎨 Frontend Development

### Component Development
```bash
# Generate new component
npx shadcn-ui@latest add button

# Start Storybook (if configured)
npm run storybook
```

### Styling Guidelines
- Use **Tailwind CSS** for styling
- Follow **shadcn/ui** component patterns
- Implement **dark mode** by default
- Use **Framer Motion** for animations

### State Management
```typescript
// Use React hooks for local state
const [loading, setLoading] = useState(false)

// Use Zustand for global state (if needed)
import { useStore } from '@/lib/store'
```

## 🤖 Backend Development

### Adding New Agents
```python
# 1. Create new agent file
# api/agent_newfeature.py

class NewFeatureAgent:
    def __init__(self):
        self.agent_name = "newfeature"
    
    async def process(self, request):
        # Implementation
        pass

# 2. Add to main.py
from agent_newfeature import NewFeatureAgent
newfeature = NewFeatureAgent()

@app.post("/newfeature/process")
async def newfeature_process(request: NewFeatureRequest):
    return await newfeature.process(request)
```

### Database Operations
```python
# Use the database singleton
from database import db

# Create record
user = await db.create_user("test@example.com")

# Query records
videos = await db.get_user_videos(user_id)

# Update records
await db.update_video_status(video_id, "completed")
```

## 🔌 API Integration Testing

### Replicate Models
```python
# Test video generation
import replicate

output = replicate.run(
    "runway-ml/runway-gen3-alpha",
    input={
        "prompt": "A serene mountain landscape",
        "duration": 10
    }
)
```

### OpenAI Integration
```python
# Test script generation
import openai

response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {"role": "user", "content": "Generate 6 video scenes about mountains"}
    ]
)
```

### Stripe Testing
```bash
# Use test cards
# 4242424242424242 - Success
# 4000000000000002 - Declined

# Test webhook locally
stripe listen --forward-to localhost:8000/payments/webhook
```

## 🐛 Debugging

### Frontend Debugging
```bash
# Enable debug mode
DEBUG=true npm run dev

# View browser console
# Check Network tab for API calls
# Use React DevTools
```

### Backend Debugging
```python
# Add logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Use debugger
import pdb; pdb.set_trace()

# View logs
tail -f api/logs/app.log
```

### Database Debugging
```sql
-- Check table contents
SELECT * FROM videos WHERE status = 'processing';

-- View agent logs
SELECT * FROM agents WHERE video_id = 'your-video-id';

-- Check credit transactions
SELECT * FROM credits WHERE user_id = 'your-user-id';
```

## 📊 Performance Monitoring

### Local Monitoring
```bash
# Monitor API performance
curl -w "@curl-format.txt" -s -o /dev/null http://localhost:8000/health

# Monitor memory usage
htop

# Monitor database queries
supabase logs --type database
```

### Profiling
```python
# Profile Python code
import cProfile
cProfile.run('your_function()')

# Profile database queries
EXPLAIN ANALYZE SELECT * FROM videos;
```

## 🔄 Hot Reloading

### Frontend
- Next.js hot reloading is enabled by default
- Changes to components update instantly
- API route changes require restart

### Backend
- FastAPI auto-reload with `--reload` flag
- Changes to Python files update instantly
- Database schema changes require migration

## 📝 Development Tips

### Best Practices
1. **Use TypeScript** for all frontend code
2. **Add type hints** to all Python functions
3. **Write tests** for critical functionality
4. **Use environment variables** for configuration
5. **Follow naming conventions** consistently

### Common Pitfalls
- Don't commit `.env.local` files
- Always validate user inputs
- Handle async operations properly
- Use proper error handling
- Test with real API keys before deployment

### Useful Commands
```bash
# Reset everything
npm run clean && npm install
cd api && pip install -r requirements.txt

# Check all services
curl http://localhost:3000/api/health
curl http://localhost:8000/health

# View all logs
docker-compose logs -f
```

## 🆘 Getting Help

- **Documentation**: Check README.md and code comments
- **Issues**: Create GitHub issue with reproduction steps
- **Discord**: Join the AEON developer community
- **Email**: dev@aeon.ai

---

**Happy coding! 🚀**

The AEON platform is designed to be developer-friendly with clear separation of concerns across the 7-agent architecture.
