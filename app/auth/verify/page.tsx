'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function VerifyPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')
    const redirect = searchParams.get('redirect')

    if (!token || !email) {
      setStatus('error')
      setError('Invalid magic link. Missing token or email.')
      return
    }

    verifyToken(token, email, redirect)
  }, [searchParams])

  const verifyToken = async (token: string, email: string, redirect: string | null) => {
    try {
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, email }),
      })

      const result = await response.json()

      if (result.error) {
        setStatus('error')
        setError(result.error)
        return
      }

      setStatus('success')
      setUser(result.user)

      // Redirect after a short delay
      setTimeout(() => {
        const redirectUrl = redirect || '/portal'
        router.push(redirectUrl)
      }, 2000)

    } catch (error) {
      console.error('Verification error:', error)
      setStatus('error')
      setError('Failed to verify magic link. Please try again.')
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Verifying Magic Link</h2>
            <p className="text-gray-300">Please wait while we verify your magic link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <CardTitle className="text-2xl text-white">Verification Failed</CardTitle>
            <CardDescription className="text-gray-300">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-red-500/20 rounded-lg p-4 border border-red-400/30">
              <p className="text-red-300 text-sm">
                This magic link may have expired or already been used. Please request a new one.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button asChild className="flex-1">
                <Link href="/auth/login">
                  Get New Link
                </Link>
              </Button>
              <Button variant="outline" asChild className="border-white/20 text-white hover:bg-white/10">
                <Link href="/">
                  Home
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <CardTitle className="text-2xl text-white">Welcome Back!</CardTitle>
          <CardDescription className="text-gray-300">
            You've been successfully logged in
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user && (
            <div className="bg-green-500/20 rounded-lg p-4 border border-green-400/30">
              <div className="text-center">
                <p className="text-green-300 font-medium">{user.email}</p>
                <p className="text-green-200 text-sm">
                  Credits: {user.credits} | Plan: {user.subscription_tier}
                </p>
              </div>
            </div>
          )}
          
          <div className="text-center">
            <p className="text-gray-300 text-sm mb-4">
              Redirecting you to your portal...
            </p>
            <Button asChild className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              <Link href="/portal">
                Go to Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 backdrop-blur-lg border-white/20 w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 text-purple-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Loading...</h2>
            <p className="text-gray-300">Please wait...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <VerifyPageContent />
    </Suspense>
  )
}
