'use client';

import Link from 'next/link';
import { Beaker, GraduationCap, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RegisterPage() {
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
