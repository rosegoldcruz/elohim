#!/bin/bash

# AEON Platform - DigitalOcean Deployment Script
# Deploys to a DigitalOcean droplet using native Python/Node with PM2

set -e

# Configuration
PROJECT_NAME="aeon-platform"
DOMAIN="yourdomain.com"  # Change this to your domain
DROPLET_IP="your-droplet-ip"  # Change this to your droplet IP
SSH_USER="root"           # Change if you use a different user

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 AEON Platform - DigitalOcean Deployment${NC}"
echo -e "${YELLOW}Deploying to: $DROPLET_IP${NC}"
echo ""

# Check if required tools are installed
check_requirements() {
    echo -e "${BLUE}📋 Checking requirements...${NC}"
    
    if ! command -v ssh &> /dev/null; then
        echo -e "${RED}❌ SSH is not available${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Requirements met${NC}"
}

# Create deployment files
create_deployment_files() {
    echo -e "${BLUE}📁 Creating deployment files...${NC}"
    
    # Create Nginx configuration for reverse proxy
    cat > nginx-aeon.conf << EOF
# AEON Platform Nginx Configuration
server {
    listen 80;
    server_name aeon.$DOMAIN;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
    
    # Backend API
    location /api/ {
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

    # Create systemd service for frontend
    cat > aeon-frontend.service << EOF
[Unit]
Description=AEON Frontend
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/$PROJECT_NAME/frontend
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PORT=3000

[Install]
WantedBy=multi-user.target
EOF

    echo -e "${GREEN}✅ Deployment files created${NC}"
}

# Deploy to DigitalOcean droplet
deploy_to_droplet() {
    echo -e "${BLUE}🚀 Deploying to DigitalOcean droplet...${NC}"
    
    # Create deployment directory on droplet
    ssh $SSH_USER@$DROPLET_IP "mkdir -p /opt/$PROJECT_NAME"
    
    # Copy files to droplet
    echo "Copying files to droplet..."
    scp -r frontend $SSH_USER@$DROPLET_IP:/opt/$PROJECT_NAME/
    scp -r backend $SSH_USER@$DROPLET_IP:/opt/$PROJECT_NAME/
    scp ecosystem.config.js $SSH_USER@$DROPLET_IP:/opt/$PROJECT_NAME/
    scp nginx-aeon.conf $SSH_USER@$DROPLET_IP:/opt/$PROJECT_NAME/
    scp aeon-frontend.service $SSH_USER@$DROPLET_IP:/opt/$PROJECT_NAME/
    
    # Copy environment file (you'll need to create this)
    if [ -f .env.production ]; then
        scp .env.production $SSH_USER@$DROPLET_IP:/opt/$PROJECT_NAME/.env
    else
        echo -e "${YELLOW}⚠️  Warning: .env.production file not found${NC}"
        echo "Please create .env.production with your environment variables"
    fi
    
    # Deploy on droplet
    ssh $SSH_USER@$DROPLET_IP << 'EOF'
        cd /opt/aeon-platform
        
        # Install system dependencies
        apt update
        apt install -y python3 python3-pip python3-venv nodejs npm nginx
        
        # Install PM2 globally
        npm install -g pm2
        
        # Setup Python environment
        python3 -m venv venv
        source venv/bin/activate
        pip install -r backend/requirements.txt
        
        # Setup frontend
        cd frontend
        npm install
        npm run build
        
        # Create logs directory
        mkdir -p logs
        
        # Setup PM2 for backend
        pm2 start ecosystem.config.js
        pm2 save
        pm2 startup
        
        # Setup systemd service for frontend
        sudo cp aeon-frontend.service /etc/systemd/system/
        sudo systemctl daemon-reload
        sudo systemctl enable aeon-frontend
        sudo systemctl start aeon-frontend
        
        # Setup Nginx
        sudo cp nginx-aeon.conf /etc/nginx/sites-available/aeon
        sudo ln -sf /etc/nginx/sites-available/aeon /etc/nginx/sites-enabled/
        sudo nginx -t && sudo systemctl reload nginx
        
        echo "✅ AEON Platform deployed successfully!"
        echo "🌐 Access your app at: http://aeon.yourdomain.com"
        echo "🔧 Backend API at: http://localhost:8000"
        echo "📊 PM2 status: pm2 status"
        echo "📋 Frontend logs: journalctl -u aeon-frontend -f"
EOF

    echo -e "${GREEN}✅ Deployment completed!${NC}"
}

# Main deployment flow
main() {
    check_requirements
    create_deployment_files
    deploy_to_droplet
    
    echo ""
    echo -e "${GREEN}🎉 AEON Platform deployed successfully!${NC}"
    echo -e "${BLUE}📋 Next steps:${NC}"
    echo "1. Update your DNS to point aeon.$DOMAIN to $DROPLET_IP"
    echo "2. Configure SSL certificates with Let's Encrypt"
    echo "3. Test the application at http://aeon.$DOMAIN"
    echo "4. Monitor logs: ssh $SSH_USER@$DROPLET_IP 'pm2 logs aeon-api'"
}

# Run main function
main "$@" 