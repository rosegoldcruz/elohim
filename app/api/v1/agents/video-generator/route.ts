// app/api/v1/agents/video-generator/route.ts - Video generation worker
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/database'
import { videoFactory } from '@/lib/providers/video-generation'

export async function POST(request: NextRequest) {
  const { jobId, sceneId, prompt, params } = await request.json()

  try {
    // Update job status
    await db.admin
      .from('agent_jobs')
      .update({ status: 'running', started_at: new Date().toISOString() })
      .eq('id', jobId)

    // Get scene data
    const { data: scene } = await db.admin
      .from('scenes')
      .select('project_id, scene_number, visual_description')
      .eq('id', sceneId)
      .single()

    if (!scene) throw new Error('Scene not found')

    // Generate video with provider fallback
    const { provider, jobId: providerJobId } = await videoFactory.generateWithFallback(
      prompt,
      params,
      ['replicate', 'minimax']
    )

    // Update scene with generation details
    await db.admin
      .from('scenes')
      .update({
        status: 'generating',
        generation_provider: provider,
        generation_params: { providerJobId, ...params }
      })
      .eq('id', sceneId)

    // Complete job
    await db.admin
      .from('agent_jobs')
      .update({
        status: 'completed',
        output_data: { provider, providerJobId },
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)

    return NextResponse.json({ success: true, provider, providerJobId })
  } catch (error) {
    await db.admin
      .from('agent_jobs')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)

    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
