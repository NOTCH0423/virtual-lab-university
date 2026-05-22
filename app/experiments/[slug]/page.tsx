'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Atom,
  BatteryCharging,
  BookOpen,
  Calculator,
  CheckCircle2,
  Dna,
  Flame,
  Gauge,
  Info,
  Leaf,
  Play,
  RotateCcw,
  Save,
  Scale,
  Target,
  Zap,
} from 'lucide-react';

type Control = {
  id: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  defaultValue: number;
};

type Metric = {
  label: string;
  value: string;
};

type ExperimentConfig = {
  title: string;
  category: string;
  description: string;
  theory: string;
  formula: string;
  color: string;
  accent: string;
  icon: typeof Atom;
  controls: Control[];
};

const experiments: Record<string, ExperimentConfig> = {
  'newtons-laws': {
    title: 'Leyes de Newton',
    category: 'Física',
    description: 'Experimenta con fuerza, masa, fricción y aceleración para comprobar F = ma.',
    theory: 'La segunda ley de Newton predice la aceleración de un cuerpo cuando una fuerza neta actúa sobre él.',
    formula: 'F neta = m · a',
    color: '#38bdf8',
    accent: 'from-sky-500 to-blue-600',
    icon: Gauge,
    controls: [
      { id: 'force', label: 'Fuerza aplicada', min: 5, max: 120, step: 5, unit: 'N', defaultValue: 45 },
      { id: 'mass', label: 'Masa del bloque', min: 1, max: 25, step: 1, unit: 'kg', defaultValue: 8 },
      { id: 'friction', label: 'Fricción', min: 0, max: 40, step: 1, unit: 'N', defaultValue: 8 },
    ],
  },
  'energy-conservation': {
    title: 'Conservación de Energía',
    category: 'Física',
    description: 'Observa la transformación entre energía potencial y cinética en una pista inclinada.',
    theory: 'En ausencia de pérdidas, la energía mecánica total permanece constante durante el movimiento.',
    formula: 'E = mgh + 1/2 mv²',
    color: '#f59e0b',
    accent: 'from-amber-500 to-orange-600',
    icon: Flame,
    controls: [
      { id: 'height', label: 'Altura inicial', min: 1, max: 20, step: 1, unit: 'm', defaultValue: 12 },
      { id: 'mass', label: 'Masa', min: 1, max: 15, step: 1, unit: 'kg', defaultValue: 5 },
      { id: 'loss', label: 'Pérdidas por rozamiento', min: 0, max: 35, step: 1, unit: '%', defaultValue: 8 },
    ],
  },
  'thermodynamics-laws': {
    title: 'Leyes de la Termodinámica',
    category: 'Física',
    description: 'Modifica calor, trabajo y gas para analizar cambios de energía interna.',
    theory: 'La primera ley relaciona calor, trabajo y energía interna de un sistema cerrado.',
    formula: 'ΔU = Q - W',
    color: '#ef4444',
    accent: 'from-red-500 to-rose-600',
    icon: Flame,
    controls: [
      { id: 'heat', label: 'Calor añadido', min: 0, max: 1000, step: 25, unit: 'J', defaultValue: 500 },
      { id: 'work', label: 'Trabajo realizado', min: 0, max: 800, step: 25, unit: 'J', defaultValue: 250 },
      { id: 'temperature', label: 'Temperatura inicial', min: 250, max: 650, step: 10, unit: 'K', defaultValue: 320 },
    ],
  },
  'rc-rl-circuits': {
    title: 'Circuitos RC y RL',
    category: 'Ingeniería',
    description: 'Compara la respuesta transitoria de circuitos con capacitor o inductor.',
    theory: 'Los circuitos de primer orden responden exponencialmente según su constante de tiempo.',
    formula: 'τRC = R · C, τRL = L / R',
    color: '#22c55e',
    accent: 'from-emerald-500 to-teal-600',
    icon: BatteryCharging,
    controls: [
      { id: 'resistance', label: 'Resistencia', min: 10, max: 1000, step: 10, unit: 'Ω', defaultValue: 220 },
      { id: 'capacitance', label: 'Capacitancia', min: 10, max: 1000, step: 10, unit: 'µF', defaultValue: 220 },
      { id: 'inductance', label: 'Inductancia', min: 10, max: 500, step: 10, unit: 'mH', defaultValue: 120 },
      { id: 'voltage', label: 'Voltaje fuente', min: 1, max: 24, step: 1, unit: 'V', defaultValue: 12 },
    ],
  },
  'redox-reactions': {
    title: 'Reacciones de Oxidación-Reducción',
    category: 'Química',
    description: 'Analiza transferencia de electrones y potencial de celda en una reacción redox.',
    theory: 'Una especie se oxida al perder electrones y otra se reduce al ganarlos.',
    formula: 'E celda = E cátodo - E ánodo',
    color: '#a855f7',
    accent: 'from-violet-500 to-fuchsia-600',
    icon: Zap,
    controls: [
      { id: 'anode', label: 'Potencial del ánodo', min: -1.6, max: 0.5, step: 0.1, unit: 'V', defaultValue: -0.8 },
      { id: 'cathode', label: 'Potencial del cátodo', min: -0.2, max: 1.6, step: 0.1, unit: 'V', defaultValue: 0.7 },
      { id: 'electrons', label: 'Electrones transferidos', min: 1, max: 6, step: 1, unit: 'e-', defaultValue: 2 },
    ],
  },
  stoichiometry: {
    title: 'Estequiometría',
    category: 'Química',
    description: 'Calcula reactivo limitante, producto esperado y rendimiento experimental.',
    theory: 'Las proporciones molares de una ecuación balanceada determinan cuánto producto se puede formar.',
    formula: 'n = m / M',
    color: '#14b8a6',
    accent: 'from-teal-500 to-cyan-600',
    icon: Scale,
    controls: [
      { id: 'reactantA', label: 'Reactivo A', min: 1, max: 120, step: 1, unit: 'g', defaultValue: 48 },
      { id: 'reactantB', label: 'Reactivo B', min: 1, max: 120, step: 1, unit: 'g', defaultValue: 64 },
      { id: 'yield', label: 'Rendimiento', min: 40, max: 100, step: 1, unit: '%', defaultValue: 82 },
    ],
  },
  'cell-observation': {
    title: 'Observación Celular',
    category: 'Biología',
    description: 'Explora células vegetales y animales ajustando aumento, tinción y enfoque.',
    theory: 'La microscopía permite identificar organelos y comparar células eucariotas.',
    formula: 'Aumento total = ocular · objetivo',
    color: '#84cc16',
    accent: 'from-lime-500 to-green-600',
    icon: Leaf,
    controls: [
      { id: 'magnification', label: 'Aumento objetivo', min: 4, max: 100, step: 4, unit: 'x', defaultValue: 40 },
      { id: 'stain', label: 'Tinción', min: 0, max: 100, step: 5, unit: '%', defaultValue: 55 },
      { id: 'focus', label: 'Enfoque', min: 0, max: 100, step: 5, unit: '%', defaultValue: 70 },
    ],
  },
  'mendelian-inheritance': {
    title: 'Herencia Mendeliana',
    category: 'Biología',
    description: 'Predice proporciones genotípicas y fenotípicas en un cruce monohíbrido.',
    theory: 'La segregación de alelos explica la distribución esperada de rasgos dominantes y recesivos.',
    formula: 'Aa × Aa → 1 AA : 2 Aa : 1 aa',
    color: '#ec4899',
    accent: 'from-pink-500 to-rose-600',
    icon: Dna,
    controls: [
      { id: 'dominance', label: 'Dominancia del alelo A', min: 50, max: 100, step: 5, unit: '%', defaultValue: 100 },
      { id: 'sample', label: 'Descendencia simulada', min: 20, max: 500, step: 20, unit: '', defaultValue: 160 },
      { id: 'mutation', label: 'Mutación espontánea', min: 0, max: 10, step: 1, unit: '%', defaultValue: 2 },
    ],
  },
};

