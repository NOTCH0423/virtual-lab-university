import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-guards';
import { isSuperAdmin } from '@/lib/roles';

export async function POST(request: Request) {
  try {
    const auth = await requireAdmin();
    if (!auth.ok) return auth.response;

    const body = await request.json();
    const { action } = body;

    if (action === 'export') {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, name: true, role: true, status: true, createdAt: true }
      });
      const laboratories = await prisma.laboratory.findMany({
        select: { id: true, title: true, slug: true, category: true, status: true }
      });
      const experiments = await prisma.experiment.findMany({
        select: { id: true, title: true, slug: true, category: true }
      });
      const achievements = await prisma.achievement.findMany({
        select: { id: true, name: true, slug: true, points: true }
      });
      const certificates = await prisma.certificate.findMany({
        select: { id: true, title: true, score: true, issuedAt: true }
      });

      return NextResponse.json({
        exportedAt: new Date().toISOString(),
        users: users.length,
        laboratories: laboratories.length,
        experiments: experiments.length,
        achievements: achievements.length,
        certificates: certificates.length,
        data: { users, laboratories, experiments, achievements, certificates }
      });
    }

    if (action === 'reset') {
      if (!isSuperAdmin(auth.user.role)) {
        return NextResponse.json({ error: 'Solo SUPER_ADMIN puede reiniciar la BD' }, { status: 403 });
      }
      await prisma.experimentResult.deleteMany();
      await prisma.experimentProgress.deleteMany();
      await prisma.userProgress.deleteMany();
      await prisma.userAchievement.deleteMany();
      await prisma.certificate.deleteMany();
      await prisma.session.deleteMany();

      return NextResponse.json({ success: true, message: 'Base de datos limpiada correctamente' });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Database operation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
