import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Scale, CreditCard, Shield, AlertTriangle, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
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
            <FileText className="w-4 h-4 mr-2" />
            Legal Terms & Conditions
          </Badge>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Terms of <span className="text-neon">Service</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Please read these terms carefully before using AEON's AI video generation platform.
          </p>

          <div className="mt-8 text-gray-500">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            <p>Effective date: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        {/* Terms Content */}
        <div className="max-w-4xl mx-auto space-y-8">

          {/* Acceptance of Terms */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Scale className="w-6 h-6 text-purple-400" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>
                By accessing and using AEON's AI video generation platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p>
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <FileText className="w-6 h-6 text-cyan-400" />
                2. Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>AEON provides AI-powered video generation services that allow users to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Generate videos from text descriptions</li>
                <li>Create professional video content using AI technology</li>
                <li>Access various AI models for video creation</li>
                <li>Download and use generated content</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue the service at any time without notice.
              </p>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Mail className="w-6 h-6 text-purple-400" />
                3. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>For questions about these Terms of Service, contact us:</p>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Email: <a href="mailto:legal@aeon.ai" className="text-purple-400 hover:text-purple-300">legal@aeon.ai</a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-cyan-400" />
                  Support: <a href="mailto:support@aeon.ai" className="text-cyan-400 hover:text-cyan-300">support@aeon.ai</a>
                </p>
              </div>

              <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                <h4 className="text-white font-semibold mb-2">AEON AI Video Platform</h4>
                <p className="text-sm">
                  These terms constitute the entire agreement between you and AEON regarding the use of our service.
                  We may update these terms from time to time, and continued use constitutes acceptance of new terms.
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
