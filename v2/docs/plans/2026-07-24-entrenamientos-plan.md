# Los entrenamientos (página 3.5) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir de cero el sistema de entrenamientos en Papel y Tinta — catálogo de
los {N} entrenamientos agrupados, portada de curso con su cuadro de lecciones, lector de
lección con cuerpo **verbatim** e edición impresa, y práctica que se corrige sola con
palitos y explicaciones — y montar, como cierre, la vidriera que la biblioteca dejó
especificada en 3.1. **{L} lecciones que hoy viajan a oscuras quedan navegables.**

**Architecture:** Cero backend, cero migraciones, cero endpoints (spec, Decisión 1: las
seis tablas de `packages/db` existen y están vacías; progreso y certificados son Fase 5).
Dos capas nuevas de datos —schemas Zod + normalizador en `@v2/shared` (los usa el
validador de build y la página) y `lib/courses-registry.ts` con globs **mixtos**: eager
para los 31 `course.json`, perezosos para los 329 cuerpos y los 31 `quiz.json`— más una
capa de derivaciones puras (`pages/Entrenamientos/entrenamientos-data.ts`), cuatro páginas
(composer fino + `sections/`, patrón Planes/Biblioteca) y una mudanza de primitiva
(`Palitos` a `components/papel/primitives/`).

**Tech Stack:** React 18 + wouter + Tailwind (tokens papel §9b) + Zod + Vitest/Testing
Library. Sin API, sin dependencias nuevas, sin CSS nuevo.

**Spec:** `docs/specs/2026-07-24-entrenamientos-papel-y-tinta.md` — **todo el copy sale de
ahí, carácter por carácter.** El copy de la vidriera de la biblioteca (Task 9) sale de
`docs/specs/2026-07-24-la-biblioteca-papel-y-tinta.md`, «§ 5 — Entrenamientos».

## Global Constraints

- `v2/CLAUDE.md` completo: sin `any`, sin `console.*`, archivos ≤ 300 LOC, `pnpm verify`
  verde antes de cada commit, Conventional Commits con scope.
- `docs/design-system/README.md` v1.1 es ley. §9b: PROHIBIDO el hex literal en TSX — solo
  tokens. **Este plan no enmienda la ley** (spec, «Enmiendas a la ley»): si al implementar
  aparece una necesidad que la ley no cubre, se para y se escribe la enmienda en el mismo
  commit, no se improvisa.
- **Contenido verbatim:** los {L} cuerpos de `content/courses/*/*.mdx` y las {P}
  explicaciones de los `quiz.json` se renderizan tal cual — tablas, SVG y emojis
  incluidos. La única omisión permitida es el primer bloque `# H1` cuando es idéntico al
  `title` del frontmatter (spec, Decisión 8). **Ni una palabra se reescribe.**
- **Cero literales de conteo en JSX:** «31», «329», «353», «8» se interpolan desde las
  derivadas. Los únicos números literales son topes de display (los 6 destacados de la
  vidriera, §8/D4) y van con comentario que cita la regla.
- **Cero métricas de progreso** (spec, Decisión 2): ni porcentajes, ni «completadas», ni
  `localStorage`, ni certificados. Si un test o una sección los pide, está mal el test.
- **Cero `NotaDemo`:** todo lo que se muestra sale de un archivo real.
- Una conversación = una página: NO tocar `Home/*`, `LaIdea/*`, `ElMapa/*`, `Planes/*`,
  `Sembrar/*`, `Manifiesto.tsx`, `Blog*.tsx`, `EnsayoDetail.tsx`, `MdxContent.tsx`,
  `MdxPapel.tsx`, `index.css` ni el chrome papel. **Excepciones sancionadas** (spec,
  «Rutas y navegación» + Decisión 16): `apps/web/src/App.tsx` (4 rutas nuevas, T5–T8) ·
  `apps/web/src/layouts/papel-routes.ts` (T5) · `pages/ElMandatoVivo/sections/`
  (2 líneas de import por la mudanza de `Palitos`, T3) · `pages/Biblioteca/*` y
  `pages/__tests__/Biblioteca.test.tsx` (la vidriera que 3.1 dejó agendada, T9) ·
  `scripts/build/build-content.ts` y `packages/shared/src/content/` (T1).
- **La ruta nace papel:** `/entrenamientos` entra a `PAPEL_ROUTES` con la primera página
  (T5), no al final — no hay superficie vieja con la que convivir, así que no hay estado
  interino que aceptar (a diferencia de 2.3/2.4/3.1).
- **Verificado 2026-07-24** y asumido por todo el plan: 31 cursos · 329 lecciones · 353
  preguntas · `orderIndex` de curso 1..31 sin repetir · un curso con `orderIndex` de
  lección arrancando en 0 · 10 cuerpos con `# H1` duplicado · 4 formas de `correctAnswer`
  · 2 lecciones que referencian un SVG que hoy solo existe en v1.

---

### Task 1: Schemas de contenido y normalizador (`@v2/shared`) + el validador de build

**Files:**
- Create: `packages/shared/src/content/courses.ts`
- Modify: `packages/shared/src/content/index.ts` (export)
- Modify: `scripts/build/build-content.ts` (dominio `courses`)
- Test: `packages/shared/tests/courses-content.test.ts`

**Interfaces:**
- Produces: `courseJsonSchema`, `quizJsonSchema`, `CourseJson`, `QuizJson`,
  `PreguntaNormalizada`, `normalizarPregunta()`, `derivarSlugDeLeccion()`. Los consumen
  el validador de build (este task) y el registry web (T2) — **una sola regla, dos
  consumidores, cero divergencia posible.**
- Consumes: `lessonFrontmatterSchema` (ya existe, no se toca), `loadContentDir`.

- [ ] **Step 1: Tests (fallan primero).** `packages/shared/tests/courses-content.test.ts`:
  - `derivarSlugDeLeccion('02-agere-la-etimologia-de-la-accion')` → `'agere-la-etimologia-de-la-accion'`;
    sin prefijo numérico devuelve la key tal cual.
  - `courseJsonSchema` acepta un fixture mínimo con `level: 'advanced'` y
    `lessons[0].orderIndex: 0`; rechaza `level: 'expert'` y `duration: 0`.
  - `quizJsonSchema` acepta las cuatro formas reales de pregunta (fixtures inline,
    copiados de la tabla de la spec) y rechaza `type: 'essay'`.
  - `normalizarPregunta` — una expectativa por forma:
    - MC + índice → `{ opciones: [...4], correcta: 2 }`;
    - MC + etiqueta exacta → resuelve el índice por `indexOf`;
    - TF sin `options` → `opciones: ['Verdadero','Falso']`, `correcta: 0` para `true`,
      `1` para `false`;
    - TF con `options: ['Verdadero','Falso']` + `'Falso'` → `correcta: 1`;
    - MC + etiqueta que no está entre las opciones → `null`;
    - MC + índice fuera de rango → `null`;
    - TF + string que no es Verdadero/Falso → `null`.

Run: `pnpm -C packages/shared exec vitest run tests/courses-content.test.ts`
Esperado: FAIL — módulo inexistente.

- [ ] **Step 2: Implementar `packages/shared/src/content/courses.ts`:**

