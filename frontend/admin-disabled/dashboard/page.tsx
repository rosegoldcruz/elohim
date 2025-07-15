/**
 * AEON Admin Dashboard Page
 * Comprehensive platform oversight with revenue analytics and creator management
 */

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
// import AdminDashboard from '@/components/AdminDashboard' // Temporarily disabled

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
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user || error) {
    redirect('/login?redirect_url=/admin/dashboard')
  }

  // Check admin access
  const isAdmin = await checkAdminAccess(user.id)

  if (!isAdmin) {
    redirect('/studio?error=access_denied')
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p className="text-gray-400">Admin dashboard temporarily disabled during Supabase migration</p>
        <p className="text-sm text-gray-500 mt-2">Will be restored after deployment</p>
      </div>
    </div>
  )
}
