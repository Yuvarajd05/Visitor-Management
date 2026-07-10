import type { Role } from "@/lib/generated/prisma/client";

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}
