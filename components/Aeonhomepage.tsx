'use client'

import Link from 'next/link'
import { ArrowRight, Play, Sparkles, Zap, Users, Trophy, Star, CheckCircle, DollarSign, Clock, Target, Shield, Brain, Rocket, Eye, Crown } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AeonHomepage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [urgencyTimer, setUrgencyTimer] = useState(2847)

  useEffect(() => {
    setIsLoaded(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    const timer = setInterval(() => {
      setUrgencyTimer(prev => prev > 0 ? prev - 1 : 2847)
    }, 1000)

    window.addEventListener('mousemove', handleMouseMove)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      clearInterval(timer)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* HYPNOTIC BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-black to-green-500/10"></div>
        
        {/* GOLDEN VORTEX */}
        <div className="absolute top-1/2 left-1/2 w-[1400px] h-[1400px] -translate-x-1/2 -translate-y-1/2">
          <div className="w-full h-full border border-yellow-500/30 rounded-full animate-spin" style={{ animationDuration: '30s' }}>
            <div className="absolute top-1/2 left-1/2 w-4/5 h-4/5 -translate-x-1/2 -translate-y-1/2 border border-yellow-400/40 rounded-full animate-spin" style={{ animationDuration: '20s', animationDirection: 'reverse' }}>
              <div className="absolute top-1/2 left-1/2 w-4/5 h-4/5 -translate-x-1/2 -translate-y-1/2 border border-yellow-300/50 rounded-full animate-spin" style={{ animationDuration: '15s' }}>
                <div className="absolute top-1/2 left-1/2 w-4/5 h-4/5 -translate-x-1/2 -translate-y-1/2 border-2 border-yellow-500/60 rounded-full animate-spin" style={{ animationDuration: '10s', animationDirection: 'reverse' }}>
                  <div className="absolute top-1/2 left-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full animate-pulse shadow-2xl shadow-yellow-500/50"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MONEY RAIN */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute text-yellow-500 text-xl animate-bounce opacity-70"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.2}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            >
              💰
            </div>
          ))}
        </div>

        {/* WEALTH AURA */}
        <div 
          className="absolute w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none transition-all duration-500 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
      </div>

      {/* URGENCY BAR */}
      <div className="fixed top-0 w-full bg-red-600 text-white text-center py-2 z-50 animate-pulse">
        <span className="font-bold">⚡ LIMITED TIME: {formatTime(urgencyTimer)} left to lock in early pricing ⚡</span>
      </div>

      {/* SINGLE CLEAN NAVIGATION */}
      <nav className="fixed top-10 w-full bg-black/95 backdrop-blur-xl border-b border-yellow-500/30 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse">
                👑 AEON
              </Link>
              <div className="hidden md:flex space-x-8">
                <Link href="/studio" className="text-gray-300 hover:text-yellow-400 transition-all duration-300 hover:scale-105 font-medium">
                  🎬 Studio
                </Link>
                <Link href="/image" className="text-gray-300 hover:text-yellow-400 transition-all duration-300 hover:scale-105 font-medium">
                  🎨 Visual AI
                </Link>
                <Link href="/audio" className="text-gray-300 hover:text-yellow-400 transition-all duration-300 hover:scale-105 font-medium">
                  🎵 Audio AI
                </Link>
                <Link href="/marketing" className="text-gray-300 hover:text-yellow-400 transition-all duration-300 hover:scale-105 font-medium">
                  📈 Growth Suite
                </Link>
                <Link href="/pricing" className="text-gray-300 hover:text-yellow-400 transition-all duration-300 hover:scale-105 font-medium">
                  💎 Pricing
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-4 text-sm">
                <div className="flex items-center text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                  <span>2,847 active creators</span>
                </div>
              </div>
              <Link 
                href="/login" 
                className="text-gray-300 hover:text-yellow-400 transition-all duration-300"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-6 py-2 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/25 animate-pulse"
              >
                START MAKING MONEY
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-yellow-500/20 border border-yellow-500/40 rounded-full text-yellow-400 text-lg font-bold mb-8 animate-bounce">
              <Crown className="w-6 h-6 mr-3 animate-spin" />
              The AI That Makes Millionaires
            </div>
            
            <h1 className="text-5xl md:text-8xl font-black leading-tight mb-8">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse">
                AUTOMATE
              </span>
              <br />
              <span className="text-white">YOUR WAY TO</span>
              <br />
              <span className="bg-gradient-to-r from-green-400 via-green-500 to-green-600 bg-clip-text text-transparent animate-pulse">
                $1M+
              </span>
            </h1>
            
            <p className="text-2xl md:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              While others slave away for pennies, <span className="text-yellow-400 font-bold">AEON users generate $50K-$500K monthly</span> with 
              AI that thinks, creates, and sells <span className="text-green-400 font-bold">24/7/365</span>
            </p>

            {/* SOCIAL PROOF */}
            <div className="flex items-center justify-center space-x-8 mb-8 text-lg">
              <div className="flex items-center text-green-400 font-bold">
                <DollarSign className="w-6 h-6 mr-2 animate-spin" />
                $847M+ Generated
              </div>
              <div className="flex items-center text-blue-400 font-bold">
                <Users className="w-6 h-6 mr-2 animate-pulse" />
                127K+ Millionaires Made
              </div>
              <div className="flex items-center text-purple-400 font-bold">
                <Zap className="w-6 h-6 mr-2 animate-bounce" />
                3.2M+ Videos Created
              </div>
            </div>

            {/* CTA BUTTONS */}
            <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
              <Link 
                href="/signup"
                className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 hover:from-yellow-600 hover:via-yellow-700 hover:to-yellow-800 px-12 py-6 rounded-2xl font-black text-2xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/40 group animate-pulse"
              >
                🚀 START YOUR EMPIRE NOW
                <ArrowRight className="w-8 h-8 ml-3 inline group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                href="/demo"
                className="border-2 border-yellow-500 hover:bg-yellow-500/10 px-8 py-6 rounded-2xl font-bold text-xl transition-all duration-300 hover:scale-105 flex items-center"
              >
                <Play className="w-6 h-6 mr-3" />
                Watch $45K Success Story
              </Link>
            </div>

            {/* RISK REVERSAL */}
            <div className="flex items-center justify-center space-x-8 text-gray-400">
              {[
                "✅ No Credit Card Required",
                "✅ 30-Day Money Back Guarantee", 
                "✅ Cancel Anytime",
                "✅ Results in 24 Hours"
              ].map((benefit, i) => (
                <div key={i} className="flex items-center animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>
                  {benefit}
                </div>
              ))}
            </div>
          </div>

          {/* PROOF SHOWCASE */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-500 hover:scale-105">
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Video Empire</h3>
                <p className="text-gray-300 mb-6">AI creates viral videos that generate $1K-$50K each. No cameras, no editing, no skills needed.</p>
                <div className="text-green-400 font-bold text-xl">Avg: $12,500/video</div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-green-500/30 hover:border-green-500/60 transition-all duration-500 hover:scale-105">
              <div className="text-center">
                <div className="text-6xl mb-4">🤖</div>
                <h3 className="text-2xl font-bold text-green-400 mb-4">AI Army</h3>
                <p className="text-gray-300 mb-6">10+ specialized AI agents work 24/7 to grow your business while you sleep.</p>
                <div className="text-green-400 font-bold text-xl">Replaces $150K team</div>
              </div>
            </div>

            <div className="bg-gray-900/50 backdrop-blur-sm p-8 rounded-2xl border border-blue-500/30 hover:border-blue-500/60 transition-all duration-500 hover:scale-105">
              <div className="text-center">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-2xl font-bold text-blue-400 mb-4">Money Machine</h3>
                <p className="text-gray-300 mb-6">Automated systems that turn views into cash across 15+ revenue streams.</p>
                <div className="text-green-400 font-bold text-xl">92% profit margin</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS STORIES */}
      <section className="py-20 bg-gray-900/30 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            Real People, Real Millions
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                name: "Marcus Chen", 
                before: "$0/month",
                after: "$127K/month",
                story: "Went from broke college student to 6-figure monthly income using AEON's AI video system.",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
              },
              { 
                name: "Sarah Rodriguez", 
                before: "$3K/month",
                after: "$89K/month",
                story: "Single mom who replaced her entire income in 60 days. My kids now go to private school.",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b68b57f2?w=80&h=80&fit=crop&crop=face"
              },
              { 
                name: "David Kim", 
                before: "$8K/month",
                after: "$312K/month",
                story: "Ex-Uber driver who now makes more in a week than I used to make in a year.",
                avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
              }
            ].map((story, i) => (
              <div key={i} className="bg-black/50 backdrop-blur-sm p-8 rounded-2xl border border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-500 hover:scale-105">
                <div className="flex items-center mb-6">
                  <img src={story.avatar} alt={story.name} className="w-16 h-16 rounded-full mr-4 border-2 border-yellow-500" />
                  <div>
                    <div className="font-bold text-xl text-yellow-400">{story.name}</div>
                    <div className="text-gray-400">Verified Success Story</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-center">
                    <div className="text-red-400 font-bold">BEFORE</div>
                    <div className="text-2xl font-bold">{story.before}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-bold">AFTER</div>
                    <div className="text-2xl font-bold text-green-400">{story.after}</div>
                  </div>
                </div>

                <p className="text-gray-300 mb-4">"{story.story}"</p>
                
                <div className="text-center">
                  <div className="text-green-400 text-sm">✅ Income Verified</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CONVERSION */}
      <section className="py-20 bg-gradient-to-r from-yellow-500/20 via-black to-green-500/20 relative z-10">
        <div className="max-w-6xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-7xl font-black mb-8 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent animate-pulse">
            STOP BEING BROKE
          </h2>
          
          <p className="text-2xl md:text-3xl text-gray-300 mb-8 max-w-4xl mx-auto">
            Every second you wait, someone else is getting rich with AEON. 
            <span className="text-red-400 font-bold"> Don't be the one left behind.</span>
          </p>

          {/* SCARCITY COUNTDOWN */}
          <div className="bg-red-600/20 border border-red-500 rounded-2xl p-8 mb-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-red-400 mb-4">⚠️ LIMITED TIME OFFER ⚠️</h3>
            <div className="text-4xl font-black text-white mb-4">{formatTime(urgencyTimer)}</div>
            <p className="text-red-300">Until price increases by 400%</p>
          </div>

          <div className="flex flex-col md:flex-row gap-6 justify-center items-center mb-8">
            <Link 
              href="/signup"
              className="bg-gradient-to-r from-yellow-500 via-yellow-600 to-yellow-700 hover:from-yellow-600 hover:via-yellow-700 hover:to-yellow-800 px-16 py-8 rounded-2xl font-black text-3xl transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-yellow-500/50 group animate-pulse"
            >
              💰 CLAIM YOUR MONEY MACHINE
              <ArrowRight className="w-10 h-10 ml-4 inline group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="text-gray-400 text-lg">
            Join 127,000+ people who chose wealth over wage slavery
          </div>
        </div>
      </section>

      {/* TRUST FOOTER */}
      <footer className="border-t border-yellow-500/30 py-12 bg-black/90 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              👑 AEON - The Money Machine
            </h3>
            <p className="text-gray-400 mb-8">
              Built for people who refuse to stay poor. Protected by enterprise-grade security. Trusted by millionaires worldwide.
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
              <div>🔒 Bank-Level Security</div>
              <div>📞 24/7 Millionaire Support</div>
              <div>💳 PCI DSS Compliant</div>
              <div>🏛️ FDIC Insured</div>
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-8 right-8 z-50">
        <Link 
          href="/signup"
          className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 px-6 py-4 rounded-full font-bold transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-yellow-500/30 animate-bounce"
        >
          💰 GET RICH NOW
        </Link>
      </div>
    </div>
  )
}