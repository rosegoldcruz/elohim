'use client'

import Link from 'next/link'
import { ArrowRight, Play, Sparkles, Zap, Users, Trophy } from 'lucide-react'

export default function AeonHomepage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/80 backdrop-blur-sm border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                AEON
              </h1>
              <div className="hidden md:flex space-x-8">
                <Link href="/pricing" className="text-gray-300 hover:text-white transition-colors">
                  Pricing
                </Link>
                <Link href="/marketing" className="text-gray-300 hover:text-white transition-colors">
                  Marketing
                </Link>
                <Link href="/analytics" className="text-gray-300 hover:text-white transition-colors">
                  Analytics
                </Link>
                <Link href="/image" className="text-gray-300 hover:text-white transition-colors">
                  Image Gen
                </Link>
                <Link href="/audio" className="text-gray-300 hover:text-white transition-colors">
                  Audio Gen
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link 
                href="/studio" 
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4 mr-2" />
                AI-Powered Video Generation
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Create Stunning
                <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent block">
                  AI Videos
                </span>
                in Minutes
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Transform your ideas into professional videos using advanced AI technology. 
                No editing experience required.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  href="/studio"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
                >
                  Start Creating
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <Link 
                  href="/pricing"
                  className="border border-gray-600 hover:border-gray-500 px-8 py-4 rounded-lg font-semibold transition-colors inline-flex items-center justify-center"
                >
                  View Pricing
                </Link>
              </div>
              
              <div className="flex items-center text-sm text-gray-400">
                <Users className="w-4 h-4 mr-2" />
                Join 50,000+ creators worldwide
              </div>
            </div>
            
            <div className="relative">
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
                {/* VIDEO WITHOUT AUTOPLAY - USER MUST CLICK TO PLAY */}
                <video 
                  className="w-full h-auto"
                  poster="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=640&h=360&fit=crop"
                  controls
                  preload="metadata"
                >
                  <source src="/demo-video.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
                ✨ AI Generated
              </div>
              <div className="absolute -bottom-4 -left-4 bg-gray-900 border border-gray-700 px-4 py-2 rounded-lg text-sm">
                🎬 4K Quality
              </div>
            </div>
          </div>
              </div>
            </section>
          </div>
        )
      }

      {/* Features Section */}
      <section className="py-20 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose AEON?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Experience the future of video creation with our cutting-edge AI technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <div className="bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Lightning Fast</h3>
              <p className="text-gray-300">
                Generate professional videos in minutes, not hours. Our AI processes your ideas instantly.
              </p>
            </div>
            
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <div className="bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered</h3>
              <p className="text-gray-300">
                Advanced machine learning models understand your vision and bring it to life.
              </p>
            </div>
            
            <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700">
              <div className="bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <Trophy className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Studio Quality</h3>
              <p className="text-gray-300">
                Professional-grade output with 4K resolution and cinematic effects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Create Amazing Videos?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of creators who trust AEON for their video projects and experience the power of AI-driven video generation.
          </p>
        </div>
      </section>