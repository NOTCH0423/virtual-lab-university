'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import {
  User,
  Mail,
  GraduationCap,
  Award,
  FlaskConical,
  Clock,
  Edit,
  Camera,
  BookOpen,
  Shield,
  Bell,
  Key,
  LogOut,
  Trophy,
  RefreshCw,
} from 'lucide-react';

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
    createdAt: string;
  };
  stats: {
    experimentsCompleted: number;
    hoursPracticed: number;
    certificates: number;
    achievements: number;
  };
  progress: Array<{
    id: string;
    laboratory: {
      id: string;
      title: string;
      slug: string;
      category: string;
      image: string | null;
    };
    progress: number;
    completed: boolean;
    score: number | null;
    startedAt: string;
    completedAt: string | null;
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
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    university: '',
    career: '',
    bio: '',
  });

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
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserData(data);
        setProfile({
          name: data.user.name || '',
          university: data.user.university || '',
          career: data.user.career || '',
          bio: data.user.bio || '',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (res.ok) {
        const updated = await res.json();
        setUserData((prev: any) => ({
          ...prev,
          user: { ...prev.user, ...updated },
        }));
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
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

  const initials = userData?.user?.name
    ? userData.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'activity', label: 'Actividad', icon: Clock },
    { id: 'favorites', label: 'Favoritos', icon: FlaskConical },
    { id: 'settings', label: 'Configuración', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="gradient-border p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-4xl font-bold mx-auto">
                    {initials}
                  </div>
                  <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center hover:bg-primary-600 transition-colors">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <h2 className="text-xl font-bold mt-4">{userData?.user?.name || 'Usuario'}</h2>
                <p className="text-gray-400 text-sm">{userData?.user?.email}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-primary-500/20 text-primary-400 rounded-full text-xs font-medium">
                  {userData?.user?.career || 'Estudiante'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-primary-400">{userData?.stats?.experimentsCompleted || 0}</p>
                  <p className="text-xs text-gray-400">Experimentos</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-green-400">{userData?.stats?.hoursPracticed || 0}</p>
                  <p className="text-xs text-gray-400">Horas</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-yellow-400">{userData?.stats?.certificates || 0}</p>
                  <p className="text-xs text-gray-400">Certificados</p>
                </div>
                <div className="text-center p-3 bg-white/5 rounded-xl">
                  <p className="text-2xl font-bold text-orange-400">{userData?.stats?.achievements || 0}</p>
                  <p className="text-xs text-gray-400">Logros</p>
                </div>
              </div>

              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                        : 'hover:bg-white/5 text-gray-400'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                ))}
              </nav>

              <button 
                onClick={handleLogout}
                className="w-full mt-6 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {activeTab === 'profile' && (
              <div className="gradient-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Información Personal</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={fetchData}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title="Actualizar"
                    >
                      <RefreshCw className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      {isEditing ? 'Cancelar' : 'Editar'}
                    </button>
                  </div>
                </div>

                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nombre completo</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 disabled:opacity-60"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Correo electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="email"
                          value={userData?.user?.email || ''}
                          disabled
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl opacity-60"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">Universidad</label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={profile.university}
                          onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 disabled:opacity-60"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Carrera</label>
                      <div className="relative">
                        <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="text"
                          value={profile.career}
                          onChange={(e) => setProfile({ ...profile, career: e.target.value })}
                          disabled={!isEditing}
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 disabled:opacity-60"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Biografía</label>
                    <textarea
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      disabled={!isEditing}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 disabled:opacity-60 resize-none"
                    />
                  </div>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                  )}
                </form>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Actividad Reciente</h2>
                
                {userData?.certificates && userData.certificates.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Certificados Obtenidos</h3>
                    {userData.certificates.map((cert) => (
                      <div key={cert.id} className="gradient-border p-4 flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                          <Award className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{cert.title}</p>
                          <p className="text-sm text-gray-400">Obtenido el {new Date(cert.issuedAt).toLocaleDateString('es-ES')}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                          {cert.score}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {userData?.progress && userData.progress.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-3">Progreso en Laboratorios</h3>
                    {userData.progress.map((prog) => (
                      <div key={prog.id} className="gradient-border p-4 flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-500/20 flex items-center justify-center">
                          <FlaskConical className="w-6 h-6 text-primary-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{prog.laboratory.title}</p>
                          <p className="text-sm text-gray-400">
                            {prog.completed 
                              ? `Completado - ${new Date(prog.completedAt!).toLocaleDateString('es-ES')}`
                              : `Iniciado el ${new Date(prog.startedAt).toLocaleDateString('es-ES')}`
                            }
                          </p>
                        </div>
                        {prog.completed ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                            {prog.score}%
                          </span>
                        ) : (
                          <span className="text-primary-400">{prog.progress}%</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(!userData?.certificates?.length && !userData?.progress?.length) && (
                  <div className="gradient-border p-8 text-center">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400">No hay actividad reciente aún.</p>
                    <Link href="/laboratories" className="text-primary-400 hover:underline mt-2 inline-block">
                      Explorar laboratorios
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold">Progreso en Laboratorios</h2>
                {userData?.progress && userData.progress.length > 0 ? (
                  userData.progress.map((prog) => (
                    <Link
                      key={prog.id}
                      href={`/laboratories/${prog.laboratory.slug}`}
                      className="gradient-border p-4 block hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{prog.laboratory.title}</h3>
                        <span className="text-primary-400 text-sm">{prog.progress}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full"
                          style={{ width: `${prog.progress}%` }}
                        />
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="gradient-border p-8 text-center">
                    <FlaskConical className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                    <p className="text-gray-400">No has iniciado ningún laboratorio aún.</p>
                    <Link href="/laboratories" className="text-primary-400 hover:underline mt-2 inline-block">
                      Explorar laboratorios
                    </Link>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="gradient-border p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-primary-400" />
                    Notificaciones
                  </h3>
                  <div className="space-y-4">
                    {['Email de progreso semanal', 'Nuevos experimentos disponibles', 'Recordatorios de práctica'].map((item) => (
                      <label key={item} className="flex items-center justify-between cursor-pointer">
                        <span className="text-gray-300">{item}</span>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary-500" />
                      </label>
                    ))}
                  </div>
                </div>

                <div className="gradient-border p-6">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Key className="w-5 h-5 text-primary-400" />
                    Cambiar Contraseña
                  </h3>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Contraseña actual"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirmar contraseña"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                    <button className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity">
                      Actualizar Contraseña
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
