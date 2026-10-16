import { createHmac, timingSafeEqual } from 'crypto';

// Token por pestaña: JWT HS256 firmado con JWT_SECRET/NEXTAUTH_SECRET.
// Vive en sessionStorage del navegador (no en cookies) → cada pestaña tiene su propia sesión.
export const TOKEN_TTL_SEC = 2 * 60 * 60;        // 2 h por token
export const MAX_SESSION_SEC = 12 * 60 * 60;     // renovación deslizante como máximo 12 h desde el login

function secret() {
  const s = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || '';
  if (s.length < 16) throw new Error('JWT secret not configured');
  return s;
}
const b64u = (b: Buffer | string) => Buffer.from(b).toString('base64url');

export interface TokenPayload { sub: string; iat: number; exp: number; auth: number; typ: 'tab' }

export function signToken(sub: string, authTime?: number) {
  const now = Math.floor(Date.now() / 1000);
  const auth = authTime ?? now;
  const payload: TokenPayload = { sub, iat: now, exp: Math.min(now + TOKEN_TTL_SEC, auth + MAX_SESSION_SEC), auth, typ: 'tab' };
  const head = b64u(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = b64u(JSON.stringify(payload));
  const sig = createHmac('sha256', secret()).update(`${head}.${body}`).digest('base64url');
  return { token: `${head}.${body}.${sig}`, expiresAt: payload.exp * 1000 };
}

export function verifyToken(token: string | null | undefined): TokenPayload | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  try {
    const h = JSON.parse(Buffer.from(head, 'base64url').toString());
    if (h.alg !== 'HS256') return null;
    const expected = createHmac('sha256', secret()).update(`${head}.${body}`).digest();
    const got = Buffer.from(sig, 'base64url');
    if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
    const p = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (p.typ !== 'tab' || typeof p.sub !== 'string' || !p.exp || p.exp <= now) return null;
    return p;
  } catch {
    return null;
  }
}
