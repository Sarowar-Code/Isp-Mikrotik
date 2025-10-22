"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, Globe, Package, Plus, Wifi, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SubscriptionPlanData {
  planName: string;
  planType: "starter" | "professional" | "enterprise" | "custom";
  description: string;
  limits: {
    maxPPPUsers: string;
    maxResellers: string;
    maxRouters: string;
    maxAdmins: string;
  };
  pricing: {
    amount: string;
    currency: string;
    billingCycle: "monthly" | "yearly";
  };
  features: {
    apiAccess: boolean;
    customBranding: boolean;
    prioritySupport: boolean;
    advancedAnalytics: boolean;
    whiteLabel: boolean;
    customIntegrations: boolean;
    dedicatedSupport: boolean;
    slaGuarantee: boolean;
  };
  trialInfo: {
    isTrial: boolean;
    trialDays: string;
  };
  status: "active" | "inactive" | "trial";
}

export default function CreateSubscriptionPlanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SubscriptionPlanData>({
    planName: "",
    planType: "starter",
    description: "",
    limits: {
      maxPPPUsers: "",
      maxResellers: "",
      maxRouters: "",
      maxAdmins: "1",
    },
    pricing: {
      amount: "",
      currency: "USD",
      billingCycle: "monthly",
    },
    features: {
      apiAccess: false,
      customBranding: false,
      prioritySupport: false,
      advancedAnalytics: false,
      whiteLabel: false,
      customIntegrations: false,
      dedicatedSupport: false,
      slaGuarantee: false,
    },
    trialInfo: {
      isTrial: false,
      trialDays: "14",
    },
    status: "active",
  });

  const handleInputChange = (field: keyof SubscriptionPlanData, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (
    section: keyof SubscriptionPlanData,
    field: string,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...(prev[section] as Record<string, unknown>),
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Here you would call your API to create the subscription plan
      console.log("Creating subscription plan:", formData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      alert("Subscription plan created successfully!");
      router.push("/superadmin/subscriptions/planlist");
    } catch (error) {
      console.error("Failed to create subscription plan:", error);
      alert("Failed to create subscription plan. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Basic details about the SaaS subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  placeholder="e.g., Professional"
                  value={formData.planName}
                  onChange={(e) =>
                    handleInputChange("planName", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="planType">Plan Type *</Label>
                <Select
                  value={formData.planType}
                  onValueChange={(value) => handleInputChange("planType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the target audience and key benefits of this plan"
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SaaS Platform Limits */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Platform Limits
            </CardTitle>
            <CardDescription>
              Set limits for users, resellers, and routers for this plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <Label htmlFor="maxPPPUsers">Max PPP Users *</Label>
                <Input
                  id="maxPPPUsers"
                  type="number"
                  placeholder="500 (or -1 for unlimited)"
                  value={formData.limits.maxPPPUsers}
                  onChange={(e) =>
                    handleNestedChange("limits", "maxPPPUsers", e.target.value)
                  }
                  required
                />
                <div className="text-xs text-muted-foreground">
                  Use -1 for unlimited
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxResellers">Max Resellers</Label>
                <Input
                  id="maxResellers"
                  type="number"
                  placeholder="10 (or -1 for unlimited)"
                  value={formData.limits.maxResellers}
                  onChange={(e) =>
                    handleNestedChange("limits", "maxResellers", e.target.value)
                  }
                />
                <div className="text-xs text-muted-foreground">
                  Use -1 for unlimited
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxRouters">Max Routers *</Label>
                <Input
                  id="maxRouters"
                  type="number"
                  placeholder="3 (or -1 for unlimited)"
                  value={formData.limits.maxRouters}
                  onChange={(e) =>
                    handleNestedChange("limits", "maxRouters", e.target.value)
                  }
                  required
                />
                <div className="text-xs text-muted-foreground">
                  Use -1 for unlimited
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxAdmins">Max Admins</Label>
                <Input
                  id="maxAdmins"
                  type="number"
                  placeholder="1"
                  value={formData.limits.maxAdmins}
                  onChange={(e) =>
                    handleNestedChange("limits", "maxAdmins", e.target.value)
                  }
                />
                <div className="text-xs text-muted-foreground">
                  Usually 1 per subscription
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Information
            </CardTitle>
            <CardDescription>
              Set the pricing and billing cycle for this plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Price Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="29"
                  value={formData.pricing.amount}
                  onChange={(e) =>
                    handleNestedChange("pricing", "amount", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Select
                  value={formData.pricing.currency}
                  onValueChange={(value) =>
                    handleNestedChange("pricing", "currency", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="BDT">BDT (৳)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingCycle">Billing Cycle *</Label>
                <Select
                  value={formData.pricing.billingCycle}
                  onValueChange={(value) =>
                    handleNestedChange("pricing", "billingCycle", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select billing cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SaaS Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              SaaS Features
            </CardTitle>
            <CardDescription>
              Configure the features included in this subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="apiAccess"
                  checked={formData.features.apiAccess}
                  onChange={(e) =>
                    handleNestedChange("features", "apiAccess", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="apiAccess">API Access</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="customBranding"
                  checked={formData.features.customBranding}
                  onChange={(e) =>
                    handleNestedChange("features", "customBranding", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="customBranding">Custom Branding</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="prioritySupport"
                  checked={formData.features.prioritySupport}
                  onChange={(e) =>
                    handleNestedChange("features", "prioritySupport", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="prioritySupport">Priority Support</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="advancedAnalytics"
                  checked={formData.features.advancedAnalytics}
                  onChange={(e) =>
                    handleNestedChange("features", "advancedAnalytics", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="advancedAnalytics">Advanced Analytics</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="whiteLabel"
                  checked={formData.features.whiteLabel}
                  onChange={(e) =>
                    handleNestedChange("features", "whiteLabel", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="whiteLabel">White Label</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="customIntegrations"
                  checked={formData.features.customIntegrations}
                  onChange={(e) =>
                    handleNestedChange("features", "customIntegrations", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="customIntegrations">Custom Integrations</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="dedicatedSupport"
                  checked={formData.features.dedicatedSupport}
                  onChange={(e) =>
                    handleNestedChange("features", "dedicatedSupport", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="dedicatedSupport">Dedicated Support</Label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="slaGuarantee"
                  checked={formData.features.slaGuarantee}
                  onChange={(e) =>
                    handleNestedChange("features", "slaGuarantee", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="slaGuarantee">SLA Guarantee</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trial Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Trial Configuration
            </CardTitle>
            <CardDescription>
              Configure trial settings for this subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isTrial"
                  checked={formData.trialInfo.isTrial}
                  onChange={(e) =>
                    handleNestedChange("trialInfo", "isTrial", e.target.checked)
                  }
                  className="rounded"
                />
                <Label htmlFor="isTrial">Enable Free Trial</Label>
              </div>
              {formData.trialInfo.isTrial && (
                <div className="space-y-2">
                  <Label htmlFor="trialDays">Trial Duration (Days)</Label>
                  <Input
                    id="trialDays"
                    type="number"
                    placeholder="14"
                    value={formData.trialInfo.trialDays}
                    onChange={(e) =>
                      handleNestedChange("trialInfo", "trialDays", e.target.value)
                    }
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>


        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push("/superadmin/subscriptions/planlist")
                }
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="min-w-[150px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Creating Plan...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create Plan
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
