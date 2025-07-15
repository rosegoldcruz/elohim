import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Sparkles, Zap, Users, Star, Video, Clock, Cpu, Wand2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Hero Section - Immersive Design */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-pink-500/15 to-purple-500/15 rounded-full blur-2xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="text-center max-w-6xl mx-auto">
            {/* Futuristic Badge */}
            <div className="mb-8 inline-flex items-center">
              <div className="relative">
                <Badge className="bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 border border-purple-500/30 text-white text-sm px-6 py-3 rounded-full backdrop-blur-xl">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-full animate-pulse"></div>
                  <Sparkles className="w-4 h-4 mr-2 relative z-10" />
                  <span className="relative z-10 text-futuristic">NEXT-GEN AI VIDEO PLATFORM</span>
                </Badge>
              </div>
            </div>

            {/* Main Headline - Massive Impact */}
            <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black text-white mb-8 leading-[0.85] tracking-tighter">
              <span className="block text-holographic animate-holographic">AEON</span>
              <span className="block text-4xl md:text-6xl lg:text-7xl font-light text-gray-300 mt-4">
                The Future of Video Creation
              </span>
            </h1>

            {/* Subheadline with Typewriter Effect */}
            <div className="mb-12 max-w-4xl mx-auto">
              <p className="text-xl md:text-3xl text-gray-300 leading-relaxed font-light">
                Transform any idea into
                <span className="text-neon font-semibold"> viral videos </span>
                with our revolutionary
                <span className="text-plasma font-semibold"> 7-agent AI system</span>
              </p>
              <p className="text-lg md:text-xl text-gray-400 mt-4 font-light">
                From concept to completion in minutes, not hours
              </p>
            </div>

            {/* Enhanced CTA Section */}
            <div className="flex flex-col lg:flex-row gap-6 justify-center items-center mb-16">
              {/* Primary CTA */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse-neon"></div>
                <Button
                  asChild
                  size="lg"
                  className="relative btn-futuristic bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white font-bold px-12 py-6 text-xl rounded-2xl border-0 shadow-2xl"
                >
                  <Link href="/pricing" className="flex items-center gap-3">
                    <Zap className="w-6 h-6" />
                    Start Creating Now
                    <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>

              {/* Secondary CTAs */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="glass-intense hover-lift border-purple-400/30 hover:border-purple-400/60 text-white hover:bg-purple-900/20 px-8 py-4 text-lg rounded-xl"
                >
                  <Link href="/script" className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Try Demo
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="glass-intense hover-lift border-cyan-400/30 hover:border-cyan-400/60 text-white hover:bg-cyan-900/20 px-8 py-4 text-lg rounded-xl"
                >
                  <Link href="/pricing" className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    View Plans
                  </Link>
                </Button>
              </div>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-gray-400">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-400" />
                <span className="text-sm">10,000+ Creators</span>
              </div>
              <div className="flex items-center gap-2">
                <Video className="w-5 h-5 text-pink-400" />
                <span className="text-sm">1M+ Videos Generated</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span className="text-sm">Average: 3 min creation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-purple-400/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-purple-400 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* 7-Agent Architecture Showcase */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
              <span className="text-plasma">Revolutionary</span> AI Architecture
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Seven specialized AI agents working in perfect harmony to create your videos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* ScriptWriter Agent */}
            <div className="depth-card hover-lift group p-8 text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wand2 className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">ScriptWriter</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                GPT-4 powered scene generation transforms your ideas into cinematic narratives
              </p>
            </div>

            {/* VisualGen Agent */}
            <div className="depth-card hover-lift group p-8 text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Video className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">VisualGen</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                6 AI models generate stunning visuals in parallel for maximum quality
              </p>
            </div>

            {/* Editor Agent */}
            <div className="depth-card hover-lift group p-8 text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-green-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Editor</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Advanced FFmpeg assembly with synchronized music and captions
              </p>
            </div>

            {/* Scheduler Agent */}
            <div className="depth-card hover-lift group p-8 text-center">
              <div className="relative mb-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 bg-yellow-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">Scheduler</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                Real-time orchestration and intelligent queue management
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Social Proof */}
      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <div className="glass-intense rounded-3xl p-12 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="group">
                <div className="text-5xl font-black text-neon mb-2 group-hover:scale-110 transition-transform">
                  1M+
                </div>
                <div className="text-gray-400 font-medium">Videos Generated</div>
                <div className="text-sm text-gray-500 mt-1">And counting...</div>
              </div>

              <div className="group">
                <div className="text-5xl font-black text-plasma mb-2 group-hover:scale-110 transition-transform">
                  4.9★
                </div>
                <div className="flex items-center justify-center gap-1 text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
                <div className="text-gray-400 font-medium">User Rating</div>
              </div>

              <div className="group">
                <div className="text-5xl font-black text-holographic mb-2 group-hover:scale-110 transition-transform">
                  3min
                </div>
                <div className="text-gray-400 font-medium">Average Creation</div>
                <div className="text-sm text-gray-500 mt-1">Lightning fast</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Why Creators Choose <span className="text-neon">AEON</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Experience the future of video creation with cutting-edge AI technology
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {/* Feature 1 - Speed */}
            <div className="depth-card hover-lift group p-8 text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-cyan-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Lightning Fast</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Generate professional videos in under 3 minutes. Our optimized AI pipeline processes your content at unprecedented speed.
              </p>
              <div className="text-cyan-400 font-semibold">3x Faster than competitors</div>
            </div>

            {/* Feature 2 - Quality */}
            <div className="depth-card hover-lift group p-8 text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-purple-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Studio Quality</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                6-model AI ensemble ensures every frame meets professional standards. No more amateur-looking content.
              </p>
              <div className="text-purple-400 font-semibold">4K Resolution Ready</div>
            </div>

            {/* Feature 3 - Ease */}
            <div className="depth-card hover-lift group p-8 text-center">
              <div className="relative mb-8">
                <div className="w-20 h-20 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wand2 className="w-10 h-10 text-white" />
                </div>
                <div className="absolute inset-0 bg-green-500/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Zero Learning Curve</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Just describe your idea. Our AI handles scripting, visuals, editing, and music automatically.
              </p>
              <div className="text-green-400 font-semibold">One-click creation</div>
            </div>
          </div>

          {/* Video Showcase */}
          <div className="glass-intense rounded-3xl p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-6">See AEON in Action</h3>
            <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
              Watch how creators are transforming their ideas into viral content with AEON's AI-powered platform
            </p>

            {/* Video Placeholder */}
            <div className="relative max-w-4xl mx-auto">
              <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-cyan-900/50 rounded-2xl flex items-center justify-center group cursor-pointer hover-lift">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/20 transition-colors">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                  <p className="text-white font-semibold">Watch Demo Video</p>
                  <p className="text-gray-400 text-sm">2:30 minutes</p>
                </div>
              </div>

              {/* Floating elements around video */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-purple-500/30 rounded-full blur-sm animate-pulse"></div>
              <div className="absolute -top-2 -right-6 w-6 h-6 bg-cyan-500/30 rounded-full blur-sm animate-pulse delay-1000"></div>
              <div className="absolute -bottom-4 -left-6 w-10 h-10 bg-pink-500/30 rounded-full blur-sm animate-pulse delay-2000"></div>
              <div className="absolute -bottom-2 -right-4 w-7 h-7 bg-blue-500/30 rounded-full blur-sm animate-pulse delay-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-bold text-white mb-6">
              Loved by <span className="text-plasma">Creators</span>
            </h2>
            <p className="text-xl text-gray-400">
              Join thousands of content creators who've transformed their workflow
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="depth-card hover-lift p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  S
                </div>
                <div className="ml-4">
                  <h4 className="text-white font-semibold">Sarah Chen</h4>
                  <p className="text-gray-400 text-sm">Content Creator, 2.3M followers</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                "AEON completely changed my content game. What used to take me 8 hours now takes 3 minutes. The quality is incredible!"
              </p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="depth-card hover-lift p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  M
                </div>
                <div className="ml-4">
                  <h4 className="text-white font-semibold">Marcus Rodriguez</h4>
                  <p className="text-gray-400 text-sm">YouTube Creator, 890K subs</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                "The AI understands exactly what I want. Every video feels like it was made by a professional studio team."
              </p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="depth-card hover-lift p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  A
                </div>
                <div className="ml-4">
                  <h4 className="text-white font-semibold">Alex Thompson</h4>
                  <p className="text-gray-400 text-sm">TikTok Influencer, 5.2M followers</p>
                </div>
              </div>
              <p className="text-gray-300 leading-relaxed mb-4">
                "My engagement rates doubled since using AEON. The videos are so polished and engaging, my audience can't get enough!"
              </p>
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 relative">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-bold text-white mb-8">
              Ready to Go <span className="text-holographic animate-holographic">Viral?</span>
            </h2>
            <p className="text-2xl text-gray-300 mb-12 leading-relaxed">
              Join the AI video revolution. Create your first viral video in the next 3 minutes.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse-neon"></div>
                <Button
                  asChild
                  size="lg"
                  className="relative btn-futuristic bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-500 text-white font-bold px-16 py-8 text-2xl rounded-3xl border-0 shadow-2xl"
                >
                  <Link href="/pricing" className="flex items-center gap-4">
                    <Sparkles className="w-8 h-8" />
                    Start Creating Now
                    <ArrowRight className="w-8 h-8 group-hover:translate-x-2 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>

            <p className="text-gray-500 mt-8">
              No credit card required • 100 free credits • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 border-t border-white/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-8 md:mb-0">
              <h3 className="text-2xl font-bold text-holographic animate-holographic">AEON</h3>
              <p className="text-gray-400 mt-2">The future of AI video creation</p>
            </div>

            <div className="flex flex-wrap gap-8 text-gray-400">
              <Link href="/privacy" className="hover:text-purple-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-purple-400 transition-colors">
                Terms of Service
              </Link>
              <a href="mailto:support@aeon.ai" className="hover:text-purple-400 transition-colors">
                Contact
              </a>
              <a href="mailto:legal@aeon.ai" className="hover:text-purple-400 transition-colors">
                Legal
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} AEON AI Video Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
