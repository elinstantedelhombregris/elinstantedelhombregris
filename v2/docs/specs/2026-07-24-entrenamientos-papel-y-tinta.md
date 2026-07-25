# Los entrenamientos «Papel y Tinta» — página 3.5

**Fecha:** 2026-07-24
**Fuente de diseño:** `docs/design-system/BASTA-v2.dc.html` (pantalla
`data-screen-label="Entrenamiento"`) + el idioma ya shipeado de `/planes` y
`/biblioteca` para las superficies que el especimen no dibuja (catálogo y práctica).
**Sistema:** `docs/design-system/README.md` v1.1 (ley) · card 3.5 del master plan
`docs/plans/2026-07-21-papel-y-tinta-master-plan.md` · sección «§ 5 — Entrenamientos»
de `docs/specs/2026-07-24-la-biblioteca-papel-y-tinta.md` (contrato heredado).
**Plan de implementación:** `docs/plans/2026-07-24-entrenamientos-plan.md`

> **Tesis de copy.** A `/entrenamientos` llega el que ya leyó algo y quiere pasar de
> «me gusta cómo suena» a «sé pensar esto». No viene a inscribirse en nada: viene a ver
> si hay materia. La página tiene un solo trabajo: mostrarle que hay **31 entrenamientos
> y 329 lecciones enteras, abiertas, sin cuenta y sin examen**, y dejarlo entrar hoy a
> uno. Se va habiendo leído una lección — y al final de la lección, la práctica le
> devuelve lo que entendió y lo que no. Nadie le pone nota. Después, el mapa.

## Por qué

Es la única página de la Fase 3 que no rediseña nada: **construye**. `content/courses/`
tiene 31 directorios, 31 `course.json`, 31 `quiz.json` y **329 lecciones en MDX** —
migradas de v1 el 2026-05-13 (commit `367dbcd`) — y **ninguna superficie**. No hay ruta
`/entrenamientos`, no hay `/cursos`, no hay página v1-port que mate: el contenido más
grande del proyecto viaja en el repo **a oscuras** desde hace dos meses.

Por eso 3.1 se negó a linkearlo (biblioteca, Decisión 1: «la ley no sanciona el teatro
del "muy pronto"»). Esta página es la que paga esa deuda: cuando termine, la sección de
entrenamientos de la biblioteca se monta —última tarea de este trabajo— y el hub queda
como el especimen lo dibuja.

## Lo que hay: inventario verificado del contenido

Verificado 2026-07-24 recorriendo los 31 directorios de `content/courses/`:

