# AEON Platform - Custom Domain Setup

## 🌐 Production Domain Configuration

### Current Setup
- **Production URL**: https://elohim-b2irknsv7-elohim.vercel.app
- **Target Domain**: https://smart4technology.com
- **Environment**: Production

### 📋 Vercel Domain Configuration

1. **Go to Vercel Dashboard**
   - Navigate to your project: `elohim/elohim`
   - Go to Settings → Domains

2. **Add Custom Domain**
   ```
   smart4technology.com
   www.smart4technology.com
   ```

3. **DNS Configuration**
   Add these DNS records to your domain provider:
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com

   Type: A
   Name: @
   Value: 76.76.19.19
   ```

### 🔐 Supabase Auth Settings

Update in Supabase Dashboard → Authentication → Settings:

#### Site URL:
```
https://smart4technology.com
```

#### Redirect URLs:
```
https://smart4technology.com
https://smart4technology.com/auth/callback
https://smart4technology.com/login
https://smart4technology.com/api/auth/callback
https://smart4technology.com/studio
https://smart4technology.com/dashboard
```

### 🔧 Environment Variables (Already Configured)

✅ **NEXT_PUBLIC_APP_URL**: `https://smart4technology.com`
✅ **NEXT_PUBLIC_SITE_URL**: `https://smart4technology.com`
✅ **NEXT_PUBLIC_SUPABASE_URL**: `https://iqcwwufogdoaiuzyqney.supabase.co`
✅ **NEXT_PUBLIC_SUPABASE_ANON_KEY**: `[configured]`

### 🧪 Testing Checklist

After domain setup, test:

- [ ] Homepage loads: https://smart4technology.com
- [ ] Database connection: https://smart4technology.com/test-db
- [ ] Authentication: https://smart4technology.com/test-auth
- [ ] Studio access: https://smart4technology.com/studio
- [ ] API endpoints: https://smart4technology.com/api/health

### 🚀 Deployment Status

- ✅ Frontend deployed to Vercel
- ✅ Environment variables configured
- ✅ Supabase integration active
- ✅ Production build successful
- ⏳ Custom domain setup (manual step required)

### 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify DNS propagation (can take up to 48 hours)
3. Confirm Supabase auth settings
4. Test API endpoints individually
