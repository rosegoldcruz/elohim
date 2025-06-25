"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Crown, Info, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useApi } from '@/lib/api'
import Link from 'next/link'

interface CreditDisplayProps {
  userId?: string
  variant?: 'compact' | 'detailed' | 'hero'
  showUpgrade?: boolean
  className?: string
}

export default function CreditDisplay({ 
  userId, 
  variant = 'compact', 
  showUpgrade = true,
  className = "" 
}: CreditDisplayProps) {
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const { fetchCredits, CREDIT_COSTS, SUBSCRIPTION_TIERS } = useApi()

  useEffect(() => {
    if (userId) {
      loadCredits()
    }
  }, [userId])

  const loadCredits = async () => {
    if (!userId) return
    
    setLoading(true)
    const result = await fetchCredits(userId)
    if (result.data !== null) {
      setCredits(result.data)
    }
    setLoading(false)
  }

  const getVideosRemaining = (creditBalance: number) => {
    return Math.floor(creditBalance / CREDIT_COSTS.VIDEO_GENERATION)
  }

  const getTierInfo = (creditBalance: number) => {
    if (creditBalance >= SUBSCRIPTION_TIERS.STUDIO.credits) return { tier: 'Studio', color: 'from-yellow-500 to-orange-500' }
    if (creditBalance >= SUBSCRIPTION_TIERS.CREATOR.credits) return { tier: 'Creator', color: 'from-purple-500 to-pink-500' }
    if (creditBalance >= SUBSCRIPTION_TIERS.STARTER.credits) return { tier: 'Starter', color: 'from-blue-500 to-cyan-500' }
    return { tier: 'Free', color: 'from-gray-500 to-gray-600' }
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-12 bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  if (credits === null) {
    return (
      <div className={`text-red-400 ${className}`}>
        <p>Unable to load credits</p>
      </div>
    )
  }

  const videosRemaining = getVideosRemaining(credits)
  const tierInfo = getTierInfo(credits)
  const isLowCredits = credits < CREDIT_COSTS.VIDEO_GENERATION

  if (variant === 'hero') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-r ${tierInfo.color} p-6 rounded-2xl text-white ${className}`}
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Crown className="h-6 w-6" />
            <span className="text-lg font-bold">{tierInfo.tier} Tier</span>
          </div>
          
          <div className="space-y-2">
            <div className="text-4xl font-black">{credits.toLocaleString()}</div>
            <div className="text-sm opacity-90">Credits Available</div>
          </div>
          
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-2xl font-bold">{videosRemaining}</div>
            <div className="text-xs opacity-90">Complete 60-Second Videos</div>
          </div>
          
          {showUpgrade && (
            <Link href="/pricing">
              <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Plus className="h-4 w-4 mr-2" />
                Get More Credits
              </Button>
            </Link>
          )}
        </div>
      </motion.div>
    )
  }

  if (variant === 'detailed') {
    return (
      <Card className={`bg-gradient-to-r ${tierInfo.color} border-0 text-white ${className}`}>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <span className="font-semibold">Credits</span>
            </div>
            <Badge className="bg-white/20 text-white border-white/30">
              {tierInfo.tier}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{credits.toLocaleString()}</span>
              <span className="text-sm opacity-80">available</span>
            </div>
            
            <div className="bg-white/20 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Complete Videos:</span>
                <span className="font-semibold">{videosRemaining}</span>
              </div>
              <div className="flex justify-between text-xs opacity-80">
                <span>Cost per video:</span>
                <span>{CREDIT_COSTS.VIDEO_GENERATION} credits</span>
              </div>
            </div>
          </div>
          
          {isLowCredits && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-red-200">
                <Info className="h-4 w-4" />
                <span className="text-sm">Low credits - consider upgrading</span>
              </div>
            </div>
          )}
          
          {showUpgrade && (
            <Link href="/pricing">
              <Button className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Plus className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    )
  }

  // Compact variant
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r ${tierInfo.color} rounded-lg text-white ${className}`}>
            <Zap className="h-4 w-4" />
            <span className="font-semibold">{credits.toLocaleString()}</span>
            {isLowCredits && (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                <Info className="h-4 w-4 text-yellow-300" />
              </motion.div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{credits.toLocaleString()} credits available</p>
            <p className="text-sm">{videosRemaining} complete videos remaining</p>
            <p className="text-xs opacity-80">{tierInfo.tier} tier • Credits never expire</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Specialized components for common use cases
export function HeaderCreditDisplay({ userId, className }: { userId?: string, className?: string }) {
  return <CreditDisplay userId={userId} variant="compact" className={className} />
}

export function DashboardCreditDisplay({ userId, className }: { userId?: string, className?: string }) {
  return <CreditDisplay userId={userId} variant="detailed" className={className} />
}

export function HeroCreditDisplay({ userId, className }: { userId?: string, className?: string }) {
  return <CreditDisplay userId={userId} variant="hero" className={className} />
}
