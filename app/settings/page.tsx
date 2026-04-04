'use client';

import { useState } from 'react';
import Navigation from '@/components/Navigation';
import {
  User,
  Bell,
  Lock,
  Palette,
  Globe,
  Shield,
  Download,
  Trash2,
  Save,
} from 'lucide-react';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  const [settings, setSettings] = useState({
    name: 'Juan Pérez',
    email: 'juan.perez@universidad.edu',
    notifications: {
      email: true,
      push: true,
      weekly: true,
      achievements: true,
    },
    appearance: {
      theme: 'dark',
      animations: true,
    },
    privacy: {
      showProfile: true,
      showProgress: true,
    },
  });

  const sections = [
    { id: 'account', label: 'Cuenta', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'privacy', label: 'Privacidad', icon: Shield },
    { id: 'data', label: 'Datos', icon: Download },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />

      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Configuración</h1>
          <p className="text-gray-400">Administra tu cuenta y preferencias</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <nav className="gradient-border p-2 sticky top-24">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    activeSection === section.id
                      ? 'bg-primary-500/20 text-primary-400'
                      : 'hover:bg-white/5 text-gray-400'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  {section.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            {activeSection === 'account' && (
              <div className="gradient-border p-6 space-y-6">
                <h2 className="text-xl font-semibold">Información de la Cuenta</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Nombre</label>
                    <input
                      type="text"
                      value={settings.name}
                      onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-primary-400" />
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
                      placeholder="Confirmar nueva contraseña"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <button className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Save className="w-5 h-5" />
                  Guardar Cambios
                </button>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="gradient-border p-6 space-y-6">
                <h2 className="text-xl font-semibold">Preferencias de Notificaciones</h2>
                
                <div className="space-y-4">
                  {[
                    { key: 'email', label: 'Notificaciones por email', description: 'Recibe actualizaciones importantes por correo' },
                    { key: 'push', label: 'Notificaciones push', description: 'Recibe alertas en tiempo real' },
                    { key: 'weekly', label: 'Resumen semanal', description: 'Recibe un resumen de tu progreso cada semana' },
                    { key: 'achievements', label: 'Nuevos logros', description: 'Sé notificado cuando desbloquees un logro' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                      <div>
                        <p className="font-medium">{item.label}</p>
                        <p className="text-sm text-gray-400">{item.description}</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={settings.notifications[item.key as keyof typeof settings.notifications]}
                        onChange={(e) => setSettings({
                          ...settings,
                          notifications: {
                            ...settings.notifications,
                            [item.key]: e.target.checked,
                          },
                        })}
                        className="w-5 h-5 accent-primary-500"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="gradient-border p-6 space-y-6">
                <h2 className="text-xl font-semibold">Apariencia</h2>
                
                <div>
                  <label className="block text-sm font-medium mb-3">Tema</label>
                  <div className="grid grid-cols-3 gap-4">
                    {['light', 'dark', 'system'].map((theme) => (
                      <button
                        key={theme}
                        onClick={() => setSettings({
                          ...settings,
                          appearance: { ...settings.appearance, theme },
                        })}
                        className={`p-4 rounded-xl border transition-colors ${
                          settings.appearance.theme === theme
                            ? 'border-primary-500 bg-primary-500/20'
                            : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${
                          theme === 'light' ? 'bg-gray-100' :
                          theme === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-gray-100 to-gray-800'
                        }`} />
                        <p className="text-sm capitalize">{theme}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium">Animaciones</p>
                    <p className="text-sm text-gray-400">Activar animaciones y transiciones</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.appearance.animations}
                    onChange={(e) => setSettings({
                      ...settings,
                      appearance: { ...settings.appearance, animations: e.target.checked },
                    })}
                    className="w-5 h-5 accent-primary-500"
                  />
                </label>
              </div>
            )}

            {activeSection === 'privacy' && (
              <div className="gradient-border p-6 space-y-6">
                <h2 className="text-xl font-semibold">Privacidad</h2>
                
                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                    <div>
                      <p className="font-medium">Mostrar perfil públicamente</p>
                      <p className="text-sm text-gray-400">Otros usuarios pueden ver tu información</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.privacy.showProfile}
                      onChange={(e) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, showProfile: e.target.checked },
                      })}
                      className="w-5 h-5 accent-primary-500"
                    />
                  </label>
                  <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                    <div>
                      <p className="font-medium">Mostrar progreso</p>
                      <p className="text-sm text-gray-400">Compartir tu avance en laboratorios</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.privacy.showProgress}
                      onChange={(e) => setSettings({
                        ...settings,
                        privacy: { ...settings.privacy, showProgress: e.target.checked },
                      })}
                      className="w-5 h-5 accent-primary-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="gradient-border p-6 space-y-6">
                <h2 className="text-xl font-semibold">Gestión de Datos</h2>
                
                <div className="space-y-4">
                  <button className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left">
                    <Download className="w-6 h-6 text-primary-400" />
                    <div>
                      <p className="font-medium">Exportar datos</p>
                      <p className="text-sm text-gray-400">Descarga una copia de todos tus datos</p>
                    </div>
                  </button>
                  
                  <button className="w-full flex items-center gap-4 p-4 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors text-left border border-red-500/20">
                    <Trash2 className="w-6 h-6 text-red-400" />
                    <div>
                      <p className="font-medium text-red-400">Eliminar cuenta</p>
                      <p className="text-sm text-gray-400">Eliminar permanentemente tu cuenta y datos</p>
                    </div>
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
