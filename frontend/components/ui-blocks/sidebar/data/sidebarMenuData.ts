import {
  BarChart2,
  Bell,
  CreditCard,
  FileBarChart2,
  HelpCircle,
  LayoutDashboard,
  Network,
  Package,
  Router,
  Settings2,
  UserCircle,
  Users,
  Zap,
} from "lucide-react";

export const sidebarMenuData = {
  superadmin: [
    {
      title: "Dashboard",
      url: "/superadmin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Admins",
      url: "/superadmin/admins",
      icon: Users,
      items: [
        { title: "All Admins", url: "/superadmin/admins/adminlist" },
        { title: "Add Admin", url: "/superadmin/admins/create" },
      ],
    },
    {
      title: "Subscriptions",
      url: "/superadmin/subscriptions",
      icon: Zap,
      items: [
        { title: "All Plans", url: "/superadmin/subscriptions/planlist" },
        { title: "Create Plan", url: "/superadmin/subscriptions/create" },
      ],
    },

    {
      title: "Notices",
      url: "/superadmin/notices",
      icon: Bell,
      items: [
        { title: "All Notices", url: "/superadmin/notices/noticelist" },
        { title: "Create Notice", url: "/superadmin/notices/create" },
      ],
    },
    {
      title: "Reports",
      url: "/superadmin/reports",
      icon: FileBarChart2,
      items: [
        { title: "Financial", url: "/superadmin/reports/financial" },
        { title: "User Activity", url: "/superadmin/reports/activity" },
        { title: "System Logs", url: "/superadmin/reports/logs" },
      ],
    },
    {
      title: "Settings",
      url: "/superadmin/settings",
      icon: Settings2,
    },
  ],

  admin: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Resellers",
      url: "/admin/resellers",
      icon: Users,
      items: [
        { title: "All Resellers", url: "/admin/resellers/list" },
        { title: "Add Reseller", url: "/admin/resellers/add" },
        { title: "Reseller Reports", url: "/admin/resellers/reports" },
      ],
    },
    {
      title: "Routers",
      url: "/admin/routers",
      icon: Router,
      items: [
        { title: "Router List", url: "/admin/routers/list" },
        { title: "Add Router", url: "/admin/routers/add" },
        { title: "Router Status", url: "/admin/routers/status" },
        { title: "Router Logs", url: "/admin/routers/logs" },
      ],
    },
    {
      title: "Network",
      url: "/admin/network",
      icon: Network,
      items: [
        { title: "IP Pools", url: "/admin/network/ippools" },
        { title: "Bandwidth Profiles", url: "/admin/network/profiles" },
        { title: "Traffic Control", url: "/admin/network/traffic" },
      ],
    },
    {
      title: "Billing",
      url: "/admin/billing",
      icon: CreditCard,
      items: [
        { title: "Invoices", url: "/admin/billing/invoices" },
        { title: "Payments", url: "/admin/billing/payments" },
        { title: "Payment Methods", url: "/admin/billing/methods" },
      ],
    },
    {
      title: "Support",
      url: "/admin/support",
      icon: HelpCircle,
      items: [
        { title: "Tickets", url: "/admin/support/tickets" },
        { title: "FAQs", url: "/admin/support/faqs" },
        { title: "Announcements", url: "/admin/support/announcements" },
      ],
    },
    {
      title: "Settings",
      url: "/admin/settings",
      icon: Settings2,
      items: [
        { title: "Profile", url: "/admin/settings/profile" },
        { title: "Security", url: "/admin/settings/security" },
        { title: "Notifications", url: "/admin/settings/notifications" },
      ],
    },
  ],

  reseller: [
    {
      title: "Dashboard",
      url: "/reseller/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Clients",
      url: "/reseller/clients",
      icon: UserCircle,
      items: [
        { title: "All Clients", url: "/reseller/clients/list" },
        { title: "Add Client", url: "/reseller/clients/add" },
        { title: "Client Reports", url: "/reseller/clients/reports" },
      ],
    },
    {
      title: "Packages",
      url: "/reseller/packages",
      icon: Package,
      items: [
        { title: "All Packages", url: "/reseller/packages/list" },
        { title: "Create Package", url: "/reseller/packages/create" },
      ],
    },
    {
      title: "Billing",
      url: "/reseller/billing",
      icon: CreditCard,
      items: [
        { title: "Invoices", url: "/reseller/billing/invoices" },
        { title: "Payments", url: "/reseller/billing/payments" },
        { title: "Payment History", url: "/reseller/billing/history" },
      ],
    },
    {
      title: "Support",
      url: "/reseller/support",
      icon: HelpCircle,
      items: [
        { title: "New Ticket", url: "/reseller/support/new" },
        { title: "My Tickets", url: "/reseller/support/tickets" },
      ],
    },
    {
      title: "Reports",
      url: "/reseller/reports",
      icon: BarChart2,
      items: [
        { title: "Sales", url: "/reseller/reports/sales" },
        { title: "Bandwidth", url: "/reseller/reports/bandwidth" },
        { title: "Client Activity", url: "/reseller/reports/activity" },
      ],
    },
    {
      title: "Settings",
      url: "/reseller/settings",
      icon: Settings2,
      items: [
        { title: "Profile", url: "/reseller/settings/profile" },
        { title: "Security", url: "/reseller/settings/security" },
        { title: "Notifications", url: "/reseller/settings/notifications" },
      ],
    },
  ],
};
