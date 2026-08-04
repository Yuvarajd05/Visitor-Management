import type { Prisma, PrismaClient } from "@/server/prisma/generated/client";

import { prisma } from "@/server/prisma/client";
import {
  buildVisitorCode,
  getVisitorCodeYearPrefix,
  parseVisitorCodeSequence,
} from "@/server/utils/visitor-code";

type DbClient = PrismaClient | Prisma.TransactionClient;

export const visitorWithCreatorSelect = {
  id: true,
  visitorCode: true,
  fullName: true,
  phone: true,
  company: true,
  purpose: true,
  personToMeet: true,
  idProofType: true,
  idProofNumber: true,
  vehicleNumber: true,
  photoUrl: true,
  checkInTime: true,
  checkOutTime: true,
  status: true,
  createdBy: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.VisitorSelect;

export const visitorListSelect = {
  id: true,
  visitorCode: true,
  fullName: true,
  phone: true,
  company: true,
  personToMeet: true,
  purpose: true,
  photoUrl: true,
  checkInTime: true,
  checkOutTime: true,
  status: true,
} satisfies Prisma.VisitorSelect;

/**
 * Generates the next unique visitor code for the current year.
 * Must be called inside a transaction to prevent duplicates.
 */
export async function generateNextVisitorCode(
  tx: Prisma.TransactionClient,
  date: Date = new Date(),
): Promise<string> {
  const yearPrefix = getVisitorCodeYearPrefix(date);
  const codePrefix = `${yearPrefix}-`;

  const latestVisitor = await tx.visitor.findFirst({
    where: {
      visitorCode: {
        startsWith: codePrefix,
      },
    },
    orderBy: {
      visitorCode: "desc",
    },
    select: {
      visitorCode: true,
    },
  });

  const lastSequence = latestVisitor
    ? parseVisitorCodeSequence(latestVisitor.visitorCode)
    : 0;

  return buildVisitorCode(yearPrefix, lastSequence + 1);
}

export async function createVisitorRecord(
  tx: Prisma.TransactionClient,
  data: Prisma.VisitorCreateInput,
) {
  return tx.visitor.create({
    data,
    select: visitorWithCreatorSelect,
  });
}

export async function findVisitorById(id: string, db: DbClient = prisma) {
  return db.visitor.findUnique({
    where: { id },
    select: visitorWithCreatorSelect,
  });
}

export async function listVisitorRecords(args: {
  where: Prisma.VisitorWhereInput;
  orderBy: Prisma.VisitorOrderByWithRelationInput;
  skip: number;
  take: number;
}) {
  const [visitors, total] = await Promise.all([
    prisma.visitor.findMany({
      where: args.where,
      orderBy: args.orderBy,
      skip: args.skip,
      take: args.take,
      select: visitorListSelect,
    }),
    prisma.visitor.count({ where: args.where }),
  ]);

  return { visitors, total };
}

export async function updateVisitorRecord(
  id: string,
  data: Prisma.VisitorUpdateInput,
  db: DbClient = prisma,
) {
  return db.visitor.update({
    where: { id },
    data,
    select: visitorWithCreatorSelect,
  });
}

export async function deleteVisitorRecord(id: string, db: DbClient = prisma) {
  return db.visitor.delete({ where: { id } });
}

export async function runVisitorTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(fn);
}
