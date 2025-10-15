"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ArrowRight, Mail, Phone, MessageCircle } from "lucide-react"

export function CTASection() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Here you would integrate with your actual signup API
    console.log("Trial signup for:", email)
    
    setIsSubmitting(false)
    setEmail("")
    
    // Show success message or redirect
    alert("Thank you! We'll be in touch soon to set up your free trial.")
  }

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main CTA */}
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
              Ready to Transform Your ISP Business?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Join hundreds of ISPs who have automated their operations with CodersKite. 
              Start your free trial today and see the difference in 14 days.
            </p>
          </div>

          {/* Trial Signup Form */}
          <Card className="max-w-md mx-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Start Your Free Trial</h3>
                <p className="text-sm text-muted-foreground">
                  No credit card required • 14-day free trial
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-6"
                >
                  {isSubmitting ? (
                    "..."
                  ) : (
                    <>
                      Start Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                By signing up, you agree to our Terms of Service and Privacy Policy
              </p>
            </form>
          </Card>
        </div>

        <Separator className="my-16" />

        {/* Contact Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Email Support</h3>
                <p className="text-sm text-muted-foreground">
                  Get help from our technical team within 24 hours
                </p>
                <Button variant="secondary" size="sm">
                  support@coderskite.com
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Schedule a Demo</h3>
                <p className="text-sm text-muted-foreground">
                  See CodersKite in action with a personalized demo
                </p>
                <Button variant="secondary" size="sm">
                  Book Demo Call
                </Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <MessageCircle className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Live Chat</h3>
                <p className="text-sm text-muted-foreground">
                  Chat with our team for immediate assistance
                </p>
                <Button variant="secondary" size="sm">
                  Start Chat
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Final Trust Signals */}
        <div className="mt-16 text-center space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-sm text-muted-foreground">Happy ISPs</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-secondary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime SLA</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-orange-500">24/7</div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-purple-500">14</div>
              <div className="text-sm text-muted-foreground">Day Free Trial</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t text-center">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-muted-foreground">
              © 2024 CodersKite. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Documentation</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
