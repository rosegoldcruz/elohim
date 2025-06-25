"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Crown, Zap, Clock, Users, CheckCircle, XCircle, TrendingUp } from 'lucide-react'

interface CompetitiveComparisonProps {
  userId?: string
  className?: string
}

export default function CompetitiveComparison({ userId, className = "" }: CompetitiveComparisonProps) {
  const [comparison, setComparison] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadComparison()
    }
  }, [userId])

  const loadComparison = async () => {
    try {
      const response = await fetch('/api/competitive-comparison')
      const result = await response.json()

      if (result.success) {
        setComparison(result.comparison)
      }
    } catch (error) {
      console.error('Error loading comparison:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-96 bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  if (!comparison) {
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Competitive Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500/20 to-purple-500/20 border border-orange-500/40 rounded-2xl p-6 text-center"
      >
        <h3 className="text-2xl font-bold text-orange-400 mb-2">
          {comparison.competitiveMessage}
        </h3>
        <p className="text-gray-300">
          See how AEON crushes the competition with superior value
        </p>
      </motion.div>

      {/* Value Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* AEON Card */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-orange-400" />
              <div>
                <h3 className="text-xl font-bold text-orange-400">AEON (You)</h3>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  Orchestra Mode
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{comparison.aeonValue.videosPerMonth}</p>
                <p className="text-sm text-gray-400">Videos/Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{comparison.aeonValue.videoLength}s</p>
                <p className="text-sm text-gray-400">Per Video</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">6 AI Models Working Together</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Complete 60-Second Videos</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Credits Never Expire</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Professional Assembly</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hailuo Card */}
        <Card className="bg-gradient-to-r from-gray-500/10 to-red-500/10 border-gray-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Users className="h-6 w-6 text-gray-400" />
              <div>
                <h3 className="text-xl font-bold text-gray-400">Hailuo</h3>
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                  Single Model
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">{comparison.hailuoEquivalent.videosPerMonth}</p>
                <p className="text-sm text-gray-500">Clips/Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-400">{comparison.hailuoEquivalent.videoLength}s</p>
                <p className="text-sm text-gray-500">Per Clip</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Only 1 AI Model</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Just 10-Second Clips</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">Credits Reset Monthly</span>
              </div>
              <div className="flex items-center gap-2 text-red-400">
                <XCircle className="h-4 w-4" />
                <span className="text-sm">No Video Assembly</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Breakdown */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-green-400" />
            <span>Your Competitive Advantages</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-green-400">
                +{comparison.savings.videosAdvantage}
              </div>
              <p className="text-sm text-gray-400">More Videos per Month</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-blue-400">
                {comparison.savings.valueMultiplier}x
              </div>
              <p className="text-sm text-gray-400">More Creative Power</p>
            </div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-purple-400">
                +{comparison.savings.creditsAdvantage}
              </div>
              <p className="text-sm text-gray-400">Credits Advantage</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Advantages */}
      <Card className="bg-black/40 border-purple-500/20">
        <CardHeader>
          <CardTitle>Why AEON Dominates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {comparison.keyAdvantages.map((advantage: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-500/10 to-orange-500/10 rounded-lg"
              >
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">{advantage}</span>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <Button
          onClick={() => window.open('/pricing', '_blank')}
          className="bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 text-lg px-8 py-3"
        >
          <Crown className="h-5 w-5 mr-2" />
          Upgrade to Dominate Even More
        </Button>
      </div>
    </div>
  )
}
