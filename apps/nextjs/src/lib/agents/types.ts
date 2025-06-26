// AEON Agent System Types
export interface BaseAgent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];
  config: AgentConfig;
}

export type AgentType = 
  | 'ScriptWriterAgent'
  | 'VisualGeneratorAgent'
  | 'EditorAgent'
  | 'SchedulerAgent'
  | 'BusinessAgent'
  | 'MonetizationAgent';

export type AgentStatus = 'idle' | 'processing' | 'completed' | 'error';

export interface AgentConfig {
  model?: string;
  parameters?: Record<string, any>;
  apiKeys?: Record<string, string>;
}

export interface VideoProject {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'processing' | 'completed' | 'failed';
  agents: AgentExecution[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface AgentExecution {
  agentId: string;
  agentType: AgentType;
  status: AgentStatus;
  input: any;
  output?: any;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
}

export interface ScriptWriterInput {
  topic: string;
  tone: 'professional' | 'casual' | 'educational' | 'entertaining';
  duration: number; // in seconds
  targetAudience: string;
  keywords?: string[];
}

export interface ScriptWriterOutput {
  script: string;
  scenes: ScriptScene[];
  metadata: {
    wordCount: number;
    estimatedDuration: number;
    keyPoints: string[];
  };
}

export interface ScriptScene {
  id: string;
  text: string;
  duration: number;
  visualCues: string[];
  voiceoverNotes?: string;
}

export interface VisualGeneratorInput {
  script: ScriptWriterOutput;
  style: 'realistic' | 'animated' | 'abstract' | 'cinematic';
  resolution: '720p' | '1080p' | '4k';
  aspectRatio: '16:9' | '9:16' | '1:1';
}

export interface VisualGeneratorOutput {
  videoClips: VideoClip[];
  assets: MediaAsset[];
  metadata: {
    totalDuration: number;
    resolution: string;
    frameRate: number;
  };
}

export interface VideoClip {
  id: string;
  sceneId: string;
  url: string;
  duration: number;
  startTime: number;
  endTime: number;
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  metadata: Record<string, any>;
}

export interface EditorInput {
  videoClips: VideoClip[];
  assets: MediaAsset[];
  transitions?: TransitionEffect[];
  effects?: VideoEffect[];
}

export interface EditorOutput {
  finalVideo: {
    url: string;
    duration: number;
    size: number;
    format: string;
  };
  thumbnail: string;
  metadata: VideoMetadata;
}

export interface TransitionEffect {
  type: 'fade' | 'slide' | 'zoom' | 'dissolve';
  duration: number;
  position: number;
}

export interface VideoEffect {
  type: 'filter' | 'overlay' | 'text' | 'animation';
  parameters: Record<string, any>;
  startTime: number;
  endTime: number;
}

export interface VideoMetadata {
  title: string;
  description: string;
  tags: string[];
  duration: number;
  resolution: string;
  fileSize: number;
  createdAt: Date;
}

export interface BusinessInput {
  video: EditorOutput;
  targetPlatforms: Platform[];
  goals: BusinessGoal[];
}

export interface BusinessOutput {
  optimizations: PlatformOptimization[];
  recommendations: BusinessRecommendation[];
  analytics: PerformancePrediction;
}

export type Platform = 'youtube' | 'tiktok' | 'instagram' | 'linkedin' | 'twitter';

export interface BusinessGoal {
  type: 'engagement' | 'conversion' | 'awareness' | 'education';
  target: number;
  metric: string;
}

export interface PlatformOptimization {
  platform: Platform;
  title: string;
  description: string;
  tags: string[];
  thumbnail: string;
  scheduledTime?: Date;
}

export interface BusinessRecommendation {
  type: 'content' | 'timing' | 'targeting' | 'promotion';
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'low' | 'medium' | 'high';
}

export interface PerformancePrediction {
  expectedViews: number;
  expectedEngagement: number;
  confidenceScore: number;
  factors: string[];
}
