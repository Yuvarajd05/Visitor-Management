-- Session timeout default: 12 hours 30 minutes (750 minutes).
ALTER TABLE "system_settings" ALTER COLUMN "sessionTimeoutMinutes" SET DEFAULT 750;
UPDATE "system_settings" SET "sessionTimeoutMinutes" = 750 WHERE "id" = 'default';
