/**
 * AEON Music Generation API Endpoint
 * Handles music generation requests using MusicGeneratorAgent
 */

import { NextRequest, NextResponse } from 'next/server';
// import { MusicGeneratorAgent, type MusicGenerationRequest } from '@/lib/agents/MusicGeneratorAgent';
// import { createClient } from '@/lib/supabase/server';
// import { env } from '@/env.mjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      prompt,
      duration = 30,
      style = 'upbeat',
      user_id,
      project_id,
      model_preference = 'auto',
      tempo,
      key,
      instruments
    } = body;

    // Validate required fields
    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // TODO: Restore MusicGeneratorAgent integration after deployment
    return NextResponse.json(
      {
        error: 'Music generation temporarily disabled during build optimization',
        message: 'MusicGeneratorAgent integration will be restored after deployment',
        requested_prompt: prompt,
        requested_duration: duration,
        requested_style: style
      },
      { status: 503 }
    )
  } catch (error) {
    console.error('Music generation error:', error);

    return NextResponse.json(
      {
        error: 'Music generation failed',
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

    // TODO: Restore MusicGeneratorAgent integration after deployment
    if (action === 'models') {
      return NextResponse.json({
        success: false,
        message: "Music models temporarily unavailable during build optimization"
      });
    }

    if (action === 'estimate') {
      return NextResponse.json({
        success: false,
        message: "Cost estimation temporarily unavailable during build optimization"
      });
    }

    return NextResponse.json({
      success: true,
      message: "AEON Music Generation API (temporarily disabled)",
      status: "maintenance",
      endpoints: {
        "POST /api/music/generate": "Generate music from prompt (disabled)",
        "GET /api/music/generate?action=models": "Get available models (disabled)",
        "GET /api/music/generate?action=estimate": "Estimate cost (disabled)"
      },
      version: "1.0.0"
    });

  } catch (error) {
    console.error('❌ Music API GET error:', error);

    return NextResponse.json(
      {
        error: "API request failed",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
