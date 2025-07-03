"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Sparkles, Loader2, CheckCircle, XCircle, Download, Eye, Clock, Video } from "lucide-react"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"

interface VideoProject {
  id: string
  title: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  current_stage: string
  status_message: string
  current_agent: string
  video_url?: string
  file_size?: number
  processing_time?: number
  created_at: string
  updated_at: string
}

interface GenerationProgress {
  stage: string
  progress: number
  message: string
  agent: string
}

export default function StudioPage() {
  // Form state
  const [topic, setTopic] = useState("")
  const [customScript, setCustomScript] = useState("")
  const [style, setStyle] = useState("TikTok/Documentary")
  const [duration, setDuration] = useState(60)
  const [projectName, setProjectName] = useState("")
  const [useCustomScript, setUseCustomScript] = useState(false)
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentProject, setCurrentProject] = useState<VideoProject | null>(null)
  const [progress, setProgress] = useState<GenerationProgress | null>(null)
  
  // Projects state
  const [projects, setProjects] = useState<VideoProject[]>([])
  const [loadingProjects, setLoadingProjects] = useState(true)
  
  // Supabase client
  const supabase = createClient()

  // Load user projects on mount
  useEffect(() => {
    loadProjects()
  }, [])

  // Poll for project updates when generating
  useEffect(() => {
    if (currentProject && isGenerating) {
      const interval = setInterval(async () => {
        await updateProjectStatus(currentProject.id)
      }, 2000)

      return () => clearInterval(interval)
    }
  }, [currentProject, isGenerating])

  const loadProjects = async () => {
    try {
      setLoadingProjects(true)
      
      // Get current user (in production, this would come from auth)
      const userId = 'demo-user' // TODO: Replace with real auth
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Failed to load projects:', error)
        toast.error('Failed to load projects')
        return
      }

      setProjects(data || [])
    } catch (error) {
      console.error('Error loading projects:', error)
      toast.error('Error loading projects')
    } finally {
      setLoadingProjects(false)
    }
  }

  const updateProjectStatus = async (projectId: string) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) {
        console.error('Failed to update project status:', error)
        return
      }

      if (data) {
        setCurrentProject(data)
        setProgress({
          stage: data.current_stage || 'initializing',
          progress: data.progress || 0,
          message: data.status_message || 'Starting...',
          agent: data.current_agent || 'System'
        })

        // Check if generation is complete
        if (data.status === 'completed' || data.status === 'failed') {
          setIsGenerating(false)
          
          if (data.status === 'completed') {
            toast.success('Video generation completed!')
          } else {
            toast.error(`Video generation failed: ${data.error_message || 'Unknown error'}`)
          }
          
          // Reload projects list
          await loadProjects()
        }
      }
    } catch (error) {
      console.error('Error updating project status:', error)
    }
  }

  const handleGenerate = async () => {
    // Validate inputs
    if (!useCustomScript && !topic.trim()) {
      toast.error("Please enter a topic or use custom script mode")
      return
    }

    if (useCustomScript && !customScript.trim()) {
      toast.error("Please enter a custom script")
      return
    }

    setIsGenerating(true)
    setProgress({ stage: 'initializing', progress: 0, message: 'Starting video generation...', agent: 'System' })
    
    try {
      const userId = 'demo-user' // TODO: Replace with real auth
      
      const requestBody = {
        user_id: userId,
        project_name: projectName.trim() || undefined,
        style,
        duration,
        ...(useCustomScript 
          ? { custom_script: customScript.trim() }
          : { topic: topic.trim() }
        )
      }

      console.log('🎬 Starting video generation:', requestBody)
      toast.info("Starting AI video generation pipeline...")

      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Video generation failed')
      }

      console.log('✅ Video generation started:', result)
      
      // Set current project for polling
      if (result.project_id) {
        setCurrentProject({ 
          id: result.project_id,
          title: projectName || topic || 'Custom Video',
          status: 'processing',
          progress: 0,
          current_stage: 'initializing',
          status_message: 'Starting...',
          current_agent: 'System',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      }

      toast.success("Video generation started! This may take several minutes...")

    } catch (error) {
      console.error('❌ Video generation failed:', error)
      setIsGenerating(false)
      toast.error(error instanceof Error ? error.message : 'Video generation failed')
    }
  }

  const downloadVideo = (videoUrl: string, filename: string) => {
    const link = document.createElement('a')
    link.href = videoUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(1)} MB`
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            🎬 AEON Video Studio
          </h1>
          <p className="text-xl text-purple-200">
            Generate complete AI videos with the full agent pipeline
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Panel: Video Generation */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                Video Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={!useCustomScript ? "default" : "outline"}
                  onClick={() => setUseCustomScript(false)}
                  className="flex-1"
                >
                  AI Topic
                </Button>
                <Button
                  variant={useCustomScript ? "default" : "outline"}
                  onClick={() => setUseCustomScript(true)}
                  className="flex-1"
                >
                  Custom Script
                </Button>
              </div>

              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="project-name" className="text-white">Project Name (Optional)</Label>
                <Input
                  id="project-name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="My Awesome Video"
                  className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300"
                />
              </div>

              {/* Topic or Custom Script */}
              {!useCustomScript ? (
                <div className="space-y-2">
                  <Label htmlFor="topic" className="text-white">Video Topic</Label>
                  <Textarea
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Why AI will change everything in 2024..."
                    className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300 min-h-[100px]"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="script" className="text-white">Custom Script</Label>
                  <Textarea
                    id="script"
                    value={customScript}
                    onChange={(e) => setCustomScript(e.target.value)}
                    placeholder="Scene 1: Hook - Did you know that AI can now..."
                    className="bg-white/10 border-purple-500/30 text-white placeholder:text-purple-300 min-h-[120px]"
                  />
                </div>
              )}

              {/* Style and Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="style" className="text-white">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger className="bg-white/10 border-purple-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TikTok/Documentary">TikTok/Documentary</SelectItem>
                      <SelectItem value="Cinematic">Cinematic</SelectItem>
                      <SelectItem value="Educational">Educational</SelectItem>
                      <SelectItem value="Entertainment">Entertainment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-white">Duration (seconds)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 60)}
                    min="15"
                    max="180"
                    className="bg-white/10 border-purple-500/30 text-white"
                  />
                </div>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>

              {/* Progress Display */}
              {progress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-purple-200">{progress.agent}</span>
                    <span className="text-purple-200">{progress.progress}%</span>
                  </div>
                  <div className="w-full bg-purple-900/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress.progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-purple-300">{progress.message}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Right Panel: Projects */}
          <Card className="bg-black/20 backdrop-blur-sm border-purple-500/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-400" />
                Your Projects
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingProjects ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-purple-300">No projects yet. Generate your first video!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {projects.map((project) => (
                    <div key={project.id} className="p-4 bg-white/5 rounded-lg border border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">{project.title}</h3>
                        <Badge
                          className={
                            project.status === 'completed'
                              ? 'bg-green-500/20 text-green-200 border-green-500/30'
                              : project.status === 'failed'
                              ? 'bg-red-500/20 text-red-200 border-red-500/30'
                              : 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30'
                          }
                        >
                          {project.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {project.status === 'failed' && <XCircle className="w-3 h-3 mr-1" />}
                          {project.status === 'processing' && <Clock className="w-3 h-3 mr-1" />}
                          {project.status}
                        </Badge>
                      </div>

                      {project.status === 'processing' && (
                        <div className="mb-2">
                          <div className="flex justify-between text-xs text-purple-300 mb-1">
                            <span>{project.current_agent}</span>
                            <span>{project.progress}%</span>
                          </div>
                          <div className="w-full bg-purple-900/50 rounded-full h-1">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <p className="text-xs text-purple-400 mt-1">{project.status_message}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-purple-300">
                        <span>{new Date(project.created_at).toLocaleDateString()}</span>
                        {project.video_url && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(project.video_url, '_blank')}
                              className="border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                            >
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadVideo(project.video_url!, `${project.title}.mp4`)}
                              className="border-purple-500/30 text-purple-200 hover:bg-purple-500/20"
                            >
                              <Download className="w-3 h-3 mr-1" />
                              Download
                            </Button>
                          </div>
                        )}
                      </div>

                      {project.file_size && (
                        <div className="text-xs text-purple-400 mt-1">
                          Size: {formatFileSize(project.file_size)}
                          {project.processing_time && (
                            <span className="ml-2">
                              Time: {formatDuration(project.processing_time)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
