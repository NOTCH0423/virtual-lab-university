import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/prisma';

export const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN'] as const;
export const ALL_ROLES = ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'] as const;

export function isAdminRole(role?: string | null) {
  return !!role && (ADMIN_ROLES as readonly string[]).includes(role.toUpperCase());
}
export function isSuperAdminRole(role?: string | null) {
  return role?.toUpperCase() === 'SUPER_ADMIN';
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/** Devuelve el admin actual (rol leído de la BD) o null. */
export async function getAdmin(): Promise<AdminUser | null> {
  const session = await getSession();
  const id = (session?.user as any)?.id as string | undefined;
  const email = session?.user?.email || undefined;
  if (!id && !email) return null;
  const user = await prisma.user.findUnique({
    where: id ? { id } : { email: email! },
    select: { id: true, email: true, name: true, role: true, status: true },
  });
  if (!user || user.status !== 'ACTIVE' || !isAdminRole(user.role)) return null;
  return { id: user.id, email: user.email, name: user.name, role: user.role.toUpperCase() };
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
