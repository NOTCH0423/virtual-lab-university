import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { canGrade, forbidden, parseGradeFields, requireStaff } from '@/lib/notas';

export const dynamic = 'force-dynamic';

/** POST { userId, courseId, notaFinal, habilitacion, definitiva, fallas, periodo } */
export async function POST(req: NextRequest) {
  const { user: me, error } = await requireStaff();
  if (error) return error;
  try {
    const body = await req.json().catch(() => ({}));
    const student = await prisma.user.findUnique({ where: { id: String(body.userId || '') }, select: { id: true } });
    if (!student) return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    const courseId = body.courseId ? String(body.courseId) : null;
    if (!courseId) return NextResponse.json({ error: 'Selecciona la materia/curso' }, { status: 400 });
    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true, title: true, slug: true } });
    if (!course) return NextResponse.json({ error: 'Curso no encontrado' }, { status: 404 });
    if (!(await canGrade(me!, student.id, courseId))) {
      return forbidden('Solo puedes calificar a estudiantes matriculados en tus cursos, en la materia de ese curso');
    }
    const parsed = parseGradeFields(body);
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });

    let teacherId: string | null = me!.isTeacher ? me!.id : null;
    if (!teacherId) {
      const t = await prisma.courseTeacher.findFirst({ where: { courseId }, select: { teacherId: true } });
      teacherId = t?.teacherId ?? null;
    }
    const subject = await prisma.subjectGrade.create({
      data: {
        userId: student.id, courseId, teacherId,
        codigo: course.slug.slice(0, 50), descripcion: course.title, creditos: 0,
        ...(parsed.data as any),
      },
    });
    return NextResponse.json(subject, { status: 201 });
  } catch (err) {
    console.error('notas subject POST', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
