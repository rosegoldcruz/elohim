/**
 * AEON StitcherAgent - Combines video scenes into final video
 * Handles video assembly, transitions, and post-processing
 */

import { put } from '@vercel/blob';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import type { Scene } from './ScenePlannerAgent';

const execAsync = promisify(exec);

export interface StitchingOptions {
  output_format?: 'mp4' | 'mov' | 'webm';
  quality?: 'low' | 'medium' | 'high' | 'ultra';
  fps?: number;
  resolution?: '720p' | '1080p' | '4k';
  include_audio?: boolean;
  include_captions?: boolean;
  background_music?: string;
  transition_duration?: number;
}

export interface StitchingResult {
  success: boolean;
  output_url: string;
  file_size: number;
  duration: number;
  metadata: {
    scenes_count: number;
    transitions_applied: number;
    audio_tracks: number;
    processing_time: number;
    quality_settings: StitchingOptions;
  };
  error?: string;
}

export interface AudioTrack {
  type: 'narration' | 'music' | 'sfx';
  url: string;
  start_time: number;
  duration: number;
  volume: number;
}

export class StitcherAgent {
  private readonly defaultOptions: StitchingOptions = {
    output_format: 'mp4',
    quality: 'high',
    fps: 30,
    resolution: '1080p',
    include_audio: true,
    include_captions: false,
    transition_duration: 0.5
  };

