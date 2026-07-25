# La crónica del país que viene (página 3.6) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `/cronica` en Papel y Tinta — lector editorial de 800px con los 5
capítulos de la novela ancladas en una sola página, sumario que salta a cada una, cuerpo
**verbatim** vía `MdxPapel`, edición impresa reusada de 2.4/3.3 — y sumarle a `/biblioteca`
el bloque que abre la puerta (D9), entre la vidriera de entrenamientos y la bitácora.

**Architecture:** Cero backend, cero dependencias, cero primitivas nuevas. Contenido
build-time (`CRONICA_CHAPTERS`, `import.meta.glob` eager, ya existe, no se toca). Capa de
derivaciones puras (`pages/Cronica/cronica-data.ts`) + tres secciones en
`pages/Cronica/sections/` + composer fino (patrón `Manifiesto.tsx`) + una sección nueva en
`pages/Biblioteca/sections/` + una línea nueva en `pages/Biblioteca.tsx` + una constante
nueva en `biblioteca-data.ts`. Ruta nueva y estática en `app-routes.tsx`/`app-pages.tsx` +
`PAPEL_ROUTES` al final, con el mismo estado interino ya aceptado en 3.1/3.2/3.3/3.4/3.5
(la página existe y se testea aislada antes de que la ruta la sirva).

**Tech Stack:** React 18 + wouter + Tailwind (tokens papel §9b) + Vitest/Testing Library.
Sin API, sin migraciones, sin CSS nuevo.

**Spec:** `docs/specs/2026-07-25-la-cronica-papel-y-tinta.md` — **todo el copy sale de
ahí, carácter por carácter, incluida la frase keystone de D2.**

## Global Constraints

- `v2/CLAUDE.md` completo: sin `any`, sin `console.*`, archivos ≤ 300 LOC, `pnpm verify`
  verde antes de cada commit, Conventional Commits con scope.
- `docs/design-system/README.md` v1.1 es ley. §9b: PROHIBIDO el hex literal en TSX — solo
  tokens. **Una sola enmienda** en este plan: §8 (Task 2, la novela entra al mapa de
  páginas y se aclara la colisión de nombres con la bitácora).
- **Keystone verbatim, dos capas:**
  1. Los 5 cuerpos de `content/cronica/*.mdx` se renderizan tal cual vía `MdxPapel`. Ni
     una palabra se reescribe, trunca ni reordena.
  2. La frase de D2 — `«No es una predicción. Es un ejercicio para ver que otro camino
     es posible.»` — va **carácter por carácter**, sin número interpolado adentro, en el
     lead de `/cronica` (Task 2) y reusada tal cual en la card del hub (Task 3).
- **Cero literales de conteo o de año en JSX:** «5», «2026», «2040» se interpolan desde
  `CRONICA_CHAPTERS`/`CAPITULO_COUNT`, nunca se escriben a mano. Los tests comparan
  contra valores computados desde el registry, nunca contra strings de contenido.
- **`content/cronica/*.mdx` NO se toca.** `lib/cronica-registry.ts` NO se toca (ya
  existe, ya ordena por `orderIndex`, ya tipa `CronicaChapter`).
- Una conversación = una página, con **una excepción sancionada** (spec, D9/Decisión 9):
  `pages/Biblioteca.tsx` y `pages/Biblioteca/biblioteca-data.ts` se modifican en Task 3
  para sumar el bloque nuevo — mismo tipo de cambio que 3.5 ya le hizo a esta página para
  montar la vidriera de entrenamientos. **No se toca ningún otro archivo de
  `Biblioteca/`** (`IndiceEnsayos.tsx`, `EntrenamientosCurados.tsx`,
  `BitacoraReciente.tsx`, `CierreBiblioteca.tsx`, `PortadaBiblioteca.tsx` quedan
  intactos). Tampoco se toca `Home/*`, `LaIdea/*`, `ElMapa/*`, `ElMandatoVivo/*`,
  `Planes/*`, `Sembrar/*`, `Manifiesto/*`, `Bitacora/*`, `Entrenamientos/*`, `index.css`
  ni el chrome papel.
- **Estado interino aceptado:** entre Task 2 y Task 4, `Cronica.tsx` existe y se testea
  aislado (render directo en el test, sin `App.tsx`) pero no hay ruta que sirva
  `/cronica` todavía. El flip llega en Task 4 (mismo orden que 2.3/2.4/2.5/3.1).
- **El patrón de impresión NO se re-deriva:** `.edicion-impresa` está en `index.css` y el
  chrome ya lleva `print:hidden` desde 2.4. Este plan solo aplica la clase, el folio y
  los `print:hidden` locales — `index.css` y el chrome no aparecen en ningún `git add`.
- **`PAPEL_NAV`/`papel-nav.ts` no se tocan** (spec, «Ruta y navegación»): `/cronica` no
  es un ítem de primer nivel.

---

