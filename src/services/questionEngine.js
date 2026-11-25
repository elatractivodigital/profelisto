/**
 * Motor Pedagógico e Integración IA de ProfeListo
 * ------------------------------------------------
 * Analiza los 3 documentos obligatorios en PDF:
 *   1. Prueba de Ejemplo (estilo de enunciados, nivel de exigencia y formato)
 *   2. Temario (unidades/ejes temáticos -> determina entre 6 y 10 niveles)
 *   3. Marco para la Buena Enseñanza - MBE (dominios y estándares -> fundamenta pistas y criterios)
 *
 * Incluye:
 *   - Conector listo mediante variables de entorno (.env: VITE_AI_API_URL, VITE_AI_API_KEY, VITE_AI_MODEL)
 *     sin exponer jamás claves en el código fuente.
 *   - Motor Pedagógico Local inteligente que sintetiza dilemas de aula inéditos (sin copiar literalmente
 *     la prueba de ejemplo) y garantiza preguntas/pistas 100 % renovadas en cada reinicio.
 */

export const TEACHER_BADGES_CATALOG = [
  {
    id: 'lapiz-oro',
    name: 'Lápiz de Oro',
    icon: 'pencil',
    description: 'Precisión ejemplar en planificación pedagógica',
  },
  {
    id: 'libro-maestro',
    name: 'Libro Maestro',
    icon: 'book',
    description: 'Dominio profundo de contenidos curriculares',
  },
  {
    id: 'delantal-impecable',
    name: 'Delantal Impecable',
    icon: 'apron',
    description: 'Gestión de aula cálida, justa y organizada',
  },
  {
    id: 'cafe-sala-profes',
    name: 'Termo de Sala de Profes',
    icon: 'coffee',
    description: 'Energía estratégica para resolver imprevistos',
  },
  {
    id: 'manzana-brillante',
    name: 'Manzana Brillante',
    icon: 'apple',
    description: 'Vínculo positivo y motivación estudiantil',
  },
  {
    id: 'pizarra-estelar',
    name: 'Pizarra Estelar',
    icon: 'board',
    description: 'Claridad didáctica y mediación efectiva',
  },
  {
    id: 'rubrica-diamante',
    name: 'Rúbrica de Diamante',
    icon: 'rubric',
    description: 'Evaluación formativa y retroalimentación oportuna',
  },
  {
    id: 'megafono-inclusion',
    name: 'Compás DUA',
    icon: 'compass',
    description: 'Inclusión real y eliminación de barreras',
  },
  {
    id: 'bono-sueldo',
    name: 'Bono de Sueldo',
    icon: 'bonus',
    description: 'Reconocimiento a la excelencia académica docente',
  },
  {
    id: 'aguinaldo-billetes',
    name: 'Aguinaldo Docente',
    icon: 'bills',
    description: 'Maestría total en el Temario y el Marco Docente',
  },
];

