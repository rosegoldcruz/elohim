-- Add additional user profile fields for marketing and personalization
-- Migration: Add first_name, last_name, birthday to users table

-- Add new columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100),
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0;

-- Create index for birthday queries (for marketing campaigns)
CREATE INDEX IF NOT EXISTS idx_users_birthday ON users(birthday);
CREATE INDEX IF NOT EXISTS idx_users_marketing_consent ON users(marketing_consent);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login_at);

-- Update the updated_at trigger to include new fields
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure trigger exists
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create a view for marketing analytics
CREATE OR REPLACE VIEW user_marketing_analytics AS
SELECT 
    id,
    email,
    first_name,
    last_name,
    full_name,
    birthday,
    EXTRACT(YEAR FROM AGE(birthday)) as age,
    CASE 
        WHEN EXTRACT(YEAR FROM AGE(birthday)) < 18 THEN 'Under 18'
        WHEN EXTRACT(YEAR FROM AGE(birthday)) BETWEEN 18 AND 24 THEN '18-24'
        WHEN EXTRACT(YEAR FROM AGE(birthday)) BETWEEN 25 AND 34 THEN '25-34'
        WHEN EXTRACT(YEAR FROM AGE(birthday)) BETWEEN 35 AND 44 THEN '35-44'
        WHEN EXTRACT(YEAR FROM AGE(birthday)) BETWEEN 45 AND 54 THEN '45-54'
        WHEN EXTRACT(YEAR FROM AGE(birthday)) BETWEEN 55 AND 64 THEN '55-64'
        ELSE '65+'
    END as age_group,
    marketing_consent,
    subscription_tier,
    subscription_status,
    credits,
    login_count,
    last_login_at,
    created_at,
    DATE_PART('day', NOW() - created_at) as days_since_signup
FROM users
WHERE marketing_consent = true;

-- Create function to update login stats
CREATE OR REPLACE FUNCTION update_user_login_stats(user_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE users 
    SET 
        last_login_at = NOW(),
        login_count = login_count + 1,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON user_marketing_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_login_stats(UUID) TO authenticated;
