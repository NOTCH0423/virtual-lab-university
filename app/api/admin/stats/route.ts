import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
      bannedUsers: 0,
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
