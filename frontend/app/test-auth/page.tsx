'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const { user, isLoading, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Signing up...')
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Check your email for verification link!')
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('Signing in...')
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Signed in successfully!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-md mx-auto">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Supabase Auth Test</CardTitle>
            <CardDescription className="text-gray-400">
              Test the Elohim Supabase connection
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-900/20 border border-green-500/30 rounded">
                  <h3 className="text-green-400 font-semibold">Authenticated!</h3>
                  <p className="text-sm text-gray-300">Email: {user.email}</p>
                  <p className="text-sm text-gray-300">ID: {user.id}</p>
                </div>
                <Button onClick={signOut} variant="outline" className="w-full">
                  Sign Out
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-gray-800 border-gray-600 text-white"
                  required
                />
                <div className="flex gap-2">
                  <Button type="submit" className="flex-1">
                    Sign In
                  </Button>
                  <Button type="button" onClick={handleSignUp} variant="outline" className="flex-1">
                    Sign Up
                  </Button>
                </div>
              </form>
            )}
            
            {message && (
              <div className="p-3 bg-blue-900/20 border border-blue-500/30 rounded">
                <p className="text-sm text-blue-300">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
