'use client'

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PenTool, Sparkles, Copy, Download, Play } from "lucide-react";

export default function ScriptPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#2a2a4a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Script Generator</h1>
          <p className="text-gray-300">Create compelling scripts with AI-powered writing assistance</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Script Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-effect rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Generate Script</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Topic or Theme
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., How to make the perfect coffee"
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Style
                  </label>
                  <select 
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                    aria-label="Select script style"
                  >
                    <option value="educational">Educational</option>
                    <option value="entertaining">Entertaining</option>
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="dramatic">Dramatic</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    placeholder="30"
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Additional Details
                  </label>
                  <textarea
                    placeholder="Any specific requirements or context..."
                    rows={4}
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 resize-none"
                  />
                </div>

                <Button className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white py-4 text-lg">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Script
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Generated Script */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-effect rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Generated Script</h2>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-6 min-h-[400px]">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-fuchsia-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-300">SCENE 1</span>
                  </div>
                  <p className="text-white leading-relaxed">
                    [Opening shot of a cozy coffee shop] Welcome to the ultimate guide on how to make the perfect cup of coffee. Today, we're going to show you the secrets that baristas don't want you to know.
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-6">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-300">SCENE 2</span>
                  </div>
                  <p className="text-white leading-relaxed">
                    [Close-up of coffee beans] First, you'll need high-quality coffee beans. Look for beans that are freshly roasted and have a rich, aromatic smell. The type of bean you choose will dramatically affect your final result.
                  </p>

                  <div className="flex items-center space-x-2 mt-6">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-300">SCENE 3</span>
                  </div>
                  <p className="text-white leading-relaxed">
                    [Demonstration of grinding] Grinding your beans fresh is crucial. Use a burr grinder for the most consistent results. The grind size should match your brewing method - fine for espresso, medium for drip coffee.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex space-x-4">
                <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  Generate Video
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Regenerate Script
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
