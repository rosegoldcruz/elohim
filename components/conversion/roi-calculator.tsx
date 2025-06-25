"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, DollarSign, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ROICalculatorProps {
  className?: string
}

export default function ROICalculator({ className = "" }: ROICalculatorProps) {
  const [monthlyRevenue, setMonthlyRevenue] = useState(10000)
  const [contentHours, setContentHours] = useState(40)
  const [marketingSpend, setMarketingSpend] = useState(5000)
  const [results, setResults] = useState({
    timeSaved: 0,
    costSaved: 0,
    revenueIncrease: 0,
    roi: 0
  })

  useEffect(() => {
    // Calculate ROI based on inputs
    const hourlyRate = 100 // Average marketing hourly rate
    const timeSavedHours = contentHours * 0.8 // 80% time savings
    const costSaved = timeSavedHours * hourlyRate
    const revenueIncrease = monthlyRevenue * 0.3 // 30% average increase
    const aeonCost = 97 // Monthly cost
    const totalSavings = costSaved + revenueIncrease
    const roi = ((totalSavings - aeonCost) / aeonCost) * 100

    setResults({
      timeSaved: timeSavedHours,
      costSaved,
      revenueIncrease,
      roi
    })
  }, [monthlyRevenue, contentHours, marketingSpend])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-teal-600/20 border border-green-500/30 rounded-2xl p-6 backdrop-blur-xl ${className}`}
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Calculator className="h-6 w-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">ROI Calculator</h3>
          </div>
          <p className="text-sm text-neutral-400">See your potential savings with AEON</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Monthly Revenue</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="number"
                value={monthlyRevenue}
                onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-green-500"
                placeholder="10000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Content Hours/Month</label>
            <input
              type="number"
              value={contentHours}
              onChange={(e) => setContentHours(Number(e.target.value))}
              className="w-full px-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-green-500"
              placeholder="40"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Marketing Spend</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="number"
                value={marketingSpend}
                onChange={(e) => setMarketingSpend(Number(e.target.value))}
                className="w-full pl-10 pr-4 py-2 bg-black/50 border border-white/20 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:border-green-500"
                placeholder="5000"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-black/50 rounded-xl p-4 text-center border border-white/10"
          >
            <div className="text-2xl font-bold text-green-400">
              {results.timeSaved.toFixed(0)}h
            </div>
            <div className="text-xs text-neutral-400">Time Saved</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-black/50 rounded-xl p-4 text-center border border-white/10"
          >
            <div className="text-2xl font-bold text-blue-400">
              ${results.costSaved.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-400">Cost Saved</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-black/50 rounded-xl p-4 text-center border border-white/10"
          >
            <div className="text-2xl font-bold text-purple-400">
              ${results.revenueIncrease.toLocaleString()}
            </div>
            <div className="text-xs text-neutral-400">Revenue Boost</div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="bg-black/50 rounded-xl p-4 text-center border border-white/10"
          >
            <div className="text-2xl font-bold text-yellow-400">
              {results.roi.toFixed(0)}%
            </div>
            <div className="text-xs text-neutral-400">ROI</div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-3">
            <Zap className="h-6 w-6 text-yellow-400" />
            <div className="flex-1">
              <p className="font-semibold text-white">
                Total Monthly Savings: ${(results.costSaved + results.revenueIncrease).toLocaleString()}
              </p>
              <p className="text-sm text-neutral-400">
                That's {((results.costSaved + results.revenueIncrease) / 97).toFixed(1)}x your AEON investment
              </p>
            </div>
          </div>
        </motion.div>

        <Button className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3">
          <TrendingUp className="h-4 w-4 mr-2" />
          Start Saving Now - Free Trial
        </Button>
      </div>
    </motion.div>
  )
}
