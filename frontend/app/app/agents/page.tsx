"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  PenTool,
  LayoutGrid,
  Bot,
  Scissors,
  Calendar,
  Send,
  ShieldCheck,
  Activity,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react"

const agents = [
  {
    name: "ScriptWriterAgent",
    description: "Generates compelling, emotionally intelligent scripts and video concepts",
    status: "Running",
    statusColor: "bg-blue-500/20 text-blue-400",
    icon: PenTool,
    lastActive: "2 minutes ago",
    tasksCompleted: 47,
    currentTask: "Writing script for Product Launch Campaign",
  },
  {
    name: "ScenePlannerAgent",
    description: "Breaks down scripts into visually described scenes for generation",
    status: "Idle",
    statusColor: "bg-gray-500/20 text-gray-400",
    icon: LayoutGrid,
    lastActive: "15 minutes ago",
    tasksCompleted: 23,
    currentTask: null,
  },
  {
    name: "VisualGeneratorAgent",
    description: "Interfaces with AI models to render scenes into visual clips",
    status: "Running",
    statusColor: "bg-blue-500/20 text-blue-400",
    icon: Bot,
    lastActive: "Just now",
    tasksCompleted: 156,
    currentTask: "Generating Scene 3 of 16",
  },
  {
    name: "EditorAgent",
    description: "Stitches scenes, applies transitions, and syncs audio",
    status: "Complete",
    statusColor: "bg-green-500/20 text-green-400",
    icon: Scissors,
    lastActive: "5 minutes ago",
    tasksCompleted: 89,
    currentTask: "Finalizing Brand Awareness Video",
  },
  {
    name: "SchedulerAgent",
    description: "Orchestrates the pipeline, managing jobs and dependencies",
    status: "Running",
    statusColor: "bg-blue-500/20 text-blue-400",
    icon: Calendar,
    lastActive: "30 seconds ago",
    tasksCompleted: 234,
    currentTask: "Coordinating 3 active projects",
  },
  {
    name: "DeliveryAgent",
    description: "Packages final videos and assets for download",
    status: "Idle",
    statusColor: "bg-gray-500/20 text-gray-400",
    icon: Send,
    lastActive: "1 hour ago",
    tasksCompleted: 67,
    currentTask: null,
  },
  {
    name: "AuthManagerAgent",
    description: "Secures the platform and manages user sessions",
    status: "Running",
    statusColor: "bg-green-500/20 text-green-400",
    icon: ShieldCheck,
    lastActive: "Always active",
    tasksCompleted: 1247,
    currentTask: "Monitoring security",
  },
]

export default function AgentsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
            Agent Monitor
          </h1>
          <p className="text-neutral-400">Monitor and control your AI agent workforce</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-green-500/30 hover:bg-green-600/10">
            <Play className="mr-2 h-4 w-4" />
            Start All
          </Button>
          <Button variant="outline" className="border-yellow-500/30 hover:bg-yellow-600/10">
            <Pause className="mr-2 h-4 w-4" />
            Pause All
          </Button>
        </div>
      </div>

      {/* Agent Status Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">4</div>
            <p className="text-sm text-neutral-400">Active Agents</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">3</div>
            <p className="text-sm text-neutral-400">Running Tasks</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">1,863</div>
            <p className="text-sm text-neutral-400">Tasks Completed</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-cyan-400">99.8%</div>
            <p className="text-sm text-neutral-400">Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Details */}
      <div className="grid md:grid-cols-2 gap-6">
        {agents.map((agent) => {
          const Icon = agent.icon
          return (
            <Card
              key={agent.name}
              className="bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <Badge className={agent.statusColor}>
                        <Activity className="mr-1 h-3 w-3" />
                        {agent.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Play className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Pause className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-neutral-400">{agent.description}</p>

                {agent.currentTask && (
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <p className="text-sm font-medium text-blue-400">Current Task:</p>
                    <p className="text-sm text-neutral-300">{agent.currentTask}</p>
                  </div>
                )}

                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Last Active:</span>
                  <span className="text-white">{agent.lastActive}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-neutral-400">Tasks Completed:</span>
                  <span className="text-purple-400 font-semibold">{agent.tasksCompleted}</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
