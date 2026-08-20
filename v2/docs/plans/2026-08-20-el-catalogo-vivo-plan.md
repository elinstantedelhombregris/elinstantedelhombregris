# El catálogo vivo — plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar el hub `/biblioteca` según `docs/specs/2026-08-20-el-catalogo-vivo-biblioteca.md`: catálogo con leaders, fichero sticky con scroll-spy, gramática única de estantes, estantería de ciclos en acordeón y la puerta de hoy con señalador.

**Architecture:** Todo vive en `apps/web`. Las derivaciones nuevas entran a `pages/Biblioteca/biblioteca-data.ts` (puras, testeadas); el señalador es `lib/senalador.ts` porque lo comparten el hub y el lector; los componentes nuevos son secciones de `pages/Biblioteca/sections/`. Ningún cambio de rutas, ids de sección ni registries.

**Tech Stack:** React 18 + wouter + Tailwind (tokens papel) + vitest/@testing-library. Sin dependencias nuevas.

## Global Constraints

- Cero hex literales en TSX — solo tokens (`text-tinta-50`, `bg-papel-crudo`, …).
- Cero border-radius, cero sombras, breakpoints solo `max-[560px]`/`max-[960px]`/formas canónicas.
- Ningún número de contenido literal en JSX: todo interpolado de registries/derivaciones.
- Copy rioplatense voseo; comillas «angulares».
- Los ids `manifiesto/ensayos/entrenamientos/cronica/bitacora` NO cambian.
- `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, no `any`, no `console`.
- Commits con rutas explícitas (hay sesiones concurrentes — D-010); scope `feat(web):`/`test(web):`.
- Verificación por task: `cd v2/apps/web && pnpm test:unit <archivo>`; al cierre lint + type-check + test + build.

---

### Task 1: Derivaciones nuevas en biblioteca-data

**Files:**
- Modify: `v2/apps/web/src/pages/Biblioteca/biblioteca-data.ts`
- Test: `v2/apps/web/src/pages/Biblioteca/__tests__/biblioteca-data.test.ts`

**Interfaces (Produces):**
```ts
export function contar(n: number, singular: string, plural: string): string; // «5 entregas»
export function minutosDeCiclo(ciclo: Ciclo): number;
export const MINUTOS_TOTALES: number;
export const ENTREGA_COUNT: number;               // CRONICA_CHAPTERS.length
export const PRIMER_ENSAYO: EnsayoEntry | null;   // ORDEN_DE_LECTURA[0]
export const BITACORA_DESTACADA: (typeof BLOG_POSTS)[number] | null; // ULTIMAS_CRONICAS[0]
export const BITACORA_RESTO: readonly (typeof BLOG_POSTS)[number][]; // ULTIMAS_CRONICAS.slice(1)
export interface Estante { num: string; ancla: string; nombre: string; inventario: string; }
export const ESTANTES: readonly Estante[];        // 5, en el orden del hub
```

- [x] **Step 1: Test que falla** — agregar al final de `biblioteca-data.test.ts`:

```ts
describe('el catálogo vivo — derivaciones (spec 2026-08-20)', () => {
  it('contar pluraliza', () => {
    expect(contar(1, 'entrega', 'entregas')).toBe('1 entrega');
    expect(contar(5, 'entrega', 'entregas')).toBe('5 entregas');
  });

  it('minutosDeCiclo suma los readingMinutes del ciclo y MINUTOS_TOTALES suma todos', () => {
    let total = 0;
    for (const ciclo of CICLOS) {
      const esperado = ciclo.ensayos.reduce(
        (acc, e) => acc + (e.readingMinutes > 0 ? e.readingMinutes : 0),
        0,
      );
      expect(minutosDeCiclo(ciclo)).toBe(esperado);
      total += esperado;
    }
    expect(MINUTOS_TOTALES).toBe(total);
  });

  it('ENTREGA_COUNT y PRIMER_ENSAYO salen de los registries', () => {
    expect(ENTREGA_COUNT).toBeGreaterThan(0);
    expect(PRIMER_ENSAYO?.slug).toBe(ORDEN_DE_LECTURA[0]?.slug);
  });

  it('la bitácora se parte en destacada + resto sin perder crónicas', () => {
    expect(BITACORA_DESTACADA?.slug).toBe(ULTIMAS_CRONICAS[0]?.slug);
    expect(BITACORA_RESTO).toHaveLength(Math.max(0, ULTIMAS_CRONICAS.length - 1));
  });

  it('ESTANTES: cinco, anclas estables, nombres = labels del header, cifras interpoladas', () => {
    expect(ESTANTES.map((e) => e.ancla)).toEqual([
      'manifiesto', 'ensayos', 'entrenamientos', 'cronica', 'bitacora',
    ]);
    expect(ESTANTES.map((e) => e.nombre)).toEqual(SECCIONES_BIBLIOTECA.map((s) => s.label));
    expect(ESTANTES.map((e) => e.num)).toEqual(['01', '02', '03', '04', '05']);
    const ensayos = ESTANTES[1];
    expect(ensayos?.inventario).toContain(contar(ENSAYO_COUNT, 'ensayo', 'ensayos'));
    expect(ensayos?.inventario).toContain(contar(CICLO_COUNT, 'ciclo', 'ciclos'));
    expect(ESTANTES[0]?.inventario).toBe('documento fundacional');
  });
});
```

Imports nuevos del test: `contar, minutosDeCiclo, MINUTOS_TOTALES, ENTREGA_COUNT, PRIMER_ENSAYO, BITACORA_DESTACADA, BITACORA_RESTO, ESTANTES` desde `../biblioteca-data`, y `SECCIONES_BIBLIOTECA` desde `~/components/papel/papel-nav`.

- [x] **Step 2: Verificar que falla** — `cd v2/apps/web && pnpm test:unit src/pages/Biblioteca/__tests__/biblioteca-data.test.ts` → FAIL (exports inexistentes).

- [x] **Step 3: Implementar** — al final de `biblioteca-data.ts` (nuevos imports arriba: `CRONICA_CHAPTERS` de `~/lib/cronica-registry`, `CURSO_COUNT` de `~/lib/courses-registry`, `SECCIONES_BIBLIOTECA` de `~/components/papel/papel-nav`):

```ts
/** «1 entrega» / «5 entregas» — toda cifra visible viaja con su sustantivo. */
export function contar(n: number, singular: string, plural: string): string {
  return `${String(n)} ${n === 1 ? singular : plural}`;
}

function minutosDe(ensayos: readonly EnsayoEntry[]): number {
  return ensayos.reduce((total, e) => total + (e.readingMinutes > 0 ? e.readingMinutes : 0), 0);
}

/** Minutos reales de lectura de un ciclo — 0 cuando ninguno declara. */
export function minutosDeCiclo(ciclo: Ciclo): number {
  return minutosDe(ciclo.ensayos);
}

export const MINUTOS_TOTALES = minutosDe(ORDEN_DE_LECTURA);
export const ENTREGA_COUNT = CRONICA_CHAPTERS.length;
export const PRIMER_ENSAYO: EnsayoEntry | null = ORDEN_DE_LECTURA[0] ?? null;

/** La bitácora del hub con jerarquía: la más reciente entera, el resto slim. */
export const BITACORA_DESTACADA = ULTIMAS_CRONICAS[0] ?? null;
export const BITACORA_RESTO = ULTIMAS_CRONICAS.slice(1);

/**
 * Los cinco estantes del hub (spec 2026-08-20). `ancla` son los ids que el
 * header ya linkea (`/biblioteca#ensayos`) — no cambian. Los nombres se leen
 * de SECCIONES_BIBLIOTECA para que header, fichero y página digan lo mismo;
 * el inventario del catálogo sale entero de registries (cifra sin dato ⇒
 * fragmento verbal, §5 de la ley).
 */
export interface Estante {
  num: string;
  ancla: string;
  nombre: string;
  inventario: string;
}

const ANCLAS_ESTANTES = ['manifiesto', 'ensayos', 'entrenamientos', 'cronica', 'bitacora'] as const;

function inventarioDelEstante(ancla: string): string {
  switch (ancla) {
    case 'ensayos': {
      const base = `${contar(ENSAYO_COUNT, 'ensayo', 'ensayos')} · ${contar(CICLO_COUNT, 'ciclo', 'ciclos')}`;
      return MINUTOS_TOTALES > 0 ? `${base} · ${String(MINUTOS_TOTALES)} min` : base;
    }
    case 'entrenamientos':
      return contar(CURSO_COUNT, 'entrenamiento', 'entrenamientos');
    case 'cronica':
      return ENTREGA_COUNT > 0 ? contar(ENTREGA_COUNT, 'entrega', 'entregas') : 'ficción especulativa';
    case 'bitacora':
      return CRONICA_COUNT > 0 ? contar(CRONICA_COUNT, 'crónica', 'crónicas') : 'lo que va pasando';
    default:
      return 'documento fundacional';
  }
}