```ts
/**
 * Schemas de los dos JSON de un entrenamiento + el normalizador de preguntas.
 *
 * `content/courses/<slug>/course.json` es el índice del curso (metadata +
 * lista de lecciones) y `quiz.json` su práctica. Los cuerpos son MDX y los
 * valida `lessonFrontmatterSchema`.
 *
 * Los campos que v1 dejó y el sitio no mira (seoTitle, ogImageUrl,
 * legacyCourseId, rekeys…) NO se declaran: Zod los descarta, y así el
 * schema documenta exactamente qué usa la página.
 */
import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const slugSchema = z.string().min(1).max(100).regex(slugRegex, 'Slugs must be kebab-case alphanumeric.');

export const courseLessonJsonSchema = z.object({
  /** Clave v1 con prefijo numérico: «02-agere-…». El slug se deriva. */
  key: z.string().min(1),
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  duration: z.number().int().positive(),
  /** Un curso arranca en 0 — de ahí el nonnegative (verificado 2026-07-24). */
  orderIndex: z.number().int().nonnegative(),
  contentFile: z.string().min(1),
});

export const courseJsonSchema = z.object({
  slug: slugSchema,
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  excerpt: z.string().min(1),
  category: z.string().min(1).max(60),
  level: z.enum(['beginner', 'intermediate', 'advanced']),
  /** Minutos totales; coincide con la suma de las lecciones en los 31. */
  duration: z.number().int().positive(),
  orderIndex: z.number().int().positive(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
  requiresAuth: z.boolean(),
  quizFile: z.string().min(1),
  lessons: z.array(courseLessonJsonSchema).min(1),
});
export type CourseJson = z.infer<typeof courseJsonSchema>;

export const quizQuestionJsonSchema = z.object({
  question: z.string().min(1),
  type: z.enum(['multiple_choice', 'true_false']),
  /** MC trae 4; TF trae null o ['Verdadero','Falso'] (6 casos). */
  options: z.array(z.string().min(1)).nullable().optional(),
  /** Cuatro formas reales: índice, booleano, etiqueta de opción, 'Verdadero'/'Falso'. */
  correctAnswer: z.union([z.number().int().nonnegative(), z.boolean(), z.string().min(1)]),
  explanation: z.string().min(1),
  points: z.number().int().positive(),
  orderIndex: z.number().int().positive(),
});

export const quizJsonSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  questions: z.array(quizQuestionJsonSchema).min(1),
});
export type QuizJson = z.infer<typeof quizJsonSchema>;
export type QuizQuestionJson = z.infer<typeof quizQuestionJsonSchema>;

export interface PreguntaNormalizada {
  enunciado: string;
  opciones: string[];
  /** Índice de la opción correcta dentro de `opciones`. */
  correcta: number;
  explicacion: string;
}

const VERDADERO = 'Verdadero';
const FALSO = 'Falso';

/**
 * Traduce las cuatro formas de `correctAnswer` a una sola. Devuelve `null`
 * cuando no resuelve — y `null` es un error de build (build-content), nunca
 * un estado de UI.
 */
export function normalizarPregunta(q: QuizQuestionJson): PreguntaNormalizada | null {
  const base = { enunciado: q.question, explicacion: q.explanation };
  if (q.type === 'true_false') {
    const opciones = [VERDADERO, FALSO];
    if (typeof q.correctAnswer === 'boolean') {
      return { ...base, opciones, correcta: q.correctAnswer ? 0 : 1 };
    }
    if (q.correctAnswer === VERDADERO) return { ...base, opciones, correcta: 0 };
    if (q.correctAnswer === FALSO) return { ...base, opciones, correcta: 1 };
    return null;
  }
  const opciones = q.options ?? [];
  if (opciones.length < 2) return null;
  if (typeof q.correctAnswer === 'number') {
    return q.correctAnswer < opciones.length ? { ...base, opciones, correcta: q.correctAnswer } : null;
  }
  if (typeof q.correctAnswer === 'string') {
    const i = opciones.indexOf(q.correctAnswer);
    return i === -1 ? null : { ...base, opciones, correcta: i };
  }
  return null;
}

/** Slug de lección desde la key v1 — misma regla con la que el migrador escribió los archivos. */
export function derivarSlugDeLeccion(key: string): string {
  return key.replace(/^\d+-/, '');
}
```

  Y en `packages/shared/src/content/index.ts`, junto al export existente:
  `export * from './courses.js';`

- [ ] **Step 3: Extender `scripts/build/build-content.ts`** — reemplazar el comentario
  «For now: just stub…» por el dominio real. Esqueleto (el archivo ya tiene el patrón de
  `PipelineSummary`/`LoaderError`):

```ts
async function loadCourses(root: string): Promise<PipelineSummary & { lessons: number; questions: number }> {
  const dir = `${root}content/courses`;
  const errors: LoaderError[] = [];
  let ok = 0, lessons = 0, questions = 0;
  const slugsVistos = new Set<string>();

  for (const entry of (await readdir(dir, { withFileTypes: true })).filter((e) => e.isDirectory())) {
    const cursoDir = `${dir}/${entry.name}`;
    const curso = courseJsonSchema.safeParse(JSON.parse(await readFile(`${cursoDir}/course.json`, 'utf8')));
    if (!curso.success) { /* push issues, continue */ }
    // 1. el directorio se llama como el slug; slug no repetido
    // 2. suma de lessons[].duration === duration
    // 3. cada lessons[].key → derivarSlugDeLeccion → existe <slug>.mdx
    // 4. cada .mdx del directorio está en lessons[] (loadContentDir + comparación de sets)
    // 5. courseSlug del frontmatter === slug del curso; orderIndex sin repetir
    // 6. quiz.json valida y normalizarPregunta() resuelve TODAS
    // 7. todo `](/algo)` del cuerpo existe en apps/web/public/
  }
  return { domain: 'courses', ok, errors, lessons, questions };
}
```

  La línea de salida suma los dos conteos:
  `[courses] ok=31 lessons=329 questions=353 errors=0`.

- [ ] **Step 4: PASS + verificación + commit.**

Run: `pnpm -C packages/shared exec vitest run tests/courses-content.test.ts` → PASS.
Run: `pnpm tsx scripts/build/build-content.ts` → debe imprimir
`[courses] ok=31 lessons=329 questions=353 errors=0` y salir 0.
`pnpm verify` verde.

```bash
git add packages/shared/src/content/courses.ts \
        packages/shared/src/content/index.ts \
        packages/shared/tests/courses-content.test.ts \
        scripts/build/build-content.ts
git commit -m "feat(shared,scripts): schemas de curso/quiz, normalizador de preguntas y cursos en el validador de contenido"
```

---

### Task 2: `courses-registry.ts` — eager para los índices, perezoso para los cuerpos

**Files:**
- Create: `apps/web/src/lib/courses-registry.ts`
- Test: `apps/web/src/lib/__tests__/courses-registry.test.ts`

**Interfaces:**
- Consumes: `courseJsonSchema`, `quizJsonSchema`, `normalizarPregunta`,
  `derivarSlugDeLeccion` (`@v2/shared`).
- Produces: `CursoEntry`, `LeccionEntry`, `CURSOS`, `CURSO_COUNT`, `LECCION_COUNT`,
  `findCursoBySlug()`, `cargarLeccion()`, `cargarPractica()`. Los consumen las
  derivaciones (T4), las cuatro páginas (T5–T8) y la vidriera de la biblioteca (T9).

- [ ] **Step 1: Tests (fallan primero).** `courses-registry.test.ts` — patrón
  `ensayos-registry.test.ts`, pero **sin literales de contenido**: los invariantes se
  computan desde el propio registry salvo los tres conteos de canon, que sí son literales
  a propósito (son la afirmación «no se perdió nada en la migración»):
  - `CURSOS` tiene 31 entradas; `LECCION_COUNT` es 329; los `orderIndex` de curso son
    exactamente `1..31` sin repetidos.
  - toda entrada trae `slug` kebab-case, `title`, `excerpt` y `description` no vacíos,
    `level` en el enum, `duration > 0` e igual a la suma de `lecciones[].minutos`.
  - `CURSOS` viene ordenado por `orderIndex`; `lecciones` de cada curso vienen ordenadas
    por su `orden` y sus slugs no se repiten dentro del curso.
  - **cobertura del glob (la red que reemplaza al validador de build):** el set de claves
    del glob perezoso de `.mdx` es **exactamente** el set de rutas derivadas de los 31
    `course.json` — ni un archivo huérfano, ni una lección sin archivo. Igual para
    `quiz.json`: 31 claves, una por curso.
  - `cargarLeccion(curso, leccion)` de la primera lección del primer curso devuelve un
    string no vacío que **no** empieza con `---` (frontmatter fuera) y
    `cargarLeccion('no','existe')` devuelve `null`.
  - `cargarPractica(slug)` del primer curso devuelve `{ descripcion, preguntas }` con
    `preguntas.length > 0` y toda pregunta con `opciones.length >= 2` y
    `0 <= correcta < opciones.length`; `cargarPractica('no-existe')` → `null`.
  - **todas las prácticas normalizan:** iterar los 31 slugs, cargar y afirmar que ninguna
    pregunta se perdió (`preguntas.length` coincide con las del archivo) y que el total es
    353.

