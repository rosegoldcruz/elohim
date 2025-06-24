"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Rocket, 
  Target, 
  Zap, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Play, 
  Download,
  Settings,
  BarChart3,
  Calendar,
  Globe
} from "lucide-react"
import { toast } from "sonner"

type CampaignStep = "setup" | "targeting" | "creative" | "launch" | "results"

export default function LaunchAICampaignPage() {
  const [currentStep, setCurrentStep] = useState<CampaignStep>("setup")
  const [isLaunching, setIsLaunching] = useState(false)
  const [campaignData, setCampaignData] = useState({
    name: "",
    productUrl: "",
    targetAudience: "",
    budget: "",
    platform: "",
    objective: "",
    description: ""
  })

  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: "Summer Fashion Collection",
      status: "Active",
      platform: "Instagram",
      budget: "$2,500",
      reach: "45K",
      conversions: "1,234",
      roas: "4.2x",
      thumbnail: "/placeholder.svg?height=200&width=300&query=fashion+campaign"
    },
    {
      id: 2,
      name: "Tech Gadget Launch",
      status: "Completed",
      platform: "TikTok",
      budget: "$1,800",
      reach: "78K",
      conversions: "892",
      roas: "3.8x",
      thumbnail: "/placeholder.svg?height=200&width=300&query=tech+gadget"
    }
  ])

  const handleLaunchCampaign = async () => {
    if (!campaignData.name || !campaignData.productUrl) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsLaunching(true)
    toast.info("AI Campaign Orchestrator is analyzing your product...")

    // Simulate campaign creation process
    setTimeout(() => {
      toast.success("Campaign launched successfully! AI agents are now optimizing your ads.")
      setCurrentStep("results")
      setIsLaunching(false)
    }, 3000)
  }

  const steps = [
    { id: "setup", label: "Setup", icon: Settings },
    { id: "targeting", label: "Targeting", icon: Target },
    { id: "creative", label: "Creative", icon: Zap },
    { id: "launch", label: "Launch", icon: Rocket },
    { id: "results", label: "Results", icon: BarChart3 }
  ]

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
              <Rocket className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
              Launch AI Campaign
            </h1>
          </div>
          <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
            Create high-converting ad campaigns with AI-powered optimization and multi-platform deployment
          </p>
        </div>

        <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as CampaignStep)}>
          {/* Step Navigation */}
          <div className="flex justify-center mb-12">
            <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl">
              {steps.map((step, index) => {
                const IconComponent = step.icon
                return (
                  <TabsTrigger
                    key={step.id}
                    value={step.id}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="hidden sm:inline">{step.label}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          {/* Campaign Setup */}
          <TabsContent value="setup" className="space-y-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Campaign Setup</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Campaign Name *</label>
                    <Input
                      value={campaignData.name}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Summer Product Launch"
                      className="bg-white/10 border-white/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Product URL *</label>
                    <Input
                      value={campaignData.productUrl}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, productUrl: e.target.value }))}
                      placeholder="https://yourstore.com/product"
                      className="bg-white/10 border-white/20"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Campaign Objective</label>
                  <Select
                    value={campaignData.objective}
                    onValueChange={(value) => setCampaignData(prev => ({ ...prev, objective: value }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20">
                      <SelectValue placeholder="Select objective" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversions">Drive Conversions</SelectItem>
                      <SelectItem value="traffic">Increase Traffic</SelectItem>
                      <SelectItem value="awareness">Brand Awareness</SelectItem>
                      <SelectItem value="engagement">Boost Engagement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Product Description</label>
                  <Textarea
                    value={campaignData.description}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your product and its key benefits..."
                    className="bg-white/10 border-white/20 min-h-[100px]"
                  />
                </div>

                <Button
                  onClick={() => setCurrentStep("targeting")}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  Continue to Targeting
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Targeting */}
          <TabsContent value="targeting" className="space-y-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Audience Targeting</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Target Platform</label>
                    <Select
                      value={campaignData.platform}
                      onValueChange={(value) => setCampaignData(prev => ({ ...prev, platform: value }))}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20">
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectItem value="tiktok">TikTok</SelectItem>
                        <SelectItem value="instagram">Instagram</SelectItem>
                        <SelectItem value="youtube">YouTube</SelectItem>
                        <SelectItem value="facebook">Facebook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Daily Budget</label>
                    <Input
                      value={campaignData.budget}
                      onChange={(e) => setCampaignData(prev => ({ ...prev, budget: e.target.value }))}
                      placeholder="$100"
                      className="bg-white/10 border-white/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience</label>
                  <Textarea
                    value={campaignData.targetAudience}
                    onChange={(e) => setCampaignData(prev => ({ ...prev, targetAudience: e.target.value }))}
                    placeholder="Describe your ideal customer demographics, interests, and behaviors..."
                    className="bg-white/10 border-white/20 min-h-[100px]"
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("setup")}
                    className="flex-1 border-white/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("creative")}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Continue to Creative
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Creative */}
          <TabsContent value="creative" className="space-y-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Creative Assets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-8 border-2 border-dashed border-white/20 rounded-xl">
                  <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Creative Generation</h3>
                  <p className="text-neutral-400 mb-4">
                    Our AI will automatically generate multiple video variations based on your product and targeting
                  </p>
                  <Badge className="bg-purple-500/20 text-purple-400">
                    50+ Variations Will Be Generated
                  </Badge>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("targeting")}
                    className="flex-1 border-white/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setCurrentStep("launch")}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    Continue to Launch
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Launch */}
          <TabsContent value="launch" className="space-y-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Ready to Launch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-purple-600/10 to-cyan-600/10 rounded-xl p-6">
                  <h3 className="text-xl font-semibold mb-4">Campaign Summary</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-400">Campaign:</span>
                      <span className="ml-2 font-medium">{campaignData.name || "Untitled Campaign"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Platform:</span>
                      <span className="ml-2 font-medium">{campaignData.platform || "All Platforms"}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Budget:</span>
                      <span className="ml-2 font-medium">{campaignData.budget || "$100"}/day</span>
                    </div>
                    <div>
                      <span className="text-neutral-400">Objective:</span>
                      <span className="ml-2 font-medium">{campaignData.objective || "Drive Conversions"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("creative")}
                    className="flex-1 border-white/20"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleLaunchCampaign}
                    disabled={isLaunching}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                  >
                    {isLaunching ? (
                      <>
                        <Zap className="mr-2 h-4 w-4 animate-spin" />
                        Launching Campaign...
                      </>
                    ) : (
                      <>
                        <Rocket className="mr-2 h-4 w-4" />
                        Launch Campaign
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results */}
          <TabsContent value="results" className="space-y-8">
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                <CardContent className="p-6 text-center">
                  <DollarSign className="h-8 w-8 text-green-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-400">$12,450</div>
                  <p className="text-neutral-400 text-sm">Revenue Generated</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                <CardContent className="p-6 text-center">
                  <Users className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-400">156K</div>
                  <p className="text-neutral-400 text-sm">People Reached</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                <CardContent className="p-6 text-center">
                  <Target className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-400">4.2%</div>
                  <p className="text-neutral-400 text-sm">Conversion Rate</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 backdrop-blur-md">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-400">5.8x</div>
                  <p className="text-neutral-400 text-sm">ROAS</p>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Active Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={campaign.thumbnail}
                          alt={campaign.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div>
                          <h3 className="font-semibold">{campaign.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <Globe className="h-3 w-3" />
                            {campaign.platform}
                            <Badge className={campaign.status === "Active" ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}>
                              {campaign.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <div className="font-semibold">{campaign.budget}</div>
                          <div className="text-neutral-500">Budget</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-blue-400">{campaign.reach}</div>
                          <div className="text-neutral-500">Reach</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-green-400">{campaign.conversions}</div>
                          <div className="text-neutral-500">Conversions</div>
                        </div>
                        <div className="text-center">
                          <div className="font-semibold text-yellow-400">{campaign.roas}</div>
                          <div className="text-neutral-500">ROAS</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  )
}
