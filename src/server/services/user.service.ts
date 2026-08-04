import type { Prisma, Role } from "@/server/prisma/generated/client";

import { ConflictError, ForbiddenError, NotFoundError } from "@/server/api/errors";
import { hashPassword } from "@/server/auth/password";
import {
  createUserRecord,
  findUserByEmail,
  findUserById,
  listUserRecords,
  runUserTransaction,
  updateUserRecord,
  userSelect,
} from "@/server/repositories/user.repository";
import { prisma } from "@/server/prisma/client";
import {
  assertPasswordPolicy,
  getSystemSettings,
} from "@/server/services/settings.service";
import type {
  AdminResetPasswordResult,
  CreateUserInput,
  UpdateUserInput,
  UserListQuery,
  UserListResult,
  UserRecord,
} from "@/types/user";
import { AppError } from "@/lib/errors";
import { generateTemporaryPassword } from "@/server/utils/temp-password";
import type {
  CreateUserFormValues,
  UpdateUserFormValues,
  UserListQueryValues,
} from "@/server/validation/user";

function buildSearchFilter(search?: string): Prisma.UserWhereInput | undefined {
  if (!search?.trim()) {
    return undefined;
  }

  const term = search.trim();

  return {
    OR: [
      { name: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
    ],
  };
}

function buildListWhere(query: UserListQueryValues): Prisma.UserWhereInput {
  const filters: Prisma.UserWhereInput[] = [];
  const searchFilter = buildSearchFilter(query.search);

  if (searchFilter) {
    filters.push(searchFilter);
  }

  if (query.role && query.role !== "ALL") {
    filters.push({ role: query.role });
  }

  if (query.status === "ACTIVE") {
    filters.push({ isActive: true });
  } else if (query.status === "INACTIVE") {
    filters.push({ isActive: false });
  }

  if (filters.length === 0) {
    return {};
  }

  return { AND: filters };
}

async function assertUniqueEmail(email: string, excludeId?: string) {
  const existing = await findUserByEmail(email, excludeId);
  if (existing) {
    throw new ConflictError("A user with this email already exists.");
  }
}

export async function listUsers(
  query: UserListQuery | UserListQueryValues,
): Promise<UserListResult> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const where = buildListWhere(query as UserListQueryValues);
  const sortBy = (query.sortBy ?? "name") as
    | "name"
    | "email"
    | "role"
    | "createdAt";
  const sortOrder = query.sortOrder ?? "asc";
  const skip = (page - 1) * pageSize;

  const { users, total } = await listUserRecords({
    where,
    orderBy: { [sortBy]: sortOrder },
    skip,
    take: pageSize,
  });

  return {
    users,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getUserById(id: string): Promise<UserRecord> {
  const user = await findUserById(id);

  if (!user) {
    throw new NotFoundError("User");
  }

  return user;
}

export async function createUser(
  input: CreateUserInput | CreateUserFormValues,
): Promise<UserRecord> {
  const settings = await getSystemSettings();
  const policyError = assertPasswordPolicy(input.password, settings);
  if (policyError) {
    throw new AppError(policyError, 400);
  }

  await assertUniqueEmail(input.email);

  const hashedPassword = await hashPassword(input.password);

  return createUserRecord({
    name: input.name,
    email: input.email.toLowerCase(),
    password: hashedPassword,
    role: input.role,
    isActive: input.isActive ?? true,
    mustChangePassword: input.mustChangePassword ?? true,
  });
}

export async function updateUser(
  id: string,
  input: UpdateUserInput | UpdateUserFormValues,
  actorId: string,
): Promise<UserRecord> {
  const existing = await getUserById(id);

  if (input.email && input.email.toLowerCase() !== existing.email) {
    await assertUniqueEmail(input.email, id);
  }

  if (
    existing.id === actorId &&
    input.role === "SECURITY" &&
    existing.role === "ADMIN"
  ) {
    throw new ForbiddenError("You cannot remove your own admin role.");
  }

  if (existing.id === actorId && input.isActive === false) {
    throw new ForbiddenError("You cannot deactivate your own account.");
  }

  if (
    existing.role === "ADMIN" &&
    existing.isActive &&
    (input.isActive === false || input.role === "SECURITY")
  ) {
    const activeAdminCount = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });

    if (activeAdminCount <= 1) {
      throw new ForbiddenError(
        "At least one active administrator must remain.",
      );
    }
  }

  return updateUserRecord(id, {
    ...(input.name !== undefined ? { name: input.name } : {}),
    ...(input.email !== undefined
      ? { email: input.email.toLowerCase() }
      : {}),
    ...(input.role !== undefined ? { role: input.role as Role } : {}),
    ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
  });
}

export async function adminResetPassword(
  userId: string,
  options: {
    temporaryPassword?: string;
    generatePassword?: boolean;
  },
  actorId: string,
): Promise<AdminResetPasswordResult> {
  const user = await getUserById(userId);

  if (!user.isActive) {
    throw new ForbiddenError("Cannot reset password for an inactive user.");
  }

  const temporaryPassword =
    options.generatePassword !== false && !options.temporaryPassword
      ? generateTemporaryPassword()
      : options.temporaryPassword;

  if (!temporaryPassword) {
    throw new ForbiddenError("Temporary password is required.");
  }

  const settings = await getSystemSettings();
  const policyError = assertPasswordPolicy(temporaryPassword, settings);
  if (policyError) {
    throw new AppError(policyError, 400);
  }

  const hashedPassword = await hashPassword(temporaryPassword);

  const updated = await runUserTransaction(async (tx) => {
    const nextUser = await tx.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: true,
      },
      select: userSelect,
    });

    await tx.passwordResetToken.updateMany({
      where: { userId, usedAt: null },
      data: { usedAt: new Date() },
    });

    return nextUser;
  });

  void actorId;

  return {
    user: updated,
    temporaryPassword,
  };
}
