import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Check, Star, Zap, Crown, Phone } from "lucide-react"

const plans = [
  {
    name: "Starter",
    price: 29,
    description: "Perfect for small ISPs getting started",
    icon: Zap,
    popular: false,
    features: [
      "Up to 500 PPP users",
      "3 MikroTik routers",
      "Basic billing system",
      "Email support",
      "Standard dashboard",
      "User management tools",
      "Basic reporting"
    ]
  },
  {
    name: "Professional",
    price: 79,
    description: "Ideal for growing ISP businesses",
    icon: Star,
    popular: true,
    features: [
      "Up to 2,000 PPP users",
      "10 MikroTik routers",
      "Advanced billing & invoicing",
      "Multi-reseller support",
      "Priority support",
      "Custom branding",
      "Advanced analytics",
      "API access",
      "Bulk operations"
    ]
  },
  {
    name: "Enterprise",
    price: 199,
    description: "For large-scale ISP operations",
    icon: Crown,
    popular: false,
    features: [
      "Unlimited PPP users",
      "Unlimited routers",
      "White-label solution",
      "Full API access",
      "Dedicated support",
      "Custom integrations",
      "Advanced monitoring",
      "SLA guarantees",
      "Custom features"
    ]
  },
  {
    name: "Custom",
    price: null,
    description: "Tailored solutions for enterprise needs",
    icon: Phone,
    popular: false,
    features: [
      "Custom user limits",
      "On-premise deployment",
      "Custom development",
      "Dedicated infrastructure",
      "24/7 phone support",
      "Training & onboarding",
      "Custom SLA",
      "Priority feature requests"
    ]
  }
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the perfect plan for your ISP business. All plans include core features 
            with no hidden fees. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => {
            const IconComponent = plan.icon
            return (
              <Card 
                key={index} 
                className={`relative p-6 ${
                  plan.popular 
                    ? 'border-primary shadow-lg scale-105' 
                    : 'hover:shadow-lg'
                } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center space-y-2">
                    <div className="flex justify-center">
                      <div className={`p-3 rounded-lg ${
                        plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <IconComponent className="h-6 w-6" />
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="text-center">
                    {plan.price ? (
                      <div className="space-y-1">
                        <div className="text-4xl font-bold">
                          ${plan.price}
                          <span className="text-lg font-normal text-muted-foreground">/month</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Billed monthly
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="text-4xl font-bold">Custom</div>
                        <div className="text-sm text-muted-foreground">
                          Contact for pricing
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start space-x-3">
                        <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-primary hover:bg-primary/90' 
                        : ''
                    }`}
                    variant={plan.popular ? "default" : "secondary"}
                  >
                    {plan.price ? 'Start Free Trial' : 'Contact Sales'}
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center space-y-4">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>14-day free trial</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>No setup fees</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>24/7 support</span>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground">
            All plans include SSL certificates, daily backups, and 99.9% uptime SLA.
          </p>
        </div>
      </div>
    </section>
  )
}
