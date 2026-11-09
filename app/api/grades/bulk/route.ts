import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { ROLES } from '@/lib/roles';
import { canEditGrade, DEFAULT_MAX_SCORE } from '@/lib/grades';

export const dynamic = 'force-dynamic';

const bulkSchema = z.object({
  title: z.string().trim().min(1).max(200),
  maxScore: z.coerce.number().positive().max(1000).default(DEFAULT_MAX_SCORE),
  period: z.string().trim().max(50).optional().nullable(),
  subject: z.string().trim().max(200).optional().nullable(),
  courseId: z.string().optional().nullable(),
  experimentId: z.string().optional().nullable(),
  entries: z
    .array(
      z.object({
        studentId: z.string().min(1),
        score: z.coerce.number().min(0).nullable(),
        comment: z.string().trim().max(2000).optional().nullable(),
      })
    )
    .min(1)
    .max(1000),
});

/**
 * POST /api/grades/bulk — registra una actividad para muchos estudiantes a la vez.
 * Si el estudiante ya tiene una nota con el mismo título y periodo, se actualiza
 * (solo si el profesor es el autor o es ADMIN+). score = null elimina la nota.
 */
export async function POST(request: NextRequest) {
  const auth = await requirePermission('grades:write');
  if (!auth.ok) return auth.response;

  const parsed = bulkSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 });
  }
  const { entries, title, maxScore, period, subject, courseId, experimentId } = parsed.data;
  if (entries.some((e) => e.score !== null && e.score > maxScore)) {
    return NextResponse.json({ error: `Las notas deben estar entre 0 y ${maxScore}` }, { status: 400 });
  }

  try {
    const studentIds = Array.from(new Set(entries.map((e) => e.studentId)));
    const students = await prisma.user.findMany({ where: { id: { in: studentIds }, role: ROLES.STUDENT }, select: { id: true } });
    const valid = new Set(students.map((s) => s.id));
    const existing = await prisma.grade.findMany({
      where: { studentId: { in: studentIds }, title, period: period ?? null },
      select: { id: true, studentId: true, teacherId: true },
    });
    const byStudent = new Map(existing.map((g) => [g.studentId, g]));

    let created = 0, updated = 0, deleted = 0;
    const skipped: string[] = [];
    await prisma.$transaction(async (tx) => {
      for (const e of entries) {
        if (!valid.has(e.studentId)) { skipped.push(e.studentId); continue; }
        const prev = byStudent.get(e.studentId);
        if (prev && !canEditGrade(auth.user, prev)) { skipped.push(e.studentId); continue; }
        if (e.score === null) {
          if (prev) { await tx.grade.delete({ where: { id: prev.id } }); deleted++; }
          continue;
        }
        if (prev) {
          await tx.grade.update({ where: { id: prev.id }, data: { score: e.score, maxScore, comment: e.comment ?? null, subject, courseId, experimentId } });
          updated++;
        } else {
          await tx.grade.create({
            data: { studentId: e.studentId, teacherId: auth.user.id, title, score: e.score, maxScore, comment: e.comment ?? null, period: period ?? null, subject, courseId, experimentId },
          });
          created++;
        }
      }
    });
    return NextResponse.json({ success: true, created, updated, deleted, skipped });
  } catch (error) {
    console.error('Error in bulk grades:', error);
    return NextResponse.json({ error: 'Error al guardar las notas' }, { status: 500 });
  }
}
