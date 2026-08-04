import { handleRouteError } from "@/server/api";
import { checkoutVisitorController } from "@/server/controllers/visitor.controller";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    return await checkoutVisitorController(context.params);
  } catch (error) {
    return handleRouteError(error, {
      path: "/api/visitors/[id]/checkout",
      method: "PATCH",
    });
  }
}
