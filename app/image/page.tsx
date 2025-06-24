'use client'

import Link from 'next/link'
import { ArrowRight, Palette, Sparkles, Crown, Target, Zap } from 'lucide-react'

export default function ImageMarketingPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
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

      {/* Hero */}
      <section className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-purple-500/20 border border-purple-500/40 rounded-full text-purple-400 text-lg font-bold mb-8">
              <Palette className="w-6 h-6 mr-3" />
              Visual AI That Prints Money
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black leading-tight mb-8">
              <span className="bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
                LOGOS
              </span>
              <br />
              <span className="text-white">BRANDS &</span>
              <br />
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                MILLIONS
              </span>
            </h1>
            
            <p className="text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
              Create viral images, luxury logos, and brand assets that sell for <span className="text-yellow-400 font-bold">$5K-$50K each</span>. 
              No design skills, no expensive software, just pure profit.
            </p>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-900/50 p-8 rounded-2xl border border-purple-500/30 text-center">
              <div className="text-6xl mb-6">🎨</div>
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Logo Empire</h3>
              <p className="text-gray-300">Generate $10K+ logos in seconds. Charge premium prices for AI-created masterpieces.</p>
            </div>

            <div className="bg-gray-900/50 p-8 rounded-2xl border border-purple-500/30 text-center">
              <div className="text-6xl mb-6">🖼️</div>
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Viral Graphics</h3>
              <p className="text-gray-300">Create images that get millions of views and drive massive traffic to your offers.</p>
            </div>

            <div className="bg-gray-900/50 p-8 rounded-2xl border border-purple-500/30 text-center">
              <div className="text-6xl mb-6">👑</div>
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Brand Builder</h3>
              <p className="text-gray-300">Complete brand identities that sell for $25K+ to businesses desperate for premium design.</p>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/signup"
              className="bg-gradient-to-r from-purple-500 to-purple-600 px-12 py-6 rounded-2xl font-black text-2xl hover:scale-105 transition-all inline-flex items-center"
            >
              🎨 START CREATING WEALTH
              <ArrowRight className="w-8 h-8 ml-3" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}