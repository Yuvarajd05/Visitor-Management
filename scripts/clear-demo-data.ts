/**
 * Clears demo/application data while keeping login users (admin / security)
 * and system settings.
 */
import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/server/prisma/generated/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const pool = new Pool({
  connectionString,
  max: 2,
  connectionTimeoutMillis: 10_000,
  idleTimeoutMillis: 0,
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const before = {
    visitors: await prisma.visitor.count(),
    employees: await prisma.employee.count(),
    auditLogs: await prisma.auditLog.count(),
    errorLogs: await prisma.errorLog.count(),
    users: await prisma.user.count(),
  };

  console.log("Before:", before);

  // Order matters: visitors reference users (Restrict).
  const deletedVisitors = await prisma.visitor.deleteMany();
  const deletedEmployees = await prisma.employee.deleteMany();
  const deletedAudit = await prisma.auditLog.deleteMany();
  const deletedErrors = await prisma.errorLog.deleteMany();

  // Keep admin + security accounts; remove any other demo users.
  const deletedExtraUsers = await prisma.user.deleteMany({
    where: {
      email: {
        notIn: ["admin", "security"],
      },
    },
  });

  console.log("Deleted:", {
    visitors: deletedVisitors.count,
    employees: deletedEmployees.count,
    auditLogs: deletedAudit.count,
    errorLogs: deletedErrors.count,
    extraUsers: deletedExtraUsers.count,
  });

  const after = {
    visitors: await prisma.visitor.count(),
    employees: await prisma.employee.count(),
    auditLogs: await prisma.auditLog.count(),
    errorLogs: await prisma.errorLog.count(),
    users: await prisma.user.findMany({
      select: { email: true, role: true },
      orderBy: { email: "asc" },
    }),
  };

  console.log("After:", after);
}

main()
  .catch((error) => {
    console.error("Clear failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