Run: `pnpm -C apps/web exec vitest run src/lib/__tests__/courses-registry.test.ts`
Esperado: FAIL.

- [ ] **Step 2: Implementar `courses-registry.ts`** (esqueleto — lo no obvio son los tres
  globs y por qué son distintos):

```ts
/**
 * Registry de entrenamientos — build-time, con globs MIXTOS.
 *
 * Los 31 `course.json` (336 KB) van eager: el catálogo los necesita en la
 * primera pintura. Los 329 cuerpos (2,0 MB) y los 31 `quiz.json` van
 * PEREZOSOS: se baja una lección cuando se abre una lección. Es la primera
 * vez que el contenido del proyecto no entra en un glob eager, y la
 * respuesta es pereza, no backend (spec 3.5, Decisión 4).
 */
import { courseJsonSchema, derivarSlugDeLeccion, normalizarPregunta, quizJsonSchema, type PreguntaNormalizada } from '@v2/shared';

import { stripFrontmatter } from './markdown';

export interface LeccionEntry {
  slug: string;
  titulo: string;
  minutos: number;
  /** orderIndex del course.json — puede arrancar en 0. La URL usa la posición, no esto. */
  orden: number;
}

export interface CursoEntry {
  slug: string; title: string; description: string; excerpt: string;
  category: string; level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; orderIndex: number; isFeatured: boolean;
  lecciones: readonly LeccionEntry[];
}

const RAIZ = '../../../../content/courses';

const indices = import.meta.glob<unknown>(`${RAIZ}/*/course.json`, { eager: true, import: 'default' });
const cuerpos = import.meta.glob<string>(`${RAIZ}/*/*.mdx`, { query: '?raw', import: 'default' });
const practicas = import.meta.glob<string>(`${RAIZ}/*/quiz.json`, { query: '?raw', import: 'default' });

function construirRegistry(): CursoEntry[] {
  const entradas: CursoEntry[] = [];
  for (const crudo of Object.values(indices)) {
    const parsed = courseJsonSchema.safeParse(crudo);
    if (!parsed.success) continue; // build-content es el que grita; acá no se rompe la página
    const c = parsed.data;
    entradas.push({
      slug: c.slug, title: c.title, description: c.description, excerpt: c.excerpt,
      category: c.category, level: c.level, duration: c.duration,
      orderIndex: c.orderIndex, isFeatured: c.isFeatured,
      lecciones: [...c.lessons]
        .sort((a, b) => a.orderIndex - b.orderIndex)
        .map((l) => ({ slug: derivarSlugDeLeccion(l.key), titulo: l.title, minutos: l.duration, orden: l.orderIndex })),
    });
  }
  return entradas.sort((a, b) => a.orderIndex - b.orderIndex);
}

export const CURSOS: readonly CursoEntry[] = construirRegistry();
export const CURSO_COUNT = CURSOS.length;
export const LECCION_COUNT = CURSOS.reduce((n, c) => n + c.lecciones.length, 0);

export function findCursoBySlug(slug: string): CursoEntry | undefined {
  return CURSOS.find((c) => c.slug === slug);
}

/** Cuerpo MDX de una lección, sin frontmatter. `null` si la clave no existe. */
export async function cargarLeccion(cursoSlug: string, leccionSlug: string): Promise<string | null> {
  const cargar = cuerpos[`${RAIZ}/${cursoSlug}/${leccionSlug}.mdx`];
  if (!cargar) return null;
  return stripFrontmatter(await cargar());
}

export interface PracticaEntry {
  descripcion: string;
  preguntas: readonly PreguntaNormalizada[];
}

/** Quiz normalizado de un curso. `null` si no existe o no valida. */
export async function cargarPractica(cursoSlug: string): Promise<PracticaEntry | null> {
  const cargar = practicas[`${RAIZ}/${cursoSlug}/quiz.json`];
  if (!cargar) return null;
  const parsed = quizJsonSchema.safeParse(JSON.parse(await cargar()) as unknown);
  if (!parsed.success) return null;
  const preguntas = parsed.data.questions
    .slice()
    .sort((a, b) => a.orderIndex - b.orderIndex)
    .map(normalizarPregunta)
    .filter((p): p is PreguntaNormalizada => p !== null);
  return { descripcion: parsed.data.description, preguntas };
}
```

  (Ajustes permitidos: si Vite exige literal estático en `import.meta.glob`, escribir las
  tres rutas completas en vez de interpolar `RAIZ` — la constante queda solo para armar
  las claves de búsqueda.)

- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/lib/__tests__/courses-registry.test.ts` → PASS.
`pnpm verify` verde.

```bash
git add apps/web/src/lib/courses-registry.ts \
        apps/web/src/lib/__tests__/courses-registry.test.ts
git commit -m "feat(web): registry de entrenamientos — 31 índices eager, 329 cuerpos y 31 prácticas perezosos"
```

---

### Task 3: `Palitos` se muda a las primitivas (firma §10.6, segundo consumidor)

**Files:**
- Move: `apps/web/src/pages/ElMandatoVivo/sections/Palitos.tsx` →
  `apps/web/src/components/papel/primitives/Palitos.tsx`
- Modify: `apps/web/src/components/papel/primitives/index.ts` (export)
- Modify: `apps/web/src/pages/ElMandatoVivo/sections/DocumentoSecciones.tsx` (1 import)
- Modify: `apps/web/src/pages/ElMandatoVivo/sections/RegistroDelMapa.tsx` (1 import)
- Test: `apps/web/src/components/papel/primitives/primitives.test.tsx` (agregar caso)

**Interfaces:**
- Produces: `<Palitos n claseRelleno>` desde el barrel de primitivas. Lo consumen el
  mandato (2.3, sin cambios de comportamiento) y la práctica (T8).

- [ ] **Step 1: Test primero.** En `primitives.test.tsx`, agregar: `Palitos n={7}` dibuja
  2 grupos (5 + 2) → 7 trazos en total, el contenedor va `aria-hidden`, y `n={0}` no
  dibuja ninguno. Correr: FAIL (no exporta del barrel).
- [ ] **Step 2: Mudanza.** `git mv apps/web/src/pages/ElMandatoVivo/sections/Palitos.tsx
  apps/web/src/components/papel/primitives/Palitos.tsx`; agregar al barrel
  `export { Palitos, type PalitosProps } from './Palitos';`; cambiar los dos imports del
  mandato a `~/components/papel/primitives`. **Cero cambios al cuerpo del componente.**
- [ ] **Step 3: PASS + no-regresión del mandato + commit.**

Run: `pnpm -C apps/web exec vitest run src/components src/pages/ElMandatoVivo` → PASS
(los tests del mandato deben pasar **sin tocarlos**).
`pnpm verify` verde.

```bash
git add apps/web/src/components/papel/primitives/Palitos.tsx \
        apps/web/src/components/papel/primitives/index.ts \
        apps/web/src/components/papel/primitives/primitives.test.tsx \
        apps/web/src/pages/ElMandatoVivo/sections/DocumentoSecciones.tsx \
        apps/web/src/pages/ElMandatoVivo/sections/RegistroDelMapa.tsx
git rm --cached apps/web/src/pages/ElMandatoVivo/sections/Palitos.tsx 2>/dev/null || true
git commit -m "refactor(web): Palitos §10.6 pasa a components/papel/primitives — gana su segundo consumidor"
```

(`git mv` ya deja el borrado en el índice; el `git rm --cached` es defensivo y no debe
hacer falta. Verificar con `git diff --cached --stat` que aparece el rename.)

---

