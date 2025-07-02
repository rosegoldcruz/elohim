/**
 * AEON Agent Pipeline API Route
 * Endpoint for running the complete video generation pipeline
 */

import { NextRequest, NextResponse } from 'next/server';
import { AeonPipeline, AgentPresets, AgentUtils } from '@/lib/agents';

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

    // Create pipeline instance
    const pipeline = new AeonPipeline();

    // Prepare request with preset if specified
    let pipelineRequest = {
      topic,
      custom_script,
      duration,
      style,
      platform,
      user_id
    };

    // Apply preset if specified
    if (preset && AgentPresets[preset as keyof typeof AgentPresets]) {
      const presetConfig = AgentPresets[preset as keyof typeof AgentPresets];
      pipelineRequest = {
        ...pipelineRequest,
        duration: duration || presetConfig.duration,
        style: style || presetConfig.style,
        platform: platform || presetConfig.platform
      };
    }

    // Validate configuration
    AgentUtils.validateConfig(pipelineRequest);

    // Run pipeline with progress tracking
    const progressUpdates: any[] = [];
    
    const result = await pipeline.runPipeline(
      pipelineRequest,
      (progress) => {
        progressUpdates.push(progress);
        console.log(`📊 Progress: ${progress.progress}% - ${progress.message}`);
      }
    );

    if (result.success) {
      console.log(`✅ Pipeline completed successfully for user ${user_id}`);
      
      return NextResponse.json({
        success: true,
        video_url: result.video_url,
        thumbnail_url: result.thumbnail_url,
        script: result.script,
        scenes: result.scenes,
        metadata: result.metadata,
        progress_log: progressUpdates
      });
    } else {
      console.error(`❌ Pipeline failed for user ${user_id}:`, result.error);
      
      return NextResponse.json(
        { 
          error: 'Pipeline execution failed',
          details: result.error,
          metadata: result.metadata
        },
        { status: 500 }
      );
    }

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
        // Get agent health status
        const healthStatus = await AgentUtils.checkAgentHealth();
        return NextResponse.json({
          status: 'healthy',
          agents: healthStatus,
          timestamp: new Date().toISOString()
        });

      case 'metrics':
        // Get performance metrics
        const metrics = AgentUtils.getPerformanceMetrics();
        return NextResponse.json({
          metrics,
          timestamp: new Date().toISOString()
        });

      case 'presets':
        // Get available presets
        return NextResponse.json({
          presets: Object.keys(AgentPresets),
          configurations: AgentPresets
        });

      default:
        return NextResponse.json({
          message: 'AEON Agent Pipeline API',
          version: '1.0.0',
          endpoints: {
            'POST /': 'Run video generation pipeline',
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
