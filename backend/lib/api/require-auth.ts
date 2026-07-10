import { getCurrentUser } from "@/lib/session";
import { UnauthorizedError } from "@/lib/api/errors";
import type { AuthUser } from "@/types/auth";

export async function requireApiUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new UnauthorizedError();
  }

  return user;
}
