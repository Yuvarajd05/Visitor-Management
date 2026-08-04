import { prisma } from "@/server/prisma/client";
import type { ErrorLogRecord } from "@/types/system";
import type { ErrorListQueryValues } from "@/server/validation/system";

export async function writeErrorLog(input: {
  message: string;
  stack?: string | null;
  path?: string | null;
  method?: string | null;
  statusCode?: number | null;
  userId?: string | null;
}): Promise<void> {
  try {
    await prisma.errorLog.create({
      data: {
        message: input.message.slice(0, 2000),
        stack: input.stack?.slice(0, 8000) ?? null,
        path: input.path ?? null,
        method: input.method ?? null,
        statusCode: input.statusCode ?? null,
        userId: input.userId ?? null,
      },
    });
  } catch (error) {
    console.error("Failed to write error log:", error);
  }
}

export async function listErrorLogs(query: ErrorListQueryValues): Promise<{
  logs: ErrorLogRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 20;
  const where = query.search?.trim()
    ? {
        OR: [
          { message: { contains: query.search.trim(), mode: "insensitive" as const } },
          { path: { contains: query.search.trim(), mode: "insensitive" as const } },
        ],
      }
    : {};

  const [logs, total] = await Promise.all([
    prisma.errorLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.errorLog.count({ where }),
  ]);

  return {
    logs,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
