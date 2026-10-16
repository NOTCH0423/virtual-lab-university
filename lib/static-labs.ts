// Catálogo estático de laboratorios: se usa cuando la API / base de datos no responde.
// Debe mantenerse alineado con prisma/seed.ts.

type Exp = { id: string; title: string; description: string; minutes: number; difficulty: string };
type Lab = {
  id: string;
  title: string;
  category: 'physics' | 'chemistry' | 'biology' | 'engineering';
  description: string;
  image: string;
  minutes: number;
  difficulty: string;
  level: number;
  instructor: string;
  requirements: string[];
  experiments: Exp[];
};

const img = (id: string, w = 1200) => `https://images.unsplash.com/${id}?w=${w}&q=80`;

export const STATIC_LABS: Lab[] = [
  {
    id: 'mecanica-clasica', title: 'Mecánica Clásica', category: 'physics', minutes: 120, difficulty: 'Intermedio', level: 2,
    description: 'Estudia las leyes del movimiento de Newton, cinemática de partículas, dinámica de sistemas y conservación de energía. Incluye experimentos de caída libre, péndulos y planos inclinados.',
    image: img('photo-1635070041078-e363dbe005cb'), instructor: 'Dr. Roberto Silva',
    requirements: ['Álgebra elemental', 'Trigonometría básica', 'Conceptos de vectores'],
    experiments: [
      { id: 'pendulum', title: 'Péndulo Simple', description: 'Estudia el movimiento armónico simple de un péndulo y determina g.', minutes: 30, difficulty: 'Básico' },
      { id: 'projectile-motion', title: 'Movimiento Parabólico', description: 'Analiza el movimiento de proyectiles bajo gravedad.', minutes: 45, difficulty: 'Intermedio' },
      { id: 'newtons-laws', title: 'Leyes de Newton', description: 'Aplica las tres leyes de Newton a diferentes escenarios.', minutes: 50, difficulty: 'Intermedio' },
      { id: 'energy-conservation', title: 'Conservación de Energía', description: 'Estudia la transformación entre energía cinética y potencial.', minutes: 40, difficulty: 'Intermedio' },
    ],
  },
  {
    id: 'quimica-general', title: 'Química General', category: 'chemistry', minutes: 90, difficulty: 'Básico', level: 1,
    description: 'Estudia las propiedades de la materia, reacciones químicas, estequiometría y tablas periódicas. Incluye laboratorio virtual de reacciones ácido-base.',
    image: img('photo-1532187863486-abf9dbad1b69'), instructor: 'Dra. Carmen Herrera',
    requirements: ['Nomenclatura química básica', 'Concepto de mol', 'Logaritmos'],
    experiments: [
      { id: 'chemistry-lab', title: 'Laboratorio Virtual de Química', description: 'Estudia la velocidad de reacción y el efecto de la temperatura.', minutes: 60, difficulty: 'Básico' },
      { id: 'titration', title: 'Titulación Ácido-Base', description: 'Realiza una titulación para determinar la concentración de una solución desconocida.', minutes: 40, difficulty: 'Intermedio' },
      { id: 'redox-reactions', title: 'Reacciones de Oxidación-Reducción', description: 'Descarga una pila de Daniell y aplica la ecuación de Nernst.', minutes: 45, difficulty: 'Intermedio' },
      { id: 'stoichiometry', title: 'Estequiometría', description: 'Cálculos de reacciones químicas, reactivo limitante y rendimiento.', minutes: 45, difficulty: 'Intermedio' },
    ],
  },
  {
    id: 'biologia-celular', title: 'Biología Celular', category: 'biology', minutes: 100, difficulty: 'Intermedio', level: 2,
    description: 'Explora la estructura celular, organelos, mitosis y meiosis. Incluye visualización 3D de células eucariotas y procariotas.',
    image: img('photo-1576086213369-97a306d36557'), instructor: 'Dr. Miguel Ángel Torres',
    requirements: ['Biología general', 'Estructura de la célula'],
    experiments: [
      { id: 'mitosis', title: 'Mitosis', description: 'Observa en 3D las fases de la división celular.', minutes: 50, difficulty: 'Intermedio' },
      { id: 'cell-observation', title: 'Observación Celular', description: 'Identifica estructuras celulares al microscopio.', minutes: 40, difficulty: 'Básico' },
      { id: 'mendelian-inheritance', title: 'Herencia Mendeliana', description: 'Predice resultados de cruzamientos monohíbridos.', minutes: 50, difficulty: 'Avanzado' },
    ],
  },
  {
    id: 'termodinamica', title: 'Termodinámica', category: 'physics', minutes: 150, difficulty: 'Avanzado', level: 3,
    description: 'Estudia las leyes de la termodinámica, ciclos de calor, entropía y máquinas térmicas. Incluye simulaciones de gases ideales.',
    image: img('photo-1507413245164-6160d8298b31'), instructor: 'Dr. Roberto Silva',
    requirements: ['Cálculo diferencial', 'Mecánica clásica'],
    experiments: [
      { id: 'gas-simulation', title: 'Simulación de Gases Ideales', description: 'Verifica la ecuación de estado PV = nRT.', minutes: 55, difficulty: 'Avanzado' },
      { id: 'thermodynamics-laws', title: 'Leyes de la Termodinámica', description: 'Aplica las leyes de la termodinámica a sistemas cerrados.', minutes: 55, difficulty: 'Avanzado' },
    ],
  },
  {
    id: 'analisis-circuitos', title: 'Análisis de Circuitos', category: 'engineering', minutes: 130, difficulty: 'Avanzado', level: 3,
    description: 'Circuitos eléctricos, leyes de Kirchhoff, análisis nodal y de malla. Incluye simulaciones de circuitos RC, RL y RLC.',
    image: img('photo-1518770660439-4636190af475'), instructor: 'Ing. José Mendoza',
    requirements: ['Ley de Ohm', 'Álgebra lineal básica'],
    experiments: [
      { id: 'circuit-analysis', title: 'Análisis de Circuitos Eléctricos', description: 'Construye y analiza circuitos con resistencias, capacitores e inductores.', minutes: 60, difficulty: 'Avanzado' },
      { id: 'rc-rl-circuits', title: 'Circuitos RC y RL', description: 'Analiza circuitos con resistores y capacitores o inductores.', minutes: 60, difficulty: 'Avanzado' },
    ],
  },
  {
    id: 'genetica-molecular', title: 'Genética Molecular', category: 'biology', minutes: 110, difficulty: 'Avanzado', level: 3,
    description: 'ADN, ARN, síntesis de proteínas, herencia mendeliana y mutaciones genéticas. Incluye simulaciones de cruzamientos.',
    image: img('photo-1530026405186-ed1f139313f8'), instructor: 'Dra. Lucía Pérez',
    requirements: ['Biología celular'],
    experiments: [
      { id: 'mendelian-inheritance', title: 'Herencia Mendeliana', description: 'Simula cruces y compara con las proporciones de Mendel.', minutes: 50, difficulty: 'Avanzado' },
    ],
  },
  {
    id: 'optica-ondas', title: 'Óptica y Ondas', category: 'physics', minutes: 95, difficulty: 'Intermedio', level: 2,
    description: 'Reflexión, refracción, difracción, interferencia y polarización de la luz. Incluye experimentos con lentes y espejos.',
    image: img('photo-1603126857599-f6e157fa2fe6'), instructor: 'Dr. Fernando Castro',
    requirements: ['Trigonometría', 'Ondas básicas'],
    experiments: [
      { id: 'atomic-structure', title: 'Estructura Atómica', description: 'Explora niveles de energía y configuración electrónica.', minutes: 45, difficulty: 'Intermedio' },
    ],
  },
  {
    id: 'quimica-organica', title: 'Química Orgánica', category: 'chemistry', minutes: 140, difficulty: 'Avanzado', level: 3,
    description: 'Grupos funcionales, reacciones orgánicas, isomería y síntesis de compuestos. Incluye laboratorio de nomenclatura IUPAC.',
    image: img('photo-1576045057995-568f588f82fb'), instructor: 'Dra. Carmen Herrera',
    requirements: ['Química general'],
    experiments: [
      { id: 'stoichiometry', title: 'Estequiometría', description: 'Reactivo limitante y rendimiento de reacción.', minutes: 45, difficulty: 'Intermedio' },
      { id: 'chemistry-lab', title: 'Cinética Química', description: 'Velocidad de reacción y ecuación de Arrhenius.', minutes: 60, difficulty: 'Básico' },
    ],
  },
];

