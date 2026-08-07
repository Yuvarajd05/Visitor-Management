import { z } from "zod";

/** Accepts a full email or a simple username (e.g. admin, security). */
export const loginIdentifierSchema = z
  .string()
  .trim()
  .min(1, "Email or username is required")
  .max(120, "Email or username is too long")
  .refine(
    (value) =>
      z.string().email().safeParse(value).success ||
      /^[a-zA-Z0-9._+-]+$/.test(value),
    "Enter a valid email or username",
  )
  .transform((value) => value.toLowerCase());

export const loginSchema = z.object({
  email: loginIdentifierSchema,
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be 72 characters or less")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter")
  .regex(/[a-z]/, "Password must include at least one lowercase letter")
  .regex(/[0-9]/, "Password must include at least one number");

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;
