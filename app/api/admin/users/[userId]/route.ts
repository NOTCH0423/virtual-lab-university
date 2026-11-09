import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { EMAIL_RE, STATUSES, canAssignRole, canManage, isValidRole } from '@/lib/admin-users';

export const dynamic = 'force-dynamic';
type Ctx = { params: { userId: string } };

const select = {
  id: true, email: true, name: true, firstName: true, lastName: true, role: true, status: true,
  university: true, career: true, bio: true, avatar: true, createdAt: true, updatedAt: true, lastActiveAt: true,
  _count: { select: { achievements: true, certificates: true, progress: true } },
} as const;

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;
  const user = await prisma.user.findUnique({ where: { id: params.userId }, select });
  if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  return NextResponse.json(user);
}

/** PATCH { name?, email?, role?, status?, password? } */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  try {
    const target = await prisma.user.findUnique({ where: { id: params.userId }, select: { id: true, role: true } });
    if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    const isSelf = target.id === admin!.id;
    if (!canManage(admin!, target)) {
      return NextResponse.json(
        { error: target.role === 'SUPER_ADMIN' ? 'No se puede modificar a un SUPER_ADMIN' : 'No tienes permiso para modificar a este administrador' },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const data: Record<string, any> = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (name.length < 2 || name.length > 100) return NextResponse.json({ error: 'Nombre inválido (2-100 caracteres)' }, { status: 400 });
      data.name = name;
    }
    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
      const other = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (other && other.id !== target.id) return NextResponse.json({ error: 'Ese email ya está en uso' }, { status: 409 });
      data.email = email;
    }
    if (body.role !== undefined) {
      const role = String(body.role).toUpperCase();
      if (role !== target.role) {
        if (isSelf) return NextResponse.json({ error: 'No puedes cambiar tu propio rol' }, { status: 403 });
        if (!isValidRole(role)) return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
        if (!canAssignRole(admin!, role)) {
          return NextResponse.json({ error: 'Solo un SUPER_ADMIN puede asignar roles de administrador' }, { status: 403 });
        }
        data.role = role;
      }
    }
    if (body.status !== undefined) {
      const status = String(body.status).toUpperCase();
      if (!(STATUSES as readonly string[]).includes(status)) return NextResponse.json({ error: 'Estado inválido' }, { status: 400 });
      if (isSelf && status !== 'ACTIVE') return NextResponse.json({ error: 'No puedes desactivar tu propia cuenta' }, { status: 403 });
      data.status = status;
    }
    if (body.password) {
      if (String(body.password).length < 8) return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
      data.password = await bcrypt.hash(String(body.password), 10);
    }
    if (!Object.keys(data).length) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });

    const user = await prisma.user.update({ where: { id: target.id }, data, select });
    return NextResponse.json(user);
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Ese email ya está en uso' }, { status: 409 });
    console.error('admin user PATCH', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  try {
    const target = await prisma.user.findUnique({ where: { id: params.userId }, select: { id: true, role: true } });
    if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    if (target.id === admin!.id) return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta' }, { status: 403 });
    if (!canManage(admin!, target)) {
      return NextResponse.json({ error: 'No tienes permiso para eliminar a este usuario' }, { status: 403 });
    }
    await prisma.user.delete({ where: { id: target.id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('admin user DELETE', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
