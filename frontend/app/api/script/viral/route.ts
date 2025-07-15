import { NextRequest, NextResponse } from "next/server";
import { createVideoScriptPipeline } from "@/lib/agents/pipeline";

interface ViralScriptRequest {
  topic: string;
  style?: string;
  duration?: number;
  sceneCount?: number;
}

export async function POST(req: NextRequest) {
  try {
    console.log('🎬 Viral Script API: Starting request...');
    
    const body: ViralScriptRequest = await req.json();
    const { topic, style = "TikTok/Documentary", duration = 60, sceneCount } = body;

    if (!topic) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    console.log(`🎯 Generating viral script for: "${topic}"`);
    console.log(`📊 Parameters: ${duration}s, ${style} style, ${sceneCount || 'auto'} scenes`);

    // Generate viral TikTok-optimized script and scene plan
    const result = await createVideoScriptPipeline(topic, style, duration, sceneCount);

    console.log(`✅ Viral script generated successfully!`);
    console.log(`📝 Script: ${result.script.scenes.length} scenes`);
    console.log(`🎬 Plan: ${result.plan.scenes.length} planned scenes`);
    console.log(`🎯 Viral techniques: ${result.script.metadata.viralTechniques.join(', ')}`);

    return NextResponse.json({
      success: true,
      script: result.script,
      plan: result.plan,
      summary: {
        topic,
        style,
        duration,
        sceneCount: result.script.scenes.length,
        viralTechniques: result.script.metadata.viralTechniques,
        viralMoments: result.plan.metadata.viralMoments,
        emotionalArc: result.plan.metadata.emotionalArc,
        pacingPattern: result.plan.metadata.pacingPattern
      }
    });

  } catch (error) {
    console.error('❌ Viral Script API error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to generate viral script", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AEON Viral Script Generator API",
    description: "Generate TikTok-optimized viral video scripts with advanced techniques",
    usage: {
      method: "POST",
      endpoint: "/api/script/viral",
      body: {
        topic: "string (required) - The video topic",
        style: "string (optional) - Video style, default: 'TikTok/Documentary'",
        duration: "number (optional) - Video duration in seconds, default: 60",
        sceneCount: "number (optional) - Number of scenes, auto-calculated if not provided"
      }
    },
    features: [
      "TikTok-native viral techniques",
      "Automatic hook generation",
      "Emotional arc planning",
      "Scene timing optimization",
      "Viral moment detection",
      "Production-ready scene plans"
    ]
  });
}
