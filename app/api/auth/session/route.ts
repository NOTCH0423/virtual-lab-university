import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const s = await getSession(req);
  if (!s) return NextResponse.json({ user: null }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  return NextResponse.json({ user: s.user, expires: new Date(s.token.exp * 1000).toISOString() }, { headers: { 'Cache-Control': 'no-store' } });
}
