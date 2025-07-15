/**
 * AEON Admin Dashboard Page
 * Comprehensive platform oversight with revenue analytics and creator management
 */

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminDashboard from '@/components/AdminDashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard | AEON',
  description: 'AEON platform administration and revenue analytics',
}

/**
 * Check if user has admin privileges
 */
async function checkAdminAccess(userId: string): Promise<boolean> {
  // TODO: Implement proper admin role checking with database
  // For now, check environment variable for admin user IDs
  const adminUsers = process.env.ADMIN_USER_IDS?.split(',') || []
  return adminUsers.includes(userId)
}

export default async function AdminDashboardPage() {
  // Check authentication
  const { userId } = auth()
  
  if (!userId) {
    redirect('/sign-in?redirect_url=/admin/dashboard')
  }

  // Check admin access
  const isAdmin = await checkAdminAccess(userId)
  
  if (!isAdmin) {
    redirect('/studio?error=access_denied')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        <AdminDashboard />
      </div>
    </div>
  )
}
