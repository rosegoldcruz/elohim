"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, MessageCircle, Book, Video, Send, Clock, CheckCircle } from "lucide-react"

const tickets = [
  {
    id: "TICK-001",
    subject: "Video generation stuck at 90%",
    status: "Open",
    statusColor: "bg-blue-500/20 text-blue-400",
    priority: "High",
    created: "2024-01-15",
  },
  {
    id: "TICK-002",
    subject: "Credit usage question",
    status: "Resolved",
    statusColor: "bg-green-500/20 text-green-400",
    priority: "Low",
    created: "2024-01-12",
  },
]

const faqs = [
  {
    question: "How long does video generation take?",
    answer: "Video generation typically takes 2-5 minutes depending on length and quality settings.",
  },
  {
    question: "What video formats are supported?",
    answer: "We support MP4, MOV, and WebM formats with various quality options from HD to 4K.",
  },
  {
    question: "How do credits work?",
    answer: "Credits are consumed based on video length, quality, and AI model used. Basic videos use 3-5 credits.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes, you can cancel anytime from the billing page. Your access continues until the end of the billing period.",
  },
]

export default function SupportPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 mb-2">
          Support & Help
        </h1>
        <p className="text-neutral-400">Get help with your AEON experience</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Support Request */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-purple-400" />
                Submit Support Request
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <Input placeholder="Brief description of your issue" className="bg-white/5 border-white/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <Select>
                    <SelectTrigger className="bg-white/5 border-white/20">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/20">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="account">Account Issue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="Please provide detailed information about your issue..."
                  className="bg-white/5 border-white/20 min-h-[120px] resize-none"
                />
              </div>

              <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                <Send className="mr-2 h-4 w-4" />
                Submit Request
              </Button>
            </CardContent>
          </Card>

          {/* My Tickets */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle>My Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ticket.id}</span>
                        <Badge className={ticket.statusColor}>
                          {ticket.status === "Open" ? (
                            <Clock className="mr-1 h-3 w-3" />
                          ) : (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          )}
                          {ticket.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-neutral-400">{ticket.created}</span>
                    </div>
                    <p className="font-medium mb-1">{ticket.subject}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-neutral-400">Priority: {ticket.priority}</span>
                      <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Resources */}
        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Quick Help</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start border-white/20 hover:bg-white/10">
                <Book className="mr-2 h-4 w-4" />
                Documentation
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/20 hover:bg-white/10">
                <Video className="mr-2 h-4 w-4" />
                Video Tutorials
              </Button>
              <Button variant="outline" className="w-full justify-start border-white/20 hover:bg-white/10">
                <MessageCircle className="mr-2 h-4 w-4" />
                Live Chat
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-cyan-400" />
                FAQ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {faqs.map((faq, index) => (
                <div key={index} className="space-y-2">
                  <p className="font-medium text-sm">{faq.question}</p>
                  <p className="text-xs text-neutral-400">{faq.answer}</p>
                  {index < faqs.length - 1 && <hr className="border-white/10" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
