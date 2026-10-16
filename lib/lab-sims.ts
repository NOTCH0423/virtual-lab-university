// Motor de simulaciones de los experimentos destacados.
// Funciona 100% en el navegador, sin base de datos.

export type SimState = Record<string, number>;
export type SimParams = Record<string, number>;

export type ParamDef = {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  unit: string;
  default: number;
};

export type Readout = { key: string; label: string; value: number; unit: string; digits?: number };

export type SceneKind =
  | 'pendulum'
  | 'projectile'
  | 'block'
  | 'bounce'
  | 'titration'
  | 'beaker'
  | 'galvanic'
  | 'molecules'
  | 'cell'
  | 'microscope'
  | 'peas';

export type SimDef = {
  slug: string;
  title: string;
  category: 'Física' | 'Química' | 'Biología';
  labId: string;
  labTitle: string;
  color: string;
  scene: SceneKind;
  description: string;
  theory: string[];
  formulas: string[];
  instructions: string[];
  params: ParamDef[];
  /** Clave del readout que se grafica en vivo */
  chart: { key: string; label: string; unit: string };
  timeScale?: number;
  init: (p: SimParams) => SimState;
  step: (s: SimState, p: SimParams, dt: number) => SimState;
  readouts: (s: SimState, p: SimParams) => Readout[];
  done?: (s: SimState, p: SimParams) => boolean;
  summary: (s: SimState, p: SimParams) => { items: { label: string; value: string }[]; conclusion: string };
};

const fmt = (v: number, d = 2) => (Number.isFinite(v) ? v.toFixed(d) : '—');
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const DEG = Math.PI / 180;

// ---------- FÍSICA ----------

const pendulum: SimDef = {
  slug: 'pendulum',
  title: 'Péndulo Simple',
  category: 'Física',
  labId: 'mecanica-clasica',
  labTitle: 'Mecánica Clásica',
  color: '#38bdf8',
  scene: 'pendulum',
  description: 'Mide el período de un péndulo y compáralo con la predicción teórica.',
  theory: [
    'Un péndulo simple es una masa puntual suspendida de un hilo inextensible. Para ángulos pequeños su movimiento es armónico simple.',
    'El período no depende de la masa ni (casi) de la amplitud: solo de la longitud del hilo y de la gravedad.',
    'El amortiguamiento representa la fricción con el aire: la amplitud decae exponencialmente.',
  ],
  formulas: ['T = 2π·√(L / g)', 'θ\'\' = −(g/L)·sin θ − b·θ\''],
  instructions: [
    'Ajusta la longitud, el ángulo inicial, la gravedad y el amortiguamiento.',
    'Pulsa Iniciar y observa la gráfica del ángulo en el tiempo.',
    'Tras 10 oscilaciones completas la simulación se detiene y muestra el período medido.',
  ],
  params: [
    { key: 'L', label: 'Longitud del hilo', min: 0.2, max: 3, step: 0.1, unit: 'm', default: 1.5 },
    { key: 'theta0', label: 'Ángulo inicial', min: 5, max: 60, step: 1, unit: '°', default: 25 },
    { key: 'g', label: 'Gravedad', min: 1.6, max: 24.8, step: 0.1, unit: 'm/s²', default: 9.8 },
    { key: 'b', label: 'Amortiguamiento', min: 0, max: 0.5, step: 0.01, unit: '1/s', default: 0.05 },
  ],
  chart: { key: 'theta', label: 'Ángulo', unit: '°' },
  done: (s) => s.crossings >= 21, // 10 oscilaciones completas
  init: (p) => ({ t: 0, theta: p.theta0 * DEG, omega: 0, crossings: 0, firstCross: -1, lastCross: -1, sign: 1 }),
  step: (s, p, dt) => {
    const n = 10;
    let { theta, omega } = s;
    const h = dt / n;
    for (let i = 0; i < n; i++) {
      omega += (-(p.g / p.L) * Math.sin(theta) - p.b * omega) * h;
      theta += omega * h;
    }
    const t = s.t + dt;
    const sign = theta >= 0 ? 1 : -1;
    let { crossings, firstCross, lastCross } = s;
    if (sign !== s.sign) {
      crossings += 1;
      if (firstCross < 0) firstCross = t;
      lastCross = t;
    }
    return { ...s, t, theta, omega, sign, crossings, firstCross, lastCross };
  },
  readouts: (s, p) => {
    const Tth = 2 * Math.PI * Math.sqrt(p.L / p.g);
    const E0 = p.g * p.L * (1 - Math.cos(p.theta0 * DEG));
    const E = 0.5 * (p.L * s.omega) ** 2 + p.g * p.L * (1 - Math.cos(s.theta));
    return [
      { key: 't', label: 'Tiempo', value: s.t, unit: 's' },
      { key: 'theta', label: 'Ángulo', value: s.theta / DEG, unit: '°', digits: 1 },
      { key: 'v', label: 'Velocidad', value: Math.abs(s.omega * p.L), unit: 'm/s' },
      { key: 'Tth', label: 'Período teórico', value: Tth, unit: 's', digits: 3 },
      { key: 'E', label: 'Energía restante', value: E0 > 0 ? (E / E0) * 100 : 0, unit: '%', digits: 0 },
    ];
  },
  summary: (s, p) => {
    const Tth = 2 * Math.PI * Math.sqrt(p.L / p.g);
    const Tm = s.crossings > 2 ? (2 * (s.lastCross - s.firstCross)) / (s.crossings - 1) : NaN;
    const err = Number.isFinite(Tm) ? (Math.abs(Tm - Tth) / Tth) * 100 : NaN;
    return {
      items: [
        { label: 'Oscilaciones completas', value: fmt(Math.max(0, (s.crossings - 1) / 2), 0) },
        { label: 'Período medido', value: `${fmt(Tm, 3)} s` },
        { label: 'Período teórico', value: `${fmt(Tth, 3)} s` },
        { label: 'Error relativo', value: `${fmt(err, 1)} %` },
      ],
      conclusion: Number.isFinite(err)
        ? err < 3
          ? 'El período medido coincide con la fórmula de ángulos pequeños.'
          : 'La diferencia se debe a la amplitud grande (la fórmula solo es exacta para ángulos pequeños).'
        : 'Deja correr la simulación más tiempo para medir al menos una oscilación completa.',
    };
  },
};

