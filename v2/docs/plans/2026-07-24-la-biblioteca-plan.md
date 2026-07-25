# La biblioteca (páginas 3.1 y 3.2) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `/biblioteca` en Papel y Tinta — hub honesto con manifiesto
destacado, los {N} ensayos agrupados en sus {C} ciclos con pliegues +/− y la bitácora
real — y reescribir `/ensayos/:slug` como lector editorial de 800px con cadena de
ciclo, cuerpo **verbatim** y edición impresa, matando el chrome glass de las dos
páginas v1-port.

**Architecture:** Cero backend, cero dependencias, cero primitivas nuevas. Todo el
contenido es build-time (`ENSAYOS` + `BLOG_POSTS`, `import.meta.glob` eager). Una capa
de derivaciones puras (`pages/Biblioteca/biblioteca-data.ts`: ciclos, orden de lectura,
vecinos, conteos, hrefs por fase) + cinco secciones en `pages/Biblioteca/sections/` +
composer fino (patrón Planes/Sembrar) + reescritura in-place de `EnsayoDetail.tsx`
consumiendo `MdxPapel` y el patrón de impresión, ambos ya existentes desde 2.4. Ruta
nueva en `App.tsx` (sancionado) + flip de `PAPEL_ROUTES` al final con estado interino
aceptado.

**Tech Stack:** React 18 + wouter + Tailwind (tokens papel §9b) + Vitest/Testing
Library. Sin API, sin migraciones, sin CSS nuevo.

**Spec:** `docs/specs/2026-07-24-la-biblioteca-papel-y-tinta.md` — **todo el copy sale
de ahí, carácter por carácter.**

## Global Constraints

- `v2/CLAUDE.md` completo: sin `any`, sin `console.*`, archivos ≤ 300 LOC, `pnpm
  verify` verde antes de cada commit, Conventional Commits con scope.
- `docs/design-system/README.md` v1.1 es ley. §9b: PROHIBIDO el hex literal en TSX —
  solo tokens. Enmienda de ley en el mismo commit que el código que la necesita (este
  plan hace **UNA**: §8, el conteo de entrenamientos derivado — Task 3).
- **Keystone verbatim:** los 21 cuerpos de `content/ensayos/*.mdx` se renderizan tal
  cual vía `MdxPapel`. Ni una palabra se reescribe, trunca ni reordena. El `summary`
  del pliegue es el del frontmatter, sin editar.
- **Cero literales de conteo en JSX:** «21», «3», «20», «31» se interpolan desde las
  derivadas. Los únicos números literales son topes de display (4 crónicas en el hub,
  6 entrenamientos de §8/D4) y van con comentario que cita la regla.
- **Hallazgo de contenido (verificado 2026-07-24):** el frontmatter del ensayo SÍ trae
  `series`, `orderIndex` y `form` — agrupar por ciclo y marcar el acta usa metadato
  real (a diferencia de los chips de 2.4, que se rechazaron por inexistentes). Pero
  `ENSAYOS` viene ordenado por `orderIndex` **global**: con tres ciclos de 1..7 los
  ensayos quedan intercalados. Las páginas consumen `CICLOS`/`ORDEN_DE_LECTURA`, nunca
  `ENSAYOS` crudo. **`lib/ensayos-registry.ts` NO se toca.**
- **La sección de entrenamientos NO se implementa** (spec, «§5 — Entrenamientos»):
  `/entrenamientos` no existe y linkear a un 404 está prohibido. Queda especificada
  para que 3.5 la monte como su tarea final.
- Una conversación = una página: NO tocar `Home/*`, `LaIdea/*`, `ElMapa/*`,
  `ElMandatoVivo/*`, `Planes/*`, `Sembrar/*`, `Manifiesto.tsx`, `Blog*.tsx`,
  `MdxContent.tsx`, `index.css` ni el chrome papel. **Excepciones sancionadas** (spec,
  «Ruta y navegación»): `apps/web/src/App.tsx` (ruta nueva + redirect + borrado del
  lazy, T5) · `components/papel/papel-nav.ts` (solo el `href` del item «La
  biblioteca», T5) · `layouts/papel-routes.ts` (T5) · `docs/design-system/README.md`
  (enmienda §8, T3).
- **Estado interino aceptado:** entre T3 y T5, `/biblioteca` existe con chrome v1 y
  `/ensayos` sigue mostrando el índice viejo. El flip llega al final (orden
  2.3/2.4/2.5).
- **El patrón de impresión NO se re-deriva:** `.edicion-impresa` está en `index.css` y
  el chrome ya lleva `print:hidden` desde 2.4 (verificado 2026-07-24). Este plan solo
  aplica la clase, el folio y los `print:hidden` locales — `index.css` y el chrome no
  aparecen en ningún `git add`.

---

### Task 1: `biblioteca-data.ts` — ciclos, orden de lectura y vecinos derivados

**Files:**
- Create: `apps/web/src/pages/Biblioteca/biblioteca-data.ts`
- Test: `apps/web/src/pages/Biblioteca/__tests__/biblioteca-data.test.ts`

**Interfaces:**
- Consumes: `ENSAYOS`, `EnsayoEntry` (`~/lib/ensayos-registry`) · `BLOG_POSTS`
  (`~/lib/blog-registry`).
- Produces: `CICLOS`, `Ciclo`, `ENSAYO_COUNT`, `CICLO_COUNT`, `ORDEN_DE_LECTURA`,
  `ubicarEnsayo()`, `UbicacionEnsayo`, `numeroDeFila()`, `fechaLarga()`,
  `CRONICA_COUNT`, `ULTIMAS_CRONICAS`, `HREF_MANIFIESTO`, `HREF_BITACORA`,
  `hrefCronica()`. Los consumen las secciones (T2–T3) y el lector (T4).

