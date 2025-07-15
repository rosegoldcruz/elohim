'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Play, Sparkles, Clock, Film, Wand2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

interface SceneData {
  scenes: string[]
  total_scenes: number
  estimated_duration_per_scene: number
}

// Mock scene generation function for demo purposes
function generateMockScenes(topic: string, style: string, sceneCount: number): string[] {
  const scenes: string[] = []
  const stylePrefix = style ? `${style} style: ` : ''

  // Generate scenes based on the topic
  for (let i = 1; i <= sceneCount; i++) {
    let scene = ''

    if (i === 1) {
      scene = `${stylePrefix}Opening shot establishing the world of ${topic}. Wide cinematic angle with dramatic lighting, setting the mood and atmosphere for the story to unfold.`
    } else if (i === sceneCount) {
      scene = `${stylePrefix}Climactic finale of ${topic}. Close-up shots with intense lighting, bringing the narrative to a powerful and memorable conclusion.`
    } else if (i === 2) {
      scene = `${stylePrefix}Introduction of key elements in ${topic}. Medium shots with warm lighting, building character development and story foundation.`
    } else if (i === sceneCount - 1) {
      scene = `${stylePrefix}Rising action and tension in ${topic}. Dynamic camera movements with contrasting lighting, building toward the climactic moment.`
    } else {
      const midSceneDescriptions = [
        'Character development and world-building',
        'Conflict introduction and tension building',
        'Plot advancement with visual storytelling',
        'Emotional depth and narrative progression',
        'Action sequence with dynamic cinematography',
        'Dialogue-driven character interaction',
        'Environmental storytelling and atmosphere'
      ]
      const randomDesc = midSceneDescriptions[Math.floor(Math.random() * midSceneDescriptions.length)]
      scene = `${stylePrefix}${randomDesc} in ${topic}. Varied camera angles with professional lighting, maintaining visual interest and story momentum.`
    }

    scenes.push(scene)
  }

  return scenes
}

export default function ScriptGeneratorPage() {
  const [formData, setFormData] = useState({
    topic: '',
    style: '',
    duration: 60,
    scene_count: 6,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [sceneData, setSceneData] = useState<SceneData | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.topic.trim()) {
      toast.error('Please enter a video topic')
      return
    }

    setIsLoading(true)

    try {
      // For demo purposes, we'll use a mock API response
      // To connect to the real AEON backend, uncomment the code below and comment out the mock section:

      /* Real API call (requires backend setup with Supabase and OpenAI):
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/scriptwriter/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${formData.topic}${formData.style ? ` in ${formData.style} style` : ''}`,
          duration: formData.duration,
          scene_count: formData.scene_count,
        }),
      })
      const result = await response.json()
      */

      // Mock API response for demo:
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API delay
      const mockScenes = generateMockScenes(formData.topic, formData.style, formData.scene_count)
      const result = {
        success: true,
        scenes: mockScenes,
        total_scenes: mockScenes.length,
        estimated_duration_per_scene: formData.duration / formData.scene_count,
      }

      setSceneData({
        scenes: result.scenes,
        total_scenes: result.total_scenes,
        estimated_duration_per_scene: result.estimated_duration_per_scene,
      })

      toast.success(`Generated ${result.total_scenes} cinematic scenes!`)
    } catch (error) {
      console.error('Script generation error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSceneData(null)
    setFormData({
      topic: '',
      style: '',
      duration: 60,
      scene_count: 6,
    })
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Film className="w-4 h-4 mr-2" />
            AI Script Generator
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Generate
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              {' '}Cinematic Scripts
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your ideas into professional scene-by-scene scripts.
            Perfect for video creators, filmmakers, and content producers.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
          {/* Script Generator Form */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>
            <Card className="relative bg-white/10 backdrop-blur-lg border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Wand2 className="w-6 h-6" />
                Create Your Script
              </CardTitle>
              <CardDescription className="text-gray-300">
                Describe your video concept and let AI generate professional scenes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Video Topic *
                  </label>
                  <Textarea
                    placeholder="e.g., A day in the life of a space explorer discovering a new planet"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Visual Style (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Blade Runner, Pixar animation, documentary style"
                    value={formData.style}
                    onChange={(e) => setFormData({ ...formData, style: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Duration (seconds)
                    </label>
                    <Input
                      type="number"
                      min="30"
                      max="300"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 60 })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Number of Scenes
                    </label>
                    <Input
                      type="number"
                      min="3"
                      max="12"
                      value={formData.scene_count}
                      onChange={(e) => setFormData({ ...formData, scene_count: parseInt(e.target.value) || 6 })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75 group-hover:opacity-100"></div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white font-semibold py-6 text-lg border-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Script...
                      </>
                    ) : (
                      <>
                        Generate Script
                        <Sparkles className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          </div>

          {/* Features & Benefits */}
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>
              <Card className="relative bg-black/50 backdrop-blur-lg border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">🎬 Professional Scripts</div>
                    <div className="text-purple-200 font-semibold">AI-Generated Scene Breakdowns</div>
                    <div className="text-sm text-gray-300 mt-2">
                      Get detailed, cinematic scene descriptions ready for video production
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>
              <Card className="relative bg-black/50 backdrop-blur-lg border border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300 rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">⚡ Instant Results</div>
                    <div className="text-cyan-200 font-semibold">Seconds, Not Hours</div>
                    <div className="text-sm text-gray-300 mt-2">
                      Generate professional scripts in under 30 seconds
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>
              <Card className="relative bg-black/50 backdrop-blur-lg border border-pink-400/30 hover:border-pink-400/50 transition-all duration-300 rounded-2xl">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white mb-2">🎯 Perfect for Video</div>
                    <div className="text-pink-200 font-semibold">AI Video Generation Ready</div>
                    <div className="text-sm text-gray-300 mt-2">
                      Scripts optimized for AI video generation platforms
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Generated Scenes Display */}
        {sceneData && (
          <div className="mt-12">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl text-white flex items-center gap-2">
                      <Film className="w-6 h-6" />
                      Generated Script
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      {sceneData.total_scenes} scenes • ~{sceneData.estimated_duration_per_scene.toFixed(1)}s per scene
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={resetForm}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Generate New
                    </Button>
                    <Button
                      asChild
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Link href="/app/generate">
                        Create Video
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sceneData.scenes.map((scene, index) => (
                    <Card key={index} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <Badge className="bg-purple-500/20 text-purple-200 border-purple-400/30 shrink-0">
                            Scene {index + 1}
                          </Badge>
                          <p className="text-gray-200 leading-relaxed">{scene}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
