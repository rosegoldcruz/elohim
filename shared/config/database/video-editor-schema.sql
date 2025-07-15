-- AEON Video Editor Database Schema
-- Enhanced schema for GPU-accelerated video editing with beat synchronization

-- Scenes table for video clips
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration DECIMAL(10,3) NOT NULL, -- Duration in seconds
  thumbnail_url TEXT,
  video_url TEXT NOT NULL,
  beat_markers DECIMAL(10,3)[] DEFAULT '{}', -- Array of beat timestamps
  order_index INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}', -- Resolution, fps, file_size, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transitions table for transition definitions (Enhanced for Marketplace)
CREATE TABLE IF NOT EXISTS transitions (
  id TEXT PRIMARY KEY, -- e.g., 'zoom-punch', 'glitch-blast', 'creator_12345_transition'
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'tiktok-essentials', 'cinematic', etc.
  duration DECIMAL(4,2) NOT NULL DEFAULT 0.5,
  intensity TEXT NOT NULL DEFAULT 'moderate', -- 'subtle', 'moderate', 'strong', 'extreme'
  viral_score DECIMAL(3,1) NOT NULL DEFAULT 5.0,
  preview_url TEXT,
  thumbnail_url TEXT, -- Marketplace thumbnail
  glsl_code TEXT NOT NULL, -- WebGL shader code
  ffmpeg_params JSONB DEFAULT '{}', -- FFmpeg fallback parameters
  parameters JSONB DEFAULT '[]', -- Array of parameter definitions
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,

  -- Marketplace & Creator Fields
  creator_id UUID REFERENCES auth.users(id), -- NULL for official transitions
  is_official BOOLEAN DEFAULT true, -- Official AEON transitions vs user-created
  is_public BOOLEAN DEFAULT true, -- Public marketplace visibility
  price_credits INTEGER DEFAULT 0, -- Cost in credits (0 = free)
  royalty_percentage DECIMAL(4,3) DEFAULT 0.150, -- Creator royalty (15% default)

  -- Approval & Moderation
  approval_status TEXT DEFAULT 'approved', -- 'pending', 'approved', 'rejected'
  approved_by UUID REFERENCES auth.users(id), -- Admin who approved
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,

  -- Performance & Analytics
  usage_count INTEGER DEFAULT 0, -- Total times used
  purchase_count INTEGER DEFAULT 0, -- Total times purchased
  total_earnings DECIMAL(10,2) DEFAULT 0.00, -- Total creator earnings
  avg_user_rating DECIMAL(3,2), -- Average user rating (1.00-5.00)
  rating_count INTEGER DEFAULT 0,

  -- Technical Metadata
  glsl_version TEXT DEFAULT '1.0',
  compatibility_tags TEXT[] DEFAULT '{}', -- 'gpu', 'mobile', 'web', etc.
  performance_tier TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'ultra'

  -- Versioning & Updates
  version TEXT DEFAULT '1.0.0',
  parent_transition_id TEXT REFERENCES transitions(id), -- For forks/updates
  is_fork BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transition slots for scene-to-scene transitions
CREATE TABLE IF NOT EXISTS transition_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  before_scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  after_scene_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  transition_id TEXT REFERENCES transitions(id),
  custom_parameters JSONB DEFAULT '{}',
  beat_synced BOOLEAN DEFAULT false,
  sync_point DECIMAL(10,3), -- Beat marker timestamp for sync
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(before_scene_id, after_scene_id)
);

-- Transition previews cache
CREATE TABLE IF NOT EXISTS transition_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key TEXT UNIQUE NOT NULL,
  preview_url TEXT NOT NULL,
  scene1_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  scene2_id UUID REFERENCES scenes(id) ON DELETE CASCADE,
  transition_id TEXT REFERENCES transitions(id),
  parameters JSONB DEFAULT '{}',
  duration DECIMAL(4,2) NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audio analysis results
CREATE TABLE IF NOT EXISTS audio_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  audio_url TEXT NOT NULL,
  duration DECIMAL(10,3) NOT NULL,
  bpm DECIMAL(6,2),
  beat_markers JSONB NOT NULL, -- Array of beat marker objects
  energy_levels DECIMAL(4,3)[] DEFAULT '{}',
  spectral_centroid DECIMAL(8,2)[] DEFAULT '{}',
  analysis_version TEXT DEFAULT '1.0',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- GPU render jobs
