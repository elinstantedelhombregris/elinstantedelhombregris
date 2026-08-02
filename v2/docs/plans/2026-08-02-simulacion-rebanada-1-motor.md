# La Simulación — Rebanada 1: el motor

> **Para quien lo ejecute:** cada paso es una casilla. Se sigue en orden, y cada tarea termina en commit propio.

**Spec:** `docs/specs/2026-08-01-el-mapa-simulacion.md`
**Objetivo:** el motor puro de la Simulación en `@v2/civic-core` — palancas adentro, dos retratos y su diferencia afuera, con la procedencia de cada número y las guardas de honestidad ejecutables.

**Arquitectura:** lógica pura, sin React, sin fetch, sin reloj. Ocho módulos chicos bajo `packages/civic-core/src/simulacion/`, cada uno con una responsabilidad y su test. El orquestador `simular()` es la única superficie que consume la UI (rebanada 2).

**Stack:** TypeScript strict + `noUncheckedIndexedAccess` + `exactOptionalPropertyTypes`, vitest.

## Restricciones globales

- **Nada de `: any`**, nada de `console.*`, nada de `@ts-ignore` (`v2/CLAUDE.md`).
- **`civic-core` es puro:** sin UI, sin APIs de plataforma, sin red ni disco. Tiene que correr igual en Node, en el navegador y en Hermes.
- **Sin reloj.** `Date.now()` está prohibido dentro del motor: el instante entra por `EstadoMedido.ahora`. Un motor que lee el reloj no es reproducible ni testeable.
- **Ningún número sale como `number` pelado.** Todo lo que la UI puede mostrar es una `Magnitud` con su `Procedencia`. Es la regla §3.1 de la spec y tiene test.
- **Archivos ≤ 300 LOC.**
- **Todo el texto de cara al usuario en castellano rioplatense.** Acá casi no hay: las razones de `sinDato` y las fórmulas de `derivado` son lo único que se lee.
- **Commitear con rutas explícitas.** Nunca `git commit -a` ni `git add -A`: hay sesiones concurrentes (D-010 en `docs/DEUDAS.md`) y ya se perdió trabajo así.

## Dos apartamientos de la spec, deliberados

1. **`Palancas` no lleva `secuencia` en esta rebanada.** La spec §4 la declara y aclara que se ignora sin la capa PLANes. Un campo que nadie lee es una mentira chica; entra en la rebanada 5, junto con lo que le da sentido.
2. **`Retrato` no lleva `campanasCompletas`.** La spec §5.1 lo lista, pero las campañas son la rebanada 3. El campo entra con lo que lo calcula, no antes.

3. **`cobertura` no usa `planTerritorialCoverage`.** La spec §5.5 dice delegar en la grilla de celdas, pero esa grilla necesita un polígono y el polígono lo trae el lazo, que es rebanada 2/3. Acá la cobertura es **la fracción de territorios que dejaron de estar mudos** — igual de honesta, computable hoy, y a escala de provincia es la que se lee. La cobertura por celdas entra cuando entra el área.

Los tres están anotados acá para que el que llegue a las rebanadas 2, 3 y 5 sepa que faltan a propósito.

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `simulacion/procedencia.ts` | `Magnitud`, `Procedencia` y sus tres constructores. La primitiva de honestidad |
| `simulacion/coeficientes.ts` | Los coeficientes publicados, con su justificación escrita |
| `simulacion/tipos.ts` | El vocabulario: `Palancas`, `Territorio`, `VozMedida`, `Retrato`, `Diferencia` |
| `simulacion/reparto.ts` | Repartir un total de voces entre territorios, con resto mayor |
| `simulacion/mandato.ts` | Piso efectivo, períodos, la regla del mandato |
| `simulacion/retrato.ts` | Construir un `Retrato`, medido o simulado |
| `simulacion/simular.ts` | El orquestador y la diferencia |
| `simulacion/index.ts` | Superficie pública del subpaquete |

---

### Tarea 1: La primitiva de honestidad

**Archivos:**
- Crear: `packages/civic-core/src/simulacion/procedencia.ts`
- Test: `packages/civic-core/src/__tests__/procedencia.test.ts`

**Interfaces:**
- Produce: `Magnitud`, `Procedencia`, `medido()`, `declarado()`, `derivado()`, `esMagnitud()`

- [ ] **Paso 1: el test que falla**

```ts
import { describe, expect, it } from 'vitest';

import { declarado, derivado, esMagnitud, medido } from '../simulacion/procedencia.js';

describe('Magnitud', () => {
  it('un medido declara su fuente', () => {
    expect(medido(12, 'voces', 'dreams')).toEqual({
      valor: 12,
      unidad: 'voces',
      procedencia: { tipo: 'medido', fuente: 'dreams' },
    });
  });

  it('un declarado dice qué palanca lo movió', () => {
    expect(declarado(0.5, 'fracción', 'dispersion').procedencia).toEqual({
      tipo: 'declarado',
      palanca: 'dispersion',
    });
  });

  it('un derivado muestra su fórmula y de qué se derivó', () => {
    expect(derivado(0.25, 'fracción', 'alcance × persistencia', ['alcance', 'persistencia'])).toEqual({
      valor: 0.25,
      unidad: 'fracción',
      procedencia: {
        tipo: 'derivado',
        formula: 'alcance × persistencia',
        de: ['alcance', 'persistencia'],
      },
    });
  });

  it('esMagnitud distingue una Magnitud de un número suelto', () => {
    expect(esMagnitud(medido(1, 'voces', 'x'))).toBe(true);
    expect(esMagnitud(3)).toBe(false);
    expect(esMagnitud({ valor: 3, unidad: 'voces' })).toBe(false);
    expect(esMagnitud(null)).toBe(false);
  });
});
```

- [ ] **Paso 2: verlo fallar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/procedencia.test.ts`
Esperado: FAIL — `Failed to load url ../simulacion/procedencia.js`

- [ ] **Paso 3: la implementación mínima**

```ts
/**
 * La primitiva de honestidad de la Simulación — spec §3.1.
 *
 * Solo existen tres procedencias y ninguna cuarta. Todo lo que el motor
 * devuelve y la UI puede mostrar es una `Magnitud`: un número pelado que
 * llegue a pantalla es un bug, no un descuido de presentación, y hay una
 * guarda que lo caza (Tarea 8).
 */
export type Procedencia =
  | { tipo: 'medido'; fuente: string }
  | { tipo: 'declarado'; palanca: string }
  | { tipo: 'derivado'; formula: string; de: readonly string[] };

export interface Magnitud {
  valor: number;
  unidad: string;
  procedencia: Procedencia;
}

/** Dato real de la plataforma o de un documento citado. */
export const medido = (valor: number, unidad: string, fuente: string): Magnitud => ({
  valor,
  unidad,
  procedencia: { tipo: 'medido', fuente },
});

/** Parámetro que movió la persona, o coeficiente publicado. */
export const declarado = (valor: number, unidad: string, palanca: string): Magnitud => ({
  valor,
  unidad,
  procedencia: { tipo: 'declarado', palanca },
});

/** Cálculo sobre los anteriores, con la fórmula a la vista. */
export const derivado = (
  valor: number,
  unidad: string,
  formula: string,
  de: readonly string[],
): Magnitud => ({
  valor,
  unidad,
  procedencia: { tipo: 'derivado', formula, de },
});

const TIPOS: readonly string[] = ['medido', 'declarado', 'derivado'];

