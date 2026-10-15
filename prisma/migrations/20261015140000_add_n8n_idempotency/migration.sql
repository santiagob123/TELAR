ALTER TABLE "Message" ADD COLUMN "idempotencyKey" TEXT;
CREATE UNIQUE INDEX "Message_idempotencyKey_key" ON "Message"("idempotencyKey");

CREATE TABLE "N8nIdempotency" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "payloadHash" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "response" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "N8nIdempotency_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "N8nIdempotency_key_key" ON "N8nIdempotency"("key");
CREATE INDEX "N8nIdempotency_expiresAt_idx" ON "N8nIdempotency"("expiresAt");
