import type { NextRequest } from "next/server";

import { verifyToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/constants";

export function getAuthToken(request: NextRequest): string | undefined {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value;
}

export async function isAuthenticatedRequest(
  request: NextRequest,
): Promise<boolean> {
  const token = getAuthToken(request);
  if (!token) {
    return false;
  }

  return Boolean(await verifyToken(token));
}
