/**
 * AEON DeepSeek Script Generation API
 * Endpoint for generating viral TikTok scripts using DeepSeek
 */

import { NextRequest, NextResponse } from 'next/server';
// import { DeepSeekScriptScenePipeline, generateCinematicScript } from '@/lib/agents';

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

    // TODO: Implement DeepSeek script generation when agents are ready
    return NextResponse.json(
      {
        error: 'DeepSeek script generation temporarily disabled during build optimization',
        message: 'Agent integration will be restored after deployment',
        requested_topic: topic,
        requested_tone: tone,
        requested_duration: duration,
        requested_platform: platform
      },
      { status: 503 }
    )
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