/** Type guard usado por la guarda «sin números huérfanos». */
export function esMagnitud(valor: unknown): valor is Magnitud {
  if (typeof valor !== 'object' || valor === null) return false;
  const candidato = valor as Record<string, unknown>;
  if (typeof candidato['valor'] !== 'number' || typeof candidato['unidad'] !== 'string') {
    return false;
  }
  const proc = candidato['procedencia'];
  if (typeof proc !== 'object' || proc === null) return false;
  return TIPOS.includes((proc as Record<string, unknown>)['tipo'] as string);
}
```

- [ ] **Paso 4: verlo pasar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/procedencia.test.ts`
Esperado: PASS, 4 tests

- [ ] **Paso 5: commit**

```bash
git add v2/packages/civic-core/src/simulacion/procedencia.ts v2/packages/civic-core/src/__tests__/procedencia.test.ts
git commit -m "Add la primitiva de honestidad de la Simulación: ningún número sin procedencia"
```

---

### Tarea 2: El vocabulario y los coeficientes

**Archivos:**
- Crear: `packages/civic-core/src/simulacion/tipos.ts`
- Crear: `packages/civic-core/src/simulacion/coeficientes.ts`
- Test: `packages/civic-core/src/__tests__/coeficientes.test.ts`

**Interfaces:**
- Consume: nada
- Produce: `TipoVozCivica`, `TIPOS_VOZ_CIVICOS`, `Territorio`, `VozMedida`, `EstadoMedido`, `Palancas`, `RetratoTerritorio`, `Retrato`, `SinDato`, `DiferenciaTerritorio`, `Diferencia`, `EntradaSimulacion`, `ResultadoSimulacion`, `COEFICIENTES`

- [ ] **Paso 1: el test que falla**

```ts
import { describe, expect, it } from 'vitest';

import { COEFICIENTES } from '../simulacion/coeficientes.js';
import { TIPOS_VOZ_CIVICOS } from '../simulacion/tipos.js';

describe('coeficientes publicados', () => {
  it('el piso del mandato es 1 voz cada 1.000 habitantes', () => {
    expect(COEFICIENTES.PISO_MANDATO).toBe(100);
  });

  it('a resistencia máxima el piso se quintuplica', () => {
    // K = 4 → piso × (1 + 4×1) = piso × 5. La obstrucción total tiene que ser
    // superable y cara; si fuera insuperable el simulador enseñaría fatalismo.
    expect(COEFICIENTES.K_RESISTENCIA).toBe(4);
  });

  it('el período es el mes', () => {
    expect(COEFICIENTES.PERIODOS_POR_ANIO).toBe(12);
    expect(COEFICIENTES.MINIMO_PERIODOS).toBe(3);
  });
});

describe('tipos de voz', () => {
  it('son los seis del catálogo, en el orden canónico', () => {
    expect(TIPOS_VOZ_CIVICOS).toEqual([
      'basta',
      'sueño',
      'necesidad',
      'compromiso',
      'recurso',
      'valor',
    ]);
  });
});
```

- [ ] **Paso 2: verlo fallar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/coeficientes.test.ts`
Esperado: FAIL — no se resuelven los módulos

- [ ] **Paso 3: la implementación mínima**

`packages/civic-core/src/simulacion/tipos.ts`:

```ts
import type { Magnitud } from './procedencia.js';

/**
 * El vocabulario de la Simulación — spec §4 y §5.
 *
 * `TipoVozCivica` se define acá y no se importa de la web porque `civic-core`
 * no puede depender de una app. La web mantiene su propia lista en
 * `apps/web/src/lib/tipos-voz.ts`; un test de la web afirma que son idénticas
 * (Tarea 7), que es más barato que reestructurar sus tipos.
 */
export type TipoVozCivica = 'basta' | 'sueño' | 'necesidad' | 'compromiso' | 'recurso' | 'valor';

export const TIPOS_VOZ_CIVICOS: readonly TipoVozCivica[] = [
  'basta',
  'sueño',
  'necesidad',
  'compromiso',
  'recurso',
  'valor',
];

export interface Territorio {
  id: string;
  nombre: string;
  poblacion: number;
  km2: number;
}

export interface VozMedida {
  territorioId: string;
  tipo: TipoVozCivica;
  /** Epoch en milisegundos. */
  fecha: number;
}

/**
 * Lo que hay hoy. `ahora` entra por parámetro: el motor no lee el reloj,
 * porque un motor que lee el reloj no es reproducible.
 */
export interface EstadoMedido {
  voces: readonly VozMedida[];
  ahora: number;
}

export interface Palancas {
  /** Voces cada 100.000 habitantes. */
  participacion: number;
  /** 0 = todo concentrado · 1 = repartido en proporción a la población. */
  dispersion: number;
  /** Mezcla de los seis tipos. Las claves suman 1. */
  composicion: Readonly<Record<TipoVozCivica, number>>;
  /** Horizonte en años. */
  horizonte: number;
  /** 0 = el sistema colabora · 1 = bloquea. */
  resistencia: number;
  /** 0 = estallido · 1 = goteo parejo. */
  constancia: number;
  /** Fracción de los compromisos que se cumplen. */
  cumplimiento: number;
}

export interface RetratoTerritorio {
  territorioId: string;
  voces: Magnitud;
  vocesPorCienMil: Magnitud;
  umbral: Magnitud;
  tieneMandato: boolean;
}

export interface SinDato {
  territorioId: string;
  razon: string;
}

export interface Retrato {
  alcance: Magnitud;
  persistencia: Magnitud;
  legitimidad: Magnitud;
  cobertura: Magnitud;
  porTerritorio: ReadonlyMap<string, RetratoTerritorio>;
  /** Territorios excluidos de TODO total, con su razón. */
  sinDato: readonly SinDato[];
}

export interface DiferenciaTerritorio {
  territorioId: string;
  delta: Magnitud;
  ganaMandato: boolean;
}

export interface Diferencia {
  porTerritorio: ReadonlyMap<string, DiferenciaTerritorio>;
  territoriosQueGananMandato: Magnitud;
}

export interface EntradaSimulacion {
  palancas: Palancas;
  base: EstadoMedido;
  territorios: readonly Territorio[];
}

export interface ResultadoSimulacion {
  /** El país medido. Idéntico para toda configuración de palancas (spec S3). */
  silencio: Retrato;
  voz: Retrato;
  diferencia: Diferencia;
}
```

`packages/civic-core/src/simulacion/coeficientes.ts`:

```ts
/**
 * Los coeficientes publicados — spec §3.4.
 *
 * No son medidos ni los mueve la persona: son decisiones nuestras. Viven acá,
 * juntos y con su razón escrita, y viajan como `{ tipo: 'declarado' }`. No se
 * disfrazan de medidos, y cambiarlos es cambiar una constante a la vista.
 */
export interface Coeficientes {
  /** Voces cada 100.000 habitantes que constituyen mandato. */
  PISO_MANDATO: number;
  /** Cuánto multiplica al piso la resistencia máxima. */
  K_RESISTENCIA: number;
  /** Períodos sostenidos mínimos para que el mandato cuente. */
  MINIMO_PERIODOS: number;
  /** Períodos que tiene un año. */
  PERIODOS_POR_ANIO: number;
}