/** Alias usados por enlaces antiguos de la portada. */
const ALIASES: Record<string, string> = {
  'physics-mechanics': 'mecanica-clasica',
  'chemistry-organic': 'quimica-organica',
  'biology-cells': 'biologia-celular',
};

export function findStaticLab(id: string) {
  const key = ALIASES[id] ?? id;
  return STATIC_LABS.find((l) => l.id === key);
}

export function staticLabList() {
  return STATIC_LABS.map((l) => ({
    id: l.id,
    title: l.title,
    category: l.category,
    description: l.description,
    image: img(l.image.split('/').pop()!.split('?')[0], 800),
    experiments: l.experiments.length,
    students: 0,
    rating: 4.8,
    duration: `${l.minutes} min`,
    difficulty: l.difficulty,
    level: l.level,
    instructor: l.instructor,
  }));
}

export function staticLabDetail(id: string) {
  const l = findStaticLab(id);
  if (!l) return null;
  return {
    id: l.id,
    title: l.title,
    category: l.category,
    description: l.description,
    longDescription: l.description,
    image: l.image,
    experimentCount: l.experiments.length,
    students: 0,
    rating: 4.8,
    duration: `${l.minutes} min`,
    difficulty: l.difficulty,
    level: l.level,
    instructor: l.instructor,
    lastUpdated: 'octubre de 2026',
    requirements: l.requirements,
    experiments: l.experiments.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      duration: `${e.minutes} min`,
      difficulty: e.difficulty,
      completed: false,
      score: null,
      progress: 0,
      locked: false,
      image: img('photo-1532094349884-543bc11b234d', 400),
    })),
    overallProgress: 0,
    completedCount: 0,
  };
}

/** Normaliza categorías de la BD (FISICA, QUIMICA…) al formato del front. */
export function normalizeCategory(c: string) {
  const k = c.toLowerCase();
  if (k.startsWith('fis') || k.startsWith('phys')) return 'physics';
  if (k.startsWith('quim') || k.startsWith('chem')) return 'chemistry';
  if (k.startsWith('bio')) return 'biology';
  if (k.startsWith('ing') || k.startsWith('eng')) return 'engineering';
  return k;
}
