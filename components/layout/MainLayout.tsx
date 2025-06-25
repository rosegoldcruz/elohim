"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Header from '../header'
import AppSidebar from '../app-sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  // Animation variants for page transitions
  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  }

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  }

  if (isHomePage) {
    // Home page layout - only header, no sidebar
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <motion.main
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="relative z-10 pt-24"
        >
          {children}
        </motion.main>
      </div>
    )
  }

  // App pages layout - sidebar + content
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-black text-white flex">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <motion.main
            initial="initial"
            animate="in"
            exit="out"
            variants={pageVariants}
            transition={pageTransition}
            className="flex-1 p-6"
          >
            {children}
          </motion.main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

export default MainLayout
