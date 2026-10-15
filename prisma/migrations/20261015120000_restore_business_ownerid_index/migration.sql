-- Restore the Business owner index removed by the rate limit migration.
CREATE INDEX "Business_ownerId_idx" ON "Business"("ownerId");