const projectile: SimDef = {
  slug: 'projectile-motion',
  title: 'Movimiento Parabólico',
  category: 'Física',
  labId: 'mecanica-clasica',
  labTitle: 'Mecánica Clásica',
  color: '#f97316',
  scene: 'projectile',
  description: 'Lanza un proyectil y mide alcance, altura máxima y tiempo de vuelo.',
  theory: [
    'Sin resistencia del aire, el movimiento horizontal es uniforme y el vertical es uniformemente acelerado.',
    'La trayectoria resultante es una parábola. Desde el suelo, el alcance máximo se logra con 45°.',
  ],
  formulas: ['x = v₀·cos θ·t', 'y = h₀ + v₀·sin θ·t − ½·g·t²', 'R = v₀²·sin(2θ) / g  (h₀ = 0)'],
  instructions: [
    'Elige velocidad inicial, ángulo y altura de lanzamiento.',
    'Pulsa Iniciar: la simulación se detiene sola cuando el proyectil toca el suelo.',
    'Compara el alcance medido con el teórico en el resumen.',
  ],
  params: [
    { key: 'v0', label: 'Velocidad inicial', min: 5, max: 40, step: 1, unit: 'm/s', default: 20 },
    { key: 'angle', label: 'Ángulo de lanzamiento', min: 5, max: 85, step: 1, unit: '°', default: 45 },
    { key: 'h0', label: 'Altura inicial', min: 0, max: 20, step: 0.5, unit: 'm', default: 0 },
    { key: 'g', label: 'Gravedad', min: 1.6, max: 24.8, step: 0.1, unit: 'm/s²', default: 9.8 },
  ],
  chart: { key: 'y', label: 'Altura', unit: 'm' },
  init: (p) => ({ t: 0, x: 0, y: p.h0, vx: p.v0 * Math.cos(p.angle * DEG), vy: p.v0 * Math.sin(p.angle * DEG), ymax: p.h0, landed: 0 }),
  step: (s, p, dt) => {
    if (s.landed) return s;
    let vy = s.vy - p.g * dt;
    let y = s.y + (s.vy + vy) * 0.5 * dt;
    let x = s.x + s.vx * dt;
    let t = s.t + dt;
    let landed = 0;
    if (y <= 0 && t > 0.01) {
      // interpolar el instante de impacto
      const a = -0.5 * p.g, b = s.vy, c = s.y;
      const disc = b * b - 4 * a * c;
      const tau = (-b - Math.sqrt(Math.max(0, disc))) / (2 * a);
      t = s.t + clamp(tau, 0, dt);
      x = s.x + s.vx * (t - s.t);
      y = 0;
      vy = s.vy - p.g * (t - s.t);
      landed = 1;
    }
    return { ...s, t, x, y, vy, ymax: Math.max(s.ymax, y), landed };
  },
  readouts: (s) => [
    { key: 't', label: 'Tiempo', value: s.t, unit: 's' },
    { key: 'x', label: 'Distancia', value: s.x, unit: 'm' },
    { key: 'y', label: 'Altura', value: s.y, unit: 'm' },
    { key: 'v', label: 'Rapidez', value: Math.hypot(s.vx, s.vy), unit: 'm/s' },
    { key: 'ymax', label: 'Altura máxima', value: s.ymax, unit: 'm' },
  ],
  done: (s) => s.landed === 1,
  summary: (s, p) => {
    const th = p.angle * DEG;
    const vy0 = p.v0 * Math.sin(th);
    const tf = (vy0 + Math.sqrt(vy0 * vy0 + 2 * p.g * p.h0)) / p.g;
    const R = p.v0 * Math.cos(th) * tf;
    const H = p.h0 + (vy0 * vy0) / (2 * p.g);
    return {
      items: [
        { label: 'Alcance medido', value: `${fmt(s.x)} m` },
        { label: 'Alcance teórico', value: `${fmt(R)} m` },
        { label: 'Altura máxima', value: `${fmt(s.ymax)} m (teórica ${fmt(H)} m)` },
        { label: 'Tiempo de vuelo', value: `${fmt(s.t)} s (teórico ${fmt(tf)} s)` },
      ],
      conclusion: s.landed
        ? `El proyectil recorrió ${fmt(s.x)} m. Prueba 45° con h₀ = 0 para obtener el alcance máximo.`
        : 'El proyectil aún no ha tocado el suelo.',
    };
  },
};

