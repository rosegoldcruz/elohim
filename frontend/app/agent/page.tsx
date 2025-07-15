import { Card } from "@/components/ui/card"
import { Bot, PenTool, LayoutGrid, Scissors, Calendar, Send, ShieldCheck } from "lucide-react"

const agents = [
  {
    name: "ScriptWriterAgent",
    icon: PenTool,
    description: "Generates compelling, emotionally intelligent scripts and video concepts from a simple prompt.",
  },
  {
    name: "ScenePlannerAgent",
    icon: LayoutGrid,
    description: "Breaks down the master script into 16 distinct, visually described scenes for generation.",
  },
  {
    name: "VisualGeneratorAgent",
    icon: Bot,
    description: "Interfaces with leading AI models to render each scene into a stunning visual clip.",
  },
  {
    name: "FinalAssemblerAgent",
    icon: Scissors,
    description: "The master editor. Stitches scenes, applies transitions, and syncs audio for the final cut.",
  },
  {
    name: "SchedulerAgent",
    icon: Calendar,
    description: "Orchestrates the entire pipeline, managing jobs, retries, and dependencies between all agents.",
  },
  {
    name: "DeliveryAgent",
    icon: Send,
    description: "Packages the final video, thumbnails, and other assets for download and notifies the user.",
  },
  {
    name: "AuthManagerAgent",
    icon: ShieldCheck,
    description: "Secures the platform, managing user sessions and ensuring data privacy with RLS.",
  },
]

export default function AgentPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Meet the AEON Agents</h1>
        <p className="text-neutral-400 mt-4 max-w-2xl mx-auto">
          AEON OS operates through a specialized team of AI agents, each with a unique role in the creative pipeline.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.name} className="bg-white/5 border-white/10 backdrop-blur-md p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-indigo-800">
                <agent.icon className="h-8 w-8 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold">{agent.name}</h3>
            <p className="text-neutral-400 mt-2 text-sm">{agent.description}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
