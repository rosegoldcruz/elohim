import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Users, Video, Eye, Heart, Share2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#2a2a4a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Analytics Dashboard</h1>
          <p className="text-gray-300">Track your video performance and audience insights</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Total Views", value: "124.5K", icon: Eye, change: "+12.3%" },
            { title: "Videos Created", value: "1,247", icon: Video, change: "+8.7%" },
            { title: "Active Users", value: "89.2K", icon: Users, change: "+15.2%" },
            { title: "Engagement Rate", value: "4.8%", icon: Heart, change: "+2.1%" }
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
                  <p className="text-green-400 text-sm flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-effect rounded-2xl p-8"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Views Over Time</h2>
            <div className="h-64 bg-white/5 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Chart visualization will appear here</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-effect rounded-2xl p-8"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Top Performing Videos</h2>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center">
                      <Video className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Video Title {i}</p>
                      <p className="text-sm text-gray-400">{Math.floor(Math.random() * 50) + 10}K views</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Eye className="w-4 h-4" />
                    <span>{Math.floor(Math.random() * 1000) + 100}</span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Engagement Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-effect rounded-2xl p-8"
        >
          <h2 className="text-xl font-semibold text-white mb-6">Engagement Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Likes", value: "45.2K", percentage: 78 },
              { title: "Shares", value: "12.8K", percentage: 65 },
              { title: "Comments", value: "8.9K", percentage: 45 }
            ].map((metric, index) => (
              <div key={metric.title} className="text-center">
                <p className="text-gray-400 text-sm mb-2">{metric.title}</p>
                <p className="text-2xl font-bold text-white mb-2">{metric.value}</p>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-fuchsia-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${metric.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-400 mt-1">{metric.percentage}%</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
