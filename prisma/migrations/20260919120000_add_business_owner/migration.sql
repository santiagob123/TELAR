-- AlterTable
ALTER TABLE "Business" ADD COLUMN "ownerId" TEXT;

-- CreateIndex
CREATE INDEX "Business_ownerId_idx" ON "Business"("ownerId");

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
