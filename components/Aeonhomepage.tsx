'use client'

import Link from 'next/link'
import { ArrowRight, Play, Sparkles, Zap, Users, Trophy, Star, CheckCircle, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* ANIMATED BACKGROUND VORTEX */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-purple-500/5 to-blue-500/10 animate-pulse"></div>
        
        {/* SPINNING VORTEX */}
        <div className="absolute top-1/2 left-1/2 w-[1200px] h-[1200px] -translate-x-1/2 -translate-y-1/2">
          <div className="w-full h-full border border-orange-500/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}>
            <div className="absolute top-1/2 left-1/2 w-4/5 h-4/5 -translate-x-1/2 -translate-y-1/2 border border-orange-500/30 rounded-full animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }}>
              <div className="absolute top-1/2 left-1/2 w-4/5 h-4/5 -translate-x-1/2 -translate-y-1/2 border border-orange-500/40 rounded-full animate-spin" style={{ animationDuration: '10s' }}>
                <div className="absolute top-1/2 left-1/2 w-4/5 h-4/5 -translate-x-1/2 -translate-y-1/2 border border-orange-500/50 rounded-full animate-spin" style={{ animationDuration: '8s', animationDirection: 'reverse' }}>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* NEON STREAKS */}
        <div className="absolute inset-0">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-32 bg-gradient-to-b from-transparent via-orange-500/60 to-transparent animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            ></div>
          ))}
        </div>

        {/* FLOATING PARTICLES */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-500 rounded-full animate-pulse opacity-60"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.3}s`,
                animation: `float 6s ease-in-out infinite ${i * 0.3}s, pulse 2s ease-in-out infinite`,
              }}
            ></div>
          ))}
        </div>

        {/* MOUSE FOLLOW GLOW */}
        <div 
          className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none transition-all duration-700 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
      </div>

      {/* CUSTOM ANIMATIONS */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-30px) translateX(5px); }
        }
        @keyframes slideInUp {
          0% { transform: translateY(100px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInLeft {
          0% { transform: translateX(-100px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          0% { transform: translateX(100px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        .animate-slideInUp { animation: slideInUp 1s ease-out; }
        .animate-slideInLeft { animation: slideInLeft 1s ease-out; }
        .animate-slideInRight { animation: slideInRight 1s ease-out; }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-xl border-b border-orange-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent animate-pulse">
                AEON
              </Link>
              <div className="hidden md:flex space-x-8">
                <Link href="/pricing" className="text-gray-300 hover:text-orange-400 transition-all duration-300 hover:scale-105">
                  Pricing
                </Link>
                <Link href="/marketing" className="text-gray-300 hover:text-orange-400 transition-all duration-300 hover:scale-105">
                  Marketing Tools
                </Link>
                <Link href="/analytics" className="text-gray-300 hover:text-orange-400 transition-all duration-300 hover:scale-105">
                  Analytics
                </Link>
                <Link href="/image" className="text-gray-300 hover:text-orange-400 transition-all duration-300 hover:scale-105">
                  Image AI
                </Link>
                <Link href="/audio" className="text-gray-300 hover:text-orange-400 transition-all duration-300 hover:scale-105">
                  Audio AI
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-300 hover:text-orange-400 transition-all duration-300"
              >
                Sign In
              </Link>
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-6 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`${isLoaded ? 'animate-slideInLeft' : 'opacity-0'}`}>
              <div className="inline-flex items-center px-4 py-2 bg-orange-500/20 border border-orange-500/40 rounded-full text-orange-400 text-sm font-medium mb-6 animate-pulse">
                <DollarSign className="w-4 h-4 mr-2 animate-spin" />
                Turn Ideas Into Revenue
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Create
                <span className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent block animate-pulse">
                  Million-Dollar
                </span>
                Videos in Minutes
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Join 50,000+ creators who've generated <span className="text-orange-400 font-semibold animate-pulse">$580M+ in revenue</span> using AEON's AI video studio. No experience required - just pure profit potential.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/signup"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-8 py-4 rounded-lg font-semibold transition-all duration-300 inline-flex items-center justify-center text-lg hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25 group"
                >
                  Start Making Money Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/pricing"
                  className="border border-orange-500/50 hover:border-orange-500 px-8 py-4 rounded-lg font-semibold transition-all duration-300 inline-flex items-center justify-center hover:scale-105 hover:bg-orange-500/10"
                >
                  View Pricing Plans
                </Link>
              </div>
              
              <div className="flex items-center text-sm text-gray-400 mb-6">
                <Users className="w-4 h-4 mr-2 animate-pulse" />
                Join 50,000+ profitable creators worldwide
              </div>

              {/* Animated Social Proof */}
              <div className="flex items-center space-x-1 mb-4">
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="w-5 h-5 text-orange-400 fill-current animate-pulse" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
                <span className="ml-2 text-gray-300">4.9/5 from 12,000+ reviews</span>
              </div>
            </div>
            
            <div className={`relative ${isLoaded ? 'animate-slideInRight' : 'opacity-0'}`}>
              <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl overflow-hidden border border-orange-500/30 hover:border-orange-500/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20">
                {/* DEMO VIDEO */}
                <video 
                  className="w-full h-auto"
                  poster="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&h=360&fit=crop"
                  controls
                  preload="metadata"
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                
                {/* Animated overlay */}
                <div className="absolute inset-0 border-2 border-orange-500/20 rounded-2xl animate-pulse"></div>
              </div>
              
              {/* FLOATING REVENUE BADGES */}
              <div className="absolute -top-4 -right-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium animate-bounce shadow-lg shadow-green-500/25">
                💰 $45K Generated
              </div>
              <div className="absolute -bottom-4 -left-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm animate-bounce shadow-lg shadow-blue-500/25" style={{ animationDelay: '0.5s' }}>
                🎬 8.2M Views
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ANIMATED REVENUE STATS */}
      <section className="py-20 bg-gray-900/30 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Real Results From Real Creators
            </h2>
            <p className="text-xl text-gray-300">
              See how AEON users are monetizing their content
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 mb-16">
            {[
              { value: '$580M+', label: 'Total Revenue Generated', color: 'text-green-400', delay: '0s' },
              { value: '8.2M', label: 'Videos Created', color: 'text-blue-400', delay: '0.2s' },
              { value: '142', label: 'Avg. Videos Per User', color: 'text-purple-400', delay: '0.4s' },
              { value: '92%', label: 'Profit Increase', color: 'text-orange-400', delay: '0.6s' }
            ].map((stat, i) => (
              <div key={i} className="text-center transform hover:scale-110 transition-all duration-300" style={{ animationDelay: stat.delay }}>
                <div className={`text-4xl font-bold ${stat.color} mb-2 animate-pulse`}>{stat.value}</div>
                <div className="text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* ANIMATED FEATURE CARDS */}
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Lightning Fast Creation', desc: 'Generate viral-ready videos in under 3 minutes. While others spend hours editing, you\'re already profiting.', delay: '0s' },
              { icon: Sparkles, title: 'AI That Converts', desc: 'Our AI analyzes 10M+ viral videos to create content that actually makes money. Not just views - revenue.', delay: '0.3s' },
              { icon: Trophy, title: 'Studio-Grade Quality', desc: '4K videos that look like you hired a $10K/month video team. Clients will think you\'re a Hollywood studio.', delay: '0.6s' }
            ].map((feature, i) => (
              <div key={i} className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/10 group" style={{ animationDelay: feature.delay }}>
                <div className="bg-orange-500/20 w-12 h-12 rounded-lg flex items-center justify-center mb-6 group-hover:bg-orange-500/30 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-orange-500 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-semibold mb-4 group-hover:text-orange-400 transition-colors">{feature.title}</h3>
                <p className="text-gray-300 mb-6">{feature.desc}</p>
                <Link 
                  href="/signup" 
                  className="text-orange-400 hover:text-orange-300 font-medium inline-flex items-center group-hover:translate-x-2 transition-transform"
                >
                  Start Creating → 
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ANIMATED SUCCESS STORIES */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            Success Stories That Pay the Bills
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { name: 'Marcus Chen', role: 'TikTok Creator', revenue: '$45,000/month', story: 'Made $45K in my first month using AEON videos. I went from 0 followers to 2.1M and landed 3 brand deals. This platform is literally printing money.', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50&h=50&fit=crop&crop=face', delay: '0s' },
              { name: 'Sarah Rodriguez', role: 'Business Owner', revenue: '$15,000/month saved', story: 'Replaced my entire video team with AEON. Saved $15K/month and my conversion rates actually INCREASED. My clients think I upgraded to some expensive agency.', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b68b57f2?w=50&h=50&fit=crop&crop=face', delay: '0.5s' }
            ].map((story, i) => (
              <div key={i} className="bg-gray-800/50 backdrop-blur-sm p-8 rounded-2xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/10" style={{ animationDelay: story.delay }}>
                <div className="flex items-center mb-4">
                  <img src={story.avatar} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <div className="font-semibold">{story.name}</div>
                    <div className="text-sm text-gray-400">{story.role}</div>
                  </div>
                </div>
                <p className="text-gray-300 mb-4">"{story.story}"</p>
                <div className="text-green-400 font-semibold animate-pulse">Revenue: {story.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA WITH MEGA ANIMATIONS */}
      <section className="py-20 bg-gradient-to-r from-orange-500/20 to-red-500/20 backdrop-blur-sm relative z-10">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent animate-pulse">
            Stop Leaving Money on the Table
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            While you're reading this, AEON users are making thousands. Every minute you wait is revenue lost.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Link 
              href="/signup"
              className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 px-12 py-4 rounded-lg font-semibold text-xl transition-all duration-300 inline-flex items-center hover:scale-110 hover:shadow-2xl hover:shadow-orange-500/30 group animate-pulse"
            >
              Start Your Free Trial Now
              <ArrowRight className="w-6 h-6 ml-2 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>

          <div className="flex items-center justify-center space-x-8 text-sm text-gray-400">
            {[
              'No Credit Card Required',
              'Cancel Anytime', 
              'Results in 24 Hours'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-orange-500/20 py-12 bg-gray-900/50 backdrop-blur-sm relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                AEON
              </h3>
              <p className="text-gray-400">
                The AI video platform that turns creators into millionaires.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/pricing" className="hover:text-orange-400 transition-colors">Pricing</Link></li>
                <li><Link href="/signup" className="hover:text-orange-400 transition-colors">Get Started</Link></li>
                <li><Link href="/analytics" className="hover:text-orange-400 transition-colors">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Tools</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/image" className="hover:text-orange-400 transition-colors">AI Image Generator</Link></li>
                <li><Link href="/audio" className="hover:text-orange-400 transition-colors">AI Audio Creator</Link></li>
                <li><Link href="/marketing" className="hover:text-orange-400 transition-colors">Marketing Suite</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/help" className="hover:text-orange-400 transition-colors">Help Center</Link></li>
                <li><Link href="/contact" className="hover:text-orange-400 transition-colors">Contact Us</Link></li>
                <li><Link href="/login" className="hover:text-orange-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-orange-500/20 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 AEON. All rights reserved. Built for creators who get money up.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}