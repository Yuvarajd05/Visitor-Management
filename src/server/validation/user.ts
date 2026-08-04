import { z } from "zod";

import { passwordSchema } from "@/server/utils/validation";

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .transform((value) => value.toLowerCase()),
  password: passwordSchema,
  role: z.enum(["ADMIN", "SECURITY"]),
  isActive: z.boolean().optional().default(true),
  mustChangePassword: z.boolean().optional().default(true),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(120, "Name must be 120 characters or less")
    .optional(),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .transform((value) => value.toLowerCase())
    .optional(),
  role: z.enum(["ADMIN", "SECURITY"]).optional(),
  isActive: z.boolean().optional(),
});

export const userListQuerySchema = z.object({
  search: z.string().trim().optional(),
  role: z.enum(["ALL", "ADMIN", "SECURITY"]).optional().default("ALL"),
  status: z.enum(["ALL", "ACTIVE", "INACTIVE"]).optional().default("ALL"),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  sortBy: z
    .enum(["name", "email", "role", "createdAt"])
    .optional()
    .default("name"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("asc"),
});

export const userIdParamSchema = z.object({
  id: z.string().trim().min(1, "User ID is required"),
});

export const adminResetPasswordSchema = z
  .object({
    temporaryPassword: passwordSchema.optional(),
    generatePassword: z.boolean().optional().default(true),
  })
  .refine(
    (data) => data.generatePassword || Boolean(data.temporaryPassword),
    {
      message: "Provide a temporary password or enable generatePassword.",
      path: ["temporaryPassword"],
    },
  );

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
export type UpdateUserFormValues = z.infer<typeof updateUserSchema>;
export type UserListQueryValues = z.infer<typeof userListQuerySchema>;
export type AdminResetPasswordFormValues = z.infer<
  typeof adminResetPasswordSchema
>;
