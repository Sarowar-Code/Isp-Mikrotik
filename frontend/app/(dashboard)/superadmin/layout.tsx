import { AppSidebar } from "@/components/ui-blocks/app-sidebar";
import { Breadcrumbs } from "@/components/ui-blocks/breadcrumbs";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}



export default function SuperAdminLayout({ children }: Props) {
  return (
    <SidebarProvider>
      <AppSidebar role={"superadmin"} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumbs />
        </header>
        <Separator />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