### Task 4: `entrenamientos-data.ts` — grupos, rótulos, duraciones y ubicaciones

**Files:**
- Create: `apps/web/src/pages/Entrenamientos/entrenamientos-data.ts`
- Test: `apps/web/src/pages/Entrenamientos/__tests__/entrenamientos-data.test.ts`

**Interfaces:**
- Consumes: `CURSOS`, `CursoEntry`, `LeccionEntry` (`~/lib/courses-registry`).
- Produces: `GRUPOS`, `Grupo`, `GRUPO_COUNT`, `rotuloDeCategoria()`, `rotuloNivel()`,
  `duracionLarga()`, `numeroDeFila()`, `ubicarCurso()`, `ubicarLeccion()`,
  `UbicacionCurso`, `UbicacionLeccion`. Los consumen T5–T8.

- [ ] **Step 1: Tests (fallan primero).** Cada expectativa se computa desde `CURSOS`:
  - **nada se pierde:** `GRUPOS.flatMap(g => g.cursos)` tiene `CURSOS.length` elementos y
    el mismo set de slugs; `GRUPO_COUNT === new Set(CURSOS.map(c => c.category)).size`.
  - **agrupación válida:** en cada grupo los `orderIndex` son estrictamente crecientes y
    todos los cursos comparten `category`.
  - **orden de los grupos derivado del `orderIndex` más chico:** computar en el test
    categoría→min(orderIndex) y comparar con `GRUPOS.map(g => g.categoria)`.
  - **rótulo con fallback:** todo grupo tiene `rotulo` no vacío;
    `rotuloDeCategoria('inexistente')` devuelve `'inexistente'`.
  - **niveles:** `rotuloNivel` mapea los tres valores del enum a `inicial`/`intermedio`/
    `avanzado`; todo curso tiene rótulo no vacío.
  - **duración:** `duracionLarga(45)` → `'45 min'`; `duracionLarga(85)` → `'1 h 25 min'`;
    `duracionLarga(120)` → `'2 h'`.
  - **vecinos de curso:** `ubicarCurso(CURSOS[0].slug).anterior` es `null`; el último no
    tiene `siguiente`; para un curso del medio de un grupo `cruzaGrupo === false`; para el
    último de un grupo que no es el último de todo, `siguiente.cruzaGrupo === true`;
    `ubicarCurso('no-existe')` → `null`.
  - **ubicación de lección:** `ubicarLeccion(slug, 1)` devuelve la primera lección del
    orden real (probar con el curso cuyo `orden` arranca en 0 — buscarlo por
    `c.lecciones[0].orden === 0`, sin hardcodear el slug) y `anterior === null`;
    `ubicarLeccion(slug, total)` tiene `siguiente === null` (la práctica la pone la
    página, no la derivada); `ubicarLeccion(slug, 0)`, `(slug, total + 1)` y
    `(slug, NaN)` → `null`.

Run: `pnpm -C apps/web exec vitest run src/pages/Entrenamientos`
Esperado: FAIL.

- [ ] **Step 2: Implementar** (lo no obvio: el rótulo es traducción del slug, no
  taxonomía; y la ubicación de lección es por posición, no por `orderIndex`):

```ts
import { CURSOS, type CursoEntry, type LeccionEntry } from '~/lib/courses-registry';

/**
 * Entrenamientos (spec 3.5) — derivaciones puras. Los grupos salen del campo
 * real `category`; el rótulo es ese slug puesto en castellano (traducción, no
 * taxonomía nueva) y no lleva descripción: ocho párrafos sobre ocho categorías
 * serían ocho afirmaciones que nadie escribió. Categoría sin rótulo → se
 * muestra igual con su slug.
 */
const ROTULOS: Record<string, string> = {
  'hombre-gris': 'El hombre gris',
  vision: 'La visión',
  action: 'Acción',
  reflection: 'Reflexión',
  community: 'Comunidad',
  economia: 'Economía',
  civica: 'Cívica',
  comunicacion: 'Comunicación',
};

const NIVELES: Record<CursoEntry['level'], string> = {
  beginner: 'inicial',
  intermediate: 'intermedio',
  advanced: 'avanzado',
};

export function rotuloDeCategoria(categoria: string): string {
  return ROTULOS[categoria] ?? categoria;
}
export function rotuloNivel(level: CursoEntry['level']): string {
  return NIVELES[level];
}

/** «45 min» · «1 h 25 min» · «2 h». */
export function duracionLarga(minutos: number): string {
  if (minutos < 60) return `${String(minutos)} min`;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  return m === 0 ? `${String(h)} h` : `${String(h)} h ${String(m)} min`;
}

export interface Grupo {
  categoria: string;
  rotulo: string;
  cursos: readonly CursoEntry[];
  /** Suma de lecciones del grupo — dato de la línea mono. */
  lecciones: number;
}

function construirGrupos(): Grupo[] { /* agrupa por category, ordena por orderIndex dentro,
  y ordena los grupos por el orderIndex más chico del grupo */ }

export const GRUPOS: readonly Grupo[] = construirGrupos();
export const GRUPO_COUNT = GRUPOS.length;

export interface VecinoCurso { curso: CursoEntry; grupo: Grupo; cruzaGrupo: boolean }
export interface UbicacionCurso { grupo: Grupo; anterior: VecinoCurso | null; siguiente: VecinoCurso | null }
export function ubicarCurso(slug: string): UbicacionCurso | null { /* patrón exacto de ubicarEnsayo (3.1) */ }

export interface UbicacionLeccion {
  curso: CursoEntry;
  leccion: LeccionEntry;
  /** 1-based: lo que va en la URL y lo que dice el kicker. */
  posicion: number;
  total: number;
  anterior: { leccion: LeccionEntry; posicion: number } | null;
  siguiente: { leccion: LeccionEntry; posicion: number } | null;
}

/** `n` es POSICIÓN 1-based en la lista ordenada, nunca el `orderIndex` crudo. */
export function ubicarLeccion(cursoSlug: string, n: number): UbicacionLeccion | null {
  const curso = CURSOS.find((c) => c.slug === cursoSlug);
  if (!curso || !Number.isInteger(n) || n < 1 || n > curso.lecciones.length) return null;
  /* … */
}

/** Numeración de fila: «01»…«NN» (idéntica a 3.1). */
export function numeroDeFila(indice: number): string {
  return String(indice + 1).padStart(2, '0');
}
```

- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/Entrenamientos` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/Entrenamientos/entrenamientos-data.ts \
        apps/web/src/pages/Entrenamientos/__tests__/entrenamientos-data.test.ts
git commit -m "feat(web): derivaciones de entrenamientos — grupos por categoría real, niveles, duraciones y vecinos"
```

---

### Task 5: El catálogo `/entrenamientos` (portada + índice con pliegue + cierre) y su ruta

**Files:**
- Create: `apps/web/src/pages/Entrenamientos/sections/PortadaEntrenamientos.tsx`
- Create: `apps/web/src/pages/Entrenamientos/sections/IndiceEntrenamientos.tsx`
- Create: `apps/web/src/pages/Entrenamientos/sections/CierreEntrenamientos.tsx`
- Create: `apps/web/src/pages/Entrenamientos.tsx` (composer; named + default export)
- Modify: `apps/web/src/App.tsx` (lazy + `<Route path="/entrenamientos">`)
- Modify: `apps/web/src/layouts/papel-routes.ts` + su test
- Test: `apps/web/src/pages/__tests__/Entrenamientos.test.tsx`

**Interfaces:**
- Consumes: `CURSO_COUNT`, `LECCION_COUNT` (`~/lib/courses-registry`) · `GRUPOS`,
  `numeroDeFila`, `rotuloNivel`, `duracionLarga` (`../entrenamientos-data`) ·
  `Kicker`, `RitoTinta`, `BotonPapel`, `BandaCta`, `FilaIndiceExpandible`.
- Produces: `/entrenamientos` navegable y con chrome papel.

