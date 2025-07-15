/**
 * AEON Transition Preview API
 * Generates real-time previews for GLSL transitions in Creator Studio
 */

import { NextRequest, NextResponse } from 'next/server';
import { transitionCore } from '@/lib/transitions/core';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { glslCode, name } = await request.json();

    if (!glslCode) {
      return NextResponse.json(
        { success: false, error: 'GLSL code is required' },
        { status: 400 }
      );
    }

    // Validate GLSL code
    const validation = await validateGLSLCode(glslCode);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Generate preview
    const previewResult = await generateTransitionPreview(glslCode, name || 'Preview');
    
    if (!previewResult.success) {
      return NextResponse.json(
        { success: false, error: previewResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      previewUrl: previewResult.previewUrl,
      thumbnailUrl: previewResult.thumbnailUrl,
      processingTime: previewResult.processingTime
    });

  } catch (error) {
    console.error('Preview generation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Validate GLSL code for security and correctness
 */
async function validateGLSLCode(glslCode: string): Promise<{
  isValid: boolean;
  error?: string;
}> {
  // Check for required transition function
  if (!glslCode.includes('vec4 transition(')) {
    return {
      isValid: false,
      error: 'GLSL must contain a transition function: vec4 transition(sampler2D tex1, sampler2D tex2, vec2 uv, float progress)'
    };
  }

  // Check for malicious patterns
  const maliciousPatterns = [
    /while\s*\(\s*true\s*\)/i,
    /for\s*\([^)]*;\s*true\s*;/i,
    /discard/i,
    /#include/i,
    /#define.*\n.*#define/i, // Recursive defines
  ];

  for (const pattern of maliciousPatterns) {
    if (pattern.test(glslCode)) {
      return {
        isValid: false,
        error: 'GLSL contains potentially harmful patterns'
      };
    }
  }

  // Check size limits
  if (glslCode.length > 10000) {
    return {
      isValid: false,
      error: 'GLSL code too large (max 10,000 characters)'
    };
  }

  // Try to compile the shader
  try {
    const testTransitionId = `preview_${Date.now()}`;
    const compilationResult = await transitionCore.compileShader(testTransitionId, glslCode);
    
    if (!compilationResult) {
      return {
        isValid: false,
        error: 'GLSL compilation failed'
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Compilation error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Generate preview video for transition
 */
async function generateTransitionPreview(glslCode: string, name: string): Promise<{
  success: boolean;
  previewUrl?: string;
  thumbnailUrl?: string;
  processingTime?: number;
  error?: string;
}> {
  const startTime = Date.now();

  try {
    // Create sample input textures (would use actual sample videos in production)
    const sampleVideo1 = '/samples/sample-video-1.mp4';
    const sampleVideo2 = '/samples/sample-video-2.mp4';

    // Generate transition preview using GPU engine
    const previewId = `preview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // In production, this would:
    // 1. Load sample videos
    // 2. Apply the GLSL transition
    // 3. Render preview video
    // 4. Upload to storage
    // 5. Generate thumbnail
    
    // For now, simulate the process
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate processing

    const previewUrl = `/api/transitions/preview/${previewId}.mp4`;
    const thumbnailUrl = `/api/transitions/preview/${previewId}_thumb.jpg`;
    const processingTime = Date.now() - startTime;

    return {
      success: true,
      previewUrl,
      thumbnailUrl,
      processingTime
    };

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Preview generation failed'
    };
  }
}

/**
 * GET endpoint for serving preview files
 */
export async function GET(request: NextRequest) {
  try {
    // In production, this would serve actual preview files from storage
    // For now, return a placeholder response

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename parameter is required' },
        { status: 400 }
      );
    }

    if (filename.endsWith('.mp4')) {
      // Serve video preview
      return new NextResponse('Video preview placeholder', {
        headers: {
          'Content-Type': 'video/mp4',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    } else if (filename.endsWith('.jpg')) {
      // Serve thumbnail
      return new NextResponse('Thumbnail placeholder', {
        headers: {
          'Content-Type': 'image/jpeg',
          'Cache-Control': 'public, max-age=3600'
        }
      });
    }

    return NextResponse.json(
      { error: 'File not found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Preview file serving failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
