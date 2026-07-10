import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import { PrismaClient } from "@/lib/generated/prisma/client";
import { hashPassword } from "@/lib/password";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not configured.");
}

const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 5_000,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = "admin@invenger.local";
  const adminPassword = "Admin@123";

  const hashedPassword = await hashPassword(adminPassword);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Administrator",
      password: hashedPassword,
      role: "ADMIN",
      mustChangePassword: false,
      isActive: true,
    },
    create: {
      name: "Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
      mustChangePassword: false,
      isActive: true,
    },
  });

  console.log("Seed completed: admin user is ready.");
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
