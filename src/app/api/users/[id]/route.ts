import { handleRouteError } from "@/server/api";
import {
  getUserController,
  updateUserController,
} from "@/server/controllers/user.controller";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    return await getUserController(context.params);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    return await updateUserController(request, context.params);
  } catch (error) {
    return handleRouteError(error);
  }
}