const newton: SimDef = {
  slug: 'newtons-laws',
  title: 'Leyes de Newton',
  category: 'Física',
  labId: 'mecanica-clasica',
  labTitle: 'Mecánica Clásica',
  color: '#22d3ee',
  scene: 'block',
  description: 'Empuja un bloque con fricción y comprueba F = m·a.',
  theory: [
    'Segunda ley: la aceleración de un cuerpo es proporcional a la fuerza neta e inversamente proporcional a su masa.',
    'La fricción cinética se opone al movimiento con una fuerza μ·m·g. Si la fuerza aplicada no supera la fricción estática, el bloque no se mueve.',
  ],
  formulas: ['F neta = F − μ·m·g', 'a = F neta / m', 'x = ½·a·t²'],
  instructions: [
    'Ajusta fuerza, masa y coeficiente de fricción.',
    'Pulsa Iniciar: el bloque recorre una pista de 30 m.',
    'Compara la aceleración medida con la teórica.',
  ],
  params: [
    { key: 'F', label: 'Fuerza aplicada', min: 0, max: 200, step: 1, unit: 'N', default: 60 },
    { key: 'm', label: 'Masa', min: 1, max: 50, step: 1, unit: 'kg', default: 10 },
    { key: 'mu', label: 'Coef. de fricción', min: 0, max: 0.8, step: 0.01, unit: '', default: 0.2 },
  ],
  chart: { key: 'v', label: 'Velocidad', unit: 'm/s' },
  init: () => ({ t: 0, x: 0, v: 0, a: 0 }),
  step: (s, p, dt) => {
    const fr = p.mu * p.m * 9.8;
    const net = p.F > fr || s.v > 0 ? p.F - fr : 0;
    const a = Math.max(0, net) / p.m;
    const v = s.v + a * dt;
    const x = Math.min(30, s.x + (s.v + v) * 0.5 * dt);
    return { t: s.t + dt, x, v, a };
  },
  readouts: (s, p) => [
    { key: 't', label: 'Tiempo', value: s.t, unit: 's' },
    { key: 'x', label: 'Posición', value: s.x, unit: 'm' },
    { key: 'v', label: 'Velocidad', value: s.v, unit: 'm/s' },
    { key: 'a', label: 'Aceleración', value: s.a, unit: 'm/s²' },
    { key: 'fr', label: 'Fricción', value: p.mu * p.m * 9.8, unit: 'N', digits: 1 },
  ],
  done: (s) => s.x >= 30 || s.t > 30,
  summary: (s, p) => {
    const ath = Math.max(0, p.F - p.mu * p.m * 9.8) / p.m;
    const am = s.t > 0 ? (2 * s.x) / (s.t * s.t) : 0;
    return {
      items: [
        { label: 'Aceleración medida (2x/t²)', value: `${fmt(am)} m/s²` },
        { label: 'Aceleración teórica', value: `${fmt(ath)} m/s²` },
        { label: 'Velocidad final', value: `${fmt(s.v)} m/s` },
        { label: 'Distancia', value: `${fmt(s.x)} m en ${fmt(s.t)} s` },
      ],
      conclusion:
        ath === 0
          ? 'La fuerza aplicada no supera la fricción: el bloque permanece en reposo (primera ley).'
          : 'La aceleración medida coincide con F neta / m: se cumple la segunda ley de Newton.',
    };
  },
};

const energy: SimDef = {
  slug: 'energy-conservation',
  title: 'Conservación de Energía',
  category: 'Física',
  labId: 'mecanica-clasica',
  labTitle: 'Mecánica Clásica',
  color: '#a3e635',
  scene: 'bounce',
  description: 'Deja caer una pelota y observa cómo se transforma la energía en cada rebote.',
  theory: [
    'En caída libre la energía potencial se convierte en cinética. Sin pérdidas, la energía mecánica total es constante.',
    'En cada choque con el suelo parte de la energía se disipa (calor, sonido). El coeficiente de restitución e indica qué fracción de la velocidad se conserva.',
  ],
  formulas: ['Ep = m·g·h', 'Ek = ½·m·v²', 'h₍ₙ₊₁₎ = e²·hₙ'],
  instructions: [
    'Elige altura, masa y coeficiente de restitución.',
    'Pulsa Iniciar y observa la gráfica de energía total: baja en escalones con cada rebote.',
    'La simulación termina tras 8 rebotes.',
  ],
  params: [
    { key: 'h', label: 'Altura inicial', min: 1, max: 20, step: 0.5, unit: 'm', default: 8 },
    { key: 'm', label: 'Masa', min: 0.1, max: 5, step: 0.1, unit: 'kg', default: 1 },
    { key: 'e', label: 'Coef. de restitución', min: 0.3, max: 0.98, step: 0.01, unit: '', default: 0.8 },
  ],
  chart: { key: 'Et', label: 'Energía total', unit: 'J' },
  init: (p) => ({ t: 0, y: p.h, v: 0, bounces: 0 }),
  step: (s, p, dt) => {
    if (s.bounces >= 8) return s;
    let v = s.v - 9.8 * dt;
    let y = s.y + (s.v + v) * 0.5 * dt;
    let bounces = s.bounces;
    if (y <= 0) {
      y = 0;
      v = -v * p.e;
      bounces += 1;
      if (Math.abs(v) < 0.2) bounces = 8;
    }
    return { t: s.t + dt, y, v, bounces };
  },
  readouts: (s, p) => {
    const Ep = p.m * 9.8 * s.y;
    const Ek = 0.5 * p.m * s.v * s.v;
    return [
      { key: 'y', label: 'Altura', value: s.y, unit: 'm' },
      { key: 'Ep', label: 'Energía potencial', value: Ep, unit: 'J', digits: 1 },
      { key: 'Ek', label: 'Energía cinética', value: Ek, unit: 'J', digits: 1 },
      { key: 'Et', label: 'Energía total', value: Ep + Ek, unit: 'J', digits: 1 },
      { key: 'b', label: 'Rebotes', value: s.bounces, unit: '', digits: 0 },
    ];
  },
  done: (s) => s.bounces >= 8,
  summary: (s, p) => {
    const E0 = p.m * 9.8 * p.h;
    const E = p.m * 9.8 * s.y + 0.5 * p.m * s.v * s.v;
    return {
      items: [
        { label: 'Energía inicial', value: `${fmt(E0, 1)} J` },
        { label: 'Energía final', value: `${fmt(E, 1)} J` },
        { label: 'Energía disipada', value: `${fmt(E0 > 0 ? ((E0 - E) / E0) * 100 : 0, 1)} %` },
        { label: 'Fracción conservada por rebote (e²)', value: `${fmt(p.e * p.e * 100, 1)} %` },
      ],
      conclusion: 'Entre rebotes la energía total se mantiene; solo se pierde en los choques, como predice el principio de conservación.',
    };
  },
};

