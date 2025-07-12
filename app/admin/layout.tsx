/**
 * AEON Admin Layout
 * Layout wrapper for admin-related pages with navigation and access control
 */

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Users, 
  Settings, 
  Shield,
  Home,
  FileText,
  AlertTriangle,
  Activity,
  LogOut
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Admin Portal | AEON',
  description: 'AEON Admin Portal - Platform management and analytics',
}

interface AdminLayoutProps {
  children: React.ReactNode
}

/**
 * Check if user has admin privileges
 */
async function checkAdminAccess(userId: string): Promise<boolean> {
  const adminUsers = process.env.ADMIN_USER_IDS?.split(',') || []
  return adminUsers.includes(userId)
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  // Check authentication
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect_url=/admin/dashboard')
  }

  // Check admin access
  const isAdmin = await checkAdminAccess(user.id)

  if (!isAdmin) {
    redirect('/studio?error=access_denied')
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: BarChart3,
      description: 'Revenue & analytics overview'
    },
    {
      name: 'Creators',
      href: '/admin/creators',
      icon: Users,
      description: 'Creator management & analytics'
    },
    {
      name: 'Transactions',
      href: '/admin/transactions',
      icon: Activity,
      description: 'Transaction monitoring'
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: FileText,
      description: 'Export & reporting tools'
    },
    {
      name: 'Security',
      href: '/admin/security',
      icon: Shield,
      description: 'Fraud detection & alerts'
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      description: 'Platform configuration'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
                  AEON
                </span>
              </Link>
              <div className="h-6 w-px bg-white/20" />
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-400" />
                <span className="text-neutral-300 font-medium">Admin Portal</span>
                <Badge variant="destructive" className="text-xs">
                  RESTRICTED
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/studio">
                <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                  <Home className="h-4 w-4 mr-2" />
                  Studio
                </Button>
              </Link>
              <Link href="/account">
                <Button variant="outline" size="sm" className="border-white/20 hover:bg-white/10">
                  <LogOut className="h-4 w-4 mr-2" />
                  Exit Admin
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md p-6">
              <h2 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-400" />
                Admin Menu
              </h2>
              <nav className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors group"
                    >
                      <Icon className="h-5 w-5 text-neutral-400 group-hover:text-white" />
                      <div>
                        <div className="font-medium text-white group-hover:text-purple-300">
                          {item.name}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </nav>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="text-sm text-neutral-400 mb-2">System Status</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Platform:</span>
                    <span className="text-green-400">Online</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Database:</span>
                    <span className="text-green-400">Connected</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Alerts:</span>
                    <span className="text-yellow-400">2 Active</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-1">
                  <AlertTriangle className="h-4 w-4" />
                  Security Notice
                </div>
                <div className="text-xs text-red-300">
                  Admin access is logged and monitored. Use responsibly.
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-4">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-red-400" />
              <span>AEON Admin Portal - Restricted Access</span>
            </div>
            <div className="flex items-center gap-6">
              <span>Admin ID: {user.id?.slice(0, 8)}...</span>
              <span>Session: Active</span>
              <Link href="/admin/logs" className="hover:text-white transition-colors">
                View Logs
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
