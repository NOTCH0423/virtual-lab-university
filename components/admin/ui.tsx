'use client';

import { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, X } from 'lucide-react';

/* ---------- Toasts ---------- */
type ToastT = { id: number; type: 'success' | 'error'; message: string };
const ToastCtx = createContext<(type: ToastT['type'], message: string) => void>(() => {});
export const useToast = () => useContext(ToastCtx);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastT[]>([]);
  const push = useCallback((type: ToastT['type'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg border backdrop-blur ${
              t.type === 'success'
                ? 'bg-green-500/20 border-green-500/40 text-green-200'
                : 'bg-red-500/20 border-red-500/40 text-red-200'
            }`}
          >
            {t.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

/* ---------- API helper ---------- */
export async function api<T = any>(url: string, init?: RequestInit & { json?: any }): Promise<T> {
  const res = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    body: init?.json !== undefined ? JSON.stringify(init.json) : init?.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`);
  return data as T;
}

/* ---------- Modal ---------- */
export function Modal({
  open, title, onClose, children, wide,
}: { open: boolean; title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70" onMouseDown={onClose}>
      <div
        className={`w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-white/10 p-6`}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10" aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ---------- Confirmación ---------- */
export function ConfirmDialog({
  open, title, message, confirmLabel = 'Eliminar', onConfirm, onCancel, busy,
}: {
  open: boolean; title: string; message: ReactNode; confirmLabel?: string;
  onConfirm: () => void; onCancel: () => void; busy?: boolean;
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <div className="text-gray-300 mb-6">{message}</div>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} disabled={busy}>Cancelar</Button>
        <Button variant="danger" onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}

/* ---------- Controles ---------- */
const inputCls =
  'w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-primary-500 text-white placeholder-gray-500';

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-300 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-500 mt-1">{hint}</span>}
    </label>
  );
}
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={`${inputCls} ${p.className || ''}`} />;
export const TextArea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea rows={3} {...p} className={`${inputCls} ${p.className || ''}`} />
);
export function Select({ options, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <select {...p} className={`${inputCls} ${p.className || ''} [&>option]:bg-slate-900`}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

export function Button({
  variant = 'primary', loading, children, className = '', ...p
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' | 'danger'; loading?: boolean }) {
  const v =
    variant === 'primary'
      ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:opacity-90'
      : variant === 'danger'
      ? 'bg-red-500/80 hover:bg-red-500 text-white'
      : 'bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10';
  return (
    <button
      {...p}
      disabled={p.disabled || loading}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition disabled:opacity-50 ${v} ${className}`}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Badge({ children, color = 'gray' }: { children: ReactNode; color?: 'gray' | 'green' | 'yellow' | 'red' | 'blue' | 'purple' }) {
  const c = {
    gray: 'bg-white/10 text-gray-300',
    green: 'bg-green-500/20 text-green-300',
    yellow: 'bg-yellow-500/20 text-yellow-300',
    red: 'bg-red-500/20 text-red-300',
    blue: 'bg-blue-500/20 text-blue-300',
    purple: 'bg-purple-500/20 text-purple-300',
  }[color];
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c}`}>{children}</span>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && <p className="text-gray-400 text-sm">{subtitle}</p>}
      </div>
      <div className="flex gap-2">{actions}</div>
    </div>
  );
}

export function Spinner({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 text-gray-400 py-10 justify-center">
      <Loader2 className="w-5 h-5 animate-spin" /> {label}
    </div>
  );
}

export const CATEGORY_OPTIONS = [
  { value: 'FISICA', label: 'Física' },
  { value: 'QUIMICA', label: 'Química' },
  { value: 'BIOLOGIA', label: 'Biología' },
  { value: 'INGENIERIA', label: 'Ingeniería' },
  { value: 'MATEMATICAS', label: 'Matemáticas' },
];
export const LEVEL_OPTIONS = [
  { value: 'BASICO', label: 'Básico' },
  { value: 'INTERMEDIO', label: 'Intermedio' },
  { value: 'AVANZADO', label: 'Avanzado' },
];
export const STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'Borrador' },
  { value: 'PUBLISHED', label: 'Publicado' },
  { value: 'ARCHIVED', label: 'Archivado' },
];
export const labelOf = (opts: { value: string; label: string }[], v?: string | null) =>
  opts.find((o) => o.value === v)?.label || v || '—';
