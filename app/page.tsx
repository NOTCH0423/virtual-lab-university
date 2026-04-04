'use client';

import Link from 'next/link';
import { Beaker, ArrowRight, Play, Users, Award, Globe } from 'lucide-react';

const features = [
  {
    icon: Play,
    title: 'Simulaciones 3D Interactivas',
    description: 'Experimenta con fenómenos físicos, químicos y biológicos en entornos virtuales inmersivos.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Colaboración en Tiempo Real',
    description: 'Trabaja con tus compañeros en experimentos simultáneos desde cualquier ubicación.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Award,
    title: 'Certificaciones Oficiales',
    description: 'Obtén certificados por cada laboratorio completado y construye tu portfolio académico.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    icon: Globe,
    title: 'Acceso Global',
    description: 'Disponible 24/7 desde cualquier dispositivo con conexión a internet.',
    color: 'from-green-500 to-emerald-500',
  },
];

const laboratories = [
  {
    id: 'physics-mechanics',
    title: 'Mecánica Clásica',
    category: 'Física',
    description: 'Leyes de Newton, cinemática y dinámica de partículas',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80',
    experiments: 12,
    difficulty: 'Intermedio',
  },
  {
    id: 'chemistry-organic',
    title: 'Química Orgánica',
    category: 'Química',
    description: 'Reacciones orgánicas, grupos funcionales y síntesis',
    image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800&q=80',
    experiments: 8,
    difficulty: 'Avanzado',
  },
  {
    id: 'biology-cells',
    title: 'Biología Celular',
    category: 'Biología',
    description: 'Estructura celular, mitosis, meiosis y organelos',
    image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&q=80',
    experiments: 10,
    difficulty: 'Básico',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Beaker className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Virtual Lab</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 via-transparent to-secondary-500/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary-500/20 rounded-full blur-3xl animate-pulse-slow" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto">
            <div
              className="animate-fade-in"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/20 text-primary-400 text-sm font-medium mb-6">
                Plataforma #1 de Laboratorios Virtuales
              </span>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                Aprende experimentando en{' '}
                <span className="gradient-text">entornos virtuales</span>
              </h1>
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                Accede a más de 100 simulaciones de laboratorio universitario en física, química y biología. 
                Sin límites, sin riesgos, con resultados reales.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-lg text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 glow-primary"
                >
                  Comenzar Gratis <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/demo"
                  className="w-full sm:w-auto px-8 py-4 glass rounded-xl font-semibold text-lg text-white hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
                >
                  Ver Demo
                </Link>
              </div>
            </div>

            <div
              className="mt-20 relative"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent z-10" />
              <div className="rounded-2xl overflow-hidden border border-white/10 glow-primary">
                <img
                  src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=1200&q=80"
                  alt="Laboratorio Virtual"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="gradient-border p-6 hover:bg-white/5 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Laboratorios <span className="gradient-text">Destacados</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Explora nuestra colección de laboratorios virtuales diseñados por expertos universitarios
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {laboratories.map((lab, index) => (
              <div
                key={lab.id}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl glass">
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={lab.image}
                      alt={lab.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium">
                      {lab.difficulty}
                    </span>
                  </div>
                  <div className="p-6">
                    <span className="text-xs font-medium text-primary-400">{lab.category}</span>
                    <h3 className="text-xl font-semibold mt-1 mb-2">{lab.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{lab.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{lab.experiments} experimentos</span>
                      <Link
                        href={`/laboratories/${lab.id}`}
                        className="text-primary-400 text-sm font-medium hover:text-primary-300 flex items-center gap-1"
                      >
                        Explorar <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          <div className="text-center mt-12">
            <Link
              href="/laboratories"
              className="inline-flex items-center gap-2 px-6 py-3 glass rounded-xl font-medium hover:bg-white/10 transition-colors"
            >
              Ver todos los laboratorios <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 gradient-border m-4 lg:m-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-4xl font-bold mb-4">
            ¿Listo para comenzar tu experiencia?
          </h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Únete a miles de estudiantes que ya están aprendiendo de forma interactiva
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-lg text-white hover:opacity-90 transition-opacity glow-secondary"
          >
            Crear Cuenta Gratis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Beaker className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">Virtual Lab University</span>
            </div>
            <p className="text-gray-500 text-sm">
              © 2024 Virtual Lab. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
