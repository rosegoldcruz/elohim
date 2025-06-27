-- AEON AI Video Generation SaaS Platform Database Schema
-- Based on MIT-licensed ai-video-generator, restructured for 7-agent architecture
-- License: MIT (see LICENSE file)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  stripe_customer_id VARCHAR(255) UNIQUE,
  credits INTEGER DEFAULT 0,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  subscription_status VARCHAR(50) DEFAULT 'inactive',
  auth_token VARCHAR(255),
  auth_token_expires TIMESTAMPTZ,
  magic_link_token VARCHAR(255),
  magic_link_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  prompt TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
  
  -- Scene URLs from 6 models
  scene_urls JSONB DEFAULT '[]',
  final_video_url TEXT,
  thumbnail_url TEXT,
  
  -- Metadata
  file_size_mb DECIMAL(10,2),
  resolution VARCHAR(20) DEFAULT '1080p',
  includes_audio BOOLEAN DEFAULT true,
  includes_captions BOOLEAN DEFAULT true,
  
  -- Processing details
  processing_started_at TIMESTAMPTZ,
  processing_completed_at TIMESTAMPTZ,
  error_message TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_session_id VARCHAR(255) UNIQUE,
  
  product_type VARCHAR(50) NOT NULL, -- video, subscription, credits
  amount DECIMAL(10,2) NOT NULL,
  credits_purchased INTEGER DEFAULT 0,
  
  -- Video order details
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  video_prompt TEXT,
  video_duration INTEGER,
  
  status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed, refunded
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credits table
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL, -- positive for add, negative for use
  type VARCHAR(50) NOT NULL, -- purchase, usage, bonus, refund
  description TEXT,
  
  -- Related records
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  video_id UUID REFERENCES videos(id) ON DELETE SET NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents table (job logs)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  agent_name VARCHAR(50) NOT NULL, -- scriptwriter, visualgen, editor, scheduler, payments, auth, dashboard
  
  status VARCHAR(50) DEFAULT 'pending', -- pending, running, completed, failed
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  runtime_seconds INTEGER,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Video scenes table (individual model outputs)
CREATE TABLE video_scenes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  
  model_name VARCHAR(100) NOT NULL, -- runway, pika, stable, luma, minimax, kling
  prompt TEXT NOT NULL,
  
  status VARCHAR(50) DEFAULT 'pending', -- pending, generating, completed, failed
  scene_url TEXT,
  duration DECIMAL(5,2),
  
  replicate_prediction_id VARCHAR(255),
  model_input JSONB,
  model_output JSONB,
  
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE,
  
  plan_name VARCHAR(100) NOT NULL, -- starter, pro, business
  status VARCHAR(50) NOT NULL, -- active, canceled, past_due
  
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin analytics view
CREATE VIEW admin_analytics AS
SELECT 
  COUNT(DISTINCT u.id) as total_users,
  COUNT(DISTINCT CASE WHEN u.created_at >= NOW() - INTERVAL '30 days' THEN u.id END) as new_users_30d,
  COUNT(DISTINCT v.id) as total_videos,
  COUNT(DISTINCT CASE WHEN v.status = 'completed' THEN v.id END) as completed_videos,
  COUNT(DISTINCT CASE WHEN v.created_at >= NOW() - INTERVAL '24 hours' THEN v.id END) as videos_24h,
  SUM(o.amount) as total_revenue,
  SUM(CASE WHEN o.created_at >= NOW() - INTERVAL '30 days' THEN o.amount ELSE 0 END) as revenue_30d,
  AVG(CASE WHEN v.processing_completed_at IS NOT NULL AND v.processing_started_at IS NOT NULL 
       THEN EXTRACT(EPOCH FROM (v.processing_completed_at - v.processing_started_at)) END) as avg_processing_time
FROM users u
LEFT JOIN videos v ON u.id = v.user_id
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'completed';

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_videos_user_id ON videos(user_id);
CREATE INDEX idx_videos_status ON videos(status);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
CREATE INDEX idx_credits_user_id ON credits(user_id);
CREATE INDEX idx_agents_video_id ON agents(video_id);
CREATE INDEX idx_agents_agent_name ON agents(agent_name);
CREATE INDEX idx_video_scenes_video_id ON video_scenes(video_id);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);

-- Functions for credit management
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type VARCHAR(50),
  p_description TEXT DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_video_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Add credits to user
  UPDATE users 
  SET credits = credits + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO credits (user_id, amount, type, description, order_id, video_id)
  VALUES (p_user_id, p_amount, p_type, p_description, p_order_id, p_video_id);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION use_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_video_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits FROM users WHERE id = p_user_id;
  
  -- Check if user has enough credits
  IF current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', p_amount, current_credits;
  END IF;
  
  -- Deduct credits
  UPDATE users 
  SET credits = credits - p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO credits (user_id, amount, type, description, video_id)
  VALUES (p_user_id, -p_amount, 'usage', p_description, p_video_id);
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Updated at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