- [ ] **Step 1: Tests (fallan primero).** `biblioteca-data.test.ts` — cero literales de
  contenido: cada expectativa se computa desde `ENSAYOS`.
  - **Nada se pierde:** `ORDEN_DE_LECTURA` tiene `ENSAYOS.length` elementos y el set de
    slugs de `CICLOS.flatMap(c => c.ensayos)` es igual al de `ENSAYOS`; `CICLO_COUNT ===
    new Set(ENSAYOS.map(e => e.series)).size`.
  - **Agrupación válida:** en cada ciclo los `orderIndex` son estrictamente crecientes,
    sin repetidos, y todos sus ensayos comparten `series`.
  - **Orden de los ciclos derivado del `publishedAt` más antiguo:** computar en el test
    la serie→min(`publishedAt`) y comparar con `CICLOS.map(c => c.serie)`.
  - **Ordinales:** `CICLOS.map(c => c.romano)` empieza en `I`, `II`, `III`…
  - **Rótulo con fallback:** todo ciclo tiene `rotulo` no vacío; para una serie sin
    entrada en el mapa el rótulo es el slug crudo y la descripción es `''` (probar la
    función pura de rótulos con `'sueltos'`).
  - **Vecinos:** `ubicarEnsayo(ORDEN_DE_LECTURA[0].slug).anterior` es `null`;
    el último no tiene `siguiente`; para un ensayo del medio de un ciclo,
    `anterior`/`siguiente` son sus vecinos por `orderIndex` con `cruzaCiclo === false`;
    para el último de un ciclo que no es el último de todo, `siguiente.cruzaCiclo ===
    true` y `siguiente.ciclo.serie` es la del ciclo posterior; `ubicarEnsayo('no-existe')`
    es `null`.
  - **Posición:** `ubicarEnsayo(x).posicion` y `.total` coinciden con el índice 1-based
    y el largo del ciclo.
  - **Fechas:** `fechaLarga` y la fecha del ciclo se comparan contra el mismo `Intl`
    computado en el test (nunca contra un string literal — el ICU del runner manda).
  - **Bitácora:** `CRONICA_COUNT === BLOG_POSTS.length`; `ULTIMAS_CRONICAS` son los
    primeros 4 de `BLOG_POSTS` (o todos, si hubiera menos); `hrefCronica('x') ===
    '/blog/x'`.

Run: `pnpm -C apps/web exec vitest run src/pages/Biblioteca`
Esperado: FAIL — módulo inexistente.

- [ ] **Step 2: Implementar `biblioteca-data.ts`:**

```ts
import { BLOG_POSTS } from '~/lib/blog-registry';
import { ENSAYOS, type EnsayoEntry } from '~/lib/ensayos-registry';

/**
 * La biblioteca (spec 3.1/3.2) — todas las derivaciones de contenido en un
 * solo lugar. El registry ordena por `orderIndex` GLOBAL: con tres ciclos de
 * 1..7 los ensayos quedan intercalados, así que las páginas consumen esto y
 * nunca `ENSAYOS` crudo. Ningún conteo literal vive en el JSX.
 */
export interface Ciclo {
  serie: string;
  rotulo: string;
  descripcion: string;
  /** Ordinal derivado de la posición del ciclo (I, II, III…). */
  romano: string;
  /** Mes y año del ensayo más viejo del ciclo, es-AR. */
  fecha: string;
  ensayos: readonly EnsayoEntry[];
}

/**
 * Rótulos de ciclo: mapa de etiquetas del campo real `series`, no taxonomía
 * nueva. Un ciclo sin entrada se muestra igual, con su slug crudo — ningún
 * ensayo se pierde por falta de rótulo.
 */
const ROTULOS: Record<string, { rotulo: string; descripcion: string }> = {
  'primer-ciclo': {
    rotulo: 'Primer ciclo',
    descripcion:
      'La arquitectura de la república: por qué el poder concentrado falla y qué se construye en su lugar.',
  },
  indagaciones: {
    rotulo: 'Indagaciones',
    descripcion:
      'Las condiciones de adentro: obediencia, miedo, identidad prestada — lo que hay que desarmar para que lo de afuera aguante.',
  },
  interdependencia: {
    rotulo: 'Interdependencia',
    descripcion:
      'Escrito para un 9 de julio: de qué está hecha una nación, qué cortó el bisturí de 1816 y qué se firma sin papel.',
  },
};

const ROMANOS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'] as const;

export function rotuloDeCiclo(serie: string): { rotulo: string; descripcion: string } {
  return ROTULOS[serie] ?? { rotulo: serie, descripcion: '' };
}

/** Fecha larga es-AR: «9 de julio de 2026». Vacía si el ISO no parsea. */
export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function mesYAnio(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
}

function construirCiclos(): Ciclo[] {
  const grupos = new Map<string, EnsayoEntry[]>();
  for (const ensayo of ENSAYOS) {
    const acumulado = grupos.get(ensayo.series) ?? [];
    acumulado.push(ensayo);
    grupos.set(ensayo.series, acumulado);
  }

  return [...grupos.entries()]
    .map(([serie, ensayos]) => ({
      serie,
      ensayos: [...ensayos].sort((a, b) => a.orderIndex - b.orderIndex),
      desde: ensayos.reduce((min, e) => (e.publishedAt !== '' && e.publishedAt < min ? e.publishedAt : min), '9999'),
    }))
    .sort((a, b) => (a.desde === b.desde ? a.serie.localeCompare(b.serie) : a.desde < b.desde ? -1 : 1))
    .map((grupo, i) => ({
      serie: grupo.serie,
      ...rotuloDeCiclo(grupo.serie),
      romano: ROMANOS[i] ?? String(i + 1),
      fecha: mesYAnio(grupo.desde),
      ensayos: grupo.ensayos,
    }));
}

export const CICLOS: readonly Ciclo[] = construirCiclos();
export const CICLO_COUNT = CICLOS.length;
export const ENSAYO_COUNT = ENSAYOS.length;

/** Cadena de lectura plana: ciclos en orden, ensayos por orderIndex. */
export const ORDEN_DE_LECTURA: readonly EnsayoEntry[] = CICLOS.flatMap((c) => [...c.ensayos]);

export interface Vecino {
  ensayo: EnsayoEntry;
  ciclo: Ciclo;
  /** El vecino pertenece a otro ciclo: el link lo dice antes de cruzar. */
  cruzaCiclo: boolean;
}

export interface UbicacionEnsayo {
  ciclo: Ciclo;
  /** Posición 1-based dentro del ciclo. */
  posicion: number;
  total: number;
  anterior: Vecino | null;
  siguiente: Vecino | null;
}

function cicloDe(slug: string): Ciclo | undefined {
  return CICLOS.find((c) => c.ensayos.some((e) => e.slug === slug));
}

function vecino(ensayo: EnsayoEntry | undefined, serieActual: string): Vecino | null {
  if (!ensayo) return null;
  const ciclo = cicloDe(ensayo.slug);
  if (!ciclo) return null;
  return { ensayo, ciclo, cruzaCiclo: ciclo.serie !== serieActual };
}

export function ubicarEnsayo(slug: string): UbicacionEnsayo | null {
  const ciclo = cicloDe(slug);
  if (!ciclo) return null;
  const enElCiclo = ciclo.ensayos.findIndex((e) => e.slug === slug);
  const enLaCadena = ORDEN_DE_LECTURA.findIndex((e) => e.slug === slug);
  return {
    ciclo,
    posicion: enElCiclo + 1,
    total: ciclo.ensayos.length,
    anterior: vecino(ORDEN_DE_LECTURA[enLaCadena - 1], ciclo.serie),
    siguiente: vecino(ORDEN_DE_LECTURA[enLaCadena + 1], ciclo.serie),
  };
}

/** Numeración de fila dentro del ciclo: «01»…«07». */
export function numeroDeFila(indice: number): string {
  return String(indice + 1).padStart(2, '0');
}

/** Destinos que cambian cuando su fase ship. Hoy apuntan a la superficie que EXISTE. */
export const HREF_MANIFIESTO = '/manifiesto'; // 3.3 lo rediseña; la ruta NO cambia.
export const HREF_BITACORA = '/blog'; //         3.4 → '/bitacora'
export function hrefCronica(slug: string): string {
  return `/blog/${slug}`; //                      3.4 → `/bitacora/${slug}`
}

export const CRONICA_COUNT = BLOG_POSTS.length;
/** Tope de display del hub (especimen): las últimas 4. No afirma nada del total. */
const CRONICAS_EN_EL_HUB = 4;
export const ULTIMAS_CRONICAS = BLOG_POSTS.slice(0, CRONICAS_EN_EL_HUB);
```

- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/Biblioteca` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/Biblioteca/biblioteca-data.ts \
        apps/web/src/pages/Biblioteca/__tests__/biblioteca-data.test.ts
git commit -m "feat(web): la biblioteca — ciclos, cadena de lectura y vecinos derivados del registry"
```

---

### Task 2: `IndiceEnsayos` — los {C} ciclos con pliegues (la interacción firma)

**Files:**
- Create: `apps/web/src/pages/Biblioteca/sections/IndiceEnsayos.tsx`
- Test: `apps/web/src/pages/Biblioteca/__tests__/IndiceEnsayos.test.tsx`

**Interfaces:**
- Consumes: `CICLOS`, `CICLO_COUNT`, `numeroDeFila` (`../biblioteca-data`) ·
  `FilaIndiceExpandible` (`~/components/papel/primitives`, primitiva de 2.4) · `Link`
  de wouter.
- Produces: la sección § 3 completa, con el estado del acordeón adentro (apertura única
  **global**: una sola fila abierta entre los tres ciclos).

- [ ] **Step 1: Tests (fallan primero).** `IndiceEnsayos.test.tsx`:
  - encabezado `Ensayos · ${CICLO_COUNT} ciclos · tocá para abrir` (interpolado desde la
    constante importada, nunca literal).
  - un `<h3>` por ciclo con su rótulo; la línea mono de cada ciclo contiene
    `Ciclo ${c.romano}`, `${c.ensayos.length} ensayos` y `c.fecha`; la descripción del
    ciclo aparece cuando existe.
  - se renderizan `ORDEN_DE_LECTURA.length` botones de fila cerrados; la primera fila
    del primer ciclo es `01` + el título de `CICLOS[0].ensayos[0]`.
  - **apertura única global:** click en una fila del primer ciclo muestra su `summary`
    entre comillas angulares y el link `Leer el ensayo completo · {min} min →` con
    `href="/ensayos/{slug}"`; click en una fila del **último** ciclo cierra la anterior
    (un solo `aria-expanded="true"` en toda la sección); click en la abierta la cierra
    (cero expandidas).
  - **el acta:** la fila del ensayo con `form === 'acta'` muestra la marca `acta` y su
    pliegue dice `Leer el acta completa · {min} min →` (buscar el ensayo por
    `form === 'acta'`, sin hardcodear el slug).
  - sin `glass`, sin `gradient-text`, sin `iris-violet` en `container.innerHTML`.

Run: `pnpm -C apps/web exec vitest run src/pages/Biblioteca`
Esperado: FAIL.

- [ ] **Step 2: Implementar `IndiceEnsayos.tsx`** (esqueleto — copy verbatim de la spec
  § 3):

