import type { Prisma } from "@/server/prisma/generated/client";

import { prisma } from "@/server/prisma/client";
import type { AuditLogRecord } from "@/types/system";
import type { AuditListQueryValues } from "@/server/validation/system";

export interface WriteAuditLogInput {
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
  metadata?: Prisma.InputJsonValue;
  actorId?: string | null;
  actorEmail?: string | null;
  ipAddress?: string | null;
}

export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        summary: input.summary,
        metadata: input.metadata,
        actorId: input.actorId ?? null,
        actorEmail: input.actorEmail ?? null,
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}

export async function listAuditLogs(query: AuditListQueryValues): Promise<{
  logs: AuditLogRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const filters: Prisma.AuditLogWhereInput[] = [];

  if (query.search?.trim()) {
    const term = query.search.trim();
    filters.push({
      OR: [
        { summary: { contains: term, mode: "insensitive" } },
        { action: { contains: term, mode: "insensitive" } },
        { actorEmail: { contains: term, mode: "insensitive" } },
        { entityId: { contains: term, mode: "insensitive" } },
      ],
    });
  }

  if (query.entityType?.trim()) {
    filters.push({ entityType: query.entityType.trim() });
  }

  const where: Prisma.AuditLogWhereInput =
    filters.length > 0 ? { AND: filters } : {};

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