CREATE TABLE IF NOT EXISTS gpu_render_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  job_type TEXT NOT NULL, -- 'preview', 'final_render'
  status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'processing', 'completed', 'failed'
  progress INTEGER DEFAULT 0, -- 0-100
  scene1_url TEXT,
  scene2_url TEXT,
  transition_id TEXT REFERENCES transitions(id),
  render_options JSONB DEFAULT '{}',
  output_url TEXT,
  error_message TEXT,
  processing_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Transition analytics for viral score tracking (Enhanced)
CREATE TABLE IF NOT EXISTS transition_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transition_id TEXT REFERENCES transitions(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id UUID, -- Reference to final video
  usage_count INTEGER DEFAULT 1,

  -- Performance Metrics
  viral_score_impact DECIMAL(4,2) DEFAULT 0.0, -- Impact on viral score (-10.0 to +10.0)
  retention_impact DECIMAL(4,2) DEFAULT 0.0, -- Impact on viewer retention (0.0 to 1.0)
  engagement_boost DECIMAL(4,2) DEFAULT 0.0, -- Engagement rate boost (0.0 to 1.0)
  watch_time_impact DECIMAL(4,2) DEFAULT 0.0, -- Impact on average watch time
  replay_rate DECIMAL(4,2) DEFAULT 0.0, -- Rate of video replays (0.0 to 1.0)
  share_rate DECIMAL(4,2) DEFAULT 0.0, -- Rate of video shares (0.0 to 1.0)

  -- Technical Metrics
  beat_synced BOOLEAN DEFAULT false,
  sync_accuracy DECIMAL(4,2), -- How well synced to beat (0.0 to 1.0)
  processing_time_ms INTEGER,
  gpu_accelerated BOOLEAN DEFAULT false,
  render_quality TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'ultra'
  output_resolution TEXT DEFAULT '1080p', -- '720p', '1080p', '4k'

  -- Context Data
  content_type TEXT, -- 'high_energy', 'smooth_flow', 'dramatic', etc.
  scene_duration DECIMAL(5,2), -- Duration of scene in seconds
  transition_position INTEGER, -- Position in video (1st, 2nd, etc.)
  audio_present BOOLEAN DEFAULT true,
  aspect_ratio TEXT DEFAULT '16:9', -- '9:16', '1:1', '16:9'

  -- A/B Testing
  ab_test_group TEXT, -- For A/B testing different transitions
  control_group BOOLEAN DEFAULT false,

  -- Feedback Loop Data
  optimizer_score DECIMAL(4,2), -- Score assigned by OptimizerAgent
  confidence_level DECIMAL(4,2), -- Confidence in the metrics (0.0 to 1.0)
  data_quality_score DECIMAL(4,2), -- Quality of the tracking data

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transition performance aggregates (for faster queries)
CREATE TABLE IF NOT EXISTS transition_performance_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transition_id TEXT REFERENCES transitions(id) ON DELETE CASCADE,
  content_type TEXT,

  -- Aggregated Metrics (last 30 days)
  total_usage INTEGER DEFAULT 0,
  avg_viral_score DECIMAL(4,2) DEFAULT 0.0,
  avg_retention DECIMAL(4,2) DEFAULT 0.0,
  avg_engagement DECIMAL(4,2) DEFAULT 0.0,
  success_rate DECIMAL(4,2) DEFAULT 0.0, -- % of uses with positive viral impact

  -- Performance Trends
  trend_direction TEXT DEFAULT 'stable', -- 'rising', 'falling', 'stable'
  trend_strength DECIMAL(4,2) DEFAULT 0.0, -- Strength of trend (0.0 to 1.0)

  -- Technical Performance
  avg_processing_time INTEGER,
  gpu_usage_rate DECIMAL(4,2) DEFAULT 0.0,
  beat_sync_rate DECIMAL(4,2) DEFAULT 0.0,

  -- Recommendations
  recommendation TEXT, -- 'promote', 'optimize', 'deprecate', 'monitor'
  confidence_score DECIMAL(4,2) DEFAULT 0.0,

  last_calculated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator profiles for marketplace
CREATE TABLE IF NOT EXISTS creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  creator_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  website_url TEXT,
  social_links JSONB DEFAULT '{}', -- Twitter, Instagram, etc.

  -- Creator Stats
  total_transitions INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0.00,
  avg_rating DECIMAL(3,2),
  rating_count INTEGER DEFAULT 0,

  -- Creator Status
  is_verified BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  tier TEXT DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'

  -- Payout Information
  payout_method TEXT, -- 'stripe', 'paypal', 'crypto'
  payout_details JSONB DEFAULT '{}', -- Encrypted payout info

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transition purchases and ownership
CREATE TABLE IF NOT EXISTS transition_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transition_id TEXT REFERENCES transitions(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id),

  -- Purchase Details
  credits_paid INTEGER NOT NULL,
  royalty_amount DECIMAL(8,2) NOT NULL,
  platform_fee DECIMAL(8,2) NOT NULL,

  -- Transaction Info
  transaction_id TEXT UNIQUE,
  payment_method TEXT DEFAULT 'credits',

  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, transition_id) -- Prevent duplicate purchases
);

