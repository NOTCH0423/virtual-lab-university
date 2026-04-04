'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import {
  Trophy,
  Star,
  Target,
  Zap,
  Award,
  Flame,
  Clock,
  CheckCircle,
  Lock,
  FlaskConical,
  Atom,
  Gauge,
  Dna,
  RefreshCw,
  FileBadge,
} from 'lucide-react';

interface AchievementData {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  color: string | null;
  category: string | null;
  points: number;
}

interface UserAchievement {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string | null;
  color: string | null;
  earnedAt: string;
}

interface UserData {
  achievements: UserAchievement[];
}

const iconMap: Record<string, any> = {
  Target,
  Star,
  Zap,
  Award,
  Flame,
  Clock,
  FlaskConical,
  Atom,
  Gauge,
  Dna,
  FileBadge,
  Trophy,
};

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allAchievements, setAllAchievements] = useState<AchievementData[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [filter, setFilter] = useState<'all' | 'earned' | 'locked'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchData();
    }
  }, [status]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [userRes, allRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/achievements'),
      ]);

      if (userRes.ok) {
        const userData: UserData = await userRes.json();
        setUserAchievements(userData.achievements || []);
      }

      if (allRes.ok) {
        const allData = await allRes.json();
        setAllAchievements(allData || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedSlugs = new Set(userAchievements.map((ua) => ua.slug));

  const earnedCount = userAchievements.length;
  const totalCount = allAchievements.length;
  const progress = totalCount > 0 ? (earnedCount / totalCount) * 100 : 0;

  const filteredAchievements = allAchievements.filter((a) => {
    const isEarned = earnedSlugs.has(a.slug);
    if (filter === 'earned') return isEarned;
    if (filter === 'locked') return !isEarned;
    return true;
  });

  const getIconComponent = (iconName: string | null) => {
    return iconMap[iconName || 'Star'] || Star;
  };

  const getUserAchievement = (slug: string) => {
    return userAchievements.find((ua) => ua.slug === slug);
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Logros</h1>
            <p className="text-gray-400">Desbloquea logros completando experimentos y manteniendo tu racha</p>
          </div>
          <button 
            onClick={fetchData}
            className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </button>
        </div>

        <div className="gradient-border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold">Tu Progreso</h2>
              <p className="text-gray-400 text-sm">
                {earnedCount} de {totalCount} logros desbloqueados
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold gradient-text">{Math.round(progress)}%</p>
            </div>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'Todos', count: totalCount },
            { id: 'earned', label: 'Desbloqueados', count: earnedCount },
            { id: 'locked', label: 'Bloqueados', count: totalCount - earnedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as 'all' | 'earned' | 'locked')}
              className={`px-6 py-3 rounded-xl whitespace-nowrap transition-all ${
                filter === tab.id
                  ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white'
                  : 'bg-white/5 hover:bg-white/10 border border-white/10'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement, index) => {
            const isEarned = earnedSlugs.has(achievement.slug);
            const userAchievement = getUserAchievement(achievement.slug);
            const IconComponent = getIconComponent(achievement.icon);
            
            return (
              <div
                key={achievement.id}
                className={`gradient-border p-6 transition-all ${
                  isEarned ? '' : 'opacity-60'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                      isEarned ? '' : 'bg-gray-700'
                    }`}
                    style={{
                      backgroundColor: isEarned && achievement.color ? `${achievement.color}20` : undefined,
                    }}
                  >
                    {isEarned ? (
                      <IconComponent 
                        className="w-8 h-8" 
                        style={{ color: achievement.color || '#3b82f6' }} 
                      />
                    ) : (
                      <Lock className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-1 ${isEarned ? '' : 'text-gray-400'}`}>
                      {achievement.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                    {isEarned && userAchievement ? (
                      <div className="flex items-center gap-2 text-xs text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Desbloqueado el {new Date(userAchievement.earnedAt).toLocaleDateString('es-ES')}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">
                        {achievement.points} puntos
                      </p>
                    )}
                  </div>
                </div>
                {isEarned && (
                  <div
                    className="mt-4 h-1 rounded-full"
                    style={{ backgroundColor: `${achievement.color}40` }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{ backgroundColor: achievement.color || '#3b82f6', width: '100%' }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredAchievements.length === 0 && (
          <div className="gradient-border p-8 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-600" />
            <p className="text-gray-400">No hay logros en esta categoría</p>
          </div>
        )}

        <div className="mt-12 gradient-border p-6">
          <h2 className="text-xl font-semibold mb-4">Insignias Especiales</h2>
          {userAchievements.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userAchievements.slice(0, 4).map((ua) => {
                const IconComponent = getIconComponent(ua.icon);
                return (
                  <div
                    key={ua.id}
                    className="text-center p-4 bg-white/5 rounded-xl"
                  >
                    <div
                      className="w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ backgroundColor: `${ua.color}20` }}
                    >
                      <IconComponent className="w-8 h-8" style={{ color: ua.color || '#3b82f6' }} />
                    </div>
                    <p className="text-sm font-medium">{ua.name}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Completa experimentos para ganar insignias</p>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/laboratories"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity"
          >
            Explorar Laboratorios
            <Trophy className="w-5 h-5" />
          </Link>
        </div>
      </main>
    </div>
  );
}
