/**
 * AEON Creator Layout
 * Layout wrapper for creator-related pages
 */

import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Wallet, 
  Settings, 
  BarChart3, 
  Home,
  User,
  LogOut
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Creator Portal | AEON',
  description: 'AEON Creator Portal - Manage your content and earnings',
}

interface CreatorLayoutProps {
  children: React.ReactNode
}

export default async function CreatorLayout({ children }: CreatorLayoutProps) {
  // Check authentication
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect_url=/creator/dashboard')
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/creator/dashboard',
      icon: BarChart3,
      description: 'Overview and analytics'
    },
    {
      name: 'Wallet',
      href: '/creator/wallet',
      icon: Wallet,
      description: 'Earnings and payouts'
    },
    {
      name: 'Settings',
      href: '/creator/settings',
      icon: Settings,
      description: 'Account preferences'
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
              <span className="text-neutral-300 font-medium">Creator Portal</span>
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
                  <User className="h-4 w-4 mr-2" />
                  Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md p-6">
              <h2 className="text-lg font-semibold mb-4 text-white">Creator Menu</h2>
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
                <div className="text-sm text-neutral-400 mb-2">Quick Stats</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Status:</span>
                    <span className="text-green-400">Active</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-300">Tier:</span>
                    <span className="text-purple-400">Creator</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between text-sm text-neutral-400">
            <div>
              © 2024 AEON. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/support" className="hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
