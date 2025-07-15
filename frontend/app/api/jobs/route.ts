import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const CreateJobSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  style: z.enum(['viral', 'cinematic', 'casual', 'professional']),
  duration: z.number().min(15).max(300),
  transitions: z.array(z.string()).optional(),
  music_style: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = CreateJobSchema.parse(body)

    // Check user credits
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (profileError) {
      return NextResponse.json({ error: 'Failed to get user profile' }, { status: 500 })
    }

    const creditsRequired = Math.ceil(validatedData.duration / 60) * 100 // 100 credits per minute
    if (userProfile.credits < creditsRequired) {
      return NextResponse.json({ 
        error: 'Insufficient credits',
        required: creditsRequired,
        available: userProfile.credits
      }, { status: 400 })
    }

    // Create job
    const { data: job, error: jobError } = await supabase
      .from('agent_jobs')
      .insert({
        user_id: user.id,
        title: validatedData.title,
        description: validatedData.description,
        status: 'created',
        job_type: 'video_generation',
        input_data: {
          style: validatedData.style,
          duration: validatedData.duration,
          transitions: validatedData.transitions || [],
          music_style: validatedData.music_style,
        },
        credits_cost: creditsRequired,
      })
      .select()
      .single()

    if (jobError) {
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    // Deduct credits
    const { error: creditError } = await supabase
      .from('users')
      .update({ credits: userProfile.credits - creditsRequired })
      .eq('id', user.id)

    if (creditError) {
      // Rollback job creation
      await supabase.from('agent_jobs').delete().eq('id', job.id)
      return NextResponse.json({ error: 'Failed to deduct credits' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      job,
      credits_remaining: userProfile.credits - creditsRequired
    })

  } catch (error) {
    console.error('Job creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const { data: jobs, error } = await supabase
      .from('agent_jobs')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
    }

    return NextResponse.json({ jobs })

  } catch (error) {
    console.error('Jobs fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
