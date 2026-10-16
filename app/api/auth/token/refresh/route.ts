import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { signToken } from '@/lib/auth-token';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  return NextResponse.json(signToken(s.user.id, s.token.auth), { headers: { 'Cache-Control': 'no-store' } });
}
