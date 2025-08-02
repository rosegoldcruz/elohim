'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

export default function TestBackendPage() {
  const [testResult, setTestResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testBackendConnection = async () => {
    setLoading(true)
    setError(null)
    setTestResult(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/api/test`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setTestResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const testHealthCheck = async () => {
    setLoading(true)
    setError(null)
    setTestResult(null)

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      const response = await fetch(`${backendUrl}/health`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      setTestResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Backend Connection Test</h1>
        <p className="text-muted-foreground">
          Test the connection between frontend and backend services
        </p>
      </div>

      <div className="grid gap-6">
        {/* Configuration Info */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Current backend configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Backend URL:</span>
                <Badge variant="outline">
                  {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Environment:</span>
                <Badge variant="outline">
                  {process.env.NODE_ENV || 'development'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Tests</CardTitle>
            <CardDescription>Test different backend endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button 
                onClick={testBackendConnection}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Test API Endpoint
              </Button>
              
              <Button 
                onClick={testHealthCheck}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Test Health Check
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {(testResult || error) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {error ? (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    Connection Failed
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Connection Successful
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {error ? (
                <div className="text-red-600 bg-red-50 p-4 rounded-lg">
                  <strong>Error:</strong> {error}
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-lg">
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
