import { prisma } from "@/server/prisma/client";
import { signToken } from "@/server/auth/auth";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import {
  buildPasswordResetUrl,
  deliverPasswordResetLink,
  generatePasswordResetToken,
  getPasswordResetExpiry,
  hashPasswordResetToken,
} from "@/server/auth/password-reset";
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

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      mustChangePassword: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
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

/**
 * Always returns a generic success message to avoid account enumeration.
 */
export async function requestPasswordReset(email: string): Promise<{
  message: string;
}> {
  const normalizedEmail = email.toLowerCase().trim();
  const genericMessage =
    "If an account exists for that email, password reset instructions have been sent.";

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || !user.isActive) {
    return { message: genericMessage };
  }

  const rawToken = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(rawToken);
  const expiresAt = getPasswordResetExpiry();

  await prisma.$transaction([
    prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    }),
    prisma.passwordResetToken.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    }),
  ]);

  const resetUrl = buildPasswordResetUrl(rawToken);
  await deliverPasswordResetLink({
    to: user.email,
    name: user.name,
    resetUrl,
  });

  await writeAuditLog({
    action: "PASSWORD_RESET_REQUESTED",
    entityType: "USER",
    entityId: user.id,
    summary: `Password reset requested for ${user.email}`,
    actorEmail: user.email,
  });

  return { message: genericMessage };
}

export async function resetPasswordWithToken(
  token: string,
  newPassword: string,
): Promise<void> {
  const settings = await getSystemSettings();
  const policyError = assertPasswordPolicy(newPassword, settings);
  if (policyError) {
    throw new AppError(policyError, 400);
  }

  const tokenHash = hashPasswordResetToken(token);

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          isActive: true,
        },
      },
    },
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt.getTime() < Date.now() ||
    !resetToken.user.isActive
  ) {
    throw new AppError("This reset link is invalid or has expired.", 400);
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: new Date() },
    }),
    prisma.passwordResetToken.updateMany({
      where: {
        userId: resetToken.userId,
        usedAt: null,
        id: { not: resetToken.id },
      },
      data: { usedAt: new Date() },
    }),
  ]);

  await writeAuditLog({
    action: "PASSWORD_RESET_COMPLETED",
    entityType: "USER",
    entityId: resetToken.userId,
    summary: `Password reset completed for ${resetToken.user.email}`,
    actorEmail: resetToken.user.email,
  });
}
