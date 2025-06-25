import { NextRequest, NextResponse } from 'next/server'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { getProjectStatus } from '@/lib/agents/orchestrator'

export async function GET(
  request: NextRequest,
  { params }: { params: { projectId: string } }
) {
  try {
    const { projectId } = params

    if (!projectId) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabaseClient = createServerComponentClient({ cookies })
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get project status
    const result = await getProjectStatus(projectId)

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      )
    }

    // Check if user owns this project
    if (result.project?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      )
    }

    // Format response with creative messaging
    const response = {
      success: true,
      project: {
        id: result.project.id,
        title: result.project.title,
        prompt: result.project.prompt,
        status: result.project.status,
        videoStyle: result.project.video_style,
        creditsUsed: result.project.credits_used,
        createdAt: result.project.created_at,
        completedAt: result.project.completed_at
      },
      progress: {
        ...result.progress,
        message: getProgressMessage(result.progress)
      },
      scenes: result.scenes?.map(scene => ({
        sceneNumber: scene.scene_number,
        status: scene.status,
        modelName: scene.generation_model,
        videoUrl: scene.video_url,
        duration: scene.duration_seconds
      })) || [],
      isComplete: result.isComplete,
      hasFailed: result.hasFailed
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error getting project status:', error)
    return NextResponse.json(
      { error: 'Failed to get project status' },
      { status: 500 }
    )
  }
}

function getProgressMessage(progress: any): string {
  if (progress.percentage === 0) {
    return "🎬 Orchestra Mode activated! 6 AI Directors are analyzing your vision..."
  } else if (progress.percentage < 50) {
    return `🎭 ${progress.completed}/6 Directors have finished their scenes. Magic in progress...`
  } else if (progress.percentage < 100) {
    return `⚡ ${progress.completed}/6 scenes complete! Almost ready for the grand finale...`
  } else {
    return "🎉 All 6 Directors have delivered! Your cinematic masterpiece is ready!"
  }
}
