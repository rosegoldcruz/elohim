"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Gem, Network, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { User as SupabaseUser } from "@supabase/supabase-js"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const navLinks = [
  { href: "/studio", label: "Studio" },
  { href: "/script", label: "Script" },
  { href: "/image", label: "Image" },
  { href: "/audio", label: "Audio" },
  { href: "/marketing", label: "Marketing" },
  { href: "/analytics", label: "Analytics" },
  { href: "/docs", label: "Docs" },
]

export default function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const isHomepage = pathname === "/"

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Get user credits from database
        const { data: profile } = await supabase
          .from('users')
          .select('credits')
          .eq('id', user.id)
          .single()

        setCredits(profile?.credits || 0)
      }

      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        if (!session?.user) {
          setCredits(0)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-intense border-b border-white/10">
      <div className="container mx-auto px-4 h-24 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 text-3xl font-black tracking-tighter text-holographic hover:scale-105 transition-all duration-300 group"
        >
          <div className="relative">
            <Network className="h-10 w-10 text-purple-400 group-hover:text-cyan-400 transition-colors duration-300" />
            <div className="absolute inset-0 bg-purple-400/20 group-hover:bg-cyan-400/20 rounded-full blur-lg transition-colors duration-300"></div>
          </div>
          <span className="animate-holographic">AEON</span>
        </Link>

        {!isHomepage && (
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative text-lg font-medium transition-all duration-500 group px-4 py-2 rounded-xl ${
                  pathname.startsWith(link.href)
                    ? "text-neon"
                    : "text-neutral-300 hover:text-white"
                }`}
              >
                {/* Background glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm"></div>

                {/* Text */}
                <span className="relative z-10">{link.label}</span>

                {/* Animated underline */}
                <span
                  className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 transition-all duration-500 ${
                    pathname.startsWith(link.href) ? "w-8" : "w-0 group-hover:w-8"
                  }`}
                ></span>

                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 via-pink-400/5 to-cyan-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-6">
          {user ? (
            <>
              {!isHomepage && (
                <Link
                  href="/account"
                  className="group flex items-center gap-3 text-lg font-medium glass-intense border border-purple-500/30 hover:border-purple-500/50 px-6 py-3 rounded-2xl hover-lift transition-all duration-500 shadow-lg shadow-purple-500/10"
                >
                  <Gem className="h-5 w-5 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
                  <span className="text-white group-hover:text-purple-300 transition-colors">{credits} Credits</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email || ""} />
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border border-gray-800" align="end" forceMount>
                  <DropdownMenuItem asChild>
                    <Link href="/studio" className="flex items-center">
                      <Network className="mr-2 h-4 w-4" />
                      <span>Studio</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/account" className="flex items-center">
                      <Gem className="mr-2 h-4 w-4" />
                      <span>Account</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="lg"
                  className="glass-intense border-white/20 hover:border-white/40 text-white hover:bg-white/5 text-lg font-medium px-6 py-3 rounded-xl hover-lift transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/signup">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-300 animate-pulse-neon"></div>
                  <Button
                    size="lg"
                    className="relative btn-futuristic bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 rounded-2xl px-8 py-3 text-lg font-bold shadow-2xl border-0"
                  >
                    Get Started
                  </Button>
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
