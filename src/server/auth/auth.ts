import { SignJWT, jwtVerify } from "jose";

import type { JWTPayload } from "@/types/auth";

/** Default session: 12 hours 30 minutes. */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "750m";
const JWT_REMEMBER_ME_EXPIRES_IN =
  process.env.JWT_REMEMBER_ME_EXPIRES_IN ?? "7d";

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not configured.");
  }

  return new TextEncoder().encode(secret);
}

function getExpiresInSeconds(rememberMe: boolean): number {
  const duration = rememberMe ? JWT_REMEMBER_ME_EXPIRES_IN : JWT_EXPIRES_IN;
  const match = duration.match(/^(\d+)([dhms])$/);

  if (!match) {
    return 60 * 60 * 24 * 7;
  }

  const value = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case "d":
      return value * 60 * 60 * 24;
    case "h":
      return value * 60 * 60;
    case "m":
      return value * 60;
    case "s":
      return value;
    default:
      return 60 * 60 * 24 * 7;
  }
}

export function getTokenMaxAge(rememberMe: boolean): number {
  return getExpiresInSeconds(rememberMe);
}

export async function signToken(
  payload: JWTPayload,
  rememberMe = false,
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${getExpiresInSeconds(rememberMe)}s`)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      (payload.role !== "ADMIN" && payload.role !== "SECURITY")
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      tokenVersion:
        typeof payload.tokenVersion === "number" ? payload.tokenVersion : 0,
    };
  } catch {
    return null;
  }
}
