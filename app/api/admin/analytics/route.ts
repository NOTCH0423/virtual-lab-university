import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/admin';

export const dynamic = 'force-dynamic';

const DAY = 24 * 60 * 60 * 1000;
const COLORS = ['#3b82f6', '#22c55e', '#8b5cf6', '#f59e0b', '#ef4444', '#14b8a6'];

function pct(curr: number, prev: number) {
  if (!prev) return curr ? '+100%' : '0%';
  const v = Math.round(((curr - prev) / prev) * 100);
  return `${v >= 0 ? '+' : ''}${v}%`;
}

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * DAY);
    const twoWeeksAgo = new Date(now.getTime() - 14 * DAY);

    const [
      totalUsers, activeUsers, totalExperiments, experimentsCompleted, timeAgg, certificates, labs,
      recentProgress, weekProgress, newUsersWeek, newUsersPrevWeek, labsWithCounts, experiments, topUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.experiment.count(),
      prisma.userProgress.count({ where: { completed: true } }),
      prisma.userProgress.aggregate({ _sum: { timeSpent: true } }),
      prisma.certificate.count(),
      prisma.laboratory.count({ where: { status: 'PUBLISHED' } }),
      prisma.userProgress.findMany({
        take: 8,
        orderBy: { startedAt: 'desc' },
        include: { user: { select: { name: true } }, laboratory: { select: { title: true } } },
      }),
      prisma.userProgress.findMany({
        where: { startedAt: { gte: weekAgo } },
        select: { userId: true, startedAt: true, completed: true, timeSpent: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: twoWeeksAgo, lt: weekAgo } } }),
      prisma.laboratory.findMany({
        select: { category: true, progress: { select: { completed: true, startedAt: true } } },
      }),
      prisma.experiment.findMany({
        select: {
          title: true,
          progress: { select: { completed: true, completedAt: true } },
          results: { select: { score: true, createdAt: true } },
        },
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { progress: { _count: 'desc' } },
        select: {
          name: true, role: true,
          _count: { select: { certificates: true, progress: true } },
          progress: { select: { timeSpent: true } },
        },
      }),
    ]);

    // Actividad real de los últimos 7 días
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const weeklyData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now.getTime() - (6 - i) * DAY);
      d.setHours(0, 0, 0, 0);
      const next = d.getTime() + DAY;
      const items = weekProgress.filter((p) => p.startedAt.getTime() >= d.getTime() && p.startedAt.getTime() < next);
      return {
        day: days[d.getDay()],
        users: new Set(items.map((p) => p.userId)).size,
        experiments: items.filter((p) => p.completed).length,
        hours: Math.round((items.reduce((a, p) => a + p.timeSpent, 0) / 3600) * 10) / 10,
      };
    });

    // Completados por categoría de laboratorio (semana actual vs anterior)
    const byCat = new Map<string, { completions: number; curr: number; prev: number }>();
    for (const l of labsWithCounts) {
      const c = byCat.get(l.category) || { completions: 0, curr: 0, prev: 0 };
      for (const p of l.progress) {
        if (p.completed) c.completions++;
        if (p.startedAt >= weekAgo) c.curr++;
        else if (p.startedAt >= twoWeeksAgo) c.prev++;
      }
      byCat.set(l.category, c);
    }
    const categoryStats = Array.from(byCat.entries()).map(([name, c], i) => ({
      name: name.charAt(0) + name.slice(1).toLowerCase(),
      completions: c.completions,
      growth: c.prev ? Math.round(((c.curr - c.prev) / c.prev) * 100) : c.curr ? 100 : 0,
      color: COLORS[i % COLORS.length],
    }));

    const topExperiments = experiments
      .map((e) => {
        const completions = e.progress.filter((p) => p.completed).length + e.results.length;
        const scores = e.results.map((r) => r.score).filter((s): s is number => typeof s === 'number');
        const curr = e.results.filter((r) => r.createdAt >= weekAgo).length;
        const prev = e.results.filter((r) => r.createdAt >= twoWeeksAgo && r.createdAt < weekAgo).length;
        return {
          name: e.title,
          completions,
          rating: scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length / 20).toFixed(1) : '—',
          growth: pct(curr, prev),
        };
      })
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 5);

    const recentActivity = recentProgress.map((p, index) => ({
      id: index + 1,
      user: p.user.name,
      action: p.completed ? 'completó' : 'inició',
      item: p.laboratory.title,
      time: getTimeAgo(p.startedAt),
      avatar: p.user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
    }));

    const userStats = topUsers.map((u) => ({
      name: u.name,
      experiments: u._count.progress,
      hours: Math.round(u.progress.reduce((a, p) => a + p.timeSpent, 0) / 3600),
      certificates: u._count.certificates,
      role: u.role,
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        totalExperiments,
        experimentsCompleted,
        totalHours: Math.round((timeAgg._sum.timeSpent || 0) / 3600),
        certificates,
        laboratories: labs,
        newUsersWeek,
        usersGrowth: pct(newUsersWeek, newUsersPrevWeek),
      },
      weeklyData,
      categoryStats,
      topExperiments,
      topUsers: userStats,
      recentActivity,
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

function getTimeAgo(date: Date): string {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  return `Hace ${days} día${days > 1 ? 's' : ''}`;
}
