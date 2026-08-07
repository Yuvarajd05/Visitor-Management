"use client";

import { LogOut } from "lucide-react";

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
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 print:hidden md:px-6">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/invenger-logo.png"
          alt="Invenger"
          className="h-7 w-auto object-contain lg:hidden"
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-1">
          <Avatar className="size-8">
            <AvatarFallback className="bg-secondary text-xs text-white">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[140px] truncate text-sm font-medium sm:inline">
            {user.name}
          </span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={logout}
          disabled={isLoggingOut}
          aria-label="Logout"
        >
          <LogOut className="size-4" />
          <span className="hidden sm:inline">
            {isLoggingOut ? "..." : "Logout"}
          </span>
        </Button>
      </div>
    </header>
  );
}
