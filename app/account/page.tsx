"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import MainLayout from "@/components/layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { User, CreditCard, Settings, Download, Calendar, Gem } from "lucide-react"
import { useApi } from "@/lib/api"
import { toast } from "sonner"

export default function AccountPage() {
  const [user, setUser] = useState({
    email: "daniel.cruz@aeon.os",
    name: "Daniel Cruz",
    plan: "Professional",
    planStatus: "Active",
    renews: "July 22, 2025",
    creditsUsed: 35,
    creditsTotal: 100,
    joinDate: "January 15, 2024"
  })
  const [loading, setLoading] = useState(true)
  const { getUser, fetchCredits } = useApi()

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userResult = await getUser()
        if (userResult.data) {
          const creditsResult = await fetchCredits(userResult.data.id)
          setUser(prev => ({
            ...prev,
            email: userResult.data!.email,
            name: userResult.data!.name,
            creditsTotal: creditsResult.data || prev.creditsTotal
          }))
        }
      } catch (error) {
        console.error("Failed to load user data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadUserData()
  }, [])

  const creditUsagePercentage = (user.creditsUsed / user.creditsTotal) * 100

  const handleManageSubscription = () => {
    toast.info("Redirecting to billing portal...")
    // TODO: Implement Stripe billing portal
  }

  const handleBuyCredits = () => {
    toast.info("Redirecting to credit purchase...")
    // TODO: Implement credit purchase flow
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-white/10 rounded w-48"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-64 bg-white/5 rounded-xl"></div>
              <div className="h-64 bg-white/5 rounded-xl"></div>
            </div>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8 max-w-6xl"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
            <User className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">My Account</h1>
            <p className="text-neutral-400">Manage your subscription and account settings</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User className="h-5 w-5 text-purple-400" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-neutral-400 mb-2">Full Name</p>
                    <p className="font-medium text-lg">{user.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400 mb-2">Email Address</p>
                    <p className="font-medium text-lg">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400 mb-2">Member Since</p>
                    <p className="font-medium text-lg">{user.joinDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400 mb-2">Account Status</p>
                    <Badge className="bg-green-500/20 text-green-400">Active</Badge>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button variant="outline" className="border-neutral-700 hover:bg-neutral-900/50">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" className="border-neutral-700 hover:bg-neutral-900/50">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Subscription Details */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                  Subscription Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-neutral-400 mb-2">Current Plan</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-lg">{user.plan}</p>
                      <Badge className="bg-purple-500/20 text-purple-400">{user.planStatus}</Badge>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400 mb-2">Next Renewal</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-neutral-400" />
                      <p className="font-medium text-lg">{user.renews}</p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleManageSubscription}
                  variant="outline"
                  className="w-full border-neutral-700 hover:bg-neutral-900/50"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Credit Usage */}
          <div className="space-y-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Gem className="h-5 w-5 text-yellow-400" />
                  Credit Usage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-yellow-400 mb-2">
                    {user.creditsTotal - user.creditsUsed}
                  </div>
                  <p className="text-neutral-400">credits remaining</p>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-400">Used</span>
                    <span className="text-white">{user.creditsUsed} / {user.creditsTotal}</span>
                  </div>
                  <Progress
                    value={creditUsagePercentage}
                    className="w-full h-3 [&>*]:bg-gradient-to-r [&>*]:from-yellow-500 [&>*]:to-orange-500"
                  />
                  <div className="text-center text-xs text-neutral-500">
                    {creditUsagePercentage.toFixed(1)}% used this month
                  </div>
                </div>

                <Button
                  onClick={handleBuyCredits}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold"
                >
                  <Gem className="h-4 w-4 mr-2" />
                  Buy More Credits
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Videos Created</span>
                  <span className="font-semibold">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Total Views</span>
                  <span className="font-semibold">2.3M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Revenue Generated</span>
                  <span className="font-semibold text-green-400">$12,450</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  )
}
