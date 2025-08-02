"use client"

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, BarChart3, Users, Calendar, DollarSign, Share2, Play } from "lucide-react";

const campaigns = [
  {
    name: "Summer Product Launch",
    status: "Active",
    budget: "$5,000",
    views: "124.5K",
    engagement: "4.8%",
    platform: "TikTok",
    color: "from-green-500 to-emerald-500"
  },
  {
    name: "Brand Awareness",
    status: "Paused",
    budget: "$3,200",
    views: "89.2K",
    engagement: "3.2%",
    platform: "Instagram",
    color: "from-blue-500 to-indigo-500"
  },
  {
    name: "Holiday Special",
    status: "Scheduled",
    budget: "$7,500",
    views: "0",
    engagement: "0%",
    platform: "YouTube",
    color: "from-purple-500 to-pink-500"
  }
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#2a2a4a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Marketing Dashboard</h1>
          <p className="text-gray-300">Manage your video campaigns and track performance</p>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Active Campaigns", value: "12", icon: Target, change: "+3" },
            { title: "Total Views", value: "2.1M", icon: Users, change: "+15.2%" },
            { title: "Engagement Rate", value: "4.8%", icon: TrendingUp, change: "+0.8%" },
            { title: "Total Spend", value: "$24.5K", icon: DollarSign, change: "+12.3%" }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass-effect rounded-2xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-green-400 text-sm">{stat.change}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Campaign Management */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Campaigns */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="glass-effect rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-white">Active Campaigns</h2>
                <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white">
                  <Play className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </div>

              <div className="space-y-4">
                {campaigns.map((campaign, index) => (
                  <div key={campaign.name} className="bg-white/5 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 bg-gradient-to-r ${campaign.color} rounded-xl flex items-center justify-center`}>
                          <Share2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">{campaign.name}</h3>
                          <p className="text-gray-400 text-sm">{campaign.platform}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          campaign.status === 'Active' ? 'bg-green-500/20 text-green-400' :
                          campaign.status === 'Paused' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {campaign.status}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-gray-400 text-sm">Budget</p>
                        <p className="text-white font-semibold">{campaign.budget}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Views</p>
                        <p className="text-white font-semibold">{campaign.views}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Engagement</p>
                        <p className="text-white font-semibold">{campaign.engagement}</p>
                      </div>
                      <div>
                        <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                          <BarChart3 className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            {/* Performance Overview */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Performance Overview</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Views</span>
                    <span className="text-white">2.1M</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-fuchsia-500 to-purple-600 h-2 rounded-full w-75%"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Engagement</span>
                    <span className="text-white">4.8%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full w-48%"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Conversions</span>
                    <span className="text-white">2.3%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full w-23%"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-effect rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 justify-start">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Post
                </Button>
                <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Audience Insights
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
