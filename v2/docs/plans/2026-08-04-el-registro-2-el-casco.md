# El Registro · Rebanada 2 — El casco Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sacar el juego de la app de campo, poner pestañas reales, y convertir el mapa en la portada — pintando la luz que la rebanada 1 ya sabe calcular.

**Architecture:** Primero el denominador, que hoy no existe a nivel celda: `PROVINCIAS_REF` se muda de la web a `@v2/civic-core` y gana una función que estima habitantes por celda como densidad provincial × área. Después el puente de datos en el móvil: de filas locales a `ConteoCelda[]`. Después el mapa aprende a recibir luz por celda. Recién entonces se demuele el juego y se levanta el casco nuevo, para que en ningún momento quede una app sin portada.

**Tech Stack:** Expo SDK 57 · expo-router · TypeScript estricto · vitest · react-native-maps (nativo) + maplibre-gl (web) · `@v2/civic-core`

## Global Constraints

- **Dos paquetes:** `v2/packages/civic-core` (Task 1) y `v2/apps/mobile` (Tasks 2–8). La web se toca sólo para reapuntar un import (Task 1).
- **Commits en `main`.** El dueño del repo tiene instrucción permanente de no abrir ramas salvo pedido explícito.
- **`civic-core` es lógica pura:** sin UI, sin APIs de plataforma, sin red, sin disco, sin `Date.now()`.
- **Imports con extensión `.js`** en `civic-core` (ESM). En `mobile` se usan los alias `@/…` sin extensión.
- **`@typescript-eslint/no-explicit-any: error`.** No hay `: any`. `@ts-ignore` prohibido.
- **`strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`** encendidos.
- **Textos de interfaz en español rioplatense** — «vos», «mirá», «pará».
- **Nunca `0` para decir «no sé».** La regla de la rebanada 1 gobierna también cómo se dibuja: una celda sin denominador va en el gris `sinDato`, nunca en oscuro.
- **El vacío invita, no se disculpa** (`el-vacio-como-pieza` V3). Ningún estado vacío dice «no hay datos disponibles».
- **No se siembra nada** (V1). Ni fixtures de demo, ni modo demo, ni datos de ejemplo en el cliente.
- **Conventional Commits con scope:** `feat(civic-core):`, `feat(mobile):`, `refactor(mobile):`.

**Verificación por paquete:**
```bash
cd v2/packages/civic-core && pnpm test && pnpm type-check && pnpm lint
cd v2/apps/mobile && npx vitest run && npx tsc --noEmit
cd v2/apps/web && pnpm test:unit
```

> Ojo con `tsc` del móvil: viene con **4 errores preexistentes** en `src/components/ui/Pressable97.tsx` por una fuga de `@types/react@18` desde la raíz del workspace (`D-025`). No son tuyos y no se arreglan acá. La condición es **no agregar errores nuevos**: contá los errores antes y después.

---

### Task 1: El denominador se muda a civic-core

**Files:**
- Create: `v2/packages/civic-core/src/poblacion.ts`
- Modify: `v2/packages/civic-core/src/index.ts`
- Delete: `v2/apps/web/src/pages/ElMapa/instrumento/provincias-ref.ts`
- Modify: los archivos de la web que importan `PROVINCIAS_REF` (encontralos con grep; al menos `instrumento/simulacion/datos.ts` y `instrumento/modos/useModoAnalisis.tsx`)
- Test: `v2/packages/civic-core/src/__tests__/poblacion.test.ts`

**Interfaces:**
- Consumes: `CoverageCell` (de `coverage.js`), `GeoPoint` (de `types.js`), `haversineKm` (de `geo.js`).
- Produces: `ReferenciaProvincia`, `PROVINCIAS_REF`, `areaCeldaKm2(cell): number`, `habitantesDeCelda(cell, provincia: string | null): number | null`.

**Por qué se muda en vez de copiarse.** El archivo que estás moviendo lo dice él mismo en su doc comment: *«una tabla de denominadores duplicada es la forma más silenciosa de que dos partes de la misma pantalla cuenten distinto»*. Ahora la van a usar la web, el teléfono y —en la rebanada 4— la API. Copiarla sería el mismo error a mayor escala. `civic-core` ya tiene `provincias.ts`, que resuelve un punto a su provincia; el denominador es su vecino natural.

- [ ] **Step 1: Write the failing test**

Create `v2/packages/civic-core/src/__tests__/poblacion.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { planTerritorialCoverage } from '../coverage.js';
import { PROVINCIAS_REF, areaCeldaKm2, habitantesDeCelda } from '../poblacion.js';

/** Una celda real, sacada de un plan sobre un recuadro chico de CABA. */
const celda = () => {
  const plan = planTerritorialCoverage(
    { points: [
      { lat: -34.62, lng: -58.45 },
      { lat: -34.58, lng: -58.45 },
      { lat: -34.58, lng: -58.37 },
      { lat: -34.62, lng: -58.37 },
    ] },
    { cellCount: 16 },
  );
  const primera = plan?.cells[0];
  if (!primera) throw new Error('el plan debería tener celdas');
  return primera;
};

describe('PROVINCIAS_REF', () => {
  it('tiene las 24 jurisdicciones', () => {
    expect(Object.keys(PROVINCIAS_REF)).toHaveLength(24);
  });

  it('usa el nombre canónico de CABA, el mismo que devuelve la API', () => {
    expect(PROVINCIAS_REF['Ciudad Autónoma de Buenos Aires']).toBeDefined();
  });

  it('ninguna provincia tiene población ni superficie en cero', () => {
    for (const [nombre, ref] of Object.entries(PROVINCIAS_REF)) {
      expect(ref.pob, nombre).toBeGreaterThan(0);
      expect(ref.km2, nombre).toBeGreaterThan(0);
    }
  });
});

describe('areaCeldaKm2', () => {
  it('una celda de un plan tiene área positiva y chica', () => {
    const a = areaCeldaKm2(celda());
    expect(a).toBeGreaterThan(0);
    expect(a).toBeLessThan(100);
  });
});

describe('habitantesDeCelda', () => {
  it('sin provincia no hay denominador: devuelve null, no cero', () => {
    expect(habitantesDeCelda(celda(), null)).toBeNull();
  });

  it('una provincia que no está en la tabla tampoco inventa un número', () => {
    expect(habitantesDeCelda(celda(), 'Provincia Inventada')).toBeNull();
  });

  it('la misma celda da muchos más habitantes en CABA que en Santa Cruz', () => {
    const caba = habitantesDeCelda(celda(), 'Ciudad Autónoma de Buenos Aires');
    const santaCruz = habitantesDeCelda(celda(), 'Santa Cruz');
    expect(caba).not.toBeNull();
    expect(santaCruz).not.toBeNull();
    if (caba === null || santaCruz === null) return;
    // El contraste entre provincias es el que este método SÍ representa bien.
    expect(caba).toBeGreaterThan(santaCruz * 1000);
  });

  it('es densidad por área: a igual provincia, más área son más habitantes', () => {
    const chica = celda();
    // Un plan de 4 celdas sobre el mismo recuadro da celdas más grandes que uno de 16.
    const planGrueso = planTerritorialCoverage(
      { points: [
        { lat: -34.62, lng: -58.45 },
        { lat: -34.58, lng: -58.45 },
        { lat: -34.58, lng: -58.37 },
        { lat: -34.62, lng: -58.37 },
      ] },
      { cellCount: 4 },
    );
    const grande = planGrueso?.cells[0];
    if (!grande) throw new Error('el plan grueso debería tener celdas');

    expect(areaCeldaKm2(grande)).toBeGreaterThan(areaCeldaKm2(chica));

    const hChica = habitantesDeCelda(chica, 'Córdoba');
    const hGrande = habitantesDeCelda(grande, 'Córdoba');
    if (hChica === null || hGrande === null) throw new Error('Córdoba está en la tabla');
    expect(hGrande).toBeGreaterThan(hChica);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd v2/packages/civic-core && pnpm vitest run src/__tests__/poblacion.test.ts`
