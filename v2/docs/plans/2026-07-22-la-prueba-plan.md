# La prueba (página 2.4) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir `/planes` en Papel y Tinta — índice de expediente con filas expandibles +/−, callout «No es doctrina» y cards de método — y `/planes/:slug` como lector papel-sobre-oscuro con sello EJEMPLO y la **primera edición impresa del sistema** (§10.8), matando el chrome glass de ambas páginas v1-port.

**Architecture:** Cero backend — el contenido es `PLAN_REGISTRY` (build-time, `content/planes/*.mdx`). Una primitiva nueva (`FilaIndiceExpandible`, la variante que §5 dejó apuntada a esta spec) + un renderer compartido (`MdxPapel`, la prosa papel que la Fase 3 reusa) + composer `pages/Planes.tsx` con secciones en `pages/Planes/sections/` (patrón LaIdea) + reescritura in-place de `PlanDetail.tsx`. El patrón de impresión se implementa una vez y para siempre: `print:hidden` en el chrome + bloque `@media print` canónico en `index.css`.

**Tech Stack:** React 18 + wouter + Tailwind (tokens papel §9b) + Vitest/Testing Library. Sin dependencias nuevas, sin API, sin migraciones.

**Spec:** `docs/specs/2026-07-22-la-prueba-papel-y-tinta.md` — **todo el copy sale de ahí, carácter por carácter.**

## Global Constraints

- `v2/CLAUDE.md` completo: sin `any`, sin `console.*`, archivos ≤ 300 LOC, `pnpm verify` verde antes de cada commit, Conventional Commits con scope.
- `docs/design-system/README.md` v1.1 es ley. §9b: PROHIBIDO el hex literal en TSX — solo tokens. Enmienda de ley en el mismo commit que el código que la necesita (este plan hace UNA: la receta de la variante expandible en §5 — Task 1).
- **Hallazgo de contenido (verificado 2026-07-22):** el frontmatter de `content/planes/*.mdx` NO tiene campo de categoría — sin chips, sin búsqueda, sin taxonomía inventada (spec, Decisiones 1–2). Todo conteo sale de `PLAN_REGISTRY`; cero literales «22» en JSX.
- **Keystone-adjacent:** los cuerpos MDX de los planes se renderizan **verbatim** — ni una palabra se reescribe, trunca o reordena. El título visible del documento es el `# H1` del propio MDX.
- Una conversación = una página: NO tocar `Home/*` (salvo el sweep sancionado de Task 5), `LaIdea/*`, `ElMapa/*`, `ElMandatoVivo/*`, `papel-nav.ts` (ya apunta a `/planes`), ni `App.tsx` (rutas y lazy existen; ambas páginas conservan named + default export). Excepciones sancionadas: `components/papel/primitives/` (primitiva nueva, Task 1) · `PapelHeader/PapelFooter/PaperGrain/DespertarVeil` (solo `print:hidden`, Task 3) · `index.css` (bloque print canónico, Task 3) · `layouts/papel-routes.ts` (Task 5) · `Home/sections/VocesTicker.tsx` (sweep TIPOS_VOZ, Task 5).
- **Estado interino aceptado:** entre Task 2 y Task 5, `/planes` ya es papel pero conserva el chrome v1 (el flip de `PAPEL_ROUTES` llega al final, con las dos páginas listas — mismo orden que 2.3).

---

### Task 1: `FilaIndiceExpandible` — la primitiva +/− + enmienda §5

**Files:**
- Create: `apps/web/src/components/papel/primitives/FilaIndiceExpandible.tsx`
- Modify: `apps/web/src/components/papel/primitives/index.ts` (export)
- Modify: `apps/web/src/components/papel/primitives/primitives.test.tsx` (casos nuevos)
- Modify: `docs/design-system/README.md` (§5 — enmienda de ley, mismo commit)

**Interfaces:**
- Produces: `<FilaIndiceExpandible num encabezado abierta onToggle idPanel>{panel}</FilaIndiceExpandible>` — botón de ancho completo con `aria-expanded`/`aria-controls`, glifo `+/−` `aria-hidden`, panel `anim-fadeup` sangrado a la columna del título, borde inferior en el contenedor. La consumen las secciones del catálogo (Task 2). `FilaIndice` (link, `→`) queda intacta.

