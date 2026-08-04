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
  requestPasswordReset,
  resetPasswordWithToken,
} from "@/server/services/auth.service";
import { getSystemSettings } from "@/server/services/settings.service";
import { checkRateLimit, getRequestIp } from "@/server/utils/rate-limit";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
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

export async function forgotPasswordController(request: Request) {
  const ip = getRequestIp(request);
  const settings = await getSystemSettings();
  const rate = checkRateLimit({
    key: `forgot:${ip}`,
    windowMs: settings.rateLimitWindowMinutes * 60_000,
    maxAttempts: Math.max(5, Math.floor(settings.rateLimitMaxAttempts / 2)),
  });

  if (!rate.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `Too many requests. Try again in ${rate.retryAfterSeconds} second(s).`,
      },
      { status: 429 },
    );
  }

  const body = parseRequestBody(forgotPasswordSchema, await request.json());
  const result = await requestPasswordReset(body.email);

  return NextResponse.json({
    success: true,
    message: result.message,
  });
}

export async function resetPasswordController(request: Request) {
  const body = parseRequestBody(resetPasswordSchema, await request.json());
  await resetPasswordWithToken(body.token, body.newPassword);

  return NextResponse.json({
    success: true,
    message: "Password reset successfully. You can now sign in.",
  });
}

export async function changePasswordController(request: Request) {
  const user = await requireApiUser();
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
