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

    const courses = await prisma.course.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      category: course.category,
      level: course.level,
      duration: course.duration,
      modules: course.modules,
      status: course.status,
      image: course.image,
      createdAt: course.createdAt.toISOString().split('T')[0],
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
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
    const { title, description, category, level, duration, modules, image } = body;

    if (!title || !description || !category) {
      return NextResponse.json({ error: 'Title, description and category are required' }, { status: 400 });
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const course = await prisma.course.create({
      data: {
        title,
        slug,
        description,
        category,
        level: level || 'BASIC',
        duration: duration ? parseInt(duration) : null,
        modules: modules ? parseInt(modules) : 0,
        image,
        status: 'DRAFT',
      },
    });

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
