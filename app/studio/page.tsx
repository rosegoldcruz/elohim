'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Video, Play, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { SocialProof } from '@/components/ui/social-proof'
import { StartTrialButton } from '@/components/ui/start-trial-button'

export default function StudioPage() {
  const [activeDemo, setActiveDemo] = useState(0)
  const [liveViews, setLiveViews] = useState(2847293)

  const demoVideos = [
    {
      title: "Sarah's $2M Product Launch",
      views: "2.3M views",
      revenue: "$2.1M generated",
      thumbnail: "🚀",
      description: "Watch how Sarah turned a simple idea into viral content"
    },
    {
      title: "Marcus's TikTok Empire",
      views: "15.7M views",
      revenue: "$500K generated",
      thumbnail: "🎬",
      description: "From 0 to 15M views in 30 days"
    },
    {
      title: "Emma's Brand Revolution",
      views: "5.2M views",
      revenue: "$1.3M generated",
      thumbnail: "💼",
      description: "Complete brand transformation in minutes"
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

      {/* Hero Section */}
      <section className="pt-20 pb-16 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-black to-green-500/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-400 text-lg font-bold mb-8">
              <Video className="w-6 h-6 mr-3" />
              The $10M Video Studio
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black leading-tight mb-8">
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                HOLLYWOOD
              </span>
              <br />
              <span className="text-white">IN YOUR</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
                BROWSER
              </span>
            </h1>
            
            <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
              Access the same AI video studio that creates <span className="text-yellow-400 font-bold">$100K+ monthly income</span> for thousands of creators. 
              No cameras, no crew, no experience needed.
            </p>

            <div className="flex flex-col md:flex-row gap-6 justify-center mb-16">
              <Link 
                href="/signup"
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-12 py-6 rounded-2xl font-black text-2xl hover:scale-105 transition-all"
              >
                🎬 ENTER THE STUDIO
              </Link>
              <button className="border-2 border-yellow-500 px-8 py-6 rounded-2xl font-bold text-xl hover:bg-yellow-500/10 transition-all">
                <Play className="w-6 h-6 mr-3 inline" />
                Watch Demo
              </button>
            </div>
          </div>

          {/* Studio Features */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-900/50 p-8 rounded-2xl border border-yellow-500/30 text-center">
              <div className="text-6xl mb-6">🎭</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">AI Director</h3>
              <p className="text-gray-300">Automatically creates shot lists, angles, and scenes that convert viewers into customers.</p>
            </div>

            <div className="bg-gray-900/50 p-8 rounded-2xl border border-yellow-500/30 text-center">
              <div className="text-6xl mb-6">🎨</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Visual Effects</h3>
              <p className="text-gray-300">Hollywood-grade effects that make your videos look like million-dollar productions.</p>
            </div>

            <div className="bg-gray-900/50 p-8 rounded-2xl border border-yellow-500/30 text-center">
              <div className="text-6xl mb-6">⚡</div>
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Instant Render</h3>
              <p className="text-gray-300">From idea to finished video in under 3 minutes. While others edit for hours, you're already viral.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 bg-gray-900/30">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-8 text-yellow-400">Ready to Build Your Video Empire?</h2>
          <p className="text-xl text-gray-300 mb-8">Join 50,000+ creators making $10K-$500K monthly with AEON Studio</p>
          
          <Link 
            href="/signup"
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-12 py-6 rounded-2xl font-black text-2xl hover:scale-105 transition-all inline-flex items-center"
          >
            🚀 START YOUR EMPIRE
            <ArrowRight className="w-8 h-8 ml-3" />
          </Link>
        </div>
      </section>
    </div>
  )
}