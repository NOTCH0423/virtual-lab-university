import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session';

export const dynamic = 'force-dynamic';

const BUCKET = 'avatars';
const TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX = 2 * 1024 * 1024;
const DATA_URL_MAX = 150 * 1024; // respaldo si no hay Storage

function storage() {
  const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return url && key ? { url, key } : null;
}
const hdr = (key: string, extra: Record<string, string> = {}) => ({ Authorization: `Bearer ${key}`, apikey: key, ...extra });

async function ensureBucket(s: { url: string; key: string }) {
  const r = await fetch(`${s.url}/storage/v1/bucket/${BUCKET}`, { headers: hdr(s.key), cache: 'no-store' });
  if (r.ok) return;
  await fetch(`${s.url}/storage/v1/bucket`, {
    method: 'POST', headers: hdr(s.key, { 'content-type': 'application/json' }),
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true, file_size_limit: MAX, allowed_mime_types: Object.keys(TYPES) }),
  });
}

function ownObjectPath(s: { url: string } | null, avatar: string | null | undefined) {
  if (!s || !avatar) return null;
  const prefix = `${s.url}/storage/v1/object/public/${BUCKET}/`;
  return avatar.startsWith(prefix) ? avatar.slice(prefix.length) : null;
}

async function removeObject(s: { url: string; key: string } | null, path: string | null) {
  if (!s || !path) return;
  try {
    await fetch(`${s.url}/storage/v1/object/${BUCKET}`, {
      method: 'DELETE', headers: hdr(s.key, { 'content-type': 'application/json' }), body: JSON.stringify({ prefixes: [path] }),
    });
  } catch { /* no crítico */ }
}

async function me() {
  const session = await getSession();
  const id = (session?.user as any)?.id as string | undefined;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id }, select: { id: true, avatar: true } });
}

export async function POST(req: NextRequest) {
  const user = await me();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get('file');
    if (f && typeof f !== 'string') file = f as File;
  } catch { /* cuerpo inválido */ }
  if (!file) return NextResponse.json({ error: 'No se recibió ninguna imagen' }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return NextResponse.json({ error: 'Formato no permitido (usa JPG, PNG o WebP)' }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: 'La imagen supera 2 MB' }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  // Verificar firma real del archivo (no confiar solo en el MIME declarado)
  const isJpg = buf[0] === 0xff && buf[1] === 0xd8;
  const isPng = buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const isWebp = buf.subarray(0, 4).toString() === 'RIFF' && buf.subarray(8, 12).toString() === 'WEBP';
  if (!({ jpg: isJpg, png: isPng, webp: isWebp } as any)[ext]) {
    return NextResponse.json({ error: 'El archivo no es una imagen válida' }, { status: 400 });
  }

  const s = storage();
  let avatar: string;
  if (s) {
    await ensureBucket(s);
    const path = `${user.id}/${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`;
    const up = await fetch(`${s.url}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST', headers: hdr(s.key, { 'content-type': file.type, 'cache-control': '31536000', 'x-upsert': 'false' }), body: buf,
    });
    if (!up.ok) {
      console.error('avatar upload failed', up.status, await up.text().catch(() => ''));
      return NextResponse.json({ error: 'No se pudo subir la imagen' }, { status: 502 });
    }
    avatar = `${s.url}/storage/v1/object/public/${BUCKET}/${path}`;
  } else {
    if (buf.length > DATA_URL_MAX) return NextResponse.json({ error: 'Imagen demasiado grande' }, { status: 400 });
    avatar = `data:${file.type};base64,${buf.toString('base64')}`;
  }

  await prisma.user.update({ where: { id: user.id }, data: { avatar } });
  await removeObject(s, ownObjectPath(s, user.avatar));
  return NextResponse.json({ avatar, storage: s ? 'supabase' : 'database' });
}

export async function DELETE() {
  const user = await me();
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const s = storage();
  await prisma.user.update({ where: { id: user.id }, data: { avatar: null } });
  await removeObject(s, ownObjectPath(s, user.avatar));
  return NextResponse.json({ avatar: null });
}
