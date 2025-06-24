"use client"

import React, { useState } from "react"
import { motion } from "framer-motion"
import MainLayout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Rocket } from "lucide-react"
import { toast } from "sonner"
import { StartFreeTrialButton, ScheduleDemoButton } from "@/components/action-button"

const plans = [
  {
    name: "Starter",
    price: "$29",
    credits: "25",
    features: ["HD 1080p Quality", "5 Projects", "Basic Analytics", "Email Support", "Standard Processing"],
    popular: false,
    icon: Zap,
    gradient: "from-blue-600 to-cyan-600",
    borderGradient: "from-blue-500/50 to-cyan-500/50",
  },
  {
    name: "Professional",
    price: "$79",
    credits: "100",
    features: [
      "4K Ultra HD Quality",
      "Unlimited Projects",
      "Advanced Analytics",
      "Priority Support",
      "Voice Cloning",
      "Custom Avatars",
      "API Access",
    ],
    popular: true,
    icon: Crown,
    gradient: "from-purple-600 via-pink-600 to-cyan-600",
    borderGradient: "from-purple-500/50 via-pink-500/50 to-cyan-500/50",
  },
  {
    name: "Enterprise",
    price: "$199",
    credits: "500",
    features: [
      "All Pro Features",
      "White-label Solution",
      "Dedicated Account Manager",
      "Custom Integrations",
      "SLA Guarantee",
      "Advanced Security",
      "Team Collaboration",
      "Priority Rendering",
    ],
    popular: false,
    icon: Rocket,
    gradient: "from-orange-600 to-red-600",
    borderGradient: "from-orange-500/50 to-red-500/50",
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  const handleSubscribe = (planName: string) => {
    toast.success(`Redirecting to ${planName} checkout...`, {
      description: "Secure payment processing with Stripe",
    })
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-16"
      >
      {/* Header */}
      <div className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 mb-6">
          Premium Plans
        </h1>
        <p className="text-xl text-neutral-400 max-w-3xl mx-auto font-light mb-8">
          Choose the perfect plan to scale your revenue with The AEON's premium AI video platform
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`text-lg font-medium ${!isAnnual ? "text-white" : "text-neutral-400"}`}>Monthly</span>
          <button
            type="button"
            title="Toggle billing period"
            onClick={() => setIsAnnual(!isAnnual)}
            className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
              isAnnual ? "bg-gradient-to-r from-purple-600 to-cyan-600" : "bg-neutral-600"
            }`}
          >
            <div
              className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 ${
                isAnnual ? "translate-x-9" : "translate-x-1"
              }`}
            />
          </button>
          <span className={`text-lg font-medium ${isAnnual ? "text-white" : "text-neutral-400"}`}>Annual</span>
          {isAnnual && <Badge className="bg-green-500/20 text-green-400 ml-2">Save 20%</Badge>}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const IconComponent = plan.icon
          const monthlyPrice = Number.parseInt(plan.price.replace("$", ""))
          const annualPrice = Math.floor(monthlyPrice * 0.8)
          const displayPrice = isAnnual ? annualPrice : monthlyPrice

          return (
            <div key={plan.name} className="group relative">
              {/* Glow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${plan.borderGradient} rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-700 opacity-0 group-hover:opacity-100`}
              ></div>

              <Card
                className={`relative bg-white/5 border backdrop-blur-xl hover:bg-white/10 transition-all duration-700 transform hover:-translate-y-3 hover:scale-105 rounded-3xl overflow-hidden ${
                  plan.popular ? `border-2 bg-gradient-to-br ${plan.borderGradient} p-0.5` : "border-white/10"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white text-center py-2 text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className={plan.popular ? "bg-black/90 rounded-3xl m-0.5" : ""}>
                  <CardHeader className={`text-center ${plan.popular ? "pt-12" : "pt-8"}`}>
                    <div className="flex justify-center mb-6">
                      <div
                        className={`h-20 w-20 rounded-3xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:scale-110 transition-transform duration-500`}
                      >
                        <IconComponent className="h-10 w-10 text-white" />
                      </div>
                    </div>

                    <CardTitle className="text-3xl font-bold mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-center mb-6">
                      <div className="flex items-baseline justify-center gap-2">
                        <span className="text-5xl font-black text-white">${displayPrice}</span>
                        <span className="text-neutral-400 text-lg">/month</span>
                      </div>
                      {isAnnual && (
                        <div className="text-sm text-green-400 mt-2">
                          Save ${(monthlyPrice - annualPrice) * 12}/year
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6 px-8 pb-8">
                    <div className="text-center">
                      <p className="text-lg">
                        <span className="font-bold text-white text-2xl">{plan.credits} credits</span>
                        <span className="text-neutral-400"> per month</span>
                      </p>
                    </div>

                    <ul className="space-y-4">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <div
                            className={`h-6 w-6 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}
                          >
                            <Check className="h-3 w-3 text-white" />
                          </div>
                          <span className="text-neutral-300 text-lg">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      onClick={() => handleSubscribe(plan.name)}
                      className={`w-full py-4 text-lg font-semibold rounded-2xl shadow-xl transition-all duration-500 transform hover:scale-105 ${
                        plan.popular
                          ? `bg-gradient-to-r ${plan.gradient} hover:shadow-2xl shadow-purple-500/30`
                          : `bg-gradient-to-r ${plan.gradient} hover:shadow-xl`
                      }`}
                    >
                      Choose {plan.name}
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </div>
          )
        })}
      </div>

      {/* Enterprise CTA */}
      <div className="text-center mt-20">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-cyan-600/10 rounded-3xl blur-3xl"></div>
          <div className="relative bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl p-12">
            <h3 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-300">
              Need a Custom Solution?
            </h3>
            <p className="text-xl text-neutral-400 mb-8 max-w-2xl mx-auto">
              Enterprise clients get dedicated support, custom integrations, and white-label solutions
            </p>
            <div className="flex gap-4 justify-center">
              <StartFreeTrialButton size="lg" />
              <ScheduleDemoButton size="lg" />
            </div>
          </div>
        </div>
      </div>
      </motion.div>
    </MainLayout>
  )
}
