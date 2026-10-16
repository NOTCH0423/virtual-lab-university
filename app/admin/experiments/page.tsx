'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ContentManager } from '@/components/admin/ContentManager';
import { CATEGORY_OPTIONS, LEVEL_OPTIONS, Select, Spinner, api, labelOf, useToast } from '@/components/admin/ui';

type Exp = {
  id: string; title: string; slug: string; category: string; difficulty: string; duration?: number | null;
  laboratoryId: string; laboratory?: { id: string; title: string }; _count?: { results: number; progress: number };
};

function ExperimentsInner() {
  const toast = useToast();
  const router = useRouter();
  const sp = useSearchParams();
  const labFilter = sp.get('laboratoryId') || '';
  const [labs, setLabs] = useState<{ value: string; label: string }[] | null>(null);

  useEffect(() => {
    api<{ id: string; title: string }[]>('/api/admin/laboratories')
      .then((l) => setLabs(l.map((x) => ({ value: x.id, label: x.title }))))
      .catch((e) => { toast('error', e.message); setLabs([]); });
  }, [toast]);

  if (!labs) return <Spinner />;
  if (!labs.length) {
    return <p className="p-8 text-gray-400">Primero crea un laboratorio: cada experimento pertenece a uno.</p>;
  }

  return (
    <ContentManager<Exp>
      key={labFilter}
      title="Experimentos"
      endpoint="/api/admin/experiments"
      query={labFilter ? `laboratoryId=${labFilter}` : ''}
      newLabel="Nuevo experimento"
      filters={
        <Select
          className="w-64"
          value={labFilter}
          onChange={(e) => router.replace(e.target.value ? `/admin/experiments?laboratoryId=${e.target.value}` : '/admin/experiments')}
          options={[{ value: '', label: 'Todos los laboratorios' }, ...labs]}
        />
      }
      defaults={{
        laboratoryId: labFilter || labs[0].value, title: '', description: '', category: 'FISICA', difficulty: 'BASICO',
        duration: '', order: 0, image: '', instructions: '', theory: '', formulas: '',
      }}
      fields={[
        { key: 'laboratoryId', label: 'Laboratorio', type: 'select', required: true, options: labs, full: true },
        { key: 'title', label: 'Título', type: 'text', required: true, full: true },
        { key: 'description', label: 'Descripción', type: 'textarea', required: true },
        { key: 'category', label: 'Categoría', type: 'select', required: true, options: CATEGORY_OPTIONS },
        { key: 'difficulty', label: 'Dificultad', type: 'select', options: LEVEL_OPTIONS },
        { key: 'duration', label: 'Duración (min)', type: 'number' },
        { key: 'order', label: 'Orden', type: 'number' },
        { key: 'image', label: 'URL de imagen', type: 'text', full: true },
        { key: 'instructions', label: 'Instrucciones', type: 'textarea' },
        { key: 'theory', label: 'Teoría', type: 'textarea' },
        { key: 'formulas', label: 'Fórmulas', type: 'textarea' },
      ]}
      columns={[
        { label: 'Laboratorio', render: (e) => e.laboratory?.title || '—' },
        { label: 'Categoría', render: (e) => labelOf(CATEGORY_OPTIONS, e.category), className: 'hidden md:table-cell' },
        { label: 'Dificultad', render: (e) => labelOf(LEVEL_OPTIONS, e.difficulty), className: 'hidden md:table-cell' },
        { label: 'Resultados', render: (e) => e._count?.results ?? 0, className: 'hidden lg:table-cell' },
      ]}
      deleteWarning={(e) => <>Se eliminarán también {e._count?.results ?? 0} resultado(s) registrados.</>}
    />
  );
}

export default function AdminExperimentsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <ExperimentsInner />
    </Suspense>
  );
}