export const COEFICIENTES: Coeficientes = {
  /**
   * 100 cada 100.000 es 1 de cada 1.000 habitantes. Es el orden de magnitud
   * de un petitorio barrial que se toma en serio: bajo para ser alcanzable,
   * alto para que un puñado de personas no sea un mandato.
   */
  PISO_MANDATO: 100,

  /**
   * A resistencia 1 el piso se quintuplica. La obstrucción total tiene que
   * ser superable y cara: si fuera insuperable, el simulador enseñaría
   * fatalismo, y si fuera gratis enseñaría ingenuidad.
   */
  K_RESISTENCIA: 4,

  /**
   * Tres meses sosteniendo el piso. Menos que eso es un pico, y un pico no
   * gobierna — es lo que «El que grita» existe para mostrar.
   */
  MINIMO_PERIODOS: 3,

  /** El período es el mes. */
  PERIODOS_POR_ANIO: 12,
};
```

- [ ] **Paso 4: verlo pasar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/coeficientes.test.ts`
Esperado: PASS, 4 tests

- [ ] **Paso 5: commit**

```bash
git add v2/packages/civic-core/src/simulacion/tipos.ts v2/packages/civic-core/src/simulacion/coeficientes.ts v2/packages/civic-core/src/__tests__/coeficientes.test.ts
git commit -m "Add el vocabulario de la Simulación y los coeficientes con su razón escrita"
```

---

### Tarea 3: El reparto de voces

**Archivos:**
- Crear: `packages/civic-core/src/simulacion/reparto.ts`
- Test: `packages/civic-core/src/__tests__/reparto.test.ts`

**Interfaces:**
- Consume: `Territorio` de `tipos.ts`
- Produce: `repartir(total: number, territorios: readonly Territorio[], dispersion: number, vocesBase: ReadonlyMap<string, number>): Map<string, number>`

- [ ] **Paso 1: el test que falla**

```ts
import { describe, expect, it } from 'vitest';

import { repartir } from '../simulacion/reparto.js';

import type { Territorio } from '../simulacion/tipos.js';

const TERRITORIOS: Territorio[] = [
  { id: 'grande', nombre: 'Grande', poblacion: 800_000, km2: 100 },
  { id: 'chico', nombre: 'Chico', poblacion: 200_000, km2: 100 },
];

const suma = (m: ReadonlyMap<string, number>): number => [...m.values()].reduce((a, b) => a + b, 0);

describe('repartir', () => {
  it('con dispersión 1 reparte en proporción a la población', () => {
    const r = repartir(1000, TERRITORIOS, 1, new Map());
    expect(r.get('grande')).toBe(800);
    expect(r.get('chico')).toBe(200);
  });

  it('con dispersión 0 todo va donde ya se habla más', () => {
    const r = repartir(1000, TERRITORIOS, 0, new Map([['chico', 5]]));
    expect(r.get('chico')).toBe(1000);
    expect(r.get('grande')).toBe(0);
  });

  it('sin voces previas, la concentración cae en el más poblado', () => {
    const r = repartir(1000, TERRITORIOS, 0, new Map());
    expect(r.get('grande')).toBe(1000);
  });

  it('conserva el total: los redondeos no crean ni pierden voces', () => {
    // 3 territorios y 100 voces: los cocientes no son enteros. Con redondeo
    // ingenuo la suma daría 99 o 101, y un total que no cierra es exactamente
    // la clase de mentira que este motor no puede permitirse.
    const tres: Territorio[] = [
      { id: 'a', nombre: 'A', poblacion: 1, km2: 1 },
      { id: 'b', nombre: 'B', poblacion: 1, km2: 1 },
      { id: 'c', nombre: 'C', poblacion: 1, km2: 1 },
    ];
    expect(suma(repartir(100, tres, 1, new Map()))).toBe(100);
  });

  it('es determinista ante empates', () => {
    const tres: Territorio[] = [
      { id: 'c', nombre: 'C', poblacion: 1, km2: 1 },
      { id: 'a', nombre: 'A', poblacion: 1, km2: 1 },
      { id: 'b', nombre: 'B', poblacion: 1, km2: 1 },
    ];
    const primera = repartir(100, tres, 1, new Map());
    const segunda = repartir(100, tres, 1, new Map());
    expect([...primera.entries()].sort()).toEqual([...segunda.entries()].sort());
  });

  it('un total de cero reparte ceros', () => {
    expect(suma(repartir(0, TERRITORIOS, 1, new Map()))).toBe(0);
  });
});
```

- [ ] **Paso 2: verlo fallar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/reparto.test.ts`
Esperado: FAIL — `Failed to load url ../simulacion/reparto.js`

- [ ] **Paso 3: la implementación mínima**

```ts
import type { Territorio } from './tipos.js';

/**
 * Repartir un total de voces entre territorios — spec §5.2.
 *
 * `dispersion` interpola entre dos distribuciones: la concentrada (todo donde
 * ya se habla más) y la proporcional a la población. Es una operación
 * DECLARADA, no un supuesto sobre el mundo: no afirma que la gente se reparte
 * así, afirma que se pidió esa mezcla.
 */

/** Peso de cada territorio en la distribución concentrada. */
function pesosConcentrado(
  territorios: readonly Territorio[],
  vocesBase: ReadonlyMap<string, number>,
): Map<string, number> {
  const elegido = [...territorios].sort((a, b) => {
    const porVoces = (vocesBase.get(b.id) ?? 0) - (vocesBase.get(a.id) ?? 0);
    if (porVoces !== 0) return porVoces;
    const porPoblacion = b.poblacion - a.poblacion;
    if (porPoblacion !== 0) return porPoblacion;
    return a.id < b.id ? -1 : 1;
  })[0];
  return new Map(territorios.map((t) => [t.id, t.id === elegido?.id ? 1 : 0]));
}

/** Peso de cada territorio en la distribución proporcional. */
function pesosProporcional(territorios: readonly Territorio[]): Map<string, number> {
  const total = territorios.reduce((suma, t) => suma + Math.max(0, t.poblacion), 0);
  if (total <= 0) {
    const parejo = territorios.length === 0 ? 0 : 1 / territorios.length;
    return new Map(territorios.map((t) => [t.id, parejo]));
  }
  return new Map(territorios.map((t) => [t.id, Math.max(0, t.poblacion) / total]));
}

/**
 * Reparte enteros con el método del resto mayor: el piso de cada cociente y
 * las unidades sobrantes a los restos más grandes. Garantiza que la suma es
 * exactamente `total` — un reparto que no cierra invalida cualquier lectura.
 */
function repartirEnteros(total: number, pesos: ReadonlyMap<string, number>): Map<string, number> {
  const exactos = [...pesos.entries()].map(([id, peso]) => ({ id, exacto: total * peso }));
  const salida = new Map(exactos.map(({ id, exacto }) => [id, Math.floor(exacto)]));
  const asignado = [...salida.values()].reduce((a, b) => a + b, 0);

  const sobrantes = [...exactos]
    .sort((a, b) => {
      const porResto = (b.exacto - Math.floor(b.exacto)) - (a.exacto - Math.floor(a.exacto));
      return porResto !== 0 ? porResto : a.id < b.id ? -1 : 1;
    })
    .slice(0, Math.max(0, Math.round(total) - asignado));

  for (const { id } of sobrantes) salida.set(id, (salida.get(id) ?? 0) + 1);
  return salida;
}

export function repartir(
  total: number,
  territorios: readonly Territorio[],
  dispersion: number,
  vocesBase: ReadonlyMap<string, number>,
): Map<string, number> {
  const mezcla = Math.min(1, Math.max(0, dispersion));
  const concentrado = pesosConcentrado(territorios, vocesBase);
  const proporcional = pesosProporcional(territorios);
  const pesos = new Map(
    territorios.map((t) => [
      t.id,
      (1 - mezcla) * (concentrado.get(t.id) ?? 0) + mezcla * (proporcional.get(t.id) ?? 0),
    ]),
  );
  return repartirEnteros(Math.max(0, total), pesos);
}
```

- [ ] **Paso 4: verlo pasar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/reparto.test.ts`
Esperado: PASS, 6 tests

