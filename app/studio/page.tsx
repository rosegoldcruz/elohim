"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Sparkles, Loader2, CheckCircle, XCircle, Scissors } from "lucide-react"
import { toast } from "sonner"

type SceneStatus = "pending" | "rendering" | "completed" | "failed"

type Scene = {
  id: number
  status: SceneStatus
  progress: number
  eta: string
  thumbnailUrl: string | null
}

export default function StudioPage() {
  const [scenes, setScenes] = useState<Scene[]>(
    Array.from({ length: 16 }, (_, i) => ({
      id: i + 1,
      status: "pending" as SceneStatus,
      progress: 0,
      eta: "N/A",
      thumbnailUrl: null,
    })),
  )

  const [assembledClips, setAssembledClips] = useState<Scene[]>([])
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isAssembling, setIsAssembling] = useState(false)

  const handleGenerate = () => {
    if (!prompt) {
      toast.error("Please enter a prompt to begin generation.")
      return
    }
    setIsGenerating(true)
    toast.info("SchedulerAgent has started the job...")

    // Mock generation process
    scenes.forEach((scene, i) => {
      setTimeout(() => {
        setScenes((prev) => prev.map((s) => (s.id === scene.id ? { ...s, status: "rendering" as SceneStatus } : s)))

        const interval = setInterval(
          () => {
            setScenes((prev) =>
              prev.map((s) => {
                if (s.id === scene.id) {
                  const newProgress = s.progress + 5
                  const newEta = `${Math.round((100 - newProgress) * 0.1)}s`

                  if (newProgress >= 100) {
                    clearInterval(interval)
                    const success = Math.random() > 0.1 // 90% success rate
                    return {
                      ...s,
                      progress: 100,
                      status: success ? ("completed" as SceneStatus) : ("failed" as SceneStatus),
                      thumbnailUrl: success
                        ? `/placeholder.svg?height=128&width=128&query=cinematic+scene+${s.id}`
                        : null,
                      eta: "Done",
                    }
                  }

                  return { ...s, progress: newProgress, eta: newEta }
                }
                return s
              }),
            )

            if (i === scenes.length - 1) {
              setTimeout(() => {
                setIsGenerating(false)
                toast.success("All scenes processed!")
              }, 1000)
            }
          },
          200 + Math.random() * 200,
        )
      }, i * 500)
    })
  }

  const handleAssemble = () => {
    if (assembledClips.length < 2) {
      toast.error("Add at least two scenes to the assembler.")
      return
    }
    setIsAssembling(true)
    toast.info("FinalAssemblerAgent is stitching the video...")
    setTimeout(() => {
      setIsAssembling(false)
      toast.success("Final video assembled successfully!", {
        action: {
          label: "View in Assets",
          onClick: () => (window.location.href = "/assets"),
        },
      })
    }, 3000)
  }

  const addToAssembler = (scene: Scene) => {
    if (scene.status === "completed" && !assembledClips.find((c) => c.id === scene.id)) {
      setAssembledClips((prev) => [...prev, scene])
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Left Panel: Controls */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-2xl font-bold">Studio Controls</h2>
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardContent className="p-4 space-y-4">
              <div className="relative">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="A cinematic shot of a lone astronaut on Mars..."
                  className="bg-transparent border-neutral-700 min-h-[120px]"
                />
              </div>
              <Select>
                <SelectTrigger className="w-full bg-transparent border-neutral-700">
                  <SelectValue placeholder="Select Video Style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cinematic">Cinematic</SelectItem>
                  <SelectItem value="anime">Anime</SelectItem>
                  <SelectItem value="realistic">Realistic</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full bg-transparent border-neutral-700">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kling">Kling</SelectItem>
                  <SelectItem value="luma">Luma</SelectItem>
                  <SelectItem value="runway">Runway</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Scenes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Center Panel: Scene Grid */}
        <div className="lg:col-span-6">
          <h2 className="text-2xl font-bold mb-6">Scene Grid (16 Scenes)</h2>
          <div className="grid grid-cols-4 gap-4">
            {scenes.map((scene) => (
              <Card
                key={scene.id}
                onClick={() => addToAssembler(scene)}
                className={`aspect-square flex flex-col items-center justify-center p-2 text-center transition-all duration-300 cursor-pointer
                  ${scene.status === "completed" ? "bg-green-500/10 border-green-500/50 hover:ring-2 hover:ring-green-500" : "bg-white/5 border-white/10"}
                  ${scene.status === "rendering" ? "bg-blue-500/10 border-blue-500/50" : ""}
                  ${scene.status === "failed" ? "bg-red-500/10 border-red-500/50" : ""}`}
              >
                {scene.status === "pending" && <span className="text-2xl font-bold text-neutral-600">{scene.id}</span>}
                {scene.status === "rendering" && (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                    <p className="text-xs mt-2">{scene.progress}%</p>
                    <p className="text-xs text-neutral-500">{scene.eta}</p>
                  </>
                )}
                {scene.status === "completed" &&
                  (scene.thumbnailUrl ? (
                    <img
                      src={scene.thumbnailUrl || "/placeholder.svg"}
                      alt={`Scene ${scene.id}`}
                      className="w-full h-full object-cover rounded-md"
                    />
                  ) : (
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  ))}
                {scene.status === "failed" && (
                  <>
                    <XCircle className="h-8 w-8 text-red-400" />
                    <p className="text-xs mt-2">Failed</p>
                  </>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Right Panel: FinalAssemblerAgent */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-2xl font-bold">Final Assembler</h2>
          <Card className="bg-white/5 border-white/10 backdrop-blur-md min-h-[400px]">
            <CardContent className="p-4 space-y-2">
              <p className="text-sm text-neutral-400 mb-4">Click completed scenes to add them to the timeline.</p>
              <div className="space-y-2">
                {assembledClips.length > 0 ? (
                  assembledClips.map((clip, index) => (
                    <div key={clip.id}>
                      <div className="flex items-center gap-2 p-2 bg-neutral-800/50 rounded-md">
                        <img
                          src={clip.thumbnailUrl || "/placeholder.svg"}
                          alt={`Clip ${clip.id}`}
                          className="w-10 h-10 rounded object-cover"
                        />
                        <span className="font-medium">Scene {clip.id}</span>
                      </div>
                      {index < assembledClips.length - 1 && (
                        <div className="flex justify-center">
                          <button className="p-1 rounded-full bg-neutral-700 hover:bg-purple-600 transition-colors">
                            <Scissors className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-neutral-500">
                    <p>Timeline is empty</p>
                  </div>
                )}
              </div>
              <div className="pt-4">
                <Button
                  onClick={handleAssemble}
                  disabled={isAssembling || assembledClips.length < 2}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  {isAssembling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Assembling...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" /> Assemble Final Video
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
