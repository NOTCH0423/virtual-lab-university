'use client';

import {
  BarChart3,
  TrendingUp,
  Users,
  FlaskConical,
  Calendar,
  Download,
  RefreshCw,
  Award,
  Clock,
  Activity,
  BookOpen,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

interface AnalyticsData {
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalExperiments: number;
    experimentsCompleted: number;
    totalHours: number;
    certificates: number;
    laboratories: number;
  };
  weeklyData: Array<{
    day: string;
    users: number;
    experiments: number;
    hours: number;
  }>;
  categoryStats: Array<{
    name: string;
    completions: number;
    growth: number;
    color: string;
  }>;
  topExperiments: Array<{
    name: string;
    completions: number;
    rating: string;
    growth: string;
  }>;
  recentActivity: Array<{
    id: number;
    user: string;
    action: string;
    item: string;
    time: string;
    avatar: string;
  }>;
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'updating'>('connected');

  const fetchAnalytics = useCallback(async () => {
    try {
      setConnectionStatus('updating');
      setLoading(true);
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const analyticsData = await res.json();
        setData(analyticsData);
        setLastUpdate(new Date());
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
    
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const handleExport = () => {
    if (!data) return;
    
    const exportData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalUsers: data.stats.totalUsers,
        activeUsers: data.stats.activeUsers,
        experimentsCompleted: data.stats.experimentsCompleted,
        totalHours: data.stats.totalHours,
        certificates: data.stats.certificates,
        laboratories: data.stats.laboratories,
      },
      weeklyActivity: data.weeklyData,
      categoryPerformance: data.categoryStats,
      topExperiments: data.topExperiments,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxExperiments = Math.max(...(data?.weeklyData || []).map(d => d.experiments), 1);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando analíticas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Analíticas Detalladas</h1>
          <p className="text-gray-400 text-sm flex items-center gap-2">
            Estadísticas completas del sistema
            <span className="ml-2 text-xs text-gray-500">
              • Actualizado {lastUpdate.toLocaleTimeString()}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1 ${
              connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
              connectionStatus === 'updating' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {connectionStatus === 'connected' ? <Wifi className="w-3 h-3" /> : 
               connectionStatus === 'updating' ? <Activity className={`w-3 h-3 animate-pulse`} /> :
               <WifiOff className="w-3 h-3" />}
              {connectionStatus === 'connected' ? 'En vivo' : 
               connectionStatus === 'updating' ? 'Actualizando...' : 'Desconectado'}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchAnalytics}
            disabled={connectionStatus === 'updating'}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${connectionStatus === 'updating' ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button 
            onClick={handleExport}
            disabled={!data}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl p-5 border border-blue-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{data?.stats.totalUsers || 0}</p>
          <p className="text-sm text-gray-400">Total Usuarios</p>
        </div>

        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl p-5 border border-green-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{data?.stats.activeUsers || 0}</p>
          <p className="text-sm text-gray-400">Usuarios Activos</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-xl p-5 border border-purple-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{data?.stats.experimentsCompleted || 0}</p>
          <p className="text-sm text-gray-400">Experimentos</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-5 border border-amber-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{data?.stats.totalHours || 0}h</p>
          <p className="text-sm text-gray-400">Horas Totales</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 rounded-xl p-5 border border-yellow-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{data?.stats.certificates || 0}</p>
          <p className="text-sm text-gray-400">Certificados</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 rounded-xl p-5 border border-cyan-500/30">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <p className="text-3xl font-bold">{data?.stats.laboratories || 0}</p>
          <p className="text-sm text-gray-400">Laboratorios</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary-400" />
              Actividad Semanal
            </h2>
          </div>
          <div className="flex items-end justify-between h-48 gap-2">
            {data?.weeklyData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg min-h-[4px] transition-all" style={{ height: `${Math.max((day.experiments / maxExperiments) * 100, 5)}%` }} />
                <span className="text-xs text-gray-500">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between text-sm text-gray-400">
            <span>Total: {data?.weeklyData.reduce((acc, d) => acc + d.experiments, 0)} experimentos</span>
            <span>Usuarios únicos: {data?.weeklyData.reduce((acc, d) => acc + d.users, 0)}</span>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Actividad Reciente
          </h2>
          <div className="space-y-4">
            {data?.recentActivity && data.recentActivity.length > 0 ? (
              data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-sm font-bold">
                    {activity.avatar}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium text-white">{activity.user}</span>{' '}
                      <span className="text-gray-400">{activity.action}</span>{' '}
                      <span className="text-primary-400">{activity.item}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No hay actividad reciente</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Rendimiento por Categoría
          </h2>
          <div className="space-y-4">
            {data?.categoryStats && data.categoryStats.length > 0 ? (
              data.categoryStats.map((cat, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">{cat.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-400">{cat.completions} completados</span>
                      <span className="text-green-400">+{cat.growth}%</span>
                    </div>
                  </div>
                  <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ 
                        width: `${(cat.completions / Math.max(...data.categoryStats.map(c => c.completions), 1)) * 100}%`,
                        backgroundColor: cat.color,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No hay datos de categorías</p>
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-400" />
            Top Experimentos
          </h2>
          <div className="space-y-4">
            {data?.topExperiments && data.topExperiments.length > 0 ? (
              data.topExperiments.map((exp, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-lg">
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-sm font-bold">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium">{exp.name}</p>
                    <p className="text-sm text-gray-400">{exp.completions} completados</p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-medium">★ {exp.rating}</p>
                    <p className="text-xs text-green-400">{exp.growth}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-8">No hay datos de experimentos</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