- [ ] **Paso 5: commit**

```bash
git add v2/packages/civic-core/src/simulacion/reparto.ts v2/packages/civic-core/src/__tests__/reparto.test.ts
git commit -m "Add el reparto de voces con resto mayor: los redondeos no crean ni pierden"
```

---

### Tarea 4: La regla del mandato

**Archivos:**
- Crear: `packages/civic-core/src/simulacion/mandato.ts`
- Test: `packages/civic-core/src/__tests__/mandato.test.ts`

**Interfaces:**
- Consume: `COEFICIENTES`, `Territorio`
- Produce: `pisoEfectivo(resistencia: number): number`, `umbralDe(territorio: Territorio, piso: number): number`, `periodosDelHorizonte(horizonte: number): number`, `periodosSostenidos(constancia: number, periodosTotales: number): number`, `hayMandato(voces: number, umbral: number, sostenidos: number): boolean`

- [ ] **Paso 1: el test que falla**

```ts
import { describe, expect, it } from 'vitest';

import { COEFICIENTES } from '../simulacion/coeficientes.js';
import {
  hayMandato,
  periodosDelHorizonte,
  periodosSostenidos,
  pisoEfectivo,
  umbralDe,
} from '../simulacion/mandato.js';

import type { Territorio } from '../simulacion/tipos.js';

const TERRITORIO: Territorio = { id: 't', nombre: 'T', poblacion: 1_000_000, km2: 10 };

describe('pisoEfectivo', () => {
  it('sin resistencia es el piso publicado', () => {
    expect(pisoEfectivo(0)).toBe(COEFICIENTES.PISO_MANDATO);
  });

  it('a resistencia máxima se quintuplica', () => {
    expect(pisoEfectivo(1)).toBe(COEFICIENTES.PISO_MANDATO * 5);
  });

  it('recorta valores fuera de rango en vez de extrapolar', () => {
    expect(pisoEfectivo(-3)).toBe(COEFICIENTES.PISO_MANDATO);
    expect(pisoEfectivo(9)).toBe(COEFICIENTES.PISO_MANDATO * 5);
  });
});

describe('umbralDe', () => {
  it('escala el piso por la población del territorio', () => {
    // 100 cada 100.000, sobre 1.000.000 de habitantes → 1.000 voces.
    expect(umbralDe(TERRITORIO, 100)).toBe(1000);
  });
});

describe('períodos', () => {
  it('el horizonte se cuenta en meses', () => {
    expect(periodosDelHorizonte(2)).toBe(24);
  });

  it('el horizonte mínimo es un período', () => {
    expect(periodosDelHorizonte(0)).toBe(1);
  });

  it('en estallido se sostiene un solo período', () => {
    expect(periodosSostenidos(0, 24)).toBe(1);
  });

  it('en goteo pleno se sostienen todos', () => {
    expect(periodosSostenidos(1, 24)).toBe(24);
  });

  it('a media constancia se sostiene la mitad', () => {
    expect(periodosSostenidos(0.5, 25)).toBe(13);
  });
});

describe('hayMandato', () => {
  it('exige cruzar el umbral Y sostenerlo', () => {
    expect(hayMandato(1000, 1000, COEFICIENTES.MINIMO_PERIODOS)).toBe(true);
    expect(hayMandato(999, 1000, COEFICIENTES.MINIMO_PERIODOS)).toBe(false);
    expect(hayMandato(5000, 1000, COEFICIENTES.MINIMO_PERIODOS - 1)).toBe(false);
  });

  it('un umbral de cero no regala mandatos', () => {
    // Un territorio sin población no puede tener mandato: no hay a quién
    // representar. Sin esto, dividir por cero lo volvería siempre verdadero.
    expect(hayMandato(0, 0, 99)).toBe(false);
  });
});
```

- [ ] **Paso 2: verlo fallar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/mandato.test.ts`
Esperado: FAIL — `Failed to load url ../simulacion/mandato.js`

- [ ] **Paso 3: la implementación mínima**

```ts
import { COEFICIENTES } from './coeficientes.js';

import type { Territorio } from './tipos.js';

/**
 * La regla del mandato — spec §5.3.
 *
 * Un territorio tiene mandato sobre un tema cuando cruza el piso y lo
 * sostiene. Las dos condiciones importan: cruzarlo una vez es un pico, y un
 * pico no gobierna.
 */

const acotar = (valor: number, minimo: number, maximo: number): number =>
  Math.min(maximo, Math.max(minimo, valor));

/** El piso, en voces cada 100.000 habitantes, corregido por la resistencia. */
export function pisoEfectivo(resistencia: number): number {
  return COEFICIENTES.PISO_MANDATO * (1 + COEFICIENTES.K_RESISTENCIA * acotar(resistencia, 0, 1));
}

/** El piso llevado a voces absolutas para un territorio. */
export function umbralDe(territorio: Territorio, piso: number): number {
  return (piso * Math.max(0, territorio.poblacion)) / 100_000;
}

/** Cuántos períodos tiene el horizonte. Nunca menos de uno. */
export function periodosDelHorizonte(horizonte: number): number {
  return Math.max(1, Math.round(horizonte * COEFICIENTES.PERIODOS_POR_ANIO));
}

/**
 * Cuántos de esos períodos se sostiene la voz.
 *
 * En estallido (`constancia` 0) es uno solo: todo el esfuerzo en un momento.
 * En goteo pleno son todos. En el medio, interpola.
 */
export function periodosSostenidos(constancia: number, periodosTotales: number): number {
  const c = acotar(constancia, 0, 1);
  return Math.max(1, Math.round(1 + c * (Math.max(1, periodosTotales) - 1)));
}

export function hayMandato(voces: number, umbral: number, sostenidos: number): boolean {
  if (umbral <= 0) return false;
  return voces >= umbral && sostenidos >= COEFICIENTES.MINIMO_PERIODOS;
}
```

- [ ] **Paso 4: verlo pasar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/mandato.test.ts`
Esperado: PASS, 11 tests

- [ ] **Paso 5: commit**

```bash
git add v2/packages/civic-core/src/simulacion/mandato.ts v2/packages/civic-core/src/__tests__/mandato.test.ts
git commit -m "Add la regla del mandato: cruzar el piso y sostenerlo, porque un pico no gobierna"
```

---

### Tarea 5: El retrato medido — el lado del silencio

**Archivos:**
- Crear: `packages/civic-core/src/simulacion/retrato.ts`
- Test: `packages/civic-core/src/__tests__/retrato-medido.test.ts`

**Interfaces:**
- Consume: `Magnitud`, `COEFICIENTES`, `mandato.ts`, `tipos.ts`
- Produce: `retratoMedido(base: EstadoMedido, territorios: readonly Territorio[]): Retrato`

**Nota de diseño:** el retrato medido **no lee ninguna palanca**, ni siquiera `horizonte`. Su ventana es todo el dato que hay, del primer voz hasta `ahora`. Si leyera el horizonte, mover esa palanca cambiaría el lado del silencio y se rompería S3 — y la guarda de la Tarea 8 lo cazaría.

- [ ] **Paso 1: el test que falla**

