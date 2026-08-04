import { handleRouteError } from "@/server/api";
import {
  deleteVisitorController,
  getVisitorController,
  updateVisitorController,
} from "@/server/controllers/visitor.controller";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    return await getVisitorController(context.params);
  } catch (error) {
    return handleRouteError(error, {
      path: "/api/visitors/[id]",
      method: "GET",
    });
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    return await updateVisitorController(request, context.params);
  } catch (error) {
    return handleRouteError(error, {
      path: "/api/visitors/[id]",
      method: "PUT",
    });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    return await deleteVisitorController(context.params);
  } catch (error) {
    return handleRouteError(error, {
      path: "/api/visitors/[id]",
      method: "DELETE",
    });
  }
}
