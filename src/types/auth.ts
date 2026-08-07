import type { Role } from "@/server/prisma/generated/client";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: Role;
  /** Matches User.tokenVersion; absent/legacy tokens treated as 0. */
  tokenVersion?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginResponse {
  user: AuthUser;
  message: string;
}
