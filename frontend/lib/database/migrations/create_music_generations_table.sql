-- Create music_generations table for tracking music generation requests
CREATE TABLE IF NOT EXISTS music_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Generation Parameters
  prompt TEXT NOT NULL,
  style VARCHAR(50) NOT NULL DEFAULT 'upbeat',
  duration INTEGER NOT NULL DEFAULT 30,
  model_preference VARCHAR(50),
  tempo INTEGER,
  key VARCHAR(10),
  instruments TEXT[], -- Array of instrument names
  
  -- Generation Results
  status VARCHAR(20) NOT NULL DEFAULT 'processing', -- processing, completed, failed
  audio_url TEXT,
  model_used VARCHAR(100),
  processing_time INTEGER, -- milliseconds
  error_message TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  cost_estimate DECIMAL(10,4),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_music_generations_user_id ON music_generations(user_id);
CREATE INDEX IF NOT EXISTS idx_music_generations_project_id ON music_generations(project_id);
CREATE INDEX IF NOT EXISTS idx_music_generations_status ON music_generations(status);
CREATE INDEX IF NOT EXISTS idx_music_generations_created_at ON music_generations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE music_generations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own music generations" ON music_generations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own music generations" ON music_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own music generations" ON music_generations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own music generations" ON music_generations
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_music_generations_updated_at 
  BEFORE UPDATE ON music_generations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE music_generations IS 'Tracks music generation requests and results';
COMMENT ON COLUMN music_generations.prompt IS 'User prompt for music generation';
COMMENT ON COLUMN music_generations.style IS 'Music style: upbeat, chill, dramatic, ambient, electronic, orchestral, rock, jazz, custom';
COMMENT ON COLUMN music_generations.duration IS 'Requested duration in seconds';
COMMENT ON COLUMN music_generations.model_preference IS 'Preferred model: musicgen, riffusion, bark, auto';
COMMENT ON COLUMN music_generations.audio_url IS 'URL to generated audio file';
COMMENT ON COLUMN music_generations.processing_time IS 'Generation time in milliseconds';
COMMENT ON COLUMN music_generations.cost_estimate IS 'Estimated cost in USD';
