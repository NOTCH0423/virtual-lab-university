import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { parseSubject, requireStaff } from '@/lib/notas';

export const dynamic = 'force-dynamic';
type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { error } = await requireStaff();
  if (error) return error;
  try {
    const parsed = parseSubject(await req.json().catch(() => ({})), true);
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
    if (!Object.keys(parsed.data!).length) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
    const subject = await prisma.subjectGrade.update({ where: { id: params.id }, data: parsed.data! });
    return NextResponse.json(subject);
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 });
    console.error('notas subject PATCH', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { error } = await requireStaff();
  if (error) return error;
  try {
    await prisma.subjectGrade.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err?.code === 'P2025') return NextResponse.json({ error: 'Materia no encontrada' }, { status: 404 });
    console.error('notas subject DELETE', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
