-- AlterTable
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "smtpHost" TEXT;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "smtpPort" INTEGER NOT NULL DEFAULT 587;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "smtpSecure" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "smtpUser" TEXT;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "smtpPass" TEXT;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "smtpFrom" TEXT;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "adminNotificationEmail" TEXT;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "notifyHostOnCheckIn" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "notifyHostOnCheckOut" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "notifyAdminOnCheckIn" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "system_settings" ADD COLUMN IF NOT EXISTS "notifyAdminOnCheckOut" BOOLEAN NOT NULL DEFAULT true;