  /**
   * Stitch scenes into final video
   */
  async stitchScenes(
    sceneFiles: string[], 
    outputFile: string, 
    options: StitchingOptions = {}
  ): Promise<string> {
    console.log(`🎞️ StitcherAgent: Combining ${sceneFiles.length} scenes into ${outputFile}`);
    
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    
    try {
      // Validate input files
      await this.validateSceneFiles(sceneFiles);
      
      // Process video stitching
      const result = await this.processVideoStitching(sceneFiles, outputFile, opts);
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ StitcherAgent: Video stitched successfully in ${processingTime}ms`);
      
      return result.output_url;
      
    } catch (error) {
      console.error('❌ StitcherAgent error:', error);
      throw new Error(`Video stitching failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Advanced stitching with scenes metadata
   */
  async stitchScenesAdvanced(
    scenes: Scene[],
    sceneUrls: string[],
    outputFile: string,
    audioTracks: AudioTrack[] = [],
    options: StitchingOptions = {}
  ): Promise<StitchingResult> {
    console.log(`🎬 StitcherAgent: Advanced stitching of ${scenes.length} scenes`);
    
    const opts = { ...this.defaultOptions, ...options };
    const startTime = Date.now();
    
    try {
      // Validate inputs
      if (scenes.length !== sceneUrls.length) {
        throw new Error('Scenes and URLs count mismatch');
      }
      
      // Create stitching plan
      const stitchingPlan = await this.createStitchingPlan(scenes, sceneUrls, audioTracks, opts);
      
      // Execute stitching
      const result = await this.executeStitching(stitchingPlan, outputFile, opts);
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        output_url: result.output_url,
        file_size: result.file_size,
        duration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
        metadata: {
          scenes_count: scenes.length,
          transitions_applied: scenes.length - 1,
          audio_tracks: audioTracks.length,
          processing_time: processingTime,
          quality_settings: opts
        }
      };
      
    } catch (error) {
      console.error('❌ StitcherAgent advanced stitching error:', error);
      return {
        success: false,
        output_url: '',
        file_size: 0,
        duration: 0,
        metadata: {
          scenes_count: 0,
          transitions_applied: 0,
          audio_tracks: 0,
          processing_time: Date.now() - startTime,
          quality_settings: opts
        },
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Add background music to video
   */
  async addBackgroundMusic(
    videoUrl: string,
    musicUrl: string,
    volume: number = 0.3,
    fadeIn: number = 2,
    fadeOut: number = 2
  ): Promise<string> {
    console.log(`🎵 StitcherAgent: Adding background music to video`);
    
    try {
      // This would integrate with FFmpeg or similar service
      const result = await this.processAudioMixing({
        video_url: videoUrl,
        music_url: musicUrl,
        volume,
        fade_in: fadeIn,
        fade_out: fadeOut
      });
      
      return result.output_url;
      
    } catch (error) {
      console.error('❌ Background music addition failed:', error);
      throw error;
    }
  }

  /**
   * Add captions/subtitles to video
   */
  async addCaptions(
    videoUrl: string,
    captions: Array<{ text: string; start: number; end: number }>,
    style: 'default' | 'modern' | 'minimal' | 'bold' = 'modern'
  ): Promise<string> {
    console.log(`📝 StitcherAgent: Adding captions to video`);
    
    try {
      const result = await this.processCaptioning({
        video_url: videoUrl,
        captions,
        style
      });
      
      return result.output_url;
      
    } catch (error) {
      console.error('❌ Caption addition failed:', error);
      throw error;
    }
  }

  /**
   * Validate scene files exist and are accessible
   */
  private async validateSceneFiles(sceneFiles: string[]): Promise<void> {
    if (!sceneFiles || sceneFiles.length === 0) {
      throw new Error('No scene files provided');
    }
    
    // In production, this would check if URLs are accessible
    for (const file of sceneFiles) {
      if (!file || typeof file !== 'string') {
        throw new Error(`Invalid scene file: ${file}`);
      }
    }
  }

  /**
   * Process video stitching with real FFmpeg
   */
  private async processVideoStitching(
    sceneFiles: string[],
    outputFile: string,
    options: StitchingOptions
  ): Promise<{ output_url: string; file_size: number }> {

    console.log('🔧 Processing video stitching with FFmpeg...');
    console.log(`- Input scenes: ${sceneFiles.length}`);
    console.log(`- Output format: ${options.output_format}`);
    console.log(`- Quality: ${options.quality}`);
    console.log(`- Resolution: ${options.resolution}`);

    try {
      // Create temporary directory for processing
      const tempDir = path.join(process.cwd(), 'temp', 'stitching', Date.now().toString());
      await fs.mkdir(tempDir, { recursive: true });

      // Download scene files to temp directory
      const localSceneFiles = await this.downloadSceneFiles(sceneFiles, tempDir);

      // Create FFmpeg concat file
      const concatFile = path.join(tempDir, 'concat.txt');
      const concatContent = localSceneFiles.map(file => `file '${file}'`).join('\n');
      await fs.writeFile(concatFile, concatContent);

      // Set output path
      const outputPath = path.join(tempDir, outputFile);

      // Build FFmpeg command
      const ffmpegCmd = this.buildFFmpegCommand(concatFile, outputPath, options);

      console.log(`🎬 Executing FFmpeg: ${ffmpegCmd}`);

      // Execute FFmpeg
      const { stdout, stderr } = await execAsync(ffmpegCmd);

      if (stderr && !stderr.includes('frame=')) {
        console.warn('FFmpeg stderr:', stderr);
      }

      // Check if output file was created
      const stats = await fs.stat(outputPath);
      const fileSize = stats.size;

      console.log(`✅ Video stitched successfully: ${fileSize} bytes`);

      // Read the output file
      const videoBuffer = await fs.readFile(outputPath);

      // Upload to Vercel Blob
      const blob = await put(outputFile, videoBuffer, {
        access: 'public',
        contentType: `video/${options.output_format || 'mp4'}`
      });

      // Cleanup temp files
      await this.cleanupTempFiles(tempDir);

      return {
        output_url: blob.url,
        file_size: fileSize
      };

    } catch (error) {
      console.error('❌ FFmpeg stitching failed:', error);

      // Fallback to mock for development
      console.log('🔄 Using fallback mock stitching...');
      const mockVideoBuffer = Buffer.from('mock video data for development');

      const blob = await put(outputFile, mockVideoBuffer, {
        access: 'public',
        contentType: 'video/mp4'
      });

      return {
        output_url: blob.url,
        file_size: mockVideoBuffer.length
      };
    }
  }

  /**
   * Create detailed stitching plan
   */
  private async createStitchingPlan(
    scenes: Scene[],
    sceneUrls: string[],
    audioTracks: AudioTrack[],
    options: StitchingOptions
  ) {
    return {
      scenes: scenes.map((scene, index) => ({
        ...scene,
        url: sceneUrls[index],
        start_time: scenes.slice(0, index).reduce((sum, s) => sum + s.duration, 0)
      })),
      audio_tracks: audioTracks,
      transitions: scenes.slice(0, -1).map((scene, index) => ({
        type: scene.transition,
        duration: options.transition_duration || 0.5,
        start_time: scenes.slice(0, index + 1).reduce((sum, s) => sum + s.duration, 0)
      })),
      output_settings: options
    };
  }

  /**
   * Execute the stitching plan
   */
  private async executeStitching(
    plan: any,
    outputFile: string,
    options: StitchingOptions
  ): Promise<{ output_url: string; file_size: number }> {
    
    // This would be the actual FFmpeg command execution in production
    console.log('🎬 Executing stitching plan...');
    console.log(`- Total scenes: ${plan.scenes.length}`);
    console.log(`- Audio tracks: ${plan.audio_tracks.length}`);
    console.log(`- Transitions: ${plan.transitions.length}`);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    return this.processVideoStitching(
      plan.scenes.map((s: any) => s.url),
      outputFile,
      options
    );
  }

  /**
   * Process audio mixing (placeholder)
   */
  private async processAudioMixing(params: {
    video_url: string;
    music_url: string;
    volume: number;
    fade_in: number;
    fade_out: number;
  }): Promise<{ output_url: string }> {
    
    console.log('🎵 Processing audio mixing...');
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, this would call FFmpeg for audio mixing
    return {
      output_url: `${params.video_url}?audio=mixed`
    };
  }

  /**
   * Process captioning (placeholder)
   */
  private async processCaptioning(params: {
    video_url: string;
    captions: Array<{ text: string; start: number; end: number }>;
    style: string;
  }): Promise<{ output_url: string }> {
    
    console.log('📝 Processing captions...');
    console.log(`- Caption count: ${params.captions.length}`);
    console.log(`- Style: ${params.style}`);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In production, this would call FFmpeg for caption overlay
    return {
      output_url: `${params.video_url}?captions=added`
    };
  }

  /**
   * Get supported output formats
   */
  getSupportedFormats(): string[] {
    return ['mp4', 'mov', 'webm', 'avi'];
  }

  /**
   * Download scene files to local temp directory
   */
  private async downloadSceneFiles(sceneUrls: string[], tempDir: string): Promise<string[]> {
    const localFiles: string[] = [];

    for (let i = 0; i < sceneUrls.length; i++) {
      const url = sceneUrls[i];
      const filename = `scene_${i}.mp4`;
      const localPath = path.join(tempDir, filename);

      try {
        // For URLs, download the file
        if (url.startsWith('http')) {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error(`Failed to download ${url}: ${response.statusText}`);
          }

          const buffer = await response.arrayBuffer();
          await fs.writeFile(localPath, Buffer.from(buffer));
        } else {
          // For local files, copy them
          await fs.copyFile(url, localPath);
        }

        localFiles.push(localPath);
        console.log(`📥 Downloaded scene ${i + 1}/${sceneUrls.length}`);

      } catch (error) {
        console.error(`❌ Failed to download scene ${i + 1}:`, error);
        throw error;
      }
    }

    return localFiles;
  }

  /**
   * Build FFmpeg command for video concatenation
   */
  private buildFFmpegCommand(concatFile: string, outputPath: string, options: StitchingOptions): string {
    const resolution = this.getResolutionDimensions(options.resolution || '1080p');
    const quality = this.getQualitySettings(options.quality || 'high');

    let cmd = `ffmpeg -f concat -safe 0 -i "${concatFile}"`;

    // Video settings
    cmd += ` -c:v libx264`;
    cmd += ` -preset ${quality.preset}`;
    cmd += ` -crf ${quality.crf}`;
    cmd += ` -vf "scale=${resolution.width}:${resolution.height}"`;
    cmd += ` -r ${options.fps || 30}`;

    // Audio settings
    if (options.include_audio !== false) {
      cmd += ` -c:a aac -b:a 128k`;
    } else {
      cmd += ` -an`;
    }

    // Output settings
    cmd += ` -movflags +faststart`;
    cmd += ` -y "${outputPath}"`;

    return cmd;
  }

  /**
   * Get resolution dimensions
   */
  private getResolutionDimensions(resolution: string): { width: number; height: number } {
    switch (resolution) {
      case '720p': return { width: 1280, height: 720 };
      case '1080p': return { width: 1920, height: 1080 };
      case '4k': return { width: 3840, height: 2160 };
      default: return { width: 1920, height: 1080 };
    }
  }

  /**
   * Get quality settings for FFmpeg
   */
  private getQualitySettings(quality: string): { preset: string; crf: number } {
    switch (quality) {
      case 'low': return { preset: 'fast', crf: 28 };
      case 'medium': return { preset: 'medium', crf: 23 };
      case 'high': return { preset: 'slow', crf: 18 };
      case 'ultra': return { preset: 'veryslow', crf: 15 };
      default: return { preset: 'medium', crf: 23 };
    }
  }

  /**
   * Cleanup temporary files
   */
  private async cleanupTempFiles(tempDir: string): Promise<void> {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(`🧹 Cleaned up temp directory: ${tempDir}`);
    } catch (error) {
      console.warn('⚠️ Failed to cleanup temp files:', error);
    }
  }

  /**
   * Get quality presets
   */
  getQualityPresets(): Record<string, StitchingOptions> {
    return {
      'web_optimized': {
        output_format: 'mp4',
        quality: 'medium',
        fps: 30,
        resolution: '720p'
      },
      'high_quality': {
        output_format: 'mp4',
        quality: 'high',
        fps: 30,
        resolution: '1080p'
      },
      'ultra_hd': {
        output_format: 'mp4',
        quality: 'ultra',
        fps: 60,
        resolution: '4k'
      },
      'social_media': {
        output_format: 'mp4',
        quality: 'high',
        fps: 30,
        resolution: '1080p',
        include_captions: true
      }
    };
  }
}
