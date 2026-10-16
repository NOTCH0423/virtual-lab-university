import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';

export const STAFF_ROLES = ['TEACHER', 'ADMIN', 'SUPER_ADMIN'];

export async function requireStaffUser() {
  const s = await getSession();
  if (!s) return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
  if (!STAFF_ROLES.includes(String(s.user.role).toUpperCase())) {
    return { error: NextResponse.json({ error: 'Solo profesores y administradores' }, { status: 403 }) };
  }
  return { user: s.user };
}
