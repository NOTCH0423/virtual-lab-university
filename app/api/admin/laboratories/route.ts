import { collectionHandlers, labSpec } from '@/lib/admin-crud';
export const dynamic = 'force-dynamic';
const h = collectionHandlers('laboratory', labSpec, {
  include: { _count: { select: { experiments: true, progress: true } } },
  searchFields: ['title', 'description', 'instructor'],
});
export const GET = h.GET;
export const POST = h.POST;
