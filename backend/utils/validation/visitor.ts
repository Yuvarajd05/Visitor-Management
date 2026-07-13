import { z } from "zod";

import { ID_PROOF_TYPES } from "@/types/visitor";

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

const optionalVehicleSchema = z
  .string()
  .trim()
  .max(20, "Vehicle number must be 20 characters or less")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

const optionalIdProofTypeSchema = z
  .union([z.enum(ID_PROOF_TYPES), z.literal("")])
  .optional()
  .transform((value) => (value === "" || value === undefined ? undefined : value));

const optionalIdProofNumberSchema = z
  .string()
  .trim()
  .max(50, "ID proof number must be 50 characters or less")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

const requiredText = (label: string, max = 150) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or less`);

export const createVisitorSchema = z.object({
  fullName: requiredText("Full name", 120),
  phone: phoneSchema,
  company: requiredText("Company", 120),
  purpose: requiredText("Purpose", 200),
  personToMeet: requiredText("Person to meet", 120),
  idProofType: optionalIdProofTypeSchema,
  idProofNumber: optionalIdProofNumberSchema,
  vehicleNumber: optionalVehicleSchema,
});

export const updateVisitorSchema = z.object({
  fullName: requiredText("Full name", 120).optional(),
  phone: phoneSchema.optional(),
  company: requiredText("Company", 120).optional(),
  purpose: requiredText("Purpose", 200).optional(),
  personToMeet: requiredText("Person to meet", 120).optional(),
  idProofType: optionalIdProofTypeSchema,
  idProofNumber: optionalIdProofNumberSchema,
  vehicleNumber: z
    .string()
    .trim()
    .max(20, "Vehicle number must be 20 characters or less")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value)),
});

export const visitorListQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["ALL", "CHECKED_IN", "CHECKED_OUT"]).optional().default("ALL"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z
    .enum(["checkInTime", "fullName", "visitorCode"])
    .optional()
    .default("checkInTime"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const visitorIdParamSchema = z.object({
  id: z.string().trim().min(1, "Visitor ID is required"),
});

export type CreateVisitorFormValues = z.infer<typeof createVisitorSchema>;
export type UpdateVisitorFormValues = z.infer<typeof updateVisitorSchema>;
export type VisitorListQueryValues = z.infer<typeof visitorListQuerySchema>;
