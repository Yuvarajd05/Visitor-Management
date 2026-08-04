import { handleRouteError } from "@/server/api";
import { getReportController } from "@/server/controllers/ops.controller";

export async function GET(request: Request) {
  try {
    return await getReportController(request);
  } catch (error) {
    return handleRouteError(error);
  }
}
