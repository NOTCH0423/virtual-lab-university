'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from '@/lib/client-auth';
import { useRouter } from 'next/navigation';
import { Edit2, Plus, Printer, Save, Search, Trash2, X } from 'lucide-react';
import Navigation from '@/components/Navigation';
import {
  api, Button, ConfirmDialog, Field, Input, Modal, Select, Spinner, ToastProvider, useToast,
} from '@/components/admin/ui';

type Profile = {
  identificacion?: string | null; situacion?: string | null; jornada?: string | null;
  horario?: string | null; ubicacionSemestral?: string | null; periodo?: string | null;
};
type Subject = {
  id: string; descripcion: string; notaFinal: number | null; courseId?: string | null;
  habilitacion: number | null; definitiva: number | null; fallas: number; periodo?: string | null;
  course?: { id: string; title: string } | null; teacher?: { id: string; name: string } | null;
};
type NotasData = {
  id: string; name: string; email: string;
  academicProfile: Profile | null; subjectGrades: Subject[]; canEdit: boolean; canEditProfile: boolean;
  gradableCourses: { id: string; title: string }[]; isAdmin: boolean;
};
type StudentRow = {
  id: string; name: string; email: string;
  academicProfile: { identificacion: string | null; ubicacionSemestral: string | null } | null;
  enrollments: { course: { id: string; title: string } }[];
};

const PROFILE_LABELS: [keyof Profile, string][] = [
  ['identificacion', 'Identificación'], ['ubicacionSemestral', 'Grado'], ['situacion', 'Situación'],
  ['jornada', 'Jornada'], ['horario', 'Horario'], ['periodo', 'Periodo'],
];
const PASS = 3.0;
const fmt = (n: number | null | undefined) => (n === null || n === undefined ? '' : n.toFixed(1));
const gradeCls = (n: number | null | undefined) =>
  n === null || n === undefined ? '' : n < PASS ? 'text-red-500 font-semibold' : '';
const emptySubject = { courseId: '', notaFinal: '', habilitacion: '', definitiva: '', fallas: '0', periodo: '' };

