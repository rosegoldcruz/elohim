"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Grid, List } from "lucide-react"

export default function ScenesPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
            Scene Viewer
          </h1>
          <p className="text-neutral-400">Browse and manage individual video scenes</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="border-white/20">
            <Grid className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="border-white/20">
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-white/5 border-white/10 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Scene Library</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="group relative">
                <div className="aspect-square bg-gradient-to-br from-purple-600/20 to-cyan-600/20 rounded-lg overflow-hidden">
                  <img
                    src={`/placeholder.svg?height=150&width=150&query=scene+${i + 1}`}
                    alt={`Scene ${i + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button size="sm" className="bg-white/20 backdrop-blur-sm">
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="mt-2 text-center">
                  <p className="text-sm font-medium">Scene {i + 1}</p>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {Math.floor(Math.random() * 10) + 3}s
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
