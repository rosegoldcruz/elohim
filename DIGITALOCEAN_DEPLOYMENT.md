# AEON Platform - DigitalOcean Deployment Guide

## 🚀 Overview

This guide will help you deploy the AEON platform to your existing DigitalOcean droplet alongside your other projects.

## 📋 Prerequisites

1. **Existing DigitalOcean Droplet**: You already have one running other projects
2. **Domain Name**: A domain pointing to your droplet
3. **SSH Access**: Ability to SSH into your droplet
4. **Docker & Docker Compose**: Installed on your droplet

## 🔧 Setup Options

### Option 1: Subdomain Approach (Recommended)
- Your existing project: `yourdomain.com`
- AEON Platform: `aeon.yourdomain.com`

### Option 2: Path-based Approach
- Your existing project: `yourdomain.com`
- AEON Platform: `yourdomain.com/aeon`

### Option 3: Different Ports
- Your existing project: `yourdomain.com` (port 80/443)
- AEON Platform: `yourdomain.com:3000`

## 🛠️ Step-by-Step Deployment

### 1. Prepare Your Local Environment

```bash
# Clone the repository (if not already done)
git clone <your-repo-url>
cd Elohim

# Create production environment file
cp env.production.template .env.production
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
NEXT_PUBLIC_BACKEND_URL=http://aeon-backend:8000

# Replicate API
REPLICATE_API_TOKEN=r8_your_actual_token
```

### 3. Update Deployment Script

Edit `deploy-digitalocean.sh` and update these variables:

```bash
DOMAIN="yourdomain.com"           # Your actual domain
DROPLET_IP="your-droplet-ip"      # Your droplet's IP address
SSH_USER="root"                   # Your SSH user (usually root)
```

### 4. Deploy to Your Droplet

```bash
# Make the script executable
chmod +x deploy-digitalocean.sh

# Run the deployment
./deploy-digitalocean.sh
```

## 🌐 Nginx Configuration

### For Subdomain Approach

Add this to your existing Nginx configuration:

```nginx
# AEON Platform - Subdomain
server {
    listen 80;
    server_name aeon.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### For Path-based Approach

Add this to your existing server block:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    # Your existing project
    location / {
        proxy_pass http://localhost:8080;  # Your existing app
        # ... existing proxy settings
    }
    
    # AEON Platform
    location /aeon/ {
        proxy_pass http://localhost:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 SSL Certificate Setup

### Using Let's Encrypt with Certbot

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Install Certbot (if not already installed)
apt update
apt install certbot python3-certbot-nginx

# Get SSL certificate for subdomain
certbot --nginx -d aeon.yourdomain.com

# Or for path-based approach
certbot --nginx -d yourdomain.com
```

## 📊 Monitoring and Management

### Check Service Status

```bash
# SSH into your droplet
ssh root@your-droplet-ip

# Check if services are running
docker ps

# Check logs
docker-compose -f /opt/aeon-platform/docker-compose.production.yml logs -f

# Check systemd service status
systemctl status aeon-platform
```

### Restart Services

```bash
# Restart the entire platform
systemctl restart aeon-platform

# Or restart individual containers
docker-compose -f /opt/aeon-platform/docker-compose.production.yml restart

# Restart Nginx
systemctl reload nginx
```

### Update Deployment

```bash
# Pull latest code
git pull origin main

# Rebuild and redeploy
./deploy-digitalocean.sh
```

## 🔧 Troubleshooting

### Common Issues

1. **Port Conflicts**
   ```bash
   # Check what's using port 3000
   netstat -tulpn | grep :3000
   
   # If needed, change the port in docker-compose.production.yml
   ```

2. **Docker Issues**
   ```bash
   # Check Docker status
   systemctl status docker
   
   # Restart Docker
   systemctl restart docker
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
   
   # Verify environment variables are loaded
   docker-compose -f /opt/aeon-platform/docker-compose.production.yml config
   ```

### Log Locations

- **Application Logs**: `/opt/aeon-platform/logs/`
- **Nginx Logs**: `/var/log/nginx/`
- **System Logs**: `/var/log/syslog`
- **Docker Logs**: `docker logs <container-name>`

## 📈 Performance Optimization

### Resource Allocation

Monitor your droplet's resource usage:

```bash
# Check CPU and memory usage
htop

# Check disk usage
df -h

# Check Docker resource usage
docker stats
```

### Scaling Considerations

If you need more resources:

1. **Upgrade Droplet**: Increase RAM/CPU in DigitalOcean dashboard
2. **Load Balancing**: Add more droplets behind a load balancer
3. **Database**: Consider using managed PostgreSQL instead of local

## 🔒 Security Best Practices

1. **Firewall**: Configure UFW to only allow necessary ports
2. **SSH**: Use key-based authentication, disable password login
3. **Updates**: Keep your droplet updated regularly
4. **Backups**: Set up regular backups of your data
5. **Monitoring**: Use monitoring tools to track performance

## 🆘 Support

If you encounter issues:

1. Check the logs using the commands above
2. Verify all environment variables are set correctly
3. Ensure your domain DNS is pointing to the correct IP
4. Test the application locally before deploying

---

**Note**: This deployment approach allows you to run multiple projects on the same droplet efficiently. The AEON platform will run alongside your existing projects without conflicts. 