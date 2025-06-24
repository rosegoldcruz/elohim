'use client';

import React, { useState, useEffect } from 'react';
import { Menu, X, Play, Star, Users, Clock, Zap } from 'lucide-react';

const AeonHomepage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const userHasMembership = false; // Credits hidden on homepage

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { name: 'Studio', href: '/studio', icon: Play },
    { name: 'Features', href: '#features', icon: Star },
    { name: 'Pricing', href: '#pricing', icon: Users },
    { name: 'Launch Campaign', href: '/launch-ai-campaign', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-50 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        <div className="fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-purple-900/95 to-black/95 backdrop-blur-lg border-r border-purple-500/20">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-black font-bold text-lg">A</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">AEON</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {navigationItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 text-yellow-400" />
                  <span className="font-medium">{item.name}</span>
                </a>
              ))}
            </div>
            
            {userHasMembership && (
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Credits</span>
                  <span className="text-yellow-400 font-bold">15</span>
                </div>
                <button className="w-full py-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-lg font-medium text-sm">
                  Upgrade Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrollY > 50 ? 'bg-black/90 backdrop-blur-lg border-b border-purple-500/20' : 'bg-transparent'}`}>
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-lg">A</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">AEON</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {userHasMembership && (
              <div className="flex items-center space-x-1 bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-2 py-1 rounded-full border border-purple-500/30">
                <span className="text-yellow-400 font-bold text-xs">15</span>
                <span className="text-xs hidden sm:inline">Credits</span>
              </div>
            )}
            <a href="/login" className="px-2 py-1 bg-purple-600 rounded-lg text-xs font-medium whitespace-nowrap">
              Sign In
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section - RESTORED DYNAMIC VORTEX */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">
        {/* Dynamic Animated Vortex Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Concentric Circles - DYNAMIC ANIMATION RESTORED */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full border-2 animate-pulse left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${
                  i % 3 === 0 ? 'border-cyan-400/40' : i % 3 === 1 ? 'border-purple-600/40' : 'border-pink-500/40'
                }`}
                style={{
                  width: `${200 + i * 80}px`,
                  height: `${200 + i * 80}px`,
                  animationDelay: `${i * 0.3}s`,
                  animationDuration: '4s',
                } as React.CSSProperties}
              />
            ))}
            
            {/* Floating Dots - DYNAMIC ANIMATION */}
            {[...Array(15)].map((_, i) => {
              const colors = ['bg-cyan-400', 'bg-purple-600', 'bg-pink-500']
              const leftPos = 15 + Math.random() * 70
              const topPos = 15 + Math.random() * 70
              const delay = Math.random() * 3
              const duration = 2 + Math.random() * 2

              return (
                <div
                  key={`dot-${i}`}
                  className={`absolute w-2 h-2 rounded-full animate-bounce ${colors[i % 3]}`}
                  style={{
                    left: `${leftPos}%`,
                    top: `${topPos}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`
                  } as React.CSSProperties}
                />
              )
            })}
          </div>
        </div>
        
        <div className="relative text-center z-10 max-w-sm mx-auto">
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
              The AEON
            </span>
          </h1>
          <p className="text-gray-300 text-lg mb-2">Advanced Efficient Optimized Network</p>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed px-4">
            The high-performance AI video platform where cutting-edge technology drives exceptional business outcomes at enterprise scale.
          </p>
          
          <button
            type="button"
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium text-lg mb-6 hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
          >
            ✨ Launch AI Campaign →
          </button>
          
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div>
              <div className="text-yellow-400 font-bold text-lg">7+</div>
              <div className="text-gray-400 text-xs">AI Agents</div>
            </div>
            <div>
              <div className="text-cyan-400 font-bold text-lg">5M+</div>
              <div className="text-gray-400 text-xs">Videos Created</div>
            </div>
            <div>
              <div className="text-purple-400 font-bold text-lg">4K</div>
              <div className="text-gray-400 text-xs">Ultra HD Output</div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="px-4 py-12 bg-gradient-to-b from-purple-950/20 to-black">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Platform Overview</h2>
          <p className="text-gray-400 mb-6 text-sm">Discover the power of AI-driven content creation at enterprise scale</p>
          
          <div className="relative bg-gray-900 rounded-xl overflow-hidden border border-purple-500/20 mb-6">
            <div className="aspect-video relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-3 mx-auto backdrop-blur-sm">
                    <Play className="w-6 h-6 text-white ml-1" />
                  </div>
                  <p className="text-xs text-gray-300">Platform Preview</p>
                </div>
              </div>
              
              <iframe
                className="absolute inset-0 w-full h-full border-0"
                src="https://vdns3.makewebvideo.com/data1/userfiles/public/ueztbbrqdfm6tkeruhh4njda/movie_tBujZZEppWU5GPYQ.mp4.1920x1080.mp4"
                title="AEON Platform Overview"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
              <div className="text-lg font-bold text-cyan-400 mb-1">10x</div>
              <div className="text-xs text-gray-400">Faster</div>
            </div>
            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700">
              <div className="text-lg font-bold text-green-400 mb-1">90%</div>
              <div className="text-xs text-gray-400">Cost Cut</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Performance Section */}
      <section className="px-4 py-12 bg-gradient-to-b from-black to-purple-950/20">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Built for <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Enterprise Performance</span>
          </h2>
          <p className="text-gray-300 mb-6 text-sm">A high-performance platform trusted by high-growth businesses and enterprise clients.</p>
          
          <div className="relative mb-8">
            <div className="w-48 h-48 mx-auto relative">
              {[...Array(4)].map((_, i) => {
                const borderColors = ['border-cyan-400/50', 'border-purple-600/50', 'border-pink-500/50', 'border-green-500/50']
                const duration = 6 + i * 2
                const direction = i % 2 === 0 ? 'animate-spin' : 'animate-reverse-spin'
                const size = 70 + i * 25

                return (
                  <div
                    key={i}
                    className={`absolute rounded-full border-2 ${borderColors[i]} left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 ${direction}`}
                    style={{
                      animationDuration: `${duration}s`,
                      width: `${size}%`,
                      height: `${size}%`,
                    } as React.CSSProperties}
                  />
                )
              })}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-1">99.9%</div>
                  <div className="text-xs text-gray-400">Uptime SLA</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-xl border border-purple-500/20">
              <div className="text-2xl font-bold text-cyan-400 mb-1">50+</div>
              <div className="text-gray-300 text-sm">Video Variations</div>
            </div>
            
            <div className="bg-gradient-to-r from-pink-900/30 to-orange-900/30 p-4 rounded-xl border border-pink-500/20">
              <div className="text-2xl font-bold text-pink-400 mb-1">60s</div>
              <div className="text-gray-300 text-sm">Long-form Content</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-900/30 to-cyan-900/30 p-4 rounded-xl border border-green-500/20">
              <div className="text-2xl font-bold text-green-400 mb-1">24/7</div>
              <div className="text-gray-300 text-sm">AI Automation</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-12 bg-gradient-to-t from-purple-950/30 to-black">
        <div className="max-w-sm mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Scale Your <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">Content?</span>
          </h2>
          <p className="text-gray-400 mb-6 text-sm">Join 50+ enterprise clients already using AEON to transform their video production.</p>
          
          <div className="space-y-3">
            <button
              type="button"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-medium text-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
            >
              Start Free Trial
            </button>
            <button
              type="button"
              className="w-full py-3 border border-gray-600 rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-6 bg-black border-t border-gray-800">
        <div className="max-w-sm mx-auto text-center text-xs text-gray-500">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <div className="w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-black font-bold text-xs">A</span>
            </div>
            <span className="font-semibold">AEON</span>
          </div>
          <p>© 2025 AEON Technologies. All rights reserved.</p>
          <a href="https://aeoninvestmentstechnologies.com" className="hover:text-gray-400 transition-colors">
            aeoninvestmentstechnologies.com
          </a>
        </div>
      </footer>
    </div>
  );
};

export default AeonHomepage;