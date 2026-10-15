CREATE TABLE "EmailClassification" (
    "id" TEXT NOT NULL,
    "businessId" TEXT NOT NULL,
    "externalId" TEXT,
    "categoria" TEXT NOT NULL,
    "prioridad" TEXT NOT NULL,
    "resumen" TEXT NOT NULL,
    "requiereAccion" BOOLEAN NOT NULL,
    "accionSugerida" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailClassification_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "EmailClassification_businessId_externalId_key" ON "EmailClassification"("businessId", "externalId");
CREATE INDEX "EmailClassification_businessId_createdAt_idx" ON "EmailClassification"("businessId", "createdAt");

ALTER TABLE "EmailClassification" ADD CONSTRAINT "EmailClassification_businessId_fkey"
FOREIGN KEY ("businessId") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
