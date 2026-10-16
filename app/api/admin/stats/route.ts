import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { error } = await requireAdmin();
    if (error) return error;

    const [
      totalUsers,
      activeUsers,
      totalExperiments,
      experimentsCompleted,
      totalTimeSpent,
      certificates,
      laboratories,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.experiment.count(),
      prisma.userProgress.count({ where: { completed: true } }),
      prisma.userProgress.aggregate({ _sum: { timeSpent: true } }),
      prisma.certificate.count(),
      prisma.laboratory.count({ where: { status: 'PUBLISHED' } }),
    ]);

    return NextResponse.json({
      totalUsers,
      activeUsers,
      suspendedUsers: totalUsers - activeUsers,
      bannedUsers: await prisma.user.count({ where: { status: 'BANNED' } }),
      totalExperiments,
      experimentsCompleted,
      totalHours: Math.round((totalTimeSpent._sum.timeSpent || 0) / 3600),
      certificates,
      laboratories,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
