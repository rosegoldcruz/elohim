'use client'

import Link from 'next/link'
import { ArrowRight, Play, Video, Zap, Crown, Target, Rocket, DollarSign, Check } from 'lucide-react'

export default function StudioMarketingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Single Clean Navigation */}
      <nav className="bg-black/95 backdrop-blur-xl border-b border-yellow-500/30 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              👑 AEON
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/pricing" className="text-gray-300 hover:text-yellow-400 transition-colors">Pricing</Link>
              <Link href="/login" className="text-gray-300 hover:text-yellow-400 transition-colors">Sign In</Link>
              <Link 
                href="/signup" 
                className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-6 py-2 rounded-lg font-bold hover:scale-105 transition-all"
              >
                GET ACCESS NOW
              </Link>
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