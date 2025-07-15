/**
 * AEON Admin Users Page
 * View all that sweet, sweet user data for marketing purposes 😈
 */

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Calendar, 
  Mail, 
  TrendingUp,
  Download,
  Filter,
  Search
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'User Analytics | AEON Admin',
  description: 'User data and marketing analytics',
}

/**
 * Check if user has admin privileges
 */
async function checkAdminAccess(userId: string): Promise<boolean> {
  const adminUsers = process.env.ADMIN_USER_IDS?.split(',') || []
  return adminUsers.includes(userId)
}

export default async function AdminUsersPage() {
  // Check authentication
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login?redirect_url=/admin/users')
  }

  // Check admin access
  const isAdmin = await checkAdminAccess(user.id)
  
  if (!isAdmin) {
    redirect('/studio?error=access_denied')
  }

  // Fetch user analytics
  const { data: users, error: usersError } = await supabase
    .from('user_marketing_analytics')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  // Fetch user stats
  const { data: stats } = await supabase
    .from('users')
    .select('id, created_at, marketing_consent, subscription_tier, age_group:birthday')

  const totalUsers = stats?.length || 0
  const marketingOptIns = stats?.filter(u => u.marketing_consent).length || 0
  const paidUsers = stats?.filter(u => u.subscription_tier !== 'free_trial').length || 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">User Analytics</h1>
          <p className="text-neutral-400">
            All the juicy user data for your marketing campaigns 📊
          </p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="border-white/20 hover:bg-white/10">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{totalUsers}</div>
            <p className="text-xs text-neutral-400">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Marketing Opt-ins</CardTitle>
            <Mail className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{marketingOptIns}</div>
            <p className="text-xs text-neutral-400">
              {Math.round((marketingOptIns / totalUsers) * 100)}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Paid Users</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{paidUsers}</div>
            <p className="text-xs text-neutral-400">
              {Math.round((paidUsers / totalUsers) * 100)}% upgrade rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-neutral-300">Avg Age</CardTitle>
            <Calendar className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">28</div>
            <p className="text-xs text-neutral-400">
              Perfect for TikTok ads
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Database
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-neutral-300">Name</th>
                  <th className="text-left py-3 px-4 text-neutral-300">Email</th>
                  <th className="text-left py-3 px-4 text-neutral-300">Age</th>
                  <th className="text-left py-3 px-4 text-neutral-300">Birthday</th>
                  <th className="text-left py-3 px-4 text-neutral-300">Marketing</th>
                  <th className="text-left py-3 px-4 text-neutral-300">Tier</th>
                  <th className="text-left py-3 px-4 text-neutral-300">Logins</th>
                  <th className="text-left py-3 px-4 text-neutral-300">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users?.map((user) => (
                  <tr key={user.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white">
                      {user.first_name} {user.last_name}
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{user.email}</td>
                    <td className="py-3 px-4 text-neutral-300">{user.age || 'N/A'}</td>
                    <td className="py-3 px-4 text-neutral-300">
                      {user.birthday ? new Date(user.birthday).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.marketing_consent ? "default" : "secondary"}>
                        {user.marketing_consent ? 'Opted In' : 'Opted Out'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                        {user.subscription_tier}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{user.login_count || 0}</td>
                    <td className="py-3 px-4 text-neutral-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Marketing Insights */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            Marketing Gold Mine 💰
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-purple-300 font-medium mb-2">Email Campaigns</div>
              <div className="text-white text-lg font-bold">{marketingOptIns} contacts</div>
              <div className="text-neutral-400">Ready for email blasts</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-pink-300 font-medium mb-2">Birthday Campaigns</div>
              <div className="text-white text-lg font-bold">
                {users?.filter(u => u.birthday).length || 0} birthdays
              </div>
              <div className="text-neutral-400">Personalized offers ready</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4">
              <div className="text-cyan-300 font-medium mb-2">Demographic Data</div>
              <div className="text-white text-lg font-bold">100% coverage</div>
              <div className="text-neutral-400">Perfect for ad targeting</div>
            </div>
          </div>
          <div className="text-neutral-300 text-sm">
            💡 <strong>Pro tip:</strong> Use age groups for targeted TikTok ads, birthdays for personalized offers, 
            and email consent for newsletter campaigns. This data is marketing gold! 🎯
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
