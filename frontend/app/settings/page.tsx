'use client'

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, Bell, Shield, Palette, CreditCard, Globe } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#2a2a4a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Settings</h1>
          <p className="text-gray-300">Manage your account preferences and settings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Settings Navigation */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Settings</h2>
              <div className="space-y-2">
                {[
                  { name: "Profile", icon: User, active: true },
                  { name: "Notifications", icon: Bell },
                  { name: "Security", icon: Shield },
                  { name: "Appearance", icon: Palette },
                  { name: "Billing", icon: CreditCard },
                  { name: "Language", icon: Globe }
                ].map((item) => (
                  <button
                    key={item.name}
                    className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                      item.active 
                        ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white' 
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Settings Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="glass-effect rounded-2xl p-8">
              <h2 className="text-2xl font-semibold text-white mb-6">Profile Settings</h2>
              
              <div className="space-y-6">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Picture
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      Change Photo
                    </Button>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
                  />
                </div>

                {/* Bio */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bio
                  </label>
                  <textarea
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full p-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 resize-none"
                  />
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 