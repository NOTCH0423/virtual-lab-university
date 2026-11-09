import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

/** GET -> cursos con profesores y estudiantes matriculados + listas de profesores y estudiantes */
export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const [courses, teachers, students] = await Promise.all([
      prisma.course.findMany({
        orderBy: [{ order: 'asc' }, { title: 'asc' }],
        select: {
          id: true, title: true, status: true,
          teachers: { select: { teacher: { select: { id: true, name: true, email: true } } } },
          enrollments: { select: { student: { select: { id: true, name: true, email: true } } } },
        },
      }),
      prisma.user.findMany({ where: { role: 'TEACHER', status: 'ACTIVE' }, select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } }),
      prisma.user.findMany({ where: { role: 'STUDENT' }, select: { id: true, name: true, email: true }, orderBy: { name: 'asc' } }),
    ]);
    return NextResponse.json({
      courses: courses.map((c) => ({
        id: c.id, title: c.title, status: c.status,
        teachers: c.teachers.map((t) => t.teacher),
        students: c.enrollments.map((e) => e.student),
      })),
      teachers,
      students,
    });
  } catch (err) {
    console.error('assignments GET', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

async function validate(body: any) {
  const courseId = String(body.courseId || '');
  const type = body.type;
  if (type !== 'teacher' && type !== 'student') return { err: 'Tipo inválido' };
  const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } });
  if (!course) return { err: 'Curso no encontrado' };
  return { courseId, type: type as 'teacher' | 'student' };
}

/** POST { courseId, type: 'teacher'|'student', userIds: string[] } */
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await req.json().catch(() => ({}));
    const v = await validate(body);
    if ('err' in v) return NextResponse.json({ error: v.err }, { status: 400 });
    const ids: string[] = Array.isArray(body.userIds) ? body.userIds.map(String) : [];
    if (!ids.length) return NextResponse.json({ error: 'Selecciona al menos un usuario' }, { status: 400 });
    const role = v.type === 'teacher' ? 'TEACHER' : 'STUDENT';
    const valid = await prisma.user.findMany({ where: { id: { in: ids }, role }, select: { id: true } });
    if (valid.length !== ids.length) {
      return NextResponse.json({ error: v.type === 'teacher' ? 'Solo se pueden asignar usuarios con rol Profesor' : 'Solo se pueden matricular usuarios con rol Estudiante' }, { status: 400 });
    }
    const r = v.type === 'teacher'
      ? await prisma.courseTeacher.createMany({ data: ids.map((teacherId) => ({ courseId: v.courseId, teacherId })), skipDuplicates: true })
      : await prisma.courseEnrollment.createMany({ data: ids.map((studentId) => ({ courseId: v.courseId, studentId })), skipDuplicates: true });
    return NextResponse.json({ success: true, added: r.count });
  } catch (err) {
    console.error('assignments POST', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

/** DELETE { courseId, type, userId } */
export async function DELETE(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await req.json().catch(() => ({}));
    const v = await validate(body);
    if ('err' in v) return NextResponse.json({ error: v.err }, { status: 400 });
    const userId = String(body.userId || '');
    const r = v.type === 'teacher'
      ? await prisma.courseTeacher.deleteMany({ where: { courseId: v.courseId, teacherId: userId } })
      : await prisma.courseEnrollment.deleteMany({ where: { courseId: v.courseId, studentId: userId } });
    return NextResponse.json({ success: true, removed: r.count });
  } catch (err) {
    console.error('assignments DELETE', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
