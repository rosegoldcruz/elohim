"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
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
  Gem
} from 'lucide-react'

const navigationItems = [
  {
    title: "Creation",
    items: [
      { title: "Studio", url: "/studio", icon: Video },
      { title: "Image Generation", url: "/image", icon: Image },
      { title: "Audio Generation", url: "/audio", icon: Music },
    ]
  },
  {
    title: "Business",
    items: [
      { title: "Marketing", url: "/marketing", icon: TrendingUp },
      { title: "Analytics", url: "/analytics", icon: BarChart3 },
      { title: "Launch AI Campaign", url: "/launch-ai-campaign", icon: Rocket },
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

      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border border-purple-500/30 rounded-xl backdrop-blur-xl">
          <Gem className="h-5 w-5 text-yellow-400" />
          <div className="flex-1">
            <p className="text-sm font-medium text-white">Credits</p>
            <p className="text-xs text-neutral-400">15 remaining</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
