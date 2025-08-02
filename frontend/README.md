# AEON Frontend

Next.js 15 frontend for the AEON AI video generation platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm (recommended) or npm
- Supabase account
- Stripe account
- Vercel Blob storage

### Local Development

1. **Clone and install dependencies:**
```bash
cd aeon-frontend
pnpm install
```

2. **Environment setup:**
```bash
cp .env.example .env.local
# Fill in your environment variables
```

3. **Required environment variables:**
```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://smart4technology.com

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret

# Stripe
STRIPE_SECRET_KEY=sk_test_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-publishable-key

# Stripe Price IDs
NEXT_PUBLIC_STRIPE_PRICE_STARTER_PASS=price_starter_pass_id
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly_id
NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY=price_pro_yearly_id
NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY=price_creator_monthly_id
NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY=price_creator_yearly_id
NEXT_PUBLIC_STRIPE_PRICE_STUDIO_MONTHLY=price_studio_monthly_id
NEXT_PUBLIC_STRIPE_PRICE_STUDIO_YEARLY=price_studio_yearly_id

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_your-token
```

4. **Run development server:**
```bash
pnpm dev
```

Visit `https://smart4technology.com` (production) or `http://localhost:3000` (development)

### Building for Production

```bash
pnpm build
pnpm start
```

## 🔐 Authentication & Security

- **Supabase Auth**: Email/password and magic link authentication
- **Route Protection**: Middleware-based protection for `/studio/*` routes
- **API Security**: All API routes require authentication
- **RLS**: Row Level Security policies protect user data

### Protected Routes

- `/studio/*` - Main application (requires auth)
- `/dashboard/*` - User dashboard (requires auth)
- `/settings/*` - User settings (requires auth)
- `/billing/*` - Billing management (requires auth)

### Public Routes

- `/` - Marketing homepage
- `/pricing` - Pricing page
- `/login` - Sign in
- `/signup` - Sign up

## 📁 Project Structure

```
aeon-frontend/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth pages
│   ├── studio/            # Protected studio pages
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utilities
│   ├── supabase/         # Supabase clients
│   ├── auth.ts           # Auth helpers
│   └── stripe.ts         # Stripe configuration
├── middleware.ts         # Route protection
└── env.mjs              # Environment validation
```

## 🎨 UI Components

Built with:
- **shadcn/ui** - Component library
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Lucide React** - Icons

## 🔄 Job Flow

1. User creates video job in `/studio`
2. Frontend validates input and checks credits
3. Job submitted to `agent_jobs` table in Supabase
4. Backend agent picks up job and processes
5. Frontend polls for job status updates
6. User downloads completed video

## 🚀 Deployment to Vercel

### Automatic Deployment

1. **Connect to Vercel:**
```bash
npx vercel
```

2. **Set environment variables in Vercel dashboard:**
   - Go to Project Settings > Environment Variables
   - Add all variables from `.env.example`

3. **Deploy:**
```bash
npx vercel --prod
```

### Manual Deployment

1. **Build locally:**
```bash
pnpm build
```

2. **Deploy build:**
```bash
npx vercel deploy --prebuilt --prod
```

## 🔧 Configuration

### Stripe Setup

1. Create products and prices in Stripe Dashboard
2. Copy price IDs to environment variables
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
4. Add webhook secret to environment variables

### Supabase Setup

1. Create new Supabase project
2. Run RLS policies from `../supabase-rls-policies.sql`
3. Set up authentication providers
4. Copy connection details to environment variables

### Vercel Blob Setup

1. Enable Vercel Blob in your project
2. Generate read/write token
3. Add token to environment variables

## 🧪 Testing

```bash
# Run type checking
pnpm type-check

# Run linting
pnpm lint

# Build test
pnpm build
```

## 📊 Monitoring

- **Vercel Analytics** - Built-in performance monitoring
- **Error Tracking** - Console errors logged
- **User Analytics** - Track user interactions

## 🔒 Security Features

- **CSRF Protection** - Built into Next.js
- **XSS Prevention** - React's built-in protection
- **SQL Injection Prevention** - Supabase RLS policies
- **Rate Limiting** - Implemented in API routes
- **Input Validation** - Zod schemas for all inputs

## 🐛 Troubleshooting

### Common Issues

1. **Build fails with environment errors:**
   - Check all required environment variables are set
   - Verify Supabase connection details

2. **Authentication not working:**
   - Verify Supabase URL and keys
   - Check RLS policies are applied

3. **Stripe payments failing:**
   - Verify webhook endpoint is accessible
   - Check price IDs match Stripe dashboard

4. **Video jobs not processing:**
   - Ensure backend agent is running
   - Check Supabase connection from agent

### Debug Mode

Set `NODE_ENV=development` for detailed error messages and logging.

## 📝 API Documentation

### Job Management

- `POST /api/jobs` - Create new video job
- `GET /api/jobs` - List user's jobs
- `GET /api/jobs/[id]` - Get specific job
- `DELETE /api/jobs/[id]` - Delete job

### User Management

- `GET /api/user` - Get current user profile
- `PUT /api/user` - Update user profile

### Billing

- `POST /api/checkout/subscription` - Create Stripe checkout session
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📄 License

Proprietary - AEON Platform
