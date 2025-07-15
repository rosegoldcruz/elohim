-- AEON SaaS Initial Data
-- Subscription plans and configuration

-- Insert subscription plans
INSERT INTO subscription_plans (name, slug, stripe_price_id, price_monthly, price_yearly, credits_monthly, features) VALUES
(
  'AEON Starter Pass',
  'starter_pass',
  'price_1RiUVxL0i8aKDQ0rtsV8jP',
  5.99,
  NULL,
  100,
  '{
    "video_quality": "720p",
    "watermark": true,
    "queue_priority": 1,
    "voiceover": false,
    "captions": false,
    "api_access": false,
    "white_label": false,
    "one_time_purchase": true
  }'::jsonb
),
(
  'AEON Pro',
  'pro',
  'price_1ReF56L0i8aKDQ0rZzEwTzVD',
  29.99,
  288.00,
  1000,
  '{
    "video_quality": "1080p",
    "watermark": false,
    "queue_priority": 2,
    "voiceover": true,
    "captions": true,
    "api_access": false,
    "white_label": false,
    "commercial_license": true
  }'::jsonb
),
(
  'AEON Creator',
  'creator',
  'price_1ReF9hL0i8aKDQ0riUb3x64F',
  59.99,
  588.00,
  3000,
  '{
    "video_quality": "4k",
    "watermark": false,
    "queue_priority": 3,
    "voiceover": true,
    "captions": true,
    "api_access": true,
    "white_label": false,
    "commercial_license": true,
    "voice_cloning": true,
    "custom_avatars": true
  }'::jsonb
),
(
  'AEON Studio',
  'studio',
  'price_1ReFCML0i8aKDQ0rwmFoSEZP',
  149.99,
  1140.00,
  8000,
  '{
    "video_quality": "4k",
    "watermark": false,
    "queue_priority": 4,
    "voiceover": true,
    "captions": true,
    "api_access": true,
    "white_label": true,
    "commercial_license": true,
    "voice_cloning": true,
    "custom_avatars": true,
    "dedicated_support": true,
    "custom_integrations": true,
    "team_collaboration": true
  }'::jsonb
),
(
  'AEON PRO',
  'pro',
  'price_pro_monthly', -- Replace with actual Stripe price ID
  29.99,
  288.00,
  2000,
  '{
    "video_quality": "1080p",
    "watermark": false,
    "queue_priority": 1,
    "voiceover": false,
    "captions": true,
    "api_access": false,
    "white_label": false,
    "support": "standard"
  }'::jsonb
),
(
  'AEON CREATOR',
  'creator',
  'price_creator_monthly', -- Replace with actual Stripe price ID
  59.99,
  588.00,
  6000,
  '{
    "video_quality": "1080p",
    "watermark": false,
    "queue_priority": 2,
    "voiceover": true,
    "captions": true,
    "api_access": true,
    "white_label": false,
    "support": "priority",
    "batch_processing": true
  }'::jsonb
),
(
  'AEON STUDIO',
  'studio',
  'price_studio_monthly', -- Replace with actual Stripe price ID
  149.99,
  1440.00,
  15000,
  '{
    "video_quality": "4K",
    "watermark": false,
    "queue_priority": 3,
    "voiceover": true,
    "captions": true,
    "api_access": true,
    "white_label": true,
    "support": "dedicated",
    "batch_processing": true,
    "custom_branding": true,
    "advanced_editing": true
  }'::jsonb
);

-- Insert yearly plan variants
INSERT INTO subscription_plans (name, slug, stripe_price_id, price_monthly, price_yearly, credits_monthly, features) VALUES
(
  'AEON PRO (Yearly)',
  'pro_yearly',
  'price_pro_yearly', -- Replace with actual Stripe price ID
  24.00, -- Monthly equivalent of yearly price
  288.00,
  2000,
  '{
    "video_quality": "1080p",
    "watermark": false,
    "queue_priority": 1,
    "voiceover": false,
    "captions": true,
    "api_access": false,
    "white_label": false,
    "support": "standard",
    "billing_cycle": "yearly",
    "discount": "20%"
  }'::jsonb
),
(
  'AEON CREATOR (Yearly)',
  'creator_yearly',
  'price_creator_yearly', -- Replace with actual Stripe price ID
  49.00, -- Monthly equivalent of yearly price
  588.00,
  6000,
  '{
    "video_quality": "1080p",
    "watermark": false,
    "queue_priority": 2,
    "voiceover": true,
    "captions": true,
    "api_access": true,
    "white_label": false,
    "support": "priority",
    "batch_processing": true,
    "billing_cycle": "yearly",
    "discount": "20%"
  }'::jsonb
),
(
  'AEON STUDIO (Yearly)',
  'studio_yearly',
  'price_studio_yearly', -- Replace with actual Stripe price ID
  120.00, -- Monthly equivalent of yearly price
  1440.00,
  15000,
  '{
    "video_quality": "4K",
    "watermark": false,
    "queue_priority": 3,
    "voiceover": true,
    "captions": true,
    "api_access": true,
    "white_label": true,
    "support": "dedicated",
    "batch_processing": true,
    "custom_branding": true,
    "advanced_editing": true,
    "billing_cycle": "yearly",
    "discount": "20%"
  }'::jsonb
);

