# AEON Platform - Clerk + Supabase Integration Setup

## 🚀 Overview

This setup uses **Clerk for authentication** and **Supabase for database operations**, combining the best of both worlds:
- **Clerk**: Handles user authentication, login/signup, session management
- **Supabase**: Manages database tables, row security, and backend data operations

## 📋 Prerequisites

1. **Clerk Account**: Sign up at [clerk.com](https://clerk.com)
2. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
3. **Replicate API Token**: Get your token from [replicate.com](https://replicate.com)
4. **Backend Running**: Ensure your FastAPI backend is running

## 🔧 Environment Variables

Create a `.env.local` file in the frontend directory with the following variables:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cG9ldGljLWJsdWViaXJkLTIxLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_TzD9tCCjoK2ZJKXVFMOnO8Ubk8NDWcNo1QoreCvJoE
CLERK_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Backend API
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Replicate API (for backend)
REPLICATE_API_TOKEN=r8_**********
```

## 🗄️ Supabase Database Setup

### 1. Create Users Table

Run this SQL in your Supabase SQL editor:

```sql
-- Create users table with Clerk integration
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 100,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (clerk_user_id = current_user);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (clerk_user_id = current_user);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (clerk_user_id = current_user);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### 2. Create Additional Tables (Optional)

```sql
-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(clerk_user_id),
  title TEXT,
  prompt TEXT NOT NULL,
  style TEXT DEFAULT 'tiktok',
  duration INTEGER DEFAULT 30,
  status TEXT DEFAULT 'processing',
  video_url TEXT,
  thumbnail_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for videos
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- RLS policies for videos
CREATE POLICY "Users can view own videos" ON videos
  FOR SELECT USING (user_id = current_user);

CREATE POLICY "Users can insert own videos" ON videos
  FOR INSERT WITH CHECK (user_id = current_user);

CREATE POLICY "Users can update own videos" ON videos
  FOR UPDATE USING (user_id = current_user);
```

## 🔐 Clerk Setup

### 1. Create Clerk Application

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application
3. Copy your publishable key and secret key

### 2. Configure Authentication

1. In Clerk Dashboard, go to **User & Authentication**
2. Enable **Email and password** authentication
3. Enable **Google OAuth** (optional)
4. Configure your domain in **Domains**

### 3. Set Up Webhooks

1. In Clerk Dashboard, go to **Webhooks**
2. Create a new webhook endpoint
3. Set the endpoint URL to: `https://yourdomain.com/api/webhooks/clerk`
4. Select events: `user.created`, `user.updated`, `user.deleted`
5. Copy the webhook secret to your `.env.local`

## 🚀 Implementation Features

### ✅ Completed Features

1. **Clerk Authentication**: Modal login, signup, session management
2. **Supabase Integration**: User data sync, credits management
3. **Protected Routes**: Middleware-based route protection
4. **User Dashboard**: Combined Clerk + Supabase data display
5. **Video Generation**: Frontend UI connected to backend API
6. **Webhook Sync**: Automatic user data synchronization

### 🔄 How It Works

1. **User Signs Up**: Clerk handles authentication, webhook syncs data to Supabase
2. **User Signs In**: Clerk manages session, app fetches user data from Supabase
3. **Protected Routes**: Middleware checks Clerk session, redirects if needed
4. **User Data**: Credits, profile info stored in Supabase, auth in Clerk
5. **Video Generation**: Frontend calls backend API with Clerk user ID

### 📁 Key Files

- `frontend/app/layout.tsx` - ClerkProvider + SupabaseProvider setup
- `frontend/middleware.ts` - Route protection with Clerk
- `frontend/lib/auth/clerk-supabase-sync.ts` - User data synchronization
- `frontend/app/api/webhooks/clerk/route.ts` - Webhook handler
- `frontend/components/auth/auth-form.tsx` - Clerk-based auth form
- `frontend/app/dashboard/page.tsx` - Combined data display

## 🛠️ Customization

### Styling Clerk Components

```tsx
// Custom Clerk appearance
<SignIn 
  appearance={{
    elements: {
      rootBox: "mx-auto",
      card: "bg-[#1a1a1a] border border-[#2a2a2a]",
      headerTitle: "text-white",
      headerSubtitle: "text-gray-400",
      formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
      formFieldInput: "bg-[#2a2a2a] border-[#3a3a3a] text-white",
    }
  }}
/>
```

### Adding More User Fields

1. Update the `SupabaseUserProfile` interface in `clerk-supabase-sync.ts`
2. Modify the `syncClerkUserToSupabase` function
3. Add new columns to your Supabase users table

## 🔒 Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **Webhook Verification**: Always verify webhook signatures
3. **Row Level Security**: Use RLS policies in Supabase
4. **API Keys**: Rotate keys regularly, use least privilege access

## 🚀 Deployment

### Vercel Deployment

1. Set environment variables in Vercel dashboard
2. Deploy your application
3. Update Clerk webhook URL to production domain
4. Test authentication flow

### Database Migration

1. Run Supabase migrations in production
2. Verify RLS policies are active
3. Test user data synchronization

## 🐛 Troubleshooting

### Common Issues

1. **Build Errors**: Ensure all Clerk imports are conditional
2. **Webhook Failures**: Check webhook secret and endpoint URL
3. **Database Sync**: Verify Supabase connection and RLS policies
4. **Authentication**: Check Clerk domain configuration

### Debug Commands

```bash
# Check build
pnpm build

# Check types
pnpm type-check

# Run development server
pnpm dev
```

## 📈 Next Steps

1. **Add More Features**: User profiles, video history, analytics
2. **Enhance Security**: Rate limiting, input validation
3. **Performance**: Caching, database optimization
4. **Monitoring**: Error tracking, user analytics

## 🆘 Support

- **Clerk Docs**: [docs.clerk.com](https://docs.clerk.com)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

**Note**: This setup provides a robust foundation for authentication and data management. Clerk handles the complex auth flows while Supabase provides powerful database features with built-in security. 