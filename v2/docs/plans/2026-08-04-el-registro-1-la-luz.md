# El Registro · Rebanada 1 — La luz Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Poner en `@v2/civic-core` la fórmula que convierte los conteos de una celda en luz — brillo por participación y nitidez por corroboración — como funciones puras con tests, sin tocar ninguna superficie.

**Architecture:** Un módulo nuevo `src/brillo.ts` en la raíz de `civic-core` (no en `simulacion/`, porque esto mide datos reales y no un modelo). Recibe conteos ya agregados y devuelve uniones discriminadas: el brillo es un valor o es `sinDenominador`, la nitidez es un valor o es `inaplicable`. Nunca devuelve cero para decir «no sé». Una rampa no lineal separada traduce participación a intensidad visual, con su coeficiente declarado en un solo lugar.

**Tech Stack:** TypeScript ESM estricto · vitest 2.1.8 · sin dependencias (la regla del paquete: tiene que correr igual en Node, en el navegador y en Hermes).

## Global Constraints

- **Paquete:** `v2/packages/civic-core`. Todos los comandos se corren desde ahí.
- **Lógica pura:** sin UI, sin APIs de plataforma, sin red, sin disco, sin `Date.now()`. Si hace falta el reloj, entra por parámetro — *«un motor que lee el reloj no es reproducible»*.
- **Imports con extensión `.js`** aunque el archivo sea `.ts`. Es ESM: `import { x } from '../brillo.js'`.
- **`@typescript-eslint/no-explicit-any: error`.** No hay `: any`. `@ts-ignore` prohibido.
- **`strict` + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`** están encendidos.
- **Textos en español rioplatense**, incluidas las razones que viajan en los `razon: string`.
- **Nunca devolver `0` para significar «no sé».** Es la regla de la que sale todo el módulo.
- **Commits en Conventional Commits con scope:** `feat(civic-core): …`.

**Verificación de cada tarea:**
```bash
cd v2/packages/civic-core && pnpm test && pnpm type-check && pnpm lint
```

---

### Task 1: El brillo y su ausencia de denominador

**Files:**
- Create: `v2/packages/civic-core/src/brillo.ts`
- Test: `v2/packages/civic-core/src/__tests__/brillo.test.ts`

**Interfaces:**
- Consumes: nada. Es el primer módulo de la rebanada.
- Produces: `ConteoCelda`, `Brillo`, `brilloDeCelda(conteo: ConteoCelda): Brillo`.

- [ ] **Step 1: Write the failing test**

Create `v2/packages/civic-core/src/__tests__/brillo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { brilloDeCelda, type ConteoCelda } from '../brillo.js';

const conteo = (parcial: Partial<ConteoCelda>): ConteoCelda => ({
  cellId: 'c1',
  vocesDistintas: 0,
  habitantes: 1000,
  verificables: 0,
  confirmaciones: 0,
  ...parcial,
});