- [ ] **Step 1: Tests (fallan primero).** `Entrenamientos.test.tsx` (render dentro de
  `<Router>` de wouter, patrón `Biblioteca.test.tsx`):
  - kicker `Entrenamientos · sin cuenta, sin costo`; heading nivel 1 con `aria-label`
    `Entrená la mirada.`
  - lead: contiene `${CURSO_COUNT} entrenamientos, ${LECCION_COUNT} lecciones` y la
    segunda línea `Nada de esto se guarda:` (interpolados, nunca literales).
  - encabezado `El catálogo entero · tocá para abrir`; un `<h3>` por grupo con su rótulo;
    la línea mono del grupo contiene `${g.cursos.length} entrenamientos` y
    `${g.lecciones} lecciones`.
  - se renderizan `CURSO_COUNT` botones de fila; la primera fila del primer grupo es `01`
    + el título de `GRUPOS[0].cursos[0]` + su marca de nivel.
  - **apertura única global:** click en una fila del primer grupo muestra su `excerpt`
    entre comillas angulares y el link
    `Abrir el entrenamiento · {n} lecciones · {duración} →` con
    `href="/entrenamientos/{slug}"`; click en una fila del último grupo cierra la anterior
    (un solo `aria-expanded="true"`); click en la abierta la cierra.
  - cierre: `Entrenaste. Ahora usalo.` + link `Soltar mi voz en el mapa →` a `/el-mapa`.
  - **honestidad:** `queryByText(/certificado|progreso|inscrib/i)` es null;
    `queryByText(/datos de demostración/i)` es null; `container.innerHTML` sin `glass`,
    `gradient-text`, `iris-violet`, `font-serif`.
  - En `papel-routes.test.ts`: `esRutaPapel('/entrenamientos')` → true ·
    `esRutaPapel('/entrenamientos/la-metamorfosis')` → true ·
    `esRutaPapel('/entrenamientosque')` → false.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Entrenamientos.test.tsx src/layouts`
Esperado: FAIL.

- [ ] **Step 2: Implementar las tres secciones + el composer.** El copy sale de la spec
  («Página A»), carácter por carácter. `IndiceEntrenamientos` es el gemelo de
  `IndiceEnsayos` (3.1): estado `abierto: string | null` **en la sección** (apertura única
  global), `FilaIndiceExpandible` por curso, y en el `encabezado` el título + la marca de
  nivel compuesta inline con la receta §5:

```tsx
<span className="font-space border-tinta-30 text-tinta-50 border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em]">
  {rotuloNivel(curso.level)}
</span>
```

  El composer, patrón `Biblioteca.tsx`:

```tsx
export function Entrenamientos() {
  return (
    <main>
      <PortadaEntrenamientos />
      <IndiceEntrenamientos />
      <CierreEntrenamientos />
    </main>
  );
}
export default Entrenamientos;
```

- [ ] **Step 3: Ruta + papel.** En `App.tsx`, el lazy con el patrón de los demás y
  `<Route path="/entrenamientos" component={Entrenamientos} />` en el bloque «Content +
  community», **arriba** de donde caerán las rutas de T6–T8. En `papel-routes.ts`:
  `/entrenamientos` al Set y `/entrenamientos/` a `PAPEL_PREFIXES` (el prefijo entra ya,
  aunque sus páginas lleguen en T6–T8: `esRutaPapel` es una función de la ruta, no del
  router).
- [ ] **Step 4: PASS + navegador + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Entrenamientos.test.tsx src/layouts` → PASS.
`pnpm verify` verde. Navegador: `/entrenamientos` con chrome papel, rito en el H1, los 8
grupos, el pliegue abriendo de a uno.

```bash
git add apps/web/src/pages/Entrenamientos.tsx \
        apps/web/src/pages/Entrenamientos/sections/PortadaEntrenamientos.tsx \
        apps/web/src/pages/Entrenamientos/sections/IndiceEntrenamientos.tsx \
        apps/web/src/pages/Entrenamientos/sections/CierreEntrenamientos.tsx \
        apps/web/src/pages/__tests__/Entrenamientos.test.tsx \
        apps/web/src/App.tsx \
        apps/web/src/layouts/papel-routes.ts \
        apps/web/src/layouts/__tests__/papel-routes.test.ts
git commit -m "feat(web): catálogo de entrenamientos en /entrenamientos — los 31, agrupados, con pliegue"
```

---

### Task 6: La portada del entrenamiento `/entrenamientos/:slug`

**Files:**
- Create: `apps/web/src/pages/EntrenamientoDetail.tsx`
- Modify: `apps/web/src/App.tsx` (ruta)
- Create: `apps/web/public/course-graphics/hombre-gris/evolucion-pago-estrategico.svg` (copia literal del asset de v1 — lo referencian dos lecciones)
- Test: `apps/web/src/pages/__tests__/EntrenamientoDetail.test.tsx`

**Interfaces:**
- Consumes: `findCursoBySlug` · `ubicarCurso`, `rotuloNivel`, `duracionLarga`,
  `numeroDeFila` · `Kicker`, `RitoTinta`, `Sello`, `BotonPapel`.
- Produces: la portada de cada uno de los 31 entrenamientos.

- [ ] **Step 1: Tests (fallan primero).** Con `memoryLocation({ path, static: true })`
  (patrón `PlanDetail.test.tsx`). Fixtures **por posición derivada**: `CURSOS[0]`,
  `CURSOS.at(-1)`, y un curso del medio de un grupo:
  - kicker `Entrenamiento · ${rotuloNivel(c.level)} · ${duracionLarga(c.duration)}`;
    heading nivel 1 con `aria-label` igual al `title`; lead con la `description` real.
  - cuadro de lecciones: encabezado `Lecciones` + `gratis · a tu ritmo`; se renderizan
    `c.lecciones.length` links; el primero apunta a `/entrenamientos/{slug}/leccion/1` y
    muestra `01`, su título y `{min} min`; el último apunta a `/leccion/{total}`.
  - cuadro de práctica: `La práctica`, el copy exacto de la spec, y link
    `Hacer la práctica →` a `/entrenamientos/{slug}/practica`.
  - cadena: `CURSOS[0]` no tiene link «←»; el último no tiene «→»; para el último curso de
    un grupo intermedio el link siguiente contiene el rótulo del grupo destino (aviso de
    cruce) y para un vecino del mismo grupo esa línea no está.
  - **honestidad:** sin `certificado`, sin `%`, sin `progreso`, sin conteo de preguntas.
  - 404: slug inexistente → kicker `expediente extraviado`, heading
    `Ese entrenamiento no está.`, sello `Extraviado`, CTA `Ver los entrenamientos →` a
    `/entrenamientos`.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/EntrenamientoDetail.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar.** Copy y layout de la spec, «Página B». Estructura del
  cuadro de lecciones (receta de tabla/fila de índice §5, compuesta inline):

```tsx
<div className="border-tinta border">
  <div className="bg-papel-crudo border-tinta font-space flex justify-between border-b px-[22px] py-3.5 text-[11px] font-bold uppercase tracking-[0.14em]">
    <span>Lecciones</span>
    <span className="text-tinta-50">gratis · a tu ritmo</span>
  </div>
  {curso.lecciones.map((l, i) => (
    <Link key={l.slug} href={`/entrenamientos/${curso.slug}/leccion/${String(i + 1)}`}
      className="border-papel-borde text-tinta hover:bg-papel-presionado grid grid-cols-[52px_1fr_70px] items-center gap-[18px] border-b px-[22px] py-[17px] transition-colors duration-150 max-[560px]:grid-cols-[40px_1fr]">
      <span className="font-space text-tinta-30 text-xs">{numeroDeFila(i)}</span>
      <span className="text-base font-semibold">{l.titulo}</span>
      <span className="font-space text-tinta-50 text-[11px] max-[560px]:col-start-2 min-[561px]:text-right">
        {l.minutos} min
      </span>
    </Link>
  ))}
</div>
```

- [ ] **Step 3: Portar el asset de las dos lecciones que lo usan.**

