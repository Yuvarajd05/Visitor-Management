import {
  apiCreated,
  apiSuccess,
  handleRouteError,
  parseRequestBody,
  parseSearchParams,
  requireApiUser,
} from "@/lib/api";
import {
  createVisitor,
  listVisitors,
} from "@/services/visitor.service";
import {
  createVisitorSchema,
  visitorListQuerySchema,
} from "@/utils/validation/visitor";

export async function POST(request: Request) {
  try {
    const user = await requireApiUser();
    const body = parseRequestBody(createVisitorSchema, await request.json());
    const visitor = await createVisitor(body, user.id);

    return apiCreated(visitor, "Visitor registered successfully.");
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function GET(request: Request) {
  try {
    await requireApiUser();
    const query = parseSearchParams(
      visitorListQuerySchema,
      new URL(request.url).searchParams,
    );
    const result = await listVisitors(query);

    return apiSuccess(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
