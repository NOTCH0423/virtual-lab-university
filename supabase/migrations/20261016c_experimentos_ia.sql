-- Experimentos asistidos por IA (aditivo, idempotente)
ALTER TABLE "experiments" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'PUBLISHED';
ALTER TABLE "experiments" ADD COLUMN IF NOT EXISTS "content" JSONB;
ALTER TABLE "experiments" ADD COLUMN IF NOT EXISTS "aiGenerated" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "experiments" ADD COLUMN IF NOT EXISTS "createdById" TEXT;
CREATE TABLE IF NOT EXISTS "ai_generation_logs" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'experiment',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ai_generation_logs_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ai_generation_logs_userId_createdAt_idx" ON "ai_generation_logs"("userId", "createdAt");
ALTER TABLE "ai_generation_logs" ENABLE ROW LEVEL SECURITY;
