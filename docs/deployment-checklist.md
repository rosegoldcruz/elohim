# 🚀 AEON Production Deployment Checklist

Complete checklist for deploying AEON with the full Admin Exports & Fraud Monitor system.

## 📋 **Pre-Deployment Checklist**

### ✅ **1. Dependencies & Build**
- [ ] Install admin dependencies: `./scripts/install-admin-deps.sh`
- [ ] Test build locally: `pnpm run build`
- [ ] Verify no TypeScript errors: `pnpm run type-check`
- [ ] Test admin imports: `node scripts/test-build.js`

### ✅ **2. Environment Variables**

#### **Required for Build**
- [ ] `NEXT_PUBLIC_APP_URL` - Your production domain
- [ ] `SUPABASE_URL` - Supabase project URL
- [ ] `SUPABASE_ANON_KEY` - Supabase anon key

#### **Admin System**
- [ ] `ADMIN_USER_IDS` - Comma-separated admin user IDs
- [ ] `ADMIN_EMAILS` - Admin notification emails
- [ ] `EMAIL_SERVICE` - Email provider (sendgrid/smtp)
- [ ] `SENDGRID_API_KEY` - SendGrid API key (if using SendGrid)

#### **Optional but Recommended**
- [ ] `EXECUTIVE_EMAILS` - Executive report recipients
- [ ] `AWS_S3_BUCKET` - S3 bucket for export storage
- [ ] `AWS_ACCESS_KEY_ID` - AWS access key
- [ ] `AWS_SECRET_ACCESS_KEY` - AWS secret key
- [ ] `EXPORT_ENCRYPTION_KEY` - 32-character encryption key

### ✅ **3. Database Setup**
- [ ] Supabase project created and configured
- [ ] Database schema deployed (tables, functions, policies)
- [ ] Row Level Security (RLS) policies enabled
- [ ] Test database connection

### ✅ **4. Authentication**
- [ ] Supabase project configured
- [ ] Supabase environment variables set
- [ ] Test authentication flow
- [ ] Admin user accounts created

### ✅ **5. External Services**
- [ ] SendGrid account setup (if using email alerts)
- [ ] AWS S3 bucket created (if using cloud storage)
- [ ] Replicate API key configured
- [ ] Test external service connections

## 🚀 **Deployment Steps**

### **Step 1: Code Deployment**
```bash
# 1. Commit all changes
git add .
git commit -m "feat: complete admin system with build fixes"

# 2. Push to main branch
git push origin main

# 3. Verify Vercel deployment
# Check build logs for any errors
```

### **Step 2: Environment Configuration**
```bash
# Set production environment variables in Vercel dashboard
# Or use Vercel CLI:
vercel env add NEXT_PUBLIC_APP_URL
vercel env add ADMIN_USER_IDS
vercel env add SENDGRID_API_KEY
# ... etc for all required variables
```

### **Step 3: Database Migration**
```sql
-- Run any pending database migrations
-- Ensure all tables exist:
-- - users, projects, scenes, agent_jobs
-- - credit_transactions, creator_wallets
-- - payout_requests (if not exists)
```

### **Step 4: Admin Setup**
```bash
# 1. Get your Clerk user ID
# 2. Add to ADMIN_USER_IDS environment variable
# 3. Test admin access at /admin/dashboard
```

### **Step 5: Test Core Functionality**
- [ ] User registration/login works
- [ ] Video generation pipeline works
- [ ] Credit system functions
- [ ] Creator payouts process
- [ ] Admin dashboard accessible

## 🧪 **Post-Deployment Testing**

### **1. Admin System Tests**
```bash
# Test admin dashboard access
curl -X GET https://your-domain.com/admin/dashboard

# Test fraud detection API
curl -X GET https://your-domain.com/api/admin/fraud

# Test export generation
curl -X POST https://your-domain.com/api/admin/cron \
  -H "Content-Type: application/json" \
  -d '{"action": "trigger_task", "taskId": "daily_operations"}'
```