function NotasInner() {
  const toast = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = String((session?.user as any)?.role || '').toUpperCase();
  const isStaff = ['TEACHER', 'ADMIN', 'SUPER_ADMIN'].includes(role);

  const [students, setStudents] = useState<StudentRow[]>([]);
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<NotasData | null>(null);
  const [loading, setLoading] = useState(true);

  const [editProfile, setEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<Record<string, string>>({});
  const [subjectForm, setSubjectForm] = useState<Record<string, string> | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Subject | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (status === 'unauthenticated') router.push('/login'); }, [status, router]);

  const loadStudents = useCallback(async () => {
    try {
      setStudents(await api<StudentRow[]>(`/api/notas?students=1&q=${encodeURIComponent(q)}`));
    } catch (e: any) { toast('error', e.message); }
  }, [q, toast]);

  useEffect(() => {
    if (status !== 'authenticated' || !isStaff) return;
    const t = setTimeout(loadStudents, 300);
    return () => clearTimeout(t);
  }, [status, isStaff, loadStudents]);

  const loadNotas = useCallback(async () => {
    if (status !== 'authenticated') return;
    if (isStaff && !selected) { setData(null); setLoading(false); return; }
    setLoading(true);
    try {
      setData(await api<NotasData>(`/api/notas${isStaff && selected ? `?userId=${selected}` : ''}`));
    } catch (e: any) { toast('error', e.message); }
    finally { setLoading(false); }
  }, [status, isStaff, selected, toast]);

  useEffect(() => { loadNotas(); }, [loadNotas]);

  const p = data?.academicProfile || {};
  const subjects = data?.subjectGrades || [];
  const graded = subjects.filter((s) => s.definitiva !== null);
  const promedio = graded.length ? graded.reduce((a, s) => a + (s.definitiva as number), 0) / graded.length : null;
  const courses = data?.gradableCourses || [];

  const openProfile = () => {
    const f: Record<string, string> = {};
    for (const [k] of PROFILE_LABELS) f[k] = (p as any)[k] ?? '';
    setProfileForm(f); setEditProfile(true);
  };
  const saveProfile = async () => {
    setBusy(true);
    try {
      await api('/api/notas/profile', { method: 'PUT', json: { userId: data!.id, ...profileForm } });
      toast('success', 'Datos académicos guardados'); setEditProfile(false); loadNotas();
    } catch (e: any) { toast('error', e.message); } finally { setBusy(false); }
  };

  const openSubject = (s?: Subject) => {
    if (s) {
      setEditingId(s.id);
      setSubjectForm({
        courseId: s.courseId || '',
        notaFinal: s.notaFinal?.toString() ?? '', habilitacion: s.habilitacion?.toString() ?? '',
        definitiva: s.definitiva?.toString() ?? '', fallas: String(s.fallas ?? 0), periodo: s.periodo ?? '',
      });
    } else {
      if (!courses.length) return toast('error', 'El estudiante no está matriculado en ningún curso que puedas calificar');
      setEditingId(null); setSubjectForm({ ...emptySubject, courseId: courses[0].id, periodo: p.periodo || '' });
    }
  };
  const validateSubject = (f: Record<string, string>) => {
    if (!editingId && !f.courseId) return 'Selecciona la materia/curso';
    for (const [k, l] of [['notaFinal', 'Nota final'], ['habilitacion', 'Habilitación'], ['definitiva', 'Definitiva']]) {
      if (f[k] !== '') { const n = Number(f[k].replace(',', '.')); if (!(n >= 0 && n <= 5)) return `${l} debe estar entre 0 y 5`; }
    }
    for (const [k, l] of [['fallas', 'Fallas']]) {
      if (f[k] !== '' && !(Number.isInteger(Number(f[k])) && Number(f[k]) >= 0)) return `${l} debe ser un entero ≥ 0`;
    }
    return null;
  };
  const saveSubject = async () => {
    if (!subjectForm) return;
    const err = validateSubject(subjectForm);
    if (err) return toast('error', err);
    const f = { ...subjectForm };
    // Si no se indica Definitiva, se calcula: habilitación (si existe) o nota final.
    if (f.definitiva === '' && (f.habilitacion !== '' || f.notaFinal !== '')) f.definitiva = f.habilitacion !== '' ? f.habilitacion : f.notaFinal;
    const payload: any = { ...f };
    if (editingId && !data?.isAdmin) delete payload.courseId;
    if (!payload.courseId) delete payload.courseId;
    for (const k of ['notaFinal', 'habilitacion', 'definitiva']) payload[k] = f[k] === '' ? null : f[k].replace(',', '.');
    setBusy(true);
    try {
      if (editingId) await api(`/api/notas/subjects/${editingId}`, { method: 'PATCH', json: payload });
      else await api('/api/notas/subjects', { method: 'POST', json: { userId: data!.id, ...payload } });
      toast('success', editingId ? 'Nota actualizada' : 'Nota registrada');
      setSubjectForm(null); loadNotas(); if (isStaff) loadStudents();
    } catch (e: any) { toast('error', e.message); } finally { setBusy(false); }
  };
  const doDelete = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await api(`/api/notas/subjects/${toDelete.id}`, { method: 'DELETE' });
      toast('success', 'Nota eliminada'); setToDelete(null); loadNotas(); if (isStaff) loadStudents();
    } catch (e: any) { toast('error', e.message); } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="no-print"><Navigation /></div>
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto print:pt-0">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Consultar Notas Actuales</h1>
            <p className="text-gray-400 no-print">
              {isStaff ? 'Selecciona un estudiante de tus cursos para consultar o registrar sus notas' : 'Tus calificaciones en todas las materias'}
            </p>
          </div>
          {data && (
            <Button variant="ghost" onClick={() => window.print()} className="no-print">
              <Printer className="w-4 h-4" /> Imprimir
            </Button>
          )}
        </div>

        <div className={isStaff ? 'grid lg:grid-cols-4 gap-6' : ''}>
          {isStaff && (
            <aside className="no-print lg:col-span-1 rounded-2xl border border-white/10 p-4 h-fit lg:sticky lg:top-24">
              <div className="relative mb-3">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <Input placeholder="Buscar estudiante" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
              </div>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                {students.length === 0 && <p className="text-sm text-gray-500 px-2">{role === 'TEACHER' ? 'No tienes estudiantes matriculados en tus cursos.' : 'Sin estudiantes'}</p>}
                {students.map((s) => (
                  <button key={s.id} onClick={() => setSelected(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selected === s.id ? 'bg-primary-500/20 text-primary-300' : 'hover:bg-white/5 text-gray-300'}`}>
                    <span className="block font-medium truncate">{s.name}</span>
                    <span className="block text-xs text-gray-500 truncate">
                      {s.academicProfile?.ubicacionSemestral ? `Grado ${s.academicProfile.ubicacionSemestral} · ` : ''}
                      {s.enrollments.map((e) => e.course.title).join(', ') || s.email}
                    </span>
                  </button>
                ))}
              </div>
            </aside>
          )}

          <section className={isStaff ? 'lg:col-span-3' : ''}>
            {loading ? (
              <Spinner />
            ) : !data ? (
              <div className="rounded-2xl border border-white/10 p-10 text-center text-gray-400">Selecciona un estudiante de la lista.</div>
            ) : (
              <div className="space-y-6 print-area">
                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between bg-white/5 px-4 py-2">
                    <h2 className="font-semibold">Información del estudiante</h2>
                    {data.canEditProfile && (
                      <Button variant="ghost" onClick={openProfile} className="no-print !py-1"><Edit2 className="w-4 h-4" /> Editar</Button>
                    )}
                  </div>
                  <dl className="grid sm:grid-cols-2 text-sm">
                    <div className="flex border-t border-white/5 px-4 py-2"><dt className="w-44 text-gray-400">Nombre</dt><dd className="font-medium">{data.name}</dd></div>
                    {PROFILE_LABELS.map(([k, l]) => (
                      <div key={k} className="flex border-t border-white/5 px-4 py-2">
                        <dt className="w-44 text-gray-400">{l}</dt>
                        <dd className="font-medium">{(p as any)[k] || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="rounded-2xl border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between bg-white/5 px-4 py-2">
                    <h2 className="font-semibold">Materias</h2>
                    {data.canEdit && (
                      <Button onClick={() => openSubject()} className="no-print !py-1"><Plus className="w-4 h-4" /> Registrar nota</Button>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-gray-400 text-left">
                        <tr className="border-t border-white/5">
                          <th className="p-3">Materia</th><th className="p-3">Profesor</th>
                          <th className="p-3 text-center">Nota Final</th>
                          <th className="p-3 text-center">Habilitación</th><th className="p-3 text-center">Definitiva</th>
                          <th className="p-3 text-center">Fallas</th>
                          {data.canEdit && <th className="p-3 text-right no-print">Acciones</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {subjects.length === 0 && (
                          <tr><td colSpan={data.canEdit ? 7 : 6} className="p-6 text-center text-gray-500">No hay notas registradas.</td></tr>
                        )}
                        {subjects.map((s) => (
                          <tr key={s.id} className="border-t border-white/5">
                            <td className="p-3">{s.course?.title || s.descripcion}</td>
                            <td className="p-3 text-gray-300">{s.teacher?.name || '—'}</td>
                            <td className={`p-3 text-center ${gradeCls(s.notaFinal)}`}>{fmt(s.notaFinal)}</td>
                            <td className={`p-3 text-center ${gradeCls(s.habilitacion)}`}>{fmt(s.habilitacion)}</td>
                            <td className={`p-3 text-center font-semibold ${gradeCls(s.definitiva)}`}>{fmt(s.definitiva)}</td>
                            <td className="p-3 text-center">{s.fallas}</td>
                            {data.canEdit && (
                              <td className="p-3 no-print">
                                <div className="flex justify-end gap-1">
                                  <button title="Editar" onClick={() => openSubject(s)} className="p-2 rounded-lg hover:bg-white/10"><Edit2 className="w-4 h-4" /></button>
                                  <button title="Eliminar" onClick={() => setToDelete(s)} className="p-2 rounded-lg hover:bg-white/10"><Trash2 className="w-4 h-4 text-red-400" /></button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      {subjects.length > 0 && (
                        <tfoot>
                          <tr className="border-t border-white/10 bg-white/5">
                            <td className="p-3" colSpan={2}>Promedio ({graded.length} materia{graded.length === 1 ? '' : 's'})</td>
                            <td colSpan={2} />
                            <td className={`p-3 text-center font-semibold ${gradeCls(promedio)}`}>{promedio === null ? '' : promedio.toFixed(2)}</td>
                            <td colSpan={data.canEdit ? 2 : 1} />
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Escala 0.0 – 5.0. Notas inferiores a {PASS.toFixed(1)} se muestran en rojo.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Modal open={editProfile} title="Datos académicos" onClose={() => setEditProfile(false)} wide>
        <form className="grid md:grid-cols-2 gap-4" onSubmit={(e) => { e.preventDefault(); saveProfile(); }}>
          {PROFILE_LABELS.map(([k, l]) => (
            <Field key={k} label={l}>
              <Input value={profileForm[k] ?? ''} onChange={(e) => setProfileForm({ ...profileForm, [k]: e.target.value })} />
            </Field>
          ))}
          <div className="md:col-span-2 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setEditProfile(false)}><X className="w-4 h-4" /> Cancelar</Button>
            <Button type="submit" loading={busy}><Save className="w-4 h-4" /> Guardar</Button>
          </div>
        </form>
      </Modal>

      <Modal open={!!subjectForm} title={editingId ? 'Editar nota' : 'Registrar nota'} onClose={() => setSubjectForm(null)} wide>
        {subjectForm && (
          <form className="grid md:grid-cols-4 gap-4" onSubmit={(e) => { e.preventDefault(); saveSubject(); }}>
            <div className="md:col-span-4">
              <Field label="Materia / Curso *" hint={editingId && !data?.isAdmin ? 'La materia no se puede cambiar' : 'Solo cursos en los que el estudiante está matriculado'}>
                <Select
                  value={subjectForm.courseId}
                  disabled={!!editingId && !data?.isAdmin}
                  onChange={(e) => setSubjectForm({ ...subjectForm, courseId: e.target.value })}
                  options={[
                    ...(editingId && !subjectForm.courseId ? [{ value: '', label: '(sin curso asignado)' }] : []),
                    ...courses.map((c) => ({ value: c.id, label: c.title })),
                    ...(subjectForm.courseId && !courses.some((c) => c.id === subjectForm.courseId)
                      ? [{ value: subjectForm.courseId, label: subjects.find((x) => x.courseId === subjectForm.courseId)?.course?.title || 'Curso actual' }] : []),
                  ]}
                />
              </Field>
            </div>
            {([['notaFinal', 'Nota Final (0–5)', '0.1'], ['habilitacion', 'Habilitación (0–5)', '0.1'], ['definitiva', 'Definitiva (0–5)', '0.1'], ['fallas', 'Fallas', '1']] as const).map(([k, l, step]) => (
              <Field key={k} label={l} hint={k === 'definitiva' ? 'Vacío = se calcula' : undefined}>
                <Input type="number" min={0} max={k === 'fallas' ? undefined : 5} step={step}
                  value={subjectForm[k]} onChange={(e) => setSubjectForm({ ...subjectForm, [k]: e.target.value })} />
              </Field>
            ))}
            <Field label="Periodo"><Input value={subjectForm.periodo} onChange={(e) => setSubjectForm({ ...subjectForm, periodo: e.target.value })} placeholder="2026-2" /></Field>
            <div className="md:col-span-4 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setSubjectForm(null)}>Cancelar</Button>
              <Button type="submit" loading={busy}>{editingId ? 'Guardar' : 'Agregar'}</Button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar materia"
        message={<>¿Eliminar la nota de <b>{toDelete?.course?.title || toDelete?.descripcion}</b> de las notas de {data?.name}?</>}
        onConfirm={doDelete} onCancel={() => setToDelete(null)} busy={busy}
      />
    </div>
  );
}

export default function NotasPage() {
  return (
    <ToastProvider>
      <NotasInner />
    </ToastProvider>
  );
}
