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
  Download,
  Edit,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Wifi,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

// Mock data for subscription plans
const mockPlans = [
  {
    id: "1",
    planName: "Basic 10 Mbps",
    description: "Perfect for home users with light internet usage",
    bandwidth: { download: "10", upload: "5", unit: "Mbps" },
    pricing: { amount: "800", currency: "BDT", billingCycle: "monthly" },
    features: {
      dataLimit: "100",
      dataLimitUnit: "GB",
      validityDays: "30",
      simultaneousUsers: "1",
      priority: "low",
    },
    status: "active",
    createdAt: "2024-01-15",
    subscribers: 245,
  },
  {
    id: "2",
    planName: "Premium 50 Mbps",
    description: "High-speed internet for power users and small businesses",
    bandwidth: { download: "50", upload: "25", unit: "Mbps" },
    pricing: { amount: "1500", currency: "BDT", billingCycle: "monthly" },
    features: {
      dataLimit: "",
      dataLimitUnit: "unlimited",
      validityDays: "30",
      simultaneousUsers: "3",
      priority: "high",
    },
    status: "active",
    createdAt: "2024-02-10",
    subscribers: 189,
  },
  {
    id: "3",
    planName: "Enterprise 100 Mbps",
    description: "Ultra-fast internet for large businesses and organizations",
    bandwidth: { download: "100", upload: "50", unit: "Mbps" },
    pricing: { amount: "3000", currency: "BDT", billingCycle: "monthly" },
    features: {
      dataLimit: "",
      dataLimitUnit: "unlimited",
      validityDays: "30",
      simultaneousUsers: "10",
      priority: "high",
    },
    status: "active",
    createdAt: "2024-03-05",
    subscribers: 67,
  },
  {
    id: "4",
    planName: "Student 5 Mbps",
    description: "Affordable internet plan for students",
    bandwidth: { download: "5", upload: "2", unit: "Mbps" },
    pricing: { amount: "500", currency: "BDT", billingCycle: "monthly" },
    features: {
      dataLimit: "50",
      dataLimitUnit: "GB",
      validityDays: "30",
      simultaneousUsers: "1",
      priority: "low",
    },
    status: "inactive",
    createdAt: "2024-01-20",
    subscribers: 0,
  },
  {
    id: "5",
    planName: "Gaming Pro 75 Mbps",
    description: "Low latency, high-speed internet optimized for gaming",
    bandwidth: { download: "75", upload: "35", unit: "Mbps" },
    pricing: { amount: "2200", currency: "BDT", billingCycle: "monthly" },
    features: {
      dataLimit: "",
      dataLimitUnit: "unlimited",
      validityDays: "30",
      simultaneousUsers: "5",
      priority: "high",
    },
    status: "active",
    createdAt: "2024-04-12",
    subscribers: 134,
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
        plan.bandwidth.download.includes(searchTerm) ||
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

  const formatBandwidth = (plan: any) => {
    return `${plan.bandwidth.download}/${plan.bandwidth.upload} ${plan.bandwidth.unit}`;
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

  const formatDataLimit = (plan: any) => {
    if (plan.features.dataLimitUnit === "unlimited") {
      return "Unlimited";
    }
    return `${plan.features.dataLimit} ${plan.features.dataLimitUnit}`;
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
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
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Bandwidth</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Data Limit</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      No subscription plans found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{plan.planName}</div>
                          <div className="text-sm text-muted-foreground">
                            {plan.description.length > 50
                              ? `${plan.description.substring(0, 50)}...`
                              : plan.description}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Wifi className="h-3 w-3 text-muted-foreground" />
                          {formatBandwidth(plan)}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(plan)}
                      </TableCell>
                      <TableCell>{formatDataLimit(plan)}</TableCell>
                      <TableCell>
                        {getPriorityBadge(plan.features.priority)}
                      </TableCell>
                      <TableCell>{getStatusBadge(plan.status)}</TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">{plan.subscribers}</div>
                          <div className="text-xs text-muted-foreground">
                            users
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{plan.createdAt}</TableCell>
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