```ts
import { describe, expect, it } from 'vitest';

import { retratoMedido } from '../simulacion/retrato.js';

import type { EstadoMedido, Territorio, VozMedida } from '../simulacion/tipos.js';

/** 31 días: más largo que el período del motor (365,25/12 ≈ 30,4), así cada
 *  paso cae en un período distinto sin depender del redondeo. */
const MES = 31 * 24 * 3600 * 1000;
const AHORA = 1_800_000_000_000;

const TERRITORIOS: Territorio[] = [
  { id: 'caba', nombre: 'CABA', poblacion: 3_121_000, km2: 200 },
  { id: 'formosa', nombre: 'Formosa', poblacion: 606_000, km2: 72_100 },
  { id: 'vacio', nombre: 'Vacío', poblacion: 0, km2: 10 },
];

const voz = (territorioId: string, mesesAtras: number): VozMedida => ({
  territorioId,
  tipo: 'basta',
  fecha: AHORA - mesesAtras * MES,
});

const base = (voces: VozMedida[]): EstadoMedido => ({ voces, ahora: AHORA });

describe('retratoMedido', () => {
  it('cuenta las voces reales por territorio', () => {
    const r = retratoMedido(base([voz('caba', 0), voz('caba', 1), voz('formosa', 0)]), TERRITORIOS);
    expect(r.porTerritorio.get('caba')?.voces.valor).toBe(2);
    expect(r.porTerritorio.get('formosa')?.voces.valor).toBe(1);
  });

  it('todo lo que cuenta viene marcado como medido', () => {
    const r = retratoMedido(base([voz('caba', 0)]), TERRITORIOS);
    expect(r.porTerritorio.get('caba')?.voces.procedencia.tipo).toBe('medido');
  });

  it('un territorio sin población queda fuera de todo total, con su razón', () => {
    const r = retratoMedido(base([voz('caba', 0)]), TERRITORIOS);
    expect(r.sinDato.map((s) => s.territorioId)).toEqual(['vacio']);
    expect(r.sinDato[0]?.razon).toMatch(/población/i);
    expect(r.porTerritorio.has('vacio')).toBe(false);
  });

  it('la cobertura es la fracción de territorios que dejaron de estar mudos', () => {
    // 1 de 2 territorios con dato habla → 0,5. «vacio» no entra al denominador.
    const r = retratoMedido(base([voz('caba', 0)]), TERRITORIOS);
    expect(r.cobertura.valor).toBeCloseTo(0.5);
  });

  it('sin voces, todo es cero y nada explota', () => {
    const r = retratoMedido(base([]), TERRITORIOS);
    expect(r.cobertura.valor).toBe(0);
    expect(r.legitimidad.valor).toBe(0);
    expect(r.alcance.valor).toBe(0);
  });

  it('la legitimidad es alcance por persistencia', () => {
    const r = retratoMedido(base([voz('caba', 0)]), TERRITORIOS);
    expect(r.legitimidad.valor).toBeCloseTo(r.alcance.valor * r.persistencia.valor);
    expect(r.legitimidad.procedencia).toEqual({
      tipo: 'derivado',
      formula: 'alcance × persistencia',
      de: ['alcance', 'persistencia'],
    });
  });

  it('un territorio que cruza el piso y lo sostiene tiene mandato', () => {
    // Formosa: 606.000 hab → umbral 606 voces. Repartidas en 4 meses distintos.
    const muchas = Array.from({ length: 700 }, (_, i) => voz('formosa', i % 4));
    const r = retratoMedido(base(muchas), TERRITORIOS);
    expect(r.porTerritorio.get('formosa')?.tieneMandato).toBe(true);
  });

  it('un pico que no se sostiene no es mandato', () => {
    // Las mismas 700 voces, todas el mismo mes: 1 período < MINIMO_PERIODOS.
    const pico = Array.from({ length: 700 }, () => voz('formosa', 0));
    const r = retratoMedido(base(pico), TERRITORIOS);
    expect(r.porTerritorio.get('formosa')?.tieneMandato).toBe(false);
  });
});
```

- [ ] **Paso 2: verlo fallar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/retrato-medido.test.ts`
Esperado: FAIL — `Failed to load url ../simulacion/retrato.js`

- [ ] **Paso 3: la implementación mínima**

```ts
import { COEFICIENTES } from './coeficientes.js';
import { hayMandato, pisoEfectivo, umbralDe } from './mandato.js';
import { derivado, medido } from './procedencia.js';

import type {
  EstadoMedido,
  Retrato,
  RetratoTerritorio,
  SinDato,
  Territorio,
} from './tipos.js';

/**
 * Los retratos — spec §5.
 *
 * El medido es el lado del silencio y NO lee ninguna palanca (S3): es el país
 * tal como está, no un modelo. Si las dos mitades de la cortina fueran
 * modelos, la comparación probaría una tautología.
 */

const MS_POR_PERIODO = (365.25 / COEFICIENTES.PERIODOS_POR_ANIO) * 24 * 3600 * 1000;

/** Territorios que no pueden participar de ningún total, con su razón. */
function separarSinDato(territorios: readonly Territorio[]): {
  utiles: Territorio[];
  sinDato: SinDato[];
} {
  const utiles: Territorio[] = [];
  const sinDato: SinDato[] = [];
  for (const t of territorios) {
    if (t.poblacion > 0) utiles.push(t);
    else sinDato.push({ territorioId: t.id, razon: 'Sin población conocida: no hay denominador.' });
  }
  return { utiles, sinDato };
}

/** En qué período cae un instante, contado hacia atrás desde `ahora`. */
const periodoDe = (fecha: number, ahora: number): number =>
  Math.floor((ahora - fecha) / MS_POR_PERIODO);

export function armarRetrato(
  conteo: ReadonlyMap<string, number>,
  sostenidosPorTerritorio: ReadonlyMap<string, number>,
  periodosTotales: number,
  piso: number,
  territorios: readonly Territorio[],
  fuente: string,
  esMedido: boolean,
): Retrato {
  const { utiles, sinDato } = separarSinDato(territorios);
  const marcar = (valor: number, unidad: string) =>
    esMedido ? medido(valor, unidad, fuente) : derivado(valor, unidad, fuente, ['participacion', 'dispersion']);

  const porTerritorio = new Map<string, RetratoTerritorio>();
  let poblacionConMandato = 0;
  let poblacionTotal = 0;
  let conVoz = 0;

  for (const t of utiles) {
    const voces = conteo.get(t.id) ?? 0;
    const umbral = umbralDe(t, piso);
    const sostenidos = sostenidosPorTerritorio.get(t.id) ?? 0;
    poblacionTotal += t.poblacion;
    if (voces > 0) conVoz += 1;
    const tieneMandato = hayMandato(voces, umbral, sostenidos);
    if (tieneMandato) poblacionConMandato += t.poblacion;

    porTerritorio.set(t.id, {
      territorioId: t.id,
      voces: marcar(voces, 'voces'),
      vocesPorCienMil: derivado(
        (voces / t.poblacion) * 100_000,
        'voces cada 100 mil hab.',
        'voces ÷ población × 100.000',
        ['voces', 'poblacion'],
      ),
      umbral: derivado(umbral, 'voces', 'piso × población ÷ 100.000', ['piso', 'poblacion']),
      tieneMandato,
    });
  }

  const alcance = poblacionTotal === 0 ? 0 : poblacionConMandato / poblacionTotal;
  const sostenidosMax = Math.max(0, ...[...sostenidosPorTerritorio.values()]);
  const persistencia = periodosTotales === 0 ? 0 : Math.min(1, sostenidosMax / periodosTotales);
  const cobertura = utiles.length === 0 ? 0 : conVoz / utiles.length;

  return {
    alcance: derivado(alcance, 'fracción', 'población con mandato ÷ población total', [
      'poblacion',
    ]),
    persistencia: derivado(persistencia, 'fracción', 'períodos sostenidos ÷ períodos del horizonte', [
      'constancia',
      'horizonte',
    ]),
    legitimidad: derivado(alcance * persistencia, 'fracción', 'alcance × persistencia', [
      'alcance',
      'persistencia',
    ]),
    cobertura: derivado(cobertura, 'fracción', 'territorios con voz ÷ territorios con dato', [
      'voces',
    ]),
    porTerritorio,
    sinDato,
  };
}

