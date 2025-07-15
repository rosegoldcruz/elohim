'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign,
  Users,
  Video,
  TrendingUp,
  Clock,
  Server,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Activity,
  CreditCard,
  BarChart3
} from 'lucide-react'

interface AdminData {
  analytics: {
    total_users: number
    new_users_30d: number
    total_videos: number
    completed_videos: number
    videos_24h: number
    total_revenue: number
    revenue_30d: number
    avg_processing_time: number
  }
  queue: {
    pending_count: number
    processing_count: number
    queue_length: number
    pending_videos: any[]
    processing_videos: any[]
  }
  users: {
    total_users: number
    new_users_30d: number
    new_users_7d: number
    active_users_30d: number
    growth_rate_30d: number
    activation_rate: number
  }
  revenue: {
    total_revenue: number
    revenue_30d: number
    mrr: number
    subscription_users: number
    avg_order_value: number
    revenue_growth_30d: number
  }
  system: {
    total_videos_processed: number
    success_rate: number
    failure_rate: number
    avg_processing_time: number
    system_uptime: string
    api_response_time: string
  }
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminData()
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchAdminData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchAdminData = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/dashboard/admin`)
      const result = await response.json()

      if (result.success) {
        setData(result.admin_data)
      } else {
        setError(result.error || 'Failed to load admin data')
      }
    } catch (err) {
      console.error('Admin dashboard error:', err)
      setError('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white">Loading admin dashboard...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button onClick={fetchAdminData}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">AEON Platform Operations & Analytics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                Revenue (30d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                ${data.revenue.revenue_30d.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">
                +{data.revenue.revenue_growth_30d.toFixed(1)}% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {data.users.active_users_30d.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">
                {data.users.activation_rate.toFixed(1)}% activation rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-400" />
                Videos (24h)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {data.analytics.videos_24h.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">
                {data.system.success_rate.toFixed(1)}% success rate
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-400" />
                Queue Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {data.queue.queue_length}
              </div>
              <p className="text-gray-400 text-sm">
                {data.queue.processing_count} processing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-lg border-white/20">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="users" className="text-white data-[state=active]:bg-white/20">
              Users
            </TabsTrigger>
            <TabsTrigger value="revenue" className="text-white data-[state=active]:bg-white/20">
              Revenue
            </TabsTrigger>
            <TabsTrigger value="queue" className="text-white data-[state=active]:bg-white/20">
              Queue
            </TabsTrigger>
            <TabsTrigger value="system" className="text-white data-[state=active]:bg-white/20">
              System
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Platform Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Users</span>
                    <span className="text-white font-bold">{data.analytics.total_users.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Videos</span>
                    <span className="text-white font-bold">{data.analytics.total_videos.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Revenue</span>
                    <span className="text-white font-bold">${data.analytics.total_revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Avg Processing Time</span>
                    <span className="text-white font-bold">{data.analytics.avg_processing_time.toFixed(1)}min</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">System Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">System Uptime</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-white font-bold">{data.system.system_uptime}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">API Response Time</span>
                    <span className="text-white font-bold">{data.system.api_response_time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="text-white font-bold">{data.system.success_rate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Failure Rate</span>
                    <span className="text-white font-bold">{data.system.failure_rate.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">User Growth</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Users</span>
                    <span className="text-white font-bold">{data.users.total_users.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">New Users (30d)</span>
                    <span className="text-white font-bold">{data.users.new_users_30d.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">New Users (7d)</span>
                    <span className="text-white font-bold">{data.users.new_users_7d.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Growth Rate (30d)</span>
                    <span className="text-green-400 font-bold">+{data.users.growth_rate_30d.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">User Engagement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Active Users (30d)</span>
                    <span className="text-white font-bold">{data.users.active_users_30d.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Activation Rate</span>
                    <span className="text-white font-bold">{data.users.activation_rate.toFixed(1)}%</span>
                  </div>
                  <div className="pt-4">
                    <div className="text-sm text-gray-300 mb-2">Activation Rate</div>
                    <Progress value={data.users.activation_rate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Revenue</span>
                    <span className="text-white font-bold">${data.revenue.total_revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Revenue (30d)</span>
                    <span className="text-white font-bold">${data.revenue.revenue_30d.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">MRR</span>
                    <span className="text-white font-bold">${data.revenue.mrr.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Growth (30d)</span>
                    <span className="text-green-400 font-bold">+{data.revenue.revenue_growth_30d.toFixed(1)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Subscription Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Subscription Users</span>
                    <span className="text-white font-bold">{data.revenue.subscription_users.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Avg Order Value</span>
                    <span className="text-white font-bold">${data.revenue.avg_order_value.toFixed(2)}</span>
                  </div>
                  <div className="pt-4">
                    <div className="text-sm text-gray-300 mb-2">Subscription Rate</div>
                    <Progress 
                      value={(data.revenue.subscription_users / data.users.total_users) * 100} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Queue Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Queue Length</span>
                    <span className="text-white font-bold">{data.queue.queue_length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Processing</span>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                      <span className="text-white font-bold">{data.queue.processing_count}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Pending</span>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-white font-bold">{data.queue.pending_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Processing Videos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.queue.processing_videos.length > 0 ? (
                      data.queue.processing_videos.map((video, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{video.title || 'Untitled'}</p>
                            <p className="text-gray-400 text-sm">
                              {video.duration}s • Started {new Date(video.created_at).toLocaleTimeString()}
                            </p>
                          </div>
                          <Badge className="bg-blue-500 text-white border-0">
                            Processing
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">No videos processing</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Videos Processed</span>
                    <span className="text-white font-bold">{data.system.total_videos_processed.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="text-green-400 font-bold">{data.system.success_rate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Failure Rate</span>
                    <span className="text-red-400 font-bold">{data.system.failure_rate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Avg Processing Time</span>
                    <span className="text-white font-bold">{data.system.avg_processing_time.toFixed(1)}min</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">System Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">System Uptime</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-white font-bold">{data.system.system_uptime}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">API Response Time</span>
                    <span className="text-white font-bold">{data.system.api_response_time}</span>
                  </div>
                  <div className="pt-4">
                    <div className="text-sm text-gray-300 mb-2">System Health</div>
                    <Progress value={99.9} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
