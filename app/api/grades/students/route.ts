import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePermission } from '@/lib/auth-guards';
import { ROLES } from '@/lib/roles';

export const dynamic = 'force-dynamic';

/** GET /api/grades/students?q= — lista de estudiantes para profesores (TEACHER+). */
export async function GET(request: NextRequest) {
  const auth = await requirePermission('students:read');
  if (!auth.ok) return auth.response;
  const q = request.nextUrl.searchParams.get('q')?.trim();
  try {
    const students = await prisma.user.findMany({
      where: {
        role: ROLES.STUDENT,
        status: 'ACTIVE',
        ...(q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }] } : {}),
      },
      select: { id: true, name: true, email: true, university: true, career: true },
      orderBy: { name: 'asc' },
      take: 1000,
    });
    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Error al obtener estudiantes' }, { status: 500 });
  }
}
