'use client';

import { useEffect, useRef, useState } from 'react';
import UserAvatar from '@/components/UserAvatar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from '@/lib/client-auth';
import {
  Menu, X, Beaker, BookOpen, BarChart3, Settings, LogOut, ChevronDown, FlaskConical, Atom, Dna,
  Gauge, Zap, Shield, GraduationCap, Trophy, User, LayoutGrid, ClipboardList,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const learnItems = [
  { name: 'Laboratorios', href: '/laboratories', icon: FlaskConical, desc: 'Prácticas virtuales' },
  { name: 'Cursos', href: '/courses', icon: BookOpen, desc: 'Rutas de aprendizaje' },
  { name: 'Simulaciones', href: '/simulations', icon: Atom, desc: 'Experimenta en 3D' },
];

const categories = [
  { name: 'Física', icon: Gauge, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  { name: 'Química', icon: FlaskConical, color: 'text-green-400', bgColor: 'bg-green-400/10' },
  { name: 'Biología', icon: Dna, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
  { name: 'Ingeniería', icon: Zap, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
];

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrador', ADMIN: 'Administrador', TEACHER: 'Profesor', STUDENT: 'Estudiante',
};

function useClickOutside(ref: React.RefObject<HTMLElement>, onOut: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onOut(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [ref, onOut]);
}

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [learnOpen, setLearnOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  const learnRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  useClickOutside(learnRef, () => setLearnOpen(false));
  useClickOutside(userRef, () => setUserOpen(false));

  useEffect(() => { setMobileOpen(false); setLearnOpen(false); setUserOpen(false); }, [pathname]);

  const role = String((session?.user as any)?.role || 'STUDENT').toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isTeacher = role === 'TEACHER';
  const roleLabel = ROLE_LABEL[role] || 'Estudiante';
  const name = session?.user?.name || 'Usuario';

  const roleItems = [
    ...(isTeacher ? [{ name: 'Panel Profesor', href: '/teacher', icon: GraduationCap }] : []),
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ];

  const active = (href: string) => pathname === href || pathname.startsWith(href + '/');
  const learnActive = learnItems.some((i) => active(i.href));
  const linkCls = (on: boolean) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
      on ? 'bg-primary-500/20 text-primary-400' : 'text-gray-300 hover:text-white hover:bg-white/10'
    }`;
  const logout = () => signOut({ callbackUrl: '/login' });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Beaker className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">Virtual Lab</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <Link href="/dashboard" className={linkCls(active('/dashboard'))}>
                <BarChart3 className="w-4 h-4" /> Inicio
              </Link>

              <div className="relative" ref={learnRef}>
                <button onClick={() => setLearnOpen((v) => !v)} className={linkCls(learnActive)} aria-expanded={learnOpen}>
                  <LayoutGrid className="w-4 h-4" /> Aprender
                  <ChevronDown className={`w-4 h-4 transition-transform ${learnOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {learnOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full left-0 mt-2 w-[30rem] glass-dark rounded-xl p-3 shadow-xl grid grid-cols-2 gap-3"
                    >
                      <div>
                        <p className="px-2 pb-1 text-xs uppercase tracking-wide text-gray-500">Explorar</p>
                        {learnItems.map((i) => (
                          <Link key={i.href} href={i.href} className="flex items-start gap-3 px-2 py-2 rounded-lg hover:bg-white/10">
                            <i.icon className="w-5 h-5 text-primary-400 mt-0.5" />
                            <span>
                              <span className="block text-sm text-white">{i.name}</span>
                              <span className="block text-xs text-gray-400">{i.desc}</span>
                            </span>
                          </Link>
                        ))}
                      </div>
                      <div>
                        <p className="px-2 pb-1 text-xs uppercase tracking-wide text-gray-500">Categorías</p>
                        {categories.map((c) => (
                          <Link key={c.name} href={`/laboratories?category=${c.name.toLowerCase()}`}
                            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10">
                            <span className={`w-7 h-7 rounded-lg ${c.bgColor} flex items-center justify-center`}>
                              <c.icon className={`w-4 h-4 ${c.color}`} />
                            </span>
                            <span className="text-sm text-gray-300">{c.name}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link href="/achievements" className={linkCls(active('/achievements'))}>
                <Trophy className="w-4 h-4" /> Logros
              </Link>

              <Link href="/notas" className={linkCls(active('/notas'))}>
                <ClipboardList className="w-4 h-4" /> Notas
              </Link>

              {roleItems.map((i) => (
                <Link key={i.href} href={i.href}
                  className={`${linkCls(active(i.href))} ${!active(i.href) ? '!text-purple-300' : ''}`}>
                  <i.icon className="w-4 h-4" /> {i.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative hidden md:block" ref={userRef}>
              <button onClick={() => setUserOpen((v) => !v)}
                className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-white/10" aria-expanded={userOpen}>
                <UserAvatar src={session?.user?.image} name={name} className="w-8 h-8 text-sm" />
                <span className="text-left text-sm">
                  <span className="block font-medium text-white leading-tight">{name}</span>
                  <span className="block text-xs text-gray-400 leading-tight">{roleLabel}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${userOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {userOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="absolute right-0 top-full mt-2 w-56 glass-dark rounded-xl p-2 shadow-xl"
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-sm text-white truncate">{name}</p>
                      <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-gray-300">
                      <User className="w-4 h-4" /> Mi perfil
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-gray-300">
                      <Settings className="w-4 h-4" /> Configuración
                    </Link>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 text-sm text-red-300">
                      <LogOut className="w-4 h-4" /> Cerrar sesión
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => setMobileOpen((v) => !v)} className="md:hidden p-2 rounded-lg hover:bg-white/10" aria-label="Menú">
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-white/10 max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="px-4 py-4 space-y-1">
              <div className="flex items-center gap-3 px-3 pb-3 mb-2 border-b border-white/10">
                <UserAvatar src={session?.user?.image} name={name} className="w-9 h-9 text-sm" />
                <span>
                  <span className="block text-white text-sm">{name}</span>
                  <span className="block text-xs text-gray-400">{roleLabel}</span>
                </span>
              </div>
              <MobileLink href="/dashboard" icon={BarChart3} label="Inicio" on={active('/dashboard')} />
              <p className="px-3 pt-3 pb-1 text-xs uppercase tracking-wide text-gray-500">Aprender</p>
              {learnItems.map((i) => <MobileLink key={i.href} href={i.href} icon={i.icon} label={i.name} on={active(i.href)} />)}
              <div className="grid grid-cols-2 gap-1 px-1 pb-1">
                {categories.map((c) => (
                  <Link key={c.name} href={`/laboratories?category=${c.name.toLowerCase()}`}
                    className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm text-gray-300 hover:bg-white/10">
                    <c.icon className={`w-4 h-4 ${c.color}`} /> {c.name}
                  </Link>
                ))}
              </div>
              <MobileLink href="/achievements" icon={Trophy} label="Logros" on={active('/achievements')} />
              <MobileLink href="/notas" icon={ClipboardList} label="Notas" on={active('/notas')} />
              {roleItems.length > 0 && <p className="px-3 pt-3 pb-1 text-xs uppercase tracking-wide text-gray-500">{isAdmin ? 'Administración' : 'Docencia'}</p>}
              {roleItems.map((i) => <MobileLink key={i.href} href={i.href} icon={i.icon} label={i.name} on={active(i.href)} />)}
              <p className="px-3 pt-3 pb-1 text-xs uppercase tracking-wide text-gray-500">Cuenta</p>
              <MobileLink href="/profile" icon={User} label="Mi perfil" on={active('/profile')} />
              <MobileLink href="/settings" icon={Settings} label="Configuración" on={active('/settings')} />
              <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-red-300 hover:bg-red-500/10">
                <LogOut className="w-5 h-5" /> Cerrar sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MobileLink({ href, icon: Icon, label, on }: { href: string; icon: any; label: string; on: boolean }) {
  return (
    <Link href={href}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg ${on ? 'bg-primary-500/20 text-primary-400' : 'text-gray-300 hover:bg-white/10'}`}>
      <Icon className="w-5 h-5" /> {label}
    </Link>
  );
}
