-- Unión de esquemas: modelos de la rama de BD (Supabase) sobre la base de jules-fixes.
-- Equivale a supabase/migrations/20261016_notas.sql, 20261016b_cursos_docentes.sql
-- y 20261016c_experimentos_ia.sql. Idempotente: no falla si el SQL Editor ya las aplicó.

CREATE TABLE IF NOT EXISTS "academic_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "identificacion" TEXT,
    "categoria" TEXT,
    "situacion" TEXT,
    "programa" TEXT,
    "jornada" TEXT,
    "pensum" TEXT,
    "ubicacionSemestral" TEXT,
    "periodo" TEXT,
    "horario" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "academic_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "academic_profiles_userId_key" ON "academic_profiles"("userId");

CREATE TABLE IF NOT EXISTS "subject_grades" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT,
    "teacherId" TEXT,
    "codigo" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "creditos" INTEGER NOT NULL DEFAULT 0,
    "notaFinal" DOUBLE PRECISION,
    "habilitacion" DOUBLE PRECISION,
    "definitiva" DOUBLE PRECISION,
    "fallas" INTEGER NOT NULL DEFAULT 0,
    "periodo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "subject_grades_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "subject_grades_userId_idx" ON "subject_grades"("userId");
CREATE INDEX IF NOT EXISTS "subject_grades_courseId_idx" ON "subject_grades"("courseId");

CREATE TABLE IF NOT EXISTS "course_teachers" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "teacherId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_teachers_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "course_enrollments" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "course_enrollments_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "course_teachers_teacherId_idx" ON "course_teachers"("teacherId");
CREATE UNIQUE INDEX IF NOT EXISTS "course_teachers_courseId_teacherId_key" ON "course_teachers"("courseId", "teacherId");
CREATE INDEX IF NOT EXISTS "course_enrollments_studentId_idx" ON "course_enrollments"("studentId");
CREATE UNIQUE INDEX IF NOT EXISTS "course_enrollments_courseId_studentId_key" ON "course_enrollments"("courseId", "studentId");

DO $$ BEGIN
  ALTER TABLE "academic_profiles" ADD CONSTRAINT "academic_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "subject_grades" ADD CONSTRAINT "subject_grades_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "subject_grades" ADD CONSTRAINT "subject_grades_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "subject_grades" ADD CONSTRAINT "subject_grades_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "course_teachers" ADD CONSTRAINT "course_teachers_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "course_teachers" ADD CONSTRAINT "course_teachers_teacherId_fkey" FOREIGN KEY ("teacherId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

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

-- RLS sin políticas: la API REST pública de Supabase no accede; Prisma (rol del servidor) sí.
ALTER TABLE "academic_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subject_grades" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "course_teachers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "course_enrollments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_generation_logs" ENABLE ROW LEVEL SECURITY;
