"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, Play, Eye, Calendar, Zap, PenTool, LayoutGrid, Bot, Scissors } from "lucide-react"
import Link from "next/link"

const projects = [
  {
    id: 1,
    name: "Product Launch Campaign",
    status: "Complete",
    timestamp: "2 hours ago",
    statusColor: "text-green-400",
    statusIcon: CheckCircle,
  },
  {
    id: 2,
    name: "Brand Awareness Video",
    status: "In Progress",
    timestamp: "5 minutes ago",
    statusColor: "text-blue-400",
    statusIcon: Play,
  },
  {
    id: 3,
    name: "Social Media Content",
    status: "Pending",
    timestamp: "1 day ago",
    statusColor: "text-yellow-400",
    statusIcon: Clock,
  },
]

const agents = [
  { name: "ScriptWriterAgent", status: "Idle", icon: PenTool, lastUpdated: "2 min ago", color: "text-gray-400" },
  { name: "ScenePlannerAgent", status: "Running", icon: LayoutGrid, lastUpdated: "Just now", color: "text-blue-400" },
  { name: "VisualGeneratorAgent", status: "Running", icon: Bot, lastUpdated: "30 sec ago", color: "text-blue-400" },
  { name: "EditorAgent", status: "Complete", icon: Scissors, lastUpdated: "5 min ago", color: "text-green-400" },
  { name: "SchedulerAgent", status: "Idle", icon: Calendar, lastUpdated: "1 hour ago", color: "text-gray-400" },
]

export default function DashboardPage() {
  const userName = "Daniel"
  const creditsUsed = 75
  const creditsTotal = 100
  const creditPercentage = (creditsUsed / creditsTotal) * 100

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
          Welcome back, {userName}!
        </h1>
        <p className="text-neutral-400 mt-2">Here's what's happening with your video projects today.</p>
      </div>

      {/* Your Video Projects */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">📁 Your Video Projects</h2>
          <Link href="/app/projects">
            <Button variant="outline" className="border-purple-500/30 hover:bg-purple-600/10">
              View All Projects
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {projects.map((project) => {
            const StatusIcon = project.statusIcon
            return (
              <Card
                key={project.id}
                className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <StatusIcon className={`h-5 w-5 ${project.statusColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Badge className={`${project.statusColor} bg-transparent border`}>{project.status}</Badge>
                    <p className="text-sm text-neutral-400">{project.timestamp}</p>
                    <Link href="/app/projects">
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* AI Agent Status */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold flex items-center gap-2">⚙️ AI Agent Status</h2>
          <Link href="/app/agents">
            <Button variant="outline" className="border-cyan-500/30 hover:bg-cyan-600/10">
              Monitor All Agents
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const Icon = agent.icon
            return (
              <Card key={agent.name} className="bg-white/5 border-white/10 backdrop-blur-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{agent.name}</h3>
                      <p className={`text-xs ${agent.color}`}>{agent.status}</p>
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500">Last updated: {agent.lastUpdated}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Credit Usage */}
      <section>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">📦 Credit Usage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium">{creditsTotal - creditsUsed} credits remaining</span>
              <span className="text-sm text-neutral-400">
                {creditsUsed} / {creditsTotal} used
              </span>
            </div>
            <Progress
              value={creditPercentage}
              className="w-full [&>*]:bg-gradient-to-r [&>*]:from-purple-500 [&>*]:to-cyan-500"
            />
            <div className="flex gap-4">
              <Link href="/app/billing" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold">
                  <Zap className="mr-2 h-4 w-4" />
                  Buy More Credits
                </Button>
              </Link>
              <Link href="/app/billing">
                <Button variant="outline" className="border-white/20 hover:bg-white/10">
                  View Usage Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
