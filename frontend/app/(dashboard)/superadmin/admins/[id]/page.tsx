"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Building2,
  Calendar,
  Globe,
  Mail,
  Phone,
  Router,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// Mock data for a specific admin
const mockAdminDetails = {
  id: "1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  company: "TechCorp ISP",
  status: "active",
  role: "Admin",
  createdAt: "2024-01-15",
  lastLogin: "2024-10-14T10:30:00Z",
  avatar: null,
  address: "123 Tech Street, Silicon Valley, CA 94000",
  description:
    "Leading ISP provider in the Silicon Valley area, specializing in high-speed internet solutions for businesses and residential customers.",
  statistics: {
    totalRouters: 25,
    totalResellers: 12,
    totalUsers: 1847,
    activeUsers: 1652,
    monthlyRevenue: 125000,
    growth: 12.5,
  },
  recentActivity: [
    { action: "Added new router", timestamp: "2024-10-15T09:15:00Z" },
    { action: "Updated reseller package", timestamp: "2024-10-14T16:30:00Z" },
    { action: "Approved new user", timestamp: "2024-10-14T14:20:00Z" },
  ],
};

export default function AdminDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [admin, setAdmin] = useState(mockAdminDetails);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // In a real app, fetch admin details using params.id
    // For now, using mock data
    setLoading(false);
  }, [params.id]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <Activity className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case "inactive":
        return (
          <Badge variant="secondary">
            <Activity className="w-3 h-3 mr-1" />
            Inactive
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-600"
          >
            <Activity className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Routers</CardTitle>
            <Router className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {admin.statistics.totalRouters}
            </div>
            <p className="text-xs text-muted-foreground">
              Active network devices
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Resellers
            </CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {admin.statistics.totalResellers}
            </div>
            <p className="text-xs text-muted-foreground">
              Active reseller accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCheck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {admin.statistics.totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {admin.statistics.activeUsers.toLocaleString()} active users
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              +{admin.statistics.growth}%
            </div>
            <p className="text-xs text-muted-foreground">Monthly user growth</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Admin Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Admin Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={admin.avatar} alt={admin.name} />
                <AvatarFallback className="text-lg">
                  {getInitials(admin.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold">{admin.name}</h3>
                  {getStatusBadge(admin.status)}
                </div>
                <p className="text-sm text-muted-foreground">{admin.role}</p>
                <p className="text-sm">{admin.description}</p>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Email:</span>
                  <span>{admin.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Phone:</span>
                  <span>{admin.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Company:</span>
                  <span>{admin.company}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Joined:</span>
                  <span>{formatDate(admin.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Last Login:</span>
                  <span>{formatDate(admin.lastLogin)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Address:</span>
                  <span className="text-xs">{admin.address}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {admin.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="h-2 w-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                ${admin.statistics.monthlyRevenue.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">Monthly Revenue</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {(
                  (admin.statistics.activeUsers / admin.statistics.totalUsers) *
                  100
                ).toFixed(1)}
                %
              </div>
              <p className="text-sm text-muted-foreground">
                User Activity Rate
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(
                  admin.statistics.totalUsers / admin.statistics.totalRouters
                ).toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground">Users per Router</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