Expected: FAIL — `Failed to resolve import "../poblacion.js"`.

- [ ] **Step 3: Move the table and write the two functions**

Create `v2/packages/civic-core/src/poblacion.ts`. Copiá el contenido íntegro de `PROVINCIAS_REF` y `ReferenciaProvincia` desde `v2/apps/web/src/pages/ElMapa/instrumento/provincias-ref.ts` — **los números no se retipean a mano**, se mueven. Después agregá:

```ts
import { haversineKm } from './geo.js';

import type { CoverageCell } from './coverage.js';

/**
 * Área de una celda en km².
 *
 * Las celdas de un plan son rectángulos chicos, así que alcanza con medir dos
 * lados contiguos con haversine y multiplicarlos. A esta escala la curvatura
 * no cambia el resultado de forma que importe para un denominador estimado.
 */
export const areaCeldaKm2 = (cell: CoverageCell): number => {
  const [a, b, c] = cell.polygon;
  if (!a || !b || !c) return 0;
  return haversineKm(a, b) * haversineKm(b, c);
};

/**
 * Habitantes estimados de una celda — densidad provincial × área.
 *
 * **Es una estimación con método declarado, no una medición.** Asume densidad
 * pareja adentro de la provincia, que es falso: una celda rural bonaerense
 * recibe el promedio provincial y queda sobreestimada, y por lo tanto su
 * brillo queda subestimado. Lo que este método SÍ representa bien es el
 * contraste entre provincias, que es enorme y real — CABA contra Santa Cruz
 * son cuatro órdenes de magnitud.
 *
 * Quien lo use tiene que decirlo en pantalla. El día que haya población
 * grillada de verdad (`D-026`), se cambia esta función y nada más.
 *
 * Devuelve `null` —nunca `0`— cuando no se sabe en qué provincia cae la celda
 * o cuando esa provincia no está en la tabla. Inventarle una población
 * plausible sería exactamente la clase de número que este paquete existe para
 * no tener.
 */
export const habitantesDeCelda = (cell: CoverageCell, provincia: string | null): number | null => {
  if (provincia === null) return null;
  const ref = PROVINCIAS_REF[provincia];
  if (ref === undefined) return null;
  const densidad = (ref.pob * 1000) / (ref.km2 * 1000);
  return densidad * areaCeldaKm2(cell);
};
```

Add to `v2/packages/civic-core/src/index.ts`, después de `export * from './provincias.js';`:

```ts
export * from './poblacion.js';
```

- [ ] **Step 4: Reapuntar la web y borrar el archivo viejo**

Encontrá los consumidores:

```bash
cd v2/apps/web && grep -rn "provincias-ref\|PROVINCIAS_REF" src/
```

Cambiá cada import para que venga de `@v2/civic-core` en vez de la ruta relativa, después borrá `src/pages/ElMapa/instrumento/provincias-ref.ts`. No cambies ningún número ni ninguna clave: si un test de la web se pone rojo, es que algo se movió mal.

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd v2/packages/civic-core && pnpm test && pnpm type-check && pnpm lint`
Expected: PASS.

Run: `cd v2/apps/web && pnpm test:unit && pnpm type-check`
Expected: PASS — 551 tests, los mismos de antes. El comando de la web es `test:unit`, **no** `test`.

- [ ] **Step 6: Commit**

```bash
git add v2/packages/civic-core v2/apps/web
git commit -m "feat(civic-core): el denominador se muda al paquete compartido y aprende a estimar por celda"
```

---

### Task 2: De filas locales a conteos por celda

**Files:**
- Create: `v2/apps/mobile/src/civic/conteos.ts`
- Test: `v2/apps/mobile/src/civic/conteos.test.ts`

**Interfaces:**
- Consumes: `ConteoCelda`, `CoverageCell`, `pointInCoverageArea`, `habitantesDeCelda` (todos de `@v2/civic-core`).
- Produces: `SenalParaConteo`, `conteosPorCelda(senales, cells, provinciaDe): ConteoCelda[]`.

**Qué hace.** Es el puente entre lo que la base local guarda y lo que la fórmula necesita. Recibe señales ya aplanadas —no filas de drizzle, para que sea pura y testeable— y las reparte en las celdas del plan.

**Las dos reglas que decide esta función.** El brillo cuenta **personas distintas**, así que la función deduplica por `actorKey` dentro de cada celda; dos señales de la misma persona en la misma celda cuentan una. Y las **deliberables cuentan para el brillo igual que las verificables** —spec §3, R3— pero **sólo las verificables entran en el denominador de la nitidez**.

- [ ] **Step 1: Write the failing test**

Create `v2/apps/mobile/src/civic/conteos.test.ts`:

```ts
import { planTerritorialCoverage } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { conteosPorCelda, type SenalParaConteo } from './conteos';

