import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import Header from "@/components/header"
import { Toaster } from "sonner"
import AnimatedBackground from "@/components/animated-background"
import PerformanceOptimizer from "@/components/performance-optimizer"

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
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white min-h-screen overflow-x-hidden`}>
        <PerformanceOptimizer />
        {/* This div ensures the pure black background */}
        <div className="relative min-h-screen w-full bg-black">
          <AnimatedBackground /> {/* Canvas is fixed, z-index -10, transparent bg */}
          <Header />
          <main className="relative z-10 pt-24">{children}</main>
        </div>
        <Toaster position="top-right" theme="dark" />
      </body>
    </html>
  )
}
