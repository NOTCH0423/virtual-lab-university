import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const lab = await prisma.laboratory.findFirst({
      where: { 
        OR: [
          { slug: params.id },
          { id: params.id },
        ],
      },
      include: {
        experiments: {
          orderBy: { order: 'asc' },
        },
        _count: { select: { experiments: true, progress: true } },
      },
    });

    if (!lab) {
      return NextResponse.json({ error: 'Laboratory not found' }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    let userProgress = null;

    if (session?.user) {
      const userId = (session.user as any)?.id;
      userProgress = await prisma.userProgress.findUnique({
        where: {
          userId_laboratoryId: {
            userId,
            laboratoryId: lab.id,
          },
        },
        include: {
          experimentProgress: true,
        },
      });
    }

    const laboratory = {
      id: lab.slug,
      title: lab.title,
      category: lab.category,
      description: lab.description,
      longDescription: lab.description,
      image: lab.image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80',
      experimentCount: lab._count.experiments,
      students: lab._count.progress,
      rating: 4.5 + Math.random() * 0.5,
      duration: lab.duration ? `${lab.duration} min` : '45 min',
      difficulty: lab.difficulty.charAt(0) + lab.difficulty.slice(1).toLowerCase(),
      level: lab.difficulty === 'ADVANCED' ? 3 : lab.difficulty === 'INTERMEDIATE' ? 2 : 1,
      instructor: lab.instructor,
      lastUpdated: lab.updatedAt.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' }),
      requirements: ['Conocimientos básicos de física', 'Algebra elemental', 'Conceptos de trigonometría'],
    };

    const experiments = lab.experiments.map((exp, index) => {
      const expProgress = userProgress?.experimentProgress.find(
        (ep) => ep.experimentId === exp.id
      );

      return {
        id: exp.slug,
        title: exp.title,
        description: exp.description,
        duration: exp.duration ? `${exp.duration} min` : '20 min',
        difficulty: exp.difficulty.charAt(0) + exp.difficulty.slice(1).toLowerCase(),
        completed: expProgress?.completed || false,
        score: expProgress?.score || null,
        progress: expProgress ? (expProgress.completed ? 100 : Math.round((expProgress.timeSpent / (exp.duration || 20)) * 100)) : 0,
        locked: index > 0 && userProgress?.experimentProgress && !userProgress.experimentProgress[index - 1]?.completed,
        image: exp.image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&q=80',
      };
    });

    const completedCount = experiments.filter((e) => e.completed).length;
    const overallProgress = lab.experiments.length > 0 
      ? Math.round((completedCount / lab.experiments.length) * 100) 
      : 0;

    return NextResponse.json({ ...laboratory, experiments, overallProgress, completedCount });
  } catch (error) {
    console.error('Error fetching laboratory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
