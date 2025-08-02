# AEON AI Video Platform

## 🚀 Overview

AEON is a production-ready AI video generation platform built with Next.js, FastAPI, and powered by Replicate AI. The platform features Clerk authentication, Supabase database integration, and is optimized for DigitalOcean droplet deployment.

## 🎯 Features

- **AI Video Generation**: Powered by Replicate API with multiple model support
- **User Authentication**: Secure Clerk integration with modal login
- **Database Integration**: Supabase for user data and video management
- **Real-time Processing**: Live status updates and progress tracking
- **Multiple Video Styles**: TikTok, YouTube, Instagram, Professional, Cinematic, Viral
- **Production Ready**: PM2 process management, Nginx reverse proxy, SSL support

## 🏗️ Architecture

### Frontend (`/frontend`)
- **Next.js 15** with App Router
- **Clerk Authentication** with modal login
- **Supabase Integration** for user data
- **Tailwind CSS** for styling
- **TypeScript** for type safety

### Backend (`/backend`)
- **FastAPI** with async video generation endpoints
- **Replicate API** integration for AI video models
- **PM2** process management
- **Python 3.9+** with virtual environment

## 🚀 Quick Deployment

### 1. Prepare Environment
```bash
# Clone repository
git clone <your-repo-url>
cd Elohim

# Create production environment file
cp env.production .env.production
# Edit .env.production with your actual values
```

### 2. Deploy to DigitalOcean
```bash
# Update deployment script with your droplet details
nano deploy-digitalocean.sh

# Run deployment
chmod +x deploy-digitalocean.sh
./deploy-digitalocean.sh
```

### 3. Manual Deployment
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

# Setup frontend
cd frontend
npm install
npm run build
cd ..

# Start services
pm2 start ecosystem.config.js
pm2 save
pm2 startup

sudo systemctl enable aeon-frontend
sudo systemctl start aeon-frontend
```

## 🔧 Environment Variables

Create a `.env` file on your server with:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_WEBHOOK_SECRET=whsec_...

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Replicate API
REPLICATE_API_TOKEN=r8_...

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

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

## 🔐 Security

- **Clerk Authentication**: Secure user management
- **Supabase RLS**: Row-level security for database
- **Environment Variables**: All secrets stored securely
- **SSL/HTTPS**: Let's Encrypt certificates
- **Firewall**: UFW configuration

## 📚 Documentation

- [DigitalOcean Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Clerk + Supabase Setup](frontend/CLERK_SETUP.md)
- [Video Generation Guide](VIDEO_GENERATION_README.md)
- [Modular Generation Guide](MODULAR_GENERATION_GUIDE.md)

## 🛠️ Development

### Local Development
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

### Testing
```bash
# Test backend
python test_modular_generation.py http://localhost:8000

# Test frontend
npm run build
npm start
```

## 🔧 Troubleshooting

1. **API Connection Issues**: Verify `NEXT_PUBLIC_BACKEND_URL` is correct
2. **Authentication Errors**: Check Clerk configuration
3. **Video Generation Fails**: Verify Replicate API token
4. **Database Issues**: Check Supabase connection
5. **Service Issues**: Check PM2 and systemd status

## 📈 Performance

- **PM2 Process Management**: Automatic restarts and monitoring
- **Nginx Reverse Proxy**: Efficient request routing
- **Python Virtual Environment**: Isolated dependencies
- **Node.js Production Build**: Optimized frontend delivery

## 🆘 Support

For issues or questions:
1. Check the logs using the monitoring commands above
2. Verify all environment variables are set correctly
3. Ensure your domain DNS is pointing to the correct IP
4. Test the application locally before deploying

---

**AEON Platform** - The Future of AI Video Creation 🚀

Built with ❤️ for production deployment on DigitalOcean.