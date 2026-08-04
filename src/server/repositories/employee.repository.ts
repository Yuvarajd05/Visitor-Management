import type { Prisma } from "@/server/prisma/generated/client";

import { prisma } from "@/server/prisma/client";
import {
  buildEmployeeCode,
  parseEmployeeCodeSequence,
} from "@/server/utils/employee-code";

export const employeeSelect = {
  id: true,
  employeeCode: true,
  fullName: true,
  email: true,
  phone: true,
  department: true,
  designation: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EmployeeSelect;

export async function generateNextEmployeeCode(
  tx: Prisma.TransactionClient,
): Promise<string> {
  const latestEmployee = await tx.employee.findFirst({
    where: {
      employeeCode: {
        startsWith: "EMP-",
      },
    },
    orderBy: {
      employeeCode: "desc",
    },
    select: {
      employeeCode: true,
    },
  });

  const lastSequence = latestEmployee
    ? parseEmployeeCodeSequence(latestEmployee.employeeCode)
    : 0;

  return buildEmployeeCode(lastSequence + 1);
}

export async function findEmployeeByEmail(
  email: string,
  excludeId?: string,
) {
  return prisma.employee.findFirst({
    where: {
      email: { equals: email, mode: "insensitive" },
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    select: { id: true },
  });
}

export async function createEmployeeRecord(
  tx: Prisma.TransactionClient,
  data: Prisma.EmployeeCreateInput,
) {
  return tx.employee.create({
    data,
    select: employeeSelect,
  });
}

export async function findEmployeeById(id: string) {
  return prisma.employee.findUnique({
    where: { id },
    select: employeeSelect,
  });
}

export async function listEmployeeRecords(args: {
  where: Prisma.EmployeeWhereInput;
  orderBy: Prisma.EmployeeOrderByWithRelationInput;
  skip: number;
  take: number;
}) {
  const [employees, total] = await Promise.all([
    prisma.employee.findMany({
      where: args.where,
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
      select: employeeSelect,
    }),
    prisma.employee.count({ where: args.where }),
  ]);

  return { employees, total };
}

export async function updateEmployeeRecord(
  id: string,
  data: Prisma.EmployeeUpdateInput,
) {
  return prisma.employee.update({
    where: { id },
    data,
    select: employeeSelect,
  });
}

export async function deleteEmployeeRecord(id: string) {
  return prisma.employee.delete({ where: { id } });
}

export async function runEmployeeTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(fn);
}