function getInitialValues(config: ExperimentConfig) {
  return Object.fromEntries(config.controls.map((control) => [control.id, control.defaultValue])) as Record<string, number>;
}

function getCompletion(values: Record<string, number>, config: ExperimentConfig) {
  const total = config.controls.reduce((sum, control) => {
    const current = values[control.id] ?? control.defaultValue;
    return sum + ((current - control.min) / (control.max - control.min)) * 100;
  }, 0);

  return Math.max(0, Math.min(100, Math.round(total / config.controls.length)));
}

function getInsight(slug: string, metrics: Metric[]) {
  if (slug === 'newtons-laws') return 'Ajusta fuerza y masa para observar cómo cambia la aceleración del sistema.';
  if (slug === 'energy-conservation') return 'Compara energía inicial y útil para estimar cuánto se pierde por rozamiento.';
  if (slug === 'thermodynamics-laws') return 'Observa si el sistema gana o pierde energía interna según Q y W.';
  if (slug === 'rc-rl-circuits') return 'Contrasta las constantes de tiempo RC y RL para entender la respuesta transitoria.';
  if (slug === 'redox-reactions') return metrics.some((metric) => metric.value === 'No espontÃ¡nea') ? 'El potencial calculado no favorece una reacción espontánea.' : 'La celda tiene potencial positivo y puede entregar energía.';
  if (slug === 'stoichiometry') return 'El reactivo limitante controla la cantidad máxima de producto formado.';
  if (slug === 'cell-observation') return 'Sube el enfoque cerca del punto óptimo para mejorar la nitidez del campo.';
  return 'La simulación compara resultados esperados con una muestra de descendencia.';
}

