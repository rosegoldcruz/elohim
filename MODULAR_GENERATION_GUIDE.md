# AEON Modular Video Generation Guide

## 🚀 Quick Start

### 1. Backend Deployment (DigitalOcean)
```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Clone and setup
cd /opt
git clone <your-repo-url> aeon-platform
cd aeon-platform

# Setup Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 2. Frontend Deployment (DigitalOcean)
```bash
# Setup frontend
cd frontend
npm install
npm run build

# Start with systemd
sudo systemctl enable aeon-frontend
sudo systemctl start aeon-frontend
```

## 🔧 Environment Variables

**DigitalOcean Backend:**
```bash
REPLICATE_API_TOKEN=r8_your_token
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Frontend:**
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 🎯 Features

- **Modular Video Generation**: Scene-based video creation
- **Multiple AI Models**: Support for various video generation models
- **Real-time Processing**: Status updates and progress tracking
- **User Authentication**: Clerk integration
- **Database Integration**: Supabase for data persistence
- **DigitalOcean** deployment ready

## 📊 Monitoring

```bash
# Check backend status
pm2 status
pm2 logs aeon-api

# Check frontend status
systemctl status aeon-frontend
journalctl -u aeon-frontend -f

# Check Nginx
systemctl status nginx
tail -f /var/log/nginx/error.log
```

## 🔧 Testing

Test the modular generation endpoint:

```bash
python test_modular_generation.py http://localhost:8000
```

## 📚 Documentation

- [DigitalOcean Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Clerk + Supabase Setup](frontend/CLERK_SETUP.md)
- [API Documentation](backend/README.md)
