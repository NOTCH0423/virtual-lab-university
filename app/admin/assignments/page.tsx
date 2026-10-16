'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { GraduationCap, UserMinus, UserPlus, Users } from 'lucide-react';
import { api, Badge, Button, ConfirmDialog, Input, Modal, PageHeader, Spinner, useToast } from '@/components/admin/ui';

type U = { id: string; name: string; email: string };
type C = { id: string; title: string; status: string; teachers: U[]; students: U[] };
type Data = { courses: C[]; teachers: U[]; students: U[] };

export default function AssignmentsPage() {
  const toast = useToast();
  const [data, setData] = useState<Data | null>(null);
  const [courseId, setCourseId] = useState<string>('');
  const [adding, setAdding] = useState<'teacher' | 'student' | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [busy, setBusy] = useState(false);
  const [toRemove, setToRemove] = useState<{ type: 'teacher' | 'student'; user: U } | null>(null);

  const load = useCallback(async () => {
    try {
      const d = await api<Data>('/api/admin/assignments');
      setData(d);
      setCourseId((cur) => cur || d.courses[0]?.id || '');
    } catch (e: any) { toast('error', e.message); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const course = data?.courses.find((c) => c.id === courseId);
  const candidates = useMemo(() => {
    if (!data || !course || !adding) return [];
    const taken = new Set((adding === 'teacher' ? course.teachers : course.students).map((u) => u.id));
    const q = filter.toLowerCase();
    return (adding === 'teacher' ? data.teachers : data.students)
      .filter((u) => !taken.has(u.id))
      .filter((u) => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [data, course, adding, filter]);

  const add = async () => {
    if (!picked.length) return toast('error', 'Selecciona al menos uno');
    setBusy(true);
    try {
      const r = await api<{ added: number }>('/api/admin/assignments', { method: 'POST', json: { courseId, type: adding, userIds: picked } });
      toast('success', adding === 'teacher' ? `${r.added} profesor(es) asignado(s)` : `${r.added} estudiante(s) matriculado(s)`);
      setAdding(null); setPicked([]); setFilter(''); load();
    } catch (e: any) { toast('error', e.message); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!toRemove) return;
    setBusy(true);
    try {
      await api('/api/admin/assignments', { method: 'DELETE', json: { courseId, type: toRemove.type, userId: toRemove.user.id } });
      toast('success', toRemove.type === 'teacher' ? 'Profesor desasignado' : 'Matrícula retirada');
      setToRemove(null); load();
    } catch (e: any) { toast('error', e.message); } finally { setBusy(false); }
  };

  if (!data) return <Spinner />;
  if (!data.courses.length) {
    return (
      <div className="p-8 text-gray-400">
        No hay cursos. <Link href="/admin/courses" className="text-primary-400 underline">Crea un curso</Link> para asignar profesores y matricular estudiantes.
      </div>
    );
  }

  const List = ({ type, users }: { type: 'teacher' | 'student'; users: U[] }) => (
    <div className="rounded-2xl border border-white/10 overflow-hidden">
      <div className="flex items-center justify-between bg-white/5 px-4 py-3">
        <h3 className="font-semibold flex items-center gap-2">
          {type === 'teacher' ? <GraduationCap className="w-4 h-4" /> : <Users className="w-4 h-4" />}
          {type === 'teacher' ? 'Profesores' : 'Estudiantes matriculados'} <Badge>{users.length}</Badge>
        </h3>
        <Button onClick={() => { setAdding(type); setPicked([]); setFilter(''); }} className="!py-1">
          <UserPlus className="w-4 h-4" /> {type === 'teacher' ? 'Asignar' : 'Matricular'}
        </Button>
      </div>
      {users.length === 0 ? (
        <p className="p-4 text-sm text-gray-500">{type === 'teacher' ? 'Sin profesor asignado.' : 'Sin estudiantes matriculados.'}</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between border-t border-white/5 px-4 py-2 text-sm">
              <span><span className="font-medium">{u.name}</span> <span className="text-gray-500">{u.email}</span></span>
              <button title="Quitar" onClick={() => setToRemove({ type, user: u })} className="p-2 rounded-lg hover:bg-white/10">
                <UserMinus className="w-4 h-4 text-red-400" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="p-6 lg:p-8">
      <PageHeader title="Asignaciones" subtitle="Asigna profesores a cada curso/materia y matricula a los estudiantes. Un profesor solo puede calificar a los estudiantes matriculados en sus cursos." />
      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 rounded-2xl border border-white/10 p-2 h-fit space-y-1">
          {data.courses.map((c) => (
            <button key={c.id} onClick={() => setCourseId(c.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${c.id === courseId ? 'bg-primary-500/20 text-primary-300' : 'hover:bg-white/5 text-gray-300'}`}>
              <span className="block font-medium">{c.title}</span>
              <span className="block text-xs text-gray-500">{c.teachers.length} prof. · {c.students.length} est.</span>
            </button>
          ))}
        </aside>
        {course && (
          <section className="lg:col-span-3 space-y-6">
            <List type="teacher" users={course.teachers} />
            <List type="student" users={course.students} />
          </section>
        )}
      </div>

      <Modal open={!!adding} title={adding === 'teacher' ? `Asignar profesor a ${course?.title}` : `Matricular estudiantes en ${course?.title}`} onClose={() => setAdding(null)}>
        <Input placeholder="Buscar..." value={filter} onChange={(e) => setFilter(e.target.value)} className="mb-3" />
        <div className="max-h-72 overflow-y-auto space-y-1 mb-4">
          {candidates.length === 0 && (
            <p className="text-sm text-gray-500">
              {adding === 'teacher' ? 'No hay más profesores disponibles (crea usuarios con rol Profesor en Usuarios).' : 'No hay más estudiantes disponibles.'}
            </p>
          )}
          {candidates.map((u) => (
            <label key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer text-sm">
              <input type="checkbox" className="accent-primary-500" checked={picked.includes(u.id)}
                onChange={(e) => setPicked((p) => (e.target.checked ? [...p, u.id] : p.filter((x) => x !== u.id)))} />
              <span><span className="font-medium">{u.name}</span> <span className="text-gray-500">{u.email}</span></span>
            </label>
          ))}
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setAdding(null)}>Cancelar</Button>
          <Button onClick={add} loading={busy}>{adding === 'teacher' ? 'Asignar' : 'Matricular'} ({picked.length})</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!toRemove}
        title={toRemove?.type === 'teacher' ? 'Quitar profesor' : 'Retirar matrícula'}
        message={<>¿Quitar a <b>{toRemove?.user.name}</b> de <b>{course?.title}</b>? Las notas ya registradas se conservan.</>}
        confirmLabel="Quitar"
        onConfirm={remove} onCancel={() => setToRemove(null)} busy={busy}
      />
    </div>
  );
}
