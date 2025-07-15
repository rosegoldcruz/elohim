/**
 * AEON Agent Pipeline API Route
 * Endpoint for running the complete video generation pipeline
 */

import { NextRequest, NextResponse } from 'next/server';
// import { AeonPipeline, AgentPresets, AgentUtils } from '@/lib/agents';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic,
      custom_script,
      duration,
      style,
      platform,
      user_id,
      preset
    } = body;

    // Validation
    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      );
    }

    if (!topic && !custom_script) {
      return NextResponse.json(
        { error: 'Either topic or custom_script is required' },
        { status: 400 }
      );
    }

    console.log(`🚀 Pipeline API: Starting video generation for user ${user_id}`);

    // TODO: Implement full pipeline when agents are ready
    // For now, return a placeholder response
    const result = {
      success: false,
      error: 'Pipeline temporarily disabled during build optimization',
      video_url: null,
      thumbnail_url: null,
      script: null,
      scenes: [],
      metadata: {
        total_duration: duration || 60,
        processing_time: 0,
        agents_used: [],
        quality_score: 0,
        file_size: 0
      }
    };

    console.error(`❌ Pipeline temporarily disabled for user ${user_id}:`, result.error);

    return NextResponse.json(
      {
        error: 'Pipeline temporarily disabled',
        details: result.error,
        metadata: result.metadata
      },
      { status: 503 }
    );

  } catch (error) {
    console.error('❌ Pipeline API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
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

    switch (action) {
      case 'health':
        return NextResponse.json({
          status: 'maintenance',
          message: 'Pipeline temporarily disabled during build optimization',
          timestamp: new Date().toISOString()
        });

      case 'metrics':
        return NextResponse.json({
          message: 'Metrics temporarily unavailable',
          timestamp: new Date().toISOString()
        });

      case 'presets':
        return NextResponse.json({
          presets: ['quickVideo', 'educational', 'professional', 'social'],
          message: 'Preset configurations temporarily unavailable'
        });

      default:
        return NextResponse.json({
          message: 'AEON Agent Pipeline API',
          version: '1.0.0',
          status: 'maintenance',
          endpoints: {
            'POST /': 'Run video generation pipeline (temporarily disabled)',
            'GET /?action=health': 'Check agent health',
            'GET /?action=metrics': 'Get performance metrics',
            'GET /?action=presets': 'Get available presets'
          },
          agents: [
            'TrendsAgent',
            'ScriptWriterAgent', 
            'ScenePlannerAgent',
            'StitcherAgent',
            'EditorAgent'
          ]
        });
    }

  } catch (error) {
    console.error('❌ Pipeline API GET error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
