import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, Eye, Lock, Database, Mail, Phone, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-20">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <Button variant="outline" asChild className="glass-intense border-white/20 text-white hover:bg-white/10">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>

          <Badge className="mb-6 bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-white text-sm px-6 py-3 rounded-full backdrop-blur-xl">
            <Shield className="w-4 h-4 mr-2" />
            Privacy & Data Protection
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Privacy <span className="text-neon">Policy</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Your privacy is important to us. This policy explains how AEON collects, uses, and protects your information.
          </p>

          <div className="mt-8 text-gray-500">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Effective date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Privacy Policy Content */}
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Information We Collect */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Database className="w-6 h-6 text-purple-400" />
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Personal Information</h4>
                <p>When you create an account or use our services, we may collect:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>Name and email address</li>
                  <li>Payment information (processed securely through Stripe)</li>
                  <li>Profile information and preferences</li>
                  <li>Communication history with our support team</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Usage Information</h4>
                <p>We automatically collect information about how you use AEON:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>Videos created and generation history</li>
                  <li>Feature usage and preferences</li>
                  <li>Device information and IP address</li>
                  <li>Browser type and operating system</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Eye className="w-6 h-6 text-cyan-400" />
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>We use your information to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide and improve our AI video generation services</li>
                <li>Process payments and manage your account</li>
                <li>Send important updates about your account and our services</li>
                <li>Provide customer support and respond to your inquiries</li>
                <li>Analyze usage patterns to enhance user experience</li>
                <li>Comply with legal obligations and prevent fraud</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Protection */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Lock className="w-6 h-6 text-green-400" />
                3. Data Protection & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>We implement industry-standard security measures to protect your data:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Encryption of data in transit and at rest</li>
                <li>Secure cloud infrastructure with regular security audits</li>
                <li>Limited access to personal data on a need-to-know basis</li>
                <li>Regular security training for our team members</li>
                <li>Compliance with GDPR, CCPA, and other privacy regulations</li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Shield className="w-6 h-6 text-pink-400" />
                4. Data Sharing & Third Parties
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>We may share your information with:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>Service Providers:</strong> Stripe for payments, Supabase for data storage, Vercel for hosting</li>
                <li><strong>AI Partners:</strong> OpenAI, Replicate for video generation (data is processed securely)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
              <p className="mt-4 text-sm bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                <strong>Note:</strong> We never sell your personal data to third parties for marketing purposes.
              </p>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Eye className="w-6 h-6 text-yellow-400" />
                5. Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Access and download your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>Request data portability</li>
                <li>Object to certain data processing activities</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, contact us at{" "}
                <a href="mailto:privacy@aeon.ai" className="text-purple-400 hover:text-purple-300">
                  privacy@aeon.ai
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Mail className="w-6 h-6 text-blue-400" />
                6. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>If you have questions about this Privacy Policy or our data practices, contact us:</p>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Email: <a href="mailto:privacy@aeon.ai" className="text-purple-400 hover:text-purple-300">privacy@aeon.ai</a>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-cyan-400" />
                  Support: <a href="mailto:support@aeon.ai" className="text-cyan-400 hover:text-cyan-300">support@aeon.ai</a>
                </p>
              </div>

              <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <h4 className="text-white font-semibold mb-2">AEON AI Video Platform</h4>
                <p className="text-sm">
                  This privacy policy applies to all AEON services and platforms.
                  We may update this policy from time to time, and we'll notify you of significant changes.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Back to Home */}
        <div className="text-center mt-16">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