- [ ] **Step 1: Tests (fallan primero).** En `primitives.test.tsx`, describe `FilaIndiceExpandible`:
  - cerrada: renderiza `<button>` con `aria-expanded="false"` y `aria-controls="panel-plansal"`; glifo `+` presente; el contenido del panel NO está en el DOM.
  - abierta (`abierta` true): `aria-expanded="true"`, glifo `−` con clase `text-violeta`, panel con `id="panel-plansal"` y clase `anim-fadeup`, children visibles.
  - interacción: click en el botón llama `onToggle` una vez.
  - el glifo está `aria-hidden` (el estado lo anuncia `aria-expanded`).

Run: `pnpm -C apps/web exec vitest run src/components/papel/primitives`
Esperado: FAIL — componente inexistente.

- [ ] **Step 2: Implementar `FilaIndiceExpandible.tsx`:**

```tsx
import type { ReactNode } from 'react';

import { cn } from '~/lib/utils';

export interface FilaIndiceExpandibleProps {
  /** Numeración de expediente («01», «00» para el meta). */
  num: string;
  /** Columna del título — el llamador compone código/nombre adentro. */
  encabezado: ReactNode;
  abierta: boolean;
  onToggle: () => void;
  /** id del panel, cableado a aria-controls. */
  idPanel: string;
  className?: string;
  /** Contenido del pliegue (tesis + «Leer el documento →»). */
  children: ReactNode;
}

/**
 * Fila de índice §5, variante expandible +/− (spec 2.4 — la que la ley
 * dejó apuntada). La fila es un botón real de ancho completo; el glifo
 * final alterna + (cerrada, tinta-50) / − (abierta, violeta); el panel
 * entra con fadeup sangrado a la columna del título. El borde inferior
 * vive en el contenedor: fila y panel comparten la junta.
 */
export function FilaIndiceExpandible({
  num,
  encabezado,
  abierta,
  onToggle,
  idPanel,
  className,
  children,
}: FilaIndiceExpandibleProps) {
  return (
    <div className={cn('border-papel-borde border-b', className)}>
      <button
        type="button"
        aria-expanded={abierta}
        aria-controls={idPanel}
        onClick={onToggle}
        className="hover:bg-papel-presionado grid w-full grid-cols-[56px_1fr_40px] items-baseline gap-5 px-2 py-4 text-left text-tinta transition-colors duration-150 max-[560px]:grid-cols-[44px_1fr_32px]"
      >
        <span className="font-space text-tinta-30 text-sm">{num}</span>
        <span className="min-w-0">{encabezado}</span>
        <span
          aria-hidden
          className={cn('font-space justify-self-end text-lg', abierta ? 'text-violeta' : 'text-tinta-50')}
        >
          {abierta ? '−' : '+'}
        </span>
      </button>
      {abierta ? (
        <div id={idPanel} className="anim-fadeup px-2 pb-6 pl-[76px] max-[560px]:pl-2">
          {children}
        </div>
      ) : null}
    </div>
  );
}
```

Exportar en `index.ts`: `export { FilaIndiceExpandible, type FilaIndiceExpandibleProps } from './FilaIndiceExpandible';`

- [ ] **Step 3: Enmienda de ley (mismo commit).** En `docs/design-system/README.md` §5, fila de índice: reemplazar `(flecha → por defecto; +/− es la variante expandible, spec en fase 2.4)` por el texto exacto de la spec («Enmiendas a la ley», punto 1).
- [ ] **Step 4: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/components/papel/primitives` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/components/papel/primitives/FilaIndiceExpandible.tsx \
        apps/web/src/components/papel/primitives/index.ts \
        apps/web/src/components/papel/primitives/primitives.test.tsx \
        docs/design-system/README.md
git commit -m "feat(web): FilaIndiceExpandible — la variante +/- de la fila de índice (§5)"
```

---

### Task 2: Catálogo — data + secciones + composer `Planes.tsx`

**Files:**
- Create: `apps/web/src/pages/Planes/la-prueba-data.ts`
- Create: `apps/web/src/pages/Planes/sections/PortadaPrueba.tsx` (kicker + H1 rito + lead + callout)
- Create: `apps/web/src/pages/Planes/sections/IndicePlanes.tsx` (índice de los {N} + plan meta — el estado del acordeón vive acá)
- Create: `apps/web/src/pages/Planes/sections/MetodoPrueba.tsx` (banda papel-crudo 3-up + CTA final)
- Rewrite: `apps/web/src/pages/Planes.tsx` (composer fino; named + default export intactos)
- Test: `apps/web/src/pages/Planes/__tests__/IndicePlanes.test.tsx`
- Test: `apps/web/src/pages/__tests__/Planes.test.tsx`

