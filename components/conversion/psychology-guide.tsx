'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Target, Users, Clock, Shield, Crown, Zap, TrendingUp, Eye, Heart } from 'lucide-react'

interface PsychologyGuideProps {
  className?: string
}

export default function PsychologyGuide({ className = "" }: PsychologyGuideProps) {
  const psychologyPrinciples = [
    {
      principle: "Loss Aversion",
      description: "People fear losing more than they value gaining",
      implementation: "Time scarcity, limited spots, countdown timers",
      example: "Only 23 spots remaining",
      icon: Clock,
      color: "text-red-400"
    },
    {
      principle: "Social Proof",
      description: "People follow what others are doing",
      implementation: "Live counters, testimonials, user activity feeds",
      example: "10,000+ creators generated $50M+",
      icon: Users,
      color: "text-blue-400"
    },
    {
      principle: "Authority",
      description: "People trust credible sources and experts",
      implementation: "Partner logos, badges, expert quotes",
      example: "Henry Ford quote, SOC2 compliance",
      icon: Shield,
      color: "text-green-400"
    },
    {
      principle: "Scarcity",
      description: "Limited availability increases perceived value",
      implementation: "Exclusive access, limited time offers",
      example: "First 100 users only",
      icon: Crown,
      color: "text-yellow-400"
    },
    {
      principle: "Anchoring",
      description: "First number influences all subsequent judgments",
      implementation: "High-value comparisons, cost savings",
      example: "$10M marketing team vs $97/month",
      icon: Target,
      color: "text-purple-400"
    },
    {
      principle: "Instant Gratification",
      description: "People want immediate results and rewards",
      implementation: "Real-time previews, instant access",
      example: "Results in 10 minutes",
      icon: Zap,
      color: "text-orange-400"
    }
  ]

  const conversionElements = [
    {
      element: "Headlines",
      psychology: "Emotional hooks with specific benefits",
      example: "Turn Ideas Into $10M+ Businesses While You Sleep",
      impact: "First impression determines 80% of engagement"
    },
    {
      element: "CTAs",
      psychology: "Action-oriented with urgency and benefit",
      example: "Claim Your Spot - Only 23 Left",
      impact: "Button psychology can increase conversions 200%+"
    },
    {
      element: "Social Proof",
      psychology: "Herd mentality and validation seeking",
      example: "Live activity feeds, revenue screenshots",
      impact: "Can increase conversions by 15-30%"
    },
    {
      element: "Urgency Timers",
      psychology: "Loss aversion and FOMO activation",
      example: "Countdown to deadline with scarcity messaging",
      impact: "Creates 40-60% conversion lift"
    },
    {
      element: "ROI Calculators",
      psychology: "Logical justification for emotional decision",
      example: "Interactive savings calculator",
      impact: "Helps overcome price objections"
    }
  ]

  return (
    <div className={`space-y-12 ${className}`}>
      {/* Psychology Principles */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">Conversion Psychology Principles</h2>
          </div>
          <p className="text-gray-400">The science behind why AEON converts so effectively</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {psychologyPrinciples.map((principle, index) => (
            <motion.div
              key={principle.principle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <principle.icon className={`h-6 w-6 ${principle.color}`} />
                <h3 className="font-bold text-white">{principle.principle}</h3>
              </div>
              
              <p className="text-gray-300 text-sm">{principle.description}</p>
              
              <div className="space-y-2">
                <div className="text-xs text-gray-400 uppercase tracking-wide">Implementation</div>
                <p className="text-sm text-gray-300">{principle.implementation}</p>
              </div>
              
              <div className="bg-black/30 rounded-lg p-3">
                <div className="text-xs text-gray-400 uppercase tracking-wide mb-1">Example</div>
                <p className={`text-sm font-medium ${principle.color}`}>"{principle.example}"</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Conversion Elements */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <TrendingUp className="h-8 w-8 text-green-400" />
            <h2 className="text-3xl font-bold text-white">Conversion Elements</h2>
          </div>
          <p className="text-gray-400">How each element drives user action</p>
        </div>

        <div className="space-y-6">
          {conversionElements.map((element, index) => (
            <motion.div
              key={element.element}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-cyan-600/10 border border-purple-500/20 rounded-2xl p-6 backdrop-blur-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div>
                  <h3 className="font-bold text-white mb-2">{element.element}</h3>
                  <p className="text-sm text-gray-400">{element.psychology}</p>
                </div>
                
                <div className="lg:col-span-2">
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Example</div>
                  <div className="bg-black/30 rounded-lg p-3">
                    <p className="text-sm text-green-400 font-medium">"{element.example}"</p>
                  </div>
                </div>
                
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wide mb-2">Impact</div>
                  <p className="text-sm text-blue-400 font-medium">{element.impact}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Visual Psychology */}
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Eye className="h-8 w-8 text-cyan-400" />
            <h2 className="text-3xl font-bold text-white">Visual Psychology</h2>
          </div>
          <p className="text-gray-400">Color and layout psychology in action</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border border-yellow-400/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg"></div>
              <h3 className="font-bold text-white">Gold/Orange</h3>
              <p className="text-sm text-gray-300">Wealth, success, premium positioning. Used for branding and high-value elements.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-400/20 to-emerald-500/20 border border-green-400/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg"></div>
              <h3 className="font-bold text-white">Green</h3>
              <p className="text-sm text-gray-300">Growth, money, action. Used for CTAs and positive metrics.</p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-400/20 to-red-600/20 border border-red-400/30 rounded-2xl p-6 backdrop-blur-xl">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-red-600 rounded-lg"></div>
              <h3 className="font-bold text-white">Red</h3>
              <p className="text-sm text-gray-300">Urgency, scarcity, attention. Used for countdown timers and warnings.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Behavioral Triggers */}
      <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-cyan-600/10 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-xl">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-8 w-8 text-pink-400" />
            <h2 className="text-3xl font-bold text-white">Behavioral Triggers</h2>
          </div>
          <p className="text-gray-400 max-w-3xl mx-auto">
            Every element on AEON is designed to trigger specific psychological responses that guide users toward conversion. 
            From the moment they land on the homepage to the final purchase decision, each interaction is optimized using 
            proven behavioral psychology principles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {[
            { trigger: "Curiosity Gap", description: "Headlines that create information gaps", example: "The secret to $10M businesses" },
            { trigger: "Pattern Interrupt", description: "Unexpected elements that grab attention", example: "While You Sleep" },
            { trigger: "Social Validation", description: "Proof that others are succeeding", example: "10,000+ creators" },
            { trigger: "Future Pacing", description: "Helping users visualize success", example: "Your AI Empire" }
          ].map((trigger, index) => (
            <div key={trigger.trigger} className="text-center space-y-2">
              <h4 className="font-semibold text-white">{trigger.trigger}</h4>
              <p className="text-sm text-gray-400">{trigger.description}</p>
              <div className="text-xs text-purple-400 italic">"{trigger.example}"</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
