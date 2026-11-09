import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireStaffUser } from '@/lib/staff';
import { slugify } from '@/lib/admin';
import { instructionsText, validateDraft } from '@/lib/ai-experiment';

export const dynamic = 'force-dynamic';

// Laboratorios disponibles. No existe relación curso↔laboratorio en el esquema,
// así que los profesores pueden elegir cualquier laboratorio.
export async function GET() {
  const auth = await requireStaffUser();
  if (auth.error) return auth.error;
  const labs = await prisma.laboratory.findMany({ select: { id: true, title: true, category: true }, orderBy: [{ order: 'asc' }, { title: 'asc' }] });
  return NextResponse.json({ labs });
}

export async function POST(req: NextRequest) {
  const auth = await requireStaffUser();
  if (auth.error) return auth.error;
  const body = await req.json().catch(() => ({}));
  const v = validateDraft(body?.draft);
  if (v.error || !v.draft) return NextResponse.json({ error: v.error || 'Borrador inválido' }, { status: 400 });
  const d = v.draft;
  const status = body?.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
  const lab = await prisma.laboratory.findUnique({ where: { id: String(body?.laboratoryId || '') }, select: { id: true } });
  if (!lab) return NextResponse.json({ error: 'Selecciona un laboratorio válido' }, { status: 400 });

  const base = slugify(d.title) || 'experimento';
  let slug = base;
  for (let i = 2; await prisma.experiment.findFirst({ where: { laboratoryId: lab.id, slug }, select: { id: true } }); i++) slug = `${base}-${i}`;
  const last = await prisma.experiment.findFirst({ where: { laboratoryId: lab.id }, orderBy: { order: 'desc' }, select: { order: true } });

  const exp = await prisma.experiment.create({
    data: {
      laboratoryId: lab.id, title: d.title, slug, description: d.description, category: d.category,
      difficulty: d.difficulty, duration: d.duration, order: (last?.order ?? 0) + 1,
      theory: d.theory, formulas: d.formulas || null, instructions: instructionsText(d),
      content: d as any, status, aiGenerated: true, createdById: auth.user.id,
    },
    select: { id: true, title: true, slug: true, status: true, laboratoryId: true },
  });
  return NextResponse.json(exp, { status: 201 });
}