**Interfaces:**
- Consumes: `PLAN_REGISTRY` (`~/lib/plans-registry`) · `FilaIndiceExpandible`, `RitoTinta`, `Kicker`, `Sello`, `BotonPapel` · `Link` de wouter.
- Produces: `PLANES` / `PLAN_META` / `PLAN_COUNT` / `numeroDeExpediente()` / `expedienteDe()` en `la-prueba-data.ts` (los consume también `PlanDetail`, Task 4) · las tres secciones sin props · composer `Planes()`.

- [ ] **Step 1: Tests (fallan primero).**

`IndicePlanes.test.tsx` (render directo de la sección):
  - **Canon del registry:** `PLAN_REGISTRY.filter(p => p.isMeta)` tiene exactamente 1 elemento (PLANRUTA) y `PLAN_REGISTRY.filter(p => !p.isMeta)` exactamente 22 — el test de canon del contenido vive acá.
  - Renderiza 23 botones de fila (`getAllByRole('button', { expanded: false })`); la primera fila numerada es `01` + código del plan con `orderIndex` 1 (`PLANSAL`); la fila del meta es `00` + `PLANRUTA` bajo el encabezado `El plan meta · fuera de la cuenta`.
  - **Apertura única:** click en la fila `PLANSAL` → aparece su `summary` (texto real del frontmatter) y el link `Leer el documento →` con `href="/planes/plansal"`; click en la fila `PLANEDU` → el summary de PLANSAL desaparece, el de PLANEDU aparece (un solo `aria-expanded="true"` en todo el índice).
  - Click en una fila abierta la cierra (cero `aria-expanded="true"`).
  - Ningún literal «22» suelto: el encabezado del índice interpola — assert `Los ${PLAN_COUNT} planes · tocá para abrir` usando la constante importada.

`Planes.test.tsx` (composer, smoke):
  - heading nivel 1 con aria-label `Esto lo escribió uno solo.`; kicker `La prueba · ${PLAN_COUNT} planes · un solo autor`.
  - callout: texto `Nada de esto se firma ni se obedece` y link `voces del mapa` → `/el-mapa`.
  - método: los tres títulos (`¿Falta un plan?`, `Método Ackoff`, `Hechos para ser superados`) y el CTA `Soltá tu urgencia en el mapa →` → `/el-mapa`.
  - **ausencia** del v1: `queryByText(/Cada PLAN es un sistema diseñado/)` null; sin `glass` ni `gradient-text` en el HTML (`container.innerHTML`).

Run: `pnpm -C apps/web exec vitest run src/pages/Planes src/pages/__tests__/Planes.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar `la-prueba-data.ts`:**

```ts
import { PLAN_REGISTRY } from '~/lib/plans-registry';

/**
 * La prueba (spec 2.4) — todo conteo visible sale del registry MDX.
 * Jamás un «22» literal en JSX: si el contenido cambia, la página cambia.
 */
export const PLANES = PLAN_REGISTRY.filter((p) => !p.isMeta);
export const PLAN_META = PLAN_REGISTRY.find((p) => p.isMeta);
export const PLAN_COUNT = PLANES.length;

/** Numeración de expediente: «01»…«{N}» (el registry ya viene por orderIndex). */
export function numeroDeExpediente(indice: number): string {
  return String(indice + 1).padStart(2, '0');
}

/** Número de expediente de un slug («00» para el meta, null si no existe). */
export function expedienteDe(slug: string): string | null {
  if (PLAN_META && PLAN_META.slug === slug) return '00';
  const i = PLANES.findIndex((p) => p.slug === slug);
  return i === -1 ? null : numeroDeExpediente(i);
}
```

- [ ] **Step 3: Implementar `IndicePlanes.tsx`** (esqueleto — copy verbatim de la spec §2–§3):

```tsx
import { useState } from 'react';
import { Link } from 'wouter';

import { PLAN_COUNT, PLAN_META, PLANES, numeroDeExpediente } from '../la-prueba-data';

import type { PlanRegistryEntry } from '~/lib/plans-registry';

import { FilaIndiceExpandible } from '~/components/papel/primitives';

