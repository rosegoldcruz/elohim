import { NextRequest, NextResponse } from 'next/server';
import { PreviewRequest, PreviewResponse } from '@/types/video-editor';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { put } from '@vercel/blob';

/**
 * POST /api/editor/preview
 * Generate transition preview between two scenes
 */
export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequest = await request.json();
    const { sceneId1, sceneId2, transitionId, parameters, duration = 0.5 } = body;

    if (!sceneId1 || !sceneId2 || !transitionId) {
      return NextResponse.json(
        { error: 'Scene IDs and transition ID are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch scene data
    const { data: scenes, error: scenesError } = await supabase
      .from('scenes')
      .select('id, video_url, thumbnail_url')
      .in('id', [sceneId1, sceneId2])
      .eq('user_id', user.id);

    if (scenesError || !scenes || scenes.length !== 2) {
      return NextResponse.json(
        { error: 'Failed to fetch scene data' },
        { status: 404 }
      );
    }

    const scene1 = scenes.find(s => s.id === sceneId1);
    const scene2 = scenes.find(s => s.id === sceneId2);

    if (!scene1 || !scene2) {
      return NextResponse.json(
        { error: 'Scenes not found' },
        { status: 404 }
      );
    }

    // Check if preview already exists in cache
    const cacheKey = `preview_${sceneId1}_${sceneId2}_${transitionId}_${JSON.stringify(parameters)}`;
    
    const { data: cachedPreview } = await supabase
      .from('transition_previews')
      .select('preview_url, expires_at')
      .eq('cache_key', cacheKey)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (cachedPreview) {
      return NextResponse.json({
        success: true,
        url: cachedPreview.preview_url,
        duration,
        frames: Math.floor(duration * 30),
        expiresAt: cachedPreview.expires_at,
        cached: true,
      } as PreviewResponse);
    }

    // Generate preview using GPU transition engine
    try {
      const previewResult = await generateTransitionPreview({
        scene1Url: scene1.video_url,
        scene2Url: scene2.video_url,
        transitionId,
        parameters: parameters || {},
        duration,
      });

      // Upload preview to blob storage
      const previewBlob = new Blob([previewResult.videoBuffer], { type: 'video/mp4' });
      const { url: previewUrl } = await put(`previews/${cacheKey}.mp4`, previewBlob, {
        access: 'public',
        addRandomSuffix: false,
      });

      // Cache the preview
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
      
      await supabase
        .from('transition_previews')
        .upsert({
          cache_key: cacheKey,
          preview_url: previewUrl,
          scene1_id: sceneId1,
          scene2_id: sceneId2,
          transition_id: transitionId,
          parameters: parameters || {},
          duration,
          expires_at: expiresAt,
          user_id: user.id,
        });

      return NextResponse.json({
        success: true,
        url: previewUrl,
        duration,
        frames: previewResult.frames,
        expiresAt,
        cached: false,
      } as PreviewResponse);

    } catch (previewError) {
      console.error('Error generating preview:', previewError);
      
      // Fallback: return a simple crossfade preview URL
      const fallbackUrl = `/api/editor/preview/fallback?scene1=${encodeURIComponent(scene1.thumbnail_url)}&scene2=${encodeURIComponent(scene2.thumbnail_url)}&transition=${transitionId}`;
      
      return NextResponse.json({
        success: true,
        url: fallbackUrl,
        duration,
        frames: Math.floor(duration * 30),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour
        cached: false,
        fallback: true,
      } as PreviewResponse);
    }

  } catch (error) {
    console.error('Error in POST /api/editor/preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GPU Transition Engine Integration
 * This would integrate with the existing GPU transition worker
 */
async function generateTransitionPreview({
  scene1Url,
  scene2Url,
  transitionId,
  parameters,
  duration,
}: {
  scene1Url: string;
  scene2Url: string;
  transitionId: string;
  parameters: Record<string, any>;
  duration: number;
}) {
  // This is a placeholder for the actual GPU transition engine integration
  // In the real implementation, this would:
  // 1. Download the video files
  // 2. Extract frames from both videos
  // 3. Apply the transition using GPU shaders
  // 4. Encode the result as MP4
  
  // For now, we'll simulate the process
  const frames = Math.floor(duration * 30); // 30 FPS
  
  // Simulate GPU processing time
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock video buffer (in real implementation, this would be the actual video)
  const mockVideoBuffer = new ArrayBuffer(1024 * 1024); // 1MB mock video
  
  return {
    videoBuffer: mockVideoBuffer,
    frames,
    duration,
    resolution: [1080, 1920] as [number, number],
  };
}

/**
 * DELETE /api/editor/preview
 * Clear preview cache
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cacheKey = searchParams.get('cacheKey');
    const clearAll = searchParams.get('clearAll') === 'true';

    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (clearAll) {
      // Clear all expired previews for the user
      const { error: deleteError } = await supabase
        .from('transition_previews')
        .delete()
        .eq('user_id', user.id)
        .lt('expires_at', new Date().toISOString());

      if (deleteError) {
        console.error('Error clearing preview cache:', deleteError);
        return NextResponse.json(
          { error: 'Failed to clear cache' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Preview cache cleared',
      });
    }

    if (cacheKey) {
      // Clear specific preview
      const { error: deleteError } = await supabase
        .from('transition_previews')
        .delete()
        .eq('cache_key', cacheKey)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting preview:', deleteError);
        return NextResponse.json(
          { error: 'Failed to delete preview' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Preview deleted',
      });
    }

    return NextResponse.json(
      { error: 'Cache key or clearAll parameter required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in DELETE /api/editor/preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
