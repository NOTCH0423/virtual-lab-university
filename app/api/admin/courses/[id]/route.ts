import { courseSpec, itemHandlers } from '@/lib/admin-crud';
export const dynamic = 'force-dynamic';
const h = itemHandlers('course', courseSpec);
export const GET = h.GET;
export const PATCH = h.PATCH;
export const DELETE = h.DELETE;