/** §2 + §3 de la spec — el índice de los {N} + el plan meta. Apertura única. */
export function IndicePlanes() {
  const [abierto, setAbierto] = useState<string | null>(null);

  const fila = (plan: PlanRegistryEntry, num: string) => (
    <FilaIndiceExpandible
      key={plan.slug}
      num={num}
      idPanel={`panel-${plan.slug}`}
      abierta={abierto === plan.slug}
      onToggle={() => setAbierto(abierto === plan.slug ? null : plan.slug)}
      encabezado={
        <span className="flex flex-wrap items-baseline gap-x-5 gap-y-1">
          <span
            className={`font-anton text-2xl tracking-[0.01em] ${abierto === plan.slug ? 'text-violeta' : 'text-tinta'}`}
          >
            {plan.code}
          </span>
          <span className="text-tinta-75 text-[15px] leading-snug">{plan.title}</span>
        </span>
      }
    >
      {plan.summary ? (
        <p className="text-tinta-90 mb-3 max-w-[720px] text-base leading-relaxed [text-wrap:pretty]">
          {plan.summary}
        </p>
      ) : null}
      <Link
        href={`/planes/${plan.slug}`}
        className="font-space text-violeta text-xs font-bold uppercase tracking-[0.1em]"
      >
        Leer el documento →
      </Link>
    </FilaIndiceExpandible>
  );

  return (
    <section className="mx-auto max-w-[1440px] px-10 pb-[72px] max-[560px]:px-5">
      <h2 className="font-space text-tinta-50 mb-5 text-[11px] uppercase tracking-[0.16em]">
        Los {PLAN_COUNT} planes · tocá para abrir
      </h2>
      <div className="border-tinta border-t">
        {PLANES.map((plan, i) => fila(plan, numeroDeExpediente(i)))}
      </div>

      {PLAN_META ? (
        <>
          <h2 className="font-space text-tinta-50 mb-5 mt-14 text-[11px] uppercase tracking-[0.16em]">
            El plan meta · fuera de la cuenta
          </h2>
          <div className="border-tinta border-t">{fila(PLAN_META, '00')}</div>
          <p className="font-space text-tinta-30 mt-3 text-[10px] uppercase tracking-[0.12em]">
            PLANRUTA no es un plan más: es el manual de cómo arrancar los otros {PLAN_COUNT}.
          </p>
        </>
      ) : null}
    </section>
  );
}
```

- [ ] **Step 4: Implementar `PortadaPrueba.tsx` y `MetodoPrueba.tsx`** — composición directa del copy de la spec (§1, §4, §5): portada con `Kicker`, H1 `<h1 aria-label="Esto lo escribió uno solo.">` + `RitoTinta lineas={['Esto lo escribió', 'uno solo.']}`, lead, callout (borde `border-2 border-sello`, `Sello color="rojo"` con `No es doctrina`, prosa con link a `/el-mapa`); método = grilla de 3 sobre `bg-papel-crudo` + CTA `BotonPapel variant="violeta"` (envuelto en `Link` a `/el-mapa`). Todo `{N}` interpola `PLAN_COUNT`.
- [ ] **Step 5: Reescribir `Planes.tsx`** como composer fino (patrón LaIdea):

```tsx
import { IndicePlanes } from './Planes/sections/IndicePlanes';
import { MetodoPrueba } from './Planes/sections/MetodoPrueba';
import { PortadaPrueba } from './Planes/sections/PortadaPrueba';

/**
 * La prueba — página 2.4 «Papel y Tinta»
 * (docs/specs/2026-07-22-la-prueba-papel-y-tinta.md). Índice de expediente
 * de los planes + el plan meta. El chrome papel lo pone RootLayout.
 */
export function Planes() {
  return (
    <main>
      <PortadaPrueba />
      <IndicePlanes />
      <MetodoPrueba />
    </main>
  );
}

export default Planes;
```

- [ ] **Step 6: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/Planes src/pages/__tests__/Planes.test.tsx` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/Planes.tsx \
        apps/web/src/pages/Planes/la-prueba-data.ts \
        apps/web/src/pages/Planes/sections/PortadaPrueba.tsx \
        apps/web/src/pages/Planes/sections/IndicePlanes.tsx \
        apps/web/src/pages/Planes/sections/MetodoPrueba.tsx \
        apps/web/src/pages/Planes/__tests__/IndicePlanes.test.tsx \
        apps/web/src/pages/__tests__/Planes.test.tsx
