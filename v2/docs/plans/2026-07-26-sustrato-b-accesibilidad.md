# B · Accesibilidad, fallos y contraste — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Skip link y foco que se mueve al navegar en las 54 rutas, anillo de foco conforme en las dos superficies, ningún par texto/fondo bajo 4,5:1 con un test que lo custodia, y un chunk caído que muestra un expediente papel en vez de una pantalla en blanco.

**Architecture:** Tres frentes sin backend y sin migraciones, todos dentro de `apps/web` más los dos documentos de `docs/design-system/`. (1) Accesibilidad del shell: `RootLayout` gana un `SkipLink` como primer hijo de sus dos ramas y un ancla `#contenido` en los dos wrappers, `useIrAlPrincipio` pasa a mover también el foco al navegar, el anillo de foco se duplica en `index.css` con `:where(:not(.papel-root, .papel-root *))` para cubrir las 32 rutas legado sin bajar del 3:1 de WCAG 1.4.11, y `prefers-reduced-motion` alcanza a framer-motion desde sus dos únicos consumidores y a los cuatro hover que trasladan vía `motion-safe:`. (2) Fallos: un `ErrorBoundary` de clase montado **dentro** de las dos ramas de `RootLayout`, con la clasificación y el copy en un `.ts` puro aparte y la cara dibujada en su propio `.tsx` sin un solo import de `primitives/`, para no arrastrar medio sistema al chunk inicial. (3) Contraste: la escala dual de color —tres tokens de texto nuevos en `tokens.css` + `tailwind.config.ts` en el mismo commit, el mapa viejo→nuevo barrido sobre 54 archivos y los dos `.dc.html`, una regla `no-restricted-syntax` que impide la recaída y una guardia de vitest que calcula el ratio WCAG 2.1 de todo par declarado.

**Tech Stack:** React 18 + wouter 3 + Tailwind 3 (variantes `motion-safe:` / `motion-reduce:`, `:where()` en CSS plano dentro de `@layer components`) · framer-motion sólo en dos hojas, nunca en la raíz · Vitest 2 + Testing Library + happy-dom · ESLint 9 flat config con `no-restricted-syntax` sobre `Literal` y `TemplateElement` · TypeScript 5.6 strict (`noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax`).

**Spec:** `docs/specs/2026-07-26-el-sustrato.md` — bloques B4, B5, B6

**Prerrequisito:** el plan A (`2026-07-26-sustrato-a-fundaciones.md`) está ejecutado y commiteado.

## Global Constraints

- **Todos los comandos se corren desde `/Users/juanb/Desktop/ElInstantedelHombreGris/v2`**, salvo los pasos que abren con `cd /Users/juanb/Desktop/ElInstantedelHombreGris` (las Tareas 1–5): ésos declaran su propio directorio y sus rutas `v2/…` son relativas a él. Todo lo demás —`pnpm -C apps/web exec …`, `pnpm verify`, los `git add apps/web/…`— asume cwd = `v2/`.
- **Anclá siempre en texto literal citado del archivo, nunca en un número de línea de HEAD.** Este plan corre DESPUÉS del plan A, que ya reescribió `App.tsx`, `RootLayout.tsx`, `index.html`, `index.css`, `primitives/index.ts` y el `build` de `apps/web`; y puede correr en paralelo al plan C. Donde una tarea muestre un bloque «así queda», leerlo como edición aditiva sobre lo que hay en disco, nunca como transcripción a pegar encima.
- **Decisión de arquitectura que rompe el ciclo B↔C (firme, no se discute).** `SkipLink.tsx` (Tarea 1) y `ErrorBoundary.tsx` (Tarea 7) **no** consumen `Superficie` ni `superficieDe`, que los crea B7 en el plan C. Consumen `esRutaPapel(location: string): boolean`, que ya existe hoy en `apps/web/src/layouts/papel-routes.ts` y que B7 reimplementa después conservando su firma. Donde el contrato de interfaces dice `superficie: Superficie`, acá dice `esPapel: boolean`. Y en la otra dirección: la migración de tokens de `PapelFooter.tsx` —sus **cuatro** `text-oscuro-tenue`— pertenece a la Tarea 12 de este plan, no a la Tarea 14 del plan C, que se queda sólo con el cambio de copy del pie.
- `v2/CLAUDE.md` es ley: sin `: any`, sin `console.*`, sin `@ts-ignore`, páginas ≤ 300 LOC, `pnpm verify` verde antes de **cada** commit, Conventional Commits con scope.
- TypeScript `strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes` + `verbatimModuleSyntax`. Todo tipo entra con `import type` o inline (`import { X, type Y } from '…'`). `@typescript-eslint/no-non-null-assertion` es `error`: `!` no es salida.
- `import/order` corre con `newlines-between: 'always'` y `alphabetize: { order: 'asc' }`, y los pasos exigen `eslint --max-warnings 0`: ordená los imports que escribas. **Los `~/…` no los resuelve ningún resolver y quedan al final**, después del grupo `type` — copiá el orden de `apps/web/src/layouts/RootLayout.tsx`.
- `docs/design-system/README.md` v1.1 es ley. §9b: en TSX está **PROHIBIDO el hex literal** — sólo tokens Tailwind. Token nuevo ⇒ `docs/design-system/tokens.css` + `apps/web/tailwind.config.ts` en el **mismo commit** (es exactamente lo que hace la Tarea 9). El hex literal **sí** está permitido en `.css`, `.html` y `.svg`.
- `react-refresh/only-export-components` corre en `warn` y `apps/web` lintea con `eslint src --max-warnings 0`: exportar una función desde un archivo de componentes rompe `pnpm lint`. De ahí que la lógica del fallo viva en `.ts` aparte y la cara en su propio `.tsx`.
- Todo texto de usuario en español rioplatense con voseo. «Comillas angulares». **¡BASTA!** siempre con los dos signos.
- **En `v2/package.json` el orden acordado de guardias es `planes:check` → `deps:check` (plan A) → `meta:check` (plan C).** Este plan **no agrega ninguna guardia a `package.json`**: sus tres guardias nuevas (`contraste.test.ts`, `movimiento.test.ts`, `anillo-de-foco.test.ts`) son tests de vitest y entran solas por `pnpm -C apps/web test:unit`. En el workflow de CI, los pasos nuevos —si alguno hiciera falta— van después de «Guardia del registro de rutas».
- **`scripts/vitest.config.ts` ya incluye `build/__tests__/**` y no se toca.** Este plan no escribe ningún test bajo `scripts/`: todo lo suyo vive en `apps/web/src` y corre con `pnpm -C apps/web exec vitest`.
- **La frontera Vite es física.** Ningún archivo de este plan importa un content registry ni `import.meta.glob`. El alias `~/` sólo resuelve dentro de `apps/web`.
- Cada tarea termina con su verificación y su commit propio. Las verificaciones a ojo están escritas como tales y no reemplazan al test.

---

## Bloque B4 — Accesibilidad del shell (Tareas 1–5)

Cinco tareas. Cierran el hallazgo bloqueante «no existe skip link; 7 paradas de teclado
(12 con el panel de biblioteca abierto) antes del contenido» —WCAG 2.4.1 «Bypass Blocks»,
nivel **A**, más básico que el AA que promete §10.10 de la ley—, el alto «el foco no se
mueve al cambiar de ruta», el alto «el anillo de foco sólo existe dentro de `.papel-root`»
y el medio «`prefers-reduced-motion` sólo apaga las 14 clases `.anim-*`: framer-motion, el
velo del despertar y cuatro hover que trasladan quedan afuera».

Depende de **B2** (el shell ya pinta papel y las fuentes son propias) y de la Tarea 7 del
plan A, que dejó el `<Suspense>` alrededor del `Header` v1 en `RootLayout`. **No** depende
de B7: donde el contrato de interfaces dice `superficie: Superficie`, este bloque usa
`esPapel: boolean` y consume `esRutaPapel()`, que ya existe hoy en
`apps/web/src/layouts/papel-routes.ts` y que B7 reimplementa después conservando su firma.
Así B no espera a C.

Tres decisiones de este bloque que se apartan de la letra de la spec, cada una explicada
en su tarea:

1. El anillo de foco de fuera del papel se escribe con `:where(:not(.papel-root, .papel-root *))`
   y no como regla global, para que la convivencia con el violeta papel no dependa del
   orden del archivo (Tarea 3).
2. `<MotionConfig reducedMotion="user">` **no** va en `App.tsx`: un import estático de
   `framer-motion` ahí revierte la Tarea 7 del plan A, que lo sacó del chunk inicial de las
   54 rutas y apretó `.size-limit.json` contra esa medición. Va dentro de los **dos**
   únicos archivos de `apps/web/src` que importan `framer-motion`, con una guardia que
   obliga al próximo (Tarea 4).
3. Los cuatro hover que trasladan pasan a `motion-safe:hover:…` en vez de sumar un
   `motion-reduce:hover:translate-y-0`, porque entre dos utilidades con variante la
   especificidad empata y decide el orden que Tailwind le dé a las variantes (Tarea 5).

---

### Tarea 1: El skip link y el ancla de contenido

**Files:**
- Create: `v2/apps/web/src/components/SkipLink.tsx`
- Create: `v2/apps/web/src/layouts/__tests__/RootLayout.a11y.test.tsx`
- Modify: `v2/apps/web/src/lib/ir-al-principio.ts` (anclado en `const ESPERA_MAXIMA_DEL_ANCLA_MS = 2000;`)
- Modify: `v2/apps/web/src/layouts/RootLayout.tsx` (anclado en `import { Footer } from '~/components/Footer';`, en `import { useIrAlPrincipio } from '~/lib/ir-al-principio';`, en el bloque `<PaperGrain />` … `<div className="flex-1">{children}</div>` de la rama papel, y en `<div className="bg-background text-foreground flex min-h-screen flex-col">` de la rama legado)

**Interfaces:**
- Consumes: `esRutaPapel(location: string): boolean` de `~/layouts/papel-routes` — el que YA existe hoy, no el de B7; `cn()` de `~/lib/utils`.
- Produces:
  - `export const ID_CONTENIDO = 'contenido';` en `~/lib/ir-al-principio` — contrato compartido entre `SkipLink`, los dos wrappers de `RootLayout` y `enfocarContenido()` (Tarea 2).
  - `export interface SkipLinkProps { esPapel: boolean }` y `export function SkipLink({ esPapel }: SkipLinkProps)` en `~/components/SkipLink`.

El contrato de interfaces del proyecto declara `SkipLinkProps { superficie: Superficie }`.
Acá es `esPapel: boolean` por la dirección de dependencias que fijó el orquestador: `Superficie`
lo crea B7, que va en el plan C y es paralelo a éste. `SkipLink` vive fuera de `components/papel/`
porque también sirve a la rama legado; lo único que cambia por superficie es la paleta.

El destino del salto es un `<div>` y no el `<main>` semántico. Es una imperfección
deliberada: promover el `<main>` al layout serían 62 ocurrencias en 48 archivos, 32 de
ellas legado sin plan por página, y el master plan lo prohíbe explícitamente («Never touch
header/footer/other pages while building a page»). La promoción del `<main>` a landmark
pertenece al DoD de cada página en ②.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/layouts/__tests__/RootLayout.a11y.test.tsx`:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RootLayout } from '../RootLayout';

import { ID_CONTENIDO } from '~/lib/ir-al-principio';
import { useVocesCount } from '~/lib/queries/analytics';

vi.mock('~/lib/queries/analytics', () => ({ useVocesCount: vi.fn() }));

// El header v1 llama a `useAuth`, que dispara un fetch real contra `:3000` y deja
// un ECONNREFUSED en stderr por cada render de la rama legado. El header no se
// está probando acá: se está probando el ORDEN, y para eso alcanza con que exista.
vi.mock('~/lib/auth', () => ({
  useAuth: () => ({ user: null, logout: { mutate: () => undefined } }),
}));

const mockedUseVocesCount = vi.mocked(useVocesCount);

/**
 * Las paradas de tabulación, en orden de documento.
 *
 * No se filtra por la propiedad `tabIndex`: happy-dom devuelve `-1` para un
 * `<a href>` sin atributo explícito, así que filtrar por ella borraría todos los
 * links y el test pasaría por la razón equivocada. Se filtra por el ATRIBUTO,
 * que es lo que de verdad saca a un nodo del orden de tabulación.
 */
const SELECTOR_PARADAS =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]';

function paradasDeTeclado(): HTMLElement[] {
  return [...document.body.querySelectorAll<HTMLElement>(SELECTOR_PARADAS)].filter(
    (nodo) => nodo.getAttribute('tabindex') !== '-1',
  );
}

function montar() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <RootLayout>
        <a href="/otra-cosa">Un link de la página</a>
      </RootLayout>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  mockedUseVocesCount.mockReturnValue({
    data: undefined,
    isLoading: true,
    isError: false,
  } as ReturnType<typeof useVocesCount>);
});

afterEach(() => {
  window.history.replaceState(null, '', '/');
});

describe('RootLayout — WCAG 2.4.1 «Bypass Blocks», nivel A', () => {
  it('en papel el skip link es la PRIMERA parada, antes de todo el chrome', () => {
    window.history.replaceState(null, '', '/planes');
    montar();

    const paradas = paradasDeTeclado();
    // Si el chrome no montó, el test no está probando nada: hoy la rama papel
    // pone 17 paradas antes del contenido.
    expect(paradas.length).toBeGreaterThan(5);
    expect(paradas[0]?.textContent).toBe('Saltar al contenido');
    expect(paradas[0]?.getAttribute('href')).toBe(`#${ID_CONTENIDO}`);
  });

  it('en legado el skip link también es la primera parada', () => {
    window.history.replaceState(null, '', '/tablero');
    montar();

    const paradas = paradasDeTeclado();
    expect(paradas.length).toBeGreaterThan(5);
    expect(paradas[0]?.textContent).toBe('Saltar al contenido');
    expect(paradas[0]?.getAttribute('href')).toBe(`#${ID_CONTENIDO}`);
  });

  it('el ancla existe en las DOS ramas, se enfoca por programa y no es parada de teclado', () => {
    for (const ruta of ['/planes', '/tablero']) {
      window.history.replaceState(null, '', ruta);
      const { unmount } = montar();

      const ancla = document.getElementById(ID_CONTENIDO);
      expect(ancla, `falta #${ID_CONTENIDO} en ${ruta}`).not.toBeNull();
      expect(ancla?.getAttribute('tabindex')).toBe('-1');
      // Sin `scroll-mt`, el header pegajoso de 64px tapa el arranque del contenido
      // cuando el navegador salta al ancla.
      expect(ancla?.className).toContain('scroll-mt-16');
      expect(paradasDeTeclado()).not.toContain(ancla);

      unmount();
    }
  });

  it('la página vive DENTRO del ancla, no al lado', () => {
    window.history.replaceState(null, '', '/planes');
    montar();

    const ancla = document.getElementById(ID_CONTENIDO);
    expect(ancla?.querySelector('a[href="/otra-cosa"]')).not.toBeNull();
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm -C apps/web exec vitest run src/layouts/__tests__/RootLayout.a11y.test.tsx`

Esperado: FALLA, los cuatro `it` en rojo. El primero con
`expected '¡BASTA!12.496 voces · falta la tuya' to be 'Saltar al contenido'` — o sea: hoy
la primera parada de teclado de una ruta papel es el wordmark del header. El tercero con
`falta #contenido en /planes`.

- [ ] **Paso 3: El componente, el id compartido y el montaje en las dos ramas**

Crear `apps/web/src/components/SkipLink.tsx`:

```tsx
import { ID_CONTENIDO } from '~/lib/ir-al-principio';
import { cn } from '~/lib/utils';

export interface SkipLinkProps {
  /**
   * Superficie de la rama de `RootLayout` que lo monta. Es un booleano y no la
   * `Superficie` del registro de rutas a propósito: el registro lo crea B7, que
   * corre en paralelo a este bloque. Cuando exista, esto pasa a derivarse de él
   * sin tocar el markup.
   */
  esPapel: boolean;
}

/**
 * WCAG 2.4.1 «Bypass Blocks», nivel A — el primer control de la página tiene que
 * poder saltear el chrome. Sin esto, quien navega con teclado atraviesa 17 paradas
 * (más las del panel de biblioteca abierto) antes de la primera palabra, en TODAS
 * las páginas, cada vez.
 *
 * Está fuera de `components/papel/` porque también sirve a las 32 rutas legado; lo
 * único que cambia por superficie es la paleta.
 *
 * Escondido con `-translate-y-[200%]` y no con `sr-only`: al recibir el foco tiene
 * que aparecer sin empujar el layout, y `focus:not-sr-only` lo devuelve al flujo.
 * Sin transición a propósito — un indicador de foco que llega tarde es un indicador
 * de foco que se perdió.
 */
export function SkipLink({ esPapel }: SkipLinkProps) {
  return (
    <a
      href={`#${ID_CONTENIDO}`}
      className={cn(
        'fixed left-4 top-4 z-[200] -translate-y-[200%] px-5 py-3 text-[13px] font-bold uppercase tracking-[0.08em] focus:translate-y-0 print:hidden',
        esPapel ? 'bg-violeta text-papel font-space' : 'bg-primary text-primary-foreground font-sans',
      )}
    >
      Saltar al contenido
    </a>
  );
}
```

En `apps/web/src/lib/ir-al-principio.ts`, insertar **antes** de la línea
`const ESPERA_MAXIMA_DEL_ANCLA_MS = 2000;` (y después de su bloque de comentario):

```ts
/**
 * Id del ancla de contenido. Contrato compartido de tres puntas: lo escribe
 * `RootLayout` en los wrappers de las DOS ramas, lo apunta `SkipLink` y lo enfoca
 * `enfocarContenido()`. Vive acá y no en el layout porque el layout es un `.tsx`
 * y `react-refresh/only-export-components` corre con `--max-warnings 0`.
 */
export const ID_CONTENIDO = 'contenido';
```

En `apps/web/src/layouts/RootLayout.tsx`, cuatro cambios anclados en texto literal.

**(a)** Reemplazar la línea:

```tsx
import { Footer } from '~/components/Footer';
```

por:

```tsx
import { Footer } from '~/components/Footer';
import { SkipLink } from '~/components/SkipLink';
```

(`import/order` alfabetiza ascendente y con distinción de mayúsculas: `~/components/Footer`
< `~/components/SkipLink` < `~/components/papel/DespertarVeil`.)

**(b)** Reemplazar la línea:

```tsx
import { useIrAlPrincipio } from '~/lib/ir-al-principio';
```

por:

```tsx
import { ID_CONTENIDO, useIrAlPrincipio } from '~/lib/ir-al-principio';
```

**(c)** En la rama papel, reemplazar:

```tsx
        <PaperGrain />
        <DespertarVeil />
        <PapelHeader />
        <div className="flex-1">{children}</div>
