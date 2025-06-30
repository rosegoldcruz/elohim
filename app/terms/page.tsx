import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
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
          <h1 className="text-5xl font-bold text-white mb-4">Terms of Service</h1>
          <p className="text-gray-300 text-lg">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 space-y-8 text-white">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">1. Acceptance of Terms</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                By accessing and using AEON's AI video generation platform, you accept and agree to be 
                bound by the terms and provision of this agreement.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">2. Service Description</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                AEON provides AI-powered video generation services that allow users to create videos 
                from text descriptions using advanced machine learning models.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Credit-based video generation system</li>
                <li>Multiple AI model ensemble for video creation</li>
                <li>Account management and billing services</li>
                <li>Customer support and documentation</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">3. User Responsibilities</h2>
            <div className="space-y-4 text-gray-300">
              <p>You agree to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not generate content that violates our content policy</li>
                <li>Respect intellectual property rights</li>
                <li>Maintain the security of your account</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">4. Content Policy</h2>
            <div className="space-y-4 text-gray-300">
              <p>You may not use our service to generate content that:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Is illegal, harmful, or violates any laws</li>
                <li>Infringes on intellectual property rights</li>
                <li>Contains hate speech or discriminatory content</li>
                <li>Depicts violence or explicit material</li>
                <li>Spreads misinformation or false claims</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">5. Payment and Billing</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                Our service operates on a credit-based system. By purchasing credits, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Pay all fees associated with your account</li>
                <li>Provide accurate billing information</li>
                <li>Accept that credits are non-refundable</li>
                <li>Understand that unused credits may expire</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">6. Intellectual Property</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                You retain ownership of the content you create using our service, subject to our 
                license to provide the service. We retain all rights to our platform, technology, 
                and underlying AI models.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">7. Limitation of Liability</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                AEON shall not be liable for any indirect, incidental, special, consequential, or 
                punitive damages resulting from your use of the service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">8. Termination</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                We may terminate or suspend your account at any time for violations of these terms. 
                You may also terminate your account at any time through your account settings.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">9. Contact Information</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                For questions about these Terms of Service, please contact us at:
              </p>
              <div className="bg-purple-500/20 rounded-lg p-4 border border-purple-400/30">
                <p className="text-purple-300">
                  Email: legal@aeon.video<br />
                  Address: [Your Company Address]
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <div className="flex gap-4 justify-center text-sm text-gray-400">
            <Link href="/privacy" className="hover:text-gray-300">Privacy Policy</Link>
            <Link href="/auth/login" className="hover:text-gray-300">Sign In</Link>
            <Link href="/sign-up" className="hover:text-gray-300">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
