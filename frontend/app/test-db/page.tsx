import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function TestDbPage() {
  const supabase = await createClient()
  
  let dbStatus = 'disconnected'
  let tableInfo = null
  let error = null

  try {
    // Test basic connection
    const { data, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (connectionError) {
      dbStatus = 'error'
      error = connectionError.message
    } else {
      dbStatus = 'connected'
    }

    // Try to get table structure info
    try {
      const { data: tableData, error: tableError } = await supabase
        .from('users')
        .select('*')
        .limit(1)
      
      if (!tableError && tableData) {
        tableInfo = {
          exists: true,
          rowCount: tableData.length,
          sampleData: tableData[0] || null
        }
      }
    } catch (e) {
      // Table might not exist yet
      tableInfo = { exists: false }
    }

  } catch (e) {
    dbStatus = 'error'
    error = e instanceof Error ? e.message : 'Unknown error'
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Supabase Database Test</CardTitle>
            <CardDescription className="text-gray-400">
              Testing connection to Elohim Supabase project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Connection Status */}
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${
                dbStatus === 'connected' ? 'bg-green-500' : 
                dbStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className="font-semibold">
                Database Status: <span className="capitalize">{dbStatus}</span>
              </span>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-500/30 rounded">
                <h3 className="text-red-400 font-semibold mb-2">Error Details:</h3>
                <p className="text-sm text-red-300 font-mono">{error}</p>
              </div>
            )}

            {/* Success Info */}
            {dbStatus === 'connected' && (
              <div className="p-4 bg-green-900/20 border border-green-500/30 rounded">
                <h3 className="text-green-400 font-semibold mb-2">✅ Connection Successful!</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
                  <p>• Project: Elohim</p>
                  <p>• Connection method: Server-side client</p>
                </div>
              </div>
            )}

            {/* Table Info */}
            {tableInfo && (
              <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded">
                <h3 className="text-blue-400 font-semibold mb-2">Users Table Info:</h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p>• Table exists: {tableInfo.exists ? '✅ Yes' : '❌ No'}</p>
                  {tableInfo.exists && (
                    <>
                      <p>• Sample row count: {tableInfo.rowCount}</p>
                      {tableInfo.sampleData && (
                        <div className="mt-2">
                          <p className="font-semibold">Sample data structure:</p>
                          <pre className="text-xs bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                            {JSON.stringify(tableInfo.sampleData, null, 2)}
                          </pre>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Instructions */}
            <div className="p-4 bg-gray-800 border border-gray-600 rounded">
              <h3 className="text-gray-300 font-semibold mb-2">Next Steps:</h3>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• If connected: Database integration is working!</li>
                <li>• If users table doesn't exist: Create it in Supabase dashboard</li>
                <li>• Test authentication at <a href="/test-auth" className="text-blue-400 hover:underline">/test-auth</a></li>
                <li>• Check main page for connection status indicator</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
