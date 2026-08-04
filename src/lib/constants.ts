export const AUTH_COOKIE_NAME = "invenger_auth_token";

export const PUBLIC_ROUTES = [
  "/login",
  "/forgot-password",
  "/reset-password",
] as const;

export const PROTECTED_ROUTES = [
  "/dashboard",
  "/visitors",
  "/employees",
  "/users",
  "/settings",
  "/reports",
  "/audit",
  "/change-password",
] as const;

export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME ?? "Invenger Visitor Management System";