```

por:

```tsx
        <SkipLink esPapel />
        <PaperGrain />
        <DespertarVeil />
        <PapelHeader />
        <div id={ID_CONTENIDO} tabIndex={-1} className="flex-1 scroll-mt-16">
          {children}
        </div>
```

**(d)** En la rama legado, reemplazar:

```tsx
    <div className="bg-background text-foreground flex min-h-screen flex-col">
```

por:

```tsx
    <div className="bg-background text-foreground flex min-h-screen flex-col">
      <SkipLink esPapel={false} />
```

y, en esa misma rama, reemplazar:

```tsx
      <div className="flex-1">{children}</div>
      <Footer />
```

por:

```tsx
      <div id={ID_CONTENIDO} tabIndex={-1} className="flex-1 scroll-mt-16">
        {children}
      </div>
      <Footer />
```

(Este último par de líneas es único en el archivo: la rama papel cierra con `<PapelFooter />`
y su wrapper ya quedó cambiado en **(c)**. El `<Suspense>` que envuelve al `Header` v1 lo
dejó la Tarea 7 del plan A y no se toca.)

Actualizar además el comentario de bloque de `RootLayout`, reemplazando:

```tsx
 * Acá vive el scroll de toda navegación (`useIrAlPrincipio`): es el único
 * componente que envuelve a las dos superficies, papel y v1.
 */
```

por:

```tsx
 * Acá vive el scroll de toda navegación (`useIrAlPrincipio`): es el único
 * componente que envuelve a las dos superficies, papel y v1. Y por lo mismo acá
 * vive el skip link de WCAG 2.4.1, primer hijo de las dos ramas, con su ancla
 * `#contenido` en los dos wrappers.
 */
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm -C apps/web test:unit`

Esperado: PASA — los cuatro `it` nuevos en verde y el resto de la suite de `apps/web` sin
cambios (ningún otro test monta `RootLayout`).

Verificación a ojo, que es lo que el test no puede ver:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web dev
```

En `http://localhost:5173/planes`: cargar y apretar **Tab** una sola vez. Tiene que aparecer
el cartel violeta «SALTAR AL CONTENIDO» arriba a la izquierda, sin que se mueva nada más de
la página. **Enter** salta al cuerpo del expediente. Repetir en `http://localhost:5173/tablero`:
el mismo cartel, en la paleta del chrome v1.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/src/components/SkipLink.tsx \
        v2/apps/web/src/layouts/__tests__/RootLayout.a11y.test.tsx \
        v2/apps/web/src/lib/ir-al-principio.ts \
        v2/apps/web/src/layouts/RootLayout.tsx
