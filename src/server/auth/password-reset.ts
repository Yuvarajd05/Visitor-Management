import { createHash, randomBytes } from "crypto";

import { APP_NAME } from "@/lib/constants";
import { getAppBaseUrl, sendMail } from "@/server/mail";

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + RESET_TOKEN_EXPIRY_MS);
}

export { getAppBaseUrl };

export function buildPasswordResetUrl(token: string): string {
  return `${getAppBaseUrl()}/reset-password?token=${encodeURIComponent(token)}`;
}

/**
 * Delivers the reset link via shared mail transport (SMTP / Ethereal / none).
 */
export async function deliverPasswordResetLink(options: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const { to, name, resetUrl } = options;

  console.info(`[password-reset] Reset link for ${to}: ${resetUrl}`);

  return sendMail({
    to,
    subject: `${APP_NAME} — Reset your password`,
    text: [
      `Hi ${name},`,
      "",
      "We received a request to reset your password.",
      "Open this link to choose a new password (expires in 1 hour):",
      resetUrl,
      "",
      "If you did not request this, you can ignore this email.",
    ].join("\n"),
    html: `
      <p>Hi ${name},</p>
      <p>We received a request to reset your password.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>This link expires in 1 hour. If you did not request this, you can ignore this email.</p>
    `,
  });
}
