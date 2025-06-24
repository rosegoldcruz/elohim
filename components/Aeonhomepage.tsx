"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import '@/styles/AeonHomepage.module.css'

export default function AeonHomepage() {
  return (
    <div className="homepage-container bg-black text-white min-h-screen flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-yellow-300 via-green-400 to-purple-500 text-transparent bg-clip-text">
          What If Marketing Wasn't Work — But Wealth?
        </h1>
        <p className="mt-6 text-lg md:text-xl text-neutral-300">
          AEON turns your brand into an autonomous growth engine. No team. No time. No guesswork. Just momentum.
        </p>
        <div className="mt-8 flex flex-col md:flex-row items-center justify-center gap-4">
          <Link href="/studio">
            <Button className="text-lg px-6 py-3 bg-purple-600 hover:bg-purple-700 transition-all shadow-lg">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/launch-ai-campaign">
            <Button variant="outline" className="text-lg px-6 py-3 border-white text-white hover:bg-white hover:text-black transition-all">
              Launch AI Campaign
            </Button>
          </Link>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="mt-24 max-w-4xl text-center"
      >
        <h2 className="text-2xl md:text-4xl font-bold text-yellow-400">
          "A man who stops advertising to save money is like a man who stops a clock to save time."
        </h2>
        <p className="mt-4 text-neutral-400 text-base md:text-lg">
          Henry Ford said it. AEON solves it. You can’t control time — but you can command momentum. With AI-crafted campaigns, psychological design, and real-time optimization, your business runs while you sleep.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="mt-32 w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-10"
      >
        <FeatureCard
          title="Studio Intelligence"
          description="Create viral video funnels trained on $500M+ of social campaign data. No editing. No friction. Just output."
          link="/studio"
        />
        <FeatureCard
          title="AI-First Marketing"
          description="Meta-trained agents run your brand exposure like a 15-person team. Email, TikTok, blogs. Automated."
          link="/marketing"
        />
        <FeatureCard
          title="Trustless Analytics"
          description="AEON doesn’t guess. It predicts. Real-time insights, conversion forecasting, and auto-optimized funnels."
          link="/analytics"
        />
      </motion.div>
    </div>
  )
}

function FeatureCard({ title, description, link }: { title: string; description: string; link: string }) {
  return (
    <Link href={link}>
      <div className="p-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-purple-600/20 transition-all cursor-pointer">
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-sm text-neutral-300">{description}</p>
      </div>
    </Link>
  )
}
