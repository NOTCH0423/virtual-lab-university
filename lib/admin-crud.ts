import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAdmin, slugify } from '@/lib/admin';

export const CATEGORIES = ['FISICA', 'QUIMICA', 'BIOLOGIA', 'INGENIERIA', 'MATEMATICAS'];
export const LEVELS = ['BASICO', 'INTERMEDIO', 'AVANZADO'];
export const CONTENT_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED'];

type FieldType = 'string' | 'text' | 'int' | 'enum';
interface Field {
  type: FieldType;
  required?: boolean;
  max?: number;
  values?: string[];
  min?: number;
}
export type Spec = Record<string, Field>;

/** Valida y normaliza el body según la especificación. partial=true para PATCH. */
export function parseBody(spec: Spec, body: any, partial: boolean): { data?: Record<string, any>; error?: string } {
  const data: Record<string, any> = {};
  for (const [key, f] of Object.entries(spec)) {
    const raw = body?.[key];
    if (raw === undefined) {
      if (!partial && f.required) return { error: `El campo "${key}" es obligatorio` };
      continue;
    }
    if (raw === null || raw === '') {
      if (f.required) return { error: `El campo "${key}" es obligatorio` };
      data[key] = f.type === 'int' ? null : null;
      continue;
    }
    if (f.type === 'int') {
      const n = Number(raw);
      if (!Number.isInteger(n) || n < (f.min ?? 0)) return { error: `"${key}" debe ser un entero ≥ ${f.min ?? 0}` };
      data[key] = n;
    } else if (f.type === 'enum') {
      const v = String(raw).toUpperCase();
      if (!f.values!.includes(v)) return { error: `"${key}" inválido. Valores: ${f.values!.join(', ')}` };
      data[key] = v;
    } else {
      const v = String(raw).trim();
      const max = f.max ?? (f.type === 'text' ? 20000 : 200);
      if (v.length > max) return { error: `"${key}" supera ${max} caracteres` };
      if (f.required && !v) return { error: `El campo "${key}" es obligatorio` };
      data[key] = v;
    }
  }
  return { data };
}

export function prismaError(err: any) {
  if (err?.code === 'P2002') return NextResponse.json({ error: 'Ya existe un registro con ese slug' }, { status: 409 });
  if (err?.code === 'P2025') return NextResponse.json({ error: 'Registro no encontrado' }, { status: 404 });
  if (err?.code === 'P2003') return NextResponse.json({ error: 'Referencia inválida' }, { status: 400 });
  console.error('admin crud error', err);
  return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
}

type ModelName = 'laboratory' | 'course' | 'experiment';
const delegate = (m: ModelName): any => (prisma as any)[m];

/** Handlers PATCH/DELETE genéricos para /api/admin/<recurso>/[id] */
export function itemHandlers(model: ModelName, spec: Spec, include?: any) {
  return {
    async GET(_req: NextRequest, { params }: { params: { id: string } }) {
      const { error } = await requireAdmin();
      if (error) return error;
      const item = await delegate(model).findUnique({ where: { id: params.id }, include });
      if (!item) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
      return NextResponse.json(item);
    },
    async PATCH(req: NextRequest, { params }: { params: { id: string } }) {
      const { error } = await requireAdmin();
      if (error) return error;
      try {
        const body = await req.json().catch(() => ({}));
        const parsed = parseBody(spec, body, true);
        if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
        const data = parsed.data!;
        if (body.slug !== undefined) {
          const s = slugify(String(body.slug || body.title || ''));
          if (!s) return NextResponse.json({ error: 'Slug inválido' }, { status: 400 });
          data.slug = s;
        }
        if (!Object.keys(data).length) return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 });
        const item = await delegate(model).update({ where: { id: params.id }, data, include });
        return NextResponse.json(item);
      } catch (err) {
        return prismaError(err);
      }
    },
    async DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
      const { error } = await requireAdmin();
      if (error) return error;
      try {
        await delegate(model).delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
      } catch (err) {
        return prismaError(err);
      }
    },
  };
}

/** Handlers GET (lista) / POST (crear) genéricos */
export function collectionHandlers(
  model: ModelName,
  spec: Spec,
  opts: { include?: any; orderBy?: any; where?: (sp: URLSearchParams) => any; searchFields?: string[] } = {}
) {
  return {
    async GET(req: NextRequest) {
      const { error } = await requireAdmin();
      if (error) return error;
      try {
        const sp = req.nextUrl.searchParams;
        const where: any = opts.where ? opts.where(sp) : {};
        const q = (sp.get('search') || '').trim();
        if (q && opts.searchFields) {
          where.OR = opts.searchFields.map((f) => ({ [f]: { contains: q, mode: 'insensitive' } }));
        }
        const status = sp.get('status');
        if (status && status !== 'all' && spec.status) where.status = status;
        const items = await delegate(model).findMany({
          where,
          include: opts.include,
          orderBy: opts.orderBy ?? [{ order: 'asc' }, { createdAt: 'desc' }],
        });
        return NextResponse.json(items);
      } catch (err) {
        return prismaError(err);
      }
    },
    async POST(req: NextRequest) {
      const { error } = await requireAdmin();
      if (error) return error;
      try {
        const body = await req.json().catch(() => ({}));
        const parsed = parseBody(spec, body, false);
        if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 });
        const data = parsed.data!;
        data.slug = slugify(String(body.slug || body.title || ''));
        if (!data.slug) return NextResponse.json({ error: 'No se pudo generar el slug (título vacío)' }, { status: 400 });
        const item = await delegate(model).create({ data, include: opts.include });
        return NextResponse.json(item, { status: 201 });
      } catch (err) {
        return prismaError(err);
      }
    },
  };
}

export const labSpec: Spec = {
  title: { type: 'string', required: true },
  description: { type: 'text', required: true },
  category: { type: 'string', required: true, max: 50 },
  image: { type: 'string', max: 1000 },
  difficulty: { type: 'enum', values: LEVELS },
  status: { type: 'enum', values: CONTENT_STATUSES },
  instructor: { type: 'string' },
  requirements: { type: 'text' },
  duration: { type: 'int' },
  order: { type: 'int' },
};

export const courseSpec: Spec = {
  title: { type: 'string', required: true },
  description: { type: 'text', required: true },
  category: { type: 'string', required: true, max: 50 },
  image: { type: 'string', max: 1000 },
  level: { type: 'enum', values: LEVELS },
  status: { type: 'enum', values: CONTENT_STATUSES },
  duration: { type: 'int' },
  modules: { type: 'int' },
  order: { type: 'int' },
};

export const experimentSpec: Spec = {
  laboratoryId: { type: 'string', required: true },
  title: { type: 'string', required: true },
  description: { type: 'text', required: true },
  category: { type: 'string', required: true, max: 50 },
  image: { type: 'string', max: 1000 },
  difficulty: { type: 'enum', values: LEVELS },
  duration: { type: 'int' },
  order: { type: 'int' },
  instructions: { type: 'text' },
  formulas: { type: 'text' },
  theory: { type: 'text' },
  status: { type: 'enum', values: CONTENT_STATUSES },
};
