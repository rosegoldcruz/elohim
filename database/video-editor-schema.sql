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

-- Transitions table for transition definitions
CREATE TABLE IF NOT EXISTS transitions (
  id TEXT PRIMARY KEY, -- e.g., 'zoom-punch', 'glitch-blast'
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'tiktok-essentials', 'cinematic', etc.
  duration DECIMAL(4,2) NOT NULL DEFAULT 0.5,
  intensity TEXT NOT NULL DEFAULT 'moderate', -- 'subtle', 'moderate', 'strong', 'extreme'
  viral_score DECIMAL(3,1) NOT NULL DEFAULT 5.0,
  preview_url TEXT,
  glsl_code TEXT NOT NULL, -- WebGL shader code
  parameters JSONB DEFAULT '[]', -- Array of parameter definitions
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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

-- Row Level Security (RLS) policies
ALTER TABLE scenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE transition_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE gpu_render_jobs ENABLE ROW LEVEL SECURITY;
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
