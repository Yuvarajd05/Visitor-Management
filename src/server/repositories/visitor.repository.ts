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
  address: true,
  purpose: true,
  personToMeet: true,
  idProofType: true,
  idProofNumber: true,
  vehicleType: true,
  vehicleNumber: true,
  additionalMembers: true,
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

/** Atomically check out only if still CHECKED_IN (prevents double-checkout races). */
export async function checkoutVisitorIfCheckedIn(
  id: string,
  checkOutTime: Date,
  db: DbClient = prisma,
) {
  return db.visitor.updateMany({
    where: { id, status: "CHECKED_IN" },
    data: {
      status: "CHECKED_OUT",
      checkOutTime,
    },
  });
}

export async function deleteVisitorRecord(id: string, db: DbClient = prisma) {
  return db.visitor.delete({ where: { id } });
}

const visitorLookupSelect = {
  id: true,
  visitorCode: true,
  fullName: true,
  phone: true,
  company: true,
  address: true,
  purpose: true,
  personToMeet: true,
  idProofType: true,
  idProofNumber: true,
  vehicleType: true,
  vehicleNumber: true,
  additionalMembers: true,
  photoUrl: true,
  checkInTime: true,
} satisfies Prisma.VisitorSelect;

/**
 * Finds recent visitors whose phone contains any of the digit variants
 * (supports legacy numbers stored without +91).
 */
export async function findVisitorsByPhoneDigits(
  digitVariants: string[],
  take = 40,
  db: DbClient = prisma,
) {
  const variants = digitVariants
    .map((value) => value.replace(/\D/g, ""))
    .filter((value) => value.length >= 4);

  if (variants.length === 0) {
    return [];
  }

  return db.visitor.findMany({
    where: {
      OR: variants.map((digits) => ({
        phone: { contains: digits },
      })),
    },
    orderBy: { checkInTime: "desc" },
    take,
    select: visitorLookupSelect,
  });
}

export async function runVisitorTransaction<T>(
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(fn);
}
