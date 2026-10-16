'use client';

import { useEffect, useState } from 'react';
import { Sparkles, X, RefreshCw, Wand2, Save, Send, Plus, Trash2 } from 'lucide-react';

type Param = { name: string; unit: string; min: number; max: number; default: number; description: string };
type Question = { question: string; options: string[]; answerIndex: number; explanation: string };
type Draft = {
  title: string; description: string; category: string; difficulty: string; duration: number;
  objectives: string[]; theory: string; formulas: string; materials: string[]; procedure: string[];
  parameters: Param[]; expectedResults: string; safety: string[]; questions: Question[];
};

const CATS = [['FISICA', 'Física'], ['QUIMICA', 'Química'], ['BIOLOGIA', 'Biología'], ['INGENIERIA', 'Ingeniería'], ['MATEMATICAS', 'Matemáticas']];
const LEVELS = [['BASICO', 'Básico'], ['INTERMEDIO', 'Intermedio'], ['AVANZADO', 'Avanzado']];
const inp = 'w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 focus:border-primary-500 focus:outline-none text-sm';
const lbl = 'block text-xs font-medium text-gray-400 mb-1';
const lines = (a: string[]) => a.join('\n');
const unlines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

async function call(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, headers: { 'content-type': 'application/json', ...(init?.headers || {}) } });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error || `Error ${res.status}`);
  return d;
}

export function AiExperimentButton({ onSaved, defaultLabId, className }: { onSaved?: () => void; defaultLabId?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} data-testid="ai-create"
        className={className || 'flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-primary-500 text-white text-sm font-medium hover:opacity-90'}>
        <Sparkles className="w-4 h-4" /> Crear con IA
      </button>
      {open && <AiExperimentModal onClose={() => setOpen(false)} onSaved={() => { onSaved?.(); }} defaultLabId={defaultLabId} />}
    </>
  );
}