git commit -m "feat(web): La prueba — índice de expediente con pliegues, callout y método"
```

---

### Task 3: `MdxPapel` + el patrón de impresión (§10.8, primera implementación)

**Files:**
- Create: `apps/web/src/components/papel/MdxPapel.tsx`
- Modify: `apps/web/src/index.css` (bloque `@media print` canónico `.edicion-impresa`)
- Modify: `apps/web/src/components/papel/PapelHeader.tsx`, `PapelFooter.tsx`, `PaperGrain.tsx`, `DespertarVeil.tsx` (SOLO agregar `print:hidden` a la clase raíz — excepción sancionada, cero cambios de pantalla)
- Test: `apps/web/src/components/papel/__tests__/MdxPapel.test.tsx`

**Interfaces:**
- Consumes: `renderMarkdown()` de `~/lib/markdown` (existente).
- Produces: `<MdxPapel raw className?>` — prosa papel compartida (la reusan los lectores de Fase 3) · clase global `.edicion-impresa` (serifa + sin sombra, SOLO en print) · chrome que no se imprime. `MdxContent` (v1) queda intacto.

- [ ] **Step 1: Tests (fallan primero).** `MdxPapel.test.tsx`:
  - `raw` con `# Título`, `## Sección`, un párrafo, un link y `**bold**` → el HTML contiene `<h1>`/`<h2>`/`<a>`/`<strong>`; el contenedor lleva `prose` y `prose-headings:font-anton`; NO contiene `prose-invert` ni `font-serif` ni `iris-violet`.
  - frontmatter en `raw` se descarta (comportamiento de `renderMarkdown`, asegurado por regresión: el texto `slug:` no aparece).
  - chrome: `PapelHeader`, `PapelFooter`, `PaperGrain` y `DespertarVeil` renderizan su raíz con clase `print:hidden` (casos nuevos donde ya se testean, o asserts acá si no tienen test propio).

Run: `pnpm -C apps/web exec vitest run src/components/papel`
Esperado: FAIL.

- [ ] **Step 2: Implementar `MdxPapel.tsx`:**

```tsx
import { useMemo } from 'react';

import { renderMarkdown } from '~/lib/markdown';
import { cn } from '~/lib/utils';

interface MdxPapelProps {
  raw: string;
  className?: string;
}

/**
 * Cuerpo MDX en prosa papel (spec 2.4; la reusan los lectores de Fase 3).
 * Render verbatim vía marked. Tipografía del sistema: Anton para los
 * títulos del documento, Archivo para el cuerpo, violeta solo en links.
 * Sin serifa en pantalla — la serifa es exclusiva de la edición impresa
 * (`.edicion-impresa`, index.css).
 */
export function MdxPapel({ raw, className }: MdxPapelProps) {
  const html = useMemo(() => renderMarkdown(raw), [raw]);
  return (
    <div
      className={cn(
        'prose max-w-none',
        'prose-headings:font-anton prose-headings:font-normal prose-headings:text-tinta',
        'prose-h1:text-[clamp(30px,4.4vw,52px)] prose-h1:leading-none prose-h1:mb-6',
        'prose-h2:text-[26px] prose-h2:mt-12 prose-h2:mb-4 prose-h2:leading-tight',
        'prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3',
        'prose-p:font-archivo prose-p:text-[17px] prose-p:leading-[1.75] prose-p:text-tinta-90 prose-p:[text-wrap:pretty]',
        'prose-li:text-tinta-90 prose-li:text-[17px] prose-strong:text-tinta',
        'prose-a:text-violeta prose-a:underline prose-a:decoration-1 hover:prose-a:text-violeta-hover',
        'prose-blockquote:border-l-2 prose-blockquote:border-tinta prose-blockquote:font-normal prose-blockquote:text-tinta-75',
        'prose-hr:border-papel-borde',
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
```

- [ ] **Step 3: `index.css`** — bloque canónico al final (junto a la guarda reduced-motion; hex permitido acá, es la pista global):

```css
/* Edición impresa §10.8 — la serifa del sistema existe SOLO acá (D1).
   Primera implementación: el lector de planes (spec 2.4). Cada lector
   aplica .edicion-impresa a su documento y define su folio. */
@media print {
  .edicion-impresa,
  .edicion-impresa * {
    font-family: Georgia, 'Times New Roman', serif !important;
  }
  .edicion-impresa {
    box-shadow: none !important;
  }
}
```

- [ ] **Step 4: `print:hidden` en el chrome.** Agregar la clase al elemento raíz de `PapelHeader` (el `<header>`), `PapelFooter` (el `<footer>`), `PaperGrain` y `DespertarVeil` (sus `div` fijos). Nada más se toca en esos archivos.
- [ ] **Step 5: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/components/papel` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/components/papel/MdxPapel.tsx \
        apps/web/src/components/papel/__tests__/MdxPapel.test.tsx \
        apps/web/src/index.css \
        apps/web/src/components/papel/PapelHeader.tsx \
        apps/web/src/components/papel/PapelFooter.tsx \
        apps/web/src/components/papel/PaperGrain.tsx \
        apps/web/src/components/papel/DespertarVeil.tsx
git commit -m "feat(web): MdxPapel + patrón de edición impresa §10.8 — el chrome no se imprime"
```

