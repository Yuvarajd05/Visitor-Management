"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { navigationItems } from "@/lib/navigation";
import { useSidebar } from "@/hooks/use-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-1 flex-col gap-1 p-4">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-white shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const { isOpen, isMobile, closeSidebar } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeSidebar()}>
        <SheetContent
          side="left"
          className="w-72 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <div className="border-b border-sidebar-border px-6 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Invenger
            </p>
            <p className="mt-1 text-sm font-medium text-sidebar-foreground">
              Visitor Management
            </p>
          </div>
          <SidebarNav onNavigate={closeSidebar} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col">
      <div className="border-b border-sidebar-border px-6 py-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
          Invenger
        </p>
        <p className="mt-1 text-sm font-medium text-sidebar-foreground">
          Visitor Management
        </p>
      </div>
      <SidebarNav />
      <div className="mt-auto border-t border-sidebar-border p-4">
        <p className="text-xs text-muted-foreground">
          Enterprise visitor operations
        </p>
      </div>
    </aside>
  );
}

export function SidebarTrigger() {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="lg:hidden"
      onClick={toggleSidebar}
      aria-label="Open navigation menu"
    >
      <span className="flex flex-col gap-1">
        <span className="block h-0.5 w-4 rounded-full bg-current" />
        <span className="block h-0.5 w-4 rounded-full bg-current" />
        <span className="block h-0.5 w-4 rounded-full bg-current" />
      </span>
    </Button>
  );
}
