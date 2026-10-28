import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireTeacher } from '@/lib/auth-guards';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const auth = await requireTeacher();
    if (!auth.ok) return auth.response;

    const userId = auth.user.id;

    const [
      totalStudents,
      totalProgress,
      totalCertificates,
      labs,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.userProgress.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          laboratory: { select: { id: true, title: true, slug: true, image: true } },
        },
        orderBy: { startedAt: 'desc' },
      }),
      prisma.certificate.count(),
      prisma.laboratory.findMany({
        where: { status: 'PUBLISHED' },
        include: {
          _count: { select: { experiments: true, progress: true } },
          experiments: { select: { id: true, title: true, slug: true, image: true } },
        },
        orderBy: { order: 'asc' },
      }),
    ]);

    const labsWithData = labs.map(lab => ({
      id: lab.id,
      title: lab.title,
      slug: lab.slug,
      image: lab.image,
      students: lab._count.progress,
      experiments: lab._count.experiments,
      difficulty: lab.difficulty,
    }));

    const recentProgress = totalProgress;
    
    const pendingTasks = recentProgress.filter(p => !p.completed).length;
    
    const avgScore = recentProgress.filter(p => p.completed && p.score).length > 0
      ? Math.round(recentProgress.filter(p => p.completed && p.score).reduce((acc, p) => acc + (p.score || 0), 0) / recentProgress.filter(p => p.completed && p.score).length)
      : 0;

    const submissions = recentProgress.slice(0, 10).map(p => ({
      student: p.user.name,
      email: p.user.email,
      assignment: p.laboratory.title,
      submittedAt: p.startedAt.toISOString(),
      status: p.completed ? 'graded' : 'pending',
      score: p.score,
      laboratorySlug: p.laboratory.slug,
    }));

    const studentProgress = recentProgress.slice(0, 10).map(p => ({
      name: p.user.name,
      email: p.user.email,
      course: p.laboratory.title,
      progress: p.progress,
      lastActive: p.startedAt.toISOString(),
      grade: p.score || 0,
    }));

    const totalExperiments = labs.reduce((acc, lab) => acc + lab._count.experiments, 0);
    const completedExperiments = recentProgress.filter(p => p.completed).length;

    return NextResponse.json({
      stats: {
        courses: labs.length,
        students: totalStudents,
        pendingTasks,
        averageGrade: avgScore,
        totalExperiments,
        completedExperiments,
        certificates: totalCertificates,
      },
      courses: labsWithData,
      submissions,
      studentProgress,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching teacher data:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
