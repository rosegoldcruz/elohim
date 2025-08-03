'use client'

"use client"

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Image, Sparkles, Download, RefreshCw } from "lucide-react";

export default function ImagePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#2a2a4a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">AI Image Generator</h1>
          <p className="text-gray-300">Create stunning images with AI-powered generation</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-effect rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Generate Image</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe the image you want to create..."
                    rows={4}
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Style
                  </label>
                  <select 
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                    aria-label="Select image style"
                  >
                    <option value="realistic">Realistic</option>
                    <option value="artistic">Artistic</option>
                    <option value="cartoon">Cartoon</option>
                    <option value="abstract">Abstract</option>
                    <option value="cinematic">Cinematic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Size
                  </label>
                  <select 
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                    aria-label="Select image size"
                  >
                    <option value="1024x1024">Square (1024x1024)</option>
                    <option value="1024x1792">Portrait (1024x1792)</option>
                    <option value="1792x1024">Landscape (1792x1024)</option>
                  </select>
                </div>

                <Button className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white py-4 text-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Image
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Generated Images */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-effect rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Generated Images</h2>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-fuchsia-500/50 transition-all group"
                  >
                    <div className="text-center">
                      <Image className="w-8 h-8 text-gray-400 mx-auto mb-2 group-hover:text-fuchsia-400 transition-colors" />
                      <p className="text-xs text-gray-400">Generated Image {i}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex space-x-4">
                <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Use in Video
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
