import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getNotasUser } from '@/lib/notas';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notas                 -> notas del usuario actual (estudiante)
 * GET /api/notas?userId=...      -> notas de un estudiante (solo profesor/admin)
 * GET /api/notas?students=1&q=.. -> lista de estudiantes (solo profesor/admin)
 */
export async function GET(req: NextRequest) {
  const me = await getNotasUser();
  if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const sp = req.nextUrl.searchParams;

  try {
    if (sp.get('students')) {
      if (!me.isStaff) return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      const q = (sp.get('q') || '').trim();
      const students = await prisma.user.findMany({
        where: {
          role: 'STUDENT',
          ...(q
            ? {
                OR: [
                  { name: { contains: q, mode: 'insensitive' } },
                  { email: { contains: q, mode: 'insensitive' } },
                  { academicProfile: { identificacion: { contains: q, mode: 'insensitive' } } },
                ],
              }
            : {}),
        },
        select: {
          id: true, name: true, email: true,
          academicProfile: { select: { identificacion: true, programa: true } },
          _count: { select: { subjectGrades: true } },
        },
        orderBy: { name: 'asc' },
        take: 200,
      });
      return NextResponse.json(students);
    }

    const requested = sp.get('userId');
    const userId = me.isStaff && requested ? requested : me.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, role: true, university: true, career: true,
        academicProfile: true,
        subjectGrades: { orderBy: [{ periodo: 'desc' }, { codigo: 'asc' }] },
      },
    });
    if (!user) return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    return NextResponse.json({ ...user, canEdit: me.isStaff });
  } catch (err) {
    console.error('notas GET', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
