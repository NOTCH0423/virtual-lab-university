'use client';

import { useState } from 'react';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { Beaker, GraduationCap, AlertCircle, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setIsOAuthLoading(provider);
    setError('');
    
    try {
      const result = await signIn(provider, {
        callbackUrl: '/dashboard',
        redirect: true,
      });
      
      if (result?.error) {
        throw new Error(`Error con ${provider}`);
      }
    } catch (err: any) {
      setError(err.message);
      setIsOAuthLoading(null);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-600 to-primary-600" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80')] bg-cover bg-center mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Beaker className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">Virtual Lab</span>
          </Link>

          <div>
            <h2 className="text-4xl font-bold text-white mb-4">
              Únete a la comunidad
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Miles de estudiantes ya están transformando su aprendizaje con nuestros laboratorios virtuales.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>Acceso a más de 100 simulaciones</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>Certificados oficiales por laboratorio</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
                <span>Colaboración en tiempo real</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Beaker className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Virtual Lab</span>
            </Link>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Registro</h1>
            <p className="text-gray-400">
              El registro está disponible solo para administradores y profesores
            </p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </motion.div>
          )}

          <div className="mb-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
            <div className="flex items-center gap-3">
              <GraduationCap className="w-6 h-6 text-primary-400" />
              <div>
                <p className="text-sm text-primary-400 font-medium">Registro por Invitación</p>
                <p className="text-xs text-gray-400 mt-1">
                  Si eres estudiante, pide a tu profesor o administrador que cree tu cuenta
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <p className="text-sm text-blue-400 text-center">
              Si eres profesor o administrador, inicia sesión y crea cuentas desde el panel
            </p>
          </div>

          <button
            onClick={() => handleOAuthSignIn('github')}
            disabled={isOAuthLoading !== null}
            className="w-full flex items-center justify-center gap-2 py-3 glass rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50 mb-6"
          >
            {isOAuthLoading === 'github' ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                Iniciar sesión con GitHub
              </>
            )}
          </button>

          <p className="mt-8 text-center text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Inicia Sesión
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
