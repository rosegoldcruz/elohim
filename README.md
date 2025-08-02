# 🎬 AEON Video Platform

**Production-ready AI video generation platform with clean, modular architecture**

> **🌟 Cloud-Native Platform**: AEON runs entirely on cloud services with no Docker dependencies. Powered by Vercel + DigitalOcean + Clerk + Supabase + Replicate for maximum scalability and reliability.

## 🚀 Architecture

### **Frontend (Vercel)**
- **Framework**: Next.js 14 with App Router
- **Authentication**: Clerk (JWT-based)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel Edge Network

### **Backend (DigitalOcean Droplet)**
- **Framework**: FastAPI (Python)
- **Process Manager**: PM2
- **Reverse Proxy**: Nginx
- **Authentication**: Clerk JWT verification
- **Video Generation**: Replicate API
- **Database**: Supabase

### **Services**
- **Authentication**: Clerk
- **Database**: Supabase
- **Video Generation**: Replicate API
- **Storage**: Vercel Blob
- **Payments**: Stripe

## 📁 Project Structure

```
ROOT/
├── backend/
│   ├── main.py                 # FastAPI entry point
│   ├── api/                    # API routes
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── generate.py        # Video generation
│   │   ├── modular.py         # Modular generation
│   │   ├── status.py          # Job tracking
│   │   └── video.py           # Video processing
│   ├── utils/                  # Utilities
│   │   ├── auth.py            # JWT verification
│   │   └── config.py          # Configuration
│   ├── app/                    # Video processing modules
│   │   ├── pipeline.py        # Video pipeline
│   │   ├── transitions.py     # Transition engine
│   │   ├── captions.py        # Caption generation
│   │   ├── sfx.py             # Sound effects
│   │   ├── beat_sync.py       # Beat synchronization
│   │   └── hooks.py           # Video hooks
│   ├── agents/                 # AI agents
│   ├── requirements.txt        # Python dependencies
│   └── .env                    # Backend environment (not in git)
├── frontend/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Homepage
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── generate/          # Generation pages
│   │   └── auth/              # Auth pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities
│   │   ├── api.ts             # API client
│   │   ├── auth.ts            # Auth utilities
│   │   └── supabase/          # Supabase client
│   ├── package.json            # Frontend dependencies
│   └── .env.local              # Frontend environment (not in git)
├── scripts/
│   └── start_aeon_video.py    # Backend startup script
├── ecosystem.config.js         # PM2 configuration
├── deploy-digitalocean.sh      # Deployment script
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
```

## 🛠️ Setup & Deployment

### **1. Backend Deployment (DigitalOcean)**

```bash
# SSH into your droplet
ssh root@159.223.198.119

# Run deployment script
chmod +x deploy-digitalocean.sh
./deploy-digitalocean.sh
```

**Manual Setup:**
```bash
# Install dependencies
apt update && apt upgrade -y
apt install -y python3 python3-pip python3-venv nodejs npm nginx git
npm install -g pm2

# Clone repository
cd /opt
git clone https://github.com/rosegoldcruz/elohim.git aeon-video
cd aeon-video

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Create environment file
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Start with PM2
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### **2. Frontend Deployment (Vercel)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

**Environment Variables (Vercel Dashboard):**
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Backend API
NEXT_PUBLIC_BACKEND_URL=https://smart4technology.com:8000
```

### **3. Environment Configuration**

**Backend (.env on DigitalOcean):**
```bash
# Server Configuration
HOST=0.0.0.0
PORT=8000
ENVIRONMENT=production

# Clerk Authentication
CLERK_SECRET_KEY=sk_live_your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=pk_live_your_clerk_publishable_key
CLERK_JWT_ISSUER=https://clerk.accounts.dev

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Replicate API
REPLICATE_API_TOKEN=r8_your_replicate_token

# OpenAI API
OPENAI_API_KEY=sk-your_openai_api_key

# ElevenLabs API
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Vercel Blob Storage
VERCEL_BLOB_READ_WRITE_TOKEN=your_vercel_blob_token

# Stripe
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret

# CORS Origins
ALLOWED_ORIGINS=https://smart4technology.com,https://vercel.app,http://localhost:3000
```

## 🔐 Security Features

- **JWT Authentication**: Clerk JWT verification with JWKS
- **Environment Variables**: All secrets stored in .env files (not in git)
- **CORS Protection**: Configured for specific origins
- **Rate Limiting**: Built into FastAPI
- **Input Validation**: Pydantic models for all requests
- **Error Handling**: Comprehensive error handling and logging

