'use client'

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Folder, Plus, Search, Filter, Video, Calendar, Clock } from "lucide-react";

const projects = [
  {
    name: "Summer Campaign",
    status: "Completed",
    videos: 12,
    lastModified: "2 hours ago",
    thumbnail: "bg-gradient-to-br from-blue-500 to-purple-600"
  },
  {
    name: "Product Launch",
    status: "In Progress",
    videos: 8,
    lastModified: "1 day ago",
    thumbnail: "bg-gradient-to-br from-green-500 to-emerald-600"
  },
  {
    name: "Brand Story",
    status: "Draft",
    videos: 3,
    lastModified: "3 days ago",
    thumbnail: "bg-gradient-to-br from-pink-500 to-rose-600"
  },
  {
    name: "Tutorial Series",
    status: "Completed",
    videos: 15,
    lastModified: "1 week ago",
    thumbnail: "bg-gradient-to-br from-yellow-500 to-orange-600"
  }
];

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#2a2a4a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Projects</h1>
          <p className="text-gray-300">Organize and manage your video projects</p>
        </motion.div>

        {/* Header Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search projects..."
                className="pl-10 pr-4 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50"
              />
            </div>
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </div>
          <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="glass-effect rounded-2xl overflow-hidden hover-glow cursor-pointer"
            >
              {/* Project Thumbnail */}
              <div className={`h-32 ${project.thumbnail} flex items-center justify-center`}>
                <Video className="w-12 h-12 text-white" />
              </div>

              {/* Project Info */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                    project.status === 'In Progress' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {project.status}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center">
                    <Folder className="w-4 h-4 mr-2" />
                    {project.videos} videos
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {project.lastModified}
                  </div>
                </div>

                <div className="flex space-x-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 border-white/20 text-white hover:bg-white/10">
                    Open
                  </Button>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    <Calendar className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center py-12"
          >
            <Folder className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No projects yet</h3>
            <p className="text-gray-400 mb-6">Create your first project to get started</p>
            <Button className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
} 