import { collectionHandlers, courseSpec } from '@/lib/admin-crud';
export const dynamic = 'force-dynamic';
const h = collectionHandlers('course', courseSpec, { searchFields: ['title', 'description'] });
export const GET = h.GET;
export const POST = h.POST;
