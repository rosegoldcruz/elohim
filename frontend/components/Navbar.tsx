'use client'

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { 
  Video, 
  PenTool, 
  Image, 
  Music, 
  BarChart3, 
  BookOpen, 
  Settings,
  User,
  LogOut
} from "lucide-react";

const navigation = [
  { name: "Studio", href: "/studio", icon: Video },
  { name: "Script", href: "/script", icon: PenTool },
  { name: "Image", href: "/image", icon: Image },
  { name: "Audio", href: "/audio", icon: Music },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Docs", href: "/docs", icon: BookOpen },
];

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn, user } = useUser();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-[#0a0a23]/95 via-[#1a1a3a]/95 to-[#2a2a4a]/95 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-gray-900" />
              </div>
              <span className="text-xl font-bold gradient-text">AEON</span>
            </motion.div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`relative px-4 py-2 rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-gray-900 shadow-lg"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      }`}
                    >
                      <item.icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Button>
                  </motion.div>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <div className="flex items-center space-x-3">
                <Link href="/account">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <User className="w-4 h-4 mr-2" />
                    Account
                  </Button>
                </Link>
                <Link href="/settings">
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <Settings className="w-4 h-4" />
                  </Button>
                </Link>
                <SignOutButton>
                  <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                    <LogOut className="w-4 h-4" />
                  </Button>
                </SignOutButton>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" className="text-gray-300 hover:text-white">
                    Sign In
                  </Button>
                </SignInButton>
                <SignInButton mode="modal">
                  <Button className="aeon-button-primary">
                    Get Started
                  </Button>
                </SignInButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
} 