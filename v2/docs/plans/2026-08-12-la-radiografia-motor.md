# La Radiografía · el motor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el motor de convergencia de La Radiografía —el puerto del embebedor, la similitud, el grafo, los núcleos, las aristas declaradas y la geometría φ— como lógica pura en `@v2/civic-core`, sin tocar base, ni web, ni un solo archivo del plan `2026-08-11-tierra-senal-corroboracion-registro.md`.

**Architecture:** Todo vive en `packages/civic-core/src/radiografia/`, que es lógica pura: sin red, sin disco, sin reloj, sin UI. El cálculo de vectores entra por un **puerto de una sola función** (`Embebedor`), así que el motor entero se prueba con un embebedor falso determinista y ninguna decisión de proveedor bloquea nada de este plan. Los núcleos son las **componentes conexas** del grafo al umbral que elija el lector — la métrica y el dibujo son el mismo objeto.

**Tech Stack:** TypeScript 5.6 estricto · vitest 2.1 · pnpm 10.16 workspaces · cero dependencias nuevas en este plan.

**Spec:** `docs/specs/2026-08-12-la-radiografia.md` — este plan implementa la **rebanada 1** de §10 («el motor, a ciegas»), que §8 declara sin dependencias.

## Global Constraints

- **Cero dependencias nuevas.** Ninguna task de este plan instala nada. `packages/civic-core/package.json` no gana una sola línea en `dependencies`.
- **`@v2/civic-core` es lógica pura.** Sin red, sin disco, sin `Date.now()`, sin APIs de plataforma. Tiene que correr igual en Node, en el navegador y en Hermes (`src/index.ts`, cabecera del barril).
- **TypeScript estricto con `noUncheckedIndexedAccess`.** `a[i]` tiene tipo `number | undefined`. Todo acceso indexado necesita `?? valor` o una guarda. Es la trampa número uno de este plan.
- **`exactOptionalPropertyTypes: true`.** Una propiedad opcional no acepta `undefined` explícito.
- **`@typescript-eslint/no-explicit-any: error`** y **`no-console: error`**. `@ts-ignore` prohibido; si hace falta, `@ts-expect-error` con comentario.
- **ESM con extensión.** Los imports internos llevan `.js`: `import { haversineKm } from '../geo.js'`.
- **Los tests van en `packages/civic-core/src/__tests__/*.test.ts`** e importan desde `'../radiografia/<archivo>.js'`.
- **φ gobierna la presentación y jamás la medición** (spec R10). Ningún módulo de medición —similitud, umbral, distancia— puede importar de `geometria.ts`. La Task 8 pone una guarda que lo hace fallar.
- **Verificación de cada commit:** `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm lint && pnpm type-check && pnpm test:unit`
- **Commits en español, Conventional Commits con scope:** `feat(civic-core): …`
- **Hay sesiones concurrentes** (`docs/DEUDAS.md` D-010). **Todo `git add` va con rutas explícitas.** Nunca `git add -A`, nunca `git add .`.

---

## File Structure

| Archivo | Responsabilidad |
|---|---|
| `packages/civic-core/src/radiografia/tipos.ts` | Los tipos del dominio: `SenalParaNucleo`, `AristaMedida`, `AristaDeclarada`, `Nucleo`, `Particion`, `Adhesion` |
| `packages/civic-core/src/radiografia/embebedor.ts` | El puerto `Embebedor` y `EmbebedorFalso` (determinista, para tests) |
| `packages/civic-core/src/radiografia/similitud.ts` | `similitudCoseno`. **Medición** — no importa geometría |
| `packages/civic-core/src/radiografia/grafo.ts` | `aristasMedidas` (k-NN) y `aristasDeclaradas` (co-adhesión). **Medición** |
| `packages/civic-core/src/radiografia/nucleos.ts` | `nucleosAlUmbral` (componentes conexas), `fraseDelNucleo`, `dosMasLejanos`. **Medición** |
| `packages/civic-core/src/radiografia/geometria.ts` | φ: `esferaDeFibonacci`, `espiralAurea`, `escalaModular`. **Presentación** — nadie de medición la importa |
| `packages/civic-core/src/radiografia/index.ts` | El barril del sub-módulo |
| `packages/civic-core/src/index.ts` | Modificar: agregar `export * from './radiografia/index.js';` |
| `packages/civic-core/src/__tests__/radiografia-*.test.ts` | Un archivo de test por módulo, más `radiografia-guardas.test.ts` |

La separación **medición / presentación** no es estética: es lo que la guarda de la Task 8 verifica. Por eso `geometria.ts` está solo en su columna.

---

## Task 1: Los tipos y el puerto del embebedor

**Files:**
- Create: `packages/civic-core/src/radiografia/tipos.ts`
- Create: `packages/civic-core/src/radiografia/embebedor.ts`
- Test: `packages/civic-core/src/__tests__/radiografia-embebedor.test.ts`

**Interfaces:**
- Consumes: `GeoPoint` de `../types.js`
- Produces: `SenalParaNucleo`, `AristaMedida`, `AristaDeclarada`, `Adhesion`, `Nucleo`, `Particion`, `Embebedor`, `EmbebedorFalso`

- [ ] **Step 1: Escribir el test que falla**

Crear `packages/civic-core/src/__tests__/radiografia-embebedor.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { EmbebedorFalso } from '../radiografia/embebedor.js';

describe('el puerto del embebedor', () => {
  it('devuelve un vector por texto, con las dimensiones que declara', async () => {
    const e = new EmbebedorFalso(8);
    const vs = await e.embeber(['hay un pozo en la esquina', 'sueño con un país sin pozos']);

    expect(vs).toHaveLength(2);
    expect(vs[0]).toHaveLength(8);
    expect(e.dimensiones).toBe(8);
    expect(e.modelo).toBe('falso');
  });

  it('es determinista: el mismo texto da el mismo vector', async () => {
    const e = new EmbebedorFalso(8);
    const [a] = await e.embeber(['no me alcanza']);
    const [b] = await e.embeber(['no me alcanza']);

    expect(a).toEqual(b);
  });

  it('acerca textos parecidos y separa los distintos', async () => {
    const e = new EmbebedorFalso(64);
    const [x, y, z] = await e.embeber([
      'no me alcanza la plata',
      'no me alcanza la guita',
      'hay un pozo en la calle',
    ]);
    const punto = (p: readonly number[], q: readonly number[]) =>
      p.reduce((acc, v, i) => acc + v * (q[i] ?? 0), 0);

    expect(punto(x ?? [], y ?? [])).toBeGreaterThan(punto(x ?? [], z ?? []));
  });

  it('devuelve vectores unitarios', async () => {
    const e = new EmbebedorFalso(16);
    const [v] = await e.embeber(['cualquier cosa']);
    const norma = Math.sqrt((v ?? []).reduce((a, n) => a + n * n, 0));

    expect(norma).toBeCloseTo(1, 10);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-embebedor.test.ts`
Expected: FAIL — `Failed to resolve import "../radiografia/embebedor.js"`

- [ ] **Step 3: Escribir los tipos**

Crear `packages/civic-core/src/radiografia/tipos.ts`:

```ts
/**
 * Los tipos del motor de convergencia.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.5
 *
 * El motor no conoce la tabla `senales` ni ninguna fila de base: recibe lo
 * mínimo que necesita para medir, y quien lo llama se encarga de traducir.
 * Eso es lo que le permite correr contra un JSONL de juguete antes de que la
 * tabla exista (spec §8).
 */
import type { GeoPoint } from '../types.js';

/** Lo mínimo que el motor necesita de una señal para agruparla. */
export interface SenalParaNucleo {
  readonly id: string;
  readonly vector: readonly number[];
  /**
   * El texto **sólo si hay cesión de licencia** (spec §4.5.4). `null` cuando
   * no la hay: la señal cuenta, se dibuja y se mide igual, pero no puede
   * prestar su frase como etiqueta de un núcleo.
   */
  readonly texto: string | null;
  /**
   * El punto **engrosado**, nunca el crudo (spec R13). Quien construye este
   * objeto ya pasó por `publicLocation`. `null` cuando la señal no tiene punto.
   */
  readonly punto: GeoPoint | null;
}

/** Una arista *medida*: la infiere la máquina desde los vectores. */
export interface AristaMedida {
  /** Ordenado: `a < b` como string, para que el par no se repita. */
  readonly a: string;
  readonly b: string;
  readonly similitud: number;
}

/**
 * Una arista *declarada*: la afirmó una persona (spec R6). Nunca se dibuja
 * con el mismo trazo que una medida.
 */
export interface AristaDeclarada {
  readonly a: string;
  readonly b: string;
  /** Actores **distintos** que sostienen esta arista, no filas (spec §4.5.2). */
  readonly actores: number;
}

/** Una fila de `adhesiones`, reducida a lo que el motor necesita. */
export interface Adhesion {
  readonly actorId: string;
  readonly senalId: string;
}

export interface Nucleo {
  readonly ids: readonly string[];
}

/**
 * El resultado de cortar el grafo a un umbral. `solas` no es un residuo: una
 * señal que nadie repitió es una voz sola y se muestra como tal (spec §6).
 */
export interface Particion {
  readonly nucleos: readonly Nucleo[];
  readonly solas: readonly string[];
}
```

- [ ] **Step 4: Escribir el puerto y el falso**

Crear `packages/civic-core/src/radiografia/embebedor.ts`:

```ts
/**
 * El puerto del embebedor — una sola función.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.1
 *
 * El modelo queda como detalle intercambiable y no como decisión
 * irreversible: cambiar de modelo es cambiar la implementación y rehacer el
 * backfill, no reescribir el motor. La implementación real NO vive en este
 * paquete —civic-core es lógica pura, sin disco ni red— sino en el job.
 */
export interface Embebedor {
  /** Entra en la procedencia del análisis: se guarda con cada corrida. */
  readonly modelo: string;
  readonly dimensiones: number;
  embeber(textos: readonly string[]): Promise<readonly (readonly number[])[]>;
}

/** Hash determinista de 32 bits (FNV-1a). Sin dependencias, sin reloj. */
const fnv1a = (texto: string): number => {
  let h = 0x811c9dc5;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
};

const normalizar = (texto: string): string[] =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9ñ]+/)
    .filter((p) => p.length > 0);

/**
 * Embebedor determinista para tests: una bolsa de palabras proyectada por
 * hash a `dimensiones` y normalizada a la unidad.
 *
 * **No es un modelo.** No entiende que «guita» y «plata» son lo mismo. Sirve
 * para probar el motor —que dos textos con palabras compartidas queden más
 * cerca que dos que no comparten ninguna— y para nada más. El motor real usa
 * la implementación del job.
 */
export class EmbebedorFalso implements Embebedor {
  readonly modelo = 'falso';

  constructor(readonly dimensiones: number = 64) {}

  embeber(textos: readonly string[]): Promise<readonly (readonly number[])[]> {
    return Promise.resolve(textos.map((t) => this.uno(t)));
  }

  private uno(texto: string): readonly number[] {
    const v = new Array<number>(this.dimensiones).fill(0);
    for (const palabra of normalizar(texto)) {
      const h = fnv1a(palabra);
      const i = h % this.dimensiones;
      // El signo sale de otro bit del mismo hash: sin eso, dos palabras que
      // caen en la misma dimensión siempre se suman y nunca se cancelan.
      v[i] = (v[i] ?? 0) + (((h >>> 16) & 1) === 1 ? 1 : -1);
    }
    const norma = Math.sqrt(v.reduce((a, n) => a + n * n, 0));
    // Un texto sin palabras da el vector cero, y el cero no se puede
    // normalizar: se devuelve un eje fijo para que la norma siga siendo 1.
    if (norma === 0) {
      const cero = new Array<number>(this.dimensiones).fill(0);
      cero[0] = 1;
      return cero;
    }
    return v.map((n) => n / norma);
  }
}
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-embebedor.test.ts`
Expected: PASS — 4 tests

- [ ] **Step 6: Verificar lint y tipos**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core lint && pnpm --filter @v2/civic-core type-check`
Expected: sin salida de error, exit 0

- [ ] **Step 7: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2
git add packages/civic-core/src/radiografia/tipos.ts \
        packages/civic-core/src/radiografia/embebedor.ts \
        packages/civic-core/src/__tests__/radiografia-embebedor.test.ts
git commit -m "feat(civic-core): el puerto del embebedor y los tipos del motor de convergencia"
```

---

## Task 2: La similitud coseno

**Files:**
- Create: `packages/civic-core/src/radiografia/similitud.ts`
- Test: `packages/civic-core/src/__tests__/radiografia-similitud.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: `similitudCoseno(a: readonly number[], b: readonly number[]): number`

- [ ] **Step 1: Escribir el test que falla**

Crear `packages/civic-core/src/__tests__/radiografia-similitud.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { similitudCoseno } from '../radiografia/similitud.js';

