import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const systemStats = await prisma.systemStats.findFirst();
    
    // Get laboratories with experiment counts
    const laboratories = await prisma.laboratory.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        _count: {
          select: { experiments: true },
        },
      },
      orderBy: { order: 'asc' },
    });

    // Get weekly stats
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const dailyStats = await prisma.dailyStats.findMany({
      where: {
        date: { gte: weekAgo },
      },
      orderBy: { date: 'asc' },
    });

    // Get recent activity
    const recentSessions = await prisma.session.findMany({
      where: {
        createdAt: { gte: weekAgo },
      },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get top experiments
    const experimentStats = await prisma.experimentProgress.groupBy({
      by: ['experimentId'],
      where: { completed: true },
      _count: true,
      orderBy: { _count: { experimentId: 'desc' } },
      take: 5,
    });

    const topExperiments = await Promise.all(
      experimentStats.map(async (stat) => {
        const experiment = await prisma.experiment.findUnique({
          where: { id: stat.experimentId },
          include: { laboratory: true },
        });
        return {
          ...experiment,
          completions: stat._count,
        };
      })
    );

    // Get category stats
    const categoryStats = await prisma.experimentProgress.groupBy({
      by: ['experimentId'],
      _count: true,
    });

    const labsWithCategory = await prisma.laboratory.findMany({
      where: { status: 'PUBLISHED' },
      select: { category: true },
    });

    const categoryCounts = labsWithCategory.reduce((acc, lab) => {
      acc[lab.category] = (acc[lab.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      system: systemStats || {
        totalUsers: 0,
        activeUsers: 0,
        totalExperiments: 0,
        experimentsCompleted: 0,
        totalHours: 0,
        certificates: 0,
      },
      laboratories: laboratories.map((lab) => ({
        id: lab.id,
        title: lab.title,
        slug: lab.slug,
        category: lab.category,
        difficulty: lab.difficulty,
        experiments: lab._count.experiments,
      })),
      weeklyStats: dailyStats.map((stat) => ({
        date: stat.date,
        activeUsers: stat.activeUsers,
        newUsers: stat.newUsers,
        experimentsCompleted: stat.experimentsCompleted,
        totalHours: stat.totalHours,
      })),
      recentActivity: recentSessions.map((session) => ({
        id: session.id,
        user: session.user.name,
        email: session.user.email,
        action: 'logged_in',
        time: session.createdAt,
      })),
      topExperiments: topExperiments.filter(Boolean),
      categoryStats,
      categories: Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count,
      })),
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    );
  }
}
