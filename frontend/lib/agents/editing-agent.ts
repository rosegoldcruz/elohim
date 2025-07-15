/**
 * AEON EditingAgent - Production-grade video editing with FFmpeg
 * Built for Next.js 14 with TypeScript, Node.js child_process only
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { put } from '@vercel/blob';

const execAsync = promisify(exec);

export interface EditingRequest {
  videoClips: string[];
  scenePlan?: any;
  bgmUrl?: string;
  avatarOverlayUrl?: string;
  transitions: 'crossfade' | 'cut' | 'slide';
  fadeInOut: boolean;
  watermarkText?: string;
  addCaptions?: boolean;
  aspectRatio?: '9:16' | '1:1' | '16:9';
}

export interface EditingResult {
  success: boolean;
  final_video_url: string;
  thumbnail_url?: string;
  metadata: {
    duration: number;
    file_size: number;
    resolution: string;
    fps: number;
    has_captions: boolean;
    has_bgm: boolean;
    has_avatar: boolean;
    processing_time: number;
    clips_processed: number;
  };
  error?: string;
}

interface AspectRatioConfig {
  width: number;
  height: number;
  scale: string;
}

export class EditingAgent {
  private readonly tempDir = './temp/editing';
  private readonly aspectRatioConfigs: Record<string, AspectRatioConfig> = {
    '9:16': { width: 1080, height: 1920, scale: '1080:1920' },
    '1:1': { width: 1080, height: 1080, scale: '1080:1080' },
    '16:9': { width: 1920, height: 1080, scale: '1920:1080' }
  };

  /**
   * Main editing function - processes complete editing request
   */
  async editVideo(request: EditingRequest): Promise<string> {
    console.log('🎬 AEON EditingAgent: Starting production pipeline...');
    
    const startTime = Date.now();
    
    try {
      // Validate request
      this.validateRequest(request);
      
      // Setup temp directory
      await this.setupTempDirectory();
      
      // Download all remote files
      const localClips = await this.downloadClips(request.videoClips);
      let bgmPath = '';
      let avatarPath = '';
      
      if (request.bgmUrl) {
        bgmPath = await this.downloadFile(request.bgmUrl, 'bgm.mp3');
      }
      
      if (request.avatarOverlayUrl) {
        avatarPath = await this.downloadFile(request.avatarOverlayUrl, 'avatar.png');
      }
      
      // Build and execute FFmpeg command
      const outputPath = await this.processVideo(request, localClips, bgmPath, avatarPath);
      
      // Upload to Vercel Blob
      const finalUrl = await this.uploadResult(outputPath);
      
      // Cleanup temp files
      await this.cleanup();
      
      const processingTime = Date.now() - startTime;
      console.log(`✅ EditingAgent: Video processed successfully in ${processingTime}ms`);
      
      return finalUrl;
      
    } catch (error) {
      console.error('❌ EditingAgent error:', error);
      throw new Error(`Video editing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate editing request
   */
  private validateRequest(request: EditingRequest): void {
    if (!request.videoClips || request.videoClips.length === 0) {
      throw new Error('At least one video clip is required');
    }
    
    if (request.videoClips.length > 20) {
      throw new Error('Maximum 20 video clips allowed');
    }
    
    if (!['crossfade', 'cut', 'slide'].includes(request.transitions)) {
      throw new Error('Invalid transition type');
    }
    
    if (request.aspectRatio && !['9:16', '1:1', '16:9'].includes(request.aspectRatio)) {
      throw new Error('Invalid aspect ratio');
    }
  }

  /**
   * Setup temporary directory
   */
  private async setupTempDirectory(): Promise<void> {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
      console.log(`📁 Created temp directory: ${this.tempDir}`);
    } catch (error) {
      throw new Error(`Failed to create temp directory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Download video clips
   */
  private async downloadClips(urls: string[]): Promise<string[]> {
    console.log(`📥 Downloading ${urls.length} video clips...`);
    
    const localClips: string[] = [];
    
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      const filename = `clip_${i}.mp4`;
      const localPath = await this.downloadFile(url, filename);
      localClips.push(localPath);
    }
    
    console.log(`✅ Downloaded all clips successfully`);
    return localClips;
  }

  /**
   * Download file from URL with validation
   */
  private async downloadFile(url: string, filename: string): Promise<string> {
    const localPath = path.join(this.tempDir, filename);
    
    try {
      console.log(`📥 Downloading: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const buffer = await response.arrayBuffer();
      await fs.writeFile(localPath, Buffer.from(buffer));
      
      // Verify file was written
      const stats = await fs.stat(localPath);
      if (stats.size === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      console.log(`✅ Downloaded: ${filename} (${stats.size} bytes)`);
      return localPath;
      
    } catch (error) {
      console.error(`❌ Download failed for ${url}:`, error);
      throw new Error(`Failed to download ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Process video with FFmpeg
   */
  private async processVideo(
    request: EditingRequest,
    localClips: string[],
    bgmPath: string,
    avatarPath: string
  ): Promise<string> {
    console.log('🎬 Building FFmpeg command...');
    
    const outputPath = path.join(this.tempDir, `aeon_final_${Date.now()}.mp4`);
    const aspectConfig = this.aspectRatioConfigs[request.aspectRatio || '16:9'];
    
    // Build filter complex
    const filterComplex = this.buildFilterComplex(request, localClips, !!bgmPath, !!avatarPath, aspectConfig);
    
    // Build input arguments
    const inputs: string[] = [];
    localClips.forEach(clip => {
      inputs.push(`-i "${clip}"`);
    });
    
    if (bgmPath) {
      inputs.push(`-i "${bgmPath}"`);
    }
    
    if (avatarPath) {
      inputs.push(`-i "${avatarPath}"`);
    }
    
    // Build complete FFmpeg command
    const command = [
      'ffmpeg',
      ...inputs,
      '-filter_complex', `"${filterComplex}"`,
      '-map "[vout]"',
      '-map "[aout]"',
      '-c:v libx264',
      '-pix_fmt yuv420p',
      '-r 30',
      `-s ${aspectConfig.width}x${aspectConfig.height}`,
      '-c:a aac',
      '-b:a 128k',
      '-shortest',
      '-movflags +faststart',
      '-y',
      `"${outputPath}"`
    ].join(' ');
    
    console.log('🚀 Executing FFmpeg command...');
    console.log(`Command preview: ${command.substring(0, 200)}...`);
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      
      if (stderr) {
        console.log('FFmpeg stderr:', stderr.substring(0, 500));
      }
      
      // Verify output file exists and has content
      const stats = await fs.stat(outputPath);
      if (stats.size === 0) {
        throw new Error('Output video file is empty');
      }
      
      console.log(`✅ Video processed successfully: ${stats.size} bytes`);
      return outputPath;
      
    } catch (error) {
      console.error('❌ FFmpeg execution failed:', error);
      throw new Error(`Video processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Build complex FFmpeg filter chain dynamically
   */
  private buildFilterComplex(
    request: EditingRequest,
    localClips: string[],
    hasBGM: boolean,
    hasAvatar: boolean,
    aspectConfig: AspectRatioConfig
  ): string {
    const filters: string[] = [];
    const clipCount = localClips.length;

    // Step 1: Scale clips to aspect ratio and add fade effects
    for (let i = 0; i < clipCount; i++) {
      let videoFilter = `[${i}:v]scale=${aspectConfig.scale},setsar=1`;

      // Add fade in/out if requested
      if (request.fadeInOut) {
        if (i === 0) {
          videoFilter += ',fade=t=in:st=0:d=0.5';
        }
        if (i === clipCount - 1) {
          videoFilter += ',fade=t=out:st=4.5:d=0.5'; // Assuming 5s clips
        }
      }

      filters.push(`${videoFilter}[v${i}]`);
    }

    // Step 2: Apply transitions between clips
    let lastVideoLabel = this.buildTransitions(request, clipCount, filters);

    // Step 3: Add captions if requested
    if (request.addCaptions) {
      const captionText = this.buildCaptionText(request.scenePlan);
      filters.push(`[${lastVideoLabel}]drawtext=text='${captionText}':fontsize=40:fontcolor=white:x=(w-tw)/2:y=h-th-50:box=1:boxcolor=black@0.5:boxborderw=5[vcaptions]`);
      lastVideoLabel = 'vcaptions';
    }

    // Step 4: Add watermark if requested
    if (request.watermarkText) {
      const escapedText = request.watermarkText.replace(/'/g, "\\'");
      filters.push(`[${lastVideoLabel}]drawtext=text='${escapedText}':fontsize=30:fontcolor=white:x=w-tw-20:y=20:box=1:boxcolor=black@0.7:boxborderw=3[vwatermark]`);
      lastVideoLabel = 'vwatermark';
    }

    // Step 5: Add avatar overlay if provided
    if (hasAvatar) {
      const avatarIndex = clipCount + (hasBGM ? 1 : 0);
      filters.push(`[${lastVideoLabel}][${avatarIndex}:v]overlay=W-w-30:30[vout]`);
    } else {
      filters.push(`[${lastVideoLabel}]copy[vout]`);
    }

    // Step 6: Build audio mix
    this.buildAudioMix(clipCount, hasBGM, filters);

    return filters.join(';');
  }

  /**
   * Build transition effects between clips
   */
  private buildTransitions(request: EditingRequest, clipCount: number, filters: string[]): string {
    if (clipCount === 1) {
      return 'v0';
    }

    let lastLabel = 'v0';

    for (let i = 1; i < clipCount; i++) {
      const nextLabel = `v${i}`;
      const outputLabel = i === clipCount - 1 ? 'vtransitions' : `vt${i}`;

      switch (request.transitions) {
        case 'crossfade':
          filters.push(`[${lastLabel}][${nextLabel}]xfade=transition=fade:duration=0.5:offset=${i * 5}[${outputLabel}]`);
          break;
        case 'slide':
          filters.push(`[${lastLabel}][${nextLabel}]xfade=transition=slideright:duration=0.3:offset=${i * 5}[${outputLabel}]`);
          break;
        case 'cut':
        default:
          // For cut transitions, concatenate without overlap
          if (i === 1) {
            filters.push(`[${lastLabel}][${nextLabel}]concat=n=2:v=1:a=0[${outputLabel}]`);
          } else {
            filters.push(`[${lastLabel}][${nextLabel}]concat=n=2:v=1:a=0[${outputLabel}]`);
          }
          break;
      }

      lastLabel = outputLabel;
    }

    return lastLabel;
  }

  /**
   * Build audio mixing filters
   */
  private buildAudioMix(clipCount: number, hasBGM: boolean, filters: string[]): void {
    const audioInputs: string[] = [];

    // Collect audio from video clips
    for (let i = 0; i < clipCount; i++) {
      audioInputs.push(`[${i}:a]`);
    }

    if (hasBGM) {
      const bgmIndex = clipCount;
      if (audioInputs.length > 0) {
        // Mix video audio with BGM - video at 80%, BGM at 30%
        const videoAudioMix = audioInputs.join('');
        filters.push(`${videoAudioMix}amix=inputs=${audioInputs.length}:duration=shortest[videomix]`);
        filters.push(`[videomix][${bgmIndex}:a]amix=inputs=2:weights=0.8 0.3:duration=shortest[aout]`);
      } else {
        // Only BGM
        filters.push(`[${bgmIndex}:a]copy[aout]`);
      }
    } else {
      // Only video audio
      if (audioInputs.length > 1) {
        const videoAudioMix = audioInputs.join('');
        filters.push(`${videoAudioMix}amix=inputs=${audioInputs.length}:duration=shortest[aout]`);
      } else if (audioInputs.length === 1) {
        filters.push(`[0:a]copy[aout]`);
      } else {
        // No audio - create silent track
        filters.push(`anullsrc=channel_layout=stereo:sample_rate=48000[aout]`);
      }
    }
  }

  /**
   * Build caption text from scene plan
   */
  private buildCaptionText(scenePlan?: any): string {
    if (scenePlan && scenePlan.scenes && scenePlan.scenes.length > 0) {
      // Use first scene narration as caption, escape special characters
      const text = scenePlan.scenes[0].narration || 'AEON Generated Video';
      return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
    }
    return 'AEON Generated Video';
  }

  /**
   * Upload result to Vercel Blob
   */
  private async uploadResult(outputPath: string): Promise<string> {
    console.log('📤 Uploading final video to Vercel Blob...');

    try {
      const videoBuffer = await fs.readFile(outputPath);
      const filename = `aeon-final-${Date.now()}.mp4`;

      const blob = await put(filename, videoBuffer, {
        access: 'public',
        contentType: 'video/mp4'
      });

      console.log(`✅ Video uploaded: ${blob.url}`);
      return blob.url;

    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw new Error(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Cleanup temporary files
   */
  private async cleanup(): Promise<void> {
    try {
      console.log('🧹 Cleaning up temporary files...');

      const files = await fs.readdir(this.tempDir);
      for (const file of files) {
        const filePath = path.join(this.tempDir, file);
        await fs.unlink(filePath);
      }

      console.log('✅ Cleanup completed');
    } catch (error) {
      console.error('⚠️ Cleanup failed:', error);
      // Don't throw - cleanup failure shouldn't break the main process
    }
  }

  /**
   * Get supported capabilities
   */
  getCapabilities(): {
    maxClips: number;
    supportedTransitions: string[];
    supportedAspectRatios: string[];
    features: string[];
  } {
    return {
      maxClips: 20,
      supportedTransitions: ['crossfade', 'cut', 'slide'],
      supportedAspectRatios: Object.keys(this.aspectRatioConfigs),
      features: [
        'Video concatenation with transitions',
        'Background music mixing',
        'Avatar overlays',
        'Text watermarks',
        'Basic captions via drawtext',
        'Fade in/out effects',
        'Multiple aspect ratios',
        'H.264 encoding with fast start'
      ]
    };
  }
}
