'use client';

import Link from 'next/link';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="text-8xl font-bold gradient-text mb-4">404</div>
        <h1 className="text-2xl font-bold mb-4">Página no encontrada</h1>
        <p className="text-gray-400 mb-8">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
          >
            <Home className="w-5 h-5" />
            Ir al Inicio
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-6 py-3 glass rounded-xl font-medium hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver atrás
          </button>
        </div>

        <div className="mt-12 p-6 gradient-border">
          <p className="text-sm text-gray-400 mb-4">Quizás buscabas:</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/laboratories" className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors">
              Laboratorios
            </Link>
            <Link href="/courses" className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors">
              Cursos
            </Link>
            <Link href="/dashboard" className="px-4 py-2 bg-white/5 rounded-lg text-sm hover:bg-white/10 transition-colors">
              Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
