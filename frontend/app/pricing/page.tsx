"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Crown, Rocket } from "lucide-react"
import { toast } from "sonner"

const plans = [
  {
    name: "AEON STARTER",
    price: "$5.99",
    yearlyPrice: "$59.99",
    credits: "100",
    features: [
      "HD 720p Quality",
      "100 credits one-time",
      "Basic Support",
      "Standard Processing",
      "Watermark Included",
      "Perfect for Testing"
    ],
    popular: false,
    icon: Zap,
    gradient: "from-green-600 to-emerald-600",
    borderGradient: "from-green-500/50 to-emerald-500/50",
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_PASS || "price_1RiUVxL0i8aKDQ0rtsV8jP",
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_PASS || "price_1RiUVxL0i8aKDQ0rtsV8jP"
    }
  },
  {
    name: "AEON PRO",
    price: "$29.99",
    yearlyPrice: "$288.00",
    credits: "1,000",
    features: [
      "HD 1080p Quality",
      "1,000 credits/month",
      "Basic Analytics",
      "Email Support",
      "Standard Processing",
      "Commercial License"
    ],
    popular: true,
    icon: Crown,
    gradient: "from-purple-600 via-pink-600 to-cyan-600",
    borderGradient: "from-purple-500/50 via-pink-500/50 to-cyan-500/50",
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || "price_1ReF56L0i8aKDQ0rZzEwTzVD",
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY || "price_1ReF6DL0i8aKDQ0rV0VJ7tx8"
    }
  },
  {
    name: "AEON CREATOR",
    price: "$59.99",
    yearlyPrice: "$588.00",
    credits: "3,000",
    features: [
      "4K Ultra HD Quality",
      "3,000 credits/month",
      "Advanced Analytics",
      "Priority Support",
      "Voice Cloning",
      "Custom Avatars",
      "API Access",
      "Commercial License"
    ],
    popular: false,
    icon: Zap,
    gradient: "from-blue-600 to-cyan-600",
    borderGradient: "from-blue-500/50 to-cyan-500/50",
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_MONTHLY || "price_1ReF9hL0i8aKDQ0riUb3x64F",
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_CREATOR_YEARLY || "price_1ReFAZL0i8aKDQ0rXHYNfLbw"
    }
  },
  {
    name: "AEON STUDIO",
    price: "$149.99",
    yearlyPrice: "$1,140.00",
    credits: "8,000",
    features: [
      "All Creator Features",
      "8,000 credits/month",
      "White-label Solution",
      "Dedicated Account Manager",
      "Custom Integrations",
      "SLA Guarantee",
      "Advanced Security",
      "Team Collaboration",
      "Priority Rendering"
    ],
    popular: false,
    icon: Rocket,
    gradient: "from-orange-600 to-red-600",
    borderGradient: "from-orange-500/50 to-red-500/50",
    priceIds: {
      monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_MONTHLY || "price_1ReFCML0i8aKDQ0rwmFoSEZP",
      yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_STUDIO_YEARLY || "price_1ReFGlL0i8aKDQ0riqTF84UA"
    }
  },
]

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  const handleSubscribe = (plan: typeof plans[0]) => {
    const priceId = isAnnual ? plan.priceIds.yearly : plan.priceIds.monthly

    // Redirect to Stripe checkout with the correct price ID
    window.location.href = `/api/checkout/subscription?price_id=${priceId}&plan=${plan.name.toLowerCase().replace(' ', '_')}`

    toast.success(`Redirecting to ${plan.name} checkout...`, {
      description: "Secure payment processing with Stripe",
    })
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-16">
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
            onClick={() => setIsAnnual(!isAnnual)}
            aria-label={`Switch to ${isAnnual ? 'monthly' : 'annual'} billing`}
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

        {/* Pricing Cards - All 4 in one row */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => {
          const IconComponent = plan.icon
          const monthlyPrice = Number.parseFloat(plan.price.replace("$", ""))
          const yearlyPrice = Number.parseFloat(plan.yearlyPrice.replace("$", ""))
          const displayPrice = isAnnual ? yearlyPrice : monthlyPrice
          const monthlySavings = isAnnual ? Math.round((monthlyPrice * 12 - yearlyPrice) / 12 * 100) / 100 : 0

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
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white text-center py-1 text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className={plan.popular ? "bg-black/90 rounded-3xl m-0.5" : ""}>
                  <CardHeader className={`text-center ${plan.popular ? "pt-10" : "pt-6"}`}>
                    <div className="flex justify-center mb-4">
                      <div
                        className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center shadow-xl shadow-purple-500/20 group-hover:scale-110 transition-transform duration-500`}
                      >
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                    </div>

                    <CardTitle className="text-xl font-bold mb-2">{plan.name}</CardTitle>
                    <CardDescription className="text-center mb-4">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-3xl font-black text-white">${isAnnual ? yearlyPrice : displayPrice}</span>
                        <span className="text-neutral-400 text-sm">/{isAnnual ? 'year' : 'month'}</span>
                      </div>
                      {isAnnual && (
                        <div className="text-xs text-green-400 mt-1">
                          Save ${monthlySavings}/month
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4 px-6 pb-6">
                    <div className="text-center">
                      <p className="text-sm">
                        <span className="font-bold text-white text-lg">{plan.credits} credits</span>
                        <span className="text-neutral-400"> per month</span>
                      </p>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.slice(0, 5).map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <div
                            className={`h-4 w-4 rounded-full bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}
                          >
                            <Check className="h-2 w-2 text-white" />
                          </div>
                          <span className="text-neutral-300 text-sm">{feature}</span>
                        </li>
                      ))}
                      {plan.features.length > 5 && (
                        <li className="text-neutral-400 text-xs pl-6">
                          +{plan.features.length - 5} more features
                        </li>
                      )}
                    </ul>

                    <div className="relative group">
                      <div className={`absolute inset-0 bg-gradient-to-r ${plan.gradient} rounded-xl blur-lg group-hover:blur-xl transition-all duration-500 opacity-0 group-hover:opacity-75`}></div>
                      <Button
                        onClick={() => handleSubscribe(plan)}
                        className={`relative w-full py-3 text-sm font-semibold rounded-xl shadow-xl transition-all duration-500 transform hover:scale-105 bg-gradient-to-r ${plan.gradient} hover:shadow-2xl ${
                          plan.popular ? "shadow-purple-500/30" : ""
                        }`}
                      >
                        Choose {plan.name}
                      </Button>
                    </div>
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
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-purple-400/30 hover:border-purple-400/60 bg-black/30 backdrop-blur-xl px-12 py-4 text-lg font-semibold rounded-2xl hover:bg-purple-900/10 transition-all duration-500"
            >
              Contact Sales Team
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}
