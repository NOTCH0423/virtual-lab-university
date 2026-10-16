'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Beaker,
  LayoutDashboard,
  Users,
  FlaskConical,
  BookOpen,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Activity,
  Award,
  Clock,
  RefreshCw,
  Bell,
  Database,
  Home,
  UserCircle,
  ArrowLeft,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { signOut, useSession } from 'next-auth/react';
import { ToastProvider } from '@/components/admin/ui';

const siteLinks = [
  { label: 'Volver al sitio', icon: Home, href: '/dashboard' },
  { label: 'Laboratorios', icon: FlaskConical, href: '/laboratories' },
  { label: 'Cursos', icon: BookOpen, href: '/courses' },
  { label: 'Mi perfil', icon: UserCircle, href: '/profile' },
];

const sidebarGroups = [
  {
    title: 'General',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
      { id: 'analytics', label: 'Analíticas', icon: BarChart3, href: '/admin/analytics' },
    ],
  },
  {
    title: 'Gestión',
    items: [{ id: 'users', label: 'Usuarios', icon: Users, href: '/admin/users' }],
  },
  {
    title: 'Contenido',
    items: [
      { id: 'laboratories', label: 'Laboratorios', icon: FlaskConical, href: '/admin/laboratories' },
      { id: 'experiments', label: 'Experimentos', icon: Beaker, href: '/admin/experiments' },
      { id: 'courses', label: 'Cursos', icon: BookOpen, href: '/admin/courses' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { id: 'settings', label: 'Configuración', icon: Settings, href: '/admin/settings' },
      { id: 'database', label: 'Base de datos', icon: Database, href: '/admin/settings?tab=database' },
    ],
  },
];

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalExperiments: number;
  experimentsCompleted: number;
  totalHours: number;
  certificates: number;
  laboratories: number;
  pendingTasks: number;
}

interface TopExperiment {
  name: string;
  completions: number;
  rating: number;
  growth: string;
}

interface RecentActivity {
  id: number;
  user: string;
  action: string;
  item: string;
  time: string;
  avatar: string;
}

interface AdminDashboardData {
  stats: AdminStats;
  topExperiments: TopExperiment[];
  recentActivity: RecentActivity[];
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState<string | null>(null);
  useEffect(() => {
    setCurrentTab(new URLSearchParams(window.location.search).get('tab'));
  }, [pathname]);
  const { data: session, status } = useSession();
  const role = String((session?.user as any)?.role || '').toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  useEffect(() => {
    if (status === 'unauthenticated') router.replace('/login');
    else if (status === 'authenticated' && !isAdmin) router.replace('/dashboard');
  }, [status, isAdmin, router]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'updating'>('connected');
  const wsRef = useRef<WebSocket | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setConnectionStatus('updating');
      const res = await fetch('/api/admin/analytics');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setAnalyticsData(data);
        setLastUpdate(new Date());
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, []);

  const [analyticsData, setAnalyticsData] = useState<AdminDashboardData | null>(null);

  useEffect(() => {
    if (!isAdmin || pathname !== '/admin') return;
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats, isAdmin, pathname]);

