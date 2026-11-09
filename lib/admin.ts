import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-guards';
import { ADMIN_ROLES, ALL_ROLES, isAdminRole, isSuperAdmin } from '@/lib/roles';
import prisma from '@/lib/prisma';

export { ADMIN_ROLES, ALL_ROLES, isAdminRole };
export function isSuperAdminRole(role?: string | null) {
  return role?.toUpperCase() === 'SUPER_ADMIN';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** Devuelve el admin actual (rol leído de la BD o sesión autenticada) o null. */
export async function getAdmin(): Promise<AdminUser | null> {
  const auth = await getAuthUser();
  if (!auth) return null;
  const { user } = auth;
  if (!user.id) return null;
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, role: true, status: true },
  });
  if (!dbUser || dbUser.status !== 'ACTIVE' || !isAdminRole(dbUser.role)) return null;
  return { id: dbUser.id, email: dbUser.email, name: dbUser.name, role: dbUser.role.toUpperCase() };
}

/** Uso: const { admin, error } = await requireAdmin(); if (error) return error; */
export async function requireAdmin(opts: { superOnly?: boolean } = {}) {
  const admin = await getAdmin();
  if (!admin) return { admin: null, error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
  if (opts.superOnly && !isSuperAdminRole(admin.role)) {
    return { admin: null, error: NextResponse.json({ error: 'Solo un SUPER_ADMIN puede hacer esto' }, { status: 403 }) };
  }
  return { admin, error: null };
}

export function slugify(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
