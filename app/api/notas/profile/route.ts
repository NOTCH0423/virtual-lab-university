import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { PROFILE_FIELDS, requireStaff } from '@/lib/notas';

export const dynamic = 'force-dynamic';

/** PUT { userId, identificacion, categoria, situacion, programa, jornada, pensum, ubicacionSemestral, periodo } */
export async function PUT(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;
  try {
    const body = await req.json().catch(() => ({}));
    const userId = String(body.userId || '');
    const student = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
    if (!student) return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    const data: Record<string, string | null> = {};
    for (const f of PROFILE_FIELDS) {
      if (body[f] === undefined) continue;
      const v = String(body[f] ?? '').trim();
      if (v.length > 200) return NextResponse.json({ error: `${f} es demasiado largo` }, { status: 400 });
      data[f] = v || null;
    }
    const profile = await prisma.academicProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
    return NextResponse.json(profile);
  } catch (err) {
    console.error('notas profile PUT', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