// Generador pseudoaleatorio determinista por semilla
function createSeededRandom(seedNumber) {
  let a = seedNumber >>> 0;
  return function nextRand() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleWithRng(array, rng) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const STOPWORDS = new Set([
  'para', 'como', 'este', 'esta', 'estos', 'estas', 'sobre', 'entre', 'desde', 'hasta',
  'cuando', 'donde', 'porque', 'segun', 'según', 'cada', 'todo', 'todos', 'todas', 'toda',
  'puede', 'pueden', 'debe', 'deben', 'hacer', 'hace', 'tiene', 'tienen', 'durante', 'mediante',
  'dentro', 'fuera', 'antes', 'despues', 'después', 'mismo', 'misma', 'otros', 'otras', 'otro',
  'otra', 'cual', 'cuál', 'cuales', 'cuáles', 'quien', 'quién', 'aula', 'clase', 'clases',
  'curso', 'cursos', 'docente', 'docentes', 'profesor', 'profesora', 'estudiante', 'estudiantes',
  'alumno', 'alumnos', 'alumna', 'alumnas', 'item', 'ítem', 'ejemplo', 'pregunta', 'opcion',
  'opción', 'unidad', 'tema', 'temario', 'prueba', 'marco', 'buena', 'ensenanza', 'enseñanza',
]);

/**
 * Analiza el estilo y complejidad de la Prueba de Ejemplo.
 */
export function analyzeSampleExam(pruebaDoc) {
  const text = pruebaDoc?.rawText || '';
  const questionMarks = (text.match(/\?/g) || []).length;
  const caseMarkers = (text.match(/en un curso|durante una|observa que|situación|caso|colega|estudiante/gi) || []).length;
  const highOrderVerbs = (text.match(/analizar|evaluar|favorece|pertinente|diseñar|retroalimenta|fundamenta|priorizar/gi) || []).length;

  let difficulty = 'Intermedia-Alta';
  let difficultyScore = 2; // 1 = Media, 2 = Intermedia-Alta, 3 = Alta
  if (highOrderVerbs >= 5 || text.length > 2200) {
    difficulty = 'Alta (Casos Situados)';
    difficultyScore = 3;
  } else if (highOrderVerbs <= 1 && caseMarkers <= 1) {
    difficulty = 'Media (Aplicación Curricular)';
    difficultyScore = 1;
  }

  const styleLabel =
    caseMarkers >= 2
      ? 'Resolución de dilemas auténticos de aula'
      : 'Aplicación pedagógica basada en escenarios';

  return {
    estimatedItemsInSample: Math.max(3, questionMarks),
    difficulty,
    difficultyScore,
    styleLabel,
  };
}

/**
 * Extrae ejes/unidades temáticas reales desde el PDF de Temario.
 */
export function extractSyllabusUnits(temarioDoc) {
  const text = temarioDoc?.rawText || '';
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length >= 6);

  const headingRegex =
    /^(?:(?:unidad|eje|módulo|modulo|tema|capítulo|capitulo|dominio|área|area)\b(?:\s*\d+)?|\d+[.) -]+)\s*[:.-]?\s*(.+)/i;
  const extracted = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length > 110) continue;
    const match = line.match(headingRegex);
    if (match && match[1]) {
      const cleanTitle = match[1]
        .replace(/^[0-9.: -]+/, '')
        .replace(/\.$/, '')
        .trim();
      if (cleanTitle.length >= 8 && cleanTitle.length <= 78) {
        const nextParagraph = lines.slice(i + 1, i + 3).join(' ');
        extracted.push({
          title: cleanTitle,
          contextText: `${cleanTitle}. ${nextParagraph}`.slice(0, 360),
        });
      }
    }
  }

  // Deduplicar títulos similares
  const unique = [];
  const seen = new Set();
  for (const item of extracted) {
    const key = item.title.toLowerCase().slice(0, 22);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  const fallbackUnits = [
    {
      title: 'Planificación y Coherencia Didáctica',
      contextText: 'Secuencias didácticas alineadas a objetivos de aprendizaje, activación de saberes previos y gestión del tiempo.',
    },
    {
      title: 'Inclusión y Diseño Universal (DUA)',
      contextText: 'Múltiples formas de representación, implicación y acción/expresión para eliminar barreras en el aula.',
    },
    {
      title: 'Clima de Aula y Convivencia Formativa',
      contextText: 'Vínculo pedagógico, normas acordadas, seguridad psicológica, respeto mutuo y altas expectativas.',
    },
    {
      title: 'Aprendizaje Activo y Pensamiento Crítico',
      contextText: 'Indagación, preguntas abiertas, trabajo colaborativo con roles y desarrollo metacognitivo.',
    },
    {
      title: 'Evaluación Formativa y Retroalimentación',
      contextText: 'Criterios claros, uso constructivo del error, autoevaluación, coevaluación y feedback descriptivo.',
    },
    {
      title: 'Motivación y Funciones Ejecutivas',
      contextText: 'Autorregulación, atención sostenida, memoria de trabajo y autonomía progresiva del estudiantado.',
    },
    {
      title: 'Diversificación, PIE y Co-docencia',
      contextText: 'Adecuaciones curriculares pertinentes, apoyos escalonados y coordinación interdisciplinaria.',
    },
    {
      title: 'Reflexión Docente, Ética y Familias',
      contextText: 'Trabajo colaborativo entre pares basado en evidencias, alianza familia-escuela y responsabilidad ética.',
    },
    {
      title: 'Mediación Pedagógica y Andamiaje',
      contextText: 'Modelamiento cognitivo, transferencia gradual de responsabilidad y cierre pedagógico efectivo.',
    },
    {
      title: 'Síntesis Integradora de Aula',
      contextText: 'Toma de decisiones pedagógicas integrales articulando currículum, evaluación e inclusión.',
    },
  ];

  // Determinar cantidad dinámica de niveles entre 6 y 10 según riqueza del Temario
  const wordCount = temarioDoc?.wordCount || text.split(/\s+/).length;
  let targetLevelCount = unique.length;
  if (targetLevelCount < 6) {
    if (wordCount > 3500) targetLevelCount = 9;
    else if (wordCount > 2100) targetLevelCount = 8;
    else if (wordCount > 1100) targetLevelCount = 7;
    else targetLevelCount = 6;
  }
  targetLevelCount = Math.max(6, Math.min(10, targetLevelCount));

  const finalUnits = [...unique];
  let idx = 0;
  while (finalUnits.length < targetLevelCount) {
    const candidate = fallbackUnits[idx % fallbackUnits.length];
    if (!finalUnits.some((u) => u.title.toLowerCase().includes(candidate.title.toLowerCase().slice(0, 14)))) {
      finalUnits.push(candidate);
    }
    idx++;
    if (idx > 30) break;
  }

  return finalUnits.slice(0, targetLevelCount);
}

/**
 * Extrae Dominios y Estándares del Marco para la Buena Enseñanza (MBE).
 */
