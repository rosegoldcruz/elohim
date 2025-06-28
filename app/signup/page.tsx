'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Sparkles, Check, Crown } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const isTrial = searchParams.get('trial') === 'true'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      // Create checkout session for free trial
      const response = await fetch('/api/checkout/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price_id: 'NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID', // Will be overridden for trial
          plan: 'aeon_pro',
          trial: isTrial,
          email: email,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe checkout
      window.location.href = result.url
    } catch (error) {
      console.error('Signup error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to start signup process')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Badge className="mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <Sparkles className="w-4 h-4 mr-2" />
            {isTrial ? '7-Day Free Trial' : 'Join AEON'}
          </Badge>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            {isTrial ? 'Start Your Free Trial' : 'Create Your Account'}
          </h1>
          
          <p className="text-gray-300 mb-8">
            {isTrial 
              ? 'Get full access to AEON PRO for 7 days. No charge until trial ends.'
              : 'Join thousands of creators using AEON to generate stunning videos.'
            }
          </p>
        </div>

        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-75"></div>
          <Card className="relative bg-white/10 backdrop-blur-lg border border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 rounded-3xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 flex items-center justify-center shadow-2xl shadow-purple-500/30">
                  <Crown className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl text-white">
                {isTrial ? 'AEON PRO - Free Trial' : 'AEON PRO'}
              </CardTitle>
              <CardDescription className="text-center">
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-3xl font-black text-white">
                    {isTrial ? '$0' : '$29.99'}
                  </span>
                  <span className="text-neutral-400">
                    {isTrial ? 'for 7 days' : '/month'}
                  </span>
                </div>
                {isTrial && (
                  <div className="text-sm text-green-400">
                    Then $29.99/month. Cancel anytime.
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {[
                  '1,000 credits/month',
                  'HD 1080p Quality',
                  'Commercial License',
                  'Email Support',
                  'Standard Processing'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-cyan-600 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-neutral-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    required
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75 group-hover:opacity-100"></div>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="relative w-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 hover:from-purple-600 hover:via-pink-600 hover:to-cyan-600 text-white font-semibold py-3 border-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        {isTrial ? 'Start Free Trial' : 'Create Account'}
                        <Sparkles className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="text-center text-sm text-gray-400">
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
