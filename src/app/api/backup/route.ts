import { handleRouteError } from "@/server/api";
import { createBackupController } from "@/server/controllers/ops.controller";

export async function GET() {
  try {
    return await createBackupController();
  } catch (error) {
    return handleRouteError(error, { path: "/api/backup", method: "GET" });
  }
}