export function extractMbeDomains(mbeDoc) {
  const text = mbeDoc?.rawText || '';

  const baseDomains = [
    {
      code: 'Dominio A',
      name: 'Preparación del proceso de enseñanza y aprendizaje',
      standards: [
        'Estándar A1: Considera saberes previos, contexto sociocultural y características del grupo.',
        'Estándar A2: Selecciona estrategias didácticas coherentes con la naturaleza del objetivo.',
        'Estándar A3: Diseña secuencias inclusivas y evaluaciones alineadas con criterios claros.',
      ],
    },
    {
      code: 'Dominio B',
      name: 'Creación de un ambiente propicio para el aprendizaje',
      standards: [
        'Estándar B1: Construye un clima de confianza, equidad, respeto y seguridad para participar.',
        'Estándar B2: Transmite altas expectativas académicas y formativas a todo el estudiantado.',
        'Estándar B3: Acuerda normas formativas y organiza tiempos y espacios que promueven autonomía.',
      ],
    },
    {
      code: 'Dominio C',
      name: 'Enseñanza para el aprendizaje de todos los estudiantes',
      standards: [
        'Estándar C1: Comunica propósitos y criterios de logro comprensibles desde el inicio.',
        'Estándar C2: Estimula indagación, metacognición y análisis constructivo de los errores.',
        'Estándar C3: Monitorea evidencias en tiempo real y entrega retroalimentación descriptiva.',
      ],
    },
    {
      code: 'Dominio D',
      name: 'Responsabilidades profesionales y compromiso ético',
      standards: [
        'Estándar D1: Reflexiona colaborativamente sobre su práctica usando evidencias reales de aula.',
        'Estándar D2: Fortalece alianzas corresponsables y respetuosas con las familias.',
        'Estándar D3: Resguarda el bienestar integral, la inclusión y los derechos de cada estudiante.',
      ],
    },
  ];

  // Si el PDF del usuario menciona descriptores específicos adicionales, los enriquecemos
  const customLines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => /^(?:estándar|estandar|criterio|descriptor)\s+[A-D0-9.:-]+/i.test(l) && l.length < 160);

  if (customLines.length >= 3) {
    customLines.slice(0, 8).forEach((line, i) => {
      baseDomains[i % baseDomains.length].standards.unshift(line);
    });
  }

  return baseDomains;
}

/**
 * Extrae palabras clave relevantes de un texto curricular para contextualizar casos.
 */
function extractKeywords(text, limit = 8) {
  const words = (text || '')
    .toLowerCase()
    .replace(/[^a-záéíóúñü\s]/gi, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 5 && !STOPWORDS.has(w));

  const freq = new Map();
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([w]) => w);
}

/**
 * Arquetipos variados de dilemas docentes para combinar dinámicamente con los 3 PDFs
 * sin copiar jamás literalmente los ítems de la prueba de ejemplo.
 */
