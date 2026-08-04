import { handleRouteError } from "@/server/api";
import { restoreBackupController } from "@/server/controllers/ops.controller";

export async function POST(request: Request) {
  try {
    return await restoreBackupController(request);
  } catch (error) {
    return handleRouteError(error, {
      path: "/api/backup/restore",
      method: "POST",
    });
  }
}
