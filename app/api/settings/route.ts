import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userSelect = {
  id: true, email: true, name: true, firstName: true, lastName: true, role: true,
  avatar: true, university: true, career: true, bio: true, status: true,
  createdAt: true, updatedAt: true, lastActiveAt: true,
} as const;

async function getUserId() {
  const session = await getServerSession(authOptions);
  const id = (session?.user as any)?.id as string | undefined;
  if (id) return id;
  if (session?.user?.email) {
    const u = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } });
    return u?.id;
  }
  return undefined;
}

// GET /api/settings            -> usuario actual
// GET /api/settings?export=1   -> exportación completa de los datos del usuario
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    if (request.nextUrl.searchParams.get('export')) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          ...userSelect,
          progress: { include: { laboratory: { select: { id: true, title: true, slug: true } }, experimentProgress: true } },
          achievements: { include: { achievement: true } },
          certificates: true,
        },
      });
      if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
      return new NextResponse(JSON.stringify({ exportedAt: new Date().toISOString(), user }, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="mis-datos-virtual-lab.json"`,
        },
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error('settings GET error', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PATCH /api/settings  { name?, email? }
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const body = await request.json().catch(() => ({}));
    const data: { name?: string; email?: string } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (name.length < 2 || name.length > 100) {
        return NextResponse.json({ error: 'El nombre debe tener entre 2 y 100 caracteres' }, { status: 400 });
      }
      data.name = name;
    }
    if (body.email !== undefined) {
      const email = String(body.email).trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
      const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (existing && existing.id !== userId) {
        return NextResponse.json({ error: 'Ese email ya está en uso por otra cuenta' }, { status: 409 });
      }
      data.email = email;
    }
    if (!Object.keys(data).length) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });

    const user = await prisma.user.update({ where: { id: userId }, data, select: userSelect });
    return NextResponse.json(user);
  } catch (error: any) {
    if (error?.code === 'P2002') return NextResponse.json({ error: 'Ese email ya está en uso' }, { status: 409 });
    console.error('settings PATCH error', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// POST /api/settings  { currentPassword, newPassword, confirmPassword }
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    const { currentPassword, newPassword, confirmPassword } = await request.json().catch(() => ({}));

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Completa la contraseña actual y la nueva' }, { status: 400 });
    }
    if (String(newPassword).length < 8) {
      return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' }, { status: 400 });
    }
    if (confirmPassword !== undefined && newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'Las contraseñas no coinciden' }, { status: 400 });
    }
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } });
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    if (!(await bcrypt.compare(String(currentPassword), user.password))) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 400 });
    }
    await prisma.user.update({ where: { id: userId }, data: { password: await bcrypt.hash(String(newPassword), 10) } });
    return NextResponse.json({ message: 'Contraseña actualizada' });
  } catch (error) {
    console.error('settings POST error', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
