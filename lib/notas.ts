import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const STAFF_ROLES = ['TEACHER', 'ADMIN', 'SUPER_ADMIN'];

export async function getNotasUser() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as any)?.id as string | undefined;
  if (!id) return null;
  const u = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, status: true } });
  if (!u || u.status !== 'ACTIVE') return null;
  return { id: u.id, role: u.role.toUpperCase(), isStaff: STAFF_ROLES.includes(u.role.toUpperCase()) };
}

export async function requireStaff() {
  const u = await getNotasUser();
  if (!u) return { user: null, error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
  if (!u.isStaff) return { user: null, error: NextResponse.json({ error: 'Solo profesores y administradores pueden editar notas' }, { status: 403 }) };
  return { user: u, error: null };
}

/** Nota 0–5 con hasta 2 decimales, o null. */
export function parseGrade(v: any, label: string): { value?: number | null; error?: string } {
  if (v === undefined) return {};
  if (v === null || v === '') return { value: null };
  const n = Number(String(v).replace(',', '.'));
  if (!Number.isFinite(n) || n < 0 || n > 5) return { error: `${label} debe estar entre 0 y 5` };
  return { value: Math.round(n * 100) / 100 };
}

export function parseSubject(body: any, partial: boolean): { data?: Record<string, any>; error?: string } {
  const data: Record<string, any> = {};
  for (const k of ['codigo', 'descripcion'] as const) {
    if (body[k] === undefined) {
      if (!partial) return { error: `El campo ${k === 'codigo' ? 'Código' : 'Descripción'} es obligatorio` };
      continue;
    }
    const v = String(body[k]).trim();
    if (!v || v.length > 200) return { error: `${k === 'codigo' ? 'Código' : 'Descripción'} inválido` };
    data[k] = v;
  }
  for (const [k, label] of [['creditos', 'Créditos'], ['fallas', 'Fallas']] as const) {
    if (body[k] === undefined || body[k] === '') continue;
    const n = Number(body[k]);
    if (!Number.isInteger(n) || n < 0 || n > 999) return { error: `${label} debe ser un entero ≥ 0` };
    data[k] = n;
  }
  for (const [k, label] of [['notaFinal', 'Nota final'], ['habilitacion', 'Habilitación'], ['definitiva', 'Definitiva']] as const) {
    const r = parseGrade(body[k], label);
    if (r.error) return { error: r.error };
    if (r.value !== undefined) data[k] = r.value;
  }
  if (body.periodo !== undefined) data.periodo = String(body.periodo || '').trim() || null;
  return { data };
}

export const PROFILE_FIELDS = [
  'identificacion', 'categoria', 'situacion', 'programa', 'jornada', 'pensum', 'ubicacionSemestral', 'periodo',
] as const;
