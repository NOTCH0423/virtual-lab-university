import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth-token';

export const dynamic = 'force-dynamic';
const DUMMY = '$2a$10$CwTycUXWue0Thq9StjUM0uJ8.4ZkFh1bS8m3XzZp2E3WlqGQyQf2e';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email || '').trim().toLowerCase();
  const password = String(body?.password || '');
  if (!email || !password) return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
  const user = await prisma.user.findFirst({ where: { email: { equals: email, mode: 'insensitive' } } });
  const ok = await bcrypt.compare(password, user?.password || DUMMY);
  if (!user || !ok) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  if (user.status && user.status !== 'ACTIVE') return NextResponse.json({ error: 'Cuenta desactivada' }, { status: 403 });
  await prisma.user.update({ where: { id: user.id }, data: { lastActiveAt: new Date() } }).catch(() => {});
  return NextResponse.json(signToken(user.id), { headers: { 'Cache-Control': 'no-store' } });
}
