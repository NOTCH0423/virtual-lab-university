-- Migración ADITIVA: asignación de profesores a cursos, matrículas y notas por curso.
ALTER TABLE "academic_profiles" ADD COLUMN IF NOT EXISTS "horario" TEXT;
ALTER TABLE "subject_grades" ADD COLUMN IF NOT EXISTS "courseId" TEXT;
ALTER TABLE "subject_grades" ADD COLUMN IF NOT EXISTS "teacherId" TEXT;

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
CREATE INDEX IF NOT EXISTS "subject_grades_courseId_idx" ON "subject_grades"("courseId");

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

-- RLS sin políticas: la API pública de Supabase no accede; Prisma (rol del servidor) sí.
ALTER TABLE "course_teachers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "course_enrollments" ENABLE ROW LEVEL SECURITY;
