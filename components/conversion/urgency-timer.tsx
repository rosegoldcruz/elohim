"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Zap } from 'lucide-react'

interface UrgencyTimerProps {
  title?: string
  subtitle?: string
  endTime?: Date
  className?: string
}

export default function UrgencyTimer({ 
  title = "Next Cohort Starts Soon",
  subtitle = "Only 23 spots remaining",
  endTime,
  className = ""
}: UrgencyTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })

  useEffect(() => {
    // Default to 2 days from now if no endTime provided
    const targetTime = endTime || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const distance = targetTime.getTime() - now

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-red-600/20 via-orange-600/20 to-yellow-600/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-xl ${className}`}
    >
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-red-400">
          <Clock className="h-5 w-5 animate-pulse" />
          <span className="font-semibold">{title}</span>
        </div>
        
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Days', value: timeLeft.days },
            { label: 'Hours', value: timeLeft.hours },
            { label: 'Minutes', value: timeLeft.minutes },
            { label: 'Seconds', value: timeLeft.seconds }
          ].map((item, index) => (
            <motion.div
              key={item.label}
              animate={{ scale: item.label === 'Seconds' ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 1, repeat: item.label === 'Seconds' ? Infinity : 0 }}
              className="bg-black/50 rounded-xl p-3 border border-white/10"
            >
              <div className="text-2xl font-bold text-white">
                {item.value.toString().padStart(2, '0')}
              </div>
              <div className="text-xs text-neutral-400 uppercase tracking-wide">
                {item.label}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 text-yellow-400">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">{subtitle}</span>
        </div>
      </div>
    </motion.div>
  )
}
