'use client';

import { useState, useEffect } from 'react';
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Palette,
  Database,
  Key,
  Save,
  Plus,
  Wifi,
  RefreshCw,
  Check,
} from 'lucide-react';

interface SettingsData {
  siteName: string;
  siteUrl: string;
  maintenance: boolean;
  registration: boolean;
  emailNotifications: boolean;
  darkMode: boolean;
  sessionTimeout: number;
  twoFactorRequired: boolean;
  activityLogs: boolean;
  systemEmail: string;
  senderName: string;
  welcomeEmail: boolean;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'updating'>('updating');
  const [dbStats, setDbStats] = useState<{ users: number; laboratories: number; experiments: number; sessions: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    siteName: 'Virtual Lab University',
    siteUrl: 'https://virtuallab.edu',
    maintenance: false,
    registration: true,
    emailNotifications: true,
    darkMode: true,
    sessionTimeout: 60,
    twoFactorRequired: true,
    activityLogs: true,
    systemEmail: 'noreply@virtuallab.edu',
    senderName: 'Virtual Lab',
    welcomeEmail: true,
  });

  useEffect(() => {
    fetchSettings();
    fetchDbStats();
    const interval = setInterval(fetchDbStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSettings = async () => {
    try {
      setConnectionStatus('updating');
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    } catch {
      setConnectionStatus('disconnected');
    }
  };

  const fetchDbStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setDbStats({
          users: data.totalUsers || 0,
          laboratories: data.laboratories || 0,
          experiments: data.totalExperiments || 0,
          sessions: 0,
        });
      }
    } catch {
      console.error('Error fetching db stats');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert('Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof SettingsData>(key: K, value: SettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'appearance', label: 'Apariencia', icon: Palette },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'database', label: 'Base de Datos', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Configuración</h1>
          <p className="text-gray-400">Configuración general del sistema</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${
            connectionStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
            connectionStatus === 'updating' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-500' :
              connectionStatus === 'updating' ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'
            }`} />
            {connectionStatus === 'connected' ? 'En vivo' :
             connectionStatus === 'updating' ? 'Actualizando...' : 'Desconectado'}
          </span>
        </div>
      </div>

      <div className="flex gap-6">
        <nav className="w-64 gradient-border p-2 h-fit sticky top-24">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-500/20 text-primary-400'
                  : 'hover:bg-white/5 text-gray-400'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex-1">
          {activeTab === 'general' && (
            <div className="gradient-border p-6 space-y-6">
              <h2 className="text-xl font-semibold">Configuración General</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre del Sitio</label>
                  <input
                    type="text"
                    value={settings.siteName}
                    onChange={(e) => updateSetting('siteName', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">URL del Sitio</label>
                  <input
                    type="url"
                    value={settings.siteUrl}
                    onChange={(e) => updateSetting('siteUrl', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium">Modo Mantenimiento</p>
                    <p className="text-sm text-gray-400">Bloquear acceso a usuarios no admins</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.maintenance}
                    onChange={(e) => updateSetting('maintenance', e.target.checked)}
                    className="w-5 h-5 accent-primary-500"
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium">Permitir Registros</p>
                    <p className="text-sm text-gray-400">Nuevos usuarios pueden registrarse</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.registration}
                    onChange={(e) => updateSetting('registration', e.target.checked)}
                    className="w-5 h-5 accent-primary-500"
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="gradient-border p-6 space-y-6">
              <h2 className="text-xl font-semibold">Apariencia</h2>
              <div className="grid grid-cols-3 gap-4">
                {['light', 'dark', 'system'].map((theme) => (
                  <button
                    key={theme}
                    onClick={() => updateSetting('darkMode', theme === 'dark')}
                    className={`p-6 rounded-xl border transition-colors ${
                      (theme === 'dark' && settings.darkMode) || (theme === 'light' && !settings.darkMode) || theme === 'system'
                        ? 'border-primary-500 bg-primary-500/20'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className={`w-16 h-10 rounded-lg mx-auto mb-3 ${
                      theme === 'light' ? 'bg-gray-100' :
                      theme === 'dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-gray-100 to-gray-800'
                    }`} />
                    <p className="font-medium capitalize">{theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="gradient-border p-6 space-y-6">
              <h2 className="text-xl font-semibold">Configuración de Correo</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email del Sistema</label>
                  <input
                    type="email"
                    value={settings.systemEmail}
                    onChange={(e) => updateSetting('systemEmail', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre del Remitente</label>
                  <input
                    type="text"
                    value={settings.senderName}
                    onChange={(e) => updateSetting('senderName', e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium">Enviar emails de bienvenida</p>
                    <p className="text-sm text-gray-400">Email cuando un usuario se registra</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.welcomeEmail}
                    onChange={(e) => updateSetting('welcomeEmail', e.target.checked)}
                    className="w-5 h-5 accent-primary-500" 
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="gradient-border p-6 space-y-6">
              <h2 className="text-xl font-semibold">Seguridad</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Sesión (minutos)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => updateSetting('sessionTimeout', parseInt(e.target.value) || 60)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-primary-500"
                  />
                </div>
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium">Autenticación de dos factores</p>
                    <p className="text-sm text-gray-400">Requerir 2FA para admins</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.twoFactorRequired}
                    onChange={(e) => updateSetting('twoFactorRequired', e.target.checked)}
                    className="w-5 h-5 accent-primary-500" 
                  />
                </label>
                <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
                  <div>
                    <p className="font-medium">Logs de actividad</p>
                    <p className="text-sm text-gray-400">Registrar acciones de usuarios</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={settings.activityLogs}
                    onChange={(e) => updateSetting('activityLogs', e.target.checked)}
                    className="w-5 h-5 accent-primary-500" 
                  />
                </label>
              </div>
            </div>
          )}

          {activeTab === 'database' && (
            <div className="gradient-border p-6 space-y-6">
              <h2 className="text-xl font-semibold">Gestión de Base de Datos</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-gray-400">Usuarios</p>
                  <p className="text-2xl font-bold">{dbStats?.users?.toLocaleString() || '...'}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-gray-400">Laboratorios</p>
                  <p className="text-2xl font-bold">{dbStats?.laboratories || '...'}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-gray-400">Experimentos</p>
                  <p className="text-2xl font-bold">{dbStats?.experiments || '...'}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl">
                  <p className="text-sm text-gray-400">Sesiones</p>
                  <p className="text-2xl font-bold">{dbStats?.sessions?.toLocaleString() || '...'}</p>
                </div>
              </div>
              <button className="w-full py-3 bg-yellow-500/20 text-yellow-400 rounded-xl font-medium hover:bg-yellow-500/30 transition-colors flex items-center justify-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Respaldar Base de Datos
              </button>
            </div>
          )}

          <button 
            onClick={handleSave}
            disabled={saving}
            className={`mt-6 w-full py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              saveSuccess 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:opacity-90'
            } disabled:opacity-50`}
          >
            {saving ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : saveSuccess ? (
              <>
                <Check className="w-5 h-5" />
                ¡Guardado!
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
