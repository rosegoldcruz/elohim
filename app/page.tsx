import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles, Zap, Users, Star, Video, Clock, Cpu, Wand2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-lg px-6 py-2">
            <Sparkles className="w-5 h-5 mr-2" />
            AEON AI Video Generation Platform
          </Badge>

          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            Transform Ideas Into
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {' '}Cinematic Videos
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            AEON's 7-agent AI system creates professional videos from any topic.
            From script to final cut in minutes, not hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-4 text-lg"
            >
              <Link href="/instant">
                Generate Video Now - $29.95
                <Play className="w-5 h-5 ml-2" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              <Link href="/script">
                Try Script Generator
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg"
            >
              <Link href="/pricing">
                View Pricing Plans
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </div>

        {/* 7-Agent Architecture Showcase */}
        <div className="mb-20">
          <h2 className="text-4xl font-bold text-white text-center mb-12">
            Powered by 7-Agent AI Architecture
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <Wand2 className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle className="text-white">ScriptWriter</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  GPT-4 powered scene generation from your topic
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <Video className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">VisualGen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  6 AI models generate scenes in parallel
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <Cpu className="w-8 h-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Editor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  FFmpeg assembly with music and captions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <Clock className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Scheduler</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 text-sm">
                  Real-time job tracking and queue management
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Social Proof */}
        <div className="text-center mb-20">
          <div className="flex justify-center items-center gap-8 text-gray-300 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">10,000+</div>
              <div className="text-sm">Videos Created</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">4.9/5</div>
              <div className="flex items-center justify-center gap-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">3 min</div>
              <div className="text-sm">Average Generation</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
