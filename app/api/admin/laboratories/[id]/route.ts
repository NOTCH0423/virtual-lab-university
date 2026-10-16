import { itemHandlers, labSpec } from '@/lib/admin-crud';
export const dynamic = 'force-dynamic';
const h = itemHandlers('laboratory', labSpec, { _count: { select: { experiments: true, progress: true } } });
export const GET = h.GET;
export const PATCH = h.PATCH;
export const DELETE = h.DELETE;
