import { NextRequest, NextResponse } from "next/server";
import { generateVideoParallel } from "@/lib/agents/ParallelVisualGenerationAgent";
import { getDefaultModelNames, calculateTotalCost } from "../../../../../../shared/config/videoModels";
import { env } from "@/env.mjs";

interface ParallelTestRequest {
  scenePrompts: string[];
  customInputs?: Record<number, any>[];
  modelNames?: string[];
}

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Parallel Video Generation Test: Starting...');
    
    const body: ParallelTestRequest = await req.json();
    const { scenePrompts, customInputs = [], modelNames = getDefaultModelNames() } = body;

    // Validate inputs
    if (!scenePrompts || !Array.isArray(scenePrompts)) {
      return NextResponse.json(
        { error: "scenePrompts array is required" },
        { status: 400 }
      );
    }

    if (scenePrompts.length !== 10) {
      return NextResponse.json(
        { error: "Exactly 10 scene prompts are required for parallel generation" },
        { status: 400 }
      );
    }

    if (modelNames.length !== 5) {
      return NextResponse.json(
        { error: "Exactly 5 model names are required for parallel generation" },
        { status: 400 }
      );
    }

    // Validate API keys
    if (!env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN not configured" },
        { status: 500 }
      );
    }

    console.log(`🎯 Processing ${scenePrompts.length} scenes with ${modelNames.length} models`);
    console.log(`🤖 Models: ${modelNames.join(', ')}`);
    
    // Calculate estimated cost
    const estimatedCost = calculateTotalCost(modelNames, 2);
    console.log(`💰 Estimated cost: $${estimatedCost.toFixed(2)}`);

    // Track progress
    const progressUpdates: any[] = [];
    
    // Execute parallel generation
    const result = await generateVideoParallel(
      scenePrompts,
      5, // 5 agents
      2, // 2 scenes per agent
      modelNames,
      customInputs,
      (progress) => {
        console.log(`📊 Progress: ${progress.stage} - ${progress.completedScenes}/${progress.totalScenes} scenes`);
        progressUpdates.push({
          timestamp: new Date().toISOString(),
          stage: progress.stage,
          completedScenes: progress.completedScenes,
          failedScenes: progress.failedScenes,
          currentAgent: progress.currentAgent,
          agentProgress: progress.agentProgress
        });
      }
    );

    console.log(`✅ Parallel generation completed!`);
    console.log(`📊 Results: ${result.sceneResults.filter(s => s.success).length}/${result.sceneResults.length} scenes successful`);
    console.log(`⏱️ Total processing time: ${result.totalProcessingTime}ms`);
    console.log(`💰 Actual cost: $${result.totalCost.toFixed(2)}`);

    // Prepare response
    const successfulScenes = result.sceneResults.filter(s => s.success);
    const failedScenes = result.sceneResults.filter(s => !s.success);

    return NextResponse.json({
      success: result.success,
      summary: {
        totalScenes: result.sceneResults.length,
        successfulScenes: successfulScenes.length,
        failedScenes: failedScenes.length,
        totalProcessingTime: result.totalProcessingTime,
        actualCost: result.totalCost,
        estimatedCost,
        averageTimePerScene: Math.floor(result.totalProcessingTime / result.sceneResults.length)
      },
      sceneResults: result.sceneResults.map(scene => ({
        sceneIndex: scene.sceneIndex,
        prompt: scene.prompt.substring(0, 100) + '...',
        success: scene.success,
        videoUrl: scene.success ? scene.videoUrl : null,
        agentId: scene.agentId,
        modelUsed: scene.modelUsed,
        processingTime: scene.processingTime,
        error: scene.error
      })),
      agentResults: result.agentResults,
      progressUpdates,
      videoUrls: successfulScenes
        .sort((a, b) => a.sceneIndex - b.sceneIndex)
        .map(scene => scene.videoUrl),
      readyForStitcher: successfulScenes.length >= 8, // Need at least 8/10 scenes for stitching
      error: result.error
    });

  } catch (error) {
    console.error('❌ Parallel generation test failed:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: "Parallel generation test failed", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: "AEON Parallel Video Generation Test API",
    description: "Test parallel generation of 10 video scenes using 5 agents (2 scenes per agent)",
    usage: {
      method: "POST",
      endpoint: "/api/video/parallel-test",
      body: {
        scenePrompts: "string[] (required) - Array of exactly 10 scene prompts",
        customInputs: "Record<number, any>[] (optional) - Custom inputs per scene",
        modelNames: "string[] (optional) - Array of 5 model names, defaults to all available models"
      }
    },
    models: getDefaultModelNames(),
    estimatedCost: calculateTotalCost(getDefaultModelNames(), 2),
    configuration: {
      agents: 5,
      scenesPerAgent: 2,
      totalScenes: 10,
      parallelExecution: true
    },
    example: {
      scenePrompts: [
        "A cinematic shot of a lone astronaut on Mars",
        "Close-up of alien technology glowing in the dark",
        "Wide shot of a futuristic city at sunset",
        "Macro shot of water droplets on a leaf",
        "Time-lapse of clouds moving over mountains",
        "Slow motion shot of a bird taking flight",
        "Underwater scene with colorful fish",
        "Night scene with stars and aurora",
        "Abstract geometric patterns morphing",
        "Final shot of Earth from space"
      ],
      customInputs: [
        { "first_frame_image": "https://example.com/frame1.jpg" },
        { "aspect_ratio": "9:16" },
        {},
        { "duration": 4 },
        {},
        { "cfg_scale": 8.0 },
        {},
        { "negative_prompt": "blurry, low quality" },
        {},
        { "duration": 6 }
      ]
    }
  });
}