```bash
mkdir -p apps/web/public/course-graphics/hombre-gris
cp ../SocialJusticeHub/public/course-graphics/hombre-gris/evolucion-pago-estrategico.svg \
   apps/web/public/course-graphics/hombre-gris/evolucion-pago-estrategico.svg
# control: ninguna otra ruta local referenciada por un cuerpo debe faltar
grep -rho "](/[^)]*)" content/courses | sort -u
```

- [ ] **Step 4: Ruta + PASS + navegador + commit.** En `App.tsx`, `<Route
  path="/entrenamientos/:slug" component={EntrenamientoDetail} />` **debajo** de las de
  T7/T8 cuando existan (por ahora va sola; T7 y T8 la empujan hacia abajo).

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/EntrenamientoDetail.test.tsx` → PASS.
`pnpm verify` verde. Navegador: tres cursos distintos, incluido el de 16 lecciones.

```bash
git add apps/web/src/pages/EntrenamientoDetail.tsx \
        apps/web/src/pages/__tests__/EntrenamientoDetail.test.tsx \
        apps/web/src/App.tsx \
        apps/web/public/course-graphics/hombre-gris/evolucion-pago-estrategico.svg
git commit -m "feat(web): portada del entrenamiento — lecciones, duración real y puerta a la práctica"
```

---

### Task 7: El lector de lección `/entrenamientos/:slug/leccion/:n`

**Files:**
- Create: `apps/web/src/pages/LeccionDetail.tsx`
- Modify: `apps/web/src/App.tsx` (ruta, **antes** de `/entrenamientos/:slug`)
- Test: `apps/web/src/pages/__tests__/LeccionDetail.test.tsx`

**Interfaces:**
- Consumes: `cargarLeccion` · `ubicarLeccion` · `MdxPapel`, `Kicker`, `RitoTinta`,
  `Sello`, `BotonPapel` · `.edicion-impresa` (ya en `index.css`).
- Produces: las {L} lecciones navegables, imprimibles, verbatim.

- [ ] **Step 1: Tests (fallan primero).** Con `memoryLocation` + `findBy*` (el cuerpo es
  asincrónico). Fixtures por posición derivada, más **una fixture explícita**: el curso
  cuyos cuerpos abren con `# H1` (buscarlo por contenido, no por slug — cargar la lección
  y comprobar).
  - **Cabecera y cuerpo:** kicker `Lección ${posicion} de ${total} · ${min} min`; heading
    nivel 1 con `aria-label` igual al `title` de la lección; tras `findByRole`, un
    fragmento real del cuerpo presente en el DOM.
  - **Deduplicación de H1:** para una lección cuyo cuerpo abre con `# {title}`, hay
    **exactamente un** `heading` nivel 1 en la página y el texto del título aparece una
    sola vez. Para una lección normal, el cuerpo se renderiza completo desde su primer
    `##`.
  - **Cadena:** la lección 1 no tiene link «←»; una del medio tiene los dos con los
    títulos reales de sus vecinas; **la última tiene `La práctica →`** apuntando a
    `/entrenamientos/{slug}/practica` y ningún link a otra lección.
  - **Estados:** mientras carga, el microcopy `Cargando — menos que un trámite.`
  - **Edición impresa:** el `<article>` lleva `edicion-impresa`; el folio
    `¡BASTA! · edición del lector ·` está en el DOM con `hidden`+`print:block`; backlink y
    cadena llevan `print:hidden`; el H1 lleva `print:[&_span]:animate-none`.
  - **404:** `/leccion/0`, `/leccion/{total+1}`, `/leccion/abc` y slug inexistente →
    `Esa lección no está.` + sello `Extraviado` + `Ver los entrenamientos →`.
  - **Honestidad:** sin `— El hombre gris`, sin sello de completado, sin CTA al mapa, sin
    `%`.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/LeccionDetail.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar.** Lo no obvio son la carga perezosa y la deduplicación:

```tsx
/** Quita el primer bloque `# …` SOLO cuando repite el título del frontmatter (spec, D8). */
export function sinTituloDuplicado(cuerpo: string, titulo: string): string {
  const m = /^#\s+(.+?)\s*\n/.exec(cuerpo);
  if (!m) return cuerpo;
  const normalizar = (s: string) => s.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-AR');
  return normalizar(m[1] ?? '') === normalizar(titulo) ? cuerpo.slice(m[0].length).trimStart() : cuerpo;
}

type EstadoCuerpo = { fase: 'cargando' } | { fase: 'listo'; cuerpo: string } | { fase: 'error' };

function useCuerpoDeLeccion(cursoSlug: string, leccionSlug: string, titulo: string): EstadoCuerpo {
  const [estado, setEstado] = useState<EstadoCuerpo>({ fase: 'cargando' });
  useEffect(() => {
    let vivo = true;
    setEstado({ fase: 'cargando' });
    cargarLeccion(cursoSlug, leccionSlug)
      .then((crudo) => {
        if (!vivo) return;
        setEstado(crudo === null ? { fase: 'error' } : { fase: 'listo', cuerpo: sinTituloDuplicado(crudo, titulo) });
      })
      .catch(() => { if (vivo) setEstado({ fase: 'error' }); });
    return () => { vivo = false; };
  }, [cursoSlug, leccionSlug, titulo]);
  return estado;
}
```

  El cuerpo se pinta con `MdxPapel` + los estilos de tabla §5 pasados por `className`
  (`prose-table:w-full prose-table:border-collapse`, `prose-th:font-space
  prose-th:text-[11px] prose-th:uppercase prose-th:text-tinta-50 prose-th:border-b
  prose-th:border-tinta`, `prose-td:border-b prose-td:border-papel-borde`,
  contenedor con `overflow-x-auto`). Skeleton: tres bloques `bg-papel-presionado
  anim-pulso-papel` del alto del cuerpo + el microcopy §10.9.

- [ ] **Step 3: Ruta + PASS + navegador + commit.** En `App.tsx` la ruta va **antes** de
  `/entrenamientos/:slug`.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/LeccionDetail.test.tsx` → PASS.
`pnpm verify` verde. Navegador: una lección normal, una del curso con `# H1` duplicado,
una con `<table>`, una con `<svg>`, y la que usa el SVG portado.

```bash
git add apps/web/src/pages/LeccionDetail.tsx \
        apps/web/src/pages/__tests__/LeccionDetail.test.tsx \
        apps/web/src/App.tsx
git commit -m "feat(web): lector de lección — cuerpo verbatim, carga perezosa, cadena del curso y edición impresa"
```

---

### Task 8: La práctica `/entrenamientos/:slug/practica`

**Files:**
- Create: `apps/web/src/pages/PracticaDetail.tsx`
- Create: `apps/web/src/pages/Entrenamientos/sections/PreguntaPractica.tsx`
- Modify: `apps/web/src/App.tsx` (ruta, **antes** de `/entrenamientos/:slug`)
- Test: `apps/web/src/pages/__tests__/PracticaDetail.test.tsx`

**Interfaces:**
- Consumes: `cargarPractica`, `PreguntaNormalizada` · `findCursoBySlug` · `Kicker`,
  `RitoTinta`, `BotonPapel`, `BandaCta`, `Sello`, `Palitos` (T3).
- Produces: las 31 prácticas, 353 preguntas contestables y corregidas en el acto.

