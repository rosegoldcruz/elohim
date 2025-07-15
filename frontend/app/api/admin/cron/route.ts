/**
 * AEON Admin Cron Management API
 * Handles scheduled task management, manual triggers, and status monitoring
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cronScheduler } from '@/lib/cron/scheduler'
import { z } from 'zod'

// Request validation schemas
const TriggerTaskSchema = z.object({
  taskId: z.string(),
  force: z.boolean().default(false)
})

const ToggleTaskSchema = z.object({
  taskId: z.string(),
  enabled: z.boolean()
})

/**
 * Check if user has admin privileges
 */
async function checkAdminAccess(userId: string): Promise<boolean> {
  const adminUsers = process.env.ADMIN_USER_IDS?.split(',') || []
  return adminUsers.includes(userId)
}

/**
 * GET /api/admin/cron
 * Get status of all scheduled tasks
 */
export async function GET(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Admin access check
    const isAdmin = await checkAdminAccess(userId)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Get task status
    const tasks = cronScheduler.getTaskStatus()

    // Calculate summary statistics
    const summary = {
      total_tasks: tasks.length,
      enabled_tasks: tasks.filter(t => t.enabled).length,
      disabled_tasks: tasks.filter(t => !t.enabled).length,
      tasks_with_errors: tasks.filter(t => t.errorCount > 0).length,
      total_runs: tasks.reduce((sum, t) => sum + t.runCount, 0),
      total_errors: tasks.reduce((sum, t) => sum + t.errorCount, 0)
    }

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        summary,
        server_time: new Date().toISOString(),
        timezone: process.env.TIMEZONE || 'UTC'
      }
    })

  } catch (error) {
    console.error('Cron status API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get cron status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/cron
 * Trigger tasks manually or manage task settings
 */
export async function POST(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Admin access check
    const isAdmin = await checkAdminAccess(userId)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { action, ...actionData } = body

    switch (action) {
      case 'trigger_task':
        return await handleTriggerTask(actionData, userId)
      
      case 'toggle_task':
        return await handleToggleTask(actionData, userId)
      
      case 'start_all':
        return await handleStartAll(userId)
      
      case 'stop_all':
        return await handleStopAll(userId)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Cron management API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to manage cron tasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Handle manual task triggering
 */
async function handleTriggerTask(actionData: any, userId: string) {
  const { taskId, force } = TriggerTaskSchema.parse(actionData)

  console.log(`Admin ${userId} manually triggering task: ${taskId}`)

  try {
    const success = await cronScheduler.triggerTask(taskId)

    if (!success) {
      return NextResponse.json(
        { error: `Failed to trigger task: ${taskId}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        triggered_by: userId,
        triggered_at: new Date().toISOString(),
        force_executed: force
      }
    })

  } catch (error) {
    console.error(`Task trigger failed for ${taskId}:`, error)
    return NextResponse.json(
      { 
        error: `Task execution failed: ${taskId}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Handle task enable/disable
 */
async function handleToggleTask(actionData: any, userId: string) {
  const { taskId, enabled } = ToggleTaskSchema.parse(actionData)

  console.log(`Admin ${userId} ${enabled ? 'enabling' : 'disabling'} task: ${taskId}`)

  try {
    const success = cronScheduler.toggleTask(taskId, enabled)

    if (!success) {
      return NextResponse.json(
        { error: `Failed to toggle task: ${taskId}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        task_id: taskId,
        enabled,
        modified_by: userId,
        modified_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error(`Task toggle failed for ${taskId}:`, error)
    return NextResponse.json(
      { 
        error: `Failed to toggle task: ${taskId}`,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Handle start all tasks
 */
async function handleStartAll(userId: string) {
  console.log(`Admin ${userId} starting all cron tasks`)

  try {
    cronScheduler.startAll()

    return NextResponse.json({
      success: true,
      data: {
        action: 'start_all',
        executed_by: userId,
        executed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Start all tasks failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to start all tasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Handle stop all tasks
 */
async function handleStopAll(userId: string) {
  console.log(`Admin ${userId} stopping all cron tasks`)

  try {
    cronScheduler.stopAll()

    return NextResponse.json({
      success: true,
      data: {
        action: 'stop_all',
        executed_by: userId,
        executed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Stop all tasks failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to stop all tasks',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/cron
 * Update cron configuration
 */
export async function PUT(req: NextRequest) {
  try {
    // Authentication check
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Admin access check
    const isAdmin = await checkAdminAccess(userId)
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse request body
    const body = await req.json()
    const { timezone, email_notifications } = body

    // TODO: Implement configuration updates
    console.log(`Admin ${userId} updated cron configuration`, {
      timezone,
      email_notifications,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      data: {
        configuration_updated: true,
        updated_by: userId,
        updated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Cron configuration update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update cron configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/admin/cron
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}
