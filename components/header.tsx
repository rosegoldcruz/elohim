"use client"

import React, { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Gem, Network, Menu, X } from "lucide-react"
import Link from "next/link"
import { useApi } from "@/lib/api"
import { StartFreeTrialButton, ScheduleDemoButton } from "./action-button"

const navLinks = [
  { href: "/studio", label: "Studio" },
  { href: "/image", label: "Image Generation" },
  { href: "/audio", label: "Audio Generation" },
  { href: "/marketing", label: "Marketing" },
  { href: "/analytics", label: "Analytics" },
  { href: "/pricing", label: "Pricing" },
]

export default function Header() {
  const pathname = usePathname()
  const [credits, setCredits] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { fetchCredits, getUser } = useApi()

  // Only show header on home page
  if (pathname !== '/') {
    return null
  }

  useEffect(() => {
    // Fetch user credits on component mount
    const loadUserData = async () => {
      const userResult = await getUser()
      if (userResult.data) {
        const creditsResult = await fetchCredits(userResult.data.id)
        if (creditsResult.data) {
          setCredits(creditsResult.data)
        }
      }
    }
    loadUserData()
  }, [])

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-black/10 border-b border-white/5 backdrop-blur-2xl"
    >
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-3xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 hover:scale-105 transition-transform duration-300"
        >
          <div className="relative">
            <Network className="h-8 w-8 text-purple-400" />
            <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg"></div>
          </div>
          AEON
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium transition-all duration-500 hover:text-purple-400 relative group text-neutral-300"
            >
              {link.label}
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 transition-all duration-500 group-hover:w-full"></span>
              <div className="absolute inset-0 bg-purple-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center gap-4">
          <Link
            href="/account"
            className="flex items-center gap-3 text-lg font-medium bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border border-purple-500/30 px-4 py-2 rounded-xl hover:from-purple-600/30 hover:via-pink-600/30 hover:to-cyan-600/30 transition-all duration-500 backdrop-blur-xl shadow-lg shadow-purple-500/10"
          >
            <Gem className="h-4 w-4 text-yellow-400" />
            <span>{credits} Credits</span>
          </Link>
          <StartFreeTrialButton size="md" />
          <ScheduleDemoButton size="md" />
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 text-white hover:text-purple-400 transition-colors"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/10"
        >
          <div className="container mx-auto px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-lg font-medium text-neutral-300 hover:text-purple-400 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-4 space-y-3">
              <Link
                href="/account"
                className="flex items-center gap-3 text-lg font-medium bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border border-purple-500/30 px-4 py-3 rounded-xl"
              >
                <Gem className="h-4 w-4 text-yellow-400" />
                <span>{credits} Credits</span>
              </Link>
              <StartFreeTrialButton size="md" className="w-full" />
              <ScheduleDemoButton size="md" className="w-full" />
            </div>
          </div>
        </motion.div>
      )}
    </motion.header>
  )
}
