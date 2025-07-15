'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Video, 
  CreditCard, 
  Download, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Users,
  Star,
  Play,
  Loader2
} from 'lucide-react'
import Link from 'next/link'

interface DashboardData {
  user: {
    id: string
    email: string
    credits: number
    subscription_tier: string
    subscription_status: string
  }
  videos: {
    total: number
    completed: number
    processing: number
    failed: number
    recent: any[]
  }
  credits: {
    current_balance: number
    total_earned: number
    total_spent: number
    recent_transactions: any[]
  }
  orders: {
    total: number
    total_spent: number
    recent: any[]
  }
  usage_stats: {
    videos_this_month: number
    total_video_duration: number
    avg_processing_time: number
    success_rate: number
  }
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // In a real app, get user ID from auth context
      const userId = 'current-user-id' // This would come from auth
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/dashboard/user/${userId}`)
      const result = await response.json()

      if (result.success) {
        setData(result.user_data)
      } else {
        setError(result.error || 'Failed to load dashboard data')
      }
    } catch (err) {
      console.error('Dashboard error:', err)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500'
      case 'processing':
        return 'bg-blue-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-yellow-500'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-white">Loading dashboard...</p>
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
            <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20">
          <CardContent className="p-8 text-center">
            <p className="text-white">No data available</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-300">Welcome back, {data.user.email}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                Credits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {data.credits.current_balance.toLocaleString()}
              </div>
              <p className="text-gray-400 text-sm">Available credits</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-blue-400" />
                Videos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {data.videos.total}
              </div>
              <p className="text-gray-400 text-sm">Total created</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white mb-1">
                {Math.round(data.usage_stats.success_rate * 100)}%
              </div>
              <p className="text-gray-400 text-sm">Generation success</p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1 capitalize">
                {data.user.subscription_tier}
              </div>
              <Badge className={`${data.user.subscription_status === 'active' ? 'bg-green-500' : 'bg-gray-500'} text-white border-0`}>
                {data.user.subscription_status}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="videos" className="space-y-6">
          <TabsList className="bg-white/10 backdrop-blur-lg border-white/20">
            <TabsTrigger value="videos" className="text-white data-[state=active]:bg-white/20">
              Videos
            </TabsTrigger>
            <TabsTrigger value="credits" className="text-white data-[state=active]:bg-white/20">
              Credits
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-white data-[state=active]:bg-white/20">
              Orders
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Videos Tab */}
          <TabsContent value="videos">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Video Stats */}
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Video Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Completed</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-white font-medium">{data.videos.completed}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Processing</span>
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-blue-500" />
                      <span className="text-white font-medium">{data.videos.processing}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Failed</span>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className="text-white font-medium">{data.videos.failed}</span>
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="text-sm text-gray-300 mb-2">Success Rate</div>
                    <Progress value={data.usage_stats.success_rate * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Videos */}
              <Card className="lg:col-span-2 bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Recent Videos</CardTitle>
                  <CardDescription className="text-gray-300">
                    Your latest video generations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.videos.recent.length > 0 ? (
                      data.videos.recent.map((video, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(video.status)}
                            <div>
                              <h3 className="text-white font-medium">{video.title || 'Untitled Video'}</h3>
                              <p className="text-gray-400 text-sm">
                                {video.duration}s • {new Date(video.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getStatusColor(video.status)} text-white border-0`}>
                              {video.status}
                            </Badge>
                            {video.status === 'completed' && (
                              <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400 mb-4">No videos yet</p>
                        <Button asChild>
                          <Link href="/instant">Create Your First Video</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Credits Tab */}
          <TabsContent value="credits">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Credit Balance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-white mb-2">
                      {data.credits.current_balance.toLocaleString()}
                    </div>
                    <p className="text-gray-400">Available Credits</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">
                        {data.credits.total_earned.toLocaleString()}
                      </div>
                      <p className="text-gray-400 text-sm">Total Earned</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">
                        {data.credits.total_spent.toLocaleString()}
                      </div>
                      <p className="text-gray-400 text-sm">Total Spent</p>
                    </div>
                  </div>
                  <Button asChild className="w-full">
                    <Link href="/pricing">Buy More Credits</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.credits.recent_transactions.length > 0 ? (
                      data.credits.recent_transactions.map((transaction, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{transaction.description}</p>
                            <p className="text-gray-400 text-sm">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className={`font-bold ${transaction.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-400 text-center py-4">No transactions yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Order History</CardTitle>
                <CardDescription className="text-gray-300">
                  Your purchase history and receipts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.orders.recent.length > 0 ? (
                    data.orders.recent.map((order, index) => (
                      <div key={index} className="flex justify-between items-center p-4 bg-white/5 rounded-lg">
                        <div>
                          <h3 className="text-white font-medium">{order.product_type}</h3>
                          <p className="text-gray-400 text-sm">
                            {new Date(order.created_at).toLocaleDateString()} • 
                            {order.credits_purchased} credits
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-bold">${order.amount}</div>
                          <Badge className={`${order.status === 'completed' ? 'bg-green-500' : 'bg-gray-500'} text-white border-0`}>
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-400 text-center py-8">No orders yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Videos This Month</span>
                    <span className="text-white font-bold">{data.usage_stats.videos_this_month}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Total Duration</span>
                    <span className="text-white font-bold">{data.usage_stats.total_video_duration}s</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Avg Processing Time</span>
                    <span className="text-white font-bold">{data.usage_stats.avg_processing_time}min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Success Rate</span>
                    <span className="text-white font-bold">{Math.round(data.usage_stats.success_rate * 100)}%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full">
                    <Link href="/instant">
                      <Play className="w-4 h-4 mr-2" />
                      Generate New Video
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    <Link href="/pricing">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upgrade Plan
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                    <Link href="/account">
                      <Users className="w-4 h-4 mr-2" />
                      Account Settings
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
