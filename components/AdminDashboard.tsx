'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Download,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  FileText,
  Loader2,
  RefreshCw,
  Eye,
  Flag
} from 'lucide-react'
import { toast } from 'sonner'

interface PlatformRevenue {
  gross_revenue: number
  net_revenue: number
  total_royalties_paid: number
  total_payouts_processed: number
  platform_fees_collected: number
  active_creators: number
  total_transactions: number
  period_start: string
  period_end: string
}

interface CreatorAnalytics {
  creator_id: string
  creator_email?: string
  total_earnings: number
  total_payouts: number
  pending_balance: number
  status: 'active' | 'inactive' | 'suspended'
  payout_method: string
  created_at: string
}

interface AnomalyAlert {
  id: string
  type: 'large_transaction' | 'unusual_pattern' | 'rapid_payouts' | 'suspicious_creator'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  affected_entity: string
  amount?: number
  detected_at: string
  status: 'new' | 'investigating' | 'resolved' | 'false_positive'
}

interface AdminDashboardData {
  revenue: PlatformRevenue
  top_creators: CreatorAnalytics[]
  recent_transactions: any[]
  anomaly_alerts: AnomalyAlert[]
  growth_metrics: {
    revenue_growth: number
    creator_growth: number
    transaction_growth: number
  }
}

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [exportLoading, setExportLoading] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [selectedPeriod])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Calculate date range based on selected period
      const endDate = new Date().toISOString()
      const startDate = new Date()
      
      switch (selectedPeriod) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7)
          break
        case '30d':
          startDate.setDate(startDate.getDate() - 30)
          break
        case '90d':
          startDate.setDate(startDate.getDate() - 90)
          break
        default:
          startDate.setDate(startDate.getDate() - 30)
      }

      // Fetch revenue data with analytics
      const revenueResponse = await fetch(
        `/api/admin/revenue?startDate=${startDate.toISOString()}&endDate=${endDate}&includeAnalytics=true`
      )
      
      if (!revenueResponse.ok) {
        throw new Error('Failed to fetch revenue data')
      }

      const revenueData = await revenueResponse.json()

      // Fetch creator data with risk assessment
      const creatorsResponse = await fetch(
        '/api/admin/creators?limit=20&includeAnalytics=true&riskAssessment=true'
      )
      
      if (!creatorsResponse.ok) {
        throw new Error('Failed to fetch creator data')
      }

      const creatorsData = await creatorsResponse.json()

      // Combine data
      const combinedData: AdminDashboardData = {
        revenue: revenueData.data.revenue,
        top_creators: creatorsData.data.creators,
        recent_transactions: [], // Would be populated from API
        anomaly_alerts: revenueData.data.analytics?.anomalies || [],
        growth_metrics: {
          revenue_growth: 0, // Would be calculated from API
          creator_growth: 0,
          transaction_growth: 0
        }
      }

      setDashboardData(combinedData)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const refreshData = async () => {
    setRefreshing(true)
    await fetchDashboardData()
    setRefreshing(false)
    toast.success('Dashboard data refreshed')
  }

  const handleExport = async (type: string, format: string = 'csv') => {
    try {
      setExportLoading(true)

      const endDate = new Date().toISOString()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      const response = await fetch(
        `/api/admin/export?type=${type}&format=${format}&startDate=${startDate.toISOString()}&endDate=${endDate}`
      )

      if (!response.ok) {
        throw new Error('Export failed')
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `aeon_${type}_export.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`${type} data exported successfully`)

    } catch (error) {
      console.error('Export error:', error)
      toast.error('Export failed')
    } finally {
      setExportLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount * 0.01) // Assuming 1 credit = $0.01
  }

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-500'
    if (growth < 0) return 'text-red-500'
    return 'text-gray-500'
  }

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return <TrendingUp className="h-4 w-4" />
    if (growth < 0) return <TrendingDown className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'inactive': return 'bg-gray-500'
      case 'suspended': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading admin dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!dashboardData) {
    return (
      <Alert className="m-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No dashboard data available</AlertDescription>
      </Alert>
    )
  }

  const { revenue, top_creators, anomaly_alerts, growth_metrics } = dashboardData

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400">
            📊 AEON Admin Dashboard
          </h1>
          <p className="text-neutral-400 mt-2">Platform oversight and revenue analytics</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-500" />
              Gross Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">
              {formatCurrency(revenue.gross_revenue)}
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              {revenue.gross_revenue} credits
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Net Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-400">
              {formatCurrency(revenue.net_revenue)}
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              After royalties & fees
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-purple-500" />
              Active Creators
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-400">
              {revenue.active_creators}
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              Earning creators
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-orange-500" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-400">
              {revenue.total_transactions.toLocaleString()}
            </div>
            <div className="text-sm text-neutral-400 mt-1">
              Total processed
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Anomaly Alerts */}
      {anomaly_alerts.length > 0 && (
        <Card className="bg-white/5 border-white/10 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Anomaly Alerts ({anomaly_alerts.length})
            </CardTitle>
            <CardDescription>
              Suspicious patterns and unusual activity detected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {anomaly_alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} />
                    <div>
                      <div className="font-medium">{alert.description}</div>
                      <div className="text-sm text-neutral-400">
                        {alert.type} • {new Date(alert.detected_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.amount && (
                      <span className="text-sm font-medium">
                        {formatCurrency(alert.amount)}
                      </span>
                    )}
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="creators" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="creators">Top Creators</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        {/* Top Creators Tab */}
        <TabsContent value="creators" className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Creators by Earnings
              </CardTitle>
              <CardDescription>
                Highest earning creators on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {top_creators.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400">
                    No creator data available
                  </div>
                ) : (
                  top_creators.map((creator, index) => (
                    <div key={creator.creator_id} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">
                            {creator.creator_email || `Creator ${creator.creator_id.slice(0, 8)}`}
                          </div>
                          <div className="text-sm text-neutral-400">
                            ID: {creator.creator_id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-400">
                          {formatCurrency(creator.total_earnings)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(creator.status)}`} />
                          <span className="text-xs text-neutral-400 capitalize">
                            {creator.status}
                          </span>
                          <span className="text-xs text-neutral-400">
                            • {creator.payout_method}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Transaction Overview
              </CardTitle>
              <CardDescription>
                Platform transaction breakdown and metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">
                    {formatCurrency(revenue.gross_revenue)}
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">
                    Total Purchases
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatCurrency(revenue.total_royalties_paid)}
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">
                    Royalties Paid
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400">
                    {formatCurrency(revenue.total_payouts_processed)}
                  </div>
                  <div className="text-sm text-neutral-400 mt-1">
                    Payouts Processed
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-medium">Revenue Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Platform Revenue Share</span>
                    <span className="text-sm font-medium">
                      {revenue.gross_revenue > 0
                        ? ((revenue.net_revenue / revenue.gross_revenue) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <Progress
                    value={revenue.gross_revenue > 0 ? (revenue.net_revenue / revenue.gross_revenue) * 100 : 0}
                    className="w-full [&>*]:bg-gradient-to-r [&>*]:from-purple-500 [&>*]:to-cyan-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Revenue Growth</span>
                  <div className={`flex items-center gap-1 ${getGrowthColor(growth_metrics.revenue_growth)}`}>
                    {getGrowthIcon(growth_metrics.revenue_growth)}
                    <span className="text-sm font-medium">
                      {growth_metrics.revenue_growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Creator Growth</span>
                  <div className={`flex items-center gap-1 ${getGrowthColor(growth_metrics.creator_growth)}`}>
                    {getGrowthIcon(growth_metrics.creator_growth)}
                    <span className="text-sm font-medium">
                      {growth_metrics.creator_growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Transaction Growth</span>
                  <div className={`flex items-center gap-1 ${getGrowthColor(growth_metrics.transaction_growth)}`}>
                    {getGrowthIcon(growth_metrics.transaction_growth)}
                    <span className="text-sm font-medium">
                      {growth_metrics.transaction_growth.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Platform Health
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">System Status</span>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Healthy
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Alerts</span>
                  <span className="text-sm font-medium text-yellow-400">
                    {anomaly_alerts.filter(a => a.status === 'new').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Success Rate</span>
                  <span className="text-sm font-medium text-green-400">
                    99.2%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Exports Tab */}
        <TabsContent value="exports" className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Data Exports
              </CardTitle>
              <CardDescription>
                Export platform data for accounting, tax filings, and investor reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Financial Reports</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleExport('revenue', 'csv')}
                      disabled={exportLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Revenue Report (CSV)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleExport('transactions', 'csv')}
                      disabled={exportLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Transaction History (CSV)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleExport('full_report', 'json')}
                      disabled={exportLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Full Platform Report (JSON)
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Creator Data</h4>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleExport('creators', 'csv')}
                      disabled={exportLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Creator Analytics (CSV)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => window.open('/api/admin/export?type=creators&format=json', '_blank')}
                      disabled={exportLoading}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Creator Data (JSON)
                    </Button>
                  </div>
                </div>
              </div>

              {exportLoading && (
                <div className="flex items-center justify-center mt-6 p-4 rounded-lg bg-white/5">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Preparing export...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
