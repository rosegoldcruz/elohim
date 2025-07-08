'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to Clerk sign-up page
    router.push('/sign-up')
  }, [router])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">Redirecting to Sign Up...</h1>
        <p className="text-gray-400">Please wait while we redirect you to the sign-up page.</p>
      </div>
    </div>
  )
}

