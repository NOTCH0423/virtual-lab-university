import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';
import { EMAIL_RE, STATUSES, canAssignRole, canManage, isValidRole } from '@/lib/admin-users';

export const dynamic = 'force-dynamic';

const select = {
  id: true, email: true, name: true, role: true, status: true, university: true, career: true,
  createdAt: true, updatedAt: true, lastActiveAt: true,
  _count: { select: { achievements: true, certificates: true, progress: true } },
} as const;

export async function GET(request: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const sp = request.nextUrl.searchParams;
    const search = (sp.get('search') || '').trim();
    const role = sp.get('role') || 'all';
    const status = sp.get('status') || 'all';
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role !== 'all') where.role = role;
    if (status !== 'all') where.status = status;

    const users = await prisma.user.findMany({ where, select, orderBy: { createdAt: 'desc' } });
    return NextResponse.json(
      users.map((u) => ({
        ...u,
        achievementsCount: u._count.achievements,
        certificatesCount: u._count.certificates,
        progressCount: u._count.progress,
      }))
    );
  } catch (err) {
    console.error('admin users GET', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

/**
 * POST { name, email, password, role }            -> crear usuario
 * POST { action: 'activate'|'suspend'|'ban', userIds } -> acción masiva de estado
 */
export async function POST(request: NextRequest) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await request.json().catch(() => ({}));

    if (body.action) {
      const map: Record<string, string> = { activate: 'ACTIVE', suspend: 'SUSPENDED', ban: 'BANNED' };
      const status = map[body.action];
      if (!status || !Array.isArray(body.userIds)) {
        return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
      }
      const targets = await prisma.user.findMany({
        where: { id: { in: body.userIds.map(String) } },
        select: { id: true, role: true },
      });
      const allowed = targets.filter((t) => t.id !== admin!.id && canManage(admin!, t)).map((t) => t.id);
      const r = await prisma.user.updateMany({ where: { id: { in: allowed } }, data: { status } });
      return NextResponse.json({ success: true, updated: r.count, skipped: body.userIds.length - r.count });
    }

    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const role = String(body.role || 'STUDENT').toUpperCase();
    if (name.length < 2) return NextResponse.json({ error: 'El nombre es obligatorio (mín. 2 caracteres)' }, { status: 400 });
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    if (!isValidRole(role)) return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    if (!canAssignRole(admin!, role)) {
      return NextResponse.json({ error: 'Solo un SUPER_ADMIN puede crear administradores' }, { status: 403 });
    }
    if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
      return NextResponse.json({ error: 'Ya existe un usuario con ese email' }, { status: 409 });
    }
    const status = STATUSES.includes(body.status) ? body.status : 'ACTIVE';
    const user = await prisma.user.create({
      data: { name, email, password: await bcrypt.hash(password, 10), role, status },
      select,
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    console.error('admin users POST', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
