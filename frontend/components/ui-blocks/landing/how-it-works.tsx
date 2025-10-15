import { Card } from "@/components/ui/card"
import { ArrowRight, Router, Package, Users, Zap } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Router,
    title: "Connect MikroTik Routers",
    description: "Add your MikroTik routers using RouterOS API credentials. Our system automatically discovers and configures your network infrastructure.",
    color: "bg-blue-500"
  },
  {
    step: "02",
    icon: Package,
    title: "Create Packages & Plans",
    description: "Define bandwidth packages, pricing plans, and subscription tiers. Set up automated billing cycles and payment processing.",
    color: "bg-green-500"
  },
  {
    step: "03",
    icon: Users,
    title: "Set Up Admin Hierarchy",
    description: "Create your organizational structure with Super Admins, Admins, and Resellers. Assign roles and permissions for each level.",
    color: "bg-purple-500"
  },
  {
    step: "04",
    icon: Zap,
    title: "Automate Operations",
    description: "Let the system handle user provisioning, billing, monitoring, and customer management automatically. Focus on growing your business.",
    color: "bg-orange-500"
  }
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            How It Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get your ISP management system up and running in four simple steps. 
            From setup to automation, we make it easy.
          </p>
        </div>

        <div className="relative">
          {/* Desktop Flow */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-4 gap-8">
              {steps.map((step, index) => {
                const IconComponent = step.icon
                return (
                  <div key={index} className="relative">
                    <Card className="p-6 text-center hover:shadow-lg transition-shadow duration-300">
                      <div className="space-y-4">
                        <div className="flex flex-col items-center space-y-3">
                          <div className={`w-16 h-16 rounded-full ${step.color} flex items-center justify-center text-white`}>
                            <IconComponent className="h-8 w-8" />
                          </div>
                          <div className="text-sm font-bold text-muted-foreground">
                            STEP {step.step}
                          </div>
                        </div>
                        <h3 className="text-xl font-semibold">{step.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </Card>
                    
                    {/* Arrow between steps */}
                    {index < steps.length - 1 && (
                      <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                        <div className="w-8 h-8 bg-background border-2 border-primary rounded-full flex items-center justify-center">
                          <ArrowRight className="h-4 w-4 text-primary" />
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile Flow */}
          <div className="lg:hidden space-y-6">
            {steps.map((step, index) => {
              const IconComponent = step.icon
              return (
                <div key={index} className="relative">
                  <Card className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center text-white flex-shrink-0`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="text-xs font-bold text-muted-foreground">
                          STEP {step.step}
                        </div>
                        <h3 className="text-lg font-semibold">{step.title}</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                  
                  {/* Arrow between steps */}
                  {index < steps.length - 1 && (
                    <div className="flex justify-center py-2">
                      <ArrowRight className="h-5 w-5 text-primary rotate-90" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground bg-muted px-4 py-2 rounded-full">
            <span>⚡</span>
            <span>Setup takes less than 30 minutes</span>
          </div>
        </div>
      </div>
    </section>
  )
}
