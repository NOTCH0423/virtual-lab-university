import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export const STAFF_ROLES = ['TEACHER', 'ADMIN', 'SUPER_ADMIN'];

export interface NotasUser { id: string; role: string; isStaff: boolean; isAdmin: boolean; isTeacher: boolean }

export async function getNotasUser(): Promise<NotasUser | null> {
  const session = await getServerSession(authOptions);
  const id = (session?.user as any)?.id as string | undefined;
  if (!id) return null;
  const u = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, status: true } });
  if (!u || u.status !== 'ACTIVE') return null;
  const role = u.role.toUpperCase();
  return {
    id: u.id, role,
    isStaff: STAFF_ROLES.includes(role),
    isAdmin: role === 'ADMIN' || role === 'SUPER_ADMIN',
    isTeacher: role === 'TEACHER',
  };
}

export async function requireStaff() {
  const u = await getNotasUser();
  if (!u) return { user: null, error: NextResponse.json({ error: 'No autorizado' }, { status: 401 }) };
  if (!u.isStaff) return { user: null, error: NextResponse.json({ error: 'Solo profesores y administradores pueden editar notas' }, { status: 403 }) };
  return { user: u, error: null };
}

export const forbidden = (msg: string) => NextResponse.json({ error: msg }, { status: 403 });

export async function teacherCourseIds(teacherId: string) {
  const rows = await prisma.courseTeacher.findMany({ where: { teacherId }, select: { courseId: true } });
  return rows.map((r) => r.courseId);
}

/** Cursos del profesor en los que está matriculado el estudiante. */
export async function sharedCourseIds(teacherId: string, studentId: string) {
  const mine = await teacherCourseIds(teacherId);
  if (!mine.length) return [];
  const enr = await prisma.courseEnrollment.findMany({
    where: { studentId, courseId: { in: mine } },
    select: { courseId: true },
  });
  return enr.map((e) => e.courseId);
}

/** ¿Puede `me` calificar a `studentId` en `courseId`? */
export async function canGrade(me: NotasUser, studentId: string, courseId: string | null | undefined) {
  if (me.isAdmin) return true;
  if (!me.isTeacher || !courseId) return false;
  return (await sharedCourseIds(me.id, studentId)).includes(courseId);
}

/** Nota 0–5 con hasta 2 decimales, o null. */
export function parseGrade(v: any, label: string): { value?: number | null; error?: string } {
  if (v === undefined) return {};
  if (v === null || v === '') return { value: null };
  const n = Number(String(v).replace(',', '.'));
  if (!Number.isFinite(n) || n < 0 || n > 5) return { error: `${label} debe estar entre 0 y 5` };
  return { value: Math.round(n * 100) / 100 };
}

/** Campos editables de una nota (el curso/materia se fija aparte). */
export function parseGradeFields(body: any): { data?: Record<string, any>; error?: string } {
  const data: Record<string, any> = {};
  for (const [k, label] of [['notaFinal', 'Nota final'], ['habilitacion', 'Habilitación'], ['definitiva', 'Definitiva']] as const) {
    const r = parseGrade(body[k], label);
    if (r.error) return { error: r.error };
    if (r.value !== undefined) data[k] = r.value;
  }
  if (body.fallas !== undefined && body.fallas !== '') {
    const n = Number(body.fallas);
    if (!Number.isInteger(n) || n < 0 || n > 999) return { error: 'Fallas debe ser un entero ≥ 0' };
    data.fallas = n;
  }
  if (body.periodo !== undefined) data.periodo = String(body.periodo || '').trim() || null;
  // Definitiva automática si no se indica: habilitación (si hay) o nota final
  if (data.definitiva === undefined && body.definitiva === undefined) {
    if (data.habilitacion != null) data.definitiva = data.habilitacion;
    else if (data.notaFinal != null) data.definitiva = data.notaFinal;
  }
  return { data };
}

export const PROFILE_FIELDS = ['identificacion', 'situacion', 'jornada', 'horario', 'ubicacionSemestral', 'periodo'] as const;
