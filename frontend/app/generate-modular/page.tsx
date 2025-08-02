'use client'

import { useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

// Configuration constants
const durations = [30, 60, 90, 120]
const sceneLengths = [5, 10]

const fastModels5s = [
  'minimax',
  'kling', 
  'haiper'
]

const stableModels10s = [
  'haiper',
  'luma'
]

interface SceneResult {
  scene_id: string
  prediction_id: string
  status: string
  output_url?: string
  error?: string
  model: string
  prompt_used: string
}

interface GenerationSummary {
  total: number
  completed: number
  failed: number
  in_progress: number
}

export default function GenerateModular() {
  const [prompt, setPrompt] = useState('')
  const [duration, setDuration] = useState(60)
  const [sceneDuration, setSceneDuration] = useState(5)
  const [sceneResults, setSceneResults] = useState<SceneResult[]>([])
  const [status, setStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle')
  const [summary, setSummary] = useState<GenerationSummary | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [pollUrls, setPollUrls] = useState<string[]>([])
  const [error, setError] = useState<string>('')

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const getModel = (i: number): string => {
    const pool = sceneDuration === 10 ? stableModels10s : fastModels5s
    return pool[i % pool.length]
  }

  const handleGenerate = async () => {
    if (!prompt.trim() || !user) {
      setError('Please enter a prompt and ensure you are logged in')
      return
    }

    const sceneCount = Math.ceil(duration / sceneDuration)
    if (sceneCount < 1) {
      setError('Invalid duration configuration')
      return
    }

    setStatus('generating')
    setSceneResults([])
    setSummary(null)
    setError('')
    setPollUrls([])

    try {
      // Create scenes array
      const scenes = Array.from({ length: sceneCount }).map((_, i) => ({
        segment_id: `scene_${uuidv4()}`,
        prompt_text: `${prompt} — Scene ${i + 1} of ${sceneCount}`,
        duration: sceneDuration,
        model: getModel(i),
        width: 576,
        height: 1024
      }))

      console.log('Starting generation with scenes:', scenes)

      // Start generation
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smart4technology.com:8000'
      const res = await fetch(`${backendUrl}/api/generate/modular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenes })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.detail || `HTTP ${res.status}: ${res.statusText}`)
      }

      const data = await res.json()
      console.log('Generation started:', data)

      if (data.status !== 'started' || !data.scenes) {
        throw new Error('Failed to start scene generation')
      }

      // Extract poll URLs and set initial results
      const urls = data.scenes
        .filter((s: any) => s.poll_url)
        .map((s: any) => s.poll_url)
      
      setPollUrls(urls)
      
      // Set initial scene results
      const initialResults: SceneResult[] = data.scenes.map((s: any) => ({
        scene_id: s.scene_id,
        prediction_id: s.prediction_id,
        status: s.status,
        model: s.model,
        prompt_used: s.prompt_used,
        error: s.error
      }))
      
      setSceneResults(initialResults)

      // Start polling
      if (urls.length > 0) {
        startPolling(urls, sceneCount)
      } else {
        throw new Error('No valid scenes to poll')
      }

    } catch (error: any) {
      console.error('Error generating video:', error)
      setStatus('error')
      setError(error.message || 'Failed to start generation')
    }
  }

  const startPolling = async (urls: string[], expectedCount: number) => {
    const poll = async () => {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://smart4technology.com:8000'
        const pollRes = await fetch(`${backendUrl}/api/poll/modular-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ poll_urls: urls })
        })

        if (!pollRes.ok) {
          console.error('Poll request failed:', pollRes.status)
          setTimeout(poll, 5000) // Retry in 5 seconds
          return
        }

        const pollData = await pollRes.json()
        console.log('Poll result:', pollData)

        if (pollData.scenes) {
          // Update scene results
          const updatedResults: SceneResult[] = pollData.scenes.map((s: any) => ({
            scene_id: s.prediction_id, // Use prediction_id as scene_id for now
            prediction_id: s.prediction_id,
            status: s.status,
            output_url: s.output_url,
            error: s.error,
            model: 'unknown', // Model info lost in polling, could be improved
            prompt_used: 'unknown'
          }))

          setSceneResults(updatedResults)
          setSummary(pollData.summary)

          // Check if all scenes are complete
          const completed = updatedResults.filter(s => s.status === 'succeeded')
          const failed = updatedResults.filter(s => s.status === 'failed')
          const inProgress = updatedResults.filter(s => 
            s.status === 'starting' || s.status === 'processing'
          )

          if (completed.length === expectedCount) {
            setStatus('done')
            console.log('All scenes completed successfully!')
          } else if (failed.length > 0 && inProgress.length === 0) {
            setStatus('error')
            setError(`${failed.length} scenes failed to generate`)
          } else {
            // Continue polling
            setTimeout(poll, 4000)
          }
        } else {
          setTimeout(poll, 4000)
        }

      } catch (error: any) {
        console.error('Polling error:', error)
        setTimeout(poll, 5000) // Retry in 5 seconds on error
      }
    }

    poll()
  }

  const completedScenes = sceneResults.filter(s => s.status === 'succeeded' && s.output_url)
  const failedScenes = sceneResults.filter(s => s.status === 'failed')
  const processingScenes = sceneResults.filter(s => 
    s.status === 'starting' || s.status === 'processing'
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-[#19132c] to-black flex flex-col items-center justify-center py-12 px-4">
      <div className="w-full max-w-4xl bg-zinc-900/90 rounded-2xl shadow-2xl p-8 border border-purple-900">
        <h1 className="text-4xl font-bold text-white mb-6 text-center">
          🎬 Modular Video Generator
        </h1>
        
        <div className="space-y-6">
          {/* Input Section */}
          <div>
            <label className="text-white mb-2 block">Base Prompt</label>
            <textarea
              className="w-full p-3 border border-zinc-700 rounded-lg bg-black/70 text-white resize-none focus:outline-none focus:border-purple-500"
              placeholder="Enter your video concept (e.g., 'a cinematic journey through a futuristic city')"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-white mb-2 block">Total Duration</label>
              <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                <SelectTrigger className="bg-black text-white border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border-zinc-700">
                  {durations.map((d) => (
                    <SelectItem key={d} value={d.toString()}>{d}s</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-white mb-2 block">Scene Length</label>
              <Select value={sceneDuration.toString()} onValueChange={(v) => setSceneDuration(parseInt(v))}>
                <SelectTrigger className="bg-black text-white border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-black text-white border-zinc-700">
                  {sceneLengths.map((s) => (
                    <SelectItem key={s} value={s.toString()}>{s}s per scene</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <div className="text-white text-sm">
                <p>🎬 Total Scenes: <span className="font-bold">{Math.ceil(duration / sceneDuration)}</span></p>
                <p>🤖 Models: <span className="font-bold">{sceneDuration === 10 ? 'Stable (10s)' : 'Fast (5s)'}</span></p>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button
            className="w-full py-3 text-lg font-bold bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white rounded-xl hover:scale-[1.02] transition-transform shadow-xl disabled:opacity-50"
            onClick={handleGenerate}
            disabled={status === 'generating' || !prompt.trim() || !user}
          >
            {status === 'generating' ? 'Generating Scenes...' : 'Generate Modular Video'}
          </Button>

          {/* Status Display */}
          {status === 'generating' && (
            <div className="bg-black/50 rounded-lg p-4 border border-purple-900/50">
              <div className="flex items-center space-x-2 mb-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                <p className="text-purple-300">Generating {Math.ceil(duration / sceneDuration)} scenes in parallel...</p>
              </div>
              
              {summary && (
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-400">Total</p>
                    <p className="text-white font-bold">{summary.total}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Completed</p>
                    <p className="text-green-400 font-bold">{summary.completed}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Processing</p>
                    <p className="text-yellow-400 font-bold">{summary.in_progress}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400">Failed</p>
                    <p className="text-red-400 font-bold">{summary.failed}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Display */}
          {(status === 'error' || error) && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-400">❌ {error || 'Generation failed'}</p>
              {failedScenes.length > 0 && (
                <div className="mt-2 text-sm text-red-300">
                  Failed scenes: {failedScenes.map(s => s.scene_id).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* Results Display */}
          {completedScenes.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white">
                ✅ Generated Scenes ({completedScenes.length}/{Math.ceil(duration / sceneDuration)})
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {completedScenes.map((scene, idx) => (
                  <div key={scene.scene_id} className="bg-black/30 rounded-lg p-4 border border-zinc-700">
                    <p className="text-white text-sm mb-2">Scene {idx + 1}</p>
                    <video 
                      src={scene.output_url} 
                      controls 
                      className="w-full rounded shadow aspect-[9/16]"
                      preload="metadata"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