git commit -m "feat(web): el teclado puede saltear el chrome — skip link en las dos ramas"
```

---

### Tarea 2: El foco viaja con la navegación

**Files:**
- Modify: `v2/apps/web/src/lib/ir-al-principio.ts` (anclado en `import { useEffect } from 'react';`, en `function irArriba(): void {`, en el cierre del comentario de bloque de `useIrAlPrincipio` y en `export function useIrAlPrincipio(): void {`)
- Modify: `v2/apps/web/src/lib/ir-al-principio.test.tsx` (anclado en `import { saltarASeccion, useIrAlPrincipio } from './ir-al-principio';` y en el final del archivo)

**Interfaces:**
- Consumes: `ID_CONTENIDO` de `~/lib/ir-al-principio` (Tarea 1).
- Produces: `export function enfocarContenido(): boolean` — `focus({ preventScroll: true })` sobre `#contenido`; `false` si el ancla no está en el DOM. `useIrAlPrincipio(): void` conserva su firma y ahora, además del scroll, llama a `enfocarContenido()` **al navegar**.

Hoy `useIrAlPrincipio` sólo mueve el scroll. La navegación SPA es completamente muda para
un lector de pantalla: cambia el contenido y el foco se queda donde estaba —o en el
`<body>`— sin que nada anuncie que hay otra página. Mover el foco al ancla lo arregla y de
paso hace que el `Tab` siguiente arranque desde el contenido y no desde el principio del
chrome otra vez.

**El foco se mueve al navegar, nunca al llegar.** Robarle el foco a un documento recién
cargado hace que el lector de pantalla se saltee el título de la página. La comparación es
contra la ubicación anterior guardada en un `useRef`, y no contra un booleano
«¿es la primera vez?», porque el doble montaje de `StrictMode` en desarrollo corre el
efecto dos veces con la MISMA ubicación: con el booleano, la segunda corrida enfocaría.

- [ ] **Paso 1: Escribir el test que falla**

En `apps/web/src/lib/ir-al-principio.test.tsx`, reemplazar la línea:

```tsx
import { saltarASeccion, useIrAlPrincipio } from './ir-al-principio';
```

por:

```tsx
import { ID_CONTENIDO, enfocarContenido, saltarASeccion, useIrAlPrincipio } from './ir-al-principio';
```

y agregar al FINAL del archivo, después del cierre del
`describe('saltarASeccion — el salto dentro de la misma página', …)`:

```tsx
/** Como `RootLayout`: el ancla de contenido envuelve a la página. */
function PaginaConAncla() {
  useIrAlPrincipio();
  return (
    <div id={ID_CONTENIDO} tabIndex={-1}>
      <p>El cuerpo de la página</p>
    </div>
  );
}

describe('enfocarContenido — la navegación SPA deja de ser muda', () => {
  it('no le roba el foco al documento recién llegado', () => {
    render(<PaginaConAncla />);

    // Enfocar en el montaje hace que un lector de pantalla se saltee el título
    // de la página: llegando, el foco se queda donde el navegador lo puso.
    expect(document.activeElement).toBe(document.body);
  });

  it('al navegar mueve el foco al ancla de contenido', () => {
    render(<PaginaConAncla />);

    act(() => {
      navigate('/planes/planeb');
    });

    expect(document.activeElement).toBe(document.getElementById(ID_CONTENIDO));
  });

  it('no explota cuando el ancla no está en el DOM y lo avisa con false', () => {
    render(<SinSecciones />);

    act(() => {
      navigate('/planes/planeb');
    });

    expect(enfocarContenido()).toBe(false);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm -C apps/web exec vitest run src/lib/ir-al-principio.test.tsx`

Esperado: FALLA de compilación —
`"enfocarContenido" is not exported by "src/lib/ir-al-principio.ts"`. Después de agregar el
export vacío seguiría fallando el segundo `it` con
`expected <body /> to be <div id="contenido" />`.

- [ ] **Paso 3: Implementación mínima**

En `apps/web/src/lib/ir-al-principio.ts`, tres cambios.

**(a)** Reemplazar la primera línea:

```ts
import { useEffect } from 'react';
```

por:

```ts
import { useEffect, useRef } from 'react';
```

**(b)** Reemplazar:

```ts
function irArriba(): void {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}
```

por:

```ts
function irArriba(): void {
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
}

/**
 * Mueve el foco al ancla de contenido, la misma que apunta el skip link.
 *
 * `preventScroll` porque el scroll ya lo decidió `useIrAlPrincipio` —arriba de
 * todo, o a la sección del ancla de la dirección— y un segundo salto lo pisaría.
 *
 * Devuelve `false` si el ancla no está en el DOM: pasa en los tests que montan el
 * hook suelto, sin `RootLayout`, y no es un error.
 */
export function enfocarContenido(): boolean {
  const ancla = document.getElementById(ID_CONTENIDO);
  if (!ancla) return false;
  ancla.focus({ preventScroll: true });
  return true;
}
```

**(c)** Reemplazar el cierre del comentario de bloque de `useIrAlPrincipio` y la apertura de
la función y de su segundo efecto, o sea reemplazar:

```ts
 * Apagamos la restauración del navegador (`scrollRestoration = 'manual'`)
 * para que no pelee con nosotros al volver atrás. El costo aceptado: «atrás»
 * también te deja arriba y no donde estabas leyendo.
 */
export function useIrAlPrincipio(): void {
  const [location] = useLocation();

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    const ancla = anclaActual();
```

por:

```ts
 * Apagamos la restauración del navegador (`scrollRestoration = 'manual'`)
 * para que no pelee con nosotros al volver atrás. El costo aceptado: «atrás»
 * también te deja arriba y no donde estabas leyendo.
 *
 * Y además del scroll movemos el FOCO (`enfocarContenido`). Sin eso la
 * navegación SPA es muda para un lector de pantalla: cambia el contenido y el
 * foco se queda donde estaba, sin que nada anuncie que hay otra página.
 */
export function useIrAlPrincipio(): void {
  const [location] = useLocation();
  const ubicacionAnterior = useRef<string | null>(null);

  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useEffect(() => {
    // Sólo al NAVEGAR, no al llegar: enfocar en el montaje hace que un lector de
    // pantalla se saltee el título de la página. Se compara contra la ubicación
    // anterior y no contra un booleano «¿es la primera vez?» porque el doble
    // montaje de StrictMode corre este efecto dos veces con la MISMA ubicación.
    const anterior = ubicacionAnterior.current;
    ubicacionAnterior.current = location;
    if (anterior !== null && anterior !== location) enfocarContenido();

    const ancla = anclaActual();
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm -C apps/web test:unit`

Esperado: PASA — los tres `it` nuevos en verde y los seis que ya había en
`ir-al-principio.test.tsx` sin tocarse (montan el hook sin `#contenido`, así que
`enfocarContenido()` devuelve `false` y no cambia nada).

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/src/lib/ir-al-principio.ts v2/apps/web/src/lib/ir-al-principio.test.tsx
git commit -m "feat(web): el foco viaja con la navegación, no sólo el scroll"
```

---

### Tarea 3: El anillo de foco existe en las 54 rutas, no en 22

**Files:**
- Create: `v2/apps/web/src/__tests__/anillo-de-foco.test.ts`
- Modify: `v2/apps/web/src/index.css` (anclado en el bloque `.papel-root :focus-visible { outline: 2px solid #5227cc; outline-offset: 2px; }`)

**Interfaces:**
- Consumes: la variable `--ring` que ya declara `:root` en `index.css` (`256 65% 62%`).
- Produces: la regla `:where(:not(.papel-root, .papel-root *)):focus-visible` en el `@layer components` de `index.css`. No hay export de TypeScript.

§10.10 de la ley promete foco violeta y lo cumple en 22 de 54 rutas: el único anillo del
sitio es `.papel-root :focus-visible`. Fuera del papel, los `<a>` sueltos dependen del
anillo por defecto del navegador —feo e inconsistente, no inexistente— y los controles del
chrome v1, de lo que les dé Radix.

**Por qué no se globaliza el violeta papel, que es el arreglo obvio:** `#5227CC` sobre el
fondo legado `#0a0a0a` da **2,3766:1**, por debajo del **3:1** que exige WCAG 1.4.11 para un
indicador de foco. Globalizarlo cambiaría un indicador conforme por uno que falla, en más de
la mitad del sitio, en nombre de la accesibilidad. Se reusa el `--ring` que ya existe
(`256 65% 62%` ≈ `#815FDD`), que da **4,3503:1** sobre `#0a0a0a`. Se unifica cuando la tarea
7.2 del master plan borre el chrome oscuro.

**Por qué `:where(:not(…))` y no una regla global.** Una regla `:focus-visible` a secas
también funcionaría, porque `.papel-root :focus-visible` tiene más especificidad y gana
adentro del papel. Pero entonces la convivencia de las dos reglas quedaría escrita en
ningún lado. Con el selector explícito queda dicha en el archivo. El `:where()` no es
decoración: sin él, `:not(.papel-root, .papel-root *)` aporta (0,1,0), el selector completo
empata en (0,2,0) con `.papel-root :focus-visible` y la decisión pasa a depender del orden
del archivo. Con `:where()` la especificidad del `:not` es 0 y el violeta gana adentro del
papel sin depender de dónde esté escrita cada regla.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/__tests__/anillo-de-foco.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const aqui = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(aqui, '..', 'index.css'), 'utf8');

/** Compara ignorando cómo Prettier haya reacomodado los espacios. */
function normalizar(texto: string): string {
  return texto.replace(/\s+/g, ' ').trim();
}

const cssPlano = normalizar(css);
const ANILLO_VIOLETA = 'outline: 2px solid #5227cc';

describe('§10.10 — el anillo de foco existe en las 54 rutas, no en 22', () => {
  it('el papel conserva su violeta', () => {
    expect(cssPlano).toContain(
      '.papel-root :focus-visible { outline: 2px solid #5227cc; outline-offset: 2px; }',
    );
  });

  it('fuera del papel hay una regla hermana que reusa --ring', () => {
    expect(cssPlano).toContain(
      ':where(:not(.papel-root, .papel-root *)):focus-visible { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; }',
    );
  });

  it('--ring sigue valiendo 256 65% 62% — es el color sobre el que se calculó el 4,3503:1', () => {
    // Si alguien cambia el token, el 4,3503:1 sobre #0a0a0a deja de ser cierto y
    // el anillo de las 32 rutas legado puede caer por debajo del 3:1 de WCAG 1.4.11
    // sin que nada avise.
    expect(cssPlano).toContain('--ring: 256 65% 62%;');
  });

  it('el violeta papel NO se globaliza: 2,3766:1 sobre #0a0a0a falla el 3:1 de WCAG 1.4.11', () => {
    const veces = cssPlano.split(ANILLO_VIOLETA).length - 1;
    expect(veces).toBe(1);

    const antes = cssPlano.slice(0, cssPlano.indexOf(ANILLO_VIOLETA));
    expect(antes.endsWith('.papel-root :focus-visible { ')).toBe(true);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm -C apps/web exec vitest run src/__tests__/anillo-de-foco.test.ts`

Esperado: FALLA — el segundo `it` en rojo:
`expected '@tailwind base; @tailwind components; …' to contain ':where(:not(.papel-root, .papel-root *)):focus-visible { outline: 2px solid hsl(var(--ring)); outline-offset: 2px; }'`.

Los otros tres pasan desde el arranque **a propósito**: son candados sobre hechos que hoy
son ciertos y que esta tarea tiene que dejar ciertos —el violeta papel sobrevive, `--ring`
no se mueve, el violeta no se globaliza—. El que prueba el cambio es el segundo.

- [ ] **Paso 3: Implementación mínima**

En `apps/web/src/index.css`, dentro del `@layer components`, reemplazar:

```css
  .papel-root :focus-visible {
    outline: 2px solid #5227cc;
    outline-offset: 2px;
  }
```

por:

```css
  .papel-root :focus-visible {
    outline: 2px solid #5227cc;
    outline-offset: 2px;
  }

  /* El anillo de foco de fuera del papel. Hasta acá el único anillo del sitio era
     el de arriba: §10.10 promete foco violeta y lo cumplía en 22 de 54 rutas, y los
     `<a>` sueltos de las 32 legado dependían del anillo por defecto del navegador
     — feo e inconsistente, no inexistente.

     NO se globaliza el violeta papel, que es el arreglo obvio: #5227CC sobre el
     fondo legado #0a0a0a da 2,3766:1, por debajo del 3:1 que WCAG 1.4.11 exige a un
     indicador de foco. Globalizarlo cambiaría un indicador conforme por uno que
     falla, en más de la mitad del sitio, en nombre de la accesibilidad. Se reusa
     `--ring` (256 65% 62% ≈ #815FDD), que da 4,3503:1 sobre #0a0a0a. Se unifica
     cuando la tarea 7.2 del master plan borre el chrome oscuro.

     El `:where()` es lo que hace convivir a las dos reglas: sin él,
     `:not(.papel-root, .papel-root *)` aportaría (0,1,0), el selector empataría en
     (0,2,0) con `.papel-root :focus-visible` y la decisión pasaría a depender del
     orden del archivo. Con `:where()` la especificidad del `:not` es 0 y adentro
     del papel gana el violeta, esté escrito donde esté. */
  :where(:not(.papel-root, .papel-root *)):focus-visible {
    outline: 2px solid hsl(var(--ring));
    outline-offset: 2px;
  }
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm -C apps/web test:unit && pnpm --filter @v2/web build`

Esperado: PASA — los cuatro `it` en verde y el build sin advertencias de PostCSS.

Verificación a ojo, que es lo que el test no puede ver:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web dev
```

Tabular por `http://localhost:5173/planes`: anillo **violeta** en cada control. Tabular por
`http://localhost:5173/tablero` y por `http://localhost:5173/ingresar`: anillo **lila**
(`#815FDD`), visible sobre el fondo negro, en links y botones por igual.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/src/index.css v2/apps/web/src/__tests__/anillo-de-foco.test.ts
git commit -m "feat(web): el anillo de foco cubre las 54 rutas sin bajar de 3:1"
```

---

### Tarea 4: `prefers-reduced-motion` manda también sobre framer-motion

**Files:**
- Create: `v2/apps/web/src/__tests__/movimiento.test.ts`
- Modify: `v2/apps/web/src/components/XpToast.tsx` (anclado en `import { AnimatePresence, motion } from 'framer-motion';` y en `  return (` )
- Modify: `v2/apps/web/src/components/XPChip.tsx` (anclado en `import { motion } from 'framer-motion';` y en `  if (!data) return null;`)

**Interfaces:**
- Consumes: `MotionConfig` de `framer-motion` (ya es dependencia de producción).
- Produces: la guardia «todo archivo de `apps/web/src` que importe `framer-motion` declara `<MotionConfig reducedMotion="user">`», en `apps/web/src/__tests__/movimiento.test.ts`. Ese archivo lo extiende la Tarea 5.

**Por qué esto NO va en `App.tsx`, que es lo que dice §6 de la spec.** La spec pide
`<MotionConfig reducedMotion="user">` en `App.tsx` porque «cubre todo framer-motion en una
línea». Pero esa línea es un import ESTÁTICO de `framer-motion` en la raíz del árbol, y la
Tarea 7 del plan A acaba de sacar `framer-motion` del chunk inicial de las 54 rutas
(~44 KB gzip, el 22% del JS de la portada) volviendo perezosos a sus dos únicos
consumidores, y apretó `.size-limit.json` contra esa medición. Ponerlo en `App.tsx`
revierte la tarea entera: la verificación de A —`grep -c 'modulepreload.*motion-'
apps/web/dist/index.html` tiene que dar `0`— pasaría a dar `1` y `pnpm size` se pondría
rojo.

Verificado con `grep -rl framer-motion apps/web/src`: los únicos dos archivos que la
importan en todo `apps/web` son `components/XPChip.tsx` y `components/XpToast.tsx`. Poner el
`MotionConfig` adentro de cada uno cubre el 100% del framer-motion que existe, cuesta cero
bytes de red y no toca el grafo de chunks. Lo que se pierde es la garantía automática para
un consumidor futuro; eso lo repone la guardia, que obliga a declararlo. El costo aceptado
de la guardia: si mañana una sección hija de una página que ya declara el `MotionConfig`
importa `motion`, la guardia le va a exigir un `MotionConfig` redundante. Anidar dos con el
mismo valor no hace nada; el aviso vale más que la redundancia.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/__tests__/movimiento.test.ts`:

```ts
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const aqui = dirname(fileURLToPath(import.meta.url));
const raizSrc = join(aqui, '..');

interface Fuente {
  /** Ruta relativa a `apps/web/src`, con la barra inicial: `/components/XPChip.tsx`. */
  readonly ruta: string;
  readonly texto: string;
}

/** Todo `.ts`/`.tsx` de `apps/web/src` que no sea, él mismo, un test. */
function fuentesDe(dir: string): Fuente[] {
  const salida: Fuente[] = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      salida.push(...fuentesDe(ruta));
      continue;
    }
    if (!/\.tsx?$/.test(entrada.name)) continue;
    if (/\.test\.tsx?$/.test(entrada.name)) continue;
    salida.push({ ruta: ruta.slice(raizSrc.length), texto: readFileSync(ruta, 'utf8') });
  }
  return salida;
}

const FUENTES = fuentesDe(raizSrc);

describe('§6 Movimiento — prefers-reduced-motion manda también sobre framer-motion', () => {
  it('todo archivo que importa framer-motion declara MotionConfig reducedMotion="user"', () => {
    const consumidores = FUENTES.filter((f) => f.texto.includes("from 'framer-motion'"));

    // Si esto diera 0, el filtro se rompió y el test estaría pasando por la razón
    // equivocada. Hoy son exactamente dos: XPChip y XpToast.
    expect(consumidores.length).toBeGreaterThan(0);

    const sinConfig = consumidores
      .filter((f) => !f.texto.includes('<MotionConfig reducedMotion="user">'))
      .map((f) => f.ruta)
      .sort();

    // El `MotionConfig` NO va en `App.tsx`: un import estático de framer-motion en
    // la raíz devuelve los ~44 KB gzip al chunk inicial de las 54 rutas, que es
    // justo lo que sacó la Tarea 7 del plan A. Va en cada consumidor.
    expect(sinConfig).toEqual([]);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm -C apps/web exec vitest run src/__tests__/movimiento.test.ts`

Esperado: FALLA con
`expected [ '/components/XPChip.tsx', '/components/XpToast.tsx' ] to deeply equal []`.

- [ ] **Paso 3: Implementación mínima**

En `apps/web/src/components/XpToast.tsx`, reemplazar la primera línea:

```tsx
import { AnimatePresence, motion } from 'framer-motion';
```

por:

```tsx
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
```

y reemplazar todo el `return` del componente por:

```tsx
  return (
    <MotionConfig reducedMotion="user">
      <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {items.map((evt) => (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="pointer-events-auto rounded-lg border border-white/10 bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md"
            >
              {evt.newLevel !== null ? (
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-iris-violet" aria-hidden />
                  <div>
                    <div className="text-sm font-semibold">¡Subiste al Nivel {evt.newLevel}!</div>
                    <div className="text-xs text-muted-foreground">+{evt.xpAwarded} XP</div>
                  </div>
                </div>
              ) : evt.newBadges.length > 0 ? (
                <div className="flex items-center gap-3">
                  <Award className="h-5 w-5 text-iris-violet" aria-hidden />
                  <div>
                    <div className="text-sm font-semibold">
                      Nueva insignia: {evt.newBadges[0]?.title}
                    </div>
                    <div className="text-xs text-muted-foreground">+{evt.xpAwarded} XP</div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-iris-violet" aria-hidden />
                  <div>
                    <div className="text-sm font-semibold">+{evt.xpAwarded} XP</div>
                    <div className="text-xs text-muted-foreground">
                      {KIND_LABELS[evt.kind] ?? evt.kind}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
```

En `apps/web/src/components/XPChip.tsx`, reemplazar la primera línea:

```tsx
import { motion } from 'framer-motion';
```

por:

```tsx
import { MotionConfig, motion } from 'framer-motion';
```

y reemplazar el bloque que va desde `  if (!data) return null;` hasta el cierre del
componente por:

```tsx
  if (!data) return null;

  return (
    <MotionConfig reducedMotion="user">
      <Link
        href="/mi-perfil"
        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs hover:bg-white/10"
      >
        <motion.span
          key={pulse}
          initial={pulse === 0 ? false : { scale: 1.4 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1"
        >
          <Zap className="h-3 w-3 text-iris-violet" aria-hidden />
          <span className="font-semibold tabular-nums">Nv{data.level}</span>
          <span className="text-muted-foreground">· {data.xp.toLocaleString('es-AR')} XP</span>
        </motion.span>
      </Link>
    </MotionConfig>
  );
}
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm -C apps/web test:unit && pnpm --filter @v2/web build && grep -c 'modulepreload.*motion-' apps/web/dist/index.html`

Esperado: PASA — el `it` nuevo en verde, `XpToast.test.tsx` sin tocarse en verde (el
`MotionConfig` no renderiza DOM propio), y el `grep -c` imprime `0` y sale con código 1: el
chunk de framer-motion sigue fuera del camino crítico, que es lo que esta tarea tenía que
no romper.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/src/__tests__/movimiento.test.ts \
        v2/apps/web/src/components/XpToast.tsx \
        v2/apps/web/src/components/XPChip.tsx
git commit -m "feat(web): framer-motion respeta prefers-reduced-motion sin volver al chunk inicial"
```

---

### Tarea 5: Los cuatro hover que trasladan y el velo del despertar

**Files:**
- Modify: `v2/apps/web/src/components/papel/primitives/BotonPapel.tsx` (anclado en el bloque `violeta: {` de `VARIANT_SURFACE_CLASSES`)
- Modify: `v2/apps/web/src/pages/Biblioteca/sections/CronicaDestacada.tsx` (anclado en `href={HREF_CRONICA_PAIS_QUE_VIENE}`)
- Modify: `v2/apps/web/src/pages/Biblioteca/sections/ManifiestoDestacado.tsx` (anclado en `href={HREF_MANIFIESTO}`)
- Modify: `v2/apps/web/src/components/papel/DespertarVeil.tsx` (anclado en `className="bg-oscuro-meta pointer-events-none fixed inset-0 z-[99] mix-blend-saturation transition-opacity duration-[1400ms] ease-out print:hidden"`)
- Modify: `v2/apps/web/src/__tests__/movimiento.test.ts` (anclado en el cierre del `describe('§6 Movimiento — prefers-reduced-motion manda también sobre framer-motion', …)` de la Tarea 4)

**Interfaces:**
- Consumes: `FUENTES` y el tipo `Fuente` de `apps/web/src/__tests__/movimiento.test.ts` (Tarea 4).
- Produces: `motion-safe:hover:-translate-y-0.5` en los cuatro desplazamientos vivos y `motion-reduce:transition-none` en `DespertarVeil`. No hay export nuevo.

Los cuatro son los que devuelve `grep -rn 'hover:translate\|hover:-translate' apps/web/src`,
no una suposición: `BotonPapel.tsx` (las variantes `violeta/papel` y `violeta/oscuro`),
`CronicaDestacada.tsx` y `ManifiestoDestacado.tsx`.

**Por qué `motion-safe:hover:` y no `motion-reduce:hover:translate-y-0`.** Las dos utilidades
llevarían variante, así que las dos pesan (0,2,0) y el desempate lo da el orden en que
Tailwind emite las variantes — una dependencia del cascade que un upgrade puede dar vuelta
sin que nada avise. Con `motion-safe:` el desplazamiento directamente no existe cuando el
sistema pide quietud: no hay nada que sobrescribir. El caso del velo es distinto y ahí sí va
`motion-reduce:`: `transition-opacity` es una utilidad SIN variante, y Tailwind emite todo lo
que no tiene variante antes que todo lo que sí, así que el orden está garantizado. Es el
mismo patrón que ya usa `pages/LaIdea/sections/CapituloHombreGris.tsx`.

- [ ] **Paso 1: Escribir el test que falla**

En `apps/web/src/__tests__/movimiento.test.ts`, agregar al FINAL del archivo:

```ts
describe('§6 Movimiento — lo que se traslada en hover se queda quieto en reposo', () => {
  it('ningún desplazamiento de hover queda fuera de motion-safe', () => {
    const ofensores = FUENTES.flatMap((f) =>
      [...f.texto.matchAll(/\S*hover:-?translate-[xy]-\S*/g)]
        .map((coincidencia) => coincidencia[0])
        .filter((clase) => !clase.startsWith('motion-safe:'))
        .map((clase) => `${f.ruta}: ${clase}`),
    ).sort();

    expect(ofensores).toEqual([]);
  });

  it('los cuatro desplazamientos vivos son exactamente los cuatro relevados', () => {
    const conMotionSafe = FUENTES.flatMap((f) =>
      [...f.texto.matchAll(/motion-safe:hover:-?translate-[xy]-/g)].map(() => f.ruta),
    ).sort();

    expect(conMotionSafe).toEqual([
      '/components/papel/primitives/BotonPapel.tsx',
      '/components/papel/primitives/BotonPapel.tsx',
      '/pages/Biblioteca/sections/CronicaDestacada.tsx',
      '/pages/Biblioteca/sections/ManifiestoDestacado.tsx',
    ]);
  });

  it('el velo del despertar no se funde cuando el sistema pide quietud', () => {
    const velo = FUENTES.find((f) => f.ruta.endsWith('/papel/DespertarVeil.tsx'));

    expect(velo, 'no se encontró DespertarVeil.tsx').toBeDefined();
    // `transition-opacity` no lleva variante y Tailwind emite las utilidades sin
    // variante antes que las que sí la llevan: acá el orden sí está garantizado.
    expect(velo?.texto).toContain('motion-reduce:transition-none');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm -C apps/web exec vitest run src/__tests__/movimiento.test.ts`

Esperado: FALLA — los tres `it` nuevos en rojo. El primero listando los cuatro ofensores
(`'/components/papel/primitives/BotonPapel.tsx: hover:-translate-y-0.5'`, dos veces, más los
dos de Biblioteca); el segundo con `expected [] to deeply equal [ … ]`; el tercero con
`expected '…transition-opacity duration-[1400ms]…' to contain 'motion-reduce:transition-none'`.

- [ ] **Paso 3: Implementación mínima**

En `apps/web/src/components/papel/primitives/BotonPapel.tsx`, reemplazar:

```ts
  violeta: {
    papel:
      'bg-violeta text-papel font-bold transition-all duration-200 hover:bg-tinta hover:-translate-y-0.5',
    oscuro: 'bg-papel text-tinta font-bold transition-transform duration-200 hover:-translate-y-0.5',
  },
```

por:

```ts
  violeta: {
    papel:
      'bg-violeta text-papel font-bold transition-all duration-200 hover:bg-tinta motion-safe:hover:-translate-y-0.5',
    oscuro:
      'bg-papel text-tinta font-bold transition-transform duration-200 motion-safe:hover:-translate-y-0.5',
  },
```

En `apps/web/src/pages/Biblioteca/sections/CronicaDestacada.tsx`, reemplazar:

```tsx
      <Link
        href={HREF_CRONICA_PAIS_QUE_VIENE}
        className="bg-tinta text-papel flex flex-wrap items-center gap-8 px-10 py-9 transition-transform duration-150 hover:-translate-y-0.5 max-[560px]:px-6 max-[560px]:py-7"
      >
```

por:

```tsx
      <Link
        href={HREF_CRONICA_PAIS_QUE_VIENE}
        className="bg-tinta text-papel flex flex-wrap items-center gap-8 px-10 py-9 transition-transform duration-150 motion-safe:hover:-translate-y-0.5 max-[560px]:px-6 max-[560px]:py-7"
      >
```

En `apps/web/src/pages/Biblioteca/sections/ManifiestoDestacado.tsx`, reemplazar:

```tsx
      <Link
        href={HREF_MANIFIESTO}
        className="bg-tinta text-papel flex flex-wrap items-center gap-8 px-10 py-9 transition-transform duration-150 hover:-translate-y-0.5 max-[560px]:px-6 max-[560px]:py-7"
      >
```

por:

```tsx
      <Link
        href={HREF_MANIFIESTO}
        className="bg-tinta text-papel flex flex-wrap items-center gap-8 px-10 py-9 transition-transform duration-150 motion-safe:hover:-translate-y-0.5 max-[560px]:px-6 max-[560px]:py-7"
      >
```

En `apps/web/src/components/papel/DespertarVeil.tsx`, reemplazar:

```tsx
      className="bg-oscuro-meta pointer-events-none fixed inset-0 z-[99] mix-blend-saturation transition-opacity duration-[1400ms] ease-out print:hidden"
```

por:

```tsx
      className="bg-oscuro-meta pointer-events-none fixed inset-0 z-[99] mix-blend-saturation transition-opacity duration-[1400ms] ease-out motion-reduce:transition-none print:hidden"
```

y actualizar su comentario de bloque, reemplazando:

```tsx
/**
 * Velo del despertar — firma award §10.7: el sitio entero llega en gris
 * (mix-blend saturation) y se enciende con la primera acción del usuario.
 */
```

por:

```tsx
/**
 * Velo del despertar — firma award §10.7: el sitio entero llega en gris
 * (mix-blend saturation) y se enciende con la primera acción del usuario.
 *
 * Con `prefers-reduced-motion: reduce` el color cambia igual, pero de golpe: la
 * fusión de 1400 ms es un movimiento a pantalla completa y §10.10 la apaga.
 */
```

- [ ] **Paso 4: Correr los tests**

Comando: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm verify`

Esperado: PASA — verde entero, con los cuatro `it` de `movimiento.test.ts` y los
`primitives.test.tsx`, `Biblioteca.test.tsx` y `LaIdea.test.tsx` que ya existían.

Verificación a ojo, que es lo que el test no puede ver. En macOS, Preferencias del sistema →
Accesibilidad → Pantalla → **Reducir movimiento**, y después:

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/web dev
```

En `http://localhost:5173/biblioteca`, pasar el mouse por la tarjeta del manifiesto y por la
de la crónica: cambia el cursor, no se mueve nada. En `http://localhost:5173/sembrar`, lo
mismo con el botón violeta. En `http://localhost:5173/`, la primera acción enciende el color
de golpe, sin la fusión de 1400 ms. Con «Reducir movimiento» apagado, los cuatro vuelven a
levantarse 2px.

- [ ] **Paso 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris
git add v2/apps/web/src/__tests__/movimiento.test.ts \
        v2/apps/web/src/components/papel/primitives/BotonPapel.tsx \
        v2/apps/web/src/components/papel/DespertarVeil.tsx \
        v2/apps/web/src/pages/Biblioteca/sections/CronicaDestacada.tsx \
        v2/apps/web/src/pages/Biblioteca/sections/ManifiestoDestacado.tsx
git commit -m "feat(web): reduced-motion también apaga los hover que trasladan y el velo"
```

---

## Bloque B5 — Fallos del cliente (Tareas 6–8)

Entrega §6b de la spec: hoy `apps/web` no tiene ni un `ErrorBoundary`, ni un
`componentDidCatch`, ni un `window.onerror`. Con las 48 páginas en `lazy()`, un chunk que
devuelve 404 —el caso normal después de un deploy, con un `index.html` viejo en caché
pidiendo hashes que ya no existen— rechaza la promesa, React 18 desmonta el árbol entero y
el lector queda mirando un rectángulo vacío. Después de B2 ese rectángulo es crema, que es
**peor**: parece una página cargada y en blanco.

**Nota de dependencia (decisión firme del orquestador).** B5 **no** consume `Superficie` ni
`superficieDe` (los crea B7, en el plan C). Consume el hecho booleano que `RootLayout` ya
calcula hoy con `esRutaPapel(location)` de `apps/web/src/layouts/papel-routes.ts`. Donde el
contrato de interfaces dice `superficie: Superficie`, acá dice **`esPapel: boolean`**. Cuando
B7 reimplemente `esRutaPapel()` encima del registro conservando su firma, este bloque no se
entera.

---

### Tarea 6: El régimen del fallo — clasificación y copy, puros y testeables

La lógica vive en un `.ts` aparte y no en el `.tsx` porque
`react-refresh/only-export-components` corre en `warn` y `apps/web` lintea con
`eslint src --max-warnings 0`: exportar una función desde un archivo de componentes rompe
`pnpm lint`. Mismo patrón que `pages/ElMandatoVivo/mandato-regimen.ts` frente a sus secciones.

**Files:**
- Create: `apps/web/src/components/papel/error-boundary-regimen.ts`
- Test: `apps/web/src/components/papel/__tests__/error-boundary-regimen.test.ts`

**Interfaces:**
- Consumes: nada (módulo hoja, cero imports).
- Produces:
  - `export type ClaseDeFallo = 'chunk' | 'general';`
  - `export const PATRON_CHUNK: RegExp;` — `/dynamically imported module|Importing a module script failed/`
  - `export function clasificarFallo(error: unknown): ClaseDeFallo;`
  - `export interface CopyDeFallo { readonly kicker: string; readonly titulo: string; readonly cuerpo: string; readonly accion: string; }`
  - `export function copyDeFallo(clase: ClaseDeFallo): CopyDeFallo;`

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/components/papel/__tests__/error-boundary-regimen.test.ts` (el directorio
`__tests__` ya existe: hoy tiene `MdxPapel.test.tsx`):

```ts
import { describe, expect, it } from 'vitest';

import { clasificarFallo, copyDeFallo, PATRON_CHUNK } from '../error-boundary-regimen';

describe('clasificarFallo — chunk vs. cualquier otra cosa', () => {
  it('el nombre ChunkLoadError basta, aunque el mensaje no diga nada', () => {
    const error = new Error('Loading chunk 42 failed.');
    error.name = 'ChunkLoadError';
    expect(clasificarFallo(error)).toBe('chunk');
  });

  it('reconoce el mensaje de Vite/Rollup', () => {
    expect(
      clasificarFallo(
        new Error('Failed to fetch dynamically imported module: /assets/Home-a1b2.js'),
      ),
    ).toBe('chunk');
  });

  it('reconoce el mensaje de Safari', () => {
    expect(clasificarFallo(new Error('Importing a module script failed.'))).toBe('chunk');
  });

  it('un TypeError cualquiera es general', () => {
    expect(clasificarFallo(new TypeError('voces.map is not a function'))).toBe('general');
  });

  it('lo que no es Error es general', () => {
    expect(clasificarFallo('se cayó todo')).toBe('general');
    expect(clasificarFallo(undefined)).toBe('general');
    expect(clasificarFallo({ name: 'ChunkLoadError' })).toBe('general');
  });

  it('PATRON_CHUNK no tiene flag global: no arrastra lastIndex entre llamadas', () => {
    const mensaje = 'Failed to fetch dynamically imported module';
    expect(PATRON_CHUNK.test(mensaje)).toBe(true);
    expect(PATRON_CHUNK.test(mensaje)).toBe(true);
  });
});

describe('copyDeFallo — el catálogo de §5 y §10.9, en voseo', () => {
  it('el chunk ofrece recargar y nada más', () => {
    const copy = copyDeFallo('chunk');
    expect(copy.titulo).toContain('Salió una versión nueva mientras leías');
    expect(copy.accion).toBe('Recargar →');
  });

  it('el general dice la frase de la ley', () => {
    const copy = copyDeFallo('general');
    expect(`${copy.titulo} ${copy.cuerpo}`).toContain(
      'Esto se rompió. Lo decimos porque publicamos todo.',
    );
    expect(copy.accion).toBe('Ver los datos abiertos →');
  });

  it('los cuatro campos están llenos en los dos estados', () => {
    for (const clase of ['chunk', 'general'] as const) {
      const copy = copyDeFallo(clase);
      expect(copy.kicker.length).toBeGreaterThan(0);
      expect(copy.titulo.length).toBeGreaterThan(0);
      expect(copy.cuerpo.length).toBeGreaterThan(0);
      expect(copy.accion.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/components/papel/__tests__/error-boundary-regimen.test.ts`

Esperado: FALLA en la colección con `Failed to resolve import "../error-boundary-regimen" from "src/components/papel/__tests__/error-boundary-regimen.test.ts"`. Ningún test corre.

- [ ] **Paso 3: Implementación mínima**

Crear `apps/web/src/components/papel/error-boundary-regimen.ts`:

```ts
/**
 * Régimen del fallo del cliente (spec ① §6b): clasificación y copy, puros y
 * testeables. Separados del `.tsx` porque `react-refresh/only-export-components`
 * corre en `warn` y `apps/web` lintea con `--max-warnings 0`: exportar una
 * función desde un archivo de componentes rompe `pnpm lint`. Mismo patrón que
 * `mandato-regimen.ts` frente a sus secciones.
 */
export type ClaseDeFallo = 'chunk' | 'general';

/**
 * Los dos mensajes que emiten Vite/Rollup y Safari cuando un chunk `lazy()`
 * devuelve 404 — el caso normal después de un deploy, con un `index.html`
 * viejo en caché pidiendo hashes que ya no existen.
 */
export const PATRON_CHUNK = /dynamically imported module|Importing a module script failed/;

export function clasificarFallo(error: unknown): ClaseDeFallo {
  if (!(error instanceof Error)) return 'general';
  if (error.name === 'ChunkLoadError') return 'chunk';
  return PATRON_CHUNK.test(error.message) ? 'chunk' : 'general';
}

export interface CopyDeFallo {
  readonly kicker: string;
  readonly titulo: string;
  readonly cuerpo: string;
  readonly accion: string;
}

const COPY: Readonly<Record<ClaseDeFallo, CopyDeFallo>> = {
  chunk: {
    kicker: 'edición actualizada',
    titulo: 'Salió una versión nueva mientras leías.',
    cuerpo:
      'No perdiste nada: el sitio cambió de edición abajo tuyo. Recargá y volvés a donde estabas.',
    accion: 'Recargar →',
  },
  general: {
    kicker: 'expediente interrumpido',
    titulo: 'Esto se rompió.',
    cuerpo: 'Lo decimos porque publicamos todo. Mirá qué hay abierto y de dónde sale cada número.',
    accion: 'Ver los datos abiertos →',
  },
};

export function copyDeFallo(clase: ClaseDeFallo): CopyDeFallo {
  return COPY[clase];
}
```

Dos detalles que no son estéticos: `PATRON_CHUNK` va **sin** flag `g` (con `g`, `.test()`
arrastra `lastIndex` y devolvería `false` en llamadas alternadas); y `COPY` es
`Record<ClaseDeFallo, CopyDeFallo>` con claves literales, no una firma de índice, así que
`noUncheckedIndexedAccess` no agrega `| undefined` a `COPY[clase]` (mismo patrón que
`VARIANT_SURFACE_CLASSES[variant][surface]` en `BotonPapel.tsx`).

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/components/papel/__tests__/error-boundary-regimen.test.ts`

Esperado: PASA — 9 tests.

- [ ] **Paso 5: Lint, tipos y formato del archivo nuevo**

Comando:
```bash
pnpm -C apps/web exec eslint src/components/papel/error-boundary-regimen.ts src/components/papel/__tests__/error-boundary-regimen.test.ts --max-warnings 0
pnpm -C apps/web exec tsc --noEmit
pnpm exec prettier --check apps/web/src/components/papel/error-boundary-regimen.ts apps/web/src/components/papel/__tests__/error-boundary-regimen.test.ts
```
Esperado: los tres verdes, sin una sola advertencia.

- [ ] **Paso 6: Commit**

```bash
git add apps/web/src/components/papel/error-boundary-regimen.ts apps/web/src/components/papel/__tests__/error-boundary-regimen.test.ts
git commit -m "feat(web): régimen del fallo del cliente — chunk caído vs. todo lo demás"
```

---

### Tarea 7: El `ErrorBoundary` papel con sus dos caras

**Files:**
- Create: `apps/web/src/components/papel/CaraDeFallo.tsx`
- Create: `apps/web/src/components/papel/ErrorBoundary.tsx`
- Test: `apps/web/src/components/papel/__tests__/ErrorBoundary.test.tsx`

**Interfaces:**
- Consumes (Tarea 6):
  - `clasificarFallo(error: unknown): ClaseDeFallo`
  - `copyDeFallo(clase: ClaseDeFallo): CopyDeFallo`
  - `type ClaseDeFallo = 'chunk' | 'general'`
  - `interface CopyDeFallo { readonly kicker: string; readonly titulo: string; readonly cuerpo: string; readonly accion: string; }`
- Produces:
  - `export interface CaraDeFalloProps { clase: ClaseDeFallo; copy: CopyDeFallo; esPapel: boolean; }`
  - `export function CaraDeFallo({ clase, copy, esPapel }: CaraDeFalloProps);`
  - `export interface ErrorBoundaryProps { children: ReactNode; esPapel: boolean; llaveDeReinicio: string; }`
  - `export interface EstadoErrorBoundary { fallo: ClaseDeFallo | null; }`
  - `export class ErrorBoundary extends Component<ErrorBoundaryProps, EstadoErrorBoundary> { static getDerivedStateFromError(error: unknown): EstadoErrorBoundary; componentDidUpdate(anterior: ErrorBoundaryProps): void; render(): ReactNode; }`

Por qué **dos** archivos y no uno: verificado corriendo `eslint`, con la cara pintada dentro
de `ErrorBoundary.tsx` el plugin no reconoce la clase como componente y marca los dos
componentes de función locales con `react-refresh/only-export-components` — dos *warnings*, y
`apps/web` lintea con `--max-warnings 0`. Con la cara en su propio archivo (que exporta sólo
un componente y tipos) y `ErrorBoundary.tsx` exportando sólo la clase y tipos, el lint queda
en cero.

Y por qué **cero imports** de primitivas: el boundary se monta en `RootLayout`, o sea en el
chunk inicial de las 54 rutas. Importar el barril `components/papel/primitives` arrastraría
`RitoTinta`, `Palitos`, `FilaIndiceExpandible` y compañía al payload inicial justo cuando B1
aprieta `.size-limit.json`. Se repite la receta §5 con clases Tailwind, que es lo que el
sistema autoriza explícitamente («Repetir la receta antes que abstraer sigue valiendo para
layout»).

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/components/papel/__tests__/ErrorBoundary.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ErrorBoundary } from '../ErrorBoundary';

function Explota({ error }: { error: Error }): never {
  throw error;
}

function errorDeChunk(): Error {
  const error = new Error(
    'Failed to fetch dynamically imported module: /assets/PlanDetail-a1b2c3.js',
  );
  error.name = 'ChunkLoadError';
  return error;
}

describe('ErrorBoundary — los dos estados del fallo del cliente', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('el chunk que no baja muestra el expediente de versión nueva y un solo botón', () => {
    render(
      <ErrorBoundary esPapel llaveDeReinicio="/planes/planeb">
        <Explota error={errorDeChunk()} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Salió una versión nueva mientras leías',
    );
    expect(screen.getByRole('button', { name: 'Recargar →' })).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByText(/Esto se rompió/)).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('cualquier otro error muestra el 500 de §5 con link a /datos-abiertos', () => {
    render(
      <ErrorBoundary esPapel llaveDeReinicio="/planes/planeb">
        <Explota error={new Error('getVoces is not a function')} />
      </ErrorBoundary>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Esto se rompió.');
    expect(screen.getByText(/Lo decimos porque publicamos todo/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver los datos abiertos →' })).toHaveAttribute(
      'href',
      '/datos-abiertos',
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('cambiar de location resetea el boundary y el hijo vuelve a renderizar', () => {
    const { rerender } = render(
      <ErrorBoundary esPapel llaveDeReinicio="/planes/planeb">
        <Explota error={new Error('getVoces is not a function')} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Esto se rompió.');

    rerender(
      <ErrorBoundary esPapel llaveDeReinicio="/biblioteca">
        <p>La biblioteca abierta</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('La biblioteca abierta')).toBeInTheDocument();
    expect(screen.queryByRole('heading', { level: 1 })).not.toBeInTheDocument();
  });

  it('la rama legado pinta el chrome v1, no el expediente papel', () => {
    render(
      <ErrorBoundary esPapel={false} llaveDeReinicio="/tablero">
        <Explota error={errorDeChunk()} />
      </ErrorBoundary>,
    );

    const titulo = screen.getByRole('heading', { level: 1 });
    expect(titulo).toHaveClass('font-serif');
    expect(titulo).not.toHaveClass('font-anton');
  });

  it('sin fallo, el boundary es transparente', () => {
    render(
      <ErrorBoundary esPapel llaveDeReinicio="/">
        <p>El país lo diseña la gente</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText('El país lo diseña la gente')).toBeInTheDocument();
  });
});
```

Tres notas sobre por qué este test puede fallar de verdad:
- el `vi.spyOn(console, 'error')` sólo calla el reporte que React hace de todo error
  capturado por un boundary; no toca el mecanismo. Verificado que pasa `no-console` (la regla
  reporta accesos de miembro sobre `console`, y acá `console` viaja como argumento).
- el tercer test es el del reinicio: al re-renderizar con otra `llaveDeReinicio`, React
  primero pinta el estado de error viejo y recién después corre `componentDidUpdate`; el
  `rerender` de testing-library está envuelto en `act`, así que las dos pasadas se drenan
  antes del assert. Si el `componentDidUpdate` no existe o compara mal, el assert
  `getByText('La biblioteca abierta')` no encuentra nada.
- el hijo del re-render **no** tira: si tirara, el boundary volvería a capturar y el test
  pasaría con el reinicio roto.

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/components/papel/__tests__/ErrorBoundary.test.tsx`

Esperado: FALLA en la colección con `Failed to resolve import "../ErrorBoundary" from "src/components/papel/__tests__/ErrorBoundary.test.tsx"`.

- [ ] **Paso 3: La cara del fallo (papel y legado)**

Crear `apps/web/src/components/papel/CaraDeFallo.tsx`:

```tsx
import { Link } from 'wouter';

import type { ClaseDeFallo, CopyDeFallo } from './error-boundary-regimen';

const RUTA_DATOS = '/datos-abiertos';

function recargar(): void {
  window.location.reload();
}

export interface CaraDeFalloProps {
  clase: ClaseDeFallo;
  copy: CopyDeFallo;
  /** `true` en las rutas papel; `false` en las 32 legado, que conservan el chrome v1. */
  esPapel: boolean;
}

const BOTON_PAPEL =
  'font-space bg-violeta text-papel hover:bg-tinta px-7 py-[18px] text-[13px] font-bold uppercase tracking-[0.08em] transition-colors';

const BOTON_LEGADO =
  'bg-primary text-primary-foreground px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90';

/**
 * El estado de error dibujado: expediente papel §5 en las rutas papel, chrome
 * v1 en las legado. El chunk caído ofrece UNA sola acción —recargar, que es lo
 * único que lo arregla—; cualquier otro fallo ofrece el link a
 * `/datos-abiertos`, que es lo que hace verdadera la frase de §10.9.
 *
 * Cero imports de `primitives/`: este componente viaja en el chunk inicial de
 * las 54 rutas vía `RootLayout`, y el barril arrastraría medio sistema. Se
 * repite la receta §5, que es lo que el sistema autoriza para layout.
 *
 * Las dos ramas conviven en el mismo archivo, igual que en `RootLayout`: por eso
 * la guardia de tokens hsl de la Tarea 11 lo exime — su `text-muted-foreground`
 * pertenece al chrome v1 y nunca se renderiza dentro de `.papel-root`.
 */
export function CaraDeFallo({ clase, copy, esPapel }: CaraDeFalloProps) {
  const clases = esPapel ? BOTON_PAPEL : BOTON_LEGADO;
  const accion =
    clase === 'chunk' ? (
      <button type="button" onClick={recargar} className={clases}>
        {copy.accion}
      </button>
    ) : (
      <Link href={RUTA_DATOS} className={clases}>
        {copy.accion}
      </Link>
    );

  if (!esPapel) {
    return (
      <section className="bg-background text-foreground flex min-h-[60vh] flex-col items-center justify-center gap-5 px-4 py-20 text-center">
        <p className="text-muted-foreground m-0 font-mono text-sm uppercase tracking-widest">
          {copy.kicker}
        </p>
        <h1 className="font-serif text-3xl font-semibold">{copy.titulo}</h1>
        <p className="text-muted-foreground m-0 max-w-md">{copy.cuerpo}</p>
        {accion}
      </section>
    );
  }

  return (
    <section className="bg-papel text-tinta flex min-h-[60vh] flex-col items-center justify-center gap-5 px-5 py-20 text-center">
      <div className="font-space text-violeta text-[11px] uppercase tracking-[0.16em]">
        {copy.kicker}
      </div>
      <h1 className="font-anton text-[clamp(36px,4.6vw,64px)] leading-[1.05]">{copy.titulo}</h1>
      <p className="font-archivo text-tinta-75 m-0 max-w-[560px] text-pretty text-[17px] leading-[1.75]">
        {copy.cuerpo}
      </p>
      {accion}
    </section>
  );
}
```

Cero hex literal: todo sale de tokens que ya existen en `tailwind.config.ts`
(`papel`, `tinta`, `tinta-75`, `violeta`, `background`, `foreground`, `muted-foreground`,
`primary`, `primary-foreground`). Ninguno de los tres tokens deficientes que la Tarea 12 va a
retintar aparece acá: `tinta-75` da 8,18:1 sobre papel y el `text-muted-foreground` está en
la rama legado, fuera de `.papel-root`, que es exactamente lo que la Tarea 12 deja en pie.

- [ ] **Paso 4: La clase con `getDerivedStateFromError`**

Crear `apps/web/src/components/papel/ErrorBoundary.tsx`:

```tsx
import { Component, type ReactNode } from 'react';

import { CaraDeFallo } from './CaraDeFallo';
import { clasificarFallo, copyDeFallo, type ClaseDeFallo } from './error-boundary-regimen';

export interface ErrorBoundaryProps {
  children: ReactNode;
  /** De `esRutaPapel(location)`. Decide si el fallo se pinta en papel o en chrome v1. */
  esPapel: boolean;
  /** La `location` de wouter. Al cambiar, el boundary se resetea. */
  llaveDeReinicio: string;
}

export interface EstadoErrorBoundary {
  fallo: ClaseDeFallo | null;
}

/**
 * El único límite de error de `apps/web` (spec ① §6b). Se monta en
 * `RootLayout`, o sea POR FUERA del `<Suspense>` que `App.tsx` le pasa como
 * hijo: un chunk `lazy()` que devuelve 404 rechaza la promesa y el `Suspense`
 * no lo atrapa — sin este boundary React 18 desmonta el árbol entero y el
 * lector queda mirando papel en blanco.
 *
 * Se resetea cuando cambia `llaveDeReinicio` para que navegar no quede clavado
 * en el error. No hay `componentDidCatch`: no hay a dónde reportar y
 * `no-console` es error.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, EstadoErrorBoundary> {
  state: EstadoErrorBoundary = { fallo: null };

  static getDerivedStateFromError(error: unknown): EstadoErrorBoundary {
    return { fallo: clasificarFallo(error) };
  }

  componentDidUpdate(anterior: ErrorBoundaryProps): void {
    if (anterior.llaveDeReinicio !== this.props.llaveDeReinicio && this.state.fallo !== null) {
      this.setState({ fallo: null });
    }
  }

  render(): ReactNode {
    const { children, esPapel } = this.props;
    const { fallo } = this.state;
    if (fallo === null) return children;
    return <CaraDeFallo clase={fallo} copy={copyDeFallo(fallo)} esPapel={esPapel} />;
  }
}
```

- [ ] **Paso 5: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/components/papel/__tests__/`

Esperado: PASA — 5 tests nuevos en `ErrorBoundary.test.tsx`, y `MdxPapel.test.tsx` y
`error-boundary-regimen.test.ts` siguen verdes.

- [ ] **Paso 6: Lint, tipos y formato**

Comando:
```bash
pnpm -C apps/web exec eslint src/components/papel/ErrorBoundary.tsx src/components/papel/CaraDeFallo.tsx src/components/papel/__tests__/ErrorBoundary.test.tsx --max-warnings 0
pnpm -C apps/web exec tsc --noEmit
pnpm exec prettier --check apps/web/src/components/papel/ErrorBoundary.tsx apps/web/src/components/papel/CaraDeFallo.tsx apps/web/src/components/papel/__tests__/ErrorBoundary.test.tsx
```
Esperado: los tres verdes. Si `react-refresh/only-export-components` aparece, es que la cara
volvió a `ErrorBoundary.tsx`: se separa, no se silencia.

- [ ] **Paso 7: Commit**

```bash
git add apps/web/src/components/papel/ErrorBoundary.tsx apps/web/src/components/papel/CaraDeFallo.tsx apps/web/src/components/papel/__tests__/ErrorBoundary.test.tsx
git commit -m "feat(web): ErrorBoundary papel con los dos estados y reinicio por ruta"
```

---

### Tarea 8: Montarlo en `RootLayout`, en las dos ramas

**Files:**
- Modify: `apps/web/src/layouts/RootLayout.tsx` (anclado en texto literal — ver Paso 3)
- Test: `apps/web/src/layouts/__tests__/RootLayout.test.tsx` (Create)

**Interfaces:**
- Consumes (Tarea 7): `ErrorBoundary` con `{ children, esPapel: boolean, llaveDeReinicio: string }`
- Consumes (ya existe en el archivo): `const [location] = useLocation();` y `esRutaPapel(location)`
- Produces: ningún export nuevo. `RootLayout` mantiene su firma `({ children }: RootLayoutProps)`.

**Colisión con la Tarea 1, ya resuelta en los anclajes.** La Tarea 1 dejó los dos wrappers
con `id={ID_CONTENIDO}`, `tabIndex={-1}` y `scroll-mt-16`, así que el texto literal que hay
que buscar acá **no** es el `<div className="flex-1">{children}</div>` de HEAD: es el bloque
de tres líneas que escribió la Tarea 1. Los reemplazos del Paso 3 ya vienen escritos contra
ese estado. Esta tarea **no toca los atributos de esos `<div>`**: sólo envuelve la expresión
`{children}` que vive adentro, para que el ancla del skip link quede por FUERA del boundary
y el salto al contenido siga funcionando también cuando lo que se muestra es el expediente
de error.

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/layouts/__tests__/RootLayout.test.tsx` (el directorio ya existe: tiene
`papel-routes.test.ts` y el `RootLayout.a11y.test.tsx` de la Tarea 1):

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { RootLayout } from '../RootLayout';

import type { ReactNode } from 'react';

/** `PapelHeader` dispara `useVocesCount` (react-query) — necesita su provider. */
function ConQueryClient({ children }: { children: ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

function Explota(): never {
  throw new Error('getVoces is not a function');
}

describe('RootLayout — el ErrorBoundary envuelve a los hijos', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('una página que explota no deja la pantalla en blanco: sale el expediente', () => {
    render(
      <ConQueryClient>
        <RootLayout>
          <Explota />
        </RootLayout>
      </ConQueryClient>,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Esto se rompió.');
    expect(screen.getByRole('link', { name: 'Ver los datos abiertos →' })).toBeInTheDocument();
  });

  it('el chrome papel sobrevive al fallo: header y footer siguen en el documento', () => {
    render(
      <ConQueryClient>
        <RootLayout>
          <Explota />
        </RootLayout>
      </ConQueryClient>,
    );

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});
```

El segundo test es el que prueba que el boundary está **dentro** de `RootLayout` y no
alrededor: si envolviera al layout entero, el fallo se llevaría puestos el `<header>` y el
`<footer>` y los dos `getByRole` no encontrarían nada.

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/layouts/__tests__/RootLayout.test.tsx`

Esperado: FALLA los dos tests. Sin boundary, el error de `Explota` sube por el árbol y el
propio `render(...)` tira: `Error: getVoces is not a function`.

- [ ] **Paso 3: Montarlo en las dos ramas**

Tres reemplazos de texto literal en `apps/web/src/layouts/RootLayout.tsx`. Ninguno usa
números de línea.

**(a)** En el bloque de imports `~/`, que hoy está alfabetizado, insertar el import nuevo
entre `DespertarVeil` y `PapelFooter` (`import/order` corre con `alphabetize: asc`).
Reemplazar:

```tsx
import { DespertarVeil } from '~/components/papel/DespertarVeil';
```

por:

```tsx
import { DespertarVeil } from '~/components/papel/DespertarVeil';
import { ErrorBoundary } from '~/components/papel/ErrorBoundary';
```

**(b)** Rama papel — el wrapper que está entre `<PapelHeader />` y `<PapelFooter />`, tal
como lo dejó la Tarea 1. Reemplazar:

```tsx
        <PapelHeader />
        <div id={ID_CONTENIDO} tabIndex={-1} className="flex-1 scroll-mt-16">
          {children}
        </div>
        <PapelFooter />
```

por:

```tsx
        <PapelHeader />
        <div id={ID_CONTENIDO} tabIndex={-1} className="flex-1 scroll-mt-16">
          <ErrorBoundary esPapel llaveDeReinicio={location}>
            {children}
          </ErrorBoundary>
        </div>
        <PapelFooter />
```

**(c)** Rama legado — el wrapper que está antes de `<Footer />`. Los dos `<div>` de apertura
son idénticos desde la Tarea 1, así que el localizador incluye el pie: es lo que los
distingue. Reemplazar:

```tsx
      <div id={ID_CONTENIDO} tabIndex={-1} className="flex-1 scroll-mt-16">
        {children}
      </div>
      <Footer />
```

por:

```tsx
      <div id={ID_CONTENIDO} tabIndex={-1} className="flex-1 scroll-mt-16">
        <ErrorBoundary esPapel={false} llaveDeReinicio={location}>
          {children}
        </ErrorBoundary>
      </div>
      <Footer />
```

No se declara ninguna variable local nueva: `location` ya está en scope
(`const [location] = useLocation();`) y `esPapel` va literal en cada rama, así que este paso
no choca con el `esRutaPapel(location)` que decide la bifurcación.

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/layouts`

Esperado: PASA — los 2 tests nuevos de `RootLayout.test.tsx`, los 4 de
`RootLayout.a11y.test.tsx` (Tarea 1), que siguen verdes porque el ancla y el skip link
quedaron por fuera del boundary, y los 18 de `papel-routes.test.ts`, que no se tocan.

- [ ] **Paso 5: Verificación completa antes de commitear**

Comando (desde `/Users/juanb/Desktop/ElInstantedelHombreGris/v2`):
```bash
pnpm exec prettier --check apps/web/src/layouts/RootLayout.tsx apps/web/src/layouts/__tests__/RootLayout.test.tsx
pnpm verify
```
Esperado: prettier limpio y `pnpm verify` verde (lint + type-check + test + build).

- [ ] **Paso 6: Commit**

```bash
git add apps/web/src/layouts/RootLayout.tsx apps/web/src/layouts/__tests__/RootLayout.test.tsx
git commit -m "feat(web): montar el ErrorBoundary en las dos ramas de RootLayout"
```

---

## Bloque B6 — Contraste AA con escala dual (Tareas 9–14)

> Entrega §7 de `docs/specs/2026-07-26-el-sustrato.md` (D3): tres tokens de texto
> nuevos, el mapa viejo→nuevo aplicado, dos excepciones con allowlist, los dos
> `.dc.html` regenerados, §2 de la ley reescrito y una guardia que calcula el
> ratio WCAG 2.1 de todo par texto/fondo declarado. Depende sólo de B0-D3.

**Conteo real, verificado con `grep` sobre HEAD (`45a079a`) — no el de la spec.**

| token | ocurrencias en `apps/web/src` | archivos |
|---|---|---|
| `text-tinta-50` | **106** (incluye 2 `placeholder:` y 1 `prose-th:`) | 44 |
| `text-tinta-30` | **39** (incluye 1 `disabled:` y 1 regex de test) | 24 |
| `text-oscuro-tenue` | **5** (4 en `PapelFooter.tsx`, 1 en `RegistroDelMapa.tsx`) | 2 |
| `text-ambar` | **2** (los dos en archivos `.ts` de datos) | 2 |
| **unión** | 152 | **56** |

Correcciones a §7 de la spec, que hay que asumir al ejecutar:

- La spec dice «25 `text-tinta-30` vivos en TSX»: son **39**. De esas, **35**
  migran y **4** sobreviven — las tres de la allowlist (`FilaIndice.tsx:26`,
  `FilaIndiceExpandible.tsx:45`, `BotonPapel.tsx:37`) más el regex
  `/text-tinta-30/` de `primitives.test.tsx:43`, que no es una clase.
- La spec dice «49 archivos afectados»: la unión real es **56**. Dos de ellos
  (`primitives/BotonPapel.tsx` y `primitives/primitives.test.tsx`) sólo
  contienen ocurrencias allowlisteadas, así que el barrido modifica **54**.
  `App.tsx` va aparte (Tarea 11) porque su token es `text-muted-foreground`.
- Los `.dc.html` sí cierran exacto: **552 hex en total** (421 + 131) y **98
  ocurrencias de los tres hex deficientes** (`#B5B1A8` 22, `#7A756A` 66,
  `#5C594F` 10). `#A16C00` **no** entra en las 98 y no se toca en los
  especímenes: sus 7 apariciones son fondos y valores de paleta JS.
- Dentro de `.papel-root` el único `text-muted-foreground` vivo es el de
  `PageFallback`. `components/papel/**` tiene **cero** — salvo el de la rama
  legado de `CaraDeFallo.tsx` (Tarea 7), que por eso está exento de la guardia
  de la Tarea 11, igual que `RootLayout.tsx`.

---

### Tarea 9: Los tres tokens de texto y la guardia de contraste

**Files:**
- Create: `apps/web/src/__tests__/contraste.test.ts`
- Modify: `docs/design-system/tokens.css` (anclado en la línea literal `  --ambar: #A16C00;            /* necesidad · método */`)
- Modify: `apps/web/tailwind.config.ts` (anclado en los literales `          30: '#B5B1A8',`, `          barra: '#241F17',` y `        ambar: '#A16C00', // necesidad · método`)

**Interfaces:**
- Produces (tokens Tailwind): `text-tinta-texto-debil` / `border-tinta-texto-debil` / `bg-tinta-texto-debil` = `#6A655B`; `text-oscuro-texto-debil` = `#8A867C`; `text-ambar-texto` = `#8F6000`. `ambar` deja de ser string y pasa a objeto `{ DEFAULT: '#A16C00', texto: '#8F6000' }`, así que `bg-ambar` y `border-ambar` no cambian de valor.
- Produces (custom properties de `tokens.css`): `--tinta-texto-debil`, `--oscuro-texto-debil`, `--ambar-texto`.
- Produces (test): `apps/web/src/__tests__/contraste.test.ts` — guardia permanente, corre dentro de `pnpm -C apps/web test:unit` (`vitest run src/`).

- [ ] **Paso 1: Escribir el test que falla**

Crear `apps/web/src/__tests__/contraste.test.ts` con exactamente este contenido:

```ts
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Guardia de contraste — §7 de `docs/specs/2026-07-26-el-sustrato.md` (D3).
 * Calcula el ratio WCAG 2.1 de TODOS los pares texto/fondo declarados del
 * sitio —incluidos los tokens hsl semánticos de `index.css`— y falla bajo 4,5.
 * Es la guardia de la DoD #5: «ningún par texto/fondo declarado baja de
 * 4,5:1 — verificado por el test, no a ojo».
 */

const RAIZ_V2 = fileURLToPath(new URL('../../../..', import.meta.url));

const TOKENS_CSS = readFileSync(join(RAIZ_V2, 'docs/design-system/tokens.css'), 'utf8');
const TAILWIND_CONFIG = readFileSync(join(RAIZ_V2, 'apps/web/tailwind.config.ts'), 'utf8');
const INDEX_CSS = readFileSync(join(RAIZ_V2, 'apps/web/src/index.css'), 'utf8');

/** WCAG 2.1 §1.4.3, texto normal. */
const MINIMO_AA = 4.5;

/**
 * WCAG 2.1, «relative luminance»:
 *   Cs = C8bit / 255
 *   Clin = Cs / 12.92                    si Cs <= 0.03928
 *   Clin = ((Cs + 0.055) / 1.055) ^ 2.4  si no
 *   L = 0.2126 * Rlin + 0.7152 * Glin + 0.0722 * Blin
 */
function canalLineal(valorSrgb: number): number {
  const c = valorSrgb / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminanciaRelativa(hex: string): number {
  const limpio = hex.replace('#', '');
  const r = Number.parseInt(limpio.slice(0, 2), 16);
  const g = Number.parseInt(limpio.slice(2, 4), 16);
  const b = Number.parseInt(limpio.slice(4, 6), 16);
  return 0.2126 * canalLineal(r) + 0.7152 * canalLineal(g) + 0.0722 * canalLineal(b);
}

/** WCAG 2.1: (Lclaro + 0.05) / (Loscuro + 0.05). */
function ratioDeContraste(unHex: string, otroHex: string): number {
  const a = luminanciaRelativa(unHex);
  const b = luminanciaRelativa(otroHex);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** Los tokens semánticos de `index.css` se declaran en hsl sin coma. */
function hslAHex(h: number, s: number, l: number): string {
  const sN = s / 100;
  const lN = l / 100;
  const c = (1 - Math.abs(2 * lN - 1)) * sN;
  const hP = h / 60;
  const x = c * (1 - Math.abs((hP % 2) - 1));
  const m = lN - c / 2;
  const tramo: readonly [number, number, number] =
    hP < 1
      ? [c, x, 0]
      : hP < 2
        ? [x, c, 0]
        : hP < 3
          ? [0, c, x]
          : hP < 4
            ? [0, x, c]
            : hP < 5
              ? [x, 0, c]
              : [c, 0, x];
  const aByte = (v: number): string =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  return `#${aByte(tramo[0])}${aByte(tramo[1])}${aByte(tramo[2])}`;
}

function hexDeTokensCss(nombre: string): string | undefined {
  return new RegExp(`--${nombre}:\\s*(#[0-9A-Fa-f]{6})`).exec(TOKENS_CSS)?.[1];
}

/** El bloque `<grupo>: { … }` de `colors` en `tailwind.config.ts`. */
function bloqueDeColorTailwind(grupo: string): string {
  const inicio = TAILWIND_CONFIG.indexOf(`${grupo}: {`);
  if (inicio === -1) return '';
  const fin = TAILWIND_CONFIG.indexOf('}', inicio);
  return fin === -1 ? '' : TAILWIND_CONFIG.slice(inicio, fin);
}

function hexDeTailwind(grupo: string, clave: string): string | undefined {
  return new RegExp(`'?${clave}'?:\\s*'(#[0-9A-Fa-f]{6})'`).exec(bloqueDeColorTailwind(grupo))?.[1];
}

function hslDeIndexCss(nombre: string): readonly [number, number, number] | undefined {
  const hallado = new RegExp(`--${nombre}:\\s*([\\d.]+)\\s+([\\d.]+)%\\s+([\\d.]+)%`).exec(INDEX_CSS);
  const h = hallado?.[1];
  const s = hallado?.[2];
  const l = hallado?.[3];
  if (h === undefined || s === undefined || l === undefined) return undefined;
  return [Number(h), Number(s), Number(l)];
}

const TINTA_TEXTO_DEBIL = '#6A655B';
const OSCURO_TEXTO_DEBIL = '#8A867C';
const AMBAR_TEXTO = '#8F6000';

const PAPEL = '#F2EFE7';
const PAPEL_CRUDO = '#FBFAF4';
const PAPEL_PRESIONADO = '#ECE8DC';
const TINTA = '#16130E';

interface ParDeclarado {
  readonly donde: string;
  readonly texto: string;
  readonly fondo: string;
}

/**
 * Cada par existe de verdad en el árbol. No es el producto cartesiano: el
 * sello sobre papel presionado, por ejemplo, no se declara en ninguna parte
 * y da 4,35 — meterlo acá sería inventar una falla.
 */
const PARES: readonly ParDeclarado[] = [
  { donde: 'tinta sobre papel — títulos y texto principal', texto: TINTA, fondo: PAPEL },
  { donde: 'tinta-90 sobre papel — cuerpo de lectura', texto: '#33302A', fondo: PAPEL },
  { donde: 'tinta-75 sobre papel — cuerpo secundario', texto: '#4A463D', fondo: PAPEL },
  {
    donde: 'tinta-texto-debil sobre papel — metadatos, kickers, numeración de nav',
    texto: TINTA_TEXTO_DEBIL,
    fondo: PAPEL,
  },
  { donde: 'violeta sobre papel — links y kickers accionables', texto: '#5227CC', fondo: PAPEL },
  { donde: 'sello sobre papel — urgencia y sellos', texto: '#C23B22', fondo: PAPEL },
  { donde: 'verde sobre papel — compromiso y territorio', texto: '#1A7A4A', fondo: PAPEL },
  { donde: 'ambar-texto sobre papel — necesidad y método', texto: AMBAR_TEXTO, fondo: PAPEL },
  { donde: 'cian sobre papel — recurso', texto: '#0F6B8A', fondo: PAPEL },
  { donde: 'tinta sobre papel-crudo — paneles y cards alternas', texto: TINTA, fondo: PAPEL_CRUDO },
  { donde: 'tinta-90 sobre papel-crudo', texto: '#33302A', fondo: PAPEL_CRUDO },
  { donde: 'tinta-75 sobre papel-crudo', texto: '#4A463D', fondo: PAPEL_CRUDO },
  {
    donde: 'tinta-texto-debil sobre papel-crudo — meta de panel',
    texto: TINTA_TEXTO_DEBIL,
    fondo: PAPEL_CRUDO,
  },
  { donde: 'violeta sobre papel-crudo', texto: '#5227CC', fondo: PAPEL_CRUDO },
  {
    donde: 'tinta sobre papel-presionado — título de fila en hover',
    texto: TINTA,
    fondo: PAPEL_PRESIONADO,
  },
  {
    donde: 'tinta-texto-debil sobre papel-presionado — numeración y flecha en hover',
    texto: TINTA_TEXTO_DEBIL,
    fondo: PAPEL_PRESIONADO,
  },
  { donde: 'violeta sobre papel-presionado', texto: '#5227CC', fondo: PAPEL_PRESIONADO },
  { donde: 'oscuro-texto sobre tinta — página oscura y pie', texto: '#F2EFE7', fondo: TINTA },
  { donde: 'oscuro-secundario sobre tinta', texto: '#C9C5BA', fondo: TINTA },
  { donde: 'oscuro-meta sobre tinta', texto: '#8E8A82', fondo: TINTA },
  {
    donde: 'oscuro-texto-debil sobre tinta — rótulos de columna y barra del pie',
    texto: OSCURO_TEXTO_DEBIL,
    fondo: TINTA,
  },
  { donde: 'violeta-claro sobre tinta', texto: '#9D85E8', fondo: TINTA },
];

describe('escala dual de texto — los tres tokens nuevos (§7 · D3)', () => {
  it('tokens.css declara los tres con el hex exacto', () => {
    expect(hexDeTokensCss('tinta-texto-debil')).toBe(TINTA_TEXTO_DEBIL);
    expect(hexDeTokensCss('oscuro-texto-debil')).toBe(OSCURO_TEXTO_DEBIL);
    expect(hexDeTokensCss('ambar-texto')).toBe(AMBAR_TEXTO);
  });

  it('tailwind.config.ts declara los tres con el MISMO hex — la ley exige el mismo commit', () => {
    expect(hexDeTailwind('tinta', 'texto-debil')).toBe(TINTA_TEXTO_DEBIL);
    expect(hexDeTailwind('oscuro', 'texto-debil')).toBe(OSCURO_TEXTO_DEBIL);
    expect(hexDeTailwind('ambar', 'texto')).toBe(AMBAR_TEXTO);
  });

  it('los hex viejos sobreviven como tokens de superficie', () => {
    expect(hexDeTailwind('tinta', '50')).toBe('#7A756A');
    expect(hexDeTailwind('tinta', '30')).toBe('#B5B1A8');
    expect(hexDeTailwind('oscuro', 'tenue')).toBe('#5C594F');
    expect(hexDeTailwind('ambar', 'DEFAULT')).toBe('#A16C00');
  });
});

describe('pares texto/fondo declarados — ninguno baja de 4,5:1', () => {
  it.each(PARES)('$donde', ({ texto, fondo }) => {
    expect(ratioDeContraste(texto, fondo)).toBeGreaterThanOrEqual(MINIMO_AA);
  });

  it('los tokens hsl semánticos de index.css pasan AA sobre el fondo legado', () => {
    const fondo = hslDeIndexCss('background');
    const texto = hslDeIndexCss('foreground');
    const meta = hslDeIndexCss('muted-foreground');
    expect(fondo).toBeDefined();
    expect(texto).toBeDefined();
    expect(meta).toBeDefined();
    if (fondo === undefined || texto === undefined || meta === undefined) return;
    const fondoHex = hslAHex(fondo[0], fondo[1], fondo[2]);
    expect(ratioDeContraste(hslAHex(texto[0], texto[1], texto[2]), fondoHex)).toBeGreaterThanOrEqual(
      MINIMO_AA,
    );
    expect(ratioDeContraste(hslAHex(meta[0], meta[1], meta[2]), fondoHex)).toBeGreaterThanOrEqual(
      MINIMO_AA,
    );
  });

  it('los tres hex deficientes que quedan como superficie NO pasan AA como texto', () => {
    expect(ratioDeContraste('#7A756A', PAPEL)).toBeLessThan(MINIMO_AA);
    expect(ratioDeContraste('#B5B1A8', PAPEL)).toBeLessThan(MINIMO_AA);
    expect(ratioDeContraste('#5C594F', TINTA)).toBeLessThan(MINIMO_AA);
    expect(ratioDeContraste('#A16C00', PAPEL)).toBeLessThan(MINIMO_AA);
    expect(ratioDeContraste(hslAHex(220, 5, 65), PAPEL)).toBeLessThan(MINIMO_AA);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/__tests__/contraste.test.ts`

Esperado: FALLA. `tokens.css declara los tres con el hex exacto` falla con
`expected undefined to be '#6A655B'`; `tailwind.config.ts declara los tres…`
falla igual; `los hex viejos sobreviven…` falla en
`hexDeTailwind('ambar', 'DEFAULT')` con `expected undefined to be '#A16C00'`
(hoy `ambar` es un string, no un bloque `ambar: {`).

- [ ] **Paso 3: Agregar los tres tokens a `docs/design-system/tokens.css`**

Reemplazar el bloque `/* acentos semánticos */` completo, que hoy dice:

```css
  /* acentos semánticos */
  --violeta: #5227CC;          /* marca · accionable · sueño */
  --violeta-hover: #3D1BA3;          /* hover de botones y links violeta */
  --violeta-claro: #9D85E8;    /* violeta sobre fondo tinta */
  --rojo-sello: #C23B22;       /* basta · urgencia · sellos */
  --verde: #1A7A4A;            /* compromiso · territorio */
  --ambar: #A16C00;            /* necesidad · método */
  --cian: #0F6B8A;             /* recurso */
```

por:

```css
  /* acentos semánticos */
  --violeta: #5227CC;          /* marca · accionable · sueño */
  --violeta-hover: #3D1BA3;          /* hover de botones y links violeta */
  --violeta-claro: #9D85E8;    /* violeta sobre fondo tinta */
  --rojo-sello: #C23B22;       /* basta · urgencia · sellos */
  --verde: #1A7A4A;            /* compromiso · territorio */
  --ambar: #A16C00;            /* necesidad · método — SUPERFICIE (3,92:1) */
  --cian: #0F6B8A;             /* recurso */
  /* escala dual §2 — SÓLO texto. Los de arriba no pintan letras. */
  --tinta-texto-debil: #6A655B;    /* 5,0411 sobre papel · 5,5394 sobre papel-crudo */
  --oscuro-texto-debil: #8A867C;   /* 5,1003 sobre tinta */
  --ambar-texto: #8F6000;          /* 4,7580 sobre papel */
```

- [ ] **Paso 4: Agregar las tres claves a `apps/web/tailwind.config.ts`, en el MISMO commit**

Reemplazar `          30: '#B5B1A8',` (última línea del bloque `tinta`) por:

```ts
          30: '#B5B1A8',
          // Escala dual §2 — SÓLO texto (5,0411 sobre papel · 5,5394 sobre papel-crudo).
          'texto-debil': '#6A655B',
```

Reemplazar `          barra: '#241F17',` (última línea del bloque `oscuro`) por:

```ts
          barra: '#241F17',
          // Escala dual §2 — SÓLO texto (5,1003 sobre tinta).
          'texto-debil': '#8A867C',
```

Reemplazar `        ambar: '#A16C00', // necesidad · método` por:

```ts
        // `ambar` es superficie (3,9215 sobre papel); `ambar-texto` es el de texto (4,7580).
        ambar: { DEFAULT: '#A16C00', texto: '#8F6000' },
```

- [ ] **Paso 5: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/__tests__/contraste.test.ts`

Esperado: PASA — **27 `it` en verde**: 3 del bloque de tokens, 22 de `it.each(PARES)`, y los 2 sueltos (`los tokens hsl semánticos…` y `los tres hex deficientes que quedan como superficie…`).

- [ ] **Paso 6: Commit**

```bash
git add apps/web/src/__tests__/contraste.test.ts docs/design-system/tokens.css apps/web/tailwind.config.ts
git commit -m "feat(web): escala dual de texto — tres tokens AA y la guardia de contraste

tinta-texto-debil #6A655B (5,0411 sobre papel), oscuro-texto-debil #8A867C
(5,1003 sobre tinta) y ambar-texto #8F6000 (4,7580 sobre papel) entran a
tokens.css y a tailwind.config.ts en el mismo commit, como manda la ley.
Los hex viejos sobreviven para bordes, divisores, superficies y palitos.
El test calcula el ratio WCAG 2.1 de todo par declarado y falla bajo 4,5."
```

---

### Tarea 10: `aria-hidden` en la numeración de expediente y en la flecha

**Files:**
- Modify: `apps/web/src/components/papel/primitives/FilaIndice.tsx` (anclado en `      <span className="font-space text-tinta-30 text-sm">{num}</span>` y en `      <span className="font-space text-tinta-50 justify-self-end">→</span>`)
- Modify: `apps/web/src/components/papel/primitives/FilaIndiceExpandible.tsx` (anclado en `        <span className="font-space text-tinta-30 text-sm">{num}</span>`)
- Test: `apps/web/src/components/papel/primitives/primitives.test.tsx`

**Interfaces:**
- Consumes: `FilaIndice({ num, titulo, href, className }: FilaIndiceProps)` y `FilaIndiceExpandible({ num, encabezado, abierta, onToggle, idPanel, className, children }: FilaIndiceExpandibleProps)` — ninguna firma cambia.
- Produces: la justificación de la primera excepción de la allowlist de §7 — la numeración es decoración y sale de la ecuación de contraste porque nadie la lee.

- [ ] **Paso 1: Escribir el test que falla**

En `apps/web/src/components/papel/primitives/primitives.test.tsx`, dentro del
`describe('FilaIndice', …)`, agregar después del `it` existente (el que termina
en `expect(link.className).toMatch(/grid-cols-\[56px_1fr_40px\]/);` y su `});`):

```tsx
  it('la numeración y la flecha son decoración pura: van aria-hidden (§7 · D3)', () => {
    render(<FilaIndice num="01" titulo="PLANDEM" href="/planes/plandem" />);
    expect(screen.getByText('01')).toHaveAttribute('aria-hidden');
    expect(screen.getByText('→')).toHaveAttribute('aria-hidden');
  });
```

Y dentro del `describe('FilaIndiceExpandible', …)`, después del `it` que termina
en `expect(screen.getByText('+')).toHaveAttribute('aria-hidden');` y su `});`:

```tsx
  it('la numeración de expediente es decoración pura: va aria-hidden (§7 · D3)', () => {
    render(
      <FilaIndiceExpandible
        num="01"
        encabezado="PLANSAL"
        abierta={false}
        onToggle={vi.fn()}
        idPanel="panel-plansal"
      >
        Contenido del pliegue
      </FilaIndiceExpandible>,
    );
    expect(screen.getByText('01')).toHaveAttribute('aria-hidden');
  });
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/components/papel/primitives/primitives.test.tsx`

Esperado: FALLA con dos casos rojos —
`expected element to have attribute "aria-hidden"` en `FilaIndice > la
numeración y la flecha…` y en `FilaIndiceExpandible > la numeración de
expediente…`.

- [ ] **Paso 3: Marcar los tres nodos en `FilaIndice.tsx`**

Reemplazar estas dos líneas de `apps/web/src/components/papel/primitives/FilaIndice.tsx`:

```tsx
      <span className="font-space text-tinta-30 text-sm">{num}</span>
      <span className="text-[17px] leading-snug">{titulo}</span>
      <span className="font-space text-tinta-50 justify-self-end">→</span>
```

por:

```tsx
      <span aria-hidden className="font-space text-tinta-30 text-sm">
        {num}
      </span>
      <span className="text-[17px] leading-snug">{titulo}</span>
      <span aria-hidden className="font-space text-tinta-50 justify-self-end">
        →
      </span>
```

Y actualizar el comentario de bloque del componente, reemplazando:

```tsx
/**
 * Fila de índice §5 — listas de planes/ensayos: numeración mono tinta-30 ·
 * título · flecha. Grilla 56px/1fr/40px baseline-aligned, hover
 * papel-presionado.
 */
```

por:

```tsx
/**
 * Fila de índice §5 — listas de planes/ensayos: numeración mono tinta-30 ·
 * título · flecha. Grilla 56px/1fr/40px baseline-aligned, hover
 * papel-presionado.
 *
 * La numeración y la flecha van `aria-hidden`: son decoración, el nombre
 * accesible del link es el título. Por eso la numeración conserva `tinta-30`
 * (1,86:1) — primera de las dos excepciones de la allowlist de §7.
 */
```

- [ ] **Paso 4: Marcar la numeración en `FilaIndiceExpandible.tsx`**

Reemplazar en `apps/web/src/components/papel/primitives/FilaIndiceExpandible.tsx`:

```tsx
        <span className="font-space text-tinta-30 text-sm">{num}</span>
```

por:

```tsx
        <span aria-hidden className="font-space text-tinta-30 text-sm">
          {num}
        </span>
```

Y en su comentario de bloque, reemplazar la línea:

```tsx
 * dejó apuntada). La fila es un botón real de ancho completo; el glifo
```

por:

```tsx
 * dejó apuntada). La numeración va `aria-hidden` (decoración: conserva
 * `tinta-30` por la allowlist de §7). La fila es un botón real de ancho completo; el glifo
```

- [ ] **Paso 5: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/components/papel/primitives/primitives.test.tsx`

Esperado: PASA — los dos casos nuevos en verde y los 16 anteriores sin
regresiones (en particular `renders a wouter Link with the index row content
and href`, que sigue encontrando `01` con `getByText`, y el `getByRole('link',
{ name: /PLANDEM/ })`, cuyo nombre accesible ahora es sólo el título).

- [ ] **Paso 6: Commit**

```bash
git add apps/web/src/components/papel/primitives/FilaIndice.tsx apps/web/src/components/papel/primitives/FilaIndiceExpandible.tsx apps/web/src/components/papel/primitives/primitives.test.tsx
git commit -m "fix(web): la numeración y la flecha de las filas de índice van aria-hidden

Son decoración: el nombre accesible del link es el título. Marcarlas las saca
de la ecuación de contraste y habilita la primera excepción de la allowlist
de §7 — tinta-30 sobrevive ahí, y sólo ahí, como token de superficie."
```

---

### Tarea 11: `PageFallback` y la guardia de tokens hsl dentro de `.papel-root`

**Files:**
- Modify: `apps/web/src/App.tsx` (anclado en `      <span className="text-muted-foreground font-mono text-sm">`)
- Test: `apps/web/src/__tests__/contraste.test.ts` (se le agrega un `describe`)

**Interfaces:**
- Consumes: `text-tinta-texto-debil` (Tarea 9) y `font-space` (familia Space Mono ya declarada en `tailwind.config.ts`).
- Produces: la guardia `los tokens hsl semánticos no se renderizan dentro de .papel-root`, que sostiene la cláusula de §7 «incluidos los tokens hsl semánticos de `index.css` que se rendericen dentro de `.papel-root`».

`PageFallback` es el **primer texto de toda visita fría** a las 48 rutas
`lazy()`: hoy es `text-muted-foreground font-mono` = `#A1A4AA` sobre papel =
**2,1741:1**, peor que `tinta-50`. Encima `font-mono` es JetBrains Mono, una de
las tres familias que borra la tarea 7.3 del master plan.

- [ ] **Paso 1: Escribir el test que falla**

Agregar al final de `apps/web/src/__tests__/contraste.test.ts` este bloque, y
sumar `readdirSync` al import de `node:fs` y `relative` al de `node:path`, de
modo que las dos primeras líneas del archivo queden:

```ts
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
```

Bloque nuevo, al final del archivo:

```ts
const SRC = fileURLToPath(new URL('..', import.meta.url));

function archivosFuente(dir: string): readonly string[] {
  const salida: string[] = [];
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const completo = join(dir, entrada.name);
    if (entrada.isDirectory()) {
      salida.push(...archivosFuente(completo));
    } else if (/\.tsx?$/.test(entrada.name)) {
      salida.push(completo);
    }
  }
  return salida;
}

/** Si un archivo declara alguno de estos, se pinta sobre papel. */
const TOKEN_PAPEL = /\b(?:bg-papel|bg-tinta|text-tinta|text-papel|border-papel-borde)\b/;

/** `--muted-foreground` resuelve a `#A1A4AA`: 2,1741:1 sobre papel. */
const TOKEN_HSL_DE_TEXTO = /\btext-muted-foreground\b/;

/**
 * `App.tsx` no declara ningún token papel y aun así su `PageFallback` se
 * renderiza dentro de `.papel-root` en 22 de las 54 rutas: va a mano.
 */
const SIEMPRE_PAPEL: readonly string[] = ['App.tsx'];

/**
 * Bifurcaciones papel/legado: declaran los dos chromes en el mismo archivo,
 * así que la heurística de arriba no las puede clasificar. `CaraDeFallo.tsx`
 * (Tarea 7) es exactamente ese caso: su `text-muted-foreground` vive en la
 * rama `!esPapel`, que sólo se pinta en las 32 rutas legado.
 */
const EXENTOS_DE_LA_GUARDIA: readonly string[] = [
  'layouts/RootLayout.tsx',
  'components/papel/CaraDeFallo.tsx',
];

describe('los tokens hsl semánticos no se renderizan dentro de .papel-root', () => {
  it('ningún archivo con tokens papel usa text-muted-foreground', () => {
    const ofensores: string[] = [];
    for (const archivo of archivosFuente(SRC)) {
      const relativo = relative(SRC, archivo);
      if (EXENTOS_DE_LA_GUARDIA.includes(relativo)) continue;
      const texto = readFileSync(archivo, 'utf8');
      const esPapel =
        SIEMPRE_PAPEL.includes(relativo) || relativo.includes('papel') || TOKEN_PAPEL.test(texto);
      if (esPapel && TOKEN_HSL_DE_TEXTO.test(texto)) ofensores.push(relativo);
    }
    expect(ofensores).toEqual([]);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/__tests__/contraste.test.ts`

Esperado: FALLA con `expected [ 'App.tsx' ] to deeply equal []`.

- [ ] **Paso 3: Repintar `PageFallback`**

Reemplazar en `apps/web/src/App.tsx`:

```tsx
function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="text-muted-foreground font-mono text-sm">
        Cargando — menos que un trámite.
      </span>
    </div>
  );
}
```

por:

```tsx
/**
 * El primer texto de toda visita fría: las 48 páginas entran por `lazy()`.
 * Vive dentro de `.papel-root` en las rutas papel, así que se pinta con la
 * escala de texto (§7 · D3) y con Space Mono — `font-mono` es JetBrains, una
 * de las tres familias que borra la tarea 7.3 del master plan.
 */
function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <span className="text-tinta-texto-debil font-space text-sm">
        Cargando — menos que un trámite.
      </span>
    </div>
  );
}
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/__tests__/contraste.test.ts`

Esperado: PASA — `ofensores` queda en `[]`.

- [ ] **Paso 5: Commit**

```bash
git add apps/web/src/App.tsx apps/web/src/__tests__/contraste.test.ts
git commit -m "fix(web): el primer texto de toda carga fría deja de dar 2,17:1

PageFallback pasa de text-muted-foreground font-mono (#A1A4AA sobre papel)
a text-tinta-texto-debil font-space: 5,0411:1 y una familia que sobrevive
a 7.3. La guardia nueva rechaza cualquier text-muted-foreground en un
archivo que se pinte sobre papel."
```

---

### Tarea 12: El retinte completo — 54 archivos TSX/TS y los dos `.dc.html`

**Files:**
- Modify: los 54 archivos de `apps/web/src` que contienen `text-tinta-50`, `text-tinta-30`, `text-oscuro-tenue` o `text-ambar`, **descubiertos con `grep` en el momento de correr** y no por lista fija — este bloque corre después de que A (y quizá C) ya tocaron el árbol. Entre ellos, anclados en texto literal:
  - `apps/web/src/components/papel/PapelFooter.tsx` — sus **cuatro** `text-oscuro-tenue`: tres en la línea literal `            <div className="font-space text-oscuro-tenue mb-4 text-[11px] font-bold uppercase tracking-[0.14em]">` (rótulos «Recorrido», «Principios», «El siguiente paso») y uno en `        <div className="font-space text-oscuro-tenue flex flex-wrap justify-between gap-4 pt-6 text-[11px] max-[560px]:flex-col">` (barra inferior). **Entran acá, no en el plan C**: la Tarea 14 de C sólo cambia el COPY del pie.
  - `apps/web/src/pages/ElMapa/el-mapa-data.ts` — `  necesidad: 'text-ambar',`
  - `apps/web/src/pages/ElMandatoVivo/el-mandato-data.ts` — `  alta: 'border-ambar text-ambar',`
- **NO se modifican** (allowlist de §7): `apps/web/src/components/papel/primitives/BotonPapel.tsx`, `apps/web/src/components/papel/primitives/FilaIndice.tsx` (sólo su `text-tinta-30`; su `text-tinta-50` sí migra), `apps/web/src/components/papel/primitives/FilaIndiceExpandible.tsx` (ídem), `apps/web/src/components/papel/primitives/primitives.test.tsx` y `apps/web/src/__tests__/contraste.test.ts` — la guardia es el único archivo del árbol autorizado a **nombrar** los tokens que prohíbe, y si el barrido la tocara reescribiría sus propios asserts.
- Modify: `docs/design-system/BASTA-v2.dc.html`, `docs/design-system/Especimen.dc.html` — **en el MISMO commit**, como manda §7: son el insumo desde el que ② construye cada página y el gate 7.4 sólo greppea hex en TSX, así que nada más detectaría la deriva.
- Test: `apps/web/src/__tests__/contraste.test.ts` (se le agregan dos `describe`)

**Interfaces:**
- Consumes: `text-tinta-texto-debil`, `text-oscuro-texto-debil`, `text-ambar-texto` (Tarea 9); `archivosFuente`, `SRC` y `relative`, que ya están en el archivo desde la Tarea 11.
- Produces: cero `text-tinta-50` / `text-oscuro-tenue` / `text-ambar` en el árbol; `text-tinta-30` sólo en los tres sitios de la allowlist; cero hex deficiente pintando texto en los dos especímenes.

- [ ] **Paso 1: Escribir el test que falla**

Agregar al final de `apps/web/src/__tests__/contraste.test.ts`:

```ts
/** Mapa viejo→nuevo de §7: en `text-*` estos tokens están prohibidos. */
const TOKENS_DE_SUPERFICIE_EN_TEXTO =
  /(^|[\s"'`:])text-(?:tinta-50|tinta-30|oscuro-tenue|ambar)(\s|$|["'`])/;

/**
 * Los tres sitios de la allowlist de §7, más el regex del test de
 * primitivas —que no es una clase— y esta misma guardia, que tiene que poder
 * escribir los tokens prohibidos para poder prohibirlos.
 */
const ALLOWLIST_TEXTO: readonly string[] = [
  'components/papel/primitives/BotonPapel.tsx',
  'components/papel/primitives/FilaIndice.tsx',
  'components/papel/primitives/FilaIndiceExpandible.tsx',
  'components/papel/primitives/primitives.test.tsx',
  '__tests__/contraste.test.ts',
];

describe('mapa viejo→nuevo — ningún token de superficie pinta texto', () => {
  it('sólo los archivos de la allowlist conservan un token viejo en text-*', () => {
    const ofensores: string[] = [];
    for (const archivo of archivosFuente(SRC)) {
      const relativo = relative(SRC, archivo);
      if (ALLOWLIST_TEXTO.includes(relativo)) continue;
      const lineas = readFileSync(archivo, 'utf8').split('\n');
      lineas.forEach((linea, i) => {
        if (TOKENS_DE_SUPERFICIE_EN_TEXTO.test(linea)) ofensores.push(`${relativo}:${i + 1}`);
      });
    }
    expect(ofensores).toEqual([]);
  });

  it('la allowlist conserva tinta-30 exactamente donde §7 lo permite', () => {
    const boton = readFileSync(join(SRC, 'components/papel/primitives/BotonPapel.tsx'), 'utf8');
    expect(boton).toContain("const DISABLED_CLASSES = 'text-tinta-30 border border-tinta-30");
    const fila = readFileSync(join(SRC, 'components/papel/primitives/FilaIndice.tsx'), 'utf8');
    expect(fila).toContain('aria-hidden className="font-space text-tinta-30 text-sm"');
    expect(fila).not.toContain('text-tinta-50');
  });
});

const ESPECIMENES: readonly string[] = [
  'docs/design-system/BASTA-v2.dc.html',
  'docs/design-system/Especimen.dc.html',
];

/** Los tres hex que §7 declara deficientes como color de texto. */
const HEX_DEFICIENTES: readonly string[] = ['#B5B1A8', '#7A756A', '#5C594F'];

/**
 * Las cinco apariciones que NO son un par texto/fondo y por eso sobreviven:
 *  · el fotograma inicial de `inkfill` (animación transitoria hacia tinta),
 *  · `t.c`, que la línea 382 pinta como `background` de la barra de temas,
 *  · tres fondos de control (`instBg`, `soltarBg`, `semNextBg`).
 */
const EXCEPCIONES_ESPECIMEN: readonly string[] = [
  '@keyframes inkfill { from { color: #B5B1A8; } to { color: #16130E; } }',
  "c: i === 0 ? accent : (i < 3 ? '#8E8A82' : '#5C594F')",
  "instBg: s.awake ? '#EAE4F7' : '#B5B1A8'",
  "soltarBg: canSoltar ? accent : '#B5B1A8'",
  "semNextBg: canNext ? '#16130E' : '#B5B1A8'",
];

describe('los especímenes .dc.html no pintan texto con los hex deficientes', () => {
  it.each(ESPECIMENES)('%s', (relativo) => {
    const lineas = readFileSync(join(RAIZ_V2, relativo), 'utf8').split('\n');
    const ofensores: string[] = [];
    lineas.forEach((linea, i) => {
      let resto = linea;
      for (const excepcion of EXCEPCIONES_ESPECIMEN) resto = resto.split(excepcion).join('');
      const mayus = resto.toUpperCase();
      for (const hex of HEX_DEFICIENTES) {
        if (mayus.includes(hex)) ofensores.push(`${relativo}:${i + 1} ${hex}`);
      }
    });
    expect(ofensores).toEqual([]);
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/__tests__/contraste.test.ts`

Esperado: FALLA con cuatro casos rojos:

1. `sólo los archivos de la allowlist conservan un token viejo en text-*`
   lista ~145 posiciones (`components/papel/MenuBiblioteca.tsx:…`,
   `components/papel/PapelFooter.tsx:37`, …) en vez de `[]`.
2. `la allowlist conserva tinta-30 exactamente donde §7 lo permite` falla en
   `expect(fila).not.toContain('text-tinta-50')`: `FilaIndice.tsx` todavía pinta
   la flecha con `text-tinta-50`.
3. y 4. Los dos `it.each(ESPECIMENES)` listan 93 posiciones entre ambos
   (76 en `BASTA-v2.dc.html`, 17 en `Especimen.dc.html`).

- [ ] **Paso 3: Barrer `text-tinta-50`, `text-oscuro-tenue` y `text-ambar`**

Desde `/Users/juanb/Desktop/ElInstantedelHombreGris/v2`:

```bash
cd apps/web/src
grep -rl "text-tinta-50" . --include='*.tsx' --include='*.ts' \
  | grep -v '__tests__/contraste\.test\.ts' \
  | xargs -I{} perl -pi -e 's/text-tinta-50\b/text-tinta-texto-debil/g' {}
grep -rl "text-oscuro-tenue" . --include='*.tsx' --include='*.ts' \
  | grep -v '__tests__/contraste\.test\.ts' \
  | xargs -I{} perl -pi -e 's/text-oscuro-tenue\b/text-oscuro-texto-debil/g' {}
grep -rl "text-ambar" . --include='*.tsx' --include='*.ts' \
  | grep -v '__tests__/contraste\.test\.ts' \
  | xargs -I{} perl -pi -e 's/text-ambar\b/text-ambar-texto/g' {}
```

Esto cubre también las variantes prefijadas que existen hoy:
`placeholder:text-tinta-50` (×2) y `prose-th:text-tinta-50` (×1). `border-ambar`
no se toca porque la sustitución exige el prefijo `text-`. Y la guardia
(`__tests__/contraste.test.ts`) queda afuera de las tres pasadas: sus literales
`'text-tinta-50'` son los asserts, no clases — si el barrido los reescribiera,
el test pasaría a verificar lo contrario de lo que dice.

- [ ] **Paso 4: Barrer `text-tinta-30` salvo los archivos de la allowlist**

```bash
cd apps/web/src
grep -rl "text-tinta-30" . --include='*.tsx' --include='*.ts' \
  | grep -v 'primitives/BotonPapel\.tsx' \
  | grep -v 'primitives/FilaIndice\.tsx' \
  | grep -v 'primitives/FilaIndiceExpandible\.tsx' \
  | grep -v 'primitives/primitives\.test\.tsx' \
  | grep -v '__tests__/contraste\.test\.ts' \
  | xargs -I{} perl -pi -e 's/text-tinta-30\b/text-tinta-texto-debil/g' {}
```

`disabled:text-tinta-30` de `pages/Sembrar/sections/AsistenteSemilla.tsx` y
`text-tinta-30` de `pages/ElMapa/instrumento/Instrumento.tsx` migran igual: la
allowlist de §7 está cerrada en dos casos, y estar por encima de AA en un
control inhabilitado nunca es un defecto.

- [ ] **Paso 5: Retintar los dos `.dc.html` — mismo commit**

Desde `/Users/juanb/Desktop/ElInstantedelHombreGris/v2`:

```bash
perl -pi -e 'next if /\@keyframes/; s/color:(\s*)#7A756A/color:${1}#6A655B/g; s/color:(\s*)#5C594F/color:${1}#8A867C/g; s/color:(\s*)#B5B1A8/color:${1}#6A655B/g;' \
  docs/design-system/BASTA-v2.dc.html docs/design-system/Especimen.dc.html
perl -pi -e "s/\? '#16130E' : '#7A756A',/? '#16130E' : '#6A655B',/" \
  docs/design-system/BASTA-v2.dc.html
```

La primera pasada retinta las 92 declaraciones `color:` (75 en `BASTA-v2` + 17
en `Especimen`) y salta la línea del `@keyframes inkfill`. La segunda arregla el
único color de texto que vive en una expresión JS: el `color` de los ítems del
nav (`BASTA-v2.dc.html`, `const nav = pages.map(…)`). Quedan **5** apariciones
de los tres hex, todas fondos o fotogramas, todas listadas en
`EXCEPCIONES_ESPECIMEN`. 93 + 5 = 98, que es exactamente el conteo de §7.

`#A16C00` **no se toca** en los especímenes: sus 7 apariciones son un fondo de
swatch y valores de paleta JS que pintan chips y barras, no letras.

- [ ] **Paso 6: Reformatear las clases que cambiaron de orden**

`prettier-plugin-tailwindcss` ordena los nombres de clase, y los tokens nuevos
ordenan distinto que los viejos. Desde `/Users/juanb/Desktop/ElInstantedelHombreGris/v2`:

```bash
git diff --name-only -- 'apps/web/src/**/*.tsx' 'apps/web/src/**/*.ts' \
  | xargs -I{} npx prettier --write {}
```

(Los `.dc.html` no entran: el glob de `pnpm format` no incluye `html` y los
especímenes se mantienen tal cual salieron de Design.)

- [ ] **Paso 7: Correr los tests y las guardias**

Comandos:

```bash
pnpm -C apps/web exec vitest run src/
pnpm -C apps/web lint
pnpm -C apps/web type-check
```

Esperado: PASA. `contraste.test.ts` en verde entero; `primitives.test.tsx` sin
regresiones (el caso `disabled uses tinta-30 text/border, never opacity` sigue
verde porque `BotonPapel.tsx` no se tocó); lint y type-check limpios.

Verificación manual del barrido, desde `/Users/juanb/Desktop/ElInstantedelHombreGris/v2/apps/web/src`:

```bash
grep -rho --exclude='contraste.test.ts' "text-tinta-50\|text-oscuro-tenue\|text-ambar\b" . --include='*.tsx' --include='*.ts' | wc -l   # → 0
grep -rho --exclude='contraste.test.ts' "text-tinta-30" . --include='*.tsx' --include='*.ts' | wc -l                                    # → 4
grep -rho --exclude='contraste.test.ts' "text-tinta-texto-debil" . --include='*.tsx' --include='*.ts' | wc -l                           # → 142
```

(106 de `tinta-50` + 35 de `tinta-30` = 141, más el `PageFallback` que repintó la
Tarea 11 = **142**. Las 4 de `tinta-30` que sobreviven son `BotonPapel.tsx:37`,
`FilaIndice.tsx`, `FilaIndiceExpandible.tsx` y el regex de
`primitives.test.tsx:43`. El `--exclude` saca a la guardia, que nombra los
tokens viejos dentro de sus asserts y por eso ensuciaría las tres cuentas.)

- [ ] **Paso 8: Commit**

```bash
git add apps/web/src docs/design-system/BASTA-v2.dc.html docs/design-system/Especimen.dc.html
git commit -m "fix(web): el mapa viejo→nuevo aplicado — 431 nodos deficientes menos

tinta-50 (106), tinta-30 (35 de 39), oscuro-tenue (5, cuatro de ellas en el pie)
y ambar (2) pasan a la escala de texto en 54 archivos. tinta-30 sobrevive en los
dos casos de la allowlist de §7: la numeración aria-hidden de las filas de
índice y el estado deshabilitado de BotonPapel, que WCAG 1.4.3 exime.
Los dos .dc.html se regeneran en el mismo commit —93 de 98 hex deficientes
retintados, las 5 restantes son fondos— porque el gate 7.4 sólo greppea TSX."
```

---

### Tarea 13: La regla de lint que prohíbe los tokens viejos en `text-*`

**Files:**
- Modify: `apps/web/eslint.config.js` (archivo completo, hoy 12 líneas)
- Modify: `apps/web/src/components/papel/primitives/BotonPapel.tsx` (anclado en `const DISABLED_CLASSES = 'text-tinta-30 border border-tinta-30 cursor-not-allowed';`)
- Modify: `apps/web/src/components/papel/primitives/FilaIndice.tsx` (anclado en `      <span aria-hidden className="font-space text-tinta-30 text-sm">`)
- Modify: `apps/web/src/components/papel/primitives/FilaIndiceExpandible.tsx` (anclado en `        <span aria-hidden className="font-space text-tinta-30 text-sm">`)

**Interfaces:**
- Produces: dos entradas de `no-restricted-syntax` sobre `Literal` y `TemplateElement` que rechazan `text-tinta-50`, `text-tinta-30`, `text-oscuro-tenue` y `text-ambar` en cualquier posición de un string de clases, incluidas las variantes prefijadas (`disabled:`, `hover:`, `placeholder:`, `prose-th:`). No toca `border-tinta-30`, `bg-tinta-30`, `text-tinta-texto-debil` ni `text-ambar-texto`, ni los literales de expresión regular (`/text-tinta-30/` de `primitives.test.tsx` sigue verde, porque el `value` de un `Literal` de regex no es un string).
- El único escape es un `eslint-disable-next-line` con justificación: hoy existen exactamente **tres**, todos en la allowlist de §7. Aparte, la guardia `src/__tests__/contraste.test.ts` queda apagada por configuración: sus literales son los asserts que sostienen la regla.

- [ ] **Paso 1: Escribir el caso que tiene que fallar**

Crear el archivo sonda `apps/web/src/__sonda__/sonda-contraste.tsx` con
exactamente este contenido:

```tsx
export function SondaContraste() {
  const plantilla = `font-space text-tinta-50`;
  return (
    <div className="font-space text-tinta-30 text-sm">
      <span className={plantilla}>a</span>
      <span className="text-oscuro-tenue">b</span>
      <span className="text-ambar">c</span>
      <span className="disabled:text-tinta-30">d</span>
      <span className="text-tinta-texto-debil text-oscuro-texto-debil text-ambar-texto">ok</span>
      <span className="border-tinta-30 bg-tinta-30">ok</span>
    </div>
  );
}
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web lint`

Esperado: **PASA sin una sola salida** — y eso es la falla. La sonda escribe
cinco tokens de superficie en `text-*` (uno en un template literal y cuatro en
literales de string, el último con variante `disabled:`) y `eslint src
--max-warnings 0` los deja pasar: la guardia no existe todavía.

- [ ] **Paso 3: Escribir la regla**

Reemplazar `apps/web/eslint.config.js` entero por el bloque de abajo. (Si el
plan A hubiera dejado algo más en el archivo, conservalo y agregá sólo el objeto
de `no-restricted-syntax` y el que lo apaga para la guardia: el resto de este
bloque es el archivo tal como está hoy.)

```js
import reactConfig from '@v2/config-eslint/react';

/**
 * §7 de `docs/specs/2026-07-26-el-sustrato.md` — escala dual de texto.
 * Los hex viejos sobreviven como tokens de superficie (bordes, divisores,
 * fondos, palitos), así que `border-tinta-30` y `bg-tinta-30` son válidos.
 * En `text-*` están prohibidos: no llegan a 4,5:1.
 *
 * Allowlist de §7, exactamente dos casos, los dos con
 * `eslint-disable-next-line` justificado en el código:
 *   · la numeración de las filas de índice, marcada `aria-hidden`
 *   · el estado deshabilitado de `BotonPapel` (WCAG 1.4.3 exime los
 *     controles inhabilitados del mínimo de contraste)
 */
const TOKENS_DE_SUPERFICIE_EN_TEXTO =
  '(^|[ "\':])text-(tinta-50|tinta-30|oscuro-tenue|ambar)( |$|["\'])';

const MENSAJE =
  'Token de superficie en `text-*`. Usá text-tinta-texto-debil, text-oscuro-texto-debil o text-ambar-texto (§2 del sistema de diseño). Allowlist §7: numeración aria-hidden de las filas de índice y BotonPapel deshabilitado.';

export default [
  ...reactConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-syntax': [
        'error',
        { selector: `Literal[value=/${TOKENS_DE_SUPERFICIE_EN_TEXTO}/]`, message: MENSAJE },
        {
          selector: `TemplateElement[value.raw=/${TOKENS_DE_SUPERFICIE_EN_TEXTO}/]`,
          message: MENSAJE,
        },
      ],
    },
  },
  {
    // La guardia de contraste tiene que poder ESCRIBIR los tokens que prohíbe:
    // sus literales `'text-tinta-50'` y `'text-tinta-30'` son los asserts que
    // sostienen esta misma regla. Es el único archivo apagado por configuración.
    files: ['src/__tests__/contraste.test.ts'],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];
```

- [ ] **Paso 4: Verificar que la sonda ahora sí rompe, y borrarla**

Comando: `pnpm -C apps/web lint`

Esperado: FALLA con **cinco** errores `no-restricted-syntax` en
`src/__sonda__/sonda-contraste.tsx` — líneas 2, 4, 6, 7 y 8; la 2 por
`TemplateElement`, las otras cuatro por `Literal` — y **ninguno** en las líneas
9 y 10 (tokens nuevos y `border-tinta-30` / `bg-tinta-30`), ni en
`src/__tests__/contraste.test.ts`.

Después, borrar la sonda:

```bash
rm -rf apps/web/src/__sonda__
```

- [ ] **Paso 5: Justificar los tres sitios de la allowlist**

En `apps/web/src/components/papel/primitives/BotonPapel.tsx`, reemplazar:

```tsx
const DISABLED_CLASSES = 'text-tinta-30 border border-tinta-30 cursor-not-allowed';
```

por:

```tsx
// Allowlist §7 — WCAG 1.4.3 exime del mínimo de contraste a los controles
// inhabilitados. `tinta-30` acá es lo que hace legible el estado, no un descuido.
// eslint-disable-next-line no-restricted-syntax -- control inhabilitado, exento por WCAG 1.4.3
const DISABLED_CLASSES = 'text-tinta-30 border border-tinta-30 cursor-not-allowed';
```

En `apps/web/src/components/papel/primitives/FilaIndice.tsx`, reemplazar:

```tsx
      <span aria-hidden className="font-space text-tinta-30 text-sm">
        {num}
      </span>
```

por:

```tsx
      {/* eslint-disable-next-line no-restricted-syntax -- numeración decorativa aria-hidden (allowlist §7) */}
      <span aria-hidden className="font-space text-tinta-30 text-sm">
        {num}
      </span>
```

En `apps/web/src/components/papel/primitives/FilaIndiceExpandible.tsx`, reemplazar:

```tsx
        <span aria-hidden className="font-space text-tinta-30 text-sm">
          {num}
        </span>
```

por:

```tsx
        {/* eslint-disable-next-line no-restricted-syntax -- numeración decorativa aria-hidden (allowlist §7) */}
        <span aria-hidden className="font-space text-tinta-30 text-sm">
          {num}
        </span>
```

- [ ] **Paso 6: Correr el lint y los tests**

Comandos:

```bash
pnpm -C apps/web lint
pnpm -C apps/web exec vitest run src/
```

Esperado: PASA — `eslint src --max-warnings 0` sin una sola salida, y la suite
de `apps/web` entera en verde (el regex `/text-tinta-30/` de
`primitives.test.tsx:43` no dispara la regla porque el `value` de un `Literal`
de expresión regular no es un string).

- [ ] **Paso 7: Commit**

```bash
git add apps/web/eslint.config.js apps/web/src/components/papel/primitives/BotonPapel.tsx apps/web/src/components/papel/primitives/FilaIndice.tsx apps/web/src/components/papel/primitives/FilaIndiceExpandible.tsx
git commit -m "feat(web): el lint rechaza los tokens de superficie en text-*

no-restricted-syntax sobre Literal y TemplateElement: text-tinta-50,
text-tinta-30, text-oscuro-tenue y text-ambar dejan de ser escribibles como
color de texto, con variantes prefijadas incluidas. border-tinta-30 y
bg-tinta-30 siguen válidos: los hex viejos son tokens de superficie.
Los tres sitios de la allowlist de §7 llevan disable justificado."
```

---

### Tarea 14: §2 de la ley reescrito con la escala dual

**Files:**
- Modify: `docs/design-system/README.md` (anclado en el encabezado literal `## 2. Color (hex literales, siempre inline)` y en el siguiente, `## 3. Tipografía (Google Fonts)`)
- Test: `apps/web/src/__tests__/contraste.test.ts` (se le agrega un `describe`)

**Interfaces:**
- Consumes: los tres tokens de la Tarea 9 y la allowlist de las Tareas 10 y 13.
- Produces: §2 con las dos escalas separadas y el ratio de cada par al lado, para que ② no tenga que adivinar cuál gris pinta letras. B0 (Tarea 1 del plan A) enmienda §1, §3, §5, §7, §11.3 y §12; §2 es de este bloque, que es el que tiene los hex nuevos.

- [ ] **Paso 1: Escribir el test que falla**

Agregar al final de `apps/web/src/__tests__/contraste.test.ts`:

```ts
describe('§2 de la ley documenta la escala dual', () => {
  it('nombra los tres tokens nuevos y marca los viejos como superficie', () => {
    const ley = readFileSync(join(RAIZ_V2, 'docs/design-system/README.md'), 'utf8');
    const inicio = ley.indexOf('## 2. Color');
    const fin = ley.indexOf('## 3. Tipografía');
    expect(inicio).toBeGreaterThan(-1);
    expect(fin).toBeGreaterThan(inicio);
    const seccion = ley.slice(inicio, fin);
    expect(seccion).toContain('#6A655B');
    expect(seccion).toContain('#8A867C');
    expect(seccion).toContain('#8F6000');
    expect(seccion).toContain('sólo superficie');
    expect(seccion).toContain('1.4.3');
  });
});
```

- [ ] **Paso 2: Correrlo para verificar que falla**

Comando: `pnpm -C apps/web exec vitest run src/__tests__/contraste.test.ts`

Esperado: FALLA con `expected '## 2. Color (hex literales, siempre inline)…' to contain '#6A655B'`.

- [ ] **Paso 3: Reescribir §2**

Reemplazar en `docs/design-system/README.md` todo el bloque que va desde
`## 2. Color (hex literales, siempre inline)` hasta —sin incluirla— la línea
`## 3. Tipografía (Google Fonts)`, por:

```md
## 2. Color (hex literales, siempre inline)

**Escala dual.** Desde julio de 2026 cada gris tiene dos valores: uno de **superficie** (bordes, divisores, fondos, palitos, barras vacías, glifos de relleno) y uno de **texto**. Los de superficie no llegan a 4,5:1 y por eso **nunca pintan una letra**; los de texto sí, y son los únicos que pueden aparecer en `text-*`. La regla `no-restricted-syntax` de `apps/web/eslint.config.js` rechaza los viejos en `text-*`, y `apps/web/src/__tests__/contraste.test.ts` calcula el ratio WCAG 2.1 de todo par declarado y falla bajo 4,5. Los ratios de abajo salen de ese test, no de la vista.

Papel (fondos claros)
- `#F2EFE7` papel — fondo base de todo el sitio
- `#FBFAF4` papel crudo — paneles, cards alternas, bandas suaves
- `#ECE8DC` papel presionado — hover de filas/celdas
- `#E4E0D3` relleno del mapa
- `#D8D4C8` borde suave / divisores secundarios

Tinta sobre papel — **texto**
- `#16130E` tinta — títulos, texto principal, bordes duros, botones oscuros · 16,12:1
- `#33302A` tinta 90 — cuerpo de lectura · 11,44:1
- `#4A463D` tinta 75 — cuerpo secundario · 8,18:1
- `#6A655B` **tinta texto débil** — metadatos, kickers neutros, fechas, números de sección del nav, notas al pie · 5,04:1 sobre papel · 5,54:1 sobre papel crudo · 4,73:1 sobre papel presionado

Tinta sobre papel — **superficie** (no pintan texto)
- `#7A756A` tinta 50 — divisores, palitos, glifos de relleno · 3,99:1
- `#B5B1A8` tinta 30 — numeración de expediente, rellenos, estados apagados · 1,86:1. Dos excepciones con allowlist, ambas comentadas en el código: la numeración de las filas de índice (`FilaIndice` / `FilaIndiceExpandible`, marcada `aria-hidden` — es decoración y no la lee nadie) y el estado deshabilitado de `BotonPapel` (WCAG 1.4.3 exime del mínimo de contraste a los controles inhabilitados).

Página oscura (El mandato, bandas CTA, footer) — fondo `#16130E`
- texto `#F2EFE7` (16,12:1) · secundario `#C9C5BA` (10,75:1) · meta `#8E8A82` (5,39:1)
- `#8A867C` **oscuro texto débil** — rótulos de columna del pie y barra inferior · 5,10:1
- superficie: tenue `#5C594F` (2,64:1, no pinta texto) · bordes `#3A362D` · barras vacías `#241F17`

Acentos (con significado fijo — no mezclar)
- `#5227CC` violeta = la marca, lo accionable, «sueño» · 7,25:1 sobre papel. Hover: `#3D1BA3`. En oscuro usar `#9D85E8` (6,13:1 sobre tinta).
- `#C23B22` rojo sello = urgencia, «basta», sellos NO ES DOCTRINA / EJEMPLO, crítica · 4,64:1
- `#1A7A4A` verde = «compromiso», territorio, logrado · 4,65:1
- `#8F6000` **ámbar texto** = «necesidad», método, advertencia media · 4,76:1. `#A16C00` ámbar queda como **sólo superficie** —fondo de chip y borde— porque da 3,92:1.
- `#0F6B8A` cian = «recurso» · 5,24:1
- Máximo 1–2 fondos de color por página. El violeta nunca es fondo de página entera, solo bandas CTA.

Tokens semánticos hsl (`index.css`)
- Son el chrome v1 y viven sobre `--background` (`#0A0A0A`), donde pasan de sobra. **Ninguno se renderiza dentro de `.papel-root`**: `--muted-foreground` resuelve a `#A1A4AA`, que sobre papel da 2,17:1 — era el `PageFallback` de `App.tsx`, o sea el primer texto de toda visita fría, y hoy usa `text-tinta-texto-debil font-space`. La guardia de contraste rechaza cualquier `text-muted-foreground` en un archivo que se pinte sobre papel.
```

- [ ] **Paso 4: Correr los tests**

Comando: `pnpm -C apps/web exec vitest run src/__tests__/contraste.test.ts`

Esperado: PASA.

- [ ] **Paso 5: Verificación completa del bloque**

Comando: `pnpm verify`

Esperado: PASA — lint, type-check, test y build en verde. Es el estado con el
que el bloque B6 se cierra: cero pares declarados bajo 4,5:1, la escala dual
documentada, los especímenes sincronizados y una regla de lint que impide la
recaída.

- [ ] **Paso 6: Commit**

```bash
git add docs/design-system/README.md apps/web/src/__tests__/contraste.test.ts
git commit -m "docs(design-system): §2 pasa a la escala dual de texto

Cada gris queda separado en superficie y texto, con el ratio al lado y la
allowlist de dos casos escrita donde ② la va a leer. El test verifica que la
ley nombre los tres tokens nuevos: una §2 desactualizada rompe el build."
```

---

### Tarea 15: Cierre del plan B

**Files:** ninguno nuevo. Es la verificación de que las tres entregas conviven y el
inventario de lo que queda entregado.

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: la constancia de que ② puede construir páginas sabiendo qué gris pinta letras,
  y de que el plan C puede apoyarse en `esRutaPapel()` sin haber esperado a nadie.

- [ ] **Paso 1: `pnpm verify` entero**

Comando: `pnpm verify`

Esperado: PASA — lint (con la regla `no-restricted-syntax` nueva y `--max-warnings 0`),
type-check, test y build en verde.

- [ ] **Paso 2: Las guardias**

Comando: `pnpm planes:check && pnpm deps:check && pnpm test:scripts`

Esperado: el índice de planes OK, `Dependencias de producción OK: 35 de 45.` y la suite de
`scripts/` en verde. (`pnpm meta:check` es del plan C: correrlo sólo si C ya está mergeado.
`scripts/vitest.config.ts` no se tocó en este plan.)

- [ ] **Paso 3: Las cuatro guardias nuevas de este plan, una por una**

Comando:

```bash
pnpm -C apps/web exec vitest run src/__tests__/contraste.test.ts src/__tests__/movimiento.test.ts src/__tests__/anillo-de-foco.test.ts src/layouts/__tests__/ src/components/papel/__tests__/
```

Esperado: verde entero — la guardia de contraste (tokens, 22 pares, hsl, allowlist,
especímenes y §2 de la ley), la de movimiento (framer-motion + los cuatro hover + el velo),
la del anillo de foco, las dos suites de `RootLayout` (a11y y ErrorBoundary) y las dos de
`components/papel/__tests__/`.

- [ ] **Paso 4: El bundle inicial no engordó**

Comando:

```bash
pnpm --filter @v2/web build && grep -c 'modulepreload.*motion-' apps/web/dist/index.html ; pnpm size
```

Esperado: el `grep -c` imprime `0` —framer-motion sigue fuera del camino crítico, o sea que
el `MotionConfig` de la Tarea 4 no revirtió la Tarea 7 del plan A— y los presupuestos de
`.size-limit.json` en verde: `ErrorBoundary` + `CaraDeFallo` + `SkipLink` entran al chunk
inicial sin un solo import de `primitives/`.

- [ ] **Paso 5: Verificación a ojo del teclado, del reposo y del chunk caído**

```bash
pnpm --filter @v2/web build && pnpm --filter @v2/web preview --port 4173
```

1. **Teclado.** En `http://localhost:4173/planes`, un solo **Tab**: aparece «SALTAR AL
   CONTENIDO» violeta; **Enter** lleva al cuerpo; el **Tab** siguiente arranca dentro del
   contenido, no en el header. Navegar a otra ruta desde el nav y volver a tabular: el foco
   ya está en el contenido de la página nueva. Repetir en `http://localhost:4173/tablero`
   con la paleta v1.
2. **Anillo.** Tabulando por `/planes` el anillo es violeta; por `/tablero` e `/ingresar`,
   lila, y se ve sobre el negro.
3. **Reposo.** Con «Reducir movimiento» encendido en el sistema: las tarjetas de
   `/biblioteca` y el botón violeta de `/sembrar` no se desplazan, y el velo del despertar
   enciende el color de golpe.
4. **Chunk caído.** Con el `preview` corriendo, mover un chunk de página fuera del `dist` y
   entrar a su ruta con la caché desactivada:

```bash
ls apps/web/dist/assets | grep -i 'planes' | head
mv apps/web/dist/assets/<el-chunk-de-planes>.js /tmp/
```

   Recargar `http://localhost:4173/planes`: en vez del rectángulo crema tiene que salir el
   expediente «Salió una versión nueva mientras leías.» con un único botón «Recargar →».
   Después:

```bash
rm -rf apps/web/dist && pnpm --filter @v2/web build
```

- [ ] **Paso 6: Inventario de lo entregado**

Lo que este plan deja en el árbol, para el hand-off a ②:

- **Accesibilidad del shell (B4).** `apps/web/src/components/SkipLink.tsx` montado como
  primer hijo de las dos ramas de `RootLayout`; `ID_CONTENIDO` y `enfocarContenido()` en
  `apps/web/src/lib/ir-al-principio.ts`, con el foco moviéndose **al navegar** y nunca al
  llegar; la regla `:where(:not(.papel-root, .papel-root *)):focus-visible` en `index.css`;
  `<MotionConfig reducedMotion="user">` en los dos consumidores de framer-motion; los cuatro
  hover en `motion-safe:` y el velo en `motion-reduce:transition-none`. Guardias:
  `src/layouts/__tests__/RootLayout.a11y.test.tsx`, `src/__tests__/anillo-de-foco.test.ts`,
  `src/__tests__/movimiento.test.ts`.
- **Fallos del cliente (B5).** `components/papel/error-boundary-regimen.ts` (clasificación y
  copy, puros), `components/papel/CaraDeFallo.tsx` (las dos caras, cero imports de
  `primitives/`) y `components/papel/ErrorBoundary.tsx`, montado dentro de las dos ramas de
  `RootLayout` con reinicio por `location`. Guardias:
  `components/papel/__tests__/error-boundary-regimen.test.ts`,
  `components/papel/__tests__/ErrorBoundary.test.tsx`,
  `layouts/__tests__/RootLayout.test.tsx`.
- **Contraste (B6).** Tres tokens de texto en `docs/design-system/tokens.css` +
  `apps/web/tailwind.config.ts`; 54 archivos retinteados y los dos `.dc.html` regenerados;
  `aria-hidden` en la numeración y la flecha de las filas de índice; `PageFallback` repintado;
  la regla `no-restricted-syntax` en `apps/web/eslint.config.js`; §2 de
  `docs/design-system/README.md` reescrito con la escala dual y los ratios. Guardia:
  `src/__tests__/contraste.test.ts`.
- **Lo que este plan NO tocó, a propósito:** `Superficie` / `superficieDe` / el registro de
  rutas (B7, plan C), el copy del pie (Tarea 14 de C), `package.json`, el workflow de CI,
  `scripts/` y `scripts/vitest.config.ts`, `main.tsx`, cualquier `.mdx` y cualquier registry
  de contenido.

- [ ] **Paso 7: Estado limpio**

Comando: `git status --short`

Esperado: sin salida. Si aparece algo, es una salida generada que se olvidó de commitear en
su tarea: agregarla al commit que corresponda con `git commit --amend` **sólo si no se
pusheó**, o con un commit `chore(v2):` propio si ya se pusheó.

---

## Notas de ensamblaje

Cinco resoluciones tomadas al unir los tres fragmentos. Ninguna cambia el alcance; todas
existen porque los bloques se escribieron en paralelo y acá corren en fila (B4 → B5 → B6).

1. **Los anclajes de la Tarea 8 se reescribieron contra el estado post-B4.** El fragmento de
   B5 anclaba en `<div className="flex-1">{children}</div>`, texto que la Tarea 1 ya no deja
   en el archivo: los dos wrappers pasan a tener `id={ID_CONTENIDO}`, `tabIndex={-1}` y
   `scroll-mt-16`. Los tres reemplazos del Paso 3 de la Tarea 8 citan ahora el bloque tal
   como queda después de la Tarea 1, y el localizador de la rama legado incluye `<Footer />`
   porque desde la Tarea 1 los dos `<div>` de apertura son idénticos. Se mantiene intacta la
   regla de fondo: el `<ErrorBoundary>` envuelve sólo a `{children}`, nunca al ancla.
2. **`CaraDeFallo.tsx` entra a `EXENTOS_DE_LA_GUARDIA` de la Tarea 11.** El archivo vive en
   `components/papel/` y usa `text-muted-foreground` en su rama legado, así que la heurística
   de la guardia («si la ruta contiene `papel` o hay tokens papel, se pinta sobre papel») lo
   marcaría como ofensor y el test de B6 fallaría por culpa de un archivo de B5. Es
   exactamente el caso para el que la guardia ya reservaba una exención —bifurcación
   papel/legado en un mismo archivo, como `RootLayout.tsx`— y así quedó, con el comentario
   que lo justifica.
3. **`src/__tests__/contraste.test.ts` es allowlist en sus tres frentes.** La guardia nombra
   los tokens que prohíbe (`'text-tinta-50'`, `'text-tinta-30'`) dentro de sus propios
   asserts. Sin resolverlo: (a) el barrido de la Tarea 12 reescribía esos literales y dejaba
   el test verificando lo contrario de lo que dice; (b) el test se listaba a sí mismo como
   ofensor de su propio `describe`; (c) la regla de la Tarea 13 lo rompía con tres errores
   `no-restricted-syntax`. Se resolvió en los tres lugares: los `grep -rl` de los Pasos 3 y 4
   de la Tarea 12 lo excluyen, entra a `ALLOWLIST_TEXTO`, y `apps/web/eslint.config.js` le
   apaga la regla en un bloque propio con la justificación escrita. El `it` que decía «los
   cuatro archivos de la allowlist» pasó a decir «los archivos de la allowlist».
4. **La cuenta de `text-tinta-texto-debil` del Paso 7 de la Tarea 12 es 142, no 141.** El
   fragmento sumaba sólo el barrido (106 + 35); la Tarea 11 ya había repintado el
   `PageFallback` de `App.tsx`, que es la ocurrencia 142. Los tres `grep` de verificación
   llevan además `--exclude='contraste.test.ts'` por lo dicho en el punto 3.
5. **Directorio de trabajo.** Las Tareas 1–5 vienen del fragmento B4 y prefijan cada comando
   con `cd /Users/juanb/Desktop/ElInstantedelHombreGris`, con rutas `v2/…`; las Tareas 6–15
   corren desde `v2/`. Se dejaron tal cual —cada bloque es internamente consistente y los
   `git add` resuelven en los dos casos— y la diferencia quedó declarada en Global
   Constraints en vez de reescribir veinte comandos.

Y una precisión que no es una contradicción sino una consecuencia del orden: las Tareas 1 y 8
crean dos archivos de test distintos para el mismo componente
(`layouts/__tests__/RootLayout.a11y.test.tsx` y `layouts/__tests__/RootLayout.test.tsx`).
Se conservan separados a propósito —uno prueba el orden de tabulación, el otro el límite de
error— y el Paso 4 de la Tarea 8 ya cuenta los cuatro `it` del primero entre lo que tiene que
seguir verde.
