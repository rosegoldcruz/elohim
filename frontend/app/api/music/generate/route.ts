/**
 * AEON Music Generation API Endpoint
 * Handles music generation requests using MusicGeneratorAgent
 */

import { NextRequest, NextResponse } from 'next/server';
import { MusicGeneratorAgent, type MusicGenerationRequest } from '@/lib/agents/MusicGeneratorAgent';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/env.mjs';

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

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate API keys
    if (!env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "Replicate API key not configured" },
        { status: 500 }
      );
    }

    console.log(`🎵 Generating music for user ${user_id}: "${prompt}"`);
    console.log(`🎼 Parameters: ${duration}s, ${style} style, ${model_preference} model`);

    // Initialize Supabase client
    const supabase = createClient();

    // Create music generation record (optional - for tracking)
    let musicRecord = null;
    if (project_id) {
      const { data, error } = await supabase
        .from('music_generations')
        .insert({
          user_id,
          project_id,
          prompt,
          style,
          duration,
          model_preference,
          status: 'processing',
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.warn('⚠️ Failed to create music record:', error);
      } else {
        musicRecord = data;
      }
    }

    // Initialize Music Generator Agent
    const musicAgent = new MusicGeneratorAgent();

    // Prepare generation request
    const musicRequest: MusicGenerationRequest = {
      prompt,
      duration: Math.min(duration, 30), // Cap at 30 seconds for cost control
      style,
      user_id,
      project_id,
      model_preference: model_preference === 'auto' ? undefined : model_preference,
      tempo,
      key,
      instruments
    };

    // Generate music
    const result = await musicAgent.generateMusic(musicRequest);

    // Update database record if created
    if (musicRecord && result.success) {
      await supabase
        .from('music_generations')
        .update({
          status: 'completed',
          audio_url: result.audio_url,
          model_used: result.model_used,
          processing_time: result.processing_time,
          completed_at: new Date().toISOString()
        })
        .eq('id', musicRecord.id);
    } else if (musicRecord && !result.success) {
      await supabase
        .from('music_generations')
        .update({
          status: 'failed',
          error_message: result.error,
          processing_time: result.processing_time,
          completed_at: new Date().toISOString()
        })
        .eq('id', musicRecord.id);
    }

    if (!result.success) {
      return NextResponse.json(
        { 
          error: "Music generation failed", 
          details: result.error 
        },
        { status: 500 }
      );
    }

    console.log(`✅ Music generated successfully in ${result.processing_time}ms`);
    console.log(`🎵 Audio URL: ${result.audio_url}`);

    return NextResponse.json({
      success: true,
      music: {
        audio_url: result.audio_url,
        duration: result.duration,
        style: result.style,
        model_used: result.model_used,
        processing_time: result.processing_time,
        metadata: result.metadata
      },
      generation_id: musicRecord?.id,
      cost_estimate: musicAgent.estimateCost(duration, model_preference),
      message: `🎵 ${style} music generated successfully using ${result.model_used}!`
    });

  } catch (error) {
    console.error('❌ Music generation API error:', error);
    
    return NextResponse.json(
      { 
        error: "Music generation failed", 
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

    const musicAgent = new MusicGeneratorAgent();

    if (action === 'models') {
      // Return available models
      return NextResponse.json({
        success: true,
        models: musicAgent.getAvailableModels(),
        supported_styles: ['upbeat', 'chill', 'dramatic', 'ambient', 'electronic', 'orchestral', 'rock', 'jazz', 'custom']
      });
    }

    if (action === 'estimate') {
      const duration = parseInt(searchParams.get('duration') || '30');
      const model = searchParams.get('model') || 'auto';
      
      return NextResponse.json({
        success: true,
        cost_estimate: musicAgent.estimateCost(duration, model),
        duration,
        model_used: model
      });
    }

    return NextResponse.json({
      success: true,
      message: "AEON Music Generation API",
      endpoints: {
        "POST /api/music/generate": "Generate music from prompt",
        "GET /api/music/generate?action=models": "Get available models",
        "GET /api/music/generate?action=estimate&duration=30&model=musicgen": "Estimate cost"
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
