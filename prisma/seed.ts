import prisma from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🧪 Starting Virtual Lab University seed...');
  console.log('═══════════════════════════════════════════');

  await prisma.experimentResult.deleteMany();
  await prisma.experimentProgress.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.experiment.deleteMany();
  await prisma.laboratory.deleteMany();
  await prisma.dailyStats.deleteMany();
  await prisma.systemStats.deleteMany();
  await prisma.course.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Cleaned existing data');

  // ============================================
  // USERS - 15 estudiantes reales de universidades
  // ============================================
  const hashedPasswords = {
    admin: await bcrypt.hash('admin123', 10),
    demo: await bcrypt.hash('demo123', 10),
    teacher: await bcrypt.hash('profesor123', 10),
    student1: await bcrypt.hash('maria2024', 10),
    student2: await bcrypt.hash('carlos2024', 10),
    student3: await bcrypt.hash('laura2024', 10),
    student4: await bcrypt.hash('juan2024', 10),
    student5: await bcrypt.hash('sofia2024', 10),
    student6: await bcrypt.hash('pedro2024', 10),
    student7: await bcrypt.hash('ana2024', 10),
    student8: await bcrypt.hash('luis2024', 10),
  };

  // Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@virtuallab.edu',
      password: hashedPasswords.admin,
      name: 'Administrador del Sistema',
      firstName: 'Admin',
      lastName: 'System',
      role: 'ADMIN',
      status: 'ACTIVE',
      university: 'Virtual Lab University',
      bio: 'Administrador principal del sistema Virtual Lab University',
    },
  });

  // Teacher
  const teacher = await prisma.user.create({
    data: {
      email: 'profesor@virtuallab.edu',
      password: hashedPasswords.teacher,
      name: 'Dr. Roberto Silva Pérez',
      firstName: 'Roberto',
      lastName: 'Silva Pérez',
      role: 'TEACHER',
      status: 'ACTIVE',
      university: 'Universidad Nacional de Ingeniería',
      career: 'Ciencias Físicas',
      bio: 'Doctor en Física por la Universidad de Madrid. 15 años de experiencia en educación universitaria.',
    },
  });

  // Demo student
  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@virtuallab.edu',
      password: hashedPasswords.demo,
      name: 'Usuario Demo',
      firstName: 'Demo',
      lastName: 'User',
      role: 'STUDENT',
      status: 'ACTIVE',
      university: 'Universidad Virtual Demo',
      career: 'Ingeniería de Sistemas',
    },
  });

  // Real students
  const students = await Promise.all([
    prisma.user.create({
      data: {
        email: 'maria.garcia@uni.edu.pe',
        password: hashedPasswords.student1,
        name: 'María García López',
        firstName: 'María',
        lastName: 'García López',
        role: 'STUDENT',
        status: 'ACTIVE',
        university: 'Universidad Nacional Mayor de San Marcos',
        career: 'Química',
        lastActiveAt: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: 'carlos.lopez@uni.edu.pe',
        password: hashedPasswords.student2,
        name: 'Carlos López Martínez',
        firstName: 'Carlos',
        lastName: 'López Martínez',
        role: 'STUDENT',
        status: 'ACTIVE',
        university: 'Universidad Peruana Cayetano Heredia',
        career: 'Física',
        lastActiveAt: new Date(Date.now() - 3600000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'laura.torres@uni.edu.pe',
        password: hashedPasswords.student3,
        name: 'Laura Torres Rivera',
        firstName: 'Laura',
        lastName: 'Torres Rivera',
        role: 'STUDENT',
        status: 'ACTIVE',
        university: 'Universidad Nacional de Ingeniería',
        career: 'Ingeniería Electrónica',
        lastActiveAt: new Date(Date.now() - 7200000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'juan.perez@uni.edu.pe',
        password: hashedPasswords.student4,
        name: 'Juan Pérez Sánchez',
        firstName: 'Juan',
        lastName: 'Pérez Sánchez',
        role: 'STUDENT',
        status: 'ACTIVE',
        university: 'Universidad de Lima',
        career: 'Biología',
        lastActiveAt: new Date(Date.now() - 86400000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'sofia.rodriguez@uni.edu.pe',
        password: hashedPasswords.student5,
        name: 'Sofía Rodríguez Castro',
        firstName: 'Sofía',
        lastName: 'Rodríguez Castro',
        role: 'STUDENT',
        status: 'ACTIVE',
        university: 'Universidad Nacional Mayor de San Marcos',
        career: 'Medicina',
        lastActiveAt: new Date(Date.now() - 172800000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'pedro.sanchez@uni.edu.pe',
        password: hashedPasswords.student6,
        name: 'Pedro Sánchez Morales',
        firstName: 'Pedro',
        lastName: 'Sánchez Morales',
        role: 'STUDENT',
        status: 'SUSPENDED',
        university: 'Universidad Nacional de San Agustín',
        career: 'Ingeniería Mecánica',
        lastActiveAt: new Date(Date.now() - 604800000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'ana.martinez@uni.edu.pe',
        password: hashedPasswords.student7,
        name: 'Ana Martínez Fernández',
        firstName: 'Ana',
        lastName: 'Martínez Fernández',
        role: 'STUDENT',
        status: 'ACTIVE',
        university: 'Universidad de San Martín de Porres',
        career: 'Farmacia',
        lastActiveAt: new Date(Date.now() - 259200000),
      },
    }),
    prisma.user.create({
      data: {
        email: 'luis.ramirez@uni.edu.pe',
        password: hashedPasswords.student8,
        name: 'Luis Ramírez Vega',
        firstName: 'Luis',
        lastName: 'Ramírez Vega',
        role: 'STUDENT',
        status: 'BANNED',
        university: 'Universidad Católica San Pablo',
        career: 'Ingeniería Civil',
        lastActiveAt: new Date(Date.now() - 1209600000),
      },
    }),
  ]);

  const allUsers = [admin, teacher, demoUser, ...students];
  console.log(`✅ Created ${allUsers.length} users`);

  // ============================================
  // LABORATORIES - 8 laboratorios reales
  // ============================================
  const laboratories = await Promise.all([
    prisma.laboratory.create({
      data: {
        title: 'Mecánica Clásica',
        slug: 'mecanica-clasica',
        description: 'Estudia las leyes del movimiento de Newton, cinemática de partículas, dinámica de sistemas y conservación de energía. Incluye experimentos de caída libre, péndulos y planos inclinados.',
        category: 'FISICA',
        difficulty: 'INTERMEDIO',
        status: 'PUBLISHED',
        instructor: 'Dr. Roberto Silva',
        requirements: 'Conocimientos básicos de cálculo diferencial e integral',
        duration: 120,
        order: 1,
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
      },
    }),
    prisma.laboratory.create({
      data: {
        title: 'Química General',
        slug: 'quimica-general',
        description: 'Estudia las propiedades de la materia, reacciones químicas, estequiometría y tablas periódicas. Incluye laboratorio virtual de reacciones ácido-base.',
        category: 'QUIMICA',
        difficulty: 'BASICO',
        status: 'PUBLISHED',
        instructor: 'Dra. Carmen Herrera',
        requirements: 'Ninguno',
        duration: 90,
        order: 2,
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69',
      },
    }),
    prisma.laboratory.create({
      data: {
        title: 'Biología Celular',
        slug: 'biologia-celular',
        description: 'Explora la estructura celular, organelos, mitosis y meiosis. Incluye visualización 3D de células eucariotas y procariotas.',
        category: 'BIOLOGIA',
        difficulty: 'INTERMEDIO',
        status: 'PUBLISHED',
        instructor: 'Dr. Miguel Ángel Torres',
        requirements: 'Conocimientos básicos de biología',
        duration: 100,
        order: 3,
        image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557',
      },
    }),
    prisma.laboratory.create({
      data: {
        title: 'Termodinámica',
        slug: 'termodinamica',
        description: 'Estudia las leyes de la termodinámica, ciclos de calor, entropía y máquinas térmicas. Incluye simulaciones de gases ideales.',
        category: 'FISICA',
        difficulty: 'AVANZADO',
        status: 'PUBLISHED',
        instructor: 'Dr. Roberto Silva',
        requirements: 'Física general, cálculo multivariable',
        duration: 150,
        order: 4,
        image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31',
      },
    }),
    prisma.laboratory.create({
      data: {
        title: 'Análisis de Circuitos',
        slug: 'analisis-circuitos',
        description: 'Circuits eléctricos, leyes de Kirchhoff, análisis nodal y de malla. Incluye simulaciones de circuitos RC, RL y RLC.',
        category: 'INGENIERIA',
        difficulty: 'AVANZADO',
        status: 'PUBLISHED',
        instructor: 'Ing. José Mendoza',
        requirements: 'Álgebra lineal, fundamentos de electricidad',
        duration: 130,
        order: 5,
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      },
    }),
    prisma.laboratory.create({
      data: {
        title: 'Genética Molecular',
        slug: 'genetica-molecular',
        description: 'ADN, ARN, síntesis de proteínas, herencia mendeliana y mutaciones genéticas. Incluye simulaciones de cruzamientos.',
        category: 'BIOLOGIA',
        difficulty: 'AVANZADO',
        status: 'PUBLISHED',
        instructor: 'Dra. Lucía Pérez',
        requirements: 'Biología celular, fundamentos de genética',
        duration: 110,
        order: 6,
        image: 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8',
      },
    }),
    prisma.laboratory.create({
      data: {
        title: 'Óptica y Ondas',
        slug: 'optica-ondas',
        description: 'Reflexión, refracción, difracción, interferencia y polarización de la luz. Incluye experimentos con lentes y espejos.',
        category: 'FISICA',
        difficulty: 'INTERMEDIO',
        status: 'PUBLISHED',
        instructor: 'Dr. Fernando Castro',
        requirements: 'Geometría, trigonometría básica',
        duration: 95,
        order: 7,
        image: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6',
      },
    }),
    prisma.laboratory.create({
      data: {
        title: 'Química Orgánica',
        slug: 'quimica-organica',
        description: 'Grupos funcionales, reacciones orgánicas, isomería y síntesis de compuestos. Incluye laboratorio de nomenclatura IUPAC.',
        category: 'QUIMICA',
        difficulty: 'AVANZADO',
        status: 'DRAFT',
        instructor: 'Dra. Carmen Herrera',
        requirements: 'Química general, enlaces químicos',
        duration: 140,
        order: 8,
        image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb',
      },
    }),
  ]);
  console.log(`✅ Created ${laboratories.length} laboratories`);

  // ============================================
  // EXPERIMENTS - 16 experimentos reales
  // ============================================
  const mechanicsLab = laboratories[0];
  const chemistryLab = laboratories[1];
  const biologyLab = laboratories[2];
  const thermoLab = laboratories[3];
  const circuitsLab = laboratories[4];
  const geneticsLab = laboratories[5];
  const opticsLab = laboratories[6];

  const experiments = await Promise.all([
    // Mecánica Clásica
    prisma.experiment.create({
      data: {
        laboratoryId: mechanicsLab.id,
        title: 'Péndulo Simple',
        slug: 'pendulum',
        description: 'Estudia el movimiento armónico simple de un péndulo y determina g.',
        category: 'FISICA',
        difficulty: 'BASICO',
        duration: 30,
        order: 1,
        theory: 'Un péndulo simple consiste en una masa suspendida de un punto fijo mediante un hilo inextensible. El período depende de la longitud y la gravedad.',
        formulas: 'T = 2π√(L/g)',
        instructions: '1. Ajusta la longitud del péndulo\n2. Desplaza la masa 10°\n3. Suelta y mide 10 oscilaciones\n4. Calcula el período promedio',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
      },
    }),
    prisma.experiment.create({
      data: {
        laboratoryId: mechanicsLab.id,
        title: 'Movimiento Parabólico',
        slug: 'projectile-motion',
        description: 'Analiza el movimiento de proyectiles bajo gravedad.',
        category: 'FISICA',
        difficulty: 'INTERMEDIO',
        duration: 45,
        order: 2,
        theory: 'El movimiento parabólico combina movimiento horizontal uniforme y vertical uniformemente acelerado por la gravedad.',
        formulas: 'x = v₀cos(θ)t, y = v₀sin(θ)t - ½gt²',
        instructions: '1. Ajusta el ángulo de lanzamiento\n2. Configura la velocidad inicial\n3. Lanza el proyectil\n4. Analiza la trayectoria',
        image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31',
      },
    }),

    // Química General
    prisma.experiment.create({
      data: {
        laboratoryId: chemistryLab.id,
        title: 'Laboratorio Virtual de Química',
        slug: 'chemistry-lab',
        description: 'Experimenta con reacciones químicas de forma segura en un laboratorio virtual completo.',
        category: 'QUIMICA',
        difficulty: 'BASICO',
        duration: 60,
        order: 1,
        theory: 'Las reacciones químicas transforman sustancias. Los reactivos se combinan para formar productos con nuevas propiedades.',
        formulas: 'HA + BOH → BA + H₂O',
        instructions: '1. Selecciona reactivos del panel izquierdo\n2. Agrégalos a los recipientes\n3. Mezcla y observa las reacciones\n4. Analiza los resultados',
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69',
      },
    }),
    prisma.experiment.create({
      data: {
        laboratoryId: chemistryLab.id,
        title: 'Titulación Ácido-Base',
        slug: 'titration',
        description: 'Realiza una titulación para determinar la concentración de una solución desconocida.',
        category: 'QUIMICA',
        difficulty: 'INTERMEDIO',
        duration: 40,
        order: 2,
        theory: 'La titulación es un método analítico para determinar la concentración de un analito mediante la reacción con una solución de concentración conocida.',
        formulas: 'C₁V₁ = C₂V₂',
        instructions: '1. Prepara la bureta con la solución estándar\n2. Agrega el indicador\n3. Titula gota a gota hasta el punto de equivalencia\n4. Calcula la concentración',
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69',
      },
    }),

    // Biología Celular
    prisma.experiment.create({
      data: {
        laboratoryId: biologyLab.id,
        title: 'Mitosis y Meiosis',
        slug: 'mitosis',
        description: 'Observa y compara los procesos de división celular mitótica y meiótica.',
        category: 'BIOLOGIA',
        difficulty: 'INTERMEDIO',
        duration: 50,
        order: 1,
        theory: 'Mitosis: división celular que produce dos células hijas idénticas. Meiosis: produce cuatro células hijas con la mitad de cromosomas.',
        instructions: '1. Selecciona el tipo de división celular\n2. Observa cada fase\n3. Identifica los cambios en los cromosomas\n4. Compara los resultados',
        image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557',
      },
    }),

    // Termodinámica
    prisma.experiment.create({
      data: {
        laboratoryId: thermoLab.id,
        title: 'Simulación de Gases Ideales',
        slug: 'gas-simulation',
        description: 'Simula el comportamiento de gases ideales y verifica la ecuación de estado PV = nRT.',
        category: 'FISICA',
        difficulty: 'AVANZADO',
        duration: 55,
        order: 1,
        theory: 'La ley de los gases ideales relaciona presión, volumen, temperatura y cantidad de sustancia. PV = nRT describe el comportamiento de un gas ideal.',
        formulas: 'PV = nRT',
        instructions: '1. Configura las condiciones iniciales del gas\n2. Varía la temperatura, presión o volumen\n3. Observa cómo cambian las propiedades\n4. Verifica la ecuación de estado',
        image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31',
      },
    }),

    // Análisis de Circuitos
    prisma.experiment.create({
      data: {
        laboratoryId: circuitsLab.id,
        title: 'Análisis de Circuitos Eléctricos',
        slug: 'circuit-analysis',
        description: 'Construye y analiza circuitos eléctricos con resistencias, capacitores e inductores.',
        category: 'INGENIERIA',
        difficulty: 'AVANZADO',
        duration: 60,
        order: 1,
        theory: 'Las leyes de Kirchhoff y Ohm son fundamentales para el análisis de circuitos eléctricos. V = IR, ΣV = 0, ΣI = 0.',
        formulas: 'V = IR, P = IV',
        instructions: '1. Selecciona los componentes del circuito\n2. Conecta los elementos\n3. Mide voltajes y corrientes\n4. Verifica las leyes de Kirchhoff',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      },
    }),

    // Estructura Atómica (nuevo laboratorio)
    prisma.experiment.create({
      data: {
        laboratoryId: opticsLab.id,
        title: 'Estructura Atómica',
        slug: 'atomic-structure',
        description: 'Explora la estructura del átomo, niveles de energía y configuración electrónica.',
        category: 'FISICA',
        difficulty: 'INTERMEDIO',
        duration: 45,
        order: 2,
        theory: 'El átomo está compuesto por protones, neutrones y electrones. Los electrones ocupan niveles de energía cuantizados alrededor del núcleo.',
        formulas: 'E = -13.6 eV / n²',
        instructions: '1. Selecciona un elemento\n2. Observa la distribución electrónica\n3. Excita los electrones\n4. Analiza las transiciones de energía',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
      },
    }),

    // Más experimentos para Mecánica
    prisma.experiment.create({
      data: {
        laboratoryId: mechanicsLab.id,
        title: 'Leyes de Newton',
        slug: 'newtons-laws',
        description: 'Aplica las tres leyes de Newton a diferentes escenarios.',
        category: 'FISICA',
        difficulty: 'INTERMEDIO',
        duration: 50,
        order: 3,
        theory: '1ª Ley: Inercia - Un cuerpo en reposo permanece en reposo.\n2ª Ley: F = ma - La fuerza equals masa times aceleración.\n3ª Ley: Acción-Reacción - Para cada acción hay una reacción igual y opuesta.',
        formulas: 'F = ma',
        instructions: '1. Observa cada ley en acción\n2. Realiza mediciones\n3. Grafica resultados',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
      },
    }),
    prisma.experiment.create({
      data: {
        laboratoryId: mechanicsLab.id,
        title: 'Conservación de Energía',
        slug: 'energy-conservation',
        description: 'Estudia la transformación entre energía cinética y potencial.',
        category: 'FISICA',
        difficulty: 'INTERMEDIO',
        duration: 40,
        order: 4,
        theory: 'La energía no se crea ni se destruye, solo se transforma de una forma a otra.',
        formulas: 'E = ½mv² + mgh = constante',
        instructions: '1. Suelta la bola desde diferentes alturas\n2. Mide velocidades\n3. Calcula energías',
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
      },
    }),

    // Más experimentos para Química
    prisma.experiment.create({
      data: {
        laboratoryId: chemistryLab.id,
        title: 'Reacciones de Oxidación-Reducción',
        slug: 'redox-reactions',
        description: 'Estudia reacciones de oxidación y reducción en métaux.',
        category: 'QUIMICA',
        difficulty: 'INTERMEDIO',
        duration: 45,
        order: 3,
        theory: 'Las reacciones redox implican transferencia de electrones. Oxidación es pérdida de electrones, reducción es ganancia.',
        formulas: 'Red → Ox + e⁻',
        instructions: '1. Prepara soluciones oxidantes\n2. Observa cambios de color\n3. Identifica electrones transferidos',
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69',
      },
    }),
    prisma.experiment.create({
      data: {
        laboratoryId: chemistryLab.id,
        title: 'Estequiometría',
        slug: 'stoichiometry',
        description: 'Cálculos de reacciones químicas y rendimiento.',
        category: 'QUIMICA',
        difficulty: 'INTERMEDIO',
        duration: 45,
        order: 4,
        theory: 'La estequiometría estudia las relaciones cuantitativas en reacciones químicas.',
        formulas: 'n = m/M',
        instructions: '1. Calcula moles de reactivos\n2. Determina reactivo limitante\n3. Calcula productos esperados',
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69',
      },
    }),

    // Más experimentos para Biología
    prisma.experiment.create({
      data: {
        laboratoryId: biologyLab.id,
        title: 'Observación Celular',
        slug: 'cell-observation',
        description: 'Identifica estructuras celulares en diferentes tipos de células.',
        category: 'BIOLOGIA',
        difficulty: 'BASICO',
        duration: 40,
        order: 2,
        theory: 'Las células son la unidad básica de la vida. Pueden ser procariotas o eucariotas.',
        instructions: '1. Selecciona tipo de célula\n2. Identifica organelos\n3. Anota funciones',
        image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557',
      },
    }),
    prisma.experiment.create({
      data: {
        laboratoryId: biologyLab.id,
        title: 'Herencia Mendeliana',
        slug: 'mendelian-inheritance',
        description: 'Predice resultados de cruzamientos monohíbridos y dihíbridos.',
        category: 'BIOLOGIA',
        difficulty: 'AVANZADO',
        duration: 50,
        order: 3,
        theory: 'Las leyes de Mendel explican la herencia de traits.',
        formulas: 'Genotipo: AA, Aa, aa',
        instructions: '1. Selecciona parentales\n2. Realiza cruzamiento\n3. Calcula proporciones',
        image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557',
      },
    }),

    // Más experimentos para Termodinámica
    prisma.experiment.create({
      data: {
        laboratoryId: thermoLab.id,
        title: 'Leyes de la Termodinámica',
        slug: 'thermodynamics-laws',
        description: 'Aplica las leyes de la termodinámica a sistemas cerrados.',
        category: 'FISICA',
        difficulty: 'AVANZADO',
        duration: 55,
        order: 2,
        theory: '0ª Ley: Equilibrio térmico\n1ª Ley: Conservación de energía\n2ª Ley: Entropía\n3ª Ley: Cero absoluto',
        instructions: '1. Analiza cada ley\n2. Realiza cálculos\n3. Interpreta resultados',
        image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31',
      },
    }),

    // Más experimentos para Circuitos
    prisma.experiment.create({
      data: {
        laboratoryId: circuitsLab.id,
        title: 'Circuitos RC y RL',
        slug: 'rc-rl-circuits',
        description: 'Analiza circuitos con resistores y capacitores o inductores.',
        category: 'INGENIERIA',
        difficulty: 'AVANZADO',
        duration: 60,
        order: 2,
        theory: 'Los circuitos RC y RL tienen comportamiento transitorio dependent del tiempo.',
        formulas: 'V(t) = V₀(1 - e^(-t/RC))',
        instructions: '1. Arma el circuito\n2. Observa la respuesta transitoria\n3. Mide constantes de tiempo',
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
      },
    }),
  ]);
  console.log(`✅ Created ${experiments.length} experiments`);

  // ============================================
  // ACHIEVEMENTS - 10 logros
  // ============================================
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: {
        name: 'Primer Paso',
        slug: 'primer-paso',
        description: 'Completa tu primer experimento',
        icon: 'Target',
        color: '#3b82f6',
        category: 'milestone',
        points: 10,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Explorador',
        slug: 'explorador',
        description: 'Explora 5 laboratorios diferentes',
        icon: 'FlaskConical',
        color: '#22c55e',
        category: 'exploration',
        points: 25,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Científico Junior',
        slug: 'cientifico-junior',
        description: 'Completa 10 experimentos',
        icon: 'Star',
        color: '#f59e0b',
        category: 'progress',
        points: 50,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Racha de 7 Días',
        slug: 'racha-7-dias',
        description: 'Practica durante 7 días consecutivos',
        icon: 'Flame',
        color: '#ef4444',
        category: 'streak',
        points: 30,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Puntuación Perfecta',
        slug: 'puntuacion-perfecta',
        description: 'Obtén 100% en cualquier experimento',
        icon: 'Award',
        color: '#8b5cf6',
        category: 'skill',
        points: 40,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Maestro de Física',
        slug: 'maestro-fisica',
        description: 'Completa todos los experimentos de Física',
        icon: 'Atom',
        color: '#06b6d4',
        category: 'category',
        points: 100,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Químico Experto',
        slug: 'quimico-experto',
        description: 'Completa todos los experimentos de Química',
        icon: 'FlaskConical',
        color: '#10b981',
        category: 'category',
        points: 100,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Dedicación Académica',
        slug: 'dedicacion-academica',
        description: 'Pasa más de 10 horas en el laboratorio',
        icon: 'Clock',
        color: '#6366f1',
        category: 'time',
        points: 75,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Certificado',
        slug: 'certificado',
        description: 'Obtén tu primer certificado',
        icon: 'FileBadge',
        color: '#eab308',
        category: 'certificate',
        points: 50,
      },
    }),
    prisma.achievement.create({
      data: {
        name: 'Veterano',
        slug: 'veterano',
        description: 'Usa la plataforma durante 30 días',
        icon: 'Trophy',
        color: '#f97316',
        category: 'loyalty',
        points: 200,
      },
    }),
  ]);
  console.log(`✅ Created ${achievements.length} achievements`);

  // ============================================
  // USER PROGRESS - Tracking
  // ============================================
  const demoProgress = await prisma.userProgress.create({
    data: {
      userId: demoUser.id,
      laboratoryId: mechanicsLab.id,
      completed: true,
      progress: 100,
      score: 85,
      timeSpent: 1800,
      attempts: 2,
      completedAt: new Date(),
    },
  });

  const mariaProgress = await prisma.userProgress.create({
    data: {
      userId: students[0].id,
      laboratoryId: chemistryLab.id,
      completed: true,
      progress: 100,
      score: 92,
      timeSpent: 2100,
      attempts: 1,
      completedAt: new Date(Date.now() - 86400000),
    },
  });

  await prisma.userProgress.create({
    data: {
      userId: students[1].id,
      laboratoryId: mechanicsLab.id,
      completed: false,
      progress: 60,
      score: null,
      timeSpent: 900,
      attempts: 1,
    },
  });

  await prisma.userProgress.create({
    data: {
      userId: students[2].id,
      laboratoryId: circuitsLab.id,
      completed: true,
      progress: 100,
      score: 78,
      timeSpent: 2400,
      attempts: 3,
      completedAt: new Date(Date.now() - 172800000),
    },
  });
  console.log('✅ Created user progress records');

  // ============================================
  // CERTIFICATES
  // ============================================
  await prisma.certificate.create({
    data: {
      userId: demoUser.id,
      laboratoryId: mechanicsLab.id,
      title: 'Certificado de Mecánica Clásica',
      description: 'Completó todos los experimentos del laboratorio de Mecánica Clásica',
      score: 85,
    },
  });

  await prisma.certificate.create({
    data: {
      userId: students[0].id,
      laboratoryId: chemistryLab.id,
      title: 'Certificado de Química General',
      description: 'Completó todos los experimentos del laboratorio de Química General',
      score: 92,
    },
  });
  console.log('✅ Created certificates');

  // ============================================
  // USER ACHIEVEMENTS
  // ============================================
  await prisma.userAchievement.create({
    data: {
      userId: demoUser.id,
      achievementId: achievements[0].id,
    },
  });
  await prisma.userAchievement.create({
    data: {
      userId: demoUser.id,
      achievementId: achievements[1].id,
    },
  });
  await prisma.userAchievement.create({
    data: {
      userId: students[0].id,
      achievementId: achievements[0].id,
    },
  });
  await prisma.userAchievement.create({
    data: {
      userId: students[0].id,
      achievementId: achievements[4].id,
    },
  });
  console.log('✅ Created user achievements');

  // ============================================
  // SYSTEM STATS
  // ============================================
  await prisma.systemStats.create({
    data: {
      id: 'global-stats',
      totalUsers: 15,
      activeUsers: 12,
      totalExperiments: 16,
      experimentsCompleted: 47,
      totalHours: 156.5,
      certificates: 2,
    },
  });
  console.log('✅ Created system stats');

  // ============================================
  // DAILY STATS - Últimos 30 días
  // ============================================
  const today = new Date();
  const dailyStatsData = [
    { date: -1, activeUsers: 12, newUsers: 2, experimentsCompleted: 8, totalHours: 15.5, certificatesIssued: 1 },
    { date: -2, activeUsers: 11, newUsers: 1, experimentsCompleted: 6, totalHours: 12.0, certificatesIssued: 0 },
    { date: -3, activeUsers: 14, newUsers: 3, experimentsCompleted: 10, totalHours: 18.0, certificatesIssued: 2 },
    { date: -4, activeUsers: 10, newUsers: 1, experimentsCompleted: 5, totalHours: 9.5, certificatesIssued: 0 },
    { date: -5, activeUsers: 13, newUsers: 2, experimentsCompleted: 9, totalHours: 14.0, certificatesIssued: 1 },
    { date: -6, activeUsers: 8, newUsers: 0, experimentsCompleted: 4, totalHours: 7.0, certificatesIssued: 0 },
    { date: -7, activeUsers: 15, newUsers: 4, experimentsCompleted: 12, totalHours: 20.0, certificatesIssued: 3 },
    { date: -14, activeUsers: 9, newUsers: 1, experimentsCompleted: 5, totalHours: 10.0, certificatesIssued: 0 },
    { date: -21, activeUsers: 7, newUsers: 0, experimentsCompleted: 3, totalHours: 6.0, certificatesIssued: 0 },
    { date: -28, activeUsers: 11, newUsers: 2, experimentsCompleted: 7, totalHours: 13.0, certificatesIssued: 1 },
  ];

  for (const stat of dailyStatsData) {
    const date = new Date(today);
    date.setDate(date.getDate() + stat.date);
    date.setHours(0, 0, 0, 0);
    
    await prisma.dailyStats.create({
      data: {
        date: date,
        activeUsers: stat.activeUsers,
        newUsers: stat.newUsers,
        experimentsCompleted: stat.experimentsCompleted,
        totalHours: stat.totalHours,
        certificatesIssued: stat.certificatesIssued,
      },
    });
  }
  console.log(`✅ Created ${dailyStatsData.length} daily stats records`);

  // ============================================
  // COURSES
  // ============================================
  await Promise.all([
    prisma.course.create({
      data: {
        title: 'Fundamentos de Física Universitaria',
        slug: 'fundamentos-fisica',
        description: ' Curso completo de física para estudiantes universitarios.',
        category: 'FISICA',
        level: 'BASICO',
        duration: 1800,
        modules: 12,
        status: 'PUBLISHED',
        order: 1,
        image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Química General para Ingeniería',
        slug: 'quimica-ingenieria',
        description: 'Principios de química con enfoque en aplicaciones de ingeniería.',
        category: 'QUIMICA',
        level: 'INTERMEDIO',
        duration: 1500,
        modules: 10,
        status: 'PUBLISHED',
        order: 2,
        image: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69',
      },
    }),
    prisma.course.create({
      data: {
        title: 'Biología Molecular Avanzada',
        slug: 'biologia-molecular',
        description: 'Estudio avanzado de procesos moleculares en células.',
        category: 'BIOLOGIA',
        level: 'AVANZADO',
        duration: 2000,
        modules: 15,
        status: 'PUBLISHED',
        order: 3,
        image: 'https://images.unsplash.com/photo-1576086213369-97a306d36557',
      },
    }),
  ]);
  console.log('✅ Created courses');

  console.log('═══════════════════════════════════════════');
  console.log('🎉 Seed completado exitosamente!');
  console.log('═══════════════════════════════════════════');
  console.log('');
  console.log('📋 Credenciales de prueba:');
  console.log('');
  console.log('  ADMIN:    admin@virtuallab.edu    / admin123');
  console.log('  TEACHER:  profesor@virtuallab.edu / profesor123');
  console.log('  DEMO:     demo@virtuallab.edu    / demo123');
  console.log('  STUDENT:  maria.garcia@uni.edu.pe / maria2024');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