export function retratoMedido(base: EstadoMedido, territorios: readonly Territorio[]): Retrato {
  const conteo = new Map<string, number>();
  const periodos = new Map<string, Set<number>>();

  for (const v of base.voces) {
    conteo.set(v.territorioId, (conteo.get(v.territorioId) ?? 0) + 1);
    const set = periodos.get(v.territorioId) ?? new Set<number>();
    set.add(periodoDe(v.fecha, base.ahora));
    periodos.set(v.territorioId, set);
  }

  const sostenidos = new Map([...periodos].map(([id, set]) => [id, set.size]));

  /**
   * La ventana del lado medido es TODO el dato que hay, del primer voz hasta
   * `ahora`. No sale del horizonte: si saliera, mover esa palanca cambiaría el
   * lado del silencio y S3 dejaría de valer.
   */
  const fechas = base.voces.map((v) => v.fecha);
  const abarcados =
    fechas.length === 0 ? 1 : periodoDe(Math.min(...fechas), base.ahora) + 1;

  return armarRetrato(
    conteo,
    sostenidos,
    Math.max(1, abarcados),
    pisoEfectivo(0),
    territorios,
    'voces cargadas',
    true,
  );
}
```

- [ ] **Paso 4: verlo pasar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/retrato-medido.test.ts`
Esperado: PASS, 8 tests

- [ ] **Paso 5: commit**

```bash
git add v2/packages/civic-core/src/simulacion/retrato.ts v2/packages/civic-core/src/__tests__/retrato-medido.test.ts
git commit -m "Add el retrato medido: el lado del silencio no lee ninguna palanca"
```

---

### Tarea 6: El retrato simulado — el lado de la voz

**Archivos:**
- Modificar: `packages/civic-core/src/simulacion/retrato.ts` (agregar `retratoSimulado`)
- Test: `packages/civic-core/src/__tests__/retrato-simulado.test.ts`

**Interfaces:**
- Consume: `armarRetrato`, `repartir`, `mandato.ts`
- Produce: `retratoSimulado(palancas: Palancas, base: EstadoMedido, territorios: readonly Territorio[]): Retrato`

- [ ] **Paso 1: el test que falla**

```ts
import { describe, expect, it } from 'vitest';

import { retratoSimulado } from '../simulacion/retrato.js';

import type { EstadoMedido, Palancas, Territorio } from '../simulacion/tipos.js';

const TERRITORIOS: Territorio[] = [
  { id: 'grande', nombre: 'Grande', poblacion: 4_000_000, km2: 100 },
  { id: 'chico', nombre: 'Chico', poblacion: 1_000_000, km2: 100 },
];

const BASE: EstadoMedido = { voces: [], ahora: 1_800_000_000_000 };

const palancas = (over: Partial<Palancas> = {}): Palancas => ({
  participacion: 200,
  dispersion: 1,
  composicion: { basta: 1, sueño: 0, necesidad: 0, compromiso: 0, recurso: 0, valor: 0 },
  horizonte: 2,
  resistencia: 0,
  constancia: 1,
  cumplimiento: 1,
  ...over,
});

describe('retratoSimulado', () => {
  it('la participación se convierte en voces sobre la población total', () => {
    // 200 cada 100.000 sobre 5.000.000 → 10.000 voces.
    const r = retratoSimulado(palancas(), BASE, TERRITORIOS);
    const total =
      (r.porTerritorio.get('grande')?.voces.valor ?? 0) +
      (r.porTerritorio.get('chico')?.voces.valor ?? 0);
    expect(total).toBe(10_000);
  });

  it('lo que cuenta viene marcado como derivado, no como medido', () => {
    const r = retratoSimulado(palancas(), BASE, TERRITORIOS);
    expect(r.porTerritorio.get('grande')?.voces.procedencia.tipo).toBe('derivado');
  });

  it('la resistencia sube el piso y puede tumbar un mandato', () => {
    const sinResistencia = retratoSimulado(palancas(), BASE, TERRITORIOS);
    const conResistencia = retratoSimulado(palancas({ resistencia: 1 }), BASE, TERRITORIOS);
    expect(sinResistencia.porTerritorio.get('grande')?.tieneMandato).toBe(true);
    expect(conResistencia.porTerritorio.get('grande')?.tieneMandato).toBe(false);
  });

  it('más voz recupera el mandato que la resistencia había tumbado', () => {
    // La lección central: la obstrucción se tapa con voz. Nada más la tapa.
    const recuperado = retratoSimulado(
      palancas({ resistencia: 1, participacion: 1000 }),
      BASE,
      TERRITORIOS,
    );
    expect(recuperado.porTerritorio.get('grande')?.tieneMandato).toBe(true);
  });

  it('el estallido no sostiene: sin constancia no hay mandato', () => {
    const estallido = retratoSimulado(palancas({ constancia: 0 }), BASE, TERRITORIOS);
    expect(estallido.porTerritorio.get('grande')?.tieneMandato).toBe(false);
  });

  it('la dispersión reparte el mismo total sin crear voces', () => {
    const concentrado = retratoSimulado(palancas({ dispersion: 0 }), BASE, TERRITORIOS);
    const repartido = retratoSimulado(palancas({ dispersion: 1 }), BASE, TERRITORIOS);
    const suma = (r: typeof concentrado): number =>
      [...r.porTerritorio.values()].reduce((a, t) => a + t.voces.valor, 0);
    expect(suma(concentrado)).toBe(suma(repartido));
    expect(concentrado.porTerritorio.get('chico')?.voces.valor).toBe(0);
    expect(repartido.porTerritorio.get('chico')?.voces.valor).toBeGreaterThan(0);
  });
});
```

- [ ] **Paso 2: verlo fallar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/retrato-simulado.test.ts`
Esperado: FAIL — `retratoSimulado is not a function`

- [ ] **Paso 3: la implementación mínima**

Agregar al final de `packages/civic-core/src/simulacion/retrato.ts`:

```ts
import { repartir } from './reparto.js';
import { periodosDelHorizonte, periodosSostenidos } from './mandato.js';

import type { Palancas } from './tipos.js';

/**
 * El lado de la voz. Acá sí mandan las palancas — es la única mitad simulada.
 */
export function retratoSimulado(
  palancas: Palancas,
  base: EstadoMedido,
  territorios: readonly Territorio[],
): Retrato {
  const poblacionTotal = territorios.reduce((s, t) => s + Math.max(0, t.poblacion), 0);
  const totalVoces = Math.round((palancas.participacion * poblacionTotal) / 100_000);

  const vocesBase = new Map<string, number>();
  for (const v of base.voces) vocesBase.set(v.territorioId, (vocesBase.get(v.territorioId) ?? 0) + 1);

  const conteo = repartir(totalVoces, territorios, palancas.dispersion, vocesBase);

  const periodosTotales = periodosDelHorizonte(palancas.horizonte);
  const sostenidos = periodosSostenidos(palancas.constancia, periodosTotales);
  const sostenidosPorTerritorio = new Map(territorios.map((t) => [t.id, sostenidos]));

  return armarRetrato(
    conteo,
    sostenidosPorTerritorio,
    periodosTotales,
    pisoEfectivo(palancas.resistencia),
    territorios,
    'participación × población ÷ 100.000, repartida por dispersión',
    false,
  );
}
```

Los `import` van arriba, en el bloque que ya existe — el linter de la casa los quiere agrupados. Lo único nuevo es `repartir` desde `./reparto.js`, `periodosDelHorizonte` y `periodosSostenidos` desde `./mandato.js` (que ya está importado por `hayMandato`, `pisoEfectivo` y `umbralDe`), y el tipo `Palancas`.

- [ ] **Paso 4: verlo pasar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/retrato-simulado.test.ts`
Esperado: PASS, 6 tests

