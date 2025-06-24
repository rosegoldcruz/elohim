"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Image, Sparkles, Loader2, Download } from "lucide-react"
import { toast } from "sonner"
import { generateImageMock, ImageGenerationParams } from "@/lib/replicate"

export default function ImageGenerationPage() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [settings, setSettings] = useState({
    width: 1024,
    height: 1024,
    numOutputs: 1,
    guidanceScale: 7.5,
    numInferenceSteps: 50,
  })

  const handleGenerate = async () => {
    if (!prompt) {
      toast.error("Please enter a prompt to generate images.")
      return
    }

    setIsGenerating(true)
    toast.info("Generating images...")

    try {
      const params: ImageGenerationParams = {
        prompt,
        width: settings.width,
        height: settings.height,
        num_outputs: settings.numOutputs,
        guidance_scale: settings.guidanceScale,
        num_inference_steps: settings.numInferenceSteps,
      }

      // TODO: Replace with actual generateImage when API key is available
      const result = await generateImageMock(params)

      if (result.status === 'succeeded' && result.output) {
        setGeneratedImages(result.output)
        toast.success("Images generated successfully!")
      } else {
        throw new Error(result.error || "Generation failed")
      }
    } catch (error) {
      toast.error("Failed to generate images. Please try again.")
      console.error("Image generation error:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Panel: Controls */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <Image className="h-8 w-8 text-purple-400" />
              <h1 className="text-3xl font-bold">Image Generation</h1>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Generation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="prompt">Prompt</Label>
                  <Textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="A beautiful landscape with mountains and a lake at sunset..."
                    className="bg-transparent border-neutral-700 min-h-[120px] mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={settings.width}
                      onChange={(e) => setSettings(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                      className="bg-transparent border-neutral-700 mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={settings.height}
                      onChange={(e) => setSettings(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                      className="bg-transparent border-neutral-700 mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label>Number of Images: {settings.numOutputs}</Label>
                  <Slider
                    value={[settings.numOutputs]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, numOutputs: value[0] }))}
                    max={4}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Guidance Scale: {settings.guidanceScale}</Label>
                  <Slider
                    value={[settings.guidanceScale]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, guidanceScale: value[0] }))}
                    max={20}
                    min={1}
                    step={0.5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Inference Steps: {settings.numInferenceSteps}</Label>
                  <Slider
                    value={[settings.numInferenceSteps]}
                    onValueChange={(value) => setSettings(prev => ({ ...prev, numInferenceSteps: value[0] }))}
                    max={100}
                    min={10}
                    step={10}
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Images
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel: Generated Images */}
          <div className="lg:col-span-8">
            <h2 className="text-2xl font-bold mb-6">Generated Images</h2>

            {generatedImages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {generatedImages.map((imageUrl, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/5 border-white/10 backdrop-blur-md overflow-hidden">
                      <div className="aspect-square relative">
                        <img
                          src={imageUrl}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-black/50 hover:bg-black/70"
                            onClick={() => {
                              const link = document.createElement('a')
                              link.href = imageUrl
                              link.download = `generated-image-${index + 1}.png`
                              link.click()
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <Image className="h-16 w-16 text-neutral-600 mb-4" />
                  <p className="text-xl font-medium text-neutral-400 mb-2">No images generated yet</p>
                  <p className="text-neutral-500 text-center">
                    Enter a prompt and click "Generate Images" to create AI-generated artwork
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </motion.div>
    </MainLayout>
  )
}
