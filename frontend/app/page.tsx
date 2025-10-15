import { CTASection } from "@/components/ui-blocks/landing/cta-section";
import { FeaturesSection } from "@/components/ui-blocks/landing/features-section";
import { HeroSection } from "@/components/ui-blocks/landing/hero-section";
import { HowItWorksSection } from "@/components/ui-blocks/landing/how-it-works";
import { PricingSection } from "@/components/ui-blocks/landing/pricing-section";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <CTASection />
    </div>
  );
}
