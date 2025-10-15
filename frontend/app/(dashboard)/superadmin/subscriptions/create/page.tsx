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
  description: string;
  bandwidth: {
    download: string;
    upload: string;
    unit: "Kbps" | "Mbps" | "Gbps";
  };
  pricing: {
    amount: string;
    currency: string;
    billingCycle: "daily" | "weekly" | "monthly" | "yearly";
  };
  features: {
    dataLimit: string;
    dataLimitUnit: "MB" | "GB" | "TB" | "unlimited";
    validityDays: string;
    simultaneousUsers: string;
    priority: "low" | "medium" | "high";
  };
  mikrotikSettings: {
    queueType: string;
    burstLimit: string;
    burstThreshold: string;
    burstTime: string;
  };
  status: "active" | "inactive";
}

export default function CreateSubscriptionPlanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<SubscriptionPlanData>({
    planName: "",
    description: "",
    bandwidth: {
      download: "",
      upload: "",
      unit: "Mbps",
    },
    pricing: {
      amount: "",
      currency: "BDT",
      billingCycle: "monthly",
    },
    features: {
      dataLimit: "",
      dataLimitUnit: "GB",
      validityDays: "",
      simultaneousUsers: "1",
      priority: "medium",
    },
    mikrotikSettings: {
      queueType: "default-small",
      burstLimit: "",
      burstThreshold: "",
      burstTime: "",
    },
    status: "active",
  });

  const handleInputChange = (field: keyof SubscriptionPlanData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (
    section: keyof SubscriptionPlanData,
    field: string,
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
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
              Basic details about the subscription plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="planName">Plan Name *</Label>
                <Input
                  id="planName"
                  placeholder="e.g., Premium 50 Mbps"
                  value={formData.planName}
                  onChange={(e) =>
                    handleInputChange("planName", e.target.value)
                  }
                  required
                />
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
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the features and benefits of this plan"
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

        {/* Bandwidth Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Bandwidth Configuration
            </CardTitle>
            <CardDescription>
              Set download and upload speed limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="download">Download Speed *</Label>
                <Input
                  id="download"
                  type="number"
                  placeholder="50"
                  value={formData.bandwidth.download}
                  onChange={(e) =>
                    handleNestedChange("bandwidth", "download", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upload">Upload Speed *</Label>
                <Input
                  id="upload"
                  type="number"
                  placeholder="25"
                  value={formData.bandwidth.upload}
                  onChange={(e) =>
                    handleNestedChange("bandwidth", "upload", e.target.value)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Speed Unit *</Label>
                <Select
                  value={formData.bandwidth.unit}
                  onValueChange={(value) =>
                    handleNestedChange("bandwidth", "unit", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kbps">Kbps</SelectItem>
                    <SelectItem value="Mbps">Mbps</SelectItem>
                    <SelectItem value="Gbps">Gbps</SelectItem>
                  </SelectContent>
                </Select>
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
                  placeholder="1500"
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
                    <SelectItem value="BDT">BDT (৳)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
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
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="yearly">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Plan Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Plan Features
            </CardTitle>
            <CardDescription>
              Configure data limits, validity, and other features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dataLimit">Data Limit</Label>
                <Input
                  id="dataLimit"
                  type="number"
                  placeholder="100"
                  value={formData.features.dataLimit}
                  onChange={(e) =>
                    handleNestedChange("features", "dataLimit", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataLimitUnit">Data Unit</Label>
                <Select
                  value={formData.features.dataLimitUnit}
                  onValueChange={(value) =>
                    handleNestedChange("features", "dataLimitUnit", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MB">MB</SelectItem>
                    <SelectItem value="GB">GB</SelectItem>
                    <SelectItem value="TB">TB</SelectItem>
                    <SelectItem value="unlimited">Unlimited</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="validityDays">Validity (Days) *</Label>
                <Input
                  id="validityDays"
                  type="number"
                  placeholder="30"
                  value={formData.features.validityDays}
                  onChange={(e) =>
                    handleNestedChange(
                      "features",
                      "validityDays",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="simultaneousUsers">Simultaneous Users *</Label>
                <Input
                  id="simultaneousUsers"
                  type="number"
                  placeholder="1"
                  value={formData.features.simultaneousUsers}
                  onChange={(e) =>
                    handleNestedChange(
                      "features",
                      "simultaneousUsers",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Priority Level *</Label>
                <Select
                  value={formData.features.priority}
                  onValueChange={(value) =>
                    handleNestedChange("features", "priority", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MikroTik Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              MikroTik Configuration
            </CardTitle>
            <CardDescription>
              Advanced MikroTik RouterOS settings for this plan
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="queueType">Queue Type</Label>
                <Select
                  value={formData.mikrotikSettings.queueType}
                  onValueChange={(value) =>
                    handleNestedChange("mikrotikSettings", "queueType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select queue type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default-small">Default Small</SelectItem>
                    <SelectItem value="ethernet-default">
                      Ethernet Default
                    </SelectItem>
                    <SelectItem value="wireless-default">
                      Wireless Default
                    </SelectItem>
                    <SelectItem value="synchronous-default">
                      Synchronous Default
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="burstLimit">Burst Limit</Label>
                <Input
                  id="burstLimit"
                  placeholder="e.g., 100M/50M"
                  value={formData.mikrotikSettings.burstLimit}
                  onChange={(e) =>
                    handleNestedChange(
                      "mikrotikSettings",
                      "burstLimit",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burstThreshold">Burst Threshold</Label>
                <Input
                  id="burstThreshold"
                  placeholder="e.g., 80M/40M"
                  value={formData.mikrotikSettings.burstThreshold}
                  onChange={(e) =>
                    handleNestedChange(
                      "mikrotikSettings",
                      "burstThreshold",
                      e.target.value
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="burstTime">Burst Time (seconds)</Label>
                <Input
                  id="burstTime"
                  type="number"
                  placeholder="8"
                  value={formData.mikrotikSettings.burstTime}
                  onChange={(e) =>
                    handleNestedChange(
                      "mikrotikSettings",
                      "burstTime",
                      e.target.value
                    )
                  }
                />
              </div>
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
