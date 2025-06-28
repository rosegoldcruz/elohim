"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Upload, Play, Settings, Zap } from "lucide-react"

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
          Generate Video
        </h1>
        <p className="text-neutral-400">Create stunning AI-powered videos from your ideas</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>
            <Card className="relative bg-white/5 border border-purple-400/30 hover:border-purple-400/50 backdrop-blur-md transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-400" />
                Video Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe your video idea in detail... e.g., 'A cinematic shot of a lone astronaut exploring Mars at sunset, with dramatic lighting and epic music'"
                className="bg-white/5 border-white/20 min-h-[120px] resize-none"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Video Style</label>
                  <Select>
                    <SelectTrigger className="bg-white/5 border-white/20">
                      <SelectValue placeholder="Select style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cinematic">Cinematic</SelectItem>
                      <SelectItem value="anime">Anime</SelectItem>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">AI Model</label>
                  <Select>
                    <SelectTrigger className="bg-white/5 border-white/20">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kling">Kling Pro</SelectItem>
                      <SelectItem value="luma">Luma Dream</SelectItem>
                      <SelectItem value="runway">Runway Gen-3</SelectItem>
                      <SelectItem value="pika">Pika Labs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" className="border-white/20 hover:bg-white/10">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Reference
                </Button>
                <Button variant="outline" className="border-white/20 hover:bg-white/10">
                  <Settings className="mr-2 h-4 w-4" />
                  Advanced Settings
                </Button>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75 group-hover:opacity-100"></div>
                <Button
                  className="relative w-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white font-semibold py-3 border-0"
                  disabled={isGenerating || !prompt}
                >
                  {isGenerating ? (
                    <>
                      <Zap className="mr-2 h-5 w-5 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-5 w-5" />
                      Generate Video (5 Credits)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Settings Panel */}
        <div className="space-y-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>
            <Card className="relative bg-white/5 border border-cyan-400/30 hover:border-cyan-400/50 backdrop-blur-md transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle>Generation Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Duration</label>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue placeholder="5 seconds" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 seconds</SelectItem>
                    <SelectItem value="5">5 seconds</SelectItem>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="15">15 seconds</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue placeholder="16:9" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 (Landscape)</SelectItem>
                    <SelectItem value="9:16">9:16 (Portrait)</SelectItem>
                    <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Quality</label>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue placeholder="HD 1080p" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="720p">HD 720p</SelectItem>
                    <SelectItem value="1080p">HD 1080p</SelectItem>
                    <SelectItem value="4k">4K Ultra HD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>
            <Card className="relative bg-white/5 border border-pink-400/30 hover:border-pink-400/50 backdrop-blur-md transition-all duration-300 rounded-2xl">
            <CardHeader>
              <CardTitle>Credit Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Base Generation</span>
                  <span>3 credits</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>HD Quality</span>
                  <span>+1 credit</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Extended Duration</span>
                  <span>+1 credit</span>
                </div>
                <hr className="border-white/20" />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-purple-400">5 credits</span>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
