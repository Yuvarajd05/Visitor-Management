import {
  apiSuccess,
  handleRouteError,
  requireApiUser,
} from "@/lib/api";
import { checkoutVisitor } from "@/services/visitor.service";
import { visitorIdParamSchema } from "@/utils/validation/visitor";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = visitorIdParamSchema.parse(await context.params);
    const visitor = await checkoutVisitor(id);

    return apiSuccess(visitor, "Visitor checked out successfully.");
  } catch (error) {
    return handleRouteError(error);
  }
}
