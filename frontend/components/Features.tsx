"use client";

import { motion } from "framer-motion";
import { 
  Zap, 
  Palette, 
  Music, 
  Sparkles, 
  Clock, 
  Shield,
  Video,
  PenTool,
  Image as ImageIcon,
  BarChart3
} from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Generate professional videos in under 5 minutes with our optimized AI pipeline.",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Palette,
    title: "Advanced Editing",
    description: "Professional-grade editing tools with AI-powered suggestions and automation.",
    color: "from-pink-500 to-purple-500"
  },
  {
    icon: Music,
    title: "Audio Generation",
    description: "Create custom music, sound effects, and voiceovers with AI technology.",
    color: "from-green-500 to-teal-500"
  },
  {
    icon: Sparkles,
    title: "AI-Powered",
    description: "Cutting-edge AI models for stunning visual effects and intelligent editing.",
    color: "from-blue-500 to-indigo-500"
  },
  {
    icon: Clock,
    title: "Real-time Preview",
    description: "See your changes instantly with our real-time rendering technology.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-level security with encrypted storage and secure processing.",
    color: "from-indigo-500 to-blue-500"
  }
];

const tools = [
  { name: "Video Studio", icon: Video, description: "Create and edit videos" },
  { name: "Script Generator", icon: PenTool, description: "AI-powered script writing" },
  { name: "Image Creator", icon: ImageIcon, description: "Generate custom images" },
  { name: "Analytics", icon: BarChart3, description: "Track performance metrics" }
];

export function Features() {
  return (
    <section className="py-24 bg-gradient-to-b from-transparent to-[#a100ff]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Powerful Features</span>
            <br />
            <span className="text-fuchsia-400">for Creators</span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Everything you need to create stunning videos with AI-powered tools and professional editing capabilities.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="group"
            >
              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full hover:bg-white/20 transition-all duration-300">
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tools Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-3xl font-bold text-white mb-12">Complete Tool Suite</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <motion.div
                key={tool.name}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 text-center hover:bg-white/20 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <tool.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">{tool.name}</h4>
                <p className="text-white/80 text-sm">{tool.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-4">
              Ready to Create Something Amazing?
            </h3>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of creators who are already using AEON Video to bring their ideas to life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-[#ff007f] hover:bg-gray-100 px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg">
                Start Free Trial
              </button>
              <button className="border border-white/30 text-white hover:bg-white/20 px-8 py-4 rounded-xl font-semibold transition-all duration-300">
                View Examples
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 