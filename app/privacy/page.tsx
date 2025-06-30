import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="max-w-4xl mx-auto py-16 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button variant="outline" asChild className="mb-6 border-white/20 text-white hover:bg-white/10">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <h1 className="text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-gray-300 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 space-y-8 text-white">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">1. Information We Collect</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                generate videos, or contact us for support.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email address and account information</li>
                <li>Video generation requests and preferences</li>
                <li>Payment and billing information</li>
                <li>Usage data and analytics</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">2. How We Use Your Information</h2>
            <div className="space-y-4 text-gray-300">
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and improve our AI video generation services</li>
                <li>Process payments and manage your account</li>
                <li>Send you important updates and notifications</li>
                <li>Analyze usage patterns to enhance user experience</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">3. Information Sharing</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy.
              </p>
              <p>
                We may share information with trusted service providers who assist us in operating 
                our platform, conducting business, or serving users.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">4. Data Security</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                We implement appropriate security measures to protect your personal information 
                against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                Your data is encrypted in transit and at rest using industry-standard protocols.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">5. Your Rights</h2>
            <div className="space-y-4 text-gray-300">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of marketing communications</li>
                <li>Request a copy of your data</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">6. Contact Us</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-400/30">
                <p className="text-purple-300">
                  Email: privacy@aeon.video<br />
                  Address: [Your Company Address]
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex gap-4 justify-center text-sm text-gray-400">
            <Link href="/terms" className="hover:text-gray-300">Terms of Service</Link>
            <Link href="/auth/login" className="hover:text-gray-300">Sign In</Link>
            <Link href="/sign-up" className="hover:text-gray-300">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