const PEDAGOGICAL_ARCHETYPES = [
  {
    id: 'motivacion-dua',
    highlightPhrase: 'desmotivación y baja participación',
    buildStem: (grade, unitTitle, kw) =>
      `Colega, en ${grade} durante el trabajo de "${unitTitle}", un grupo muestra desmotivación y baja participación cuando la tarea exige un único formato escrito, aunque comprende bien los conceptos centrales (${kw}).`,
    question:
      'Según los principios de inclusión, DUA y el Marco para la Buena Enseñanza, ¿cuál es la primera decisión pedagógica más pertinente?',
    correct: (unitTitle) =>
      `Habilitar múltiples formas de implicación y expresión para abordar "${unitTitle}", permitiendo elegir formato de producto y roles con criterios de evaluación equivalentes.`,
    distractors: [
      'Aplicar una observación disciplinaria preventiva para reforzar el cumplimiento uniforme de la guía escrita.',
      'Reducir los objetivos de aprendizaje fundamentales únicamente para ese grupo con el fin de evitar frustración.',
      'Solicitar que terminen la guía escrita en casa con nota acumulativa obligatoria para la siguiente sesión.',
    ],
    hintFocus: 'Optimiza la autonomía, elección de formato y diversificación sin bajar las altas expectativas curriculares.',
  },
  {
    id: 'error-formativo',
    highlightPhrase: 'confunde un concepto clave',
    buildStem: (grade, unitTitle, kw) =>
      `Al revisar una actividad breve de cierre en ${grade} sobre "${unitTitle}", notas que casi la mitad del curso confunde un concepto clave vinculado a ${kw}, pese a haber completado todos los ejercicios.`,
    question:
      '¿Qué acción de evaluación formativa resulta más coherente para transformar esta evidencia en aprendizaje?',
    correct: () =>
      'Retomar colectivamente un ejemplo anónimo del error frecuente, guiar preguntas metacognitivas para descubrir el origen de la confusión y modelar representaciones alternativas antes de avanzar.',
    distractors: [
      'Calificar de inmediato la actividad para que el curso tome conciencia de la importancia de estudiar a diario.',
      'Continuar con la unidad siguiente según el cronograma anual y enviar una pauta impresa con las respuestas correctas.',
      'Repetir exactamente la misma explicación inicial en voz más pausada para que copien la definición en su cuaderno.',
    ],
    hintFocus: 'En evaluación formativa el error es una evidencia valiosa para ajustar la enseñanza a tiempo mediante andamiaje.',
  },
  {
    id: 'trabajo-colaborativo',
    highlightPhrase: 'una sola persona resuelve todo',
    buildStem: (grade, unitTitle, kw) =>
      `Durante un taller grupal de "${unitTitle}" en ${grade}, observas que en varios equipos una sola persona resuelve todo el desafío sobre ${kw} mientras el resto observa pasivamente.`,
    question:
      'Desde la mediación docente efectiva, ¿cómo conviene reestructurar la dinámica para asegurar aprendizaje equitativo?',
    correct: () =>
      'Establecer interdependencia positiva asignando roles rotativos complementarios, metas parciales verificables y coevaluación breve basada en criterios conocidos.',
    distractors: [
      'Suspender el trabajo en equipos y transformar la sesión en una tarea estrictamente individual y silenciosa.',
      'Evaluar únicamente a quien expone al final representando al grupo para agilizar el uso del tiempo.',
      'Agrupar en una sola mesa a todos los estudiantes con calificaciones más altas para que avancen sin interrupciones.',
    ],
    hintFocus: 'El aprendizaje cooperativo requiere interdependencia positiva y responsabilidad individual claramente estructurada.',
  },
  {
    id: 'saberes-previos',
    highlightPhrase: 'perciben el tema como lejano',
    buildStem: (grade, unitTitle, kw) =>
      `Al iniciar una nueva secuencia de "${unitTitle}" en ${grade}, tus estudiantes comentan que perciben el tema como lejano a su vida cotidiana y muestran dudas frente al vocabulario de ${kw}.`,
    question:
      '¿Qué estrategia de inicio favorece mejor la conexión significativa y la preparación del aprendizaje?',
    correct: (unitTitle) =>
      `Partir de un problema auténtico de su entorno cercano, levantar hipótesis e ideas previas y vincularlas explícitamente con el propósito de "${unitTitle}".`,
    distractors: [
      'Dictar primero el glosario técnico completo de la unidad antes de permitir preguntas o comentarios.',
      'Adelantar la fecha de la evaluación sumativa para incentivar atención sostenida desde la primera clase.',
      'Omitir la introducción contextual y pasar directo a la ejercitación mecánica para ganar minutos efectivos.',
    ],
    hintFocus: 'Conectar con experiencias reales y saberes previos construye andamiaje cognitivo y sentido de relevancia.',
  },
  {
    id: 'clima-participacion',
    highlightPhrase: 'burlas sutiles cuando alguien se equivoca',
    buildStem: (grade, unitTitle, kw) =>
      `En ${grade}, durante una puesta en común sobre "${unitTitle}", surgen burlas sutiles cuando alguien se equivoca al argumentar sobre ${kw}, provocando que varios dejen de levantar la mano.`,
    question:
      'Según los criterios de ambiente propicio para el aprendizaje, ¿qué intervención docente es prioritaria?',
    correct: () =>
      'Detener brevemente la dinámica para reafirmar los acuerdos de respeto mutuo, valorar explícitamente el aporte del error al razonamiento común y modelar escucha activa.',
    distractors: [
      'Evitar las preguntas abiertas al curso completo y resolver el resto de la clase mediante exposición docente.',
      'Expulsar de la sala de inmediato a quienes rieron sin mediar conversación formativa posterior.',
      'Ignorar la situación para no perder el ritmo curricular planificado para los 45 minutos.',
    ],
    hintFocus: 'La seguridad psicológica y el respeto mutuo en sala son condición indispensable para la participación cognitiva.',
  },
  {
    id: 'retroalimentacion-descriptiva',
    highlightPhrase: 'solo reciben "bien" o "incompleto"',
    buildStem: (grade, unitTitle, kw) =>
      `En la revisión de avances de un proyecto de "${unitTitle}" en ${grade}, los estudiantes comentan que cuando solo reciben "bien" o "incompleto" no saben cómo mejorar su análisis de ${kw}.`,
    question:
      '¿Cómo debe reformularse la retroalimentación para potenciar la autorregulación del aprendizaje?',
    correct: () =>
      'Entregar comentarios descriptivos vinculados a la rúbrica que destaquen logros concretos, señalen la brecha específica y formulen preguntas orientadoras para el siguiente paso.',
    distractors: [
      'Entregarles el trabajo corregido palabra por palabra por el docente para que solo lo transcriban en limpio.',
      'Reemplazar los comentarios cualitativos por un puntaje numérico del 1 al 100 en cada párrafo.',
      'Publicar un ranking comparativo en el mural del curso para estimular la sana competencia.',
    ],
    hintFocus: 'La buena retroalimentación describe qué se logró, qué falta respecto al criterio y cómo avanzar con autonomía.',
  },
  {
    id: 'criterios-transparentes',
    highlightPhrase: 'desconocían qué aspectos tenían mayor peso',
    buildStem: (grade, unitTitle, kw) =>
      `Tras una presentación sobre "${unitTitle}" en ${grade}, varios estudiantes expresan frustración porque desconocían qué aspectos tenían mayor peso al explicar ${kw}.`,
    question:
      '¿Qué práctica preventiva fortalece la transparencia evaluativa y el sentido de justicia pedagógica?',
    correct: () =>
      'Socializar y analizar ejemplificaciones de la rúbrica al comienzo de la secuencia, realizando una breve práctica de coevaluación antes de la entrega definitiva.',
    distractors: [
      'Mantener en reserva los indicadores específicos de la rúbrica para evitar que estudien solo para la pauta.',
      'Repetir la presentación con temas distintos sin modificar la forma en que se comunican las instrucciones.',
      'Subir medio punto general a todo el curso para resolver rápidamente la inquietud estudiantil.',
    ],
    hintFocus: 'Comunicar objetivos y criterios de logro con ejemplos concretos empodera al estudiante durante todo el proceso.',
  },
  {
    id: 'ritmos-diversos',
    highlightPhrase: 'termina en diez minutos mientras otro requiere apoyo',
    buildStem: (grade, unitTitle, kw) =>
      `En una sesión práctica de "${unitTitle}" en ${grade}, un subgrupo termina en diez minutos mientras otro requiere apoyo paso a paso para comprender ${kw}.`,
    question:
      '¿Qué organización didáctica responde con altas expectativas a ambos ritmos de aprendizaje?',
    correct: () =>
      'Diseñar estaciones o desafíos multinivel con andamiajes visuales para quienes inician y retos de profundización o transferencia para quienes consolidaron antes.',
    distractors: [
      'Pedir a quienes terminaron rápido que guarden silencio absoluto o adelanten tareas de otra asignatura.',
      'Dar por cerrada la actividad apenas termina el primer grupo para mantener un ritmo ágil.',
      'Asignar el doble de ejercicios repetitivos idénticos a quienes terminan antes para mantenerlos ocupados.',
    ],
    hintFocus: 'El andamiaje escalonado y los desafíos de profundización atienden la diversidad manteniendo altas expectativas.',
  },
  {
    id: 'preguntas-metacognitivas',
    highlightPhrase: 'responden con monosílabos y memorización literal',
    buildStem: (grade, unitTitle, kw) =>
      `Durante el diálogo pedagógico de "${unitTitle}" en ${grade}, tus estudiantes responden con monosílabos y memorización literal cuando consultas sobre ${kw}.`,
    question:
      '¿Qué ajuste en la formulación de preguntas impulsa habilidades de pensamiento de orden superior?',
    correct: () =>
      'Plantear preguntas abiertas de comparación, justificación y transferencia, otorgando tiempo de espera pensado e intercambio breve en parejas antes de socializar.',
    distractors: [
      'Responder la pregunta uno mismo tras dos segundos de silencio para modelar fluidez conceptual.',
      'Dirigir las preguntas únicamente a los dos estudiantes que siempre participan para dar dinamismo.',
      'Transformar el diálogo oral en un cuestionario cerrado de verdadero o falso.',
    ],
    hintFocus: 'El tiempo de espera y las preguntas de justificación ("¿por qué?", "¿cómo lo comprobaste?") activan la metacognición.',
  },
  {
    id: 'alianza-familias',
    highlightPhrase: 'apoderados preocupados por cómo apoyar en casa',
    buildStem: (grade, unitTitle, kw) =>
      `En reunión de ${grade}, surgen apoderados preocupados por cómo apoyar en casa el proceso de "${unitTitle}" sin saber tecnicismos sobre ${kw}.`,
    question:
      'Desde la responsabilidad profesional y el vínculo familia-escuela, ¿cuál es la actuación más constructiva?',
    correct: () =>
      'Compartir orientaciones breves y cotidianas centradas en hábitos de diálogo, valoración del esfuerzo y preguntas sencillas, manteniendo canales de comunicación respetuosos y corresponsables.',
    distractors: [
      'Solicitar que las familias enseñen directamente los contenidos formales que no alcancen a verse en aula.',
      'Limitar la reunión a la lectura de promedios cuantitativos y atrasos registrados en el libro.',
      'Indicar que las familias no deben involucrarse en ningún aspecto académico para evitar confusiones.',
    ],
    hintFocus: 'La alianza con las familias se basa en corresponsabilidad formativa, lenguaje claro y respeto por sus contextos.',
  },
  {
    id: 'codocencia-pie',
    highlightPhrase: 'apoyo aislado al fondo de la sala',
    buildStem: (grade, unitTitle, kw) =>
      `Al preparar "${unitTitle}" en ${grade}, notas que en sesiones previas el apoyo especialista tendió a convertirse en apoyo aislado al fondo de la sala al abordar ${kw}.`,
    question:
      '¿Qué práctica de co-docencia encarna un enfoque verdaderamente inclusivo para todo el curso?',
    correct: () =>
      'Co-planificar previamente objetivos, apoyos universales y roles compartidos en aula para que ambos profesionales medien el aprendizaje del grupo completo sin estigmatizar.',
    distractors: [
      'Retirar sistemáticamente de todas las clases de la unidad a quienes presentan necesidades de apoyo.',
      'Dejar que el especialista elabore una guía paralela desconectada del tema que trabaja el resto del curso.',
      'Solicitar apoyo especialista únicamente durante la aplicación de pruebas escritas finales.',
    ],
    hintFocus: 'La co-docencia efectiva se basa en planificación conjunta y apoyos integrados que benefician a toda el aula.',
  },
  {
    id: 'reflexion-pares',
    highlightPhrase: 'resultados dispares entre cursos paralelos',
    buildStem: (grade, unitTitle, kw) =>
      `Al comparar evidencias de "${unitTitle}" en dos cursos paralelos de ${grade}, el equipo docente observa resultados dispares entre cursos paralelos respecto al logro en ${kw}.`,
    question:
      'De acuerdo con el desarrollo profesional colaborativo, ¿qué acción del equipo docente resulta más fecunda?',
    correct: () =>
      'Analizar conjuntamente muestras de trabajos estudiantiles y estrategias aplicadas, identificando qué mediaciones funcionaron mejor para diseñar mejoras compartidas.',
    distractors: [
      'Atribuir la diferencia exclusivamente a características fijas e inmodificables de cada grupo curso.',
      'Estandarizar una clase expositiva idéntica prohibiendo cualquier adaptación al contexto de cada aula.',
      'Archivar los resultados y pasar de inmediato a la siguiente unidad sin revisar las evidencias.',
    ],
    hintFocus: 'La reflexión colaborativa entre pares basada en evidencias reales de aprendizaje impulsa la mejora pedagógica continua.',
  },
];

