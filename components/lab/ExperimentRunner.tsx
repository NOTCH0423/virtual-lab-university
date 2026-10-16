'use client';

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ArrowLeft, BookOpen, CheckCircle2, Download, Info, Pause, Play, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { getSim, type SimParams, type SimState } from '@/lib/lab-sims';
import { SimScene } from '@/components/lab/Scenes';

type Point = { t: number; v: number };
const MAX_POINTS = 400;

function LiveChart({ data, color, label, unit }: { data: Point[]; color: string; label: string; unit: string }) {
  const W = 360, H = 150, pad = 28;
  if (data.length < 2) {
    return <div className="h-[150px] flex items-center justify-center text-sm text-gray-500">Pulsa Iniciar para registrar datos</div>;
  }
  const t0 = data[0].t, t1 = data[data.length - 1].t || 1;
  let vmin = Math.min(...data.map((d) => d.v)), vmax = Math.max(...data.map((d) => d.v));
  if (vmax - vmin < 1e-9) { vmax += 1; vmin -= 1; }
  const x = (t: number) => pad + ((t - t0) / Math.max(1e-9, t1 - t0)) * (W - pad - 6);
  const y = (v: number) => H - pad + 8 - ((v - vmin) / (vmax - vmin)) * (H - pad - 4);
  const pts = data.map((d) => `${x(d.t).toFixed(1)},${y(d.v).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px]" role="img" aria-label={`Gráfica de ${label}`}>
      <line x1={pad} y1={4} x2={pad} y2={H - pad + 8} stroke="#334155" />
      <line x1={pad} y1={H - pad + 8} x2={W - 4} y2={H - pad + 8} stroke="#334155" />
      {vmin < 0 && vmax > 0 && <line x1={pad} x2={W - 4} y1={y(0)} y2={y(0)} stroke="#334155" strokeDasharray="3 3" />}
      <text x={2} y={12} fill="#94a3b8" fontSize="9">{vmax.toFixed(2)}</text>
      <text x={2} y={H - pad + 8} fill="#94a3b8" fontSize="9">{vmin.toFixed(2)}</text>
      <text x={W - 4} y={H - 4} fill="#94a3b8" fontSize="9" textAnchor="end">t = {(t1 - t0).toFixed(1)} s</text>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} />
      <text x={pad + 4} y={14} fill={color} fontSize="10">{label}{unit ? ` (${unit})` : ''}</text>
    </svg>
  );
}

export default function ExperimentRunner({ slug }: { slug: string }) {
  const sim = getSim(slug)!;
  const defaults = useMemo(() => Object.fromEntries(sim.params.map((p) => [p.key, p.default])) as SimParams, [sim]);
  const [params, setParams] = useState<SimParams>(defaults);
  const stateRef = useRef<SimState>(sim.init(defaults));
  const [snapshot, setSnapshot] = useState<SimState>(stateRef.current);
  const [running, setRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [panel, setPanel] = useState<'params' | 'theory'>('params');
  const historyRef = useRef<Point[]>([]);
  const [history, setHistory] = useState<Point[]>([]);
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const reset = useCallback((p: SimParams = paramsRef.current) => {
    stateRef.current = sim.init(p);
    historyRef.current = [];
    setHistory([]);
    setSnapshot(stateRef.current);
    setRunning(false);
    setFinished(false);
  }, [sim]);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let lastUi = 0;
    const scale = sim.timeScale ?? 1;
    const loop = (now: number) => {
      const real = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = paramsRef.current;
      const sub = 4;
      for (let i = 0; i < sub; i++) stateRef.current = sim.step(stateRef.current, p, (real * scale) / sub);
      const ro = sim.readouts(stateRef.current, p).find((r) => r.key === sim.chart.key);
      if (ro) {
        const tReal = (historyRef.current.at(-1)?.t ?? 0) + real;
        historyRef.current.push({ t: tReal, v: ro.value });
        if (historyRef.current.length > MAX_POINTS) {
          historyRef.current = historyRef.current.filter((_, i) => i % 2 === 0);
        }
      }
      const isDone = sim.done?.(stateRef.current, p) ?? false;
      if (now - lastUi > 66 || isDone) {
        lastUi = now;
        setSnapshot(stateRef.current);
        setHistory([...historyRef.current]);
      }
      if (isDone) {
        setRunning(false);
        setFinished(true);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running, sim]);

  const changeParam = (key: string, value: number) => {
    const next = { ...params, [key]: value };
    setParams(next);
    // los parámetros iniciales reinician el experimento si no está corriendo
    if (!running) reset(next);
  };

  const readouts = sim.readouts(snapshot, params);
  const started = history.length > 0;
  const summary = started ? sim.summary(snapshot, params) : null;

  const downloadCsv = () => {
    const rows = [['tiempo_s', `${sim.chart.label} (${sim.chart.unit})`], ...historyRef.current.map((d) => [d.t.toFixed(3), d.v.toFixed(5)])];
    const extra = summary ? ['', 'Resumen', ...summary.items.map((i) => `${i.label};${i.value}`)] : [];
    const csv = [...rows.map((r) => r.join(';')), ...extra].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sim.slug}-resultados.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 glass-dark sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href={`/laboratories/${sim.labId}`} className="p-2 rounded-lg hover:bg-white/10" aria-label="Volver al laboratorio">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="min-w-0">
              <p className="text-xs" style={{ color: sim.color }}>{sim.category} · {sim.labTitle}</p>
              <h1 className="text-lg font-semibold truncate">{sim.title}</h1>
            </div>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full ${finished ? 'bg-green-500/20 text-green-300' : running ? 'bg-primary-500/20 text-primary-300' : 'bg-white/10 text-gray-300'}`}>
            {finished ? 'Completado' : running ? 'En ejecución' : started ? 'En pausa' : 'Listo'}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[1fr_380px] gap-6">
        <section className="space-y-6">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-slate-900 to-slate-950 h-[420px]">
            <Canvas camera={{ position: [0, 1.5, 7], fov: 50 }} shadows dpr={[1, 2]}>
              <color attach="background" args={['#020617']} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
              <pointLight position={[-4, 3, -2]} intensity={0.6} color={sim.color} />
              <Suspense fallback={null}>
                <SimScene kind={sim.scene} s={stateRef} p={params} color={sim.color} />
              </Suspense>
              <OrbitControls enablePan={false} minDistance={3} maxDistance={14} />
            </Canvas>
            <div className="absolute bottom-4 left-4 flex gap-2">
              <button
                onClick={() => (finished ? (reset(), setTimeout(() => setRunning(true), 0)) : setRunning((r) => !r))}
                className="flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-slate-950"
                style={{ background: sim.color }}
              >
                {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {running ? 'Pausar' : finished ? 'Repetir' : started ? 'Continuar' : 'Iniciar'}
              </button>
              <button onClick={() => reset()} className="flex items-center gap-2 px-4 py-2 rounded-xl glass-dark hover:bg-white/10">
                <RotateCcw className="w-4 h-4" /> Reiniciar
              </button>
            </div>
            <p className="absolute top-3 right-4 text-xs text-gray-400">Arrastra para rotar · rueda para zoom</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {readouts.map((r) => (
              <div key={r.key} className="glass-dark rounded-xl px-4 py-3">
                <p className="text-xs text-gray-400">{r.label}</p>
                <p className="font-mono text-lg">
                  {Number.isFinite(r.value) ? r.value.toFixed(r.digits ?? 2) : '—'}{' '}
                  <span className="text-xs text-gray-400">{r.unit}</span>
                </p>
              </div>
            ))}
          </div>

          <div className="glass-dark rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold">Medición en vivo</h2>
              <button onClick={downloadCsv} disabled={!started} className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 disabled:opacity-40">
                <Download className="w-4 h-4" /> CSV
              </button>
            </div>
            <LiveChart data={history} color={sim.color} label={sim.chart.label} unit={sim.chart.unit} />
          </div>

          {summary && (
            <div className={`rounded-2xl p-5 border ${finished ? 'border-green-500/40 bg-green-500/5' : 'border-white/10 bg-white/5'}`}>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 className={`w-5 h-5 ${finished ? 'text-green-400' : 'text-gray-400'}`} />
                <h2 className="font-semibold">{finished ? 'Resultados del experimento' : 'Resultados parciales'}</h2>
              </div>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                {summary.items.map((i) => (
                  <div key={i.label} className="flex justify-between gap-4 border-b border-white/5 py-1">
                    <dt className="text-gray-400">{i.label}</dt>
                    <dd className="font-mono text-right">{i.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-4 text-sm text-gray-300">{summary.conclusion}</p>
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="glass-dark rounded-2xl p-1 flex">
            <button onClick={() => setPanel('params')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm ${panel === 'params' ? 'bg-white/10' : 'text-gray-400'}`}>
              <SlidersHorizontal className="w-4 h-4" /> Parámetros
            </button>
            <button onClick={() => setPanel('theory')} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm ${panel === 'theory' ? 'bg-white/10' : 'text-gray-400'}`}>
              <BookOpen className="w-4 h-4" /> Teoría
            </button>
          </div>

          {panel === 'params' ? (
            <div className="glass-dark rounded-2xl p-5 space-y-5">
              <p className="text-sm text-gray-400">{sim.description}</p>
              {sim.params.map((d) => (
                <label key={d.key} className="block">
                  <span className="flex justify-between text-sm mb-2">
                    <span>{d.label}</span>
                    <span className="font-mono" style={{ color: sim.color }}>{params[d.key]} {d.unit}</span>
                  </span>
                  <input
                    type="range"
                    min={d.min}
                    max={d.max}
                    step={d.step}
                    value={params[d.key]}
                    onChange={(e) => changeParam(d.key, Number(e.target.value))}
                    className="w-full accent-sky-400"
                  />
                </label>
              ))}
              <p className="text-xs text-gray-500 flex gap-2"><Info className="w-4 h-4 shrink-0" />Cambiar un parámetro con la simulación detenida reinicia la medición.</p>
            </div>
          ) : (
            <div className="glass-dark rounded-2xl p-5 space-y-4 text-sm">
              {sim.theory.map((t) => <p key={t} className="text-gray-300">{t}</p>)}
              <div className="bg-white/5 rounded-xl p-3 space-y-1">
                {sim.formulas.map((f) => <p key={f} className="font-mono" style={{ color: sim.color }}>{f}</p>)}
              </div>
            </div>
          )}

          <div className="glass-dark rounded-2xl p-5">
            <h3 className="font-semibold mb-3">Instrucciones</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
              {sim.instructions.map((i) => <li key={i}>{i}</li>)}
            </ol>
          </div>
        </aside>
      </main>
    </div>
  );
}
