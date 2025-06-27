'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, Clock, AlertCircle, Loader2, Download, Video, Wand2, Play } from 'lucide-react'
import Link from 'next/link'

interface VideoStatus {
  video_id: string
  status: string
  progress: number
  current_agent?: string
  estimated_completion?: string
  error_message?: string
}

export default function VideoStatusPage() {
  const params = useParams()
  const videoId = params.videoId as string
  const [status, setStatus] = useState<VideoStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!videoId) return

    fetchStatus()
    
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [videoId])

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/status/${videoId}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setStatus(data)
      }
    } catch (err) {
      console.error('Error fetching status:', err)
      setError('Failed to fetch video status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
      case 'queued':
        return {
          color: 'bg-yellow-500',
          text: 'Queued',
          description: 'Your video is in the queue...',
          icon: Clock,
        }
      case 'processing':
        return {
          color: 'bg-blue-500',
          text: 'Processing',
          description: 'Our AI agents are creating your video...',
          icon: Loader2,
        }
      case 'completed':
        return {
          color: 'bg-green-500',
          text: 'Completed',
          description: 'Your video is ready!',
          icon: CheckCircle,
        }
      case 'failed':
        return {
          color: 'bg-red-500',
          text: 'Failed',
          description: 'Something went wrong during generation',
          icon: AlertCircle,
        }
      default:
        return {
          color: 'bg-gray-500',
          text: 'Unknown',
          description: 'Checking status...',
          icon: Clock,
        }
    }
  }

  const getAgentInfo = (agent: string) => {
    switch (agent) {
      case 'scriptwriter':
        return {
          name: 'ScriptWriter Agent',
          description: 'Generating scene prompts with GPT-4',
          icon: Wand2,
          color: 'text-purple-400',
        }
      case 'visualgen':
        return {
          name: 'VisualGen Agent',
          description: 'Creating video scenes with 6 AI models',
          icon: Video,
          color: 'text-blue-400',
        }
      case 'editor':
        return {
          name: 'Editor Agent',
          description: 'Assembling final video with FFmpeg',
          icon: Play,
          color: 'text-green-400',
        }
      case 'scheduler':
        return {
          name: 'Scheduler Agent',
          description: 'Managing job queue and progress',
          icon: Clock,
          color: 'text-yellow-400',
        }
      default:
        return {
          name: 'Processing',
          description: 'Working on your video...',
          icon: Loader2,
          color: 'text-gray-400',
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white">Loading video status...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button asChild>
              <Link href="/instant">Try Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-white">Video not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusInfo(status.status)
  const agentInfo = status.current_agent ? getAgentInfo(status.current_agent) : null
  const StatusIcon = statusInfo.icon

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Video Generation Status</h1>
            <p className="text-gray-300">Video ID: {videoId.substring(0, 8)}...</p>
          </div>

          {/* Status Card */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <StatusIcon className={`w-5 h-5 ${status.status === 'processing' ? 'animate-spin' : ''}`} />
                Video Generation Progress
              </CardTitle>
              <CardDescription className="text-gray-300">
                {statusInfo.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <Badge className={`${statusInfo.color} text-white border-0`}>
                  {statusInfo.text}
                </Badge>
                {status.estimated_completion && (
                  <span className="text-gray-300 text-sm">
                    ETA: {status.estimated_completion}
                  </span>
                )}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm text-gray-300 mb-2">
                  <span>Progress</span>
                  <span>{Math.round(status.progress * 100)}%</span>
                </div>
                <Progress value={status.progress * 100} className="h-2" />
              </div>

              {/* Current Agent */}
              {agentInfo && (
                <div className="bg-white/5 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <agentInfo.icon className={`w-5 h-5 ${agentInfo.color}`} />
                    <div>
                      <h3 className="text-white font-medium">{agentInfo.name}</h3>
                      <p className="text-gray-400 text-sm">{agentInfo.description}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {status.error_message && (
                <div className="bg-red-500/20 rounded-lg p-4 border border-red-400/30">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <h3 className="text-white font-medium">Error</h3>
                  </div>
                  <p className="text-red-300 text-sm">{status.error_message}</p>
                </div>
              )}

              {/* Completed Video */}
              {status.status === 'completed' && (
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-green-400/30">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-medium">Video Ready!</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">
                    Your video has been generated successfully and is ready for download.
                  </p>
                  <div className="flex gap-3">
                    <Button className="bg-green-500 hover:bg-green-600">
                      <Download className="w-4 h-4 mr-2" />
                      Download Video
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/dashboard">
                        View Dashboard
                      </Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 7-Agent Process */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardHeader>
              <CardTitle className="text-white">7-Agent AI Process</CardTitle>
              <CardDescription className="text-gray-300">
                How AEON creates your video
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'ScriptWriter', description: 'Generate scene prompts', icon: Wand2, color: 'text-purple-400' },
                  { name: 'VisualGen', description: 'Create video scenes', icon: Video, color: 'text-blue-400' },
                  { name: 'Editor', description: 'Assemble final video', icon: Play, color: 'text-green-400' },
                  { name: 'Scheduler', description: 'Manage processing', icon: Clock, color: 'text-yellow-400' },
                ].map((agent, index) => (
                  <div key={agent.name} className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                    <agent.icon className={`w-5 h-5 ${agent.color}`} />
                    <div className="flex-1">
                      <div className="text-white font-medium">{agent.name} Agent</div>
                      <div className="text-gray-400 text-sm">{agent.description}</div>
                    </div>
                    {status.current_agent === agent.name.toLowerCase() && (
                      <Badge className="bg-blue-500 text-white border-0">Active</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="text-center mt-8">
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                <Link href="/instant">Create Another Video</Link>
              </Button>
              <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
