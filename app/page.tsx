import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles, Zap, Users, Star, Video, Clock, Cpu, Wand2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 text-lg px-6 py-2">
            <Sparkles className="w-5 h-5 mr-2" />
            AEON AI Video Generation Platform
          </Badge>

          <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
            The Advanced Efficient
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              {' '}Optimized Network
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            AEON's 7-agent AI system creates professional videos from any topic.
            From script to final cut in minutes, not hours.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75 group-hover:opacity-100"></div>
              <Button
                asChild
                size="lg"
                className="relative bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white font-semibold px-8 py-4 text-lg border-0"
              >
                <Link href="/pricing">
                  Get Started
                  <Sparkles className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 via-pink-500/50 to-cyan-500/50 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-75"></div>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="relative border-2 border-purple-400/30 hover:border-purple-400/60 bg-black/50 backdrop-blur-xl text-white hover:bg-purple-900/20 px-8 py-4 text-lg transition-all duration-300"
              >
                <Link href="/script">
                  Try Script Generator
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/50 via-blue-500/50 to-purple-500/50 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-0 group-hover:opacity-75"></div>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="relative border-2 border-cyan-400/30 hover:border-cyan-400/60 bg-black/50 backdrop-blur-xl text-white hover:bg-cyan-900/20 px-8 py-4 text-lg transition-all duration-300"
              >
                <Link href="/pricing">
                  View Pricing Plans
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            </div>
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
