"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb";

import { usePathname, useSearchParams } from "next/navigation";

const ROLE_LABELS = {
  superadmin: "Superadmin",
  admin: "Admin",
  adminemployee: "Employee",
  reseller: "Reseller",
  client: "Client"
};

const ACTION_LABELS = {
  create: "Create",
  new: "Create",
  add: "Create",
  edit: "Edit",
  update: "Edit",
  view: "View",
  list: "List",
  delete: "Delete",
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const segments = pathname.split("/").filter(Boolean);

  // Role
  const role = ROLE_LABELS[segments[0]] || "Dashboard";

  // Section (admin, reseller, dashboard, etc.)
  const sectionRaw = segments[1] || "";
  const section = sectionRaw ? capitalize(sectionRaw) : "";

  // Action
  const actionRaw = segments[2] || "";
  const action = ACTION_LABELS[actionRaw] || capitalize(actionRaw);

  const pageNumber = searchParams.get("page");

  // ---------------------------
  // 🔥 SPECIAL CASE FIXES
  // ---------------------------

  // CASE 1: If only /role/dashboard → show ONLY: Superadmin > Dashboard
  const isJustDashboard = sectionRaw === "dashboard" && !actionRaw;

  return (
    <Breadcrumb>
      <BreadcrumbList>

        {/* Always show role */}
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink href={`/${segments[0]}/dashboard`}>
            {role}
          </BreadcrumbLink>
        </BreadcrumbItem>

        <BreadcrumbSeparator className="hidden md:block" />

        {/* CASE 1: /role/dashboard → only show this one */}
        {isJustDashboard && (
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        )}

        {/* CASE 2: section = dashboard → skip it */}
        {!isJustDashboard && sectionRaw !== "dashboard" && (
          <>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={`/${segments[0]}/${sectionRaw}/list`}>
                {section}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
          </>
        )}

        {/* CASE 3: Show action only when needed */}
        {!isJustDashboard && actionRaw && (
          <BreadcrumbItem>
            <BreadcrumbPage>
              {action}
              {pageNumber ? ` (Page ${pageNumber})` : ""}
            </BreadcrumbPage>
          </BreadcrumbItem>
        )}

      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Helper
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
