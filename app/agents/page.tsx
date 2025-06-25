'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Brain, Sparkles, Crown, Target, Zap, DollarSign, Check, TrendingUp, Users, Clock, Star, Eye, Heart, Share2, Download, Bot, Cpu, Network, Shield, Infinity, Award } from 'lucide-react'
import { StartTrialButton, WatchDemoButton, ClaimSpotButton } from '@/components/conversion/cta-button'
import SocialProof from '@/components/conversion/social-proof'
import UrgencyTimer from '@/components/conversion/urgency-timer'

export default function AgentsPage() {
  const [activeAgent, setActiveAgent] = useState(0)
  const [agentsDeployed, setAgentsDeployed] = useState(12847)
  const [earlyAccessSpots, setEarlyAccessSpots] = useState(47)

  const aiAgents = [
    {
      name: "Marcus",
      role: "Content Creator",
      avatar: "🤖",
      specialty: "Video & Social Media",
      description: "Creates viral content 24/7 across all platforms",
      capabilities: ["Script Writing", "Video Editing", "Trend Analysis", "Audience Engagement"],
      results: "Generated 50M+ views for clients",
      workHours: "24/7/365",
      cost: "$0.50/hour vs $50/hour human"
    },
    {
      name: "Sophia",
      role: "Marketing Director",
      avatar: "👩‍💼",
      specialty: "Campaign Management",
      description: "Manages million-dollar campaigns with perfect precision",
      capabilities: ["Strategy Planning", "Budget Optimization", "A/B Testing", "ROI Tracking"],
      results: "Increased client ROI by 340%",
      workHours: "24/7/365",
      cost: "$0.75/hour vs $150/hour human"
    },
    {
      name: "Alex",
      role: "Sales Manager",
      avatar: "💼",
      specialty: "Revenue Generation",
      description: "Converts leads into customers while you sleep",
      capabilities: ["Lead Qualification", "Follow-up Sequences", "Objection Handling", "Deal Closing"],
      results: "Closed $2.3M in deals last month",
      workHours: "24/7/365",
      cost: "$1.00/hour vs $200/hour human"
    }
  ]

  const humanVsAI = [
    { aspect: "Availability", human: "8 hours/day", ai: "24/7/365", advantage: "ai" },
    { aspect: "Sick Days", human: "10-15 days/year", ai: "0 days", advantage: "ai" },
    { aspect: "Salary", human: "$80K-200K/year", ai: "$3K-8K/year", advantage: "ai" },
    { aspect: "Training", human: "Weeks to months", ai: "Instant", advantage: "ai" },
    { aspect: "Mistakes", human: "Human error prone", ai: "99.9% accuracy", advantage: "ai" },
    { aspect: "Scaling", human: "Hire & train each", ai: "Instant duplication", advantage: "ai" }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveAgent((prev) => (prev + 1) % aiAgents.length)
      setAgentsDeployed(prev => prev + Math.floor(Math.random() * 5) + 1)
      setEarlyAccessSpots(prev => Math.max(1, prev - Math.floor(Math.random() * 2)))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Background Animation */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-black to-purple-500/5"></div>
        
        {/* Floating AI Elements */}
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-blue-400/20 text-3xl"
              animate={{
                y: [0, -60, 0],
                rotate: [0, 180, 360],
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 8 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              } as React.CSSProperties}
            >
              {['🤖', '🧠', '⚡', '🎯', '💎'][Math.floor(Math.random() * 5)]}
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
              <div className="hidden md:flex items-center gap-2 bg-red-600/20 border border-red-500/30 rounded-full px-3 py-1">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-400 text-sm font-semibold">{earlyAccessSpots} spots left</span>
              </div>
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Sign In</Link>
              <ClaimSpotButton size="sm" />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section: AI Employees That Never Sleep */}
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
                    className="inline-flex items-center px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 font-semibold"
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Early Access: AI Workforce Revolution
                  </motion.div>
                  
                  <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight"
                  >
                    Hire{' '}
                    <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      AI Employees
                    </span>{' '}
                    That Never{' '}
                    <span className="text-red-400 line-through">Sleep</span>,{' '}
                    Never{' '}
                    <span className="text-red-400 line-through">Quit</span>,{' '}
                    Never{' '}
                    <span className="text-red-400 line-through">Forget</span>
                  </motion.h1>
                  
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl text-gray-300 leading-relaxed"
                  >
                    Stop paying{' '}
                    <span className="text-red-400 font-semibold line-through">$200K+ salaries</span> for{' '}
                    <span className="text-red-400 font-semibold line-through">unreliable humans</span>. Deploy{' '}
                    <span className="text-blue-400 font-semibold">AI agents</span> with{' '}
                    <span className="text-purple-400 font-semibold">perfect memory</span> and{' '}
                    <span className="text-green-400 font-semibold">infinite capacity</span>.
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <ClaimSpotButton size="xl" />
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
                    <span>Exclusive early access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>First 100 users only</span>
                  </div>
                </motion.div>
              </motion.div>

              {/* Right: AI Agent Showcase */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="relative"
              >
                <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-600/20 border border-blue-500/30 rounded-3xl p-8 backdrop-blur-xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeAgent}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Agent Profile */}
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                          {aiAgents[activeAgent].avatar}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{aiAgents[activeAgent].name}</h3>
                          <p className="text-blue-400">{aiAgents[activeAgent].role}</p>
                          <p className="text-sm text-gray-400">{aiAgents[activeAgent].specialty}</p>
                        </div>
                        <div className="ml-auto">
                          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                          <div className="text-xs text-green-400 mt-1">Online</div>
                        </div>
                      </div>

                      {/* Agent Description */}
                      <p className="text-gray-300">{aiAgents[activeAgent].description}</p>

                      {/* Capabilities */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-white">Core Capabilities:</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {aiAgents[activeAgent].capabilities.map((capability, index) => (
                            <div key={capability} className="flex items-center gap-2 text-sm">
                              <Check className="h-3 w-3 text-green-400" />
                              <span className="text-gray-300">{capability}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                        <div>
                          <div className="text-sm text-gray-400">Results</div>
                          <div className="font-semibold text-green-400">{aiAgents[activeAgent].results}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Availability</div>
                          <div className="font-semibold text-blue-400">{aiAgents[activeAgent].workHours}</div>
                        </div>
                      </div>

                      {/* Cost Comparison */}
                      <div className="bg-green-600/20 border border-green-500/30 rounded-xl p-4">
                        <div className="text-center">
                          <div className="text-sm text-gray-400 mb-1">Cost Savings</div>
                          <div className="font-bold text-green-400">{aiAgents[activeAgent].cost}</div>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
                
                {/* Live Deployment Counter */}
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-4 -right-4 bg-blue-600/20 border border-blue-500/30 rounded-2xl p-4 backdrop-blur-xl"
                >
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-400">{agentsDeployed.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Agents Deployed</div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Human vs AI Comparison */}
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
                  <span className="text-blue-400">AI Employees</span> Beat{' '}
                  <span className="text-red-400">Human Employees</span>
                </h2>
                <p className="text-xl text-gray-400">The numbers don't lie</p>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="grid grid-cols-1 gap-4">
                  {humanVsAI.map((comparison, index) => (
                    <motion.div
                      key={comparison.aspect}
                      initial={{ opacity: 0, x: -50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="grid grid-cols-3 gap-4 p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-xl"
                    >
                      <div className="text-center">
                        <div className="font-semibold text-white mb-2">{comparison.aspect}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Human Employee</div>
                        <div className="text-red-400 font-semibold">{comparison.human}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">AI Employee</div>
                        <div className="text-green-400 font-semibold">{comparison.ai}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-2xl font-bold text-white mb-4">
                  Save <span className="text-green-400">$180K+</span> per employee per year
                </p>
                <ClaimSpotButton size="lg" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Exclusive Early Access CTA */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-cyan-600/10">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center space-y-12"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center px-6 py-3 bg-red-600/20 border border-red-500/30 rounded-full text-red-400 font-bold">
                  <Crown className="w-5 h-5 mr-2" />
                  EXCLUSIVE EARLY ACCESS
                </div>
                <h2 className="text-3xl md:text-5xl font-bold">
                  Join the AI Workforce Revolution
                </h2>
                <p className="text-xl text-gray-400">Be among the first 100 to deploy AI employees</p>
              </div>

              <UrgencyTimer 
                title={`Only ${earlyAccessSpots} Early Access Spots Remaining`}
                subtitle="First 100 users get lifetime 50% discount"
              />

              <div className="space-y-6">
                <ClaimSpotButton size="xl" />
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Exclusive early access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Lifetime 50% discount</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-400" />
                    <span>Priority support</span>
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
