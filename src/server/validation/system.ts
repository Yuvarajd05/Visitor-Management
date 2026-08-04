import { z } from "zod";

const optionalEmail = z
  .string()
  .trim()
  .email("Enter a valid email")
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

const optionalText = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .transform((value) => (value === "" ? null : value));

export const updateSystemSettingsSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(120)
    .optional(),
  sessionTimeoutMinutes: z.coerce.number().int().min(60).max(20160).optional(),
  passwordMinLength: z.coerce.number().int().min(6).max(32).optional(),
  passwordRequireUpper: z.boolean().optional(),
  passwordRequireLower: z.boolean().optional(),
  passwordRequireNumber: z.boolean().optional(),
  passwordRequireSpecial: z.boolean().optional(),
  maxFailedLogins: z.coerce.number().int().min(3).max(20).optional(),
  lockoutMinutes: z.coerce.number().int().min(1).max(1440).optional(),
  rateLimitWindowMinutes: z.coerce.number().int().min(1).max(120).optional(),
  rateLimitMaxAttempts: z.coerce.number().int().min(5).max(200).optional(),
  smtpHost: optionalText,
  smtpPort: z.coerce.number().int().min(1).max(65535).optional(),
  smtpSecure: z.boolean().optional(),
  smtpUser: optionalText,
  smtpPass: optionalText,
  smtpFrom: optionalText,
  adminNotificationEmail: optionalEmail,
  notifyHostOnCheckIn: z.boolean().optional(),
  notifyHostOnCheckOut: z.boolean().optional(),
  notifyAdminOnCheckIn: z.boolean().optional(),
  notifyAdminOnCheckOut: z.boolean().optional(),
});

export const testEmailSchema = z.object({
  to: z.string().trim().email("Enter a valid email address"),
});

export const auditListQuerySchema = z.object({
  search: z.string().trim().optional(),
  entityType: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export const errorListQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(20),
});

export type UpdateSystemSettingsValues = z.infer<
  typeof updateSystemSettingsSchema
>;
export type AuditListQueryValues = z.infer<typeof auditListQuerySchema>;
export type ErrorListQueryValues = z.infer<typeof errorListQuerySchema>;
export type TestEmailValues = z.infer<typeof testEmailSchema>;
