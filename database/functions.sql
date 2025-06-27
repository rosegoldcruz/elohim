-- AEON SaaS Database Functions
-- Credit management and business logic functions

-- Function to add credits to user account
CREATE OR REPLACE FUNCTION add_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_type VARCHAR(50),
  p_description TEXT DEFAULT NULL,
  p_order_id UUID DEFAULT NULL,
  p_stripe_payment_intent_id VARCHAR(255) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Add credits to user
  UPDATE users 
  SET credits = credits + p_amount,
      updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Record transaction
  INSERT INTO credit_transactions (
    user_id, amount, type, description, order_id, stripe_payment_intent_id
  ) VALUES (
    p_user_id, p_amount, p_type, p_description, p_order_id, p_stripe_payment_intent_id
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to use credits (with validation)
CREATE OR REPLACE FUNCTION use_credits(
  p_user_id UUID,
  p_amount INTEGER,
  p_description TEXT,
  p_video_job_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO current_credits
  FROM users
  WHERE id = p_user_id;
  
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
  INSERT INTO credit_transactions (
    user_id, amount, type, description, video_job_id
  ) VALUES (
    p_user_id, -p_amount, 'usage', p_description, p_video_job_id
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate video cost based on duration and tier
CREATE OR REPLACE FUNCTION calculate_video_cost(
  p_duration INTEGER,
  p_tier VARCHAR(50) DEFAULT 'pro'
)
RETURNS INTEGER AS $$
DECLARE
  base_cost INTEGER;
  multiplier DECIMAL;
BEGIN
  -- Base cost: 100 credits per 60 seconds
  base_cost := CEIL(p_duration::DECIMAL / 60.0) * 100;
  
  -- Tier multipliers
  CASE p_tier
    WHEN 'free_trial' THEN multiplier := 1.0;
    WHEN 'pro' THEN multiplier := 1.0;
    WHEN 'creator' THEN multiplier := 0.9; -- 10% discount
    WHEN 'studio' THEN multiplier := 0.8; -- 20% discount
    ELSE multiplier := 1.0;
  END CASE;
  
  RETURN CEIL(base_cost * multiplier);
END;
$$ LANGUAGE plpgsql;

-- Function to get user's subscription status and credits
CREATE OR REPLACE FUNCTION get_user_status(p_user_id UUID)
RETURNS TABLE(
  credits INTEGER,
  subscription_tier VARCHAR(50),
  subscription_status VARCHAR(50),
  trial_ends_at TIMESTAMPTZ,
  subscription_ends_at TIMESTAMPTZ,
  can_generate_video BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.credits,
    u.subscription_tier,
    u.subscription_status,
    u.trial_ends_at,
    u.subscription_current_period_end,
    CASE 
      WHEN u.credits > 0 AND (
        u.subscription_status = 'active' OR 
        (u.subscription_status = 'trialing' AND u.trial_ends_at > NOW())
      ) THEN TRUE
      ELSE FALSE
    END as can_generate_video
  FROM users u
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to process subscription renewal
CREATE OR REPLACE FUNCTION process_subscription_renewal(
  p_user_id UUID,
  p_stripe_subscription_id VARCHAR(255),
  p_plan_slug VARCHAR(50),
  p_period_start TIMESTAMPTZ,
  p_period_end TIMESTAMPTZ
)
RETURNS BOOLEAN AS $$
DECLARE
  plan_credits INTEGER;
BEGIN
  -- Get plan credits
  SELECT credits_monthly INTO plan_credits
  FROM subscription_plans
  WHERE slug = p_plan_slug AND is_active = true;
  
  IF plan_credits IS NULL THEN
    RAISE EXCEPTION 'Invalid subscription plan: %', p_plan_slug;
  END IF;
  
  -- Update user subscription
  UPDATE users SET
    subscription_tier = p_plan_slug,
    subscription_status = 'active',
    stripe_subscription_id = p_stripe_subscription_id,
    subscription_current_period_start = p_period_start,
    subscription_current_period_end = p_period_end,
    updated_at = NOW()
  WHERE id = p_user_id;
  
  -- Add monthly credits
  PERFORM add_credits(
    p_user_id,
    plan_credits,
    'subscription',
    'Monthly subscription credits: ' || p_plan_slug,
    NULL,
    NULL
  );
  
  -- Record subscription history
  INSERT INTO subscription_history (
    user_id, stripe_subscription_id, plan_name, status,
    current_period_start, current_period_end
  ) VALUES (
    p_user_id, p_stripe_subscription_id, p_plan_slug, 'active',
    p_period_start, p_period_end
  );
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get video queue position
CREATE OR REPLACE FUNCTION get_queue_position(p_video_job_id UUID)
RETURNS INTEGER AS $$
DECLARE
  position INTEGER;
  job_priority INTEGER;
  job_created_at TIMESTAMPTZ;
BEGIN
  -- Get job details
  SELECT priority, created_at INTO job_priority, job_created_at
  FROM video_jobs
  WHERE id = p_video_job_id;
  
  -- Count jobs ahead in queue
  SELECT COUNT(*) + 1 INTO position
  FROM video_jobs
  WHERE status IN ('queued', 'processing')
    AND (
      priority > job_priority OR 
      (priority = job_priority AND created_at < job_created_at)
    );
  
  RETURN position;
END;
$$ LANGUAGE plpgsql;

-- Function to update video job progress
CREATE OR REPLACE FUNCTION update_video_progress(
  p_job_id UUID,
  p_status VARCHAR(50),
  p_scenes_completed INTEGER DEFAULT NULL,
  p_current_model VARCHAR(100) DEFAULT NULL,
  p_error_message TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE video_jobs SET
    status = p_status,
    scenes_generated = COALESCE(p_scenes_completed, scenes_generated),
    current_model = COALESCE(p_current_model, current_model),
    error_message = p_error_message,
    processing_started_at = CASE 
      WHEN p_status = 'processing' AND processing_started_at IS NULL 
      THEN NOW() 
      ELSE processing_started_at 
    END,
    processing_completed_at = CASE 
      WHEN p_status IN ('completed', 'failed') 
      THEN NOW() 
      ELSE processing_completed_at 
    END,
    updated_at = NOW()
  WHERE id = p_job_id;
  
  RETURN TRUE;
EXCEPTION
  WHEN OTHERS THEN
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Function to get user analytics
CREATE OR REPLACE FUNCTION get_user_analytics(p_user_id UUID)
RETURNS TABLE(
  total_videos INTEGER,
  total_credits_used INTEGER,
  total_credits_purchased INTEGER,
  avg_video_duration DECIMAL,
  last_video_created TIMESTAMPTZ,
  subscription_value DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(vj.id)::INTEGER as total_videos,
    COALESCE(SUM(vj.credits_used), 0)::INTEGER as total_credits_used,
    COALESCE(SUM(CASE WHEN ct.amount > 0 THEN ct.amount ELSE 0 END), 0)::INTEGER as total_credits_purchased,
    COALESCE(AVG(vj.final_duration), 0)::DECIMAL as avg_video_duration,
    MAX(vj.created_at) as last_video_created,
    COALESCE(SUM(o.amount), 0)::DECIMAL as subscription_value
  FROM users u
  LEFT JOIN video_jobs vj ON u.id = vj.user_id
  LEFT JOIN credit_transactions ct ON u.id = ct.user_id
  LEFT JOIN orders o ON u.id = o.user_id
  WHERE u.id = p_user_id
  GROUP BY u.id;
END;
$$ LANGUAGE plpgsql;
