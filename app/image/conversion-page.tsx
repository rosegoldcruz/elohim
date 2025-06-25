'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Palette, Sparkles, Crown, Target, Zap, DollarSign, Check, TrendingUp, Users, Clock, Star, Eye, Heart, Share2, Download, Image as ImageIcon, Brush, Wand2 } from 'lucide-react'
import { StartTrialButton, WatchDemoButton } from '@/components/conversion/cta-button'
import SocialProof from '@/components/conversion/social-proof'
import UrgencyTimer from '@/components/conversion/urgency-timer'
import ROICalculator from '@/components/conversion/roi-calculator'

export default function ImageConversionPage() {
  const [activeExample, setActiveExample] = useState(0)
  const [generatedCount, setGeneratedCount] = useState(847293)

  const brandExamples = [
    {
      name: "@sarah_creates",
      industry: "Lifestyle Creator",
      before: "📱",
      after: "✨",
      revenue: "500K followers",
      description: "From basic posts to stunning brand aesthetic"
    },
    {
      name: "@fitnessmike",
      industry: "Fitness Influencer",
      before: "💪",
      after: "🔥",
      revenue: "Brand partnerships",
      description: "Professional look that attracts sponsors"
    },
    {
      name: "@foodie_emma",
      industry: "Food Blogger",
      before: "🍕",
      after: "🌟",
      revenue: "Restaurant collabs",
      description: "Mouth-watering visuals that get noticed"
    }
  ]

  const costComparison = [
    { service: "Hire a Designer", cost: "$2,000", time: "2-4 weeks", quality: "Hit or miss" },
    { service: "Learn Photoshop", cost: "$600", time: "6+ months", quality: "Beginner level" },
    { service: "AEON AI", cost: "$29", time: "30 seconds", quality: "Pro-level" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % brandExamples.length)
      setGeneratedCount(prev => prev + Math.floor(Math.random() * 20) + 5)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-black to-pink-500/5"></div>
        
        {/* Floating Design Elements */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-purple-400/20 text-3xl"
              animate={{
                y: [0, -30, 0],
                rotate: [0, 360],
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              } as React.CSSProperties}
            >
              {['🎨', '✨', '🎯', '💎'][Math.floor(Math.random() * 4)]}
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
        {/* Hero Section: $1M Brand Identity in 30 Seconds */}
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
                    <Palette className="w-4 h-4 mr-2" />
                    Your Personal Brand Designer
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
                  >
                    Create Your{' '}
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
                      Personal Brand
                    </span>{' '}
                    in{' '}
                    <span className="text-green-400">Seconds</span>
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl text-gray-300 leading-relaxed"
                  >
                    Stop using{' '}
                    <span className="text-red-400 font-semibold line-through">basic phone photos</span> and{' '}
                    <span className="text-red-400 font-semibold line-through">generic templates</span>. AEON creates{' '}
                    <span className="text-purple-400 font-semibold">stunning visuals</span> that make you{' '}
                    <span className="text-green-400 font-semibold">stand out</span> and{' '}
                    <span className="text-yellow-400 font-semibold">get noticed</span>.
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
                    <span>No design experience needed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Commercial license included</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: Brand Transformation Showcase */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeExample}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Before/After Comparison */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center space-y-3">
                          <div className="text-sm text-gray-400 uppercase tracking-wide">Before</div>
                          <div className="aspect-square bg-gray-800 rounded-2xl flex items-center justify-center text-6xl">
                            {brandExamples[activeExample].before}
                          </div>
                          <div className="text-sm text-red-400">Generic • Forgettable</div>
                        </div>
                        
                        <div className="text-center space-y-3">
                          <div className="text-sm text-gray-400 uppercase tracking-wide">After (30 seconds)</div>
                          <div className="aspect-square bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center text-6xl shadow-2xl shadow-purple-500/50">
                            {brandExamples[activeExample].after}
                          </div>
                          <div className="text-sm text-green-400">Premium • Memorable</div>
                        </div>
                      </div>

                      {/* Brand Details */}
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold text-white">{brandExamples[activeExample].name}</h3>
                        <p className="text-purple-400">{brandExamples[activeExample].industry}</p>
                        <p className="text-sm text-gray-300">{brandExamples[activeExample].description}</p>
                        <div className="inline-flex items-center gap-2 bg-green-600/20 border border-green-500/30 rounded-full px-4 py-2">
                          <DollarSign className="h-4 w-4 text-green-400" />
                          <span className="font-bold text-green-400">{brandExamples[activeExample].revenue}</span>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Live Generation Counter */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-green-600/20 border border-green-500/30 rounded-2xl p-4 backdrop-blur-xl"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">{generatedCount.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Brands Created</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Cost Comparison Section */}
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
                  Stop Overpaying for{' '}
                  <span className="text-red-400">Slow</span> Design
                </h2>
                <p className="text-xl text-gray-400">See how AEON compares to traditional methods</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {costComparison.map((option, index) => (
                  <motion.div
                    key={option.service}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-8 rounded-2xl border backdrop-blur-xl ${
                      option.service === 'AEON AI' 
                        ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30 scale-105' 
                        : 'bg-white/5 border-white/10'
                    }`}
                  >
                    {option.service === 'AEON AI' && (
                      <div className="text-center mb-4">
                        <span className="inline-flex items-center px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full text-green-400 text-sm font-semibold">
                          <Crown className="h-3 w-3 mr-1" />
                          RECOMMENDED
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-bold text-white">{option.service}</h3>
                      <div className="space-y-2">
                        <div className={`text-3xl font-bold ${option.service === 'AEON AI' ? 'text-green-400' : 'text-red-400'}`}>
                          {option.cost}
                        </div>
                        <div className="text-gray-400">{option.time}</div>
                        <div className="text-gray-400">{option.quality} quality</div>
                      </div>
                      
                      {option.service === 'AEON AI' && (
                        <div className="space-y-2 pt-4 border-t border-green-500/30">
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <Check className="h-4 w-4" />
                            <span>Unlimited revisions</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <Check className="h-4 w-4" />
                            <span>Commercial license</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-green-400">
                            <Check className="h-4 w-4" />
                            <span>Brand guidelines included</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-4">
                  Save <span className="text-green-400">$49,903</span> and <span className="text-blue-400">5.9 months</span> with AEON
                </p>
                <StartTrialButton size="lg" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* ROI Calculator */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">
                  Calculate Your Brand ROI
                </h2>
                <p className="text-xl text-gray-400">See how much AEON can save your business</p>
              </div>

              <ROICalculator />
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
                  Your Brand Identity Awaits
                </h2>
                <p className="text-xl text-gray-400">Join thousands who've transformed their brands with AEON</p>
              </div>

              <UrgencyTimer 
                title="Limited Time: 50% Off First Month"
                subtitle="Only for the next 100 signups"
              />

              <div className="space-y-6">
                <StartTrialButton size="xl" />
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>30-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Instant access</span>
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
