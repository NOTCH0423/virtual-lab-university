'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navigation from '@/components/Navigation';
import { can } from '@/lib/roles';
import { AlertTriangle, ArrowLeft, Download, Lock, MessageSquare, Plus, Search, Users, X } from 'lucide-react';

type Student = { id: string; name: string; email: string };
type Grade = {
  id: string;
  studentId: string;
  teacherId: string;
  title: string;
  score: number;
  maxScore: number;
  comment: string | null;
  period: string | null;
  teacher?: { id: string; name: string };
};
type Activity = { title: string; maxScore: number };

function currentPeriod() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() < 6 ? 1 : 2}`;
}

const DEMO_STUDENTS: Student[] = [
  { id: 'demo-1', name: 'Ana María Gómez', email: 'ana.gomez@demo.edu.co' },
  { id: 'demo-2', name: 'Juan Camilo Rojas', email: 'juan.rojas@demo.edu.co' },
  { id: 'demo-3', name: 'Valentina Herrera', email: 'valentina.herrera@demo.edu.co' },
  { id: 'demo-4', name: 'Santiago Martínez', email: 'santiago.martinez@demo.edu.co' },
  { id: 'demo-5', name: 'Laura Sofía Castro', email: 'laura.castro@demo.edu.co' },
];
const DEMO_GRADES = (period: string): Grade[] => {
  const acts = ['Péndulo simple', 'Titulación ácido-base', 'Parcial 1'];
  const scores = [[4.5, 3.8, 4.2], [3.2, 4.0, 3.5], [4.8, 4.6, 4.9], [2.8, 3.1, 3.4], [4.0, 4.4, 3.9]];
  return DEMO_STUDENTS.flatMap((s, i) =>
    acts.map((a, j) => ({ id: `demo-${i}-${j}`, studentId: s.id, teacherId: 'demo', title: a, score: scores[i][j], maxScore: 5, comment: null, period }))
  );
};

const to5 = (g: { score: number; maxScore: number }) => (g.score / g.maxScore) * 5;
const fmt = (v: number | null | undefined) => (v == null || !Number.isFinite(v) ? '—' : v.toFixed(1));
const scoreColor = (v: number | null) => (v == null ? 'text-gray-500' : v >= 4 ? 'text-green-400' : v >= 3 ? 'text-yellow-300' : 'text-red-400');

export default function TeacherGradesPage() {
  const { data: session } = useSession();
  const me = session?.user;
  const isAdmin = can(me?.role, 'grades:manage_all');

  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [extraActivities, setExtraActivities] = useState<Activity[]>([]);
  const [period, setPeriod] = useState(currentPeriod());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [newAct, setNewAct] = useState({ title: '', maxScore: '5' });
  const [showNew, setShowNew] = useState(false);
  const [commentFor, setCommentFor] = useState<{ studentId: string; title: string; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sRes, gRes] = await Promise.all([
        fetch('/api/grades/students'),
        fetch(`/api/grades?period=${encodeURIComponent(period)}`),
      ]);
      if (!sRes.ok || !gRes.ok) throw new Error('api');
      const s = await sRes.json();
      const g = await gRes.json();
      setStudents(s.students ?? []);
      setGrades(g.grades ?? []);
      setDemo(false);
    } catch {
      setStudents(DEMO_STUDENTS);
      setGrades(DEMO_GRADES(period));
      setDemo(true);
    } finally {
      setDrafts({});
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    load();
  }, [load]);

  const activities: Activity[] = useMemo(() => {
    const map = new Map<string, Activity>();
    grades.forEach((g) => { if (!map.has(g.title)) map.set(g.title, { title: g.title, maxScore: g.maxScore }); });
    extraActivities.forEach((a) => { if (!map.has(a.title)) map.set(a.title, a); });
    return Array.from(map.values());
  }, [grades, extraActivities]);

  const gradeMap = useMemo(() => {
    const m = new Map<string, Grade>();
    grades.forEach((g) => m.set(`${g.studentId}::${g.title}`, g));
    return m;
  }, [grades]);

  const visibleStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)) : students;
  }, [students, search]);

  const studentAvg = (id: string) => {
    const gs = grades.filter((g) => g.studentId === id);
    return gs.length ? gs.reduce((a, g) => a + to5(g), 0) / gs.length : null;
  };
  const activityAvg = (title: string) => {
    const gs = grades.filter((g) => g.title === title && visibleStudents.some((s) => s.id === g.studentId));
    return gs.length ? gs.reduce((a, g) => a + to5(g), 0) / gs.length : null;
  };
  const avgs = visibleStudents.map((s) => studentAvg(s.id)).filter((v): v is number => v != null);
  const groupAvg = avgs.length ? avgs.reduce((a, b) => a + b, 0) / avgs.length : null;
  const approved = avgs.filter((v) => v >= 3).length;

  const canEdit = (g?: Grade) => !g || demo || isAdmin || g.teacherId === me?.id;

  const flash = (type: 'ok' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const saveCell = async (student: Student, act: Activity, raw: string, comment?: string | null) => {
    const key = `${student.id}::${act.title}`;
    const existing = gradeMap.get(key);
    const text = raw.trim().replace(',', '.');
    if (text === '' && !existing) return;
    const score = text === '' ? null : Number(text);
    if (score !== null && (!Number.isFinite(score) || score < 0 || score > act.maxScore)) {
      flash('error', `La nota debe estar entre 0 y ${act.maxScore}`);
      return;
    }
    if (existing && score === existing.score && comment === undefined) return;
    if (demo) {
      setGrades((gs) => {
        const rest = gs.filter((g) => !(g.studentId === student.id && g.title === act.title));
        return score === null ? rest : [...rest, { id: existing?.id ?? `demo-${Date.now()}`, studentId: student.id, teacherId: 'demo', title: act.title, score, maxScore: act.maxScore, comment: comment ?? existing?.comment ?? null, period }];
      });
      return;
    }
    setSaving(key);
    try {
      let res: Response;
      if (existing && score === null) {
        res = await fetch(`/api/grades/${existing.id}`, { method: 'DELETE' });
      } else if (existing) {
        res = await fetch(`/api/grades/${existing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score, ...(comment !== undefined ? { comment } : {}) }),
        });
      } else {
        res = await fetch('/api/grades', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ studentId: student.id, title: act.title, score, maxScore: act.maxScore, period, comment: comment ?? null }),
        });
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      setGrades((gs) => {
        const rest = gs.filter((g) => !(g.studentId === student.id && g.title === act.title));
        return data.grade ? [...rest, data.grade] : rest;
      });
      setDrafts((d) => { const n = { ...d }; delete n[key]; return n; });
    } catch (e: any) {
      flash('error', e.message);
    } finally {
      setSaving(null);
    }
  };

  const addActivity = () => {
    const title = newAct.title.trim();
    const maxScore = Number(newAct.maxScore.replace(',', '.')) || 5;
    if (!title) return;
    if (activities.some((a) => a.title.toLowerCase() === title.toLowerCase())) {
      flash('error', 'Ya existe una actividad con ese nombre');
      return;
    }
    setExtraActivities((a) => [...a, { title, maxScore }]);
    setNewAct({ title: '', maxScore: '5' });
    setShowNew(false);
    flash('ok', `Actividad "${title}" agregada. Escribe las notas en la nueva columna.`);
  };

  const exportCsv = () => {
    const head = ['Estudiante', 'Correo', ...activities.map((a) => `${a.title} (/${a.maxScore})`), 'Promedio (0-5)'];
    const rows = visibleStudents.map((s) => [
      s.name,
      s.email,
      ...activities.map((a) => { const g = gradeMap.get(`${s.id}::${a.title}`); return g ? String(g.score).replace('.', ',') : ''; }),
      fmt(studentAvg(s.id)).replace('.', ','),
    ]);
    const csv = '\uFEFF' + [head, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `notas-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link href="/teacher" className="p-2 rounded-lg hover:bg-white/10" aria-label="Volver al panel">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">Gestión de notas</h1>
              <p className="text-gray-400">Escala de 0,0 a 5,0 · aprobado desde 3,0</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setShowNew((v) => !v)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 font-medium">
              <Plus className="w-4 h-4" /> Nueva actividad
            </button>
            <button onClick={exportCsv} disabled={!visibleStudents.length} className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 disabled:opacity-40">
              <Download className="w-4 h-4" /> Exportar CSV
            </button>
          </div>
        </div>

        {demo && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-amber-300">Modo demostración</p>
              <p className="text-amber-200/80">No se pudo conectar con la base de datos. Se muestran estudiantes de ejemplo y los cambios no se guardan.</p>
            </div>
          </div>
        )}
        {message && (
          <div className={`mb-4 p-3 rounded-xl text-sm ${message.type === 'ok' ? 'bg-green-500/10 text-green-300 border border-green-500/20' : 'bg-red-500/10 text-red-300 border border-red-500/20'}`}>
            {message.text}
          </div>
        )}

        {showNew && (
          <div className="mb-6 glass-dark rounded-2xl p-4 flex flex-wrap items-end gap-3">
            <label className="flex-1 min-w-[220px]">
              <span className="block text-sm text-gray-400 mb-1">Nombre de la actividad</span>
              <input value={newAct.title} onChange={(e) => setNewAct({ ...newAct, title: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && addActivity()} placeholder="Ej: Laboratorio de péndulo" className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none" />
            </label>
            <label className="w-32">
              <span className="block text-sm text-gray-400 mb-1">Nota máxima</span>
              <input value={newAct.maxScore} onChange={(e) => setNewAct({ ...newAct, maxScore: e.target.value })} className="w-full px-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none" />
            </label>
            <button onClick={addActivity} className="px-4 py-2 rounded-xl bg-primary-500 font-medium">Agregar</button>
          </div>
        )}

        <div className="grid sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Estudiantes', value: String(visibleStudents.length) },
            { label: 'Actividades', value: String(activities.length) },
            { label: 'Promedio del grupo', value: fmt(groupAvg) },
            { label: 'Aprobando (≥ 3,0)', value: avgs.length ? `${approved} / ${avgs.length}` : '—' },
          ].map((c) => (
            <div key={c.label} className="glass-dark rounded-2xl p-4">
              <p className="text-sm text-gray-400">{c.label}</p>
              <p className="text-2xl font-bold mt-1">{c.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar estudiante por nombre o correo" className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-400">
            Periodo
            <input value={period} onChange={(e) => setPeriod(e.target.value)} className="w-28 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-primary-500 focus:outline-none" />
          </label>
        </div>

        <div className="glass-dark rounded-2xl overflow-x-auto">
          {loading ? (
            <div className="p-12 flex justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
          ) : visibleStudents.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-50" />
              {students.length === 0 ? 'Aún no hay estudiantes registrados.' : 'Ningún estudiante coincide con la búsqueda.'}
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-4 py-3 font-medium sticky left-0 bg-slate-900 min-w-[220px]">Estudiante</th>
                  {activities.map((a) => (
                    <th key={a.title} className="px-3 py-3 font-medium text-center min-w-[120px]">
                      <span className="block truncate max-w-[160px] mx-auto" title={a.title}>{a.title}</span>
                      <span className="text-xs text-gray-500">/ {a.maxScore} · prom. {fmt(activityAvg(a.title))}</span>
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium text-center">Promedio</th>
                </tr>
              </thead>
              <tbody>
                {visibleStudents.map((s) => {
                  const avg = studentAvg(s.id);
                  return (
                    <tr key={s.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-2 sticky left-0 bg-slate-900">
                        <p className="font-medium">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.email}</p>
                      </td>
                      {activities.map((a) => {
                        const key = `${s.id}::${a.title}`;
                        const g = gradeMap.get(key);
                        const editable = canEdit(g);
                        const value = drafts[key] ?? (g ? String(g.score) : '');
                        return (
                          <td key={a.title} className="px-3 py-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                value={value}
                                disabled={!editable || saving === key}
                                inputMode="decimal"
                                aria-label={`Nota de ${s.name} en ${a.title}`}
                                onChange={(e) => setDrafts((d) => ({ ...d, [key]: e.target.value }))}
                                onBlur={(e) => saveCell(s, a, e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
                                className={`w-16 px-2 py-1 text-center rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none font-mono ${scoreColor(g ? to5(g) : null)} disabled:opacity-60`}
                              />
                              {editable ? (
                                <button
                                  onClick={() => setCommentFor({ studentId: s.id, title: a.title, text: g?.comment ?? '' })}
                                  disabled={!g}
                                  title={g?.comment || 'Agregar comentario'}
                                  className={`p-1 rounded hover:bg-white/10 disabled:opacity-20 ${g?.comment ? 'text-primary-400' : 'text-gray-500'}`}
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </button>
                              ) : (
                                <span title={`Registrada por ${g?.teacher?.name ?? 'otro profesor'}`}><Lock className="w-3.5 h-3.5 text-gray-500" /></span>
                              )}
                            </div>
                          </td>
                        );
                      })}
                      <td className={`px-4 py-2 text-center font-mono font-semibold ${scoreColor(avg)}`}>{fmt(avg)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && visibleStudents.length > 0 && activities.length === 0 && (
            <p className="p-6 text-center text-gray-400 text-sm">No hay actividades en este periodo. Usa «Nueva actividad» para crear la primera columna.</p>
          )}
        </div>

        {commentFor && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setCommentFor(null)}>
            <div className="glass-dark rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Comentario · {commentFor.title}</h3>
                <button onClick={() => setCommentFor(null)} className="p-1 rounded hover:bg-white/10"><X className="w-4 h-4" /></button>
              </div>
              <textarea value={commentFor.text} onChange={(e) => setCommentFor({ ...commentFor, text: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none" placeholder="Retroalimentación para el estudiante" />
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => setCommentFor(null)} className="px-4 py-2 rounded-xl glass">Cancelar</button>
                <button
                  onClick={async () => {
                    const s = students.find((x) => x.id === commentFor.studentId);
                    const a = activities.find((x) => x.title === commentFor.title);
                    const g = gradeMap.get(`${commentFor.studentId}::${commentFor.title}`);
                    if (s && a && g) await saveCell(s, a, String(g.score), commentFor.text.trim() || null);
                    setCommentFor(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-primary-500 font-medium"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
