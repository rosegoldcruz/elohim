# 🐳 AEON Docker Setup Guide

This guide will help you set up and run the AEON AI Video Generation Platform using Docker.

## 📋 Prerequisites

1. **Docker Desktop** - Install from [docker.com](https://www.docker.com/products/docker-desktop/)
2. **Docker Compose** - Included with Docker Desktop
3. **Git** - For cloning the repository

## 🚀 Quick Start

### 1. Clone and Setup Environment

```bash
git clone https://github.com/rosegoldcruz/elohim.git
cd elohim

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your actual API keys
# Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, STRIPE_API_KEY
```

### 2. Start Development Environment

**Linux/macOS:**
```bash
chmod +x scripts/docker-dev.sh
./scripts/docker-dev.sh
```

**Windows:**
```cmd
scripts\docker-dev.bat
```

**Manual:**
```bash
docker-compose up -d
```

### 3. Access Services

- 📱 **Frontend**: http://localhost:3000
- 🔧 **Backend API**: http://localhost:8000
- 📊 **Redis**: localhost:6379
- 🗄️ **PostgreSQL** (optional): localhost:5432

## 🏗️ Architecture

The Docker setup includes:

- **Frontend** (Next.js 15) - Port 3000
- **Backend** (FastAPI) - Port 8000  
- **LLM Runner** (Node.js) - Port 3001
- **Redis** (Cache/Queue) - Port 6379
- **PostgreSQL** (Optional) - Port 5432

## 📦 Services

### Frontend (Next.js)
- **Image**: `node:20-alpine`
- **Package Manager**: `pnpm`
- **Build**: Standalone output for Docker
- **Health Check**: `/api/health`

### Backend (FastAPI)
- **Image**: `python:3.11-slim`
- **Dependencies**: FFmpeg, curl, git
- **Health Check**: `/health`

### LLM Runner
- **Image**: `node:20-alpine`
- **Purpose**: AI model processing
- **Dependencies**: Supabase, Vercel Blob

## 🔧 Environment Variables

### Required Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Stripe
STRIPE_API_KEY=sk_test_your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_API=pk_test_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# AI Services
OPENAI_API_KEY=sk-your_openai_key
REPLICATE_API_TOKEN=r8_your_replicate_token

# Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_your_token
```

### Optional Variables

```env
# LLM Configuration
LLM_MODE=openai
LOCAL_LLM_HOST=http://localhost:12434

# Additional AI Services
ELEVENLABS_API_KEY=sk_your_elevenlabs_key

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_your_posthog_key
```

## 🛠️ Development Commands

```bash
# Build all services
pnpm docker:build

# Start services
pnpm docker:up

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down

# Clean up (remove volumes)
pnpm docker:clean

# Individual service logs
docker-compose logs -f frontend
docker-compose logs -f backend
docker-compose logs -f llm-runner
```

## 🔍 Health Checks

All services include health checks:

```bash
# Check all services
curl http://localhost:3000/api/health  # Frontend
curl http://localhost:8000/health      # Backend
docker-compose exec redis redis-cli ping  # Redis
```

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**
   ```bash
   # Check what's using ports
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :8000
   ```

2. **Environment variables not loading**
   - Ensure `.env.local` exists
   - Check variable names match exactly
   - Restart containers after changes

3. **Build failures**
   ```bash
   # Clean build
   docker-compose down -v
   docker system prune -f
   docker-compose build --no-cache
   ```

4. **Permission issues (Linux/macOS)**
   ```bash
   sudo chown -R $USER:$USER .
   chmod +x scripts/docker-dev.sh
   ```

### Logs and Debugging

```bash
# View all logs
docker-compose logs

# Follow specific service
docker-compose logs -f frontend

# Enter container shell
docker-compose exec frontend sh
docker-compose exec backend bash

# Check container status
docker-compose ps
```

## 🚀 Production Deployment

For production, use the optimized builds:

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production config
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 Monitoring

Health check endpoints:
- Frontend: `GET /api/health`
- Backend: `GET /health`
- Redis: `redis-cli ping`

## 🔒 Security Notes

1. **Never commit real API keys**
2. **Use `.env.local` for secrets**
3. **Rotate keys regularly**
4. **Use Docker secrets in production**

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [FastAPI Docker Guide](https://fastapi.tiangolo.com/deployment/docker/)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Ensure Docker Desktop is running
4. Check port availability
5. Review this documentation

For additional help, create an issue in the repository.