| Hecho | Valor | Consecuencia de diseño |
|---|---|---|
| Cursos | **31** (`isPublished: true` en los 31, `requiresAuth: false` en los 31) | Todo se muestra; nada se filtra por estado. |
| Lecciones | **329** `.mdx`, una por entrada de `lessons[]` — **cero desfasajes** | El `course.json` puede mandar la lista; el MDX pone el cuerpo. |
| Preguntas | **353** en los 31 `quiz.json` (10 a 20 por curso) | Conteos siempre < 100 → **palitos, jamás porcentaje** (§13 + umbral 2.3). |
| `orderIndex` de curso | permutación limpia **1..31**, sin repetidos | Hay un recorrido del autor: es el orden del catálogo y la cadena prev/next. |
| `orderIndex` de lección | `1..n` en 30 cursos; en `argentina-sistema-viviente-primeros-principios` arranca en **0** | La URL **nunca** usa `orderIndex` crudo: usa la posición 1-based en la lista ordenada. |
| `category` | 8 valores reales, en dos idiomas: `hombre-gris` (8), `action` (5), `economia` (4), `reflection` (4), `community` (3), `civica` (3), `comunicacion` (3), `vision` (1) | Metadato real → agrupa (como `series` en 3.1). El rótulo es el slug en castellano; **cero descripciones inventadas**. |
| `level` | `beginner` (8) · `intermediate` (13) · `advanced` (10) | Rótulos ya sancionados por 3.1: `inicial` / `intermedio` / `avanzado`. |
| `duration` de curso | 82 a 228 min — **igual a la suma de las lecciones en los 31** | El total se puede mostrar sin recalcular ni contradecir. |
| `isFeatured` | 15 de 31 | Curación real: la vidriera de la biblioteca sale de acá (3.1, Decisión 14). |
| Frontmatter de lección | `slug`, `courseSlug`, `title`, `summary`, `orderIndex`, `estimatedMinutes`, `draft` — **completo en los 329**; `slug` == nombre de archivo en los 329 | El schema Zod que ya existe (`lessonFrontmatterSchema`) valida sin cambios. |
| `summary` de lección | aparece **verbatim dentro del cuerpo** en 315 de 329 (la cola «## Aplicación práctica» generada en v1, presente en 312) | **No se muestra en el lector**: repetiría el texto que el cuerpo ya trae (Decisión 9). |
| Cuerpos que abren con `# H1` | **10** (todos de `fundamentos-pensamiento-comprension-aprendizaje`), y en los 10 el H1 es **idéntico al `title`** | Regla de deduplicación (Decisión 8); en 3.1 se verificó lo contrario para los ensayos y por eso allá no hizo falta. |
| HTML crudo en cuerpos | `<table>` en 18, `<svg>` en 13, `<pre>` en 5 | Se renderiza verbatim; el lector agrega estilos de tabla §5. Los SVG traen colores v1 → **deuda del autor, no se toca**. |
| Imágenes | 2 lecciones de `teoria-juegos-argentina-hombre-gris` apuntan a `/course-graphics/hombre-gris/evolucion-pago-estrategico.svg` — el archivo existe en v1 (`SocialJusticeHub/public/`) y **no** en `apps/web/public/` | El asset se porta con esta página (es parte de la lección), y el validador lo vigila. |
| Emojis | 11 lecciones de 3 cursos traen alguno | El cuerpo es contenido: se imprime como está. La prohibición de emojis (§7) rige **nuestra** copy, no el documento del autor. |
| `thumbnailUrl` / `ogImageUrl` | los 31 apuntan a `images.unsplash.com` | **No se usan**: el sistema no tiene imágenes decorativas (§1) y la CSP no permite hosts externos. |

### Las formas del `quiz.json` (el hallazgo que obliga a normalizar)

353 preguntas, dos tipos (`multiple_choice` 243, `true_false` 110), y **cuatro formas
de decir cuál es la correcta**:

| Forma | Cuántas | `options` | `correctAnswer` |
|---|---|---|---|
| `multiple_choice` con índice | 233 | 4 strings | `number` (0..3, siempre en rango) |
| `multiple_choice` con etiqueta | 10 | 4 strings | `string` — el texto exacto de una opción |
| `true_false` sin opciones | 104 | `null` | `boolean` |
| `true_false` con opciones | 6 | `['Verdadero','Falso']` | `string` — `'Verdadero'` / `'Falso'` |

`explanation` está en **las 353**. `points` (1–3), `passingScore` (70 o 75), `timeLimit`
(12–30, ausente en uno) y `maxAttempts` (3, ausente en uno) existen y **no se muestran**
— ver Decisión 6.

Consecuencia: hay **una** función pura que traduce las cuatro formas a una sola
(`opciones: string[]` + `correcta: number`), vive en `@v2/shared` y la usan igual el
validador de build y la página. Si mañana aparece una quinta forma, **rompe el build**,
no la página.

## Lo que hay en `packages/db` — y por qué no se enciende hoy

Verificado 2026-07-24 sobre el código y **sobre la base v2** (`cool-bird-63087148`):

| Pieza | Estado |
|---|---|
| `packages/db/src/schema/courses.ts` | **Existe**: `courses`, `course_lessons`, `course_quizzes`, `course_quiz_questions`, `user_course_progress`, `course_certificates`. |
| Migración | **Aplicada** (`migrations/0006_mysterious_blackheart.sql` crea las seis tablas). |
| `packages/db/src/repositories/courses.ts` | **Existe**: `CoursesRepository` con altas, listados, `enrollUser`, `updateProgress`, `issueCertificate`. |
| Filas en la base | `courses` **0** · `course_lessons` **0** · `course_quizzes` **0** · `course_quiz_questions` **0** · `user_course_progress` **0** · `course_certificates` **0** (`users` 13). |
| Slice HTTP `apps/api/src/features/courses/` | **No existe.** Ninguna ruta `/api/courses` montada en `app.ts`. |
| Contenido en la base | **Ninguno.** Los 31 cursos viven solo como archivos. |

**Ruling: 3.5 no construye backend.** Ni endpoints, ni seed, ni migración, ni progreso,
ni certificados. Tres razones, en orden de peso:

1. **Progreso exige identidad, y la identidad todavía no tiene superficie papel.** El
   login es una página v1-port que rehace la Fase 4.4, y el tablero es Fase 5. Un
   endpoint de progreso hoy sería código sin llamador; una barra de progreso para un
   visitante que no puede loguearse sería, directamente, el dato inventado que la
   directiva prohíbe.
2. **`user_course_progress.courseId` apunta a `courses.id`, y no hay filas.** Persistir
   una lección terminada exige primero **sembrar el catálogo en la base**: 31 cursos +
   329 lecciones + 31 quizzes + 353 preguntas duplicados como filas. Eso crea una segunda
   fuente de verdad para contenido que ya vive en el repo — exactamente el pecado de v1
   (`blogContent.ts` vs. la tabla) que v2 existe para no repetir.
3. **Nada de lo que la página muestra necesita servidor.** Catálogo, portada, lector y
   práctica son contenido de build-time, igual que planes, ensayos, crónica y bitácora.
   La respuesta correcta del quiz viaja en el bundle **a propósito**: acá no se toma
   examen (Decisión 6).

**Qué se dice en pantalla, entonces:** que no hay cuenta, que no se guarda nada y que no
hay certificado. Tres veces, en las tres superficies donde el visitante podría suponer lo
contrario. La honestidad no es una nota al pie: es copy de portada.

**Qué queda escrito para Fase 5** (`docs/plans/…master-plan.md`, «La plataforma»), en
este orden y sin atajos: (a) seed del catálogo a la base desde el registry, con el
registry como fuente y la base como índice —nunca al revés—; (b) slice
`apps/api/src/features/courses/` con `optionalAuthenticate`/`authenticate`, validación
Zod en `packages/shared/src/validation/` y ≥ 1 test de integración por endpoint, patrón
`features/semillas/`; (c) recién ahí, progreso y certificados en pantalla — con palitos,
sellos del catálogo y numeración de expediente (§14), nunca con barras.

## Las cuatro superficies

| Ruta | Trabajo | Qué NO es |
|---|---|---|
| `/entrenamientos` | **El catálogo.** Que los 31 sean alcanzables de un vistazo y que se entienda de qué habla cada bloque. Puerta de entrada única a todo el sistema. | No es una vidriera curada (esa es la biblioteca) ni un buscador. |
| `/entrenamientos/:slug` | **La portada del entrenamiento.** De qué se trata, qué lecciones tiene, cuánto dura, por dónde se empieza, y la puerta a la práctica. | No es un lector: no trae cuerpo de lección. |
| `/entrenamientos/:slug/leccion/:n` | **El lector.** Una lección, entera, verbatim, imprimible, con la cadena al vecino. | No es un curso con progreso: no hay «completar». |
| `/entrenamientos/:slug/practica` | **La práctica.** Devolverle al lector qué entendió y qué no, con la explicación al lado. | No es un examen: no puntúa, no guarda, no aprueba. |

**Qué comparte el lector de lección con el de ensayo (3.2):** la columna de 800px (§4),
`MdxPapel` (2.4) para el cuerpo verbatim, el patrón de edición impresa
(`.edicion-impresa` + folio, 2.4), el rito de la tinta en el H1 del frontmatter, la
cadena prev/next con aviso de cruce y el 404 expediente. **Qué no comparte:** la firma
`— El hombre gris` (Decisión 10), el cierre al mapa (la lección cierra en la lección
siguiente o en la práctica) y el subtítulo (Decisión 9).

**Cero abstracción nueva de lector.** §9b manda repetir la receta antes que abstraer, y
3.1 ya sentó el precedente: `EnsayoDetail` no extrajo shell y este tampoco. Lo que se
comparte ya está extraído (`MdxPapel`, primitivas, `.edicion-impresa`).

## Los datos: del archivo a la pantalla, sin base de datos

### 1. Los schemas (`packages/shared/src/content/courses.ts`, nuevo)

`lessonFrontmatterSchema` ya existe y valida los 329 sin tocarlo. Faltan los dos JSON:

- **`courseJsonSchema`** — `slug`, `title`, `description`, `excerpt`, `category`,
  `level` (`z.enum(['beginner','intermediate','advanced'])`), `duration` (int > 0),
  `orderIndex` (int > 0), `isPublished`, `isFeatured`, `requiresAuth`, `quizFile`, y
  `lessons[]` con `key`, `title`, `description`, `duration`, `orderIndex`
  (int ≥ 0 — el curso que arranca en 0), `contentFile`. Los campos de v1 que no se usan
  (`seoTitle`, `ogImageUrl`, `legacyCourseId`, `rekeys`…) **no se declaran**: Zod los
  descarta y así el schema documenta qué mira el sitio.
- **`quizJsonSchema`** — `title`, `description`, `passingScore`, `timeLimit` opcional,
  `allowRetakes`, `maxAttempts` opcional, y `questions[]` con `question`, `type`
  (`z.enum(['multiple_choice','true_false'])`), `options` (`string[]` nullable
  opcional), `correctAnswer` (`z.union([z.number().int().nonnegative(), z.boolean(),
  z.string().min(1)])`), `explanation` (requerido), `points`, `orderIndex`.
- **`normalizarPregunta(q)`** — la función pura que traduce las cuatro formas a
  `{ enunciado, opciones: string[], correcta: number, explicacion, }`. Reglas exactas:
  `multiple_choice` + número → índice tal cual; `multiple_choice` + string →
  `options.indexOf(string)`; `true_false` → opciones **siempre** `['Verdadero','Falso']`
  y correcta `0` si `true`/`'Verdadero'`, `1` si `false`/`'Falso'`. Devuelve `null` si
  no resuelve (índice fuera de rango, etiqueta que no está entre las opciones, string
  que no es Verdadero/Falso) — y `null` **es un error de build**, no un estado de UI.
- **`derivarSlugDeLeccion(key)`** — `key.replace(/^\d+-/, '')`, la misma regla con la que
  el migrador escribió los archivos (`scripts/content/migrate-courses-v1-to-v2.ts:54`).
  Vive en `@v2/shared` para que el validador y el registry no puedan divergir.

### 2. El validador (`scripts/build/build-content.ts`)

Hoy valida blog, ensayos, planes y crónica, y deja los cursos con un comentario
(«proper recursive walk lands when courses get their first MDX lesson» — ya llegaron).
Se agrega el dominio `courses`, que recorre `content/courses/*/` y, por curso:

1. valida `course.json` contra `courseJsonSchema` y `quiz.json` contra `quizJsonSchema`;
2. valida las lecciones con `loadContentDir(dir, lessonFrontmatterSchema)` (el loader ya
   filtra `.mdx`);
3. cruza: el directorio se llama como el `slug`; cada `lessons[].key` derivado tiene su
   `.mdx`; cada `.mdx` está en `lessons[]`; `courseSlug` del frontmatter == slug del
   curso; sin `orderIndex` repetidos en el curso; sin `slug` de curso repetido; suma de
   `lessons[].duration` == `duration` del curso;
4. cruza el quiz: `normalizarPregunta` resuelve las 353;
5. cruza los assets: todo `](/algo)` referenciado por un cuerpo existe en
   `apps/web/public/`.

Sale `[courses] ok=31 lessons=329 questions=353 errors=0`. Cualquier error → exit 1.

**Nota de alcance:** `build-content.ts` hoy no está cableado a ningún script de
`package.json` (verificado: `pnpm verify` = lint + type-check + test + build). Este
trabajo **no cambia esa cañería** (es una decisión de programa, no de página): la red que
sí corre en `pnpm verify` es el test del registry (Task 2 del plan), que pinea los mismos
invariantes desde `apps/web`. Queda anotado como deuda del programa en el plan.

### 3. El registry (`apps/web/src/lib/courses-registry.ts`, nuevo)

Patrón `ensayos-registry` / `cronica-registry`, con **una diferencia deliberada**: el
peso. Los 329 cuerpos pesan 2,0 MB crudos; meterlos en un glob `eager` metería medio MB
gzip en el chunk de una página que muestra una lista. Entonces:

| Qué | Cómo | Por qué |
|---|---|---|
| `course.json` × 31 (336 KB crudos) | `import.meta.glob(..., { eager: true })` | El catálogo necesita metadata de los 31 en la primera pintura. |
| cuerpos `.mdx` × 329 (2,0 MB) | glob **perezoso** → `cargarLeccion(cursoSlug, leccionSlug)` | Se baja una lección cuando se abre una lección. |
| `quiz.json` × 31 (222 KB) | glob **perezoso** → `cargarPractica(cursoSlug)` | Se baja un quiz cuando se abre una práctica. |

Expone: `CursoEntry` (`slug`, `title`, `description`, `excerpt`, `category`, `level`,
`duration`, `orderIndex`, `isFeatured`, `lecciones: LeccionEntry[]`), `LeccionEntry`
(`slug`, `titulo`, `minutos`, `orden`), `CURSOS` (ordenado por `orderIndex`),
`CURSO_COUNT`, `LECCION_COUNT`, `findCursoBySlug`, `cargarLeccion`, `cargarPractica`.

**La metadata de lección sale del `course.json`, no del frontmatter** — es la única forma
de listar 329 lecciones sin bajar 329 cuerpos, y los dos coinciden en los 329 casos
(verificado). El test del registry vigila esa coincidencia por otra vía: el set de claves
del glob perezoso tiene que ser **exactamente** el set de rutas derivadas de los 31
`course.json`. Si alguien agrega un `.mdx` suelto o borra uno, el test rompe sin haber
leído un solo cuerpo.

### 4. Las derivaciones de página (`pages/Entrenamientos/entrenamientos-data.ts`, nuevo)

Patrón `biblioteca-data.ts` / `la-prueba-data.ts` — todo puro, todo testeado, **ningún
literal de conteo en el JSX**:

| Derivada | Regla | Hoy |
|---|---|---|
| `GRUPOS` | agrupa por `category`; adentro, por `orderIndex` | 8 grupos |
| orden de los grupos | por el `orderIndex` más chico del grupo | hombre-gris → vision → action → reflection → community → economia → civica → comunicacion |
| rótulo de grupo | mapa de etiquetas del slug, en castellano; sin entrada → el slug crudo | «El hombre gris», «La visión», «Acción», «Reflexión», «Comunidad», «Economía», «Cívica», «Comunicación» |
| `rotuloNivel` | `beginner→inicial`, `intermediate→intermedio`, `advanced→avanzado` | rótulos ya sancionados por 3.1 |
| `duracionLarga(min)` | `< 60` → «{m} min»; si no «{h} h {m} min» (y «{h} h» si `m===0`) | «1 h 25 min» |
| `ubicarCurso(slug)` | grupo + vecinos en `CURSOS` (orden global) + `cruzaGrupo` | patrón exacto de `ubicarEnsayo` |
| `ubicarLeccion(slug, n)` | curso + lección en la posición 1-based `n` + vecinas **dentro del curso** | `null` si `n` no es un entero válido en rango |
| `numeroDeFila(i)` | `01`…`NN` | idéntica a 3.1 |

---

# Página A — el catálogo (`/entrenamientos`)

Página papel estándar (chrome de `RootLayout`), contenedor `max-w-[1100px]` (§4,
documentos/índices), padding lateral 40/20. **El especimen no dibuja esta pantalla**: se
compone con el idioma ya shipeado del índice de la biblioteca (3.1) y del expediente de
planes (2.4). **Toda la prosa de abajo es el copy final.** `{N}` = `CURSO_COUNT`,
`{L}` = `LECCION_COUNT`, siempre interpolados.

## § 1 — Portada

- Kicker violeta: `Entrenamientos · sin cuenta, sin costo`
- H1 Anton `clamp(44px,6vw,88px)` con rito de la tinta (`RitoTinta`, dos líneas):

  > **Entrená**
  > **la mirada.**

- Lead (Archivo 17px, tinta-75, max-width 620):
  `{N} entrenamientos, {L} lecciones, en criollo y sin jerga. No hay cuenta que crear ni examen que aprobar: entrá al que te sirva y usalo.`
- Segunda línea (15px tinta-50, max-width 620):
  `Nada de esto se guarda: leé en el orden que quieras, cortá cuando quieras, volvé cuando quieras.`

## § 2 — El índice (los {N}, agrupados)

- Encabezado de sección (h2 visualmente mono 11px uppercase tinta-50):
  `El catálogo entero · tocá para abrir`
- **Por cada grupo, en el orden derivado:**
  - Línea mono 11px uppercase tinta-50, sobre borde superior 2px tinta, padding 22/0:
    `{n} entrenamientos · {m} lecciones`
  - Título del grupo (h3 Anton `clamp(24px,3vw,34px)`): el rótulo.
  - **Las filas:** una `FilaIndiceExpandible` (§5, primitiva de 2.4) por curso, numeradas
    `01`…`NN` **dentro del grupo**.
    - **Fila (cerrada):** num mono 12 tinta-30 · título Archivo 17px `font-semibold` +
      marca de nivel · glifo `+` mono tinta-50.
    - **Fila (abierta):** el título pasa a violeta, el glifo a `−` violeta.
    - **Marca de nivel** (siempre, junto al título): mono 10px uppercase tinta-50, borde
      1px tinta-30, padding 2/6: `inicial` · `intermedio` · `avanzado`.
    - **Panel (el pliegue):** el `excerpt` del `course.json` entre comillas angulares
      (16px tinta-90, max-width 640) — **dato real, jamás reescrito acá** — y link mono
      12 bold uppercase violeta:
      `Abrir el entrenamiento · {n} lecciones · {duración} →` → `/entrenamientos/{slug}`.
    - **Una sola fila abierta en toda la página** (patrón 3.1/2.4).
- **Sin filtros, sin chips, sin búsqueda, sin paginación.** Misma vara que 2.4 y 3.1: el
  índice completo siempre visible **es** la postura. La única taxonomía en pantalla es la
  que el `course.json` trae (`category`, `level`), con rótulo en castellano y cero
  descripciones autorales — un grupo sin rótulo se muestra igual con su slug crudo, así
  ningún entrenamiento se pierde por falta de etiqueta.
- Responsive <560: la grilla de la fila baja a `44px_1fr_32px` (comportamiento de la
  primitiva); el título nunca se oculta.

## § 3 — Cierre

`BandaCta fondo="tinta"` con una fila `flex justify-between` (wrap):

- h2 Anton `clamp(30px,4vw,52px)`: `Entrenaste. Ahora usalo.`
- `BotonPapel variant="violeta" surface="oscuro"` envuelto en `Link` a `/el-mapa`:
  `Soltar mi voz en el mapa →`

---

# Página B — la portada del entrenamiento (`/entrenamientos/:slug`)

Papel claro, contenedor `max-w-[860px]` (§4, tope de lectores — el del especimen),
padding 40/20. Estructura **calcada del especimen** salvo donde se anota.

- **Backlink** (mono 12px uppercase tinta-50, hover tinta): `← Todos los entrenamientos`
  → `/entrenamientos`.
- **Kicker violeta:** `Entrenamiento · {nivel} · {duración}` → «Entrenamiento ·
  intermedio · 1 h 22 min».
- **H1 Anton** `clamp(30px,4.4vw,56px)` con rito de la tinta sobre el `title` real, con
  `aria-label` del título (contrato de `RitoTinta`). *Escala más chica que la del
  especimen (`clamp(36,5.4vw,68)`) porque los títulos reales llegan a 86 caracteres
  («Argentina como Sistema Viviente: De las Leyes Físicas…»): a 68px la portada era una
  pared.*
- **Lead:** la `description` del `course.json` (17px tinta-75, max-width 620,
  `text-wrap:pretty`). Es el texto largo del autor; el `excerpt` corto queda para el
  catálogo y la vidriera.
- **El cuadro de lecciones** (borde 1px tinta, sin radius):
  - Fila de encabezado (fondo papel-crudo, borde inferior 1px tinta, mono 11px bold
    uppercase, `flex justify-between`): izquierda `Lecciones` · derecha, tinta-50:
    `gratis · a tu ritmo`.
  - Una fila-link por lección (grid `52px 1fr 70px`, padding 17/22, borde inferior 1px
    papel-borde, hover papel-presionado) → `/entrenamientos/{slug}/leccion/{i}`:
    num mono 12 tinta-30 · título 16px `font-semibold` · `{min} min` mono 11 tinta-50 a la
    derecha.
  - Responsive <560: grid `40px 1fr`, los minutos bajan a una segunda línea mono bajo el
    título; el título nunca se corta.
- **El cuadro de la práctica** (borde 2px violeta, padding 30/32, margen superior 32):
  - Kicker violeta: `La práctica`
  - Copy (17px tinta-90, max-width 620):
    `Preguntas sobre lo que acabás de leer. No las corrige nadie: te las corregís vos, con la explicación al lado. No se guarda nada.`
  - `BotonPapel variant="violeta"` en `Link` a `…/practica`: `Hacer la práctica →`
  - **Sin conteo de preguntas acá:** el `quiz.json` se baja en la práctica, no en la
    portada (registry perezoso). El número aparece donde el dato ya está: en la práctica.
- **La cadena del recorrido** (borde superior 1px tinta, `flex justify-between` con wrap):
  vecinos en el orden global (`orderIndex`). Izquierda `← {título}` mono 12 tinta-50,
  derecha `{título} →` mono 12 tinta bold. Cuando el vecino pertenece a **otro grupo**, el
  link lleva encima una línea mono 10px uppercase tinta-30 con el rótulo del grupo destino
  — patrón exacto del cruce de ciclo (3.2). El primero no tiene izquierda; el último no
  tiene derecha.
- **Sin banda de cierre al mapa.** Esta página es una puerta a la lección: el único CTA
  fuerte es empezar. El mapa cierra el catálogo y la práctica.
- **Sin edición impresa:** es un índice, no un documento (ver «La edición impresa»).

---

# Página C — el lector de lección (`/entrenamientos/:slug/leccion/:n`)

Lector editorial sobre papel claro, `max-w-[800px]` (§4; el mismo ancho que el ensayo),
padding 40/20 — **la decisión de 2.4-D6 vale igual acá**: los documentos de trabajo van
en expediente oscuro, los textos para leer despacio van sobre papel.

`:n` es la **posición 1-based en la lista ordenada de lecciones**, nunca el `orderIndex`
crudo (hay un curso que arranca en 0). `n` fuera de rango o no numérico → 404 expediente.

- **Backlink** (mono 12px uppercase tinta-50, `print:hidden`): `← {título del curso}`
  → `/entrenamientos/{slug}`.
- **`<article className="edicion-impresa">`** — todo el documento adentro:
  - **Folio** (`hidden print:block`, mono 10px uppercase, primera línea impresa):
    `¡BASTA! · edición del lector · {fecha}` (fecha del día, `es-AR`, formato largo —
    idéntico a `PlanDetail` y al lector de ensayo).
  - **Kicker violeta** (se imprime: ubica la pieza): `Lección {n} de {total} · {min} min`.
    Sin `estimatedMinutes` (hoy no pasa: los 329 lo traen), sin el último tramo.
  - **H1 Anton** `clamp(30px,4.4vw,52px)`, `riso-hover`, con rito de la tinta sobre el
    `title`, `aria-label` con el título real, `print:[&_span]:animate-none` (patrón 3.2:
    el título no puede salir gris en papel).
  - **Cuerpo:** borde superior 2px tinta, padding-top 28, y el MDX **verbatim** vía
    `MdxPapel` con `max-w-[680px]`, `[&>*:first-child]:mt-0` y los estilos de tabla §5
    (`prose-table`/`prose-th`/`prose-td`: encabezados mono 11px uppercase tinta-50, borde
    inferior 1px tinta en el header, sin zebra, contenedor con `overflow-x:auto`).
  - **Deduplicación del título** (Decisión 8): si el cuerpo abre con un `# ` cuyo texto,
    normalizado, es igual al `title`, ese primer bloque no se renderiza. Solo el primero,
    solo si es idéntico. Ninguna otra palabra se toca.
- **La cadena de la lección** (borde superior 1px tinta, `flex justify-between` con wrap,
  `print:hidden`), **siempre dentro del mismo curso** — nunca se salta a otro
  entrenamiento:
  - izquierda: `← {título de la lección anterior}` (mono 12 tinta-50). En la primera
    lección no hay izquierda: el backlink es el camino de vuelta.
  - derecha: `{título de la lección siguiente} →` (mono 12 tinta bold). **En la última
    lección la derecha es la práctica**: `La práctica →` → `…/practica`.
- **Sin firma, sin sello, sin cierre al mapa** (Decisión 10).

## Estados del lector (el cuerpo llega asincrónico)

- **Cargando:** skeleton §5 — bloques papel-presionado del alto real del cuerpo con
  `anim-pulso-papel` — y, junto al primero, microcopy §10.9:
  `Cargando — menos que un trámite.`
- **Error de carga:** `Esto se rompió. Lo decimos porque publicamos todo.` + link mono
  `← Volver al entrenamiento`.
- **404 (slug o `n` inexistente):** patrón expediente §5 sobre papel — kicker
  `expediente extraviado`, H1 Anton `Esa lección no está.`, `Sello color="rojo"` rotado
  con `Extraviado`, CTA `BotonPapel variant="tinta"` → `Ver los entrenamientos →`.

---

# Página D — la práctica (`/entrenamientos/:slug/practica`)

Papel claro, `max-w-[800px]`, padding 40/20. El quiz se baja al entrar (registry
perezoso) con los mismos tres estados del lector.

- **Backlink** (mono 12px uppercase tinta-50): `← {título del curso}`.
- **Kicker violeta:** `Práctica · {n} preguntas`.
- **H1 Anton** `clamp(36px,5.4vw,68px)` con rito de la tinta: `La práctica.`
- **Lead:** la `description` del `quiz.json` (17px tinta-75, max-width 620) — dato real.
- **El aviso** (card papel-crudo, borde 1px tinta, padding 24, mono 13px tinta-90):
  `Esto no es un examen. No se puntúa, no se guarda y no da certificado: es para que veas qué te quedó y qué no.`
- **Las preguntas**, una abajo de la otra (borde superior 1px papel-borde, padding 28/0):
  - `<fieldset>` con `<legend>` mono 11px uppercase tinta-50: `Pregunta {i} de {n}`.
  - Enunciado (Archivo 17px tinta-90, max-width 660, `text-wrap:pretty`).
  - Opciones: radios del kit §5 (círculo 18px borde tinta; marcado = fondo violeta),
    etiqueta 16px, target ≥ 44px, una por línea, gap 12.
  - **Al elegir, se corrige** (la interacción firma de la página): el fieldset queda
    deshabilitado (§5 «Estados»: tinta-30 y `cursor:not-allowed`, nunca opacity), la
    opción elegida se marca y —si erró— la correcta se marca en verde.
    - Línea mono 12px bold uppercase: acierto → `Esa era.` (verde) · error →
      `No era esa.` (rojo sello).
    - **La explicación**, siempre, verbatim del `quiz.json` (16px tinta-90, borde
      izquierdo 2px del color del resultado, padding-left 16, `anim-fadeup-rapido`).
  - Ninguna pregunta se puede volver a contestar: una respuesta por pregunta y por
    visita.
- **El resultado**, solo cuando están las {n} contestadas (borde superior 2px tinta,
  padding-top 28):
  - mono 11px uppercase tinta-50: `Resultado`
  - `Palitos` (§10.6) con los aciertos + a la derecha mono 13px: `{aciertos} de {n}`.
    **Sin porcentaje, sin nota, sin aprobado/desaprobado** — el umbral del programa es
    100 (§13 + 2.3) y una práctica tiene entre 10 y 20 preguntas.
  - Línea 15px tinta-75:
    `Las que fallaste tienen la explicación al lado. Si te quedó floja, volvé a la lección.`
  - Dos acciones mono 12px bold uppercase: `Empezar de nuevo ↺` (resetea el estado de la
    página, sin recargar) · `← Volver al entrenamiento`.
- **Cierre:** `BandaCta fondo="tinta"`, fila `flex justify-between` (wrap):
  - h2 Anton `clamp(30px,4vw,52px)`: `Ya lo pensaste. Ahora decilo.`
  - `BotonPapel variant="violeta" surface="oscuro"` en `Link` a `/el-mapa`:
    `Soltar mi voz en el mapa →`

**Sin sello al terminar** (Decisión 7). **Sin temporizador, sin intentos, sin puntaje
ponderado** (Decisión 6).

---

# Curación vs. disponibilidad: la vidriera de la biblioteca

La regla del programa: **la curación afecta el display del hub, nunca la
disponibilidad**. Se cumple así:

- `/entrenamientos` alcanza **los 31**, agrupados, sin filtro que pueda esconder uno.
- `/biblioteca` muestra **6** —los primeros 6 `isFeatured` por `orderIndex`, regla ya
  ratificada en 3.1 (Decisión 14), sin lista de slugs en el código— y linkea al catálogo
  con `Ver los {CURSO_COUNT} entrenamientos →`. Si algún día hubiera menos de 6
  destacados, se muestran los que haya: nunca se rellena.
- La sección de la biblioteca se monta **como última tarea de este trabajo**, con el copy,
  el layout y el contrato de datos que 3.1 ya dejó escritos («§ 5 — Entrenamientos» de
  `2026-07-24-la-biblioteca-papel-y-tinta.md`): banda `bg-papel-crudo`, kicker
  `Entrenamiento · el ojo se educa`, H2 «Para diseñar un país, / primero entrená la
  mirada.», grilla de 3 con juntas de 1px, y el lead de la portada del hub pasando a su
  variante con entrenamientos. **Ese texto no se reinventa acá: se transcribe de allá.**
- El test del hub que hoy pinea la **ausencia** de la sección (`Biblioteca.test.tsx`, «la
  deferral de entrenamientos queda pineada») se reemplaza por su inverso: la sección
  existe, muestra 6 cursos reales y linkea al catálogo con el total derivado.

# Rutas y navegación

- **Canónicas nuevas** (las cuatro): `/entrenamientos`, `/entrenamientos/:slug`,
  `/entrenamientos/:slug/leccion/:n`, `/entrenamientos/:slug/practica`. `App.tsx` no
  tiene ninguna: **modificarlo está sancionado** (rutas nuevas, precedente `/sembrar` en
  2.5 y `/biblioteca` en 3.1).
- **Orden en el `Switch` de wouter (obligatorio):** primero `/entrenamientos/:slug/leccion/:n`
  y `/entrenamientos/:slug/practica`, después `/entrenamientos/:slug`, y `/entrenamientos`
  exacto — el patrón que ya usan `/mandato-vivo/...` e `/iniciativas/...` en el mismo
  archivo.
- **`PAPEL_ROUTES`:** `/entrenamientos` al Set + `/entrenamientos/` a `PAPEL_PREFIXES`.
  Acá **no hay estado interino**: la ruta nace papel porque no existía antes. Se agrega
  con la primera página (catálogo), no al final.
- **Nada que matar.** No hay página v1-port de cursos: `apps/web/src/pages/` no tiene
  `Cursos.tsx` ni equivalente, `App.tsx` no tiene ruta `/cursos`, y `papel-nav.ts` no
  linkea nada de esto. **Cero borrados, cero redirects** — es la primera página de la
  migración que no entierra a nadie.
- **Nav sin cambios:** los entrenamientos cuelgan de «La biblioteca» (§8). No se agrega
  item al header, al menú móvil ni al footer (una conversación = una página).
- **Assets:** se porta `apps/web/public/course-graphics/hombre-gris/evolucion-pago-estrategico.svg`
  (el SVG que dos lecciones referencian; hoy solo existe en v1). Es contenido de la
  lección, no chrome.
- **SEO/OG:** títulos «{Página} — ¡BASTA!» y descripciones en voseo se cablean en 8.1 con
  el resto del sitio (precedente 3.1). Esta página no agrega `<head>`.

# La edición impresa (§10.8)

**Solo el lector de lección define edición impresa.** El patrón de 2.4 se reusa tal cual,
cero re-derivación: `.edicion-impresa` ya vive en `index.css`; el chrome
(`PapelHeader`/`PapelFooter`/`PaperGrain`/`DespertarVeil`) ya lleva `print:hidden` desde
2.4. Lo propio de este lector: el folio como primera línea del `<article>`,
`print:hidden` en backlink y cadena, `print:[&_span]:animate-none` en el H1, y las tablas
del cuerpo con `border-collapse` y bordes visibles en papel. **`index.css` no se toca.**

Catálogo, portada y práctica **no** definen edición: son índices e instrumentos, no
documentos. Imprimen razonablemente (el chrome no sale) y ahí termina la promesa. §10.8
enumera los lectores del sistema —ensayo, crónica, manifiesto, certificado— y esta página
suma uno solo: la lección.

# Estados mudos (§10.9)

| Estado | Dónde | Texto |
|---|---|---|
| Vacío | catálogo (hoy imposible: build-time con 31) | `Todavía no hay entrenamientos publicados. Cuando haya, están acá enteros.` |
| Vacío | cuadro de lecciones (hoy imposible) | `Este entrenamiento todavía no tiene lecciones publicadas.` |
| Cargando | lector, práctica | `Cargando — menos que un trámite.` + skeleton §5 |
| Error | lector, práctica | `Esto se rompió. Lo decimos porque publicamos todo.` + `← Volver al entrenamiento` |
| 404 | curso / lección / práctica inexistentes | expediente §5: `Ese entrenamiento no está.` / `Esa lección no está.` + sello `Extraviado` + `Ver los entrenamientos →` |
| Campos ausentes | todas | sin `estimatedMinutes` desaparece el tramo de minutos; sin `excerpt` el pliegue muestra solo el link. **Nada se rellena.** |

Sin filtros no hay «Nada con ese filtro». No hay `NotaDemo` en ninguna de las cuatro
páginas: **cero datos de demostración** — todo lo que se muestra sale de un archivo real.

# Accesibilidad

- **Jerarquía:** un `<h1>` por página (portada del catálogo, título del curso, título de
  la lección, «La práctica.»); `<h2>` por sección; `<h3>` por grupo del catálogo. El h3
  del grupo es tipográficamente mayor que su h2 mono: misma inversión deliberada que 2.4
  y 3.1.
- **Filas expandibles:** `<button>` de ancho completo con `aria-expanded` +
  `aria-controls`, panel con `id`, glifo `aria-hidden` (contrato de la primitiva 2.4).
- **Filas de lección:** un `<a>` que envuelve num + título + minutos; los minutos son
  texto dentro del mismo link, nunca un segundo control.
- **La práctica:** cada pregunta es un `<fieldset>` con `<legend>`; los radios son
  `<input type="radio">` reales con `<label>` asociado (navegación con flechas nativa);
  al contestar, el fieldset queda `disabled` y el bloque de corrección vive en un
  contenedor `aria-live="polite"` para que el lector de pantalla anuncie el resultado y la
  explicación. Los palitos van `aria-hidden` (contrato de la primitiva): **el dato
  accesible es el conteo mono `{aciertos} de {n}`**.
- **Targets ≥ 44px:** filas del índice, links del pliegue, filas de lección, radios,
  backlinks, prev/next, botones.
- **Foco:** violeta 2px global (`papel-root`). Orden de tabulación del lector: backlink →
  links del cuerpo → anterior → siguiente.
- **Sellos:** solo el `Extraviado` del 404, con texto real legible.
- **Reduced motion:** guarda global de `index.css` — `inkfill`, `vpop`, `fadeup` y
  `semgrow` quedan en estado final; la corrección de la práctica aparece sin animación y
  los palitos se dibujan completos.
- **AA:** texto esencial en tinta/tinta-90/tinta-75 sobre papel; violeta solo en
  accionables, kickers y títulos de fila abiertos; violeta-claro sobre oscuro; tinta-50
  en metadatos; tinta-30 solo en numeración y en la línea de cruce de grupo (no esencial:
  el link siempre dice el título). Verde y rojo-sello **nunca solos**: siempre acompañados
  de texto (`Esa era.` / `No era esa.`).
- **Impresión accesible:** el orden del DOM es el orden de lectura; el folio es la primera
  línea impresa.

# Móvil (<560)

Una columna en todo. Catálogo: la grilla de fila baja a `44px_1fr_32px`. Portada: el
cuadro de lecciones pasa a `40px 1fr` con los minutos en segunda línea; el cuadro de la
práctica mantiene el borde 2px y baja a padding 24. Lector: padding 20, cuerpo a ancho
completo, tablas con scroll horizontal propio (`overflow-x:auto`) — el cuerpo nunca
desborda la página. Práctica: opciones a ancho completo con target 44px, la cadena y las
dos acciones del resultado apiladas.

# Las interacciones firma (presupuesto §6: una por página)

- **Catálogo — el pliegue.** Idéntico al del hub (3.1): `+` → `−`, título a violeta,
  panel con `fadeup` rápido, una sola fila abierta en toda la página.
- **Portada — ninguna.** Es un índice: entra con `fadeup` escalonado y nada más.
- **Lector — ninguna.** Un documento se lee quieto (3.2, Decisión 18). Solo el ritual
  universal §10.1 en el H1.
- **Práctica — la corrección.** Elegís, la opción se marca, la explicación cae con
  `fadeup` rápido, y al terminar los palitos se dibujan con `semgrow` escalonado. Es la
  única página de las cuatro que gasta su presupuesto.

# Enmiendas a la ley

**Ninguna.** Se verificó una por una las cuatro que esta página podría haber necesitado:

1. **§10.5, catálogo de sellos** — no se toca: ni la lección terminada ni la práctica
   contestada estampan nada (Decisión 7).
2. **§8, anatomía** — ya dice «lectores (ensayo/**curso**/crónica/manifiesto)» y 3.1 ya
   sacó de la ley el conteo literal de entrenamientos («el número lo dice el registry,
   nunca el texto»). El texto vigente describe exactamente lo que esta página construye.
3. **§13, prensa de datos** — alcanza tal cual: los aciertos son un conteo < 100 →
   palitos. No hace falta legislar nada nuevo para prohibir el porcentaje: el umbral 100
   ya lo prohíbe.
4. **§5, componentes** — el cuadro de lecciones es la receta de tabla/fila de índice ya
   legislada; los radios, el skeleton y los estados deshabilitado/error/éxito están en el
   kit; la fila expandible está legislada desde 2.4. Nada nuevo que documentar.

La única mudanza de este trabajo es de **ubicación, no de ley**: `Palitos` —firma §10.6—
vive hoy dentro de `pages/ElMandatoVivo/sections/`, y §9b ya dice dónde van los
componentes compartidos («los componentes compartidos viven en
`components/papel/primitives/`»). Al ganar su segundo consumidor se muda ahí. La ley no
cambia: se cumple.

# Decisiones

1. **Cero backend en 3.5.** El progreso exige identidad (Fase 4.4/5) y persistir exige
   sembrar el catálogo en la base (segunda fuente de verdad para contenido que ya vive en
   el repo). Las seis tablas existen y están **vacías** (verificado sobre
   `cool-bird-63087148`). El día uno es **lectura deslogueada, sin persistencia** — y la
   página lo dice en voz alta tres veces, en vez de disimularlo.
2. **Ninguna métrica de progreso, en ningún lado.** Ni porcentaje, ni «3 de 8
   completadas», ni certificados, ni «seguí donde ibas» en `localStorage`: un recuerdo por
   dispositivo no es un dato de la persona, y la directiva de datos no admite métricas sin
   tabla detrás. Vuelven en Fase 5, reales, con palitos y sellos del catálogo (§14).
3. **El contenido manda; el `course.json` es el índice y el MDX es el cuerpo.** La lista
   de lecciones sale del JSON (única forma de listar 329 sin bajarlas) y el cuerpo del
   `.mdx` correspondiente; un test vigila que los dos sets coincidan exactamente.
4. **Registry mixto: eager para los 31 `course.json`, perezoso para los 329 cuerpos y los
   31 quizzes.** 2,0 MB de lecciones no entran en el chunk de una lista. Es la primera
   vez que el proyecto tiene contenido que no cabe en un glob eager, y la respuesta es
   perezosa, no un backend.
5. **El catálogo agrupa por `category` con rótulo en castellano, y no muestra chips.** La
   categoría es campo real (a diferencia de los planes en 2.4, que no lo tienen) y el
   autor ya escribió el catálogo en bloques por categoría. El rótulo es el slug puesto en
   castellano —traducción, no taxonomía nueva— y **no hay descripciones de grupo**: en 3.1
   las descripciones de ciclo eran prosa verificable sobre siete ensayos; ocho párrafos
   sobre ocho categorías serían ocho afirmaciones que nadie pidió. Categoría desconocida →
   se muestra igual con su slug.
6. **La práctica no toma examen.** `passingScore`, `timeLimit`, `maxAttempts` y `points`
   existen en los archivos y **no se muestran ni se aplican**: no hay nota porque no hay
   nada en juego —nada se guarda, nada se certifica— y un veredicto sería teatro. Además,
   `passingScore` es un porcentaje sobre 10–20 preguntas: mostrarlo violaría el umbral de
   100 (§13 + 2.3). Se muestra lo que sí es honesto: aciertos en palitos, el conteo mono, y
   la explicación de cada pregunta.
7. **Ni la lección terminada ni la práctica aprobada estampan sello.** El catálogo §10.5
   está cerrado y sus cuatro sellos premian actos que la plataforma **verifica**: una voz
   soltada, una semilla plantada, el manifiesto leído entero, un documento auditado.
   Scrollear una lección no es leerla (criterio 3.1-D2), y una práctica que no se guarda
   no deja acto que sellar. **Cero enmiendas al catálogo.**
8. **El H1 duplicado del cuerpo no se renderiza.** 10 de 329 cuerpos abren con un `# `
   idéntico al `title` del frontmatter. El título de la página viene del frontmatter en
   los 329 (así el rito de la tinta es el mismo ritual en todas), y ese primer bloque
   repetido se omite: mismas palabras, una sola vez, un solo `<h1>`. Solo el primer
   bloque, solo si es idéntico; el resto del cuerpo es intocable.
9. **El `summary` de la lección no se muestra.** Aparece verbatim dentro del cuerpo en 315
   de 329 (la cola «Aplicación práctica» que generó v1). Ponerlo arriba sería mostrar dos
   veces el mismo párrafo.
10. **La lección no se firma ni cierra en el mapa.** `— El hombre gris` (§1) es firma de
    autor de textos largos —el ensayo, el plan, el manifiesto—; una lección es un tramo de
    un entrenamiento, y firmar 329 veces devalúa la firma. El cierre tampoco va al mapa: la
    lección cierra en la lección siguiente y, la última, en la práctica. Al mapa cierran el
    catálogo y la práctica.
11. **`:n` es la posición 1-based, no el `orderIndex`.** Un curso arranca sus lecciones en
    0; usar el índice crudo daría `/leccion/0`. La contra —agregar una lección corre la
    numeración de las URLs siguientes— se acepta: la ruta es la del master plan, es la que
    se lee («lección 3 de 8») y el contenido está congelado desde la migración.
12. **La cadena de lecciones no cruza de curso.** Prev/next se mueven dentro del
    entrenamiento; el salto entre entrenamientos vive en la portada del curso (que sí tiene
    cadena global con aviso de cruce de grupo). Un lector nunca cae en otro curso sin
    haberlo pedido.
13. **La corrección es instantánea y la respuesta se da una sola vez.** Sin botón
    «Corregir» (no hay a quién entregarle nada) y sin cambiar la respuesta después de ver
    la explicación: el conteo final solo significa algo si la respuesta fue la primera.
    `Empezar de nuevo ↺` resetea todo, sin recargar.
14. **La respuesta correcta viaja en el bundle, y está bien.** Cualquiera puede leerla en
    el archivo del repo: el sistema publica todo, entero y gratis. Esconderla exigiría un
    servidor para un examen que decidimos no tomar (Decisión 6).
15. **Cuatro superficies, ninguna de más.** Sin «mis entrenamientos», sin inscripción, sin
    reanudar, sin buscador. Cada una de esas necesita identidad o promete memoria.
16. **Cero primitivas nuevas y una mudanza.** Se reusan `FilaIndiceExpandible`,
    `MdxPapel`, `Kicker`, `RitoTinta`, `Sello`, `BotonPapel`, `BandaCta`. `Palitos` se muda
    de `pages/ElMandatoVivo/sections/` a `components/papel/primitives/` porque gana su
    segundo consumidor y §9b dice dónde vive lo compartido. La marca de nivel y la fila de
    lección se componen inline con las recetas §5 (§9b: repetir antes que abstraer).
17. **Cero íconos** (§12, páginas editoriales): glifos `+ − → ← ↑ ↺` y nada más.
18. **Los cuerpos son intocables, incluso donde chirrían.** Los `<svg>` de 13 lecciones
    traen la paleta azul de v1 y 11 lecciones traen emojis: se renderizan como están. La ley
    gobierna los muebles de la página, no el documento del autor — misma regla que sostiene
    los textos keystone. Queda anotado como deuda del autor, no como bug de la migración.
19. **El validador de contenido incorpora cursos aunque no corra en CI.** `build-content.ts`
    hoy no está cableado a `pnpm verify`; se lo extiende igual (es el lugar declarado de
    esta validación) **y** se pinean los mismos invariantes en el test del registry, que sí
    corre. Cablear el validador al pipeline es deuda de programa, anotada en el plan.

# Definición de terminado (protocolo por página)

- [ ] Catálogo: kicker + H1 «Entrená la mirada.» con rito + lead con `{N}`/`{L}`
      derivados + los {N} entrenamientos alcanzables, agrupados por metadato real, con
      pliegue de `excerpt` real + cierre al mapa.
- [ ] UNA interacción firma por página: el pliegue en el catálogo, la corrección en la
      práctica; portada y lector no gastan.
- [ ] Portada: kicker `Entrenamiento · {nivel} · {duración}`, H1 con rito, lead real,
      cuadro de lecciones completo con minutos reales, cuadro de práctica, cadena con
      aviso de cruce de grupo.
- [ ] Lector: kicker `Lección {n} de {total} · {min} min`, H1 con rito sin duplicar el del
      cuerpo, cuerpo **verbatim** vía `MdxPapel` (tablas y SVG incluidos), cadena dentro
      del curso, última lección → práctica, skeleton + microcopy de carga, 404 expediente.
- [ ] Práctica: aviso honesto, {n} preguntas normalizadas (las cuatro formas), corrección
      instantánea con explicación real, resultado en palitos + conteo mono **sin
      porcentaje ni veredicto**, `Empezar de nuevo ↺`, cierre al mapa.
- [ ] Edición impresa del lector: `.edicion-impresa` + folio `¡BASTA! · edición del lector
      · {fecha}`, backlink y cadena con `print:hidden`, título en tinta (no gris) —
      verificada con captura de print preview.
- [ ] Cero datos inventados: ningún literal de conteo en JSX; cero `NotaDemo`; cero
      métricas de progreso; test de canon de las derivaciones en verde.
- [ ] Cero enmiendas a la ley; catálogo de sellos intacto.
- [ ] Rutas: las cuatro en `App.tsx` en el orden correcto, `/entrenamientos` en
      `PAPEL_ROUTES` y `/entrenamientos/` en `PAPEL_PREFIXES`; nada borrado, nada
      redirigido.
- [ ] Vidriera de la biblioteca montada con el copy de 3.1, lead del hub en su variante
      con entrenamientos, y el test de ausencia reemplazado por el de presencia.
- [ ] Asset `course-graphics/hombre-gris/evolucion-pago-estrategico.svg` portado y las dos
      lecciones que lo usan verificadas en navegador.
- [ ] Responsive: 1 columna, padding 20, targets ≥ 44px, tablas con scroll propio.
- [ ] Voseo consistente; «comillas angulares»; sin «registrate/únete».
- [ ] Archivos ≤ 300 LOC (registry + data + 4 composers + secciones).
- [ ] Tests: schemas y normalizador (shared) · integridad del registry (31/329/353 y
      cobertura del glob) · derivaciones (grupos, orden, vecinos, ubicación de lección) ·
      catálogo · portada · lector (incluye deduplicación de H1 y print) · práctica (las
      cuatro formas de pregunta, corrección, palitos, sin porcentaje) · rutas papel ·
      biblioteca con la vidriera montada.
- [ ] `pnpm verify` verde.
- [ ] Verificación en navegador desktop + mobile con capturas (incluye print preview y
      reduced-motion).