function getMetrics(slug: string, values: Record<string, number>): Metric[] {
  if (slug === 'newtons-laws') {
    const netForce = Math.max(0, values.force - values.friction);
    const acceleration = netForce / values.mass;
    return [
      { label: 'Fuerza neta', value: `${netForce.toFixed(1)} N` },
      { label: 'Aceleración', value: `${acceleration.toFixed(2)} m/s²` },
      { label: 'Velocidad a 5 s', value: `${(acceleration * 5).toFixed(2)} m/s` },
    ];
  }

  if (slug === 'energy-conservation') {
    const potential = values.mass * 9.81 * values.height;
    const kinetic = potential * (1 - values.loss / 100);
    const speed = Math.sqrt((2 * kinetic) / values.mass);
    return [
      { label: 'Energía potencial', value: `${potential.toFixed(0)} J` },
      { label: 'Energía útil', value: `${kinetic.toFixed(0)} J` },
      { label: 'Velocidad final', value: `${speed.toFixed(2)} m/s` },
    ];
  }

  if (slug === 'thermodynamics-laws') {
    const deltaU = values.heat - values.work;
    const finalTemperature = values.temperature + deltaU / 20;
    return [
      { label: 'Cambio de energía', value: `${deltaU.toFixed(0)} J` },
      { label: 'Temperatura final', value: `${finalTemperature.toFixed(1)} K` },
      { label: 'Estado', value: deltaU >= 0 ? 'Absorbe energía' : 'Pierde energía' },
    ];
  }

  if (slug === 'rc-rl-circuits') {
    const tauRc = values.resistance * values.capacitance / 1_000_000;
    const tauRl = values.inductance / 1000 / values.resistance;
    const current = values.voltage / values.resistance;
    return [
      { label: 'Constante RC', value: `${(tauRc * 1000).toFixed(2)} ms` },
      { label: 'Constante RL', value: `${(tauRl * 1000).toFixed(2)} ms` },
      { label: 'Corriente máxima', value: `${(current * 1000).toFixed(1)} mA` },
    ];
  }

  if (slug === 'redox-reactions') {
    const eCell = values.cathode - values.anode;
    const gibbs = -values.electrons * 96485 * eCell / 1000;
    return [
      { label: 'Potencial de celda', value: `${eCell.toFixed(2)} V` },
      { label: 'ΔG estimado', value: `${gibbs.toFixed(1)} kJ/mol` },
      { label: 'Espontaneidad', value: eCell > 0 ? 'Espontánea' : 'No espontánea' },
    ];
  }

  if (slug === 'stoichiometry') {
    const molesA = values.reactantA / 24;
    const molesB = values.reactantB / 32;
    const limiting = molesA < molesB ? 'Reactivo A' : 'Reactivo B';
    const product = Math.min(molesA, molesB) * 58 * (values.yield / 100);
    return [
      { label: 'Moles A', value: `${molesA.toFixed(2)} mol` },
      { label: 'Moles B', value: `${molesB.toFixed(2)} mol` },
      { label: 'Limitante', value: limiting },
      { label: 'Producto real', value: `${product.toFixed(1)} g` },
    ];
  }

  if (slug === 'cell-observation') {
    const totalMagnification = values.magnification * 10;
    const clarity = Math.max(0, 100 - Math.abs(75 - values.focus) * 1.4);
    return [
      { label: 'Aumento total', value: `${totalMagnification.toFixed(0)}x` },
      { label: 'Contraste', value: `${values.stain.toFixed(0)}%` },
      { label: 'Nitidez', value: `${clarity.toFixed(0)}%` },
    ];
  }

  const dominant = values.dominance;
  const sample = values.sample;
  const mutation = values.mutation / 100;
  const dominantCount = Math.round(sample * (0.75 * dominant / 100) * (1 - mutation));
  const recessiveCount = Math.max(0, sample - dominantCount);
  return [
    { label: 'Fenotipo dominante', value: `${dominantCount}` },
    { label: 'Fenotipo recesivo', value: `${recessiveCount}` },
    { label: 'Relación esperada', value: '3 : 1' },
  ];
}

