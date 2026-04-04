import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email;
    const body = await request.json();
    const { experimentId, laboratoryId, score, data, completed, timeSpent } = body;

    if (!experimentId || !laboratoryId) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
    }

    let userProgress = await prisma.userProgress.findUnique({
      where: {
        userId_laboratoryId: {
          userId: userId,
          laboratoryId,
        },
      },
    });

    if (!userProgress) {
      userProgress = await prisma.userProgress.create({
        data: {
          userId,
          laboratoryId,
          startedAt: new Date(),
        },
      });
    }

    let experimentProgress = await prisma.experimentProgress.findUnique({
      where: {
        userProgressId_experimentId: {
          userProgressId: userProgress.id,
          experimentId,
        },
      },
    });

    const isImprovement = !experimentProgress || (score && experimentProgress.score && score > experimentProgress.score);

    experimentProgress = await prisma.experimentProgress.upsert({
      where: {
        userProgressId_experimentId: {
          userProgressId: userProgress.id,
          experimentId,
        },
      },
      create: {
        userProgressId: userProgress.id,
        experimentId,
        completed: completed || false,
        score: score || null,
        timeSpent: timeSpent || 0,
        data: JSON.stringify(data) || null,
        startedAt: new Date(),
        completedAt: completed ? new Date() : null,
      },
      update: {
        attempts: { increment: 1 },
        completed: completed || experimentProgress?.completed || false,
        score: isImprovement ? score : experimentProgress?.score,
        timeSpent: timeSpent ? (experimentProgress?.timeSpent || 0) + timeSpent : experimentProgress?.timeSpent,
        data: data ? JSON.stringify(data) : experimentProgress?.data,
        completedAt: completed ? new Date() : experimentProgress?.completedAt,
      },
    });

    if (score !== undefined) {
      await prisma.experimentResult.create({
        data: {
          experimentProgressId: experimentProgress.id,
          experimentId,
          score: score || 0,
          data: JSON.stringify(data) || '{}',
        },
      });
    }

    const totalExperiments = await prisma.experiment.count({
      where: { laboratoryId },
    });

    const completedExperiments = await prisma.experimentProgress.count({
      where: {
        userProgressId: userProgress.id,
        completed: true,
      },
    });

    const progressPercentage = totalExperiments > 0 
      ? Math.round((completedExperiments / totalExperiments) * 100) 
      : 0;

    const isLabCompleted = progressPercentage === 100;

    await prisma.userProgress.update({
      where: { id: userProgress.id },
      data: {
        progress: progressPercentage,
        completed: isLabCompleted,
        completedAt: isLabCompleted ? new Date() : null,
        score: isLabCompleted ? score : undefined,
      },
    });

    if (isLabCompleted) {
      const existingCert = await prisma.certificate.findFirst({
        where: {
          userId,
          laboratoryId,
        },
      });

      if (!existingCert) {
        const laboratory = await prisma.laboratory.findUnique({
          where: { id: laboratoryId },
        });

        await prisma.certificate.create({
          data: {
            userId,
            laboratoryId,
            title: `Certificado de ${laboratory?.title || 'Laboratorio'}`,
            description: `Completó exitosamente todos los experimentos del laboratorio de ${laboratory?.title || 'laboratorio'}`,
            score: score || 85,
          },
        });

        const firstStepAchievement = await prisma.achievement.findUnique({
          where: { slug: 'primer-paso' },
        });

        if (firstStepAchievement) {
          await prisma.userAchievement.upsert({
            where: {
              userId_achievementId: {
                userId,
                achievementId: firstStepAchievement.id,
              },
            },
            create: {
              userId,
              achievementId: firstStepAchievement.id,
            },
            update: {},
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      experimentProgress,
      userProgress: {
        ...userProgress,
        progress: progressPercentage,
        completed: isLabCompleted,
      },
      labCompleted: isLabCompleted,
    });
  } catch (error) {
    console.error('Error saving experiment:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
