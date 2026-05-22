import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      orderBy: { order: 'asc' },
    });

    const formattedCourses = courses.map(course => ({
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description,
      category: course.category,
      image: course.image,
      level: course.level,
      duration: course.duration,
      modules: course.modules,
      status: course.status,
      order: course.order,
      createdAt: course.createdAt.toISOString(),
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