- [ ] **Paso 5: commit**

```bash
git add v2/packages/civic-core/src/simulacion/retrato.ts v2/packages/civic-core/src/__tests__/retrato-simulado.test.ts
git commit -m "Add el retrato simulado: la resistencia sube el piso y solo la voz lo recupera"
```

---

### Tarea 7: El orquestador, la diferencia y la superficie pública

**Archivos:**
- Crear: `packages/civic-core/src/simulacion/simular.ts`
- Crear: `packages/civic-core/src/simulacion/index.ts`
- Modificar: `packages/civic-core/src/index.ts`
- Crear: `apps/web/src/lib/__tests__/tipos-voz.test.ts`
- Test: `packages/civic-core/src/__tests__/simular.test.ts`

**Interfaces:**
- Consume: `retratoMedido`, `retratoSimulado`
- Produce: `simular(entrada: EntradaSimulacion): ResultadoSimulacion`

- [ ] **Paso 1: el test que falla**

`packages/civic-core/src/__tests__/simular.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { simular } from '../simulacion/simular.js';

import type { EntradaSimulacion, Palancas, Territorio } from '../simulacion/tipos.js';

const TERRITORIOS: Territorio[] = [
  { id: 'grande', nombre: 'Grande', poblacion: 4_000_000, km2: 100 },
  { id: 'chico', nombre: 'Chico', poblacion: 1_000_000, km2: 100 },
];

const PALANCAS: Palancas = {
  participacion: 200,
  dispersion: 1,
  composicion: { basta: 1, sueño: 0, necesidad: 0, compromiso: 0, recurso: 0, valor: 0 },
  horizonte: 2,
  resistencia: 0,
  constancia: 1,
  cumplimiento: 1,
};

const entrada = (over: Partial<Palancas> = {}): EntradaSimulacion => ({
  palancas: { ...PALANCAS, ...over },
  base: { voces: [], ahora: 1_800_000_000_000 },
  territorios: TERRITORIOS,
});

describe('simular', () => {
  it('devuelve los dos retratos y su diferencia', () => {
    const r = simular(entrada());
    expect(r.silencio.porTerritorio.size).toBe(2);
    expect(r.voz.porTerritorio.size).toBe(2);
    expect(r.diferencia.porTerritorio.size).toBe(2);
  });

  it('la diferencia es la resta, territorio por territorio', () => {
    const r = simular(entrada());
    const voz = r.voz.porTerritorio.get('grande')?.voces.valor ?? 0;
    const silencio = r.silencio.porTerritorio.get('grande')?.voces.valor ?? 0;
    expect(r.diferencia.porTerritorio.get('grande')?.delta.valor).toBe(voz - silencio);
  });

  it('cuenta los territorios que ganan mandato', () => {
    const r = simular(entrada());
    expect(r.diferencia.territoriosQueGananMandato.valor).toBe(2);
    expect(r.diferencia.porTerritorio.get('grande')?.ganaMandato).toBe(true);
  });
});
```

`apps/web/src/lib/__tests__/tipos-voz.test.ts`:

```ts
import { TIPOS_VOZ_CIVICOS } from '@v2/civic-core';
import { describe, expect, it } from 'vitest';

import { TIPOS_VOZ } from '../tipos-voz';

describe('los tipos de voz de la web y los del núcleo', () => {
  it('son la misma lista, en el mismo orden', () => {
    // `civic-core` no puede importar de la app, así que la lista está en dos
    // lugares. Si divergen, el motor contaría una composición que la UI no
    // ofrece —o al revés— y nadie se enteraría. Esta es la guarda.
    expect([...TIPOS_VOZ]).toEqual([...TIPOS_VOZ_CIVICOS]);
  });
});
```

- [ ] **Paso 2: verlo fallar**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/simular.test.ts`
Esperado: FAIL — `Failed to load url ../simulacion/simular.js`

- [ ] **Paso 3: la implementación mínima**

`packages/civic-core/src/simulacion/simular.ts`:

```ts
import { derivado } from './procedencia.js';
import { retratoMedido, retratoSimulado } from './retrato.js';

import type {
  Diferencia,
  DiferenciaTerritorio,
  EntradaSimulacion,
  ResultadoSimulacion,
  Retrato,
} from './tipos.js';

/**
 * El orquestador de la Simulación — spec §5.1.
 *
 * Corre los dos lados y los resta. El lado del silencio se calcula sin mirar
 * las palancas, y esa asimetría es el corazón de S3: si las dos mitades
 * salieran del mismo modelo, la cortina no probaría nada.
 */
function restar(silencio: Retrato, voz: Retrato): Diferencia {
  const porTerritorio = new Map<string, DiferenciaTerritorio>();
  let ganan = 0;

  for (const [id, deVoz] of voz.porTerritorio) {
    const deSilencio = silencio.porTerritorio.get(id);
    const gana = deVoz.tieneMandato && !(deSilencio?.tieneMandato ?? false);
    if (gana) ganan += 1;

    porTerritorio.set(id, {
      territorioId: id,
      delta: derivado(
        deVoz.voces.valor - (deSilencio?.voces.valor ?? 0),
        'voces',
        'voces simuladas − voces medidas',
        ['voz.voces', 'silencio.voces'],
      ),
      ganaMandato: gana,
    });
  }

  return {
    porTerritorio,
    territoriosQueGananMandato: derivado(
      ganan,
      'territorios',
      'territorios con mandato en la voz y sin mandato en el silencio',
      ['voz.tieneMandato', 'silencio.tieneMandato'],
    ),
  };
}

export function simular(entrada: EntradaSimulacion): ResultadoSimulacion {
  const silencio = retratoMedido(entrada.base, entrada.territorios);
  const voz = retratoSimulado(entrada.palancas, entrada.base, entrada.territorios);
  return { silencio, voz, diferencia: restar(silencio, voz) };
}
```

`packages/civic-core/src/simulacion/index.ts`:

```ts
/** Superficie pública del motor de la Simulación. */
export * from './coeficientes.js';
export * from './mandato.js';
export * from './procedencia.js';
export * from './reparto.js';
export * from './retrato.js';
export * from './simular.js';
export * from './tipos.js';
```

En `packages/civic-core/src/index.ts`, agregar al final:

```ts
export * from './simulacion/index.js';
```

- [ ] **Paso 4: verlo pasar**

Correr: `cd packages/civic-core && npx vitest run` → todos verdes
Correr: `cd apps/web && npx vitest run src/lib/__tests__/tipos-voz.test.ts` → PASS

- [ ] **Paso 5: commit**

```bash
git add v2/packages/civic-core/src/simulacion/simular.ts v2/packages/civic-core/src/simulacion/index.ts v2/packages/civic-core/src/index.ts v2/packages/civic-core/src/__tests__/simular.test.ts v2/apps/web/src/lib/__tests__/tipos-voz.test.ts
git commit -m "Add el orquestador de la Simulación y la guarda de los tipos de voz"
```

---

### Tarea 8: Las guardas de honestidad

**Archivos:**
- Test: `packages/civic-core/src/__tests__/guardas-simulacion.test.ts`

**Interfaces:**
- Consume: todo lo anterior
- Produce: nada. Son invariantes sobre el resultado entero.

Estas son las guardas de la spec §12. Las dos últimas son de **calibración**, no de implementación: verifican que el modelo produce las lecciones que la spec dice que produce. Si dejan de pasar, o está mal calibrado o la lección era falsa — y las dos cosas hay que saberlas.

- [ ] **Paso 1: escribir las guardas**

```ts
import { describe, expect, it } from 'vitest';

