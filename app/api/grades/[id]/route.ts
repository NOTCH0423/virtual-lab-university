import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { canEditGrade, gradeSelect, gradeUpdateSchema } from '@/lib/grades';

export const dynamic = 'force-dynamic';

async function loadEditable(id: string, actor: { id: string; role: string }) {
  const grade = await prisma.grade.findUnique({ where: { id }, select: { id: true, teacherId: true, score: true, maxScore: true } });
  if (!grade) return { error: NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 }) };
  if (!canEditGrade(actor, grade)) {
    return { error: NextResponse.json({ error: 'Solo puedes modificar las notas que tú registraste' }, { status: 403 }) };
  }
  return { grade };
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission('grades:write');
  if (!auth.ok) return auth.response;

  const parsed = gradeUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 });
  }

  try {
    const r = await loadEditable(params.id, auth.user);
    if (r.error) return r.error;
    const score = parsed.data.score ?? r.grade.score;
    const maxScore = parsed.data.maxScore ?? r.grade.maxScore;
    if (score > maxScore) {
      return NextResponse.json({ error: 'La nota no puede superar la nota máxima' }, { status: 400 });
    }
    const grade = await prisma.grade.update({ where: { id: params.id }, data: parsed.data, select: gradeSelect });
    return NextResponse.json({ grade });
  } catch (error) {
    console.error('Error updating grade:', error);
    return NextResponse.json({ error: 'Error al actualizar la nota' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requirePermission('grades:write');
  if (!auth.ok) return auth.response;

  try {
    const r = await loadEditable(params.id, auth.user);
    if (r.error) return r.error;
    await prisma.grade.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting grade:', error);
    return NextResponse.json({ error: 'Error al eliminar la nota' }, { status: 500 });
  }
}
