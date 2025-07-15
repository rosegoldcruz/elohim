"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CreditCard, Download, Calendar, Zap, Crown } from "lucide-react"

const plans = [
  {
    name: "AEON Pro",
    price: "$29.99",
    credits: "1,000",
    features: ["HD 1080p Quality", "1,000 credits/month", "Basic Analytics", "Email Support"],
    current: true,
  },
  {
    name: "AEON Creator",
    price: "$59.99",
    credits: "3,000",
    features: ["4K Ultra HD", "3,000 credits/month", "Priority Support", "Voice Cloning"],
    current: false,
  },
  {
    name: "AEON Studio",
    price: "$149.99",
    credits: "8,000",
    features: ["All Creator Features", "White-label", "Dedicated Support", "Custom Integrations"],
    current: false,
  },
]

const transactions = [
  {
    id: 1,
    description: "Professional Plan - Monthly",
    amount: "$79.00",
    date: "2024-01-15",
    status: "Paid",
    invoice: "INV-001",
  },
  {
    id: 2,
    description: "Additional Credits (50)",
    amount: "$25.00",
    date: "2024-01-10",
    status: "Paid",
    invoice: "INV-002",
  },
  {
    id: 3,
    description: "Professional Plan - Monthly",
    amount: "$79.00",
    date: "2023-12-15",
    status: "Paid",
    invoice: "INV-003",
  },
]

export default function BillingPage() {
  const creditsUsed = 75
  const creditsTotal = 100
  const creditPercentage = (creditsUsed / creditsTotal) * 100

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
          Billing & Usage
        </h1>
        <p className="text-neutral-400">Manage your subscription and monitor credit usage</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Current Plan & Usage */}
        <div className="lg:col-span-2 space-y-6">
          {/* Current Plan */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-400" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">Professional Plan</h3>
                  <p className="text-neutral-400">100 credits per month</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">$79</div>
                  <p className="text-sm text-neutral-400">per month</p>
                </div>
              </div>

              <div className="flex gap-4">
                <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                  Upgrade Plan
                </Button>
                <Button variant="outline" className="border-white/20 hover:bg-white/10">
                  Change Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Credit Usage */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Credit Usage</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">{creditsTotal - creditsUsed} credits remaining</span>
                <span className="text-sm text-neutral-400">
                  {creditsUsed} / {creditsTotal} used
                </span>
              </div>
              <Progress
                value={creditPercentage}
                className="w-full [&>*]:bg-gradient-to-r [&>*]:from-purple-500 [&>*]:to-cyan-500"
              />
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Resets on Feb 15, 2024</span>
                <span>{creditPercentage.toFixed(0)}% used</span>
              </div>
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold">
                <Zap className="mr-2 h-4 w-4" />
                Buy More Credits
              </Button>
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-cyan-400" />
                Billing History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-500/20 text-green-400">{transaction.status}</Badge>
                        <span className="text-sm text-neutral-400">{transaction.invoice}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-neutral-500">
                        <Calendar className="h-3 w-3" />
                        {transaction.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{transaction.amount}</div>
                      <Button size="sm" variant="ghost" className="text-xs">
                        <Download className="mr-1 h-3 w-3" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Available Plans */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Available Plans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    plan.current
                      ? "border-purple-500/50 bg-purple-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{plan.name}</h3>
                      {plan.current && <Badge className="bg-purple-500/20 text-purple-400">Current</Badge>}
                    </div>

                    <div className="text-2xl font-bold">
                      {plan.price}
                      <span className="text-sm font-normal text-neutral-400">/month</span>
                    </div>

                    <div className="text-sm text-neutral-400">{plan.credits} credits/month</div>

                    <ul className="space-y-1 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="text-neutral-300">
                          • {feature}
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={`w-full ${
                        plan.current
                          ? "bg-gray-600 hover:bg-gray-700"
                          : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                      }`}
                      disabled={plan.current}
                    >
                      {plan.current ? "Current Plan" : "Upgrade"}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