- [ ] **Step 1: Tests (fallan primero).** `PracticaDetail.test.tsx` con `memoryLocation` y
  `findBy*`. Fixture: el curso con **menos** preguntas (10) para que el test conteste
  todas sin ruido; buscarlo cargando las prácticas, no por slug hardcodeado.
  - kicker `Práctica · ${n} preguntas`; heading nivel 1 `La práctica.`; lead con la
    `description` real del quiz; el aviso exacto de la spec.
  - se renderizan `n` `<fieldset>` con `<legend>` `Pregunta {i} de {n}` y sus opciones como
    radios; una pregunta `true_false` muestra `Verdadero`/`Falso` **aunque su archivo no
    traiga `options`**.
  - **corrección:** click en la opción correcta → `Esa era.` + la `explanation` real
    visible + el fieldset queda `disabled`; en otra pregunta, click en una incorrecta →
    `No era esa.` + la explicación + la opción correcta marcada; un segundo click no
    cambia nada.
  - **resultado:** antes de contestar todas no hay `Resultado`; contestadas las `n`
    aparece `Resultado`, el conteo mono `{aciertos} de {n}` y los palitos
    (`aria-hidden`). **Nunca** aparece un `%`, ni `aprobado`, ni `desaprobado`, ni
    `puntos`, ni `minutos`, ni `intentos`.
  - `Empezar de nuevo ↺` vuelve todo a cero (ningún fieldset `disabled`, sin `Resultado`).
  - cierre `Ya lo pensaste. Ahora decilo.` + link `Soltar mi voz en el mapa →`.
  - 404 con slug inexistente; microcopy de carga mientras baja el quiz.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/PracticaDetail.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar.** Estado: `Map<number, number>` (índice de pregunta →
  opción elegida), inmutable, en la página; `PreguntaPractica` es presentacional puro:

```tsx
interface PreguntaPracticaProps {
  pregunta: PreguntaNormalizada;
  indice: number;
  total: number;
  elegida: number | null;
  onElegir: (opcion: number) => void;
}
```

  Reglas de render: sin `elegida`, radios habilitados; con `elegida`, `<fieldset disabled>`
  (los estilos deshabilitados van con tokens tinta-30, **nunca opacity** — §5 «Estados»),
  la elegida marcada, la correcta marcada en verde si erró, la línea mono
  (`Esa era.` verde / `No era esa.` rojo-sello) y la explicación con
  `anim-fadeup-rapido` dentro de un contenedor `aria-live="polite"`.
  El resultado usa `Palitos n={aciertos} claseRelleno="bg-violeta"` + el conteo mono al
  lado — **el conteo es el dato accesible; los palitos van `aria-hidden`** (contrato de la
  primitiva).

- [ ] **Step 3: Ruta + PASS + navegador + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/PracticaDetail.test.tsx` → PASS.
`pnpm verify` verde. Navegador: una práctica entera contestada (aciertos y errores), y la
del curso con las 6 `true_false` que traen `options`.

```bash
git add apps/web/src/pages/PracticaDetail.tsx \
        apps/web/src/pages/Entrenamientos/sections/PreguntaPractica.tsx \
        apps/web/src/pages/__tests__/PracticaDetail.test.tsx \
        apps/web/src/App.tsx
git commit -m "feat(web): la práctica — corrección instantánea con explicación real y resultado en palitos"
```

---

### Task 9: La vidriera de la biblioteca, barridos y prueba en navegador

**Files:**
- Create: `apps/web/src/pages/Biblioteca/sections/EntrenamientosCurados.tsx`
- Modify: `apps/web/src/pages/Biblioteca/biblioteca-data.ts` (`CURSOS_DESTACADOS`)
- Modify: `apps/web/src/pages/Biblioteca/sections/PortadaBiblioteca.tsx` (lead con entrenamientos)
- Modify: `apps/web/src/pages/Biblioteca.tsx` (orden de secciones)
- Modify: `apps/web/src/pages/__tests__/Biblioteca.test.tsx` (ausencia → presencia)
- Modify: `apps/web/src/pages/Biblioteca/__tests__/biblioteca-data.test.ts` (curación)

**Interfaces:**
- Consumes: `CURSOS`, `CURSO_COUNT` (`~/lib/courses-registry`) · `rotuloNivel`,
  `duracionLarga` (`~/pages/Entrenamientos/entrenamientos-data`).
- Produces: el hub 3.1 completo, como lo dibuja el especimen; el sistema de
  entrenamientos entero, alcanzable desde la navegación real.

- [ ] **Step 1: Tests primero.** En `biblioteca-data.test.ts`: `CURSOS_DESTACADOS` son los
  **primeros 6 `isFeatured` por `orderIndex`** (computar el esperado desde `CURSOS` en el
  test), tiene a lo sumo 6 elementos y ninguno con `isFeatured === false`. En
  `Biblioteca.test.tsx`, **reemplazar** el caso «la deferral de entrenamientos queda
  pineada» por:
  - kicker `Entrenamiento · el ojo se educa`; heading `Para diseñar un país, primero entrená la mirada.`;
  - se renderizan `CURSOS_DESTACADOS.length` celdas, cada una con su nivel, `{duration} min`,
    título, `excerpt` y `{n} lecciones · Empezar →` linkeando a `/entrenamientos/{slug}`;
  - link final `Ver los ${CURSO_COUNT} entrenamientos →` con `href="/entrenamientos"`;
  - el lead de la portada ahora contiene `los entrenamientos`.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Biblioteca.test.tsx src/pages/Biblioteca`
Esperado: FAIL.

- [ ] **Step 2: Implementar la vidriera** — **el copy y el layout se transcriben de
  `docs/specs/2026-07-24-la-biblioteca-papel-y-tinta.md`, «§ 5 — Entrenamientos»**, sin
  reinterpretarlos: banda `bg-papel-crudo` con borde superior e inferior 1px tinta, kicker
  violeta, H2 Anton de dos líneas, lead, grilla de 3 (1 columna <960) con juntas de 1px
  tinta, celdas `bg-papel-crudo` con hover `bg-papel`, y el link final al catálogo. En
  `biblioteca-data.ts`, junto a los otros topes de display:

```ts
/** Tope de display de la vidriera (§8/D4): 6 curados. El catálogo tiene todos. */
const DESTACADOS_EN_EL_HUB = 6;
/** Curación real del contenido: `isFeatured` + el recorrido del autor (`orderIndex`). */
export const CURSOS_DESTACADOS = CURSOS.filter((c) => c.isFeatured).slice(0, DESTACADOS_EN_EL_HUB);
```

  En `Biblioteca.tsx`, la sección entra **entre `IndiceEnsayos` y `BitacoraReciente`**
  (orden del especimen). En `PortadaBiblioteca.tsx`, el lead pasa a su variante:
  `…el manifiesto, {N} ensayos en {C} ciclos, los entrenamientos y la bitácora de lo que va pasando…`

- [ ] **Step 3: Barridos de control** (todos deben dar cero salvo donde se indica):

```bash
# Chrome muerto en lo nuevo:
grep -rn "glass\|gradient-text\|iris-violet\|font-serif\|MdxContent\|components/ui/button" \
  apps/web/src/pages/Entrenamientos.tsx apps/web/src/pages/Entrenamientos/ \
  apps/web/src/pages/EntrenamientoDetail.tsx apps/web/src/pages/LeccionDetail.tsx \
  apps/web/src/pages/PracticaDetail.tsx apps/web/src/lib/courses-registry.ts
# Hex literal en TSX (§9b):
grep -rn "#[0-9A-Fa-f]\{6\}" apps/web/src/pages/Entrenamientos.tsx apps/web/src/pages/Entrenamientos/ \
  apps/web/src/pages/EntrenamientoDetail.tsx apps/web/src/pages/LeccionDetail.tsx \
  apps/web/src/pages/PracticaDetail.tsx
# Métricas prohibidas (spec, D2/D6) — revisar a ojo lo que salga:
grep -rn "certificad\|progres\|passingScore\|timeLimit\|maxAttempts\|%" \
  apps/web/src/pages/Entrenamientos/ apps/web/src/pages/PracticaDetail.tsx
# Literales de conteo en JSX:
grep -rn "\b31\b\|\b329\b\|\b353\b" apps/web/src/pages/Entrenamientos/ \
  apps/web/src/pages/Biblioteca/sections/
# Tamaño del chunk: reportar el peso de los chunks de entrenamientos y biblioteca.
pnpm -C apps/web build && ls -lh apps/web/dist/assets | grep -i "entrenamiento\|biblioteca"
```

  **Umbral declarado:** si el chunk del catálogo o el de la biblioteca supera **120 KB
  gzip**, el registry pasa a emitir un índice recortado desde `build-content.ts` (deuda
  anotada abajo) — no se resuelve improvisando en esta tarea.

