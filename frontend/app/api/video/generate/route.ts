import { NextRequest, NextResponse } from "next/server";
import { AeonPipeline } from "@/lib/agents/pipeline";
import { createClient } from "@/lib/supabase/server";
import { env } from "@/env.mjs";

interface VideoGenerationRequest {
  topic: string;
  style?: string;
  duration?: number;
  user_id: string;
  project_name?: string;
  custom_script?: string;
}

export async function POST(req: NextRequest) {
  try {
    console.log('🎬 Video Generation API: Starting request...');
    
    const body: VideoGenerationRequest = await req.json();
    const { topic, style = "TikTok/Documentary", duration = 60, user_id, project_name, custom_script } = body;

    // Validate required fields
    if (!topic && !custom_script) {
      return NextResponse.json(
        { error: "Topic or custom script is required" },
        { status: 400 }
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Validate API keys
    if (!env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    if (!env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "Replicate API key not configured" },
        { status: 500 }
      );
    }

    console.log(`🎯 Generating video for user ${user_id}: "${topic || 'Custom Script'}"`);
    console.log(`📊 Parameters: ${duration}s, ${style} style`);

    // Initialize Supabase client
    const supabase = createClient();

    // Create project record
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .insert({
        user_id,
        title: project_name || topic || 'Custom Video',
        description: `AI-generated video: ${topic || 'Custom script'}`,
        style,
        duration,
        status: 'processing',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (projectError) {
      console.error('❌ Failed to create project:', projectError);
      return NextResponse.json(
        { error: "Failed to create project record" },
        { status: 500 }
      );
    }

    console.log(`✅ Created project: ${project.id}`);

    // Initialize pipeline
    const pipeline = new AeonPipeline();

    // Progress callback to update database
    const onProgress = async (stage: string, progress: number, message: string, agent: string) => {
      console.log(`📊 Progress: ${stage} - ${progress}% - ${message} (${agent})`);
      
      await supabase
        .from('projects')
        .update({
          progress: progress,
          current_stage: stage,
          status_message: message,
          current_agent: agent,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id);
    };

    // Execute pipeline
    let result;
    
    if (custom_script) {
      // Use custom script pipeline
      result = await pipeline.executeCustomScript({
        user_id,
        project_id: project.id,
        script: custom_script,
        style,
        duration
      }, onProgress);
    } else {
      // Use full AI pipeline
      result = await pipeline.execute({
        user_id,
        project_id: project.id,
        topic,
        style,
        duration,
        platform: 'tiktok'
      }, onProgress);
    }

    // Update project with final results
    await supabase
      .from('projects')
      .update({
        status: result.success ? 'completed' : 'failed',
        progress: 100,
        video_url: result.video_url,
        file_size: result.file_size,
        processing_time: result.processing_time,
        agents_used: result.agents_used,
        error_message: result.error,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', project.id);

    if (result.success) {
      console.log(`✅ Video generation completed successfully!`);
      console.log(`📹 Video URL: ${result.video_url}`);
      console.log(`⏱️ Processing time: ${result.processing_time}ms`);
      console.log(`🤖 Agents used: ${result.agents_used.join(', ')}`);

      return NextResponse.json({
        success: true,
        project_id: project.id,
        video_url: result.video_url,
        file_size: result.file_size,
        processing_time: result.processing_time,
        agents_used: result.agents_used,
        metadata: {
          topic: topic || 'Custom Script',
          style,
          duration,
          scenes_generated: result.scenes_generated || 0,
          total_duration: result.total_duration || duration
        }
      });
    } else {
      console.error(`❌ Video generation failed: ${result.error}`);
      
      return NextResponse.json({
        success: false,
        project_id: project.id,
        error: result.error,
        processing_time: result.processing_time,
        agents_used: result.agents_used
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Video Generation API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Video generation failed", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AEON Video Generation API",
    description: "Generate complete AI videos using the full agent pipeline",
    usage: {
      method: "POST",
      endpoint: "/api/video/generate",
      body: {
        topic: "string (required if no custom_script) - The video topic",
        custom_script: "string (required if no topic) - Custom script content",
        style: "string (optional) - Video style, default: 'TikTok/Documentary'",
        duration: "number (optional) - Video duration in seconds, default: 60",
        user_id: "string (required) - User identifier",
        project_name: "string (optional) - Custom project name"
      }
    },
    pipeline: [
      "TrendsAgent - Analyze trending topics",
      "ScriptWriterAgent - Generate viral script",
      "ScenePlannerAgent - Plan scene timing",
      "VisualGeneratorAgent - Generate video scenes",
      "StitcherAgent - Combine scenes with FFmpeg",
      "EditorAgent - Final post-processing"
    ],
    requirements: {
      api_keys: ["OPENAI_API_KEY", "REPLICATE_API_TOKEN"],
      database: "Supabase for project tracking",
      storage: "Vercel Blob for video files"
    }
  });
}
