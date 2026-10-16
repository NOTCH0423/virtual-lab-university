'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

// Sesión por pestaña: el token vive en sessionStorage (aislado por pestaña) y se envía
// como Authorization: Bearer en todas las llamadas a /api mediante un wrapper central de fetch.
const KEY = 'vl_tab_token';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try { return window.sessionStorage.getItem(KEY); } catch { return null; }
}
function setToken(t: string | null) {
  try { t ? window.sessionStorage.setItem(KEY, t) : window.sessionStorage.removeItem(KEY); } catch { /* */ }
}

/** Wrapper central: añade el Bearer a peticiones del mismo origen. */
export function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  return (window as any).__vlFetch(input, init) as Promise<Response>;
}

if (typeof window !== 'undefined' && !(window as any).__vlFetch) {
  const native = window.fetch.bind(window);
  const wrapped = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    let sameOrigin = false;
    try { sameOrigin = new URL(url, window.location.href).origin === window.location.origin; } catch { /* */ }
    const token = getToken();
    if (!sameOrigin || !token) return native(input as any, init);
    const h = new Headers(init?.headers || (input instanceof Request ? input.headers : undefined));
    if (!h.has('authorization')) h.set('authorization', `Bearer ${token}`);
    return native(input as any, { ...init, headers: h });
  };
  (window as any).__vlFetch = wrapped;
  window.fetch = wrapped as typeof window.fetch;
}

export interface SessionUser { id: string; email: string; name: string; role: string; image: string | null }
export interface ClientSession { user: SessionUser; expires: string }
type Status = 'loading' | 'authenticated' | 'unauthenticated';
interface Ctx { data: ClientSession | null; status: Status; update: () => Promise<ClientSession | null> }

const AuthCtx = createContext<Ctx>({ data: null, status: 'loading', update: async () => null });
let refreshSession: () => Promise<ClientSession | null> = async () => null;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ClientSession | null>(null);
  const [status, setStatus] = useState<Status>('loading');
  const timer = useRef<ReturnType<typeof setInterval>>();

  const update = useCallback(async () => {
    if (!getToken()) { setData(null); setStatus('unauthenticated'); return null; }
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      if (res.ok) { const s = await res.json(); setData(s); setStatus('authenticated'); return s; }
      if (res.status === 401) setToken(null);
    } catch { /* red */ }
    setData(null); setStatus('unauthenticated');
    return null;
  }, []);

  useEffect(() => {
    refreshSession = update;
    update();
    // Renovación deslizante cada 20 min mientras la pestaña esté abierta
    timer.current = setInterval(async () => {
      if (!getToken()) return;
      const r = await fetch('/api/auth/token/refresh', { method: 'POST' }).catch(() => null);
      if (r?.ok) setToken((await r.json()).token);
      else if (r?.status === 401) { setToken(null); update(); }
    }, 20 * 60 * 1000);
    return () => clearInterval(timer.current);
  }, [update]);

  return <AuthCtx.Provider value={{ data, status, update }}>{children}</AuthCtx.Provider>;
}

export function useSession() { return useContext(AuthCtx); }

export async function signIn(provider: string, opts: { email?: string; password?: string; redirect?: boolean; callbackUrl?: string } = {}) {
  if (provider !== 'credentials') return { ok: false, error: 'Solo se admite correo y contraseña' };
  const res = await fetch('/api/auth/token', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: opts.email, password: opts.password }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, error: d.error || 'Credenciales inválidas' };
  setToken(d.token);
  await refreshSession();
  if (opts.redirect && opts.callbackUrl) window.location.href = opts.callbackUrl;
  return { ok: true, error: null as string | null };
}

export async function signOut(opts: { callbackUrl?: string } = {}) {
  setToken(null); // solo esta pestaña
  window.location.href = opts.callbackUrl || '/login';
}