-- Create admin user (update email as needed)
INSERT INTO users (email, full_name, credits, subscription_tier, subscription_status) VALUES
('admin@aeon.dev', 'AEON Admin', 100000, 'studio', 'active');

-- Create sample video generation models configuration
CREATE TABLE IF NOT EXISTS video_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  replicate_model VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  max_duration INTEGER DEFAULT 10, -- seconds
  cost_multiplier DECIMAL(3,2) DEFAULT 1.0,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert video generation models
INSERT INTO video_models (name, slug, replicate_model, priority, max_duration, cost_multiplier, features) VALUES
(
  'Kling AI',
  'kling',
  'kling-ai/kling-1.0',
  1,
  10,
  1.0,
  '{
    "quality": "high",
    "style": "cinematic",
    "motion": "smooth",
    "recommended_for": ["cinematic", "professional", "commercial"]
  }'::jsonb
),
(
  'Haiper AI',
  'haiper',
  'haiper-ai/haiper-video-v1',
  2,
  8,
  0.9,
  '{
    "quality": "high",
    "style": "realistic",
    "motion": "natural",
    "recommended_for": ["realistic", "documentary", "lifestyle"]
  }'::jsonb
),
(
  'Luma Dream Machine',
  'luma',
  'lumalabs/dream-machine',
  3,
  10,
  1.1,
  '{
    "quality": "premium",
    "style": "artistic",
    "motion": "creative",
    "recommended_for": ["artistic", "creative", "abstract"]
  }'::jsonb
),
(
  'RunwayML Gen-3',
  'runway',
  'runway-ml/runway-gen3-alpha',
  4,
  10,
  1.2,
  '{
    "quality": "premium",
    "style": "professional",
    "motion": "precise",
    "recommended_for": ["professional", "advertising", "corporate"]
  }'::jsonb
),
(
  'Pika Labs',
  'pika',
  'pika-labs/pika-1.0',
  5,
  6,
  0.8,
  '{
    "quality": "good",
    "style": "versatile",
    "motion": "stable",
    "recommended_for": ["social_media", "quick_content", "prototyping"]
  }'::jsonb
),
(
  'Stable Video Diffusion',
  'stable_video',
  'stability-ai/stable-video-diffusion',
  6,
  8,
  0.7,
  '{
    "quality": "good",
    "style": "stable",
    "motion": "controlled",
    "recommended_for": ["consistent", "batch_processing", "cost_effective"]
  }'::jsonb
);

-- Create credit bundle options
CREATE TABLE IF NOT EXISTS credit_bundles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  credits INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  bonus_credits INTEGER DEFAULT 0,
  stripe_price_id VARCHAR(255) UNIQUE,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert credit bundles
INSERT INTO credit_bundles (name, credits, price, bonus_credits, stripe_price_id, sort_order) VALUES
('Starter Pack', 2500, 39.00, 0, 'price_credits_2500', 1),
('Creator Pack', 7500, 79.00, 500, 'price_credits_7500', 2),
('Studio Pack', 15000, 149.00, 1500, 'price_credits_15000', 3),
('Enterprise Pack', 50000, 399.00, 10000, 'price_credits_50000', 4);

-- Create video style presets
CREATE TABLE IF NOT EXISTS video_styles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert video styles
INSERT INTO video_styles (name, slug, description, prompt_template, sort_order) VALUES
(
  'Cinematic',
  'cinematic',
  'Professional movie-style videos with dramatic lighting and camera movements',
  'Create a cinematic video with dramatic lighting, professional camera work, and movie-like quality. {prompt}',
  1
),
(
  'Documentary',
  'documentary',
  'Realistic documentary-style footage with natural lighting',
  'Create a documentary-style video with natural lighting, realistic scenes, and authentic feel. {prompt}',
  2
),
(
  'Commercial',
  'commercial',
  'Polished commercial-style videos perfect for advertising',
  'Create a commercial-style video with polished visuals, professional presentation, and advertising quality. {prompt}',
  3
),
(
  'Social Media',
  'social_media',
  'Engaging content optimized for social media platforms',
  'Create an engaging social media video with vibrant colors, dynamic movement, and attention-grabbing visuals. {prompt}',
  4
),
(
  'Artistic',
  'artistic',
  'Creative and artistic videos with unique visual styles',
  'Create an artistic video with creative visual effects, unique styling, and artistic flair. {prompt}',
  5
),
(
  'Minimalist',
  'minimalist',
  'Clean and simple videos with minimal distractions',
  'Create a minimalist video with clean visuals, simple composition, and elegant simplicity. {prompt}',
  6
);
