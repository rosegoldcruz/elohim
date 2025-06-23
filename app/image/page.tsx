"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Loader2, Upload } from "lucide-react"

export default function ImagePage() {
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateImage = () => {
    if (!prompt) return
    setIsGenerating(true)
    setGeneratedImage(null)
    setTimeout(() => {
      setGeneratedImage(`/placeholder.svg?height=512&width=512&query=${encodeURIComponent(prompt)}`)
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Image Generation</h1>
      <p className="text-neutral-400 mb-8">Create stunning visuals from text or a reference image.</p>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardContent className="p-6 space-y-4">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A hyper-realistic portrait of a futuristic queen..."
                className="bg-transparent border-neutral-700 h-12"
              />
              <Button variant="outline" className="w-full border-neutral-700 hover:bg-neutral-900/50">
                <Upload className="mr-2 h-4 w-4" />
                Upload Reference Image
              </Button>
              <Button
                onClick={generateImage}
                disabled={isGenerating}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Image
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="bg-white/5 border-white/10 backdrop-blur-md aspect-square flex items-center justify-center">
            <CardContent className="p-4">
              {isGenerating ? (
                <div className="text-center text-neutral-400">
                  <Loader2 className="h-12 w-12 animate-spin mx-auto" />
                  <p className="mt-4">Visualizing your idea...</p>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt={prompt}
                  className="rounded-lg w-full h-full object-contain"
                />
              ) : (
                <div className="text-center text-neutral-600">
                  <p>Your generated image will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
