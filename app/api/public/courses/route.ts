import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { order: 'asc' },
    });

    const iconMap: Record<string, any> = {
      Física: 'Gauge',
      Química: 'FlaskConical',
      Biología: 'Dna',
      Ingeniería: 'Zap',
    };

    const colorMap: Record<string, string> = {
      Física: 'text-blue-400',
      Química: 'text-green-400',
      Biología: 'text-purple-400',
      Ingeniería: 'text-yellow-400',
    };

    const imageMap: Record<string, string> = {
      Física: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
      Química: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80',
      Biología: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=400&q=80',
      Ingeniería: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80',
    };

    const formattedCourses = courses.map((course) => ({
      id: course.slug,
      title: course.title,
      description: course.description,
      category: course.category,
      categoryIcon: iconMap[course.category] || 'BookOpen',
      categoryColor: colorMap[course.category] || 'text-gray-400',
      level: course.level.charAt(0) + course.level.slice(1).toLowerCase(),
      duration: course.duration ? `${course.duration} horas` : '30 horas',
      students: Math.floor(Math.random() * 2000 + 500),
      rating: 4.5 + Math.random() * 0.5,
      progress: 0,
      modules: course.modules,
      image: course.image || imageMap[course.category] || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80',
    }));

    return NextResponse.json(formattedCourses);
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
