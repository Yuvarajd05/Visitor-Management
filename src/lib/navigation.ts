import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Settings,
  UserCog,
  UserPlus,
  // Users, // Employees — hidden for now
} from "lucide-react";

import type { Role } from "@/server/prisma/generated/client";
import type { NavItem } from "@/types/navigation";

export const navigationItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Visitors",
    href: "/visitors",
    icon: UserPlus,
  },
  // Employees directory — not used for Person to Meet yet; re-enable when wired up.
  // {
  //   title: "Employees",
  //   href: "/employees",
  //   icon: Users,
  // },
  {
    title: "Users",
    href: "/users",
    icon: UserCog,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Audit",
    href: "/audit",
    icon: ClipboardList,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

/** Users and Audit screens are visible to ADMIN only. */
export function getNavigationItems(role: Role): NavItem[] {
  return navigationItems.filter((item) => {
    if (item.href === "/users" || item.href === "/audit") {
      return role === "ADMIN";
    }
    return true;
  });
}
