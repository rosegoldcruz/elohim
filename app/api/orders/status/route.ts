import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const orderId = searchParams.get('order_id')

    if (!sessionId && !orderId) {
      return NextResponse.json(
        { error: 'Session ID or Order ID is required' },
        { status: 400 }
      )
    }

    let query = supabaseAdmin
      .from('orders')
      .select(`
        id,
        email,
        video_prompt,
        video_style,
        status,
        video_url,
        video_duration,
        credits_used,
        created_at,
        updated_at
      `)

    if (sessionId) {
      query = query.eq('stripe_session_id', sessionId)
    } else if (orderId) {
      query = query.eq('id', orderId)
    }

    const { data: order, error } = await query.single()

    if (error) {
      console.error('Error fetching order:', error)
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      )
    }

    // Calculate estimated completion time
    let estimatedCompletion = 'Calculating...'
    if (order.status === 'processing') {
      const createdAt = new Date(order.created_at)
      const estimatedTime = new Date(createdAt.getTime() + 5 * 60 * 1000) // 5 minutes
      estimatedCompletion = estimatedTime.toLocaleTimeString()
    }

    return NextResponse.json({
      order: {
        ...order,
        estimated_completion: estimatedCompletion,
      },
    })
  } catch (error) {
    console.error('Order status error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
