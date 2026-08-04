import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

const optionalEmailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? undefined : value));

const requiredText = (label: string, max = 150) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(max, `${label} must be ${max} characters or less`);

export const createEmployeeSchema = z.object({
  fullName: requiredText("Full name", 120),
  email: optionalEmailSchema,
  phone: phoneSchema,
  department: requiredText("Department", 120),
  designation: requiredText("Designation", 120),
  isActive: z.boolean().optional().default(true),
});

export const updateEmployeeSchema = z.object({
  fullName: requiredText("Full name", 120).optional(),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .nullable()
    .optional()
    .or(z.literal(""))
    .transform((value) => (value === "" ? null : value)),
  phone: phoneSchema.optional(),
  department: requiredText("Department", 120).optional(),
  designation: requiredText("Designation", 120).optional(),
  isActive: z.boolean().optional(),
});

export const employeeListQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).optional().default("ALL"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z
    .enum(["fullName", "employeeCode", "department", "createdAt"])
    .optional()
    .default("fullName"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const employeeIdParamSchema = z.object({
  id: z.string().trim().min(1, "Employee ID is required"),
});

export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeSchema>;
export type EmployeeListQueryValues = z.infer<typeof employeeListQuerySchema>;
