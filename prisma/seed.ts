import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/server/prisma/generated/client";
import { hashPassword } from "@/server/auth/password";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not configured.");
}

const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin").trim().toLowerCase();
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "123";
const securityEmail = (
  process.env.SEED_SECURITY_EMAIL ?? "security"
)
  .trim()
  .toLowerCase();
const securityPassword = process.env.SEED_SECURITY_PASSWORD ?? "123";

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5_000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function upsertUser(input: {
  email: string;
  name: string;
  password: string;
  role: "ADMIN" | "SECURITY";
}) {
  const hashedPassword = await hashPassword(input.password);

  await prisma.user.upsert({
    where: { email: input.email },
    update: {
      name: input.name,
      password: hashedPassword,
      role: input.role,
      mustChangePassword: false,
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      tokenVersion: { increment: 1 },
    },
    create: {
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      mustChangePassword: false,
      isActive: true,
    },
  });
}

async function main() {
  await upsertUser({
    email: adminEmail,
    name: "Administrator",
    password: adminPassword,
    role: "ADMIN",
  });

  await upsertUser({
    email: securityEmail,
    name: "Security",
    password: securityPassword,
    role: "SECURITY",
  });

  console.log(`Seed completed:`);
  console.log(`  ADMIN    → ${adminEmail} / ${adminPassword}`);
  console.log(`  SECURITY → ${securityEmail} / ${securityPassword}`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
