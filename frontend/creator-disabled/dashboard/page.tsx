/**
 * AEON Creator Dashboard Page
 * Main dashboard for creators to manage earnings and payouts
 */

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CreatorDashboard from '@/components/CreatorDashboard'

export const metadata: Metadata = {
  title: 'Creator Dashboard | AEON',
  description: 'Manage your creator earnings, payouts, and wallet settings',
}

export default async function CreatorDashboardPage() {
  // Check authentication
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect_url=/creator/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        <CreatorDashboard creatorId={user.id} />
      </div>
    </div>
  )
}
