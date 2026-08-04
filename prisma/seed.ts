import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/server/prisma/generated/client";
import { hashPassword } from "@/server/auth/password";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not configured.");
}

const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim();
const adminPassword = process.env.SEED_ADMIN_PASSWORD;

if (!adminEmail || !adminPassword) {
  throw new Error(
    "Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in your .env before running the seed.",
  );
}

if (adminPassword.length < 8) {
  throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
}

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5_000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await hashPassword(adminPassword!);

  await prisma.user.upsert({
    where: { email: adminEmail! },
    update: {
      name: "Administrator",
      password: hashedPassword,
      role: "ADMIN",
      mustChangePassword: true,
      isActive: true,
    },
    create: {
      name: "Administrator",
      email: adminEmail!,
      password: hashedPassword,
      role: "ADMIN",
      mustChangePassword: true,
      isActive: true,
    },
  });

  console.log(`Seed completed: admin user ready (${adminEmail}).`);
  console.log("Change the password after first login.");
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
