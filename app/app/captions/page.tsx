"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Edit, Download, Upload, Plus } from "lucide-react"

const captions = [
  {
    id: 1,
    title: "Product Launch Captions",
    project: "Product Launch Campaign",
    language: "English",
    wordCount: 156,
    duration: "15s",
    status: "Complete",
    statusColor: "bg-green-500/20 text-green-400",
  },
  {
    id: 2,
    title: "Brand Video Subtitles",
    project: "Brand Awareness Video",
    language: "English",
    wordCount: 234,
    duration: "30s",
    status: "In Progress",
    statusColor: "bg-blue-500/20 text-blue-400",
  },
  {
    id: 3,
    title: "Tutorial Intro Text",
    project: "Tutorial Series Intro",
    language: "English",
    wordCount: 89,
    duration: "8s",
    status: "Complete",
    statusColor: "bg-green-500/20 text-green-400",
  },
]

export default function CaptionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
            My Captions
          </h1>
          <p className="text-neutral-400">Manage captions and subtitles for your videos</p>
        </div>
        <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
          <Plus className="mr-2 h-4 w-4" />
          New Caption Set
        </Button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Caption Editor */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                Caption Editor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Caption Title</label>
                <Input placeholder="Enter caption title..." className="bg-white/5 border-white/20" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Caption Text</label>
                <Textarea
                  placeholder="Enter your captions here... Use timestamps like [00:01] for timing."
                  className="bg-white/5 border-white/20 min-h-[200px] resize-none font-mono"
                />
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="border-white/20 hover:bg-white/10">
                  <Upload className="mr-2 h-4 w-4" />
                  Import SRT
                </Button>
                <Button variant="outline" className="border-white/20 hover:bg-white/10">
                  <Download className="mr-2 h-4 w-4" />
                  Export SRT
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Caption Library */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Caption Library</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {captions.map((caption) => (
                <div
                  key={caption.id}
                  className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{caption.title}</h4>
                      <Button size="sm" variant="ghost">
                        <Edit className="h-3 w-3" />
                      </Button>
                    </div>

                    <p className="text-sm text-neutral-400">{caption.project}</p>

                    <div className="flex items-center gap-2">
                      <Badge className={caption.statusColor}>{caption.status}</Badge>
                      <span className="text-xs text-neutral-500">{caption.language}</span>
                    </div>

                    <div className="flex justify-between text-xs text-neutral-500">
                      <span>{caption.wordCount} words</span>
                      <span>{caption.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
