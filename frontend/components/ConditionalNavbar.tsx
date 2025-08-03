'use client'

import { usePathname } from 'next/navigation'
import { Navbar } from './Navbar'

export function ConditionalNavbar() {
  const pathname = usePathname()
  
  // Don't show the main navbar on studio pages (they have their own StudioNav)
  const isStudioPage = pathname.startsWith('/studio')
  
  if (isStudioPage) {
    return null
  }
  
  return (
    <>
      <Navbar />
      <div className="pt-16" /> {/* Add padding for fixed navbar */}
    </>
  )
}
