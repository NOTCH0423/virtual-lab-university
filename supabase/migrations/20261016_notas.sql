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