## 🎯 API Endpoints

### **Authentication**
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout user

### **Video Generation**
- `POST /api/generate/` - Generate single video
- `GET /api/generate/status/{prediction_id}` - Check generation status
- `GET /api/generate/models` - Get available models

### **Modular Generation**
- `POST /api/modular/` - Start modular generation
- `POST /api/modular/status` - Poll modular status

### **Job Management**
- `GET /api/status/jobs` - Get user jobs
- `GET /api/status/jobs/{job_id}` - Get job status
- `DELETE /api/status/jobs/{job_id}` - Cancel job

### **Video Processing**
- `POST /api/video/edit` - Edit video
- `POST /api/video/upload` - Upload video
- `POST /api/video/transitions` - Apply transitions
- `POST /api/video/captions` - Generate captions

### **System Health**
- `GET /api/status/health` - System health check
- `GET /api/status/metrics` - System metrics

## 🎬 Video Generation Features

### **AI Models**
- **Kling AI**: High-quality video generation
- **Runway ML**: Professional video generation
- **Pika Labs**: Fast video generation
- **Stable Diffusion**: Image-to-video
- **Luma AI**: Advanced video generation
- **Minimax**: Chinese AI model

### **Video Processing**
- **Transitions**: Smooth scene transitions
- **Captions**: AI-generated captions
- **Sound Effects**: Background music and SFX
- **Beat Sync**: Audio-visual synchronization
- **Post-processing**: Color grading, effects

### **Formats & Resolutions**
- **Formats**: MP4, WebM, GIF
- **Resolutions**: 480p, 720p, 1080p, 4K
- **Aspect Ratios**: 9:16 (TikTok), 16:9 (YouTube), 1:1 (Instagram)
- **Framerates**: 24fps, 30fps, 60fps

## 🔧 Development

### **Local Development**

```bash
# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev
```

### **Testing**

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📊 Monitoring & Logging

### **PM2 Monitoring**
```bash
# View logs
pm2 logs aeon-video-api

# Monitor processes
pm2 monit

# View status
pm2 status
```

### **Nginx Logs**
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### **System Monitoring**
```bash
# System resources
htop
df -h

# Process monitoring
ps aux | grep python
```

## 🚀 Performance

- **Global CDN**: Vercel Edge Network for frontend
- **Load Balancing**: Nginx reverse proxy
- **Process Management**: PM2 for reliability
- **Caching**: Redis (optional)
- **Database**: Supabase with connection pooling

## 🔄 Updates & Maintenance

### **Backend Updates**
```bash
# SSH into droplet
ssh root@159.223.198.119

# Pull latest code
cd /opt/aeon-video
git pull origin main

# Restart services
pm2 restart aeon-video-api
```

### **Frontend Updates**
```bash
# Deploy to Vercel
cd frontend
vercel --prod
```

## 🆘 Troubleshooting

### **Common Issues**

1. **Backend not starting**
   ```bash
   pm2 logs aeon-video-api --lines 50
   python3 -c "import sys; print(sys.path)"
   ```

2. **Authentication errors**
   - Check Clerk configuration
   - Verify JWT issuer
   - Check CORS settings

3. **Video generation fails**
   - Verify Replicate API token
   - Check model availability
   - Review error logs

4. **Database connection issues**
   - Check Supabase credentials
   - Verify network connectivity
   - Check RLS policies

### **Log Locations**
- **Application**: `aeon-video.log`
- **PM2**: `~/.pm2/logs/`
- **Nginx**: `/var/log/nginx/`
- **System**: `/var/log/syslog`

## 📈 Scaling

### **Horizontal Scaling**
- Multiple PM2 instances
- Load balancer configuration
- Database read replicas

### **Vertical Scaling**
- Increase droplet resources
- Optimize Python processes
- Database optimization

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit secrets
2. **JWT Verification**: Always verify tokens
3. **Input Validation**: Validate all inputs
4. **Rate Limiting**: Prevent abuse
5. **HTTPS**: Use SSL certificates
6. **Firewall**: Configure UFW
7. **Updates**: Keep dependencies updated

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📞 Support

- **Documentation**: `/docs` within the platform
- **Issues**: GitHub Issues
- **Email**: support@smart4technology.com

---

**🎬 AEON Video Platform - Production-ready AI video generation with clean, modular architecture!**