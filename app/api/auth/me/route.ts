import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as any)?.id;

    const [user, userProgress, achievements, certificates, labs, experiments] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          firstName: true,
          lastName: true,
          university: true,
          career: true,
          avatar: true,
          bio: true,
          createdAt: true,
        },
      }),
      prisma.userProgress.findMany({
        where: { userId },
        include: {
          laboratory: {
            select: {
              id: true,
              title: true,
              slug: true,
              category: true,
              image: true,
              difficulty: true,
            },
          },
          experimentProgress: true,
        },
        orderBy: { startedAt: 'desc' },
      }),
      prisma.userAchievement.findMany({
        where: { userId },
        include: {
          achievement: true,
        },
        orderBy: { earnedAt: 'desc' },
      }),
      prisma.certificate.findMany({
        where: { userId },
        orderBy: { issuedAt: 'desc' },
      }),
      prisma.laboratory.findMany({
        where: { status: 'PUBLISHED' },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          image: true,
          difficulty: true,
          duration: true,
          _count: { select: { experiments: true } },
        },
        orderBy: { order: 'asc' },
        take: 6,
      }),
      prisma.experiment.findMany({
        where: { laboratory: { status: 'PUBLISHED' } },
        select: {
          id: true,
          title: true,
          slug: true,
          laboratoryId: true,
          category: true,
          image: true,
        },
        take: 6,
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const stats = {
      experimentsCompleted: userProgress.filter(p => p.completed).length,
      hoursPracticed: Math.round((userProgress.reduce((acc, p) => acc + p.timeSpent, 0)) / 3600),
      certificates: certificates.length,
      achievements: achievements.length,
      totalProgress: userProgress.length,
      inProgress: userProgress.filter(p => !p.completed && p.progress > 0).length,
    };

    const progress = userProgress.map(p => ({
      id: p.id,
      laboratory: p.laboratory,
      progress: p.progress,
      completed: p.completed,
      score: p.score,
      startedAt: p.startedAt.toISOString(),
      completedAt: p.completedAt?.toISOString() || null,
      experimentsCompleted: p.experimentProgress.filter(ep => ep.completed).length,
      totalExperiments: p.experimentProgress.length,
    }));

    const earnedAchievements = achievements.map(a => ({
      id: a.achievement.id,
      name: a.achievement.name,
      slug: a.achievement.slug,
      description: a.achievement.description,
      icon: a.achievement.icon,
      color: a.achievement.color,
      earnedAt: a.earnedAt.toISOString(),
    }));

    const userCertificates = certificates.map(c => ({
      id: c.id,
      title: c.title,
      score: c.score,
      issuedAt: c.issuedAt.toISOString(),
    }));

    const availableLabs = labs.map(lab => ({
      ...lab,
      experiments: lab._count.experiments,
    }));

    const weeklyActivity = await getWeeklyActivity(userId);

    return NextResponse.json({
      user,
      stats,
      progress,
      achievements: earnedAchievements,
      certificates: userCertificates,
      laboratories: availableLabs,
      recentExperiments: experiments,
      weeklyActivity,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

async function getWeeklyActivity(userId: string) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  
  const recentProgress = await prisma.userProgress.findMany({
    where: {
      userId,
      startedAt: { gte: weekAgo },
    },
    select: {
      startedAt: true,
      timeSpent: true,
      progress: true,
      completed: true,
    },
  });

  const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const today = now.getDay();
  
  return days.map((day, index) => {
    const dayOffset = (index - today + 7) % 7;
    const targetDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
    targetDate.setHours(0, 0, 0, 0);
    
    const dayProgress = recentProgress.filter(p => {
      const progressDate = new Date(p.startedAt);
      progressDate.setHours(0, 0, 0, 0);
      return progressDate.getTime() === targetDate.getTime();
    });

    const hoursSpent = dayProgress.reduce((acc, p) => acc + p.timeSpent, 0) / 3600;
    const experimentsDone = dayProgress.filter(p => p.completed).length;

    return {
      day,
      hours: Math.round(hoursSpent * 10) / 10,
      experiments: experimentsDone,
    };
  });
}
