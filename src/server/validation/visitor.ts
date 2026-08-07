import { z } from "zod";

import {
  ID_PROOF_TYPES,
  PERSON_TO_MEET_OPTIONS,
  PERSON_TO_MEET_OTHER_OPTION,
  PURPOSE_OTHER_OPTION,
  VEHICLE_TYPE_OPTIONS,
  VEHICLE_TYPE_OTHER_OPTION,
  VISITING_PURPOSE_OPTIONS,
} from "@/types/visitor";
import { isValidPhoneValue, parsePhoneValue } from "@/lib/country-codes";

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine((value) => isValidPhoneValue(value), {
    message:
      "Enter a valid phone number (India: 10 digits; other countries: 6–12 digits)",
  })
  .transform((value) => {
    const parsed = parsePhoneValue(value);
    return parsed.e164 || value;
  });

const personToMeetSchema = z
  .string()
  .trim()
  .min(1, "Person to meet is required")
  .max(120, "Person to meet must be 120 characters or less")
  .refine(
    (value) => {
      if ((PERSON_TO_MEET_OPTIONS as readonly string[]).includes(value)) {
        return true;
      }
      // Custom typed host: any non-empty text except the bare "Other" label
      return value !== PERSON_TO_MEET_OTHER_OPTION;
    },
    {
      message: "Select a person from the list or enter a custom name",
    },
  );

const purposeSchema = z
  .string()
  .trim()
  .min(1, "Visiting reason is required")
  .max(200, "Visiting reason must be 200 characters or less")
  .refine(
    (value) => {
      if ((VISITING_PURPOSE_OPTIONS as readonly string[]).includes(value)) {
        return true;
      }
      // Custom "Other" reasons: any non-empty text that is not the bare "Other" label
      return value !== PURPOSE_OTHER_OPTION;
    },
    {
      message: "Select a visiting reason or enter a custom reason",
    },
  );

const optionalVehicleTypeSchema = z
  .string()
  .trim()
  .max(80, "Vehicle type must be 80 characters or less")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value))
  .refine(
    (value) => {
      if (!value) {
        return true;
      }
      if ((VEHICLE_TYPE_OPTIONS as readonly string[]).includes(value)) {
        return true;
      }
      return value !== VEHICLE_TYPE_OTHER_OPTION;
    },
    {
      message: "Select a vehicle type or enter a custom type",
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

const optionalAddressSchema = z
  .string()
  .trim()
  .max(250, "Address must be 250 characters or less")
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
  address: optionalAddressSchema,
  purpose: purposeSchema,
  personToMeet: personToMeetSchema,
  idProofType: optionalIdProofTypeSchema,
  idProofNumber: optionalIdProofNumberSchema,
  vehicleType: optionalVehicleTypeSchema,
  vehicleNumber: optionalVehicleSchema,
  additionalMembers: z.coerce.number().int().min(0).max(10).default(0),
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
  address: z
    .string()
    .trim()
    .max(250, "Address must be 250 characters or less")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value)),
  purpose: purposeSchema.optional(),
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
  vehicleType: z
    .string()
    .trim()
    .max(80, "Vehicle type must be 80 characters or less")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value))
    .refine(
      (value) => {
        if (!value) {
          return true;
        }
        if ((VEHICLE_TYPE_OPTIONS as readonly string[]).includes(value)) {
          return true;
        }
        return value !== VEHICLE_TYPE_OTHER_OPTION;
      },
      {
        message: "Select a vehicle type or enter a custom type",
      },
    ),
  vehicleNumber: z
    .string()
    .trim()
    .max(20, "Vehicle number must be 20 characters or less")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value)),
  additionalMembers: z.coerce.number().int().min(0).max(10).optional(),
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