export const ESTANTES: readonly Estante[] = ANCLAS_ESTANTES.map((ancla, i) => ({
  num: String(i + 1).padStart(2, '0'),
  ancla,
  nombre: SECCIONES_BIBLIOTECA[i]?.label ?? ancla,
  inventario: inventarioDelEstante(ancla),
}));
```

- [x] **Step 4: Verificar que pasa** — mismo comando → PASS.
- [x] **Step 5: Commit** — `git add v2/apps/web/src/pages/Biblioteca/biblioteca-data.ts v2/apps/web/src/pages/Biblioteca/__tests__/biblioteca-data.test.ts && git commit -m "feat(web): derivaciones del catálogo vivo en biblioteca-data"`

---

### Task 2: lib/senalador.ts

**Files:**
- Create: `v2/apps/web/src/lib/senalador.ts`
- Test: `v2/apps/web/src/lib/senalador.test.ts`

**Interfaces (Produces):**
```ts
export function guardarSenalador(slug: string): void;
export function leerSenalador(): string | null;
```

- [x] **Step 1: Test que falla** — `senalador.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { guardarSenalador, leerSenalador } from './senalador';

describe('senalador — el último ensayo abierto', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('round-trip: lo guardado se lee', () => {
    guardarSenalador('carta-al-nieto');
    expect(leerSenalador()).toBe('carta-al-nieto');
  });

  it('sin nada guardado devuelve null; string vacío también es null', () => {
    expect(leerSenalador()).toBeNull();
    window.localStorage.setItem('basta_senalador', '');
    expect(leerSenalador()).toBeNull();
  });

  it('con storage roto no explota: guardar es silencioso y leer devuelve null', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const getItem = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => { guardarSenalador('x'); }).not.toThrow();
    expect(leerSenalador()).toBeNull();
    setItem.mockRestore();
    getItem.mockRestore();
  });
});
```

- [x] **Step 2: Verificar que falla** — `pnpm test:unit src/lib/senalador.test.ts` → FAIL (módulo inexistente).
- [x] **Step 3: Implementar** — `senalador.ts`:

```ts
/**
 * El señalador (spec 2026-08-20 §5): el slug del último ensayo abierto,
 * guardado en el dispositivo y en ningún otro lado. No es un «leído» — la
 * Decisión 2 de la spec 3.1/3.2 sigue firme: leer no es un acto verificable.
 * Esto solo recuerda dónde estabas; el que lee valida el slug contra el
 * registry (un ensayo retirado equivale a no tener señalador).
 */
const STORAGE_KEY = 'basta_senalador';

export function guardarSenalador(slug: string): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, slug);
  } catch {
    // Sin storage (Safari privado, cuota) el señalador dura la sesión y ya.
  }
}

export function leerSenalador(): string | null {
  try {
    const slug = window.localStorage.getItem(STORAGE_KEY);
    return slug === null || slug === '' ? null : slug;
  } catch {
    return null;
  }
}
```

- [x] **Step 4: Verificar que pasa** → PASS.
- [x] **Step 5: Commit** — `git add v2/apps/web/src/lib/senalador.ts v2/apps/web/src/lib/senalador.test.ts && git commit -m "feat(web): lib del señalador — el último ensayo abierto, solo en el dispositivo"`

---

### Task 3: EncabezadoEstante (gramática única)

**Files:**
- Create: `v2/apps/web/src/pages/Biblioteca/sections/EncabezadoEstante.tsx`
- Test: `v2/apps/web/src/pages/Biblioteca/__tests__/EncabezadoEstante.test.tsx`

**Interfaces (Produces):**
```ts
export interface EncabezadoEstanteProps {
  num: string;                                     // «01»…«05»
  nombre: string;                                  // label de SECCIONES_BIBLIOTECA
  verTodo?: { href: string; label: string } | undefined; // link derecho, sin «→» (lo pone el componente)
  children?: ReactNode;                            // meta derecha alternativa sin link
}
export function EncabezadoEstante(props: EncabezadoEstanteProps): JSX.Element;
```

- [x] **Step 1: Test que falla**:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { EncabezadoEstante } from '../sections/EncabezadoEstante';

describe('EncabezadoEstante — § 0N, la gramática única de los estantes', () => {
  it('rinde § num — nombre como h2 y el link «ver todo» con flecha', () => {
    render(<EncabezadoEstante num="05" nombre="La bitácora" verTodo={{ href: '/bitacora', label: 'Ver la bitácora entera' }} />);
    expect(screen.getByRole('heading', { level: 2, name: '§ 05 — La bitácora' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver la bitácora entera →' })).toHaveAttribute('href', '/bitacora');
  });

  it('sin verTodo rinde children como meta derecha', () => {
    render(<EncabezadoEstante num="02" nombre="Los ensayos">4 ciclos</EncabezadoEstante>);
    expect(screen.getByText('4 ciclos')).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
```

- [x] **Step 2: Verificar que falla** → FAIL.
- [x] **Step 3: Implementar**:

```tsx
import { Link } from 'wouter';

import type { ReactNode } from 'react';

/**
 * La gramática única de los estantes (spec 2026-08-20 §3): border-t-2 +
 * «§ 0N — nombre» mono + «ver todo →» a la derecha cuando el estante tiene
 * catálogo detrás. Los nombres son los labels de SECCIONES_BIBLIOTECA para
 * que header, fichero y página digan lo mismo. Es h2: el mojón accesible de
 * la sección — los títulos display de adentro bajan a h3.
 */
export interface EncabezadoEstanteProps {
  num: string;
  nombre: string;
  verTodo?: { href: string; label: string } | undefined;
  children?: ReactNode;
}

export function EncabezadoEstante({ num, nombre, verTodo, children }: EncabezadoEstanteProps) {
  return (
    <div className="border-tinta flex flex-wrap items-baseline justify-between gap-3 border-t-2 pb-2 pt-[22px]">
      <h2 className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.16em]">
        <span className="text-tinta-30">§ {num} — </span>
        {nombre}
      </h2>
      {verTodo ? (
        <Link
          href={verTodo.href}
          className="font-space text-violeta text-xs font-bold uppercase tracking-[0.1em]"
        >
          {verTodo.label} →
        </Link>
      ) : (
        (children ?? null)
      )}
    </div>
  );
}
```

- [x] **Step 4: Verificar que pasa** → PASS.
- [x] **Step 5: Commit** — `git add v2/apps/web/src/pages/Biblioteca/sections/EncabezadoEstante.tsx v2/apps/web/src/pages/Biblioteca/__tests__/EncabezadoEstante.test.tsx && git commit -m "feat(web): EncabezadoEstante — la gramática única § 0N de la biblioteca"`

---

### Task 4: Los cuatro estantes existentes adoptan la gramática

**Files:**
- Modify: `v2/apps/web/src/pages/Biblioteca/sections/ManifiestoDestacado.tsx`
- Modify: `v2/apps/web/src/pages/Biblioteca/sections/CronicaDestacada.tsx`
- Modify: `v2/apps/web/src/pages/Biblioteca/sections/EntrenamientosCurados.tsx`
- Modify: `v2/apps/web/src/pages/Biblioteca/sections/BitacoraReciente.tsx`
- Modify: `v2/apps/web/src/pages/__tests__/Biblioteca.test.tsx`

**Interfaces (Consumes):** `EncabezadoEstante` (T3); `ESTANTES`, `contar`, `ENTREGA_COUNT`, `BITACORA_DESTACADA`, `BITACORA_RESTO` (T1). Los cuatro toman su `num`/`nombre` de `ESTANTES` por ancla (helper local en cada archivo NO: importar `ESTANTES` y buscar una vez es suficiente — `const ESTANTE = ESTANTES.find((e) => e.ancla === 'cronica');`; con `noUncheckedIndexedAccess` usar fallback literal del nombre si `undefined`).

Cambios por archivo (código completo):

**ManifiestoDestacado** — sección con encabezado §01, card igual pero `h2`→`h3` y `mt-6`; `scroll-mt-20`→`scroll-mt-32`:

```tsx
import { Link } from 'wouter';

import { ESTANTES, HREF_MANIFIESTO } from '../biblioteca-data';

import { EncabezadoEstante } from './EncabezadoEstante';

/**
 * § 2 de la spec madre + gramática única (spec 2026-08-20 §3): la ÚNICA card
 * oscura de la página — gravedad de documento fundacional. Sin cifras: el
 * manifiesto no tiene registry (Decisión 11 de la spec madre).
 */
const ESTANTE = ESTANTES.find((e) => e.ancla === 'manifiesto');

export function ManifiestoDestacado() {
  return (
    <section id="manifiesto" className="scroll-mt-32 mx-auto max-w-[1100px] px-10 pb-14 max-[560px]:px-5">
      <EncabezadoEstante num={ESTANTE?.num ?? '01'} nombre={ESTANTE?.nombre ?? 'El manifiesto'} />
      <Link
        href={HREF_MANIFIESTO}
        className="bg-tinta text-papel mt-6 flex flex-wrap items-center gap-8 px-10 py-9 transition-transform duration-150 hover:-translate-y-0.5 max-[560px]:px-6 max-[560px]:py-7"
      >
        <span className="font-space border-violeta-claro text-violeta-claro whitespace-nowrap border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em]">
          Documento fundacional
        </span>
        <span className="min-w-[260px] flex-1">
          <h3 className="font-anton mb-1.5 text-[clamp(24px,3vw,36px)] leading-[1.05]">
            El manifiesto del hombre gris
          </h3>
          <span className="text-oscuro-secundario block text-sm leading-[1.6]">
            No es un programa: es un espejo. Si algo te resuena, ahí empieza.
          </span>
        </span>
        <span className="font-space text-violeta-claro whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.08em]">
          Leerlo entero →
        </span>
      </Link>
    </section>
  );
}
```

**CronicaDestacada** — §04, card CLARA (borde duro 2px sobre papel-crudo), tag y CTA en violeta sobre claro, meta real de entregas; línea keystone verbatim:

```tsx
import { Link } from 'wouter';

import { contar, ENTREGA_COUNT, ESTANTES, HREF_CRONICA_PAIS_QUE_VIENE } from '../biblioteca-data';

import { EncabezadoEstante } from './EncabezadoEstante';

/**
 * § adenda de la spec madre + spec 2026-08-20 §3: la gemela se divorcia —
 * card clara con borde duro para que la única oscura sea el manifiesto. La
 * línea keystone de D2 queda verbatim; las entregas salen del registry.
 */
const ESTANTE = ESTANTES.find((e) => e.ancla === 'cronica');

export function CronicaDestacada() {
  const entregas = ENTREGA_COUNT > 0 ? ` · ${contar(ENTREGA_COUNT, 'entrega', 'entregas')}` : '';
  return (
    <section id="cronica" className="scroll-mt-32 mx-auto max-w-[1100px] px-10 pb-14 max-[560px]:px-5">
      <EncabezadoEstante
        num={ESTANTE?.num ?? '04'}
        nombre={ESTANTE?.nombre ?? 'La crónica del país que viene'}
      />
      <Link
        href={HREF_CRONICA_PAIS_QUE_VIENE}
        className="border-tinta bg-papel-crudo mt-6 flex flex-wrap items-center gap-8 border-2 px-10 py-9 transition-transform duration-150 hover:-translate-y-0.5 max-[560px]:px-6 max-[560px]:py-7"
      >
        <span className="font-space border-violeta text-violeta whitespace-nowrap border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.16em]">
          Ficción especulativa
        </span>
        <span className="min-w-[260px] flex-1">
          <h3 className="font-anton text-tinta mb-1.5 text-[clamp(24px,3vw,36px)] leading-[1.05]">
            La crónica del país que viene
          </h3>
          <span className="text-tinta-75 block text-sm leading-[1.6]">
            No es una predicción. Es un ejercicio para ver que otro camino es posible.
          </span>
        </span>
        <span className="font-space text-violeta whitespace-nowrap text-[13px] font-bold uppercase tracking-[0.08em]">
          Leer la crónica{entregas} →
        </span>
      </Link>
    </section>
  );
}
```

**EntrenamientosCurados** — la banda queda; adentro, §03 arriba con «ver todo» (reemplaza al Kicker de arriba Y al link suelto de abajo); el título Anton baja a h3:

```tsx
import { Link } from 'wouter';

import { contar, CURSOS_DESTACADOS, ESTANTES } from '../biblioteca-data';

import { EncabezadoEstante } from './EncabezadoEstante';

import { CURSO_COUNT } from '~/lib/courses-registry';
import { rotuloNivel } from '~/pages/Entrenamientos/entrenamientos-data';

/**
 * § 5 de la spec madre + gramática única (spec 2026-08-20 §3). Curación real
 * (`isFeatured` + `orderIndex`); el catálogo entero vive en /entrenamientos y
 * ahora se llega desde el encabezado del estante.
 */
const ESTANTE = ESTANTES.find((e) => e.ancla === 'entrenamientos');

export function EntrenamientosCurados() {
  return (
    <section id="entrenamientos" className="scroll-mt-32 border-tinta bg-papel-crudo border-y">
      <div className="mx-auto max-w-[1100px] px-10 py-14 max-[560px]:px-5">
        <EncabezadoEstante
          num={ESTANTE?.num ?? '03'}
          nombre={ESTANTE?.nombre ?? 'Los entrenamientos'}
          verTodo={{ href: '/entrenamientos', label: `Ver los ${contar(CURSO_COUNT, 'entrenamiento', 'entrenamientos')}` }}
        />
        <h3 className="font-anton mb-5 mt-6 text-[clamp(30px,3.6vw,48px)] leading-[1.05]">
          Para diseñar un país,
          <br />
          primero entrená la mirada.
        </h3>
        <p className="text-tinta-50 mb-8 max-w-[560px] text-pretty text-[15px] leading-[1.6]">
          Guías cortas, en criollo, sin jerga. Cada una termina en algo que podés hacer esta
          semana.
        </p>

        <div className="border-tinta bg-tinta grid grid-cols-3 gap-px border max-[960px]:grid-cols-1">
          {CURSOS_DESTACADOS.map((curso) => (
            <Link
              key={curso.slug}
              href={`/entrenamientos/${curso.slug}`}
              className="bg-papel-crudo hover:bg-papel flex min-h-[200px] flex-col gap-2.5 px-6 py-[26px] transition-colors duration-150"
            >
              <span className="font-space flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.1em]">
                <span className="text-tinta font-bold">{rotuloNivel(curso.level)}</span>
                <span className="text-tinta-50">{curso.duration} min</span>
              </span>
              <span className="font-anton text-[25px] leading-tight">{curso.title}</span>
              <span className="text-tinta-75 text-pretty text-sm leading-[1.5]">
                {curso.excerpt}
              </span>
              <span className="font-space text-violeta mt-auto text-xs font-bold uppercase tracking-[0.1em]">
                {curso.lecciones.length} lecciones · Empezar →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
```

**BitacoraReciente** — §05 con «ver todo» en el encabezado; destacada entera + resto en filas slim:

