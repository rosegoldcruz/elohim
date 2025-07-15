import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Video, Zap, Settings, CreditCard, BarChart3, ExternalLink, Wrench } from 'lucide-react';
import Link from 'next/link';

export default function AeonDocsPage() {
  const docSections = [
    {
      title: "Getting Started",
      description: "Learn the basics of AEON platform",
      icon: <Zap className="h-6 w-6 text-yellow-400" />,
      items: [
        "Quick Start Guide",
        "Account Setup", 
        "First Video Generation",
        "Understanding Credits"
      ],
      status: "Coming Soon"
    },
    {
      title: "Video Generation",
      description: "Master AI video creation",
      icon: <Video className="h-6 w-6 text-blue-400" />,
      items: [
        "Script Writing",
        "Visual Generation", 
        "Audio Integration",
        "Editing & Post-processing"
      ],
      status: "Coming Soon"
    },
    {
      title: "Platform Features",
      description: "Explore all AEON capabilities",
      icon: <Settings className="h-6 w-6 text-purple-400" />,
      items: [
        "Studio Workspace",
        "Project Management",
        "Agent Orchestration", 
        "Rendering Pipeline"
      ],
      status: "Coming Soon"
    },
    {
      title: "Billing & Credits",
      description: "Understand pricing and usage",
      icon: <CreditCard className="h-6 w-6 text-green-400" />,
      items: [
        "Credit System",
        "Subscription Plans",
        "Usage Tracking",
        "Payment Methods"
      ],
      status: "Coming Soon"
    },
    {
      title: "Analytics & Insights", 
      description: "Track performance and optimize",
      icon: <BarChart3 className="h-6 w-6 text-cyan-400" />,
      items: [
        "Video Performance",
        "Engagement Metrics",
        "Cost Analysis",
        "ROI Tracking"
      ],
      status: "Coming Soon"
    },
    {
      title: "API Reference",
      description: "Integrate with AEON programmatically", 
      icon: <BookOpen className="h-6 w-6 text-pink-400" />,
      items: [
        "Authentication",
        "Video Generation API",
        "Webhook Events",
        "SDKs & Libraries"
      ],
      status: "Coming Soon"
    }
  ];

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            AEON Documentation
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Everything you need to know about using the AEON AI video generation platform
          </p>
          
          {/* Status Banner */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <div>
                <h3 className="text-yellow-300 font-semibold">Documentation In Progress</h3>
                <p className="text-yellow-200/80 text-sm">
                  We're currently building comprehensive documentation for the AEON platform. 
                  Check back soon for detailed guides and API references.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Documentation Sections */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {docSections.map((section, index) => (
            <Card key={index} className="bg-black/20 border-white/10 backdrop-blur-xl hover:bg-black/30 transition-all duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {section.icon}
                    <div>
                      <CardTitle className="text-white text-lg">{section.title}</CardTitle>
                      <CardDescription className="text-gray-400 text-sm">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                  <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full">
                    {section.status}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-sm text-gray-300 flex items-center">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-3"></span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-white/20 text-gray-400 hover:bg-white/5 cursor-not-allowed"
                  disabled
                >
                  Coming Soon
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Wrench className="h-6 w-6 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Try DocHarvester</h3>
              </div>
              <p className="text-gray-400 mb-4">
                While we build the AEON docs, try our universal documentation extractor to harvest docs from any website.
              </p>
              <Link href="/docs/harvester">
                <Button className="bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open DocHarvester
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-black/20 border-white/10 backdrop-blur-xl">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BookOpen className="h-6 w-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white">Need Help?</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Can't find what you're looking for? Our support team is here to help you get started.
              </p>
              <div className="flex space-x-3">
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Contact Support
                </Button>
                <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                  Join Community
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