// ---------- QUÍMICA ----------

function strongPH(Ca: number, Va: number, Cb: number, Vb: number) {
  const nA = Ca * Va, nB = Cb * Vb, V = (Va + Vb) / 1000;
  const diff = (nA - nB) / 1000;
  if (Math.abs(diff) < 1e-12) return 7;
  if (diff > 0) {
    const h = diff / V;
    return -Math.log10(h / 2 + Math.sqrt((h * h) / 4 + 1e-14));
  }
  const oh = -diff / V;
  return 14 + Math.log10(oh / 2 + Math.sqrt((oh * oh) / 4 + 1e-14));
}

const titration: SimDef = {
  slug: 'titration',
  title: 'Titulación Ácido-Base',
  category: 'Química',
  labId: 'quimica-general',
  labTitle: 'Química General',
  color: '#f472b6',
  scene: 'titration',
  description: 'Titula HCl con NaOH, construye la curva de pH y encuentra el punto de equivalencia.',
  theory: [
    'En una titulación ácido fuerte – base fuerte, el NaOH neutraliza al HCl: H⁺ + OH⁻ → H₂O.',
    'El punto de equivalencia (pH = 7) se alcanza cuando los moles de base igualan a los de ácido. La fenolftaleína vira a rosa por encima de pH ≈ 8,2.',
  ],
  formulas: ['Ca·Va = Cb·Vb (equivalencia)', 'pH = −log[H⁺]'],
  instructions: [
    'Fija la concentración y el volumen del ácido, la concentración de la base y la velocidad de goteo.',
    'Pulsa Iniciar: la bureta añade NaOH y la gráfica muestra la curva de pH.',
    'Observa el salto brusco de pH y el cambio de color del indicador.',
  ],
  params: [
    { key: 'Ca', label: 'Concentración HCl', min: 0.05, max: 1, step: 0.05, unit: 'M', default: 0.1 },
    { key: 'Va', label: 'Volumen HCl', min: 10, max: 50, step: 5, unit: 'mL', default: 25 },
    { key: 'Cb', label: 'Concentración NaOH', min: 0.05, max: 1, step: 0.05, unit: 'M', default: 0.1 },
    { key: 'rate', label: 'Velocidad de goteo', min: 0.5, max: 5, step: 0.5, unit: 'mL/s', default: 2 },
  ],
  chart: { key: 'pH', label: 'pH', unit: '' },
  init: (p) => ({ t: 0, Vb: 0, pH: strongPH(p.Ca, p.Va, p.Cb, 0), Veq: -1 }),
  step: (s, p, dt) => {
    const Vth = (p.Ca * p.Va) / p.Cb;
    const near = Math.abs(s.Vb - Vth) < 2 ? 0.3 : 1; // goteo lento cerca del punto final
    const Vb = Math.min(2 * Vth, s.Vb + p.rate * near * dt);
    const pH = strongPH(p.Ca, p.Va, p.Cb, Vb);
    const Veq = s.Veq < 0 && s.pH < 7 && pH >= 7 ? Vb : s.Veq;
    return { t: s.t + dt, Vb, pH, Veq };
  },
  readouts: (s, p) => [
    { key: 'Vb', label: 'NaOH añadido', value: s.Vb, unit: 'mL' },
    { key: 'pH', label: 'pH', value: s.pH, unit: '' },
    { key: 'Vth', label: 'Vol. equivalencia teórico', value: (p.Ca * p.Va) / p.Cb, unit: 'mL' },
    { key: 'ind', label: 'Indicador', value: s.pH > 8.2 ? 1 : 0, unit: s.pH > 8.2 ? '(rosa)' : '(incoloro)', digits: 0 },
  ],
  done: (s, p) => s.Vb >= (2 * p.Ca * p.Va) / p.Cb - 1e-6,
  summary: (s, p) => {
    const Vth = (p.Ca * p.Va) / p.Cb;
    const Cexp = s.Veq > 0 ? (p.Cb * s.Veq) / p.Va : NaN;
    return {
      items: [
        { label: 'Volumen de equivalencia medido', value: s.Veq > 0 ? `${fmt(s.Veq)} mL` : 'aún no alcanzado' },
        { label: 'Volumen de equivalencia teórico', value: `${fmt(Vth)} mL` },
        { label: 'Concentración de HCl calculada', value: `${fmt(Cexp, 3)} M` },
        { label: 'pH final', value: fmt(s.pH) },
      ],
      conclusion: s.Veq > 0
        ? `Con Ca·Va = Cb·Vb se obtiene [HCl] = ${fmt(Cexp, 3)} M, en acuerdo con el valor real de ${fmt(p.Ca, 3)} M.`
        : 'Aún no se ha alcanzado el punto de equivalencia.',
    };
  },
};

