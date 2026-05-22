import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const experiments = await prisma.experiment.findMany({
      include: {
        laboratory: { select: { title: true, slug: true } },
        _count: { select: { results: true } },
      },
      orderBy: { order: 'asc' },
    });

    const simulationPaths: Record<string, string> = {
      'chemistry-lab': '/experiments/chemistry-lab',
      'pendulum-sim': '/experiments/pendulum',
      'projectile-sim': '/experiments/projectile-motion',
      'titration-sim': '/experiments/titration',
      'atom-sim': '/experiments/atomic-structure',
      'circuit-sim': '/experiments/circuit-analysis',
      'mitosis-sim': '/experiments/mitosis',
      'gas-sim': '/experiments/gas-simulation',
      'wave-sim': '/experiments/wave-interference',
    };

    const iconMap: Record<string, any> = {
      Física: 'Gauge',
      Química: 'FlaskConical',
      Biología: 'Dna',
      Ingeniería: 'Zap',
    };

    const colorMap: Record<string, { color: string; bgColor: string }> = {
      Física: { color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
      Química: { color: 'text-emerald-400', bgColor: 'bg-emerald-400/10' },
      Biología: { color: 'text-pink-400', bgColor: 'bg-pink-400/10' },
      Ingeniería: { color: 'text-orange-400', bgColor: 'bg-orange-400/10' },
    };

    const simulations = experiments.map((exp) => {
      const colors = colorMap[exp.category] || colorMap['Física'];
      const labSlug = exp.laboratory?.slug || 'general';
      const pathKey = `${labSlug}-${exp.slug.split('-')[0]}`;
      const path = simulationPaths[pathKey] || `/experiments/${exp.slug}`;

      return {
        id: exp.slug,
        title: exp.title,
        description: exp.description,
        category: exp.category,
        icon: iconMap[exp.category] || 'FlaskConical',
        ...colors,
        difficulty: exp.difficulty.charAt(0) + exp.difficulty.slice(1).toLowerCase(),
        duration: exp.duration ? `${exp.duration} min` : '20 min',
        students: exp._count.results || Math.floor(Math.random() * 3000 + 500),
        rating: 4.5 + Math.random() * 0.5,
        image: exp.image || `https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80`,
        tags: exp.category.toLowerCase().split(''),
        path,
      };
    });

    const categories = ['Todos', 'Física', 'Química', 'Biología', 'Ingeniería'];
    const featuredSimulation = simulations[0] || simulations.find(s => s.category === 'Química') || simulations[0];

    return NextResponse.json({ simulations, categories, featuredSimulation });
  } catch (error) {
    console.error('Error fetching simulations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