### Task 1: `cronica-data.ts` — conteo, anclas y folio derivados

**Files:**
- Create: `apps/web/src/pages/Cronica/cronica-data.ts`
- Test: `apps/web/src/pages/Cronica/__tests__/cronica-data.test.ts`

**Interfaces:**
- Consumes: `CRONICA_CHAPTERS`, `type CronicaChapter` (`~/lib/cronica-registry`).
- Produces: `CAPITULO_COUNT`, `idCapitulo()`, `numeroDeCapitulo()`, `fechaLarga()`. Los
  consumen las secciones de `/cronica` (Task 2).

- [ ] **Step 1: Tests (fallan primero).** `cronica-data.test.ts` — cero literales de
  contenido: cada expectativa se computa desde `CRONICA_CHAPTERS`.
  - **Canon del registry** (documenta la precondición de toda la página; si algún día
    esto rompe, rompe acá y no como un bug silencioso en el sumario):
    `CRONICA_CHAPTERS.length > 0`; los `orderIndex` son estrictamente crecientes
    empezando en 1 (`CRONICA_CHAPTERS.map(c => c.orderIndex)` igual a
    `[1, 2, …, CRONICA_CHAPTERS.length]`); todos los `slug` son distintos; ninguno tiene
    `subtitle` ni `epigraph` vacíos.
  - `CAPITULO_COUNT === CRONICA_CHAPTERS.length`.
  - `idCapitulo(CRONICA_CHAPTERS[0])` === `` `capitulo-${CRONICA_CHAPTERS[0].orderIndex}` ``
    (computado, no `'capitulo-1'` literal) para dos capítulos distintos.
  - `numeroDeCapitulo(0) === '01'`, `numeroDeCapitulo(9) === '10'` (casos puros, no
    dependen del contenido).
  - `fechaLarga` contra el mismo `Intl` computado en el test (nunca un string literal
    tipo «25 de julio de 2026» — depende del ICU del runner); `fechaLarga('no-es-fecha')
    === ''`.

Run: `pnpm -C apps/web exec vitest run src/pages/Cronica`
Esperado: FAIL — módulo inexistente.

- [ ] **Step 2: Implementar `cronica-data.ts`:**

```ts
import { CRONICA_CHAPTERS, type CronicaChapter } from '~/lib/cronica-registry';

/**
 * La crónica del país que viene (spec 3.6) — derivaciones mínimas. A
 * diferencia de `biblioteca-data.ts` (ciclos, vecinos entre rutas) esta
 * novela vive entera en UNA ruta: no hay «vecino» que resolver, solo un
 * conteo y un ancla por capítulo. `CRONICA_CHAPTERS` ya viene ordenado por
 * `orderIndex` desde el registry — no se reordena acá.
 */
export const CAPITULO_COUNT = CRONICA_CHAPTERS.length;

/** Ancla estable del sumario y de la sección: «capitulo-3». */
export function idCapitulo(capitulo: CronicaChapter): string {
  return `capitulo-${String(capitulo.orderIndex)}`;
}

/** Numeración de fila del sumario: «01»…«05». */
export function numeroDeCapitulo(indice: number): string {
  return String(indice + 1).padStart(2, '0');
}

/**
 * Fecha larga es-AR para el folio impreso. Duplicada a propósito (existe
 * la misma función en `manifiesto-data.ts` y `Biblioteca/biblioteca-data.ts`):
 * importarla de cualquiera de esos dos arrastraría su registry entero
 * (manifiesto o los 21 ensayos) al chunk de esta página.
 */
export function fechaLarga(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
}
```

- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/Cronica` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/Cronica/cronica-data.ts \
        apps/web/src/pages/Cronica/__tests__/cronica-data.test.ts
git commit -m "feat(web): la crónica del país que viene — conteo y anclas derivados del registry"
```

---

### Task 2: `/cronica` — sumario, documento (verbatim) y cierre + enmienda §8

**Files:**
- Create: `apps/web/src/pages/Cronica/sections/SumarioCronica.tsx`
- Create: `apps/web/src/pages/Cronica/sections/DocumentoCronica.tsx`
- Create: `apps/web/src/pages/Cronica/sections/CierreCronica.tsx`
- Create: `apps/web/src/pages/Cronica.tsx` (composer; named + default export)
- Test: `apps/web/src/pages/__tests__/Cronica.test.tsx`
- Modify: `docs/design-system/README.md` (§8 — enmienda de ley, mismo commit)

**Interfaces:**
- Consumes: `CRONICA_CHAPTERS` (`~/lib/cronica-registry`) · `CAPITULO_COUNT`,
  `idCapitulo`, `numeroDeCapitulo`, `fechaLarga` (`./cronica-data`) · `MdxPapel`
  (`~/components/papel/MdxPapel`, 2.4) · `Kicker`, `RitoTinta`, `BotonPapel`
  (`~/components/papel/primitives`) · `Link` de wouter.
