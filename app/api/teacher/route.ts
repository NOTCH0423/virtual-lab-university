import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getNotasUser } from '@/lib/notas';

export const dynamic = 'force-dynamic';

/** Panel del profesor: solo datos reales de sus cursos asignados. */
export async function GET() {
  const me = await getNotasUser();
  if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (!me.isTeacher) return NextResponse.json({ error: 'Solo para profesores' }, { status: 403 });
  try {
    const assigned = await prisma.courseTeacher.findMany({
      where: { teacherId: me.id },
      select: {
        course: {
          select: {
            id: true, title: true, category: true, level: true, status: true,
            enrollments: { select: { student: { select: { id: true, name: true, email: true, academicProfile: { select: { ubicacionSemestral: true } } } } } },
            grades: {
              select: { id: true, userId: true, definitiva: true, notaFinal: true, fallas: true, updatedAt: true, periodo: true,
                user: { select: { name: true } } },
            },
          },
        },
      },
    });
    const courses = assigned.map(({ course: c }) => {
      const enrolledIds = new Set(c.enrollments.map((e) => e.student.id));
      const grades = c.grades.filter((g) => enrolledIds.has(g.userId));
      const finals = grades.map((g) => g.definitiva).filter((x): x is number => x !== null);
      const gradedIds = new Set(grades.map((g) => g.userId));
      return {
        id: c.id, title: c.title, category: c.category, level: c.level, status: c.status,
        students: c.enrollments.map((e) => {
          const g = grades.filter((x) => x.userId === e.student.id);
          const last = g.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())[0];
          return { ...e.student, grado: e.student.academicProfile?.ubicacionSemestral || null, definitiva: last?.definitiva ?? null, fallas: last?.fallas ?? null };
        }),
        studentCount: c.enrollments.length,
        gradeCount: grades.length,
        pending: c.enrollments.length - gradedIds.size,
        average: finals.length ? Math.round((finals.reduce((a, b) => a + b, 0) / finals.length) * 100) / 100 : null,
        failing: finals.filter((x) => x < 3).length,
        recent: grades
          .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
          .slice(0, 5)
          .map((g) => ({ id: g.id, student: g.user.name, definitiva: g.definitiva, updatedAt: g.updatedAt.toISOString() })),
      };
    });
    const allStudents = new Set(courses.flatMap((c) => c.students.map((s) => s.id)));
    const allFinals = courses.flatMap((c) => (c.average !== null ? [c.average] : []));
    const recent = courses
      .flatMap((c) => c.recent.map((r) => ({ ...r, course: c.title })))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 8);
    return NextResponse.json({
      stats: {
        courses: courses.length,
        students: allStudents.size,
        grades: courses.reduce((a, c) => a + c.gradeCount, 0),
        pending: courses.reduce((a, c) => a + c.pending, 0),
        average: allFinals.length ? Math.round((allFinals.reduce((a, b) => a + b, 0) / allFinals.length) * 100) / 100 : null,
        failing: courses.reduce((a, c) => a + c.failing, 0),
      },
      courses,
      recent,
    });
  } catch (err) {
    console.error('teacher GET', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
