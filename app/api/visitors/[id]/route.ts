import {
  apiMessage,
  apiSuccess,
  handleRouteError,
  parseRequestBody,
  requireApiUser,
} from "@/lib/api";
import {
  deleteVisitor,
  getVisitorById,
  updateVisitor,
} from "@/services/visitor.service";
import {
  updateVisitorSchema,
  visitorIdParamSchema,
} from "@/utils/validation/visitor";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = visitorIdParamSchema.parse(await context.params);
    const visitor = await getVisitorById(id);

    return apiSuccess(visitor);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = visitorIdParamSchema.parse(await context.params);
    const body = parseRequestBody(updateVisitorSchema, await request.json());
    const visitor = await updateVisitor(id, body);

    return apiSuccess(visitor, "Visitor updated successfully.");
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    await requireApiUser();
    const { id } = visitorIdParamSchema.parse(await context.params);
    await deleteVisitor(id);

    return apiMessage("Visitor deleted successfully.");
  } catch (error) {
    return handleRouteError(error);
  }
}
