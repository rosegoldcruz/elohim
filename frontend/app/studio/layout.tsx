import { requireAuth } from '@/lib/auth'
import { StudioNav } from '@/components/studio-nav'

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAuth()

  return (
    <div className="min-h-screen bg-black">
      <StudioNav />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
