'use client';

import { useEffect, useState } from 'react';
import { GraduationCap, MessageSquare } from 'lucide-react';

type Grade = {
  id: string;
  title: string;
  score: number;
  maxScore: number;
  comment: string | null;
  period: string | null;
  createdAt: string;
  teacher?: { name: string };
  course?: { title: string } | null;
};

const to5 = (g: Grade) => (g.score / g.maxScore) * 5;
const color = (v: number) => (v >= 4 ? 'text-green-400' : v >= 3 ? 'text-yellow-300' : 'text-red-400');

/** Sección de solo lectura «Mis notas» para el estudiante. */
export default function MyGrades() {
  const [grades, setGrades] = useState<Grade[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/grades')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setGrades(d.grades ?? []))
      .catch(() => { setError(true); setGrades([]); });
  }, []);

  const periods = Array.from(new Set((grades ?? []).map((g) => g.period ?? 'Sin periodo'))).sort().reverse();
  const avg = (gs: Grade[]) => (gs.length ? gs.reduce((a, g) => a + to5(g), 0) / gs.length : null);

  return (
    <section className="mt-8 glass-dark rounded-2xl p-6" aria-labelledby="mis-notas">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-primary-400" />
        <h2 id="mis-notas" className="text-xl font-semibold">Mis notas</h2>
      </div>
      {grades === null ? (
        <p className="text-gray-400 text-sm">Cargando…</p>
      ) : error ? (
        <p className="text-gray-400 text-sm">No se pudieron cargar tus notas en este momento.</p>
      ) : grades.length === 0 ? (
        <p className="text-gray-400 text-sm">Aún no tienes notas registradas.</p>
      ) : (
        <div className="space-y-6">
          {periods.map((p) => {
            const gs = grades.filter((g) => (g.period ?? 'Sin periodo') === p);
            const a = avg(gs);
            return (
              <div key={p}>
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="font-medium">Periodo {p}</h3>
                  {a != null && <span className="text-sm text-gray-400">Promedio: <span className={`font-mono font-semibold ${color(a)}`}>{a.toFixed(1)}</span> / 5,0</span>}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-400 border-b border-white/10">
                      <th className="py-2 font-normal">Actividad</th>
                      <th className="py-2 font-normal hidden sm:table-cell">Profesor</th>
                      <th className="py-2 font-normal text-right">Nota</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gs.map((g) => (
                      <tr key={g.id} className="border-b border-white/5 align-top">
                        <td className="py-2">
                          {g.title}
                          {g.comment && (
                            <p className="text-xs text-gray-400 mt-1 flex gap-1"><MessageSquare className="w-3 h-3 mt-0.5 shrink-0" />{g.comment}</p>
                          )}
                        </td>
                        <td className="py-2 text-gray-400 hidden sm:table-cell">{g.teacher?.name ?? '—'}</td>
                        <td className={`py-2 text-right font-mono ${color(to5(g))}`}>{g.score.toFixed(1)} / {g.maxScore}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
