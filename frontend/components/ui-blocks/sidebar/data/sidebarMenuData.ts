import {
  Bell,
  DollarSign,
  LayoutDashboard,
  Package,
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
        { title: "All Resellers", url: "/admin/resellers" },
        { title: "Add Reseller", url: "/admin/resellers/add" },
      ],
    },
    {
      title: "Sales",
      url: "/admin/sales",
      icon: DollarSign,
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
      title: "My Clients",
      url: "/reseller/clients",
      icon: UserCircle,
    },
    {
      title: "Packages",
      url: "/reseller/packages",
      icon: Package,
    },
    {
      title: "Settings",
      url: "/reseller/settings",
      icon: Settings2,
    },
  ],
};
