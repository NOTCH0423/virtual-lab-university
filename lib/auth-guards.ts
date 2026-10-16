import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import {
  isAdminRole,
  isSuperAdmin,
  isTeacherOrAbove,
  type Role,
} from '@/lib/roles';

export type AuthUser = {
  id: string;
  email?: string | null;
  name?: string | null;
  role: Role | string;
};

export type GuardResult =
  | { ok: true; user: AuthUser; session: Awaited<ReturnType<typeof getServerSession>> }
  | { ok: false; response: NextResponse };

async function getAuthUser(): Promise<{
  session: Awaited<ReturnType<typeof getServerSession>>;
  user: AuthUser | null;
}> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { session, user: null };
  }

  const user = session.user as AuthUser;
  if (!user.id || !user.role) {
    return { session, user: null };
  }

  return { session, user };
}

export async function requireAuth(): Promise<GuardResult> {
  const { session, user } = await getAuthUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'No autorizado' }, { status: 401 }),
    };
  }
  return { ok: true, user, session };
}

export async function requireAdmin(): Promise<GuardResult> {
  const result = await requireAuth();
  if (!result.ok) return result;

  if (!isAdminRole(result.user.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Prohibido' }, { status: 403 }),
    };
  }

  return result;
}

export async function requireSuperAdmin(): Promise<GuardResult> {
  const result = await requireAuth();
  if (!result.ok) return result;

  if (!isSuperAdmin(result.user.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Prohibido' }, { status: 403 }),
    };
  }

  return result;
}

export async function requireTeacher(): Promise<GuardResult> {
  const result = await requireAuth();
  if (!result.ok) return result;

  if (!isTeacherOrAbove(result.user.role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Prohibido' }, { status: 403 }),
    };
  }

  return result;
}
