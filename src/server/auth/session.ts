import { cache } from "react";
import { cookies } from "next/headers";

import { verifyToken } from "@/server/auth/auth";
import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { getUserById } from "@/server/services/auth.service";
import type { AuthUser } from "@/types/auth";

/** Deduped per request — layout + page share one auth lookup. */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return null;
  }

  try {
    return await getUserById(payload.userId, payload.tokenVersion ?? 0);
  } catch {
    return null;
  }
});

export async function requireCurrentUser(): Promise<AuthUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
