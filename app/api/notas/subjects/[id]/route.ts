import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { canGrade, forbidden, parseGradeFields, requireStaff } from '@/lib/notas';

export const dynamic = 'force-dynamic';
type Ctx = { params: { id: string } };

async function loadAllowed(id: string, me: any) {
  const g = await prisma.subjectGrade.findUnique({ where: { id }, select: { id: true, userId: true, courseId: true } });
  if (!g) return { g: null, res: NextResponse.json({ error: 'Nota no encontrada' }, { status: 404 }) };
  if (!(await canGrade(me, g.userId, g.courseId))) {
    return { g: null, res: forbidden('Solo puedes modificar notas de tus cursos y de estudiantes matriculados en ellos') };
  }
  return { g, res: null };
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { user: me, error } = await requireStaff();
  if (error) return error;
  try {
    const { res } = await loadAllowed(params.id, me);
    if (res) return res;
    const body = await req.json().catch(() => ({}));
    const parsed = parseGradeFields(body);
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const data: any = parsed.data!;
    // Solo admins pueden reasignar la nota a otro curso (p. ej. notas antiguas sin curso)
    if (me!.isAdmin && body.courseId) {
      const c = await prisma.course.findUnique({ where: { id: String(body.courseId) }, select: { id: true, title: true, slug: true } });
      if (!c) return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
      Object.assign(data, { courseId: c.id, descripcion: c.title, codigo: c.slug.slice(0, 50) });
    }
    if (!Object.keys(data).length) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    const subject = await prisma.subjectGrade.update({ where: { id: params.id }, data });
    return NextResponse.json(subject);
  } catch (err) {
    console.error('notas subject PATCH', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { user: me, error } = await requireStaff();
  if (error) return error;
  try {
    const { res } = await loadAllowed(params.id, me);
    if (res) return res;
    await prisma.subjectGrade.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('notas subject DELETE', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
