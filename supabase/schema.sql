-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "university" TEXT,
    "career" TEXT,
    "avatar" TEXT,
    "bio" TEXT,
    "emailVerified" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "laboratories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'BASIC',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "instructor" TEXT,
    "requirements" TEXT,
    "duration" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "laboratories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiments" (
    "id" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'BASIC',
    "duration" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "instructions" TEXT,
    "formulas" TEXT,
    "theory" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "experiments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "score" INTEGER,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_progress" (
    "id" TEXT NOT NULL,
    "userProgressId" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "data" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "experiment_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "experiment_results" (
    "id" TEXT NOT NULL,
    "experimentProgressId" TEXT NOT NULL,
    "experimentId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "data" TEXT NOT NULL,
    "parameters" TEXT,
    "accuracy" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "experiment_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "color" TEXT,
    "category" TEXT,
    "requirement" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certificates" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "laboratoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "score" INTEGER NOT NULL,
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "certificates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "image" TEXT,
    "level" TEXT NOT NULL DEFAULT 'BASIC',
    "duration" INTEGER,
    "modules" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_stats" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "experimentsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "certificatesIssued" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_stats" (
    "id" TEXT NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "totalExperiments" INTEGER NOT NULL DEFAULT 0,
    "experimentsCompleted" INTEGER NOT NULL DEFAULT 0,
    "totalHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "certificates" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "laboratories_slug_key" ON "laboratories"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "experiments_laboratoryId_slug_key" ON "experiments"("laboratoryId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_laboratoryId_key" ON "user_progress"("userId", "laboratoryId");

-- CreateIndex
CREATE UNIQUE INDEX "experiment_progress_userProgressId_experimentId_key" ON "experiment_progress"("userProgressId", "experimentId");

-- CreateIndex
CREATE UNIQUE INDEX "achievements_slug_key" ON "achievements"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "courses_slug_key" ON "courses"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "daily_stats_date_key" ON "daily_stats"("date");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiments" ADD CONSTRAINT "experiments_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "laboratories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_laboratoryId_fkey" FOREIGN KEY ("laboratoryId") REFERENCES "laboratories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_progress" ADD CONSTRAINT "experiment_progress_userProgressId_fkey" FOREIGN KEY ("userProgressId") REFERENCES "user_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_progress" ADD CONSTRAINT "experiment_progress_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_results" ADD CONSTRAINT "experiment_results_experimentProgressId_fkey" FOREIGN KEY ("experimentProgressId") REFERENCES "experiment_progress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "experiment_results" ADD CONSTRAINT "experiment_results_experimentId_fkey" FOREIGN KEY ("experimentId") REFERENCES "experiments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certificates" ADD CONSTRAINT "certificates_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ===== Notas (ver supabase/migrations/20261016_notas.sql) =====
-- Migración ADITIVA: módulo de Notas. No modifica ni borra tablas existentes.
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "academic_profiles_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "academic_profiles_userId_key" ON "academic_profiles"("userId");

CREATE TABLE IF NOT EXISTS "subject_grades" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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

DO $$ BEGIN
  ALTER TABLE "academic_profiles" ADD CONSTRAINT "academic_profiles_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "subject_grades" ADD CONSTRAINT "subject_grades_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- RLS activado sin políticas: la API pública de Supabase (anon/authenticated) no puede leer ni escribir.
-- La app accede vía Prisma con el rol del servidor (propietario de las tablas), que no se ve afectado.
ALTER TABLE "academic_profiles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "subject_grades" ENABLE ROW LEVEL SECURITY;

-- ===== Cursos/docentes (ver supabase/migrations/20261016b_cursos_docentes.sql) =====
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