/**
 * `planTerritorialCoverage` devuelve `CoveragePlan`, NO `CoveragePlan | null`:
 * ante una entrada mala devuelve un plan inválido, no ausencia. Así que no
 * lleva guarda de nulidad — el lint la marcaría como condición innecesaria.
 */
const plan = () =>
  planTerritorialCoverage(
    { points: [
      { lat: -34.62, lng: -58.45 },
      { lat: -34.58, lng: -58.45 },
      { lat: -34.58, lng: -58.37 },
      { lat: -34.62, lng: -58.37 },
    ] },
    { cellCount: 4 },
  );

/** Un punto adentro de la primera celda del plan. */
const enPrimeraCelda = (p: ReturnType<typeof plan>) => {
  const c = p.cells[0];
  if (!c) throw new Error('debería haber celda');
  return c.center;
};

const senal = (parcial: Partial<SenalParaConteo> & Pick<SenalParaConteo, 'lat' | 'lng'>): SenalParaConteo => ({
  actorKey: 'actor-1',
  verificable: false,
  confirmada: false,
  ...parcial,
});

describe('conteosPorCelda', () => {
  it('devuelve un conteo por celda del plan, en el mismo orden', () => {
    const p = plan();
    const conteos = conteosPorCelda([], p.cells, () => 'Córdoba');
    expect(conteos).toHaveLength(p.cells.length);
    expect(conteos.map((c) => c.cellId)).toEqual(p.cells.map((c) => c.id));
  });

  it('cuenta personas distintas, no señales', () => {
    const p = plan();
    const punto = enPrimeraCelda(p);
    const conteos = conteosPorCelda(
      [
        senal({ ...punto, actorKey: 'ana' }),
        senal({ ...punto, actorKey: 'ana' }),
        senal({ ...punto, actorKey: 'ana' }),
        senal({ ...punto, actorKey: 'beto' }),
      ],
      p.cells,
      () => 'Córdoba',
    );
    const primera = conteos[0];
    if (!primera) throw new Error('debería haber conteo');
    expect(primera.vocesDistintas).toBe(2);
  });

  it('una deliberable cuenta para las voces pero no para las verificables', () => {
    const p = plan();
    const punto = enPrimeraCelda(p);
    const conteos = conteosPorCelda(
      [senal({ ...punto, actorKey: 'ana', verificable: false })],
      p.cells,
      () => 'Córdoba',
    );
    const primera = conteos[0];
    if (!primera) throw new Error('debería haber conteo');
    expect(primera.vocesDistintas).toBe(1);
    expect(primera.verificables).toBe(0);
  });

  it('cuenta verificables y confirmaciones por separado', () => {
    const p = plan();
    const punto = enPrimeraCelda(p);
    const conteos = conteosPorCelda(
      [
        senal({ ...punto, actorKey: 'ana', verificable: true, confirmada: true }),
        senal({ ...punto, actorKey: 'beto', verificable: true, confirmada: false }),
      ],
      p.cells,
      () => 'Córdoba',
    );
    const primera = conteos[0];
    if (!primera) throw new Error('debería haber conteo');
    expect(primera.verificables).toBe(2);
    expect(primera.confirmaciones).toBe(1);
  });

  it('una señal fuera del plan no entra en ninguna celda', () => {
    const p = plan();
    const conteos = conteosPorCelda(
      [senal({ lat: 10, lng: 10, actorKey: 'ana' })],
      p.cells,
      () => 'Córdoba',
    );
    expect(conteos.every((c) => c.vocesDistintas === 0)).toBe(true);
  });

  it('sin provincia resuelta la celda queda sin denominador, no en cero', () => {
    const p = plan();
    const conteos = conteosPorCelda([], p.cells, () => null);
    expect(conteos.every((c) => c.habitantes === null)).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd v2/apps/mobile && npx vitest run src/civic/conteos.test.ts`
Expected: FAIL — no se resuelve `./conteos`.

- [ ] **Step 3: Write minimal implementation**

Create `v2/apps/mobile/src/civic/conteos.ts`:

```ts
/**
 * De señales locales a conteos por celda — el puente entre la base del
 * teléfono y la fórmula de `@v2/civic-core`.
 *
 * Recibe señales ya aplanadas y no filas de drizzle: así es pura, se testea
 * sin base, y quien la llama decide qué tablas mirar.
 */

import {
  habitantesDeCelda,
  pointInCoverageArea,
  type ConteoCelda,
  type CoverageCell,
} from '@v2/civic-core';

export interface SenalParaConteo {
  lat: number;
  lng: number;
  /** Identidad seudónima de dispositivo. Dos señales de la misma persona en la misma celda son una voz. */
  actorKey: string;
  /** `true` para necesidad, ¡basta! y recurso. `false` para sueño, valor y compromiso. */
  verificable: boolean;
  /** Sólo tiene sentido cuando `verificable` es `true`. */
  confirmada: boolean;
}

/** Resuelve un punto a su provincia. La inyecta quien llama para no acoplar esto al GeoJSON. */
export type ProvinciaDe = (punto: { lat: number; lng: number }) => string | null;

export const conteosPorCelda = (
  senales: readonly SenalParaConteo[],
  cells: readonly CoverageCell[],
  provinciaDe: ProvinciaDe,
): ConteoCelda[] =>
  cells.map((cell) => {
    const area = { type: 'Polygon' as const, coordinates: cell.geometry.coordinates };
    const adentro = senales.filter((s) => pointInCoverageArea({ lat: s.lat, lng: s.lng }, area));

    // Personas distintas, no señales: regla 8 de la Constitución de producto.
    const voces = new Set(adentro.map((s) => s.actorKey));

    // Las deliberables ya contaron arriba, para el brillo. Acá sólo los hechos:
    // sólo ellos se corroboran (regla 11).
    const verificables = adentro.filter((s) => s.verificable);

    return {
      cellId: cell.id,
      vocesDistintas: voces.size,
      habitantes: habitantesDeCelda(cell, provinciaDe(cell.center)),
      verificables: verificables.length,
      confirmaciones: verificables.filter((s) => s.confirmada).length,
    };
  });
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd v2/apps/mobile && npx vitest run src/civic/conteos.test.ts`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
git add v2/apps/mobile/src/civic/conteos.ts v2/apps/mobile/src/civic/conteos.test.ts
git commit -m "feat(mobile): las señales locales se agregan a conteos por celda, contando personas y no señales"
```

---

### Task 3: El mapa aprende a recibir luz

**Files:**
- Modify: `v2/apps/mobile/src/components/civic/TerritoryMap.types.ts`
- Modify: `v2/apps/mobile/src/components/civic/TerritoryMap.native.tsx`
- Modify: `v2/apps/mobile/src/components/civic/TerritoryMap.web.tsx`
- Create: `v2/apps/mobile/src/components/civic/luz-a-color.ts`
- Test: `v2/apps/mobile/src/components/civic/luz-a-color.test.ts`

**Interfaces:**
- Consumes: `LuzCelda` de `@v2/civic-core`.
- Produces: `colorDeLuz(luz: LuzCelda): { fill: string; stroke: string }`, y `TerritoryMapProps.luces?: LuzCelda[]`.

**El reparto.** La conversión de luz a color es **lógica pura y va en su propio archivo con tests**, porque es la regla que hace que el mapa no mienta y no puede quedar enterrada adentro de un componente. Los dos componentes de mapa sólo la aplican.

**Los tres estados, en colores.** Gris oscuro = nadie habló. Plata, del tenue al vivo = habló gente, y la opacidad del trazo lleva el `foco`. Y el gris `sinDato` para las celdas sin denominador, que **nunca** se pintan del color de «nadie habló».

- [ ] **Step 1: Write the failing test**

Create `v2/apps/mobile/src/components/civic/luz-a-color.test.ts`:

```ts
import { luzDeCelda } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { colorDeLuz, SIN_DATO, MUDA } from './luz-a-color';

const luz = (parcial: { voces?: number; habitantes?: number | null; verificables?: number; confirmaciones?: number }) =>
  luzDeCelda({
    cellId: 'c1',
    vocesDistintas: parcial.voces ?? 0,
    habitantes: parcial.habitantes === undefined ? 1000 : parcial.habitantes,
    verificables: parcial.verificables ?? 0,
    confirmaciones: parcial.confirmaciones ?? 0,
  });

describe('colorDeLuz', () => {
  it('nadie habló se pinta con el gris de celda muda', () => {
    expect(colorDeLuz(luz({ voces: 0 })).fill).toBe(MUDA);
  });

  it('sin denominador NO se pinta como muda: tiene su propio gris', () => {
    const sinDenominador = colorDeLuz(luz({ voces: 30, habitantes: null })).fill;
    expect(sinDenominador).toBe(SIN_DATO);
    expect(sinDenominador).not.toBe(MUDA);
  });

  it('más voces se pintan más claro que menos voces', () => {
    const poca = colorDeLuz(luz({ voces: 1 })).fill;
    const mucha = colorDeLuz(luz({ voces: 50 })).fill;
    expect(poca).not.toBe(mucha);
  });

  it('el foco viaja en el trazo: hechos sin confirmar dan trazo más débil', () => {
    const borrosa = colorDeLuz(luz({ voces: 50, verificables: 8, confirmaciones: 0 })).stroke;
    const nitida = colorDeLuz(luz({ voces: 50, verificables: 8, confirmaciones: 8 })).stroke;
    expect(borrosa).not.toBe(nitida);
  });

  it('una celda de puros sueños sale tan nítida como una toda confirmada', () => {
    const suenos = colorDeLuz(luz({ voces: 50, verificables: 0 })).stroke;
    const confirmada = colorDeLuz(luz({ voces: 50, verificables: 8, confirmaciones: 8 })).stroke;
    expect(suenos).toBe(confirmada);
  });

  it('devuelve siempre colores válidos, nunca undefined', () => {
    for (const l of [luz({}), luz({ habitantes: null }), luz({ voces: 999 })]) {
      const c = colorDeLuz(l);
      expect(c.fill).toMatch(/^(#|rgba)/);
      expect(c.stroke).toMatch(/^(#|rgba)/);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd v2/apps/mobile && npx vitest run src/components/civic/luz-a-color.test.ts`
Expected: FAIL — no se resuelve `./luz-a-color`.

- [ ] **Step 3: Write the pure colour rule**

Create `v2/apps/mobile/src/components/civic/luz-a-color.ts`:

```ts
/**
 * De luz a color — spec `docs/specs/2026-08-04-el-registro.md` §6.1.
 *
 * Tres estados y no dos. El que más importa es el tercero: una celda **sin
 * denominador** no se puede pintar del color de «nadie habló», porque oscuro
 * ya significa eso. Confundirlos hace que el mapa mienta justo en el campo,
 * que es donde no hay radio censal fino.
 *
 * Vive suelto y con tests porque es la regla que hace que el mapa no mienta:
 * enterrada adentro de un componente de mapa, nadie la volvería a mirar.
 */

import type { LuzCelda } from '@v2/civic-core';

/** Nadie habló todavía. Es la tarea, no un error. */
export const MUDA = '#241F17';
/** No sabemos cuánta gente vive acá. Nunca es lo mismo que la anterior. */
export const SIN_DATO = '#3A362D';

/** La plata: el país encendido. Hombre Gris → plata → argentum → Argentina. */
const PLATA = { r: 226, g: 232, b: 240 };

export interface ColorCelda {
  fill: string;
  stroke: string;
}

export const colorDeLuz = (luz: LuzCelda): ColorCelda => {
  if (luz.intensidad === null) {
    return { fill: SIN_DATO, stroke: 'rgba(140,138,130,0.45)' };
  }
  if (luz.intensidad === 0) {
    return { fill: MUDA, stroke: 'rgba(140,138,130,0.30)' };
  }
  // El relleno lleva el brillo; el trazo lleva el foco. Una celda puede estar
  // encendida y borrosa, y eso tiene que verse.
  const alfa = 0.10 + luz.intensidad * 0.70;
  return {
    fill: `rgba(${PLATA.r},${PLATA.g},${PLATA.b},${alfa.toFixed(3)})`,
    stroke: `rgba(${PLATA.r},${PLATA.g},${PLATA.b},${(0.25 + luz.foco * 0.55).toFixed(3)})`,
  };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd v2/apps/mobile && npx vitest run src/components/civic/luz-a-color.test.ts`
Expected: PASS — 6 tests.

- [ ] **Step 5: Wire it into both map platforms**

En `TerritoryMap.types.ts`, agregá a `TerritoryMapProps`:

```ts
  /** La luz por celda. Cuando viene, manda sobre `coverageCells`. */
  luces?: LuzCelda[];
```

…con `import type { LuzCelda } from '@v2/civic-core';` arriba.

**Nativo** (`TerritoryMap.native.tsx`): el bucle de `coverageCells` ya renderiza un `<MapPolygon>` por celda con `fillColor`/`strokeColor` fijos. Cuando haya una `luz` con el mismo `cellId`, usá `colorDeLuz(luz)` en lugar de las constantes.

**Web** (`TerritoryMap.web.tsx`): la capa `coverage` usa hoy un `fill-color` constante. Para pintar por celda, poné el color como **propiedad del feature** en `coverageGeoJson` y cambiá el paint a `'fill-color': ['get', 'fill']` y `'line-color': ['get', 'stroke']`. Las expresiones de maplibre no aceptan `null`, así que el color ya viene resuelto desde `colorDeLuz` — que es justo por lo que esa función devuelve strings y no la unión cruda.

- [ ] **Step 6: Verify and commit**

Run: `cd v2/apps/mobile && npx vitest run && npx tsc --noEmit 2>&1 | grep -c "error TS"`
Expected: tests en verde; el conteo de errores de `tsc` sigue siendo **4** (los preexistentes de `D-025`).

```bash
git add v2/apps/mobile/src/components/civic
git commit -m "feat(mobile): el mapa pinta la luz por celda, y el gris de sin-dato nunca se confunde con el de nadie-habló"
```

---

### Task 4: Desacoplar — el tipo de captura se muda a civic, y lo cívico deja de escribir en el juego

**Files:**
- Modify: `v2/apps/mobile/src/civic/types.ts` — recibe el tipo de captura
- Modify: `v2/apps/mobile/src/civic/repo.ts` — sacar las 2 llamadas a brasas
- Modify: `v2/apps/mobile/src/lib/social.ts` — dejar de importar del juego
- Modify: `v2/apps/mobile/src/lib/capturar-gps.ts` — dejar de importar del store del juego
- Modify: `v2/apps/mobile/src/civic/gps-deadline.test.ts` — el mock ya no apunta al juego
- Modify: `v2/apps/mobile/src/db/repos.ts` — podar lo que es sólo del juego
- Modify: `v2/apps/mobile/src/db/schema.ts` — el tipo de la columna viene de civic

**Interfaces:**
- Produces: `TipoSenalCapturada` en `@/civic/types`. `db/schema.ts` y `db/repos.ts` dejan de importar de `../game/`.

**Por qué esta tarea existe y va primero.** El plan original decía «borrá `src/game/`» sobre una medición equivocada: se buscó el acople con `grep "@/game/"` sólo en `app/` y `components/`, y `db/repos.ts` y `db/schema.ts` importan por **ruta relativa** (`'../game/types'`), así que no aparecieron. El acople real está documentado en `.superpowers/sdd/r2-task-4-analisis.md`.

**El hallazgo que ordena todo:** `TipoEstrella = TipoSenal | 'amistad'`, y la tabla `stars` está documentada como *«cada captura real»*. La escribe `escuchar.tsx`, que sobrevive, vía `crearEstrellaCivicaUnaVez`. **Es la tabla de captura de la app con nombre de juego.** Por eso el tipo se rescata antes de borrar nada.

**El miembro `'amistad'`** lo escribía sólo `qr.tsx` (chispas entre teléfonos), que muere. Ningún código cívico lo escribe nunca. Así que el tipo cívico es exactamente `TipoSenal`, sin ese miembro, y las filas viejas que lo tengan las limpia la migración de la Task 6.

- [ ] **Step 1: Mudar el tipo**

En `src/civic/types.ts` agregá, importando `TipoSenal` de `@/content/types`:

```ts
/**
 * El tipo de una captura guardada. Vivía en `game/types.ts` como
 * `TipoEstrella`, que era `TipoSenal | 'amistad'` — el miembro extra lo
 * escribía sólo el flujo de chispas por QR, que ya no existe. Acá queda
 * exactamente el catálogo cívico: las seis señales y nada más.
 */
export type TipoSenalCapturada = TipoSenal;
```

Cambiá `src/db/schema.ts` y `src/db/repos.ts` para que importen `TipoSenalCapturada` de `../civic/types` en vez de `TipoEstrella` de `../game/types`. **No renombres la tabla todavía** — eso es la Task 6.

- [ ] **Step 2: Lo cívico deja de otorgar brasas**

`src/civic/repo.ts` importa `GANANCIAS, MOTIVOS` de `@/game/brasas` y llama a `ganarBrasasUnaVez` en dos sitios: corroboración útil y resultado confirmado. Sacá el import y las dos llamadas.

**Antes de sacarlas, verificá que su valor de retorno no se use para control de flujo.** Si se usara, pará y reportá: significaría que otorgar brasas decide algo cívico, y eso es otra conversación.

- [ ] **Step 3: Las otras tres dependencias**

- `src/lib/social.ts` importa `LIMITES_CHISPA, LIMITES_CIRCULO` de `@/game/qr-codec`. Mové esas constantes al propio `social.ts` con su comentario, o a donde tenga sentido dentro de `lib/` — pero fuera de `game/`.
- `src/lib/capturar-gps.ts` importa `CLAVES_DIA` de `@/stores/juego`, que es un espacio de nombres de claves de settings. Mové esa constante a `src/db/repos.ts`, junto a `CLAVES`, que es donde vive el resto del vocabulario de settings.
- `src/civic/gps-deadline.test.ts` mockea `@/stores/juego`. Actualizá el mock al nuevo origen.

- [ ] **Step 4: NO podar `db/repos.ts` todavía**

La versión anterior de este plan pedía podar acá las funciones del juego que viven en `db/repos.ts`. **Estaba mal ordenado:** unas diez pantallas del juego que todavía existen las usan, y esas pantallas no mueren hasta la Task 5. Podar ahora rompe la compilación de código que este mismo plan prohíbe borrar.

La poda se mudó a la **Task 6**, que corre después del borrado. Acá no toques `db/repos.ts` más allá de los imports de tipo del Step 1.

- [ ] **Step 5: Verificar que el desacople está completo**

Este grep busca **los dos estilos de import**, que es lo que el plan original no hizo:

```bash
cd v2/apps/mobile/src && grep -rn "@/game/\|@/cielo/\|@/stores/juego\|@/stores/rangos\|\.\./game/\|\./game/" civic/ lib/ protocolo/ components/civic components/papel components/ui
```
Expected: **sin resultados.**

`db/` queda fuera del gate **a propósito**: sigue importando del juego y no puede dejar de hacerlo hasta que la Task 5 borre las pantallas que lo usan. La Task 6 lo cierra.

```bash
cd v2/apps/mobile && npx vitest run && npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: tests verdes (algunos del juego pueden ponerse rojos si probaban lo podado — reportá cuáles), y el conteo de `tsc` **no sube de 4**.

> La app todavía arranca en este punto: no se borró ninguna pantalla.

- [ ] **Step 6: Commit**

```bash
git add -A v2/apps/mobile
git commit -m "refactor(mobile): el tipo de captura se muda a civic y la capa cívica deja de otorgar brasas"
```

---

### Task 5: Borrar la superficie del juego

**Files:**
- Delete: `src/game/`, `src/cielo/`, `src/components/juego/`, `src/stores/juego.ts`, `src/stores/rangos-check.ts`
- Delete: `src/app/index.tsx`, `ver.tsx`, `encender.tsx`, `dar.tsx`, `rito.tsx`, `album.tsx`, `qr.tsx`, `compartir.tsx`, `ftue.tsx`, `bitacora.tsx`, `expediciones/index.tsx`, `expediciones/fundar.tsx`
- Modify: `package.json` — sacar `@shopify/react-native-skia`
- Delete: `patches/@shopify+react-native-skia+2.6.2.patch`

**Lo que NO se borra, y por qué.** Estas dos cosas parecen del juego y no lo son:

- **`src/app/expediciones/[id].tsx` sobrevive.** `repos-protocolo.ts` (`fundarMision`) crea una expedición para las misiones de relevamiento, y `misiones/[id].tsx` —que sobrevive— lee su progreso y tiene un botón «Capturar →» que apunta justo a esa pantalla. Borrarla dejaría el botón colgando.
- **`src/app/misiones/*` sobrevive.** El spec fusiona los dos conceptos de misión y hace sobrevivir el territorial, pero **eso es trabajo de la rebanada 3**. Acá se saca el juego, nada más.

`bitacora.tsx` **sí** se borra: su única fuente de escritura era la luz VER, y el dueño del repo decidió que la Bitácora se va con el juego. La tabla `reflections` la borra la Task 6.

- [ ] **Step 1: Borrar**

Borrá los directorios y archivos de arriba. Sacá Skia del `package.json`, borrá su parche, y después:

```bash
cd v2/apps/mobile && npm install
```

Si `npm install` se queja de dependencias transitivas colgadas, **no lo fuerces**: reportá qué quedó roto.

- [ ] **Step 2: Podar el contenido huérfano**

En `src/content/`, borrá lo que existía **sólo** para el juego. Antes de borrar cada archivo, buscá quién lo importa todavía. **Las seis señales y sus preguntas son contenido cívico y se quedan.**

- [ ] **Step 3: Verificar**

```bash
cd v2/apps/mobile/src && grep -rn "@/game/\|@/cielo/\|@/stores/juego\|@/stores/rangos\|components/juego\|\.\./game/\|react-native-skia" . | grep -v node_modules
```
Expected: sin resultados.

```bash
cd v2/apps/mobile && npx vitest run && npx tsc --noEmit 2>&1 | grep -c "error TS"
```
El conteo de tests **baja** — es correcto, la lógica que probaban ya no existe. Reportá el antes y el después. `tsc` no sube de 4.

> A partir de acá **la app no arranca**: no hay `src/app/index.tsx`. Es esperado y lo arreglan las Tasks 7 y 8. **No inventes una portada provisoria** — sobreviviría y se pudriría.

- [ ] **Step 4: Commit**

```bash
git add -A v2/apps/mobile
git commit -m "refactor(mobile): se va la superficie del juego — El Cielo, las luces, el álbum y Skia"
```

---

### Task 6: El schema queda cívico — renombre y poda con migración

**Files:**
- Modify: `v2/apps/mobile/src/db/schema.ts`
- Modify: los archivos que nombren `stars` (`src/db/repos.ts`, `src/civic/campaigns.ts`, y los que aparezcan)
- Create: `v2/apps/mobile/drizzle/0019_*.sql` y su snapshot, vía `npx drizzle-kit generate`

**Qué cambia en el schema:**

| Tabla | Qué le pasa | Por qué |
|---|---|---|
| `stars` | **se renombra a `senales`** | Es la tabla de captura de la app; tenía nombre de juego |
| `reflections` | se borra | La Bitácora se va con el juego (decisión del dueño) |
| `commitments` | se borra | Es la mecánica de la luz DAR; la señal cívica «compromiso» es otra cosa |
| `days` | se borra | Las tres luces del día |
| `ember_ledger` | se borra | Las brasas; la Task 4 ya sacó las 2 escrituras cívicas |
| `unlocks` | se borra | Constelaciones del álbum |
| `redeemed_nonces` | se borra | Anti-replay de las chispas por QR |
| `expeditions`, `expedition_entries` | **se quedan** | Las usa Protocolo Vivo, no el juego |
| `settings`, `civic_*`, `pv_*` | se quedan | |

De la tabla renombrada sacá además las columnas que eran sólo del juego: `nocturna`, `fugaz`, `fundadora`, `constelacionId`. **Dejá `expeditionId` y `expeditionStepKey`**: las expediciones sobreviven.

- [ ] **Step 1: Podar `db/repos.ts`**

Esto venía de la Task 4 y se movió acá porque antes del borrado rompía la compilación.

**Se conservan**: `nuevoId`, `hoyLocal`, `ahoraISO`, `getSetting`, `setSetting`, `CLAVES` (podado), `NuevaEstrella`, `prepararEstrella`, `crearEstrellaCivicaUnaVez`.

**Se van** (sólo del juego): `horaLocal`, `ledgerTodo`, `brasasBalance`, `brasasTotalGanado`, `ganarBrasas`, `ganarBrasasUnaVez`, `gastarBrasas`, `estrellasTodas`, `crearEstrella`, `persistirAsignaciones`, `diaDeHoy`, `diasTodos`, `marcarLuz`, `rachaActual`, `registrarRito`, y todo lo de rarezas, hitos y desbloqueos.

**Cuidado con `prepararEstrella`:** usa `horaLocal` para el flag `nocturna`, que es del juego. Sacalo del preparado y de la fila que se inserta.

Al terminar, este grep tiene que estar vacío y con eso cierra el gate que la Task 4 dejó abierto:

```bash
cd v2/apps/mobile/src && grep -rn "@/game/\|\.\./game/" db/
```

- [ ] **Step 1: Editar el schema y los usos**

Renombrá la tabla y su export, borrá las seis tablas, sacá las columnas del juego. Actualizá cada archivo que las nombre. El comentario de la tabla pasa a decir lo que la tabla es de verdad — cada captura real del territorio — sin vocabulario de juego.

- [ ] **Step 2: Generar la migración**

```bash
cd v2/apps/mobile && npx drizzle-kit generate
```

**Revisá el SQL generado antes de aceptarlo.** drizzle-kit para SQLite suele implementar un renombre como *crear tabla nueva + copiar + borrar vieja*; verificá que el `INSERT ... SELECT` **copie las filas existentes**. Si el SQL borra y recrea sin copiar, **paralo y reportá**: eso destruye las capturas del usuario, que es exactamente lo que este renombre existe para evitar.

Agregá a mano, en la misma migración, el borrado de las filas heredadas del juego:

```sql
DELETE FROM senales WHERE tipo = 'amistad';
```

Con su comentario: eran chispas de amistad del flujo de QR, no señales del territorio.

- [ ] **Step 3: Verificar que la migración corre**

```bash
cd v2/apps/mobile && npx vitest run && npx tsc --noEmit 2>&1 | grep -c "error TS"
```

Hay tests de migración en `src/civic/` (`protocolo-migration.test.ts` y compañía) que corren las migraciones de verdad. Si alguno se pone rojo, la migración está mal — **no ablandes el test**.

- [ ] **Step 4: Commit**

```bash
git add -A v2/apps/mobile
git commit -m "refactor(mobile): la tabla de capturas se llama senales, y el schema pierde las seis tablas del juego"
```

---

### Task 7: El casco — pestañas reales

**Files:**
- Modify: `v2/apps/mobile/src/app/_layout.tsx`
- Create: `v2/apps/mobile/src/app/(tabs)/_layout.tsx`

**Interfaces:**
- Consumes: nada nuevo.
- Produces: la estructura de navegación que la Task 6 y la rebanada 3 llenan.

**Las cuatro pestañas.** `Mapa` · `Aportar` · `Territorio` · `Ajustes`. Aportar entra como pestaña desde el día uno justamente porque `aportar.tsx` no tenía ningún acople al juego: **la captura no desaparece en ningún momento de la demolición.** `Territorio` es provisoria y la rebanada 3 la reemplaza por «Mi barrio».

**Qué se conserva de `_layout.tsx`.** El `DbGate` con su singleton de migraciones, el bloqueo `navigator.locks` de web, el calentamiento del worker, `useCivicSync`, el guard de foco de accesibilidad y el marco de 520px en web. **Todo eso costó caro y funciona.** Lo único que cambia: se van los imports de fuentes del juego si alguna quedó huérfana, se va la redirección al FTUE viejo, y el `<Stack>` de 34 pantallas se reemplaza por el grupo de pestañas más las rutas que siguen siendo push.

- [ ] **Step 1: Escribir el layout de pestañas**

Create `v2/apps/mobile/src/app/(tabs)/_layout.tsx`:

```tsx
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';

import { OSCURO_BARRA, OSCURO_BORDE, OSCURO_META, PAPEL } from '@/theme/tokens';

/** Las cuatro puertas. Todo lo demás cuelga de acá, no compite con ellas. */
const PESTANAS = [
  { name: 'index', title: 'Mapa', icon: 'map-outline' },
  { name: 'aportar', title: 'Aportar', icon: 'add-circle-outline' },
  { name: 'territorio', title: 'Territorio', icon: 'people-outline' },
  { name: 'ajustes', title: 'Ajustes', icon: 'settings-outline' },
] as const;

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PAPEL,
        tabBarInactiveTintColor: OSCURO_META,
        tabBarStyle: { backgroundColor: OSCURO_BARRA, borderTopColor: OSCURO_BORDE },
        tabBarLabelStyle: { fontFamily: 'SpaceMono_400Regular', fontSize: 10 },
      }}
    >
      {PESTANAS.map((p) => (
        <Tabs.Screen
          key={p.name}
          name={p.name}
          options={{
            title: p.title,
            tabBarIcon: ({ color, size }) => <Ionicons name={p.icon} size={size} color={color} />,
          }}
        />
      ))}
    </Tabs>
  );
}
```

- [ ] **Step 2: Mover las pantallas de pestaña y podar el Stack**

Mové `src/app/aportar.tsx`, `src/app/ajustes.tsx` y `src/app/territorio/index.tsx` al grupo `(tabs)/` con los nombres `aportar.tsx`, `ajustes.tsx`, `territorio.tsx`. En `_layout.tsx`, reemplazá el `<Stack>` entero por:

```tsx
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: BG } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="ftue" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
```

…más una `<Stack.Screen>` por cada ruta que siga existiendo y se abra por push (`escuchar`, `escuchar/necesidad/[id]`, `verificar`, `conectar`, `publicar`, `obras/publicar`, `mis-datos`, `circulos`, `bitacora`, `corriente`, `tramas/[id]`, `misiones/*`, `territorio/mapa`, `territorio/inteligencia`, `territorio/misiones/*`). Borrá las entradas de las pantallas que ya no existen.

- [ ] **Step 3: Verificar**

```bash
cd v2/apps/mobile && npx tsc --noEmit 2>&1 | grep -c "error TS"
```
Expected: 4 o menos.

- [ ] **Step 4: Commit**

```bash
git add -A v2/apps/mobile/src/app
git commit -m "feat(mobile): cuatro pestañas reales en vez de un dock que sólo existía en la portada"
```

---

### Task 8: La portada es el mapa

**Files:**
- Create: `v2/apps/mobile/src/app/(tabs)/index.tsx`
- Create: `v2/apps/mobile/src/app/ftue.tsx` (reescritura)

**Interfaces:**
- Consumes: `conteosPorCelda` (Task 2), `colorDeLuz` vía `TerritoryMap` (Task 3), `luzDeCeldas` y `planTerritorialCoverage` de `@v2/civic-core`, y los repos de `@/civic/repo`.
- Produces: la portada.

**El flujo de datos, que es lo que hay que respetar:**

```
repos locales (observations, needs, resources)
   → SenalParaConteo[]              aplanar: lat, lng, actorKey, verificable, confirmada
   → planTerritorialCoverage(zona)  la grilla sobre la zona elegida
   → conteosPorCelda(...)           reparte y deduplica por persona
   → luzDeCeldas(...)               la fórmula de la rebanada 1
   → <TerritoryMap luces={...} />   el pintado de la Task 3
```

**El estado vacío es el producto.** Con cero señales el mapa muestra todas las celdas mudas, y eso **es la verdad, no una falla** — la web ya tomó esta decisión en `el-vacio-como-pieza` §3.4 para su lente de Cobertura, que *"no lleva estado vacío: ya está diciendo la verdad"*. Lo único que va encima es una línea que invita, sin disculparse:

> **Nadie habló todavía en estas N celdas.**
> La primera puede ser la tuya.

**Y hay que decir de dónde sale el denominador.** La estimación es por densidad provincial uniforme (Task 1), lo que subestima el brillo en zonas rurales. Poné una línea de pie legible: *«Población estimada por densidad provincial (censo 2022). En zonas rurales el brillo queda por debajo del real.»* No es un detalle de rigor: es la diferencia entre una estimación declarada y un número inventado.

**El FTUE nuevo** es una sola pregunta: **elegí tu zona**. Sin registro, sin permisos pedidos de entrada, sin explicación del juego que ya no existe. Guarda la zona en settings con la misma clave que el resto del código ya usa y manda al mapa.

- [ ] **Step 1: Escribir la portada**

Escribí `(tabs)/index.tsx` siguiendo el flujo de arriba. Mirá `src/app/territorio/mapa.tsx` **antes de empezar**: ya carga `observationsAll`, `needsAll` y `resourcesAll`, arma `points`, y llama a `planTerritorialCoverage`. Reusá ese patrón de carga en vez de inventar otro; lo que cambia es que la grilla se arma sobre la zona guardada y no sobre un lazo dibujado a mano.

La pantalla queda **por debajo de 300 líneas** — el tope de `v2/CLAUDE.md`. Si crece, sacá el armado de señales a `src/civic/senales-para-mapa.ts` con su test.

- [ ] **Step 2: Verificar en el navegador**

```bash
# desde la raíz del repo, con el perfil basta-juego-web de .claude/launch.json
```
Abrí la app en el navegador con el viewport en móvil. Comprobá, con capturas:
1. La portada abre en el mapa, a sangre completa, sin el vacío negro.
2. Las cuatro pestañas están y navegan.
3. Con la base vacía, las celdas salen mudas y aparece la línea que invita.
4. Después de aportar una señal desde la pestaña Aportar, **la celda de esa señal se enciende**. Ése es el bucle entero de la app en un gesto: si esto no pasa, la rebanada no está terminada.
5. La consola no tiene errores.

- [ ] **Step 3: Verificar el paquete**

```bash
cd v2/apps/mobile && npx vitest run && npx tsc --noEmit 2>&1 | grep -c "error TS"
cd v2/apps/mobile && npx expo export --platform web --output-dir /tmp/registro-web
```
Expected: tests verdes, 4 errores o menos, y el export completa.

- [ ] **Step 4: Commit**

```bash
git add -A v2/apps/mobile
git commit -m "feat(mobile): la portada es el mapa, y una celda se enciende cuando alguien habla"
```

---

## Qué NO se hace en esta rebanada

- **No se tocan las 7.758 líneas de custodia** ni nada de `src/civic/` fuera de agregar `conteos.ts`. La rebanada 3 las reorganiza en la ficha.
- **No se colapsan las pantallas a 8.** Después de esta rebanada quedan ~20; la rebanada 3 las junta en la ficha. Intentarlo acá mezcla dos demoliciones distintas.
- **No se arreglan los 4 errores de `tsc`** de `Pressable97.tsx`: son `D-025` y se arreglan en el pnpm, no acá.
- **No se unifica la librería de mapas.** Es `D-027` y necesita un ADR propio.
- **No se siembra nada** para que el mapa se vea poblado. V1.

## Tres pasos que dicen QUÉ y no CÓMO, a propósito

Este plan normalmente tendría que traer el código completo de cada paso. Tres no lo traen, y la razón es deliberada:

- **Task 3, Step 5** — enchufar el color en los dos mapas.
- **Task 7, Step 2** — mover las pantallas de pestaña y podar el `Stack`.
- **Task 8, Step 1** — escribir la portada.

Los tres **adaptan código existente y grande** (`TerritoryMap.web.tsx` son 339 líneas de maplibre, `territorio/mapa.tsx` son 437) que quien implemente tiene que leer igual. Escribirles el código desde un conocimiento parcial del archivo produciría algo que se ve seguro y está mal, que es peor que una instrucción precisa. Para los tres, el plan da el **contrato exacto** —qué props, qué flujo de datos, qué expresión de maplibre, qué tope de líneas— y la verificación observable de la Task 8, Step 2, que es la que realmente decide si la rebanada está terminada.

## Riesgos

- **El denominador estimado subestima el brillo rural**, por asumir densidad pareja adentro de cada provincia. Es una decisión tomada a conciencia para poder ver la idea funcionando; la pantalla lo declara y `D-026` apunta al reemplazo.
- **Sacar Skia puede arrastrar dependencias transitivas.** Si `npm install` se queja, no lo fuerces: reportá qué quedó colgado.
- **`(tabs)` cambia las rutas de tres pantallas.** Cualquier `router.push('/aportar')` sigue funcionando con expo-router, pero verificá los deep links de `qr.tsx`… que ya no existe. Si algo apuntaba ahí, se va.