- Produces: la página `/cronica` completa (sin ruta todavía — el flip es Task 4).

- [ ] **Step 1: Tests (fallan primero).** `Cronica.test.tsx` (render del composer, patrón
  de `Manifiesto.test.tsx` — sin `<Router>`/`memoryLocation`, la página es estática):
  - **Kicker y H1:** kicker contiene
    `La crónica del país que viene · ficción especulativa`; heading nivel 1 con
    `aria-label="La crónica del país que viene."`.
  - **Lead verbatim:** el texto del documento contiene, como substring exacto,
    `No es una predicción. Es un ejercicio para ver que otro camino es posible.` — y
    contiene `${CAPITULO_COUNT} capítulos` (interpolado desde la constante importada,
    nunca `'5 capítulos'` literal).
  - **Sumario:** `getByRole('navigation', { name: /los capítulos de la crónica/i })`
    existe; hay `CRONICA_CHAPTERS.length` links con `href` igual a
    `` `#${idCapitulo(c)}` `` para cada capítulo (computado, no hardcodeado); el primer
    link contiene el `title` y el `subtitle` de `CRONICA_CHAPTERS[0]`.
  - **Los 5 capítulos:** para cada `c` de `CRONICA_CHAPTERS` —
    `container.querySelector('#' + idCapitulo(c))` existe; adentro hay un heading nivel
    2 con el texto `c.title`; el texto `c.epigraph` está presente; un fragmento real del
    `c.body` (tomar las primeras ~30 caracteres no-markdown del body, p. ej. cortando en
    el primer `\n\n`) aparece en `container.textContent` — la garantía de verbatim, sin
    comparar el HTML completo porque `MdxPapel` transforma `**negrita**` etc.
  - **Kicker de capítulo:** para el capítulo del medio (`CRONICA_CHAPTERS[2]`), el texto
    `` `Capítulo ${c.orderIndex} de ${CAPITULO_COUNT} · ${c.subtitle}` `` está presente.
  - **Firma única:** `getAllByText('— El hombre gris')` tiene longitud 1 (no una por
    capítulo).
  - **Cierre:** `Esto es ficción. Lo que sigue, no.` + link
    `Soltar mi voz en el mapa →` con `href="/el-mapa"`.
  - **Backlink:** `← La biblioteca` con `href="/biblioteca"`.
  - **Edición impresa:** el `<article>` tiene la clase `edicion-impresa`; el folio
    `¡BASTA! · edición del lector ·` está en el DOM con `hidden` + `print:block`;
    backlink, sumario y cierre llevan `print:hidden`; el H1 lleva
    `print:[&_span]:animate-none`.
  - **Cero sello:** `queryByText(/recibida|plantada|leído entero|visto/i)` es null.
  - **Chrome muerto:** sin `glass`, `gradient-text`, `iris-violet`, `font-serif` en
    `container.innerHTML`.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Cronica.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar `SumarioCronica.tsx`** (patrón `SumarioManifiesto`, más el
  año por fila):

```tsx
import { CAPITULO_COUNT, idCapitulo, numeroDeCapitulo } from '../cronica-data';

import { CRONICA_CHAPTERS } from '~/lib/cronica-registry';

/** Sumario (spec 3.6): ancla nativa por capítulo. No se imprime: es navegación. */
export function SumarioCronica() {
  return (
    <nav aria-label="Los capítulos de la crónica" className="mt-10 print:hidden">
      <p className="font-space text-tinta-50 mb-2 text-[11px] uppercase tracking-[0.16em]">
        El recorrido · {CAPITULO_COUNT} capítulos
      </p>
      {CRONICA_CHAPTERS.map((capitulo, i) => (
        <a
          key={capitulo.slug}
          href={`#${idCapitulo(capitulo)}`}
          className="border-papel-borde hover:bg-papel-presionado text-tinta grid grid-cols-[56px_1fr_40px] items-baseline gap-5 border-b px-2 py-4 transition-colors duration-150 max-[560px]:grid-cols-[44px_1fr_32px]"
        >
          <span className="font-space text-tinta-30 text-sm">{numeroDeCapitulo(i)}</span>
          <span>
            <span className="block text-[17px] leading-snug">{capitulo.title}</span>
            <span className="font-space text-tinta-50 mt-1 block text-[11px] uppercase tracking-[0.1em]">
              {capitulo.subtitle}
            </span>
          </span>
          <span className="font-space text-tinta-50 justify-self-end">→</span>
        </a>
      ))}
    </nav>
  );
}
```

- [ ] **Step 3: Implementar `DocumentoCronica.tsx`** (patrón `DocumentoManifiesto`, sin
  `IntersectionObserver`/sello — D8/Decisión 2):

```tsx
import { CAPITULO_COUNT, fechaLarga, idCapitulo } from '../cronica-data';

import { SumarioCronica } from './SumarioCronica';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { Kicker, RitoTinta } from '~/components/papel/primitives';
import { CRONICA_CHAPTERS } from '~/lib/cronica-registry';

