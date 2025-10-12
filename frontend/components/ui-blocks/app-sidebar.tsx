"use client";

import { NavMain } from "@/components/ui-blocks/nav-main";
import { NavUser } from "@/components/ui-blocks/nav-user";
import { sidebarMenuData } from "@/components/ui-blocks/sidebar/data/sidebarMenuData";
import { TeamSwitcher } from "@/components/ui-blocks/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { getCurrentAuth } from "@/lib/api/auth";
import { User } from "lucide-react";
import * as React from "react";

type Role = "superadmin" | "admin" | "reseller";

export function AppSidebar({
  role,
  ...props
}: React.ComponentProps<typeof Sidebar> & { role: Role }) {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const userData = await getCurrentAuth(role);
        setUser(userData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [role]);

  const teams = [
    {
      name: "ISP Management",
      logo: User,
      plan: role.toUpperCase(),
    },
  ];

  const navMain = sidebarMenuData[role] || [];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        {loading ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Loading user...
          </div>
        ) : user ? (
          <NavUser
            user={{
              name: user.fullName,
              email: user.email,
              avatar: user.avatar,
            }}
          />
        ) : (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Not logged in
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
