import { NextResponse, type NextRequest } from "next/server";

import { verifyToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME, PROTECTED_ROUTES } from "@/lib/constants";
import { isAuthenticatedRequest } from "@/middleware/auth";

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const isAuthenticated = await isAuthenticatedRequest(request);

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

  if (token && !(await verifyToken(token))) {
    const response = NextResponse.next();
    response.cookies.delete(AUTH_COOKIE_NAME);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/visitors/:path*",
    "/employees/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/reports/:path*",
  ],
};