/**
 * El documento (spec 3.6). Los 5 cuerpos se renderizan VERBATIM — cada
 * capítulo ya es un archivo separado (a diferencia del manifiesto, acá no
 * hace falta parsear un único MDX en partes). Un solo H1 con rito de la
 * tinta para toda la página; cada capítulo es un H2 sin rito propio.
 */
export function DocumentoCronica() {
  if (CAPITULO_COUNT === 0) {
    return (
      <article className="edicion-impresa">
        <Cabecera />
        <p className="text-tinta-75 mt-10 max-w-[560px] text-pretty text-base leading-[1.6]">
          Todavía no hay crónica. Cuando el país la escriba, se cuenta acá.
        </p>
      </article>
    );
  }

  return (
    <article className="edicion-impresa">
      <Cabecera />
      <SumarioCronica />

      {CRONICA_CHAPTERS.map((capitulo) => (
        <section
          key={capitulo.slug}
          id={idCapitulo(capitulo)}
          className="border-tinta mt-14 scroll-mt-20 border-t-2 pt-[22px]"
        >
          <Kicker color="tinta" className="mb-3">
            Capítulo {capitulo.orderIndex} de {CAPITULO_COUNT} · {capitulo.subtitle}
          </Kicker>
          <h2 className="font-anton riso-hover mb-4 text-pretty text-[clamp(26px,3.4vw,40px)] leading-[1.05]">
            {capitulo.title}
          </h2>
          <blockquote className="border-violeta text-tinta-75 mb-6 max-w-[560px] border-l-2 pl-5 text-lg italic leading-[1.6]">
            {capitulo.epigraph}
          </blockquote>
          <MdxPapel raw={capitulo.body} className="max-w-[680px] [&>*:first-child]:mt-0" />
        </section>
      ))}

      <p className="font-space text-tinta-50 mt-9 text-xs">— El hombre gris</p>
    </article>
  );
}

/** Folio + kicker + H1 + lead — comunes a los dos ramales (vacío y con contenido). */
function Cabecera() {
  return (
    <>
      <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
        ¡BASTA! · edición del lector · {fechaLarga(new Date().toISOString())}
      </p>
      <Kicker className="mb-4 mt-10">La crónica del país que viene · ficción especulativa</Kicker>
      <h1
        aria-label="La crónica del país que viene."
        className="font-anton riso-hover mb-7 text-pretty text-[clamp(36px,5.4vw,68px)] leading-none print:[&_span]:animate-none"
      >
        <RitoTinta lineas={['La crónica', 'del país que viene.']} />
      </h1>
      <p className="text-tinta-75 max-w-[640px] text-pretty text-lg leading-[1.6]">
        {CAPITULO_COUNT} capítulos que imaginan, desde el futuro, qué pasaría si esto se
        usara en serio. No es una predicción. Es un ejercicio para ver que otro camino es
        posible.
      </p>
    </>
  );
}
```

(Si `DocumentoCronica.tsx` se acerca al tope de 300 LOC al implementar de verdad —poco
probable, hoy son ~90 líneas de esqueleto—, extraer el `<section>` de cada capítulo a
`CapituloCronica.tsx` propio, mismo criterio que 2.4/3.1 con las filas de índice.)

- [ ] **Step 4: Implementar `CierreCronica.tsx`** (patrón `CierreManifiesto`):

```tsx
import { Link } from 'wouter';

import { BotonPapel } from '~/components/papel/primitives';

/** Cierre (spec 3.6) — mismo molde que Ensayo/Manifiesto/Bitácora: no compite con el mapa, termina en él. */
export function CierreCronica() {
  return (
    <div className="bg-tinta text-papel mt-11 flex flex-wrap items-center justify-between gap-5 px-8 py-7 print:hidden">
      <span className="font-anton text-[22px] leading-tight">Esto es ficción. Lo que sigue, no.</span>
      <BotonPapel asChild variant="violeta" surface="oscuro">
        <Link href="/el-mapa">Soltar mi voz en el mapa →</Link>
      </BotonPapel>
    </div>
  );
}
```

- [ ] **Step 5: Implementar el composer `Cronica.tsx`** (patrón `Manifiesto.tsx`):

```tsx
import { Link } from 'wouter';

import { CierreCronica } from './Cronica/sections/CierreCronica';
import { DocumentoCronica } from './Cronica/sections/DocumentoCronica';

/**
 * La crónica del país que viene — página 3.6 «Papel y Tinta»
 * (docs/specs/2026-07-25-la-cronica-papel-y-tinta.md). Lector editorial de
 * 800px: los 5 capítulos VERBATIM en una sola ruta, sumario que salta por
 * ancla nativa, edición impresa reusada de 3.3. Sin sello al terminar —
 * leer ficción no es un acto que la plataforma pueda o deba verificar
 * (spec, Decisión 2). El chrome lo pone RootLayout.
 */