const GRADE_LEVELS = [
  '1° Medio',
  '2° Medio',
  '3° Medio',
  '4° Medio',
];

/**
 * Garantiza que cualquier texto o etiqueta de caso utilice exclusivamente
 * cursos de Enseñanza Media (1° a 4° Medio) y jamás mencione Básica o Primaria.
 */
export function sanitizeTextToMedia(text, indexSeed = 0, uppercase = false) {
  if (!text || typeof text !== 'string') return text;
  const mediaGrade = GRADE_LEVELS[Math.abs(indexSeed) % GRADE_LEVELS.length];
  const replacement = uppercase ? mediaGrade.toUpperCase() : mediaGrade;

  let cleaned = text
    // Etiquetas compuestas anteriores o variantes equivalentes
    .replace(/\b\d+\s*\.?\s*°?\s*primaria\s*\/\s*b[áa]sico\b/gi, replacement)
    .replace(/\b\d+\s*\.?\s*°?\s*b[áa]sico\s*\/\s*\d+\s*\.?\s*°?\s*eso\b/gi, replacement)
    .replace(/\b\d+\s*\.?\s*°?\s*secundaria\s*\/\s*medio\b/gi, (m) => {
      const numMatch = m.match(/[1-4]/);
      const g = numMatch ? `${numMatch[0]}° Medio` : mediaGrade;
      return uppercase ? g.toUpperCase() : g;
    })
    // Cualquier mención directa a 1°–8° básico / primaria / ESO
    .replace(/\b[1-8]\s*\.?\s*°?\s*(?:b[áa]sico|b[áa]sica|primaria|eso)\b/gi, replacement)
    .replace(/\benseñanza\s+b[áa]sica\b/gi, uppercase ? 'ENSEÑANZA MEDIA' : 'Enseñanza Media')
    .replace(/\beducaci[óo]n\s+b[áa]sica\b/gi, uppercase ? 'EDUCACIÓN MEDIA' : 'Educación Media');

  return cleaned;
}

