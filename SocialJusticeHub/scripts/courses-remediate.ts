import fs from "fs/promises";
import path from "path";
import {
  buildStableLessonKey,
  courseManifestSchema,
  ensureCourseManifestDefaults,
  normalizeSummary,
  quizManifestSchema,
  serializePrettyJson,
  stripRichText,
  type CourseManifest,
  type LessonManifestEntry,
  type QuizManifest,
} from "../shared/course-content";

const ROOT_DIR = path.resolve(import.meta.dirname, "..");
const CONTENT_ROOT = path.join(ROOT_DIR, "content", "courses");
const PUBLIC_ROOT = path.join(ROOT_DIR, "public");
const TODAY = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Argentina/Mendoza",
}).format(new Date());

const CATEGORY_LABELS: Record<string, string> = {
  vision: "Visión",
  action: "Acción",
  community: "Comunidad",
  reflection: "Reflexión",
  "hombre-gris": "Hombre Gris",
  economia: "Economía",
  comunicacion: "Comunicación",
  civica: "Cívica",
};

const CATEGORY_COLORS: Record<string, { bg1: string; bg2: string; accent: string; text: string }> = {
  vision: { bg1: "#0f172a", bg2: "#2563eb", accent: "#f59e0b", text: "#ffffff" },
  action: { bg1: "#1f2937", bg2: "#059669", accent: "#f59e0b", text: "#ffffff" },
  community: { bg1: "#1e293b", bg2: "#7c3aed", accent: "#fbbf24", text: "#ffffff" },
  reflection: { bg1: "#111827", bg2: "#9333ea", accent: "#22c55e", text: "#ffffff" },
  "hombre-gris": { bg1: "#111827", bg2: "#6b7280", accent: "#e5e7eb", text: "#ffffff" },
  economia: { bg1: "#052e16", bg2: "#15803d", accent: "#fde047", text: "#ffffff" },
  comunicacion: { bg1: "#172554", bg2: "#0284c7", accent: "#f97316", text: "#ffffff" },
  civica: { bg1: "#3f0d12", bg2: "#1d4ed8", accent: "#f8fafc", text: "#ffffff" },
};

const TEXT_SCOPE_BY_CATEGORY: Record<string, string> = {
  civica: "tu municipio, tu provincia y tu participación ciudadana",
  action: "tu proyecto, tu barrio y tu capacidad de organizarte",
  community: "tu organización, tu red y tu territorio",
  economia: "tu hogar, tus ingresos y tus decisiones económicas",
  comunicacion: "tus conversaciones, tus vínculos y tu presencia pública",
  reflection: "tu vida cotidiana, tus hábitos y tus decisiones",
  vision: "tu visión personal y tu capacidad de sostenerla",
  "hombre-gris": "tu vida, tu comunidad y la transformación argentina",
};

const TARGET_MIN_WORDS: Record<string, number> = {
  beginner: 500,
  intermediate: 500,
  advanced: 650,
};

const TERM_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\bgame theory\b/gi, "teoría de juegos"],
  [/\bcontrol theory\b/gi, "teoría de control"],
  [/\bcomplexity science\b/gi, "ciencia de la complejidad"],
  [/\bfeedback loops\b/gi, "bucles de retroalimentación"],
  [/\bfeedback loop\b/gi, "bucle de retroalimentación"],
  [/\bmindset\b/gi, "mentalidad"],
  [/\bburnout\b/gi, "agotamiento"],
  [/\benforcement\b/gi, "cumplimiento"],
  [/\binput-output\b/gi, "entradas y salidas"],
  [/\binput\b/gi, "entrada"],
  [/\boutput\b/gi, "salida"],
  [/\bpayoffs\b/gi, "pagos estratégicos"],
  [/\bpayoff\b/gi, "pago estratégico"],
  [/\bscreening\b/gi, "filtrado"],
  [/\bdashboards\b/gi, "tableros"],
  [/\bdashboard\b/gi, "tablero"],
  [/\bcompounding\b/gi, "acumulación compuesta"],
  [/\bpower laws\b/gi, "leyes de potencia"],
  [/\bpriming\b/gi, "activación previa"],
  [/\bexpectancy effects\b/gi, "efectos de expectativa"],
  [/\bcognitive load\b/gi, "carga cognitiva"],
  [/\bblueprint\b/gi, "guía base"],
];

