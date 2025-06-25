"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Zap, Play, Crown, Clock, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { useApi } from '@/lib/api'

interface VideoGeneratorProps {
  userId?: string
  className?: string
}

export default function VideoGenerator({ userId, className = "" }: VideoGeneratorProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentProject, setCurrentProject] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const { generateVideo, CREDIT_COSTS } = useApi()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a video prompt')
      return
    }

    if (!userId) {
      toast.error('Please sign in to generate videos')
      return
    }

    setIsGenerating(true)
    
    try {
      toast.info('🎬 Orchestra Mode activating...', {
        description: '6 AI Directors are collaborating on your vision'
      })

      const response = await fetch('/api/v1/agents/video-generator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt: prompt.trim(),
          options: {
            style: 'cinematic',
            quality: 'high'
          }
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        if (response.status === 402) {
          toast.error('Insufficient credits', {
            description: result.message,
            action: {
              label: 'Upgrade',
              onClick: () => window.location.href = '/pricing'
            }
          })
          return
        }
        throw new Error(result.error || 'Failed to start video generation')
      }

      setCurrentProject(result.data)
      toast.success(result.message, {
        description: `Project ID: ${result.data.projectId}`
      })

      // Start polling for progress
      pollProgress(result.data.projectId)

    } catch (error) {
      console.error('Video generation error:', error)
      toast.error('Failed to generate video', {
        description: error instanceof Error ? error.message : 'Please try again'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const pollProgress = async (projectId: string) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/v1/projects/${projectId}`)
        const result = await response.json()

        if (result.success) {
          setProgress(result.progress.percentage)
          setCurrentProject(result)

          if (result.isComplete) {
            clearInterval(pollInterval)
            toast.success('🎉 Your video is ready!', {
              description: 'All 6 AI Directors have delivered their masterpiece'
            })
          } else if (result.hasFailed) {
            clearInterval(pollInterval)
            toast.error('Video generation failed', {
              description: 'Some scenes failed to generate. Please try again.'
            })
          }
        }
      } catch (error) {
        console.error('Error polling progress:', error)
      }
    }, 3000) // Poll every 3 seconds

    // Stop polling after 10 minutes
    setTimeout(() => clearInterval(pollInterval), 600000)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Generator */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-orange-500/10 border-purple-500/20 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-orange-600 rounded-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">Orchestra Mode Video Generator</h3>
              <p className="text-sm text-gray-400 font-normal">6 AI Directors collaborate on your vision</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-300">
              Describe your video vision
            </label>
            <Textarea
              placeholder="A majestic dragon soaring through a cyberpunk cityscape at sunset, with neon lights reflecting off its scales..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] bg-black/20 border-purple-500/30 focus:border-orange-500/50 text-white placeholder:text-gray-500"
              maxLength={500}
            />
            <div className="flex justify-between text-xs text-gray-400">
              <span>{prompt.length}/500 characters</span>
              <span>{CREDIT_COSTS.VIDEO_GENERATION} credits = 1 complete 60-second video</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <Crown className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <p className="font-semibold">6 AI Models</p>
              <p className="text-xs text-gray-400">All working together</p>
            </div>
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <Clock className="h-8 w-8 text-blue-400 mx-auto mb-2" />
              <p className="font-semibold">60 Seconds</p>
              <p className="text-xs text-gray-400">Complete video</p>
            </div>
            <div className="bg-black/20 rounded-lg p-4 text-center">
              <Zap className="h-8 w-8 text-green-400 mx-auto mb-2" />
              <p className="font-semibold">2-5 Minutes</p>
              <p className="text-xs text-gray-400">Generation time</p>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full py-6 text-lg font-bold bg-gradient-to-r from-purple-600 to-orange-600 hover:from-purple-700 hover:to-orange-700 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Orchestra Mode Activated...
              </>
            ) : (
              <>
                <Play className="h-5 w-5 mr-3" />
                🎬 Generate with 6 AI Directors
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Display */}
      {currentProject && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="bg-black/40 border-purple-500/20">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Generation Progress</h4>
                  <Badge className="bg-purple-500/20 text-purple-400">
                    {progress}% Complete
                  </Badge>
                </div>
                
                <Progress value={progress} className="h-3" />
                
                <p className="text-sm text-gray-400">
                  {currentProject.progress?.message || 'Processing...'}
                </p>

                {/* Scene Status */}
                {currentProject.scenes && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {currentProject.scenes.map((scene: any, index: number) => (
                      <div
                        key={scene.sceneNumber}
                        className="bg-black/20 rounded-lg p-3 text-center"
                      >
                        <div className="flex items-center justify-center mb-2">
                          {scene.status === 'completed' ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : scene.status === 'failed' ? (
                            <AlertCircle className="h-5 w-5 text-red-400" />
                          ) : (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-400"></div>
                          )}
                        </div>
                        <p className="text-xs font-medium">Director {scene.sceneNumber}</p>
                        <p className="text-xs text-gray-400 capitalize">{scene.status}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
