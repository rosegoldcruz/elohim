# AEON AI Video Generation Platform - Deployment Guide

This guide covers deploying the AEON platform to production using Vercel (frontend) and Railway/Render (backend).

## 🏗️ Architecture Overview

```
Frontend (Next.js 15) → Vercel
Backend (FastAPI) → Railway/Render  
Database → Supabase
Storage → Vercel Blob
Payments → Stripe
AI Services → OpenAI, Replicate, ElevenLabs
```

## 🚀 Quick Deploy

### 1. Frontend Deployment (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-org/aeon-platform)

**Manual Steps:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### 2. Backend Deployment (Railway)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/your-template)

**Manual Steps:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway link
railway up
```

### 3. Database Setup (Supabase)

1. Create project at [supabase.com](https://supabase.com)
2. Run migrations:
```bash
supabase db push
```

## 📋 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
BACKEND_URL=https://your-backend.railway.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Backend
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
OPENAI_API_KEY=sk-...
REPLICATE_API_TOKEN=r8_...
ELEVENLABS_API_KEY=sk_...
VERCEL_BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

## 🔧 Platform-Specific Setup

### Vercel (Frontend)

1. **Connect Repository**
   - Import from GitHub
   - Select framework: Next.js
   - Root directory: `/`

2. **Environment Variables**
   - Add all `NEXT_PUBLIC_*` variables
   - Set `NODE_ENV=production`

3. **Build Settings**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm ci"
   }
   ```

### Railway (Backend)

1. **Create Service**
   - Connect GitHub repository
   - Set root directory: `/api`

2. **Environment Variables**
   - Add all backend environment variables
   - Set `PORT=8000`

3. **Build Settings**
   ```dockerfile
   # Uses api/Dockerfile automatically
   ```

4. **Health Check**
   - Path: `/health`
   - Port: `8000`

### Render (Alternative Backend)

1. **Create Web Service**
   - Connect repository
   - Root directory: `api`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 🗄️ Database Migration

### Supabase Setup

1. **Create Project**
   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Initialize
   supabase init

   # Link to project
   supabase link --project-ref your-project-ref
   ```

2. **Run Migrations**
   ```bash
   # Push schema
   supabase db push

   # Verify
   supabase db diff
   ```

3. **Set up RLS Policies**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
   
   -- Add policies (see supabase/schema.sql)
   ```

## 💳 Stripe Configuration

### 1. Create Products
```bash
# Starter Plan
stripe products create --name "AEON Starter" --description "1,000 credits/month"
stripe prices create --product prod_xxx --unit-amount 1900 --currency usd --recurring interval=month

# Pro Plan  
stripe products create --name "AEON Pro" --description "3,000 credits/month"
stripe prices create --product prod_xxx --unit-amount 4900 --currency usd --recurring interval=month

# Business Plan
stripe products create --name "AEON Business" --description "8,000 credits/month"
stripe prices create --product prod_xxx --unit-amount 9900 --currency usd --recurring interval=month

# Instant Video
stripe products create --name "AEON Instant Video" --description "150 credits one-time"
stripe prices create --product prod_xxx --unit-amount 2995 --currency usd
```

### 2. Configure Webhooks
- Endpoint: `https://your-backend.railway.app/payments/webhook`
- Events: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.*`

## 🔐 Security Checklist

### Production Security
- [ ] Enable HTTPS everywhere
- [ ] Set secure environment variables
- [ ] Configure CORS properly
- [ ] Enable Supabase RLS policies
- [ ] Set up rate limiting
- [ ] Configure CSP headers
- [ ] Enable Stripe webhook signature verification

### API Security
```python
# Add to FastAPI main.py
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware, 
    allowed_hosts=["your-domain.com", "*.vercel.app"]
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.vercel.app"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)
```

## 📊 Monitoring & Analytics

### 1. Error Tracking
```bash
# Add Sentry
npm install @sentry/nextjs @sentry/python
```

### 2. Performance Monitoring
- Vercel Analytics (built-in)
- Railway Metrics (built-in)
- Supabase Dashboard

### 3. Uptime Monitoring
- UptimeRobot
- Pingdom
- StatusPage

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   ```javascript
   // Add to next.config.js
   async headers() {
     return [
       {
         source: '/api/:path*',
         headers: [
           { key: 'Access-Control-Allow-Origin', value: '*' },
         ],
       },
     ]
   }
   ```

2. **Environment Variables Not Loading**
   ```bash
   # Check Vercel deployment logs
   vercel logs

   # Check Railway logs  
   railway logs
   ```

3. **Database Connection Issues**
   ```bash
   # Test connection
   supabase db ping

   # Check RLS policies
   supabase db diff
   ```

4. **FFmpeg Not Found**
   ```dockerfile
   # Add to Dockerfile
   RUN apt-get update && apt-get install -y ffmpeg
   ```

## 📈 Scaling Considerations

### Performance Optimization
- Enable Next.js Image Optimization
- Use Vercel Edge Functions for API routes
- Implement Redis caching for backend
- Use CDN for video delivery

### Cost Optimization
- Monitor Replicate API usage
- Implement video generation queues
- Use Vercel Blob for efficient storage
- Optimize database queries

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy AEON Platform

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v20

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway-deploy@v1
```

## 📞 Support

- **Documentation**: [docs.aeon.ai](https://docs.aeon.ai)
- **Discord**: [Join Community](https://discord.gg/aeon)
- **Email**: support@aeon.ai

---

**🎉 Your AEON platform is now live!**

Visit your deployed application and start generating AI videos with the 7-agent architecture.
