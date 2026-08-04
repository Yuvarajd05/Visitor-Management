-- AlterTable
ALTER TABLE "visitors" DROP COLUMN IF EXISTS "email";
ALTER TABLE "visitors" ALTER COLUMN "idProofType" DROP NOT NULL;
ALTER TABLE "visitors" ALTER COLUMN "idProofNumber" DROP NOT NULL;
