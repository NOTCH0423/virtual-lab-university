'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import {
  BookOpen,
  Clock,
  Trophy,
  TrendingUp,
  Play,
  ChevronRight,
  Star,
  Award,
  Users,
  FlaskConical,
  RefreshCw,
  Activity,
  Target,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface UserData {
  user: {
    id: string;
    name: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    university: string | null;
    career: string | null;
    avatar: string | null;
    bio: string | null;
  };
  stats: {
    experimentsCompleted: number;
    hoursPracticed: number;
    certificates: number;
    achievements: number;
    totalProgress: number;
    inProgress: number;
  };
  progress: Array<{
    id: string;
    laboratory: {
      id: string;
      title: string;
      slug: string;
      category: string;
      image: string | null;
      difficulty: string;
    };
    progress: number;
    completed: boolean;
    score: number | null;
    startedAt: string;
    completedAt: string | null;
    experimentsCompleted: number;
    totalExperiments: number;
  }>;
  achievements: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    icon: string | null;
    color: string | null;
    earnedAt: string;
  }>;
  certificates: Array<{
    id: string;
    title: string;
    score: number;
    issuedAt: string;
  }>;
  laboratories: Array<{
    id: string;
    title: string;
    slug: string;
    category: string;
    image: string | null;
    difficulty: string;
    duration: number | null;
    experiments: number;
  }>;
  weeklyActivity: Array<{
    day: string;
    hours: number;
    experiments: number;
  }>;
  lastUpdated: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'updating'>('connected');

  const fetchData = useCallback(async () => {
    try {
      setConnectionStatus('updating');
      setLoading(true);
      
      const userRes = await fetch('/api/auth/me');

      if (!userRes.ok) {
        throw new Error('Error fetching data');
      }

      const data = await userRes.json();
      setUserData(data);
      setLastUpdate(new Date());
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error fetching data:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status, fetchData]);

  useEffect(() => {
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (status === 'loading' || (loading && !userData)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!session || !userData) {
    return null;
  }

  const firstName = userData.user?.firstName || userData.user?.name?.split(' ')[0] || 'Usuario';
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const stats = [
    { 
      label: 'Experimentos completados', 
      value: userData.stats.experimentsCompleted, 
      icon: FlaskConical, 
      change: userData.stats.experimentsCompleted > 0 ? `+${userData.stats.experimentsCompleted} total` : '0 aún',
      color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30',
      iconColor: 'text-blue-400',
    },
    { 
      label: 'Horas de práctica', 
      value: userData.stats.hoursPracticed, 
      icon: Clock, 
      change: userData.stats.hoursPracticed > 0 ? '¡Sigue aprendiendo!' : 'Empieza hoy',
      color: 'from-green-500/20 to-green-600/10 border-green-500/30',
      iconColor: 'text-green-400',
    },
    { 
      label: 'Logros obtenidos', 
      value: userData.stats.achievements, 
      icon: Trophy, 
      change: userData.stats.achievements > 0 ? '¡Felicitaciones!' : 'Completa experimentos',
      color: 'from-orange-500/20 to-orange-600/10 border-orange-500/30',
      iconColor: 'text-orange-400',
    },
    { 
      label: 'Certificados', 
      value: userData.stats.certificates, 
      icon: Award, 
      change: userData.stats.certificates > 0 ? '¡Bien hecho!' : 'Completa laboratorios',
      color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30',
      iconColor: 'text-purple-400',
    },
  ];

  const weeklyActivity = userData.weeklyActivity || [];
  const maxHours = Math.max(...weeklyActivity.map(d => d.hours), 1);

  const getIconComponent = (iconName: string | null) => {
    const icons: Record<string, any> = {
      Target, Zap, Award, Trophy, Star, FlaskConical, Clock,
    };
    return icons[iconName || ''] || Target;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{getGreeting()}, {firstName}! 👋</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                connectionStatus === 'updating' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                <Activity className={`w-3 h-3 ${connectionStatus === 'updating' ? 'animate-pulse' : ''}`} />
                {connectionStatus === 'connected' ? 'En vivo' : connectionStatus === 'updating' ? 'Actualizando...' : 'Desconectado'}
              </span>
            </div>
            <p className="text-gray-400">
              Continúa tu aprendizaje donde lo dejaste
              <span className="ml-2 text-xs text-gray-500">• Actualizado {lastUpdate.toLocaleTimeString()}</span>
            </p>
          </div>
          <button 
            onClick={fetchData}
            disabled={connectionStatus === 'updating'}
            className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${connectionStatus === 'updating' ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br ${stat.color} rounded-xl p-6 border`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center ${stat.iconColor}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-xs text-gray-400">{stat.change}</span>
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-400" />
                Tu Progreso Semanal
              </h2>
              <span className="text-xs text-gray-500">
                Total: {weeklyActivity.reduce((acc, d) => acc + d.hours, 0).toFixed(1)} horas
              </span>
            </div>
            <div className="flex items-end justify-between h-40 gap-2">
              {weeklyActivity.map((day, index) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max((day.hours / maxHours) * 100, 5)}%` }}
                    transition={{ delay: index * 0.05, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-primary-500 to-secondary-500 rounded-t-lg min-h-[4px]"
                  />
                  <span className="text-xs text-gray-500">{day.day}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-400">
                Experimentos esta semana: {weeklyActivity.reduce((acc, d) => acc + d.experiments, 0)}
              </span>
            </div>
          </div>

          <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Logros Recientes
            </h2>
            {userData.achievements && userData.achievements.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {userData.achievements.slice(0, 6).map((achievement, index) => {
                  const IconComponent = getIconComponent(achievement.icon);
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative group"
                      title={`${achievement.name}: ${achievement.description}`}
                    >
                      <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500">
                        <IconComponent className="w-7 h-7 text-white" />
                      </div>
                      <p className="text-xs text-center mt-2 text-white truncate">
                        {achievement.name}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Completa experimentos para ganar logros</p>
              </div>
            )}
            <Link
              href="/achievements"
              className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-400 hover:text-primary-300"
            >
              Ver todos los logros <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {userData.progress && userData.progress.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-400" />
                Tu Progreso en Laboratorios
              </h2>
              <Link href="/laboratories" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
                Ver todos <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {userData.progress.slice(0, 3).map((prog, index) => (
                <motion.div
                  key={prog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden group"
                >
                  <div className="relative h-32 overflow-hidden">
                    {prog.laboratory.image ? (
                      <img
                        src={prog.laboratory.image}
                        alt={prog.laboratory.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                        <FlaskConical className="w-12 h-12 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-full text-xs font-medium">
                        {prog.laboratory.category}
                      </span>
                    </div>
                    {prog.completed && (
                      <div className="absolute top-3 right-3">
                        <span className="px-2 py-1 bg-green-500/80 rounded-full text-xs font-medium flex items-center gap-1">
                          <Award className="w-3 h-3" /> {prog.score}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{prog.laboratory.title}</h3>
                    {!prog.completed && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">Progreso</span>
                          <span className="text-primary-400">{prog.progress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all"
                            style={{ width: `${prog.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {prog.experimentsCompleted}/{prog.totalExperiments} experimentos
                      </span>
                      <Link
                        href={`/laboratories/${prog.laboratory.slug}`}
                        className={`flex items-center gap-1 text-sm font-medium ${
                          prog.completed ? 'text-green-400' : 'text-primary-400'
                        }`}
                      >
                        {prog.completed ? 'Revisar' : 'Continuar'}
                        <Play className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-primary-400" />
              Laboratorios Disponibles
            </h2>
            <Link href="/laboratories" className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {userData.laboratories.slice(0, 4).map((lab, index) => (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden group"
              >
                <div className="flex">
                  <div className="w-40 h-32 relative flex-shrink-0">
                    {lab.image ? (
                      <img
                        src={lab.image}
                        alt={lab.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-500/20 to-secondary-500/20 flex items-center justify-center">
                        <FlaskConical className="w-8 h-8 text-gray-500" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-primary-400">{lab.category}</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className="text-xs text-gray-500">{lab.difficulty}</span>
                      </div>
                      <h3 className="font-semibold mb-1">{lab.title}</h3>
                      {lab.duration && (
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Clock className="w-3 h-3" /> {lab.duration} min
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/laboratories/${lab.slug}`}
                      className="self-start mt-2 flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300"
                    >
                      Iniciar <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
