import {
  BarChart3,
  LayoutDashboard,
  Settings,
  UserCog,
  UserPlus,
  Users,
} from "lucide-react";

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
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
  },
  {
    title: "Users",
    href: "/users",
    icon: UserCog,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
];
