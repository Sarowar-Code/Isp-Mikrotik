
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { ActivitySquare, Bell, TrendingDown, TrendingUp, User } from "lucide-react";

// Chart data for platform-wide statistics
const chartData = [
  { month: "January", admins: 45, revenue: 12500, subscriptions: 156 },
  { month: "February", admins: 52, revenue: 15200, subscriptions: 178 },
  { month: "March", admins: 48, revenue: 14100, subscriptions: 165 },
  { month: "April", admins: 61, revenue: 18300, subscriptions: 201 },
  { month: "May", admins: 73, revenue: 22400, subscriptions: 245 },
  { month: "June", admins: 68, revenue: 20800, subscriptions: 228 },
];

const chartConfig = {
  admins: {
    label: "Admins",
    color: "hsl(var(--chart-1))",
  },
  revenue: {
    label: "Revenue (K)",
    color: "hsl(var(--chart-2))",
  },
  subscriptions: {
    label: "Subscriptions",
    color: "hsl(var(--chart-3))",
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
    title: "Platform Upgrade Scheduled",
    description:
      "Major platform upgrade scheduled for next Sunday, 12:00 AM - 4:00 AM. All services will be temporarily unavailable during this period.",
    date: "2025-10-28",
    priority: "high",
  },
  {
    id: 2,
    title: "New Admin Tier Pricing Released",
    description:
      "Updated pricing structure for admin subscriptions is now live. Review the new tiers and benefits in the Subscription Plans section.",
    date: "2025-10-27",
    priority: "medium",
  },
  {
    id: 3,
    title: "Security Audit Completed",
    description:
      "Annual security audit has been completed successfully. All systems passed with no critical vulnerabilities found. Report available in Documents.",
    date: "2025-10-26",
    priority: "high",
  },
  {
    id: 4,
    title: "Q4 Performance Review",
    description:
      "Quarterly performance review meeting scheduled for November 5th. All department heads are required to submit their reports by November 1st.",
    date: "2025-10-25",
    priority: "medium",
  },
  {
    id: 5,
    title: "New Feature: Multi-Currency Support",
    description:
      "Platform now supports multiple currencies for international admins. Configure currency settings in System Configuration.",
    date: "2025-10-24",
    priority: "low",
  },
  {
    id: 6,
    title: "Backup System Verification",
    description:
      "Weekly backup verification completed successfully. All data backups are intact and recovery procedures tested.",
    date: "2025-10-23",
    priority: "low",
  },
  {
    id: 7,
    title: "Admin Training Program Launch",
    description:
      "New comprehensive training program for admins is now available. Encourage your team to enroll for advanced features training.",
    date: "2025-10-22",
    priority: "medium",
  },
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export default function SuperAdminDashboardPage() {
  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs">
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="text-lg font-semibold">Total Admins</CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums sm:text-2xl lg:text-3xl">
              1,250
            </CardTitle>
            <CardAction>
              <Badge>
                <User className="size-6" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Trending up this month <TrendingUp className="size-4" />
            </div>
          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="text-lg font-semibold">Active Admins</CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums sm:text-2xl lg:text-3xl">
              1,234
            </CardTitle>
            <CardAction>
              <Badge>
                <ActivitySquare className="size-6" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Down 20% this period <TrendingDown className="size-4" />
            </div>

          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="text-lg font-semibold">Active Routers</CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums sm:text-2xl lg:text-3xl">
              45,678
            </CardTitle>
            <CardAction>
               <Badge>
                <ActivitySquare className="size-6" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Strong user retention <TrendingUp className="size-4" />
            </div>

          </CardFooter>
        </Card>
        <Card className="@container/card">
          <CardHeader>
            <CardDescription className="text-lg font-semibold">Inactive Admins</CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums sm:text-2xl lg:text-3xl">
              4.5%
            </CardTitle>

            <CardAction>
               <Badge>
                <ActivitySquare className="size-6" />
              </Badge>

            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Steady performance increase <TrendingUp className="size-4" />
            </div>


          </CardFooter>
        </Card>
      </div>

      {/* Platform Statistics Chart */}
      {/* <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Platform Statistics
          </CardTitle>
          <CardDescription>
            Platform-wide metrics tracking admins, revenue, and subscriptions
            over the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <LineChart accessibilityLayer data={chartData}>
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
                content={<ChartTooltipContent indicator="line" />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                dataKey="admins"
                type="monotone"
                stroke="var(--color-admins)"
                strokeWidth={3}
                dot={{
                  fill: "var(--color-admins)",
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
              />
              <Line
                dataKey="subscriptions"
                type="monotone"
                stroke="var(--color-subscriptions)"
                strokeWidth={3}
                dot={{
                  fill: "var(--color-subscriptions)",
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
              />
              <Line
                dataKey="revenue"
                type="monotone"
                stroke="var(--color-revenue)"
                strokeWidth={3}
                dot={{
                  fill: "var(--color-revenue)",
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                }}
              />
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card> */}

      {/* Notice Board */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Notice Board
          </CardTitle>
          <CardDescription>
            Critical platform announcements and system updates
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
