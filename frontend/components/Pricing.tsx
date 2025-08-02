"use client";

import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for creators getting started",
    features: [
      "5 videos per month",
      "HD quality exports",
      "Basic AI templates",
      "Email support",
      "720p resolution"
    ],
    popular: false,
    gradient: "from-gray-500 to-gray-600"
  },
  {
    name: "Pro",
    price: "$99",
    period: "/month",
    description: "For professional creators and teams",
    features: [
      "Unlimited videos",
      "4K quality exports",
      "Advanced AI models",
      "Priority support",
      "Custom branding",
      "Team collaboration",
      "Analytics dashboard"
    ],
    popular: true,
    gradient: "from-fuchsia-500 to-purple-600"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations and agencies",
    features: [
      "Everything in Pro",
      "Custom AI training",
      "Dedicated support",
      "API access",
      "White-label solution",
      "Custom integrations",
      "SLA guarantee"
    ],
    popular: false,
    gradient: "from-blue-500 to-indigo-600"
  }
];

export function Pricing() {
  return (
    <section className="py-24 bg-gradient-to-b from-[#a100ff]/20 to-[#a100ff]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-white">Simple, Transparent</span>
            <br />
            <span className="text-fuchsia-400">Pricing</span>
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Choose the perfect plan for your creative needs. Start free and scale as you grow.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className={`relative ${plan.popular ? 'md:-mt-4' : ''}`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Most Popular
                  </div>
                </div>
              )}
              
              <div className={`bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 h-full ${plan.popular ? 'border-2 border-white/40' : ''}`}>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-300 mb-6">{plan.description}</p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-white/80 ml-1">{plan.period}</span>
                  </div>
                </div>

                                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80">{feature}</span>
                      </li>
                    ))}
                  </ul>

                                  <SignInButton mode="modal">
                    <Button 
                      className={`w-full ${
                        plan.popular 
                          ? 'bg-white text-[#ff007f] hover:bg-gray-100' 
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      }`}
                    >
                      {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                    </Button>
                  </SignInButton>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-white mb-8">
              Frequently Asked Questions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Can I cancel anytime?</h4>
                <p className="text-white/80">Yes, you can cancel your subscription at any time with no cancellation fees.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">What payment methods do you accept?</h4>
                <p className="text-white/80">We accept all major credit cards, PayPal, and bank transfers for enterprise plans.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Is there a free trial?</h4>
                <p className="text-white/80">Yes, all plans come with a 14-day free trial. No credit card required.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-white mb-2">Do you offer refunds?</h4>
                <p className="text-white/80">We offer a 30-day money-back guarantee for all paid plans.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 