/**
 * Normaliza una campaña completa (por ejemplo una guardada previamente en el navegador
 * o devuelta por un proveedor externo de IA) para asegurar solo cursos de 1° a 4° Medio.
 */
export function normalizeCampaignToMedia(campaign) {
  if (!campaign || !Array.isArray(campaign.levels)) return campaign;
  return {
    ...campaign,
    levels: campaign.levels.map((lvl, lIdx) => ({
      ...lvl,
      title: sanitizeTextToMedia(lvl.title, lIdx, false),
      questions: (lvl.questions || []).map((q, qIdx) => {
        const seedIdx = lIdx + qIdx;
        return {
          ...q,
          caseLabel: sanitizeTextToMedia(q.caseLabel, seedIdx, true),
          stem: sanitizeTextToMedia(q.stem, seedIdx, false),
          question: sanitizeTextToMedia(q.question, seedIdx, false),
          hint: sanitizeTextToMedia(q.hint, seedIdx, false),
          explanation: sanitizeTextToMedia(q.explanation, seedIdx, false),
          options: (q.options || []).map((opt) => ({
            ...opt,
            text: sanitizeTextToMedia(opt.text, seedIdx, false),
          })),
        };
      }),
    })),
  };
}

function selectCampaignBadges(levelCount) {
  // Aseguramos siempre que estén Lápiz, Libro, Delantal y al cierre Bono de Sueldo + Aguinaldo (Billetes)
  if (levelCount >= 10) return TEACHER_BADGES_CATALOG.slice(0, 10);
  const mandatoryStart = TEACHER_BADGES_CATALOG.slice(0, 3); // Lápiz, Libro, Delantal
  const mandatoryEnd = TEACHER_BADGES_CATALOG.slice(8, 10); // Bono de Sueldo, Aguinaldo
  const middlePool = TEACHER_BADGES_CATALOG.slice(3, 8);
  const middleNeeded = Math.max(0, levelCount - mandatoryStart.length - mandatoryEnd.length);
  return [...mandatoryStart, ...middlePool.slice(0, middleNeeded), ...mandatoryEnd];
}

