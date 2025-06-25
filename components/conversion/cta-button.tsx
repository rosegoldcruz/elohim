"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ArrowRight, Zap, Play, Calendar, Rocket, Crown } from 'lucide-react'
import Link from 'next/link'

interface CTAButtonProps {
  variant?: 'primary' | 'secondary' | 'urgency' | 'demo' | 'trial' | 'premium'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  children: React.ReactNode
  href?: string
  onClick?: () => void
  className?: string
  icon?: 'arrow' | 'zap' | 'play' | 'calendar' | 'rocket' | 'crown'
  pulse?: boolean
  glow?: boolean
}

const iconMap = {
  arrow: ArrowRight,
  zap: Zap,
  play: Play,
  calendar: Calendar,
  rocket: Rocket,
  crown: Crown
}

export default function CTAButton({
  variant = 'primary',
  size = 'md',
  children,
  href,
  onClick,
  className = "",
  icon,
  pulse = false,
  glow = false
}: CTAButtonProps) {
  const IconComponent = icon ? iconMap[icon] : null

  const baseClasses = "font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-500/25",
    secondary: "bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black shadow-lg hover:shadow-yellow-500/25",
    urgency: "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white shadow-lg hover:shadow-red-500/25 animate-pulse",
    demo: "bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 backdrop-blur-xl",
    trial: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-green-500/25",
    premium: "bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-black shadow-lg hover:shadow-yellow-500/25"
  }

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-12 py-6 text-xl"
  }

  const glowClasses = glow ? "shadow-2xl shadow-purple-500/50" : ""
  const pulseClasses = pulse ? "animate-pulse" : ""

  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClasses} ${pulseClasses} ${className}`

  const buttonContent = (
    <motion.div
      whileHover={{ x: icon === 'arrow' ? 5 : 0 }}
      className="flex items-center justify-center gap-2"
    >
      {children}
      {IconComponent && <IconComponent className="h-4 w-4" />}
    </motion.div>
  )

  if (href) {
    return (
      <Link href={href}>
        <Button className={buttonClasses}>
          {buttonContent}
        </Button>
      </Link>
    )
  }

  return (
    <Button onClick={onClick} className={buttonClasses}>
      {buttonContent}
    </Button>
  )
}

// Specialized CTA components for common use cases
export function StartTrialButton({ className = "", size = "lg" }: { className?: string, size?: "sm" | "md" | "lg" | "xl" }) {
  return (
    <CTAButton
      variant="trial"
      size={size}
      href="/signup"
      icon="rocket"
      glow
      className={className}
    >
      🎬 Start Creating FREE
    </CTAButton>
  )
}

export function WatchDemoButton({ className = "", size = "lg" }: { className?: string, size?: "sm" | "md" | "lg" | "xl" }) {
  return (
    <CTAButton
      variant="demo"
      size={size}
      icon="play"
      className={className}
    >
      🎭 See 6 AI Directors in Action
    </CTAButton>
  )
}

export function ClaimSpotButton({ className = "", size = "lg" }: { className?: string, size?: "sm" | "md" | "lg" | "xl" }) {
  return (
    <CTAButton
      variant="urgency"
      size={size}
      icon="zap"
      pulse
      className={className}
    >
      Claim Your Spot
    </CTAButton>
  )
}

export function ScheduleCallButton({ className = "", size = "lg" }: { className?: string, size?: "sm" | "md" | "lg" | "xl" }) {
  return (
    <CTAButton
      variant="secondary"
      size={size}
      icon="calendar"
      className={className}
    >
      Schedule Strategy Call
    </CTAButton>
  )
}

export function UpgradePremiumButton({ className = "", size = "lg" }: { className?: string, size?: "sm" | "md" | "lg" | "xl" }) {
  return (
    <CTAButton
      variant="premium"
      size={size}
      icon="crown"
      glow
      className={className}
    >
      Upgrade to Premium
    </CTAButton>
  )
}
