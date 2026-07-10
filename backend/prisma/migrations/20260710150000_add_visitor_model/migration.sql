-- CreateEnum
CREATE TYPE "VisitorStatus" AS ENUM ('CHECKED_IN', 'CHECKED_OUT');

-- CreateTable
CREATE TABLE "visitors" (
    "id" TEXT NOT NULL,
    "visitorCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "company" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "personToMeet" TEXT NOT NULL,
    "idProofType" TEXT NOT NULL,
    "idProofNumber" TEXT NOT NULL,
    "vehicleNumber" TEXT,
    "checkInTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOutTime" TIMESTAMP(3),
    "status" "VisitorStatus" NOT NULL DEFAULT 'CHECKED_IN',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visitors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "visitors_visitorCode_key" ON "visitors"("visitorCode");

-- CreateIndex
CREATE INDEX "visitors_status_idx" ON "visitors"("status");

-- CreateIndex
CREATE INDEX "visitors_fullName_idx" ON "visitors"("fullName");

-- CreateIndex
CREATE INDEX "visitors_phone_idx" ON "visitors"("phone");

-- CreateIndex
CREATE INDEX "visitors_checkInTime_idx" ON "visitors"("checkInTime");

-- AddForeignKey
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
