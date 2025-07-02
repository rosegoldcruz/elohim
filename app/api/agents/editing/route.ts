/**
 * AEON EditingAgent API Route
 * Production-grade video editing endpoint using FFmpeg
 */

import { NextRequest, NextResponse } from 'next/server';
import { EditingAgent, type EditingRequest } from '@/lib/agents/editing-agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate required fields
    if (!body.videoClips || !Array.isArray(body.videoClips) || body.videoClips.length === 0) {
      return NextResponse.json(
        { error: 'videoClips array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Build editing request
    const editingRequest: EditingRequest = {
      videoClips: body.videoClips,
      scenePlan: body.scenePlan,
      bgmUrl: body.bgmUrl,
      avatarOverlayUrl: body.avatarOverlayUrl,
      transitions: body.transitions || 'cut',
      fadeInOut: body.fadeInOut || false,
      watermarkText: body.watermarkText,
      addCaptions: body.addCaptions || false,
      aspectRatio: body.aspectRatio || '16:9'
    };

    console.log(`🎬 EditingAgent API: Processing ${editingRequest.videoClips.length} clips`);

    // Create editing agent and process video
    const editingAgent = new EditingAgent();
    const finalVideoUrl = await editingAgent.editVideo(editingRequest);

    console.log(`✅ EditingAgent API: Video processed successfully`);

    return NextResponse.json({
      success: true,
      final_video_url: finalVideoUrl,
      metadata: {
        clips_processed: editingRequest.videoClips.length,
        transitions: editingRequest.transitions,
        aspect_ratio: editingRequest.aspectRatio,
        has_bgm: !!editingRequest.bgmUrl,
        has_avatar: !!editingRequest.avatarOverlayUrl,
        has_captions: editingRequest.addCaptions,
        has_watermark: !!editingRequest.watermarkText
      }
    });

  } catch (error) {
    console.error('❌ EditingAgent API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Video editing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    const editingAgent = new EditingAgent();

    switch (action) {
      case 'capabilities':
        // Get editing capabilities
        const capabilities = editingAgent.getCapabilities();
        return NextResponse.json({
          capabilities,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          message: 'AEON EditingAgent API',
          version: '1.0.0',
          description: 'Production-grade video editing with FFmpeg',
          endpoints: {
            'POST /': 'Process video editing request',
            'GET /?action=capabilities': 'Get editing capabilities'
          },
          features: [
            'Video concatenation with transitions',
            'Background music mixing',
            'Avatar overlays',
            'Text watermarks',
            'Basic captions via drawtext',
            'Fade in/out effects',
            'Multiple aspect ratios (9:16, 1:1, 16:9)',
            'H.264 encoding with fast start'
          ],
          supported_transitions: ['crossfade', 'cut', 'slide'],
          max_clips: 20
        });
    }

  } catch (error) {
    console.error('❌ EditingAgent API GET error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
