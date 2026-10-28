-- Migración ADITIVA: tabla "grades" usada por el módulo de notas de la UI (jules-fixes).
-- El esquema de la rama de BD solo traía "subject_grades"; se conserva "grades" para
-- que las páginas/APIs de notas existentes sigan funcionando.
CREATE TABLE IF NOT EXISTS "grades" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "courseId" TEXT,
    "experimentId" TEXT,
    "subject" TEXT,
    "title" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL DEFAULT 5,
    "comment" TEXT,
    "period" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "grades_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "grades_studentId_idx" ON "grades"("studentId");
CREATE INDEX IF NOT EXISTS "grades_teacherId_idx" ON "grades"("teacherId");
CREATE INDEX IF NOT EXISTS "grades_courseId_idx" ON "grades"("courseId");
CREATE INDEX IF NOT EXISTS "grades_period_idx" ON "grades"("period");
CREATE INDEX IF NOT EXISTS "grades_studentId_period_idx" ON "grades"("studentId", "period");

DO $$ BEGIN
  ALTER TABLE "grades" ADD CONSTRAINT "grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "grades" ADD CONSTRAINT "grades_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "grades" ADD CONSTRAINT "grades_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "grades" ADD CONSTRAINT "grades_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "experiments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS sin políticas: la API pública de Supabase no accede; Prisma (rol del servidor) sí.
ALTER TABLE "grades" ENABLE ROW LEVEL SECURITY;
