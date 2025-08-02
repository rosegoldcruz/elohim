import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { User, Mail, Calendar, Crown, Settings, Download, CreditCard } from "lucide-react";

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#2a2a4a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Account</h1>
          <p className="text-gray-300">Manage your profile and account settings</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-effect rounded-2xl p-8 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-12 h-12 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold text-white mb-2">John Doe</h2>
              <p className="text-gray-400 mb-4">Video Creator</p>
              
              <div className="flex items-center justify-center space-x-2 mb-6">
                <Crown className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Pro Plan</span>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">john.doe@example.com</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300">Member since January 2024</span>
                </div>
              </div>

              <div className="mt-6">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Account Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Usage Stats */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Usage Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">247</div>
                  <div className="text-gray-400 text-sm">Videos Created</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">1.2M</div>
                  <div className="text-gray-400 text-sm">Total Views</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">89%</div>
                  <div className="text-gray-400 text-sm">Storage Used</div>
                </div>
              </div>
            </div>

            {/* Subscription */}
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Subscription</h3>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                  Pro Plan
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Plan</span>
                  <span className="text-white">Pro Plan - $99/month</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Next Billing</span>
                  <span className="text-white">March 15, 2024</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Videos per month</span>
                  <span className="text-white">Unlimited</span>
                </div>
              </div>

              <div className="flex space-x-4 mt-6">
                <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Manage Billing
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Upgrade Plan
                </Button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Billing History
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 justify-start">
                  <User className="w-4 h-4 mr-2" />
                  Team Members
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
