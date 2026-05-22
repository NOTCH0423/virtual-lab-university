import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const achievements = await prisma.achievement.findMany({
      orderBy: { points: 'desc' },
    });

    const formattedAchievements = achievements.map(a => ({
      id: a.id,
      name: a.name,
      slug: a.slug,
      description: a.description,
      icon: a.icon,
      color: a.color,
      category: a.category,
      points: a.points,
    }));

    return NextResponse.json(formattedAchievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
