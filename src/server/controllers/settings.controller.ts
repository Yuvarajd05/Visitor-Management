import { AppError } from "@/lib/errors";
import {
  apiSuccess,
  parseRequestBody,
  requireApiAdmin,
  requireApiUser,
} from "@/server/api";
import type { Prisma } from "@/server/prisma/generated/client";
import { sendTestEmail } from "@/server/mail";
import { writeAuditLog } from "@/server/services/audit.service";
import {
  getPublicSystemSettings,
  getSystemSettings,
  toClientSystemSettings,
  updateSystemSettings,
} from "@/server/services/settings.service";
import {
  testEmailSchema,
  updateSystemSettingsSchema,
  type UpdateSystemSettingsValues,
} from "@/server/validation/system";

function redactSettingsAuditMetadata(
  body: UpdateSystemSettingsValues,
): Prisma.InputJsonValue {
  const metadata: Record<string, unknown> = { ...body };
  if (metadata.smtpPass != null && metadata.smtpPass !== "") {
    metadata.smtpPass = "[REDACTED]";
  }
  return metadata as Prisma.InputJsonValue;
}

export async function getSettingsController() {
  const user = await requireApiUser();

  if (user.role === "ADMIN") {
    return apiSuccess(toClientSystemSettings(await getSystemSettings()));
  }

  return apiSuccess(await getPublicSystemSettings());
}

export async function updateSettingsController(request: Request) {
  const admin = await requireApiAdmin();
  const body = parseRequestBody(
    updateSystemSettingsSchema,
    await request.json(),
  );
  const settings = await updateSystemSettings(body);

  await writeAuditLog({
    action: "SETTINGS_UPDATED",
    entityType: "SYSTEM",
    summary: "System settings updated",
    actorId: admin.id,
    actorEmail: admin.email,
    metadata: redactSettingsAuditMetadata(body),
  });

  return apiSuccess(
    toClientSystemSettings(settings),
    "Settings updated successfully.",
  );
}

export async function getPublicSettingsController() {
  return apiSuccess(await getPublicSystemSettings());
}

export async function testEmailController(request: Request) {
  const admin = await requireApiAdmin();
  const body = parseRequestBody(testEmailSchema, await request.json());
  const result = await sendTestEmail(body.to);

  if (!result.emailed) {
    throw new AppError(
      result.error || "Failed to send test email. Check SMTP settings.",
      400,
    );
  }

  await writeAuditLog({
    action: "SMTP_TEST_SENT",
    entityType: "SYSTEM",
    summary: `SMTP test email sent to ${body.to}`,
    actorId: admin.id,
    actorEmail: admin.email,
    metadata: { mode: result.mode, previewUrl: result.previewUrl },
  });

  return apiSuccess(
    {
      mode: result.mode,
      previewUrl: result.previewUrl,
    },
    result.mode === "ethereal"
      ? "Test email sent via Ethereal. Check the server console for the preview link."
      : "Test email sent successfully.",
  );
}
