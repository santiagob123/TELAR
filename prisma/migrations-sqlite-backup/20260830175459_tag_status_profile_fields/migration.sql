-- AlterTable
ALTER TABLE "Business" ADD COLUMN "address" TEXT;
ALTER TABLE "Business" ADD COLUMN "email" TEXT;
ALTER TABLE "Business" ADD COLUMN "facebook" TEXT;
ALTER TABLE "Business" ADD COLUMN "instagram" TEXT;
ALTER TABLE "Business" ADD COLUMN "linkedin" TEXT;
ALTER TABLE "Business" ADD COLUMN "openingHours" TEXT;
ALTER TABLE "Business" ADD COLUMN "website" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "profileId" TEXT,
    CONSTRAINT "Tag_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "DigitalProfile" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Tag" ("id", "identifier", "profileId") SELECT "id", "identifier", "profileId" FROM "Tag";
DROP TABLE "Tag";
ALTER TABLE "new_Tag" RENAME TO "Tag";
CREATE UNIQUE INDEX "Tag_identifier_key" ON "Tag"("identifier");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