function AiExperimentModal({ onClose, onSaved, defaultLabId }: { onClose: () => void; onSaved: () => void; defaultLabId?: string }) {
  const [labs, setLabs] = useState<{ id: string; title: string }[]>([]);
  const [labId, setLabId] = useState(defaultLabId || '');
  const [prompt, setPrompt] = useState('');
  const [grade, setGrade] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [refine, setRefine] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState<'' | 'gen' | 'save'>('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    call('/api/experiments/ai/save').then((d) => { setLabs(d.labs); setLabId((v) => v || d.labs[0]?.id || ''); })
      .catch((e) => setMsg({ ok: false, text: e.message }));
  }, []);

  const generate = async (mode: 'new' | 'refine') => {
    setBusy('gen'); setMsg(null);
    try {
      const d = await call('/api/experiments/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ prompt, laboratoryId: labId || undefined, gradeLevel: grade, difficulty, ...(mode === 'refine' && draft ? { previous: draft, refine } : {}) }),
      });
      setDraft(d.draft); if (mode === 'refine') setRefine('');
      setMsg({ ok: true, text: mode === 'refine' ? 'Borrador ajustado. Revísalo antes de guardar.' : 'Borrador generado. Revísalo y edítalo antes de guardar.' });
    } catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setBusy(''); }
  };

  const save = async (status: 'DRAFT' | 'PUBLISHED') => {
    if (!draft) return;
    setBusy('save'); setMsg(null);
    try {
      const r = await call('/api/experiments/ai/save', { method: 'POST', body: JSON.stringify({ draft, laboratoryId: labId, status }) });
      setMsg({ ok: true, text: status === 'PUBLISHED' ? `Publicado: “${r.title}”` : `Guardado como borrador: “${r.title}”` });
      onSaved();
    } catch (e: any) { setMsg({ ok: false, text: e.message }); } finally { setBusy(''); }
  };

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => (d ? { ...d, [k]: v } : d));
  const setParam = (i: number, k: keyof Param, v: any) => set('parameters', draft!.parameters.map((p, j) => (j === i ? { ...p, [k]: v } : p)));
  const setQ = (i: number, patch: Partial<Question>) => set('questions', draft!.questions.map((q, j) => (j === i ? { ...q, ...patch } : q)));

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 flex items-start justify-center p-4 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="w-full max-w-4xl bg-slate-900 border border-white/10 rounded-2xl my-8">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-lg font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-400" /> Crear experimento con IA</h2>
          <button onClick={onClose} aria-label="Cerrar" className="p-2 rounded-lg hover:bg-white/10"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className={lbl}>Describe el experimento</label>
            <textarea className={inp} rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} maxLength={2000} data-testid="ai-prompt"
              placeholder="Ej.: Un experimento para medir la aceleración de la gravedad con un péndulo simple, variando la longitud de la cuerda." />
          </div>
          <div className="grid md:grid-cols-3 gap-3">
            <div>
              <label className={lbl}>Laboratorio</label>
              <select className={inp} value={labId} onChange={(e) => setLabId(e.target.value)}>
                {labs.map((l) => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Grado / nivel (opcional)</label>
              <input className={inp} value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="Ej.: 10.º grado" />
            </div>
            <div>
              <label className={lbl}>Dificultad (opcional)</label>
              <select className={inp} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="">Automática</option>
                {LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={busy !== '' || prompt.trim().length < 10} onClick={() => generate('new')} data-testid="ai-generate"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-sm font-medium disabled:opacity-50">
              {busy === 'gen' ? <RefreshCw className="w-4 h-4 animate-spin" /> : draft ? <RefreshCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {busy === 'gen' ? 'Generando…' : draft ? 'Regenerar' : 'Generar'}
            </button>
          </div>
          {msg && <p role="status" className={`text-sm px-3 py-2 rounded-lg ${msg.ok ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>{msg.text}</p>}

          {draft && (
            <div className="space-y-4 border-t border-white/10 pt-4" data-testid="ai-preview">
              <div className="grid md:grid-cols-4 gap-3">
                <div className="md:col-span-4"><label className={lbl}>Título</label><input className={inp} value={draft.title} onChange={(e) => set('title', e.target.value)} /></div>
                <div className="md:col-span-4"><label className={lbl}>Descripción</label><textarea className={inp} rows={2} value={draft.description} onChange={(e) => set('description', e.target.value)} /></div>
                <div><label className={lbl}>Categoría</label><select className={inp} value={draft.category} onChange={(e) => set('category', e.target.value)}>{CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
                <div><label className={lbl}>Dificultad</label><select className={inp} value={draft.difficulty} onChange={(e) => set('difficulty', e.target.value)}>{LEVELS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
                <div><label className={lbl}>Duración (min)</label><input type="number" className={inp} value={draft.duration} onChange={(e) => set('duration', Number(e.target.value))} /></div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div><label className={lbl}>Objetivos (uno por línea)</label><textarea className={inp} rows={4} value={lines(draft.objectives)} onChange={(e) => set('objectives', unlines(e.target.value))} /></div>
                <div><label className={lbl}>Materiales (uno por línea)</label><textarea className={inp} rows={4} value={lines(draft.materials)} onChange={(e) => set('materials', unlines(e.target.value))} /></div>
              </div>
              <div><label className={lbl}>Teoría</label><textarea className={inp} rows={6} value={draft.theory} onChange={(e) => set('theory', e.target.value)} /></div>
              <div><label className={lbl}>Fórmulas</label><textarea className={inp} rows={2} value={draft.formulas} onChange={(e) => set('formulas', e.target.value)} /></div>
              <div><label className={lbl}>Procedimiento (un paso por línea)</label><textarea className={inp} rows={6} value={lines(draft.procedure)} onChange={(e) => set('procedure', unlines(e.target.value))} /></div>
              <div>
                <div className="flex items-center justify-between mb-1"><span className={lbl}>Parámetros ajustables</span>
                  <button type="button" className="text-xs text-primary-400 flex items-center gap-1" onClick={() => set('parameters', [...draft.parameters, { name: '', unit: '', min: 0, max: 10, default: 5, description: '' }])}><Plus className="w-3 h-3" /> Añadir</button></div>
                <div className="space-y-2">
                  {draft.parameters.map((p, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <input className={`${inp} col-span-3`} value={p.name} onChange={(e) => setParam(i, 'name', e.target.value)} placeholder="Nombre" />
                      <input className={`${inp} col-span-1`} value={p.unit} onChange={(e) => setParam(i, 'unit', e.target.value)} placeholder="Unidad" />
                      <input type="number" className={`${inp} col-span-1`} value={p.min} onChange={(e) => setParam(i, 'min', Number(e.target.value))} title="Mín" />
                      <input type="number" className={`${inp} col-span-1`} value={p.max} onChange={(e) => setParam(i, 'max', Number(e.target.value))} title="Máx" />
                      <input type="number" className={`${inp} col-span-1`} value={p.default} onChange={(e) => setParam(i, 'default', Number(e.target.value))} title="Inicial" />
                      <input className={`${inp} col-span-4`} value={p.description} onChange={(e) => setParam(i, 'description', e.target.value)} placeholder="Descripción" />
                      <button type="button" className="col-span-1 p-2 text-red-400" aria-label="Quitar parámetro" onClick={() => set('parameters', draft.parameters.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div><label className={lbl}>Resultados esperados</label><textarea className={inp} rows={4} value={draft.expectedResults} onChange={(e) => set('expectedResults', e.target.value)} /></div>
                <div><label className={lbl}>Precauciones (una por línea)</label><textarea className={inp} rows={4} value={lines(draft.safety)} onChange={(e) => set('safety', unlines(e.target.value))} /></div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1"><span className={lbl}>Preguntas de evaluación (marca la correcta)</span>
                  <button type="button" className="text-xs text-primary-400 flex items-center gap-1" onClick={() => set('questions', [...draft.questions, { question: '', options: ['', ''], answerIndex: 0, explanation: '' }])}><Plus className="w-3 h-3" /> Añadir</button></div>
                <div className="space-y-3">
                  {draft.questions.map((q, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 space-y-2">
                      <div className="flex gap-2">
                        <input className={inp} value={q.question} onChange={(e) => setQ(i, { question: e.target.value })} placeholder={`Pregunta ${i + 1}`} />
                        <button type="button" className="p-2 text-red-400" aria-label="Quitar pregunta" onClick={() => set('questions', draft.questions.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4" /></button>
                      </div>
                      {q.options.map((o, k) => (
                        <label key={k} className="flex items-center gap-2 text-sm">
                          <input type="radio" name={`q${i}`} checked={q.answerIndex === k} onChange={() => setQ(i, { answerIndex: k })} />
                          <input className={inp} value={o} onChange={(e) => setQ(i, { options: q.options.map((x, m) => (m === k ? e.target.value : x)) })} />
                        </label>
                      ))}
                      <input className={inp} value={q.explanation} onChange={(e) => setQ(i, { explanation: e.target.value })} placeholder="Explicación" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col md:flex-row gap-2 border-t border-white/10 pt-4">
                <input className={inp} value={refine} onChange={(e) => setRefine(e.target.value)} placeholder="Pide un ajuste a la IA: p. ej. “hazlo más sencillo y añade una pregunta sobre errores de medición”" />
                <button type="button" disabled={busy !== '' || refine.trim().length < 3} onClick={() => generate('refine')}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm whitespace-nowrap disabled:opacity-50"><Wand2 className="w-4 h-4" /> Refinar</button>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" disabled={busy !== '' || !labId} onClick={() => save('DRAFT')} data-testid="ai-save-draft"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm disabled:opacity-50"><Save className="w-4 h-4" /> Guardar borrador</button>
                <button type="button" disabled={busy !== '' || !labId} onClick={() => save('PUBLISHED')} data-testid="ai-publish"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-sm font-medium disabled:opacity-50"><Send className="w-4 h-4" /> Publicar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
