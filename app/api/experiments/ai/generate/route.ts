import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireStaffUser } from '@/lib/staff';
import { generateWithGemini, validateDraft } from '@/lib/ai-experiment';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const PER_HOUR = 15;
const PER_MINUTE = 3;

export async function POST(req: NextRequest) {
  const auth = await requireStaffUser();
  if (auth.error) return auth.error;
  const me = auth.user;
  const body = await req.json().catch(() => ({}));
  const prompt = String(body?.prompt || '').trim();
  if (prompt.length < 10) return NextResponse.json({ error: 'Describe el experimento con al menos 10 caracteres' }, { status: 400 });
  if (prompt.length > 2000) return NextResponse.json({ error: 'La descripción es demasiado larga (máx. 2000)' }, { status: 400 });

  // Límite por usuario (persistente en BD → válido entre instancias serverless)
  const now = Date.now();
  const [hour, minute] = await Promise.all([
    prisma.aiGenerationLog.count({ where: { userId: me.id, createdAt: { gte: new Date(now - 3600_000) } } }),
    prisma.aiGenerationLog.count({ where: { userId: me.id, createdAt: { gte: new Date(now - 60_000) } } }),
  ]);
  if (minute >= PER_MINUTE || hour >= PER_HOUR) {
    return NextResponse.json({ error: `Límite alcanzado (${PER_MINUTE}/min, ${PER_HOUR}/hora). Intenta más tarde.` }, { status: 429 });
  }
  await prisma.aiGenerationLog.create({ data: { userId: me.id } });

  let lab: { title: string; category: string } | null = null;
  if (body?.laboratoryId) {
    lab = await prisma.laboratory.findUnique({ where: { id: String(body.laboratoryId) }, select: { title: true, category: true } });
    if (!lab) return NextResponse.json({ error: 'Laboratorio no encontrado' }, { status: 404 });
  }
  const previous = body?.previous ? validateDraft(body.previous).draft || null : null;
  const r = await generateWithGemini({
    prompt,
    labTitle: lab?.title, labCategory: lab?.category,
    gradeLevel: String(body?.gradeLevel || '').slice(0, 80) || undefined,
    difficulty: String(body?.difficulty || '').slice(0, 30) || undefined,
    previous, refine: String(body?.refine || '').slice(0, 1000) || undefined,
  });
  if (r.error) return NextResponse.json({ error: r.error }, { status: 502 });
  return NextResponse.json({ draft: r.draft, model: r.model, remaining: { hour: PER_HOUR - hour - 1 } });
}