export function Cronica() {
  return (
    <main className="mx-auto max-w-[800px] px-10 pb-20 pt-12 max-[560px]:px-5 print:p-0">
      <Link
        href="/biblioteca"
        className="font-space text-tinta-50 hover:text-tinta text-xs uppercase tracking-[0.1em] print:hidden"
      >
        ← La biblioteca
      </Link>
      <DocumentoCronica />
      <CierreCronica />
    </main>
  );
}

export default Cronica;
```

- [ ] **Step 6: Enmienda de ley (mismo commit).** En `docs/design-system/README.md` §8,
  reemplazar

```
… → lectores (ensayo/curso/crónica/manifiesto) → Sembrar (3 pasos → certificado semilla)
```

por

```
… → lectores (ensayo/curso/crónica/manifiesto) → la crónica del país que viene (novela especulativa en una sola ruta, /cronica — no confundir con las crónicas de la bitácora) → Sembrar (3 pasos → certificado semilla)
```

  Justificación (spec, «Enmiendas a la ley» 1): la novela no figuraba en el mapa de
  páginas y su nombre choca con el «crónica» que ya usa la bitácora en la misma línea.
  Sin número de capítulos en el texto — mismo criterio que la enmienda de entrenamientos
  de 3.1 (un conteo escrito a mano en un doc que no se regenera envejece mal).

- [ ] **Step 7: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Cronica.test.tsx src/pages/Cronica` → PASS.
`pnpm verify` verde.

```bash
git add apps/web/src/pages/Cronica.tsx \
        apps/web/src/pages/Cronica/sections/SumarioCronica.tsx \
        apps/web/src/pages/Cronica/sections/DocumentoCronica.tsx \
        apps/web/src/pages/Cronica/sections/CierreCronica.tsx \
        apps/web/src/pages/__tests__/Cronica.test.tsx \
        docs/design-system/README.md
git commit -m "feat(web): la crónica del país que viene — lector de 5 capítulos verbatim con edición impresa (§8 enmendada)"
```

---

### Task 3: El bloque en la biblioteca (D9) — card + wiring + `HREF_CRONICA_PAIS_QUE_VIENE`

**Files:**
- Create: `apps/web/src/pages/Biblioteca/sections/CronicaDestacada.tsx`
- Modify: `apps/web/src/pages/Biblioteca.tsx` (una línea de import + una línea de JSX)
- Modify: `apps/web/src/pages/Biblioteca/biblioteca-data.ts` (agregar
  `HREF_CRONICA_PAIS_QUE_VIENE`)
- Modify: `apps/web/src/pages/__tests__/Biblioteca.test.tsx`

**Interfaces:**
- Consumes: `HREF_CRONICA_PAIS_QUE_VIENE` (`../biblioteca-data`).
- Produces: la sección nueva del hub, entre `<EntrenamientosCurados />` y
  `<BitacoraReciente />`.

- [ ] **Step 1: Test primero.** En `Biblioteca.test.tsx`, sumar (sin tocar las
  aserciones existentes):
  - la card contiene `Ficción especulativa`, `La crónica del país que viene`, la frase
    `No es una predicción. Es un ejercicio para ver que otro camino es posible.` y
    `Leer la crónica →`; el link envolvente tiene `href="/cronica"`.
  - **orden del bloque:** tomar `container.querySelectorAll('h2')`, mapear a
    `textContent`, y verificar que el índice del `h2` de «La crónica del país que
    viene» es mayor al del `h2`/kicker de entrenamientos («Para diseñar un país,») y
    menor al primer elemento de la bitácora (`Bitácora · lo que va pasando`) — la
    aserción de posición, no de contenido, es lo que prueba D9.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Biblioteca.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: `HREF_CRONICA_PAIS_QUE_VIENE` en `biblioteca-data.ts`.** Junto a
  `HREF_MANIFIESTO`/`HREF_BITACORA` — **nombre completo a propósito, no `HREF_CRONICA`**:
  este archivo ya exporta `CRONICA_COUNT`, `hrefCronica(slug)` y `ULTIMAS_CRONICAS` para
  las crónicas de la bitácora (posts de blog); un `HREF_CRONICA` a secas sería un cuarto
  identificador con «Cronica» significando una cosa completamente distinta en el mismo
  archivo — la colisión de nombres que la spec dedica un hallazgo entero a advertir, ahora
  a nivel de código:

```ts
/** /cronica (la novela, no las crónicas de la bitácora — ver CRONICA_COUNT/
 *  hrefCronica más abajo) es una ruta estática nueva: no cambia de fase, pero
 *  centralizarla acá mantiene un solo lugar para todos los destinos salientes
 *  del hub. */
export const HREF_CRONICA_PAIS_QUE_VIENE = '/cronica';
```

- [ ] **Step 3: Implementar `CronicaDestacada.tsx`** (recipe de `ManifiestoDestacado`,
  copy propio):