```tsx
import { Link } from 'wouter';

import {
  BITACORA_DESTACADA,
  BITACORA_RESTO,
  contar,
  CRONICA_COUNT,
  ESTANTES,
  fechaLarga,
  HREF_BITACORA,
  hrefCronica,
} from '../biblioteca-data';

import { EncabezadoEstante } from './EncabezadoEstante';

/**
 * § 4 de la spec madre + jerarquía nueva (spec 2026-08-20, Decisión 9): la
 * crónica más reciente conserva el tratamiento entero; las demás pasan a
 * fila slim. La etiqueta de categoría solo en la destacada — el color del
 * sistema significa tipo de voz, no tema de blog (Decisión 12 de la madre).
 */
const ESTANTE = ESTANTES.find((e) => e.ancla === 'bitacora');

export function BitacoraReciente() {
  return (
    <section id="bitacora" className="scroll-mt-32 mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5">
      <EncabezadoEstante
        num={ESTANTE?.num ?? '05'}
        nombre={ESTANTE?.nombre ?? 'La bitácora'}
        verTodo={{
          href: HREF_BITACORA,
          label: `Ver la bitácora entera · ${contar(CRONICA_COUNT, 'crónica', 'crónicas')}`,
        }}
      />

      {BITACORA_DESTACADA === null ? (
        <p className="text-tinta-50 mt-8 text-pretty text-[15px] leading-[1.6]">
          Todavía no hay crónicas. Cuando pase algo, se cuenta acá.
        </p>
      ) : (
        <>
          <Link
            href={hrefCronica(BITACORA_DESTACADA.slug)}
            className="hover:bg-papel-presionado block px-2 py-6 transition-colors duration-150"
          >
            <span className="font-space text-tinta-50 mb-2 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.1em]">
              <span>{fechaLarga(BITACORA_DESTACADA.publishedAt)}</span>
              {BITACORA_DESTACADA.category !== '' ? (
                <span className="border-tinta text-tinta border px-2 py-0.5">
                  {BITACORA_DESTACADA.category}
                </span>
              ) : null}
            </span>
            <span className="text-tinta block text-xl font-bold leading-snug">
              {BITACORA_DESTACADA.title}
            </span>
            {BITACORA_DESTACADA.summary !== '' ? (
              <span className="text-tinta-75 mt-1 block max-w-[680px] text-pretty text-[15px] leading-[1.6]">
                {BITACORA_DESTACADA.summary}
              </span>
            ) : null}
            <span className="font-space text-violeta mt-2 block text-xs font-bold uppercase tracking-[0.1em]">
              Leer la crónica →
            </span>
          </Link>

          {BITACORA_RESTO.map((post) => (
            <Link
              key={post.slug}
              href={hrefCronica(post.slug)}
              className="border-papel-borde hover:bg-papel-presionado grid grid-cols-[150px_1fr_40px] items-baseline gap-5 border-t px-2 py-4 transition-colors duration-150 max-[560px]:grid-cols-1 max-[560px]:gap-1"
            >
              <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.1em]">
                {fechaLarga(post.publishedAt)}
              </span>
              <span className="text-tinta text-[17px] font-semibold leading-snug">{post.title}</span>
              <span aria-hidden className="font-space text-violeta justify-self-end max-[560px]:hidden">
                →
              </span>
            </Link>
          ))}
        </>
      )}
    </section>
  );
}
```

- [x] **Step 1:** Actualizar `Biblioteca.test.tsx` primero (test que falla): en el bloque del manifiesto, `getByRole('heading', { name: 'El manifiesto del hombre gris' })` sigue (ahora h3 — el query por name no fija nivel, agregar `level: 3`); agregar asserts de gramática:

```ts
it('los cinco estantes abren con la gramática § 0N — nombre', () => {
  render(<Biblioteca />);
  for (const estante of ESTANTES) {
    expect(
      screen.getByRole('heading', { level: 2, name: `§ ${estante.num} — ${estante.nombre}` }),
    ).toBeInTheDocument();
  }
});

it('la crónica del país que viene es card clara con entregas reales', () => {
  render(<Biblioteca />);
  const link = screen.getByRole('heading', { level: 3, name: 'La crónica del país que viene' }).closest('a');
  expect(link).toHaveAttribute('href', HREF_CRONICA_PAIS_QUE_VIENE);
  expect(link).toHaveTextContent(`Leer la crónica · ${contar(ENTREGA_COUNT, 'entrega', 'entregas')} →`);
});

it('la bitácora jerarquiza: la primera entera con resumen, el resto filas slim', () => {
  render(<Biblioteca />);
  if (BITACORA_DESTACADA) {
    expect(screen.getByText(BITACORA_DESTACADA.title)).toBeInTheDocument();
    if (BITACORA_DESTACADA.summary !== '') {
      expect(screen.getByText(BITACORA_DESTACADA.summary)).toBeInTheDocument();
    }
  }
  for (const post of BITACORA_RESTO) {
    expect(screen.getByText(post.title).closest('a')).toHaveAttribute('href', hrefCronica(post.slug));
  }
});
```

(Los asserts viejos que contradicen — p. ej. summary visible para TODAS las crónicas, o «Ensayos · N ciclos · tocá para abrir» — se ajustan en su task; acá solo lo que estos cuatro archivos rompen. NOTA de ejecución: este task toca el §02 solo en el test si hiciera falta — el `IndiceEnsayos` real se rehace en Task 5, así que el assert de gramática para el estante `ensayos` va a fallar hasta esa task; para mantener verde, el loop de gramática de arriba se agrega recién en Task 5 o se limita acá a los cuatro estantes tocados: usar `ESTANTES.filter((e) => e.ancla !== 'ensayos')` y quitar el filtro en Task 5.)

- [x] **Step 2:** `pnpm test:unit src/pages/__tests__/Biblioteca.test.tsx` → FAIL.
- [x] **Step 3:** Aplicar los cuatro archivos de arriba.
- [x] **Step 4:** `pnpm test:unit src/pages/__tests__/Biblioteca.test.tsx src/pages/Biblioteca` → PASS.
- [x] **Step 5: Commit** — `git add v2/apps/web/src/pages/Biblioteca/sections/ManifiestoDestacado.tsx v2/apps/web/src/pages/Biblioteca/sections/CronicaDestacada.tsx v2/apps/web/src/pages/Biblioteca/sections/EntrenamientosCurados.tsx v2/apps/web/src/pages/Biblioteca/sections/BitacoraReciente.tsx v2/apps/web/src/pages/__tests__/Biblioteca.test.tsx && git commit -m "feat(web): los cuatro estantes adoptan la gramática § 0N; la crónica se divorcia de su gemela"`

---

### Task 5: La estantería de ciclos (IndiceEnsayos rehecho)

**Files:**
- Modify: `v2/apps/web/src/pages/Biblioteca/sections/IndiceEnsayos.tsx` (reescritura)
- Modify: `v2/apps/web/src/pages/Biblioteca/__tests__/IndiceEnsayos.test.tsx` (reescritura)
- Modify: `v2/apps/web/src/pages/__tests__/Biblioteca.test.tsx` (quitar el filtro `!== 'ensayos'` del loop de gramática)

**Interfaces (Consumes):** `minutosDeCiclo`, `contar`, `ESTANTES`, `CICLOS`, `numeroDeFila` (T1); `leerSenalador` (T2); `EncabezadoEstante` (T3); `FilaIndiceExpandible`, `saltarASeccion` existentes.

Comportamiento: grilla 2×2 de tapas (botones `aria-expanded` + `aria-controls="panel-ciclo-abierto"`); un ciclo abierto por vez (default: el del señalador si su slug está en `CICLOS`, si no el primero); tocar la tapa abierta cierra; abrir desliza hasta el panel (guardado para jsdom); el panel conserva el bloque de encabezado del ciclo (mono + h3, sin descripción — vive en la tapa) y las filas `FilaIndiceExpandible` con su apertura única actual.

- [x] **Step 1:** Reescribir `IndiceEnsayos.test.tsx`:

```tsx
import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { IndiceEnsayos } from '../sections/IndiceEnsayos';

import { CICLOS, contar, minutosDeCiclo } from '~/pages/Biblioteca/biblioteca-data';

/**
 * IndiceEnsayos.test.tsx — la estantería de ciclos (spec 2026-08-20 §4):
 * tapas 2×2 + acordeón de un ciclo por vez. Cero literales de contenido.
 */

function tapaDe(rotulo: string): HTMLElement {
  const tapa = screen
    .getAllByRole('button')
    .find((b) => b.textContent?.includes(rotulo) && b.getAttribute('aria-controls') === 'panel-ciclo-abierto');
  expect(tapa).toBeDefined();
  if (!tapa) throw new Error(`sin tapa para ${rotulo}`);
  return tapa;
}

describe('IndiceEnsayos — las tapas', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('una tapa por ciclo, con rótulo, descripción y meta real (conteo, minutos, fecha)', () => {
    render(<IndiceEnsayos />);
    for (const ciclo of CICLOS) {
      const tapa = tapaDe(ciclo.rotulo);
      expect(tapa).toHaveTextContent(contar(ciclo.ensayos.length, 'ensayo', 'ensayos'));
      const minutos = minutosDeCiclo(ciclo);
      if (minutos > 0) expect(tapa).toHaveTextContent(`${String(minutos)} min`);
      expect(tapa).toHaveTextContent(ciclo.fecha);
      if (ciclo.descripcion) expect(tapa).toHaveTextContent(ciclo.descripcion);
    }
  });

  it('por defecto el primer ciclo está abierto: su tapa expandida y sus filas presentes', () => {
    render(<IndiceEnsayos />);
    const primero = CICLOS[0];
    expect(primero).toBeDefined();
    if (!primero) return;
    expect(tapaDe(primero.rotulo)).toHaveAttribute('aria-expanded', 'true');
    const panel = screen.getByRole('region');
    for (const ensayo of primero.ensayos) {
      expect(within(panel).getByText(ensayo.title)).toBeInTheDocument();
    }
  });

  it('con señalador guardado, abre el ciclo del señalador', () => {
    const ultimo = CICLOS[CICLOS.length - 1];
    const ensayo = ultimo?.ensayos[0];
    expect(ensayo).toBeDefined();
    if (!ultimo || !ensayo) return;
    window.localStorage.setItem('basta_senalador', ensayo.slug);
    render(<IndiceEnsayos />);
    expect(tapaDe(ultimo.rotulo)).toHaveAttribute('aria-expanded', 'true');
  });
});

describe('IndiceEnsayos — el acordeón', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('abrir otro ciclo cierra el anterior; solo un panel a la vez', () => {
    render(<IndiceEnsayos />);
    const [primero, segundo] = CICLOS;
    expect(primero && segundo).toBeTruthy();
    if (!primero || !segundo) return;
    fireEvent.click(tapaDe(segundo.rotulo));
    expect(tapaDe(segundo.rotulo)).toHaveAttribute('aria-expanded', 'true');
    expect(tapaDe(primero.rotulo)).toHaveAttribute('aria-expanded', 'false');
    const panel = screen.getByRole('region');
    expect(within(panel).queryByText(primero.ensayos[0]?.title ?? '—')).not.toBeInTheDocument();
  });

  it('tocar la tapa abierta cierra todo', () => {
    render(<IndiceEnsayos />);
    const primero = CICLOS[0];
    if (!primero) return;
    fireEvent.click(tapaDe(primero.rotulo));
    expect(screen.queryByRole('region')).not.toBeInTheDocument();
  });

  it('las filas del ciclo abierto conservan la apertura única y el link con minutos', () => {
    render(<IndiceEnsayos />);
    const primero = CICLOS[0];
    const ensayo = primero?.ensayos.find((e) => e.form !== 'acta');
    if (!primero || !ensayo) return;
    const fila = screen.getByText(ensayo.title).closest('button');
    expect(fila).not.toBeNull();
    if (!fila) return;
    fireEvent.click(fila);
    expect(screen.getByText(`«${ensayo.summary}»`)).toBeInTheDocument();
    const tramo = ensayo.readingMinutes > 0 ? ` · ${String(ensayo.readingMinutes)} min` : '';
    expect(
      screen.getByRole('link', { name: `Leer el ensayo completo${tramo} →` }),
    ).toHaveAttribute('href', `/ensayos/${ensayo.slug}`);
  });
});
```

- [x] **Step 2:** `pnpm test:unit src/pages/Biblioteca/__tests__/IndiceEnsayos.test.tsx` → FAIL.
- [x] **Step 3:** Reescribir `IndiceEnsayos.tsx`:

```tsx
import { useState } from 'react';
import { Link } from 'wouter';

import {
  CICLOS,
  contar,
  ESTANTES,
  minutosDeCiclo,
  numeroDeFila,
  type Ciclo,
} from '../biblioteca-data';

import { EncabezadoEstante } from './EncabezadoEstante';

import type { EnsayoEntry } from '~/lib/ensayos-registry';

import { FilaIndiceExpandible } from '~/components/papel/primitives';
import { saltarASeccion } from '~/lib/ir-al-principio';
import { leerSenalador } from '~/lib/senalador';
import { cn } from '~/lib/utils';

const ID_PANEL = 'panel-ciclo-abierto';

/** El ciclo que arranca abierto: el del señalador si existe, si no el primero. */
function cicloInicial(): string | null {
  const slug = leerSenalador();
  const delSenalador =
    slug !== null ? CICLOS.find((c) => c.ensayos.some((e) => e.slug === slug)) : undefined;
  return (delSenalador ?? CICLOS[0])?.serie ?? null;
}

/** jsdom no trae matchMedia/scrollIntoView; sin ellos, el pliegue alcanza. */
function deslizarHastaElIndice(): void {
  if (
    typeof window.matchMedia !== 'function' ||
    typeof Element.prototype.scrollIntoView !== 'function'
  ) {
    return;
  }
  requestAnimationFrame(() => {
    saltarASeccion(ID_PANEL);
  });
}

/**
 * § 3 de la spec madre, rehecho como estantería (spec 2026-08-20 §4): las
 * tapas de los {C} ciclos en grilla de juntas + el índice de UN ciclo por
 * vez — el principio «una sola abierta por lista» de FilaIndiceExpandible,
 * un nivel arriba. Las filas internas conservan su apertura única.
 */
export function IndiceEnsayos() {
  const [cicloAbierto, setCicloAbierto] = useState<string | null>(() => cicloInicial());
  const [ensayoAbierto, setEnsayoAbierto] = useState<string | null>(null);

  const fila = (ensayo: EnsayoEntry, num: string) => {
    const esActa = ensayo.form === 'acta';
    const minutos = ensayo.readingMinutes > 0 ? ` · ${String(ensayo.readingMinutes)} min` : '';
    return (
      <FilaIndiceExpandible
        key={ensayo.slug}
        num={num}
        idPanel={`panel-${ensayo.slug}`}
        abierta={ensayoAbierto === ensayo.slug}
        onToggle={() => {
          setEnsayoAbierto(ensayoAbierto === ensayo.slug ? null : ensayo.slug);
        }}
        encabezado={
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span
              className={`text-[17px] font-semibold leading-snug ${ensayoAbierto === ensayo.slug ? 'text-violeta' : 'text-tinta'}`}
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

  const tapa = (ciclo: Ciclo) => {
    const abierta = cicloAbierto === ciclo.serie;
    const minutos = minutosDeCiclo(ciclo);
    return (
      <button
        key={ciclo.serie}
        type="button"
        aria-expanded={abierta}
        aria-controls={ID_PANEL}
        onClick={() => {
          const abre = !abierta;
          setCicloAbierto(abre ? ciclo.serie : null);
          setEnsayoAbierto(null);
          if (abre) deslizarHastaElIndice();
        }}
        className={cn(
          'flex min-h-[188px] flex-col items-start gap-2 px-6 py-6 text-left transition-colors duration-150',
          abierta ? 'bg-papel-presionado' : 'bg-papel-crudo hover:bg-papel',
        )}
      >
        <span className="flex w-full items-baseline justify-between gap-3">
          <span
            aria-hidden
            className={cn('font-anton text-[56px] leading-none', abierta ? 'text-violeta' : 'text-tinta')}
          >
            {ciclo.romano}
          </span>
          <span
            aria-hidden
            className={cn('font-space text-lg', abierta ? 'text-violeta' : 'text-tinta-50')}
          >
            {abierta ? '−' : '+'}
          </span>
        </span>
        <span className="font-anton text-[22px] leading-tight">{ciclo.rotulo}</span>
        {ciclo.descripcion ? (
          <span className="text-tinta-75 text-pretty text-sm leading-[1.5]">{ciclo.descripcion}</span>
        ) : null}
        <span className="font-space text-tinta-50 mt-auto text-[11px] uppercase tracking-[0.1em]">
          {contar(ciclo.ensayos.length, 'ensayo', 'ensayos')}
          {minutos > 0 ? ` · ${String(minutos)} min` : ''} · {ciclo.fecha}
        </span>
      </button>
    );
  };

  const abierto = CICLOS.find((c) => c.serie === cicloAbierto);
  const ESTANTE = ESTANTES.find((e) => e.ancla === 'ensayos');

  return (
    <section
      id="ensayos"
      className="scroll-mt-32 anim-fadeup mx-auto max-w-[1100px] px-10 pb-[72px] max-[560px]:px-5"
    >
      <EncabezadoEstante num={ESTANTE?.num ?? '02'} nombre={ESTANTE?.nombre ?? 'Los ensayos'}>
        <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.1em]">
          {contar(CICLOS.length, 'ciclo', 'ciclos')} · tocá una tapa
        </span>
      </EncabezadoEstante>

      <div className="border-tinta bg-tinta mt-6 grid grid-cols-2 gap-px border max-[560px]:grid-cols-1">
        {CICLOS.map(tapa)}
      </div>

      {abierto ? (
        <div
          id={ID_PANEL}
          role="region"
          aria-label={`Ciclo ${abierto.romano} — ${abierto.rotulo}`}
          className="anim-fadeup-rapido scroll-mt-32 mt-8"
        >
          <div className="border-tinta border-t-2 pb-2 pt-[22px]">
            <p className="font-space text-tinta-50 mb-2 text-[11px] uppercase tracking-[0.16em]">
              Ciclo {abierto.romano} · {contar(abierto.ensayos.length, 'ensayo', 'ensayos')} ·{' '}
              {abierto.fecha}
            </p>
            <h3 className="font-anton riso-hover mb-1 text-[clamp(24px,3vw,34px)] leading-[1.1]">
              {abierto.rotulo}
            </h3>
          </div>
          {abierto.ensayos.map((ensayo, i) => fila(ensayo, numeroDeFila(i)))}
        </div>
      ) : null}
    </section>
  );
}
```

