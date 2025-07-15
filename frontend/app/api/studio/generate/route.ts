/**
 * AEON Studio Unified Generation API
 * Single endpoint for generating complete video projects (script + video + music)
 */

import { NextRequest, NextResponse } from 'next/server';
import { UnifiedGenerationAgent, type UnifiedGenerationRequest } from '@/lib/agents/UnifiedGenerationAgent';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/env.mjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      user_id,
      project_id,
      creative_prompt,
      style = 'viral',
      platform = 'tiktok',
      duration = 60,
      preferences = {}
    } = body;

    // Validate required fields
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!creative_prompt) {
      return NextResponse.json(
        { error: 'Creative prompt is required' },
        { status: 400 }
      );
    }

    // Validate API keys
    if (!env.OPENAI_API_KEY || !env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "Required API keys not configured" },
        { status: 500 }
      );
    }

    console.log(`🚀 Studio Generation Request from user ${user_id}`);
    console.log(`🎯 Prompt: "${creative_prompt}"`);
    console.log(`🎬 Style: ${style}, Platform: ${platform}, Duration: ${duration}s`);

    // Initialize Supabase client
    const supabase = createClient();

    // Create project record
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id,
        name: `${creative_prompt.substring(0, 50)}...`,
        description: creative_prompt,
        style,
        platform,
        duration,
        status: 'generating',
        preferences,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (projectError) {
      console.error('❌ Failed to create project:', projectError);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    const finalProjectId = project_id || projectData.id;

    // Initialize Unified Generation Agent
    const unifiedAgent = new UnifiedGenerationAgent();

    // Prepare generation request
    const generationRequest: UnifiedGenerationRequest = {
      user_id,
      project_id: finalProjectId,
      creative_prompt,
      style,
      platform,
      duration: Math.min(duration, 120), // Cap at 2 minutes
      preferences
    };

    // Generate complete project
    const result = await unifiedAgent.generateProject(generationRequest);

    // Update project with results
    const updateData: any = {
      status: result.success ? 'completed' : 'failed',
      processing_time: result.total_processing_time,
      cost_estimate: result.total_cost_estimate,
      ready_for_editing: result.ready_for_editing,
      updated_at: new Date().toISOString()
    };

    if (result.error) {
      updateData.error_message = result.error;
    }

    // Store generated assets
    if (result.assets.script?.success) {
      updateData.script_content = result.assets.script.content;
    }

    if (result.assets.video?.success) {
      updateData.video_url = result.assets.video.url;
      updateData.video_scenes = result.assets.video.content;
    }

    if (result.assets.music?.success) {
      updateData.music_url = result.assets.music.url;
      updateData.music_metadata = result.assets.music.content;
    }

    await supabase
      .from('projects')
      .update(updateData)
      .eq('id', finalProjectId);

    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Project generation failed", 
          details: result.error,
          project_id: finalProjectId,
          partial_results: result.assets
        },
        { status: 500 }
      );
    }

    console.log(`✅ Project generated successfully in ${result.total_processing_time}ms`);
    console.log(`💰 Total cost: $${result.total_cost_estimate.toFixed(4)}`);

    return NextResponse.json({
      success: true,
      project_id: finalProjectId,
      assets: {
        script: result.assets.script?.success ? {
          content: result.assets.script.content,
          processing_time: result.assets.script.metadata.processing_time
        } : null,
        video: result.assets.video?.success ? {
          url: result.assets.video.url,
          scenes: result.assets.video.content?.scenes,
          model_used: result.assets.video.metadata.model_used,
          processing_time: result.assets.video.metadata.processing_time
        } : null,
        music: result.assets.music?.success ? {
          url: result.assets.music.url,
          duration: result.assets.music.content?.duration,
          style: result.assets.music.content?.style,
          model_used: result.assets.music.metadata.model_used,
          processing_time: result.assets.music.metadata.processing_time
        } : null
      },
      metrics: {
        total_processing_time: result.total_processing_time,
        total_cost_estimate: result.total_cost_estimate,
        ready_for_editing: result.ready_for_editing
      },
      editor_url: `/studio/editor/${finalProjectId}`,
      message: `🎬 Complete video project generated successfully! Ready for editing in AEON Studio.`
    });

  } catch (error) {
    console.error('❌ Studio generation API error:', error);
    
    return NextResponse.json(
      { 
        error: "Project generation failed", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const user_id = searchParams.get('user_id');

    if (action === 'projects' && user_id) {
      // Get user's projects
      const supabase = createClient();
      
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        projects: projects || []
      });
    }

    if (action === 'project' && searchParams.get('project_id')) {
      // Get specific project
      const project_id = searchParams.get('project_id');
      const supabase = createClient();
      
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project_id)
        .single();

      if (error) {
        throw error;
      }

      return NextResponse.json({
        success: true,
        project
      });
    }

    return NextResponse.json({
      success: true,
      message: "AEON Studio Generation API",
      endpoints: {
        "POST /api/studio/generate": "Generate complete video project from creative prompt",
        "GET /api/studio/generate?action=projects&user_id=xxx": "Get user's projects",
        "GET /api/studio/generate?action=project&project_id=xxx": "Get specific project"
      },
      supported_styles: ['viral', 'cinematic', 'educational', 'entertainment', 'commercial'],
      supported_platforms: ['tiktok', 'reels', 'shorts', 'youtube'],
      version: "1.0.0"
    });

  } catch (error) {
    console.error('❌ Studio API GET error:', error);
    
    return NextResponse.json(
      { 
        error: "API request failed", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const project_id = searchParams.get('project_id');
    const user_id = searchParams.get('user_id');

    if (!project_id || !user_id) {
      return NextResponse.json(
        { error: 'Project ID and User ID are required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Delete project (with RLS, user can only delete their own projects)
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', project_id)
      .eq('user_id', user_id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Project deleted successfully'
    });

  } catch (error) {
    console.error('❌ Studio API DELETE error:', error);
    
    return NextResponse.json(
      { 
        error: "Failed to delete project", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}