```tsx
import { useState } from 'react';
import { Link } from 'wouter';

import { CICLO_COUNT, CICLOS, numeroDeFila, type Ciclo } from '../biblioteca-data';

import { FilaIndiceExpandible } from '~/components/papel/primitives';
import type { EnsayoEntry } from '~/lib/ensayos-registry';

/** § 3 de la spec — los {C} ciclos. Apertura única en toda la página. */
export function IndiceEnsayos() {
  const [abierto, setAbierto] = useState<string | null>(null);

  const fila = (ensayo: EnsayoEntry, num: string) => {
    const esActa = ensayo.form === 'acta';
    const minutos = ensayo.readingMinutes > 0 ? ` · ${String(ensayo.readingMinutes)} min` : '';
    return (
      <FilaIndiceExpandible
        key={ensayo.slug}
        num={num}
        idPanel={`panel-${ensayo.slug}`}
        abierta={abierto === ensayo.slug}
        onToggle={() => { setAbierto(abierto === ensayo.slug ? null : ensayo.slug); }}
        encabezado={
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className={`text-[17px] font-semibold leading-snug ${abierto === ensayo.slug ? 'text-violeta' : 'text-tinta'}`}
            >
              {ensayo.title}
            </span>
            {esActa ? (
              <span className="font-space border-tinta-30 text-tinta-50 border px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em]">
                acta
              </span>
            ) : null}
          </span>
        }
      >
        {ensayo.summary ? (
          <p className="text-tinta-90 mb-3 max-w-[640px] text-pretty text-base leading-[1.6]">
            «{ensayo.summary}»
          </p>
        ) : null}
        <Link
          href={`/ensayos/${ensayo.slug}`}
          className="font-space text-violeta text-xs font-bold uppercase tracking-[0.1em]"
        >
          {esActa ? 'Leer el acta completa' : 'Leer el ensayo completo'}
          {minutos} →
        </Link>
      </FilaIndiceExpandible>
    );
  };

  const bloque = (ciclo: Ciclo) => (
    <div key={ciclo.serie} className="mt-11 first:mt-0">
      <div className="border-tinta border-t-2 pb-2 pt-[22px]">
        <p className="font-space text-tinta-50 mb-2 text-[11px] uppercase tracking-[0.16em]">
          Ciclo {ciclo.romano} · {ciclo.ensayos.length} ensayos · {ciclo.fecha}
        </p>
        <h3 className="font-anton riso-hover mb-1 text-[clamp(24px,3vw,34px)] leading-[1.1]">
          {ciclo.rotulo}
        </h3>
        {ciclo.descripcion ? (
          <p className="text-tinta-50 max-w-[640px] text-pretty text-sm leading-[1.6]">
            {ciclo.descripcion}
          </p>
        ) : null}
      </div>
      {ciclo.ensayos.map((ensayo, i) => fila(ensayo, numeroDeFila(i)))}
    </div>
  );

  return (
    <section className="anim-fadeup mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5">
      <h2 className="font-space text-tinta-50 mb-5 text-[11px] uppercase tracking-[0.16em]">
        Ensayos · {CICLO_COUNT} ciclos · tocá para abrir
      </h2>
      {CICLOS.map(bloque)}
    </section>
  );
}
```

- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/Biblioteca` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/Biblioteca/sections/IndiceEnsayos.tsx \
        apps/web/src/pages/Biblioteca/__tests__/IndiceEnsayos.test.tsx
git commit -m "feat(web): índice de ensayos por ciclo con pliegues +/- y marca de acta"
```

---

### Task 3: El hub — portada, manifiesto, bitácora, cierre, composer + enmienda §8

**Files:**
- Create: `apps/web/src/pages/Biblioteca/sections/PortadaBiblioteca.tsx`
- Create: `apps/web/src/pages/Biblioteca/sections/ManifiestoDestacado.tsx`
- Create: `apps/web/src/pages/Biblioteca/sections/BitacoraReciente.tsx`
- Create: `apps/web/src/pages/Biblioteca/sections/CierreBiblioteca.tsx`
- Create: `apps/web/src/pages/Biblioteca.tsx` (composer; named + default export)
- Test: `apps/web/src/pages/__tests__/Biblioteca.test.tsx`
- Modify: `docs/design-system/README.md` (§8 — enmienda de ley, mismo commit)

**Interfaces:**
- Consumes: `ENSAYO_COUNT`, `CICLO_COUNT`, `CRONICA_COUNT`, `ULTIMAS_CRONICAS`,
  `HREF_MANIFIESTO`, `HREF_BITACORA`, `hrefCronica`, `fechaLarga` · `Kicker`,
  `RitoTinta`, `BotonPapel`, `BandaCta` · `IndiceEnsayos` (T2).
- Produces: la página `/biblioteca` completa (sin ruta todavía — el flip es T5).

- [ ] **Step 1: Tests (fallan primero).** `Biblioteca.test.tsx` (render del composer
  dentro de `<Router>` de wouter, patrón de `Planes.test.tsx`):
  - heading nivel 1 con `aria-label` `Papel, tinta y método.`; kicker
    `La biblioteca · leer también es hacer`.
  - lead: contiene `${ENSAYO_COUNT} ensayos en ${CICLO_COUNT} ciclos` y termina en
    `Robate todo.`
  - manifiesto: link a `/manifiesto` que contiene `Documento fundacional`,
    `El manifiesto del hombre gris`, `No es un programa: es un espejo. Si algo te resuena, ahí empieza.`
    y `Leerlo entero →`; **sin cifras**: `queryByText(/seis partes|cinco minutos/i)` es
    null.
  - bitácora: encabezado `Bitácora · lo que va pasando`; link
    `Ver la bitácora entera · ${CRONICA_COUNT} crónicas →` con `href="/blog"`; se
    renderizan los títulos de `ULTIMAS_CRONICAS` con `href={'/blog/' + slug}` y su
    `category` real como etiqueta; `queryByText(/datos de demostración/i)` es null.
  - cierre: `Leíste. Ahora decí.` + link `Soltar mi voz en el mapa →` a `/el-mapa`.
  - **la deferral, pineada:** `queryByText(/entrenamiento/i)` es null y
    `queryByRole('link', { name: /entrenamientos/i })` es null — la sección no se monta
    hasta 3.5.
  - **ausencia del v1:** `queryByText('Pensamiento de fondo.')` null; sin `glass`,
    `gradient-text`, `iris-violet` ni `font-serif` en `container.innerHTML`.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Biblioteca.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar las cuatro secciones** — composición directa del copy de la
  spec (§ 1, § 2, § 4, § 6). Puntos no obvios:

`PortadaBiblioteca.tsx` (patrón `PortadaPrueba`): `Kicker` + `<h1 aria-label="Papel,
tinta y método.">` con `RitoTinta lineas={['Papel, tinta', 'y método.']}` +
`riso-hover` + lead con `ENSAYO_COUNT`/`CICLO_COUNT`.

`ManifiestoDestacado.tsx` — card oscura como un solo link; la etiqueta es la receta de
tag §5 compuesta inline sobre oscuro (§9b: repetir la receta antes que abstraer):

```tsx
<section className="mx-auto max-w-[1100px] px-10 pb-14 max-[560px]:px-5">
  <Link
    href={HREF_MANIFIESTO}
    className="bg-tinta text-papel flex flex-wrap items-center gap-8 px-10 py-9 transition-transform duration-150 hover:-translate-y-0.5 max-[560px]:px-6 max-[560px]:py-7"
  >
    <span className="font-space border-violeta-claro text-violeta-claro whitespace-nowrap border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em]">
      Documento fundacional
    </span>
    <span className="min-w-[260px] flex-1">
      <h2 className="font-anton mb-1.5 text-[clamp(24px,3vw,36px)] leading-[1.05]">
        El manifiesto del hombre gris
      </h2>
      <span className="text-oscuro-secundario block text-sm leading-[1.6]">
        No es un programa: es un espejo. Si algo te resuena, ahí empieza.
      </span>
    </span>
    <span className="font-space text-violeta-claro whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.08em]">
      Leerlo entero →
    </span>
  </Link>
</section>
```