-- Transition reviews and ratings
CREATE TABLE IF NOT EXISTS transition_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transition_id TEXT REFERENCES transitions(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id),

  -- Review Content
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  review_text TEXT,

  -- Review Metadata
  is_verified_purchase BOOLEAN DEFAULT false,
  helpful_votes INTEGER DEFAULT 0,
  total_votes INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, transition_id) -- One review per user per transition
);

-- Creator earnings and payouts
CREATE TABLE IF NOT EXISTS creator_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transition_id TEXT REFERENCES transitions(id),
  purchase_id UUID REFERENCES transition_purchases(id),

  -- Earnings Details
  gross_amount DECIMAL(8,2) NOT NULL, -- Before fees
  royalty_rate DECIMAL(4,3) NOT NULL,
  net_amount DECIMAL(8,2) NOT NULL, -- After platform fees

  -- Payout Status
  payout_status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'paid', 'failed'
  payout_date TIMESTAMP WITH TIME ZONE,
  payout_reference TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles with credit balance
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 100, -- Starting credits for new users
  subscription_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  subscription_status TEXT DEFAULT 'active',
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  total_credits_purchased INTEGER DEFAULT 0,
  total_credits_earned INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Creator wallets for royalty management
CREATE TABLE IF NOT EXISTS creator_wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(10,2) DEFAULT 0.00, -- Available balance in credits
  pending_payouts DECIMAL(10,2) DEFAULT 0.00, -- Credits pending payout
  total_earnings DECIMAL(10,2) DEFAULT 0.00, -- Lifetime earnings
  total_payouts DECIMAL(10,2) DEFAULT 0.00, -- Total paid out

  -- Payout preferences
  payout_method TEXT DEFAULT 'stripe', -- 'stripe', 'crypto', 'bank'
  payout_threshold DECIMAL(10,2) DEFAULT 10.00, -- Minimum payout amount
  auto_payout BOOLEAN DEFAULT false,

  -- Stripe Connect info
  stripe_account_id TEXT,
  stripe_account_status TEXT,

  -- Crypto wallet info
  crypto_wallet_address TEXT,
  crypto_wallet_type TEXT, -- 'ethereum', 'polygon', 'bitcoin'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit transactions for audit trail
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID REFERENCES auth.users(id), -- For royalty transactions
  transition_id TEXT REFERENCES transitions(id),
  purchase_id UUID REFERENCES transition_purchases(id),

  -- Transaction details
  amount DECIMAL(10,2) NOT NULL, -- Positive for credits added, negative for deducted
  transaction_type TEXT NOT NULL, -- 'purchase', 'royalty', 'bonus', 'refund', 'fee'
  status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'failed', 'cancelled'
  description TEXT,

  -- Metadata
  platform_fee DECIMAL(10,2) DEFAULT 0.00,
  royalty_rate DECIMAL(4,3), -- For royalty transactions
  reference_id TEXT, -- External payment reference

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payout requests for creator earnings
CREATE TABLE IF NOT EXISTS payout_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Payout details
  amount DECIMAL(10,2) NOT NULL, -- Amount in credits
  estimated_usd DECIMAL(10,2), -- Estimated USD value
  method TEXT NOT NULL, -- 'stripe', 'crypto', 'bank'
  destination TEXT NOT NULL, -- Account ID, wallet address, etc.

  -- Processing status
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'cancelled'
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,

  -- External references
  stripe_transfer_id TEXT,
  crypto_transaction_hash TEXT,
  failure_reason TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Platform earnings tracking
