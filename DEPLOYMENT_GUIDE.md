# AEON Platform - DigitalOcean Deployment Guide

## 🚀 Overview

This guide will help you deploy the AEON AI Video Platform to a DigitalOcean droplet using native Python/Node.js with PM2 — no Docker required.

## 📋 Prerequisites

1. **DigitalOcean Droplet**: Ubuntu 22.04 LTS (recommended)
2. **Domain Name**: Pointing to your droplet IP
3. **SSH Access**: To your droplet
4. **API Keys**: Clerk, Replicate, and Supabase configured

## 🔧 Quick Deployment

### 1. Prepare Your Local Environment

```bash
# Clone the repository
git clone <your-repo-url>
cd Elohim

# Create production environment file
cp env.production .env.production
# Edit .env.production with your actual values
```

### 2. Configure Environment Variables

Edit `.env.production` with your actual values:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_actual_key
CLERK_SECRET_KEY=sk_live_your_actual_key
CLERK_WEBHOOK_SECRET=whsec_your_actual_webhook_secret

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Replicate API
REPLICATE_API_TOKEN=r8_your_actual_token

# Server Configuration
PORT=8000
HOST=0.0.0.0
```

### 3. Update Deployment Script

Edit `deploy-digitalocean.sh` and update these variables:

```bash
DOMAIN="yourdomain.com"           # Your actual domain
DROPLET_IP="your-droplet-ip"      # Your droplet's IP address
SSH_USER="root"                   # Your SSH user (usually root)
```

### 4. Deploy

```bash
# Make the script executable
chmod +x deploy-digitalocean.sh

# Run the deployment
./deploy-digitalocean.sh
```

## 🛠️ Manual Deployment Steps

If you prefer to deploy manually:

### 1. Server Setup

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Update system
apt update && apt upgrade -y

# Install dependencies
apt install -y python3 python3-pip python3-venv nodejs npm nginx git

# Install PM2 globally
npm install -g pm2
```

### 2. Clone and Setup Project

```bash
# Clone your repository
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

# Setup frontend
cd frontend
npm install
npm run build
cd ..
```

### 3. Start Services

```bash
# Create logs directory
mkdir -p logs

# Start backend with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Start frontend with systemd
sudo cp aeon-frontend.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable aeon-frontend
sudo systemctl start aeon-frontend
```

### 4. Configure Nginx

```bash
# Copy Nginx configuration
sudo cp nginx-aeon.conf /etc/nginx/sites-available/aeon
sudo ln -sf /etc/nginx/sites-available/aeon /etc/nginx/sites-enabled/

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
```

## 🔐 SSL Certificate Setup

### Using Let's Encrypt

```bash
# Install Certbot
apt install certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d aeon.yourdomain.com

# Auto-renewal
crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoring and Management

### Check Service Status

```bash
# Check PM2 status
pm2 status
pm2 logs aeon-api

# Check frontend service
systemctl status aeon-frontend
journalctl -u aeon-frontend -f

# Check Nginx
systemctl status nginx
tail -f /var/log/nginx/error.log
```

### Restart Services

```bash
# Restart backend
pm2 restart aeon-api

# Restart frontend
systemctl restart aeon-frontend

# Restart Nginx
systemctl reload nginx
```

### Update Deployment

```bash
# Pull latest code
cd /opt/aeon-platform
git pull origin main

# Rebuild frontend
cd frontend
npm install
npm run build
cd ..

# Restart services
pm2 restart aeon-api
systemctl restart aeon-frontend
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using port 3000 or 8000
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :8000
   ```

2. **PM2 Issues**
   ```bash
   # Check PM2 logs
   pm2 logs aeon-api --lines 100
   
   # Restart PM2
   pm2 kill
   pm2 start ecosystem.config.js
   ```

3. **Nginx Issues**
   ```bash
   # Test Nginx configuration
   nginx -t
   
   # Check Nginx error logs
   tail -f /var/log/nginx/error.log
   ```

4. **Environment Variables**
   ```bash
   # Check if environment file exists
   ls -la /opt/aeon-platform/.env
   
   # Test environment loading
   cd /opt/aeon-platform
   source venv/bin/activate
   python -c "import os; print(os.getenv('REPLICATE_API_TOKEN'))"
   ```

### Log Locations

- **PM2 Logs**: `/opt/aeon-platform/logs/`
- **Frontend Logs**: `journalctl -u aeon-frontend`
- **Nginx Logs**: `/var/log/nginx/`
- **System Logs**: `/var/log/syslog`

## 📈 Performance Optimization

### Resource Monitoring

```bash
# Check system resources
htop
df -h
free -h

# Check PM2 resource usage
pm2 monit
```

### Scaling Considerations

1. **Upgrade Droplet**: Increase RAM/CPU in DigitalOcean dashboard
2. **Load Balancing**: Add more droplets behind a load balancer
3. **Database**: Consider using managed PostgreSQL instead of local

## 🔒 Security Best Practices

1. **Firewall**: Configure UFW
   ```bash
   ufw allow ssh
   ufw allow 'Nginx Full'
   ufw enable
   ```

2. **SSH Security**: Use key-based authentication
   ```bash
   # Disable password authentication
   nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   systemctl restart ssh
   ```

3. **Regular Updates**
   ```bash
   # Set up automatic updates
   apt install unattended-upgrades
   dpkg-reconfigure unattended-upgrades
   ```

## 🆘 Support

If you encounter issues:

1. Check the logs using the commands above
2. Verify all environment variables are set correctly
3. Ensure your domain DNS is pointing to the correct IP
4. Test the application locally before deploying

---

**Note**: This deployment approach provides a clean, production-ready setup without Docker complexity. The AEON platform will run efficiently on your DigitalOcean droplet with proper monitoring and management tools. 