`BitacoraReciente.tsx` — encabezado `flex justify-between` (h2 mono + link a
`HREF_BITACORA` con `CRONICA_COUNT`), y por crónica un `<Link href={hrefCronica(slug)}>`
con `border-tinta border-t px-2 py-6 hover:bg-papel-presionado`, fila mono con
`fechaLarga(publishedAt)` + etiqueta neutra (`border-tinta border px-2 py-0.5`) con
`post.category` **tal cual**, título 20px `font-bold`, `summary` 15px tinta-75
max-w-[680px], y `Leer la crónica →` mono violeta. Vacío (§10.9):
`Todavía no hay crónicas. Cuando pase algo, se cuenta acá.`

`CierreBiblioteca.tsx` — `BandaCta fondo="tinta"` con una fila
`flex flex-wrap items-center justify-between gap-6 text-left`: `<h2>` Anton
`Leíste. Ahora decí.` + `BotonPapel asChild variant="violeta" surface="oscuro"`
envolviendo `<Link href="/el-mapa">Soltar mi voz en el mapa →</Link>` (patrón de
`PlanDetail`/`ExpedienteExtraviado` para `asChild`).

- [ ] **Step 3: Implementar el composer `Biblioteca.tsx`:**

```tsx
import { BitacoraReciente } from './Biblioteca/sections/BitacoraReciente';
import { CierreBiblioteca } from './Biblioteca/sections/CierreBiblioteca';
import { IndiceEnsayos } from './Biblioteca/sections/IndiceEnsayos';
import { ManifiestoDestacado } from './Biblioteca/sections/ManifiestoDestacado';
import { PortadaBiblioteca } from './Biblioteca/sections/PortadaBiblioteca';

/**
 * La biblioteca — página 3.1 «Papel y Tinta»
 * (docs/specs/2026-07-24-la-biblioteca-papel-y-tinta.md). Manifiesto,
 * ensayos por ciclo y bitácora: las tres secciones con destino vivo. Los
 * entrenamientos están especificados en la spec y los monta 3.5, con su
 * catálogo — acá no se anuncia lo que todavía no se puede abrir.
 * El chrome papel lo pone RootLayout.
 */
export function Biblioteca() {
  return (
    <main>
      <PortadaBiblioteca />
      <ManifiestoDestacado />
      <IndiceEnsayos />
      <BitacoraReciente />
      <CierreBiblioteca />
    </main>
  );
}

export default Biblioteca;
```

- [ ] **Step 4: Enmienda de ley (mismo commit).** En `docs/design-system/README.md` §8,
  reemplazar `6 entrenamientos curados (catálogo completo de 30 detrás de «ver todos»)`
  por:

```
6 entrenamientos curados (catálogo completo detrás de «ver todos» — el número lo dice el registry, nunca el texto)
```

  Justificación (spec, «Enmiendas a la ley» 1): `content/courses/` tiene **31** cursos
  y 329 lecciones (commit `367dbcd`) — la ley afirma un número falso y esta es la
  página que lo mostraría.

- [ ] **Step 5: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Biblioteca.test.tsx src/pages/Biblioteca` → PASS.
`pnpm verify` verde.

```bash
git add apps/web/src/pages/Biblioteca.tsx \
        apps/web/src/pages/Biblioteca/sections/PortadaBiblioteca.tsx \
        apps/web/src/pages/Biblioteca/sections/ManifiestoDestacado.tsx \
        apps/web/src/pages/Biblioteca/sections/BitacoraReciente.tsx \
        apps/web/src/pages/Biblioteca/sections/CierreBiblioteca.tsx \
        apps/web/src/pages/__tests__/Biblioteca.test.tsx \
        docs/design-system/README.md
git commit -m "feat(web): La biblioteca — hub papel con manifiesto, ciclos y bitácora (§8 enmendada)"
```

---

### Task 4: El lector de ensayo — cadena del ciclo, cuerpo verbatim y edición impresa

**Files:**
- Rewrite: `apps/web/src/pages/EnsayoDetail.tsx` (misma ruta `/ensayos/:slug`; named +
  default export intactos)
- Test: `apps/web/src/pages/__tests__/EnsayoDetail.test.tsx`

**Interfaces:**
- Consumes: `findEnsayoBySlug` (`~/lib/ensayos-registry`) · `ubicarEnsayo`,
  `fechaLarga` (`~/pages/Biblioteca/biblioteca-data`) · `MdxPapel` (2.4) · `Kicker`,
  `RitoTinta`, `Sello`, `BotonPapel` · `.edicion-impresa` (ya en `index.css`).
- Produces: el lector editorial de 800px con edición impresa; el chrome glass del
  archivo muere.

- [ ] **Step 1: Tests (fallan primero).** `EnsayoDetail.test.tsx` con
  `memoryLocation({ path, static: true })` (patrón exacto de `PlanDetail.test.tsx`).
  Las fixtures se eligen **por posición derivada**, nunca por slug hardcodeado:
  `const primero = ORDEN_DE_LECTURA[0]`, `const ultimo = ORDEN_DE_LECTURA.at(-1)`, y
  un ensayo del medio de un ciclo.
  - **Cuerpo y cabecera:** para el ensayo del medio — kicker
    `Ciclo ${u.ciclo.romano} — ${u.ciclo.rotulo} · ensayo ${u.posicion} de ${u.total} · ${min} min`;
    heading nivel 1 con `aria-label` igual al `title` del frontmatter; el `subtitle`
    presente; un fragmento real del cuerpo renderizado (tomar los primeros ~40
    caracteres de `ensayo.body` después del primer `##`, o assert de que existe un
    `heading` nivel 2 — el cuerpo abre en `## I. …`); firma `— El hombre gris`;
    backlink `← La biblioteca` con `href="/biblioteca"`.
  - **El acta:** para el ensayo con `form === 'acta'`, el kicker dice `· acta ` (no
    `ensayo`).
  - **Cadena:** el primero de `ORDEN_DE_LECTURA` no tiene link «←» de ensayo anterior;
    el último no tiene «→»; para el último de un ciclo intermedio, el link siguiente
    contiene la línea `Ciclo {romano} — {rótulo}` del ciclo destino (aviso de cruce), y
    para un vecino del mismo ciclo esa línea no está.
  - **Edición impresa:** el `<article>` lleva `edicion-impresa`; el folio
    `¡BASTA! · edición del lector ·` está en el DOM con `hidden` + `print:block`;
    backlink, cadena y card de cierre llevan `print:hidden`; el H1 lleva
    `print:[&_span]:animate-none`.
  - **404:** slug inexistente → kicker `expediente extraviado`, heading
    `Ese ensayo no está.`, sello `Extraviado`, CTA `Volver a la biblioteca →` a
    `/biblioteca`.
  - **Chrome muerto:** sin `glass`, `gradient-text`, `iris-violet`, `font-serif` ni
    `MdxContent` en el HTML.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/EnsayoDetail.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar `EnsayoDetail.tsx`** (esqueleto — copy verbatim de la spec,
  «Página 3.2»):