describe('brilloDeCelda', () => {
  it('es la fracción de habitantes que habló', () => {
    const b = brilloDeCelda(conteo({ vocesDistintas: 40, habitantes: 1000 }));
    expect(b.tipo).toBe('valor');
    if (b.tipo !== 'valor') return;
    expect(b.participacion).toBeCloseTo(0.04);
  });

  it('sin habitantes no vale cero: vale sin denominador', () => {
    const b = brilloDeCelda(conteo({ vocesDistintas: 40, habitantes: null }));
    expect(b.tipo).toBe('sinDenominador');
    if (b.tipo !== 'sinDenominador') return;
    expect(b.razon).toBe('Sin población conocida: no hay denominador.');
  });

  it('cero habitantes es lo mismo que no saber cuántos hay', () => {
    expect(brilloDeCelda(conteo({ habitantes: 0 })).tipo).toBe('sinDenominador');
  });

  it('una celda con denominador y sin voces sí vale cero', () => {
    const b = brilloDeCelda(conteo({ vocesDistintas: 0, habitantes: 1000 }));
    expect(b.tipo).toBe('valor');
    if (b.tipo !== 'valor') return;
    expect(b.participacion).toBe(0);
  });

  it('lleva la fórmula a la vista', () => {
    const b = brilloDeCelda(conteo({ vocesDistintas: 1 }));
    if (b.tipo !== 'valor') throw new Error('debería tener valor');
    expect(b.formula).toBe('voces distintas ÷ habitantes');
  });

  it('no pasa de 1 aunque hablen más personas que habitantes estimados', () => {
    const b = brilloDeCelda(conteo({ vocesDistintas: 2000, habitantes: 1000 }));
    if (b.tipo !== 'valor') throw new Error('debería tener valor');
    expect(b.participacion).toBe(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd v2/packages/civic-core && pnpm vitest run src/__tests__/brillo.test.ts`
Expected: FAIL — `Failed to resolve import "../brillo.js"`.

- [ ] **Step 3: Write minimal implementation**

Create `v2/packages/civic-core/src/brillo.ts`:

```ts
/**
 * La luz de una celda — spec `docs/specs/2026-08-04-el-registro.md` §6.
 *
 * Dos variables independientes sobre los mismos conteos: el **brillo** dice
 * cuánta gente habló y la **nitidez** dice cuánto se comprobó. Una celda puede
 * estar encendida y borrosa, que es el caso más interesante y el que un solo
 * número no puede contar.
 *
 * La regla de la que sale todo el módulo: **nunca devolver `0` para significar
 * «no sé»**. Cero es un dato — «nadie habló», «nada se confirmó» — y pintar la
 * ignorancia con el mismo color que el silencio hace que el mapa mienta justo
 * donde menos se lo puede permitir, que es el campo sin radio censal fino.
 *
 * Vive en la raíz del paquete y no en `simulacion/` porque mide datos reales.
 * La Simulación modela un país posible; esto describe el que hay.
 */

/** Los conteos ya agregados de una celda. Quién los cuenta es problema de quien llama. */
export interface ConteoCelda {
  cellId: string;
  /**
   * Personas distintas que hablaron, no señales. Si contara señales, un solo
   * vecino entusiasta encendería su cuadra él solo — regla 8 de la
   * Constitución de producto, y la puerta de entrada del brigading.
   */
  vocesDistintas: number;
  /** Habitantes estimados. `null` cuando no hay denominador conocido. */
  habitantes: number | null;
  /** Señales verificables presentes: necesidad, ¡basta!, recurso. */
  verificables: number;
  /** Confirmaciones registradas sobre esas verificables. */
  confirmaciones: number;
}

export type Brillo =
  | { tipo: 'valor'; participacion: number; formula: string }
  | { tipo: 'sinDenominador'; razon: string };

const SIN_POBLACION = 'Sin población conocida: no hay denominador.';

/**
 * Cuánta gente habló, como fracción de la que vive ahí.
 *
 * Normalizado por población porque sin denominador el mapa dibuja densidad de
 * población en vez de participación: el microcentro brillaría más que un
 * pueblo donde habló el 40% de la gente. Regla 5 de la Constitución —
 * «la participación no equivale a representatividad».
 */
export const brilloDeCelda = (conteo: ConteoCelda): Brillo => {
  const habitantes = conteo.habitantes;
  if (habitantes === null || habitantes <= 0) {
    return { tipo: 'sinDenominador', razon: SIN_POBLACION };
  }
  const crudo = Math.max(0, conteo.vocesDistintas) / habitantes;
  return {
    tipo: 'valor',
    participacion: Math.min(1, crudo),
    formula: 'voces distintas ÷ habitantes',
  };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd v2/packages/civic-core && pnpm vitest run src/__tests__/brillo.test.ts`
Expected: PASS — 6 tests.

- [ ] **Step 5: Commit**

```bash
git add v2/packages/civic-core/src/brillo.ts v2/packages/civic-core/src/__tests__/brillo.test.ts
git commit -m "feat(civic-core): el brillo de una celda es participación, y su ausencia no es cero"
```

---

### Task 2: La nitidez y su inaplicabilidad

**Files:**
- Modify: `v2/packages/civic-core/src/brillo.ts`
- Test: `v2/packages/civic-core/src/__tests__/brillo.test.ts`

**Interfaces:**
- Consumes: `ConteoCelda` de la Task 1.
- Produces: `Nitidez`, `nitidezDeCelda(conteo: ConteoCelda): Nitidez`.

- [ ] **Step 1: Write the failing test**

Append to `v2/packages/civic-core/src/__tests__/brillo.test.ts`, and add `nitidezDeCelda` y `type Nitidez` al import de `'../brillo.js'`:

```ts
describe('nitidezDeCelda', () => {
  it('es la fracción de verificables que alguien confirmó', () => {
    const n = nitidezDeCelda(conteo({ verificables: 4, confirmaciones: 3 }));
    expect(n.tipo).toBe('valor');
    if (n.tipo !== 'valor') return;
    expect(n.fraccion).toBeCloseTo(0.75);
  });

  it('una celda de puros sueños no tiene nitidez cero: no tiene nitidez', () => {
    const n = nitidezDeCelda(conteo({ vocesDistintas: 9, verificables: 0 }));
    expect(n.tipo).toBe('inaplicable');
    if (n.tipo !== 'inaplicable') return;
    expect(n.razon).toBe('No hay hechos que comprobar en esta celda.');
  });

  it('hechos sin confirmar sí valen cero: eso es estar borrosa', () => {
    const n = nitidezDeCelda(conteo({ verificables: 5, confirmaciones: 0 }));
    expect(n.tipo).toBe('valor');
    if (n.tipo !== 'valor') return;
    expect(n.fraccion).toBe(0);
  });

  it('no pasa de 1 aunque haya más confirmaciones que hechos', () => {
    const n = nitidezDeCelda(conteo({ verificables: 2, confirmaciones: 7 }));
    if (n.tipo !== 'valor') throw new Error('debería tener valor');
    expect(n.fraccion).toBe(1);
  });

  it('no depende del brillo: se puede estar encendida y borrosa', () => {
    const c = conteo({ vocesDistintas: 500, habitantes: 1000, verificables: 3, confirmaciones: 0 });
    const b = brilloDeCelda(c);
    const n = nitidezDeCelda(c);
    if (b.tipo !== 'valor' || n.tipo !== 'valor') throw new Error('los dos deberían tener valor');
    expect(b.participacion).toBeGreaterThan(0.4);
    expect(n.fraccion).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd v2/packages/civic-core && pnpm vitest run src/__tests__/brillo.test.ts`
Expected: FAIL — `nitidezDeCelda is not exported by ../brillo.ts`.

- [ ] **Step 3: Write minimal implementation**

Append to `v2/packages/civic-core/src/brillo.ts`:

```ts
export type Nitidez =
  | { tipo: 'valor'; fraccion: number; formula: string }
  | { tipo: 'inaplicable'; razon: string };

const SIN_HECHOS = 'No hay hechos que comprobar en esta celda.';

/**
 * Cuánto de lo afirmado sobre esta celda pasó por un segundo par de ojos.
 *
 * Sólo los hechos se corroboran: los sueños, valores y compromisos se
 * deliberan — regla 11 de la Constitución. Por eso una celda de puras
 * deliberables no da nitidez cero, da `inaplicable`: cero significa «hay
 * hechos sin confirmar», y ahí no hay ningún hecho pendiente. La ausencia de
 * pregunta no se pinta como mala respuesta.
 */
export const nitidezDeCelda = (conteo: ConteoCelda): Nitidez => {
  const verificables = Math.max(0, conteo.verificables);
  if (verificables === 0) return { tipo: 'inaplicable', razon: SIN_HECHOS };
  const crudo = Math.max(0, conteo.confirmaciones) / verificables;
  return {
    tipo: 'valor',
    fraccion: Math.min(1, crudo),
    formula: 'confirmaciones ÷ señales verificables',
  };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd v2/packages/civic-core && pnpm vitest run src/__tests__/brillo.test.ts`
Expected: PASS — 11 tests.

- [ ] **Step 5: Commit**

```bash
git add v2/packages/civic-core/src/brillo.ts v2/packages/civic-core/src/__tests__/brillo.test.ts
git commit -m "feat(civic-core): la nitidez mide corroboración, y una celda sin hechos no es una celda borrosa"
```

---

### Task 3: La rampa, que no puede ser lineal

**Files:**
- Create: `v2/packages/civic-core/src/coeficientes-luz.ts`
- Modify: `v2/packages/civic-core/src/brillo.ts`
- Test: `v2/packages/civic-core/src/__tests__/brillo.test.ts`

**Interfaces:**
- Consumes: `Brillo` de la Task 1.
- Produces: `COEFICIENTES_LUZ`, `intensidadDeBrillo(brillo: Brillo): number | null`.

**Por qué existe esta tarea.** La participación real nunca se acerca a 1. Un barrio donde habla el 5% de la gente es un fenómeno extraordinario, y en una rampa lineal 0–1 se vería negro. Si la intensidad visual fuera la participación cruda, el mapa estaría apagado siempre y la idea entera no se vería nunca. Hace falta un punto de referencia declarado — cuánta participación se lee como celda plenamente encendida — y tiene que vivir en un solo lugar, con su razón escrita, como ya hace `simulacion/coeficientes.ts`.

- [ ] **Step 1: Write the failing test**

Append to `v2/packages/civic-core/src/__tests__/brillo.test.ts`, agregando `intensidadDeBrillo` al import de `'../brillo.js'` y `COEFICIENTES_LUZ` desde `'../coeficientes-luz.js'`:

```ts
describe('intensidadDeBrillo', () => {
  it('la participación de referencia llega a la intensidad plena', () => {
    const b = brilloDeCelda(conteo({
      vocesDistintas: COEFICIENTES_LUZ.PARTICIPACION_PLENA * 1000,
      habitantes: 1000,
    }));
    expect(intensidadDeBrillo(b)).toBeCloseTo(1);
  });

  it('sin denominador no hay intensidad: devuelve null, no cero', () => {
    const b = brilloDeCelda(conteo({ vocesDistintas: 40, habitantes: null }));
    expect(intensidadDeBrillo(b)).toBeNull();
  });

  it('nadie hablando es intensidad cero', () => {
    expect(intensidadDeBrillo(brilloDeCelda(conteo({ vocesDistintas: 0 })))).toBe(0);
  });

  it('satura: el doble de la referencia no se pasa de 1', () => {
    const b = brilloDeCelda(conteo({
      vocesDistintas: COEFICIENTES_LUZ.PARTICIPACION_PLENA * 2000,
      habitantes: 1000,
    }));
    expect(intensidadDeBrillo(b)).toBe(1);
  });

  it('una participación chiquita ya se ve, que es el punto de que la rampa no sea lineal', () => {
    // Una sola voz en mil habitantes: 0,1% de participación.
    const b = brilloDeCelda(conteo({ vocesDistintas: 1, habitantes: 1000 }));
    const i = intensidadDeBrillo(b);
    expect(i).not.toBeNull();
    if (i === null) return;
    expect(i).toBeGreaterThan(0.001);
  });

  it('crece de forma monótona con la participación', () => {
    const de = (voces: number): number => {
      const i = intensidadDeBrillo(brilloDeCelda(conteo({ vocesDistintas: voces, habitantes: 1000 })));
      if (i === null) throw new Error('debería haber intensidad');
      return i;
    };
    expect(de(1)).toBeLessThan(de(5));
    expect(de(5)).toBeLessThan(de(20));
    expect(de(20)).toBeLessThan(de(50));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd v2/packages/civic-core && pnpm vitest run src/__tests__/brillo.test.ts`
Expected: FAIL — `Failed to resolve import "../coeficientes-luz.js"`.

- [ ] **Step 3: Write minimal implementation**

Create `v2/packages/civic-core/src/coeficientes-luz.ts`:

```ts
/**
 * Los coeficientes de la luz — decisiones nuestras, no medidas.
 *
 * Mismo criterio que `simulacion/coeficientes.ts`: viven juntos, con su razón
 * escrita, y cambiarlos es cambiar una constante a la vista. La diferencia es
 * que éstos no viajan como `declarado` porque no son parte del motor de la
 * Simulación: gobiernan cómo se dibuja lo medido, no qué se modela.
 */
export interface CoeficientesLuz {
  /** Participación que se lee como celda plenamente encendida. */
  PARTICIPACION_PLENA: number;
  /** Exponente de la rampa. Menor que 1 levanta la parte baja de la curva. */
  CURVA: number;
}

export const COEFICIENTES_LUZ: CoeficientesLuz = {
  /**
   * 5% de los habitantes de una celda. Es un número alto y elegido a
   * conciencia: si el 5% de un barrio dejó una voz, ese barrio habló de
   * verdad. Poner la referencia más abajo haría que un puñado de personas
   * pintara una cuadra entera de plata viva, que es exactamente la mentira
   * que la normalización viene a evitar.
   *
   * Es una decisión de diseño sin datos todavía. Cuando entren voces reales
   * hay que volver acá y mirarlo de nuevo.
   */
  PARTICIPACION_PLENA: 0.05,

  /**
   * 0,45 — cerca de una raíz cuadrada. La participación real vive en el
   * extremo bajo de la escala: una rampa lineal dejaría el país entero
   * indistinguible del negro y la idea no se vería nunca. La curva levanta la
   * parte baja para que la diferencia entre «una voz» y «ninguna» sea visible,
   * sin que «una voz» parezca un barrio movilizado.
   */
  CURVA: 0.45,
};
```

Append to `v2/packages/civic-core/src/brillo.ts` (agregando el import arriba del archivo):

```ts
import { COEFICIENTES_LUZ } from './coeficientes-luz.js';
```

```ts
/**
 * De participación a intensidad visual, 0 a 1.
 *
 * Devuelve `null` —no `0`— cuando no hay denominador. Quien dibuje tiene que
 * elegir el gris de `sinDato` en ese caso, nunca el oscuro: oscuro ya
 * significa «nadie habló».
 */
export const intensidadDeBrillo = (brillo: Brillo): number | null => {
  if (brillo.tipo !== 'valor') return null;
  const relativa = Math.min(1, brillo.participacion / COEFICIENTES_LUZ.PARTICIPACION_PLENA);
  return Math.pow(relativa, COEFICIENTES_LUZ.CURVA);
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd v2/packages/civic-core && pnpm vitest run src/__tests__/brillo.test.ts`
Expected: PASS — 17 tests.

- [ ] **Step 5: Commit**

```bash
git add v2/packages/civic-core/src/coeficientes-luz.ts v2/packages/civic-core/src/brillo.ts v2/packages/civic-core/src/__tests__/brillo.test.ts
git commit -m "feat(civic-core): la rampa de brillo no es lineal, porque la participación real vive abajo"
```

---

### Task 4: La luz de una celda, entera, y la superficie pública

**Files:**
- Modify: `v2/packages/civic-core/src/brillo.ts`
- Modify: `v2/packages/civic-core/src/index.ts`
- Test: `v2/packages/civic-core/src/__tests__/brillo.test.ts`

**Interfaces:**
- Consumes: `brilloDeCelda`, `nitidezDeCelda`, `intensidadDeBrillo`.
- Produces: `LuzCelda`, `luzDeCelda(conteo: ConteoCelda): LuzCelda`, `luzDeCeldas(conteos: readonly ConteoCelda[]): LuzCelda[]`. Todo exportado desde `@v2/civic-core`.

- [ ] **Step 1: Write the failing test**

Append a `v2/packages/civic-core/src/__tests__/brillo.test.ts`, agregando `luzDeCelda` y `luzDeCeldas` al import:

```ts
describe('luzDeCelda', () => {
  it('junta las tres cosas y conserva el id', () => {
    const luz = luzDeCelda(conteo({
      cellId: 'r3c7', vocesDistintas: 25, habitantes: 1000, verificables: 4, confirmaciones: 2,
    }));
    expect(luz.cellId).toBe('r3c7');
    expect(luz.brillo.tipo).toBe('valor');
    expect(luz.nitidez.tipo).toBe('valor');
    expect(luz.intensidad).not.toBeNull();
  });

  it('una celda sin denominador viaja con intensidad null', () => {
    const luz = luzDeCelda(conteo({ habitantes: null, vocesDistintas: 3 }));
    expect(luz.intensidad).toBeNull();
    expect(luz.brillo.tipo).toBe('sinDenominador');
  });
});

describe('luzDeCeldas', () => {
  it('respeta el orden de entrada', () => {
    const luces = luzDeCeldas([
      conteo({ cellId: 'a' }), conteo({ cellId: 'b' }), conteo({ cellId: 'c' }),
    ]);
    expect(luces.map((l) => l.cellId)).toEqual(['a', 'b', 'c']);
  });

  it('con la lista vacía devuelve la lista vacía', () => {
    expect(luzDeCeldas([])).toEqual([]);
  });
});
```

Y crear `v2/packages/civic-core/src/__tests__/brillo-superficie.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import * as core from '../index.js';

describe('superficie pública', () => {
  it('la luz sale por el barril del paquete', () => {
    expect(typeof core.brilloDeCelda).toBe('function');
    expect(typeof core.nitidezDeCelda).toBe('function');
    expect(typeof core.intensidadDeBrillo).toBe('function');
    expect(typeof core.luzDeCelda).toBe('function');
    expect(typeof core.luzDeCeldas).toBe('function');
    expect(core.COEFICIENTES_LUZ.PARTICIPACION_PLENA).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd v2/packages/civic-core && pnpm vitest run src/__tests__/brillo.test.ts src/__tests__/brillo-superficie.test.ts`
Expected: FAIL — `luzDeCelda is not exported` y `core.brilloDeCelda is not a function`.

- [ ] **Step 3: Write minimal implementation**

Append to `v2/packages/civic-core/src/brillo.ts`:

```ts
/** La luz de una celda: los dos ejes más la intensidad ya lista para dibujar. */
export interface LuzCelda {
  cellId: string;
  brillo: Brillo;
  nitidez: Nitidez;
  /** `null` cuando no hay denominador. Quien dibuje elige el gris de `sinDato`. */
  intensidad: number | null;
}

export const luzDeCelda = (conteo: ConteoCelda): LuzCelda => {
  const brillo = brilloDeCelda(conteo);
  return {
    cellId: conteo.cellId,
    brillo,
    nitidez: nitidezDeCelda(conteo),
    intensidad: intensidadDeBrillo(brillo),
  };
};

export const luzDeCeldas = (conteos: readonly ConteoCelda[]): LuzCelda[] =>
  conteos.map(luzDeCelda);
```

Modify `v2/packages/civic-core/src/index.ts` — agregar las dos líneas después de `export * from './coverage.js';`:

```ts
export * from './coeficientes-luz.js';
export * from './brillo.js';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd v2/packages/civic-core && pnpm test && pnpm type-check && pnpm lint`
Expected: PASS — toda la suite del paquete verde, `tsc` sin errores, eslint sin warnings.

- [ ] **Step 5: Commit**

```bash
git add v2/packages/civic-core/src/brillo.ts v2/packages/civic-core/src/index.ts v2/packages/civic-core/src/__tests__/brillo.test.ts v2/packages/civic-core/src/__tests__/brillo-superficie.test.ts
git commit -m "feat(civic-core): luzDeCelda junta brillo, nitidez e intensidad y sale por el barril"
```

---

### Task 5: Las guardas del spec

**Files:**
- Create: `v2/packages/civic-core/src/__tests__/brillo-guardas.test.ts`

**Interfaces:**
- Consumes: todo lo público de `brillo.ts`.
- Produces: nada. Son guardas: existen para que alguien no pueda romper las propiedades sin que algo se ponga rojo.

**Por qué existen.** Las cuatro propiedades que siguen son las que hacen que el mapa no mienta, y las cuatro son fáciles de romper con un refactor que parece inocente. Cada una sale de una línea del spec o de la Constitución de producto, y el test la cita.

- [ ] **Step 1: Write the failing test**

Create `v2/packages/civic-core/src/__tests__/brillo-guardas.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { brilloDeCelda, intensidadDeBrillo, luzDeCelda, nitidezDeCelda, type ConteoCelda } from '../brillo.js';

const conteo = (parcial: Partial<ConteoCelda>): ConteoCelda => ({
  cellId: 'c1',
  vocesDistintas: 0,
  habitantes: 1000,
  verificables: 0,
  confirmaciones: 0,
  ...parcial,
});

describe('guardas de la luz', () => {
  /**
   * Regla 8 de la Constitución: las recompensas premian utilidad, no volumen
   * bruto. `ConteoCelda` no tiene un campo de «señales» a propósito — si
   * alguien lo agrega y el brillo empieza a usarlo, esta guarda no alcanza a
   * verlo, pero el contrato de tipos sí.
   */
  it('veinte señales de una persona pesan menos que cinco de cinco personas', () => {
    const unaPersona = intensidadDeBrillo(brilloDeCelda(conteo({ vocesDistintas: 1 })));
    const cincoPersonas = intensidadDeBrillo(brilloDeCelda(conteo({ vocesDistintas: 5 })));
    expect(unaPersona).not.toBeNull();
    expect(cincoPersonas).not.toBeNull();
    if (unaPersona === null || cincoPersonas === null) return;
    expect(cincoPersonas).toBeGreaterThan(unaPersona);
  });

  /**
   * Spec §3, R3: las deliberables no son un residuo. Una voz que deja un
   * sueño enciende la celda igual que una que reporta una farola rota. Si no
   * encendiera, serían decoración.
   */
  it('una voz deliberable enciende igual que una verificable', () => {
    const soloSuenos = luzDeCelda(conteo({ vocesDistintas: 10, verificables: 0 }));
    const soloHechos = luzDeCelda(conteo({ vocesDistintas: 10, verificables: 10, confirmaciones: 0 }));
    expect(soloSuenos.intensidad).toBe(soloHechos.intensidad);
  });

  /**
   * Spec §6.1: una celda sin denominador nunca se dibuja oscura, porque
   * oscuro ya significa «nadie habló».
   */
  it('no saber cuánta gente vive acá nunca se confunde con que nadie habló', () => {
    const nadieHablo = luzDeCelda(conteo({ vocesDistintas: 0, habitantes: 1000 }));
    const noSabemos = luzDeCelda(conteo({ vocesDistintas: 50, habitantes: null }));
    expect(nadieHablo.intensidad).toBe(0);
    expect(noSabemos.intensidad).toBeNull();
    expect(nadieHablo.intensidad).not.toBe(noSabemos.intensidad);
  });

  /**
   * Spec §6: brillo y nitidez son independientes. El caso que un solo número
   * no puede contar es la celda encendida y borrosa.
   */
  it('encendida y borrosa es un estado representable', () => {
    const luz = luzDeCelda(conteo({
      vocesDistintas: 50, habitantes: 1000, verificables: 8, confirmaciones: 0,
    }));
    expect(luz.intensidad).toBeGreaterThan(0.5);
    expect(luz.nitidez.tipo).toBe('valor');
    if (luz.nitidez.tipo !== 'valor') return;
    expect(luz.nitidez.fraccion).toBe(0);
  });

  /** Ningún resultado sale sin poder decir de dónde vino. */
  it('todo valor viaja con su fórmula o con su razón', () => {
    const casos: ConteoCelda[] = [
      conteo({ vocesDistintas: 5, verificables: 2, confirmaciones: 1 }),
      conteo({ habitantes: null }),
      conteo({ verificables: 0 }),
    ];
    for (const c of casos) {
      const b = brilloDeCelda(c);
      const n = nitidezDeCelda(c);
      expect(b.tipo === 'valor' ? b.formula : b.razon).toBeTruthy();
      expect(n.tipo === 'valor' ? n.formula : n.razon).toBeTruthy();
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails, then passes without new code**

Run: `cd v2/packages/civic-core && pnpm vitest run src/__tests__/brillo-guardas.test.ts`
Expected: PASS directamente — estas guardas describen propiedades que las Tasks 1–4 ya cumplen. **Si alguna falla, el bug está en `brillo.ts`, no en el test.** Arreglar `brillo.ts` hasta que pasen; no ablandar la guarda.

- [ ] **Step 3: Correr la suite entera del paquete**

Run: `cd v2/packages/civic-core && pnpm test && pnpm type-check && pnpm lint`
Expected: PASS — toda la suite verde, incluidas las 13 suites que ya existían.

- [ ] **Step 4: Verificar que la web no se rompió**

`civic-core` es compartido y la lente Cobertura lo consume.

Run: `cd v2/apps/web && pnpm test`
Expected: PASS — nada de lo agregado toca lo que ya existía, pero el barril cambió y esto lo confirma.

- [ ] **Step 5: Commit**

```bash
git add v2/packages/civic-core/src/__tests__/brillo-guardas.test.ts
git commit -m "test(civic-core): guardas de la luz — las cuatro propiedades que hacen que el mapa no mienta"
```

---

## Qué queda para las rebanadas siguientes

Esta rebanada no toca ninguna superficie a propósito: entrega la fórmula probada y nada más. El orden del spec §12 sigue así, y cada una es su propio plan:

| Rebanada | Qué entrega | Depende de |
|---|---|---|
| **2 · El casco** | Demolición de `src/app`, `src/game`, `src/cielo` y Skia. Pestañas reales y el mapa como portada, pintando `intensidad`. | Rebanada 1 |
| **3 · Los tres verbos** | Aportar con sus dos gestos, Confirmar, y la ficha con el ciclo por estados. | Rebanada 2 |
| **4 · El endpoint** | `GET /api/v1/civic/map/cells`, con el conteo de voces distintas ya agregado y sin identificadores de persona. | Rebanada 1 |
| **5 · La web en plata** | La lente Cobertura deja de ser binaria y usa la rampa. | Rebanadas 1 y 4 |

La 4 y la 5 pueden ir en paralelo a la 2 y la 3: dependen de la fórmula, no del teléfono.
