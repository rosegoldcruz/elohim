import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Eye, Target, BarChart3 } from "lucide-react"

const revenueData = [
  { month: "Jan", revenue: 125000, videos: 45, conversion: 3.2 },
  { month: "Feb", revenue: 180000, videos: 62, conversion: 3.8 },
  { month: "Mar", revenue: 245000, videos: 78, conversion: 4.1 },
  { month: "Apr", revenue: 320000, videos: 95, conversion: 4.5 },
  { month: "May", revenue: 425000, videos: 118, conversion: 4.8 },
  { month: "Jun", revenue: 580000, videos: 142, conversion: 5.2 },
]

const topPerformers = [
  { title: "Skincare Routine Revolution", revenue: 45000, views: 2.1, ctr: 8.5, platform: "TikTok" },
  { title: "Tech Gadget Unboxing", revenue: 38000, views: 1.8, ctr: 7.2, platform: "YouTube" },
  { title: "Fashion Haul Spectacular", revenue: 32000, views: 1.5, ctr: 6.8, platform: "Instagram" },
  { title: "Fitness Transformation", revenue: 28000, views: 1.2, ctr: 6.1, platform: "TikTok" },
]

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-400 mb-4">
          Revenue Analytics
        </h1>
        <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
          Track video performance, conversion attribution, and ROI calculations in real-time
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <Card className="relative bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8 text-green-400" />
                <Badge className="bg-green-500/20 text-green-400">+23%</Badge>
              </div>
              <div className="text-3xl font-bold text-green-400 mb-1">$580K</div>
              <p className="text-neutral-400">Monthly Revenue</p>
            </CardContent>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <Card className="relative bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Eye className="h-8 w-8 text-blue-400" />
                <Badge className="bg-blue-500/20 text-blue-400">+18%</Badge>
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-1">8.2M</div>
              <p className="text-neutral-400">Total Views</p>
            </CardContent>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <Card className="relative bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Target className="h-8 w-8 text-purple-400" />
                <Badge className="bg-purple-500/20 text-purple-400">+12%</Badge>
              </div>
              <div className="text-3xl font-bold text-purple-400 mb-1">5.2%</div>
              <p className="text-neutral-400">Conversion Rate</p>
            </CardContent>
          </Card>
        </div>

        <div className="group relative">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
          <Card className="relative bg-white/5 border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="h-8 w-8 text-yellow-400" />
                <Badge className="bg-yellow-500/20 text-yellow-400">+31%</Badge>
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-1">142</div>
              <p className="text-neutral-400">Videos Created</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="relative mb-12">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/30 via-emerald-900/30 to-teal-900/30 rounded-3xl blur-2xl"></div>
        <Card className="relative bg-white/5 border-white/10 backdrop-blur-md rounded-3xl">
          <CardHeader>
            <CardTitle className="text-2xl">Revenue Growth Trajectory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex items-end justify-between gap-4">
              {revenueData.map((data, index) => (
                <div key={data.month} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-gradient-to-t from-green-600 to-emerald-400 rounded-t-lg relative group cursor-pointer"
                    style={{ height: `${(data.revenue / 600000) * 100}%` }}
                  >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      ${data.revenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-neutral-400">{data.month}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-blue-900/30 rounded-3xl blur-2xl"></div>
        <Card className="relative bg-white/5 border-white/10 backdrop-blur-md rounded-3xl">
          <CardHeader>
            <CardTitle className="text-2xl">Top Performing Videos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformers.map((video, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold">{video.title}</h3>
                      <p className="text-sm text-neutral-400">{video.platform}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-green-400">${video.revenue.toLocaleString()}</div>
                      <div className="text-neutral-500">Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-blue-400">{video.views}M</div>
                      <div className="text-neutral-500">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-purple-400">{video.ctr}%</div>
                      <div className="text-neutral-500">CTR</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
