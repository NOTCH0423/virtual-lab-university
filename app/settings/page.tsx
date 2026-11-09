'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Navigation from '@/components/Navigation';
import {
  User,
  Bell,
  Lock,
  Palette,
  Shield,
  Download,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { defaultPreferences, loadPreferences, savePreferences, Preferences } from '@/lib/preferences';

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Administrador',
  ADMIN: 'Administrador',
  TEACHER: 'Profesor',
  STUDENT: 'Estudiante',
};

type Toast = { type: 'success' | 'error'; message: string } | null;

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [account, setAccount] = useState({ id: '', name: '', email: '', role: 'STUDENT' });
  const [original, setOriginal] = useState({ name: '', email: '' });
  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [prefs, setPrefs] = useState<Preferences>(defaultPreferences);

  const settings = { ...account, ...prefs };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    (async () => {
      try {
        const res = await fetch('/api/settings', { cache: 'no-store' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo cargar tu cuenta');
        setAccount({ id: data.id, name: data.name || '', email: data.email || '', role: data.role || 'STUDENT' });
        setOriginal({ name: data.name || '', email: data.email || '' });
        setPrefs(loadPreferences(data.id));
      } catch (e: any) {
        showToast('error', e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [status]);

  const setSettings = (next: any) => {
    const p: Preferences = {
      notifications: next.notifications,
      appearance: next.appearance,
      privacy: next.privacy,
    };
    setAccount((a) => ({ ...a, name: next.name, email: next.email }));
    const prefsChanged = JSON.stringify(p) !== JSON.stringify(prefs);
    setPrefs(p);
    if (prefsChanged) {
      savePreferences(p, account.id);
      showToast('success', 'Preferencias guardadas');
    }
  };

  const saveAccount = async () => {
    const wantsPassword = pw.current || pw.next || pw.confirm;
    const changed: any = {};
    if (account.name.trim() !== original.name) changed.name = account.name;
    if (account.email.trim().toLowerCase() !== original.email.toLowerCase()) changed.email = account.email;

    if (!wantsPassword && !Object.keys(changed).length) {
      showToast('error', 'No hay cambios para guardar');
      return;
    }
    if (wantsPassword) {
      if (!pw.current || !pw.next) return showToast('error', 'Completa la contraseña actual y la nueva');
      if (pw.next.length < 8) return showToast('error', 'La nueva contraseña debe tener al menos 8 caracteres');
      if (pw.next !== pw.confirm) return showToast('error', 'Las contraseñas no coinciden');
    }

    setSaving(true);
    try {
      const msgs: string[] = [];
      if (Object.keys(changed).length) {
        const res = await fetch('/api/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(changed),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
        setAccount((a) => ({ ...a, name: data.name, email: data.email, role: data.role }));
        setOriginal({ name: data.name, email: data.email });
        await update();
        msgs.push('Datos de la cuenta actualizados');
      }
      if (wantsPassword) {
        const res = await fetch('/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next, confirmPassword: pw.confirm }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'No se pudo cambiar la contraseña');
        setPw({ current: '', next: '', confirm: '' });
        msgs.push('Contraseña actualizada');
      }
      showToast('success', msgs.join(' · '));
    } catch (e: any) {
      showToast('error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const exportData = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/settings?export=1', { cache: 'no-store' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'No se pudo exportar');
      const data = await res.json();
      data.preferences = prefs;
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mis-datos-virtual-lab-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('success', 'Datos exportados');
    } catch (e: any) {
      showToast('error', e.message);
    } finally {
      setExporting(false);
    }
  };

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

      {toast && (
        <div
          role="status"
          className={`fixed top-20 right-4 z-[60] flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border ${
            toast.type === 'success'
              ? 'bg-green-500/20 border-green-500/40 text-green-300'
              : 'bg-red-500/20 border-red-500/40 text-red-300'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

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
            {loading && (
              <div className="gradient-border p-6 flex items-center gap-3 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin" /> Cargando tu cuenta...
              </div>
            )}
            {!loading && activeSection === 'account' && (
              <div className="gradient-border p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">Información de la Cuenta</h2>
                  <span className="px-3 py-1 rounded-full text-xs bg-primary-500/20 text-primary-300">
                    {ROLE_LABELS[account.role] || account.role}
                  </span>
                </div>
                
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
                  <p className="text-sm text-gray-400 mb-3">Déjalo vacío si no quieres cambiarla. Mínimo 8 caracteres.</p>
                  <div className="space-y-4">
                    <input
                      type="password"
                      placeholder="Contraseña actual"
                      autoComplete={'current-password'}
                      value={pw.current}
                      onChange={(e) => setPw({ ...pw, current: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      autoComplete={'new-password'}
                      value={pw.next}
                      onChange={(e) => setPw({ ...pw, next: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirmar nueva contraseña"
                      autoComplete={'new-password'}
                      value={pw.confirm}
                      onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                    />
                  </div>
                </div>

                <button
                  onClick={saveAccount}
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl font-semibold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Guardar Cambios
                </button>
              </div>
            )}

            {!loading && activeSection === 'notifications' && (
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

            {!loading && activeSection === 'appearance' && (
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
                          appearance: { ...settings.appearance, theme: theme as Preferences['appearance']['theme'] },
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
                        <p className="text-sm">{theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}</p>
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

            {!loading && activeSection === 'privacy' && (
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

            {!loading && activeSection === 'data' && (
              <div className="gradient-border p-6 space-y-6">
                <h2 className="text-xl font-semibold">Gestión de Datos</h2>
                
                <div className="space-y-4">
                  <button
                    onClick={exportData}
                    disabled={exporting}
                    className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors text-left disabled:opacity-50"
                  >
                    {exporting ? <Loader2 className="w-6 h-6 text-primary-400 animate-spin" /> : <Download className="w-6 h-6 text-primary-400" />}
                    <div>
                      <p className="font-medium">Exportar datos</p>
                      <p className="text-sm text-gray-400">Descarga una copia de todos tus datos</p>
                    </div>
                  </button>
                  
                  <button
                    onClick={() => showToast('error', 'Para eliminar tu cuenta contacta a un administrador')}
                    className="w-full flex items-center gap-4 p-4 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors text-left border border-red-500/20">
                    <Trash2 className="w-6 h-6 text-red-400" />
                    <div>
                      <p className="font-medium text-red-400">Eliminar cuenta</p>
                      <p className="text-sm text-gray-400">Solicítalo a un administrador (no se borra desde aquí)</p>
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
