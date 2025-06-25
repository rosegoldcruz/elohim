'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Play, Video, Zap, Crown, Target, Rocket, DollarSign, Check, TrendingUp, Users, Clock, Star, Eye, Heart, Share2, Download } from 'lucide-react'
import { StartTrialButton, WatchDemoButton } from '@/components/conversion/cta-button'
import SocialProof from '@/components/conversion/social-proof'
import UrgencyTimer from '@/components/conversion/urgency-timer'
import VideoGenerator from '@/components/video-generator'
import { DashboardCreditDisplay } from '@/components/ui/credit-display'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function StudioConversionPage() {
  const [activeDemo, setActiveDemo] = useState(0)
  const [liveViews, setLiveViews] = useState(2847293)
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  const demoVideos = [
    {
      title: "Sarah's Viral Dance Tutorial",
      views: "2.3M views",
      revenue: "50K new followers",
      thumbnail: "💃",
      description: "Simple dance tutorial that blew up overnight"
    },
    {
      title: "Marcus's Gaming Highlights",
      views: "15.7M views",
      revenue: "$8K/month",
      thumbnail: "🎮",
      description: "Gaming content that got him sponsored"
    },
    {
      title: "Emma's Day-in-Life Vlog",
      views: "5.2M views",
      revenue: "Brand deals",
      thumbnail: "☕",
      description: "Authentic content that brands love"
    }
  ]

  const features = [
    {
      icon: Video,
      title: "AI Video Generation",
      description: "Create Hollywood-quality videos from text prompts",
      benefit: "Save $50K+ on production costs"
    },
    {
      icon: TrendingUp,
      title: "Viral Optimization",
      description: "AI analyzes millions of viral videos to optimize yours",
      benefit: "10x higher engagement rates"
    },
    {
      icon: Target,
      title: "Audience Targeting",
      description: "AI identifies and targets your perfect audience",
      benefit: "3x better conversion rates"
    },
    {
      icon: Rocket,
      title: "Auto-Publishing",
      description: "Schedule and publish across all platforms automatically",
      benefit: "Save 20+ hours per week"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo((prev) => (prev + 1) % demoVideos.length)
      setLiveViews(prev => prev + Math.floor(Math.random() * 50) + 10)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-black to-pink-500/5"></div>
        
        {/* Floating Video Icons */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-purple-400/20 text-2xl"
              animate={{
                y: [0, -50, 0],
                rotate: [0, 180, 360],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              } as React.CSSProperties}
            >
              🎬
            </motion.div>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">AEON</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <SocialProof variant="counter" className="hidden md:block" />
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Sign In</Link>
              <StartTrialButton size="sm" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section: From Idea to Viral in 10 Minutes */}
        <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Left: Headlines + CTAs */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-center px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full text-purple-400 font-semibold"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    The Creator's Secret Weapon
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
                  >
                    Create TikToks That{' '}
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                      Go Viral
                    </span>{' '}
                    Every Time
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl text-gray-300 leading-relaxed"
                  >
                    Stop posting content that gets ignored. AEON's AI creates{' '}
                    <span className="text-purple-400 font-semibold">scroll-stopping videos</span> that get{' '}
                    <span className="text-green-400 font-semibold">millions of views</span> and help you{' '}
                    <span className="text-yellow-400 font-semibold">quit your day job</span>.
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <StartTrialButton size="xl" />
                  <WatchDemoButton size="xl" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center gap-6 text-sm text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>No filming experience needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Viral content in minutes</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: Live Demo Showcase */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeDemo}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Video Preview */}
                      <div className="aspect-video bg-black/50 rounded-2xl flex items-center justify-center relative overflow-hidden">
                        <div className="text-6xl">{demoVideos[activeDemo].thumbnail}</div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="font-bold text-white mb-1">{demoVideos[activeDemo].title}</h3>
                          <p className="text-sm text-gray-300">{demoVideos[activeDemo].description}</p>
                        </div>
                        <button
                          type="button"
                          aria-label="Play demo video"
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="w-16 h-16 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                            <Play className="h-6 w-6 text-white ml-1" />
                          </div>
                        </button>
                      </div>

                      {/* Video Stats */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-red-400 mb-1">
                            <Eye className="h-4 w-4" />
                            <span className="font-bold">{demoVideos[activeDemo].views}</span>
                          </div>
                          <div className="text-xs text-gray-400">Views</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-bold">{demoVideos[activeDemo].revenue}</span>
                          </div>
                          <div className="text-xs text-gray-400">Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="font-bold">8 min</span>
                          </div>
                          <div className="text-xs text-gray-400">Creation Time</div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Live Views Counter */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-red-600/20 border border-red-500/30 rounded-2xl p-4 backdrop-blur-xl"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-400">{liveViews.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Live Views</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Video Generator Section */}
        {user && (
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Credit Display */}
                <div className="lg:col-span-1">
                  <DashboardCreditDisplay userId={user.id} />
                </div>

                {/* Video Generator */}
                <div className="lg:col-span-2">
                  <VideoGenerator userId={user.id} />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Sign In CTA for non-authenticated users */}
        {!user && (
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-8"
              >
                <h2 className="text-4xl md:text-5xl font-bold">
                  Ready to Create Your{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                    Masterpiece?
                  </span>
                </h2>
                <p className="text-xl text-gray-400">
                  Sign in to access Orchestra Mode and start creating with 6 AI Directors
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <StartTrialButton size="xl" />
                  <WatchDemoButton size="xl" />
                </div>
              </motion.div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
