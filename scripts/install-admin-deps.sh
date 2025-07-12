#!/bin/bash

# AEON Admin Dependencies Installation Script
# Installs all required dependencies for the admin system

echo "🔧 Installing AEON Admin System Dependencies..."

# Install main dependencies
echo "📦 Installing main dependencies..."
pnpm add @aws-sdk/client-s3@^3.658.1
pnpm add @aws-sdk/s3-request-presigner@^3.658.1
pnpm add json2csv@^6.1.0
pnpm add node-cron@^3.0.3
pnpm add nodemailer@^6.9.15

# Install dev dependencies
echo "📦 Installing dev dependencies..."
pnpm add -D @types/nodemailer@^6.4.19

echo "✅ All admin dependencies installed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Set environment variables for admin system"
echo "2. Configure email service (SendGrid/SMTP)"
echo "3. Set up S3 bucket for exports (optional)"
echo "4. Add admin user IDs to ADMIN_USER_IDS env var"
echo ""
echo "📚 See docs/admin-exports-fraud-monitor.md for full setup guide"
