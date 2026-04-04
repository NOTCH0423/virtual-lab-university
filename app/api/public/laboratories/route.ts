import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const labs = await prisma.laboratory.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        _count: { select: { experiments: true, progress: true } },
        experiments: {
          select: { id: true, slug: true, title: true },
          take: 6,
        },
      },
      orderBy: { order: 'asc' },
    });

    const laboratories = labs.map((lab) => ({
      id: lab.slug,
      title: lab.title,
      description: lab.description,
      category: lab.category.toLowerCase(),
      image: lab.image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&q=80',
      experiments: lab._count.experiments,
      students: lab._count.progress,
      rating: 4.5 + Math.random() * 0.5,
      duration: lab.duration ? `${lab.duration} min` : '30 min',
      difficulty: lab.difficulty.charAt(0) + lab.difficulty.slice(1).toLowerCase(),
      level: lab.difficulty === 'ADVANCED' ? 3 : lab.difficulty === 'INTERMEDIATE' ? 2 : 1,
      instructor: lab.instructor,
    }));

    return NextResponse.json(laboratories);
  } catch (error) {
    console.error('Error fetching laboratories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
