-- Session invalidation support: bump tokenVersion on password change/reset.
-- Existing users default to 0; JWTs without the claim are treated as version 0.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "tokenVersion" INTEGER NOT NULL DEFAULT 0;
