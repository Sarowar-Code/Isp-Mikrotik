"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DollarSign,
  Download,
  Edit,
  Eye,
  Filter,
  Globe,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Trash2,
  Zap,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// Mock data for SaaS subscription plans
const mockPlans = [
  {
    id: "1",
    planName: "Starter",
    planType: "starter",
    description: "Perfect for small ISPs getting started",
    limits: {
      maxPPPUsers: 500,
      maxResellers: 2,
      maxRouters: 3,
    },
    usage: {
      currentPPPUsers: 245,
      currentResellers: 1,
      currentRouters: 2,
    },
    pricing: { amount: "29", currency: "USD", billingCycle: "monthly" },
    features: {
      apiAccess: false,
      customBranding: false,
      prioritySupport: false,
      advancedAnalytics: false,
      whiteLabel: false,
    },
    status: "active",
    createdAt: "2024-01-15",
    subscribers: 245,
  },
  {
    id: "2",
    planName: "Professional",
    planType: "professional",
    description: "Ideal for growing ISP businesses",
    limits: {
      maxPPPUsers: 2000,
      maxResellers: 10,
      maxRouters: 10,
    },
    usage: {
      currentPPPUsers: 1189,
      currentResellers: 5,
      currentRouters: 7,
    },
    pricing: { amount: "79", currency: "USD", billingCycle: "monthly" },
    features: {
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
      advancedAnalytics: true,
      whiteLabel: false,
    },
    status: "active",
    createdAt: "2024-02-10",
    subscribers: 1189,
  },
  {
    id: "3",
    planName: "Enterprise",
    planType: "enterprise",
    description: "For large-scale ISP operations",
    limits: {
      maxPPPUsers: -1, // unlimited
      maxResellers: -1, // unlimited
      maxRouters: -1, // unlimited
    },
    usage: {
      currentPPPUsers: 5267,
      currentResellers: 25,
      currentRouters: 45,
    },
    pricing: { amount: "199", currency: "USD", billingCycle: "monthly" },
    features: {
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
      advancedAnalytics: true,
      whiteLabel: true,
    },
    status: "active",
    createdAt: "2024-03-05",
    subscribers: 5267,
  },
  {
    id: "4",
    planName: "Custom",
    planType: "custom",
    description: "Tailored solutions for enterprise needs",
    limits: {
      maxPPPUsers: 10000,
      maxResellers: 50,
      maxRouters: 100,
    },
    usage: {
      currentPPPUsers: 0,
      currentResellers: 0,
      currentRouters: 0,
    },
    pricing: { amount: "0", currency: "USD", billingCycle: "monthly" },
    features: {
      apiAccess: true,
      customBranding: true,
      prioritySupport: true,
      advancedAnalytics: true,
      whiteLabel: true,
    },
    status: "inactive",
    createdAt: "2024-01-20",
    subscribers: 0,
  },
];

export default function SubscriptionPlanListPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Filter and search logic
  const filteredPlans = useMemo(() => {
    return mockPlans.filter((plan) => {
      const matchesSearch =
        plan.planName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.planType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.pricing.amount.includes(searchTerm);

      const matchesStatus =
        statusFilter === "all" || plan.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchTerm, statusFilter]);

  // Statistics
  const stats = useMemo(() => {
    const total = mockPlans.length;
    const active = mockPlans.filter((plan) => plan.status === "active").length;
    const inactive = mockPlans.filter(
      (plan) => plan.status === "inactive"
    ).length;
    const totalSubscribers = mockPlans.reduce(
      (sum, plan) => sum + plan.subscribers,
      0
    );

    return { total, active, inactive, totalSubscribers };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500">
            Active
          </Badge>
        );
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return (
          <Badge variant="default" className="bg-red-500">
            High
          </Badge>
        );
      case "medium":
        return (
          <Badge variant="default" className="bg-yellow-500">
            Medium
          </Badge>
        );
      case "low":
        return (
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            Low
          </Badge>
        );
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const formatLimits = (plan: any) => {
    const formatLimit = (limit: number) =>
      limit === -1 ? "Unlimited" : limit.toLocaleString();
    return {
      users: formatLimit(plan.limits.maxPPPUsers),
      resellers: formatLimit(plan.limits.maxResellers),
      routers: formatLimit(plan.limits.maxRouters),
    };
  };

  const formatUsage = (plan: any) => {
    return {
      users: `${plan.usage.currentPPPUsers}/${
        plan.limits.maxPPPUsers === -1 ? "∞" : plan.limits.maxPPPUsers
      }`,
      resellers: `${plan.usage.currentResellers}/${
        plan.limits.maxResellers === -1 ? "∞" : plan.limits.maxResellers
      }`,
      routers: `${plan.usage.currentRouters}/${
        plan.limits.maxRouters === -1 ? "∞" : plan.limits.maxRouters
      }`,
    };
  };

  const formatPrice = (plan: any) => {
    const symbol =
      plan.pricing.currency === "BDT"
        ? "৳"
        : plan.pricing.currency === "USD"
        ? "$"
        : "€";
    return `${symbol}${plan.pricing.amount}/${plan.pricing.billingCycle}`;
  };

  const formatFeatures = (plan: any) => {
    const activeFeatures = Object.entries(plan.features)
      .filter(([_, value]) => value === true)
      .map(([key, _]) => {
        switch (key) {
          case "apiAccess":
            return "API Access";
          case "customBranding":
            return "Custom Branding";
          case "prioritySupport":
            return "Priority Support";
          case "advancedAnalytics":
            return "Advanced Analytics";
          case "whiteLabel":
            return "White Label";
          default:
            return key;
        }
      });
    return activeFeatures.length > 0
      ? activeFeatures.join(", ")
      : "Basic Features";
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Plans
                </p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Active Plans
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Subscribers
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalSubscribers.toLocaleString()}
                </p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Inactive Plans
                </p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.inactive}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Subscription Plans</CardTitle>
            </div>
            <Button
              onClick={() => router.push("/superadmin/subscriptions/create")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Bar */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search plans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Status: {statusFilter === "all" ? "All" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                    Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          {/* Data Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="text-center">
                  <TableHead className="text-center">Plan Details</TableHead>
                  <TableHead className="text-center">Users</TableHead>
                  <TableHead className="text-center">Resellers</TableHead>
                  <TableHead className="text-center">Routers</TableHead>
                  <TableHead className="text-center">Price</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No subscription plans found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell className="text-center">
                        <div>
                          <div className="font-medium text-base">
                            {plan.planName}
                          </div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {plan.planType} Plan
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {plan.subscribers.toLocaleString()} active
                            subscribers
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-center">
                          <div className="font-medium text-blue-600">
                            {formatLimits(plan).users}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {plan.usage.currentPPPUsers.toLocaleString()} used
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-center">
                          <div className="font-medium text-green-600">
                            {formatLimits(plan).resellers}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {plan.usage.currentResellers} used
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="text-center">
                          <div className="font-medium text-purple-600">
                            {formatLimits(plan).routers}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {plan.usage.currentRouters} used
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="font-medium text-lg">
                          {formatPrice(plan)}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(plan.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/superadmin/subscriptions/${plan.id}`
                                )
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/superadmin/subscriptions/edit/${plan.id}`
                                )
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Plan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Plan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Info */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {filteredPlans.length} of {mockPlans.length} plan(s)
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