describe('similitud coseno', () => {
  it('da 1 para el mismo vector', () => {
    expect(similitudCoseno([1, 2, 3], [1, 2, 3])).toBeCloseTo(1, 10);
  });

  it('da 0 para vectores ortogonales', () => {
    expect(similitudCoseno([1, 0], [0, 1])).toBeCloseTo(0, 10);
  });

  it('da -1 para vectores opuestos', () => {
    expect(similitudCoseno([1, 0], [-1, 0])).toBeCloseTo(-1, 10);
  });

  it('ignora la magnitud: sólo importa la dirección', () => {
    expect(similitudCoseno([1, 1], [7, 7])).toBeCloseTo(1, 10);
  });

  it('da 0 si alguno es el vector cero, en vez de NaN', () => {
    expect(similitudCoseno([0, 0], [1, 1])).toBe(0);
    expect(similitudCoseno([0, 0], [0, 0])).toBe(0);
  });

  it('tira si los largos no coinciden, en vez de comparar basura', () => {
    expect(() => similitudCoseno([1, 2], [1, 2, 3])).toThrow(/distinto largo/);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-similitud.test.ts`
Expected: FAIL — `Failed to resolve import "../radiografia/similitud.js"`

- [ ] **Step 3: Escribir la implementación**

Crear `packages/civic-core/src/radiografia/similitud.ts`:

```ts
/**
 * La medición de parecido entre dos señales.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.5
 *
 * **Este archivo es MEDICIÓN.** No importa `geometria.ts` ni ninguna
 * constante φ, y hay una guarda que lo verifica
 * (`radiografia-guardas.test.ts`). Poner φ adentro de un número medido sería
 * ponerle un número lindo a un dato que no lo pidió (spec R10).
 */

/**
 * Coseno del ángulo entre dos vectores. Rango [-1, 1].
 *
 * Devuelve `0` —y no `NaN`— cuando alguno es el vector cero: un texto sin
 * palabras no se parece a nada, y propagar `NaN` haría que un solo caso
 * borde envenenara el ordenamiento de todo el grafo.
 */
export const similitudCoseno = (a: readonly number[], b: readonly number[]): number => {
  if (a.length !== b.length) {
    throw new Error(`vectores de distinto largo: ${a.length} vs ${b.length}`);
  }
  let punto = 0;
  let normaA = 0;
  let normaB = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] ?? 0;
    const y = b[i] ?? 0;
    punto += x * y;
    normaA += x * x;
    normaB += y * y;
  }
  if (normaA === 0 || normaB === 0) return 0;
  return punto / (Math.sqrt(normaA) * Math.sqrt(normaB));
};
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-similitud.test.ts`
Expected: PASS — 6 tests

- [ ] **Step 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2
git add packages/civic-core/src/radiografia/similitud.ts \
        packages/civic-core/src/__tests__/radiografia-similitud.test.ts
git commit -m "feat(civic-core): similitud coseno, con el cero devolviendo 0 y no NaN"
```

---

## Task 3: El grafo de aristas medidas (k-NN)

**Files:**
- Create: `packages/civic-core/src/radiografia/grafo.ts`
- Test: `packages/civic-core/src/__tests__/radiografia-grafo.test.ts`

**Interfaces:**
- Consumes: `similitudCoseno` de `./similitud.js`; `AristaMedida` de `./tipos.js`
- Produces: `aristasMedidas(vectores: ReadonlyMap<string, readonly number[]>, k: number): AristaMedida[]`

- [ ] **Step 1: Escribir el test que falla**

Crear `packages/civic-core/src/__tests__/radiografia-grafo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { aristasMedidas } from '../radiografia/grafo.js';

const claveDe = (a: string, b: string) => (a < b ? `${a}-${b}` : `${b}-${a}`);

describe('aristas medidas', () => {
  it('no repite un par ni lo emite en las dos direcciones', () => {
    const vs = new Map<string, readonly number[]>([
      ['a', [1, 0]],
      ['b', [0.99, 0.14]],
      ['c', [0.98, 0.2]],
    ]);
    const aristas = aristasMedidas(vs, 2);
    const claves = aristas.map((e) => claveDe(e.a, e.b));

    expect(new Set(claves).size).toBe(claves.length);
    expect(aristas.every((e) => e.a < e.b)).toBe(true);
  });

  it('conecta a cada señal con sus k más parecidas', () => {
    const vs = new Map<string, readonly number[]>([
      ['a', [1, 0, 0]],
      ['b', [0.9, 0.1, 0]],
      ['c', [0, 1, 0]],
      ['d', [0, 0, 1]],
    ]);
    const aristas = aristasMedidas(vs, 1);

    expect(aristas.some((e) => claveDe(e.a, e.b) === 'a-b')).toBe(true);
  });

  it('no conecta una señal consigo misma', () => {
    const vs = new Map<string, readonly number[]>([['a', [1, 0]], ['b', [0, 1]]]);

    expect(aristasMedidas(vs, 5).every((e) => e.a !== e.b)).toBe(true);
  });

  it('devuelve vacío con menos de dos señales', () => {
    expect(aristasMedidas(new Map(), 12)).toEqual([]);
    expect(aristasMedidas(new Map([['a', [1, 0]]]), 12)).toEqual([]);
  });

  it('guarda la similitud en cada arista', () => {
    const vs = new Map<string, readonly number[]>([['a', [1, 0]], ['b', [1, 0]]]);
    const [arista] = aristasMedidas(vs, 1);

    expect(arista?.similitud).toBeCloseTo(1, 10);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-grafo.test.ts`
Expected: FAIL — `Failed to resolve import "../radiografia/grafo.js"`

- [ ] **Step 3: Escribir la implementación**

Crear `packages/civic-core/src/radiografia/grafo.ts`:

```ts
/**
 * El grafo de convergencia.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.5
 *
 * **Este archivo es MEDICIÓN.** No importa `geometria.ts` (spec R10).
 */
import { similitudCoseno } from './similitud.js';

import type { AristaMedida } from './tipos.js';

const PAR = ' ';

/** Clave canónica de un par no dirigido. */
const clave = (a: string, b: string): string => (a < b ? `${a}${PAR}${b}` : `${b}${PAR}${a}`);

/**
 * Para cada señal, sus `k` vecinas más parecidas por coseno.
 *
 * El resultado es **no dirigido y sin pares repetidos**: se emite la unión de
 * los k-NN de cada lado, que es lo correcto porque «ser vecina de» no es
 * simétrico —`b` puede estar entre las k mejores de `a` sin que `a` esté
 * entre las k mejores de `b`— y descartar ese caso perdería aristas reales.
 *
 * Es O(n²) en comparaciones. A escala del corpus que esta página va a tener
 * en su primer año, eso corre en milisegundos; el día que duela, el k-NN se
 * mueve al índice HNSW de la base (spec §4.4) sin cambiar esta firma.
 */
export const aristasMedidas = (
  vectores: ReadonlyMap<string, readonly number[]>,
  k: number,
): AristaMedida[] => {
  const ids = [...vectores.keys()];
  if (ids.length < 2 || k < 1) return [];

  const vistas = new Set<string>();
  const salida: AristaMedida[] = [];

  for (const id of ids) {
    const v = vectores.get(id);
    if (!v) continue;

    const vecinas = ids
      .filter((otro) => otro !== id)
      .map((otro) => ({ otro, similitud: similitudCoseno(v, vectores.get(otro) ?? []) }))
      // Desempate por id para que el resultado sea estable entre corridas: sin
      // esto, dos vecinas con la misma similitud pueden alternar y el grafo
      // cambia sin que cambie el dato.
      .sort((p, q) => q.similitud - p.similitud || (p.otro < q.otro ? -1 : 1))
      .slice(0, k);

    for (const { otro, similitud } of vecinas) {
      const c = clave(id, otro);
      if (vistas.has(c)) continue;
      vistas.add(c);
      salida.push(
        id < otro ? { a: id, b: otro, similitud } : { a: otro, b: id, similitud },
      );
    }
  }

  return salida;
};
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-grafo.test.ts`
Expected: PASS — 5 tests

- [ ] **Step 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2
git add packages/civic-core/src/radiografia/grafo.ts \
        packages/civic-core/src/__tests__/radiografia-grafo.test.ts
git commit -m "feat(civic-core): el grafo k-NN de aristas medidas, no dirigido y estable"
```

---

## Task 4: Los núcleos — componentes conexas al umbral

**Files:**
- Create: `packages/civic-core/src/radiografia/nucleos.ts`
- Test: `packages/civic-core/src/__tests__/radiografia-nucleos.test.ts`

**Interfaces:**
- Consumes: `AristaMedida`, `Nucleo`, `Particion` de `./tipos.js`
- Produces: `nucleosAlUmbral(ids: readonly string[], aristas: readonly AristaMedida[], umbral: number): Particion`

- [ ] **Step 1: Escribir el test que falla**

Crear `packages/civic-core/src/__tests__/radiografia-nucleos.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { nucleosAlUmbral } from '../radiografia/nucleos.js';

import type { AristaMedida } from '../radiografia/tipos.js';

const ids = ['a', 'b', 'c', 'd', 'e'];
const aristas: readonly AristaMedida[] = [
  { a: 'a', b: 'b', similitud: 0.9 },
  { a: 'c', b: 'd', similitud: 0.8 },
  { a: 'b', b: 'c', similitud: 0.5 },
];

describe('núcleos al umbral', () => {
  it('agrupa por componentes conexas', () => {
    const { nucleos } = nucleosAlUmbral(ids, aristas, 0.75);
    const tamanios = nucleos.map((n) => n.ids.length).sort();

    expect(tamanios).toEqual([2, 2]);
  });

  it('funde islas en un continente cuando baja el umbral', () => {
    const apretado = nucleosAlUmbral(ids, aristas, 0.75);
    const flojo = nucleosAlUmbral(ids, aristas, 0.4);

    expect(apretado.nucleos).toHaveLength(2);
    expect(flojo.nucleos).toHaveLength(1);
    expect(flojo.nucleos[0]?.ids).toHaveLength(4);
  });

  it('cuenta como voz sola a la que ninguna arista alcanza', () => {
    const { solas } = nucleosAlUmbral(ids, aristas, 0.4);

    expect(solas).toEqual(['e']);
  });

  it('con el umbral al tope, todas son voces solas y no hay núcleos', () => {
    const { nucleos, solas } = nucleosAlUmbral(ids, aristas, 0.99);

    expect(nucleos).toEqual([]);
    expect(solas).toEqual(ids);
  });

  it('no pierde ninguna señal: núcleos + solas = todas', () => {
    for (const umbral of [0.3, 0.5, 0.75, 0.85, 0.99]) {
      const { nucleos, solas } = nucleosAlUmbral(ids, aristas, umbral);
      const total = nucleos.reduce((n, x) => n + x.ids.length, 0) + solas.length;

      expect(total).toBe(ids.length);
    }
  });

  it('devuelve los ids ordenados, para que el resultado sea comparable', () => {
    const { nucleos } = nucleosAlUmbral(['b', 'a'], [{ a: 'a', b: 'b', similitud: 1 }], 0.5);

    expect(nucleos[0]?.ids).toEqual(['a', 'b']);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-nucleos.test.ts`
Expected: FAIL — `Failed to resolve import "../radiografia/nucleos.js"`

- [ ] **Step 3: Escribir la implementación**

Crear `packages/civic-core/src/radiografia/nucleos.ts`:

```ts
/**
 * De aristas a núcleos.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.5
 *
 * Un núcleo es una **componente conexa del grafo visible al umbral que el
 * lector eligió**. Que sea el mismo grafo que se dibuja no es un detalle de
 * implementación: es lo que garantiza que la métrica y el dibujo no puedan
 * discrepar (spec R5).
 *
 * **Este archivo es MEDICIÓN.** No importa `geometria.ts` (spec R10).
 */
import type { AristaMedida, Nucleo, Particion } from './tipos.js';

/** Union-find con compresión de camino. */
const raizDe = (padre: Map<string, string>, id: string): string => {
  let actual = id;
  let arriba = padre.get(actual) ?? actual;
  while (arriba !== actual) {
    const abuelo = padre.get(arriba) ?? arriba;
    padre.set(actual, abuelo);
    actual = abuelo;
    arriba = padre.get(actual) ?? actual;
  }
  return actual;
};

/**
 * Corta el grafo al umbral y devuelve sus componentes.
 *
 * `solas` **no es un residuo**: una señal que nadie repitió es una voz sola y
 * se muestra como tal, con el mismo peso tipográfico que el conteo de núcleos
 * (spec §6). Por eso sale del mismo cálculo y no de una resta hecha después.
 */
export const nucleosAlUmbral = (
  ids: readonly string[],
  aristas: readonly AristaMedida[],
  umbral: number,
): Particion => {
  const padre = new Map<string, string>(ids.map((id) => [id, id]));
  const tocadas = new Set<string>();

  for (const arista of aristas) {
    if (arista.similitud < umbral) continue;
    if (!padre.has(arista.a) || !padre.has(arista.b)) continue;
    tocadas.add(arista.a);
    tocadas.add(arista.b);
    const ra = raizDe(padre, arista.a);
    const rb = raizDe(padre, arista.b);
    if (ra !== rb) padre.set(ra, rb);
  }

  const porRaiz = new Map<string, string[]>();
  for (const id of ids) {
    if (!tocadas.has(id)) continue;
    const r = raizDe(padre, id);
    const grupo = porRaiz.get(r);
    if (grupo) grupo.push(id);
    else porRaiz.set(r, [id]);
  }

  const nucleos: Nucleo[] = [...porRaiz.values()]
    .map((grupo) => ({ ids: [...grupo].sort() }))
    // Orden estable y significativo: primero los grandes, y a igual tamaño
    // por el primer id, para que dos corridas del mismo dato den lo mismo.
    .sort((p, q) => q.ids.length - p.ids.length || ((p.ids[0] ?? '') < (q.ids[0] ?? '') ? -1 : 1));

  return { nucleos, solas: ids.filter((id) => !tocadas.has(id)) };
};
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-nucleos.test.ts`
Expected: PASS — 6 tests

- [ ] **Step 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2
git add packages/civic-core/src/radiografia/nucleos.ts \
        packages/civic-core/src/__tests__/radiografia-nucleos.test.ts
git commit -m "feat(civic-core): los núcleos como componentes conexas, con las voces solas contadas"
```

---

## Task 5: La frase del núcleo y los dos más lejanos

**Files:**
- Modify: `packages/civic-core/src/radiografia/nucleos.ts` (agregar dos funciones exportadas al final)
- Test: `packages/civic-core/src/__tests__/radiografia-ficha.test.ts`

**Interfaces:**
- Consumes: `haversineKm` de `../geo.js`; `SenalParaNucleo` de `./tipos.js`; `similitudCoseno` de `./similitud.js`
- Produces:
  - `fraseDelNucleo(senales: readonly SenalParaNucleo[]): { id: string; texto: string } | null`
  - `dosMasLejanos(senales: readonly SenalParaNucleo[]): { a: string; b: string; km: number } | null`

- [ ] **Step 1: Escribir el test que falla**

Crear `packages/civic-core/src/__tests__/radiografia-ficha.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { dosMasLejanos, fraseDelNucleo } from '../radiografia/nucleos.js';

import type { SenalParaNucleo } from '../radiografia/tipos.js';

const señal = (
  id: string,
  vector: readonly number[],
  texto: string | null,
  punto: { lat: number; lng: number } | null = null,
): SenalParaNucleo => ({ id, vector, texto, punto });

describe('la frase del núcleo', () => {
  it('elige la señal más cercana al centro', () => {
    const nucleo = [
      señal('a', [1, 0], 'lejos por un lado'),
      señal('b', [0, 1], 'lejos por el otro'),
      señal('c', [1, 1], 'justo en el medio'),
    ];

    expect(fraseDelNucleo(nucleo)?.texto).toBe('justo en el medio');
  });

  it('NUNCA usa una señal sin cesión, aunque sea la más cercana al centro', () => {
    const nucleo = [
      señal('a', [1, 0], 'con cesión, lejos'),
      señal('b', [0, 1], 'con cesión, lejos'),
      señal('c', [1, 1], null), // la del centro, sin cesión
    ];
    const frase = fraseDelNucleo(nucleo);

    expect(frase?.id).not.toBe('c');
    expect(frase?.texto).toMatch(/con cesión/);
  });

  it('devuelve null si ninguna del núcleo tiene cesión', () => {
    expect(fraseDelNucleo([señal('a', [1, 0], null), señal('b', [0, 1], null)])).toBeNull();
  });

  it('devuelve null para un núcleo vacío', () => {
    expect(fraseDelNucleo([])).toBeNull();
  });
});

describe('los dos más lejanos', () => {
  it('encuentra el par más distante y redondea a la decena de kilómetros', () => {
    const nucleo = [
      señal('ushuaia', [1, 0], 'x', { lat: -54.8, lng: -68.3 }),
      señal('quiaca', [1, 0], 'x', { lat: -22.1, lng: -65.6 }),
      señal('cordoba', [1, 0], 'x', { lat: -31.4, lng: -64.2 }),
    ];
    const par = dosMasLejanos(nucleo);

    expect([par?.a, par?.b].sort()).toEqual(['quiaca', 'ushuaia']);
    expect(par?.km).toBe(Math.round((par?.km ?? 0) / 10) * 10);
    expect(par?.km).toBeGreaterThan(3_500);
    expect(par?.km).toBeLessThan(4_000);
  });

  it('ignora las señales sin punto', () => {
    const nucleo = [
      señal('a', [1, 0], 'x', { lat: -34.6, lng: -58.4 }),
      señal('b', [1, 0], 'x', null),
      señal('c', [1, 0], 'x', { lat: -31.4, lng: -64.2 }),
    ];

    expect([dosMasLejanos(nucleo)?.a, dosMasLejanos(nucleo)?.b].sort()).toEqual(['a', 'c']);
  });

  it('devuelve null si hay menos de dos señales con punto', () => {
    expect(dosMasLejanos([señal('a', [1, 0], 'x', { lat: -34.6, lng: -58.4 })])).toBeNull();
    expect(dosMasLejanos([])).toBeNull();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-ficha.test.ts`
Expected: FAIL — `fraseDelNucleo is not a function` (o error de import)

- [ ] **Step 3: Agregar las dos funciones**

Agregar al final de `packages/civic-core/src/radiografia/nucleos.ts` — y agregar los imports que faltan en la cabecera del archivo:

```ts
import { haversineKm } from '../geo.js';
import { similitudCoseno } from './similitud.js';

import type { AristaMedida, Nucleo, Particion, SenalParaNucleo } from './tipos.js';
```

```ts
/**
 * La frase que rotula un núcleo: la señal **real** más cercana a su centro.
 *
 * Nunca un resumen generado (spec R8, y regla 6 de la constitución de
 * producto: la máquina sugiere, no determina). La máquina elige *cuál*
 * mostrar; nunca *qué decir*.
 *
 * El centro se calcula sobre **todas** las señales del núcleo, tengan cesión
 * o no —el centro del núcleo es el centro del núcleo—, pero sólo puede
 * prestar su frase una señal **con cesión de licencia** (spec §4.5.4). Si
 * ninguna la tiene, devuelve `null` y quien llama muestra el motivo.
 */
export const fraseDelNucleo = (
  senales: readonly SenalParaNucleo[],
): { id: string; texto: string } | null => {
  if (senales.length === 0) return null;

  const dimensiones = senales[0]?.vector.length ?? 0;
  if (dimensiones === 0) return null;

  const centro = new Array<number>(dimensiones).fill(0);
  for (const s of senales) {
    for (let i = 0; i < dimensiones; i++) {
      centro[i] = (centro[i] ?? 0) + (s.vector[i] ?? 0);
    }
  }

  let elegida: { id: string; texto: string } | null = null;
  let mejor = -Infinity;
  for (const s of senales) {
    if (s.texto === null) continue;
    const cerca = similitudCoseno(s.vector, centro);
    // Desempate por id: dos señales igual de centrales no pueden alternar
    // entre corridas o la etiqueta del núcleo parpadearía sin motivo.
    if (cerca > mejor || (cerca === mejor && elegida !== null && s.id < elegida.id)) {
      mejor = cerca;
      elegida = { id: s.id, texto: s.texto };
    }
  }
  return elegida;
};

/**
 * El par de señales del núcleo geográficamente más distante.
 *
 * Es el número que convierte «todos quieren lo mismo» de consigna en
 * medición. Sale del **punto engrosado** —quien construye `SenalParaNucleo`
 * ya pasó por `publicLocation`— y se redondea a la decena de kilómetros
 * (spec R13): la precisión almacenada es un espejo de lo que declaró el
 * cliente, no una protección, y publicar un número al kilómetro sobre
 * domicilios sería publicar un padrón.
 */
export const dosMasLejanos = (
  senales: readonly SenalParaNucleo[],
): { a: string; b: string; km: number } | null => {
  const conPunto = senales.filter(
    (s): s is SenalParaNucleo & { punto: NonNullable<SenalParaNucleo['punto']> } =>
      s.punto !== null,
  );
  if (conPunto.length < 2) return null;

  let mejor: { a: string; b: string; km: number } | null = null;
  for (let i = 0; i < conPunto.length; i++) {
    for (let j = i + 1; j < conPunto.length; j++) {
      const p = conPunto[i];
      const q = conPunto[j];
      if (!p || !q) continue;
      const km = haversineKm(p.punto, q.punto);
      if (!mejor || km > mejor.km) {
        mejor = p.id < q.id ? { a: p.id, b: q.id, km } : { a: q.id, b: p.id, km };
      }
    }
  }
  if (!mejor) return null;
  return { a: mejor.a, b: mejor.b, km: Math.round(mejor.km / 10) * 10 };
};
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-ficha.test.ts`
Expected: PASS — 7 tests

- [ ] **Step 5: Correr todos los tests del paquete, que la Task 4 no se haya roto**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core test:unit`
Expected: PASS, incluidos los 6 de `radiografia-nucleos.test.ts`

- [ ] **Step 6: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2
git add packages/civic-core/src/radiografia/nucleos.ts \
        packages/civic-core/src/__tests__/radiografia-ficha.test.ts
git commit -m "feat(civic-core): la frase del núcleo con la guarda de cesión, y los dos más lejanos"
```

---

## Task 6: Las aristas declaradas

**Files:**
- Modify: `packages/civic-core/src/radiografia/grafo.ts` (agregar una función exportada al final)
- Test: `packages/civic-core/src/__tests__/radiografia-declaradas.test.ts`

**Interfaces:**
- Consumes: `Adhesion`, `AristaDeclarada` de `./tipos.js`
- Produces: `aristasDeclaradas(adhesiones: readonly Adhesion[], autorDe: ReadonlyMap<string, string>): AristaDeclarada[]`

- [ ] **Step 1: Escribir el test que falla**

Crear `packages/civic-core/src/__tests__/radiografia-declaradas.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { aristasDeclaradas } from '../radiografia/grafo.js';

import type { Adhesion } from '../radiografia/tipos.js';

describe('aristas declaradas', () => {
  it('une dos señales a las que adhirió el mismo actor', () => {
    const adhesiones: readonly Adhesion[] = [
      { actorId: 'act1', senalId: 's1' },
      { actorId: 'act1', senalId: 's2' },
    ];
    const aristas = aristasDeclaradas(adhesiones, new Map());

    expect(aristas).toEqual([{ a: 's1', b: 's2', actores: 1 }]);
  });

  it('une la señal que alguien firma con la que ese mismo alguien adhiere', () => {
    const aristas = aristasDeclaradas(
      [{ actorId: 'act1', senalId: 's2' }],
      new Map([['s1', 'act1']]),
    );

    expect(aristas).toEqual([{ a: 's1', b: 's2', actores: 1 }]);
  });

  it('cuenta ACTORES DISTINTOS y no filas', () => {
    const adhesiones: readonly Adhesion[] = [
      { actorId: 'act1', senalId: 's1' },
      { actorId: 'act1', senalId: 's2' },
      { actorId: 'act1', senalId: 's1' }, // repetida: no suma
      { actorId: 'act2', senalId: 's1' },
      { actorId: 'act2', senalId: 's2' },
    ];
    const [arista] = aristasDeclaradas(adhesiones, new Map());

    expect(arista?.actores).toBe(2);
  });

  it('no emite una arista de una señal consigo misma', () => {
    const aristas = aristasDeclaradas(
      [{ actorId: 'act1', senalId: 's1' }],
      new Map([['s1', 'act1']]),
    );

    expect(aristas).toEqual([]);
  });

  it('devuelve vacío cuando un actor adhirió a una sola señal y no firmó ninguna', () => {
    expect(aristasDeclaradas([{ actorId: 'act1', senalId: 's1' }], new Map())).toEqual([]);
  });

  it('devuelve los pares ordenados y sin repetir', () => {
    const aristas = aristasDeclaradas(
      [
        { actorId: 'act1', senalId: 'z' },
        { actorId: 'act1', senalId: 'a' },
      ],
      new Map(),
    );

    expect(aristas).toEqual([{ a: 'a', b: 'z', actores: 1 }]);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-declaradas.test.ts`
Expected: FAIL — `aristasDeclaradas is not a function`

- [ ] **Step 3: Agregar la función**

Agregar al final de `packages/civic-core/src/radiografia/grafo.ts`, y ampliar el import de tipos de la cabecera a:

```ts
import type { Adhesion, AristaDeclarada, AristaMedida } from './tipos.js';
```

```ts
/**
 * Las aristas *declaradas*: las que afirmó una persona.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §4.5.2
 *
 * Los nodos del grafo son **señales**, y un actor no es un nodo — así que una
 * adhesión no es directamente una arista. Se derivan dos formas, las dos
 * entre señales:
 *
 * - **co-adhesión**: un mismo actor adhirió a dos señales;
 * - **adhesión del autor**: el actor que firma una señal adhirió a otra.
 *
 * Se cuentan **actores distintos y no filas**, igual que la decisión 7 de
 * `docs/specs/2026-08-11-b-la-senal.md`: veinte actores de la misma persona
 * no son veinte afirmaciones, y dos filas del mismo actor tampoco.
 *
 * `autorDe` mapea `senalId → actorId` de quien la firma.
 */
export const aristasDeclaradas = (
  adhesiones: readonly Adhesion[],
  autorDe: ReadonlyMap<string, string>,
): AristaDeclarada[] => {
  // actor → señales que ese actor sostiene (adheridas + firmadas)
  const porActor = new Map<string, Set<string>>();
  const sumar = (actorId: string, senalId: string): void => {
    const set = porActor.get(actorId);
    if (set) set.add(senalId);
    else porActor.set(actorId, new Set([senalId]));
  };

  for (const { actorId, senalId } of adhesiones) sumar(actorId, senalId);
  for (const [senalId, actorId] of autorDe) {
    // Sólo entra el autor que además participa por adhesión: si no, dos
    // señales del mismo autor quedarían unidas por el mero hecho de tener el
    // mismo autor, que no es una afirmación sobre que se parezcan.
    if (porActor.has(actorId)) sumar(actorId, senalId);
  }

  const cuenta = new Map<string, Set<string>>();
  for (const [actorId, senales] of porActor) {
    const lista = [...senales].sort();
    for (let i = 0; i < lista.length; i++) {
      for (let j = i + 1; j < lista.length; j++) {
        const a = lista[i];
        const b = lista[j];
        if (!a || !b || a === b) continue;
        const c = clave(a, b);
        const actores = cuenta.get(c);
        if (actores) actores.add(actorId);
        else cuenta.set(c, new Set([actorId]));
      }
    }
  }

  return [...cuenta.entries()]
    .map(([c, actores]) => {
      const [a = '', b = ''] = c.split(PAR);
      return { a, b, actores: actores.size };
    })
    .sort((p, q) => q.actores - p.actores || (p.a < q.a ? -1 : p.a > q.a ? 1 : p.b < q.b ? -1 : 1));
};
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-declaradas.test.ts`
Expected: PASS — 6 tests

- [ ] **Step 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2
git add packages/civic-core/src/radiografia/grafo.ts \
        packages/civic-core/src/__tests__/radiografia-declaradas.test.ts
git commit -m "feat(civic-core): aristas declaradas por co-adhesión, contadas por actores distintos"
```

---

## Task 7: La geometría φ

**Files:**
- Create: `packages/civic-core/src/radiografia/geometria.ts`
- Test: `packages/civic-core/src/__tests__/radiografia-geometria.test.ts`

**Interfaces:**
- Consumes: nada
- Produces: `PHI`, `ANGULO_AUREO`, `Punto3`, `Punto2`, `esferaDeFibonacci(n: number): Punto3[]`, `espiralAurea(n: number, radio: number): Punto2[]`, `escalaModular(paso: number): number`

- [ ] **Step 1: Escribir el test que falla**

Crear `packages/civic-core/src/__tests__/radiografia-geometria.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import {
  ANGULO_AUREO,
  PHI,
  escalaModular,
  esferaDeFibonacci,
  espiralAurea,
} from '../radiografia/geometria.js';

describe('las constantes', () => {
  it('φ y el ángulo áureo son los que dicen ser', () => {
    expect(PHI).toBeCloseTo(1.618033988, 8);
    // 360°/φ² = 137,50776…°
    expect((ANGULO_AUREO * 180) / Math.PI).toBeCloseTo(137.50776405, 6);
  });
});

describe('la esfera de Fibonacci', () => {
  it('devuelve n puntos, todos sobre la esfera unitaria', () => {
    const puntos = esferaDeFibonacci(100);

    expect(puntos).toHaveLength(100);
    for (const p of puntos) {
      expect(Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z)).toBeCloseTo(1, 10);
    }
  });

  it('no apelmaza: ningún par queda demasiado junto', () => {
    const puntos = esferaDeFibonacci(100);
    let minimo = Infinity;
    for (let i = 0; i < puntos.length; i++) {
      for (let j = i + 1; j < puntos.length; j++) {
        const p = puntos[i];
        const q = puntos[j];
        if (!p || !q) continue;
        minimo = Math.min(minimo, Math.hypot(p.x - q.x, p.y - q.y, p.z - q.z));
      }
    }
    // El motivo de existir de esta función: con colocación al azar el mínimo
    // se va a cero y hay núcleos escondidos detrás de otros, que existen en el
    // dato y no se pueden clickear.
    expect(minimo).toBeGreaterThan(0.15);
  });

  it('es determinista', () => {
    expect(esferaDeFibonacci(37)).toEqual(esferaDeFibonacci(37));
  });

  it('aguanta los bordes', () => {
    expect(esferaDeFibonacci(0)).toEqual([]);
    expect(esferaDeFibonacci(-3)).toEqual([]);
    expect(esferaDeFibonacci(1)).toHaveLength(1);
  });
});

describe('la espiral áurea', () => {
  it('mantiene todos los puntos dentro del radio', () => {
    for (const p of espiralAurea(50, 10)) {
      expect(Math.hypot(p.x, p.y)).toBeLessThanOrEqual(10 + 1e-9);
    }
  });

  it('devuelve n puntos y vacío para n = 0', () => {
    expect(espiralAurea(12, 5)).toHaveLength(12);
    expect(espiralAurea(0, 5)).toEqual([]);
  });
});

describe('la escala modular', () => {
  it('es 1 · 1,618 · 2,618 · 4,236', () => {
    expect(escalaModular(0)).toBeCloseTo(1, 10);
    expect(escalaModular(1)).toBeCloseTo(1.618034, 6);
    expect(escalaModular(2)).toBeCloseTo(2.618034, 6);
    expect(escalaModular(3)).toBeCloseTo(4.236068, 6);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-geometria.test.ts`
Expected: FAIL — `Failed to resolve import "../radiografia/geometria.js"`

- [ ] **Step 3: Escribir la implementación**

Crear `packages/civic-core/src/radiografia/geometria.ts`:

```ts
/**
 * φ — y sólo para la presentación.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md §5.6, R10
 *
 * **Este archivo es PRESENTACIÓN.** Ningún módulo de medición —`similitud`,
 * `grafo`, `nucleos`— puede importarlo, y `radiografia-guardas.test.ts` falla
 * si alguno lo hace. Poner φ adentro del umbral, del número de núcleos o de
 * una distancia publicada sería ponerle un número lindo a un dato que no lo
 * pidió.
 *
 * Lo que φ sí compra acá es **utilidad medible**: con los centroides
 * repartidos al azar sobre la esfera se apelmazan de un lado y dejan huecos
 * del otro, y quedan núcleos escondidos detrás de otros — existen en el dato
 * y no se pueden clickear. El ángulo áureo es el método estándar para
 * repartir puntos en una esfera sin apelmazar; es la misma ley que ordena las
 * semillas del girasol.
 */

export const PHI = (1 + Math.sqrt(5)) / 2;

/** 360°/φ² ≈ 137,50776°, en radianes. */
export const ANGULO_AUREO = Math.PI * (3 - Math.sqrt(5));

export interface Punto3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Punto2 {
  readonly x: number;
  readonly y: number;
}

/** `n` puntos casi equidistantes sobre la esfera unitaria. */
export const esferaDeFibonacci = (n: number): Punto3[] => {
  if (n <= 0) return [];
  if (n === 1) return [{ x: 0, y: 0, z: 1 }];

  const puntos: Punto3[] = [];
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const radio = Math.sqrt(Math.max(0, 1 - y * y));
    const angulo = i * ANGULO_AUREO;
    puntos.push({ x: Math.cos(angulo) * radio, y, z: Math.sin(angulo) * radio });
  }
  return puntos;
};

/**
 * `n` puntos en espiral áurea dentro de un disco de `radio`.
 *
 * Para acomodar las señales adentro de un núcleo cuando el lector entra al
 * nivel 1. El `√((i + ½)/n)` es lo que reparte el área parejo: sin él la
 * espiral se amontona en el centro.
 */
export const espiralAurea = (n: number, radio: number): Punto2[] => {
  if (n <= 0) return [];
  return Array.from({ length: n }, (_, i) => {
    const r = radio * Math.sqrt((i + 0.5) / n);
    const angulo = i * ANGULO_AUREO;
    return { x: Math.cos(angulo) * r, y: Math.sin(angulo) * r };
  });
};

/** Escala modular φ: 1 · 1,618 · 2,618 · 4,236 — radios de nodo y grosores. */
export const escalaModular = (paso: number): number => PHI ** paso;
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-geometria.test.ts`
Expected: PASS — 9 tests

- [ ] **Step 5: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2
git add packages/civic-core/src/radiografia/geometria.ts \
        packages/civic-core/src/__tests__/radiografia-geometria.test.ts
git commit -m "feat(civic-core): la geometría φ — esfera de Fibonacci, espiral áurea, escala modular"
```

---

## Task 8: El barril y la guarda de φ

**Files:**
- Create: `packages/civic-core/src/radiografia/index.ts`
- Modify: `packages/civic-core/src/index.ts` (agregar una línea al final)
- Test: `packages/civic-core/src/__tests__/radiografia-guardas.test.ts`

**Interfaces:**
- Consumes: todo lo de las Tasks 1 a 7
- Produces: la superficie pública `@v2/civic-core` → `radiografia/*`

- [ ] **Step 1: Escribir el test que falla**

Crear `packages/civic-core/src/__tests__/radiografia-guardas.test.ts`:

```ts
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import * as civicCore from '../index.js';

/**
 * Los tres módulos que MIDEN. La spec R10 dice que φ gobierna la presentación
 * y jamás la medición; esta guarda es lo que hace que eso no dependa de que
 * alguien se acuerde.
 */
const MEDICION = ['similitud.ts', 'grafo.ts', 'nucleos.ts'] as const;

const fuente = (archivo: string): string =>
  readFileSync(fileURLToPath(new URL(`../radiografia/${archivo}`, import.meta.url)), 'utf8');

describe('la guarda de φ', () => {
  it('ningún módulo de medición importa la geometría', () => {
    for (const archivo of MEDICION) {
      expect(fuente(archivo)).not.toMatch(/from '\.\/geometria\.js'/);
    }
  });

  it('ningún módulo de medición nombra φ ni el ángulo áureo', () => {
    for (const archivo of MEDICION) {
      const codigo = fuente(archivo);
      expect(codigo).not.toMatch(/\bPHI\b/);
      expect(codigo).not.toMatch(/\bANGULO_AUREO\b/);
      // El literal de φ y el de √5, por si alguien lo escribe a mano.
      expect(codigo).not.toMatch(/1\.618/);
      expect(codigo).not.toMatch(/Math\.sqrt\(5\)/);
    }
  });
});

describe('el barril', () => {
  it('exporta el motor entero desde @v2/civic-core', () => {
    expect(typeof civicCore.similitudCoseno).toBe('function');
    expect(typeof civicCore.aristasMedidas).toBe('function');
    expect(typeof civicCore.aristasDeclaradas).toBe('function');
    expect(typeof civicCore.nucleosAlUmbral).toBe('function');
    expect(typeof civicCore.fraseDelNucleo).toBe('function');
    expect(typeof civicCore.dosMasLejanos).toBe('function');
    expect(typeof civicCore.esferaDeFibonacci).toBe('function');
    expect(typeof civicCore.espiralAurea).toBe('function');
    expect(typeof civicCore.escalaModular).toBe('function');
    expect(typeof civicCore.EmbebedorFalso).toBe('function');
  });
});

describe('el motor de punta a punta', () => {
  it('agrupa un corpus de juguete, y aflojar el umbral funde los núcleos', async () => {
    const corpus = [
      { id: 's1', texto: 'no me alcanza la plata para comer' },
      { id: 's2', texto: 'no me alcanza la plata a fin de mes' },
      { id: 's3', texto: 'hay un pozo enorme en la esquina' },
      { id: 's4', texto: 'un pozo enorme en la esquina de casa' },
      { id: 's5', texto: 'quiero aprender a tocar la guitarra' },
    ];
    const embebedor = new civicCore.EmbebedorFalso(128);
    const vectores = await embebedor.embeber(corpus.map((c) => c.texto));
    const porId = new Map<string, readonly number[]>(
      corpus.map((c, i) => [c.id, vectores[i] ?? []]),
    );

    const aristas = civicCore.aristasMedidas(porId, 4);
    const apretado = civicCore.nucleosAlUmbral([...porId.keys()], aristas, 0.5);
    const flojo = civicCore.nucleosAlUmbral([...porId.keys()], aristas, 0.05);

    expect(apretado.nucleos.length).toBeGreaterThanOrEqual(2);
    expect(flojo.nucleos.length).toBeLessThanOrEqual(apretado.nucleos.length);
    expect(
      apretado.nucleos.reduce((n, x) => n + x.ids.length, 0) + apretado.solas.length,
    ).toBe(corpus.length);
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-guardas.test.ts`
Expected: FAIL — `civicCore.similitudCoseno is not a function` (el barril todavía no reexporta el motor)

- [ ] **Step 3: Escribir el barril del sub-módulo**

Crear `packages/civic-core/src/radiografia/index.ts`:

```ts
/**
 * El motor de convergencia de La Radiografía.
 *
 * Spec: docs/specs/2026-08-12-la-radiografia.md
 *
 * Lógica pura, como todo civic-core: sin red, sin disco, sin reloj. El
 * cálculo de los vectores entra por el puerto `Embebedor` y su
 * implementación real vive en el job, no acá.
 */
export * from './tipos.js';
export * from './embebedor.js';
export * from './similitud.js';
export * from './grafo.js';
export * from './nucleos.js';
export * from './geometria.js';
```

- [ ] **Step 4: Enganchar al barril del paquete**

Agregar como última línea de `packages/civic-core/src/index.ts`:

```ts
export * from './radiografia/index.js';
```

- [ ] **Step 5: Correr el test y verificar que pasa**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm --filter @v2/civic-core exec vitest run src/__tests__/radiografia-guardas.test.ts`
Expected: PASS — 4 tests

- [ ] **Step 6: Verificación completa del repo**

Run: `cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2 && pnpm lint && pnpm type-check && pnpm test:unit`
Expected: todo verde. Si `pnpm type-check` se queja de un nombre exportado dos veces desde el barril raíz, el choque es real y hay que renombrar en `radiografia/` — no silenciarlo.

- [ ] **Step 7: Commit**

```bash
cd /Users/juanb/Desktop/ElInstantedelHombreGris/v2
git add packages/civic-core/src/radiografia/index.ts \
        packages/civic-core/src/index.ts \
        packages/civic-core/src/__tests__/radiografia-guardas.test.ts
git commit -m "feat(civic-core): el barril del motor y la guarda que mantiene φ fuera de la medición"
```

---

## Tasks 9 y 10 — GATEADAS: la implementación real del embebedor, y el job

**Ninguna de las dos arranca hasta que se resuelva ADR 0006.**

La rebanada 1 de la spec §10 incluye dos piezas más que las Tasks 1 a 8 no cubren, y las dos cuelgan de la misma decisión:

- **Task 9 · La implementación real de `Embebedor`** — `transformers.js` sobre ONNX, `bge-m3` primario (spec §4.2). **No va en `packages/civic-core`**: ese paquete es lógica pura y tiene que correr en Hermes. Va en `scripts/`, que es donde el repo pone sus trabajos de datos.
- **Task 10 · El job `pnpm radiografia:embeber`** — idempotente y reanudable, como `pnpm geo:backfill`. Sin la Task 9 no tiene qué llamar.

`docs/adr/0006-xenova-transformers-status.md` está **Accepted — Defer** desde el 11/5/2026, y su gatillo de reapertura pide tres condiciones. La spec cumple la 1 (una función concreta nombra a los embeddings como la primitiva correcta) y **no** cumple la 2 y la 3 tal como están escritas: la ADR dice explícitamente *«reach for a provider API first»*, y el precio de una API de embeddings **no** es prohibitivo (~US$0,02 por millón de tokens).

La decisión que falta es de producto, no técnica: **convertir «las palabras de la gente no salen de nuestra infraestructura» en un requisito escrito**, o aceptar una API de proveedor. Hasta que eso esté resuelto en una ADR nueva que supersede a la 0006, esta task no existe.

**Lo bueno:** el puerto de la Task 1 hace que la decisión no toque nada de las Tasks 1 a 8. Salga como salga —modelo local o API de proveedor— cambia una clase que implementa `Embebedor`, y nada más. Por eso las ocho primeras tasks se pueden ejecutar hoy sin esperar a nadie.

---

## Lo que este plan NO cubre

Las rebanadas 2 a 6 de la spec §10 (el sustrato en base, la constelación, la lista, el espejo, el vacío) **no se pueden planificar todavía**: dependen de la tabla `senales`, de `actores` y de `adhesiones`, que la rebanada 3 del plan `2026-08-11-tierra-senal-corroboracion-registro.md` va a crear y que hoy no existen — el journal de migraciones termina en `0015` + `0019`. Escribir tasks con rutas y columnas inventadas sería exactamente lo que la sección «No Placeholders» prohíbe.

Además, la rebanada 3 (la constelación) está gateada por **ADR 0003**, que también está en *Defer* y cuyo gatillo pide que el dato *no pueda* servirse con SVG o canvas-2D a la fidelidad buscada. Con el corpus de hoy —cero señales— esa condición **no se cumple**, y decir lo contrario sería falso. Se cumple a escala, y ahí se reabre.

Cuando `senales` exista, este archivo gana un plan hermano: `docs/plans/YYYY-MM-DD-la-radiografia-superficie.md`.
