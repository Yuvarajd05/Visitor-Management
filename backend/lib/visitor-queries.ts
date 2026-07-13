import type { Prisma } from "@/lib/generated/prisma/client";
import type { PrismaClient } from "@/lib/generated/prisma/client";

import {
  buildVisitorCode,
  getVisitorCodeYearPrefix,
  parseVisitorCodeSequence,
} from "@/utils/visitor-code";

type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$extends"
>;

/**
 * Generates the next unique visitor code for the current year.
 * Codes reset to 001 each calendar year (e.g. 26-001, 27-001).
 * Must be called inside a transaction to prevent duplicates.
 */
export async function generateNextVisitorCode(
  tx: TransactionClient,
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

  const nextSequence = lastSequence + 1;

  return buildVisitorCode(yearPrefix, nextSequence);
}

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
  checkInTime: true,
  checkOutTime: true,
  status: true,
} satisfies Prisma.VisitorSelect;
