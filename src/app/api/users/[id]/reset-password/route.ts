import { handleRouteError } from "@/server/api";
import { resetUserPasswordController } from "@/server/controllers/user.controller";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, context: RouteContext) {
  try {
    return await resetUserPasswordController(request, context.params);
  } catch (error) {
    return handleRouteError(error);
  }
}
