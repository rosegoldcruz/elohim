/**
 * AEON Admin Storage Management API
 * Handles export file storage, retrieval, and cleanup operations
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { exportStorage } from '@/lib/storage/exportStorage'
import { z } from 'zod'

// Request validation schemas
const CleanupSchema = z.object({
  retentionDays: z.number().min(1).max(365).optional(),
  dryRun: z.boolean().default(false)
})

/**
 * Check if user has admin privileges
 */
async function checkAdminAccess(userId: string): Promise<boolean> {
  const adminUsers = process.env.ADMIN_USER_IDS?.split(',') || []
  return adminUsers.includes(userId)
}

/**
 * GET /api/admin/storage
 * Get storage statistics and configuration
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

    // Get storage statistics
    const stats = await exportStorage.getStorageStats()

    // Get configuration info (without sensitive data)
    const config = {
      provider: process.env.EXPORT_STORAGE_PROVIDER || 'local',
      encryption_enabled: process.env.EXPORT_ENCRYPTION === 'true',
      retention_days: parseInt(process.env.EXPORT_RETENTION_DAYS || '90'),
      s3_configured: !!process.env.AWS_S3_BUCKET,
      local_path: process.env.EXPORT_LOCAL_PATH || './exports'
    }

    return NextResponse.json({
      success: true,
      data: {
        statistics: stats,
        configuration: config,
        health: {
          status: 'healthy',
          last_cleanup: 'Not implemented', // TODO: Track last cleanup
          next_cleanup: 'Scheduled daily'
        }
      }
    })

  } catch (error) {
    console.error('Storage status API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get storage status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/storage
 * Perform storage operations (cleanup, test, etc.)
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
      case 'cleanup':
        return await handleCleanup(actionData, userId)
      
      case 'test_storage':
        return await handleTestStorage(userId)
      
      case 'get_stats':
        return await handleGetStats(userId)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Storage operation API error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to perform storage operation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Handle storage cleanup operation
 */
async function handleCleanup(actionData: any, userId: string) {
  const { retentionDays, dryRun } = CleanupSchema.parse(actionData)

  console.log(`Admin ${userId} initiated storage cleanup (dry run: ${dryRun})`)

  try {
    if (dryRun) {
      // TODO: Implement dry run logic
      return NextResponse.json({
        success: true,
        data: {
          dry_run: true,
          files_to_delete: 0, // Would calculate without actually deleting
          estimated_space_freed: 0,
          initiated_by: userId,
          initiated_at: new Date().toISOString()
        }
      })
    }

    const result = await exportStorage.cleanupExpiredFiles()

    return NextResponse.json({
      success: true,
      data: {
        cleanup_completed: true,
        files_deleted: result.deleted,
        errors_encountered: result.errors,
        initiated_by: userId,
        completed_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Storage cleanup failed:', error)
    return NextResponse.json(
      { 
        error: 'Storage cleanup failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Handle storage test operation
 */
async function handleTestStorage(userId: string) {
  console.log(`Admin ${userId} testing storage configuration`)

  try {
    // Test storage by creating a small test file
    const testData = `AEON Storage Test - ${new Date().toISOString()}`
    const testFilename = `test_${Date.now()}.txt`

    const uploadResult = await exportStorage.storeFile(
      testFilename,
      testData,
      'text/plain'
    )

    if (!uploadResult.success || !uploadResult.file) {
      return NextResponse.json({
        success: false,
        error: 'Storage test failed - upload failed',
        details: uploadResult.error
      }, { status: 500 })
    }

    // Test retrieval
    const downloadResult = await exportStorage.retrieveFile(
      uploadResult.file.id,
      uploadResult.file
    )

    if (!downloadResult.success) {
      return NextResponse.json({
        success: false,
        error: 'Storage test failed - download failed',
        details: downloadResult.error
      }, { status: 500 })
    }

    // Clean up test file
    await exportStorage.deleteFile(uploadResult.file)

    return NextResponse.json({
      success: true,
      data: {
        test_completed: true,
        storage_working: true,
        upload_successful: uploadResult.success,
        download_successful: downloadResult.success,
        file_size: uploadResult.file.size,
        storage_type: uploadResult.file.storage,
        tested_by: userId,
        tested_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Storage test failed:', error)
    return NextResponse.json(
      { 
        error: 'Storage test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * Handle get storage statistics
 */
async function handleGetStats(userId: string) {
  console.log(`Admin ${userId} requesting storage statistics`)

  try {
    const stats = await exportStorage.getStorageStats()

    return NextResponse.json({
      success: true,
      data: {
        statistics: stats,
        requested_by: userId,
        generated_at: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Get storage stats failed:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get storage statistics',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/admin/storage
 * Update storage configuration
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
    const { retention_days, encryption_enabled } = body

    // TODO: Implement configuration updates
    // This would typically update environment variables or a config file
    console.log(`Admin ${userId} updated storage configuration`, {
      retention_days,
      encryption_enabled,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      data: {
        configuration_updated: true,
        updated_by: userId,
        updated_at: new Date().toISOString(),
        note: 'Configuration changes may require server restart'
      }
    })

  } catch (error) {
    console.error('Storage configuration update error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update storage configuration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

/**
 * OPTIONS /api/admin/storage
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
