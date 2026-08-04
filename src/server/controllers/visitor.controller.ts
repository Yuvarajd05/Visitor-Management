import {
  apiCreated,
  apiMessage,
  apiSuccess,
  parseRequestBody,
  parseSearchParams,
  requireApiUser,
} from "@/server/api";
import { writeAuditLog } from "@/server/services/audit.service";
import { notifyVisitorCheckIn, notifyVisitorCheckOut } from "@/server/services/notification.service";
import {
  checkoutVisitor,
  createVisitor,
  deleteVisitor,
  getVisitorById,
  listVisitors,
  updateVisitor,
} from "@/server/services/visitor.service";
import {
  createVisitorSchema,
  updateVisitorSchema,
  visitorIdParamSchema,
  visitorListQuerySchema,
} from "@/server/validation/visitor";

export async function listVisitorsController(request: Request) {
  await requireApiUser();
  const query = parseSearchParams(
    visitorListQuerySchema,
    new URL(request.url).searchParams,
  );
  const result = await listVisitors(query);
  return apiSuccess(result);
}

export async function createVisitorController(request: Request) {
  const user = await requireApiUser();
  const body = parseRequestBody(createVisitorSchema, await request.json());
  const visitor = await createVisitor(body, user.id);

  await writeAuditLog({
    action: "VISITOR_CREATED",
    entityType: "VISITOR",
    entityId: visitor.id,
    summary: `Registered visitor ${visitor.visitorCode} (${visitor.fullName})`,
    actorId: user.id,
    actorEmail: user.email,
  });

  void notifyVisitorCheckIn(visitor);

  return apiCreated(visitor, "Visitor registered successfully.");
}

export async function getVisitorController(params: Promise<{ id: string }>) {
  await requireApiUser();
  const { id } = visitorIdParamSchema.parse(await params);
  const visitor = await getVisitorById(id);
  return apiSuccess(visitor);
}

export async function updateVisitorController(
  request: Request,
  params: Promise<{ id: string }>,
) {
  const user = await requireApiUser();
  const { id } = visitorIdParamSchema.parse(await params);
  const body = parseRequestBody(updateVisitorSchema, await request.json());
  const visitor = await updateVisitor(id, body);

  await writeAuditLog({
    action: "VISITOR_UPDATED",
    entityType: "VISITOR",
    entityId: visitor.id,
    summary: `Updated visitor ${visitor.visitorCode}`,
    actorId: user.id,
    actorEmail: user.email,
  });

  return apiSuccess(visitor, "Visitor updated successfully.");
}

export async function deleteVisitorController(params: Promise<{ id: string }>) {
  const user = await requireApiUser();
  const { id } = visitorIdParamSchema.parse(await params);
  const existing = await getVisitorById(id);
  await deleteVisitor(id);

  await writeAuditLog({
    action: "VISITOR_DELETED",
    entityType: "VISITOR",
    entityId: id,
    summary: `Deleted visitor ${existing.visitorCode}`,
    actorId: user.id,
    actorEmail: user.email,
  });

  return apiMessage("Visitor deleted successfully.");
}

export async function checkoutVisitorController(params: Promise<{ id: string }>) {
  const user = await requireApiUser();
  const { id } = visitorIdParamSchema.parse(await params);
  const visitor = await checkoutVisitor(id);

  await writeAuditLog({
    action: "VISITOR_CHECKED_OUT",
    entityType: "VISITOR",
    entityId: visitor.id,
    summary: `Checked out visitor ${visitor.visitorCode}`,
    actorId: user.id,
    actorEmail: user.email,
  });

  void notifyVisitorCheckOut(visitor);

  return apiSuccess(visitor, "Visitor checked out successfully.");
}
