import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * GET /api/system/check-nvenc
 * Check if NVIDIA NVENC GPU encoding is available
 */
export async function GET(request: NextRequest) {
  try {
    // Check if FFmpeg has NVENC support
    const { stdout, stderr } = await execAsync('ffmpeg -encoders 2>/dev/null | grep nvenc || echo "not_found"');
    
    const hasNVENC = stdout.includes('h264_nvenc') || stdout.includes('hevc_nvenc');
    
    let gpuInfo = null;
    let cudaVersion = null;
    
    if (hasNVENC) {
      try {
        // Get GPU information
        const { stdout: gpuOutput } = await execAsync('nvidia-smi --query-gpu=name,memory.total,driver_version --format=csv,noheader,nounits 2>/dev/null || echo "gpu_info_unavailable"');
        
        if (!gpuOutput.includes('gpu_info_unavailable')) {
          const [name, memory, driver] = gpuOutput.trim().split(', ');
          gpuInfo = {
            name: name.trim(),
            memory: parseInt(memory),
            driver: driver.trim()
          };
        }
        
        // Get CUDA version
        const { stdout: cudaOutput } = await execAsync('nvcc --version 2>/dev/null | grep "release" || echo "cuda_unavailable"');
        if (!cudaOutput.includes('cuda_unavailable')) {
          const match = cudaOutput.match(/release (\d+\.\d+)/);
          cudaVersion = match ? match[1] : null;
        }
      } catch (error) {
        console.warn('Could not get detailed GPU info:', error);
      }
    }

    // Performance recommendations based on GPU
    const recommendations = getPerformanceRecommendations(gpuInfo);

    return NextResponse.json({
      supported: hasNVENC,
      ffmpegOutput: stdout.trim(),
      gpu: gpuInfo,
      cudaVersion,
      recommendations,
      encoders: hasNVENC ? {
        h264_nvenc: stdout.includes('h264_nvenc'),
        hevc_nvenc: stdout.includes('hevc_nvenc'),
        av1_nvenc: stdout.includes('av1_nvenc')
      } : null,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error checking NVENC support:', error);
    
    return NextResponse.json({
      supported: false,
      error: 'Failed to check NVENC support',
      fallback: 'CPU encoding (libx264) will be used',
      recommendations: {
        encoding: 'Use CPU encoding with optimized presets',
        quality: 'Consider lower resolution for faster processing',
        concurrent: 'Limit concurrent jobs to 1-2 for CPU encoding'
      }
    });
  }
}

/**
 * Get performance recommendations based on GPU capabilities
 */
function getPerformanceRecommendations(gpuInfo: any) {
  if (!gpuInfo) {
    return {
      encoding: 'CPU fallback recommended',
      quality: 'Use medium preset for balanced speed/quality',
      concurrent: 'Limit to 1-2 concurrent jobs',
      memory: 'Monitor system RAM usage'
    };
  }

  const memory = gpuInfo.memory;
  const isHighEnd = memory >= 8000; // 8GB+
  const isMidRange = memory >= 4000; // 4GB+

  if (isHighEnd) {
    return {
      encoding: 'GPU encoding optimal - use h264_nvenc with fast preset',
      quality: 'Can handle high quality (CRF 18-23) at full resolution',
      concurrent: 'Support 3-4 concurrent jobs',
      memory: `${memory}MB VRAM available - excellent for 4K processing`,
      settings: {
        preset: 'fast',
        crf: 20,
        maxConcurrent: 4,
        resolution: '4K supported'
      }
    };
  } else if (isMidRange) {
    return {
      encoding: 'GPU encoding good - use h264_nvenc with medium preset',
      quality: 'Recommended CRF 23-28 for 1080p content',
      concurrent: 'Support 2-3 concurrent jobs',
      memory: `${memory}MB VRAM - good for 1080p processing`,
      settings: {
        preset: 'medium',
        crf: 25,
        maxConcurrent: 3,
        resolution: '1080p optimal'
      }
    };
  } else {
    return {
      encoding: 'Limited GPU encoding - consider CPU fallback for complex scenes',
      quality: 'Use higher CRF (28-32) or lower resolution',
      concurrent: 'Limit to 1-2 concurrent jobs',
      memory: `${memory}MB VRAM - suitable for 720p processing`,
      settings: {
        preset: 'fast',
        crf: 30,
        maxConcurrent: 2,
        resolution: '720p recommended'
      }
    };
  }
}

/**
 * POST /api/system/check-nvenc
 * Test NVENC encoding with a sample
 */
export async function POST(request: NextRequest) {
  try {
    const { testDuration = 1 } = await request.json();
    
    // Create a test video and encode it with NVENC
    const testCommand = `ffmpeg -f lavfi -i testsrc=duration=${testDuration}:size=1920x1080:rate=30 -c:v h264_nvenc -preset fast -crf 23 -f null - 2>&1`;
    
    const startTime = Date.now();
    const { stdout, stderr } = await execAsync(testCommand);
    const processingTime = Date.now() - startTime;
    
    // Parse FFmpeg output for performance metrics
    const fpsMatch = stderr.match(/fps=\s*(\d+\.?\d*)/);
    const speedMatch = stderr.match(/speed=\s*(\d+\.?\d*)x/);
    
    return NextResponse.json({
      success: true,
      processingTime,
      fps: fpsMatch ? parseFloat(fpsMatch[1]) : null,
      speed: speedMatch ? parseFloat(speedMatch[1]) : null,
      output: stderr,
      recommendation: processingTime < 2000 ? 'GPU encoding optimal' : 'Consider CPU fallback'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Test encoding failed',
      recommendation: 'Use CPU encoding (libx264) as fallback'
    }, { status: 500 });
  }
}
