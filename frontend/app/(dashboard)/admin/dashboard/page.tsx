"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Bell,
  TrendingUp,
  Users,
  Router,
  DollarSign,
  Activity,
} from "lucide-react";

// Chart data for revenue/activity
const chartData = [
  { month: "January", revenue: 4500, clients: 186 },
  { month: "February", revenue: 5200, clients: 205 },
  { month: "March", revenue: 4800, clients: 197 },
  { month: "April", revenue: 6100, clients: 243 },
  { month: "May", revenue: 7300, clients: 289 },
  { month: "June", revenue: 6800, clients: 267 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--chart-1))",
  },
  clients: {
    label: "Clients",
    color: "hsl(var(--chart-2))",
  },
};

// Notice board data
interface Notice {
  id: number;
  title: string;
  description: string;
  date: string;
  priority: "high" | "medium" | "low";
}

const notices: Notice[] = [
  {
    id: 1,
    title: "Network Upgrade Completed",
    description:
      "The network infrastructure upgrade has been successfully completed. All routers are now running the latest firmware.",
    date: "2025-10-26",
    priority: "high",
  },
  {
    id: 2,
    title: "New Bandwidth Package Available",
    description:
      "Introducing our new 100Mbps package at competitive rates. Update your offerings to attract more clients.",
    date: "2025-10-25",
    priority: "medium",
  },
  {
    id: 3,
    title: "Payment Gateway Maintenance",
    description:
      "Scheduled maintenance on payment gateway this Sunday 1:00 AM - 3:00 AM. Online payments will be temporarily unavailable.",
    date: "2025-10-24",
    priority: "high",
  },
  {
    id: 4,
    title: "Monthly Billing Cycle Reminder",
    description:
      "Monthly billing cycle ends in 5 days. Ensure all client payments are collected and recorded in the system.",
    date: "2025-10-23",
    priority: "medium",
  },
  {
    id: 5,
    title: "New Feature: Automated Reports",
    description:
      "You can now generate automated monthly reports for client usage and revenue. Check the Reports section for details.",
    date: "2025-10-22",
    priority: "low",
  },
  {
    id: 6,
    title: "Router Monitoring Alert",
    description:
      "Enable router monitoring alerts to get notified when any router goes offline. Configure in Settings > Notifications.",
    date: "2025-10-20",
    priority: "low",
  },
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Stats Cards */}
      <div className="grid auto-rows-min gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Clients
            </CardDescription>
            <CardTitle className="text-3xl">289</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Router className="h-4 w-4" />
              Active Routers
            </CardDescription>
            <CardTitle className="text-3xl">8</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">All online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Monthly Revenue
            </CardDescription>
            <CardTitle className="text-3xl">৳6.8K</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Active Sessions
            </CardDescription>
            <CardTitle className="text-3xl">234</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">81% utilization</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Resellers
            </CardDescription>
            <CardTitle className="text-3xl">15</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">+3 this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue & Client Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue & Client Growth
          </CardTitle>
          <CardDescription>
            Monthly revenue and client acquisition trends for the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[350px]">
            <AreaChart accessibilityLayer data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={{ strokeDasharray: "3 3" }}
                content={<ChartTooltipContent indicator="dot" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Area
                dataKey="revenue"
                type="natural"
                fill="var(--color-revenue)"
                fillOpacity={0.3}
                stroke="var(--color-revenue)"
                strokeWidth={2}
              />
              <Area
                dataKey="clients"
                type="natural"
                fill="var(--color-clients)"
                fillOpacity={0.3}
                stroke="var(--color-clients)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Notice Board */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notice Board
          </CardTitle>
          <CardDescription>
            Important announcements and updates for your business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notices.map((notice) => (
              <div
                key={notice.id}
                className="border-l-4 pl-4 py-3 rounded-r-lg transition-colors hover:bg-muted/50"
                style={{
                  borderLeftColor:
                    notice.priority === "high"
                      ? "hsl(var(--destructive))"
                      : notice.priority === "medium"
                        ? "hsl(var(--chart-2))"
                        : "hsl(var(--muted-foreground))",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm">{notice.title}</h4>
                      <Badge
                        variant={
                          notice.priority === "high"
                            ? "destructive"
                            : notice.priority === "medium"
                              ? "default"
                              : "secondary"
                        }
                        className="text-xs"
                      >
                        {notice.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notice.description}
                    </p>
                  </div>
                  <time className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(notice.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </time>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
