import { handleRouteError } from "@/server/api";
import { getDashboardController } from "@/server/controllers/ops.controller";

export async function GET(request: Request) {
  try {
    return await getDashboardController(request);
  } catch (error) {
    return handleRouteError(error);
  }
}
