'use client';

import { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { Beaker, Thermometer, Droplets, AlertTriangle, Info, Play, RotateCcw, Flame, Activity, Zap } from 'lucide-react';

const REAGENTS = [
  { id: 'hcl', name: 'Ácido clorhídrico', formula: 'HCl', color: '#F09595', ph: 1, cat: 'acido', conductivity: 'alta', density: 1.18, state: 'líq', danger: true },
  { id: 'h2so4', name: 'Ácido sulfúrico', formula: 'H₂SO₄', color: '#FAC775', ph: 0, cat: 'acido', conductivity: 'alta', density: 1.84, state: 'líq', danger: true },
  { id: 'hno3', name: 'Ácido nítrico', formula: 'HNO₃', color: '#F0997B', ph: 1, cat: 'acido', conductivity: 'alta', density: 1.51, state: 'líq', danger: true },
  { id: 'ch3cooh', name: 'Ácido acético', formula: 'CH₃COOH', color: '#FAC775', ph: 3, cat: 'acido', conductivity: 'baja', density: 1.05, state: 'líq', danger: false },
  { id: 'naoh', name: 'Hidróxido de sodio', formula: 'NaOH', color: '#B5D4F4', ph: 13, cat: 'base', conductivity: 'alta', density: 2.13, state: 'sól', danger: true },
  { id: 'koh', name: 'Hidróxido de potasio', formula: 'KOH', color: '#AFA9EC', ph: 13, cat: 'base', conductivity: 'alta', density: 2.04, state: 'sól', danger: true },
  { id: 'nh3', name: 'Amoniaco', formula: 'NH₃', color: '#EEEDFE', ph: 11, cat: 'base', conductivity: 'media', density: 0.73, state: 'gas', danger: true },
  { id: 'h2o', name: 'Agua destilada', formula: 'H₂O', color: '#E6F1FB', ph: 7, cat: 'neutro', conductivity: 'muy baja', density: 1.0, state: 'líq', danger: false },
  { id: 'nacl', name: 'Cloruro de sodio', formula: 'NaCl', color: '#D3D1C7', ph: 7, cat: 'sal', conductivity: 'alta', density: 2.16, state: 'sól', danger: false },
  { id: 'cuso4', name: 'Sulfato de cobre', formula: 'CuSO₄', color: '#85B7EB', ph: 4, cat: 'sal', conductivity: 'alta', density: 3.6, state: 'sól', danger: false },
  { id: 'agno3', name: 'Nitrato de plata', formula: 'AgNO₃', color: '#F1EFE8', ph: 5, cat: 'sal', conductivity: 'alta', density: 4.35, state: 'sól', danger: false },
  { id: 'cacl2', name: 'Cloruro de calcio', formula: 'CaCl₂', color: '#D3D1C7', ph: 7, cat: 'sal', conductivity: 'alta', density: 2.15, state: 'sól', danger: false },
  { id: 'h2o2', name: 'Agua oxigenada', formula: 'H₂O₂', color: '#EEEDFE', ph: 6, cat: 'oxidante', conductivity: 'baja', density: 1.11, state: 'líq', danger: false },
  { id: 'kmno4', name: 'Permanganato de K', formula: 'KMnO₄', color: '#D4537E', ph: 7, cat: 'oxidante', conductivity: 'alta', density: 2.7, state: 'sól', danger: false },
  { id: 'mno2', name: 'Dióxido de manganeso', formula: 'MnO₂', color: '#444441', ph: 7, cat: 'catalizador', conductivity: 'baja', density: 5.03, state: 'sól', danger: false },
  { id: 'fe', name: 'Hierro en polvo', formula: 'Fe', color: '#888780', ph: 7, cat: 'metal', conductivity: 'alta', density: 7.87, state: 'sól', danger: false },
  { id: 'zn', name: 'Zinc', formula: 'Zn', color: '#B4B2A9', ph: 7, cat: 'metal', conductivity: 'alta', density: 7.13, state: 'sól', danger: false },
  { id: 'cu', name: 'Cobre', formula: 'Cu', color: '#D85A30', ph: 7, cat: 'metal', conductivity: 'alta', density: 8.96, state: 'sól', danger: false },
  { id: 'phenol', name: 'Fenolftaleína', formula: 'C₂₀H₁₄O₄', color: '#F4C0D1', ph: 7, cat: 'indicador', conductivity: 'nula', density: 1.28, state: 'sól', danger: false },
  { id: 'litmus', name: 'Tornasol', formula: 'C₁₄H₁₄O₆', color: '#AFA9EC', ph: 7, cat: 'indicador', conductivity: 'nula', density: 1.3, state: 'sól', danger: false },
];

interface Reaction {
  a: string;
  b: string;
  eq: string;
  result: string;
  color: string;
  ph: number;
  type: string;
  tag: string;
  safe: boolean;
  heat: number;
  gas: boolean;
  precip: boolean;
  precipColor?: string;
  explanation: string;
}

const REACTIONS: Reaction[] = [
  { a: 'hcl', b: 'naoh', eq: 'HCl + NaOH → NaCl + H₂O', result: 'sal + agua', color: '#D3D1C7', ph: 7, type: 'neutralization', tag: 'Neutralización', safe: true, heat: 0, gas: false, precip: false, explanation: 'Esta es una reacción de neutralización ácido-base. El HCl reacciona con el NaOH para formar NaCl y agua. Es una reacción exotérmica que produce sal y agua neutros.' },
  { a: 'h2so4', b: 'naoh', eq: 'H₂SO₄ + 2NaOH → Na₂SO₄ + 2H₂O', result: 'sal + agua', color: '#C0DD97', ph: 7, type: 'neutralization', tag: 'Neutralización', safe: true, heat: 30, gas: false, precip: false, explanation: 'El ácido sulfúrico es un ácido fuerte diprótico. Reacciona con dos equivalentes de NaOH para formar sulfato de sodio y agua. La reacción libera calor.' },
  { a: 'h2o2', b: 'mno2', eq: '2H₂O₂ → 2H₂O + O₂↑', result: 'agua + oxígeno', color: '#B5D4F4', ph: 7, type: 'catalysis', tag: 'Catálisis', safe: true, heat: 0, gas: true, precip: false, explanation: 'El MnO₂ actúa como catalizador en la descomposición del peróxido de hidrógeno. El peróxido se descompone en agua y oxígeno gaseoso.' },
  { a: 'hcl', b: 'zn', eq: 'Zn + 2HCl → ZnCl₂ + H₂↑', result: 'sal + hidrógeno', color: '#D3D1C7', ph: 5, type: 'redox', tag: 'Redox', safe: true, heat: 10, gas: true, precip: false, explanation: 'El zinc metálico reacciona con el ácido clorhídrico en una reacción redox. El Zn se oxida a Zn²⁺ y el H⁺ se reduce a H₂ gas.' },
  { a: 'hcl', b: 'fe', eq: 'Fe + 2HCl → FeCl₂ + H₂↑', result: 'sal + hidrógeno', color: '#C0DD97', ph: 5, type: 'redox', tag: 'Redox', safe: true, heat: 15, gas: true, precip: false, explanation: 'El hierro reacciona con HCl produciendo cloruro ferroso (FeCl₂) y gas hidrógeno. La solución toma color verdoso.' },
  { a: 'agno3', b: 'nacl', eq: 'AgNO₃ + NaCl → AgCl↓ + NaNO₃', result: 'precipitado blanco AgCl', color: '#F1EFE8', ph: 6, type: 'precip', tag: 'Precipitación', safe: true, heat: 0, gas: false, precip: true, precipColor: '#F1EFE8', explanation: 'Esta reacción produce un precipitado blanco de cloruro de plata (AgCl). Es una reacción de precipitación muy sensible para detectar iones cloruro.' },
  { a: 'cuso4', b: 'naoh', eq: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄', result: 'precipitado azul', color: '#85B7EB', ph: 9, type: 'precip', tag: 'Precipitación', safe: true, heat: 0, gas: false, precip: true, precipColor: '#85B7EB', explanation: 'Se forma un precipitado gelatinoso azul de hidróxido de cobre (II), Cu(OH)₂. Esta reacción es característica para identificar iones Cu²⁺.' },
  { a: 'hno3', b: 'cu', eq: '8HNO₃(dil) + 3Cu → 3Cu(NO₃)₂ + 2NO↑ + 4H₂O', result: 'solución azul + gas', color: '#85B7EB', ph: 3, type: 'redox', tag: 'Redox', safe: false, heat: 20, gas: true, precip: false, explanation: 'El cobre se disuelve en ácido nítrico diluido. Se forma nitrato de cobre(II) azul-verdoso y se libera gas NO. ¡Precaución! Es peligrosa.' },
  { a: 'kmno4', b: 'h2o2', eq: '2KMnO₄ + 5H₂O₂ → 2MnSO₄ + K₂SO₄ + 8H₂O + 5O₂↑', result: 'decoloración + gas', color: '#D3D1C7', ph: 3, type: 'redox', tag: 'Redox', safe: false, heat: 0, gas: true, precip: false, explanation: 'El permanganato de potasio (violeta) se reduce y se decolora. El H₂O₂ se oxida a O₂. Esta reacción es peligrosa.' },
  { a: 'ch3cooh', b: 'naoh', eq: 'CH₃COOH + NaOH → CH₃COONa + H₂O', result: 'acetato de sodio', color: '#C0DD97', ph: 9, type: 'neutralization', tag: 'Neutralización', safe: true, heat: 5, gas: false, precip: false, explanation: 'El ácido acético (vinagre) reacciona con NaOH. Es una neutralización débil donde el pH final es básico.' },
  { a: 'h2so4', b: 'h2so4', eq: 'Ácidos iguales — sin reacción notable', result: 'mezcla ácida', color: '#FAC775', ph: 0, type: 'hazard', tag: 'Peligroso', safe: false, heat: 0, gas: false, precip: false, explanation: 'Mezclar ácidos concentrados es muy peligroso. ¡No mezcles ácidos sin conocimiento!' },
  { a: 'hcl', b: 'h2so4', eq: 'HCl + H₂SO₄ — mezcla ácida corrosiva', result: 'mezcla peligrosa', color: '#F09595', ph: 0, type: 'hazard', tag: 'Peligroso', safe: false, heat: 50, gas: true, precip: false, explanation: 'Mezclar HCl y H₂SO₄ concentrados es extremadamente peligroso. ¡Evita esta mezcla!' },
  { a: 'cuso4', b: 'h2o', eq: 'CuSO₄ + H₂O → solución azul', result: 'solución azul', color: '#85B7EB', ph: 4, type: 'dissolution', tag: 'Disolución', safe: true, heat: 0, gas: false, precip: false, explanation: 'El sulfato de cobre anhidro se disuelve en agua formando solución azul de Cu²⁺.' },
  { a: 'phenol', b: 'naoh', eq: 'Fenolftaleína en base → color rosado', result: 'indicador rosado', color: '#F4C0D1', ph: 13, type: 'indicator', tag: 'Indicador', safe: true, heat: 0, gas: false, precip: false, explanation: 'La fenolftaleína es un indicador de pH. En medio básico (pH > 8.2) cambia de incoloro a rosa.' },
  { a: 'litmus', b: 'hcl', eq: 'Tornasol en ácido → color rojo', result: 'indicador rojo', color: '#F09595', ph: 1, type: 'indicator', tag: 'Indicador', safe: true, heat: 0, gas: false, precip: false, explanation: 'El tornasol es un indicador natural. En ácidos (pH < 7) se vuelve rojo.' },
  { a: 'litmus', b: 'naoh', eq: 'Tornasol en base → color azul', result: 'indicador azul', color: '#85B7EB', ph: 13, type: 'indicator', tag: 'Indicador', safe: true, heat: 0, gas: false, precip: false, explanation: 'En medios básicos (pH > 7) el tornasol se vuelve azul.' },
  { a: 'nh3', b: 'hcl', eq: 'NH₃ + HCl → NH₄Cl', result: 'cloruro de amonio', color: '#D3D1C7', ph: 7, type: 'neutralization', tag: 'Neutralización', safe: true, heat: 0, gas: false, precip: false, explanation: 'El amoniaco reacciona con HCl para formar cloruro de amonio sólido. Se puede observar humo blanco.' },
];

const CATS = ['todos', 'ácido', 'base', 'sal', 'neutro', 'oxidante', 'catalizador', 'metal', 'indicador'];

interface VesselContent {
  reagent: typeof REAGENTS[0] | null;
  amount: number;
}

export default function ChemistryLabPage() {
  const [selectedCat, setSelectedCat] = useState('todos');
  const [selectedReagent, setSelectedReagent] = useState<string | null>(null);
  const [targetVessel, setTargetVessel] = useState('A');
  const [vessels, setVessels] = useState<Record<string, VesselContent>>({
    A: { reagent: null, amount: 0 },
    B: { reagent: null, amount: 0 },
    C: { reagent: null, amount: 0 },
    beaker: { reagent: null, amount: 0 },
    erlen: { reagent: null, amount: 0 },
    petri: { reagent: null, amount: 0 },
  });
  const [stats, setStats] = useState({ exp: 0, reac: 0, ph: 7, temp: 20, alerts: 0 });
  const [safety, setSafety] = useState<'safe' | 'warn' | 'danger'>('safe');
  const [reaction, setReaction] = useState<typeof REACTIONS[0] | null>(null);
  const [logs, setLogs] = useState<{ msg: string; type: string; time: string }[]>([]);
  const [elapsedTime, setElapsedTime] = useState('00:00');
  const [showFlame, setShowFlame] = useState(false);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; size: number; target: string }[]>([]);
  const [explanation, setExplanation] = useState<string | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const s = Math.floor((Date.now() - startTimeRef.current) / 1000);
      const m = Math.floor(s / 60).toString().padStart(2, '0');
      const sec = (s % 60).toString().padStart(2, '0');
      setElapsedTime(`${m}:${sec}`);
    }, 1000);

    addLog('Laboratorio iniciado. Selecciona un reactivo del panel izquierdo.', 'info');

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [logs]);

  const addLog = (msg: string, type: string = 'info') => {
    const s = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    setLogs((prev) => [...prev, { msg, type, time: `${m}:${sec}` }]);
  };

  const phColor = (ph: number) => {
    const colors = ['#E24B4A', '#F09595', '#FAC775', '#EF9F27', '#C0DD97', '#97C459', '#5DCAA5', '#5DCAA5', '#85B7EB', '#378ADD', '#185FA5', '#534AB7', '#7F77DD', '#AFA9EC', '#3C3489'];
    return colors[Math.min(14, Math.max(0, Math.round(ph)))];
  };

  const phLabel = (ph: number) => {
    if (ph < 3) return 'muy ácido';
    if (ph < 6) return 'ácido';
    if (ph < 7) return 'ligeramente ácido';
    if (ph === 7) return 'neutro';
    if (ph < 9) return 'ligeramente básico';
    if (ph < 12) return 'básico';
    return 'muy básico';
  };

  const getVesselLabel = (v: string) => {
    const labels: Record<string, string> = { A: 'Tubo A', B: 'Tubo B', C: 'Tubo C', beaker: 'Beaker', erlen: 'Erlenmeyer', petri: 'Placa Petri' };
    return labels[v] || v;
  };

  const handleSelectReagent = (id: string) => {
    setSelectedReagent(id);
    const r = REAGENTS.find((x) => x.id === id);
    if (r) addLog(`Seleccionado: ${r.name} (${r.formula})`, 'info');
  };

  const handleAddReagent = () => {
    if (!selectedReagent) {
      addLog('Selecciona un reactivo primero.', 'warn');
      return;
    }
    const r = REAGENTS.find((x) => x.id === selectedReagent);
    if (!r) return;

    setVessels((prev) => ({
      ...prev,
      [targetVessel]: { reagent: r, amount: 60 },
    }));

    setStats((prev) => ({ ...prev, exp: prev.exp + 1 }));
    addLog(`${r.formula} agregado a ${getVesselLabel(targetVessel)}.`, 'ok');
  };

  const handleMix = () => {
    const filled = Object.entries(vessels).filter(([k, v]) => v.reagent);
    if (filled.length < 2) {
      addLog('Necesitas al menos 2 recipientes con reactivos.', 'warn');
      return;
    }

    const [k1, v1] = filled[0];
    const [k2, v2] = filled[1];
    const a = v1.reagent!;
    const b = v2.reagent!;

    let rxn = REACTIONS.find(
      (r) => (r.a === a.id && r.b === b.id) || (r.a === b.id && r.b === a.id)
    );

    if (!rxn) {
      rxn = {
        a: a.id,
        b: b.id,
        eq: `${a.formula} + ${b.formula} → mezcla`,
        result: 'sin reacción notable',
        color: blendHex(a.color, b.color),
        ph: (a.ph + b.ph) / 2,
        type: 'mix',
        tag: 'Mezcla',
        safe: true,
        heat: 0,
        gas: false,
        precip: false,
        explanation: `La mezcla de ${a.name} y ${b.name} no produce una reacción química notable. Cada sustancia mantiene sus propiedades individuales.`,
      };
    }

    setReaction(rxn);
    setStats((prev) => ({ ...prev, reac: prev.reac + 1, ph: rxn.ph }));

    if (rxn.gas) {
      const newBubbles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: 10 + Math.random() * 70,
        size: 4 + Math.random() * 5,
        target: 'beaker',
      }));
      setBubbles((prev) => [...prev, ...newBubbles]);
      setTimeout(() => setBubbles([]), 1000);
    }

    if (rxn.heat > 0) {
      setStats((prev) => ({ ...prev, temp: Math.min(350, prev.temp + rxn.heat) }));
      setShowFlame(true);
      setTimeout(() => setShowFlame(false), 2500);
    }

    if (!rxn.safe) {
      setStats((prev) => ({ ...prev, alerts: prev.alerts + 1 }));
      setSafety('danger');
      addLog(`¡ALERTA! Reacción peligrosa: ${rxn.eq}`, 'err');
    } else {
      setSafety('safe');
      addLog(`Reacción: ${rxn.eq}`, 'ok');
    }

    setVessels((prev) => ({
      A: { reagent: null, amount: 0 },
      B: { reagent: null, amount: 0 },
      C: { reagent: null, amount: 0 },
      beaker: { reagent: v1.reagent, amount: 65 },
      erlen: { reagent: null, amount: 0 },
      petri: { reagent: null, amount: 0 },
    }));
  };

  const handleHeat = () => {
    setShowFlame(true);
    setTimeout(() => setShowFlame(false), 2500);
    if (stats.temp > 100) {
      const newBubbles = Array.from({ length: 8 }, (_, i) => ({
        id: Date.now() + i,
        x: 10 + Math.random() * 70,
        size: 4 + Math.random() * 5,
        target: 'beaker',
      }));
      setBubbles((prev) => [...prev, ...newBubbles]);
      setTimeout(() => setBubbles([]), 1500);
      addLog(`Ebullición a ${stats.temp}°C. Vapores detectados.`, 'warn');
    } else {
      addLog(`Calentando a ${stats.temp}°C.`, 'info');
    }
  };

  const handleCentrifuge = () => {
    addLog('Centrifugación: precipitado separado en el fondo.', 'ok');
  };

  const handleReset = () => {
    setVessels({
      A: { reagent: null, amount: 0 },
      B: { reagent: null, amount: 0 },
      C: { reagent: null, amount: 0 },
      beaker: { reagent: null, amount: 0 },
      erlen: { reagent: null, amount: 0 },
      petri: { reagent: null, amount: 0 },
    });
    setReaction(null);
    setStats({ exp: 0, reac: 0, ph: 7, temp: 20, alerts: 0 });
    setSafety('safe');
    setSelectedReagent(null);
    setExplanation(null);
    addLog('Mesa de trabajo limpiada.', 'info');
  };

  const handleExplain = () => {
    if (reaction?.explanation) {
      setExplanation(reaction.explanation);
      addLog('Generando explicación de la reacción...', 'info');
    } else if (selectedReagentData) {
      setExplanation(`El ${selectedReagentData.name} (${selectedReagentData.formula}) es un ${selectedReagentData.cat}. Tiene un pH de ${selectedReagentData.ph} y su conductividad es ${selectedReagentData.conductivity}. Estado físico: ${selectedReagentData.state}. ${selectedReagentData.danger ? '¡Precaución! Es un reactivo peligroso.' : 'Es un reactivo seguro para manipular.'}`);
    } else {
      setExplanation('Selecciona reactivos y realiza una reacción para ver la explicación.');
    }
  };

  const blendHex = (c1: string, c2: string) => {
    const h = (hex: string) => [parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16)];
    const [r1, g1, b1] = h(c1);
    const [r2, g2, b2] = h(c2);
    return '#' + [Math.round((r1 + r2) / 2), Math.round((g1 + g2) / 2), Math.round((b1 + b2) / 2)]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('');
  };

  const filteredReagents = selectedCat === 'todos' ? REAGENTS : REAGENTS.filter((r) => r.cat === selectedCat);
  const selectedReagentData = selectedReagent ? REAGENTS.find((r) => r.id === selectedReagent) : null;

  const safetyColors = { safe: 'bg-emerald-100 text-emerald-800', warn: 'bg-amber-100 text-amber-800', danger: 'bg-red-100 text-red-800' };
  const safetyText = { safe: 'Seguro', warn: 'Precaución', danger: 'Peligroso' };

  const reactionTypeColors: Record<string, string> = {
    neutralization: 'bg-teal-100 text-teal-800',
    acid: 'bg-red-100 text-red-800',
    redox: 'bg-purple-100 text-purple-800',
    catalysis: 'bg-amber-100 text-amber-800',
    hazard: 'bg-red-100 text-red-800',
    precip: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navigation />
      
      <main className="pt-24 pb-8 px-4 max-w-7xl mx-auto">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Laboratorio Virtual de Química</h1>
            <p className="text-gray-400 text-sm">Experimenta con reacciones químicas de forma segura</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Modo libre</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${safetyColors[safety]}`}>{safetyText[safety]}</span>
            <span className="px-3 py-1 bg-slate-700 text-gray-300 rounded-full text-xs font-mono">{elapsedTime}</span>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-3 mb-3">
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Experimentos</div>
            <div className="text-xl font-bold">{stats.exp}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Reacciones</div>
            <div className="text-xl font-bold">{stats.reac}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">pH</div>
            <div className="text-xl font-bold font-mono">{stats.ph.toFixed(1)}</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Temperatura</div>
            <div className="text-xl font-bold font-mono">{stats.temp}°C</div>
          </div>
          <div className="bg-slate-800 rounded-lg p-3">
            <div className="text-xs text-gray-400 mb-1">Alertas</div>
            <div className="text-xl font-bold text-red-400">{stats.alerts}</div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-3 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Reactivos</div>
            <div className="flex flex-wrap gap-1 mb-3">
              {CATS.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-2 py-1 rounded-full text-xs transition-colors ${
                    selectedCat === cat
                      ? 'bg-blue-500/30 text-blue-400 border border-blue-500/50'
                      : 'bg-slate-700/50 text-gray-400 border border-transparent hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
              {filteredReagents.map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleSelectReagent(r.id)}
                  className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all text-left ${
                    selectedReagent === r.id
                      ? 'bg-blue-500/20 border border-blue-500/50'
                      : 'hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: r.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{r.name}</div>
                    <div className="text-xs text-gray-500">{r.formula} · pH {r.ph}</div>
                  </div>
                  {r.danger && <span className="text-red-400 text-xs font-bold">!</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-6 bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Mesa de trabajo</span>
              <select
                value={targetVessel}
                onChange={(e) => setTargetVessel(e.target.value)}
                className="bg-slate-700 border border-slate-600 rounded-lg px-2 py-1 text-xs text-white"
              >
                <option value="A">Tubo A</option>
                <option value="B">Tubo B</option>
                <option value="C">Tubo C</option>
                <option value="beaker">Beaker</option>
                <option value="erlen">Erlenmeyer</option>
                <option value="petri">Placa Petri</option>
              </select>
            </div>

            <div className="flex items-end justify-around min-h-44 mb-4 px-2">
              {['A', 'B', 'C'].map((tube) => (
                <div key={tube} className="flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-500">Tubo {tube}</div>
                  <div className="relative w-8 h-28 border border-slate-500 rounded-b-lg overflow-hidden bg-slate-900/50">
                    {vessels[tube].reagent && (
                      <div
                        className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-b-md"
                        style={{
                          height: `${vessels[tube].amount}%`,
                          backgroundColor: vessels[tube].reagent.color,
                        }}
                      />
                    )}
                    {bubbles.filter((b) => b.target === `tube${tube}`).map((b) => (
                      <div
                        key={b.id}
                        className="absolute rounded-full bg-white/60 animate-bubble"
                        style={{
                          left: `${b.x}%`,
                          bottom: `${10 + Math.random() * 20}%`,
                          width: b.size,
                          height: b.size,
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-600 h-4">
                    {vessels[tube].reagent?.formula || ''}
                  </div>
                </div>
              ))}

              <div className="flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500">Beaker</div>
                <div className="relative w-16 h-24 border border-slate-500 rounded-b-md overflow-hidden bg-slate-900/50">
                  {vessels.beaker.reagent && (
                    <div
                      className="absolute bottom-0 left-0 right-0 transition-all duration-500"
                      style={{
                        height: `${vessels.beaker.amount}%`,
                        backgroundColor: vessels.beaker.reagent.color,
                      }}
                    />
                  )}
                  {bubbles.filter((b) => b.target === 'beaker').map((b) => (
                    <div
                      key={b.id}
                      className="absolute rounded-full bg-white/60 animate-bubble"
                      style={{
                        left: `${b.x}%`,
                        bottom: `${10 + Math.random() * 20}%`,
                        width: b.size,
                        height: b.size,
                      }}
                    />
                  ))}
                </div>
                <div className="text-xs text-gray-600 h-4">
                  {vessels.beaker.reagent?.formula || ''}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500">Erlenmeyer</div>
                <div className="relative w-14 h-24 overflow-hidden">
                  <svg viewBox="0 0 56 96" className="absolute inset-0 w-full h-full">
                    <path
                      d="M18 4 L18 38 L4 84 L52 84 L38 38 L38 4 Z"
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="1.5"
                    />
                  </svg>
                  {vessels.erlen.reagent && (
                    <div
                      className="absolute bottom-0 left-1 right-1 transition-all duration-500"
                      style={{
                        height: `${vessels.erlen.amount}%`,
                        backgroundColor: vessels.erlen.reagent.color,
                        clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
                      }}
                    />
                  )}
                </div>
                <div className="text-xs text-gray-600 h-4">
                  {vessels.erlen.reagent?.formula || ''}
                </div>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500">Placa Petri</div>
                <div className="relative w-20 h-8 border border-slate-500 rounded-full overflow-hidden bg-slate-900/50">
                  {vessels.petri.reagent && (
                    <div
                      className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-full"
                      style={{
                        height: `${vessels.petri.amount}%`,
                        backgroundColor: vessels.petri.reagent.color,
                      }}
                    />
                  )}
                </div>
                <div className="text-xs text-gray-600 h-4">
                  {vessels.petri.reagent?.formula || ''}
                </div>
              </div>

              {showFlame && (
                <div className="flex flex-col items-center gap-1">
                  <div className="text-xs text-gray-500">Mechero</div>
                  <div className="w-4 h-6 bg-orange-500 rounded-t-full animate-pulse" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-gray-400 w-20">Temperatura</span>
              <input
                type="range"
                min="0"
                max="350"
                step="5"
                value={stats.temp}
                onChange={(e) => setStats((prev) => ({ ...prev, temp: parseInt(e.target.value) }))}
                className="flex-1 accent-orange-500"
              />
              <span className="text-sm font-mono w-12">{stats.temp}°C</span>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              <button
                onClick={handleAddReagent}
                className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors flex items-center gap-1"
              >
                <Droplets className="w-4 h-4" />
                Agregar reactivo
              </button>
              <button
                onClick={handleMix}
                className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center gap-1"
              >
                <Activity className="w-4 h-4" />
                Mezclar todo
              </button>
              <button
                onClick={handleHeat}
                className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-lg text-sm font-medium hover:bg-orange-500/30 transition-colors flex items-center gap-1"
              >
                <Flame className="w-4 h-4" />
                Calentar
              </button>
              <button
                onClick={handleCentrifuge}
                className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-medium hover:bg-purple-500/30 transition-colors flex items-center gap-1"
              >
                <Zap className="w-4 h-4" />
                Centrifugar
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Limpiar mesa
              </button>
            </div>
          </div>

          <div className="col-span-3 bg-slate-800/50 rounded-xl p-4 border border-slate-700 space-y-4">
            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">pH-metro</div>
              <div className="text-2xl font-bold font-mono mb-1">{stats.ph.toFixed(1)}</div>
              <div className="h-6 rounded bg-gradient-to-r from-red-500 via-green-500 via-blue-500 via-purple-500 to-red-600 relative">
                <span
                  className="absolute top-1/2 -translate-y-1/2 w-0.5 h-4 bg-white rounded"
                  style={{ left: `${(stats.ph / 14) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1">{phLabel(stats.ph)}</div>
            </div>

            <div>
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Termómetro</div>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold font-mono">{stats.temp}°C</div>
                <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-green-500 via-yellow-500 to-red-500 transition-all duration-300"
                    style={{ width: `${(stats.temp / 350) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {reaction && (
              <div className="bg-slate-900/50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Última reacción</div>
                <div className="text-sm font-mono mb-2 break-all">{reaction.eq}</div>
                <span className={`inline-block px-2 py-0.5 rounded-full text-xs ${reactionTypeColors[reaction.type] || ''}`}>
                  {reaction.tag}
                </span>
              </div>
            )}

            {selectedReagentData && (
              <div>
                <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Reactivo activo</div>
                <div className="text-sm font-medium">{selectedReagentData.name}</div>
                <div className="text-xs text-gray-500">
                  {selectedReagentData.formula} · pH {selectedReagentData.ph} · {selectedReagentData.state}
                </div>
                <div className="text-xs text-gray-500">Conductividad: {selectedReagentData.conductivity}</div>
              </div>
            )}

            <button 
              onClick={handleExplain}
              className="w-full py-2 bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-1"
            >
              <Info className="w-4 h-4" />
              Explicar reacción
            </button>
            
            {explanation && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mt-2">
                <div className="text-xs font-medium text-blue-400 mb-1">Explicación:</div>
                <p className="text-xs text-gray-300 leading-relaxed">{explanation}</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 bg-slate-800/30 rounded-lg p-3 border border-slate-700 max-h-32 overflow-y-auto" ref={logRef}>
          {logs.map((log, i) => (
            <div
              key={i}
              className={`text-xs py-1 border-b border-slate-700/50 last:border-0 ${
                log.type === 'ok' ? 'text-emerald-400' : log.type === 'warn' ? 'text-amber-400' : log.type === 'err' ? 'text-red-400' : 'text-blue-400'
              }`}
            >
              <span className="text-gray-500 font-mono">[{log.time}]</span> {log.msg}
            </div>
          ))}
        </div>
      </main>

      <style jsx>{`
        @keyframes bubble {
          0% { opacity: 1; transform: translateY(0) scale(1); }
          100% { opacity: 0; transform: translateY(-50px) scale(1.3); }
        }
        .animate-bubble {
          animation: bubble 0.9s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
