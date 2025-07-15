import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { Scene, BeatMarker } from '@/types/video-editor';

/**
 * GET /api/editor/scenes
 * List all scenes for the current user's project
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    
    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
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

    // Fetch scenes from database
    const { data: scenes, error: scenesError } = await supabase
      .from('scenes')
      .select(`
        id,
        name,
        duration,
        thumbnail_url,
        video_url,
        beat_markers,
        metadata,
        created_at
      `)
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });

    if (scenesError) {
      console.error('Error fetching scenes:', scenesError);
      return NextResponse.json(
        { error: 'Failed to fetch scenes' },
        { status: 500 }
      );
    }

    // Transform database records to Scene objects
    const transformedScenes: Scene[] = scenes?.map(scene => ({
      id: scene.id,
      name: scene.name,
      duration: scene.duration,
      thumbnail: scene.thumbnail_url,
      videoUrl: scene.video_url,
      beatMarkers: scene.beat_markers || [],
      metadata: {
        resolution: scene.metadata?.resolution || '1080x1920',
        fps: scene.metadata?.fps || 30,
        fileSize: scene.metadata?.file_size || 0,
        createdAt: scene.created_at,
      },
    })) || [];

    return NextResponse.json({
      success: true,
      scenes: transformedScenes,
      count: transformedScenes.length,
    });

  } catch (error) {
    console.error('Error in GET /api/editor/scenes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/editor/scenes
 * Create a new scene or update scene order
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, projectId, sceneData, sceneOrder } = body;

    const supabase = createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (action === 'reorder') {
      // Update scene order
      if (!sceneOrder || !Array.isArray(sceneOrder)) {
        return NextResponse.json(
          { error: 'Scene order array is required' },
          { status: 400 }
        );
      }

      // Update each scene's order in the database
      const updatePromises = sceneOrder.map((sceneId: string, index: number) =>
        supabase
          .from('scenes')
          .update({ order_index: index })
          .eq('id', sceneId)
          .eq('user_id', user.id)
      );

      await Promise.all(updatePromises);

      return NextResponse.json({
        success: true,
        message: 'Scene order updated successfully',
      });
    }

    if (action === 'create') {
      // Create new scene
      if (!sceneData || !projectId) {
        return NextResponse.json(
          { error: 'Scene data and project ID are required' },
          { status: 400 }
        );
      }

      const { data: newScene, error: createError } = await supabase
        .from('scenes')
        .insert({
          project_id: projectId,
          user_id: user.id,
          name: sceneData.name,
          duration: sceneData.duration,
          thumbnail_url: sceneData.thumbnail,
          video_url: sceneData.videoUrl,
          beat_markers: sceneData.beatMarkers || [],
          metadata: sceneData.metadata,
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating scene:', createError);
        return NextResponse.json(
          { error: 'Failed to create scene' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        scene: {
          id: newScene.id,
          name: newScene.name,
          duration: newScene.duration,
          thumbnail: newScene.thumbnail_url,
          videoUrl: newScene.video_url,
          beatMarkers: newScene.beat_markers || [],
          metadata: newScene.metadata,
        },
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in POST /api/editor/scenes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/editor/scenes/[id]
 * Delete a scene
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sceneId = searchParams.get('id');
    
    if (!sceneId) {
      return NextResponse.json(
        { error: 'Scene ID is required' },
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

    // Delete scene
    const { error: deleteError } = await supabase
      .from('scenes')
      .delete()
      .eq('id', sceneId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting scene:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete scene' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scene deleted successfully',
    });

  } catch (error) {
    console.error('Error in DELETE /api/editor/scenes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