import { esMagnitud } from '../simulacion/procedencia.js';
import { simular } from '../simulacion/simular.js';

import type { EntradaSimulacion, Palancas, Retrato, Territorio } from '../simulacion/tipos.js';

const TERRITORIOS: Territorio[] = [
  { id: 'grande', nombre: 'Grande', poblacion: 4_000_000, km2: 100 },
  { id: 'chico', nombre: 'Chico', poblacion: 1_000_000, km2: 100 },
  { id: 'vacio', nombre: 'Vacío', poblacion: 0, km2: 10 },
];

const PALANCAS: Palancas = {
  participacion: 200,
  dispersion: 1,
  composicion: { basta: 1, sueño: 0, necesidad: 0, compromiso: 0, recurso: 0, valor: 0 },
  horizonte: 2,
  resistencia: 0,
  constancia: 1,
  cumplimiento: 1,
};

const AHORA = 1_800_000_000_000;
const MES = 30 * 24 * 3600 * 1000;

const entrada = (over: Partial<Palancas> = {}): EntradaSimulacion => ({
  palancas: { ...PALANCAS, ...over },
  base: {
    voces: Array.from({ length: 40 }, (_, i) => ({
      territorioId: 'chico',
      tipo: 'basta' as const,
      fecha: AHORA - (i % 5) * MES,
    })),
    ahora: AHORA,
  },
  territorios: TERRITORIOS,
});

/** Recorre el resultado entero y junta todo número que no sea Magnitud. */
function numerosHuerfanos(valor: unknown, ruta = ''): string[] {
  if (typeof valor === 'number') return [ruta];
  if (valor === null || typeof valor !== 'object') return [];
  if (esMagnitud(valor)) return [];
  if (valor instanceof Map) {
    return [...valor.entries()].flatMap(([k, v]) => numerosHuerfanos(v, `${ruta}.${String(k)}`));
  }
  if (Array.isArray(valor)) return valor.flatMap((v, i) => numerosHuerfanos(v, `${ruta}[${i}]`));
  return Object.entries(valor).flatMap(([k, v]) => numerosHuerfanos(v, `${ruta}.${k}`));
}

describe('guardas de honestidad', () => {
  it('sin números huérfanos: todo valor numérico trae su procedencia', () => {
    expect(numerosHuerfanos(simular(entrada()), 'resultado')).toEqual([]);
  });

  it('el silencio es sordo: mover las siete palancas no lo cambia', () => {
    const referencia = JSON.stringify(aComparable(simular(entrada()).silencio));
    const variaciones: Partial<Palancas>[] = [
      { participacion: 100_000 },
      { dispersion: 0 },
      { composicion: { basta: 0, sueño: 1, necesidad: 0, compromiso: 0, recurso: 0, valor: 0 } },
      { horizonte: 50 },
      { resistencia: 1 },
      { constancia: 0 },
      { cumplimiento: 0 },
    ];
    for (const v of variaciones) {
      expect(JSON.stringify(aComparable(simular(entrada(v)).silencio))).toBe(referencia);
    }
  });

  it('sin dato, sin total: un territorio sin población no entra a ningún agregado', () => {
    const r = simular(entrada());
    expect(r.silencio.sinDato.map((s) => s.territorioId)).toContain('vacio');
    expect(r.voz.porTerritorio.has('vacio')).toBe(false);
    expect(r.diferencia.porTerritorio.has('vacio')).toBe(false);
  });

  it('CALIBRACIÓN: el que sostiene le gana al que grita en legitimidad', () => {
    const grita = simular(entrada({ participacion: 5000, constancia: 0 })).voz;
    const sostiene = simular(entrada({ participacion: 500, constancia: 1 })).voz;
    expect(sostiene.legitimidad.valor).toBeGreaterThan(grita.legitimidad.valor);
  });

  it('CALIBRACIÓN: contra la resistencia, la voz es lo único que gana en todos lados', () => {
    const bloqueado = simular(entrada({ resistencia: 1 })).voz;
    expect(bloqueado.alcance.valor).toBe(0);

    // Subir la voz recupera el mandato, y lo recupera donde vive la mayoría.
    const conMasVoz = simular(entrada({ resistencia: 1, participacion: 2000 })).voz;
    expect(conMasVoz.porTerritorio.get('grande')?.tieneMandato).toBe(true);
    expect(conMasVoz.alcance.valor).toBeGreaterThan(0.5);

    // Constancia, horizonte y cumplimiento por sí solos no mueven nada: no
    // tocan el piso ni el conteo.
    for (const sola of [{ constancia: 1 }, { horizonte: 50 }, { cumplimiento: 1 }]) {
      expect(simular(entrada({ resistencia: 1, ...sola })).voz.alcance.valor).toBe(0);
    }
  });

  it('CALIBRACIÓN: concentrar también rompe el bloqueo, pero deja el país mudo', () => {
    // Esta es la excepción honesta a la regla de arriba, y vale la pena que
    // el motor la enseñe: amontonar todas las voces en un solo territorio
    // cruza el piso ahí aunque haya bloqueo total. El precio es que el resto
    // del país queda sin nada — alcance chico y cobertura mínima.
    const concentrado = simular(entrada({ resistencia: 1, dispersion: 0 })).voz;
    expect(concentrado.porTerritorio.get('chico')?.tieneMandato).toBe(true);
    expect(concentrado.porTerritorio.get('grande')?.tieneMandato).toBe(false);
    expect(concentrado.alcance.valor).toBeLessThan(0.5);
    expect(concentrado.cobertura.valor).toBeLessThan(0.6);
  });
});

/** El Map no serializa; se lo pasa a array ordenado para poder comparar. */
function aComparable(r: Retrato): unknown {
  return { ...r, porTerritorio: [...r.porTerritorio.entries()].sort() };
}
```

- [ ] **Paso 2: correrlas**

Correr: `cd packages/civic-core && npx vitest run src/__tests__/guardas-simulacion.test.ts`
Esperado: PASS, 5 tests.

**Si alguna de calibración falla, no se toca el test: se revisan los coeficientes de la Tarea 2.** El test dice lo que el motor tiene que enseñar; el coeficiente es lo negociable.

- [ ] **Paso 3: verificación completa**

```bash
cd v2 && pnpm lint && pnpm type-check && pnpm test && pnpm build
```

Esperado: los cuatro en verde.

- [ ] **Paso 4: commit**

```bash
git add v2/packages/civic-core/src/__tests__/guardas-simulacion.test.ts
git commit -m "Add las guardas de honestidad del motor, incluidas las dos de calibración"
```

---

## Lo que sigue

- **Rebanada 2** — la lente Simulación: cortina, diferencia, panel de palancas. Consume `simular()` y nada más.
- **Rebanada 3** — campañas: esquema, migración, endpoints, ficha. Agrega `campanasCompletas` a `Retrato`.
- **Rebanada 4** — rankings y los cuatro caminos.
- **Rebanada 5** — capa PLANes. Agrega `secuencia` a `Palancas`.
