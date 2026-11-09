import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, requirePermission } from '@/lib/auth-guards';
import { can, ROLES } from '@/lib/roles';
import { gradeInputSchema, gradeSelect } from '@/lib/grades';

export const dynamic = 'force-dynamic';

/**
 * GET /api/grades?studentId=&courseId=&period=&title=
 * - STUDENT: solo sus propias notas (se ignora studentId).
 * - TEACHER+: notas de cualquier estudiante.
 */
export async function GET(request: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const sp = request.nextUrl.searchParams;
  const where: Record<string, unknown> = {};
  if (can(auth.user.role, 'grades:read')) {
    if (sp.get('studentId')) where.studentId = sp.get('studentId');
  } else {
    where.studentId = auth.user.id;
  }
  if (sp.get('courseId')) where.courseId = sp.get('courseId');
  if (sp.get('period')) where.period = sp.get('period');
  if (sp.get('title')) where.title = sp.get('title');

  try {
    const grades = await prisma.grade.findMany({
      where,
      select: gradeSelect,
      orderBy: [{ createdAt: 'asc' }],
      take: 5000,
    });
    return NextResponse.json({ grades });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({ error: 'Error al obtener las notas' }, { status: 500 });
  }
}

/** POST /api/grades — crea una nota (TEACHER+). El profesor queda como autor. */
export async function POST(request: NextRequest) {
  const auth = await requirePermission('grades:write');
  if (!auth.ok) return auth.response;

  const parsed = gradeInputSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }, { status: 400 });
  }

  try {
    const student = await prisma.user.findUnique({ where: { id: parsed.data.studentId }, select: { role: true } });
    if (!student || student.role !== ROLES.STUDENT) {
      return NextResponse.json({ error: 'El estudiante no existe' }, { status: 404 });
    }
    const grade = await prisma.grade.create({
      data: { ...parsed.data, teacherId: auth.user.id },
      select: gradeSelect,
    });
    return NextResponse.json({ grade }, { status: 201 });
  } catch (error) {
    console.error('Error creating grade:', error);
    return NextResponse.json({ error: 'Error al crear la nota' }, { status: 500 });
  }
}
