# AEON - AI Video Generation SaaS Platform

![AEON Platform](./docs/aeon-banner.jpg)

**AEON** is a production-ready AI video generation SaaS platform built with a modular 7-agent architecture. Transform any topic into professional videos with automated script generation, multi-model AI video creation, and intelligent post-processing.

> **🌟 Cloud-Native Platform**: AEON runs entirely on cloud services with no Docker or local container dependencies. Powered by Vercel + Replicate + Supabase for maximum scalability and reliability.

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

### 🌾 DocHarvester Integration
- **Universal documentation extraction** from ANY website
- **Auto-discovery** of documentation pages with intelligent crawling
- **LLM-ready processing** with chunking and metadata extraction
- **Multiple export formats**: JSON, Markdown, Text, CSV, Training data
- **Seamless integration** within AEON platform at `/docs/docharvester`
- **Batch processing** with retry logic and error handling

## 🧠 Cloud-Native AI Processing

AEON processes all AI tasks through cloud APIs with automatic uploads to Vercel Blob storage and Supabase logging.

### 🔧 Setup

#### Required Environment Variables

Configure these in your `.env.local` file:

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

AEON is a **cloud-native platform** that runs entirely on Vercel with Replicate API for AI video generation:

1. **Frontend**: Next.js 14 App Router deployed on Vercel
2. **AI Processing**: Replicate API for all video generation models
3. **Storage**: Vercel Blob for video assets
4. **Database**: Supabase for user data and project management
5. **Payments**: Stripe for subscriptions and credits

### 🔄 Local Development

```bash
# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Add your API keys to .env.local
# Required: REPLICATE_API_TOKEN, NEXT_PUBLIC_SUPABASE_URL, STRIPE_API_KEY

# Start development server
pnpm dev
```

### 🎯 Cloud-Native Architecture

AEON uses a modern cloud-native stack with no local containers or Docker dependencies:
- **Vercel** for hosting and deployment
- **Replicate** for AI model inference
- **Supabase** for database and authentication
- **Stripe** for payment processing

## 📚 Documentation

Access comprehensive documentation at `/docs` within the platform:
- **AEON Platform Docs**: Complete platform guides and API reference
- **DocHarvester**: Universal documentation extraction tool
