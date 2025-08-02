#!/bin/bash

# AEON Video Platform - DigitalOcean Deployment Script
# Production deployment script for AEON Video backend

set -e

echo "🎬 AEON Video Platform - DigitalOcean Deployment"
echo "================================================"

# Configuration
DROPLET_IP="159.223.198.119"
PROJECT_NAME="aeon-video"
DEPLOY_PATH="/opt/aeon-video"
SERVICE_NAME="aeon-video-api"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

# Update system
log "Updating system packages..."
apt update && apt upgrade -y

# Install system dependencies
log "Installing system dependencies..."
apt install -y \
    python3 \
    python3-pip \
    python3-venv \
    nodejs \
    npm \
    nginx \
    git \
    curl \
    wget \
    unzip \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libglib2.0-0

# Install PM2 globally
log "Installing PM2..."
npm install -g pm2

# Create deployment directory
log "Creating deployment directory..."
mkdir -p $DEPLOY_PATH
cd $DEPLOY_PATH

# Clone repository (if not exists)
if [ ! -d ".git" ]; then
    log "Cloning repository..."
    git clone https://github.com/rosegoldcruz/elohim.git .
else
    log "Pulling latest changes..."
    git pull origin main
fi

# Create Python virtual environment
log "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
log "Installing Python dependencies..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Create logs directory
log "Creating logs directory..."
mkdir -p logs

# Create environment file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    log "Creating environment file template..."
    cat > backend/.env << EOF
# AEON Video Backend - Production Environment Variables
# Fill in your actual values

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
SUPABASE_ANON_KEY=your_supabase_anon_key

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

# Logging
LOG_LEVEL=INFO
LOG_FILE=aeon-video.log
EOF
    
    warn "Please edit backend/.env with your actual API keys and configuration"
fi

# Configure Nginx
log "Configuring Nginx..."
cat > /etc/nginx/sites-available/aeon-video << EOF
server {
    listen 80;
    server_name $DROPLET_IP smart4technology.com;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # API routes
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health check
    location /health {
        proxy_pass http://localhost:8000/health;
        access_log off;
    }
    
    # Static files (if any)
    location /static/ {
        alias $DEPLOY_PATH/backend/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable Nginx site
ln -sf /etc/nginx/sites-available/aeon-video /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
nginx -t

# Start PM2 process
log "Starting AEON Video API with PM2..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Reload Nginx
log "Reloading Nginx..."
systemctl reload nginx

# Configure firewall
log "Configuring firewall..."
ufw allow ssh
ufw allow 'Nginx Full'
ufw --force enable

# Create systemd service for PM2
log "Creating systemd service..."
pm2 startup systemd -u root --hp /root

# Test the API
log "Testing API endpoint..."
sleep 5
if curl -f http://localhost:8000/health > /dev/null 2>&1; then
    log "✅ API is running successfully!"
else
    warn "⚠️  API health check failed, checking logs..."
    pm2 logs $SERVICE_NAME --lines 20
fi

# Display status
log "Deployment completed!"
echo ""
echo "🎉 AEON Video Platform is now deployed!"
echo ""
echo "📡 API Endpoints:"
echo "   - Health: http://$DROPLET_IP/health"
echo "   - API Docs: http://$DROPLET_IP/docs"
echo "   - API Base: http://$DROPLET_IP"
echo ""
echo "🔧 Management Commands:"
echo "   - View logs: pm2 logs $SERVICE_NAME"
echo "   - Restart: pm2 restart $SERVICE_NAME"
echo "   - Status: pm2 status"
echo "   - Monitor: pm2 monit"
echo ""
echo "📝 Next Steps:"
echo "   1. Edit backend/.env with your API keys"
echo "   2. Restart the service: pm2 restart $SERVICE_NAME"
echo "   3. Configure SSL with Let's Encrypt"
echo "   4. Set up monitoring and alerts"
echo ""

# Optional: Install SSL certificate
read -p "Do you want to install SSL certificate with Let's Encrypt? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Installing SSL certificate..."
    apt install -y certbot python3-certbot-nginx
    certbot --nginx -d smart4technology.com --non-interactive --agree-tos --email your-email@example.com
    log "SSL certificate installed!"
fi

log "🎬 AEON Video Platform deployment completed successfully!" 