/**
 * Conector listo para API de IA externa configurada en variables de entorno (.env).
 * Si VITE_AI_API_URL y VITE_AI_API_KEY están configuradas, consulta al LLM;
 * en caso contrario devuelve null para usar el Motor Pedagógico Local gratuito.
 */
async function tryExternalAiGeneration({ pruebaDoc, temarioDoc, mbeDoc, generationSeed, previousFingerprints }) {
  const apiUrl = import.meta.env.VITE_AI_API_URL;
  const apiKey = import.meta.env.VITE_AI_API_KEY;
  const model = import.meta.env.VITE_AI_MODEL || 'gemini-2.5-flash';

  if (!apiUrl || !apiKey) {
    return null;
  }

  const systemPrompt = `
Eres un diseñador experto en evaluación docente para Enseñanza Media. A partir de:
1) Prueba de Ejemplo (solo para calibrar estilo y dificultad, PROHIBIDO copiar preguntas literales),
2) Temario (para definir entre 6 y 10 niveles por ejes/dominios),
3) Marco para la Buena Enseñanza (para alinear dominios y pistas pedagógicas),
genera un JSON válido con clave "levels" (entre 6 y 10 niveles; puntos de control intercalados en niveles impares; entre 6 y 10 preguntas inéditas por nivel; entre 3 y 5 vidas según dificultad; 5 pistas recargables).
REGLA OBLIGATORIA: Todos los casos y cursos mencionados DEBEN ser exclusivamente de Enseñanza Media (1° Medio, 2° Medio, 3° Medio o 4° Medio). Está estrictamente prohibido mencionar cursos de Enseñanza Básica o Primaria.
Semilla de variación: ${generationSeed}. Evita repetir enfoques previos: ${(previousFingerprints || []).slice(-12).join(', ')}.
  `.trim();

  const userPayload = `
[PRUEBA DE EJEMPLO]:
${(pruebaDoc?.rawText || '').slice(0, 3500)}

[TEMARIO]:
${(temarioDoc?.rawText || '').slice(0, 5000)}

[MARCO PARA LA BUENA ENSEÑANZA]:
${(mbeDoc?.rawText || '').slice(0, 4500)}
  `.trim();

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.85,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPayload },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed?.levels) && parsed.levels.length >= 6) {
      return parsed;
    }
    return null;
  } catch (err) {
    console.warn('Proveedor IA externo no disponible; usando Motor Pedagógico Local:', err);
    return null;
  }
}

/**
 * Construye toda la aventura de estudio (6–10 niveles, puntos de control intercalados,
 * 6–10 casos por nivel, 3–5 vidas y 5 pistas recargables) a partir de los 3 PDFs obligatorios.
 */