- [ ] **Step 4: Suite completa.**

Run: `pnpm -C apps/web exec vitest run` → PASS (nada de Home/LaIdea/ElMapa/ElMandatoVivo/
Planes/Sembrar/Biblioteca roto). `pnpm -C packages/shared exec vitest run` → PASS.
`pnpm tsx scripts/build/build-content.ts` → `errors=0`. `pnpm verify` verde.

- [ ] **Step 5: Prueba en navegador (desktop + mobile, con capturas).**
  - (a) `/entrenamientos`: rito en «Entrená la mirada.», lead con 31 y 329 reales, los 8
    grupos con su línea mono y su título Anton, las 31 filas numeradas dentro del grupo
    con su marca de nivel.
  - (b) **El pliegue** (firma): abrir una fila del primer grupo — glifo a `−`, título a
    violeta, panel con el `excerpt` entre comillas y el link con lecciones y duración;
    abrir una del último grupo cierra la anterior.
  - (c) `/entrenamientos/{slug}` de tres cursos distintos (uno de 8 lecciones, el de 16, y
    uno del último grupo): kicker con nivel y duración, cuadro de lecciones completo,
    cuadro de práctica, cadena con aviso de cruce de grupo.
  - (d) `/entrenamientos/{slug}/leccion/1` → recorrer hasta la última con «siguiente»; la
    última ofrece `La práctica →`. Verificar: una lección con `<table>`, una con `<svg>`,
    la del SVG portado (que **carga**, no 404), y una del curso con `# H1` duplicado
    (**un solo título en pantalla**).
  - (e) **Print preview (Cmd+P) de una lección — captura obligatoria:** sin header/footer/
    grano, todo en serifa, folio `¡BASTA! · edición del lector · {fecha}` como primera
    línea, **título en tinta (no gris)**, kicker y cuerpo presentes, sin backlink ni
    cadena, tablas legibles.
  - (f) `/entrenamientos/{slug}/practica`: contestar bien y mal, ver `Esa era.` /
    `No era esa.` con la explicación; contestar las 10 y ver el resultado en palitos con el
    conteo mono; `Empezar de nuevo ↺`; **ningún porcentaje en pantalla**.
  - (g) `/biblioteca`: la vidriera montada entre ensayos y bitácora, 6 celdas reales,
    `Ver los 31 entrenamientos →` abriendo el catálogo, y el lead con «los entrenamientos».
  - (h) 404s: `/entrenamientos/no-existe`, `/entrenamientos/{slug}/leccion/0`,
    `/entrenamientos/{slug}/leccion/999`, `/entrenamientos/{slug}/leccion/abc`.
  - (i) Móvil 375px: catálogo a 1 columna con títulos completos, cuadro de lecciones con
    los minutos en segunda línea, tablas del cuerpo con scroll propio (la página **no**
    desborda), radios de la práctica con target ≥ 44px.
  - (j) `prefers-reduced-motion`: catálogo quieto y completo, pliegue sin animación,
    corrección de la práctica sin `fadeup`, palitos dibujados enteros.
- [ ] **Step 6: Commit.**

```bash
git add apps/web/src/pages/Biblioteca/sections/EntrenamientosCurados.tsx \
        apps/web/src/pages/Biblioteca/biblioteca-data.ts \
        apps/web/src/pages/Biblioteca/sections/PortadaBiblioteca.tsx \
        apps/web/src/pages/Biblioteca.tsx \
        apps/web/src/pages/__tests__/Biblioteca.test.tsx \
        apps/web/src/pages/Biblioteca/__tests__/biblioteca-data.test.ts
git commit -m "feat(web): la vidriera de entrenamientos en la biblioteca — 6 curados, catálogo completo detrás"
```

---

## Self-review

- **Cobertura de la spec:** schemas + normalizador de las cuatro formas + cursos en el
  validador de contenido (T1) · registry mixto eager/perezoso con la cobertura del glob
  como red (T2) · `Palitos` a las primitivas (T3) · grupos, rótulos, duraciones y
  ubicaciones derivadas (T4) · catálogo con pliegue y ruta papel (T5) · portada con cuadro
  de lecciones, cuadro de práctica, cadena con cruce de grupo y el asset portado (T6) ·
  lector verbatim con carga perezosa, deduplicación de H1 y edición impresa (T7) · práctica
  con corrección instantánea, explicaciones reales y resultado en palitos (T8) · vidriera
  de la biblioteca, barridos y navegador (T9).
- **Cero backend, dicho en voz alta:** ninguna tarea toca `apps/api` ni `packages/db`. Las
  seis tablas siguen vacías a propósito; el día uno es lectura deslogueada y las tres
  páginas donde alguien podría suponer una cuenta lo desmienten con copy.
- **Cero datos inventados:** ningún literal de conteo en JSX; los grupos salen de
  `category`, los niveles de `level`, las duraciones de `duration`, las lecciones de
  `lessons[]`, las preguntas y explicaciones del `quiz.json`. Los tests comparan contra
  valores computados desde el registry, salvo los tres conteos de canon (31/329/353), que
  son literales **a propósito**: son la afirmación de que la migración no perdió nada.
- **La honestidad es testeable:** los tests pinean la **ausencia** de porcentaje, de
  veredicto, de certificado y de progreso. Si alguien agrega un «70% para aprobar», rompe.
- **Cero re-derivación:** `FilaIndiceExpandible`, `MdxPapel`, `.edicion-impresa`, el
  `print:hidden` del chrome y las primitivas vienen de 2.4/1.1 — ninguno de esos archivos
  aparece en un `git add`, salvo el barrel por la mudanza de `Palitos`.
- **Consistencia de tipos:** `CursoEntry`/`LeccionEntry` viven solo en
  `lib/courses-registry.ts`; `Grupo`/`UbicacionCurso`/`UbicacionLeccion` solo en
  `entrenamientos-data.ts`; `PreguntaNormalizada` solo en `@v2/shared` (la comparten el
  validador de build y la página, que es exactamente el punto).
- **Riesgos señalados:** (1) **peso del chunk** — 336 KB de `course.json` van eager; T9
  mide y declara umbral (120 KB gzip) con el índice recortado como salida, en vez de
  descubrirlo en producción; (2) `import.meta.glob` puede exigir literal estático: el
  esqueleto avisa y da la salida; (3) la carga perezosa introduce el primer estado
  asincrónico sin react-query del recorrido público — se resuelve con `useEffect` + guarda
  `vivo` y los tres estados de §10.9, sin sumar dependencias; (4) `print:[&_span]:animate-none`
  debe ganarle a `.anim-inkfill` (utilities > components): si en la captura el título sale
  gris, el fallback documentado en 3.2 es sumar `.anim-inkfill` al bloque `@media print` de
  `index.css` — cambio global, solo si la verificación lo pide; (5) los `<svg>` de 13
  lecciones traen la paleta azul de v1 y 11 lecciones traen emojis: **se renderizan como
  están** (contenido del autor), y si el autor quiere corregirlos es otro trabajo; (6) el
  `orderIndex` de lección que arranca en 0 rompería cualquier atajo que use el índice crudo
  en la URL — el test de `ubicarLeccion` lo cubre con el curso real, buscado por dato y no
  por slug.
- **Ley:** **cero enmiendas** (spec, «Enmiendas a la ley»: se verificaron §10.5, §8, §13 y
  §5 una por una). La mudanza de `Palitos` cumple §9b, no la modifica.
- **Deuda observada, fuera de alcance:** (a) `build-content.ts` sigue sin estar cableado a
  `pnpm verify` — el test del registry cubre los mismos invariantes mientras tanto; (b) si
  el chunk crece, el índice recortado generado es la salida limpia y ya está descrita; (c)
  la vidriera repite la receta de celda del catálogo: si una tercera página la necesita, ahí
  se extrae; (d) progreso, certificados, seed del catálogo y slice `features/courses/`
  quedan enteros para la Fase 5, en el orden que la spec deja escrito.
