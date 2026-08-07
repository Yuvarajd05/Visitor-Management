/**
 * One-shot: ensure visitors.vehicleType exists and mark Prisma migration applied.
 * Usage (keep `npx prisma dev` running; pause `npm run dev` if this fails):
 *   npx tsx scripts/apply-vehicle-type-migration.ts
 */
import "dotenv/config";
import pg from "pg";

const MIGRATION_NAME = "20260807120000_add_visitor_vehicle_type";

function prismaDevConnectionString(raw: string): string {
  const url = new URL(raw);
  // Prisma Dev local Postgres is sensitive to pool / timeout settings.
  url.searchParams.set("sslmode", "disable");
  url.searchParams.set("connection_limit", "10");
  url.searchParams.set("connect_timeout", "0");
  url.searchParams.set("max_idle_connection_lifetime", "0");
  url.searchParams.set("pool_timeout", "0");
  url.searchParams.set("socket_timeout", "0");
  return url.toString();
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const connectionString = prismaDevConnectionString(databaseUrl);
  const pool = new pg.Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 0,
    idleTimeoutMillis: 0,
    allowExitOnIdle: true,
    ssl: false,
  });

  const client = await pool.connect();

  try {
    const before = await client.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'visitors'
         AND column_name = 'vehicleType'`,
    );
    console.log("vehicleType exists before:", (before.rowCount ?? 0) > 0);

    await client.query(
      `ALTER TABLE "visitors" ADD COLUMN IF NOT EXISTS "vehicleType" TEXT`,
    );

    const after = await client.query(
      `SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'visitors'
         AND column_name = 'vehicleType'`,
    );
    console.log("vehicleType exists after:", (after.rowCount ?? 0) > 0);

    const existing = await client.query(
      `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1`,
      [MIGRATION_NAME],
    );

    if ((existing.rowCount ?? 0) === 0) {
      await client.query(
        `INSERT INTO "_prisma_migrations"
          (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
         VALUES
          ($1, $2, NOW(), $3, NULL, NULL, NOW(), 1)`,
        [crypto.randomUUID(), "manual-apply-vehicle-type", MIGRATION_NAME],
      );
      console.log("Recorded migration:", MIGRATION_NAME);
    } else {
      console.log("Migration already recorded:", MIGRATION_NAME);
    }

    console.log("Done.");
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
