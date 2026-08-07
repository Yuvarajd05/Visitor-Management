import { NextResponse, type NextRequest } from "next/server";

import { verifyToken } from "@/server/auth/auth";
import { AUTH_COOKIE_NAME, PROTECTED_ROUTES } from "@/lib/constants";

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  // Verify JWT once per request (was previously verified twice).
  const payload = token ? await verifyToken(token) : null;
  const isAuthenticated = Boolean(payload);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  if (pathname === "/") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isAuthenticated ? "/dashboard" : "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (isProtectedRoute(pathname) && !isAuthenticated) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (token && !payload) {
    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/visitors/:path*",
    "/employees/:path*",
    "/users/:path*",
    "/change-password",
    "/settings/:path*",
    "/reports/:path*",
    "/audit/:path*",
  ],
};
