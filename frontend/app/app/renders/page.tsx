"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Share, MoreHorizontal, Calendar } from "lucide-react"

const renders = [
  {
    id: 1,
    name: "Product_Launch_Campaign_Final.mp4",
    project: "Product Launch Campaign",
    status: "Complete",
    statusColor: "bg-green-500/20 text-green-400",
    size: "245 MB",
    duration: "15s",
    quality: "4K",
    createdAt: "2024-01-15",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 2,
    name: "Brand_Awareness_Video_v2.mp4",
    project: "Brand Awareness Video",
    status: "Processing",
    statusColor: "bg-blue-500/20 text-blue-400",
    size: "180 MB",
    duration: "30s",
    quality: "HD",
    createdAt: "2024-01-14",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
  {
    id: 3,
    name: "Tutorial_Intro_Final.mp4",
    project: "Tutorial Series Intro",
    status: "Complete",
    statusColor: "bg-green-500/20 text-green-400",
    size: "89 MB",
    duration: "8s",
    quality: "4K",
    createdAt: "2024-01-12",
    thumbnail: "/placeholder.svg?height=120&width=200",
  },
]

export default function RendersPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
            Final Renders
          </h1>
          <p className="text-neutral-400">Download and manage your completed video renders</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
          <Download className="mr-2 h-4 w-4" />
          Download All
        </Button>
      </div>

      {/* Storage Usage */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span>2.1 GB used of 10 GB</span>
            <span className="text-sm text-neutral-400">21% used</span>
          </div>
          <div className="w-full bg-neutral-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-cyan-500 h-2 rounded-full"
              style={{ width: "21%" }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Renders List */}
      <div className="space-y-4">
        {renders.map((render) => (
          <Card
            key={render.id}
            className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-6">
                {/* Thumbnail */}
                <div className="w-32 h-20 rounded-lg overflow-hidden bg-gradient-to-br from-purple-600/20 to-cyan-600/20 flex-shrink-0">
                  <img
                    src={render.thumbnail || "/placeholder.svg"}
                    alt={render.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">{render.name}</h3>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-neutral-400">{render.project}</p>

                  <div className="flex items-center gap-4">
                    <Badge className={render.statusColor}>{render.status}</Badge>
                    <span className="text-sm text-neutral-500">{render.quality}</span>
                    <span className="text-sm text-neutral-500">{render.duration}</span>
                    <span className="text-sm text-neutral-500">{render.size}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-neutral-500">
                    <Calendar className="h-3 w-3" />
                    {render.createdAt}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10">
                    <Eye className="mr-2 h-3 w-3" />
                    Preview
                  </Button>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                    <Download className="mr-2 h-3 w-3" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10">
                    <Share className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
