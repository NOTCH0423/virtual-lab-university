'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
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
  CheckCircle,
  Calendar,
  Plus,
  Search,
  Eye,
  Edit,
  MessageSquare,
  Download,
  Bell,
  GraduationCap,
  ClipboardList,
  Video,
  FileQuestion,
  RefreshCw,
  Wifi,
  WifiOff,
  Activity,
} from 'lucide-react';
import Link from 'next/link';

interface TeacherData {
  stats: {
    courses: number;
    students: number;
    pendingTasks: number;
    averageGrade: number;
    totalExperiments: number;
    completedExperiments: number;
    certificates: number;
  };
  courses: Array<{
    id: string;
    title: string;
    slug: string;
    students: number;
    experiments: number;
    difficulty: string;
    image: string | null;
  }>;
  submissions: Array<{
    student: string;
    email: string;
    assignment: string;
    submittedAt: string;
    status: string;
    score: number | null;
    laboratorySlug: string;
  }>;
  studentProgress: Array<{
    name: string;
    email: string;
    course: string;
    progress: number;
    lastActive: string;
    grade: number;
  }>;
  lastUpdated: string;
}

export default function TeacherPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'updating'>('connected');

  const fetchTeacherData = useCallback(async () => {
    try {
      setConnectionStatus('updating');
      setLoading(true);
      const res = await fetch('/api/teacher');
      if (res.ok) {
        const teacherData = await res.json();
        setData(teacherData);
        setLastUpdate(new Date());
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated') {
      fetchTeacherData();
    }
  }, [status, router, fetchTeacherData]);

  useEffect(() => {
    const interval = setInterval(fetchTeacherData, 10000);
    return () => clearInterval(interval);
  }, [fetchTeacherData]);

  if (status === 'loading' || (loading && !data)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando datos...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
    { id: 'courses', label: 'Mis Cursos', icon: BookOpen },
    { id: 'students', label: 'Estudiantes', icon: Users },
    { id: 'assignments', label: 'Tareas', icon: ClipboardList },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    { id: 'settings', label: 'Configuración', icon: Edit },
  ];

  const teacherStats = data?.stats ? [
    { label: 'Mis Cursos', value: data.stats.courses, icon: BookOpen, change: '+1', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
    { label: 'Estudiantes', value: data.stats.students, icon: Users, change: '+12', color: 'from-green-500/20 to-green-600/10 border-green-500/30' },
    { label: 'Tareas Pendientes', value: data.stats.pendingTasks, icon: ClipboardList, change: '-5', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30' },
    { label: 'Calificaciones', value: `${data.stats.averageGrade}%`, icon: Award, change: '+3%', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
  ] : [
    { label: 'Mis Cursos', value: 0, icon: BookOpen, change: '+1', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
    { label: 'Estudiantes', value: 0, icon: Users, change: '+12', color: 'from-green-500/20 to-green-600/10 border-green-500/30' },
    { label: 'Tareas Pendientes', value: 0, icon: ClipboardList, change: '-5', color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30' },
    { label: 'Calificaciones', value: '0%', icon: Award, change: '+3%', color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
  ];

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} día${days > 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">Panel del Profesor</h1>
              <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
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
            </div>
            <p className="text-gray-400 flex items-center gap-2">
              Bienvenido, {session.user?.name || 'Profesor'}
              <span className="ml-2 text-xs text-gray-500">
                • Actualizado {lastUpdate.toLocaleTimeString()}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchTeacherData}
              disabled={connectionStatus === 'updating'}
              className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${connectionStatus === 'updating' ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
            <button className="relative p-3 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button 
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          <aside className="w-64 flex-shrink-0">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-4 sticky top-24">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-700">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-medium">{session.user?.name || 'Profesor'}</div>
                  <div className="text-xs text-gray-400">Profesor</div>
                </div>
              </div>
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id 
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/50' 
                        : 'hover:bg-slate-700/50 text-gray-400 hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <div className="flex-1">
            {activeTab === 'dashboard' && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {teacherStats.map((stat, index) => (
                    <div key={stat.label} className={`bg-gradient-to-br ${stat.color} rounded-xl p-6`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg bg-slate-800/50 flex items-center justify-center text-${stat.color.includes('blue') ? 'blue-400' : stat.color.includes('green') ? 'green-400' : stat.color.includes('amber') ? 'amber-400' : 'purple-400'}`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-400' : 'text-amber-400'}`}>{stat.change}</span>
                      </div>
                      <div className="text-3xl font-bold mb-1">{stat.value}</div>
                      <div className="text-sm text-gray-400">{stat.label}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-400" />
                        Próximas Clases
                      </h2>
                      <button className="text-sm text-primary-400 hover:text-primary-300">Ver todo</button>
                    </div>
                    <div className="p-6 space-y-4">
                      {data?.courses && data.courses.length > 0 ? (
                        data.courses.slice(0, 2).map((course, index) => (
                          <div key={course.id} className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary-400">10:00 AM</div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{course.title}</div>
                              <div className="text-sm text-gray-400">Laboratorio Virtual</div>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.students} estudiantes</span>
                                <span className="flex items-center gap-1"><FlaskConical className="w-3 h-3" /> {course.experiments} exp.</span>
                              </div>
                            </div>
                            <button className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30">
                              <Video className="w-5 h-5" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-4">No hay clases programadas</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 rounded-xl border border-slate-700">
                    <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-amber-400" />
                        Entregas Recientes
                      </h2>
                      <button className="text-sm text-primary-400 hover:text-primary-300">Ver todo</button>
                    </div>
                    <div className="p-6 space-y-4">
                      {data?.submissions && data.submissions.length > 0 ? (
                        data.submissions.slice(0, 4).map((sub, index) => (
                          <div key={index} className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium text-sm">
                              {sub.student.split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{sub.student}</div>
                              <div className="text-xs text-gray-400">{sub.assignment}</div>
                              <div className="text-xs text-gray-500">{getTimeAgo(sub.submittedAt)}</div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              sub.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-green-500/20 text-green-400'
                            }`}>
                              {sub.status === 'pending' ? 'Pendiente' : 'Calificado'}
                            </span>
                            <button className="p-2 hover:bg-slate-700 rounded-lg">
                              <Eye className="w-4 h-4 text-gray-400" />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-center py-4">No hay entregas recientes</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl border border-slate-700">
                  <div className="p-6 border-b border-slate-700">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Progreso de Estudiantes
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-700/30">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estudiante</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Curso</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Progreso</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Última Actividad</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nota</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {data?.studentProgress && data.studentProgress.length > 0 ? (
                          data.studentProgress.map((student, index) => (
                            <tr key={index} className="hover:bg-slate-700/30">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium">
                                    {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                  </div>
                                  <div>
                                    <div className="font-medium">{student.name}</div>
                                    <div className="text-sm text-gray-400">{student.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm">{student.course}</td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${student.progress}%` }} />
                                  </div>
                                  <span className="text-sm text-gray-400">{student.progress}%</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-400">{getTimeAgo(student.lastActive)}</td>
                              <td className="px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                  student.grade >= 9 ? 'bg-green-500/20 text-green-400' :
                                  student.grade >= 7 ? 'bg-blue-500/20 text-blue-400' :
                                  'bg-amber-500/20 text-amber-400'
                                }`}>
                                  {student.grade.toFixed(1)}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                              No hay datos de estudiantes disponibles
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'courses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Mis Cursos</h2>
                  <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Crear Curso
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data?.courses && data.courses.length > 0 ? (
                    data.courses.map((course) => (
                      <div key={course.id} className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden hover:border-primary-500/50 transition-colors">
                        <div className="h-32 bg-gradient-to-br from-primary-600 to-secondary-600 relative">
                          <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay" style={{ backgroundImage: `url(${course.image || 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&q=80'})` }} />
                          <div className="absolute bottom-4 left-4">
                            <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs text-white">{course.students} estudiantes</span>
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                            <span className="flex items-center gap-1"><FlaskConical className="w-4 h-4" /> {course.experiments} experimentos</span>
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {course.difficulty}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Link href={`/laboratories/${course.slug}`} className="flex-1 py-2 bg-slate-700 text-gray-300 rounded-lg hover:bg-slate-600 transition-colors text-center">
                              Ver Detalles
                            </Link>
                            <button className="flex-1 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                              Gestionar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 text-gray-400">
                      No hay cursos disponibles
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Mis Estudiantes</h2>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input type="text" placeholder="Buscar estudiante..." className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-primary-500" />
                    </div>
                    <button className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Exportar
                    </button>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl border border-slate-700 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-slate-700/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Estudiante</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Curso</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Progreso</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Última Actividad</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Nota Promedio</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {data?.studentProgress && data.studentProgress.length > 0 ? (
                        data.studentProgress.map((student, index) => (
                          <tr key={index} className="hover:bg-slate-700/30">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-medium">
                                  {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div>
                                  <div className="font-medium">{student.name}</div>
                                  <div className="text-sm text-gray-400">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm">{student.course}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: `${student.progress}%` }} />
                                </div>
                                <span className="text-sm text-gray-400">{student.progress}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-400">{getTimeAgo(student.lastActive)}</td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                                student.grade >= 9 ? 'bg-green-500/20 text-green-400' :
                                student.grade >= 7 ? 'bg-blue-500/20 text-blue-400' :
                                'bg-amber-500/20 text-amber-400'
                              }`}>
                                {student.grade.toFixed(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-2">
                                <button className="p-2 hover:bg-slate-700 rounded-lg"><Eye className="w-4 h-4 text-gray-400" /></button>
                                <button className="p-2 hover:bg-slate-700 rounded-lg"><MessageSquare className="w-4 h-4 text-gray-400" /></button>
                                <button className="p-2 hover:bg-slate-700 rounded-lg"><Edit className="w-4 h-4 text-gray-400" /></button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No hay estudiantes registrados</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Gestión de Tareas</h2>
                  <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Crear Tarea
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl border border-amber-500/30 p-6">
                    <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                      <ClipboardList className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{data?.stats?.pendingTasks || 0}</div>
                    <div className="text-gray-400">Tareas Pendientes</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-xl border border-green-500/30 p-6">
                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 mb-4">
                      <CheckCircle className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{data?.submissions?.filter(s => s.status === 'graded').length || 0}</div>
                    <div className="text-gray-400">Tareas Calificadas</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl border border-blue-500/30 p-6">
                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                      <FileQuestion className="w-6 h-6" />
                    </div>
                    <div className="text-3xl font-bold mb-2">{data?.submissions?.length || 0}</div>
                    <div className="text-gray-400">Total de Entregas</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-center py-20 text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>No hay mensajes nuevos</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700 p-6">
                <h2 className="text-xl font-semibold mb-6">Configuración de Cuenta</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre</label>
                    <input type="text" defaultValue={session.user?.name || ''} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Correo Electrónico</label>
                    <input type="email" defaultValue={session.user?.email || ''} className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Departamento</label>
                    <select className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:border-primary-500">
                      <option>Ciencias Naturales</option>
                      <option>Física</option>
                      <option>Química</option>
                      <option>Biología</option>
                      <option>Ingeniería</option>
                    </select>
                  </div>
                  <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                    Guardar Cambios
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