---

### Task 4: `PlanDetail` — el expediente que se abre (lector + EJEMPLO + edición impresa + 404)

**Files:**
- Rewrite: `apps/web/src/pages/PlanDetail.tsx` (misma ruta `/planes/:slug`; named + default export intactos)
- Test: `apps/web/src/pages/__tests__/PlanDetail.test.tsx`

**Interfaces:**
- Consumes: `findPlanBySlug` (`~/lib/plans-registry`) · `PLAN_COUNT`, `expedienteDe` (`~/pages/Planes/la-prueba-data`) · `MdxPapel` · `Kicker`, `Sello`, `BotonPapel` · `Link` de wouter · `.edicion-impresa`.
- Produces: el lector papel-sobre-oscuro con edición impresa; el chrome glass del archivo muere.

- [ ] **Step 1: Tests (fallan primero).** `PlanDetail.test.tsx` (render con `wouter` `memoryLocation` en `/planes/plansal`, `/planes/planruta`, `/planes/no-existe`):
  - **Expediente:** para `plansal` — sello `Ejemplo` presente; línea `Esto lo escribió uno solo. Leelo para criticarlo, mejorarlo o reemplazarlo.`; cabecera con `PLANSAL · prueba, no doctrina` y `expediente 01/${PLAN_COUNT}`; el `# H1` del MDX renderizado como heading (`PLANSAL — Salud digna y soberana`, el H1 real del cuerpo, vía `getByRole('heading')`); el `title` del frontmatter NO duplicado encima del cuerpo; backlink `← Volver a la prueba` → `/planes`; pie con `¿Lo podés mejorar? Esa es la idea.` + link a `/el-mapa` + firma `— El hombre gris`.
  - **Meta:** para `planruta` — kicker `La prueba · el plan meta`; cabecera derecha `el plan meta` (sin `{num}/{N}`).
  - **Edición impresa:** el `<article>` lleva las clases `edicion-impresa` y `print:shadow-none`; el folio `¡BASTA! · edición del lector ·` está en el DOM con clases `hidden print:block`; la barra superior y el pie de conversión llevan `print:hidden`; el sello EJEMPLO NO lleva `print:hidden` (se imprime).
  - **404:** para `no-existe` — kicker `expediente extraviado`, heading `Ese plan no está.`, sello `Extraviado`, CTA `Volver a la prueba →` → `/planes`.
  - **Chrome muerto:** `container.innerHTML` sin `glass`, `gradient-text`, `iris-violet`, `font-serif`.

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/PlanDetail.test.tsx`
Esperado: FAIL.

- [ ] **Step 2: Implementar `PlanDetail.tsx`** (esqueleto — copy verbatim de la spec «El lector»):

```tsx
import { Link, useRoute } from 'wouter';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { BotonPapel, Kicker, Sello } from '~/components/papel/primitives';
import { findPlanBySlug } from '~/lib/plans-registry';
import { expedienteDe, PLAN_COUNT } from '~/pages/Planes/la-prueba-data';

/** 404 §5: el expediente extraviado, en el mismo marco oscuro. */
function ExpedienteExtraviado() {
  return (
    <main className="bg-tinta py-24">
      <div className="bg-papel text-tinta mx-auto max-w-md p-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <Kicker className="mb-4">expediente extraviado</Kicker>
        <h1 className="font-anton mb-6 text-4xl leading-none">Ese plan no está.</h1>
        <div className="mb-8"><Sello color="rojo">Extraviado</Sello></div>
        <Link href="/planes"><BotonPapel variant="tinta">Volver a la prueba →</BotonPapel></Link>
      </div>
    </main>
  );
}

/**
 * La prueba — lector de plan (spec 2.4): expediente papel-sobre-oscuro
 * con sello EJEMPLO permanente y la primera edición impresa del sistema.
 * El cuerpo MDX se renderiza VERBATIM; su # H1 es el título del documento.
 */
