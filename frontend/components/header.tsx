"use client"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Gem, Network, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getSupabaseUserProfile } from "@/lib/auth/clerk-supabase-sync"

// Conditional imports for Clerk
let useUser: any = null
let SignOutButton: any = null
let UserButton: any = null

try {
  const clerk = require("@clerk/nextjs")
  useUser = clerk.useUser
  SignOutButton = clerk.SignOutButton
  UserButton = clerk.UserButton
} catch (error) {
  console.log("Clerk not available")
}

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
]

export default function Header() {
  const pathname = usePathname()
  const user = useUser ? useUser().user : null
  const isLoaded = useUser ? useUser().isLoaded : true
  const [credits, setCredits] = useState(0)
  const [loadingCredits, setLoadingCredits] = useState(true)

  const isHomepage = pathname === "/"

  useEffect(() => {
    if (user?.id) {
      fetchUserCredits()
    }
  }, [user])

  const fetchUserCredits = async () => {
    if (!user?.id) return
    
    try {
      const profile = await getSupabaseUserProfile(user.id)
      if (profile) {
        setCredits(profile.credits || 0)
      }
    } catch (error) {
      console.error('Failed to fetch user credits:', error)
    } finally {
      setLoadingCredits(false)
    }
  }

  if (!isLoaded) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 glass-intense border-b border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="flex items-center gap-3 text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400">
                <div className="relative">
                  <Network className="h-8 w-8 text-purple-400" />
                  <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg"></div>
                </div>
                AEON
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-medium transition-colors ${
                      pathname === link.href
                        ? "text-white"
                        : "text-gray-300 hover:text-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-6">
              <div className="h-8 w-24 bg-gray-700 animate-pulse rounded"></div>
              <div className="h-8 w-8 bg-gray-700 animate-pulse rounded-full"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-intense border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 hover:scale-105 transition-transform duration-300">
              <div className="relative">
                <Network className="h-8 w-8 text-purple-400" />
                <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg"></div>
              </div>
              AEON
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-6">
            {user ? (
              <>
                {!isHomepage && (
                  <Link href="/dashboard" className="group flex items-center gap-3 text-lg font-medium glass-intense px-4 py-2 rounded-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20">
                    <Gem className="h-5 w-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                    <span className="text-white group-hover:text-purple-300 transition-colors">
                      {loadingCredits ? (
                        <div className="h-4 w-12 bg-gray-700 animate-pulse rounded"></div>
                      ) : (
                        `${credits.toLocaleString()} Credits`
                      )}
                    </span>
                  </Link>
                )}
                {UserButton && (
                  <UserButton 
                    appearance={{
                      elements: {
                        avatarBox: "w-8 h-8",
                        userButtonPopoverCard: "bg-[#1a1a1a] border border-[#2a2a2a]",
                        userButtonPopoverActionButton: "text-white hover:bg-white/10",
                        userButtonPopoverActionButtonText: "text-white",
                        userButtonPopoverFooter: "border-t border-[#2a2a2a]",
                      }
                    }}
                  />
                )}
              </>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/sign-in">
                  <Button variant="outline" size="lg" className="glass-intense border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button size="lg" className="relative btn-futuristic bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25">
                    <span className="relative z-10">Get Started</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
