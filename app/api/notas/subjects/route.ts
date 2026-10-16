import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseSubject, requireStaff } from '@/lib/notas';

export const dynamic = 'force-dynamic';

/** POST { userId, codigo, descripcion, creditos, notaFinal, habilitacion, definitiva, fallas, periodo } */
export async function POST(req: NextRequest) {
  const { error } = await requireStaff();
  if (error) return error;
  try {
    const body = await req.json().catch(() => ({}));
    const student = await prisma.user.findUnique({ where: { id: String(body.userId || '') }, select: { id: true } });
    if (!student) return NextResponse.json({ error: 'Estudiante no encontrado' }, { status: 404 });
    const parsed = parseSubject(body, false);
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
    const subject = await prisma.subjectGrade.create({
      data: { userId: student.id, ...(parsed.data as any) },
    });
    return NextResponse.json(subject, { status: 201 });
  } catch (err) {
    console.error('notas subject POST', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
