'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, Mail, Video, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface OrderStatus {
  id: string
  email: string
  video_prompt: string
  video_style: string
  status: string
  video_url: string | null
  created_at: string
  estimated_completion: string
}

function InstantSuccessPageContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  const [orderStatus, setOrderStatus] = useState<OrderStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided')
      setLoading(false)
      return
    }

    fetchOrderStatus()
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchOrderStatus, 30000)
    return () => clearInterval(interval)
  }, [sessionId])

  const fetchOrderStatus = async () => {
    try {
      const response = await fetch(`/api/orders/status?session_id=${sessionId}`)
      const data = await response.json()

      if (data.error) {
        setError(data.error)
      } else {
        setOrderStatus(data.order)
      }
    } catch (err) {
      console.error('Error fetching order status:', err)
      setError('Failed to fetch order status')
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-500',
          text: 'Payment Processing',
          description: 'Confirming your payment...',
        }
      case 'processing':
        return {
          color: 'bg-blue-500',
          text: 'Creating Video',
          description: 'Our AI is generating your video...',
        }
      case 'completed':
        return {
          color: 'bg-green-500',
          text: 'Video Ready!',
          description: 'Your video has been generated successfully',
        }
      case 'failed':
        return {
          color: 'bg-red-500',
          text: 'Generation Failed',
          description: 'Something went wrong. We\'ll refund you automatically.',
        }
      default:
        return {
          color: 'bg-gray-500',
          text: 'Unknown Status',
          description: 'Checking status...',
        }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white">Loading order status...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="text-red-400 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-white mb-2">Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button asChild>
              <Link href="/instant">Try Again</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!orderStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-white">Order not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusInfo = getStatusInfo(orderStatus.status)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-white mb-2">Payment Successful!</h1>
            <p className="text-gray-300">Your video is being created...</p>
          </div>

          {/* Order Status Card */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Generation Status
              </CardTitle>
              <CardDescription className="text-gray-300">
                Order ID: {orderStatus.id.substring(0, 8)}...
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Status Badge */}
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${statusInfo.color} animate-pulse`}></div>
                <Badge className={`${statusInfo.color} text-white border-0`}>
                  {statusInfo.text}
                </Badge>
                <span className="text-gray-300 text-sm">{statusInfo.description}</span>
              </div>

              {/* Video Details */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Video Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Style:</span>
                    <span className="text-white capitalize">{orderStatus.video_style}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white">{orderStatus.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created:</span>
                    <span className="text-white">
                      {new Date(orderStatus.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Prompt Preview */}
              <div className="bg-white/5 rounded-lg p-4">
                <h3 className="text-white font-medium mb-2">Your Prompt</h3>
                <p className="text-gray-300 text-sm italic">
                  "{orderStatus.video_prompt}"
                </p>
              </div>

              {/* Video Ready */}
              {orderStatus.status === 'completed' && orderStatus.video_url && (
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg p-4 border border-green-400/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-green-400" />
                    <h3 className="text-white font-medium">Video Ready!</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">
                    Your video has been generated and is ready for download.
                  </p>
                  <div className="flex gap-3">
                    <Button asChild className="bg-green-500 hover:bg-green-600">
                      <a href={orderStatus.video_url} target="_blank" rel="noopener noreferrer">
                        Download Video
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/portal">
                        View in Portal
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )}

              {/* Processing Info */}
              {orderStatus.status === 'processing' && (
                <div className="bg-blue-500/20 rounded-lg p-4 border border-blue-400/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-blue-400 animate-spin" />
                    <h3 className="text-white font-medium">Creating Your Video</h3>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    Our 6-model AI ensemble is working on your video. This typically takes 3-5 minutes.
                  </p>
                  <p className="text-blue-300 text-sm">
                    Estimated completion: {orderStatus.estimated_completion}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Notification */}
          <Card className="bg-white/5 backdrop-blur-lg border-white/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 text-center">
                <Mail className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Email Notification</p>
                  <p className="text-gray-400 text-sm">
                    We'll send you an email when your video is ready at {orderStatus.email}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <div className="text-center mt-8">
            <p className="text-gray-300 mb-4">
              Want to create more videos or manage your account?
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/instant">Create Another Video</Link>
              </Button>
              <Button asChild>
                <Link href="/portal">
                  Access Customer Portal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InstantSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <InstantSuccessPageContent />
    </Suspense>
  )
}
