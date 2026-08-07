import { prisma } from "@/server/prisma/client";
import { signToken } from "@/server/auth/auth";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { writeAuditLog } from "@/server/services/audit.service";
import {
  assertPasswordPolicy,
  getSystemSettings,
} from "@/server/services/settings.service";
import type { AuthUser, LoginRequest } from "@/types/auth";
import { AppError } from "@/server/utils/errors";

function toAuthUser(user: {
  id: string;
  name: string;
  email: string;
  role: AuthUser["role"];
  mustChangePassword: boolean;
}): AuthUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    mustChangePassword: user.mustChangePassword,
  };
}

export async function authenticateUser(
  credentials: LoginRequest,
  meta?: { ipAddress?: string | null },
): Promise<{ user: AuthUser; token: string }> {
  const settings = await getSystemSettings();
  const user = await prisma.user.findUnique({
    where: { email: credentials.email.toLowerCase() },
  });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated.", 403);
  }

  if (user.lockedUntil && user.lockedUntil.getTime() > Date.now()) {
    const minutes = Math.max(
      1,
      Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000),
    );
    throw new AppError(
      `Account is locked. Try again in about ${minutes} minute(s).`,
      423,
    );
  }

  const isPasswordValid = await verifyPassword(
    credentials.password,
    user.password,
  );

  if (!isPasswordValid) {
    const failedLoginAttempts = user.failedLoginAttempts + 1;
    const shouldLock = failedLoginAttempts >= settings.maxFailedLogins;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginAttempts,
        lockedUntil: shouldLock
          ? new Date(Date.now() + settings.lockoutMinutes * 60_000)
          : null,
      },
    });

    await writeAuditLog({
      action: shouldLock ? "LOGIN_LOCKED" : "LOGIN_FAILED",
      entityType: "USER",
      entityId: user.id,
      summary: shouldLock
        ? `Account locked after failed logins: ${user.email}`
        : `Failed login attempt: ${user.email}`,
      actorEmail: user.email,
      ipAddress: meta?.ipAddress,
    });

    if (shouldLock) {
      throw new AppError(
        `Account locked after ${settings.maxFailedLogins} failed attempts. Try again in ${settings.lockoutMinutes} minute(s).`,
        423,
      );
    }

    throw new AppError("Invalid email or password.", 401);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  });

  const authUser = toAuthUser(user);
  const token = await signToken(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    credentials.rememberMe,
  );

  await writeAuditLog({
    action: "LOGIN_SUCCESS",
    entityType: "USER",
    entityId: user.id,
    summary: `User signed in: ${user.email}`,
    actorId: user.id,
    actorEmail: user.email,
    ipAddress: meta?.ipAddress,
  });

  return { user: authUser, token };
}

export async function getUserById(
  userId: string,
  expectedTokenVersion?: number,
): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      mustChangePassword: true,
      isActive: true,
      tokenVersion: true,
    },
  });

  if (!user || !user.isActive) {
    return null;
  }

  if (
    expectedTokenVersion !== undefined &&
    user.tokenVersion !== expectedTokenVersion
  ) {
    return null;
  }

  return toAuthUser(user);
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<AuthUser> {
  const settings = await getSystemSettings();
  const policyError = assertPasswordPolicy(newPassword, settings);
  if (policyError) {
    throw new AppError(policyError, 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    throw new AppError("User not found.", 404);
  }

  const isCurrentValid = await verifyPassword(currentPassword, user.password);
  if (!isCurrentValid) {
    throw new AppError("Current password is incorrect.", 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
      mustChangePassword: false,
      tokenVersion: { increment: 1 },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      mustChangePassword: true,
    },
  });

  await writeAuditLog({
    action: "PASSWORD_CHANGED",
    entityType: "USER",
    entityId: user.id,
    summary: `Password changed for ${user.email}`,
    actorId: user.id,
    actorEmail: user.email,
  });

  return toAuthUser(updated);
}