```tsx
import { Link } from 'wouter';

import { HREF_CRONICA_PAIS_QUE_VIENE } from '../biblioteca-data';

/**
 * § adenda de la spec de la biblioteca (docs/specs/2026-07-25-la-cronica-papel-y-tinta.md)
 * — el bloque que abre la puerta a la novela (D9), entre la vidriera de
 * entrenamientos y la bitácora. Mismo recipe que `ManifiestoDestacado`
 * (§9b: repetir antes de inventar) — la etiqueta y la línea son las únicas
 * que cambian. La línea reusa verbatim la frase keystone de D2: la
 * advertencia de ficción llega antes del clic.
 */
export function CronicaDestacada() {
  return (
    <section className="mx-auto max-w-[1100px] px-10 pb-14 max-[560px]:px-5">
      <Link
        href={HREF_CRONICA_PAIS_QUE_VIENE}
        className="bg-tinta text-papel flex flex-wrap items-center gap-8 px-10 py-9 transition-transform duration-150 hover:-translate-y-0.5 max-[560px]:px-6 max-[560px]:py-7"
      >
        <span className="font-space border-violeta-claro text-violeta-claro whitespace-nowrap border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em]">
          Ficción especulativa
        </span>
        <span className="min-w-[260px] flex-1">
          <h2 className="font-anton mb-1.5 text-[clamp(24px,3vw,36px)] leading-[1.05]">
            La crónica del país que viene
          </h2>
          <span className="text-oscuro-secundario block text-sm leading-[1.6]">
            No es una predicción. Es un ejercicio para ver que otro camino es posible.
          </span>
        </span>
        <span className="font-space text-violeta-claro whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.08em]">
          Leer la crónica →
        </span>
      </Link>
    </section>
  );
}
```

- [ ] **Step 4: Wirear en el composer.** En `Biblioteca.tsx`, sumar el import y una
  línea de JSX entre `<EntrenamientosCurados />` y `<BitacoraReciente />`:

```tsx
import { CronicaDestacada } from './Biblioteca/sections/CronicaDestacada';
// …
      <EntrenamientosCurados />
      <CronicaDestacada />
      <BitacoraReciente />
```

- [ ] **Step 5: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/Biblioteca.test.tsx` → PASS.
`pnpm verify` verde.

```bash
git add apps/web/src/pages/Biblioteca.tsx \
        apps/web/src/pages/Biblioteca/sections/CronicaDestacada.tsx \
        apps/web/src/pages/Biblioteca/biblioteca-data.ts \
        apps/web/src/pages/__tests__/Biblioteca.test.tsx
git commit -m "feat(web): la biblioteca — bloque de la crónica del país que viene entre entrenamientos y bitácora"
```

---

### Task 4: Flip — ruta, `PAPEL_ROUTES`, redirect de `/una-ruta-para-argentina` y prueba en navegador

**Files:**
- Modify: `apps/web/src/app-pages.tsx` (lazy `Cronica`)
- Modify: `apps/web/src/app-routes.tsx` (`<Route path="/cronica" component={Cronica} />`
  **y** el swap de `/una-ruta-para-argentina` a `<Redirect>`, D3)
- Modify: `apps/web/src/layouts/papel-routes.ts` + `apps/web/src/layouts/__tests__/papel-routes.test.ts`

**Interfaces:**
- Produces: `/cronica` navegable con chrome papel, enlazada desde `/biblioteca`;
  `/una-ruta-para-argentina` redirige a `/la-idea` (decisión ya tomada en la spec 2.1
  para esta card — ver spec, «Por qué» / Decisión 8).

- [ ] **Step 1: Tests primero.** En `papel-routes.test.ts`: `esRutaPapel('/cronica')` →
  true · `esRutaPapel('/cronicas')` → false (no hay prefijo, es igualdad exacta) ·
  `esRutaPapel('/cronica/algo')` → false (a propósito: no hay hijos dinámicos — si
  alguien agrega uno después, este test lo obliga a decidirlo explícitamente). FAIL →
  agregar `/cronica` al Set de `PAPEL_ROUTES` (sin tocar `PAPEL_PREFIXES`) → PASS.
- [ ] **Step 2: Lazy + ruta.** En `app-pages.tsx`, agregar (alfabético, junto a las
  demás):

```tsx
export const Cronica = lazy(async () => {
  const m = await import('~/pages/Cronica');
  return { default: m.Cronica };
});
```

  En `app-routes.tsx`, sumar `Cronica` al import desde `~/app-pages` y agregar, en el
  bloque «Content + community» cerca de `/biblioteca`:

```tsx
<Route path="/cronica" component={Cronica} />
```

- [ ] **Step 3: Redirect de `/una-ruta-para-argentina` a `/la-idea` (D3).** Decisión ya
  tomada en la spec 2.1 para esta card («Decisión para la card 3.6») — acá se ejecuta,
  no se relitiga. En `app-routes.tsx`, reemplazar

```tsx
<Route path="/una-ruta-para-argentina" component={UnaRutaParaArgentina} />
```

  por, mismo patrón exacto que `/la-vision`/`/el-instante-del-hombre-gris` (2.1):

```tsx
<Route path="/una-ruta-para-argentina">
  <Redirect to="/la-idea" replace />
