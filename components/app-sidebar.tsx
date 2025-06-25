"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import {
  Network,
  Video,
  Image,
  Music,
  TrendingUp,
  BarChart3,
  CreditCard,
  User,
  Rocket,
  Gem,
  LogOut
} from 'lucide-react'

const navigationItems = [
  {
    title: "Creator Tools",
    items: [
      { title: "Video Studio", url: "/studio", icon: Video },
      { title: "Image Creator", url: "/image", icon: Image },
      { title: "Audio Studio", url: "/audio", icon: Music },
    ]
  },
  {
    title: "Business Tools",
    items: [
      { title: "AI Agents", url: "/agents", icon: Network },
      { title: "Growth Engine", url: "/growth", icon: TrendingUp },
      { title: "Launch Campaign", url: "/launch-ai-campaign", icon: Rocket },
    ]
  },
  {
    title: "Account",
    items: [
      { title: "Pricing", url: "/pricing", icon: CreditCard },
      { title: "Account", url: "/account", icon: User },
    ]
  }
]

export default function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [credits, setCredits] = useState(15)
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <Sidebar className="border-r border-white/10 bg-black/50 backdrop-blur-xl">
      <SidebarHeader className="p-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 hover:scale-105 transition-transform duration-300"
        >
          <div className="relative">
            <Network className="h-6 w-6 text-purple-400" />
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg"></div>
          </div>
          AEON
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-4">
        {navigationItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="text-neutral-400 font-semibold">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link href={item.url} className="group">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-3 w-full"
                          >
                            <item.icon className={`h-5 w-5 ${
                              isActive 
                                ? 'text-purple-400' 
                                : 'text-neutral-400 group-hover:text-purple-400'
                            }`} />
                            <span className={`${
                              isActive 
                                ? 'text-white font-medium' 
                                : 'text-neutral-300 group-hover:text-white'
                            }`}>
                              {item.title}
                            </span>
                          </motion.div>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 space-y-4">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border border-purple-500/30 rounded-xl backdrop-blur-xl">
          <Gem className="h-5 w-5 text-yellow-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Credits</p>
            <p className="text-xs text-neutral-400">{credits} remaining</p>
          </div>
        </div>

        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
