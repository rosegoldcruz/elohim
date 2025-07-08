"use client"

import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Gem, Network } from "lucide-react"
import Link from "next/link"
import { useUser, UserButton } from "@clerk/nextjs"

const navLinks = [
  { href: "/studio", label: "Studio" },
  { href: "/script", label: "Script" },
  { href: "/image", label: "Image" },
  { href: "/audio", label: "Audio" },
  { href: "/marketing", label: "Marketing" },
  { href: "/analytics", label: "Analytics" },
  { href: "/docs", label: "Docs" },
  { href: "/pricing", label: "Pricing" },
]

export default function Header() {
  const pathname = usePathname()
  const { isSignedIn, user } = useUser()
  const credits = user?.publicMetadata?.credits as number || 0
  const isHomepage = pathname === "/"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/10 border-b border-white/5 backdrop-blur-2xl">
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

        {!isHomepage && (
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg font-medium transition-all duration-500 hover:text-purple-400 relative group ${
                  pathname.startsWith(link.href) ? "text-purple-400" : "text-neutral-300"
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-2 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 transition-all duration-500 group-hover:w-full ${
                    pathname.startsWith(link.href) ? "w-full" : ""
                  }`}
                ></span>
                <div className="absolute inset-0 bg-purple-400/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-6">
          {isSignedIn ? (
            <>
              {!isHomepage && (
                <Link
                  href="/account"
                  className="flex items-center gap-3 text-lg font-medium bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border border-purple-500/30 px-6 py-3 rounded-2xl hover:from-purple-600/30 hover:via-pink-600/30 hover:to-cyan-600/30 transition-all duration-500 backdrop-blur-xl shadow-lg shadow-purple-500/10"
                >
                  <Gem className="h-5 w-5 text-yellow-400" />
                  <span>{credits} Credits</span>
                </Link>
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                    userButtonPopoverCard: "bg-gray-900 border border-gray-800",
                    userButtonPopoverActionButton: "text-white hover:bg-gray-800",
                  }
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Link
                    label="Studio"
                    labelIcon={<Network className="h-4 w-4" />}
                    href="/studio"
                  />
                  <UserButton.Link
                    label="Account"
                    labelIcon={<Gem className="h-4 w-4" />}
                    href="/account"
                  />
                  <UserButton.Action label="manageAccount" />
                </UserButton.MenuItems>
              </UserButton>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/pricing">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-lg font-medium text-white hover:text-purple-400 transition-colors duration-300"
                >
                  Pricing
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 rounded-2xl px-8 py-3 text-lg font-semibold shadow-xl shadow-purple-500/20 transform hover:scale-105 transition-all duration-300"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
