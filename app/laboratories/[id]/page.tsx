'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navigation from '@/components/Navigation';
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  Play,
  BookOpen,
  Award,
  Share2,
  Bookmark,
  ChevronRight,
  CheckCircle,
  Lock,
  BarChart3,
  FlaskConical,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Experiment {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  completed: boolean;
  score: number | null;
  progress: number;
  locked: boolean;
  image: string;
}

interface LaboratoryDetail {
  id: string;
  title: string;
  category: string;
  description: string;
  longDescription: string;
  image: string;
  experimentCount: number;
  students: number;
  rating: number;
  duration: string;
  difficulty: string;
  level: number;
  instructor?: string;
  lastUpdated: string;
  requirements: string[];
  objectives?: string[];
  experiments: Experiment[];
  overallProgress: number;
  completedCount: number;
}

export default function LaboratoryDetailPage() {
  const params = useParams();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [labData, setLabData] = useState<LaboratoryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchLabData();
    }
  }, [params.id]);

  const fetchLabData = async () => {
    try {
      const res = await fetch(`/api/public/laboratories/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setLabData(data);
      }
    } catch (error) {
      console.error('Error fetching laboratory:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!labData) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Laboratorio no encontrado</h2>
          <Link href="/laboratories" className="text-primary-400 hover:text-primary-300">
            Volver a laboratorios
          </Link>
        </div>
      </div>
    );
  }

  const objectives = labData.objectives || [
    'Comprender los conceptos fundamentales del laboratorio',
    'Aplicar métodos científicos en experimentos virtuales',
    'Analizar y interpretar resultados experimentales',
    'Desarrollar habilidades de pensamiento crítico',
  ];

  const requirements = labData.requirements || [
    'Conocimientos básicos del área',
    'Algebra elemental',
    'Conceptos de trigonometría básica',
  ];

  const experiments = labData.experiments || [];

  const nextExperiment = experiments.find(e => !e.completed && !e.locked) || experiments[0];
  const nextExperimentPath = nextExperiment ? `/experiments/${nextExperiment.id}` : '/experiments';

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />

      <main className="pt-24 pb-12">
        <div className="relative h-80 overflow-hidden">
          <img
            src={labData.image}
            alt={labData.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-6 max-w-7xl mx-auto">
            <Link
              href="/laboratories"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a laboratorios
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-sm font-medium mb-3">
                  {labData.category}
                </span>
                <h1 className="text-4xl font-bold mb-2">{labData.title}</h1>
                <p className="text-gray-400 max-w-2xl">{labData.description}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-3 rounded-xl transition-colors ${
                    isBookmarked ? 'bg-primary-500/20 text-primary-400' : 'glass hover:bg-white/10'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
                <button className="p-3 rounded-xl glass hover:bg-white/10 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="gradient-border p-4 text-center">
                  <FlaskConical className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{experiments.length}</p>
                  <p className="text-sm text-gray-400">Experimentos</p>
                </div>
                <div className="gradient-border p-4 text-center">
                  <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{labData.students.toLocaleString()}</p>
                  <p className="text-sm text-gray-400">Estudiantes</p>
                </div>
                <div className="gradient-border p-4 text-center">
                  <Star className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{labData.rating.toFixed(1)}</p>
                  <p className="text-sm text-gray-400">Valoración</p>
                </div>
                <div className="gradient-border p-4 text-center">
                  <Clock className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold">{labData.duration}</p>
                  <p className="text-sm text-gray-400">Duración</p>
                </div>
              </div>

              <div className="gradient-border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary-400" />
                  Objetivos del Laboratorio
                </h2>
                <ul className="space-y-3">
                  {objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-300">{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="gradient-border p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-secondary-400" />
                  Experimentos Disponibles
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {experiments.map((experiment, index) => (
                    <motion.div
                      key={experiment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {experiment.locked ? (
                        <div className="relative opacity-50">
                          <div className="gradient-border overflow-hidden">
                            <div className="relative h-32">
                              <img
                                src={experiment.image}
                                alt={experiment.title}
                                className="w-full h-full object-cover grayscale"
                              />
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <Lock className="w-8 h-8 text-gray-400" />
                              </div>
                            </div>
                            <div className="p-4">
                              <h3 className="font-semibold text-gray-400">{experiment.title}</h3>
                              <p className="text-sm text-gray-500 mt-1">{experiment.description}</p>
                              <p className="text-xs text-gray-600 mt-2">Completa experimentos anteriores</p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <Link href={`/experiments/${experiment.id}`} className="block group">
                          <div className="gradient-border overflow-hidden">
                            <div className="relative h-32 overflow-hidden">
                              <img
                                src={experiment.image}
                                alt={experiment.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                              {experiment.completed && (
                                <div className="absolute top-3 right-3">
                                  <span className="flex items-center gap-1 px-2 py-1 bg-green-500/80 rounded-full text-xs font-medium">
                                    <CheckCircle className="w-3 h-3" /> {experiment.score}%
                                  </span>
                                </div>
                              )}
                              {!experiment.completed && experiment.progress > 0 && (
                                <div className="absolute top-3 right-3">
                                  <span className="px-2 py-1 bg-primary-500/80 rounded-full text-xs font-medium">
                                    {experiment.progress}%
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold group-hover:text-primary-400 transition-colors">
                                  {experiment.title}
                                </h3>
                                <span className="text-xs text-gray-500 flex items-center gap-1">
                                  <Clock className="w-3 h-3" /> {experiment.duration}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">{experiment.description}</p>
                              {!experiment.completed && experiment.progress > 0 && (
                                <div className="mt-3">
                                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                                      style={{ width: `${experiment.progress}%` }}
                                    />
                                  </div>
                                </div>
                              )}
                              {experiment.completed && (
                                <p className="text-xs text-green-400 mt-2 flex items-center gap-1">
                                  <Award className="w-3 h-3" /> Certificado obtenido
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="gradient-border p-6 sticky top-24">
                <h3 className="text-lg font-semibold mb-4">Información del Instructor</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-lg font-bold">
                    {labData.instructor ? labData.instructor.split(' ').map(n => n[0]).join('').slice(0, 2) : 'LI'}
                  </div>
                  <div>
                    <p className="font-medium">{labData.instructor || 'Instructor'}</p>
                    <p className="text-sm text-gray-400">Profesor Titular</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Última actualización: {labData.lastUpdated}
                </p>

                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-2">Requisitos</h4>
                  <ul className="space-y-2">
                    {requirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-gray-400">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={nextExperimentPath}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  {experiments.some(e => !e.completed && !e.locked) ? 'Continuar Experimento' : 'Comenzar de Nuevo'}
                </Link>

                <div className="mt-4 p-4 bg-white/5 rounded-xl">
                  <h4 className="text-sm font-medium mb-2">Tu Progreso</h4>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                        style={{ width: `${labData.overallProgress}%` }}
                      />
                    </div>
                    <span className="text-sm text-primary-400">{labData.overallProgress}%</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {labData.completedCount} de {experiments.length} experimentos completados
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