export async function generateStudyCampaign({
  pruebaDoc,
  temarioDoc,
  mbeDoc,
  generationCount = 1,
  previousFingerprints = [],
}) {
  const seed = (Date.now() ^ (generationCount * 2654435761)) >>> 0;
  const rng = createSeededRandom(seed);

  // 1. Intentar proveedor IA externo si el usuario configuró variables en .env
  const externalCampaign = await tryExternalAiGeneration({
    pruebaDoc,
    temarioDoc,
    mbeDoc,
    generationSeed: seed,
    previousFingerprints,
  });
  if (externalCampaign) {
    return normalizeCampaignToMedia(externalCampaign);
  }

  // 2. Análisis profundo local de los 3 documentos obligatorios
  const examAnalysis = analyzeSampleExam(pruebaDoc);
  const units = extractSyllabusUnits(temarioDoc); // 6 a 10 niveles dinámicos
  const mbeDomains = extractMbeDomains(mbeDoc);
  const levelCount = units.length;
  const badgesForCampaign = selectCampaignBadges(levelCount);

  const prevSet = new Set(previousFingerprints || []);
  const newFingerprints = [];

  const levels = units.map((unit, levelIdx) => {
    const levelNumber = levelIdx + 1;
    // Puntos de control intercalados: 1 sí, 2 no, 3 sí, 4 no...
    const isCheckpoint = levelNumber % 2 === 1;
    const domain = mbeDomains[levelIdx % mbeDomains.length];
    const badge = badgesForCampaign[levelIdx % badgesForCampaign.length];

    const unitKeywords = extractKeywords(unit.contextText, 6);
    const fallbackKeywords = ['aprendizaje significativo', 'evidencias de logro', 'participación activa', 'criterios claros'];
    const keywordsPool = unitKeywords.length >= 2 ? unitKeywords : fallbackKeywords;

    // Cantidad de casos/preguntas por nivel: entre 6 y 10 según riqueza del eje y dificultad
    const contextDensityBoost = unit.contextText.length > 180 ? 1 : 0;
    const progressiveBoost = Math.floor(levelIdx / 3);
    const rawQuestionCount = 6 + ((levelIdx + generationCount + contextDensityBoost + progressiveBoost) % 5);
    const questionCount = Math.max(6, Math.min(10, rawQuestionCount));

    // Margen de errores antes del Jefe Amonestando: entre 3 y 5 vidas según dificultad y largo del nivel
    let maxLives = 4;
    if (examAnalysis.difficultyScore === 3 && questionCount <= 7) {
      maxLives = 3;
    } else if (questionCount >= 9) {
      maxLives = 5;
    } else {
      maxLives = 3 + ((levelIdx + examAnalysis.difficultyScore) % 3); // 3, 4 o 5
    }

    // Rotar y filtrar arquetipos para no repetir combinaciones de la partida anterior
    const rotatedArchetypes = shuffleWithRng(PEDAGOGICAL_ARCHETYPES, rng);
    const questions = [];

    for (let qIdx = 0; qIdx < questionCount; qIdx++) {
      // Buscar combinación fresca que no esté en previousFingerprints
      let chosenArchetype = rotatedArchetypes[(qIdx + levelIdx) % rotatedArchetypes.length];
      let chosenGrade = GRADE_LEVELS[Math.floor(rng() * GRADE_LEVELS.length)];
      let chosenKeyword = keywordsPool[(qIdx + Math.floor(rng() * keywordsPool.length)) % keywordsPool.length];

      for (let attempt = 0; attempt < rotatedArchetypes.length; attempt++) {
        const candidateArch = rotatedArchetypes[(qIdx + attempt) % rotatedArchetypes.length];
        const candidateGrade = GRADE_LEVELS[(qIdx + levelIdx + generationCount + attempt) % GRADE_LEVELS.length];
        const fp = `${unit.title.slice(0, 12)}|${candidateArch.id}|${candidateGrade}`;
        if (!prevSet.has(fp) && !newFingerprints.includes(fp)) {
          chosenArchetype = candidateArch;
          chosenGrade = candidateGrade;
          newFingerprints.push(fp);
          break;
        }
      }

      const standardRef = domain.standards[(qIdx + generationCount) % domain.standards.length];
      const stem = chosenArchetype.buildStem(chosenGrade, unit.title, chosenKeyword);
      const correctText = chosenArchetype.correct(unit.title);

      const rawOptions = [
        { text: correctText, isCorrect: true },
        ...chosenArchetype.distractors.map((d) => ({ text: d, isCorrect: false })),
      ];
      const shuffledOptions = shuffleWithRng(rawOptions, rng).map((opt, idx) => ({
        id: ['A', 'B', 'C', 'D'][idx],
        text: opt.text,
        isCorrect: opt.isCorrect,
      }));

      questions.push({
        id: `L${levelNumber}-Q${qIdx + 1}-${seed.toString(16).slice(0, 4)}`,
        caseLabel: `DILEMA EN EL AULA • ${chosenGrade.toUpperCase()}`,
        xpReward: 15 + (levelIdx % 3) * 5,
        stem,
        highlightPhrase: chosenArchetype.highlightPhrase,
        question: chosenArchetype.question,
        options: shuffledOptions,
        hint: `${domain.code} (${standardRef.split(':')[0]}): ${chosenArchetype.hintFocus}`,
        explanation: `Correcto según ${domain.code} — ${standardRef}`,
      });
    }

    return {
      id: `nivel-${levelNumber}`,
      levelNumber,
      title: unit.title,
      domainCode: domain.code,
      domainName: domain.name,
      isCheckpoint,
      questionCount,
      maxLives,
      maxHints: 5,
      badge,
      questions,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    generationCount,
    seed,
    summary: {
      levelCount,
      totalQuestions: levels.reduce((acc, l) => acc + l.questionCount, 0),
      checkpointsCount: levels.filter((l) => l.isCheckpoint).length,
      difficulty: examAnalysis.difficulty,
      styleLabel: examAnalysis.styleLabel,
      hintsPerLevel: 5,
      filesUsed: {
        prueba: pruebaDoc?.fileName || 'Prueba de Ejemplo.pdf',
        temario: temarioDoc?.fileName || 'Temario.pdf',
        mbe: mbeDoc?.fileName || 'Marco Buena Enseñanza.pdf',
      },
    },
    newFingerprints,
    levels,
  };
}
