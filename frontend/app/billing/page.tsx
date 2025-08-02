import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CreditCard, Download, Calendar, DollarSign, CheckCircle, AlertCircle } from "lucide-react";

const billingHistory = [
  {
    date: "March 15, 2024",
    amount: "$99.00",
    status: "Paid",
    description: "Pro Plan - Monthly"
  },
  {
    date: "February 15, 2024",
    amount: "$99.00",
    status: "Paid",
    description: "Pro Plan - Monthly"
  },
  {
    date: "January 15, 2024",
    amount: "$99.00",
    status: "Paid",
    description: "Pro Plan - Monthly"
  }
];

export default function BillingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a23] via-[#1a1a3a] to-[#2a2a4a]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Billing & Subscription</h1>
          <p className="text-gray-300">Manage your subscription and view billing history</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="glass-effect rounded-2xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Current Plan</h2>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">Pro Plan</h3>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      Active
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-3">$99.00/month</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-300">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Unlimited videos
                    </div>
                    <div className="flex items-center text-gray-300">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      4K quality exports
                    </div>
                    <div className="flex items-center text-gray-300">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                      Priority support
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Next billing</span>
                    <span className="text-white">April 15, 2024</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Payment method</span>
                    <span className="text-white">•••• •••• •••• 4242</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button className="flex-1 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 text-white">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Update Payment
                  </Button>
                  <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Billing History */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="glass-effect rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Billing History</h2>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              <div className="space-y-4">
                {billingHistory.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-fuchsia-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{item.description}</p>
                        <p className="text-gray-400 text-sm">{item.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{item.amount}</p>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm">{item.status}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Payment Methods</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-6 h-6 text-gray-400" />
                      <div>
                        <p className="text-white font-medium">Visa ending in 4242</p>
                        <p className="text-gray-400 text-sm">Expires 12/25</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                      Default
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
} 