export function PlanDetail() {
  const [match, params] = useRoute<{ slug: string }>('/planes/:slug');
  if (!match) return null;
  const plan = findPlanBySlug(params.slug);
  if (!plan) return <ExpedienteExtraviado />;

  const num = expedienteDe(plan.slug);
  const expediente = plan.isMeta ? 'el plan meta' : `expediente ${num ?? '—'}/${String(PLAN_COUNT)}`;
  const fecha = new Date().toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <main className="bg-tinta print:bg-transparent">
      <div className="mx-auto max-w-[860px] px-10 py-16 max-[560px]:px-5 print:p-0">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4 print:hidden">
          <Kicker>La prueba · {expediente}</Kicker>
          <Link href="/planes" className="font-space text-oscuro-meta text-xs uppercase tracking-[0.1em]">
            ← Volver a la prueba
          </Link>
        </div>

        <article className="edicion-impresa bg-papel text-tinta relative px-14 py-[52px] shadow-[0_24px_60px_rgba(0,0,0,0.45)] max-[560px]:p-6 print:p-0 print:shadow-none">
          <p className="font-space hidden text-[10px] uppercase tracking-[0.12em] print:block">
            ¡BASTA! · edición del lector · {fecha}
          </p>
          <div className="absolute right-8 top-7 max-[560px]:static max-[560px]:mb-4">
            <Sello color="rojo" rotate={6}>Ejemplo</Sello>
          </div>
          <div className="font-space text-tinta-50 border-papel-borde mb-2 flex flex-wrap justify-between gap-2 border-b pb-3 text-[11px] uppercase tracking-[0.12em]">
            <span>{plan.code} · prueba, no doctrina</span>
            <span>{expediente}</span>
          </div>
          <p className="font-space text-tinta-50 mb-8 text-[11px] tracking-[0.04em]">
            Esto lo escribió uno solo. Leelo para criticarlo, mejorarlo o reemplazarlo.
          </p>

          <MdxPapel raw={plan.body} />

          <footer className="border-papel-borde mt-12 border-t pt-6">
            <p className="font-space text-tinta-50 text-[13px] print:hidden">
              ¿Lo podés mejorar? Esa es la idea.{' '}
              <Link href="/el-mapa" className="text-violeta font-bold uppercase tracking-[0.08em]">
                Soltá tu voz en el mapa →
              </Link>
            </p>
            <p className="font-space text-tinta-30 mt-4 text-right text-xs">— El hombre gris</p>
          </footer>
        </article>
      </div>
    </main>
  );
}

export default PlanDetail;
```

(Ajustes permitidos al implementar: el envoltorio exacto de `BotonPapel` dentro de `Link` según la firma real de la primitiva — mirar cómo lo hace el CTA de El mandato; la kicker sobre fondo oscuro usa el color que el catálogo de `Kicker` tenga para oscuro — si `violeta` no pasa AA sobre tinta, usar la clase `text-violeta-claro` vía `className` como hace 2.3.)

- [ ] **Step 3: PASS + verificación + commit.**

Run: `pnpm -C apps/web exec vitest run src/pages/__tests__/PlanDetail.test.tsx` → PASS. `pnpm verify` verde.

```bash
git add apps/web/src/pages/PlanDetail.tsx \
        apps/web/src/pages/__tests__/PlanDetail.test.tsx
