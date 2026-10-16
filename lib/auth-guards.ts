import { getServerSession, type Session } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { can, hasRole, ROLES, type Permission, type Role } from '@/lib/roles';

export type AuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: Role;
};

export type GuardResult =
  | { ok: true; user: AuthUser; session: Session }
  | { ok: false; response: NextResponse };

/** Usuario autenticado actual (o null). Nunca usa el email como id. */
export async function getAuthUser(): Promise<{ session: Session; user: AuthUser } | null> {
  const session = await getServerSession(authOptions);
  const u = session?.user;
  if (!session || !u?.id || !u.role) return null;
  return { session, user: { id: u.id, email: u.email, name: u.name, role: u.role as Role } };
}

const unauthorized = () => NextResponse.json({ error: 'No autorizado' }, { status: 401 });
const forbidden = () => NextResponse.json({ error: 'Prohibido' }, { status: 403 });

export async function requireAuth(): Promise<GuardResult> {
  const auth = await getAuthUser();
  if (!auth) return { ok: false, response: unauthorized() };
  return { ok: true, ...auth };
}

export async function requireRole(min: Role): Promise<GuardResult> {
  const r = await requireAuth();
  if (!r.ok) return r;
  return hasRole(r.user.role, min) ? r : { ok: false, response: forbidden() };
}

export async function requirePermission(permission: Permission): Promise<GuardResult> {
  const r = await requireAuth();
  if (!r.ok) return r;
  return can(r.user.role, permission) ? r : { ok: false, response: forbidden() };
}

export const requireTeacher = () => requireRole(ROLES.TEACHER);
export const requireAdmin = () => requireRole(ROLES.ADMIN);
export const requireSuperAdmin = () => requireRole(ROLES.SUPER_ADMIN);
