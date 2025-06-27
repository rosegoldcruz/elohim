'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Play, Sparkles, Clock, Star } from 'lucide-react'
import { toast } from 'sonner'

const VIDEO_STYLES = [
  { value: 'cinematic', label: 'Cinematic', description: 'Movie-style with dramatic lighting' },
  { value: 'documentary', label: 'Documentary', description: 'Realistic and natural' },
  { value: 'commercial', label: 'Commercial', description: 'Polished advertising style' },
  { value: 'social_media', label: 'Social Media', description: 'Engaging and vibrant' },
  { value: 'artistic', label: 'Artistic', description: 'Creative and unique' },
  { value: 'minimalist', label: 'Minimalist', description: 'Clean and simple' },
]

export default function InstantVideoPage() {
  const [formData, setFormData] = useState({
    email: '',
    videoTopic: '',
    preferredStyle: '',
    duration: 60,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.videoTopic || !formData.preferredStyle) {
      toast.error('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      // Call AEON video request API route
      const response = await fetch('/api/video-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          topic: formData.videoTopic,
          style: formData.preferredStyle,
          duration: formData.duration
        }),
      })

      const result = await response.json()

      if (!result.success) {
        toast.error(result.detail || result.message || 'Video generation failed')
        return
      }

      // Show success message with video ID
      toast.success(`Video generation started! ${result.message || 'Processing your video...'}`)

      // Redirect to status page
      if (result.video_id) {
        window.location.href = `/status/${result.video_id}`
      } else {
        console.log('Video generation started:', result)
      }
    } catch (error) {
      console.error('Video request error:', error)
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Video Generation
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Generate Your
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {' '}Perfect Video
            </span>
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Create professional 2-minute videos instantly with our 6-model AI ensemble. 
            From concept to completion in minutes, not hours.
          </p>
          
          {/* Social Proof */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10,000+</div>
              <div className="text-sm text-gray-400">Videos Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.9/5</div>
              <div className="flex items-center justify-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">2 min</div>
              <div className="text-sm text-gray-400">Average Time</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Order Form */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Play className="w-6 h-6" />
                Create Your Video Now
              </CardTitle>
              <CardDescription className="text-gray-300">
                Tell us what you want, and we'll create it instantly
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Video Topic / Description
                  </label>
                  <Textarea
                    placeholder="Describe your video idea... (e.g., 'A peaceful sunset over mountains with birds flying')"
                    value={formData.videoTopic}
                    onChange={(e) => setFormData({ ...formData, videoTopic: e.target.value })}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Video Duration
                  </label>
                  <Select
                    value={formData.duration.toString()}
                    onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Choose duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 seconds - $19.95</SelectItem>
                      <SelectItem value="60">60 seconds - $29.95</SelectItem>
                      <SelectItem value="120">120 seconds - $49.95</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Preferred Style
                  </label>
                  <Select
                    value={formData.preferredStyle}
                    onValueChange={(value) => setFormData({ ...formData, preferredStyle: value })}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="Choose a video style" />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_STYLES.map((style) => (
                        <SelectItem key={style.value} value={style.value}>
                          <div>
                            <div className="font-medium">{style.label}</div>
                            <div className="text-sm text-gray-500">{style.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-6 text-lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      Generate Video - ${formData.duration === 30 ? '19.95' : formData.duration === 60 ? '29.95' : '49.95'}
                      <Clock className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Features & Benefits */}
          <div className="space-y-8">
            <Card className="bg-white/5 backdrop-blur-lg border-white/10">
              <CardHeader>
                <CardTitle className="text-xl text-white">What You Get</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <div className="text-white font-medium">120-Second Professional Video</div>
                    <div className="text-gray-400 text-sm">Full 2-minute video, not just clips</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <div className="text-white font-medium">6-Model AI Ensemble</div>
                    <div className="text-gray-400 text-sm">Best quality from multiple AI models</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <div className="text-white font-medium">Professional Editing</div>
                    <div className="text-gray-400 text-sm">Transitions, music, and effects included</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                  <div>
                    <div className="text-white font-medium">Instant Delivery</div>
                    <div className="text-gray-400 text-sm">Download link sent to your email</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500/20 to-blue-500/20 backdrop-blur-lg border-green-400/30">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-2">vs. Competitors</div>
                  <div className="text-green-400 font-semibold">AEON: $29.95 → 1 Complete Video</div>
                  <div className="text-gray-400">Others: $35+ → Raw clips only</div>
                  <div className="text-sm text-gray-300 mt-2">
                    Save 2+ hours of manual editing work
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
