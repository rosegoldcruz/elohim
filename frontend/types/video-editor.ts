/**
 * AEON Video Editor Types
 * Comprehensive type definitions for the video editing system
 */

export interface Scene {
  id: string;
  name: string;
  duration: number; // in seconds
  thumbnail: string;
  videoUrl: string;
  beatMarkers: number[]; // timestamps for beat synchronization
  metadata: {
    resolution: string;
    fps: number;
    fileSize: number;
    createdAt: string;
  };
}

export interface Transition {
  id: string;
  name: string;
  category: TransitionCategory;
  duration: number; // in seconds (0.3 - 0.8)
  intensity: TransitionIntensity;
  viralScore: number; // 1-10 rating
  previewUrl: string;
  glslCode: string; // WebGL shader code
  parameters: TransitionParameter[];
  description: string;
  tags: string[];
}

export type TransitionCategory = 
  | 'tiktok-essentials'
  | 'cinematic'
  | '3d-transforms'
  | 'particle-fx'
  | 'ai-generated'
  | 'glitch'
  | 'organic';

export type TransitionIntensity = 'subtle' | 'moderate' | 'strong' | 'extreme';

export interface TransitionParameter {
  name: string;
  type: 'float' | 'int' | 'bool' | 'color';
  value: number | boolean | string;
  min?: number;
  max?: number;
  step?: number;
  description: string;
}

export interface TimelineItem {
  id: string;
  type: 'scene' | 'transition';
  sceneId?: string;
  transitionId?: string;
  startTime: number;
  duration: number;
  track: number; // 0 = video, 1 = audio, 2 = text, 3 = effects
}

export interface Project {
  id: string;
  name: string;
  scenes: Scene[];
  timeline: TimelineItem[];
  transitions: { [key: string]: Transition };
  settings: ProjectSettings;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSettings {
  resolution: '1080x1920' | '1080x1080' | '1920x1080';
  fps: 30 | 60;
  quality: 'draft' | 'standard' | 'high' | 'ultra';
  beatSync: boolean;
  autoTransitions: boolean;
  viralOptimization: boolean;
}

export interface BeatMarker {
  time: number;
  strength: number; // 0-1, how strong the beat is
  type: 'kick' | 'snare' | 'hihat' | 'bass';
}

export interface AudioAnalysis {
  duration: number;
  bpm: number;
  beats: BeatMarker[];
  energy: number[]; // energy levels over time
  spectralCentroid: number[]; // brightness over time
}

export interface TransitionSlot {
  id: string;
  beforeSceneId: string;
  afterSceneId: string;
  transition?: Transition;
  customParameters?: { [key: string]: any };
  beatSynced: boolean;
  syncPoint?: number; // beat marker index
}

export interface RenderJob {
  id: string;
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number; // 0-100
  settings: ProjectSettings;
  outputUrl?: string;
  error?: string;
  createdAt: string;
  estimatedCompletion?: string;
}

export interface PreviewRequest {
  sceneId1: string;
  sceneId2: string;
  transitionId: string;
  parameters?: { [key: string]: any };
  duration?: number;
}

export interface PreviewResponse {
  url: string;
  duration: number;
  frames: number;
  expiresAt: string;
}

// GPU Transition Engine Types
export interface GPUTransitionConfig {
  enableCUDA: boolean;
  memoryLimit: number; // in MB
  maxConcurrentJobs: number;
  cacheSize: number;
}

export interface TransitionRenderOptions {
  quality: 'preview' | 'final';
  frameRate: number;
  resolution: [number, number];
  enableGPU: boolean;
}

// WebGL Types for browser preview
export interface WebGLTransitionContext {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  textures: WebGLTexture[];
  uniforms: { [key: string]: WebGLUniformLocation };
}

export interface TransitionPreviewState {
  isPlaying: boolean;
  progress: number; // 0-1
  duration: number;
  currentFrame: number;
  totalFrames: number;
}

// Event Types
export interface TimelineEvent {
  type: 'scene-moved' | 'transition-added' | 'transition-removed' | 'parameter-changed';
  payload: any;
  timestamp: number;
}

export interface EditorState {
  project: Project | null;
  selectedScene: string | null;
  selectedTransition: string | null;
  playbackTime: number;
  isPlaying: boolean;
  zoom: number; // timeline zoom level
  previewQuality: 'low' | 'medium' | 'high';
  showBeatMarkers: boolean;
  snapToBeat: boolean;
}
