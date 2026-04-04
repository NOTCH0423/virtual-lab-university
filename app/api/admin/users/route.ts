import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || 'all';
    const status = searchParams.get('status') || 'all';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    if (role !== 'all') {
      where.role = role;
    }

    if (status !== 'all') {
      where.status = status;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        university: true,
        career: true,
        createdAt: true,
        updatedAt: true,
        lastActiveAt: true,
        _count: {
          select: {
            achievements: true,
            certificates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const usersWithProgress = users.map(user => ({
      ...user,
      progress: 0,
      lastActive: user.lastActiveAt 
        ? new Date(user.lastActiveAt).toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : 'Nunca',
      createdAt: user.createdAt.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }),
      achievementsCount: user._count.achievements,
      certificatesCount: user._count.certificates,
    }));

    return NextResponse.json(usersWithProgress);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, userIds } = body;

    if (!action || !userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case 'suspend':
        updateData = { status: 'SUSPENDED' };
        break;
      case 'activate':
        updateData = { status: 'ACTIVE' };
        break;
      case 'ban':
        updateData = { status: 'BANNED' };
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    await prisma.user.updateMany({
      where: { id: { in: userIds } },
      data: updateData,
    });

    return NextResponse.json({ success: true, message: `Users ${action}d successfully` });
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