```tsx
import { Link, useRoute } from 'wouter';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { BotonPapel, Kicker, RitoTinta, Sello } from '~/components/papel/primitives';
import { findEnsayoBySlug } from '~/lib/ensayos-registry';
import { fechaLarga, ubicarEnsayo, type Vecino } from '~/pages/Biblioteca/biblioteca-data';

/** 404 §5: el expediente extraviado, sobre papel (el lector es editorial). */
function EnsayoExtraviado() {
  return (
    <main className="mx-auto max-w-md px-10 py-24 text-center max-[560px]:px-5">
      <Kicker className="mb-4">expediente extraviado</Kicker>
      <h1 className="font-anton mb-6 text-4xl leading-none">Ese ensayo no está.</h1>
      <div className="mb-8">
        <Sello color="rojo">Extraviado</Sello>
      </div>
      <BotonPapel asChild variant="tinta">
        <Link href="/biblioteca">Volver a la biblioteca →</Link>
      </BotonPapel>
    </main>
  );
}

/** Un eslabón de la cadena del ciclo; avisa cuando el vecino cambia de ciclo. */
function Eslabon({ vecino, lado }: { vecino: Vecino; lado: 'anterior' | 'siguiente' }) {
  const siguiente = lado === 'siguiente';
  return (
    <Link
      href={`/ensayos/${vecino.ensayo.slug}`}
      className={`font-space max-w-[300px] text-xs uppercase tracking-[0.06em] ${
        siguiente ? 'text-tinta ml-auto text-right font-bold hover:text-violeta' : 'text-tinta-50 hover:text-tinta'
      }`}
    >
      {vecino.cruzaCiclo ? (
        <span className="text-tinta-30 block text-[10px] tracking-[0.1em]">
          Ciclo {vecino.ciclo.romano} — {vecino.ciclo.rotulo}
        </span>
      ) : null}
      {siguiente ? `${vecino.ensayo.title} →` : `← ${vecino.ensayo.title}`}
    </Link>
  );
}

/**
 * Lector de ensayo — página 3.2 «Papel y Tinta»
 * (docs/specs/2026-07-24-la-biblioteca-papel-y-tinta.md). Lector editorial
 * sobre papel claro: el cuerpo MDX se renderiza VERBATIM (texto keystone) y
 * la edición impresa reusa el patrón de 2.4 tal cual. No hay sello al
 * terminar: leer no es un acto verificable (spec, Decisión 2).
 */
export function EnsayoDetail() {
  const [match, params] = useRoute<{ slug: string }>('/ensayos/:slug');
  if (!match) return null;
  const ensayo = findEnsayoBySlug(params.slug);
  const ubicacion = ensayo ? ubicarEnsayo(ensayo.slug) : null;
  if (!ensayo || !ubicacion) return <EnsayoExtraviado />;

  const forma = ensayo.form === 'acta' ? 'acta' : 'ensayo';
  const minutos = ensayo.readingMinutes > 0 ? ` · ${String(ensayo.readingMinutes)} min` : '';

  return (
    <main className="mx-auto max-w-[800px] px-10 pb-20 pt-12 max-[560px]:px-5 print:p-0">
      <Link
        href="/biblioteca"
        className="font-space text-tinta-50 hover:text-tinta text-xs uppercase tracking-[0.1em] print:hidden"
      >
        ← La biblioteca
      </Link>

      <article className="edicion-impresa">
        <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
          ¡BASTA! · edición del lector · {fechaLarga(new Date().toISOString())}
        </p>
        <Kicker className="mb-4 mt-10">
          Ciclo {ubicacion.ciclo.romano} — {ubicacion.ciclo.rotulo} · {forma} {ubicacion.posicion} de{' '}
          {ubicacion.total}
          {minutos}
        </Kicker>
        <h1
          aria-label={ensayo.title}
          className="font-anton riso-hover mb-7 text-pretty text-[clamp(36px,5.4vw,68px)] leading-none print:[&_span]:animate-none"
        >
          <RitoTinta lineas={[ensayo.title]} />
        </h1>
        {ensayo.subtitle ? (
          <p className="text-tinta-75 mb-7 max-w-[620px] text-pretty text-lg leading-[1.6]">
            {ensayo.subtitle}
          </p>
        ) : null}
        <div className="border-tinta border-t-2 pt-7">
          <MdxPapel raw={ensayo.body} className="max-w-[680px] [&>*:first-child]:mt-0" />
        </div>
        <p className="font-space text-tinta-50 mt-9 text-xs">— El hombre gris</p>
      </article>

      <nav className="border-tinta mt-11 flex flex-wrap justify-between gap-5 border-t pt-[22px] print:hidden">
        {ubicacion.anterior ? <Eslabon vecino={ubicacion.anterior} lado="anterior" /> : null}
        {ubicacion.siguiente ? <Eslabon vecino={ubicacion.siguiente} lado="siguiente" /> : null}
      </nav>

      <div className="bg-tinta text-papel mt-11 flex flex-wrap items-center justify-between gap-5 px-8 py-7 print:hidden">
        <span className="font-anton text-[22px] leading-tight">¿Te resonó? No lo dejes en lectura.</span>
        <BotonPapel asChild variant="violeta" surface="oscuro">
          <Link href="/el-mapa">Decir la mía →</Link>
        </BotonPapel>
      </div>
    </main>
  );
}

export default EnsayoDetail;
```

