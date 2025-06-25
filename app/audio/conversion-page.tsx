'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Music, Sparkles, Crown, Target, Zap, DollarSign, Check, TrendingUp, Users, Clock, Star, Eye, Heart, Share2, Download, Headphones, Mic, Radio, Volume2, Pause } from 'lucide-react'
import { StartTrialButton, WatchDemoButton } from '@/components/conversion/cta-button'
import SocialProof from '@/components/conversion/social-proof'
import UrgencyTimer from '@/components/conversion/urgency-timer'
import ROICalculator from '@/components/conversion/roi-calculator'

export default function AudioConversionPage() {
  const [activeTrack, setActiveTrack] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tracksCreated, setTracksCreated] = useState(1247893)

  const successTracks = [
    {
      title: "Chill Study Vibes",
      artist: "Sarah K.",
      genre: "Lo-Fi for TikTok",
      streams: "2.3M views",
      revenue: "Viral TikTok",
      description: "Perfect background music for study content",
      waveform: "🎵",
      beforeSkill: "Never made music",
      afterResult: "TikTok audio trending"
    },
    {
      title: "Workout Energy",
      artist: "Mike Chen",
      genre: "Fitness Beats",
      streams: "5.7M plays",
      revenue: "Brand sponsor",
      description: "High-energy tracks for fitness content",
      waveform: "🎶",
      beforeSkill: "Zero music experience",
      afterResult: "Fitness influencer"
    },
    {
      title: "Cooking Show Theme",
      artist: "Emma R.",
      genre: "Food Content",
      streams: "1.2M views",
      revenue: "Recipe collabs",
      description: "Catchy intro for cooking videos",
      waveform: "🎼",
      beforeSkill: "Never touched an instrument",
      afterResult: "Food content creator"
    }
  ]

  const skillComparison = [
    { method: "Learn Music Production", cost: "$3,000", time: "2+ years", success: "10%" },
    { method: "Hire a Producer", cost: "$500", time: "2-4 weeks", success: "50%" },
    { method: "AEON AI", cost: "$29", time: "5 minutes", success: "95%" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTrack((prev) => (prev + 1) % successTracks.length)
      setTracksCreated(prev => prev + Math.floor(Math.random() * 30) + 10)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-black to-blue-500/5"></div>
        
        {/* Floating Music Notes */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-purple-400/20 text-2xl"
              animate={{
                y: [0, -80, 0],
                rotate: [0, 360],
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.7, 0.2]
              }}
              transition={{
                duration: 6 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              } as React.CSSProperties}
            >
              {['🎵', '🎶', '🎼', '🎤', '🎧'][Math.floor(Math.random() * 5)]}
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
        {/* Hero Section: Become Dr. Dre Without Learning to Mix */}
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
                    <Music className="w-4 h-4 mr-2" />
                    Perfect Audio for Your Content
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
                  >
                    Add{' '}
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                      Perfect Audio
                    </span>{' '}
                    to Your Content
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl text-gray-300 leading-relaxed"
                  >
                    Stop using{' '}
                    <span className="text-red-400 font-semibold line-through">copyright music</span> and{' '}
                    <span className="text-red-400 font-semibold line-through">boring audio</span>. AEON creates{' '}
                    <span className="text-purple-400 font-semibold">custom soundtracks</span> that make your content{' '}
                    <span className="text-green-400 font-semibold">impossible to scroll past</span>.
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
                    <span>No musical training required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Commercial rights included</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: Audio Success Showcase */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTrack}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Audio Player Mockup */}
                      <div className="bg-black/50 rounded-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-bold text-white">{successTracks[activeTrack].title}</h3>
                            <p className="text-purple-400">{successTracks[activeTrack].artist}</p>
                            <p className="text-sm text-gray-400">{successTracks[activeTrack].genre}</p>
                          </div>
                          <div className="text-4xl">{successTracks[activeTrack].waveform}</div>
                        </div>
                        
                        {/* Waveform Visualization */}
                        <div className="flex items-center gap-1 h-12">
                          {[...Array(40)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="bg-gradient-to-t from-purple-600 to-pink-400 rounded-full"
                              style={{
                                width: '3px',
                                height: `${Math.random() * 100}%`
                              } as React.CSSProperties}
                              animate={{
                                height: isPlaying ? [`${Math.random() * 100}%`, `${Math.random() * 100}%`] : `${Math.random() * 100}%`
                              }}
                              transition={{
                                duration: 0.5,
                                repeat: isPlaying ? Infinity : 0,
                                repeatType: "reverse"
                              }}
                            />
                          ))}
                        </div>

                        {/* Play Controls */}
                        <div className="flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full flex items-center justify-center transition-colors"
                          >
                            {isPlaying ? <Pause className="h-5 w-5 text-white" /> : <Music className="h-5 w-5 text-white ml-1" />}
                          </button>
                          <div className="text-sm text-gray-400">2:47 / 3:21</div>
                        </div>
                      </div>

                      {/* Success Metrics */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                            <Headphones className="h-4 w-4" />
                            <span className="font-bold">{successTracks[activeTrack].streams}</span>
                          </div>
                          <div className="text-xs text-gray-400">Streams</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-green-400 mb-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-bold">{successTracks[activeTrack].revenue}</span>
                          </div>
                          <div className="text-xs text-gray-400">Revenue</div>
                        </div>
                      </div>

                      {/* Before/After */}
                      <div className="bg-white/5 rounded-xl p-4 space-y-2">
                        <div className="text-center">
                          <p className="text-sm text-gray-400">{successTracks[activeTrack].description}</p>
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <div className="text-xs text-red-400 uppercase">Before</div>
                              <div className="text-sm text-white">{successTracks[activeTrack].beforeSkill}</div>
                            </div>
                            <div>
                              <div className="text-xs text-green-400 uppercase">After</div>
                              <div className="text-sm text-white">{successTracks[activeTrack].afterResult}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Live Creation Counter */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-green-600/20 border border-green-500/30 rounded-2xl p-4 backdrop-blur-xl"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{tracksCreated.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Tracks Created</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Skill Compression Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-16"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">
                  Skip the{' '}
                  <span className="text-red-400">Struggle</span>, Get the{' '}
                  <span className="text-green-400">Success</span>
                </h2>
                <p className="text-xl text-gray-400">Why spend years learning when you can create today?</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {skillComparison.map((method, index) => (
                  <motion.div
                    key={method.method}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-8 rounded-2xl border backdrop-blur-xl ${
                      method.method === 'AEON AI' 
                        ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30 scale-105' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {method.method === 'AEON AI' && (
                      <div className="text-center mb-4">
                        <span className="inline-flex items-center px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full text-green-400 text-sm font-semibold">
                          <Crown className="h-3 w-3 mr-1" />
                          GENIUS SHORTCUT
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-bold text-white">{method.method}</h3>
                      <div className="space-y-2">
                        <div className={`text-3xl font-bold ${method.method === 'AEON AI' ? 'text-green-400' : 'text-red-400'}`}>
                          {method.cost}
                        </div>
                        <div className="text-gray-400">{method.time}</div>
                        <div className="text-gray-400">{method.success} success rate</div>
                      </div>
                      
                      {method.method === 'AEON AI' && (
                        <div className="space-y-2 pt-4 border-t border-green-500/30">
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <Check className="h-4 w-4" />
                            <span>Instant results</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <Check className="h-4 w-4" />
                            <span>No learning curve</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <Check className="h-4 w-4" />
                            <span>Professional quality</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-4">
                  Save <span className="text-green-400">$49,903</span> and <span className="text-blue-400">7.9 years</span> with AEON
                </p>
                <StartTrialButton size="lg" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Final CTA with Urgency */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-cyan-600/10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">
                  Your Hit Song Awaits
                </h2>
                <p className="text-xl text-gray-400">Join the audio revolution. No talent required.</p>
              </div>

              <UrgencyTimer 
                title="Limited Time: Producer Package 60% Off"
                subtitle="Only for the next 50 music creators"
              />

              <div className="space-y-6">
                <StartTrialButton size="xl" />
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Commercial rights included</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Unlimited downloads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Cancel anytime</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
    </div>
  )
}
