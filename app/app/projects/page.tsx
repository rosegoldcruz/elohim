"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Download, Eye, MoreHorizontal, CheckCircle, Clock, Play, Calendar, Video } from "lucide-react"

const projects = [
  {
    id: 1,
    name: "Product Launch Campaign",
    description: "A cinematic product reveal with dramatic lighting",
    status: "Complete",
    statusColor: "bg-green-500/20 text-green-400",
    statusIcon: CheckCircle,
    createdAt: "2024-01-15",
    duration: "15s",
    quality: "4K",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 2,
    name: "Brand Awareness Video",
    description: "Modern corporate video with sleek animations",
    status: "In Progress",
    statusColor: "bg-blue-500/20 text-blue-400",
    statusIcon: Play,
    createdAt: "2024-01-14",
    duration: "30s",
    quality: "HD",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 3,
    name: "Social Media Content",
    description: "Quick engaging content for social platforms",
    status: "Pending",
    statusColor: "bg-yellow-500/20 text-yellow-400",
    statusIcon: Clock,
    createdAt: "2024-01-13",
    duration: "10s",
    quality: "HD",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 4,
    name: "Tutorial Series Intro",
    description: "Professional intro for educational content",
    status: "Complete",
    statusColor: "bg-green-500/20 text-green-400",
    statusIcon: CheckCircle,
    createdAt: "2024-01-12",
    duration: "8s",
    quality: "4K",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
]

export default function ProjectsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
            Project History
          </h1>
          <p className="text-neutral-400">Manage and review all your video projects</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
          <Video className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-md">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                <Input placeholder="Search projects..." className="pl-10 bg-white/5 border-white/20" />
              </div>
            </div>
            <Select>
              <SelectTrigger className="w-[150px] bg-white/5 border-white/20">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-[150px] bg-white/5 border-white/20">
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const StatusIcon = project.statusIcon
          return (
            <Card
              key={project.id}
              className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 group"
            >
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={project.thumbnail || "/placeholder.svg"}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Button size="sm" className="bg-white/20 backdrop-blur-sm border-white/30">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{project.name}</h3>
                      <p className="text-sm text-neutral-400 line-clamp-2">{project.description}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge className={project.statusColor}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {project.status}
                    </Badge>
                    <span className="text-xs text-neutral-500">{project.quality}</span>
                    <span className="text-xs text-neutral-500">{project.duration}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {project.createdAt}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                      <Eye className="mr-2 h-3 w-3" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
