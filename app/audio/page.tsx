"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Music, Sparkles, Loader2, Play, Pause, Download, Volume2 } from "lucide-react"
import { toast } from "sonner"
import { generateAudioMock, AudioGenerationParams } from "@/lib/replicate"

export default function AudioGenerationPage() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedAudio, setGeneratedAudio] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [settings, setSettings] = useState({
    duration: 8,
    model_version: "stereo-large"
  })

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt to generate audio.")
      return
    }

    setIsGenerating(true)
    toast.info("Generating audio...")

    try {
      const params: AudioGenerationParams = {
        prompt,
        duration: settings.duration,
        model_version: settings.model_version,
      }

      // TODO: Replace with actual generateAudio when API key is available
      const result = await generateAudioMock(params)

      if (result.status === 'succeeded' && result.output && result.output[0]) {
        setGeneratedAudio(result.output[0])
        toast.success("Audio generated successfully!")
      } else {
        throw new Error(result.error || "Generation failed")
      }
    } catch (error) {
      toast.error("Failed to generate audio. Please try again.")
      console.error("Audio generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const togglePlayback = () => {
    setIsPlaying(!isPlaying)
    // TODO: Implement actual audio playback control
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <Music className="h-8 w-8 text-purple-400" />
              <h1 className="text-3xl font-bold">Audio Generation</h1>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Generation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Upbeat electronic music with a futuristic vibe and heavy bass..."
                    className="bg-transparent border-neutral-700 min-h-[120px] mt-2"
                  />
                </div>

                <div>
                  <Label>Duration: {settings.duration} seconds</Label>
                  <Slider
                    value={[settings.duration]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, duration: value[0] }))}
                    max={30}
                    min={5}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="model">Model Version</Label>
                  <Select
                    value={settings.model_version}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, model_version: value }))}
                  >
                    <SelectTrigger className="bg-transparent border-neutral-700 mt-2">
                      <SelectValue placeholder="Select model version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stereo-large">Stereo Large</SelectItem>
                      <SelectItem value="stereo-medium">Stereo Medium</SelectItem>
                      <SelectItem value="mono">Mono</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Audio
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Generated Audio */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-bold mb-6">Generated Audio</h2>

            {generatedAudio ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      {/* Audio Visualizer Placeholder */}
                      <div className="w-full h-32 bg-gradient-to-r from-purple-600/20 to-cyan-600/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-cyan-500/10 animate-pulse"></div>
                        <Volume2 className="h-12 w-12 text-purple-400 z-10" />
                      </div>

                      {/* Audio Controls */}
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          onClick={togglePlayback}
                          size="lg"
                          className="rounded-full bg-purple-600 hover:bg-purple-700 w-16 h-16"
                        >
                          {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="lg"
                          className="rounded-full border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white"
                          onClick={() => {
                            if (generatedAudio) {
                              const link = document.createElement('a')
                              link.href = generatedAudio
                              link.download = 'generated-audio.wav'
                              link.click()
                            }
                          }}
                        >
                          <Download className="h-6 w-6" />
                        </Button>
                      </div>

                      {/* HTML5 Audio Player */}
                      <audio controls className="w-full">
                        <source src={generatedAudio} type="audio/wav" />
                        Your browser does not support the audio element.
                      </audio>

                      <div className="text-center text-sm text-neutral-400">
                        <p>Duration: {settings.duration}s | Model: {settings.model_version}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Music className="h-16 w-16 text-neutral-600 mb-4" />
                  <p className="text-xl font-medium text-neutral-400 mb-2">No audio generated yet</p>
                  <p className="text-neutral-500 text-center">
                    Enter a prompt and click "Generate Audio" to create AI-generated music and sounds
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </MainLayout>
  )
}
