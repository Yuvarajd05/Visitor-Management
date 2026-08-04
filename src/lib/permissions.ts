import type { Role } from "@/server/prisma/generated/client";

export function isAdmin(role: Role | string | null | undefined): boolean {
  return role === "ADMIN";
}

export function canManageUsers(role: Role | string | null | undefined): boolean {
  return isAdmin(role);
}

export function canAccessAudit(role: Role | string | null | undefined): boolean {
  return isAdmin(role);
}

export function canManageSystemSettings(
  role: Role | string | null | undefined,
): boolean {
  return isAdmin(role);
}
