'use client';

import Link from 'next/link';
import { ContentManager } from '@/components/admin/ContentManager';
import { CATEGORY_OPTIONS, LEVEL_OPTIONS, STATUS_OPTIONS, labelOf } from '@/components/admin/ui';

type Lab = {
  id: string; title: string; slug: string; status: string; category: string; difficulty: string;
  instructor?: string | null; duration?: number | null; _count?: { experiments: number; progress: number };
};

export default function AdminLaboratoriesPage() {
  return (
    <ContentManager<Lab>
      title="Laboratorios"
      endpoint="/api/admin/laboratories"
      newLabel="Nuevo laboratorio"
      defaults={{ title: '', description: '', category: 'FISICA', difficulty: 'BASICO', status: 'DRAFT', instructor: '', requirements: '', duration: '', image: '', order: 0 }}
      fields={[
        { key: 'title', label: 'Título', type: 'text', required: true, full: true },
        { key: 'description', label: 'Descripción', type: 'textarea', required: true },
        { key: 'category', label: 'Categoría', type: 'select', required: true, options: CATEGORY_OPTIONS },
        { key: 'difficulty', label: 'Dificultad', type: 'select', options: LEVEL_OPTIONS },
        { key: 'status', label: 'Estado', type: 'select', options: STATUS_OPTIONS, hint: 'Solo los publicados se ven en el sitio' },
        { key: 'instructor', label: 'Instructor', type: 'text' },
        { key: 'duration', label: 'Duración (min)', type: 'number' },
        { key: 'order', label: 'Orden', type: 'number' },
        { key: 'image', label: 'URL de imagen', type: 'text', full: true },
        { key: 'requirements', label: 'Requisitos', type: 'textarea' },
      ]}
      columns={[
        { label: 'Categoría', render: (l) => labelOf(CATEGORY_OPTIONS, l.category) },
        { label: 'Dificultad', render: (l) => labelOf(LEVEL_OPTIONS, l.difficulty), className: 'hidden md:table-cell' },
        {
          label: 'Experimentos',
          render: (l) => (
            <Link href={`/admin/experiments?laboratoryId=${l.id}`} className="text-primary-400 hover:underline">
              {l._count?.experiments ?? 0} · gestionar
            </Link>
          ),
        },
        { label: 'Estudiantes', render: (l) => l._count?.progress ?? 0, className: 'hidden lg:table-cell' },
      ]}
      deleteWarning={(l) => <>Se eliminarán también sus {l._count?.experiments ?? 0} experimento(s) y el progreso de {l._count?.progress ?? 0} estudiante(s).</>}
    />
  );
}
