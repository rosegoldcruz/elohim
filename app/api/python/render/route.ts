import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { auth, clerkClient } from '@clerk/nextjs/server';
import path from 'path';
import fs from 'fs/promises';

interface PythonRenderRequest {
  scenes: Array<{
    id: string;
    videoUrl: string;
    name: string;
    duration: number;
  }>;
  voiceoverScript: string;
  options: {
    useGPU: boolean;
    enableBeatSync: boolean;
    viralMode: boolean;
    outputFormat: '1080x1920' | '1080x1080' | '1920x1080';
  };
  projectId: string;
}

interface PythonRenderResponse {
  success: boolean;
  jobId: string;
  outputUrl?: string;
  progress?: number;
  error?: string;
  logs?: string[];
  processingTime?: number;
  stats?: {
    duration: number;
    transitions: number;
    beatSync: boolean;
    gpuAcceleration: boolean;
  };
}

/**
 * POST /api/python/render
 * Trigger Python video rendering pipeline
 */
export async function POST(request: NextRequest) {
  try {
    const body: PythonRenderRequest = await request.json();
    const { scenes, voiceoverScript, options, projectId } = body;

    // Validate request
    if (!scenes || scenes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No scenes provided' },
        { status: 400 }
      );
    }

    if (!voiceoverScript) {
      return NextResponse.json(
        { success: false, error: 'Voiceover script required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate unique job ID
    const jobId = `python_render_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create job record in database
    const { error: jobError } = await supabase
      .from('gpu_render_jobs')
      .insert({
        id: jobId,
        project_id: projectId,
        user_id: user.id,
        job_type: 'python_pipeline',
        status: 'queued',
        render_options: {
          scenes: scenes.length,
          useGPU: options.useGPU,
          enableBeatSync: options.enableBeatSync,
          viralMode: options.viralMode,
          outputFormat: options.outputFormat
        }
      });

    if (jobError) {
      console.error('Error creating job record:', jobError);
      return NextResponse.json(
        { success: false, error: 'Failed to create job' },
        { status: 500 }
      );
    }

    // Start Python processing in background
    processPythonRender(jobId, body, user.id);

    return NextResponse.json({
      success: true,
      jobId,
      message: 'Python rendering job started',
      estimatedTime: scenes.length * 30, // 30 seconds per scene estimate
    } as PythonRenderResponse);

  } catch (error) {
    console.error('Error in POST /api/python/render:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/python/render?jobId=xxx
 * Check Python rendering job status
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Job ID required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get job status
    const { data: job, error: jobError } = await supabase
      .from('gpu_render_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    const response: PythonRenderResponse = {
      success: true,
      jobId: job.id,
      progress: job.progress,
    };

    if (job.status === 'completed') {
      response.outputUrl = job.output_url;
      response.processingTime = job.processing_time_ms;
      response.stats = {
        duration: job.render_options?.duration || 0,
        transitions: job.render_options?.scenes - 1 || 0,
        beatSync: job.render_options?.enableBeatSync || false,
        gpuAcceleration: job.render_options?.useGPU || false,
      };
    } else if (job.status === 'failed') {
      response.error = job.error_message;
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in GET /api/python/render:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Background Python processing function
 */
async function processPythonRender(
  jobId: string, 
  renderRequest: PythonRenderRequest, 
  userId: string
) {
  const supabase = createClient();
  const startTime = Date.now();

  try {
    // Update job status to processing
    await supabase
      .from('gpu_render_jobs')
      .update({ 
        status: 'processing', 
        started_at: new Date().toISOString(),
        progress: 10 
      })
      .eq('id', jobId);

    // Create temporary working directory
    const workDir = path.join(process.cwd(), 'temp', jobId);
    await fs.mkdir(workDir, { recursive: true });
    await fs.mkdir(path.join(workDir, 'scenes'), { recursive: true });
    await fs.mkdir(path.join(workDir, 'voiceover'), { recursive: true });
    await fs.mkdir(path.join(workDir, 'output'), { recursive: true });

    // Download scene videos
    console.log(`📥 Downloading ${renderRequest.scenes.length} scene videos...`);
    for (let i = 0; i < renderRequest.scenes.length; i++) {
      const scene = renderRequest.scenes[i];
      const sceneResponse = await fetch(scene.videoUrl);
      const sceneBuffer = await sceneResponse.arrayBuffer();
      
      await fs.writeFile(
        path.join(workDir, 'scenes', `scene${i + 1}.mp4`),
        Buffer.from(sceneBuffer)
      );
      
      // Update progress
      const progress = 10 + (i / renderRequest.scenes.length) * 30;
      await supabase
        .from('gpu_render_jobs')
        .update({ progress: Math.floor(progress) })
        .eq('id', jobId);
    }

    // Write voiceover script
    await fs.writeFile(
      path.join(workDir, 'voiceover', 'script.txt'),
      renderRequest.voiceoverScript
    );

    // Update progress
    await supabase
      .from('gpu_render_jobs')
      .update({ progress: 50 })
      .eq('id', jobId);

    // Run Python pipeline
    console.log(`🐍 Starting Python pipeline for job ${jobId}...`);
    
    const pythonProcess = spawn('python', [
      path.join(process.cwd(), 'python', 'aeon_pipeline.py')
    ], {
      cwd: workDir,
      env: {
        ...process.env,
        USE_GPU: renderRequest.options.useGPU.toString(),
        ENABLE_BEAT_SYNC: renderRequest.options.enableBeatSync.toString(),
        VIRAL_MODE: renderRequest.options.viralMode.toString(),
      }
    });

    let logs: string[] = [];
    
    pythonProcess.stdout.on('data', (data) => {
      const log = data.toString();
      logs.push(log);
      console.log(`Python: ${log}`);
      
      // Parse progress from Python output
      if (log.includes('Processing scene')) {
        const progress = 50 + (logs.filter(l => l.includes('Processing scene')).length / renderRequest.scenes.length) * 30;
        supabase
          .from('gpu_render_jobs')
          .update({ progress: Math.floor(progress) })
          .eq('id', jobId);
      }
    });

    pythonProcess.stderr.on('data', (data) => {
      const error = data.toString();
      logs.push(`ERROR: ${error}`);
      console.error(`Python Error: ${error}`);
    });

    // Wait for Python process to complete
    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(code);
        } else {
          reject(new Error(`Python process exited with code ${code}`));
        }
      });
    });

    // Upload output video
    const outputPath = path.join(workDir, 'output', 'AEON_6_scene_final.mp4');
    const outputBuffer = await fs.readFile(outputPath);
    
    // Upload to Vercel Blob (or your storage solution)
    const outputUrl = await uploadToStorage(outputBuffer, `${jobId}.mp4`);

    // Update job as completed
    const processingTime = Date.now() - startTime;
    await supabase
      .from('gpu_render_jobs')
      .update({
        status: 'completed',
        progress: 100,
        output_url: outputUrl,
        processing_time_ms: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);

    // Cleanup temporary files
    await fs.rm(workDir, { recursive: true, force: true });

    console.log(`✅ Python render job ${jobId} completed in ${processingTime}ms`);

  } catch (error) {
    console.error(`❌ Python render job ${jobId} failed:`, error);
    
    // Update job as failed
    await supabase
      .from('gpu_render_jobs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId);
  }
}

/**
 * Upload video to storage (placeholder)
 */
async function uploadToStorage(buffer: Buffer, filename: string): Promise<string> {
  // This would integrate with your actual storage solution
  // For now, return a mock URL
  return `/api/videos/${filename}`;
}
