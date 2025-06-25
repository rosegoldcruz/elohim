'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MarketingPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/growth')
  }, [router])

  return null
}
