-- Optional visitor address (shown on print pass).
ALTER TABLE "visitors" ADD COLUMN IF NOT EXISTS "address" TEXT;
