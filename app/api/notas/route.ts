import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { forbidden, getNotasUser, sharedCourseIds, teacherCourseIds } from '@/lib/notas';

export const dynamic = 'force-dynamic';

const gradeInclude = {
  course: { select: { id: true, title: true } },
  teacher: { select: { id: true, name: true } },
} as const;

/**
 * GET /api/notas                 -> todas las notas del usuario actual
 * GET /api/notas?userId=...      -> notas de un estudiante (admin: todas; profesor: solo de sus cursos)
 * GET /api/notas?students=1&q=.. -> estudiantes que el usuario puede calificar
 */
export async function GET(req: NextRequest) {
  const me = await getNotasUser();
  if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const sp = req.nextUrl.searchParams;

  try {
    if (sp.get('students')) {
      if (!me.isStaff) return forbidden('No autorizado');
      const q = (sp.get('q') || '').trim();
      const myCourses = me.isAdmin ? null : await teacherCourseIds(me.id);
      if (myCourses && !myCourses.length) return NextResponse.json([]);
      const students = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          ...(myCourses ? { enrollments: { some: { courseId: { in: myCourses } } } } : {}),
          ...(q ? { OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { email: { contains: q, mode: 'insensitive' } },
            { academicProfile: { identificacion: { contains: q, mode: 'insensitive' } } },
          ] } : {}),
        },
        select: {
          id: true, name: true, email: true,
          academicProfile: { select: { identificacion: true, ubicacionSemestral: true } },
          enrollments: {
            where: myCourses ? { courseId: { in: myCourses } } : undefined,
            select: { course: { select: { id: true, title: true } } },
          },
        },
        orderBy: { name: 'asc' },
        take: 300,
      });
      return NextResponse.json(students);
    }

    const requested = sp.get('userId');
    const userId = me.isStaff && requested ? requested : me.id;

    let gradeWhere: any = { userId };
    let gradableCourses: { id: string; title: string }[] = [];
    if (userId !== me.id || me.isStaff) {
      if (me.isAdmin) {
        const enr = await prisma.courseEnrollment.findMany({ where: { studentId: userId }, select: { course: { select: { id: true, title: true } } } });
        gradableCourses = enr.map((e) => e.course);
      } else if (me.isTeacher && userId !== me.id) {
        const shared = await sharedCourseIds(me.id, userId);
        if (!shared.length) return forbidden('Este estudiante no está matriculado en tus cursos');
        gradeWhere = { userId, courseId: { in: shared } };
        gradableCourses = await prisma.course.findMany({ where: { id: { in: shared } }, select: { id: true, title: true } });
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, academicProfile: true },
    });
    if (!user) return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    const grades = await prisma.subjectGrade.findMany({
      where: gradeWhere,
      include: gradeInclude,
      orderBy: [{ periodo: 'desc' }, { descripcion: 'asc' }],
    });
    const editingOther = me.isStaff && userId !== me.id;
    return NextResponse.json({
      ...user,
      subjectGrades: grades,
      canEdit: editingOther,
      canEditProfile: editingOther,
      gradableCourses,
      isAdmin: me.isAdmin,
    });
  } catch (err) {
    console.error('notas GET', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
