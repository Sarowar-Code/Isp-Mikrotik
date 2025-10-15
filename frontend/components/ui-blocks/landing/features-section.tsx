import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Monitor,
  Network,
  Palette,
  Settings,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Multi-Tier Management",
    description:
      "Hierarchical system: Super Admin → Admin → Reseller → End Users. Complete control over your ISP business structure.",
    color: "text-blue-500",
  },
  {
    icon: Network,
    title: "MikroTik RouterOS API",
    description:
      "Direct integration with MikroTik routers. Manage PPPoE/Hotspot users, bandwidth, and configurations seamlessly.",
    color: "text-green-500",
  },
  {
    icon: CreditCard,
    title: "Automated Billing",
    description:
      "Subscription plans, automated invoicing, payment processing, and revenue tracking all in one place.",
    color: "text-purple-500",
  },
  {
    icon: Monitor,
    title: "Real-time Monitoring",
    description:
      "Monitor router status, user activity, bandwidth usage, and network performance in real-time.",
    color: "text-orange-500",
  },
  {
    icon: Settings,
    title: "Bulk User Management",
    description:
      "Create, modify, and manage thousands of users with bulk operations. Package assignments made simple.",
    color: "text-red-500",
  },
  {
    icon: Palette,
    title: "White-label Solutions",
    description:
      "Custom branding, personalized dashboards, and branded customer portals for your ISP business.",
    color: "text-indigo-500",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-16 lg:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            Everything You Need to Run Your ISP
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Powerful features designed specifically for internet service
            providers. From user management to billing automation, we&apos;ve
            got you covered.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card
                key={index}
                className="p-6 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <Separator />
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-16 pt-16 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-primary">
                500+
              </div>
              <div className="text-sm text-muted-foreground">ISPs Trust Us</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-secondary">
                1M+
              </div>
              <div className="text-sm text-muted-foreground">Users Managed</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-orange-500">
                99.9%
              </div>
              <div className="text-sm text-muted-foreground">Uptime SLA</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl md:text-4xl font-bold text-purple-500">
                24/7
              </div>
              <div className="text-sm text-muted-foreground">Support</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