const kinetics: SimDef = {
  slug: 'chemistry-lab',
  title: 'Laboratorio Virtual de Química: Cinética',
  category: 'Química',
  labId: 'quimica-general',
  labTitle: 'Química General',
  color: '#34d399',
  scene: 'beaker',
  description: 'Estudia cómo la temperatura acelera una reacción de primer orden A → B.',
  theory: [
    'En una reacción de primer orden la velocidad es proporcional a la concentración del reactivo; la concentración decae exponencialmente.',
    'La ecuación de Arrhenius explica por qué al subir la temperatura más moléculas superan la energía de activación y la reacción es más rápida.',
  ],
  formulas: ['[A] = [A]₀·e^(−k·t)', 'k = A·e^(−Ea / R·T)', 't½ = ln 2 / k'],
  instructions: [
    'Ajusta concentración inicial, temperatura y energía de activación.',
    'Pulsa Iniciar y observa cómo el color del vaso cambia a medida que A se convierte en B.',
    'La simulación se detiene cuando se consume el 99 % del reactivo.',
  ],
  params: [
    { key: 'A0', label: 'Concentración inicial [A]₀', min: 0.1, max: 2, step: 0.1, unit: 'M', default: 1 },
    { key: 'T', label: 'Temperatura', min: 273, max: 373, step: 1, unit: 'K', default: 298 },
    { key: 'Ea', label: 'Energía de activación', min: 40, max: 90, step: 1, unit: 'kJ/mol', default: 60 },
  ],
  chart: { key: 'A', label: '[A]', unit: 'M' },
  init: (p) => ({ t: 0, A: p.A0 }),
  step: (s, p, dt) => {
    const k = 3.2e9 * Math.exp((-p.Ea * 1000) / (8.314 * p.T));
    return { t: s.t + dt, A: s.A * Math.exp(-k * dt) };
  },
  readouts: (s, p) => {
    const k = 3.2e9 * Math.exp((-p.Ea * 1000) / (8.314 * p.T));
    return [
      { key: 't', label: 'Tiempo', value: s.t, unit: 's', digits: 1 },
      { key: 'A', label: '[A] reactivo', value: s.A, unit: 'M', digits: 3 },
      { key: 'B', label: '[B] producto', value: p.A0 - s.A, unit: 'M', digits: 3 },
      { key: 'k', label: 'Constante k', value: k, unit: '1/s', digits: 4 },
      { key: 'conv', label: 'Conversión', value: (1 - s.A / p.A0) * 100, unit: '%', digits: 1 },
    ];
  },
  done: (s, p) => s.A <= p.A0 * 0.01 || s.t > 600,
  summary: (s, p) => {
    const k = 3.2e9 * Math.exp((-p.Ea * 1000) / (8.314 * p.T));
    return {
      items: [
        { label: 'Constante de velocidad k', value: `${fmt(k, 4)} s⁻¹` },
        { label: 'Vida media t½', value: `${fmt(Math.LN2 / k, 1)} s` },
        { label: 'Conversión alcanzada', value: `${fmt((1 - s.A / p.A0) * 100, 1)} %` },
        { label: 'Tiempo total', value: `${fmt(s.t, 1)} s` },
      ],
      conclusion: `A ${p.T} K la vida media es ${fmt(Math.LN2 / k, 1)} s. Sube 10 K y verás que la reacción se acelera notablemente.`,
    };
  },
  timeScale: 1,
};

const redox: SimDef = {
  slug: 'redox-reactions',
  title: 'Reacciones Redox: Pila de Daniell',
  category: 'Química',
  labId: 'quimica-general',
  labTitle: 'Química General',
  color: '#facc15',
  scene: 'galvanic',
  description: 'Descarga una pila Zn/Cu y mide cómo cae su voltaje según la ecuación de Nernst.',
  theory: [
    'En la pila de Daniell el zinc se oxida (ánodo) y el cobre se reduce (cátodo). Los electrones viajan por el circuito externo.',
    'A medida que la pila se descarga, [Cu²⁺] baja y [Zn²⁺] sube, y el voltaje disminuye según Nernst.',
  ],
  formulas: ['Zn → Zn²⁺ + 2e⁻ / Cu²⁺ + 2e⁻ → Cu', 'E = E° − (0,0257/2)·ln([Zn²⁺]/[Cu²⁺])', 'I = E / R'],
  instructions: [
    'Ajusta las concentraciones iniciales y la resistencia de carga.',
    'Pulsa Iniciar y observa el flujo de electrones y la gráfica del voltaje.',
    'La pila se considera agotada cuando el voltaje baja de 0,9 V o [Cu²⁺] se agota.',
  ],
  params: [
    { key: 'cu', label: '[Cu²⁺] inicial', min: 0.1, max: 2, step: 0.1, unit: 'M', default: 1 },
    { key: 'zn', label: '[Zn²⁺] inicial', min: 0.01, max: 1, step: 0.01, unit: 'M', default: 0.1 },
    { key: 'R', label: 'Resistencia de carga', min: 1, max: 50, step: 1, unit: 'Ω', default: 10 },
  ],
  chart: { key: 'E', label: 'Voltaje', unit: 'V' },
  timeScale: 3000,
  init: (p) => ({ t: 0, cu: p.cu, zn: p.zn, Q: 0 }),
  step: (s, p, dt) => {
    const E = Math.max(0, 1.1 - 0.01285 * Math.log(s.zn / Math.max(s.cu, 1e-6)));
    const I = E / p.R;
    const dn = (I * dt) / (2 * 96485) / 0.1; // celdas de 100 mL
    const cu = Math.max(1e-6, s.cu - dn);
    return { t: s.t + dt, cu, zn: s.zn + (s.cu - cu), Q: s.Q + I * dt };
  },
  readouts: (s, p) => {
    const E = Math.max(0, 1.1 - 0.01285 * Math.log(s.zn / Math.max(s.cu, 1e-6)));
    return [
      { key: 'th', label: 'Tiempo', value: s.t / 3600, unit: 'h' },
      { key: 'E', label: 'Voltaje', value: E, unit: 'V', digits: 3 },
      { key: 'I', label: 'Corriente', value: (E / p.R) * 1000, unit: 'mA', digits: 1 },
      { key: 'cu', label: '[Cu²⁺]', value: s.cu, unit: 'M', digits: 3 },
      { key: 'zn', label: '[Zn²⁺]', value: s.zn, unit: 'M', digits: 3 },
    ];
  },
  done: (s) => s.cu < 1e-3 || 1.1 - 0.01285 * Math.log(s.zn / Math.max(s.cu, 1e-6)) < 0.9,
  summary: (s, p) => ({
    items: [
      { label: 'Voltaje inicial', value: `${fmt(1.1 - 0.01285 * Math.log(p.zn / p.cu), 3)} V` },
      { label: 'Voltaje final', value: `${fmt(Math.max(0, 1.1 - 0.01285 * Math.log(s.zn / Math.max(s.cu, 1e-6))), 3)} V` },
      { label: 'Carga entregada', value: `${fmt(s.Q, 0)} C` },
      { label: 'Tiempo de funcionamiento', value: `${fmt(s.t / 3600, 2)} h` },
    ],
    conclusion: 'El voltaje se mantiene casi constante y cae bruscamente al agotarse el Cu²⁺, tal como predice la ecuación de Nernst.',
  }),
};

