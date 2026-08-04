import type { Prisma } from "@/server/prisma/generated/client";

import { prisma } from "@/server/prisma/client";
import type { ReportResult, ReportRow } from "@/types/report";
import { endOfDay, startOfDay } from "@/server/utils/dashboard-dates";
import type { ReportQueryValues } from "@/server/validation/report";

const reportRowSelect = {
  id: true,
  visitorCode: true,
  fullName: true,
  phone: true,
  company: true,
  purpose: true,
  personToMeet: true,
  checkInTime: true,
  checkOutTime: true,
  status: true,
} satisfies Prisma.VisitorSelect;

function mapRow(visitor: {
  id: string;
  visitorCode: string;
  fullName: string;
  phone: string;
  company: string | null;
  purpose: string;
  personToMeet: string;
  checkInTime: Date;
  checkOutTime: Date | null;
  status: "CHECKED_IN" | "CHECKED_OUT";
}): ReportRow {
  return {
    id: visitor.id,
    visitorCode: visitor.visitorCode,
    fullName: visitor.fullName,
    phone: visitor.phone,
    company: visitor.company,
    purpose: visitor.purpose,
    personToMeet: visitor.personToMeet,
    checkInTime: visitor.checkInTime,
    checkOutTime: visitor.checkOutTime,
    status: visitor.status,
  };
}

function buildPurposeSummary(rows: ReportRow[]) {
  const counts = new Map<string, number>();

  for (const row of rows) {
    const purpose = row.purpose.trim() || "Other";
    counts.set(purpose, (counts.get(purpose) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([purpose, count]) => ({ purpose, count }))
    .sort((a, b) => b.count - a.count);
}

function buildWhere(query: ReportQueryValues): Prisma.VisitorWhereInput {
  if (query.type === "inside") {
    return { status: "CHECKED_IN" };
  }

  const start = startOfDay(new Date(query.startDate!));
  const end = endOfDay(new Date(query.endDate!));
  const filters: Prisma.VisitorWhereInput[] = [
    { checkInTime: { gte: start, lte: end } },
  ];

  if (query.status && query.status !== "ALL") {
    filters.push({ status: query.status });
  }

  if (query.purpose?.trim()) {
    filters.push({
      purpose: { contains: query.purpose.trim(), mode: "insensitive" },
    });
  }

  return { AND: filters };
}

export async function getVisitorReport(
  query: ReportQueryValues,
): Promise<ReportResult> {
  const where = buildWhere(query);

  const visitors = await prisma.visitor.findMany({
    where,
    select: reportRowSelect,
    orderBy: { checkInTime: "desc" },
    take: 2000,
  });

  const rows = visitors.map(mapRow);
  const purposeSummary = buildPurposeSummary(rows);

  const range =
    query.type === "inside"
      ? { start: null, end: null }
      : {
          start: startOfDay(new Date(query.startDate!)).toISOString(),
          end: endOfDay(new Date(query.endDate!)).toISOString(),
        };

  return {
    type: query.type,
    generatedAt: new Date().toISOString(),
    range,
    total: rows.length,
    purposeSummary: query.type === "purpose" ? purposeSummary : purposeSummary.slice(0, 8),
    rows,
  };
}
