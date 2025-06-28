# AEON - AI Video Generation SaaS Platform

![AEON Platform](./docs/aeon-banner.jpg)

**AEON** is a production-ready AI video generation SaaS platform built with a modular 7-agent architecture. Transform any topic into professional videos with automated script generation, multi-model AI video creation, and intelligent post-processing.

> Based on the MIT-licensed [ai-video-generator](https://github.com/davide97l/ai-video-generator) by davide97l, restructured for enterprise SaaS deployment.

## 🚀 Features

### 🤖 7-Agent Architecture
- **ScriptWriter Agent**: GPT-4 powered scene generation from topics
- **VisualGen Agent**: Parallel processing across 6 Replicate models (Runway, Pika, Stable, Luma, Minimax, Kling)
- **Editor Agent**: FFmpeg-based video assembly with transitions, music, and captions
- **Scheduler Agent**: Async task queue management and job status tracking
- **Payments Agent**: Stripe integration for subscriptions and one-time purchases
- **Auth Agent**: Supabase magic link authentication
- **Dashboard Agent**: User analytics and admin insights

### 💰 SaaS Features
- **Credit-based billing** (100 credits = 60s video)
- **Subscription tiers**: Starter ($19/mo), Pro ($49/mo), Business ($99/mo)
- **One-time purchases**: $29.95 for instant video generation
- **Magic link authentication** (passwordless)
- **Real-time job tracking** and status updates
- **Admin dashboard** with MRR, churn, and queue analytics

### 🎬 Video Generation
- **Multi-model ensemble**: 6 AI models for maximum quality
- **Intelligent fallback**: Automatic model switching on failures
- **Professional post-processing**: Transitions, background music, captions
- **Multiple formats**: 60s, 120s videos in 1080p/4K
- **Instant delivery**: Vercel Blob storage with public download links

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
