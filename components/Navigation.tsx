'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  Menu, 
  X, 
  Beaker, 
  Users, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronDown,
  GraduationCap,
  FlaskConical,
  Atom,
  Dna,
  Gauge,
  Zap,
  Shield,
  GraduationCap as TeacherIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Laboratorios', href: '/laboratories', icon: FlaskConical },
  { name: 'Cursos', href: '/courses', icon: BookOpen },
  { name: 'Simulaciones', href: '/simulations', icon: Atom },
];

const laboratoryCategories = [
  { name: 'Física', icon: Gauge, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  { name: 'Química', icon: FlaskConical, color: 'text-green-400', bgColor: 'bg-green-400/10' },
  { name: 'Biología', icon: Dna, color: 'text-purple-400', bgColor: 'bg-purple-400/10' },
  { name: 'Ingeniería', icon: Zap, color: 'text-yellow-400', bgColor: 'bg-yellow-400/10' },
];

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLabs, setShowLabs] = useState(false);
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const userRole = (session?.user as any)?.role || 'STUDENT';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Beaker className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text hidden sm:block">
                Virtual Lab
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === item.href
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              <div 
                className="relative"
                onMouseEnter={() => setShowLabs(true)}
                onMouseLeave={() => setShowLabs(false)}
              >
                <button className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-1 transition-all">
                  Categorías <ChevronDown className="w-4 h-4" />
                </button>
                
                <AnimatePresence>
                  {showLabs && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-56 glass-dark rounded-xl p-2"
                    >
                      {laboratoryCategories.map((cat) => (
                        <Link
                          key={cat.name}
                          href={`/laboratories?category=${cat.name.toLowerCase()}`}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-lg ${cat.bgColor} flex items-center justify-center`}>
                            <cat.icon className={`w-4 h-4 ${cat.color}`} />
                          </div>
                          <span className="text-sm text-gray-300">{cat.name}</span>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
                <Link
                  href={userRole === 'ADMIN' ? '/admin' : '/teacher'}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    pathname === '/admin' || pathname === '/teacher'
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-purple-300 hover:text-purple-200 hover:bg-purple-500/10'
                  }`}
                >
                  {userRole === 'ADMIN' ? 'Admin' : 'Profesor'}
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center text-sm font-medium">
                {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'U'}
              </div>
              <div className="text-sm">
                <p className="font-medium text-white">{session?.user?.name || 'Usuario'}</p>
                <p className="text-xs text-gray-400">
                  {userRole === 'ADMIN' ? 'Administrador' : userRole === 'TEACHER' ? 'Profesor' : 'Estudiante'}
                </p>
              </div>
            </div>
            
            <Link 
              href="/settings"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-400" />
            </Link>
            
            <Link 
              href="/api/auth/signout"
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-5 h-5 text-gray-400" />
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    pathname === item.href
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'text-gray-300'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
              {(userRole === 'ADMIN' || userRole === 'TEACHER') && (
                <Link
                  href={userRole === 'ADMIN' ? '/admin' : '/teacher'}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-purple-300"
                >
                  {userRole === 'ADMIN' ? <Shield className="w-5 h-5" /> : <TeacherIcon className="w-5 h-5" />}
                  {userRole === 'ADMIN' ? 'Panel Admin' : 'Panel Profesor'}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