(Ajustes permitidos al implementar: si `MdxPapel` no aceptara el override de ancho por
`cn`/twMerge, envolver el cuerpo en un `div max-w-[680px]` — el resultado visible es el
mismo. El `nav` con un solo eslabón debe mantener la alineación: el eslabón «siguiente»
ya lleva `ml-auto`.)

- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/EnsayoDetail.test.tsx` → PASS.
`pnpm verify` verde.

```bash
git add apps/web/src/pages/EnsayoDetail.tsx \
        apps/web/src/pages/__tests__/EnsayoDetail.test.tsx
git commit -m "feat(web): lector de ensayo — cadena del ciclo, cuerpo verbatim y edición impresa"
```

---

### Task 5: Flip — ruta, redirect, `PAPEL_ROUTES`, nav y prueba en navegador

**Files:**
- Modify: `apps/web/src/App.tsx` (lazy `Biblioteca` + `<Route path="/biblioteca">`;
  `/ensayos` → `<Redirect to="/biblioteca" replace />`; borrar el lazy `Ensayos`)
- Delete: `apps/web/src/pages/Ensayos.tsx`
- Modify: `apps/web/src/layouts/papel-routes.ts` + `apps/web/src/layouts/__tests__/papel-routes.test.ts`
- Modify: `apps/web/src/components/papel/papel-nav.ts` (**sweep sancionado:** el item
  «La biblioteca» pasa de `/ensayos` a `/biblioteca`)

**Interfaces:**
- Produces: `/biblioteca` y `/ensayos/:slug` con chrome papel; `/ensayos` redirige; el
  header, el menú móvil y el footer apuntan al hub.

- [ ] **Step 1: Tests primero.** En `papel-routes.test.ts`: `esRutaPapel('/biblioteca')`
  → true · `esRutaPapel('/ensayos')` → true (el frame del redirect no debe mostrar
  chrome v1) · `esRutaPapel('/ensayos/presidencia')` → true ·
  `esRutaPapel('/ensayosque')` → false (el prefijo lleva barra). FAIL → agregar
  `/biblioteca` y `/ensayos` al Set y `/ensayos/` a `PAPEL_PREFIXES` → PASS.
- [ ] **Step 2: Ruta nueva + redirect + borrado.** En `App.tsx`: agregar el lazy
  (patrón de los demás)

```tsx
const Biblioteca = lazy(async () => {
  const m = await import('~/pages/Biblioteca');
  return { default: m.Biblioteca };
});
```

  reemplazar las dos líneas de contenido por:

```tsx
<Route path="/biblioteca" component={Biblioteca} />
<Route path="/ensayos">
  <Redirect to="/biblioteca" replace />
