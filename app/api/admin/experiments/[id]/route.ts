import { experimentSpec, itemHandlers } from '@/lib/admin-crud';
export const dynamic = 'force-dynamic';
const h = itemHandlers('experiment', experimentSpec, { laboratory: { select: { id: true, title: true } } });
export const GET = h.GET;
export const PATCH = h.PATCH;
export const DELETE = h.DELETE;
