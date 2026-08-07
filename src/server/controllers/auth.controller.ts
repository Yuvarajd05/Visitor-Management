import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { AUTH_COOKIE_NAME } from "@/lib/constants";
import { AppError, getErrorMessage } from "@/lib/errors";
import {
  apiMessage,
  parseRequestBody,
  requireApiUser,
} from "@/server/api";
import { getTokenMaxAge } from "@/server/auth/auth";
import { getCurrentUser } from "@/server/auth/session";
import {
  authenticateUser,
  changePassword,
} from "@/server/services/auth.service";
import { getSystemSettings } from "@/server/services/settings.service";
import { checkRateLimit, getRequestIp } from "@/server/utils/rate-limit";
import {
  changePasswordSchema,
  loginSchema,
} from "@/server/utils/validation";

export async function loginController(request: Request) {
  const ip = getRequestIp(request);
  const settings = await getSystemSettings();
  const rate = checkRateLimit({
    key: `login:${ip}`,
    windowMs: settings.rateLimitWindowMinutes * 60_000,
    maxAttempts: settings.rateLimitMaxAttempts,
  });

  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: `Too many login attempts. Try again in ${rate.retryAfterSeconds} second(s).`,
      },
      { status: 429 },
    );
  }

  const credentials = loginSchema.parse(await request.json());
  const { user, token } = await authenticateUser(credentials, {
    ipAddress: ip,
  });

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: getTokenMaxAge(credentials.rememberMe),
  });

  return NextResponse.json({
    message: "Login successful.",
    user,
  });
}

export async function logoutController() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);

  return NextResponse.json({
    message: "Logged out successfully.",
  });
}

export async function meController() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function changePasswordController(request: Request) {
  const user = await requireApiUser({ allowMustChangePassword: true });
  const body = parseRequestBody(changePasswordSchema, await request.json());

  await changePassword(user.id, body.currentPassword, body.newPassword);

  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);

  return apiMessage(
    "Password changed successfully. Please sign in again with your new password.",
  );
}

export function authErrorResponse(error: unknown) {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  return NextResponse.json(
    { error: getErrorMessage(error) },
    { status: statusCode },
  );
}
