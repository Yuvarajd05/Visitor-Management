"use client";

import { SidebarProvider } from "@/hooks/use-sidebar";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import type { AuthUser } from "@/types/auth";

interface AppLayoutProps {
  children: React.ReactNode;
  user: AuthUser;
}

export function AppLayout({ children, user }: AppLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[linear-gradient(165deg,#f1f5f9_0%,#eef4ff_42%,#f8fafc_100%)]">
        <Sidebar user={user} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar user={user} />
          <main className="flex-1 p-4 md:p-6 print:bg-white print:p-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
