'use client'

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { ArrowRight, Play, Sparkles, Zap, Video } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gray-900">
      {/* Professional Dark Background with Subtle Patterns */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />

      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }} />
      </div>

      {/* Professional Accent Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-500/3 rounded-full blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Professional Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center px-6 py-3 rounded-full bg-gray-800/60 backdrop-blur-md border border-gray-700/50 shadow-lg"
          >
            <Zap className="w-4 h-4 mr-2 text-yellow-400" />
            <span className="text-sm font-medium text-gray-100">
              Professional AI Video Generation
            </span>
          </motion.div>

          {/* Main Heading - More Professional */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold leading-tight"
          >
            <span className="text-gray-100">Generate Premium</span>
            <br />
            <span className="aeon-text-gradient">Video Content</span>
          </motion.h1>

          {/* Professional Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            Powered by the <span className="text-yellow-400 font-semibold">Advanced</span>, <span className="text-cyan-400 font-semibold">Efficient</span>, <span className="text-yellow-400 font-semibold">Optimized</span> Network
          </motion.p>

          {/* Professional CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <SignInButton mode="modal">
              <Button size="lg" className="aeon-button-primary px-8 py-4 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 font-semibold">
                <Video className="w-5 h-5 mr-2" />
                Launch Studio
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </SignInButton>

            <Button variant="outline" size="lg" className="aeon-button-secondary px-8 py-4 text-lg rounded-xl backdrop-blur-md">
              <Play className="w-5 h-5 mr-2" />
              View Demo
            </Button>
          </motion.div>

          {/* Advanced Network Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pt-16"
          >
            <div className="text-center p-8 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/40 hover:border-yellow-500/30 transition-all duration-300">
              <div className="text-2xl font-bold text-yellow-400 mb-2">ADVANCED</div>
              <div className="text-gray-300 font-medium">Multi-Layer Neural Processing</div>
              <div className="text-sm text-gray-400 mt-2">Quantum-enhanced algorithms for superior output quality</div>
            </div>
            <div className="text-center p-8 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/40 hover:border-cyan-500/30 transition-all duration-300">
              <div className="text-2xl font-bold text-cyan-400 mb-2">EFFICIENT</div>
              <div className="text-gray-300 font-medium">Distributed Computing Grid</div>
              <div className="text-sm text-gray-400 mt-2">Parallel processing across global infrastructure nodes</div>
            </div>
            <div className="text-center p-8 rounded-xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/40 hover:border-yellow-500/30 transition-all duration-300">
              <div className="text-2xl font-bold text-yellow-400 mb-2">OPTIMIZED</div>
              <div className="text-gray-300 font-medium">Adaptive Resource Allocation</div>
              <div className="text-sm text-gray-400 mt-2">Dynamic scaling with predictive load balancing</div>
            </div>
          </motion.div>

          {/* Network Architecture Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-center pt-12"
          >
            <div className="text-lg text-gray-400 font-mono">
              NETWORK ARCHITECTURE: <span className="text-cyan-400">DISTRIBUTED</span> • <span className="text-yellow-400">SCALABLE</span> • <span className="text-cyan-400">INTELLIGENT</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
} 