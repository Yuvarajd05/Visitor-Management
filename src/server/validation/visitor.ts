import { z } from "zod";

import { ID_PROOF_TYPES, PERSON_TO_MEET_OPTIONS } from "@/types/visitor";

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

const personToMeetSchema = z
  .string()
  .trim()
  .min(1, "Person to meet is required")
  .refine(
    (value) =>
      (PERSON_TO_MEET_OPTIONS as readonly string[]).includes(value),
    {
      message: "Select a person from the list",
    },
  );

const optionalVehicleSchema = z
  .string()
  .trim()
  .max(20, "Vehicle number must be 20 characters or less")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

const optionalCompanySchema = z
  .string()
  .trim()
  .max(120, "Company must be 120 characters or less")
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

const optionalPhotoDataUrlSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) =>
      !value ||
      value === "" ||
      /^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value),
    {
      message: "Photo must be a valid image capture.",
    },
  )
  .transform((value) => (value === "" || value === undefined ? undefined : value));

const requiredText = (label: string, max = 150) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or less`);

export const createVisitorSchema = z.object({
  fullName: requiredText("Full name", 120),
  phone: phoneSchema,
  company: optionalCompanySchema,
  purpose: requiredText("Purpose", 200),
  personToMeet: personToMeetSchema,
  idProofType: optionalIdProofTypeSchema,
  idProofNumber: optionalIdProofNumberSchema,
  vehicleNumber: optionalVehicleSchema,
  photoDataUrl: optionalPhotoDataUrlSchema,
});

export const updateVisitorSchema = z.object({
  fullName: requiredText("Full name", 120).optional(),
  phone: phoneSchema.optional(),
  company: z
    .string()
    .trim()
    .max(120, "Company must be 120 characters or less")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value)),
  purpose: requiredText("Purpose", 200).optional(),
  personToMeet: personToMeetSchema.optional(),
  idProofType: z
    .union([z.enum(ID_PROOF_TYPES), z.literal(""), z.null()])
    .optional()
    .transform((value) => (value === "" ? null : value)),
  idProofNumber: z
    .string()
    .trim()
    .max(50, "ID proof number must be 50 characters or less")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value)),
  vehicleNumber: z
    .string()
    .trim()
    .max(20, "Vehicle number must be 20 characters or less")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value)),
  photoDataUrl: optionalPhotoDataUrlSchema.nullable().optional(),
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