function ExperimentVisual({ slug, values, color }: { slug: string; values: Record<string, number>; color: string }) {
  const intensity = slug === 'cell-observation' ? values.stain / 100 : 0.65;
  const motion = slug === 'newtons-laws' ? Math.min(170, Math.max(20, (values.force - values.friction) * 1.5)) : 80;
  const energyHeight = slug === 'energy-conservation' ? 280 - values.height * 9 : 170;
  const heatLevel = slug === 'thermodynamics-laws' ? 260 - values.temperature / 3 : 150;
  const charge = slug === 'rc-rl-circuits' ? Math.min(1, values.capacitance / 1000) : 0.5;
  const eCell = slug === 'redox-reactions' ? values.cathode - values.anode : 1;
  const productRatio = slug === 'stoichiometry' ? Math.min(values.reactantA / (values.reactantA + values.reactantB), 0.9) : 0.5;
  const dominantRatio = slug === 'mendelian-inheritance' ? Math.min(0.9, values.dominance / 120) : 0.75;

  return (
    <svg viewBox="0 0 520 360" className="w-full max-w-4xl aspect-[13/9]">
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </radialGradient>
        <linearGradient id="panelWash" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.12)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
        </linearGradient>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#fff" />
        </marker>
      </defs>
      <rect x="0" y="0" width="520" height="360" rx="20" fill="rgba(15, 23, 42, 0.65)" />
      <rect x="24" y="24" width="472" height="312" rx="18" fill="url(#glow)" stroke="rgba(255,255,255,0.12)" />
      <path d="M62 294 H460 M62 244 H460 M62 194 H460 M62 144 H460 M62 94 H460" stroke="rgba(148,163,184,0.12)" strokeWidth="1" />
      <path d="M112 58 V302 M182 58 V302 M252 58 V302 M322 58 V302 M392 58 V302" stroke="rgba(148,163,184,0.09)" strokeWidth="1" />
      <rect x="44" y="44" width="432" height="34" rx="10" fill="url(#panelWash)" stroke="rgba(255,255,255,0.08)" />
      <circle cx="66" cy="61" r="5" fill={color} />
      <text x="82" y="66" fill="#cbd5e1" fontSize="12">Simulacion activa</text>

      {slug === 'newtons-laws' && (
        <g>
          <line x1="70" y1="265" x2="450" y2="265" stroke="#64748b" strokeWidth="4" />
          <rect x={90 + motion} y="205" width="110" height="60" rx="8" fill={color} opacity="0.85" />
          <line x1={145 + motion} y1="205" x2={235 + motion} y2="165" stroke="#fff" strokeWidth="5" markerEnd="url(#arrow)" />
          <text x="80" y="300" fill="#94a3b8" fontSize="14">Superficie con fricción</text>
          <text x={245 + motion} y="165" fill="#fff" fontSize="14">F</text>
        </g>
      )}

      {slug === 'energy-conservation' && (
        <g>
          <path d="M80 290 C180 260 250 120 430 90" fill="none" stroke="#94a3b8" strokeWidth="8" />
          <circle cx="170" cy={energyHeight} r="24" fill={color} />
          <line x1="80" y1="290" x2="80" y2={energyHeight} stroke="#fbbf24" strokeWidth="3" strokeDasharray="6 6" />
          <text x="95" y="185" fill="#fff" fontSize="14">h</text>
        </g>
      )}

      {slug === 'thermodynamics-laws' && (
        <g>
          <rect x="185" y="90" width="150" height="190" rx="20" fill="rgba(15,23,42,0.9)" stroke="#94a3b8" strokeWidth="4" />
          <rect x="195" y={heatLevel} width="130" height={280 - heatLevel} rx="12" fill={color} opacity="0.75" />
          {[0, 1, 2, 3].map((i) => (
            <path key={i} d={`M${150 + i * 45} 305 C${170 + i * 45} 280 ${130 + i * 45} 255 ${155 + i * 45} 230`} stroke={color} strokeWidth="3" fill="none" />
          ))}
          <text x="206" y="75" fill="#fff" fontSize="14">Sistema cerrado</text>
        </g>
      )}

      {slug === 'rc-rl-circuits' && (
        <g stroke="#cbd5e1" strokeWidth="5" fill="none">
          <path d="M100 180 H180 M240 180 H310 M370 180 H430 M100 180 V260 H430 V180" />
          <rect x="180" y="155" width="60" height="50" rx="6" fill="rgba(34,197,94,0.18)" stroke={color} />
          <line x1="310" y1="150" x2="310" y2="210" />
          <line x1="335" y1="150" x2="335" y2="210" />
          <circle cx="430" cy="180" r="22" fill={color} opacity={charge} stroke={color} />
          <text x="185" y="145" fill="#fff" fontSize="13">R</text>
          <text x="303" y="135" fill="#fff" fontSize="13">C</text>
          <text x="405" y="145" fill="#fff" fontSize="13">L</text>
        </g>
      )}

      {slug === 'redox-reactions' && (
        <g>
          <rect x="95" y="130" width="130" height="120" rx="16" fill="rgba(168,85,247,0.14)" stroke="#a855f7" />
          <rect x="295" y="130" width="130" height="120" rx="16" fill="rgba(56,189,248,0.14)" stroke="#38bdf8" />
          <line x1="225" y1="180" x2="295" y2="180" stroke={eCell > 0 ? color : '#64748b'} strokeWidth="5" strokeDasharray="10 8" />
          <circle cx="260" cy="180" r="13" fill={eCell > 0 ? color : '#64748b'} />
          <text x="127" y="198" fill="#fff" fontSize="16">Ánodo</text>
          <text x="322" y="198" fill="#fff" fontSize="16">Cátodo</text>
          <text x="237" y="153" fill="#fff" fontSize="13">{eCell.toFixed(2)} V</text>
        </g>
      )}

      {slug === 'stoichiometry' && (
        <g>
          <rect x="95" y="110" width="90" height="150" rx="12" fill="#38bdf8" opacity="0.65" />
          <rect x="215" y="110" width="90" height="150" rx="12" fill="#a855f7" opacity="0.65" />
          <path d="M315 185 H385" stroke="#fff" strokeWidth="5" />
          <path d="M370 165 L395 185 L370 205" fill="none" stroke="#fff" strokeWidth="5" />
          <rect x="410" y={260 - productRatio * 150} width="55" height={productRatio * 150} rx="8" fill={color} />
          <text x="122" y="285" fill="#fff" fontSize="14">A</text>
          <text x="242" y="285" fill="#fff" fontSize="14">B</text>
          <text x="405" y="285" fill="#fff" fontSize="14">Producto</text>
        </g>
      )}

      {slug === 'cell-observation' && (
        <g>
          <circle cx="260" cy="180" r="115" fill="rgba(15,23,42,0.9)" stroke="#94a3b8" strokeWidth="6" />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const angle = (i * Math.PI) / 3;
            return (
              <ellipse
                key={i}
                cx={260 + Math.cos(angle) * 45}
                cy={180 + Math.sin(angle) * 38}
                rx="35"
                ry="22"
                fill={color}
                opacity={0.18 + intensity * 0.55}
                stroke={color}
              />
            );
          })}
          <circle cx="260" cy="180" r="32" fill={color} opacity={0.45 + intensity * 0.4} />
          <text x="215" y="315" fill="#fff" fontSize="14">Campo microscópico</text>
        </g>
      )}

      {slug === 'mendelian-inheritance' && (
        <g>
          <circle cx="150" cy="115" r="38" fill="#f472b6" />
          <circle cx="370" cy="115" r="38" fill="#f472b6" />
          <line x1="175" y1="140" x2="230" y2="205" stroke="#fff" strokeWidth="3" />
          <line x1="345" y1="140" x2="290" y2="205" stroke="#fff" strokeWidth="3" />
          {[0, 1, 2, 3].map((i) => (
            <circle
              key={i}
              cx={170 + i * 60}
              cy="245"
              r={i < Math.round(dominantRatio * 4) ? 26 : 20}
              fill={i < 3 ? color : '#64748b'}
              opacity={i < Math.round(dominantRatio * 4) ? 0.9 : 0.55}
            />
          ))}
          <text x="129" y="119" fill="#fff" fontSize="14">Aa</text>
          <text x="349" y="119" fill="#fff" fontSize="14">Aa</text>
          <text x="196" y="300" fill="#fff" fontSize="14">Descendencia simulada</text>
        </g>
      )}
    </svg>
  );
}

