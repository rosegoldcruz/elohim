'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, TrendingUp, Sparkles, Crown, Target, Zap, DollarSign, Check, Users, Clock, Star, Eye, Heart, Share2, Download, BarChart3, PieChart, Activity, Gauge, Brain, Rocket } from 'lucide-react'
import { StartTrialButton, WatchDemoButton } from '@/components/conversion/cta-button'
import SocialProof from '@/components/conversion/social-proof'
import UrgencyTimer from '@/components/conversion/urgency-timer'
import ROICalculator from '@/components/conversion/roi-calculator'

export default function GrowthEnginePage() {
  const [activeMetric, setActiveMetric] = useState(0)
  const [liveRevenue, setLiveRevenue] = useState(2847293)
  const [campaignsRunning, setCampaignsRunning] = useState(1247)

  const growthMetrics = [
    {
      title: "Revenue Optimization",
      icon: "💰",
      description: "AI predicts and optimizes every revenue opportunity",
      beforeValue: "$50K/month",
      afterValue: "$340K/month",
      improvement: "580% increase",
      timeframe: "3 months"
    },
    {
      title: "Campaign Performance",
      icon: "🎯",
      description: "AI manages campaigns with superhuman precision",
      beforeValue: "2.3% conversion",
      afterValue: "18.7% conversion",
      improvement: "713% increase",
      timeframe: "30 days"
    },
    {
      title: "Customer Acquisition",
      icon: "👥",
      description: "AI finds and converts your perfect customers",
      beforeValue: "$127 CAC",
      afterValue: "$23 CAC",
      improvement: "82% reduction",
      timeframe: "60 days"
    }
  ]

  const traditionalVsAI = [
    { aspect: "Campaign Setup", traditional: "2-4 weeks", ai: "5 minutes", savings: "99% faster" },
    { aspect: "A/B Testing", traditional: "Manual guesswork", ai: "AI optimization", savings: "340% better results" },
    { aspect: "Budget Allocation", traditional: "Gut feeling", ai: "Predictive AI", savings: "67% cost reduction" },
    { aspect: "Performance Tracking", traditional: "Weekly reports", ai: "Real-time insights", savings: "24/7 monitoring" },
    { aspect: "Scaling", traditional: "Hire more people", ai: "Instant scaling", savings: "Unlimited growth" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveMetric((prev) => (prev + 1) % growthMetrics.length)
      setLiveRevenue(prev => prev + Math.floor(Math.random() * 1000) + 500)
      setCampaignsRunning(prev => prev + Math.floor(Math.random() * 3))
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-black to-blue-500/5"></div>
        
        {/* Floating Growth Elements */}
        <div className="absolute inset-0">
          {[...Array(18)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-green-400/20 text-2xl"
              animate={{
                y: [0, -70, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.4, 1],
                opacity: [0.2, 0.7, 0.2]
              }}
              transition={{
                duration: 7 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              } as React.CSSProperties}
            >
              {['📈', '💰', '🎯', '⚡', '🚀', '💎'][Math.floor(Math.random() * 6)]}
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
        {/* Hero Section: Since We Can't Control Time, We Control Marketing at Scale */}
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
                    className="inline-flex items-center px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full text-green-400 font-semibold"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    The $10M Growth Engine
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
                  >
                    Since We Can't Control{' '}
                    <span className="text-red-400">Time</span>, We Control{' '}
                    <span className="bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Marketing at Scale
                    </span>
                  </motion.h1>
                  
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-2xl p-6 backdrop-blur-xl"
                  >
                    <blockquote className="text-xl md:text-2xl text-gray-300 italic leading-relaxed">
                      "A man who stops advertising to save money is like a man who stops a clock to save time."
                    </blockquote>
                    <cite className="block text-right text-yellow-400 font-semibold mt-2">— Henry Ford</cite>
                  </motion.div>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-xl md:text-2xl text-gray-300 leading-relaxed"
                  >
                    Stop burning{' '}
                    <span className="text-red-400 font-semibold">$100K+ budgets</span> with{' '}
                    <span className="text-red-400 font-semibold">no guarantees</span>. AEON's AI{' '}
                    <span className="text-green-400 font-semibold">predicts, creates, and optimizes</span> campaigns that{' '}
                    <span className="text-blue-400 font-semibold">scale automatically</span>.
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <StartTrialButton size="xl" />
                  <WatchDemoButton size="xl" />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.0 }}
                  className="flex items-center gap-6 text-sm text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Guaranteed ROI improvement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>24/7 AI optimization</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: Growth Metrics Dashboard */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-r from-green-600/20 via-blue-600/20 to-purple-600/20 border border-green-500/30 rounded-3xl p-8 backdrop-blur-xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeMetric}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Metric Header */}
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{growthMetrics[activeMetric].icon}</div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{growthMetrics[activeMetric].title}</h3>
                          <p className="text-gray-400">{growthMetrics[activeMetric].description}</p>
                        </div>
                      </div>

                      {/* Before/After Comparison */}
                      <div className="grid grid-cols-2 gap-6">
                        <div className="text-center space-y-2">
                          <div className="text-sm text-gray-400 uppercase tracking-wide">Before AEON</div>
                          <div className="text-2xl font-bold text-red-400">{growthMetrics[activeMetric].beforeValue}</div>
                          <div className="text-xs text-gray-500">Traditional methods</div>
                        </div>
                        
                        <div className="text-center space-y-2">
                          <div className="text-sm text-gray-400 uppercase tracking-wide">After AEON</div>
                          <div className="text-2xl font-bold text-green-400">{growthMetrics[activeMetric].afterValue}</div>
                          <div className="text-xs text-gray-500">AI-powered results</div>
                        </div>
                      </div>

                      {/* Improvement Stats */}
                      <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl p-4">
                        <div className="text-center space-y-2">
                          <div className="text-2xl font-bold text-green-400">{growthMetrics[activeMetric].improvement}</div>
                          <div className="text-sm text-gray-400">in {growthMetrics[activeMetric].timeframe}</div>
                        </div>
                      </div>

                      {/* Live Performance Indicators */}
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
                            <Activity className="h-4 w-4" />
                            <span className="font-bold">98.7%</span>
                          </div>
                          <div className="text-xs text-gray-400">Accuracy</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-purple-400 mb-1">
                            <Zap className="h-4 w-4" />
                            <span className="font-bold">24/7</span>
                          </div>
                          <div className="text-xs text-gray-400">Active</div>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-yellow-400 mb-1">
                            <Rocket className="h-4 w-4" />
                            <span className="font-bold">Auto</span>
                          </div>
                          <div className="text-xs text-gray-400">Scaling</div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Live Revenue Counter */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-green-600/20 border border-green-500/30 rounded-2xl p-4 backdrop-blur-xl"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">${liveRevenue.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Revenue Today</div>
                  </div>
                </motion.div>

                {/* Live Campaigns Counter */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 backdrop-blur-xl"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{campaignsRunning}</div>
                    <div className="text-xs text-gray-400">Live Campaigns</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Traditional vs AI Marketing */}
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
                  Why{' '}
                  <span className="text-green-400">AI Marketing</span> Destroys{' '}
                  <span className="text-red-400">Traditional Marketing</span>
                </h2>
                <p className="text-xl text-gray-400">The old way is dead. The AI way is here.</p>
              </div>

              <div className="max-w-5xl mx-auto">
                <div className="grid grid-cols-1 gap-6">
                  {traditionalVsAI.map((comparison, index) => (
                    <motion.div
                      key={comparison.aspect}
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl"
                    >
                      <div className="text-center md:text-left">
                        <div className="font-semibold text-white">{comparison.aspect}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Traditional</div>
                        <div className="text-red-400 font-semibold">{comparison.traditional}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">AEON AI</div>
                        <div className="text-green-400 font-semibold">{comparison.ai}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Improvement</div>
                        <div className="text-blue-400 font-semibold">{comparison.savings}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-4">
                  Stop wasting time and money on outdated marketing
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
                  Calculate Your Growth Potential
                </h2>
                <p className="text-xl text-gray-400">See how much AEON can accelerate your business</p>
              </div>

              <ROICalculator />
            </motion.div>
          </div>
        </section>

        {/* Final CTA with Henry Ford Quote */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-green-600/10 via-blue-600/10 to-purple-600/10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-12"
            >
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-2xl p-8 backdrop-blur-xl">
                  <blockquote className="text-2xl md:text-3xl text-white italic leading-relaxed mb-4">
                    "Time is money. Don't waste either."
                  </blockquote>
                  <cite className="text-yellow-400 font-semibold">— The AEON Way</cite>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-bold">
                  Start Your Growth Engine Today
                </h2>
                <p className="text-xl text-gray-400">Join thousands who've automated their way to millions</p>
              </div>

              <UrgencyTimer 
                title="Growth Engine Launch: 48 Hours Only"
                subtitle="First 500 businesses get lifetime 40% discount"
              />

              <div className="space-y-6">
                <StartTrialButton size="xl" />
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Guaranteed ROI improvement</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>24/7 AI optimization</span>
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
