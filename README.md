# AEON AI Video Generation Platform

🎬 **AEON** is a cinematic intelligence engine that transforms ideas into professional AI-generated videos using a 6-model ensemble approach.

## 🚀 Features

- **6-Model AI Ensemble**: RunwayML, Pika, Stable Video, Luma, Minimax, Kling
- **Complete Video Generation**: 60-second videos (not just clips)
- **Credit-Based System**: 100 credits = 1 complete video
- **Multi-Tier Pricing**: $19.99/$49.99/$99.99 plans
- **Real-time Processing**: Supabase + Redis orchestration
- **Professional Quality**: Cinematic output for creators

## 🧠 Docker LLM Runner

This project includes a Docker-based LLM runner that automatically processes AI tasks and uploads results to Vercel Blob storage with Supabase logging.

### 🔧 Setup

#### Required GitHub Secrets

Configure these secrets in your GitHub repository settings:

- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (not anon key)
- `VERCEL_BLOB_READ_WRITE_TOKEN` - Vercel Blob storage token (if needed)

## 🔧 Environment Setup

All environment variables are configured in `.env.local`. The project includes:

### ✅ Core Services
- **Supabase**: Database, Auth, Real-time sync
- **Stripe**: Payment processing and subscriptions
- **Clerk**: Authentication (alternative to Supabase Auth)

### ✅ AI Services
- **OpenAI**: GPT-4 for script generation
- **Claude**: Anthropic's AI for content creation
- **Replicate**: Multi-model video generation
- **ElevenLabs**: Voice synthesis and narration

### ✅ Monitoring & Analytics
- **Dash0**: Telemetry, logging, and observability
- **EmailJS**: Transactional email notifications

### ✅ Environment Validation
The project uses `env.mjs` with Zod validation to ensure all required environment variables are properly configured.

#### Supabase Database Schema

Make sure your Supabase database has the `llm_outputs` table:

```sql
CREATE TABLE llm_outputs (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  blob_url TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 🚀 How It Works

1. **Trigger**: Workflow runs on push/PR to `main` branch
2. **Build**: Creates Docker image with Node.js 20 Alpine
3. **Execute**: Runs `llm-runner.js` inside container
4. **Output**: Generates timestamped content
5. **Upload**: Stores output in Vercel Blob storage
6. **Log**: Records metadata in Supabase database

### 📁 Files

- `.github/workflows/docker-llm-runner.yml` - GitHub Actions workflow
- `Dockerfile` - Docker container configuration
- `llm-runner.js` - Main LLM processing script

### 🔄 Local Development

```bash
# Install dependencies
pnpm install

# Run locally (requires environment variables)
node llm-runner.js

# Build Docker image
docker build -t llm-runner .

# Run Docker container
docker run --rm -e SUPABASE_URL="..." -e SUPABASE_SERVICE_ROLE="..." llm-runner
```

### 🎯 Integration with AEON

This Docker runner is designed to integrate with AEON's agent orchestration system, providing scalable AI processing capabilities for video generation workflows.
