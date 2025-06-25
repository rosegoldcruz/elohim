'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Play, Sparkles, Zap, Users, Trophy, Star, CheckCircle, DollarSign, Clock, Target, Shield, Brain, Rocket, Eye, Crown, TrendingUp, Award, Globe, Menu, X } from 'lucide-react'
import UrgencyTimer from './conversion/urgency-timer'
import SocialProof from './conversion/social-proof'
import ROICalculator from './conversion/roi-calculator'
import { StartTrialButton, WatchDemoButton, ClaimSpotButton, ScheduleCallButton } from './conversion/cta-button'

export default function ConversionHomepage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const creatorItems = [
    { name: 'Video Studio', href: '/studio', icon: Play },
    { name: 'Image Creator', href: '/image', icon: Star },
    { name: 'Audio Studio', href: '/audio', icon: Users }
  ]

  const businessItems = [
    { name: 'AI Agents', href: '/agents', icon: Brain },
    { name: 'Growth Engine', href: '/growth', icon: TrendingUp }
  ]

  const testimonials = [
    {
      name: "Sarah M.",
      role: "TikTok Creator",
      content: "AEON turned my random shower thoughts into viral masterpieces. 6 AI directors working on MY vision? Insane!",
      revenue: "2.3M followers",
      image: "🎬"
    },
    {
      name: "Marcus",
      role: "Content Creator",
      content: "While others pay $35 for 10-second clips, I get complete 60-second videos for $20. AEON is a cheat code.",
      revenue: "150 videos/month",
      image: "📹"
    },
    {
      name: "Emma",
      role: "Creative Director",
      content: "My friends think I hired a Hollywood studio. It's just AEON's Orchestra Mode making magic happen.",
      revenue: "Going viral daily",
      image: "📸"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-black to-purple-500/5"></div>
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400/30 rounded-full"
              animate={{
                y: [0, -100, 0],
                x: [0, Math.random() * 100 - 50, 0],
                opacity: [0.3, 0.8, 0.3]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              } as React.CSSProperties}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <header className="relative z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">AEON</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <div className="flex items-center space-x-6">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Creator Tools</span>
                {creatorItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>

              <div className="w-px h-6 bg-gray-700"></div>

              <div className="flex items-center space-x-6">
                <span className="text-xs text-gray-500 uppercase tracking-wide">For Business</span>
                {businessItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </nav>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <SocialProof variant="counter" className="w-32" />
              <Link
                href="/login"
                className="px-4 py-2 text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Sign In
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open mobile menu"
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-80 bg-black/90 backdrop-blur-xl border-l border-white/10 z-50 md:hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                      <span className="text-black font-bold">A</span>
                    </div>
                    <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">AEON</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close mobile menu"
                    className="p-2 rounded-lg hover:bg-white/10"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-6">
                  <div className="space-y-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide px-3">Creator Tools</div>
                    {creatorItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="border-t border-gray-700 pt-3 space-y-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide px-3">For Business</div>
                    {businessItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    ))}
                  </div>
                </nav>

                <div className="mt-8 space-y-4">
                  <SocialProof variant="counter" />
                  <Link
                    href="/login"
                    className="block text-center px-4 py-3 text-purple-400 hover:text-purple-300 font-medium transition-colors border border-purple-500/30 rounded-xl"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Scroll 1: Emotional Hook + Hero */}
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
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
                  >
                    Turn Any Wild Idea Into{' '}
                    <span className="bg-gradient-to-r from-purple-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                      Cinematic Reality
                    </span>
                  </motion.h1>

                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl text-gray-300 leading-relaxed"
                  >
                    6 AI Directors collaborate on YOUR vision. Complete 60-second videos, not just clips.{' '}
                    <span className="text-orange-400 font-semibold">Orchestra Mode: All models for the price of one.</span>
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-6"
                >
                  {/* Free Tier Highlight */}
                  <div className="bg-gradient-to-r from-purple-500/20 to-orange-500/20 border border-purple-500/40 rounded-2xl p-6 max-w-2xl mx-auto">
                    <div className="text-center space-y-2">
                      <p className="text-orange-400 font-bold text-lg">🎬 FREE FOREVER TIER</p>
                      <p className="text-white font-semibold">250 credits monthly • 2-3 complete videos • All 6 AI models</p>
                      <p className="text-sm text-gray-400">Credits never expire • No credit card required</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <StartTrialButton size="xl" />
                    <WatchDemoButton size="xl" />
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center gap-6 text-sm text-gray-400"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Start creating in 60 seconds</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: Success Montage */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl">
                  <SocialProof variant="testimonial" />
                </div>
                
                {/* Floating Stats */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-green-600/20 border border-green-500/30 rounded-2xl p-4 backdrop-blur-xl"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">$50M+</div>
                    <div className="text-xs text-gray-400">Revenue Generated</div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -bottom-4 -left-4 bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 backdrop-blur-xl"
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">10K+</div>
                    <div className="text-xs text-gray-400">Active Creators</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Creator Value Proposition */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600/5 via-pink-600/5 to-cyan-600/5">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-2xl md:text-4xl font-bold text-white">
                  Whether You're Just Starting or Already Famous
                </h2>
                <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                  AEON helps creators at every level turn their passion into profit
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  {
                    title: "New Creators",
                    subtitle: "0-10K followers",
                    description: "Get your first viral video and start building your audience",
                    benefits: ["Stand out from the crowd", "Professional-looking content", "No expensive equipment needed"],
                    icon: "🌱"
                  },
                  {
                    title: "Growing Creators",
                    subtitle: "10K-100K followers",
                    description: "Scale your content and start making real money",
                    benefits: ["Consistent viral content", "Brand partnership ready", "Multiple revenue streams"],
                    icon: "📈"
                  },
                  {
                    title: "Established Creators",
                    subtitle: "100K+ followers",
                    description: "Maximize your earnings and build your empire",
                    benefits: ["Premium brand deals", "Multiple platforms", "Passive income streams"],
                    icon: "👑"
                  }
                ].map((segment, index) => (
                  <motion.div
                    key={segment.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4"
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-3">{segment.icon}</div>
                      <h3 className="text-xl font-bold text-white">{segment.title}</h3>
                      <p className="text-purple-400 text-sm">{segment.subtitle}</p>
                    </div>

                    <p className="text-gray-300 text-center">{segment.description}</p>

                    <div className="space-y-2">
                      {segment.benefits.map((benefit, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300">{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Scroll 2: Credibility Signals */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">
                  Trusted by <span className="text-yellow-400">50,000+</span> Creators Getting{' '}
                  <span className="text-green-400">Millions</span> of Views
                </h2>
                <p className="text-xl text-gray-400">Join creators who turned their passion into their paycheck</p>
              </div>

              {/* Partner Logos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center opacity-60">
                {['TikTok', 'YouTube', 'Shopify', 'Stripe'].map((partner) => (
                  <div key={partner} className="text-center">
                    <div className="h-12 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="font-semibold text-gray-300">{partner}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Stats */}
              <SocialProof variant="stats" />

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-6">
                {[
                  { icon: Shield, text: "SOC2 Compliant" },
                  { icon: Globe, text: "99.9% Uptime" },
                  { icon: Award, text: "Enterprise Grade" }
                ].map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <badge.icon className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium">{badge.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Scroll 3: Key Features Snapshot */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-16"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">
                  6 AI Directors Working on{' '}
                  <span className="bg-gradient-to-r from-purple-400 to-orange-400 bg-clip-text text-transparent">
                    YOUR Vision
                  </span>
                </h2>
                <p className="text-xl text-gray-400">While others give you clips, we give you complete cinematic experiences</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    icon: Play,
                    title: "Orchestra Mode",
                    subtitle: "6 AI Directors create your vision simultaneously",
                    color: "from-purple-600 to-pink-600",
                    href: "/studio"
                  },
                  {
                    icon: Star,
                    title: "Complete Videos",
                    subtitle: "60-second finished videos, not just 10-second clips",
                    color: "from-orange-600 to-red-600",
                    href: "/studio"
                  },
                  {
                    icon: Crown,
                    title: "Credits Never Expire",
                    subtitle: "Unlike Hailuo's monthly reset, yours roll over forever",
                    color: "from-yellow-500 to-orange-500",
                    href: "/pricing"
                  },
                  {
                    icon: Rocket,
                    title: "Creative Playground",
                    subtitle: "Turn wild ideas into content people actually want to watch",
                    color: "from-green-600 to-emerald-600",
                    href: "/studio"
                  }
                ].map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    className="group cursor-pointer"
                  >
                    <Link href={feature.href}>
                      <div className={`bg-gradient-to-r ${feature.color} p-6 rounded-2xl h-full space-y-4 hover:shadow-2xl transition-all duration-300`}>
                        <feature.icon className="h-12 w-12 text-white mx-auto" />
                        <div className="text-center space-y-2">
                          <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                          <p className="text-white/80 text-sm">{feature.subtitle}</p>
                        </div>
                        <div className="flex justify-center">
                          <span className="text-white/60 text-sm group-hover:text-white transition-colors">
                            Try Now →
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Scroll 4: Video Demonstration */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">
                  Watch Sarah Go From{' '}
                  <span className="text-red-400">500 Followers</span> to{' '}
                  <span className="text-green-400">2.3M</span> in 6 Months
                </h2>
                <p className="text-xl text-gray-400">Real creator. Real growth. Real AEON.</p>
              </div>

              {/* Video Player */}
              <div className="relative max-w-4xl mx-auto">
                <div className="aspect-video bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border border-purple-500/30 rounded-2xl backdrop-blur-xl flex items-center justify-center">
                  <button
                    type="button"
                    aria-label="Play video demonstration"
                    className="w-20 h-20 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  >
                    <Play className="h-8 w-8 text-white ml-1" />
                  </button>
                </div>

                {/* Video Stats Overlay */}
                <div className="absolute -bottom-4 -right-4 bg-green-600/20 border border-green-500/30 rounded-xl p-4 backdrop-blur-xl">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-400">2.3M Followers</div>
                    <div className="text-xs text-gray-400">In 6 Months</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-105"
                >
                  Try Sarah's Exact Strategy
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Scroll 5: Social Proof Tsunami */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-16"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">
                  Real Results from Real Creators
                </h2>
                <p className="text-xl text-gray-400">See what other creators are saying</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.name}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4"
                  >
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>

                    <blockquote className="text-white italic">
                      "{testimonial.content}"
                    </blockquote>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{testimonial.image}</span>
                        <div>
                          <p className="font-semibold text-white">{testimonial.name}</p>
                          <p className="text-sm text-gray-400">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">{testimonial.revenue}</p>
                        <p className="text-xs text-gray-400">Generated</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Live Activity Feed */}
              <div className="max-w-2xl mx-auto">
                <SocialProof variant="live-activity" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Scroll 6: High-Urgency CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-cyan-600/10">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <h2 className="text-3xl md:text-5xl font-bold">
                  Join <span className="text-yellow-400">12,847</span> Creators Who{' '}
                  <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                    Went Viral
                  </span>{' '}
                  This Week
                </h2>
                <p className="text-xl text-gray-400">Your breakthrough moment is one video away</p>
              </div>

              {/* Urgency Timer */}
              <div className="max-w-2xl mx-auto">
                <UrgencyTimer />
              </div>

              {/* ROI Calculator */}
              <div className="max-w-4xl mx-auto">
                <ROICalculator />
              </div>

              {/* Final CTAs */}
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <ClaimSpotButton size="xl" />
                  <ScheduleCallButton size="xl" />
                </div>

                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>60-day money-back guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>Cancel anytime</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>24/7 support</span>
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
