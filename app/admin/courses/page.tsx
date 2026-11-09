'use client';

import { ContentManager } from '@/components/admin/ContentManager';
import { CATEGORY_OPTIONS, LEVEL_OPTIONS, STATUS_OPTIONS, labelOf } from '@/components/admin/ui';

type Course = {
  id: string; title: string; slug: string; status: string; category: string; level: string;
  duration?: number | null; modules: number;
};

export default function AdminCoursesPage() {
  return (
    <ContentManager<Course>
      title="Cursos"
      endpoint="/api/admin/courses"
      newLabel="Nuevo curso"
      defaults={{ title: '', description: '', category: 'FISICA', level: 'BASICO', status: 'DRAFT', duration: '', modules: 0, image: '', order: 0 }}
      fields={[
        { key: 'title', label: 'Título', type: 'text', required: true, full: true },
        { key: 'description', label: 'Descripción', type: 'textarea', required: true },
        { key: 'category', label: 'Categoría', type: 'select', required: true, options: CATEGORY_OPTIONS },
        { key: 'level', label: 'Nivel', type: 'select', options: LEVEL_OPTIONS },
        { key: 'status', label: 'Estado', type: 'select', options: STATUS_OPTIONS, hint: 'Solo los publicados se ven en el sitio' },
        { key: 'modules', label: 'Módulos', type: 'number' },
        { key: 'duration', label: 'Duración (horas)', type: 'number' },
        { key: 'order', label: 'Orden', type: 'number' },
        { key: 'image', label: 'URL de imagen', type: 'text', full: true },
      ]}
      columns={[
        { label: 'Categoría', render: (c) => labelOf(CATEGORY_OPTIONS, c.category) },
        { label: 'Nivel', render: (c) => labelOf(LEVEL_OPTIONS, c.level), className: 'hidden md:table-cell' },
        { label: 'Módulos', render: (c) => c.modules, className: 'hidden md:table-cell' },
        { label: 'Duración', render: (c) => (c.duration ? `${c.duration} h` : '—'), className: 'hidden lg:table-cell' },
      ]}
    />
  );
}
