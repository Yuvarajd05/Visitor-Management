import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { getTokenMaxAge } from "@/server/auth/auth";

interface AuthCookieOptions {
  rememberMe?: boolean;
}

export function buildAuthCookie(
  token: string,
  options: AuthCookieOptions = {},
): string {
  const maxAge = getTokenMaxAge(options.rememberMe ?? false);
  const secure = process.env.NODE_ENV === "production";

  return [
    `${AUTH_COOKIE_NAME}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    secure ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");
}

export function clearAuthCookie(): string {
  return [
    `${AUTH_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ].join("; ");
}
