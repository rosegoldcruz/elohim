import { NextRequest, NextResponse } from 'next/server'
import { startAllWorkers } from '@/lib/agents/orchestrator'

// Global worker instances
let workersStarted = false

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'start' && !workersStarted) {
      startAllWorkers()
      workersStarted = true
      
      return NextResponse.json({
        success: true,
        message: 'AEON video generation workers started',
        timestamp: new Date().toISOString()
      })
    }

    if (action === 'status') {
      return NextResponse.json({
        success: true,
        workersStarted,
        message: workersStarted ? 'Workers are running' : 'Workers not started'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Worker management error:', error)
    return NextResponse.json(
      { error: 'Failed to manage workers' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    workersStarted,
    message: workersStarted ? 'Workers are running' : 'Workers not started',
    timestamp: new Date().toISOString()
  })
}
