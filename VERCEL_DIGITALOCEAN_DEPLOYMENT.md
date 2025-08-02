# AEON Platform - Vercel + DigitalOcean Deployment

## 🚀 Overview

This guide deploys the AEON platform with:
- **Frontend**: Vercel (Next.js) - Live at smart4technology.com
- **Backend**: DigitalOcean Droplet (FastAPI + PM2)
- **Authentication**: Clerk
- **Database**: Supabase

## 📋 Prerequisites

1. **Vercel Account**: [vercel.com](https://vercel.com)
2. **DigitalOcean Droplet**: Ubuntu 22.04 LTS
3. **Clerk Account**: [clerk.com](https://clerk.com)
4. **Supabase Account**: [supabase.com](https://supabase.com)
5. **Replicate API Token**: [replicate.com](https://replicate.com)

## 🔧 Backend Deployment (DigitalOcean)

### 1. Setup Droplet

```bash
# SSH into your droplet
ssh root@159.223.198.119

# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y python3 python3-pip python3-venv nodejs npm nginx git

# Install PM2 globally
npm install -g pm2
```

### 2. Deploy Backend

```bash
# Clone repository
cd /opt
git clone <your-repo-url> aeon-platform
cd aeon-platform

# Create environment file
cp env.production .env
# Edit .env with your actual values

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Create logs directory
mkdir -p logs

# Start backend with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. Configure Nginx

```bash
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/aeon-backend << EOF
server {
    listen 80;
    server_name smart4technology.com;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/aeon-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. SSL Certificate (Optional)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d smart4technology.com
```

## 🌐 Frontend Deployment (Vercel)

### 1. Connect to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from frontend directory
cd frontend
vercel --prod
```

### 2. Set Environment Variables in Vercel

In your Vercel dashboard, set these environment variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Backend API (DigitalOcean Droplet)
NEXT_PUBLIC_BACKEND_URL=https://smart4technology.com:8000

# Optional: Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

### 3. Configure Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed

## 🔐 Environment Variables

### Backend (.env on DigitalOcean)

```bash
# Replicate API
REPLICATE_API_TOKEN=r8_your_token

# Supabase Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

### Frontend (Vercel Environment Variables)

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_key
CLERK_SECRET_KEY=sk_live_your_key
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Backend API (DigitalOcean Droplet)
NEXT_PUBLIC_BACKEND_URL=https://smart4technology.com:8000
```

## 📊 Monitoring

### Backend (DigitalOcean)

```bash
# Check PM2 status
pm2 status
pm2 logs aeon-api

# Check Nginx
systemctl status nginx
tail -f /var/log/nginx/error.log

# Check system resources
htop
df -h
```

### Frontend (Vercel)

- **Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
- **Analytics**: Built-in Vercel Analytics
- **Logs**: Function logs in Vercel dashboard

## 🔧 Troubleshooting

### Backend Issues

1. **PM2 Process Down**
   ```bash
   pm2 restart aeon-api
   pm2 logs aeon-api --lines 100
   ```

2. **Nginx Issues**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   tail -f /var/log/nginx/error.log
   ```

3. **Environment Variables**
   ```bash
   cd /opt/aeon-platform
   source venv/bin/activate
   python -c "import os; print(os.getenv('REPLICATE_API_TOKEN'))"
   ```

### Frontend Issues

1. **Build Failures**: Check Vercel build logs
2. **API Connection**: Verify `NEXT_PUBLIC_BACKEND_URL` is correct
3. **Authentication**: Check Clerk configuration

### CORS Issues

If you get CORS errors, update the backend CORS configuration:

```python
# In backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://smart4technology.com", "https://yourdomain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🔄 Updates

### Backend Updates

```bash
# SSH into droplet
ssh root@159.223.198.119

# Pull latest code
cd /opt/aeon-platform
git pull origin main

# Restart services
pm2 restart aeon-api
```

### Frontend Updates

```bash
# Deploy from frontend directory
cd frontend
vercel --prod
```

## 🔒 Security

1. **Firewall**: Configure UFW on DigitalOcean
   ```bash
   ufw allow ssh
   ufw allow 'Nginx Full'
   ufw enable
   ```

2. **SSL**: Use Let's Encrypt for HTTPS
3. **Environment Variables**: Never commit secrets to git
4. **PM2**: Secure PM2 configuration

## 📈 Performance

- **Vercel Edge Network**: Global CDN for frontend
- **PM2 Process Management**: Reliable backend uptime
- **Nginx Reverse Proxy**: Efficient request routing
- **Python Virtual Environment**: Isolated dependencies

---

**Your AEON platform is now deployed with Vercel frontend and DigitalOcean backend! 🚀** 