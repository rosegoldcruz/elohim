"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Volume2, Loader2, Upload, Music } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function AudioPage() {
  const [textToSpeak, setTextToSpeak] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">Audio Universe</h1>
      <p className="text-neutral-400 mb-8">Generate speech, clone voices, and create background music.</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* TTS & Voice Clone */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">Text-to-Speech & Voice Cloning</h3>
            <Textarea
              value={textToSpeak}
              onChange={(e) => setTextToSpeak(e.target.value)}
              placeholder="Enter text to generate audio..."
              className="bg-transparent border-neutral-700 min-h-[120px]"
            />
            <Select>
              <SelectTrigger className="w-full bg-transparent border-neutral-700">
                <SelectValue placeholder="Select a Voice" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="onyx">Onyx (Deep Male)</SelectItem>
                <SelectItem value="nova">Nova (Warm Female)</SelectItem>
                <SelectItem value="clone">Your Cloned Voice</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-4">
              <Button variant="outline" className="w-full border-neutral-700 hover:bg-neutral-900/50">
                <Upload className="mr-2 h-4 w-4" />
                Upload Voice Sample
              </Button>
              <Button disabled={isGenerating} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                  </>
                ) : (
                  <>
                    <Volume2 className="mr-2 h-4 w-4" /> Generate Speech
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Music Generation */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-xl font-semibold">AI Music Generation</h3>
            <Input placeholder="A lo-fi hip hop beat for studying" className="bg-transparent border-neutral-700 h-12" />
            <Select>
              <SelectTrigger className="w-full bg-transparent border-neutral-700">
                <SelectValue placeholder="Select Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lofi">Lo-fi</SelectItem>
                <SelectItem value="cinematic">Cinematic Score</SelectItem>
                <SelectItem value="electronic">Electronic</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black">
              <Music className="mr-2 h-4 w-4" /> Generate Music Loop
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
