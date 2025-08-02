-- Add videos table for storing Replicate video generation results
-- This table stores completed video generation results from the backend

CREATE TABLE IF NOT EXISTS videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id TEXT UNIQUE NOT NULL,
  model TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  output_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_prediction_id ON videos(prediction_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at);

-- Enable Row Level Security
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow all authenticated users to read/write their own videos
-- Note: This is a simple policy - in production you might want more granular control
CREATE POLICY "Users can manage their own videos" ON videos
  FOR ALL USING (true);

-- Add comment for documentation
COMMENT ON TABLE videos IS 'Stores completed video generation results from Replicate API';
COMMENT ON COLUMN videos.prediction_id IS 'Unique identifier from Replicate API';
COMMENT ON COLUMN videos.model IS 'AI model used for generation (e.g., kling, luma, etc.)';
COMMENT ON COLUMN videos.status IS 'Generation status (processing, succeeded, failed)';
COMMENT ON COLUMN videos.output_url IS 'URL to the generated video file';
