'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Loader2, Play, Download, Sparkles, Video, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface VideoGenerationRequest {
  prompt: string
  style: string
  duration: number
}

interface VideoGenerationResponse {
  videoUrl: string
  status: string
  id?: string
}

export default function VideoEditorUI() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('tiktok')
  const [duration, setDuration] = useState(30)
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoUrl, setVideoUrl] = useState('')
  const [generationId, setGenerationId] = useState('')

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a video prompt')
      return
    }

    setIsGenerating(true)
    setVideoUrl('')

    try {
      const requestData: VideoGenerationRequest = {
        prompt: prompt.trim(),
        style,
        duration
      }

      const response = await fetch('/api/edit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: VideoGenerationResponse = await response.json()
      
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl)
        setGenerationId(data.id || '')
        toast.success('Video generated successfully!')
      } else {
        throw new Error('No video URL received')
      }
    } catch (error) {
      console.error('Video generation error:', error)
      toast.error('Failed to generate video. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (videoUrl) {
      const link = document.createElement('a')
      link.href = videoUrl
      link.download = `aeon-video-${Date.now()}.mp4`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Download started!')
    }
  }

  const styleOptions = [
    { value: 'tiktok', label: 'TikTok Style' },
    { value: 'youtube', label: 'YouTube Style' },
    { value: 'instagram', label: 'Instagram Style' },
    { value: 'professional', label: 'Professional' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'viral', label: 'Viral' }
  ]

  const durationOptions = [
    { value: 15, label: '15 seconds' },
    { value: 30, label: '30 seconds' },
    { value: 60, label: '1 minute' },
    { value: 90, label: '1.5 minutes' },
    { value: 120, label: '2 minutes' }
  ]

  return (
    <div className="space-y-6">
      {/* Generation Form */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Video Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prompt Input */}
          <div className="space-y-2">
            <Label htmlFor="prompt" className="text-white">Video Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="Describe the video you want to create... (e.g., 'A fitness influencer doing a high-intensity workout with motivational music')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px] bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              disabled={isGenerating}
            />
          </div>

          {/* Style and Duration Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="style" className="text-white">Video Style</Label>
              <Select value={style} onValueChange={setStyle} disabled={isGenerating}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {styleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value} className="text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-white">Duration</Label>
              <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))} disabled={isGenerating}>
                <SelectTrigger className="bg-white/5 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-gray-700">
                  {durationOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()} className="text-white">
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-semibold py-3"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate Video
              </>
            )}
          </Button>

          {/* Generation Status */}
          {isGenerating && (
            <div className="flex items-center justify-center p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin mr-2" />
              <span className="text-purple-300">AI is creating your video...</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Video Preview */}
      {videoUrl && (
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-green-400" />
              Generated Video
            </CardTitle>
            {generationId && (
              <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                ID: {generationId}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <video
                controls
                src={videoUrl}
                className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
                poster="/video-placeholder.png"
              >
                Your browser does not support the video tag.
              </video>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleDownload}
                className="bg-green-600 hover:bg-green-500 text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Download Video
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setPrompt('')
                  setVideoUrl('')
                  setGenerationId('')
                }}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Generate Another
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Tips for Better Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300">
            <div>
              <h4 className="font-semibold text-white mb-2">Writing Prompts</h4>
              <ul className="space-y-1">
                <li>• Be specific about the content and style</li>
                <li>• Include details about mood and atmosphere</li>
                <li>• Mention target audience and platform</li>
                <li>• Specify any special effects or transitions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Best Practices</h4>
              <ul className="space-y-1">
                <li>• Keep prompts under 200 characters</li>
                <li>• Use action words and descriptive language</li>
                <li>• Mention music style if relevant</li>
                <li>• Include camera angles or shot types</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 