const stoich: SimDef = {
  slug: 'stoichiometry',
  title: 'Estequiometría: Síntesis de Agua',
  category: 'Química',
  labId: 'quimica-general',
  labTitle: 'Química General',
  color: '#60a5fa',
  scene: 'molecules',
  description: 'Combina H₂ y O₂ y descubre cuál es el reactivo limitante.',
  theory: [
    'La ecuación balanceada 2 H₂ + O₂ → 2 H₂O indica las proporciones en moles en que reaccionan las sustancias.',
    'El reactivo limitante se consume primero y determina la cantidad máxima de producto (rendimiento teórico).',
  ],
  formulas: ['2 H₂ + O₂ → 2 H₂O', 'n(H₂O) máx = mín(n(H₂), 2·n(O₂))'],
  instructions: [
    'Elige los moles iniciales de H₂ y O₂.',
    'Pulsa Iniciar: las moléculas reaccionan hasta que se agota el limitante.',
    'Revisa en el resumen qué reactivo sobra y cuánto.',
  ],
  params: [
    { key: 'h2', label: 'Moles de H₂', min: 1, max: 20, step: 1, unit: 'mol', default: 10 },
    { key: 'o2', label: 'Moles de O₂', min: 1, max: 20, step: 1, unit: 'mol', default: 4 },
    { key: 'rate', label: 'Velocidad de reacción', min: 0.5, max: 5, step: 0.5, unit: 'mol/s', default: 1.5 },
  ],
  chart: { key: 'w', label: 'H₂O formada', unit: 'mol' },
  init: (p) => ({ t: 0, h2: p.h2, o2: p.o2, w: 0 }),
  step: (s, p, dt) => {
    const ext = Math.min(p.rate * dt, s.h2 / 2, s.o2);
    return { t: s.t + dt, h2: s.h2 - 2 * ext, o2: s.o2 - ext, w: s.w + 2 * ext };
  },
  readouts: (s) => [
    { key: 't', label: 'Tiempo', value: s.t, unit: 's' },
    { key: 'h2', label: 'H₂ restante', value: s.h2, unit: 'mol' },
    { key: 'o2', label: 'O₂ restante', value: s.o2, unit: 'mol' },
    { key: 'w', label: 'H₂O formada', value: s.w, unit: 'mol' },
    { key: 'g', label: 'Masa de agua', value: s.w * 18.015, unit: 'g', digits: 1 },
  ],
  done: (s) => s.h2 < 1e-6 || s.o2 < 1e-6,
  summary: (s, p) => {
    const lim = p.h2 / 2 < p.o2 ? 'H₂' : p.h2 / 2 > p.o2 ? 'O₂' : 'Ninguno (proporción exacta)';
    return {
      items: [
        { label: 'Reactivo limitante', value: lim },
        { label: 'Agua formada', value: `${fmt(s.w)} mol (${fmt(s.w * 18.015, 1)} g)` },
        { label: 'Rendimiento teórico', value: `${fmt(Math.min(p.h2, 2 * p.o2))} mol` },
        { label: 'Exceso', value: s.h2 > 1e-6 ? `${fmt(s.h2)} mol de H₂` : s.o2 > 1e-6 ? `${fmt(s.o2)} mol de O₂` : 'Sin exceso' },
      ],
      conclusion: `El ${lim === 'H₂' || lim === 'O₂' ? lim + ' se agotó primero y limitó' : 'sistema estaba en proporción estequiométrica y limitó'} la cantidad de agua producida.`,
    };
  },
};

// ---------- BIOLOGÍA ----------

const PHASES = ['Interfase', 'Profase', 'Metafase', 'Anafase', 'Telofase', 'Citocinesis'];
const PHASE_W = [0.3, 0.2, 0.12, 0.1, 0.13, 0.15];

export function mitosisPhase(progress: number) {
  let acc = 0;
  for (let i = 0; i < PHASES.length; i++) {
    if (progress < acc + PHASE_W[i]) return { index: i, name: PHASES[i], local: (progress - acc) / PHASE_W[i] };
    acc += PHASE_W[i];
  }
  return { index: PHASES.length - 1, name: PHASES[PHASES.length - 1], local: 1 };
}

