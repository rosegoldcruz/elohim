'use client'

import { useEffect, useState } from 'react'
import { usePostHog } from 'posthog-js/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { usePostHogAnalytics } from '@/lib/analytics/posthog'
import { supabaseAnalytics } from '@/lib/analytics/supabase-analytics'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'

interface DashboardData {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  totalScenes: number
  totalAgentJobs: number
  completedJobs: number
  totalAssets: number
  userCredits: number
  recentProjects: Array<{
    id: string
    name: string
    status: string
    created_at: string
  }>
  agentPerformance: Array<{
    agent_type: string
    total_jobs: number
    completed_jobs: number
    avg_processing_time: number
  }>
}

export default function AeonAnalyticsDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const posthog = usePostHog()
  const { trackFeatureUsage } = usePostHogAnalytics()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  useEffect(() => {
    if (user) {
      loadDashboardData()
      trackFeatureUsage('analytics_dashboard_viewed')
    }
  }, [user, trackFeatureUsage])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      // Fetch all user data from Supabase
      const [
        { data: projects },
        { data: scenes },
        { data: agentJobs },
        { data: assets },
        { data: credits }
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('user_id', user.id),
        supabase.from('scenes').select('*, projects!inner(user_id)').eq('projects.user_id', user.id),
        supabase.from('agent_jobs').select('*, projects!inner(user_id)').eq('projects.user_id', user.id),
        supabase.from('assets').select('*, projects!inner(user_id)').eq('projects.user_id', user.id),
        supabase.from('credits').select('*').eq('user_id', user.id).single()
      ])

      // Calculate agent performance
      const agentPerformance = agentJobs?.reduce((acc: any[], job) => {
        const existing = acc.find(a => a.agent_type === job.agent_type)
        const processingTime = job.started_at && job.finished_at 
          ? new Date(job.finished_at).getTime() - new Date(job.started_at).getTime()
          : 0

        if (existing) {
          existing.total_jobs++
          if (job.status === 'complete') existing.completed_jobs++
          existing.total_processing_time += processingTime
          existing.avg_processing_time = existing.total_processing_time / existing.completed_jobs
        } else {
          acc.push({
            agent_type: job.agent_type,
            total_jobs: 1,
            completed_jobs: job.status === 'complete' ? 1 : 0,
            total_processing_time: processingTime,
            avg_processing_time: processingTime
          })
        }
        return acc
      }, []) || []

      setDashboardData({
        totalProjects: projects?.length || 0,
        activeProjects: projects?.filter(p => p.status === 'generating').length || 0,
        completedProjects: projects?.filter(p => p.status === 'complete').length || 0,
        totalScenes: scenes?.length || 0,
        totalAgentJobs: agentJobs?.length || 0,
        completedJobs: agentJobs?.filter(j => j.status === 'complete').length || 0,
        totalAssets: assets?.length || 0,
        userCredits: credits?.balance || 0,
        recentProjects: projects?.slice(0, 5) || [],
        agentPerformance
      })

    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTestEvent = () => {
    posthog.capture('test_analytics_event', {
      source: 'aeon_analytics_dashboard',
      timestamp: new Date().toISOString(),
      user_action: 'test_button_clicked'
    })
    
    trackFeatureUsage('analytics_test_event_triggered')
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-400">
          Failed to load analytics data. Please try again.
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">AEON Analytics Dashboard</h1>
        <Button onClick={handleTestEvent} variant="outline">
          Test PostHog Event
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-zinc-900 border-purple-900">
          <CardHeader>
            <CardTitle className="text-white">Total Projects</CardTitle>
            <CardDescription>All video projects created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">
              {dashboardData.totalProjects}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-blue-900">
          <CardHeader>
            <CardTitle className="text-white">Active Projects</CardTitle>
            <CardDescription>Currently generating</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              {dashboardData.activeProjects}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-green-900">
          <CardHeader>
            <CardTitle className="text-white">Completed</CardTitle>
            <CardDescription>Successfully generated</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {dashboardData.completedProjects}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-yellow-900">
          <CardHeader>
            <CardTitle className="text-white">Credits</CardTitle>
            <CardDescription>Available balance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-400">
              {dashboardData.userCredits}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card className="bg-zinc-900 border-purple-900">
        <CardHeader>
          <CardTitle className="text-white">Agent Performance</CardTitle>
          <CardDescription>AI agent processing statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.agentPerformance.map((agent) => (
              <div key={agent.agent_type} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div>
                  <div className="text-white font-medium capitalize">
                    {agent.agent_type.replace('_', ' ')} Agent
                  </div>
                  <div className="text-gray-400 text-sm">
                    {agent.completed_jobs}/{agent.total_jobs} jobs completed
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white">
                    {Math.round((agent.completed_jobs / agent.total_jobs) * 100)}% success
                  </div>
                  <div className="text-gray-400 text-sm">
                    {Math.round(agent.avg_processing_time / 1000)}s avg
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card className="bg-zinc-900 border-purple-900">
        <CardHeader>
          <CardTitle className="text-white">Recent Projects</CardTitle>
          <CardDescription>Your latest video generation projects</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dashboardData.recentProjects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-gray-800 rounded">
                <div>
                  <div className="text-white font-medium">{project.name}</div>
                  <div className="text-gray-400 text-sm">
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </div>
                <Badge 
                  variant={project.status === 'complete' ? 'default' : 'secondary'}
                  className={
                    project.status === 'complete' ? 'bg-green-900 text-green-300' :
                    project.status === 'generating' ? 'bg-blue-900 text-blue-300' :
                    'bg-gray-700 text-gray-300'
                  }
                >
                  {project.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PostHog Integration Status */}
      <Card className="bg-zinc-900 border-green-900">
        <CardHeader>
          <CardTitle className="text-white flex items-center space-x-2">
            <span>Analytics Integration</span>
            <Badge variant="outline" className="bg-green-900 text-green-300">
              Active
            </Badge>
          </CardTitle>
          <CardDescription>PostHog + Supabase analytics tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-gray-300 space-y-1">
            <p>✅ PostHog client initialized</p>
            <p>✅ User identification active</p>
            <p>✅ Project lifecycle tracking</p>
            <p>✅ Agent performance monitoring</p>
            <p>✅ Credit usage tracking</p>
            <p>✅ Asset generation tracking</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