const PRACTICE_SECTION_PATTERNS = [
  /^(##|###)\s+Aplicación práctica\b/gim,
  /^(##|###)\s+Cómo se ve en el territorio\b/gim,
  /^(##|###)\s+Aplicación argentina\b/gim,
  /^(##|###)\s+Caso(s)?\b/gim,
];

const EXERCISE_SECTION_PATTERNS = [
  /^(##|###)\s+Ejercicio(\s+guiado|\s+de aplicación)?\b/gim,
  /^(##|###)\s+Actividad\b/gim,
  /^(##|###)\s+Práctica\b/gim,
  /^(##|###)\s+Reflexión\b/gim,
  /^(##|###)\s+Checklist\b/gim,
];

const TAKEAWAY_SECTION_PATTERNS = [
  /^(##|###)\s+Idea fuerza\b/gim,
  /^(##|###)\s+Cierre\b/gim,
  /^(##|###)\s+Conclusión\b/gim,
  /^(##|###)\s+Para cerrar\b/gim,
  /^(##|###)\s+Resumen final\b/gim,
  /^(##|###)\s+Checklist de salida\b/gim,
  /^(##|###)\s+La clave\b/gim,
  /^(##|###)\s+¿Entendiste\??\b/gim,
  /^(##|###)\s+Próximo paso\b/gim,
  /^(##|###)\s+Preparación para\b/gim,
];

const ARGENTINA_SISTEMA_CORE: Array<{
  title: string;
  description: string;
  sources: number[];
}> = [
  {
    title: "Energía y entropía: las dos leyes que ordenan todo sistema",
    description: "Comprende cómo la conservación de la energía y la entropía explican por qué los sistemas prosperan, se desgastan o colapsan cuando no transforman bien sus recursos.",
    sources: [0, 1],
  },
  {
    title: "Conservación, exponenciales y acumulación",
    description: "Aprende a leer cómo las leyes de conservación, las curvas exponenciales y la acumulación compuesta convierten pequeñas diferencias en trayectorias totalmente distintas.",
    sources: [2, 3],
  },
  {
    title: "Información, señales y comunicación efectiva",
    description: "Estudia cómo circula la información en un sistema, cómo distinguir señal de ruido y cómo mejorar la comunicación para coordinar mejor en familia, trabajo y comunidad.",
    sources: [4],
  },
  {
    title: "Flujos, entradas y bucles de retroalimentación",
    description: "Mapea las entradas, salidas, flujos y bucles de retroalimentación que determinan el comportamiento real de un sistema y su capacidad de autorregularse.",
    sources: [5, 6, 7],
  },
  {
    title: "Emergencia, mantenimiento y efectos de red",
    description: "Descubre cómo emergen propiedades nuevas, cómo se sostienen los sistemas en el tiempo y por qué la conectividad puede multiplicar o degradar resultados.",
    sources: [8, 9, 10],
  },
  {
    title: "Teoría de control, cibernética y sistemas vivos",
    description: "Integra principios de control, cibernética y biología para dirigir sistemas con propósito sin caer en microgestión, rigidez ni desgaste innecesario.",
    sources: [11, 12],
  },
  {
    title: "Psicología, vínculos y hábitos en sistemas humanos",
    description: "Aplica la mirada sistémica a la mente, las relaciones y los hábitos para entender cómo se forman patrones estables y cómo modificarlos sin violencia.",
    sources: [13, 19, 20],
  },
  {
    title: "Economía, incentivos y teoría de juegos",
    description: "Conecta recursos, costos de oportunidad, incentivos y estrategias interdependientes para diseñar mejores decisiones personales, comunitarias y nacionales.",
    sources: [14, 15],
  },
  {
    title: "Ciencia de la complejidad y transiciones de fase",
    description: "Explora cómo los sistemas complejos se autoorganizan, acumulan tensiones y atraviesan transiciones abruptas que cambian las reglas del juego.",
    sources: [16],
  },
  {
    title: "Gestión de energía personal y salud sistémica",
    description: "Traduce los principios sistémicos al cuerpo y la vida cotidiana para optimizar energía, salud y sostenibilidad personal.",
    sources: [17, 18],
  },
  {
    title: "Aprendizaje, habilidades y pensamiento estratégico",
    description: "Aprende a diseñar procesos de aprendizaje y toma de decisiones que acumulen capacidad real en vez de solo información dispersa.",
    sources: [21, 23],
  },
  {
    title: "Recursos, riqueza y diseño de objetivos",
    description: "Ordena tu relación con los recursos y los objetivos para construir riqueza, foco y sistemas de ejecución que sostengan resultados.",
    sources: [22, 24],
  },
  {
    title: "La familia: el sistema base de toda transformación",
    description: "Analiza la familia como el primer sistema donde se aprenden reglas, límites, cooperación y reparación; allí comienza cualquier transformación duradera.",
    sources: [25],
  },
  {
    title: "Barrio y municipio: donde la coordinación se vuelve visible",
    description: "Lleva los primeros principios al territorio inmediato para entender cómo se coordinan familias, organizaciones y Estado local en problemas concretos.",
    sources: [26, 27],
  },
  {
    title: "Provincia y nación: Argentina como sistema multinivel",
    description: "Integra escalas territoriales para leer a Argentina como un sistema complejo donde las decisiones provinciales y nacionales se condicionan mutuamente.",
    sources: [28, 29],
  },
  {
    title: "La clave maestra: mejorar relaciones para mejorar rendimiento",
    description: "Cierra el curso sintetizando la idea central: cuando mejoran las relaciones entre las partes, mejora el rendimiento del sistema completo.",
    sources: [30],
  },
];

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function countWords(content: string) {
  const text = stripRichText(content);
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

function lessonMinWords(level: string) {
  return TARGET_MIN_WORDS[level] ?? 500;
}

function wrapSvgText(text: string, maxCharsPerLine = 26, maxLines = 4) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
      if (lines.length >= maxLines) break;
    } else {
      current = candidate;
    }
  }

  if (current && lines.length < maxLines) {
    lines.push(current);
  }

  return lines;
}

function deriveExcerpt(description: string) {
  return normalizeSummary(description, 140);
}

function buildSearchSummary(primary: string, fallback: string) {
  return normalizeSummary(primary || fallback, 220);
}

function calcDurationMinutes(content: string, hasExercise = true) {
  const words = countWords(content);
  const reading = Math.max(3, Math.ceil(words / 170));
  const exercise = hasExercise ? 4 : 0;
  return reading + exercise;
}

function removeEmojiScaffolding(content: string) {
  return content
    .replace(/^(\s*#{1,6}\s+)[\p{Extended_Pictographic}\uFE0F]+\s*/gmu, "$1")
    .replace(/^(\s*[-*]\s+)[\p{Extended_Pictographic}\uFE0F]+\s*/gmu, "$1")
    .replace(/^(\s*\d+\.\s+)[\p{Extended_Pictographic}\uFE0F]+\s*/gmu, "$1")
    .replace(/[\uFE0F]/g, "")
    .replace(/[\p{Extended_Pictographic}]/gu, "");
}

function normalizeTerminology(content: string) {
  let normalized = content;
  for (const [pattern, replacement] of TERM_REPLACEMENTS) {
    normalized = normalized.replace(pattern, replacement);
  }
  normalized = normalized.replace(/\bWhatsApp\b/g, "WhatsApp");
  normalized = normalized.replace(/\bGoogle Sheets\b/g, "Google Sheets");
  return normalized;
}

function cleanupMarkdown(content: string) {
  return content
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .concat("\n");
}

function stripStyleAttributes(content: string) {
  return content
    .replace(/\sstyle=(["'])[\s\S]*?\1/gi, "")
    .replace(/\sclass=(["'])[\s\S]*?\1/gi, "");
}

function protectBlocks(content: string) {
  const protectedBlocks = new Map<string, string>();
  let next = content;
  let counter = 0;

  next = next.replace(/<(svg|pre|table)[\s\S]*?<\/\1>/gi, (block) => {
    const token = `__PROTECTED_BLOCK_${counter++}__`;
    protectedBlocks.set(token, stripStyleAttributes(block));
    return token;
  });

  return { content: next, protectedBlocks };
}

function restoreBlocks(content: string, protectedBlocks: Map<string, string>) {
  let restored = content;
  for (const [token, block] of protectedBlocks.entries()) {
    restored = restored.replace(token, `\n\n${block}\n\n`);
  }
  return restored;
}

function inlineHtmlToMarkdown(content: string) {
  return content
    .replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, "**$1**")
    .replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, "**$1**")
    .replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, "*$1*")
    .replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, "*$1*")
    .replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`")
    .replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, "[$2]($1)")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function convertHtmlToMarkdown(raw: string) {
  if (!/<[a-z][\s\S]*>/i.test(raw)) {
    return raw;
  }

  const { content: protectedContent, protectedBlocks } = protectBlocks(stripStyleAttributes(raw));
  let content = protectedContent;

  content = content.replace(/\r\n/g, "\n");
  content = content.replace(/<br\s*\/?>/gi, "\n");
  content = content.replace(/<figcaption[^>]*>([\s\S]*?)<\/figcaption>/gi, "\n\n*$1*\n\n");
  content = content.replace(/<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi, "![$2]($1)");
  content = content.replace(/<img[^>]+alt=["']([^"']*)["'][^>]*src=["']([^"']+)["'][^>]*\/?>/gi, "![$1]($2)");
  content = content.replace(/<hr[^>]*\/?>/gi, "\n\n---\n\n");
  content = content.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n");
  content = content.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n");
  content = content.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n");
  content = content.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, "\n\n#### $1\n\n");
  content = content.replace(/<h5[^>]*>([\s\S]*?)<\/h5>/gi, "\n\n##### $1\n\n");
  content = content.replace(/<h6[^>]*>([\s\S]*?)<\/h6>/gi, "\n\n###### $1\n\n");

  content = content.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_match, inner) => {
    const quote = inlineHtmlToMarkdown(inner)
      .replace(/<\/?p[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `> ${line}`)
      .join("\n");
    return `\n\n${quote}\n\n`;
  });

  content = content.replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (_match, inner) => {
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((match) => inlineHtmlToMarkdown(match[1]).replace(/<[^>]+>/g, "").trim())
      .filter(Boolean);
    return `\n\n${items.map((item, index) => `${index + 1}. ${item}`).join("\n")}\n\n`;
  });

  content = content.replace(/<ul[^>]*>([\s\S]*?)<\/ul>/gi, (_match, inner) => {
    const items = [...inner.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
      .map((match) => inlineHtmlToMarkdown(match[1]).replace(/<[^>]+>/g, "").trim())
      .filter(Boolean);
    return `\n\n${items.map((item) => `- ${item}`).join("\n")}\n\n`;
  });

  content = content.replace(/<dl[^>]*>([\s\S]*?)<\/dl>/gi, (_match, inner) => {
    const terms = [...inner.matchAll(/<dt[^>]*>([\s\S]*?)<\/dt>\s*<dd[^>]*>([\s\S]*?)<\/dd>/gi)]
      .map((match) => `- **${inlineHtmlToMarkdown(match[1]).replace(/<[^>]+>/g, "").trim()}:** ${inlineHtmlToMarkdown(match[2]).replace(/<[^>]+>/g, "").trim()}`)
      .join("\n");
    return `\n\n${terms}\n\n`;
  });

  content = content.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");
  content = content.replace(/<\/?(div|section|article|figure|span|header|main|aside)[^>]*>/gi, "\n");
  content = inlineHtmlToMarkdown(content);
  content = content.replace(/<[^>]+>/g, "");
  content = restoreBlocks(content, protectedBlocks);
  content = stripStyleAttributes(content);
  content = removeEmojiScaffolding(content);

  return cleanupMarkdown(content);
}

function appendExpansionSections(content: string, courseTitle: string, lessonTitle: string, lessonDescription: string, category: string) {
  const scope = TEXT_SCOPE_BY_CATEGORY[category] || "tu vida cotidiana";
  const intro = lessonDescription || `La lección "${lessonTitle}" forma parte de ${courseTitle}.`;

  const expansion = `
### Aplicación práctica

${intro} Para que esta idea no quede en el plano conceptual, conviene traducirla a decisiones observables, criterios de prioridad y conversaciones concretas. La pregunta útil no es solo "qué significa", sino "qué cambia en mi forma de actuar cuando entiendo este punto con claridad". Si esta lección modifica cómo miras ${scope}, entonces ya empezó a producir efecto.

En términos operativos, este contenido sirve para distinguir señales reales de ruido, ordenar problemas antes de actuar y evitar respuestas impulsivas. También ayuda a poner nombre a procesos que muchas veces aparecen mezclados: causas, consecuencias, actores involucrados, límites prácticos y oportunidades de intervención. Cuando separas esas capas, mejoras tu capacidad de decidir con menos ansiedad y más precisión.

### Cómo se ve en el territorio

En Argentina, muchas discusiones se traban porque se habla desde consignas generales y no desde situaciones concretas. Por eso, la mejor prueba para una idea es verla en el barrio, en una organización, en una familia o en un equipo de trabajo. Si este tema no puede explicarse en términos de decisiones reales, entonces todavía no está del todo aprendido.

Llévalo a un caso cercano: identifica una situación donde este concepto aparezca con claridad, describe qué actores participan, qué intereses están en juego y qué haría una persona bien preparada después de estudiar esta lección. Ese ejercicio convierte el contenido en criterio y el criterio en acción sostenida.

### Errores comunes

- Confundir el nombre del problema con su causa de fondo.
- Querer aplicar la idea de forma abstracta sin adaptarla al contexto local.
- Pasar demasiado rápido de la explicación a la opinión.
- Buscar una solución única para situaciones que exigen secuencia y prioridades.

### Ejercicio guiado

1. Resume la idea central de la lección en dos frases propias.
2. Identifica un caso de tu realidad donde este contenido te permita ver algo que antes no estabas viendo.
3. Define una acción concreta, pequeña y verificable que podrías tomar en los próximos siete días a partir de este aprendizaje.

### Idea fuerza

${lessonTitle} no es solo un tema para entender: es una herramienta para ordenar la mirada, mejorar tu criterio y actuar con más consistencia dentro de ${scope}. Cuando un aprendizaje se traduce en decisiones mejores, deja de ser información y se convierte en capacidad.
`;

  return cleanupMarkdown(`${content.trim()}\n\n${expansion}`);
}

function appendReinforcementSection(content: string, lessonTitle: string, category: string) {
  const scope = TEXT_SCOPE_BY_CATEGORY[category] || "tu realidad cotidiana";

  const extra = `
### Caso de consolidación

Piensa en una situación reciente dentro de ${scope} donde ${lessonTitle.toLowerCase()} te habría permitido hacer un mejor diagnóstico. Describe qué estaba ocurriendo, qué opciones había sobre la mesa y cómo cambiaría tu lectura del problema después de estudiar esta lección con más atención. Ese contraste entre "lo que hice" y "lo que haría ahora" es la mejor medida de aprendizaje real.

### Próximo paso

Elige una acción pequeña para poner esta lección en práctica durante la próxima semana. No hace falta una intervención heroica: alcanza con una conversación mejor preparada, una observación más precisa o un criterio más claro para decidir. La mejora sostenida aparece cuando conviertes una idea en hábito.
`;

  return cleanupMarkdown(`${content.trim()}\n\n${extra}`);
}

function extractObjectiveItems(raw: string) {
  return [...raw.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => stripRichText(match[1]))
    .map((item) => item.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 4);
}

function generateBlueprintLesson(courseTitle: string, lessonTitle: string, lessonDescription: string, category: string, raw: string) {
  const objectives = extractObjectiveItems(raw);
  const scope = TEXT_SCOPE_BY_CATEGORY[category] || "tu realidad cotidiana";
  const objectiveBullets = objectives.length > 0
    ? objectives.map((item) => `- ${normalizeTerminology(item)}`).join("\n")
    : "- Comprender el concepto central.\n- Aplicarlo a un caso concreto.\n- Convertirlo en una práctica verificable.";

  const sections = objectives.length > 0
    ? objectives.map((item) => `### ${normalizeTerminology(item)}\n\n${lessonDescription} Este punto exige pasar de la definición a la lógica práctica: qué actor interviene, qué incentivo aparece, qué información falta y qué decisión mejora cuando comprendemos el mecanismo. Si puedes reconocer este patrón en ${scope}, entonces la lección ya se volvió una herramienta de trabajo y no solo una explicación.`).join("\n\n")
    : "";

  return cleanupMarkdown(`
## ${normalizeTerminology(lessonTitle)}

${lessonDescription} En ${courseTitle}, esta lección cumple una función clave: convertir un concepto estratégico en una herramienta concreta para leer situaciones reales, ordenar decisiones y construir mejores acuerdos.

### Objetivos de la lección

${objectiveBullets}

### Por qué importa

Cuando una comunidad, una organización o un actor público no entiende el mecanismo que tiene delante, suele reaccionar tarde o reaccionar mal. Estudia este tema para evitar respuestas impulsivas, reconocer qué incentivos están operando y diseñar intervenciones que produzcan cooperación, claridad o aprendizaje acumulable. En vez de mirar solo el evento visible, esta lección te entrena para mirar la estructura que lo sostiene.

${sections}

### Aplicación argentina

La utilidad real del contenido aparece cuando lo llevas a decisiones concretas en Argentina: conversaciones entre actores con intereses distintos, negociaciones donde la confianza está dañada, políticas que necesitan reglas creíbles o proyectos territoriales donde nadie coopera si no percibe una ventaja verificable. Entender el mecanismo permite diseñar mejores acuerdos, mejores incentivos y mejores secuencias de implementación.

### Errores comunes

- Quedarse con el concepto técnico y no traducirlo a decisiones observables.
- Suponer que todos los actores leen los incentivos del mismo modo.
- Buscar control absoluto cuando el problema exige reglas claras y seguimiento.
- Confundir una excepción favorable con un patrón sostenible.

### Ejercicio de aplicación

1. Elige un caso real de ${scope}.
2. Describe qué actores participan y qué intenta conseguir cada uno.
3. Explica cómo aplicarías esta lección para mejorar el diagnóstico o el diseño de la intervención.
4. Define una evidencia concreta que te mostraría si la estrategia elegida está funcionando.

### Cierre

La prueba de esta lección no está en repetir su vocabulario, sino en usarla para ver mejor, decidir mejor y construir mejores condiciones de cooperación o de aprendizaje dentro de ${scope}.
`);
}

function ensureLessonContent(content: string, courseTitle: string, lessonTitle: string, lessonDescription: string, level: string, category: string) {
  let next = normalizeLessonAssetRefs(convertHtmlToMarkdown(content));
  next = normalizeTerminology(next);
  next = removeEmojiScaffolding(next);
  next = stripStyleAttributes(next);
  next = cleanupMarkdown(next);

  if (/(guía base|lessons-overhaul|por definir|coming soon|placeholder)/i.test(next)) {
    next = generateBlueprintLesson(courseTitle, lessonTitle, lessonDescription, category, content);
  }

  if (countWords(next) < lessonMinWords(level)) {
    next = appendExpansionSections(next, courseTitle, lessonTitle, lessonDescription, category);
  }

  if (countWords(next) < lessonMinWords(level)) {
    next = appendReinforcementSection(next, lessonTitle, category);
  }

  next = appendMissingStructuralSections(next, lessonTitle, lessonDescription, category);
  next = normalizeTerminology(next);
  next = normalizeLessonAssetRefs(next);
  next = removeEmojiScaffolding(next);
  next = stripStyleAttributes(next);
  return cleanupMarkdown(next);
}

function titleCaseFirst(text: string) {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function normalizeTitleText(text: string) {
  let next = normalizeTerminology(removeEmojiScaffolding(text));
  next = next.replace(/^entrada\/salida\b/i, "Entradas y salidas");
  next = next.replace(/^bucles de retroalimentación\b/i, "Bucles de retroalimentación");
  next = next.replace(/^teoría de control\b/i, "Teoría de control");
  next = next.replace(/\bpower laws\b/gi, "leyes de potencia");
  next = next.replace(/\bacumulación compuesta\b/gi, "acumulación compuesta");
  next = next.replace(/^entradas y salidas:\s*entradas y salidas\b/i, "Entradas y salidas");
  return titleCaseFirst(next.trim());
}

function hasAnyPatternMatch(content: string, patterns: RegExp[]) {
  return patterns.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(content);
  });
}

function normalizeLessonAssetRefs(content: string) {
  return content
    .replace(
      /\/course-graphics\/hombre-gris\/pago estratégico-evolution\.svg/gi,
      "/course-graphics/hombre-gris/evolucion-pago-estrategico.svg",
    )
    .replace(
      /\/course-graphics\/hombre-gris\/payoff-evolution\.svg/gi,
      "/course-graphics/hombre-gris/evolucion-pago-estrategico.svg",
    );
}

function appendMissingStructuralSections(
  content: string,
  lessonTitle: string,
  lessonDescription: string,
  category: string,
) {
  let next = content.trim();
  const scope = TEXT_SCOPE_BY_CATEGORY[category] || "tu realidad cotidiana";

  if (!hasAnyPatternMatch(next, PRACTICE_SECTION_PATTERNS)) {
    next += `\n\n## Aplicación práctica\n\n${lessonDescription || lessonTitle} Cobra valor cuando lo conviertes en una decisión observable dentro de ${scope}. El objetivo no es repetir una definición, sino usar esta idea para leer mejor una situación, ordenar prioridades y elegir un siguiente paso con menos improvisación.\n\nBusca un caso cercano donde este principio te permita ver algo que antes pasabas por alto: un cuello de botella, un incentivo mal diseñado, una conversación mal planteada o un recurso mal aprovechado. Si el concepto no mejora tu lectura de lo concreto, todavía no terminó de asentarse.\n`;
  }

  if (!hasAnyPatternMatch(next, EXERCISE_SECTION_PATTERNS)) {
    next += `\n\n## Ejercicio guiado\n\n1. Resume la idea central de la lección en dos o tres frases propias.\n2. Elige una situación de ${scope} donde este contenido cambie tu diagnóstico o tu forma de intervenir.\n3. Define una acción pequeña, verificable y realizable en los próximos siete días para poner el aprendizaje en práctica.\n`;
  }

  if (!hasAnyPatternMatch(next, TAKEAWAY_SECTION_PATTERNS)) {
    next += `\n\n## Idea fuerza\n\n${lessonTitle} vale por su capacidad para mejorar decisiones reales dentro de ${scope}. Cuando una lección te ayuda a ver mejor, priorizar mejor y actuar con mayor consistencia, deja de ser información suelta y se convierte en capacidad acumulable.\n`;
  }

  return cleanupMarkdown(next);
}

function stripLeadingHeading(content: string) {
  return content
    .replace(/^\s*(#{1,6}\s+[^\n]+|[^\n#<][^\n]{2,})\n+/, "")
    .trim();
}

function stripSyntheticTail(content: string) {
  return content
    .replace(/\n{2,}(##|###)\s+(Aplicación práctica|Cómo se ve en el territorio|Errores comunes|Ejercicio guiado|Idea fuerza|Caso de consolidación|Próximo paso)\b[\s\S]*$/i, "")
    .trim();
}

function demoteMarkdownHeadings(content: string, levels = 1) {
  return content.replace(/^(#{1,6})\s+/gm, (_match, hashes: string) => {
    const nextLevel = Math.min(6, hashes.length + levels);
    return `${"#".repeat(nextLevel)} `;
  });
}

function extractTopLevelSections(content: string) {
  const matches = [...content.matchAll(/^##\s+(.+)$/gm)];
  return matches.map((match, index) => {
    const title = match[1].trim();
    const start = match.index ?? 0;
    const end = index + 1 < matches.length ? (matches[index + 1].index ?? content.length) : content.length;
    return {
      title,
      body: content.slice(start, end).trim(),
    };
  });
}

function mergeLessonBodies(
  sourceEntries: LessonManifestEntry[],
  sourceContentByKey: Map<string, string>,
  title: string,
  description: string,
  category: string,
) {
  const sections = sourceEntries.map((entry) => {
    const raw = sourceContentByKey.get(entry.key) || "";
    const prepared = demoteMarkdownHeadings(stripSyntheticTail(stripLeadingHeading(normalizeLessonAssetRefs(raw))), 1);
    return `## ${normalizeTitleText(entry.title)}\n\n${prepared}`;
  });

  const opening = `${description} Esta versión condensada mantiene el recorrido conceptual del curso, pero agrupa ideas complementarias para que el aprendizaje avance con más claridad y menos dispersión.`;

  return appendMissingStructuralSections(
    cleanupMarkdown(`${opening}\n\n${sections.join("\n\n")}`),
    title,
    description,
    category,
  );
}

function courseSeoTitle(title: string, category: string) {
  return `${title} | ${CATEGORY_LABELS[category] || "Transformación"} | El Instante del Hombre Gris`;
}

function lessonSeoTitle(lessonTitle: string, courseTitle: string) {
  return `${lessonTitle} | ${courseTitle}`;
}

function createCourseSvg(title: string, category: string, excerpt: string, width: number, height: number) {
  const palette = CATEGORY_COLORS[category] || CATEGORY_COLORS.action;
  const titleLines = wrapSvgText(title, width > 1200 ? 24 : 28, 4);
  const excerptLines = wrapSvgText(excerpt, width > 1200 ? 46 : 52, 3);
  const titleY = height > 700 ? 270 : 220;
  const excerptY = titleY + titleLines.length * 74 + 54;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${palette.bg1}" />
      <stop offset="100%" stop-color="${palette.bg2}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" rx="36" />
  <circle cx="${Math.round(width * 0.85)}" cy="${Math.round(height * 0.18)}" r="${Math.round(width * 0.08)}" fill="${palette.accent}" opacity="0.18" />
  <circle cx="${Math.round(width * 0.16)}" cy="${Math.round(height * 0.78)}" r="${Math.round(width * 0.12)}" fill="${palette.accent}" opacity="0.12" />
  <text x="${Math.round(width * 0.08)}" y="100" fill="${palette.accent}" font-size="${height > 700 ? 34 : 28}" font-family="Georgia, serif" letter-spacing="4">EL INSTANTE DEL HOMBRE GRIS</text>
  ${titleLines.map((line, index) => `<text x="${Math.round(width * 0.08)}" y="${titleY + index * 74}" fill="${palette.text}" font-size="${height > 700 ? 62 : 54}" font-family="Georgia, serif" font-weight="700">${escapeXml(line)}</text>`).join("\n  ")}
  ${excerptLines.map((line, index) => `<text x="${Math.round(width * 0.08)}" y="${excerptY + index * 38}" fill="${palette.text}" opacity="0.88" font-size="${height > 700 ? 28 : 24}" font-family="Arial, sans-serif">${escapeXml(line)}</text>`).join("\n  ")}
  <rect x="${Math.round(width * 0.08)}" y="${height - 92}" width="260" height="44" rx="22" fill="${palette.accent}" opacity="0.92" />
  <text x="${Math.round(width * 0.08) + 22}" y="${height - 62}" fill="${palette.bg1}" font-size="24" font-family="Arial, sans-serif" font-weight="700">${escapeXml(CATEGORY_LABELS[category] || "Curso")}</text>
</svg>
`;
}

function createPayoffSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
  <rect width="1200" height="700" fill="#0f172a" rx="32"/>
  <text x="90" y="90" fill="#e2e8f0" font-size="42" font-family="Georgia, serif" font-weight="700">Evolución de cooperación y defección</text>
  <text x="90" y="130" fill="#94a3b8" font-size="24" font-family="Arial, sans-serif">Comparación visual entre un sendero de valor acumulado cooperativo y uno de castigo mutuo.</text>
  <line x1="110" y1="560" x2="1090" y2="560" stroke="#475569" stroke-width="4"/>
  <line x1="110" y1="560" x2="110" y2="150" stroke="#475569" stroke-width="4"/>
  <path d="M120 520 C250 500 310 450 390 390 C470 330 560 290 640 240 C720 190 840 150 1060 110" fill="none" stroke="#22c55e" stroke-width="10" stroke-linecap="round"/>
  <path d="M120 500 C240 470 340 470 430 500 C520 530 650 560 760 575 C870 590 960 605 1060 620" fill="none" stroke="#ef4444" stroke-width="10" stroke-linecap="round"/>
  <circle cx="1060" cy="110" r="10" fill="#22c55e"/>
  <circle cx="1060" cy="620" r="10" fill="#ef4444"/>
  <rect x="780" y="180" width="300" height="88" rx="18" fill="#052e16" opacity="0.95"/>
  <text x="810" y="220" fill="#dcfce7" font-size="28" font-family="Arial, sans-serif" font-weight="700">Cooperación sostenida</text>
  <text x="810" y="252" fill="#bbf7d0" font-size="20" font-family="Arial, sans-serif">Más confianza, más valor y mejores incentivos</text>
  <rect x="760" y="470" width="320" height="88" rx="18" fill="#450a0a" opacity="0.95"/>
  <text x="790" y="510" fill="#fecaca" font-size="28" font-family="Arial, sans-serif" font-weight="700">Defección repetida</text>
  <text x="790" y="542" fill="#fca5a5" font-size="20" font-family="Arial, sans-serif">Castigo mutuo, caída de valor y desgaste</text>
  <text x="525" y="640" fill="#94a3b8" font-size="22" font-family="Arial, sans-serif">Rondas e iteraciones</text>
  <text x="36" y="360" fill="#94a3b8" font-size="22" font-family="Arial, sans-serif" transform="rotate(-90 36,360)">Valor acumulado</text>
</svg>
`;
}

function buildQuestionOptions(correct: string, distractors: string[]) {
  const unique = Array.from(new Set([correct, ...distractors])).slice(0, 4);
  while (unique.length < 4) {
    unique.push("Profundizar el análisis antes de actuar");
  }
  return unique.slice(0, 4);
}

function buildArgentinaSistemaQuiz(manifest: CourseManifest): QuizManifest {
  const descriptions = manifest.lessons.map((lesson) => lesson.description || lesson.title);

  const questionData = manifest.lessons.map((lesson, index) => {
    const distractors = descriptions
      .filter((_candidate, candidateIndex) => candidateIndex !== index)
      .slice(0, 3);
    const options = buildQuestionOptions(lesson.description || lesson.title, distractors);

    return {
      question: `¿Cuál es la idea central de la lección "${lesson.title}"?`,
      type: "multiple_choice" as const,
      options,
      correctAnswer: Math.max(0, options.indexOf(lesson.description || lesson.title)),
      explanation: `La lección se concentra en ${((lesson.description || lesson.title).charAt(0).toLowerCase() + (lesson.description || lesson.title).slice(1)).replace(/\.$/, "")}.`,
      points: 2,
      orderIndex: index + 1,
      legacyQuestionId: null,
    };
  });

  return {
    title: "Quiz: Argentina como Sistema Viviente",
    description: "Evalúa tu comprensión del recorrido sistémico desde los primeros principios hasta la aplicación territorial en Argentina.",
    passingScore: 75,
    timeLimit: 25,
    allowRetakes: true,
    maxAttempts: 3,
    legacyQuizId: 4,
    questions: questionData,
  };
}

async function restructureArgentinaSistemaViviente(courseDir: string, manifest: CourseManifest) {
  if (manifest.lessons.length >= 12 && manifest.lessons.length <= 16) {
    return;
  }

  const sourceEntries = manifest.lessons.slice();
  const sourceContentByKey = new Map<string, string>();
  const lessonsDir = path.join(courseDir, "lessons");

  for (const lesson of sourceEntries) {
    const lessonPath = path.join(courseDir, lesson.contentFile);
    sourceContentByKey.set(lesson.key, await fs.readFile(lessonPath, "utf8"));
  }

  const nextLessons: LessonManifestEntry[] = [];

  if (manifest.lessons.length > 16) {
    for (const [index, module] of ARGENTINA_SISTEMA_CORE.entries()) {
      const groupedEntries = module.sources
        .map((sourceIndex) => sourceEntries[sourceIndex])
        .filter((entry): entry is LessonManifestEntry => Boolean(entry));

      if (groupedEntries.length === 0) {
        continue;
      }

      const base = groupedEntries[0];
      const key = base.key || buildStableLessonKey(module.title, index);
      const contentFile = base.contentFile;
      const mergedContent = mergeLessonBodies(
        groupedEntries,
        sourceContentByKey,
        module.title,
        module.description,
        manifest.category,
      );

      await writeIfChanged(path.join(courseDir, contentFile), mergedContent);

      nextLessons.push({
        ...base,
        key,
        title: module.title,
        description: module.description,
        orderIndex: index,
        contentFile,
        legacyLessonId: base.legacyLessonId ?? null,
      });
    }
  } else {
    const sectionCorpus = new Map<string, string>();

    for (const raw of sourceContentByKey.values()) {
      for (const section of extractTopLevelSections(raw)) {
        if (ARGENTINA_SISTEMA_CORE.some((candidate) => candidate.title === section.title)) {
          sectionCorpus.set(section.title, section.body);
        }
      }
    }

    for (const [index, module] of ARGENTINA_SISTEMA_CORE.entries()) {
      const sectionBody = sectionCorpus.get(module.title)
        || `## ${module.title}\n\n${module.description}`;
      const normalizedContent = appendMissingStructuralSections(
        cleanupMarkdown(`${module.description}\n\n${sectionBody}`),
        module.title,
        module.description,
        manifest.category,
      );
      const key = buildStableLessonKey(module.title, index);
      const fileName = `${String(index + 1).padStart(2, "0")}-${key}.md`;
      const contentFile = path.join("lessons", fileName);

      await writeIfChanged(path.join(courseDir, contentFile), normalizedContent);

      nextLessons.push({
        key,
        title: module.title,
        description: module.description,
        type: "text",
        duration: null,
        orderIndex: index,
        isRequired: true,
        contentFile,
        videoUrl: null,
        documentUrl: null,
        legacyLessonId: null,
        searchSummary: null,
        seoTitle: null,
        seoDescription: null,
        indexable: true,
      });
    }
  }

  manifest.lessons = nextLessons;
  manifest.description = "Un recorrido condensado y coherente por los primeros principios de los sistemas, desde las leyes físicas y la complejidad hasta su aplicación práctica en familia, territorio y nación.";
  manifest.excerpt = "Comprende cómo funcionan los sistemas y usa esa mirada para intervenir mejor en tu vida, tu barrio y Argentina.";
  manifest.searchSummary = "Un recorrido condensado por los principios sistémicos que conectan energía, información, complejidad y organización territorial en Argentina.";
  manifest.seoDescription = normalizeSummary(manifest.description, 160);

  const activeFiles = new Set(nextLessons.map((lesson) => path.join(courseDir, lesson.contentFile)));
  const existingFiles = (await fs.readdir(lessonsDir))
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => path.join(lessonsDir, fileName));

  for (const existingFile of existingFiles) {
    if (!activeFiles.has(existingFile)) {
      await fs.rm(existingFile, { force: true });
    }
  }
}

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeIfChanged(filePath: string, nextContent: string) {
  let current = "";
  try {
    current = await fs.readFile(filePath, "utf8");
  } catch {
    current = "";
  }
  if (current !== nextContent) {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, nextContent, "utf8");
  }
}

async function remediateCourse(slug: string) {
  const courseDir = path.join(CONTENT_ROOT, slug);
  const manifestPath = path.join(courseDir, "course.json");
  const manifestRaw = await fs.readFile(manifestPath, "utf8");
  const manifest = ensureCourseManifestDefaults(courseManifestSchema.parse(JSON.parse(manifestRaw)));

  if (slug === "argentina-sistema-viviente-primeros-principios") {
    await restructureArgentinaSistemaViviente(courseDir, manifest);
  }

  manifest.title = normalizeTitleText(manifest.title);
  manifest.description = normalizeTerminology(manifest.description);
  manifest.searchSummary = manifest.searchSummary ? normalizeTerminology(manifest.searchSummary) : manifest.searchSummary;
  manifest.seoDescription = manifest.seoDescription ? normalizeTerminology(manifest.seoDescription) : manifest.seoDescription;

  const excerpt = manifest.excerpt || deriveExcerpt(manifest.description);
  const thumbnailPath = `/course-thumbnails/${slug}.svg`;
  const ogPath = `/course-og/${slug}.svg`;

  const thumbnailSvg = createCourseSvg(manifest.title, manifest.category, excerpt || manifest.description, 1600, 900);
  const ogSvg = createCourseSvg(manifest.title, manifest.category, excerpt || manifest.description, 1200, 630);
  await writeIfChanged(path.join(PUBLIC_ROOT, "course-thumbnails", `${slug}.svg`), thumbnailSvg);
  await writeIfChanged(path.join(PUBLIC_ROOT, "course-og", `${slug}.svg`), ogSvg);

  manifest.thumbnailUrl = thumbnailPath;
  manifest.ogImageUrl = ogPath;
  manifest.excerpt = excerpt;
  manifest.seoTitle = courseSeoTitle(manifest.title, manifest.category);
  manifest.seoDescription = normalizeSummary(excerpt || manifest.description, 160);
  manifest.searchSummary = buildSearchSummary(excerpt || manifest.description, manifest.description);
  manifest.lastReviewedAt = TODAY;

  for (const lesson of manifest.lessons) {
    const lessonPath = path.join(courseDir, lesson.contentFile);
    const raw = await fs.readFile(lessonPath, "utf8");
    const remediated = ensureLessonContent(
      raw,
      manifest.title,
      normalizeTitleText(lesson.title),
      normalizeTerminology(lesson.description || ""),
      manifest.level,
      manifest.category,
    );

    await writeIfChanged(lessonPath, remediated);

    lesson.title = normalizeTitleText(lesson.title);
    lesson.description = normalizeTerminology(removeEmojiScaffolding(lesson.description || stripRichText(remediated).split(".")[0] || lesson.title));
    lesson.duration = calcDurationMinutes(remediated, true);
    lesson.searchSummary = buildSearchSummary(lesson.description, stripRichText(remediated));
    lesson.seoTitle = lessonSeoTitle(lesson.title, manifest.title);
    lesson.seoDescription = normalizeSummary(lesson.description, 160);
  }

  manifest.duration = manifest.lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);

  const quizPath = path.join(courseDir, manifest.quizFile || "quiz.json");
  const quiz = slug === "argentina-sistema-viviente-primeros-principios"
    ? buildArgentinaSistemaQuiz(manifest)
    : quizManifestSchema.parse(JSON.parse(await fs.readFile(quizPath, "utf8")));

  if (!quiz.description) {
    quiz.description = `Evaluación de ${manifest.title}.`;
  }

  const representedLessons = new Set<number>();
  for (const question of quiz.questions) {
    const sourceLessonIndex = manifest.lessons.findIndex((lesson) => question.question.toLowerCase().includes(lesson.title.toLowerCase().split(" ").slice(0, 3).join(" ").toLowerCase()));
    if (sourceLessonIndex >= 0) {
      representedLessons.add(sourceLessonIndex);
    }
  }

  while (quiz.questions.length < manifest.lessons.length) {
    const lessonIndex = quiz.questions.length;
    const lesson = manifest.lessons[Math.min(lessonIndex, manifest.lessons.length - 1)];
    const correct = lesson.description || lesson.title;
    const distractors = manifest.lessons
      .filter((candidate) => candidate.key !== lesson.key)
      .slice(0, 3)
      .map((candidate) => candidate.description || candidate.title);
    const options = buildQuestionOptions(correct, distractors);
    quiz.questions.push({
      question: `¿Cuál es el foco principal de la lección "${lesson.title}"?`,
      type: "multiple_choice",
      options,
      correctAnswer: Math.max(0, options.indexOf(correct)),
      explanation: `La lección se centra en ${correct.toLowerCase()}.`,
      points: 1,
      orderIndex: quiz.questions.length + 1,
      legacyQuestionId: null,
    });
  }

  quiz.questions = quiz.questions.map((question, index) => ({
    ...question,
    orderIndex: index + 1,
  }));

  await writeIfChanged(manifestPath, serializePrettyJson(manifest));
  await writeIfChanged(quizPath, serializePrettyJson(quiz));
}

async function main() {
  const dirs = (await fs.readdir(CONTENT_ROOT, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  await writeIfChanged(
    path.join(PUBLIC_ROOT, "course-graphics", "hombre-gris", "payoff-evolution.svg"),
    createPayoffSvg(),
  );
  await writeIfChanged(
    path.join(PUBLIC_ROOT, "course-graphics", "hombre-gris", "evolucion-pago-estrategico.svg"),
    createPayoffSvg(),
  );

  for (const slug of dirs) {
    await remediateCourse(slug);
  }

  console.log(`Remediated ${dirs.length} course packages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
