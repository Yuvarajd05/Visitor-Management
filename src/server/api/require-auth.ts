import { getCurrentUser } from "@/server/auth/session";
import { ForbiddenError, UnauthorizedError } from "@/server/api/errors";
import type { AuthUser } from "@/types/auth";

export async function requireApiUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}

export async function requireApiAdmin(): Promise<AuthUser> {
  const user = await requireApiUser();

  if (user.role !== "ADMIN") {
    throw new ForbiddenError("Only administrators can manage users.");
  }

  return user;
}
