import { handleRouteError } from "@/server/api";
import { listAuditLogsController } from "@/server/controllers/ops.controller";

export async function GET(request: Request) {
  try {
    return await listAuditLogsController(request);
  } catch (error) {
    return handleRouteError(error);
  }
}