const mitosis: SimDef = {
  slug: 'mitosis',
  title: 'Mitosis',
  category: 'Biología',
  labId: 'biologia-celular',
  labTitle: 'Biología Celular',
  color: '#c084fc',
  scene: 'cell',
  description: 'Observa en 3D las fases de la mitosis y mide cuánto dura cada una.',
  theory: [
    'La mitosis divide una célula en dos células hijas genéticamente idénticas.',
    'Fases: profase (condensación de cromosomas), metafase (alineación en el ecuador), anafase (separación de cromátidas), telofase (nuevas envolturas nucleares) y citocinesis (división del citoplasma).',
    'La temperatura acelera el ciclo hasta un óptimo (~37 °C); por encima, la célula se estresa y el ciclo se ralentiza.',
  ],
  formulas: ['Duración relativa ≈ Interfase 30 % · Profase 20 % · Metafase 12 % · Anafase 10 % · Telofase 13 % · Citocinesis 15 %'],
  instructions: [
    'Ajusta el número de pares de cromosomas, la temperatura y la velocidad de observación.',
    'Pulsa Iniciar y sigue el movimiento de los cromosomas en la célula 3D.',
    'Al terminar la citocinesis verás el resumen con la duración de cada fase.',
  ],
  params: [
    { key: 'pairs', label: 'Pares de cromosomas', min: 2, max: 8, step: 1, unit: '', default: 4 },
    { key: 'temp', label: 'Temperatura', min: 20, max: 42, step: 1, unit: '°C', default: 37 },
    { key: 'speed', label: 'Velocidad de observación', min: 0.5, max: 4, step: 0.5, unit: 'x', default: 1 },
  ],
  chart: { key: 'sep', label: 'Separación de cromátidas', unit: 'µm' },
  init: () => ({ t: 0, progress: 0 }),
  step: (s, p, dt) => {
    // ciclo real ~60 min a 37 °C; en pantalla dura ~20 s / velocidad
    const tf = Math.max(0.15, Math.exp(-((p.temp - 37) ** 2) / 120));
    const cycleMin = 60 / tf;
    const progress = Math.min(1, s.progress + (dt * p.speed * tf) / 20);
    return { t: progress * cycleMin, progress };
  },
  readouts: (s) => {
    const ph = mitosisPhase(s.progress);
    const sep = ph.index < 3 ? 0 : ph.index === 3 ? ph.local * 8 : 8 + (ph.index - 3) * 0.5;
    return [
      { key: 't', label: 'Tiempo celular', value: s.t, unit: 'min', digits: 0 },
      { key: 'phase', label: 'Fase', value: ph.index + 1, unit: `/6 · ${ph.name}`, digits: 0 },
      { key: 'sep', label: 'Separación de cromátidas', value: sep, unit: 'µm', digits: 1 },
      { key: 'prog', label: 'Progreso del ciclo', value: s.progress * 100, unit: '%', digits: 0 },
    ];
  },
  done: (s) => s.progress >= 1,
  summary: (s, p) => ({
    items: [
      ...PHASES.map((n, i) => ({ label: n, value: `${fmt(s.t * PHASE_W[i], 0)} min` })),
      { label: 'Células hijas', value: `2 (cada una con ${p.pairs * 2} cromosomas)` },
    ],
    conclusion:
      Math.abs(p.temp - 37) <= 2
        ? 'A temperatura fisiológica el ciclo es más rápido. Las dos células hijas conservan el mismo número de cromosomas que la célula madre.'
        : 'Lejos de 37 °C el ciclo se alarga. Aun así, cada célula hija conserva el número de cromosomas de la madre.',
  }),
};

const cellObs: SimDef = {
  slug: 'cell-observation',
  title: 'Observación Celular al Microscopio',
  category: 'Biología',
  labId: 'biologia-celular',
  labTitle: 'Biología Celular',
  color: '#4ade80',
  scene: 'microscope',
  description: 'Enfoca, tiñe y cuenta células en una muestra de epidermis de cebolla.',
  theory: [
    'El microscopio óptico amplía la muestra mediante el objetivo y el ocular. Un enfoque correcto es imprescindible para distinguir estructuras.',
    'La tinción (p. ej. azul de metileno) aumenta el contraste del núcleo y la pared celular.',
  ],
  formulas: ['Aumento total = objetivo × ocular (10×)', 'Densidad = células contadas / área observada'],
  instructions: [
    'Selecciona el aumento, ajusta el enfoque (óptimo cerca de 50) y la intensidad de la tinción.',
    'Pulsa Iniciar: el microscopio recorre la muestra y cuenta las células detectadas.',
    'Mejor enfoque y tinción = más células detectadas correctamente.',
  ],
  params: [
    { key: 'obj', label: 'Objetivo', min: 4, max: 100, step: 4, unit: '×', default: 40 },
    { key: 'focus', label: 'Enfoque', min: 0, max: 100, step: 1, unit: '', default: 40 },
    { key: 'stain', label: 'Tinción', min: 0, max: 100, step: 1, unit: '%', default: 60 },
  ],
  chart: { key: 'count', label: 'Células contadas', unit: '' },
  init: () => ({ t: 0, count: 0, scanned: 0 }),
  step: (s, p, dt) => {
    const clarity = Math.exp(-((p.focus - 50) ** 2) / 300) * (0.4 + 0.6 * (p.stain / 100));
    const scanned = Math.min(100, s.scanned + dt * 8);
    const density = 400 / p.obj; // células por campo
    return { t: s.t + dt, scanned, count: s.count + (scanned - s.scanned) * density * clarity * 0.25 };
  },
  readouts: (s, p) => {
    const clarity = Math.exp(-((p.focus - 50) ** 2) / 300) * (0.4 + 0.6 * (p.stain / 100));
    return [
      { key: 'mag', label: 'Aumento total', value: p.obj * 10, unit: '×', digits: 0 },
      { key: 'clar', label: 'Nitidez', value: clarity * 100, unit: '%', digits: 0 },
      { key: 'scan', label: 'Muestra recorrida', value: s.scanned, unit: '%', digits: 0 },
      { key: 'count', label: 'Células contadas', value: s.count, unit: '', digits: 0 },
    ];
  },
  done: (s) => s.scanned >= 100,
  summary: (s, p) => {
    const clarity = Math.exp(-((p.focus - 50) ** 2) / 300) * (0.4 + 0.6 * (p.stain / 100));
    return {
      items: [
        { label: 'Aumento total', value: `${p.obj * 10}×` },
        { label: 'Células contadas', value: fmt(s.count, 0) },
        { label: 'Nitidez media', value: `${fmt(clarity * 100, 0)} %` },
        { label: 'Calidad de la observación', value: clarity > 0.8 ? 'Excelente' : clarity > 0.5 ? 'Aceptable' : 'Deficiente' },
      ],
      conclusion: clarity > 0.8 ? 'Muestra bien enfocada y teñida: se distinguen pared celular y núcleo.' : 'Mejora el enfoque (≈50) y la tinción para detectar más células.',
    };
  },
};

