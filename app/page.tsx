"use client"
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <main className="bg-black text-white flex flex-col items-center justify-center h-screen">
      <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-fuchsia-500 text-transparent bg-clip-text">
        AEON
      </h1>
      <p className="mt-4 text-lg text-gray-400">Cinematic AI Video Operating System</p>
      <button
        onClick={() => router.push("/studio")}
        className="mt-8 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-400 text-white font-semibold shadow-lg hover:scale-105 transition"
      >
        Enter Studio
      </button>
    </main>
  )
}
