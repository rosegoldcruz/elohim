'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface VideoJobFormProps {
  userId: string
  credits: number
}

export function VideoJobForm({ userId, credits }: VideoJobFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    style: 'viral',
    duration: 60,
    music_style: 'upbeat'
  })

  const creditsRequired = Math.ceil(formData.duration / 60) * 100

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create job')
      }

      toast.success('Video job created successfully!')
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        style: 'viral',
        duration: 60,
        music_style: 'upbeat'
      })

      // Refresh the page to update credits and jobs list
      window.location.reload()

    } catch (error) {
      console.error('Job creation error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create job')
    } finally {
      setIsLoading(false)
    }
  }

  const canAfford = credits >= creditsRequired

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Video Title</Label>
        <Input
          id="title"
          placeholder="Enter video title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="bg-white/5 border-white/10"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          placeholder="Describe what you want in your video"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          className="bg-white/5 border-white/10 min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="style">Video Style</Label>
          <Select value={formData.style} onValueChange={(value) => setFormData({ ...formData, style: value })}>
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-white/10">
              <SelectItem value="viral">Viral</SelectItem>
              <SelectItem value="cinematic">Cinematic</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="duration">Duration (seconds)</Label>
          <Select 
            value={formData.duration.toString()} 
            onValueChange={(value) => setFormData({ ...formData, duration: parseInt(value) })}
          >
            <SelectTrigger className="bg-white/5 border-white/10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-black border-white/10">
              <SelectItem value="15">15 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">60 seconds</SelectItem>
              <SelectItem value="90">90 seconds</SelectItem>
              <SelectItem value="120">2 minutes</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="music_style">Music Style</Label>
        <Select value={formData.music_style} onValueChange={(value) => setFormData({ ...formData, music_style: value })}>
          <SelectTrigger className="bg-white/5 border-white/10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-black border-white/10">
            <SelectItem value="upbeat">Upbeat</SelectItem>
            <SelectItem value="chill">Chill</SelectItem>
            <SelectItem value="dramatic">Dramatic</SelectItem>
            <SelectItem value="electronic">Electronic</SelectItem>
            <SelectItem value="none">No Music</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Credits Info */}
      <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-neutral-300">
            Credits required: {creditsRequired}
          </span>
        </div>
        <div className="text-sm text-neutral-300">
          Available: {credits}
        </div>
      </div>

      {!canAfford && (
        <Alert className="border-red-500/50 bg-red-500/10">
          <AlertDescription className="text-red-400">
            Insufficient credits. You need {creditsRequired} credits but only have {credits}.
          </AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-purple-600 to-cyan-600"
        disabled={isLoading || !canAfford}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Video ({creditsRequired} credits)
      </Button>
    </form>
  )
}
