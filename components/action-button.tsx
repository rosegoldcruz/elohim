"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ActionButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  href?: string
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

export default function ActionButton({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  loading = false,
  className
}: ActionButtonProps) {
  const baseClasses = "font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95"
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 text-white shadow-xl shadow-purple-500/20",
    secondary: "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black shadow-xl shadow-yellow-500/20",
    outline: "border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-transparent"
  }

  const sizeClasses = {
    sm: "px-4 py-2 text-sm rounded-lg",
    md: "px-6 py-3 text-base rounded-xl",
    lg: "px-8 py-4 text-lg rounded-2xl"
  }

  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    disabled && "opacity-50 cursor-not-allowed hover:scale-100",
    className
  )

  const handleClick = () => {
    if (href) {
      // External link
      if (href.startsWith('http')) {
        window.open(href, '_blank', 'noopener,noreferrer')
      } else {
        // Internal navigation
        window.location.href = href
      }
    } else if (onClick) {
      onClick()
    }
  }

  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        onClick={handleClick}
        disabled={disabled || loading}
        className={buttonClasses}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </div>
        ) : (
          children
        )}
      </Button>
    </motion.div>
  )
}

// Specific button components for common use cases
export function StartFreeTrialButton({ className, ...props }: Omit<ActionButtonProps, 'children'>) {
  return (
    <ActionButton
      variant="primary"
      size="lg"
      href="/pricing"
      className={className}
      {...props}
    >
      Start Free Trial
    </ActionButton>
  )
}

export function ScheduleDemoButton({ className, ...props }: Omit<ActionButtonProps, 'children'>) {
  return (
    <ActionButton
      variant="secondary"
      size="lg"
      href="https://calendly.com/aeon-demo" // TODO: Replace with actual demo scheduling link
      className={className}
      {...props}
    >
      Schedule Demo
    </ActionButton>
  )
}