CREATE TABLE IF NOT EXISTS platform_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount DECIMAL(10,2) NOT NULL,
  source TEXT NOT NULL, -- 'transition_fee', 'subscription', 'credit_purchase'
  transition_id TEXT REFERENCES transitions(id),
  user_id UUID REFERENCES auth.users(id),

  -- Revenue breakdown
  gross_amount DECIMAL(10,2),
  processing_fee DECIMAL(10,2) DEFAULT 0.00,
  net_amount DECIMAL(10,2),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Credit packages for purchase
CREATE TABLE IF NOT EXISTS credit_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  credits INTEGER NOT NULL,
  price_usd DECIMAL(8,2) NOT NULL,
  bonus_credits INTEGER DEFAULT 0, -- Extra credits for bulk purchases

  -- Package metadata
  is_popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  stripe_price_id TEXT, -- Stripe Price ID

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Beat synchronization settings
CREATE TABLE IF NOT EXISTS beat_sync_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  snap_tolerance DECIMAL(4,3) DEFAULT 0.1, -- Seconds
  prefer_strong_beats BOOLEAN DEFAULT true,
  beat_types TEXT[] DEFAULT '{"kick","snare"}',
  min_interval DECIMAL(4,2) DEFAULT 2.0, -- Minimum seconds between transitions
  auto_sync_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(project_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_scenes_user_id ON scenes(user_id);
CREATE INDEX IF NOT EXISTS idx_scenes_order ON scenes(project_id, order_index);

CREATE INDEX IF NOT EXISTS idx_transition_slots_project_id ON transition_slots(project_id);
CREATE INDEX IF NOT EXISTS idx_transition_slots_scenes ON transition_slots(before_scene_id, after_scene_id);

CREATE INDEX IF NOT EXISTS idx_transition_previews_cache_key ON transition_previews(cache_key);
CREATE INDEX IF NOT EXISTS idx_transition_previews_expires ON transition_previews(expires_at);

CREATE INDEX IF NOT EXISTS idx_gpu_render_jobs_status ON gpu_render_jobs(status);
CREATE INDEX IF NOT EXISTS idx_gpu_render_jobs_user ON gpu_render_jobs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_transitions_category ON transitions(category);
CREATE INDEX IF NOT EXISTS idx_transitions_viral_score ON transitions(viral_score DESC);

-- Enhanced indexes for transition analytics
CREATE INDEX IF NOT EXISTS idx_transition_analytics_transition_id ON transition_analytics(transition_id);
CREATE INDEX IF NOT EXISTS idx_transition_analytics_project_id ON transition_analytics(project_id);
CREATE INDEX IF NOT EXISTS idx_transition_analytics_user_id ON transition_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_transition_analytics_video_id ON transition_analytics(video_id);
CREATE INDEX IF NOT EXISTS idx_transition_analytics_viral_score ON transition_analytics(viral_score_impact DESC);
CREATE INDEX IF NOT EXISTS idx_transition_analytics_created_at ON transition_analytics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transition_analytics_content_type ON transition_analytics(content_type);
CREATE INDEX IF NOT EXISTS idx_transition_analytics_gpu_accelerated ON transition_analytics(gpu_accelerated);
CREATE INDEX IF NOT EXISTS idx_transition_analytics_beat_synced ON transition_analytics(beat_synced);
CREATE INDEX IF NOT EXISTS idx_transition_analytics_ab_test ON transition_analytics(ab_test_group);

-- Indexes for performance summary table
CREATE INDEX IF NOT EXISTS idx_transition_performance_transition_id ON transition_performance_summary(transition_id);
CREATE INDEX IF NOT EXISTS idx_transition_performance_content_type ON transition_performance_summary(content_type);
CREATE INDEX IF NOT EXISTS idx_transition_performance_avg_viral_score ON transition_performance_summary(avg_viral_score DESC);
CREATE INDEX IF NOT EXISTS idx_transition_performance_recommendation ON transition_performance_summary(recommendation);
CREATE INDEX IF NOT EXISTS idx_transition_performance_last_calculated ON transition_performance_summary(last_calculated DESC);

-- Marketplace indexes
CREATE INDEX IF NOT EXISTS idx_transitions_creator_id ON transitions(creator_id);
CREATE INDEX IF NOT EXISTS idx_transitions_is_official ON transitions(is_official);
CREATE INDEX IF NOT EXISTS idx_transitions_is_public ON transitions(is_public);
CREATE INDEX IF NOT EXISTS idx_transitions_approval_status ON transitions(approval_status);
CREATE INDEX IF NOT EXISTS idx_transitions_price_credits ON transitions(price_credits);
CREATE INDEX IF NOT EXISTS idx_transitions_usage_count ON transitions(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_transitions_purchase_count ON transitions(purchase_count DESC);
CREATE INDEX IF NOT EXISTS idx_transitions_avg_user_rating ON transitions(avg_user_rating DESC);
CREATE INDEX IF NOT EXISTS idx_transitions_marketplace_search ON transitions(is_public, approval_status, viral_score DESC) WHERE is_public = true AND approval_status = 'approved';

-- Creator profiles indexes
CREATE INDEX IF NOT EXISTS idx_creator_profiles_user_id ON creator_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_is_verified ON creator_profiles(is_verified);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_is_featured ON creator_profiles(is_featured);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_tier ON creator_profiles(tier);
CREATE INDEX IF NOT EXISTS idx_creator_profiles_total_earnings ON creator_profiles(total_earnings DESC);

-- Purchase indexes
CREATE INDEX IF NOT EXISTS idx_transition_purchases_user_id ON transition_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_transition_purchases_transition_id ON transition_purchases(transition_id);
CREATE INDEX IF NOT EXISTS idx_transition_purchases_creator_id ON transition_purchases(creator_id);
CREATE INDEX IF NOT EXISTS idx_transition_purchases_purchased_at ON transition_purchases(purchased_at DESC);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_transition_reviews_transition_id ON transition_reviews(transition_id);
CREATE INDEX IF NOT EXISTS idx_transition_reviews_user_id ON transition_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_transition_reviews_creator_id ON transition_reviews(creator_id);
CREATE INDEX IF NOT EXISTS idx_transition_reviews_rating ON transition_reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_transition_reviews_helpful_votes ON transition_reviews(helpful_votes DESC);

-- Earnings indexes
CREATE INDEX IF NOT EXISTS idx_creator_earnings_creator_id ON creator_earnings(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_transition_id ON creator_earnings(transition_id);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_payout_status ON creator_earnings(payout_status);
CREATE INDEX IF NOT EXISTS idx_creator_earnings_created_at ON creator_earnings(created_at DESC);

-- Credit system indexes
CREATE INDEX IF NOT EXISTS idx_profiles_credits ON profiles(credits DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expires ON profiles(subscription_expires_at);

CREATE INDEX IF NOT EXISTS idx_creator_wallets_creator_id ON creator_wallets(creator_id);
CREATE INDEX IF NOT EXISTS idx_creator_wallets_balance ON creator_wallets(balance DESC);
CREATE INDEX IF NOT EXISTS idx_creator_wallets_payout_method ON creator_wallets(payout_method);
CREATE INDEX IF NOT EXISTS idx_creator_wallets_stripe_account ON creator_wallets(stripe_account_id);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_creator_id ON credit_transactions(creator_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_status ON credit_transactions(status);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_transition_id ON credit_transactions(transition_id);

CREATE INDEX IF NOT EXISTS idx_payout_requests_creator_id ON payout_requests(creator_id);
CREATE INDEX IF NOT EXISTS idx_payout_requests_status ON payout_requests(status);
CREATE INDEX IF NOT EXISTS idx_payout_requests_method ON payout_requests(method);
CREATE INDEX IF NOT EXISTS idx_payout_requests_created_at ON payout_requests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_platform_earnings_source ON platform_earnings(source);
CREATE INDEX IF NOT EXISTS idx_platform_earnings_created_at ON platform_earnings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_platform_earnings_user_id ON platform_earnings(user_id);

CREATE INDEX IF NOT EXISTS idx_credit_packages_active ON credit_packages(is_active);
CREATE INDEX IF NOT EXISTS idx_credit_packages_popular ON credit_packages(is_popular);

-- Row Level Security (RLS) policies
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpu_render_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_performance_summary ENABLE ROW LEVEL SECURITY;

-- Marketplace RLS
ALTER TABLE creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_earnings ENABLE ROW LEVEL SECURITY;

-- Credit system RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE creator_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_requests ENABLE ROW LEVEL SECURITY;

-- Database functions for atomic credit operations

-- Function to deduct credits from user (atomic)
CREATE OR REPLACE FUNCTION deduct_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transition_id TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Lock the user profile row
  SELECT credits INTO v_current_credits
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user exists
  IF v_current_credits IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check sufficient credits
  IF v_current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits. Required: %, Available: %', p_amount, v_current_credits;
  END IF;

  -- Deduct credits
  v_new_balance := v_current_credits - p_amount;

  UPDATE profiles
  SET credits = v_new_balance,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transactions (
    user_id,
    amount,
    transaction_type,
    status,
    description,
    transition_id
  ) VALUES (
    p_user_id,
    -p_amount,
    'purchase',
    'completed',
    COALESCE(p_description, 'Credit deduction'),
    p_transition_id
  ) RETURNING id INTO v_transaction_id;

  -- Return result
  RETURN json_build_object(
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance,
    'amount_deducted', p_amount
  );
END;
$$ LANGUAGE plpgsql;

-- Function to add credits to user
CREATE OR REPLACE FUNCTION add_user_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT,
  p_description TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  v_current_credits INTEGER;
  v_new_balance INTEGER;
  v_transaction_id UUID;
BEGIN
  -- Lock the user profile row
  SELECT credits INTO v_current_credits
  FROM profiles
  WHERE id = p_user_id
  FOR UPDATE;

  -- Check if user exists
  IF v_current_credits IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Add credits
  v_new_balance := v_current_credits + p_amount;

  UPDATE profiles
  SET credits = v_new_balance,
      total_credits_earned = total_credits_earned + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transactions (
    user_id,
    amount,
    transaction_type,
    status,
    description
  ) VALUES (
    p_user_id,
    p_amount,
    p_transaction_type,
    'completed',
    COALESCE(p_description, 'Credit addition')
  ) RETURNING id INTO v_transaction_id;

  -- Return result
  RETURN json_build_object(
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance,
    'amount_added', p_amount
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update creator wallet (atomic)
CREATE OR REPLACE FUNCTION update_creator_wallet(
  p_creator_id UUID,
  p_amount DECIMAL(10,2),
  p_transition_id TEXT,
  p_purchase_id UUID,
  p_royalty_rate DECIMAL(4,3)
) RETURNS JSON AS $$
DECLARE
  v_current_balance DECIMAL(10,2);
  v_new_balance DECIMAL(10,2);
  v_transaction_id UUID;
BEGIN
  -- Ensure creator wallet exists
  INSERT INTO creator_wallets (creator_id, balance, total_earnings)
  VALUES (p_creator_id, 0, 0)
  ON CONFLICT (creator_id) DO NOTHING;

  -- Lock the creator wallet row
  SELECT balance INTO v_current_balance
  FROM creator_wallets
  WHERE creator_id = p_creator_id
  FOR UPDATE;

  -- Update wallet balance
  v_new_balance := v_current_balance + p_amount;

  UPDATE creator_wallets
  SET balance = v_new_balance,
      total_earnings = total_earnings + p_amount,
      updated_at = NOW()
  WHERE creator_id = p_creator_id;

  -- Record royalty transaction
  INSERT INTO credit_transactions (
    creator_id,
    amount,
    transaction_type,
    status,
    description,
    transition_id,
    purchase_id,
    royalty_rate
  ) VALUES (
    p_creator_id,
    p_amount,
    'royalty',
    'completed',
    'Transition royalty payment',
    p_transition_id,
    p_purchase_id,
    p_royalty_rate
  ) RETURNING id INTO v_transaction_id;

  -- Return result
  RETURN json_build_object(
    'transaction_id', v_transaction_id,
    'new_balance', v_new_balance,
    'royalty_amount', p_amount
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update creator wallet balance (for payouts and earnings)
CREATE OR REPLACE FUNCTION update_creator_wallet(
  p_creator_id UUID,
  p_balance_change DECIMAL(10,2),
  p_payout_amount DECIMAL(10,2) DEFAULT 0
) RETURNS JSON AS $$
DECLARE
  v_current_balance DECIMAL(10,2);
  v_new_balance DECIMAL(10,2);
  v_current_total_payouts DECIMAL(10,2);
  v_new_total_payouts DECIMAL(10,2);
BEGIN
  -- Ensure creator wallet exists
  INSERT INTO creator_wallets (creator_id, balance, total_earnings, total_payouts)
  VALUES (p_creator_id, 0, 0, 0)
  ON CONFLICT (creator_id) DO NOTHING;

  -- Lock the creator wallet row
  SELECT balance, total_payouts INTO v_current_balance, v_current_total_payouts
  FROM creator_wallets
  WHERE creator_id = p_creator_id
  FOR UPDATE;

  -- Calculate new values
  v_new_balance := v_current_balance + p_balance_change;
  v_new_total_payouts := v_current_total_payouts + p_payout_amount;

  -- Validate balance doesn't go negative
  IF v_new_balance < 0 THEN
    RAISE EXCEPTION 'Insufficient balance. Current: %, Requested: %', v_current_balance, ABS(p_balance_change);
  END IF;

  -- Update wallet
  UPDATE creator_wallets
  SET balance = v_new_balance,
      total_payouts = v_new_total_payouts,
      total_earnings = CASE
        WHEN p_balance_change > 0 THEN total_earnings + p_balance_change
        ELSE total_earnings
      END,
      updated_at = NOW()
  WHERE creator_id = p_creator_id;

  -- Return result
  RETURN json_build_object(
    'success', true,
    'previous_balance', v_current_balance,
    'new_balance', v_new_balance,
    'balance_change', p_balance_change,
    'payout_amount', p_payout_amount
  );
END;
$$ LANGUAGE plpgsql;

-- Function to update creator pending payout
CREATE OR REPLACE FUNCTION update_creator_pending_payout(
  p_creator_id UUID,
  p_amount DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_balance DECIMAL(10,2);
BEGIN
  -- Lock the creator wallet row
  SELECT balance INTO v_current_balance
  FROM creator_wallets
  WHERE creator_id = p_creator_id
  FOR UPDATE;

  -- Check sufficient balance
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient balance for payout';
  END IF;

  -- Update pending payout
  UPDATE creator_wallets
  SET balance = balance - p_amount,
      pending_payouts = pending_payouts + p_amount,
      updated_at = NOW()
  WHERE creator_id = p_creator_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to increment transition usage count
CREATE OR REPLACE FUNCTION increment_transition_usage(
  p_transition_id TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE transitions
  SET usage_count = usage_count + 1,
      updated_at = NOW()
  WHERE id = p_transition_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to increment creator transitions count
CREATE OR REPLACE FUNCTION increment_creator_transitions(
  p_creator_user_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE creator_profiles
  SET total_transitions = total_transitions + 1,
      updated_at = NOW()
  WHERE user_id = p_creator_user_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
ALTER TABLE beat_sync_settings ENABLE ROW LEVEL SECURITY;

-- Scenes policies
CREATE POLICY "Users can view their own scenes" ON scenes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scenes" ON scenes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scenes" ON scenes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scenes" ON scenes
  FOR DELETE USING (auth.uid() = user_id);

-- Transition slots policies
CREATE POLICY "Users can view their own transition slots" ON transition_slots
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transition slots" ON transition_slots
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transition slots" ON transition_slots
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transition slots" ON transition_slots
  FOR DELETE USING (auth.uid() = user_id);

-- Transition previews policies
CREATE POLICY "Users can view their own transition previews" ON transition_previews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transition previews" ON transition_previews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transition previews" ON transition_previews
  FOR DELETE USING (auth.uid() = user_id);

-- GPU render jobs policies
CREATE POLICY "Users can view their own render jobs" ON gpu_render_jobs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own render jobs" ON gpu_render_jobs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own render jobs" ON gpu_render_jobs
  FOR UPDATE USING (auth.uid() = user_id);

-- Audio analysis policies
CREATE POLICY "Users can view audio analysis for their projects" ON audio_analysis
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = audio_analysis.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Beat sync settings policies
CREATE POLICY "Users can view their own beat sync settings" ON beat_sync_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own beat sync settings" ON beat_sync_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own beat sync settings" ON beat_sync_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Transitions are public (read-only for all users)
ALTER TABLE transitions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Transitions are viewable by everyone" ON transitions
  FOR SELECT USING (is_active = true);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_scenes_updated_at BEFORE UPDATE ON scenes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transition_slots_updated_at BEFORE UPDATE ON transition_slots
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_beat_sync_settings_updated_at BEFORE UPDATE ON beat_sync_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
