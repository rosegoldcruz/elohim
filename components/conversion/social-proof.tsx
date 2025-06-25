"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, TrendingUp, DollarSign, Star, Play } from 'lucide-react'

interface SocialProofProps {
  variant?: 'counter' | 'testimonial' | 'stats' | 'live-activity'
  className?: string
}

const liveActivities = [
  { user: "Sarah M.", action: "generated $2,847 in revenue", time: "2 min ago", avatar: "🚀" },
  { user: "Mike Chen", action: "created viral TikTok (1.2M views)", time: "5 min ago", avatar: "🎬" },
  { user: "Emma K.", action: "launched AI campaign", time: "8 min ago", avatar: "⚡" },
  { user: "David R.", action: "built brand identity", time: "12 min ago", avatar: "🎨" },
  { user: "Lisa T.", action: "produced hit podcast episode", time: "15 min ago", avatar: "🎵" }
]

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "E-commerce Founder",
    content: "AEON turned my side hustle into $2M ARR in 18 months. The AI literally works while I sleep.",
    revenue: "$2.1M ARR",
    avatar: "👩‍💼"
  },
  {
    name: "Marcus Chen",
    role: "Content Creator",
    content: "My videos went from 1K to 1M views overnight. AEON cracked the viral code.",
    revenue: "10M+ views",
    avatar: "🎬"
  },
  {
    name: "Emma Rodriguez",
    role: "Marketing Agency",
    content: "We replaced our entire creative team with AEON. 10x faster, 90% cheaper.",
    revenue: "$500K saved",
    avatar: "💼"
  }
]

export default function SocialProof({ variant = 'counter', className = "" }: SocialProofProps) {
  const [currentActivity, setCurrentActivity] = useState(0)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [liveCount, setLiveCount] = useState(47293)

  useEffect(() => {
    if (variant === 'live-activity') {
      const interval = setInterval(() => {
        setCurrentActivity((prev) => (prev + 1) % liveActivities.length)
      }, 3000)
      return () => clearInterval(interval)
    }

    if (variant === 'testimonial') {
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
      }, 5000)
      return () => clearInterval(interval)
    }

    if (variant === 'counter') {
      const interval = setInterval(() => {
        setLiveCount(prev => prev + Math.floor(Math.random() * 3) + 1)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [variant])

  if (variant === 'counter') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl ${className}`}
      >
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <Play className="h-5 w-5" />
            <span className="font-semibold">Live Activity</span>
          </div>
          <motion.div
            key={liveCount}
            initial={{ scale: 1.2, color: '#10b981' }}
            animate={{ scale: 1, color: '#ffffff' }}
            className="text-3xl font-bold"
          >
            {liveCount.toLocaleString()}
          </motion.div>
          <p className="text-sm text-neutral-400">Videos created today</p>
        </div>
      </motion.div>
    )
  }

  if (variant === 'live-activity') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xl ${className}`}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-400">Live Activity</span>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentActivity}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{liveActivities[currentActivity].avatar}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {liveActivities[currentActivity].user}
                </p>
                <p className="text-xs text-neutral-400">
                  {liveActivities[currentActivity].action}
                </p>
              </div>
              <span className="text-xs text-neutral-500">
                {liveActivities[currentActivity].time}
              </span>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }

  if (variant === 'testimonial') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-cyan-600/20 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-xl ${className}`}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTestimonial}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            
            <blockquote className="text-white italic">
              "{testimonials[currentTestimonial].content}"
            </blockquote>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{testimonials[currentTestimonial].avatar}</span>
                <div>
                  <p className="font-semibold text-white">{testimonials[currentTestimonial].name}</p>
                  <p className="text-sm text-neutral-400">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-400">{testimonials[currentTestimonial].revenue}</p>
                <p className="text-xs text-neutral-400">Generated</p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }

  if (variant === 'stats') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`grid grid-cols-3 gap-4 ${className}`}
      >
        {[
          { icon: Users, value: "10,000+", label: "Active Creators", color: "text-blue-400" },
          { icon: DollarSign, value: "$50M+", label: "Revenue Generated", color: "text-green-400" },
          { icon: TrendingUp, value: "847", label: "Started This Week", color: "text-purple-400" }
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4 text-center backdrop-blur-xl"
          >
            <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-xs text-neutral-400">{stat.label}</div>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  return null
}