export default function DynamicExperimentPage({ params }: { params: { slug: string } }) {
  const config = experiments[params.slug];
  const [values, setValues] = useState<Record<string, number>>(() => (config ? getInitialValues(config) : {}));
  const [saved, setSaved] = useState(false);
  const [activePanel, setActivePanel] = useState<'parameters' | 'theory'>('parameters');
  const metrics = useMemo(() => (config ? getMetrics(params.slug, values) : []), [config, params.slug, values]);

  if (!config) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-3">Experimento no encontrado</h1>
          <Link href="/laboratories" className="text-primary-400 hover:text-primary-300">
            Volver a laboratorios
          </Link>
        </div>
      </div>
    );
  }

  const Icon = config.icon;
  const completion = getCompletion(values, config);
  const insight = getInsight(params.slug, metrics);

  const updateValue = (id: string, value: number) => {
    setSaved(false);
    setValues((current) => ({ ...current, [id]: value }));
  };

  const reset = () => {
    setSaved(false);
    setValues(getInitialValues(config));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white lg:grid lg:grid-cols-[minmax(0,1fr)_400px]">
      <main className="relative min-w-0 p-4 sm:p-6 lg:p-8 flex flex-col bg-[radial-gradient(circle_at_20%_12%,rgba(14,165,233,0.12),transparent_32%),linear-gradient(180deg,rgba(15,23,42,0),#020617_95%)]">
        <div className="mb-5 rounded-lg border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-4">
          <Link href="/laboratories" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Laboratorios
          </Link>
          <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-gray-300 border border-white/10">
            {config.category}
          </span>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${config.accent} flex shrink-0 items-center justify-center shadow-lg`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500">Simulacion de {config.category}</p>
                <h1 className="text-2xl font-bold leading-tight sm:text-3xl">{config.title}</h1>
              </div>
            </div>
            <div className="w-full sm:w-56">
              <div className="mb-2 flex items-center justify-between text-xs text-gray-400">
                <span>Preparacion</span>
                <span>{completion}%</span>
              </div>
              <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${config.accent} transition-all duration-300`} style={{ width: `${completion}%` }} />
              </div>
            </div>
          </div>
        </div>

        <section className="relative flex-1 min-h-[360px] rounded-lg border border-white/10 bg-black/25 p-3 shadow-2xl shadow-black/30 sm:p-6">
          <div className="absolute left-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-gray-300 backdrop-blur">
            <Play className="w-3.5 h-3.5" style={{ color: config.color }} />
            Simulacion interactiva
          </div>
          <div className="h-full min-h-[330px] grid place-items-center">
          <ExperimentVisual slug={params.slug} values={values} color={config.color} />
          </div>
        </section>

        <section className="mt-6 grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {metrics.map((metric, index) => (
            <div key={metric.label} className="rounded-lg border border-white/10 bg-white/[0.045] px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                {index === 0 ? <Activity className="w-4 h-4" /> : index === 1 ? <Target className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
                {metric.label}
              </div>
              <p className="mt-2 text-xl font-semibold">{metric.value}</p>
            </div>
          ))}
        </section>
      </main>

      <aside className="border-t border-white/10 bg-slate-950/90 p-5 backdrop-blur-xl lg:h-screen lg:overflow-y-auto lg:border-l lg:border-t-0 lg:p-6">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 mb-5">
          <p className="text-sm text-gray-300">{config.description}</p>
          <div className="mt-4 flex gap-2 rounded-lg bg-black/25 p-1">
            <button
              onClick={() => setActivePanel('parameters')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activePanel === 'parameters' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Parametros
            </button>
            <button
              onClick={() => setActivePanel('theory')}
              className={`flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activePanel === 'theory' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Teoria
            </button>
          </div>
        </div>

        {activePanel === 'theory' && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-5">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <BookOpen className="w-4 h-4" style={{ color: config.color }} />
            Modelo teórico
          </div>
          <p className="text-sm text-gray-300 mb-3">{config.theory}</p>
          <p className="font-mono text-sm" style={{ color: config.color }}>
            {config.formula}
          </p>
        </div>
        )}

        {activePanel === 'parameters' && (
        <div className="space-y-4">
          {config.controls.map((control) => (
            <label key={control.id} className="block rounded-lg border border-white/10 bg-white/[0.035] p-4">
              <span className="flex items-center justify-between gap-3 text-sm font-medium mb-3">
                <span>{control.label}</span>
                <span className="font-mono text-gray-300">
                  {(values[control.id] ?? control.defaultValue).toFixed(control.step < 1 ? 1 : 0)} {control.unit}
                </span>
              </span>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={values[control.id] ?? control.defaultValue}
                onChange={(event) => updateValue(control.id, Number(event.target.value))}
                className="mt-1 w-full"
                style={{ accentColor: config.color }}
              />
            </label>
          ))}
        </div>
        )}

        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Info className="w-4 h-4" style={{ color: config.color }} />
            Lectura rapida
          </div>
          <p className="text-sm leading-6 text-gray-300">{insight}</p>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 py-3 bg-white/5 rounded-lg font-medium hover:bg-white/10 transition-colors border border-white/10"
          >
            <RotateCcw className="w-4 h-4" />
            Reiniciar
          </button>
          <button
            onClick={() => setSaved(true)}
            className={`inline-flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white bg-gradient-to-r ${config.accent} hover:opacity-90 transition-opacity`}
          >
            <Save className="w-4 h-4" />
            Guardar
          </button>
        </div>

        {saved && (
          <p className="mt-4 flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-2">
            <CheckCircle2 className="w-4 h-4" />
            Resultados guardados para esta simulación.
          </p>
        )}
      </aside>
    </div>
  );
}
