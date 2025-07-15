import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: job, error } = await supabase
      .from('agent_jobs')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job })

  } catch (error) {
    console.error('Job fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if job exists and belongs to user
    const { data: job, error: fetchError } = await supabase
      .from('agent_jobs')
      .select('status, credits_cost')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Only allow deletion of jobs that haven't started processing
    if (job.status !== 'created' && job.status !== 'failed') {
      return NextResponse.json({ 
        error: 'Cannot delete job that is processing or completed' 
      }, { status: 400 })
    }

    // Delete the job
    const { error: deleteError } = await supabase
      .from('agent_jobs')
      .delete()
      .eq('id', params.id)
      .eq('user_id', user.id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
    }

    // Refund credits if job was created but not processed
    if (job.status === 'created') {
      const { error: creditError } = await supabase.rpc('add_credits', {
        user_id: user.id,
        amount: job.credits_cost
      })

      if (creditError) {
        console.error('Failed to refund credits:', creditError)
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Job deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