### **2. Email System Tests**
```bash
# Test email configuration
curl -X POST https://your-domain.com/api/admin/cron \
  -H "Content-Type: application/json" \
  -d '{"action": "trigger_task", "taskId": "health_check"}'

# Check for email delivery
```

### **3. Export System Tests**
```bash
# Test export generation
curl -X GET https://your-domain.com/api/admin/export?type=transactions&format=csv

# Test storage system
curl -X POST https://your-domain.com/api/admin/storage \
  -H "Content-Type: application/json" \
  -d '{"action": "test_storage"}'
```

### **4. Fraud Detection Tests**
```bash
# Run manual fraud sweep
curl -X POST https://your-domain.com/api/admin/cron \
  -H "Content-Type: application/json" \
  -d '{"action": "trigger_task", "taskId": "emergency_fraud_sweep"}'
```

## 🔧 **Production Configuration**

### **Vercel Settings**
```json
{
  "functions": {
    "app/api/admin/**": {
      "maxDuration": 300
    },
    "app/api/cron/**": {
      "maxDuration": 900
    }
  },
  "crons": [
    {
      "path": "/api/cron/daily-operations",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/cron/fraud-monitoring", 
      "schedule": "0 */4 * * *"
    }
  ]
}
```

### **Environment Variables Template**
```env
# Core App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
SUPABASE_JWT_SECRET=your-jwt-secret

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Admin System
ADMIN_USER_IDS=user_123,user_456
ADMIN_EMAILS=admin@yourdomain.com
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=alerts@yourdomain.com

# Export System
EXPORT_STORAGE_PROVIDER=both
EXPORT_ENCRYPTION=true
AWS_S3_BUCKET=aeon-exports
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=xxx

# AI Services
REPLICATE_API_TOKEN=r8_...
OPENAI_API_KEY=sk-...
```

## 📊 **Monitoring & Maintenance**

### **Daily Checks**
- [ ] Check admin dashboard for alerts
- [ ] Verify daily exports generated
- [ ] Review fraud detection reports
- [ ] Monitor system health metrics

### **Weekly Tasks**
- [ ] Review executive reports
- [ ] Check export storage usage
- [ ] Analyze creator performance
- [ ] Update fraud detection rules if needed

### **Monthly Tasks**
- [ ] Export cleanup (automated)
- [ ] Security audit
- [ ] Performance optimization
- [ ] Backup verification

## 🚨 **Troubleshooting**

### **Build Failures**
```bash
# Check environment variables
vercel env ls

# Test local build
pnpm run build

# Check import issues
node scripts/test-build.js
```

### **Admin Access Issues**
```bash
# Verify user ID in ADMIN_USER_IDS
# Check Clerk user ID format
# Test authentication flow
```

### **Email Delivery Issues**
```bash
# Test SendGrid API key
# Check email service configuration
# Verify DNS records for custom domain
```

### **Export Generation Issues**
```bash
# Check file permissions
# Verify S3 bucket access
# Test storage configuration
```

## ✅ **Success Criteria**

Your deployment is successful when:

- [ ] ✅ Build completes without errors
- [ ] ✅ Admin dashboard accessible to authorized users
- [ ] ✅ Daily exports generate automatically
- [ ] ✅ Fraud monitoring runs every 4 hours
- [ ] ✅ Email alerts deliver successfully
- [ ] ✅ All API endpoints respond correctly
- [ ] ✅ Database operations function properly
- [ ] ✅ File storage works (local and/or S3)

## 🎉 **Go Live!**

Once all checks pass:

1. **Announce to team**: Admin system is live
2. **Monitor closely**: First 24 hours
3. **Document issues**: Any problems encountered
4. **Optimize**: Based on real usage patterns

**🗝️ AEON IS NOW A COMPLETE CLOSED-LOOP ECONOMIC MACHINE!** 🚀

The platform runs itself with:
- ✅ Automated daily exports
- ✅ Real-time fraud protection  
- ✅ Complete admin oversight
- ✅ Email alert system
- ✅ Comprehensive analytics

**Ready for viral scale!** 📈