const GENO = ['AA', 'Aa', 'aa'];
const mendel: SimDef = {
  slug: 'mendelian-inheritance',
  title: 'Herencia Mendeliana',
  category: 'Biología',
  labId: 'biologia-celular',
  labTitle: 'Biología Celular',
  color: '#fbbf24',
  scene: 'peas',
  description: 'Cruza plantas de guisante y compara las proporciones observadas con las de Mendel.',
  theory: [
    'Mendel demostró que cada carácter está determinado por dos alelos, uno de cada progenitor. El alelo dominante (A, amarillo) enmascara al recesivo (a, verde).',
    'En un cruce Aa × Aa se espera una proporción fenotípica 3:1 y genotípica 1:2:1. Con pocas muestras el azar produce desviaciones.',
  ],
  formulas: ['Aa × Aa → 1 AA : 2 Aa : 1 aa', 'χ² = Σ (O − E)² / E'],
  instructions: [
    'Elige el genotipo de cada progenitor (0 = AA, 1 = Aa, 2 = aa) y el número de descendientes.',
    'Pulsa Iniciar: cada guisante aparece en 3D con su color.',
    'Compara la proporción observada con la esperada en el resumen.',
  ],
  params: [
    { key: 'p1', label: 'Progenitor 1 (0=AA, 1=Aa, 2=aa)', min: 0, max: 2, step: 1, unit: '', default: 1 },
    { key: 'p2', label: 'Progenitor 2 (0=AA, 1=Aa, 2=aa)', min: 0, max: 2, step: 1, unit: '', default: 1 },
    { key: 'n', label: 'Descendientes', min: 20, max: 400, step: 20, unit: '', default: 200 },
  ],
  chart: { key: 'dom', label: '% fenotipo dominante', unit: '%' },
  init: () => ({ t: 0, AA: 0, Aa: 0, aa: 0, acc: 0, seed: 12345 }),
  step: (s, p, dt) => {
    const total = s.AA + s.Aa + s.aa;
    if (total >= p.n) return s;
    let acc = s.acc + dt * Math.max(10, p.n / 8);
    let { AA, Aa, aa, seed } = s;
    const allele = (g: number) => {
      seed = (seed * 1103515245 + 12345) % 2147483648;
      const r = seed / 2147483648;
      return g === 0 ? 1 : g === 2 ? 0 : r < 0.5 ? 1 : 0;
    };
    while (acc >= 1 && AA + Aa + aa < p.n) {
      const k = allele(p.p1) + allele(p.p2);
      if (k === 2) AA++;
      else if (k === 1) Aa++;
      else aa++;
      acc -= 1;
    }
    return { t: s.t + dt, AA, Aa, aa, acc, seed };
  },
  readouts: (s) => {
    const tot = s.AA + s.Aa + s.aa;
    return [
      { key: 'tot', label: 'Descendientes', value: tot, unit: '', digits: 0 },
      { key: 'AA', label: 'AA', value: s.AA, unit: '', digits: 0 },
      { key: 'Aa', label: 'Aa', value: s.Aa, unit: '', digits: 0 },
      { key: 'aa', label: 'aa', value: s.aa, unit: '', digits: 0 },
      { key: 'dom', label: '% amarillos', value: tot ? ((s.AA + s.Aa) / tot) * 100 : 0, unit: '%', digits: 1 },
    ];
  },
  done: (s, p) => s.AA + s.Aa + s.aa >= p.n,
  summary: (s, p) => {
    const tot = s.AA + s.Aa + s.aa || 1;
    const pa = (g: number) => (g === 0 ? 1 : g === 2 ? 0 : 0.5);
    const a1 = pa(p.p1), a2 = pa(p.p2);
    const exp = [a1 * a2, a1 * (1 - a2) + (1 - a1) * a2, (1 - a1) * (1 - a2)];
    const obs = [s.AA, s.Aa, s.aa];
    const chi = exp.reduce((acc, e, i) => (e > 0 ? acc + (obs[i] - e * tot) ** 2 / (e * tot) : acc), 0);
    return {
      items: [
        { label: 'Cruce', value: `${GENO[p.p1]} × ${GENO[p.p2]}` },
        { label: 'Observado AA : Aa : aa', value: `${s.AA} : ${s.Aa} : ${s.aa}` },
        { label: 'Esperado AA : Aa : aa', value: exp.map((e) => fmt(e * tot, 0)).join(' : ') },
        { label: 'Amarillos / verdes', value: `${s.AA + s.Aa} / ${s.aa}` },
        { label: 'χ²', value: fmt(chi, 2) },
      ],
      conclusion: chi < 5.99 ? 'χ² < 5,99: las diferencias se explican por azar; los datos confirman las leyes de Mendel.' : 'χ² alto: con más descendientes la proporción debería acercarse a la esperada.',
    };
  },
};

export const SIMS: Record<string, SimDef> = Object.fromEntries(
  [pendulum, projectile, newton, energy, titration, kinetics, redox, stoich, mitosis, cellObs, mendel].map((s) => [s.slug, s])
);

export function getSim(slug: string): SimDef | undefined {
  return SIMS[slug];
}
