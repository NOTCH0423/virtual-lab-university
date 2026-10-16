import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { verifyToken, TokenPayload } from '@/lib/auth-token';

export interface AuthUser { id: string; email: string; name: string; role: string; image: string | null }
export interface AppSession { user: AuthUser; token: TokenPayload }

function bearer(h: Headers | null) {
  const a = h?.get('authorization') || '';
  return a.toLowerCase().startsWith('bearer ') ? a.slice(7).trim() : null;
}

/** Usuario autenticado de la petición (token Bearer por pestaña). Rol y estado se leen de la BD en cada petición. */
export async function getAuthUser(req?: Request): Promise<AuthUser | null> {
  return (await getSession(req))?.user ?? null;
}

export async function getSession(req?: Request): Promise<AppSession | null> {
  let h: Headers | null = null;
  if (req) h = req.headers;
  else { try { h = headers() as unknown as Headers; } catch { h = null; } }
  const payload = verifyToken(bearer(h));
  if (!payload) return null;
  const u = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, name: true, role: true, avatar: true, status: true },
  });
  if (!u || (u.status && u.status !== 'ACTIVE')) return null;
  return {
    user: { id: u.id, email: u.email, name: u.name, role: u.role, image: u.avatar && /^https?:\/\//.test(u.avatar) ? u.avatar : null },
    token: payload,
  };
}