  const growth = (stats as any)?.usersGrowth as string | undefined;
  const statsData = [
    { label: 'Total Usuarios', value: (stats?.totalUsers ?? 0).toLocaleString(), change: growth ? `${growth} nuevos/sem` : '', icon: Users, color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-500/30' },
    { label: 'Experimentos completados', value: (stats?.experimentsCompleted ?? 0).toLocaleString(), change: '', icon: FlaskConical, color: 'text-green-400', bgColor: 'bg-green-500/20', borderColor: 'border-green-500/30' },
    { label: 'Horas Totales', value: (stats?.totalHours ?? 0).toLocaleString(), change: '', icon: Clock, color: 'text-purple-400', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-500/30' },
    { label: 'Certificados', value: (stats?.certificates ?? 0).toLocaleString(), change: '', icon: Award, color: 'text-yellow-400', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-500/30' },
  ];

  const topExperiments: TopExperiment[] = analyticsData?.topExperiments || [];
  const recentActivity: RecentActivity[] = analyticsData?.recentActivity || [];

  const maxCompletions = Math.max(...topExperiments.map(e => e.completions), 1);

  if (status !== 'authenticated' || !isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-gray-400">
        {status === 'loading' ? 'Verificando permisos...' : 'Redirigiendo...'}
      </div>
    );
  }

  const initials = (session?.user?.name || 'AD').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <ToastProvider>
    <div className="min-h-screen bg-slate-950 flex">
      <aside className={`glass-dark border-r border-white/10 flex flex-col transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/dashboard" title="Ir al sitio" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Beaker className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold gradient-text">Admin</span>
            </Link>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-4 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.title}>
              {!isCollapsed ? (
                <p className="px-4 mb-1 text-xs uppercase tracking-wide text-gray-500">{group.title}</p>
              ) : (
                <div className="mx-3 mb-2 border-t border-white/10" />
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const [path, query] = item.href.split('?');
                  const itemTab = query ? new URLSearchParams(query).get('tab') : null;
                  const isActive =
                    path === '/admin'
                      ? pathname === '/admin'
                      : (pathname === path || pathname.startsWith(path + '/')) &&
                        (path !== '/admin/settings' || (itemTab ? currentTab === itemTab : currentTab !== 'database'));
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      title={item.label}
                      onClick={() => {
                        setCurrentTab(itemTab);
                        setTimeout(() => window.dispatchEvent(new Event('admin-tab')), 0);
                      }}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-primary-500/20 to-secondary-500/20 text-primary-400 border border-primary-500/30'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      } ${isCollapsed ? 'justify-center px-2' : ''}`}
                    >
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="px-4 pb-4 space-y-1 border-t border-white/10 pt-4">
          {!isCollapsed && <p className="px-4 text-xs uppercase tracking-wide text-gray-500 mb-1">Sitio</p>}
          {siteLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={`flex items-center gap-3 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all ${isCollapsed ? 'justify-center px-2' : ''}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm">{item.label}</span>}
            </Link>
          ))}
        </div>

        <div className="p-4 border-t border-white/10">
          <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-sm font-bold">
              {initials}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{role === 'SUPER_ADMIN' ? 'Super Admin' : 'Administrador'} · {session?.user?.email}</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 glass rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Cerrar Sesión</span>
            </button>
          )}
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-40 glass-dark border-b border-white/10 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Panel de Administración</h1>
              <p className="text-sm text-gray-400 flex items-center gap-2">
                Gestiona usuarios, laboratorios y contenido
                <span className="ml-2 text-xs text-gray-500" suppressHydrationWarning>
                  • Actualizado {lastUpdate.toLocaleTimeString()}
                </span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-sm hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Volver al sitio
              </Link>
              <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                connectionStatus === 'updating' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {connectionStatus === 'connected' ? <Wifi className="w-3 h-3" /> : 
                 connectionStatus === 'updating' ? <RefreshCw className={`w-3 h-3 animate-spin`} /> :
                 <WifiOff className="w-3 h-3" />}
                {connectionStatus === 'connected' ? 'En vivo' : 
                 connectionStatus === 'updating' ? 'Actualizando...' : 'Desconectado'}
              </span>
              <button 
                onClick={fetchStats}
                disabled={connectionStatus === 'updating'}
                className="p-2 glass rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-4 h-4 ${connectionStatus === 'updating' ? 'animate-spin' : ''}`} />
              </button>
              <div className="flex items-center gap-2 px-4 py-2 glass rounded-xl">
                <Activity className="w-4 h-4 text-green-400" />
                <span className="text-sm">Sistema activo</span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {pathname === '/admin' && (
            <AdminDashboard 
              stats={statsData} 
              topExperiments={topExperiments} 
              recentActivity={recentActivity} 
              maxCompletions={maxCompletions}
              onRefresh={fetchStats}
            />
          )}
          {children}
        </div>
      </main>
    </div>
    </ToastProvider>
  );
}

interface AdminDashboardProps {
  stats: Array<{
    label: string;
    value: string;
    change: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
  }>;
  topExperiments: TopExperiment[];
  recentActivity: RecentActivity[];
  maxCompletions: number;
  onRefresh: () => void;
}

function AdminDashboard({ stats, topExperiments, recentActivity, maxCompletions, onRefresh }: AdminDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`bg-gradient-to-br ${stat.bgColor} rounded-xl p-6 border ${stat.borderColor}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                {stat.change && <><TrendingUp className="w-4 h-4" /> {stat.change}</>}
              </span>
            </div>
            <p className="text-3xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Experimentos Más Populares</h2>
            <button onClick={onRefresh} className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Actualizar
            </button>
          </div>
          <div className="space-y-4">
            {topExperiments.length > 0 ? (
              topExperiments.map((experiment, index) => (
                <div key={experiment.name} className="flex items-center gap-4">
                  <span className="text-gray-500 font-mono w-6">{index + 1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{experiment.name}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">{experiment.completions.toLocaleString()} completados</span>
                        <span className="text-yellow-400">★ {experiment.rating}</span>
                        <span className="text-green-400">{experiment.growth}</span>
                      </div>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(experiment.completions / maxCompletions) * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No hay datos de experimentos</p>
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
          <h2 className="text-xl font-semibold mb-6">Actividad Reciente</h2>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {activity.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>{' '}
                      <span className="text-gray-400">{activity.action}</span>{' '}
                      <span className="text-primary-400">{activity.item}</span>
                    </p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No hay actividad reciente</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