- [x] **Step 4:** En `Biblioteca.test.tsx` quitar el filtro `!== 'ensayos'` del loop de gramática. Correr `pnpm test:unit src/pages` → PASS.
- [x] **Step 5: Commit** — `git add v2/apps/web/src/pages/Biblioteca/sections/IndiceEnsayos.tsx v2/apps/web/src/pages/Biblioteca/__tests__/IndiceEnsayos.test.tsx v2/apps/web/src/pages/__tests__/Biblioteca.test.tsx && git commit -m "feat(web): la estantería de ciclos — tapas 2×2 y acordeón de un ciclo por vez"`

---

### Task 6: El catálogo en la portada

**Files:**
- Create: `v2/apps/web/src/pages/Biblioteca/sections/CatalogoIndice.tsx`
- Modify: `v2/apps/web/src/pages/Biblioteca/sections/PortadaBiblioteca.tsx`
- Modify: `v2/apps/web/src/pages/__tests__/Biblioteca.test.tsx`

**Interfaces (Consumes):** `ESTANTES` (T1), `saltarASeccion`.

- [x] **Step 1:** En `Biblioteca.test.tsx`, reemplazar el assert del lead viejo (`{N} ensayos en {C} ciclos`) por:

```ts
it('la portada es catálogo: una fila por estante con su inventario real', () => {
  render(<Biblioteca />);
  const catalogo = screen.getByRole('navigation', { name: 'Catálogo de la biblioteca' });
  for (const estante of ESTANTES) {
    const fila = within(catalogo).getByText(estante.nombre).closest('a');
    expect(fila).toHaveAttribute('href', `#${estante.ancla}`);
    expect(fila).toHaveTextContent(estante.inventario);
  }
  expect(screen.getByText(/Robate todo\.$/)).toBeInTheDocument();
});
```

- [x] **Step 2:** → FAIL.
- [x] **Step 3:** Crear `CatalogoIndice.tsx`:

```tsx
import { ESTANTES } from '../biblioteca-data';

import { saltarASeccion } from '~/lib/ir-al-principio';

/**
 * El catálogo (spec 2026-08-20 §1): el inventario de la portada como índice
 * tipográfico con puntos conductores — llevan el ojo del nombre a la cifra,
 * eso significan. Toda cifra sale de ESTANTES (registries); el salto usa
 * saltarASeccion, que ya respeta prefers-reduced-motion. Fallback sin JS:
 * href de ancla nativo.
 */
export function CatalogoIndice() {
  return (
    <nav aria-label="Catálogo de la biblioteca" className="anim-fadeup mt-10 max-w-[720px]">
      {ESTANTES.map((estante) => (
        <a
          key={estante.ancla}
          href={`#${estante.ancla}`}
          onClick={(evento) => {
            if (saltarASeccion(estante.ancla)) evento.preventDefault();
          }}
          className="group hover:bg-papel-presionado flex items-baseline gap-3 px-2 py-3 transition-colors duration-150"
        >
          <span className="font-space text-tinta-30 text-sm">{estante.num}</span>
          <span className="text-tinta group-hover:text-violeta text-[17px] font-semibold leading-snug transition-colors duration-150">
            {estante.nombre}
          </span>
          <span aria-hidden className="border-tinta-30 mx-1 mb-[5px] min-w-6 flex-1 self-end border-b-2 border-dotted" />
          <span className="font-space text-tinta-50 shrink-0 text-[11px] uppercase tracking-[0.1em]">
            {estante.inventario}
          </span>
        </a>
      ))}
    </nav>
  );
}
```

Reescribir `PortadaBiblioteca.tsx`:

```tsx
import { CatalogoIndice } from './CatalogoIndice';

import { Kicker, RitoTinta } from '~/components/papel/primitives';

/**
 * § 1 de la spec madre + el catálogo (spec 2026-08-20 §1): rito de la tinta
 * en el H1, lead de dos frases y el inventario hecho índice — las cifras
 * viven en las filas del catálogo, no en el párrafo.
 */
export function PortadaBiblioteca() {
  return (
    <section className="mx-auto max-w-[1100px] px-10 pb-12 pt-16 max-[560px]:px-5">
      <Kicker className="anim-fadeup mb-4">La biblioteca · leer también es hacer</Kicker>
      <h1
        aria-label="Papel, tinta y método."
        className="font-anton riso-hover mb-5 text-[clamp(44px,6vw,88px)] leading-[0.98]"
      >
        <RitoTinta lineas={['Papel, tinta', 'y método.']} />
      </h1>
      <p
        className="anim-fadeup text-tinta-75 max-w-[620px] text-pretty text-[17px] leading-[1.6]"
        style={{ animationDelay: '0.9s' }}
      >
        Todo lo que el movimiento piensa está publicado entero, sin paywall y sin registro.
        Robate todo.
      </p>
      <CatalogoIndice />
    </section>
  );
}
```

- [x] **Step 4:** `pnpm test:unit src/pages/__tests__/Biblioteca.test.tsx` → PASS.
- [x] **Step 5: Commit** — `git add v2/apps/web/src/pages/Biblioteca/sections/CatalogoIndice.tsx v2/apps/web/src/pages/Biblioteca/sections/PortadaBiblioteca.tsx v2/apps/web/src/pages/__tests__/Biblioteca.test.tsx && git commit -m "feat(web): el catálogo en la portada — el inventario hecho índice con leaders"`

---

### Task 7: La puerta de hoy

**Files:**
- Create: `v2/apps/web/src/pages/Biblioteca/sections/PuertaDeHoy.tsx`
- Test: `v2/apps/web/src/pages/Biblioteca/__tests__/PuertaDeHoy.test.tsx`
- Modify: `v2/apps/web/src/pages/Biblioteca.tsx` (composición)

**Interfaces (Consumes):** `PRIMER_ENSAYO`, `ubicarEnsayo`, `fechaLarga`, `HREF_MANIFIESTO`, `HREF_BITACORA`, `BITACORA_DESTACADA`… ojo: la última crónica del sitio es `ULTIMAS_CRONICAS[0]` = `BITACORA_DESTACADA` (misma constante, T1); `leerSenalador` (T2); `findEnsayoBySlug` de `~/lib/ensayos-registry`.

- [x] **Step 1:** `PuertaDeHoy.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { PuertaDeHoy } from '../sections/PuertaDeHoy';

import {
  BITACORA_DESTACADA,
  fechaLarga,
  HREF_BITACORA,
  HREF_MANIFIESTO,
  PRIMER_ENSAYO,
  ubicarEnsayo,
} from '~/pages/Biblioteca/biblioteca-data';
import { ORDEN_DE_LECTURA } from '~/pages/Biblioteca/biblioteca-data';

describe('PuertaDeHoy — las tres puertas', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('sin señalador: de cero → manifiesto, a pensar → primer ensayo, qué pasó → bitácora', () => {
    render(<PuertaDeHoy />);
    expect(screen.getByText('¿Venís de cero?').closest('a')).toHaveAttribute('href', HREF_MANIFIESTO);
    expect(PRIMER_ENSAYO).not.toBeNull();
    if (PRIMER_ENSAYO) {
      expect(screen.getByText('¿Venís a pensar?').closest('a')).toHaveAttribute(
        'href',
        `/ensayos/${PRIMER_ENSAYO.slug}`,
      );
      expect(screen.getByText(`«${PRIMER_ENSAYO.title}»`)).toBeInTheDocument();
    }
    const puertaBitacora = screen.getByText('¿Venís a ver qué pasó?').closest('a');
    expect(puertaBitacora).toHaveAttribute('href', HREF_BITACORA);
    if (BITACORA_DESTACADA) {
      expect(puertaBitacora).toHaveTextContent(fechaLarga(BITACORA_DESTACADA.publishedAt));
    }
  });

  it('con señalador válido, la puerta del medio retoma con la posición real', () => {
    const guardado = ORDEN_DE_LECTURA[2] ?? ORDEN_DE_LECTURA[0];
    expect(guardado).toBeDefined();
    if (!guardado) return;
    window.localStorage.setItem('basta_senalador', guardado.slug);
    render(<PuertaDeHoy />);
    const puerta = screen.getByText('Estabas leyendo').closest('a');
    expect(puerta).toHaveAttribute('href', `/ensayos/${guardado.slug}`);
    const ubicacion = ubicarEnsayo(guardado.slug);
    expect(ubicacion).not.toBeNull();
    if (ubicacion) {
      expect(puerta).toHaveTextContent(
        `Ciclo ${ubicacion.ciclo.romano} · ${String(ubicacion.posicion)} de ${String(ubicacion.total)}`,
      );
    }
    expect(screen.queryByText('¿Venís a pensar?')).not.toBeInTheDocument();
  });

  it('con señalador fantasma (slug retirado), vuelven las puertas fijas', () => {
    window.localStorage.setItem('basta_senalador', 'ensayo-que-no-existe');
    render(<PuertaDeHoy />);
    expect(screen.getByText('¿Venís a pensar?')).toBeInTheDocument();
    expect(screen.queryByText('Estabas leyendo')).not.toBeInTheDocument();
  });
});
```

- [x] **Step 2:** → FAIL.
- [x] **Step 3:** `PuertaDeHoy.tsx`:

```tsx
import { Link } from 'wouter';

