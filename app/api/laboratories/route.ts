import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const laboratories = await prisma.laboratory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { experiments: true },
        },
      },
    });

    const labs = laboratories.map(lab => ({
      id: lab.id,
      title: lab.title,
      slug: lab.slug,
      description: lab.description,
      category: lab.category,
      difficulty: lab.difficulty,
      status: lab.status,
      instructor: lab.instructor,
      requirements: lab.requirements,
      duration: lab.duration,
      image: lab.image,
      experimentsCount: lab._count.experiments,
      createdAt: lab.createdAt.toISOString().split('T')[0],
    }));

    return NextResponse.json(labs);
  } catch (error) {
    console.error('Error fetching laboratories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
