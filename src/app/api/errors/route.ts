import { handleRouteError } from "@/server/api";
import { listErrorLogsController } from "@/server/controllers/ops.controller";

export async function GET(request: Request) {
  try {
    return await listErrorLogsController(request);
  } catch (error) {
    return handleRouteError(error);
  }
}