import {
  BITACORA_DESTACADA,
  fechaLarga,
  HREF_BITACORA,
  HREF_MANIFIESTO,
  PRIMER_ENSAYO,
  ubicarEnsayo,
} from '../biblioteca-data';

import { findEnsayoBySlug } from '~/lib/ensayos-registry';
import { leerSenalador } from '~/lib/senalador';

interface Puerta {
  kicker: string;
  titulo: string;
  meta: string;
  href: string;
  cta: string;
}

const PUERTA_DE_CERO: Puerta = {
  kicker: '¿Venís de cero?',
  titulo: 'El manifiesto',
  meta: 'el espejo del movimiento',
  href: HREF_MANIFIESTO,
  cta: 'Leerlo',
};

/** La puerta del medio: retomar si hay señalador válido; si no, el eslabón 1. */
function puertaDePensar(): Puerta | null {
  const slug = leerSenalador();
  const guardado = slug !== null ? findEnsayoBySlug(slug) : undefined;
  const ubicacion = guardado ? ubicarEnsayo(guardado.slug) : null;
  if (guardado && ubicacion) {
    return {
      kicker: 'Estabas leyendo',
      titulo: `«${guardado.title}»`,
      meta: `Ciclo ${ubicacion.ciclo.romano} · ${String(ubicacion.posicion)} de ${String(ubicacion.total)}`,
      href: `/ensayos/${guardado.slug}`,
      cta: 'Retomar',
    };
  }
  if (!PRIMER_ENSAYO) return null;
  const arranque = ubicarEnsayo(PRIMER_ENSAYO.slug);
  const minutos = PRIMER_ENSAYO.readingMinutes > 0 ? ` · ${String(PRIMER_ENSAYO.readingMinutes)} min` : '';
  return {
    kicker: '¿Venís a pensar?',
    titulo: `«${PRIMER_ENSAYO.title}»`,
    meta: arranque ? `Ciclo ${arranque.ciclo.romano} · 01${minutos}` : `01${minutos}`,
    href: `/ensayos/${PRIMER_ENSAYO.slug}`,
    cta: 'Empezar por acá',
  };
}

function puertaDeVerQuePaso(): Puerta | null {
  if (!BITACORA_DESTACADA) return null;
  return {
    kicker: '¿Venís a ver qué pasó?',
    titulo: 'La bitácora',
    meta: `última crónica: ${fechaLarga(BITACORA_DESTACADA.publishedAt)}`,
    href: HREF_BITACORA,
    cta: 'Ver qué pasó',
  };
}

/**
 * La puerta de hoy (spec 2026-08-20 §5): los tres perfiles que la spec madre
 * nombra, hechos superficie — y el señalador cuando hay lectura empezada.
 * Sin dato (registry vacío) la puerta no se rinde: nunca una promesa vacía.
 */
export function PuertaDeHoy() {
  const puertas = [PUERTA_DE_CERO, puertaDePensar(), puertaDeVerQuePaso()].filter(
    (p): p is Puerta => p !== null,
  );
  return (
    <section aria-label="¿Por dónde entrar hoy?" className="mx-auto max-w-[1100px] px-10 pb-14 max-[560px]:px-5">
      <div className="border-tinta bg-tinta grid grid-cols-3 gap-px border max-[960px]:grid-cols-1">
        {puertas.map((puerta) => (
          <Link
            key={puerta.kicker}
            href={puerta.href}
            className="bg-papel hover:bg-papel-presionado flex min-h-[132px] flex-col gap-1.5 px-6 py-5 transition-colors duration-150"
          >
            <span className="font-space text-violeta text-[11px] font-bold uppercase tracking-[0.16em]">
              {puerta.kicker}
            </span>
            <span className="text-tinta text-[17px] font-semibold leading-snug">{puerta.titulo}</span>
            <span className="font-space text-tinta-50 text-[11px] uppercase tracking-[0.1em]">
              {puerta.meta}
            </span>
            <span className="font-space text-violeta mt-auto pt-2 text-xs font-bold uppercase tracking-[0.1em]">
              {puerta.cta} →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
```

En `Biblioteca.tsx`, agregar `<PuertaDeHoy />` entre `<PortadaBiblioteca />` y `<ManifiestoDestacado />` (import arriba, orden alfabético del grupo).

- [x] **Step 4:** `pnpm test:unit src/pages` → PASS.
- [x] **Step 5: Commit** — `git add v2/apps/web/src/pages/Biblioteca/sections/PuertaDeHoy.tsx v2/apps/web/src/pages/Biblioteca/__tests__/PuertaDeHoy.test.tsx v2/apps/web/src/pages/Biblioteca.tsx && git commit -m "feat(web): la puerta de hoy — tres perfiles de entrada y el señalador que retoma"`

---

### Task 8: El fichero (franja sticky con scroll-spy)

**Files:**
- Create: `v2/apps/web/src/pages/Biblioteca/sections/FicheroBiblioteca.tsx`
- Test: `v2/apps/web/src/pages/Biblioteca/__tests__/FicheroBiblioteca.test.tsx`
- Modify: `v2/apps/web/src/pages/Biblioteca.tsx`

**Interfaces (Consumes):** `ESTANTES` (T1), `saltarASeccion`.

- [x] **Step 1:** `FicheroBiblioteca.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FicheroBiblioteca } from '../sections/FicheroBiblioteca';

import { ESTANTES } from '~/pages/Biblioteca/biblioteca-data';

type Entrada = { target: { id: string }; isIntersecting: boolean };
type Callback = (entradas: Entrada[]) => void;

describe('FicheroBiblioteca — la franja fija', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.body.innerHTML = '';
  });

  it('rinde un nav con un link por estante, sin activo cuando no hay observer', () => {
    render(<FicheroBiblioteca />);
    const nav = screen.getByRole('navigation', { name: 'Secciones de la biblioteca' });
    for (const estante of ESTANTES) {
      const link = screen.getByRole('link', { name: `${estante.num} ${estante.nombre}` });
      expect(nav).toContainElement(link);
      expect(link).toHaveAttribute('href', `#${estante.ancla}`);
      expect(link).not.toHaveAttribute('aria-current');
    }
  });

  it('con observer, la sección visible más temprana en el orden queda activa', () => {
    let callback: Callback | null = null;
    const observados: string[] = [];
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: Callback) {
          callback = cb;
        }
        observe(el: Element): void {
          observados.push(el.id);
        }
        disconnect(): void {}
      },
    );
    for (const estante of ESTANTES) {
      const seccion = document.createElement('section');
      seccion.id = estante.ancla;
      document.body.appendChild(seccion);
    }

    render(<FicheroBiblioteca />);
    expect(observados).toEqual(ESTANTES.map((e) => e.ancla));
    expect(callback).not.toBeNull();
    if (!callback) return;

    callback([
      { target: { id: 'ensayos' }, isIntersecting: true },
      { target: { id: 'entrenamientos' }, isIntersecting: true },
    ]);
    expect(screen.getByRole('link', { name: /Los ensayos/ })).toHaveAttribute('aria-current', 'true');

    callback([{ target: { id: 'ensayos' }, isIntersecting: false }]);
    expect(screen.getByRole('link', { name: /Los entrenamientos/ })).toHaveAttribute('aria-current', 'true');
  });
});
```

(Nota jsdom: las secciones se agregan a `document.body` ANTES de `render` para que el efecto las encuentre; el `render` de testing-library monta en un contenedor aparte del mismo body. Los callbacks que actualizan estado se envuelven en `act` si vitest lo pide — usar `fireEvent`-less `act(() => { callback(...) })` de `@testing-library/react`.)

- [x] **Step 2:** → FAIL.
- [x] **Step 3:** `FicheroBiblioteca.tsx`:

```tsx
import { useEffect, useState } from 'react';

