import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";
import type { AuthUser, LoginRequest } from "@/types/auth";
import { AppError } from "@/utils/errors";

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
): Promise<{ user: AuthUser; token: string }> {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email.toLowerCase() },
  });

  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.isActive) {
    throw new AppError("Your account has been deactivated.", 403);
  }

  const isPasswordValid = await verifyPassword(
    credentials.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

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
