'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/client-auth';
import { AlertTriangle, Award, BookOpen, ClipboardList, Clock, Loader2, Users } from 'lucide-react';
import Navigation from '@/components/Navigation';

type Student = { id: string; name: string; email: string; grado: string | null; definitiva: number | null; fallas: number | null };
type Course = {
  id: string; title: string; category: string; level: string; status: string; students: Student[];
  studentCount: number; gradeCount: number; pending: number; average: number | null; failing: number;
};
type Data = {
  stats: { courses: number; students: number; grades: number; pending: number; average: number | null; failing: number };
  courses: Course[];
  recent: { id: string; student: string; course: string; definitiva: number | null; updatedAt: string }[];
};

const fmt = (n: number | null) => (n === null ? '—' : n.toFixed(1));
const red = (n: number | null) => (n !== null && n < 3 ? 'text-red-400' : '');

export default function TeacherPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = String((session?.user as any)?.role || '').toUpperCase();
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'overview' | 'courses' | 'students'>('overview');

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;
    if (role !== 'TEACHER') { setError('Este panel es solo para profesores.'); return; }
    fetch('/api/teacher', { cache: 'no-store' })
      .then(async (r) => { const j = await r.json(); if (!r.ok) throw new Error(j.error || 'Error'); setData(j); })
      .catch((e) => setError(e.message));
  }, [status, role]);

  const statCards = data ? [
    { label: 'Mis cursos', value: data.stats.courses, icon: BookOpen },
    { label: 'Estudiantes', value: data.stats.students, icon: Users },
    { label: 'Notas registradas', value: data.stats.grades, icon: ClipboardList },
    { label: 'Por calificar', value: data.stats.pending, icon: Clock },
    { label: 'Promedio', value: fmt(data.stats.average), icon: Award },
    { label: 'Notas < 3.0', value: data.stats.failing, icon: AlertTriangle },
  ] : [];

  const allStudents = data
    ? data.courses.flatMap((c) => c.students.map((s) => ({ ...s, course: c.title, courseId: c.id })))
    : [];

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">Panel del Profesor</h1>
            <p className="text-gray-400">{session?.user?.name}</p>
          </div>
          <Link href="/notas" className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 font-medium">
            Calificar estudiantes
          </Link>
        </div>

        {error ? (
          <div className="rounded-2xl border border-white/10 p-8 text-gray-400">{error}</div>
        ) : !data ? (
          <div className="flex items-center gap-3 text-gray-400 py-10"><Loader2 className="w-5 h-5 animate-spin" /> Cargando...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <s.icon className="w-5 h-5 text-primary-400 mb-2" />
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-gray-400">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex gap-2 mb-4">
              {([['overview', 'Resumen'], ['courses', 'Mis Cursos'], ['students', 'Estudiantes']] as const).map(([id, label]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`px-4 py-2 rounded-xl text-sm ${tab === id ? 'bg-primary-500/20 text-primary-300' : 'text-gray-400 hover:bg-white/5'}`}>
                  {label}
                </button>
              ))}
            </div>

            {data.courses.length === 0 ? (
              <div className="rounded-2xl border border-white/10 p-8 text-gray-400">
                Aún no tienes cursos asignados. Un administrador debe asignarte en Admin → Asignaciones.
              </div>
            ) : tab === 'overview' ? (
              <div className="rounded-2xl border border-white/10 overflow-hidden">
                <h2 className="bg-white/5 px-4 py-3 font-semibold">Últimas notas registradas</h2>
                {data.recent.length === 0 ? (
                  <p className="p-4 text-sm text-gray-500">Todavía no has registrado notas.</p>
                ) : (
                  <table className="w-full text-sm">
                    <tbody>
                      {data.recent.map((r) => (
                        <tr key={r.id} className="border-t border-white/5">
                          <td className="p-3">{r.student}</td>
                          <td className="p-3 text-gray-400">{r.course}</td>
                          <td className={`p-3 text-center font-semibold ${red(r.definitiva)}`}>{fmt(r.definitiva)}</td>
                          <td className="p-3 text-right text-gray-500">{new Date(r.updatedAt).toLocaleDateString('es-CO')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            ) : tab === 'courses' ? (
              <div className="grid md:grid-cols-2 gap-4">
                {data.courses.map((c) => (
                  <div key={c.id} className="rounded-2xl border border-white/10 p-5">
                    <h3 className="text-lg font-semibold">{c.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{c.category} · {c.level}</p>
                    <div className="grid grid-cols-4 gap-2 text-center text-sm mb-4">
                      <div><p className="font-bold">{c.studentCount}</p><p className="text-xs text-gray-400">Estudiantes</p></div>
                      <div><p className="font-bold">{c.gradeCount}</p><p className="text-xs text-gray-400">Notas</p></div>
                      <div><p className="font-bold">{c.pending}</p><p className="text-xs text-gray-400">Pendientes</p></div>
                      <div><p className={`font-bold ${red(c.average)}`}>{fmt(c.average)}</p><p className="text-xs text-gray-400">Promedio</p></div>
                    </div>
                    <Link href="/notas" className="text-sm text-primary-400 hover:underline">Calificar →</Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-white/5 text-gray-400 text-left">
                    <tr><th className="p-3">Estudiante</th><th className="p-3">Grado</th><th className="p-3">Curso</th><th className="p-3 text-center">Definitiva</th><th className="p-3 text-center">Fallas</th></tr>
                  </thead>
                  <tbody>
                    {allStudents.length === 0 && <tr><td colSpan={5} className="p-4 text-gray-500">Sin estudiantes matriculados.</td></tr>}
                    {allStudents.map((s) => (
                      <tr key={s.courseId + s.id} className="border-t border-white/5">
                        <td className="p-3"><span className="font-medium">{s.name}</span><br /><span className="text-xs text-gray-500">{s.email}</span></td>
                        <td className="p-3">{s.grado || '—'}</td>
                        <td className="p-3 text-gray-300">{s.course}</td>
                        <td className={`p-3 text-center font-semibold ${red(s.definitiva)}`}>{fmt(s.definitiva)}</td>
                        <td className="p-3 text-center">{s.fallas ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