import { ESTANTES } from '../biblioteca-data';

import { saltarASeccion } from '~/lib/ir-al-principio';
import { cn } from '~/lib/utils';

/**
 * El fichero (spec 2026-08-20 §2): franja sticky bajo el header con las
 * cinco secciones del hub. Scroll-spy por IntersectionObserver — la activa
 * es la sección visible más temprana en el orden de los estantes (mientras
 * el final de una y el principio de la otra comparten ventana, seguís en la
 * primera). Sin observer (jsdom, navegadores viejos) la franja rinde sin
 * resaltado: es un <nav> de links reales y los saltos funcionan igual.
 * z-30: debajo del menú móvil (40) y del header (50).
 */
export function FicheroBiblioteca() {
  const [activa, setActiva] = useState<string | null>(null);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const secciones = ESTANTES.map((e) => document.getElementById(e.ancla)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (secciones.length === 0) return undefined;

    const orden = new Map(ESTANTES.map((e, i) => [e.ancla, i]));
    const visibles = new Set<string>();
    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) visibles.add(entrada.target.id);
          else visibles.delete(entrada.target.id);
        }
        let candidata: string | null = null;
        let menor = Infinity;
        for (const id of visibles) {
          const indice = orden.get(id) ?? Infinity;
          if (indice < menor) {
            menor = indice;
            candidata = id;
          }
        }
        // Sin ninguna a la vista (portada, o un hueco en pleno scroll) se
        // conserva la anterior — arriba de todo eso significa ninguna.
        setActiva((previa) => candidata ?? previa);
      },
      // Ventana de lectura: descuenta header (64) + franja (40) arriba y el
      // 40% inferior — la sección se activa cuando la estás leyendo.
      { rootMargin: '-104px 0px -40% 0px' },
    );
    for (const el of secciones) observador.observe(el);
    return () => {
      observador.disconnect();
    };
  }, []);

  return (
    <nav
      aria-label="Secciones de la biblioteca"
      className="border-papel-borde bg-papel/90 sticky top-16 z-30 border-b backdrop-blur-[10px] print:hidden"
    >
      <div className="mx-auto flex max-w-[1100px] items-center gap-1 overflow-x-auto px-10 max-[560px]:px-5">
        {ESTANTES.map((estante) => {
          const aca = activa === estante.ancla;
          return (
            <a
              key={estante.ancla}
              href={`#${estante.ancla}`}
              aria-current={aca ? 'true' : undefined}
              onClick={(evento) => {
                if (saltarASeccion(estante.ancla)) evento.preventDefault();
              }}
              className={cn(
                'font-space flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap px-2.5 text-[11px] uppercase tracking-[0.1em] transition-colors',
                aca ? 'text-violeta font-bold' : 'text-tinta-50 hover:text-tinta',
              )}
            >
              <span className={aca ? 'text-violeta' : 'text-tinta-30'}>{estante.num}</span>
              {estante.nombre}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
```

En `Biblioteca.tsx`, `<FicheroBiblioteca />` como primer hijo de `<main>`; actualizar el doc-comment del composer (siete secciones + fichero + puertas, spec 2026-08-20).

- [x] **Step 4:** `pnpm test:unit src/pages` → PASS.
- [x] **Step 5: Commit** — `git add v2/apps/web/src/pages/Biblioteca/sections/FicheroBiblioteca.tsx v2/apps/web/src/pages/Biblioteca/__tests__/FicheroBiblioteca.test.tsx v2/apps/web/src/pages/Biblioteca.tsx && git commit -m "feat(web): el fichero — franja fija con scroll-spy sobre los cinco estantes"`

---

### Task 9: El lector escribe el señalador

**Files:**
- Modify: `v2/apps/web/src/pages/EnsayoDetail.tsx`
- Test: `v2/apps/web/src/pages/__tests__/EnsayoDetail.test.tsx` (crear si no existe; si existe, agregar el caso)

**Interfaces (Consumes):** `guardarSenalador` (T2).

- [x] **Step 1:** Test (en el archivo de EnsayoDetail que exista; si no hay, crear uno mínimo que monte la ruta con `memoryLocation` de wouter — mirar cómo lo hacen los tests existentes de páginas con `useRoute`; si ninguno lo hace, montar con `<Router hook={memoryLocation({ path: '/ensayos/<slug>' }).hook}>`):

```tsx
it('abrir un ensayo deja el señalador en el slug', () => {
  const ensayo = ORDEN_DE_LECTURA[0];
  expect(ensayo).toBeDefined();
  if (!ensayo) return;
  window.localStorage.clear();
  const { hook } = memoryLocation({ path: `/ensayos/${ensayo.slug}` });
  render(
    <Router hook={hook}>
      <EnsayoDetail />
    </Router>,
  );
  expect(window.localStorage.getItem('basta_senalador')).toBe(ensayo.slug);
});
```

- [x] **Step 2:** → FAIL.
- [x] **Step 3:** En `EnsayoDetail.tsx` — mover la resolución del ensayo ANTES de los early-returns para no romper las reglas de hooks, y agregar el efecto:

```tsx
export function EnsayoDetail() {
  const [match, params] = useRoute<{ slug: string }>('/ensayos/:slug');
  const ensayo = match ? findEnsayoBySlug(params.slug) : undefined;

  // El señalador (spec 2026-08-20 §5): el hub retoma desde el último ensayo
  // abierto. Se guarda el slug crudo; el que lee valida contra el registry.
  const slugAbierto = ensayo?.slug;
  useEffect(() => {
    if (slugAbierto !== undefined) guardarSenalador(slugAbierto);
  }, [slugAbierto]);

  if (!match) return null;
  const ubicacion = ensayo ? ubicarEnsayo(ensayo.slug) : null;
  if (!ensayo || !ubicacion) return <EnsayoExtraviado />;
  // …resto igual…
```

(Imports nuevos: `useEffect` de react, `guardarSenalador` de `~/lib/senalador`.)

- [x] **Step 4:** `pnpm test:unit src/pages/__tests__/EnsayoDetail.test.tsx` → PASS.
- [x] **Step 5: Commit** — `git add v2/apps/web/src/pages/EnsayoDetail.tsx v2/apps/web/src/pages/__tests__/EnsayoDetail.test.tsx && git commit -m "feat(web): el lector deja el señalador — el hub retoma la lectura"`

---

### Task 10: Verificación completa y prueba visual

- [x] **Step 1:** `cd v2/apps/web && pnpm lint && pnpm type-check && pnpm test:unit && pnpm build` → todo verde. Arreglar lo que salga (imports ordenados por el lint de imports, tipos exactos, etc.).
- [x] **Step 2:** Levantar `v2-web`, abrir `/biblioteca` y verificar en el navegador: fichero fijo y entintado al scrollear; saltos del catálogo; acordeón; señalador (abrir un ensayo, volver al hub, ver «Estabas leyendo»); móvil 375px (fichero scrolleable, catálogo legible, tapas en 1 columna). Capturas de escritorio y móvil.
- [x] **Step 3:** Si algo del ojo pide ajuste fino (alineación de leaders, altura de tapas), ajustar y correr de nuevo `pnpm test:unit src/pages`.
- [x] **Step 4:** Commit final de ajustes visuales si los hubo, con rutas explícitas.

## Self-review del plan

- **Cobertura de la spec:** §1 catálogo → T1+T6 · §2 fichero → T8 · §3 gramática/gemelas → T3+T4 · §4 estantería → T5 · §5 puertas/señalador → T2+T7+T9 · Decisión 9 bitácora → T4 · scroll-mt-32 → T4/T5 (cada sección al tocarla) · a11y y estados → dentro de cada componente. Sin huecos.
- **Placeholders:** ninguno — todo step de código lleva el código.
- **Consistencia de tipos:** `Estante`/`ESTANTES` (T1) consumidos igual en T4–T8; `leerSenalador(): string | null` igual en T5/T7; `EncabezadoEstanteProps.verTodo` opcional con `| undefined` (exactOptionalPropertyTypes).
