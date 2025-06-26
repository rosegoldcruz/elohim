import type React from "react"
import type { Metadata } from "next"
import ClientAppLayout from "./client-layout"

export const metadata: Metadata = {
  title: "AEON Dashboard",
  description: "AI Video Platform Dashboard",
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientAppLayout>{children}</ClientAppLayout>
}
