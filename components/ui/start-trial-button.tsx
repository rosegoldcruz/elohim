"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface StartTrialButtonProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary' | 'outline'
  className?: string
  children?: React.ReactNode
}

export function StartTrialButton({ 
  size = 'md', 
  variant = 'primary', 
  className = "",
  children 
}: StartTrialButtonProps) {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  const variantClasses = {
    primary: 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold',
    secondary: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold',
    outline: 'border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 font-semibold'
  }

  const content = children || (
    <>
      <Sparkles className="w-4 h-4 mr-2" />
      Start Free Trial
      <ArrowRight className="w-4 h-4 ml-2" />
    </>
  )

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-block"
    >
      <Link href="/signup">
        <Button
          className={`
            ${sizeClasses[size]} 
            ${variantClasses[variant]} 
            rounded-xl 
            transition-all 
            duration-300 
            shadow-lg 
            hover:shadow-xl 
            ${className}
          `}
        >
          {content}
        </Button>
      </Link>
    </motion.div>
  )
}

export default StartTrialButton
