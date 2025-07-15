import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('session_id')
    const orderId = searchParams.get('order_id')

    if (!sessionId && !orderId) {
      return NextResponse.json(
        { error: 'Session ID or Order ID is required' },
        { status: 400 }
      )
    }

    // Since Supabase database was removed, orders are now stored in Clerk user metadata
    // This is a temporary solution - you should implement a proper database
    const user = await clerkClient.users.getUser(userId)
    const orders = user.publicMetadata?.orders as any[] || []

    let order = null
    if (sessionId) {
      order = orders.find(o => o.stripe_session_id === sessionId)
    } else if (orderId) {
      order = orders.find(o => o.id === orderId)
    }

    if (!order) {
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
