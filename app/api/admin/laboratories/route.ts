import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const laboratories = await prisma.laboratory.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { experiments: true, progress: true },
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
      studentsCount: lab._count.progress,
      createdAt: lab.createdAt.toISOString().split('T')[0],
    }));

    return NextResponse.json(labs);
  } catch (error) {
    console.error('Error fetching laboratories:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, difficulty, instructor, requirements, duration, image } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Title, description and category are required' }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const laboratory = await prisma.laboratory.create({
      data: {
        title,
        slug,
        description,
        category,
        difficulty: difficulty || 'BASIC',
        instructor,
        requirements,
        duration: duration ? parseInt(duration) : null,
        image,
        status: 'DRAFT',
      },
    });

    return NextResponse.json(laboratory, { status: 201 });
  } catch (error) {
    console.error('Error creating laboratory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
