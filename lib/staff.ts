import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-guards';
import { hasRole, ROLES } from '@/lib/roles';

export const STAFF_ROLES = ['TEACHER', 'ADMIN', 'SUPER_ADMIN'];

export async function requireStaffUser() {
  const auth = await getAuthUser();
  if (!auth) return { error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }), user: null as any };
  if (!hasRole(auth.user.role, ROLES.TEACHER)) {
    return { error: NextResponse.json({ error: 'Solo profesores y administradores' }, { status: 403 }), user: null as any };
  }
  return { user: auth.user, error: null };
}
