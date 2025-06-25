"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Copy, Share2, Gift, Users, Zap, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface ReferralSystemProps {
  userId?: string
  className?: string
}

export default function ReferralSystem({ userId, className = "" }: ReferralSystemProps) {
  const [referralCode, setReferralCode] = useState<string>('')
  const [referralUrl, setReferralUrl] = useState<string>('')
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userId) {
      loadReferralData()
    }
  }, [userId])

  const loadReferralData = async () => {
    try {
      const response = await fetch('/api/referrals')
      const result = await response.json()

      if (result.success) {
        setReferralCode(result.referralCode || '')
        setReferralUrl(result.referralUrl || '')
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Error loading referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReferralCode = async () => {
    try {
      const response = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' })
      })

      const result = await response.json()

      if (result.success) {
        setReferralCode(result.referralCode)
        setReferralUrl(result.referralUrl)
        toast.success('Referral code generated!', {
          description: `Earn ${result.reward} credits for each friend who joins`
        })
      } else {
        toast.error('Failed to generate referral code')
      }
    } catch (error) {
      console.error('Error generating referral code:', error)
      toast.error('Something went wrong')
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copied to clipboard!`)
  }

  const shareOnSocial = (platform: string) => {
    const message = "🎬 Just discovered AEON - 6 AI Directors create complete 60-second videos! Way better than those 10-second clips. Join me:"
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(message + ' ' + referralUrl)}`
    }

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-64 bg-gray-700 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Referral Overview */}
      <Card className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border-green-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Referral Program</h3>
              <p className="text-sm text-gray-400 font-normal">Earn 500 credits for each friend who joins</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
                <p className="text-sm text-gray-400">Friends Referred</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalEarned.toLocaleString()}</p>
                <p className="text-sm text-gray-400">Credits Earned</p>
              </div>
              <div className="bg-black/20 rounded-lg p-4 text-center">
                <Gift className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.rewardPerReferral}</p>
                <p className="text-sm text-gray-400">Credits per Referral</p>
              </div>
            </div>
          )}

          {/* Referral Code Section */}
          {referralCode ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Your Referral Code</label>
                <div className="flex gap-2">
                  <Input
                    value={referralCode}
                    readOnly
                    className="bg-black/20 border-green-500/30 text-white"
                  />
                  <Button
                    onClick={() => copyToClipboard(referralCode, 'Referral code')}
                    variant="outline"
                    size="icon"
                    className="border-green-500/30 hover:bg-green-500/20"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Your Referral Link</label>
                <div className="flex gap-2">
                  <Input
                    value={referralUrl}
                    readOnly
                    className="bg-black/20 border-green-500/30 text-white"
                  />
                  <Button
                    onClick={() => copyToClipboard(referralUrl, 'Referral link')}
                    variant="outline"
                    size="icon"
                    className="border-green-500/30 hover:bg-green-500/20"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Social Sharing */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-300">Share on Social Media</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    onClick={() => shareOnSocial('twitter')}
                    variant="outline"
                    size="sm"
                    className="border-blue-500/30 hover:bg-blue-500/20"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    onClick={() => shareOnSocial('facebook')}
                    variant="outline"
                    size="sm"
                    className="border-blue-600/30 hover:bg-blue-600/20"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    onClick={() => shareOnSocial('linkedin')}
                    variant="outline"
                    size="sm"
                    className="border-blue-700/30 hover:bg-blue-700/20"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button
                    onClick={() => shareOnSocial('whatsapp')}
                    variant="outline"
                    size="sm"
                    className="border-green-600/30 hover:bg-green-600/20"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-400">Generate your referral code to start earning credits</p>
              <Button
                onClick={generateReferralCode}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                <Gift className="h-4 w-4 mr-2" />
                Generate Referral Code
              </Button>
            </div>
          )}

          {/* How it Works */}
          <div className="bg-black/20 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-green-400">How it Works</h4>
            <div className="space-y-2 text-sm text-gray-300">
              <p>1. Share your referral link with friends</p>
              <p>2. They sign up using your link</p>
              <p>3. You both get 500 credits instantly!</p>
              <p>4. No limit on referrals - keep earning!</p>
            </div>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              500 credits = 5 complete videos
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
