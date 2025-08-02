import { motion } from "framer-motion";
import { BookOpen, FileText, Video, Code, Settings, Users } from "lucide-react";

const docsSections = [
  {
    title: "Getting Started",
    description: "Learn the basics of AEON Video",
    icon: BookOpen,
    articles: [
      "Quick Start Guide",
      "Creating Your First Video",
      "Understanding the Interface",
      "Account Setup"
    ]
  },
  {
    title: "Video Creation",
    description: "Master video generation and editing",
    icon: Video,
    articles: [
      "AI Video Generation",
      "Script Writing",
      "Image Generation",
      "Audio Creation"
    ]
  },
  {
    title: "Advanced Features",
    description: "Explore advanced capabilities",
    icon: Settings,
    articles: [
      "Custom Templates",
      "Batch Processing",
      "API Integration",
      "Workflow Automation"
    ]
  },
  {
    title: "API Reference",
    description: "Developer documentation",
    icon: Code,
    articles: [
      "Authentication",
      "Video Generation API",
      "Webhooks",
      "Rate Limits"
    ]
  }
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#2a2a4a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Documentation</h1>
          <p className="text-gray-300">Learn how to use AEON Video effectively</p>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="relative max-w-2xl mx-auto">
            <input
              type="text"
              placeholder="Search documentation..."
              className="w-full p-4 pl-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
            />
            <BookOpen className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </motion.div>

        {/* Documentation Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {docsSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="glass-effect rounded-2xl p-8"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                  <section.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                  <p className="text-gray-400 text-sm">{section.description}</p>
                </div>
              </div>

              <div className="space-y-3">
                {section.articles.map((article, articleIndex) => (
                  <div
                    key={article}
                    className="flex items-center p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <FileText className="w-4 h-4 text-gray-400 mr-3 group-hover:text-fuchsia-400 transition-colors" />
                    <span className="text-gray-300 group-hover:text-white transition-colors">{article}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12"
        >
          <div className="glass-effect rounded-2xl p-8">
            <h2 className="text-2xl font-semibold text-white mb-6">Quick Links</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <Users className="w-8 h-8 text-fuchsia-400 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-2">Community</h3>
                <p className="text-gray-400 text-sm">Join our community for support</p>
              </div>
              <div className="text-center p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <Video className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-2">Tutorials</h3>
                <p className="text-gray-400 text-sm">Step-by-step video tutorials</p>
              </div>
              <div className="text-center p-6 bg-white/5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer">
                <Code className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-2">API Docs</h3>
                <p className="text-gray-400 text-sm">Technical API documentation</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
