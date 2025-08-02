# 🔒 AEON Platform Security Guide

## Environment Variables Protection

### 🚫 NEVER COMMIT TO GIT

The following files and patterns are **BLOCKED** from being committed to GitHub:

```
# Environment Files (LOCKED DOWN)
*.env*
.env
.env.local
.env.development
.env.test
.env.production
.env.example
.env.template
.env.sample
env.production
env.example
env.template
env.sample
env.mjs

# Frontend specific
frontend/.env*
frontend/env*

# Backend specific  
backend/.env*
backend/env*

# Security files
secrets/
keys/
certificates/
*.pem
*.key
*.crt
*.p12
*.pfx
```

### 🔐 Required Environment Variables

#### Frontend (Vercel Environment Variables)
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

#### Backend (.env on DigitalOcean Droplet)
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

### 🛡️ Security Best Practices

1. **Never commit environment files to Git**
2. **Use environment variables for all sensitive data**
3. **Rotate API keys regularly**
4. **Use strong, unique passwords**
5. **Enable 2FA on all accounts**
6. **Monitor for unauthorized access**

### 🔍 Pre-commit Security Check

Before committing, ensure:
- No `.env` files are staged
- No API keys in code
- No hardcoded secrets
- No sensitive data in logs

### 🚨 Emergency Response

If secrets are accidentally committed:
1. **IMMEDIATELY** rotate all API keys
2. Remove sensitive files from git history
3. Update all environment variables
4. Audit for unauthorized access

---

**Remember: Security is everyone's responsibility! 🔒** 