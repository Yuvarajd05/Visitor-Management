"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { getNavigationItems } from "@/lib/navigation";
import { useSidebar } from "@/hooks/use-sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { AuthUser } from "@/types/auth";

function BrandMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/invenger-logo.png"
      alt="Invenger"
      className={cn("h-8 w-auto object-contain", className)}
    />
  );
}

function SidebarNav({
  role,
  onNavigate,
}: {
  role: AuthUser["role"];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const items = getNavigationItems(role);

  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {items.map((item) => {
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

function SidebarBrand() {
  return (
    <div className="flex h-14 shrink-0 items-center border-b border-border bg-card px-4">
      <Link href="/dashboard" className="flex items-center">
        <BrandMark className="h-7" />
      </Link>
    </div>
  );
}

export function Sidebar({ user }: { user: AuthUser }) {
  const { isOpen, isMobile, closeSidebar } = useSidebar();

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={(open) => !open && closeSidebar()}>
        <SheetContent
          side="left"
          className="w-64 border-sidebar-border bg-sidebar p-0 text-sidebar-foreground print:hidden"
        >
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SidebarBrand />
          <SidebarNav role={user.role} onNavigate={closeSidebar} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground print:hidden lg:flex lg:flex-col">
      <SidebarBrand />
      <SidebarNav role={user.role} />
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
