import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Scale, CreditCard, Shield, AlertTriangle, Mail, ArrowLeft, User, DollarSign, Copyright, Gavel, Users, Zap } from "lucide-react"
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
              <p className="text-sm bg-purple-900/20 p-4 rounded-lg border border-purple-500/30">
                <strong>Important:</strong> These terms constitute a legally binding agreement between you and AEON. 
                Continued use of our service indicates your acceptance of these terms.
              </p>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Zap className="w-6 h-6 text-cyan-400" />
                2. Service Description
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>AEON provides AI-powered video generation services that allow users to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Generate videos from text descriptions and prompts</li>
                <li>Create professional video content using advanced AI technology</li>
                <li>Access various AI models and video generation capabilities</li>
                <li>Download, edit, and use generated content</li>
                <li>Access premium features through subscription plans</li>
                <li>Collaborate with other users on video projects</li>
              </ul>
              <p>
                We reserve the right to modify, suspend, or discontinue the service at any time without notice.
              </p>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <User className="w-6 h-6 text-green-400" />
                3. User Accounts & Registration
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>To access certain features of AEON, you must create an account. You agree to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your account information to keep it accurate</li>
                <li>Protect your account credentials and not share them with others</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
                <li>Be at least 18 years old or have parental consent to use our service</li>
              </ul>
              <p className="text-sm bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                <strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account. 
                We are not liable for any loss or damage arising from unauthorized access to your account.
              </p>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <DollarSign className="w-6 h-6 text-yellow-400" />
                4. Payment Terms & Subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Subscription Plans</h4>
                <p>AEON offers various subscription plans with different features and pricing:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>Free tier with limited features and generation credits</li>
                  <li>Premium plans with enhanced features and higher limits</li>
                  <li>Enterprise plans for business users</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Payment Processing</h4>
                <ul className="list-disc list-inside space-y-2">
                  <li>All payments are processed securely through Stripe</li>
                  <li>Subscriptions are billed automatically on a recurring basis</li>
                  <li>Prices are subject to change with 30 days notice</li>
                  <li>Refunds are handled according to our refund policy</li>
                  <li>Failed payments may result in service suspension</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Cancellation</h4>
                <p>You may cancel your subscription at any time through your account settings. 
                Cancellation will take effect at the end of your current billing period.</p>
              </div>
            </CardContent>
          </Card>

          {/* Acceptable Use */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Shield className="w-6 h-6 text-pink-400" />
                5. Acceptable Use Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>You agree not to use AEON to:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Generate content that is illegal, harmful, or violates any laws</li>
                <li>Create content that infringes on intellectual property rights</li>
                <li>Generate hate speech, harassment, or discriminatory content</li>
                <li>Create content that is sexually explicit or inappropriate</li>
                <li>Attempt to reverse engineer or hack our systems</li>
                <li>Use automated tools to access our service excessively</li>
                <li>Share or distribute generated content that violates these terms</li>
              </ul>
              <p className="text-sm bg-red-900/20 p-4 rounded-lg border border-red-500/30">
                <strong>Violation Consequences:</strong> Violation of these terms may result in account suspension, 
                termination, or legal action as appropriate.
              </p>
            </CardContent>
          </Card>

          {/* Intellectual Property */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Copyright className="w-6 h-6 text-blue-400" />
                6. Intellectual Property Rights
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Your Content</h4>
                <p>You retain ownership of content you create using AEON, subject to these terms:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>You grant us a license to use your content for service improvement</li>
                  <li>You are responsible for ensuring you have rights to use any input content</li>
                  <li>You may use generated content for commercial purposes</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">Our Platform</h4>
                <p>AEON's platform, technology, and content are protected by intellectual property laws:</p>
                <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                  <li>Our software, algorithms, and technology remain our property</li>
                  <li>You may not copy, modify, or distribute our platform</li>
                  <li>Our branding and trademarks are protected</li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold mb-2">AI Models</h4>
                <p>We use various AI models and technologies. Usage is subject to the respective model providers' terms.</p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Shield className="w-6 h-6 text-purple-400" />
                7. Privacy & Data Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>Your privacy is important to us. Our data practices are governed by our Privacy Policy:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>We collect and process data as described in our Privacy Policy</li>
                <li>We implement appropriate security measures to protect your data</li>
                <li>We may use your data to improve our services and provide support</li>
                <li>You have rights regarding your personal data as outlined in our Privacy Policy</li>
              </ul>
              <p className="mt-4">
                For detailed information about our data practices, please review our{" "}
                <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                  Privacy Policy
                </Link>
                .
              </p>
            </CardContent>
          </Card>

          {/* Limitations of Liability */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <AlertTriangle className="w-6 h-6 text-orange-400" />
                8. Limitations of Liability
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>To the maximum extent permitted by law:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>AEON is provided "as is" without warranties of any kind</li>
                <li>We are not liable for any indirect, incidental, or consequential damages</li>
                <li>Our total liability is limited to the amount you paid for our service</li>
                <li>We are not responsible for content generated by our AI systems</li>
                <li>We do not guarantee uninterrupted or error-free service</li>
              </ul>
              <p className="text-sm bg-orange-900/20 p-4 rounded-lg border border-orange-500/30">
                <strong>Important:</strong> Some jurisdictions do not allow liability limitations, 
                so these limitations may not apply to you.
              </p>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Gavel className="w-6 h-6 text-red-400" />
                9. Termination
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>Either party may terminate this agreement:</p>
              <ul className="list-disc list-inside space-y-2">
                <li><strong>By You:</strong> Cancel your account at any time through your account settings</li>
                <li><strong>By Us:</strong> If you violate these terms or for any other reason with 30 days notice</li>
                <li><strong>Immediate Termination:</strong> For serious violations of these terms</li>
              </ul>
              <p>Upon termination:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Your access to the service will cease</li>
                <li>We may delete your account and associated data</li>
                <li>You may lose access to generated content</li>
                <li>Provisions that survive termination will remain in effect</li>
              </ul>
            </CardContent>
          </Card>

          {/* Governing Law */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Scale className="w-6 h-6 text-indigo-400" />
                10. Governing Law & Disputes
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>These terms are governed by the laws of the jurisdiction where AEON operates.</p>
              <p>Any disputes will be resolved through:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Good faith negotiations between parties</li>
                <li>Mediation if negotiations fail</li>
                <li>Legal proceedings in the appropriate jurisdiction if necessary</li>
              </ul>
              <p className="text-sm bg-indigo-900/20 p-4 rounded-lg border border-indigo-500/30">
                <strong>Class Action Waiver:</strong> You agree to resolve disputes individually and waive any right to participate in class actions.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <FileText className="w-6 h-6 text-teal-400" />
                11. Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>We may update these terms from time to time:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>We will notify you of significant changes via email or in-app notification</li>
                <li>Continued use of our service after changes constitutes acceptance</li>
                <li>You may reject changes by discontinuing use of our service</li>
                <li>The most current version will always be available on our website</li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card className="depth-card hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <Mail className="w-6 h-6 text-purple-400" />
                12. Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="text-gray-300 space-y-4">
              <p>For questions about these Terms of Service, contact us:</p>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" />
                  Legal: <a href="mailto:legal@aeon.ai" className="text-purple-400 hover:text-purple-300">legal@aeon.ai</a>
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