git commit -m "feat(web): lector de plan — expediente papel con sello EJEMPLO y edición impresa"
```

---

### Task 5: `PAPEL_ROUTES` + sweep + prueba en navegador (incluye print preview)

**Files:**
- Modify: `apps/web/src/layouts/papel-routes.ts` (`/planes` al Set, `/planes/` a `PAPEL_PREFIXES`)
- Modify: `apps/web/src/layouts/__tests__/papel-routes.test.ts` (casos nuevos)
- Modify: `apps/web/src/pages/Home/sections/VocesTicker.tsx` (**sweep sancionado:** borrar el `const TIPOS_VOZ` local — el tercer duplicado — e importar `TIPOS_VOZ` de `~/lib/tipos-voz`; comportamiento idéntico, los tests de Home existentes lo cubren)

**Interfaces:**
- Produces: `/planes` y `/planes/:slug` con chrome papel; el sitio queda sin duplicados de `TIPOS_VOZ`.

- [ ] **Step 1: Tests primero.** En `papel-routes.test.ts`: `esRutaPapel('/planes')` → true · `esRutaPapel('/planes/plansal')` → true · `esRutaPapel('/planesque')` → false (el prefijo lleva barra). FAIL → implementar → PASS.
- [ ] **Step 2: Sweep `VocesTicker`.** Reemplazar la constante local por el import; `pnpm -C apps/web exec vitest run src/pages/Home` verde. Grep de control (debe dar UNA sola definición, la de `lib/tipos-voz.ts`):

```bash
grep -rn "TIPOS_VOZ: readonly TipoVoz" apps/web/src
```

- [ ] **Step 3: Grep de muerte del chrome viejo (debe dar cero):**

```bash
grep -n "glass\|gradient-text\|iris-violet\|font-serif\|MdxContent\|components/ui/button" \
  apps/web/src/pages/Planes.tsx apps/web/src/pages/PlanDetail.tsx \
  apps/web/src/pages/Planes/la-prueba-data.ts apps/web/src/pages/Planes/sections/*.tsx
```

- [ ] **Step 4: Suite completa + verificación.**

Run: `pnpm -C apps/web exec vitest run` → PASS (nada de Home/LaIdea/ElMapa/ElMandatoVivo roto). `pnpm verify` verde.

- [ ] **Step 5: Prueba en navegador (desktop + mobile, con capturas).** Levantar la web. Verificar:
  - (a) `/planes` con chrome papel: rito de la tinta en el H1, callout rojo, índice con los 22 + PLANRUTA `00` aparte; el kicker dice `22 planes` (derivado, no literal).
  - (b) **El pliegue** (interacción firma): abrir `PLANSAL` — glifo a `−`, código a violeta, panel con fadeup; abrir `PLANEDU` cierra el anterior; `Leer el documento →` navega.
  - (c) `/planes/plansal`: expediente oscuro + papel, **sello EJEMPLO cae** (stampin), cuerpo MDX con títulos Anton, pie con conversión y firma.
  - (d) **Print preview (Cmd+P)** — captura obligatoria: sin header/footer/grano, fondo claro, TODO en serifa, folio `¡BASTA! · edición del lector · {fecha}` arriba, sello EJEMPLO impreso, sin backlink ni CTA. Es la primera edición impresa del sistema: mirarla con cariño.
  - (e) `/planes/planruta`: kicker `el plan meta`; `/planes/no-existe`: 404 expediente EXTRAVIADO.
  - (f) Móvil 375px: 1 columna, código + título visibles en la fila (el título NO desaparece), targets ≥ 44px, sello del lector no tapa el texto.
  - (g) `prefers-reduced-motion`: índice completo y quieto, pliegue sin animación, sello puesto sin caer.
- [ ] **Step 6: Commit.**

```bash
git add apps/web/src/layouts/papel-routes.ts \
        apps/web/src/layouts/__tests__/papel-routes.test.ts \
        apps/web/src/pages/Home/sections/VocesTicker.tsx
git commit -m "feat(web): La prueba papel en /planes — rutas, sweep TIPOS_VOZ y verificación"
```

---

## Self-review

- **Cobertura de la spec:** primitiva expandible + enmienda §5 (T1) · catálogo con canon 22+1, pliegues de apertura única, callout, meta `00`, método y CTA (T2) · prosa papel compartida + patrón print §10.8 completo — chrome, serifa canónica, folio (T3) · lector con EJEMPLO permanente, MDX verbatim, 404 expediente y edición impresa testeada (T4) · rutas por prefijo, sweep `TIPOS_VOZ`, greps y navegador con print preview (T5).
- **Cero datos inventados:** sin chips (no hay taxonomía real — hallazgo documentado en la spec), sin búsqueda, sin literales de conteo; el test de canon fija 22 + 1 meta y rompe si el contenido cambia sin avisar.
- **Consistencia de tipos:** `PlanRegistryEntry` viene solo de `~/lib/plans-registry`; los helpers de expediente viven en `la-prueba-data.ts` y los consumen catálogo y lector (import cruzado de página sancionado: `PlanDetail` → `Planes/la-prueba-data`, mismo feature).
- **Riesgos señalados:** (1) las clases `prose-*` con tokens papel deben compilar — verificar en el build de T3 que Tailwind las genere (están completas y estáticas, sin interpolación); (2) el assert de heading del MDX en T4 usa el `# H1` real de `PLANSAL.mdx` («PLANSAL — Salud digna y soberana», verificado 2026-07-22); (3) `Kicker` sobre fondo oscuro: si el violeta base no rinde AA, usar `text-violeta-claro` vía `className` (patrón 2.3).
- **Ley:** una sola enmienda (§5 variante expandible) en el mismo commit que la primitiva (T1); §10.8 no se enmienda — se implementa por primera vez tal como está escrita.
- **Deuda observada, fuera de alcance:** `PLAN_COUNT` ya existía duplicado en `Home/landing-data.ts` y `LaIdea/la-idea-data.ts`; unificarlo tocaría dos páginas ajenas — queda para el sweep de la Fase 7.
