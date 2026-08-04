/**
 * Feature-facing Zod schemas for visitors.
 * Server remains source of truth under `@/server/validation/visitor`.
 */
export {
  createVisitorSchema,
  updateVisitorSchema,
  visitorListQuerySchema,
  visitorIdParamSchema,
  type CreateVisitorFormValues,
  type UpdateVisitorFormValues,
  type VisitorListQueryValues,
} from "@/server/validation/visitor";
