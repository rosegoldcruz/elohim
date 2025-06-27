-- AEON SaaS Database Schema
-- Complete customer acquisition, subscription, and credit system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (enhanced for SaaS)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  credits INTEGER DEFAULT 0,
  subscription_tier VARCHAR(50) DEFAULT 'free_trial',
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  stripe_customer_id VARCHAR(255) UNIQUE,
  stripe_subscription_id VARCHAR(255),
  trial_ends_at TIMESTAMPTZ,
  subscription_current_period_start TIMESTAMPTZ,
  subscription_current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription plans
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  stripe_price_id VARCHAR(255) UNIQUE NOT NULL,
  price_monthly DECIMAL(10,2),
  price_yearly DECIMAL(10,2),
  credits_monthly INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table (instant purchases)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_session_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  credits_purchased INTEGER NOT NULL,
  video_prompt TEXT NOT NULL,
  video_style VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  video_url TEXT,
  video_duration INTEGER, -- in seconds
  credits_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credit transactions
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for credits added, negative for used
  type VARCHAR(50) NOT NULL, -- purchase, subscription, bonus, usage, refund
  description TEXT,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  video_job_id UUID,
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video generation jobs
CREATE TABLE video_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  prompt TEXT NOT NULL,
  style VARCHAR(100),
  duration INTEGER NOT NULL, -- requested duration in seconds
  status VARCHAR(50) DEFAULT 'queued', -- queued, processing, rendering, completed, failed
  priority INTEGER DEFAULT 0, -- higher number = higher priority
  
  -- AI Generation Details
  scenes_generated INTEGER DEFAULT 0,
  scenes_total INTEGER DEFAULT 6,
  current_model VARCHAR(100),
  models_attempted TEXT[], -- array of model names tried
  
  -- Processing Details
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Output Details
  video_url TEXT,
  thumbnail_url TEXT,
  final_duration INTEGER, -- actual duration in seconds
  file_size_mb DECIMAL(10,2),
  resolution VARCHAR(20), -- 720p, 1080p, 4K
  
  -- Metadata
  credits_used INTEGER DEFAULT 0,
  quality_tier VARCHAR(50), -- free_trial, pro, creator, studio
  includes_watermark BOOLEAN DEFAULT true,
  includes_voiceover BOOLEAN DEFAULT false,
  includes_captions BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video scenes (individual clips from AI models)
CREATE TABLE video_scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_job_id UUID REFERENCES video_jobs(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  prompt TEXT NOT NULL,
  model_used VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- pending, generating, completed, failed
  
  -- Replicate/AI Details
  replicate_prediction_id VARCHAR(255),
  model_input JSONB,
  model_output JSONB,
  
  -- Scene Output
  scene_url TEXT,
  duration DECIMAL(5,2), -- actual duration in seconds
  file_size_mb DECIMAL(10,2),
  
  -- Processing
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscription history
CREATE TABLE subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255),
  plan_name VARCHAR(100),
  status VARCHAR(50), -- active, canceled, past_due, unpaid
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals and bonuses
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_email VARCHAR(255) NOT NULL,
  referred_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  credits_awarded INTEGER DEFAULT 500,
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, expired
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Magic link tokens
CREATE TABLE magic_link_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  ip_address INET,
  user_agent TEXT,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin logs
CREATE TABLE admin_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_user_id UUID REFERENCES users(id),
  details JSONB,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_video_jobs_user_id ON video_jobs(user_id);
CREATE INDEX idx_video_jobs_status ON video_jobs(status);
CREATE INDEX idx_video_jobs_priority ON video_jobs(priority DESC);
CREATE INDEX idx_video_scenes_job_id ON video_scenes(video_job_id);
CREATE INDEX idx_subscription_history_user_id ON subscription_history(user_id);
CREATE INDEX idx_magic_link_tokens_email ON magic_link_tokens(email);
CREATE INDEX idx_magic_link_tokens_token ON magic_link_tokens(token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_video_jobs_updated_at BEFORE UPDATE ON video_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
