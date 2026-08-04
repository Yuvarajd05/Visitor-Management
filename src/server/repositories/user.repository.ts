import type { Prisma } from "@/server/prisma/generated/client";

import { prisma } from "@/server/prisma/client";

export const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  mustChangePassword: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export async function findUserByEmail(email: string, excludeId?: string) {
  return prisma.user.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
}

export async function listUserRecords(args: {
  where: Prisma.UserWhereInput;
  orderBy: Prisma.UserOrderByWithRelationInput;
  skip: number;
  take: number;
}) {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: args.where,
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
      select: userSelect,
    }),
    prisma.user.count({ where: args.where }),
  ]);

  return { users, total };
}

export async function createUserRecord(data: Prisma.UserCreateInput) {
  return prisma.user.create({
    data,
    select: userSelect,
  });
}

export async function updateUserRecord(
  id: string,
  data: Prisma.UserUpdateInput,
) {
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export async function runUserTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(fn);
}
