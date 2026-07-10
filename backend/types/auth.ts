import type { Role } from "@/lib/generated/prisma/client";

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
