-- Additional members count (companions besides the main visitor).
ALTER TABLE "visitors" ADD COLUMN IF NOT EXISTS "additionalMembers" INTEGER NOT NULL DEFAULT 0;
