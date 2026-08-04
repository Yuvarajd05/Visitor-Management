import { prisma } from "@/server/prisma/client";
import type {
  PublicSystemSettings,
  SystemSettingsRecord,
} from "@/types/system";
import type { UpdateSystemSettingsValues } from "@/server/validation/system";

const DEFAULT_SETTINGS = {
  id: "default",
  companyName: "Invenger",
  sessionTimeoutMinutes: 10080,
  passwordMinLength: 8,
  passwordRequireUpper: true,
  passwordRequireLower: true,
  passwordRequireNumber: true,
  passwordRequireSpecial: false,
  maxFailedLogins: 5,
  lockoutMinutes: 15,
  rateLimitWindowMinutes: 15,
  rateLimitMaxAttempts: 20,
  smtpPort: 587,
  smtpSecure: false,
  notifyHostOnCheckIn: true,
  notifyHostOnCheckOut: false,
  notifyAdminOnCheckIn: true,
  notifyAdminOnCheckOut: true,
} as const;

export async function getSystemSettings(): Promise<SystemSettingsRecord> {
  const existing = await prisma.systemSettings.findUnique({
    where: { id: "default" },
  });

  if (existing) {
    return existing;
  }

  return prisma.systemSettings.create({
    data: { ...DEFAULT_SETTINGS },
  });
}

export async function getPublicSystemSettings(): Promise<PublicSystemSettings> {
  const settings = await getSystemSettings();

  return {
    companyName: settings.companyName,
    sessionTimeoutMinutes: settings.sessionTimeoutMinutes,
    passwordMinLength: settings.passwordMinLength,
    passwordRequireUpper: settings.passwordRequireUpper,
    passwordRequireLower: settings.passwordRequireLower,
    passwordRequireNumber: settings.passwordRequireNumber,
    passwordRequireSpecial: settings.passwordRequireSpecial,
  };
}

export async function updateSystemSettings(
  input: UpdateSystemSettingsValues,
): Promise<SystemSettingsRecord> {
  await getSystemSettings();

  return prisma.systemSettings.update({
    where: { id: "default" },
    data: input,
  });
}

export function assertPasswordPolicy(
  password: string,
  settings: Pick<
    SystemSettingsRecord,
    | "passwordMinLength"
    | "passwordRequireUpper"
    | "passwordRequireLower"
    | "passwordRequireNumber"
    | "passwordRequireSpecial"
  >,
): string | null {
  if (password.length < settings.passwordMinLength) {
    return `Password must be at least ${settings.passwordMinLength} characters.`;
  }

  if (settings.passwordRequireUpper && !/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }

  if (settings.passwordRequireLower && !/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }

  if (settings.passwordRequireNumber && !/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }

  if (
    settings.passwordRequireSpecial &&
    !/[!@#$%^&*(),.?":{}|<>_\-\[\]\\/;'`~+=]/.test(password)
  ) {
    return "Password must include at least one special character.";
  }

  return null;
}
