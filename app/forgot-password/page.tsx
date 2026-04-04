'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Beaker, Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitted(true);
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&q=80')] bg-cover bg-center mix-blend-overlay" />
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
              Recupera tu acceso
            </h2>
            <p className="text-xl text-white/80">
              Restablece tu contraseña y continúa aprendiendo sin interrupciones.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Beaker className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">Virtual Lab</span>
            </Link>
          </div>

          {!isSubmitted ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">¿Olvidaste tu contraseña?</h1>
                <p className="text-gray-400">
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                      placeholder="tu@universidad.edu"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Enviar enlace <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-gray-400">
                ¿Recordaste tu contraseña?{' '}
                <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
                  Inicia Sesión
                </Link>
              </p>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Correo enviado</h2>
              <p className="text-gray-400 mb-8">
                Hemos enviado un enlace de recuperación a <span className="text-white font-medium">{email}</span>. 
                Revisa tu bandeja de entrada y sigue las instrucciones.
              </p>
              
              <div className="gradient-border p-4 rounded-xl mb-6">
                <p className="text-sm text-gray-400">
                  ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
                  <button 
                    onClick={() => setIsSubmitted(false)}
                    className="text-primary-400 hover:underline"
                  >
                    intenta de nuevo
                  </button>
                </p>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-medium text-white hover:opacity-90 transition-opacity"
              >
                Volver al Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
