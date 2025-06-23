"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Target, Zap, Users, TrendingUp, Play, Download, BarChart3, Sparkles } from "lucide-react"
import { toast } from "sonner"

export default function MarketingPage() {
  const [productUrl, setProductUrl] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [campaigns, setCampaigns] = useState<any[]>([])

  const handleGenerateCampaign = () => {
    if (!productUrl) {
      toast.error("Please enter a product URL")
      return
    }
    setIsGenerating(true)
    toast.info("TrendHunter → ScriptWriter → ScenePlanner → VideoGenerator pipeline started...")

    setTimeout(() => {
      const newCampaigns = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        title: `Campaign Variant ${i + 1}`,
        platform: ["TikTok", "Instagram", "YouTube"][i % 3],
        ctr: (2.5 + Math.random() * 3).toFixed(1),
        conversions: Math.floor(150 + Math.random() * 300),
        revenue: Math.floor(2500 + Math.random() * 5000),
        thumbnail: `/placeholder.svg?height=200&width=300&query=product+ad+variant+${i + 1}`,
        status: Math.random() > 0.2 ? "completed" : "generating",
      }))
      setCampaigns(newCampaigns)
      setIsGenerating(false)
      toast.success("50+ video variations generated! Revenue tracking active.")
    }, 4000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-yellow-400 mb-4">
          AI Marketing Suite
        </h1>
        <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
          Transform any product into winning video campaigns. Generate 50+ variations, track conversions, and scale to
          $10M revenue.
        </p>
      </div>

      {/* Quick Tools Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <Card className="relative bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center mx-auto mb-4">
                <Target className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">AI Video Ads</h3>
              <p className="text-sm text-neutral-400">Product URL → winning ads</p>
            </CardContent>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <Card className="relative bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Avatar Marketing</h3>
              <p className="text-sm text-neutral-400">Branded spokesperson videos</p>
            </CardContent>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <Card className="relative bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Product Showcase</h3>
              <p className="text-sm text-neutral-400">Image → demonstrations</p>
            </CardContent>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <Card className="relative bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Batch Campaigns</h3>
              <p className="text-sm text-neutral-400">50+ A/B test variations</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Campaign Generator */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-blue-900/30 rounded-3xl blur-2xl"></div>
        <Card className="relative bg-white/5 border-white/10 backdrop-blur-md rounded-3xl">
          <CardContent className="p-8">
            <h2 className="text-3xl font-bold mb-6 text-center">Generate Revenue Campaign</h2>
            <div className="grid md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-5">
                <label className="block text-sm font-medium mb-2">Product URL</label>
                <Input
                  value={productUrl}
                  onChange={(e) => setProductUrl(e.target.value)}
                  placeholder="https://yourstore.com/product"
                  className="bg-white/10 border-white/20 rounded-xl h-12"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Campaign Type</label>
                <Select>
                  <SelectTrigger className="bg-white/10 border-white/20 rounded-xl h-12">
                    <SelectValue placeholder="Ad Campaign" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ads">Video Ads</SelectItem>
                    <SelectItem value="showcase">Product Showcase</SelectItem>
                    <SelectItem value="testimonial">Testimonials</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2">Target Platform</label>
                <Select>
                  <SelectTrigger className="bg-white/10 border-white/20 rounded-xl h-12">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-3">
                <Button
                  onClick={handleGenerateCampaign}
                  disabled={isGenerating}
                  className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl text-lg font-semibold"
                >
                  {isGenerating ? (
                    <>
                      <Zap className="mr-2 h-5 w-5 animate-spin" />
                      Generating 50+ Variants...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Generate Campaign
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Results */}
      {campaigns.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Campaign Variations</h2>
            <div className="flex gap-4">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 px-4 py-2">
                {campaigns.filter((c) => c.status === "completed").length} Completed
              </Badge>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 px-4 py-2">
                ${campaigns.reduce((sum, c) => sum + c.revenue, 0).toLocaleString()} Revenue Tracked
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-indigo-600/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                <Card className="relative bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden rounded-2xl">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={campaign.thumbnail || "/placeholder.svg"}
                      alt={campaign.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button size="sm" className="bg-white/20 backdrop-blur-sm border-white/30">
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                    <Badge
                      className={`absolute top-2 right-2 ${campaign.status === "completed" ? "bg-green-500" : "bg-blue-500"}`}
                    >
                      {campaign.status}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">{campaign.title}</h3>
                    <div className="flex justify-between text-sm text-neutral-400 mb-3">
                      <span>{campaign.platform}</span>
                      <span>{campaign.ctr}% CTR</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <div className="font-semibold text-green-400">{campaign.conversions}</div>
                        <div className="text-neutral-500">Conversions</div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-2 text-center">
                        <div className="font-semibold text-yellow-400">${campaign.revenue}</div>
                        <div className="text-neutral-500">Revenue</div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-white/20 hover:bg-white/10 rounded-lg"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-white/20 hover:bg-white/10 rounded-lg"
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
