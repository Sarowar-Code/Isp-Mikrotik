"use client";

import { AppSidebar } from "@/components/ui-blocks/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ReactNode } from "react";

interface RoleDashboardLayoutProps {
  children: ReactNode;
  role: "superadmin" | "admin" | "reseller";
  pageTitle?: string;
}

export default function RoleDashboardLayout({
  children,
  role,
}: RoleDashboardLayoutProps) {
  const capitalizedRole =
    role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  return (
    <SidebarProvider>
      {/* 👇 pass the role to AppSidebar */}
      <AppSidebar role={role} />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href={`/${role}`}>
                  {capitalizedRole}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
