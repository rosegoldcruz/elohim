/**
 * AEON DeepSeek Script Generation API
 * Endpoint for generating viral TikTok scripts using DeepSeek
 */

import { NextRequest, NextResponse } from 'next/server';
import { DeepSeekScriptScenePipeline, generateCinematicScript } from '@/lib/agents';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      topic, 
      tone = 'engaging', 
      duration = 60, 
      platform = 'tiktok',
      sceneCount,
      streaming = false,
      includeScenePlan = false,
      trendPackage 
    } = body;

    if (!topic && !trendPackage) {
      return NextResponse.json(
        { error: 'Topic or trend package is required' },
        { status: 400 }
      );
    }

    // For streaming responses
    if (streaming) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          try {
            if (includeScenePlan && trendPackage) {
              // Use unified pipeline for script + scene plan
              const pipeline = new DeepSeekScriptScenePipeline();
              
              const result = await pipeline.createTikTokScriptAndScene(
                trendPackage,
                tone,
                (scriptChunk) => {
                  const data = JSON.stringify({ 
                    type: 'script_chunk', 
                    content: scriptChunk 
                  });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                },
                (sceneChunk) => {
                  const data = JSON.stringify({ 
                    type: 'scene_chunk', 
                    content: sceneChunk 
                  });
                  controller.enqueue(encoder.encode(`data: ${data}\n\n`));
                }
              );

              // Send final result
              const finalData = JSON.stringify({ 
                type: 'complete', 
                result 
              });
              controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
              
            } else {
              // Script-only generation
              const script = await generateCinematicScript(topic, tone);

              // Send final result
              const finalData = JSON.stringify({ 
                type: 'complete', 
                script 
              });
              controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
            }

            controller.close();
          } catch (error) {
            const errorData = JSON.stringify({ 
              type: 'error', 
              error: error instanceof Error ? error.message : 'Unknown error' 
            });
            controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }

    // Non-streaming response
    if (includeScenePlan && trendPackage) {
      // Use unified pipeline
      const pipeline = new DeepSeekScriptScenePipeline();
      const result = await pipeline.createTikTokScriptAndScene(trendPackage, tone);
      
      return NextResponse.json({
        success: true,
        data: result,
        model_used: {
          script: 'deepseek-chat',
          scenes: 'gpt-4o'
        }
      });
      
    } else {
      // Script-only generation
      const script = await generateCinematicScript(topic, tone);

      return NextResponse.json({
        success: true,
        data: { script },
        model_used: 'gpt-4o',
        viral_techniques: ['hook', 'storytelling', 'cta'],
        scene_count: script.scenes.length
      });
    }

  } catch (error) {
    console.error('DeepSeek script generation error:', error);
    
    return NextResponse.json(
      { 
        error: 'Script generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AEON DeepSeek Script Generation API',
    version: '1.0.0',
    features: [
      'DeepSeek-powered script generation',
      'Streaming support',
      'Viral TikTok optimization',
      'Unified script + scene pipeline',
      'Real-time chunk delivery'
    ],
    endpoints: {
      POST: {
        description: 'Generate viral TikTok scripts',
        parameters: {
          topic: 'string (required if no trendPackage)',
          trendPackage: 'object (alternative to topic)',
          tone: 'string (default: engaging)',
          duration: 'number (default: 60)',
          platform: 'string (default: tiktok)',
          sceneCount: 'number (optional)',
          streaming: 'boolean (default: false)',
          includeScenePlan: 'boolean (default: false)'
        }
      }
    },
    examples: {
      basic: {
        topic: 'AI video generation',
        tone: 'entertaining',
        duration: 60
      },
      streaming: {
        topic: 'How to go viral on TikTok',
        streaming: true,
        tone: 'educational'
      },
      unified_pipeline: {
        trendPackage: {
          topic: 'AI revolutionizing content',
          hashtags: ['#AI', '#Viral'],
          viral_elements: ['trending audio'],
          target_audience: 'content creators'
        },
        includeScenePlan: true,
        streaming: true
      }
    }
  });
}
