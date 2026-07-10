"use client";

import { LogOut, Shield } from "lucide-react";

import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import type { AuthUser } from "@/types/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/layout/sidebar";

interface TopbarProps {
  user: AuthUser;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Topbar({ user }: TopbarProps) {
  const { logout, isLoggingOut } = useAuth(user);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-card/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              Invenger
            </p>
            <p className="hidden truncate text-xs text-muted-foreground sm:block">
              {APP_NAME}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-3 rounded-lg border border-border bg-background px-3 py-2 sm:flex">
          <Avatar className="size-8">
            <AvatarFallback className="bg-secondary text-xs text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={logout}
          disabled={isLoggingOut}
          className="gap-2"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </Button>
      </div>
    </header>
  );
}
