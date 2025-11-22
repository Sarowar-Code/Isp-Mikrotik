"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Network, Play } from "lucide-react";
import Link from "next/link";

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth" });
  }
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-background to-muted/50">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Network className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">CodersKite</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-6">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("pricing")}
              className="text-sm font-medium hover:text-primary transition-colors"
            >
              Pricing
            </button>
            <div className="w-px h-6 bg-border"></div>

            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/login">Admin</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/reseller/login">Reseller</Link>
            </Button>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden flex items-center space-x-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="space-y-3 p-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Navigation
                    </h3>
                    <button
                      onClick={() => scrollToSection("features")}
                      className="block text-left text-base font-medium hover:text-primary transition-colors"
                    >
                      Features
                    </button>
                    <button
                      onClick={() => scrollToSection("how-it-works")}
                      className="block text-left text-base font-medium hover:text-primary transition-colors"
                    >
                      How It Works
                    </button>
                    <button
                      onClick={() => scrollToSection("pricing")}
                      className="block text-left text-base font-medium hover:text-primary transition-colors"
                    >
                      Pricing
                    </button>
                  </div>

                  <div className="border-t p-4 space-y-3">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Login
                    </h3>

                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/admin/login">Admin</Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      asChild
                    >
                      <Link href="/reseller/login">Reseller</Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Automate Your ISP Business with{" "}
                <span className="text-primary">CodersKite</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl">
                Complete ISP management platform with MikroTik RouterOS
                integration. Manage users, bandwidth, billing, and routers from
                one powerful dashboard.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Free Trial
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="text-lg px-8 py-6"
              >
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center space-x-8 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Trusted by 500+ ISPs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>MikroTik Certified</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <Card className="p-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-muted-foreground">
                    ISP Dashboard
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-background/80 p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-primary">
                        2,847
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active Users
                      </div>
                    </div>
                    <div className="bg-background/80 p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-secondary">
                        12
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Routers
                      </div>
                    </div>
                    <div className="bg-background/80 p-4 rounded-lg border">
                      <div className="text-2xl font-bold text-orange-500">
                        98.5%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Uptime
                      </div>
                    </div>
                  </div>

                  <div className="bg-background/80 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        Network Status
                      </span>
                      <span className="text-xs text-green-600">
                        All Systems Operational
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs">Router-01: Online</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs">Router-02: Online</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-xs">Router-03: Online</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
