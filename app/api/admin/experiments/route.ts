import { collectionHandlers, experimentSpec } from '@/lib/admin-crud';
export const dynamic = 'force-dynamic';
const h = collectionHandlers('experiment', experimentSpec, {
  include: { laboratory: { select: { id: true, title: true } }, _count: { select: { results: true, progress: true } } },
  searchFields: ['title', 'description'],
  where: (sp) => (sp.get('laboratoryId') ? { laboratoryId: sp.get('laboratoryId') } : {}),
});
export const GET = h.GET;
export const POST = h.POST;
