import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ClerkProvider } from '@clerk/nextjs';
import { SupabaseProvider } from '@/lib/supabase/provider';
import Header from "@/components/header"
import { Toaster } from "@/components/ui/toaster"
import AnimatedBackground from "@/components/animated-background"
import PerformanceOptimizer from "@/components/performance-optimizer"
import { CSPostHogProvider } from "@/lib/analytics/posthog"
import PageViewTracker from "@/components/analytics/page-view-tracker"
import { Suspense } from "react"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "The AEON - Advanced Efficient Optimized Network",
  description: "High-performance AI video platform for exceptional business outcomes.",
  generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white min-h-screen overflow-x-hidden`}>
        {clerkPublishableKey ? (
          <ClerkProvider publishableKey={clerkPublishableKey}>
            <SupabaseProvider>
              <CSPostHogProvider>
                <Suspense fallback={null}>
                  <PageViewTracker />
                </Suspense>
                <PerformanceOptimizer />
                {/* This div ensures the pure black background */}
                <div className="relative min-h-screen w-full bg-black">
                  <AnimatedBackground /> {/* Canvas is fixed, z-index -10, transparent bg */}
                  <Header />
                  <main className="relative z-10 pt-24">{children}</main>
                </div>
                <Toaster />
              </CSPostHogProvider>
            </SupabaseProvider>
          </ClerkProvider>
        ) : (
          <SupabaseProvider>
            <CSPostHogProvider>
              <Suspense fallback={null}>
                <PageViewTracker />
              </Suspense>
              <PerformanceOptimizer />
              {/* This div ensures the pure black background */}
              <div className="relative min-h-screen w-full bg-black">
                <AnimatedBackground /> {/* Canvas is fixed, z-index -10, transparent bg */}
                <Header />
                <main className="relative z-10 pt-24">{children}</main>
              </div>
              <Toaster />
            </CSPostHogProvider>
          </SupabaseProvider>
        )}
      </body>
    </html>
  )
}