</Route>
```

  Sacar `UnaRutaParaArgentina` del import de `~/app-pages` en `app-routes.tsx` (queda sin
  uso ahí). **No tocar `app-pages.tsx`:** el `lazy(...)` de `UnaRutaParaArgentina` sigue
  exportado — el componente no se borra, solo pierde la ruta que lo sirve (spec, D3: sus
  otras tres secciones —`Phases`/`PlanesGrid`/`Roles`— no tienen destino de contenido
  decidido, eso sigue siendo Fase 7). No hace falta test nuevo para el redirect en sí —
  mismo criterio que 2.1, que tampoco escribió uno: se verifica a mano en el Step 6.

- [ ] **Step 4: Suite completa + verificación.**

Run: `pnpm -C apps/web exec vitest run` → PASS (nada de Home/LaIdea/ElMapa/
ElMandatoVivo/Planes/Sembrar/Manifiesto/Bitacora/Entrenamientos roto). `pnpm verify`
verde.

- [ ] **Step 5: Greps de control.**

```bash
# Chrome muerto en las páginas nuevas (debe dar cero):
grep -n "glass\|gradient-text\|iris-violet\|font-serif\|MdxContent" \
  apps/web/src/pages/Cronica.tsx apps/web/src/pages/Cronica/sections/*.tsx \
  apps/web/src/pages/Cronica/cronica-data.ts apps/web/src/pages/Biblioteca/sections/CronicaDestacada.tsx
# Cero hex literal en el TSX nuevo (§9b — debe dar cero):
grep -n "#[0-9A-Fa-f]\{6\}" apps/web/src/pages/Cronica.tsx \
  apps/web/src/pages/Cronica/sections/*.tsx apps/web/src/pages/Biblioteca/sections/CronicaDestacada.tsx
# Cero literales de conteo/año en el JSX nuevo (revisar a ojo lo que salga):
grep -n "\b5\b\|\b2026\b\|\b2027\b\|\b2029\b\|\b2034\b\|\b2040\b" \
  apps/web/src/pages/Cronica/sections/*.tsx
```

- [ ] **Step 6: Prueba en navegador (desktop + mobile, con capturas).**
  - (a) `/biblioteca`: el bloque nuevo aparece entre la vidriera de entrenamientos y la
    bitácora, con la etiqueta «Ficción especulativa» y el link a `/cronica`; hover
    levanta la card (`-translate-y-0.5`).
  - (b) `/cronica`: rito de la tinta en «La crónica del país que viene.»; kicker con la
    advertencia de ficción visible antes que nada más; lead con
    `{CAPITULO_COUNT} capítulos` (hoy «5 capítulos») y la frase keystone completa.
  - (c) **El sumario:** 5 filas con número, título y año; click en la fila 3 salta
    (scroll suave) a «Capítulo 3 de 5 · 2027 — 2029» sin recargar la página.
  - (d) **Los capítulos:** cada uno con su kicker propio (tinta, no violeta), H2, el
    epígrafe en itálica con borde violeta, y el cuerpo en prosa papel (Archivo
    17px/1.75) — comparar dos o tres párrafos contra el `.mdx` fuente para confirmar
    verbatim a ojo.
  - (e) **Firma única:** «— El hombre gris» aparece una sola vez, después del quinto
    capítulo, no repetida.
  - (f) Cierre oscuro «Esto es ficción. Lo que sigue, no.» → `/el-mapa`.
  - (g) **Deep link:** abrir `/cronica#capitulo-4` directo (URL pegada, sin pasar por
    `/biblioteca`) y confirmar que la página carga y salta sola al capítulo 4 —
    verifica que `useIrAlPrincipio` cubre el caso sin código nuevo.
  - (h) **Print preview (Cmd+P) — captura obligatoria:** sin header/footer/grano, TODO
    en serifa, folio `¡BASTA! · edición del lector · {fecha}` como primera línea,
    **título en tinta (no gris)** aun imprimiendo apenas carga, los 5 capítulos con su
    epígrafe y cuerpo presentes, sin backlink, sin sumario, sin card de cierre.
  - (i) Móvil 375px: 1 columna, sumario con grilla `44px_1fr_32px`, card del hub
    apilada, targets ≥ 44px.
  - (j) `prefers-reduced-motion`: página completa y quieta, título del lector
    entintado de entrada, salto de sumario sin scroll suave (instantáneo).
  - (k) **Redirect (D3):** navegar a `/una-ruta-para-argentina` — la URL termina en
    `/la-idea` (`replace`, sin entrada nueva en el historial: back no vuelve a
    `/una-ruta-para-argentina`), con chrome papel de `/la-idea` completo.
- [ ] **Step 7: Commit.**

```bash
git add apps/web/src/app-pages.tsx \
        apps/web/src/app-routes.tsx \
        apps/web/src/layouts/papel-routes.ts \
        apps/web/src/layouts/__tests__/papel-routes.test.ts
git commit -m "feat(web): la crónica del país que viene en /cronica — ruta, PAPEL_ROUTES, redirect de /una-ruta-para-argentina y verificación"
```

---

## Self-review

- **Cobertura de la spec:** derivadas mínimas con test de canon del registry (Task 1) ·
  sumario + documento verbatim + cierre, con el ramal defensivo de `CAPITULO_COUNT === 0`
  y la única enmienda de ley (Task 2) · el bloque del hub reusando el recipe de
  `ManifiestoDestacado` con la frase keystone repetida (Task 3) · ruta estática,
  `PAPEL_ROUTES` por igualdad exacta, el redirect de `/una-ruta-para-argentina` a
  `/la-idea` (D3 — decisión de la spec 2.1, ejecutada acá, no relitigada), greps y
  navegador con deep-link, print preview y el redirect (Task 4).
- **Cero datos inventados:** ningún literal de conteo o de año en JSX; los tests
  comparan contra `CRONICA_CHAPTERS`/`CAPITULO_COUNT`, nunca contra strings de
  contenido. La única prosa fija y sin interpolación es la frase keystone de D2 — y está
  citada carácter por carácter en la spec y en este plan, dos veces, siempre igual.
- **Cero re-derivación:** `MdxPapel`, `Kicker`, `RitoTinta`, `BotonPapel` son de 2.4/1.1;
  `.edicion-impresa` y el `print:hidden` del chrome ya viven en `index.css`/chrome desde
  2.4 — ninguno de esos archivos aparece en un `git add` de este plan. El recipe de la
  card del hub es el mismo de `ManifiestoDestacado`, sin una sola clase nueva. Cero
  primitivas nuevas, cero dependencias, cero CSS.
- **Consistencia de tipos:** `CronicaChapter` viene solo de `~/lib/cronica-registry`;
  `cronica-data.ts` no exporta ningún tipo nuevo, solo funciones puras sobre ese tipo —
  no hay reexportación cruzada con `biblioteca-data.ts` (a diferencia de
  `EnsayoDetail` → `Biblioteca/biblioteca-data`, acá no hace falta: no hay vecinos entre
  rutas).
- **Riesgos señalados:** (1) si `DocumentoCronica.tsx` se acerca a 300 LOC al escribir
  el JSX real (los esqueletos de este plan son ~90 líneas, hay margen), extraer
  `CapituloCronica.tsx` — mismo criterio que 2.4/3.1, señalado en Task 2; (2) el
  fragmento de body verbatim que testea Task 2 debe cortarse ANTES de cualquier `**` o
  salto de párrafo para no comparar contra markdown crudo — el test corta en el primer
  `\n\n`; (3) `print:[&_span]:animate-none` debe ganarle a `.anim-inkfill` (utilities >
  components) — mismo fallback ya documentado en 3.2/3.3/3.4 si la captura de print
  preview saliera gris; (4) las tres copias de `fechaLarga` (manifiesto, biblioteca,
  crónica) son deuda de bundle-size aceptada a propósito — no consolidar sin medir
  primero el costo real del chunk compartido.
- **Ley:** una sola enmienda (§8, la novela entra al mapa de páginas y se aclara la
  colisión con «crónica» de bitácora) en el mismo commit que la página que la necesita
  (Task 2). El catálogo de sellos §10.5 **no** se enmienda: la crónica no estampa nada
  al terminar de leerse (spec, Decisión 2).
- **Deuda observada, fuera de alcance:** (a) el *contenido* de `/una-ruta-para-argentina`
  que la ruta ya no sirve — las 5 fases (`Phases.tsx`), la grilla de planes/roles que
  duplica `/planes`/`/la-idea` (`PlanesGrid.tsx`/`Roles.tsx`) y la card de compromiso
  final («¿Y vos?», `Compromiso.tsx`, CTA a `/registrarse` y `/manifiesto`) — no tiene
  todavía destino en ninguna página papel; queda
  para la Fase 7 (spec, «D3: el redirect... esta página lo ejecuta»). La ruta en sí ya no
  es deuda: redirige a `/la-idea` desde este mismo plan (Task 4), decisión que ya venía
  tomada en la spec 2.1; (b) la receta de tag §5 se repite inline una tercera vez en
  `CronicaDestacada` (después de `ManifiestoDestacado` y `BitacoraReciente`) — si algún
  bloque futuro la necesita una cuarta vez, ahí se extrae `Etiqueta` con prop de
  superficie (deuda ya anotada en el self-review de la biblioteca, no se repite la
  extracción acá para no violar «una conversación = una página»).
