import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';
import { ROLES, canAssignRole, canManageUser, isSuperAdmin } from '@/lib/roles';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const user = await prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        university: true,
        career: true,
        bio: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        lastActiveAt: true,
        achievements: {
          include: { achievement: true },
        },
        certificates: true,
        progress: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const target = await prisma.user.findUnique({
      where: { id: params.userId },
      select: { id: true, role: true },
    });

    if (!target) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isSelf = target.id === auth.user.id;
    if (!isSelf && !canManageUser(auth.user.role, target.role)) {
      return NextResponse.json(
        { error: 'No tienes permiso para modificar a este usuario' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role, status, name, email, university, career, bio } = body;
    const updateData: Record<string, unknown> = {};

    if (role !== undefined && role !== target.role) {
      if (isSelf) {
        return NextResponse.json({ error: 'No puedes cambiar tu propio rol' }, { status: 403 });
      }
      if (!canAssignRole(auth.user.role, role)) {
        return NextResponse.json(
          { error: 'Solo un superadministrador puede asignar roles ADMIN o SUPER_ADMIN' },
          { status: 403 }
        );
      }
      updateData.role = role;
    }

    if (status !== undefined) {
      if (isSelf || isSuperAdmin(target.role)) {
        return NextResponse.json({ error: 'No se puede cambiar el estado de esta cuenta' }, { status: 403 });
      }
      updateData.status = status;
    }

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = String(email).trim().toLowerCase();
    if (university !== undefined) updateData.university = university;
    if (career !== undefined) updateData.career = career;
    if (bio !== undefined) updateData.bio = bio;

    const user = await prisma.user.update({
      where: { id: params.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const userToDelete = await prisma.user.findUnique({
      where: { id: params.userId },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!canManageUser(auth.user.role, userToDelete.role)) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar a este usuario' },
        { status: 403 }
      );
    }

    if (userToDelete.id === auth.user.id) {
      return NextResponse.json(
        { error: 'No puedes eliminar tu propia cuenta' },
        { status: 400 }
      );
    }

    if (userToDelete.role === ROLES.ADMIN) {
      const adminCount = await prisma.user.count({
        where: { role: { in: [ROLES.ADMIN, ROLES.SUPER_ADMIN] } },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Cannot delete the last admin user' },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({
      where: { id: params.userId },
    });

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
