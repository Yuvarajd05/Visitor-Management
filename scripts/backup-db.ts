/**
 * Simple PostgreSQL logical dump helper.
 * Usage: npm run db:backup
 *
 * Requires `pg_dump` on PATH (Postgres client tools).
 */
import { spawn } from "child_process";
import { mkdir } from "fs/promises";
import path from "path";

import "dotenv/config";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = path.join(process.cwd(), "storage", "temp");
  await mkdir(outDir, { recursive: true });
  const outFile = path.join(outDir, `invenger-vms-${stamp}.sql`);

  await new Promise<void>((resolve, reject) => {
    const child = spawn("pg_dump", [databaseUrl, "-f", outFile], {
      stdio: "inherit",
      shell: process.platform === "win32",
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`pg_dump exited with code ${code}`));
    });
  });

  console.log(`Backup written to ${outFile}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