</Route>
<Route path="/ensayos/:slug" component={EnsayoDetail} />
```

  y borrar el lazy `Ensayos`. `git rm apps/web/src/pages/Ensayos.tsx`.

- [ ] **Step 3: Sweep de navegación.** En `papel-nav.ts`, el item num `05` pasa a
  `{ href: '/biblioteca', label: 'La biblioteca', num: '05' }`. Cero cambios en
  `PapelHeader.tsx`/`PapelFooter.tsx` (consumen `PAPEL_NAV`/`PAPEL_NAV_ALL`, y su test
  itera los items: debe seguir verde sin tocarlo — correrlo explícitamente).

Run: `pnpm -C apps/web exec vitest run src/components/__tests__/PapelHeader.test.tsx src/lib/despertar.test.tsx`

- [ ] **Step 4: Greps de control.**

```bash
# La ruta vieja solo puede aparecer en el redirect de App.tsx y en la página v1-port de la Fase 4.1:
grep -rn "'/ensayos'" apps/web/src
# Chrome muerto en las páginas nuevas (debe dar cero):
grep -n "glass\|gradient-text\|iris-violet\|font-serif\|MdxContent\|components/ui/button" \
  apps/web/src/pages/Biblioteca.tsx apps/web/src/pages/Biblioteca/sections/*.tsx \
  apps/web/src/pages/Biblioteca/biblioteca-data.ts apps/web/src/pages/EnsayoDetail.tsx
# Cero hex literal en el TSX nuevo (§9b — debe dar cero):
grep -n "#[0-9A-Fa-f]\{6\}" apps/web/src/pages/Biblioteca.tsx \
  apps/web/src/pages/Biblioteca/sections/*.tsx apps/web/src/pages/EnsayoDetail.tsx
# Cero literales de conteo en el JSX nuevo (revisar a ojo lo que salga):
grep -n "\b21\b\|\b20\b\|\b31\b" apps/web/src/pages/Biblioteca/sections/*.tsx \
  apps/web/src/pages/EnsayoDetail.tsx
```

- [ ] **Step 5: Suite completa + verificación.**

Run: `pnpm -C apps/web exec vitest run` → PASS (nada de Home/LaIdea/ElMapa/
ElMandatoVivo/Planes/Sembrar roto). `pnpm verify` verde.

- [ ] **Step 6: Prueba en navegador (desktop + mobile, con capturas).**
  - (a) `/biblioteca` con chrome papel: rito de la tinta en «Papel, tinta y método.»,
    lead con los conteos derivados (hoy «21 ensayos en 3 ciclos»), card oscura del
    manifiesto.
  - (b) **El pliegue** (interacción firma): abrir una fila del Ciclo I — glifo a `−`,
    título a violeta, panel con fadeup y el `summary` entre comillas angulares; abrir
    una del Ciclo III cierra la anterior; `Leer el ensayo completo · {min} min →`
    navega; la fila del acta muestra su marca y dice «Leer el acta completa».
  - (c) **Los tres ciclos** con su línea mono (`Ciclo I · 7 ensayos · abril de 2026`…),
    su título Anton y su descripción; **no hay sección de entrenamientos** en ningún
    lado.
  - (d) **Bitácora:** cuatro crónicas reales con fecha y categoría; «Ver la bitácora
    entera · 20 crónicas →» abre `/blog`; cada card abre su `/blog/:slug`.
  - (e) `/ensayos/{slug}` de un ensayo del medio: kicker con ciclo/forma/posición/
    minutos, H1 entintándose, subtítulo, cuerpo en prosa papel (Anton en los `##`,
    Archivo 17/1.75 en el cuerpo), firma, cadena del ciclo, cierre oscuro al mapa.
  - (f) **Los bordes de la cadena:** el primer ensayo del Ciclo I no tiene «←»; el
    **acta** (último de todo) no tiene «→»; el último del Ciclo I muestra el aviso
    `Ciclo II — Indagaciones` sobre el link siguiente.
  - (g) **Print preview (Cmd+P) — captura obligatoria:** sin header/footer/grano, TODO
    en serifa, folio `¡BASTA! · edición del lector · {fecha}` como primera línea,
    **título en tinta (no gris)** aun imprimiendo apenas carga, kicker/subtítulo/cuerpo/
    firma presentes, sin backlink, sin cadena, sin card de cierre.
  - (h) `/ensayos` redirige a `/biblioteca`; el item «La biblioteca» del header, del
    menú móvil y del footer va al hub; `/ensayos/no-existe` muestra el 404 EXTRAVIADO
    con CTA al hub.
  - (i) Móvil 375px: 1 columna, card del manifiesto apilada, filas con título completo,
    targets ≥ 44px, cadena del ciclo apilada sin desbordes.
  - (j) `prefers-reduced-motion`: hub completo y quieto, pliegue sin animación, título
    del lector entintado de entrada.
- [ ] **Step 7: Commit.**

```bash
git add apps/web/src/App.tsx \
        apps/web/src/layouts/papel-routes.ts \
        apps/web/src/layouts/__tests__/papel-routes.test.ts \
        apps/web/src/components/papel/papel-nav.ts
git rm apps/web/src/pages/Ensayos.tsx
git commit -m "feat(web): La biblioteca papel en /biblioteca — redirect de /ensayos, rutas y verificación"
```

---

## Self-review

- **Cobertura de la spec:** derivaciones de ciclos/cadena/vecinos con test de canon
  estructural (T1) · índice de los tres ciclos con pliegue de apertura única global y
  marca de acta — la interacción firma del hub (T2) · portada, manifiesto sin cifras,
  bitácora real sin asterisco, cierre al mapa, composer y la **única** enmienda de ley
  (T3) · lector editorial con kicker derivado, cuerpo verbatim, cadena con aviso de
  cruce, 404 expediente y edición impresa reusada (T4) · ruta nueva, redirect, prefijos
  papel, sweep de nav, greps y navegador con print preview (T5).
- **Cero datos inventados:** ningún literal de conteo en JSX; los ciclos salen de
  `series`, el acta de `form`, los minutos de `readingMinutes`, las fechas de
  `publishedAt`, las crónicas de `BLOG_POSTS`. Los dos únicos literales son topes de
  display (4 crónicas, 6 entrenamientos §8/D4) y están comentados. Los tests comparan
  contra valores computados desde los registries, nunca contra strings de contenido.
- **La honestidad estructural es testeable:** `Biblioteca.test.tsx` pinea la **ausencia**
  de la sección de entrenamientos — si alguien la monta antes de que exista
  `/entrenamientos`, el test rompe.
- **Cero re-derivación:** `FilaIndiceExpandible` y `MdxPapel` son de 2.4;
  `.edicion-impresa` y el `print:hidden` del chrome ya viven en `index.css`/chrome
  desde 2.4 — ninguno de esos archivos aparece en un `git add` de este plan. Cero
  primitivas nuevas, cero dependencias, cero CSS.
- **Consistencia de tipos:** `EnsayoEntry` viene solo de `~/lib/ensayos-registry`;
  `Ciclo`/`Vecino`/`UbicacionEnsayo` viven solo en `biblioteca-data.ts` y los consumen
  secciones y lector (import cruzado sancionado: `EnsayoDetail` →
  `pages/Biblioteca/biblioteca-data`, mismo feature, patrón `PlanDetail` →
  `pages/Planes/la-prueba-data`).
- **Riesgos señalados:** (1) el orden de los ciclos depende de `publishedAt` — si un
  ciclo futuro llegara sin fecha, cae al final por el centinela `'9999'` y el test de
  «nada se pierde» igual lo cubre; (2) `print:[&_span]:animate-none` debe ganarle a
  `.anim-inkfill` (utilities > components): si en la captura del print preview el
  título saliera gris, el fallback es sumar `.anim-inkfill` al bloque `@media print` de
  `index.css` — cambio global, solo si la verificación lo pide; (3) el override de
  ancho de `MdxPapel` por twMerge (`max-w-none` → `max-w-[680px]`): si no aplicara,
  envolver en un `div`; (4) las aserciones de fecha usan el mismo `Intl` que el
  código — nunca literales «abril de 2026», que dependen del ICU del runner; (5) el
  contenido del tercer ciclo aterrizó el 2026-07-24 en paralelo: si al implementar
  hubiera 14 ensayos en vez de 21, los tests siguen verdes (todo es derivado) y solo
  cambian los números en pantalla.
- **Ley:** una sola enmienda (§8, el conteo de entrenamientos deja de vivir literal en
  la ley) en el mismo commit que el hub que la necesita (T3). **El catálogo de sellos
  §10.5 NO se enmienda:** un ensayo terminado no estampa nada (spec, Decisión 2).
- **Deuda observada, fuera de alcance:** (a) la receta de tag §5 se repite inline en
  `ManifiestoDestacado` y `BitacoraReciente` (§9b manda repetir antes que abstraer); si
  3.4 la necesita por tercera vez, ahí se extrae `Etiqueta` con prop de superficie.
  (b) `ApoyaAlMovimiento.tsx` linkea `/ensayos` y queda funcionando por el redirect —
  se limpia en la Fase 4.1. (c) `lib/ensayos-registry.ts` ordena por `orderIndex`
  global, útil para nadie: cuando 3.7 cierre paridad puede ordenar por serie +
  orderIndex y `biblioteca-data.ts` se simplifica.
