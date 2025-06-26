import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Sparkles, TrendingUp, Cpu } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-32 md:py-40 text-center relative">
        <div className="relative z-10 mb-8">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-purple-400 via-pink-400 to-cyan-400 leading-none mb-4">
            The AEON
          </h1>
          <p className="text-2xl md:text-3xl font-light text-purple-300/80 tracking-wide">
            Advanced Efficient Optimized Network
          </p>
        </div>

        <p className="mt-12 max-w-4xl mx-auto text-xl md:text-2xl text-neutral-300 leading-relaxed font-light">
          The high-performance AI video platform where cutting-edge technology drives exceptional business outcomes at
          enterprise scale.
        </p>

        <div className="mt-16 flex flex-col sm:flex-row justify-center gap-8">
          <Link href="/app/dashboard">
            <Button
              size="lg"
              className="bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-700 hover:via-indigo-700 hover:to-cyan-700 text-white px-12 py-6 text-xl font-semibold rounded-3xl shadow-2xl shadow-purple-500/25 transform hover:scale-105 transition-all duration-500 border border-purple-400/20"
            >
              <Zap className="mr-4 h-7 w-7" />
              Enter Dashboard
              <ArrowRight className="ml-4 h-7 w-7" />
            </Button>
          </Link>
        </div>

        <div className="mt-20 flex justify-center items-center gap-8 text-neutral-400">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-purple-400" />
            <span>7+ AI Agents</span>
          </div>
          <div className="w-px h-6 bg-neutral-600"></div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            <span>5M+ Videos Created</span>
          </div>
          <div className="w-px h-6 bg-neutral-600"></div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-pink-400" />
            <span>4K Ultra HD Output</span>
          </div>
        </div>
      </section>

      {/* Enterprise Scale Stats */}
      <section className="container mx-auto px-4 py-24 animate-on-scroll">
        <div className="relative">
          <div className="relative bg-transparent border border-white/10 rounded-3xl p-16">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300">
                Built for Enterprise Performance
              </h2>
              <p className="text-xl text-neutral-400 font-light">
                A high-performance platform trusted by high-growth businesses and enterprise clients.
              </p>
            </div>
            <div className="grid md:grid-cols-4 gap-12 text-center">
              <div className="group">
                <div className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-purple-400 to-indigo-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  99.9%
                </div>
                <p className="text-neutral-400 text-lg font-medium">Uptime SLA</p>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-cyan-400 to-blue-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  50+
                </div>
                <p className="text-neutral-400 text-lg font-medium">Video Variations</p>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-pink-400 to-rose-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  60s
                </div>
                <p className="text-neutral-400 text-lg font-medium">Long-form Content</p>
              </div>
              <div className="group">
                <div className="text-5xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-br from-green-400 to-emerald-400 mb-4 group-hover:scale-110 transition-transform duration-300">
                  24/7
                </div>
                <p className="text-neutral-400 text-lg font-medium">AI Automation</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
