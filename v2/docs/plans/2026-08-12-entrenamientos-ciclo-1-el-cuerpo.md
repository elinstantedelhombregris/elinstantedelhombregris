# Entrenamientos Ciclo 1 — El cuerpo de las lecciones · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Borrar las 106.893 palabras de relleno generado de los entrenamientos, decir la verdad sobre cuánto dura cada lección, y escribir en su lugar un cierre propio por lección que un validador de build hace imposible de rellenar.

**Architecture:** Dos tramos. El **mecánico** (Tareas 1–12) es todo código: cinco módulos puros en `@v2/shared` con sus tests, seis scripts de un solo uso que editan los 329 archivos, y una guardia `entrenamientos:check` enganchada al CI. El **de escritura** (Tareas 13–16) es un curso piloto a mano y después **un agente por curso en paralelo** para los 30 restantes, con la guardia anti-clon como árbitro entre ellos.

**Tech Stack:** TypeScript, Zod, Vitest, pnpm workspaces, tsx para los scripts, Vite (`import.meta.glob`) para el registry, la herramienta Workflow para el fan-out de agentes.

**Spec:** [`docs/specs/2026-08-12-entrenamientos-ciclo-1-el-cuerpo.md`](../specs/2026-08-12-entrenamientos-ciclo-1-el-cuerpo.md) — las 12 decisiones. Este plan no re-decide nada: las ejecuta.

## Cosas del repo que este plan asume (verificadas el 2026-08-12)

- **`packages/shared/src/content/index.ts` exporta con extensión `.js`** (`export * from './courses.js';`). Los cinco módulos nuevos se exportan igual, con `.js`, o el build de `@v2/shared` no resuelve.
- **`yaml` no es dependencia de este repo. `gray-matter` sí**, dentro de `packages/shared`, y está envuelto en `loadContentDir(dir, schema)` — subpath `@v2/shared/content/loader`, server-only. Devuelve `{ ok: [{ file, frontmatter, body }], errors }` con el frontmatter ya validado por Zod. La guardia usa eso; no se agrega ninguna dependencia nueva.
- **El slug de una lección se deriva de `key`** con `derivarSlugDeLeccion` de `@v2/shared` — la misma función que usa `courses-registry.ts`. Ningún script vuelve a escribir ese `replace`.
- **`scripts/build/build-content.ts` no corre en ningún lado**: no está en ningún `package.json` ni en `.github/workflows/v2-ci.yml`. La guardia nueva no se cuelga de él.
- **`import.meta.dirname` es `undefined`** con el `tsx` de este repo (verificado 2026-08-13 con una prueba directa). Los scripts resuelven su directorio con `dirname(fileURLToPath(import.meta.url))`, que es lo que ya hacen `verify-planes-index.ts:22`, `migrate-planes-v1-to-v2.ts:22` y `build-content.ts:31`. Los siete scripts de este plan usan ese patrón; el primero que se escribió usó `import.meta.dirname` y crasheó con `ERR_INVALID_ARG_TYPE` en su primera corrida.
- **El minutaje que la página muestra** sale de `course.json` → `courses-registry.ts:81` (`minutos: l.duration`) → `EntrenamientoDetail.tsx:99` y `LeccionDetail.tsx:148`. `estimatedMinutes` del frontmatter no lo lee nadie.

## Global Constraints

- **Todo el texto de cara al usuario en rioplatense.** «vos», «mirá», «pará». Vale para el contenido y para los mensajes de los scripts.
- **Cero datos inventados.** Ningún número en pantalla que no salga de una medición. Si no se puede verificar, no se muestra.
- **Velocidad de lectura del proyecto:** `Math.max(1, Math.ceil(palabras / 220))`. Es la que ya usan blog y ensayos. No se elige otra.
- **Un solo minutaje**, en `course.json`. `estimatedMinutes` desaparece del frontmatter.
- **Los agentes nunca corren git.** Escriben archivos; los commits los hace el orquestador con rutas explícitas (deuda D-010: hay sesiones concurrentes en este repo). **Esto incluye el «Step N: Commit» que trae cada tarea de este plan**: ese bloque es la lista de rutas para el orquestador, no una instrucción para el agente. El brief de una tarea le copia el texto entero al agente, así que en la Tarea 4 el agente leyó su Step 7 y commiteó — no rompió nada, pero la regla vale y el brief tiene que decirlo explícito. El agente termina devolviendo la lista de archivos que escribió.
- **Ningún borrado por memoria.** Antes de borrar un campo, se repite el grep que demuestra que no tiene lector, y su salida va en el mensaje del commit.
- **Los archivos compartidos se stagean por hunk, no completos.** `package.json`, `packages/shared/src/content/index.ts` y `.github/workflows/v2-ci.yml` los editan varias sesiones a la vez (deuda D-010). Un `git add v2/package.json` se lleva puesto lo que otra sesión dejó ahí sin commitear — ya pasó una vez en este ciclo, con una línea de la Radiografía. Antes de stagear uno de esos tres: `git diff v2/package.json` y `git add -p`, o `git stash` de lo ajeno.
- **Emojis prohibidos** en el contenido de entrenamientos a partir de la Tarea 7 (esto revierte la spec 3.5, que los había dejado).
- **Profundidad de encabezados:** el cuerpo de una lección usa `##` y `###`. Nada más.
- **Dos directorios de trabajo, y no se mezclan.** Los `pnpm` y los `tsx` corren desde `v2/`. Los `git` corren desde la **raíz del repo** (`v2/` es un subdirectorio, no el repo), porque todas las rutas de los `git add` de este plan arrancan con `v2/…`. Un `git add v2/packages/…` desde dentro de `v2/` busca `v2/v2/packages` y falla.
- **Comandos:** tests de `@v2/shared`: `pnpm --filter @v2/shared exec vitest run <archivo>`. Tests de scripts: `pnpm vitest run --config scripts/vitest.config.ts <archivo>`.
- **Rama:** `main`. No se crean ramas de feature.

## Estructura de archivos

**Módulos puros nuevos** (en `packages/shared/src/content/`, exportados por `index.ts`):

| Archivo | Responsabilidad única |
|---|---|
| `lectura.ts` | Contar palabras renderizables y convertirlas en minutos |
| `cola-generada.ts` | Encontrar el corte de la cola generada con las tres anclas |
| `voseo.ts` | Detectar tuteo (lista dura y blanda) y reemplazar la dura |
| `similitud.ts` | Trigramas y Jaccard — el árbitro anti-clon |
| `cierre.ts` | Parsear y validar el cierre de tres piezas |

**Scripts** (en `scripts/content/`):

| Archivo | Cuándo corre |
|---|---|
| `entrenamientos-reporte.ts` | Antes de tocar nada, y cada vez que se quiera una foto |
| `entrenamientos-borrar-cola.ts` | Una vez (Tarea 5) |
| `entrenamientos-minutaje.ts` | Una vez, y de nuevo al final de cada curso escrito |
| `entrenamientos-voseo.ts` | Una vez (Tarea 4) |
| `entrenamientos-poda.ts` | Una vez (Tarea 7) |
| `entrenamientos-limpiar-fuente.ts` | Una vez (Tarea 8) |
| `entrenamientos-check.ts` | En cada CI, para siempre |

**Modificados:** `packages/shared/src/content/frontmatter.ts` (contrato de lección), `packages/shared/src/content/courses.ts` (contrato de curso), `packages/shared/src/content/index.ts` (exports), `scripts/content/migrate-blog-v1-to-v2.ts` y `migrate-ensayos-v1-to-v2.ts` (importan la constante en vez de copiarla), `package.json` (dos scripts nuevos), `.github/workflows/v2-ci.yml` (un paso nuevo), `apps/web/src/lib/__tests__/courses-registry.test.ts` (los minutos cambian de valor).

**Borrados:** `scripts/content/migrate-courses-v1-to-v2.ts`, `scripts/content/verify-courses-migration.ts` (Tarea 8).

---

## Tarea 1: Las dos primitivas compartidas — minutos y frontmatter

Dos cosas que sin esta tarea se copian cinco veces cada una. `Math.max(1, Math.ceil(words / 220))` ya está duplicada en `scripts/content/migrate-blog-v1-to-v2.ts:71` y `migrate-ensayos-v1-to-v2.ts:251`, y los entrenamientos serían la tercera. Y partir un `.mdx` en frontmatter + cuerpo lo necesitan los seis scripts de este plan: hacerlo con un `indexOf('\n---', 3) + 4` suelto en cada uno es el tipo de error de a un byte que corrompe 329 archivos sin avisar.

**Files:**
- Create: `packages/shared/src/content/lectura.ts`, `packages/shared/tests/lectura.test.ts`
- Create: `packages/shared/src/content/mdx.ts`, `packages/shared/tests/mdx.test.ts`
- Modify: `packages/shared/src/content/index.ts`
- Modify: `scripts/content/migrate-blog-v1-to-v2.ts:71`, `scripts/content/migrate-ensayos-v1-to-v2.ts:251`

**Interfaces:**
- Consumes: nada.
- Produces: `PALABRAS_POR_MINUTO: 220`, `contarPalabrasRenderizables(cuerpoSinFrontmatter: string): number`, `minutosDeLectura(palabras: number): number`, `interface MdxPartido { encabezado: string; cuerpo: string }`, `separarMdx(raw: string): MdxPartido`.

  Invariante de `separarMdx`, y la razón de que exista: **`encabezado + cuerpo === raw`, siempre.** Así un script reescribe el cuerpo sin tocar un byte del frontmatter.

- [ ] **Step 1: Write the failing test**

```ts
// packages/shared/tests/lectura.test.ts
import { describe, expect, it } from 'vitest';

import { PALABRAS_POR_MINUTO, contarPalabrasRenderizables, minutosDeLectura } from '../src/content/lectura';

describe('minutosDeLectura', () => {
  it('usa la velocidad del proyecto y redondea hacia arriba', () => {
    expect(PALABRAS_POR_MINUTO).toBe(220);
    expect(minutosDeLectura(220)).toBe(1);
    expect(minutosDeLectura(221)).toBe(2);
  });

  it('nunca devuelve 0', () => {
    expect(minutosDeLectura(0)).toBe(1);
    expect(minutosDeLectura(3)).toBe(1);
  });
});

describe('contarPalabrasRenderizables', () => {
  it('cuenta prosa y encabezados', () => {
    expect(contarPalabrasRenderizables('## Un título\n\nDos palabras acá.')).toBe(6);
  });

  it('no cuenta el contenido de un bloque svg', () => {
    const cuerpo = 'Antes.\n\n<svg viewBox="0 0 10 10"><path d="M 1 2 L 3 4 Z"/></svg>\n\nDespués.';
    expect(contarPalabrasRenderizables(cuerpo)).toBe(2);
  });

  it('no cuenta bloques de código ni pre', () => {
    expect(contarPalabrasRenderizables('Uno.\n\n```\nesto no cuenta nunca\n```\n\n<pre>ni esto</pre>')).toBe(1);
  });

  it('cuenta una palabra con marcado como una sola palabra', () => {
    expect(contarPalabrasRenderizables('**negrita** y *cursiva*')).toBe(3);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @v2/shared exec vitest run tests/lectura.test.ts`
Expected: FAIL — `Failed to resolve import "../src/content/lectura"`.

- [ ] **Step 3: Write the module**

```ts
// packages/shared/src/content/lectura.ts
/**
 * Minutos de lectura — la única sede de la velocidad del proyecto.
 *
 * El valor 220 no se elige acá: es el que blog y ensayos ya usaban desde su
 * migración, y cambiarlo movería cifras publicadas. Este módulo existe para que
 * no haya una cuarta copia.
 */

export const PALABRAS_POR_MINUTO = 220;

/** Bloques cuyo contenido no es prosa y no se cuenta. */
const BLOQUES_NO_PROSA = [/```[\s\S]*?```/g, /<svg[\s\S]*?<\/svg>/gi, /<pre[\s\S]*?<\/pre>/gi];

/**
 * Palabras que un lector realmente lee: el TEXTO de la prosa, los encabezados,
 * las listas y las tablas — el marcado no cuenta, así que `## Un título` son dos
 * palabras y no tres. Fuera: código, SVG, `<pre>` y las etiquetas HTML (su texto
 * interior sí cuenta). El cuerpo entra SIN frontmatter: usar `separarMdx` antes.
 */
export function contarPalabrasRenderizables(cuerpoSinFrontmatter: string): number {
  let texto = cuerpoSinFrontmatter;
  for (const bloque of BLOQUES_NO_PROSA) texto = texto.replace(bloque, ' ');
  texto = texto.replace(/<[^>]+>/g, ' ');
  return texto.split(/\s+/).filter((t) => /[\p{L}\p{N}]/u.test(t)).length;
}

/** Minutos de lectura, mínimo 1. Misma fórmula que blog y ensayos. */
export function minutosDeLectura(palabras: number): number {
  return Math.max(1, Math.ceil(palabras / PALABRAS_POR_MINUTO));
}
```

- [ ] **Step 3b: Write the failing test for `separarMdx`**

```ts
// packages/shared/tests/mdx.test.ts
import { describe, expect, it } from 'vitest';

import { separarMdx } from '../src/content/mdx';

const RAW = `---\nslug: una-leccion\ntitle: Una lección\n---\n\n## Cuerpo\n\nProsa.\n`;

describe('separarMdx', () => {
  it('reconstruye el archivo exacto: encabezado + cuerpo === raw', () => {
    const { encabezado, cuerpo } = separarMdx(RAW);
    expect(encabezado + cuerpo).toBe(RAW);
  });

  it('el encabezado incluye los dos delimitadores y nada más', () => {
    const { encabezado } = separarMdx(RAW);
    expect(encabezado.startsWith('---\n')).toBe(true);
    expect(encabezado.trimEnd().endsWith('---')).toBe(true);
    expect(encabezado).toContain('slug: una-leccion');
    expect(encabezado).not.toContain('## Cuerpo');
  });

  it('un archivo sin frontmatter es todo cuerpo', () => {
    expect(separarMdx('## Sólo cuerpo')).toEqual({ encabezado: '', cuerpo: '## Sólo cuerpo' });
  });

  it('un frontmatter sin cerrar no se parte: es todo cuerpo', () => {
    const roto = '---\nslug: x\n';
    expect(separarMdx(roto)).toEqual({ encabezado: '', cuerpo: roto });
  });
});
```

Run: `pnpm --filter @v2/shared exec vitest run tests/mdx.test.ts`
Expected: FAIL — no existe `../src/content/mdx`.

- [ ] **Step 3c: Write the module**

```ts
// packages/shared/src/content/mdx.ts
/**
 * Partir un .mdx en frontmatter crudo y cuerpo.
 *
 * Para LEER frontmatter validado está `loadContentDir` (gray-matter + Zod).
 * Esto es para ESCRIBIR: los scripts que reescriben cuerpos necesitan el
 * frontmatter como texto intacto, byte por byte. De ahí el invariante
 * `encabezado + cuerpo === raw`, que el test fija.
 */

export interface MdxPartido {
  /** Frontmatter crudo, delimitadores incluidos. Cadena vacía si no hay. */
  encabezado: string;
  cuerpo: string;
}

export function separarMdx(raw: string): MdxPartido {
  if (!raw.startsWith('---')) return { encabezado: '', cuerpo: raw };
  const fin = raw.indexOf('\n---', 3);
  if (fin === -1) return { encabezado: '', cuerpo: raw };
  const corte = fin + 4;
  return { encabezado: raw.slice(0, corte), cuerpo: raw.slice(corte) };
}
```

- [ ] **Step 4: Export both**

En `packages/shared/src/content/index.ts`, agregar junto a los otros re-exports — **con extensión `.js`**, como los que ya están:

```ts
export * from './lectura.js';
export * from './mdx.js';
```

- [ ] **Step 5: Run the tests**

Run: `pnpm --filter @v2/shared exec vitest run tests/lectura.test.ts tests/mdx.test.ts`
Expected: PASS — 6 + 4 tests.

- [ ] **Step 6: Sacar las dos copias**

En `scripts/content/migrate-blog-v1-to-v2.ts`, reemplazar el cuerpo de la función que hoy hace `return Math.max(1, Math.ceil(words / 220));` por una llamada a `minutosDeLectura(words)`, agregando el import:

```ts
import { minutosDeLectura } from '@v2/shared';
```

Lo mismo en `scripts/content/migrate-ensayos-v1-to-v2.ts:251`.

- [ ] **Step 7: Verificar que nada se movió**

Run: `pnpm type-check && pnpm test:scripts`
Expected: PASS. Los dos migradores ya corrieron; el cambio es de forma, y si algún test de scripts compara minutos, sigue dando el mismo número porque la fórmula es idéntica.

- [ ] **Step 8: Commit**

```bash
git add v2/packages/shared/src/content/lectura.ts v2/packages/shared/src/content/mdx.ts v2/packages/shared/tests/lectura.test.ts v2/packages/shared/tests/mdx.test.ts v2/packages/shared/src/content/index.ts v2/scripts/content/migrate-blog-v1-to-v2.ts v2/scripts/content/migrate-ensayos-v1-to-v2.ts
git commit -m "refactor(v2): dos primitivas compartidas — minutos de lectura y partir un mdx"
```

---

## Tarea 2: El detector de la cola generada

**Files:**
- Create: `packages/shared/src/content/cola-generada.ts`
- Create: `packages/shared/tests/cola-generada.test.ts`
- Modify: `packages/shared/src/content/index.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `type MotivoCorte = 'sin-cola' | 'cola-limpia' | 'sin-huella' | 'cola-abierta'`, `interface Corte { motivo: MotivoCorte; indice: number | null; encabezados: string[] }`, `detectarCola(cuerpoSinFrontmatter: string): Corte`.

`indice` es la posición del carácter donde arranca la cola: `cuerpo.slice(0, corte.indice)` es el texto propio. Es `null` salvo cuando `motivo === 'cola-limpia'` — sólo ese caso autoriza a borrar.

- [ ] **Step 1: Write the failing test**

```ts
// packages/shared/tests/cola-generada.test.ts
import { describe, expect, it } from 'vitest';

import { detectarCola } from '../src/content/cola-generada';

const GEN_A = `## Formalizarse

Texto propio del autor.

### Aplicación práctica

Guía práctica. Para que esta idea no quede en el plano conceptual, conviene traducirla a decisiones observables.

### Cómo se ve en el territorio

En Argentina, muchas discusiones se traban porque se habla desde consignas generales.

### Errores comunes

- Confundir el nombre del problema con su causa de fondo.

### Ejercicio guiado

1. Resume la idea central de la lección en dos frases propias.

### Idea fuerza

Cuando un aprendizaje se traduce en decisiones mejores, deja de ser información.`;

const GEN_B = `## El arte de convocar

Texto propio del autor.

## Aplicación práctica

La diferencia entre convocar y manipular. Cobra valor cuando lo conviertes en una decisión observable dentro de tu proyecto.

## Idea fuerza

El arte de convocar vale por su capacidad para mejorar decisiones reales.`;

describe('detectarCola', () => {
  it('corta la generación A y devuelve el texto propio', () => {
    const corte = detectarCola(GEN_A);
    expect(corte.motivo).toBe('cola-limpia');
    expect(GEN_A.slice(0, corte.indice ?? 0).trim().endsWith('Texto propio del autor.')).toBe(true);
    expect(corte.encabezados).toHaveLength(5);
  });

  it('corta la generación B, que usa ## y otro texto', () => {
    const corte = detectarCola(GEN_B);
    expect(corte.motivo).toBe('cola-limpia');
    expect(corte.encabezados).toEqual(['Aplicación práctica', 'Idea fuerza']);
  });

  it('no toca una lección sin cola', () => {
    const corte = detectarCola('## Título\n\nSólo prosa.');
    expect(corte).toEqual({ motivo: 'sin-cola', indice: null, encabezados: [] });
  });

  it('no toca las secciones del autor con nombre parecido', () => {
    const propio = '## Bucles\n\nProsa.\n\n### Ejercicio: Mapear Bucles\n\n1. Dibujá tu bucle.';
    expect(detectarCola(propio).motivo).toBe('sin-cola');
  });

  it('no corta cuando el encabezado coincide pero el párrafo no tiene huella', () => {
    const ajeno = '## Monotributo\n\nProsa.\n\n### Errores comunes\n\n- No recategorizarse cada seis meses.';
    expect(detectarCola(ajeno).motivo).toBe('sin-huella');
  });

  it('no corta cuando después de la cola aparece contenido ajeno', () => {
    const mezclado = `${GEN_A}\n\n## Un cierre del autor\n\nEsto lo escribió alguien.`;
    expect(detectarCola(mezclado).motivo).toBe('cola-abierta');
  });

  it('corta cuando la huella está en una sección posterior de la cola, no en la primera', () => {
    // Caso real: a la primera sección se le corrió una palabra («dos o tres
    // frases» en vez de «dos frases»), y la huella textual está dos secciones
    // más abajo. Con la ventana pegada a la primera sección, esto no se cortaba.
    const corrido = `## Cooperativas

Texto propio del autor.

## Ejercicio guiado

1. Resume la idea central de la lección en dos o tres frases propias.

## Idea fuerza

Cooperativas de consumo vale por su capacidad para mejorar decisiones reales.`;
    const corte = detectarCola(corrido);
    expect(corte.motivo).toBe('cola-limpia');
    expect(corrido.slice(0, corte.indice ?? 0).trim().endsWith('Texto propio del autor.')).toBe(true);
  });

  it('un encabezado de cola temprano con cola abierta no tapa la cola real de más abajo', () => {
    // Caso real de teoria-juegos: un «Errores comunes» de otro bloque aparece
    // antes que la cola verdadera. Quedándose con el primer candidato, el
    // archivo entero se declaraba sin-huella y la cola real no se veía nunca.
    const dosBloques = `## Módulo 4

Texto propio.

### Errores comunes

- Un error que escribió el autor.

### Sección propia del autor

Prosa del autor.

### Aplicación práctica

Para que esta idea no quede en el plano conceptual, conviene traducirla a decisiones observables.

### Idea fuerza

Cuando un aprendizaje se traduce en decisiones mejores, deja de ser información.`;
    const corte = detectarCola(dosBloques);
    expect(corte.motivo).toBe('cola-limpia');
    expect(corte.encabezados).toEqual(['Aplicación práctica', 'Idea fuerza']);
    expect(dosBloques.slice(0, corte.indice ?? 0)).toContain('Prosa del autor.');
  });

  it('reconoce la tercera generación, la de teoria-juegos', () => {
    const genC = `## Coordinación

Texto propio del autor.

### Aplicación argentina

La utilidad real del contenido aparece cuando lo llevas a decisiones concretas en Argentina.

### Errores comunes

- Quedarse con el concepto técnico y no traducirlo a decisiones observables.

### Ejercicio de aplicación

1. Elegí un caso.

### Cierre

La prueba de esta lección no está en repetir su vocabulario.`;
    const corte = detectarCola(genC);
    expect(corte.motivo).toBe('cola-limpia');
    expect(corte.encabezados).toEqual([
      'Aplicación argentina',
      'Errores comunes',
      'Ejercicio de aplicación',
      'Cierre',
    ]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @v2/shared exec vitest run tests/cola-generada.test.ts`
Expected: FAIL — no existe el módulo.

- [ ] **Step 3: Write the module**

```ts
// packages/shared/src/content/cola-generada.ts
/**
 * La cola generada en v1 — su detector.
 *
 * 320 de las 329 lecciones terminan con las mismas secciones, en TRES
 * generaciones distintas (medido 2026-08-12). El corte exige TRES anclas
 * simultáneas, porque hay 168 encabezados del autor con nombres parecidos y
 * algunas de esas secciones son lo mejor del corpus:
 *
 *   1. el encabezado es uno de la lista, exacto y solo en su línea;
 *   2. la cola candidata contiene una huella conocida, en cualquiera de sus
 *      secciones;
 *   3. de ahí al final del archivo, todo encabezado pertenece a la lista.
 *
 * Y se prueban todos los candidatos, no sólo el primero: un encabezado de cola
 * temprano perteneciente a otro bloque no puede tapar la cola real.
 *
 * Sólo `cola-limpia` autoriza a borrar. Todo lo demás va a revisión humana.
 */

export const ENCABEZADOS_COLA = [
  // generaciones A y B
  'Aplicación práctica',
  'Cómo se ve en el territorio',
  'Errores comunes',
  'Ejercicio guiado',
  'Idea fuerza',
  // generación C — 7 lecciones de `teoria-juegos-argentina-hombre-gris`, y estos
  // tres encabezados no aparecen en NINGUNA otra lección del corpus (verificado
  // 2026-08-12). `Cierre` es genérico, así que su seguridad la dan las otras dos
  // anclas, no su nombre.
  'Aplicación argentina',
  'Ejercicio de aplicación',
  'Cierre',
] as const;

/**
 * Arranques verbatim de las tres generaciones. Basta que la cola candidata
 * contenga uno — en cualquiera de sus secciones, no sólo en la primera: hay
 * lecciones donde a la primera sección se le corrió una palabra («dos o tres
 * frases propias» en vez de «dos frases propias») y la huella textual aparece
 * dos secciones más abajo.
 */
export const HUELLAS = [
  // generación A (205 lecciones)
  'Para que esta idea no quede en el plano conceptual',
  'En términos operativos, este contenido sirve',
  'muchas discusiones se traban porque se habla desde consignas',
  'Confundir el nombre del problema con su causa de fondo',
  'Resume la idea central de la lección en dos frases propias',
  'Cuando un aprendizaje se traduce en decisiones mejores',
  // generación B (108 lecciones)
  'Cobra valor cuando lo conviertes en una decisión observable',
  'El objetivo no es repetir una definición',
  'Busca un caso cercano donde este principio te permita ver algo',
  'vale por su capacidad para mejorar decisiones reales',
  'deja de ser información suelta y se convierte en capacidad acumulable',
  // generación C (7 lecciones, 3.000 palabras, «Cierre» idéntico en las 7)
  'La utilidad real del contenido aparece cuando lo llevas a decisiones concretas en Argentina',
  'Quedarse con el concepto técnico y no traducirlo a decisiones observables',
  'La prueba de esta lección no está en repetir su vocabulario',
] as const;

export type MotivoCorte = 'sin-cola' | 'cola-limpia' | 'sin-huella' | 'cola-abierta';

export interface Corte {
  motivo: MotivoCorte;
  /** Posición del carácter donde arranca la cola. Sólo con `cola-limpia`. */
  indice: number | null;
  /** Encabezados de cola encontrados, en orden. */
  encabezados: string[];
}

interface Encabezado {
  indice: number;
  nivel: number;
  texto: string;
}

function encabezados(cuerpo: string): Encabezado[] {
  const encontrados: Encabezado[] = [];
  const re = /^(#{1,6}) *(.+?) *$/gm;
  let m: RegExpExecArray | null;
  while ((m = re.exec(cuerpo)) !== null) {
    // Las dos guardas son por `noUncheckedIndexedAccess`: el regex garantiza los
    // dos grupos, el compilador no.
    const numerales = m[1];
    const texto = m[2];
    if (numerales === undefined || texto === undefined) continue;
    encontrados.push({ indice: m.index, nivel: numerales.length, texto });
  }
  return encontrados;
}

const esDeCola = (texto: string): boolean =>
  (ENCABEZADOS_COLA as readonly string[]).includes(texto);

export function detectarCola(cuerpoSinFrontmatter: string): Corte {
  const todos = encabezados(cuerpoSinFrontmatter);
  const candidatos = todos.flatMap((h, i) => (esDeCola(h.texto) ? [i] : []));
  if (candidatos.length === 0) return { motivo: 'sin-cola', indice: null, encabezados: [] };

  // Se prueban TODOS los candidatos, de arriba hacia abajo. Quedarse con el
  // primero y no reintentar hacía que un encabezado de cola temprano —de otro
  // bloque, con su propia cola abierta— tapara la cola real que venía después.
  let motivoFinal: MotivoCorte = 'sin-huella';
  let encabezadosFinal: string[] = [];

  for (const i of candidatos) {
    const arranque = todos[i];
    if (arranque === undefined) continue;
    const desdeElCorte = todos.slice(i);
    const textos = desdeElCorte.map((h) => h.texto);

    // Ancla 3 primero: si de acá al final hay un encabezado ajeno, este
    // candidato no es el arranque de la cola. Se prueba el siguiente.
    if (desdeElCorte.some((h) => !esDeCola(h.texto))) {
      motivoFinal = 'cola-abierta';
      encabezadosFinal = textos;
      continue;
    }

    // Ancla 2: la huella, en cualquier parte de la cola candidata.
    const cola = cuerpoSinFrontmatter.slice(arranque.indice);
    if (!HUELLAS.some((h) => cola.includes(h))) {
      motivoFinal = 'sin-huella';
      encabezadosFinal = textos;
      continue;
    }

    return { motivo: 'cola-limpia', indice: arranque.indice, encabezados: textos };
  }

  // Ningún candidato pasó. Se reporta el motivo del último evaluado: es el más
  // cercano al final del archivo y por lo tanto el más informativo para quien
  // lo revise a mano.
  return { motivo: motivoFinal, indice: null, encabezados: encabezadosFinal };
}
```

- [ ] **Step 4: Export it and run the tests**

Agregar `export * from './cola-generada.js';` en `packages/shared/src/content/index.ts`.

Run: `pnpm --filter @v2/shared exec vitest run tests/cola-generada.test.ts`
Expected: PASS — 9 tests.

- [ ] **Step 4b: Medir el corpus real y no ajustar los números para que cuadren**

Los fixtures son maquetas cortas; el corpus es el juez. Correr el detector sobre las 329 lecciones y contar por motivo.

Expected: **320 `cola-limpia`, 9 `sin-cola`, 0 `sin-huella`, 0 `cola-abierta`.** Los 320 son los que la spec midió por otro camino (§1), así que las dos mediciones tienen que coincidir.

Si `sin-huella` o `cola-abierta` dan algo distinto de 0, **no toques las listas para que cierre**: reportá los conteos y las lecciones, porque significa que hay una cuarta generación o un encabezado del autor que nadie vio, y eso lo decide una persona.

- [ ] **Step 5: Commit**

```bash
git add v2/packages/shared/src/content/cola-generada.ts v2/packages/shared/tests/cola-generada.test.ts v2/packages/shared/src/content/index.ts
git commit -m "feat(v2): detector de la cola generada, con las tres anclas del corte"
```

---

## Tarea 3: El reporte, antes de tocar un archivo

Nada se borra sin una foto previa revisada. Este script no escribe en `content/`.

**Files:**
- Create: `scripts/content/entrenamientos-reporte.ts`
- Create: `scripts/content/__tests__/entrenamientos-reporte.test.ts`
- Modify: `package.json` (script `entrenamientos:reporte`)

**Interfaces:**
- Consumes: `detectarCola`, `contarPalabrasRenderizables`, `minutosDeLectura`, `separarMdx`, `derivarSlugDeLeccion` de `@v2/shared`.
- Produces:
  - `interface FilaReporte { curso: string; leccion: string; palabrasPropias: number; palabrasCola: number; motivo: MotivoCorte; minutosDeclarados: number; minutosReales: number }` — una fila es un archivo que se leyó de verdad.
  - `interface Anomalia { curso: string; leccion: string; clase: 'declarada-sin-archivo' | 'archivo-sin-declarar' }`
  - `interface Relevamiento { filas: FilaReporte[]; anomalias: Anomalia[] }`
  - `relevarCorpus(raiz: string): Relevamiento`, y el archivo `docs/reportes/2026-08-12-entrenamientos-inventario.md`.

  **Por qué las anomalías son parte del contrato y no un extra.** Si el relevamiento
  enumera sólo los `.mdx` del disco, una lección declarada en `course.json` cuyo archivo
  no existe **desaparece de la foto sin dejar rastro**: no hay fila, no hay aviso, y los
  totales cierran igual. Para una foto cuyo único trabajo es ser auditable antes de un
  borrado de 320 archivos, ese es justo el desvío que no puede pasar desapercibido. Hoy
  el corpus calza 1:1 en los 31 cursos (329 = 329, verificado), así que la lista va a
  salir vacía — y el reporte lo dice con letras, que es distinto de no decir nada.

- [ ] **Step 1: Write the failing test**

```ts
// scripts/content/__tests__/entrenamientos-reporte.test.ts
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { relevarCorpus } from '../entrenamientos-reporte';

const CON_COLA = `Cuatro palabras propias acá.

### Idea fuerza

Cuando un aprendizaje se traduce en decisiones mejores, deja de ser información.`;

const frontmatter = (slug: string): string =>
  `---\nslug: ${slug}\ncourseSlug: curso-uno\ntitle: Lección\norderIndex: 1\nestimatedMinutes: 9\n---\n\n`;

/**
 * Corpus mínimo en un directorio temporal.
 * @param cuerpo El cuerpo de `leccion-uno.mdx`. Por defecto, uno con cola.
 * @param opciones `declararDeMas` agrega una entrada a course.json sin archivo;
 *   `archivoDeMas` agrega un archivo que course.json no declara.
 */
function corpusDePrueba(
  cuerpo: string = CON_COLA,
  opciones: { declararDeMas?: string; archivoDeMas?: string } = {},
): string {
  const raiz = mkdtempSync(join(tmpdir(), 'entrenamientos-'));
  const curso = join(raiz, 'content', 'courses', 'curso-uno');
  mkdirSync(curso, { recursive: true });

  const lessons = [{ key: '01-leccion-uno', title: 'Lección uno', duration: 9, orderIndex: 1 }];
  if (opciones.declararDeMas !== undefined) {
    lessons.push({ key: `02-${opciones.declararDeMas}`, title: 'Fantasma', duration: 9, orderIndex: 2 });
  }
  writeFileSync(join(curso, 'course.json'), JSON.stringify({ slug: 'curso-uno', lessons }));
  writeFileSync(join(curso, 'leccion-uno.mdx'), frontmatter('leccion-uno') + cuerpo);
  if (opciones.archivoDeMas !== undefined) {
    writeFileSync(
      join(curso, `${opciones.archivoDeMas}.mdx`),
      frontmatter(opciones.archivoDeMas) + cuerpo,
    );
  }
  return raiz;
}

describe('relevarCorpus', () => {
  it('separa palabras propias de palabras de cola y compara minutos', () => {
    const { filas } = relevarCorpus(corpusDePrueba());
    expect(filas).toHaveLength(1);
    expect(filas[0]).toMatchObject({
      curso: 'curso-uno',
      leccion: 'leccion-uno',
      palabrasPropias: 4,
      motivo: 'cola-limpia',
      minutosDeclarados: 9,
      minutosReales: 1,
    });
    expect(filas[0]?.palabrasCola).toBeGreaterThan(10);
  });

  it('una lección sin cola cuenta TODO su cuerpo como propio', () => {
    // La rama `corte.indice === null`. Sin este test, un cambio que colapse el
    // ternario a `cuerpo.slice(0, corte.indice)` daría `slice(0, null)` → '' → 0
    // palabras para las 9 lecciones sin cola del corpus, y la suite pasaría igual.
    const raiz = corpusDePrueba('Cuatro palabras propias acá.');
    const { filas } = relevarCorpus(raiz);
    expect(filas[0]).toMatchObject({ motivo: 'sin-cola', palabrasPropias: 4, palabrasCola: 0 });
  });

  it('no reporta anomalías cuando el índice y el disco se corresponden', () => {
    expect(relevarCorpus(corpusDePrueba()).anomalias).toEqual([]);
  });

  it('reporta la lección declarada en course.json cuyo archivo no existe', () => {
    const raiz = corpusDePrueba(undefined, { declararDeMas: 'leccion-fantasma' });
    expect(relevarCorpus(raiz).anomalias).toEqual([
      { curso: 'curso-uno', leccion: 'leccion-fantasma', clase: 'declarada-sin-archivo' },
    ]);
  });

  it('reporta el archivo que está en el disco y no en course.json', () => {
    const raiz = corpusDePrueba(undefined, { archivoDeMas: 'leccion-huerfana' });
    expect(relevarCorpus(raiz).anomalias).toEqual([
      { curso: 'curso-uno', leccion: 'leccion-huerfana', clase: 'archivo-sin-declarar' },
    ]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --config scripts/vitest.config.ts scripts/content/__tests__/entrenamientos-reporte.test.ts`
Expected: FAIL — no existe `entrenamientos-reporte`.

- [ ] **Step 3: Write the script**

```ts
// scripts/content/entrenamientos-reporte.ts
/**
 * Foto del corpus de entrenamientos. NO escribe en content/.
 *
 * Es el paso previo obligatorio de cada script que sí edita: el reporte se
 * commitea y se revisa a ojo antes de autorizar un borrado masivo.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  contarPalabrasRenderizables,
  derivarSlugDeLeccion,
  detectarCola,
  minutosDeLectura,
  separarMdx,
  type MotivoCorte,
} from '@v2/shared';

export interface FilaReporte {
  curso: string;
  leccion: string;
  palabrasPropias: number;
  palabrasCola: number;
  motivo: MotivoCorte;
  minutosDeclarados: number;
  minutosReales: number;
}

export interface Anomalia {
  curso: string;
  leccion: string;
  clase: 'declarada-sin-archivo' | 'archivo-sin-declarar';
}

export interface Relevamiento {
  filas: FilaReporte[];
  anomalias: Anomalia[];
}

export function relevarCorpus(raiz: string): Relevamiento {
  const dir = resolve(raiz, 'content/courses');
  const filas: FilaReporte[] = [];
  const anomalias: Anomalia[] = [];

  for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const cursoDir = join(dir, curso.name);
    const indice = JSON.parse(readFileSync(join(cursoDir, 'course.json'), 'utf-8')) as {
      lessons: { key: string; duration: number }[];
    };
    const declarados = new Map(
      indice.lessons.map((l) => [derivarSlugDeLeccion(l.key), l.duration] as const),
    );
    const enDisco = new Set<string>();

    for (const archivo of readdirSync(cursoDir).filter((f) => f.endsWith('.mdx'))) {
      const { cuerpo } = separarMdx(readFileSync(join(cursoDir, archivo), 'utf-8'));
      const corte = detectarCola(cuerpo);
      const propio = corte.indice === null ? cuerpo : cuerpo.slice(0, corte.indice);
      const palabrasPropias = contarPalabrasRenderizables(propio);
      const leccion = basename(archivo, '.mdx');
      enDisco.add(leccion);
      if (!declarados.has(leccion)) {
        anomalias.push({ curso: curso.name, leccion, clase: 'archivo-sin-declarar' });
      }
      filas.push({
        curso: curso.name,
        leccion,
        palabrasPropias,
        palabrasCola: contarPalabrasRenderizables(cuerpo) - palabrasPropias,
        motivo: corte.motivo,
        minutosDeclarados: declarados.get(leccion) ?? 0,
        minutosReales: minutosDeLectura(palabrasPropias),
      });
    }

    // Al revés: lo que el índice declara y en el disco no está. Sin esto, una
    // lección declarada sin archivo desaparece de la foto sin dejar rastro.
    for (const leccion of declarados.keys()) {
      if (!enDisco.has(leccion)) {
        anomalias.push({ curso: curso.name, leccion, clase: 'declarada-sin-archivo' });
      }
    }
  }

  const porNombre = (a: { curso: string; leccion: string }, b: { curso: string; leccion: string }): number =>
    a.curso.localeCompare(b.curso) || a.leccion.localeCompare(b.leccion);
  return { filas: filas.sort(porNombre), anomalias: anomalias.sort(porNombre) };
}

function markdown({ filas, anomalias }: Relevamiento): string {
  const suma = (f: (x: FilaReporte) => number): number => filas.reduce((n, x) => n + f(x), 0);
  const porMotivo = new Map<MotivoCorte, number>();
  for (const f of filas) porMotivo.set(f.motivo, (porMotivo.get(f.motivo) ?? 0) + 1);

  const cabecera = [
    '# Inventario del corpus de entrenamientos',
    '',
    `**Generado:** ${new Date().toISOString().slice(0, 10)} por \`pnpm entrenamientos:reporte\``,
    '',
    `- Lecciones: **${filas.length}**`,
    `- Palabras propias: **${suma((f) => f.palabrasPropias)}**`,
    `- Palabras de cola generada: **${suma((f) => f.palabrasCola)}**`,
    `- Minutos declarados: **${suma((f) => f.minutosDeclarados)}** · reales: **${suma((f) => f.minutosReales)}**`,
    '',
    '## Motivos de corte',
    '',
    ...[...porMotivo.entries()].map(([m, n]) => `- \`${m}\`: ${n}`),
    '',
    '> Sólo `cola-limpia` se borra automáticamente. `sin-huella` y `cola-abierta` van a mano.',
    '',
    '## Anomalías entre el índice y el disco',
    '',
    ...(anomalias.length === 0
      ? ['Ninguna: cada `.mdx` tiene su entrada en `course.json` y cada entrada su archivo.']
      : anomalias.map((a) => `- \`${a.clase}\`: ${a.curso}/${a.leccion}`)),
    '',
    '## Lección por lección',
    '',
    '| Curso | Lección | Propias | Cola | Motivo | Decl. | Real |',
    '|---|---|---|---|---|---|---|',
  ];
  const cuerpo = filas.map(
    (f) =>
      `| ${f.curso} | ${f.leccion} | ${f.palabrasPropias} | ${f.palabrasCola} | \`${f.motivo}\` | ${f.minutosDeclarados} | ${f.minutosReales} |`,
  );
  return [...cabecera, ...cuerpo, ''].join('\n');
}

if (process.argv[1]?.endsWith('entrenamientos-reporte.ts')) {
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const relevamiento = relevarCorpus(raiz);
  const salida = resolve(raiz, 'docs/reportes/2026-08-12-entrenamientos-inventario.md');
  writeFileSync(salida, markdown(relevamiento));
  process.stdout.write(
    `${String(relevamiento.filas.length)} lecciones relevadas, ${String(relevamiento.anomalias.length)} anomalías → ${salida}\n`,
  );
}
```

- [ ] **Step 4: Add the npm script**

En `package.json`, junto a `planes:check`:

```json
"entrenamientos:reporte": "tsx scripts/content/entrenamientos-reporte.ts",
```

- [ ] **Step 5: Run the test and then the real thing**

Run: `pnpm vitest run --config scripts/vitest.config.ts scripts/content/__tests__/entrenamientos-reporte.test.ts`
Expected: PASS.

Run: `mkdir -p docs/reportes && pnpm entrenamientos:reporte`
Expected: `329 lecciones relevadas → …/docs/reportes/2026-08-12-entrenamientos-inventario.md`

- [ ] **Step 6: Leer el reporte y confirmar los números de la spec**

Abrir el reporte y verificar contra la spec: 320 con cola (`cola-limpia` + los casos límite), ~106.900 palabras de cola, 3.163 minutos declarados contra ~957 reales. **Si los conteos de `sin-huella` o `cola-abierta` son mayores que 15, pará y revisá el detector antes de seguir.**

- [ ] **Step 7: Commit**

```bash
git add v2/scripts/content/entrenamientos-reporte.ts v2/scripts/content/__tests__/entrenamientos-reporte.test.ts v2/package.json v2/docs/reportes/2026-08-12-entrenamientos-inventario.md
git commit -m "feat(v2): reporte del corpus de entrenamientos, con el inventario de hoy commiteado"
```

---

## Tarea 4: El voseo, con dos listas

**Files:**
- Create: `packages/shared/src/content/voseo.ts`
- Create: `packages/shared/tests/voseo.test.ts`
- Create: `scripts/content/entrenamientos-voseo.ts`
- Modify: `packages/shared/src/content/index.ts`, `package.json`

**Interfaces:**
- Consumes: nada.
- Produces: `TUTEO_DURO: ReadonlyMap<string, string>`, `TUTEO_BLANDO: readonly string[]`, `interface Hallazgo { forma: string; indice: number; lista: 'dura' | 'blanda' }`, `detectarTuteo(texto: string): Hallazgo[]`, `normalizarVoseo(texto: string): { texto: string; cambios: number }`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/shared/tests/voseo.test.ts
import { describe, expect, it } from 'vitest';

import { detectarTuteo, normalizarVoseo } from '../src/content/voseo';

describe('normalizarVoseo', () => {
  it('reemplaza las formas duras conservando el caso inicial', () => {
    const { texto, cambios } = normalizarVoseo('Si tienes dudas, Puedes preguntar.');
    expect(texto).toBe('Si tenés dudas, Podés preguntar.');
    expect(cambios).toBe(2);
  });

  it('no toca el posesivo tu, que es igual en voseo', () => {
    expect(normalizarVoseo('tu municipio y tu provincia').texto).toBe('tu municipio y tu provincia');
  });

  it('no toca las formas blandas: las decide una persona', () => {
    expect(normalizarVoseo('el sistema define el resultado').cambios).toBe(0);
  });
});

describe('detectarTuteo', () => {
  it('separa hallazgos duros de blandos', () => {
    const hallazgos = detectarTuteo('Puedes elegir. Define una acción.');
    expect(hallazgos.filter((h) => h.lista === 'dura').map((h) => h.forma)).toEqual(['Puedes']);
    expect(hallazgos.filter((h) => h.lista === 'blanda').map((h) => h.forma)).toEqual(['Define']);
  });

  it('no marca un infinitivo que contiene una forma de la lista', () => {
    // «elegir» es infinitivo y no es tuteo; la lista blanda tiene «elige».
    // Si esto falla, el regex no está exigiendo límites de palabra completa.
    expect(detectarTuteo('Vas a elegir bien.')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @v2/shared exec vitest run tests/voseo.test.ts`
Expected: FAIL — no existe el módulo.

- [ ] **Step 3: Write the module**

```ts
// packages/shared/src/content/voseo.ts
/**
 * Tuteo → voseo. Dos listas, porque una sola rompe prosa correcta.
 *
 * Medido el 2026-08-12 sobre los cuerpos propios: 775 apariciones en 151
 * lecciones, y 90 lecciones mezclan tú y vos en el mismo texto.
 *
 * DURA: formas sin ambigüedad. Se reemplazan y la guardia las prohíbe.
 * BLANDA: dependen del contexto — `define` es imperativo en «Define una acción»
 * e indicativo en «el sistema define el resultado» (127 apariciones). Se
 * reportan; las decide una persona.
 * El posesivo `tu` NO entra en ninguna lista: es idéntico en voseo.
 */

export const TUTEO_DURO: ReadonlyMap<string, string> = new Map([
  ['tienes', 'tenés'],
  ['puedes', 'podés'],
  ['debes', 'debés'],
  ['quieres', 'querés'],
  ['sabes', 'sabés'],
  ['haces', 'hacés'],
  ['necesitas', 'necesitás'],
  ['sientes', 'sentís'],
  ['entiendes', 'entendés'],
  ['vives', 'vivís'],
  ['eres', 'sos'],
  ['estás tú', 'estás'],
  ['conviertes', 'convertís'],
  ['mejoras tu', 'mejorás tu'],
  ['separas', 'separás'],
  ['miras', 'mirás'],
  ['llévalo', 'llevalo'],
  ['conviértelo', 'convertilo'],
  ['asegúrate', 'asegurate'],
  ['pregúntate', 'preguntate'],
  ['hazlo', 'hacelo'],
  ['identifica', 'identificá'],
  ['resume', 'resumí'],
  ['analiza', 'analizá'],
  ['observa', 'observá'],
  ['imagina', 'imaginá'],
]);

// Ojo: acá no entra ninguna forma que sea igual en voseo. `pasabas`, `mirabas`,
// `tenías` y todo el imperfecto se escriben igual en las dos variedades: si se
// listaran, el reemplazo contaría un cambio que no cambia nada.

/** Formas cuyo reemplazo depende del contexto. Se reportan, no se tocan. */
export const TUTEO_BLANDO: readonly string[] = ['define', 'elige', 'recuerda', 'escribe', 'piensa'];

export interface Hallazgo {
  forma: string;
  indice: number;
  lista: 'dura' | 'blanda';
}

const patron = (formas: Iterable<string>): RegExp =>
  new RegExp(`(?<![\\p{L}])(${[...formas].join('|')})(?![\\p{L}])`, 'giu');

export function detectarTuteo(texto: string): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];
  for (const [lista, formas] of [
    ['dura', TUTEO_DURO.keys()],
    ['blanda', TUTEO_BLANDO],
  ] as const) {
    const re = patron(formas);
    let m: RegExpExecArray | null;
    while ((m = re.exec(texto)) !== null) {
      hallazgos.push({ forma: m[1], indice: m.index, lista });
    }
  }
  return hallazgos.sort((a, b) => a.indice - b.indice);
}

/** Reemplaza sólo la lista dura, conservando mayúscula inicial. */
export function normalizarVoseo(texto: string): { texto: string; cambios: number } {
  let cambios = 0;
  const salida = texto.replace(patron(TUTEO_DURO.keys()), (encontrado) => {
    const reemplazo = TUTEO_DURO.get(encontrado.toLowerCase());
    if (reemplazo === undefined) return encontrado;
    cambios += 1;
    const esMayuscula = encontrado[0] === encontrado[0].toUpperCase();
    return esMayuscula ? reemplazo[0].toUpperCase() + reemplazo.slice(1) : reemplazo;
  });
  return { texto: salida, cambios };
}
```

- [ ] **Step 4: Export it and run the tests**

Agregar `export * from './voseo.js';` en `index.ts`.

Run: `pnpm --filter @v2/shared exec vitest run tests/voseo.test.ts`
Expected: PASS.

- [ ] **Step 5: El script que aplica la dura y reporta la blanda**

```ts
// scripts/content/entrenamientos-voseo.ts
/** Aplica la lista dura de voseo a los cuerpos y reporta la blanda. No toca frontmatter. */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { detectarTuteo, normalizarVoseo, separarMdx } from '@v2/shared';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = resolve(raiz, 'content/courses');
let archivos = 0;
let cambios = 0;
const blandos: string[] = [];

for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const cursoDir = join(dir, curso.name);
  for (const archivo of readdirSync(cursoDir).filter((f) => f.endsWith('.mdx'))) {
    const ruta = join(cursoDir, archivo);
    const { encabezado, cuerpo } = separarMdx(readFileSync(ruta, 'utf-8'));
    const { texto, cambios: n } = normalizarVoseo(cuerpo);
    if (n > 0) {
      writeFileSync(ruta, encabezado + texto);
      archivos += 1;
      cambios += n;
    }
    for (const h of detectarTuteo(texto).filter((x) => x.lista === 'blanda')) {
      blandos.push(`${curso.name}/${archivo}: ${h.forma}`);
    }
  }
}

process.stdout.write(`voseo: ${String(cambios)} reemplazos en ${String(archivos)} archivos\n`);
process.stdout.write(`lista blanda para revisar a mano: ${String(blandos.length)} casos\n`);
writeFileSync(resolve(raiz, 'docs/reportes/2026-08-13-entrenamientos-voseo-blando.txt'), `${blandos.join('\n')}\n`);
```

Agregar a `package.json`: `"entrenamientos:voseo": "tsx scripts/content/entrenamientos-voseo.ts",`

- [ ] **Step 6: Correr y revisar el diff**

Run: `pnpm entrenamientos:voseo && git diff --stat v2/content/courses | tail -3`
Expected: ~150 archivos tocados. **Leer el diff de tres lecciones al azar** antes de commitear: si algún reemplazo quedó raro en medio de una cita textual, se corrige a mano en este commit.

- [ ] **Step 7: Commit**

```bash
git add v2/packages/shared/src/content/voseo.ts v2/packages/shared/tests/voseo.test.ts v2/packages/shared/src/content/index.ts v2/scripts/content/entrenamientos-voseo.ts v2/package.json v2/content/courses v2/docs/reportes/2026-08-13-entrenamientos-voseo-blando.txt
git commit -m "fix(v2): las lecciones hablan en rioplatense, no en tuteo neutro"
```

---

## Tarea 5: Borrar la cola

**Files:**
- Create: `scripts/content/entrenamientos-borrar-cola.ts`
- Modify: `package.json`, los 320 `.mdx` con cola

**Interfaces:**
- Consumes: `detectarCola` (Tarea 2), el reporte de la Tarea 3 ya revisado.
- Produces: nada de código. Deja `docs/reportes/2026-08-13-entrenamientos-cola-a-mano.txt` con los casos que no cumplen las tres anclas — **y sólo si hay alguno**: un archivo con un `\n` adentro miente sobre lo que se revisó.

**Medido el 2026-08-13, sobre el árbol exacto en el que va a correr esto** (después del voseo de la Tarea 4, que no cambió ninguna cuenta de palabras porque sus 1.182 sustituciones son 1:1): 320 lecciones a cortar, **106.893** palabras de cola, **174.073** palabras propias que quedan, **0** casos a revisar a mano. Las cinco lecciones que quedan más cortas terminan entre 197 y 213 palabras propias, y el mínimo de texto propio conservado en los 320 cortes es del **23%**. Que una lección quede en 197 palabras no es un error de esta tarea: es el tamaño real de lo que había abajo del relleno, y crecerlas es el trabajo de las Tareas 7, 13 y 14.

- [ ] **Step 1: Write the script**

```ts
// scripts/content/entrenamientos-borrar-cola.ts
/**
 * Borra la cola generada — sólo donde el corte es `cola-limpia`.
 *
 * Los demás motivos se listan para revisión humana: el detector se niega a
 * adivinar, y 168 encabezados del autor tienen nombres parecidos.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { contarPalabrasRenderizables, detectarCola, separarMdx } from '@v2/shared';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = resolve(raiz, 'content/courses');
let tocados = 0;
let borradas = 0;
const aMano: string[] = [];

for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const cursoDir = join(dir, curso.name);
  for (const archivo of readdirSync(cursoDir).filter((f) => f.endsWith('.mdx'))) {
    const ruta = join(cursoDir, archivo);
    const { encabezado, cuerpo } = separarMdx(readFileSync(ruta, 'utf-8'));
    const resultado = detectarCola(cuerpo);

    if (resultado.motivo === 'cola-limpia' && resultado.indice !== null) {
      const propio = cuerpo.slice(0, resultado.indice);
      // Una lección que es toda cola dejaría un cuerpo vacío. No existe en el
      // corpus de hoy (el mínimo conservado es 23%), pero esto reescribe 320
      // archivos publicados: si aparece, va a revisión y no se toca.
      if (propio.trim() === '') {
        aMano.push(`cuerpo-quedaria-vacio\t${curso.name}/${archivo}\t${resultado.encabezados.join(' · ')}`);
        continue;
      }
      borradas += contarPalabrasRenderizables(cuerpo) - contarPalabrasRenderizables(propio);
      writeFileSync(ruta, `${encabezado}${propio.trimEnd()}\n`);
      tocados += 1;
    } else if (resultado.motivo !== 'sin-cola') {
      aMano.push(`${resultado.motivo}\t${curso.name}/${archivo}\t${resultado.encabezados.join(' · ')}`);
    }
  }
}

if (aMano.length > 0) {
  writeFileSync(resolve(raiz, 'docs/reportes/2026-08-13-entrenamientos-cola-a-mano.txt'), `${aMano.join('\n')}\n`);
}
process.stdout.write(`cola borrada en ${String(tocados)} lecciones — ${String(borradas)} palabras\n`);
process.stdout.write(
  aMano.length === 0
    ? 'a revisar a mano: ninguna. Las 320 cumplieron las tres anclas.\n'
    : `a revisar a mano: ${String(aMano.length)} — ver docs/reportes/2026-08-13-entrenamientos-cola-a-mano.txt\n`,
);
```

Agregar a `package.json`: `"entrenamientos:borrar-cola": "tsx scripts/content/entrenamientos-borrar-cola.ts",`

- [ ] **Step 2: Correr y verificar el orden de magnitud**

Run: `pnpm entrenamientos:borrar-cola`
Expected, exacto: `cola borrada en 320 lecciones — 106893 palabras` y `a revisar a mano: ninguna`.

**Si alguno de los tres números no da exacto, pará y reportá.** No es una tolerancia de orden de magnitud: los tres se midieron el 2026-08-13 sobre este mismo árbol, corriendo `detectarCola` y `contarPalabrasRenderizables` tal como los va a correr el script. Cualquier diferencia significa que el detector cambió de comportamiento, y borrar 106.893 palabras con un detector que se movió no se arregla después.

Ojo con qué se está contando: son **palabras renderizables** (`contarPalabrasRenderizables`), no tokens separados por espacios. La diferencia sobre el corpus entero es de **9.914 tokens** —`##`, viñetas, `>`, y los datos de path de los 13 SVG— y es la razón de que la cifra de este plan no coincida con un `wc -w`.

- [ ] **Step 3: Revisar el diff de tres lecciones y las que quedaron a mano**

Run: `git diff v2/content/courses/como-funciona-argentina-anatomia-estado/el-estado-argentino-la-maquina-que-nadie-te-explico.mdx`
Expected: se van las cinco secciones y **queda** todo lo anterior, terminando en la cita del pasajero del subte.

La medición del 2026-08-13 dice que no va a quedar ningún caso a mano, así que ese archivo no debería ni existir después de la corrida. Si existe, abrirlo y resolver cada caso en este mismo commit: si es cola, se borra; si es del autor, se deja y se anota por qué.

Y **leer el diff de tres lecciones más, elegidas a propósito y no al azar**: las dos que quedan más cortas (`sobrevivir-prosperar-economia-argentina/herramientas-digitales-de-gestion-financiera.mdx`, que queda en 197 palabras, y `como-funciona-argentina-anatomia-estado/tu-mapa-del-poder-diagnostico-de-tu-territorio.mdx`, en 202) y una de las siete de `teoria-juegos` donde la generación C tapaba a la A. Las cortas son donde un corte de más se nota, y las de `teoria-juegos` son las que rompieron el detector en la Tarea 2.

El muestreo al azar ya falló una vez en este ciclo: en la Tarea 4 las tres lecciones que se leyeron cayeron las tres dentro de la cola generada —era el 78% del diff— y los dos defectos reales estaban en el otro 22%.

- [ ] **Step 4: Confirmar el nuevo total**

Run: `pnpm entrenamientos:reporte && head -12 docs/reportes/2026-08-12-entrenamientos-inventario.md`
Expected: palabras de cola ≈ 0; palabras propias ≈ 174.073.

- [ ] **Step 5: Commit — lo hace el orquestador, no el agente**

Las rutas, para stagear explícitas. `package.json` va **por hunk** (`git add -p`): lo editan varias sesiones a la vez y un `git add` completo se lleva puesto lo ajeno (D-010, ya pasó dos veces en este ciclo).

```bash
git add v2/scripts/content/entrenamientos-borrar-cola.ts v2/content/courses v2/docs/reportes
git add -p v2/package.json
git commit -m "fix(v2): mueren las 106.893 palabras de relleno generado en los entrenamientos"
```

`v2/docs/reportes` va en la lista y no es opcional: el Step 4 regenera el inventario, y commitear sin él deja en `main` un reporte que declara 106.893 palabras de cola para un corpus que tiene 0 — exactamente la clase de defecto que este ciclo existe para matar. (Una revisión anterior de este plan lo había dejado caer al apretar la regla del hunk de `package.json`; la revisión de la Tarea 5 lo cazó.)

---

## Tarea 6: El minutaje deja de ser inventado

**Files:**
- Create: `scripts/content/entrenamientos-minutaje.ts`
- Modify: `packages/shared/src/content/frontmatter.ts:148-157` (saca `estimatedMinutes`), los 31 `course.json`, los 329 frontmatters, `apps/web/src/lib/__tests__/courses-registry.test.ts`, `package.json`

**Interfaces:**
- Consumes: `contarPalabrasRenderizables`, `minutosDeLectura`.
- Produces: `recalcularMinutaje(raiz: string, opciones?: { escribir?: boolean }): { curso: string; leccion: string; antes: number; ahora: number }[]`.

**Medido el 2026-08-13, después del corte de la Tarea 5, sobre el árbol exacto donde va a correr esto:** 329 lecciones, los 329 slugs resuelven (`derivarSlugDeLeccion` se exporta desde `packages/shared/src/content/courses.ts:127`, no desde `slug.ts`), **3.163 minutos declarados** en los `course.json` —y la suma de los `course.duration` da exactamente lo mismo, así que el índice es internamente consistente— contra **957 minutos reales**. Factor de inflación **3,31×**. Después del recálculo quedan 8 lecciones de 329 en un minuto.

**Tres cosas verificadas que sacan riesgo de encima:**

1. **Los 31 `course.json` sobreviven el round-trip byte a byte.** `JSON.stringify(JSON.parse(raw), null, 2) + '\n'` devuelve los 31 archivos idénticos al original. O sea: el diff de este commit va a ser sólo los números de minutos. Si el diff de algún `course.json` muestra un reformateo, cambió otra cosa y hay que parar.
2. **`lessonFrontmatterSchema` es un `z.object` plano, no `.strict()`**, así que Zod **descarta** las claves desconocidas en silencio. Sacar `estimatedMinutes` del schema no puede romper el build ni aunque quedara en un archivo. El corolario incómodo: el schema tampoco lo *prohíbe* — quien lo vuelva a escribir no recibe error, sólo se le ignora. Lo que lo prohíbe de verdad es la guardia de la Tarea 12, y la Tarea 11 ya trae el test de este comportamiento (`rechaza estimatedMinutes: el minutaje vive en course.json`, que afirma que la clave no sobrevive al `parse`). No lo dupliques.
3. **`estimatedMinutes` no lo lee nadie en `apps/`** (grep sobre `apps/api/src` y `apps/web/src`: cero). Los 329 `.mdx` lo declaran y nadie lo consume.

**FUERA DE ALCANCE, y es una trampa para quien grepee el nombre:** `estimatedMinutes` existe además como **columna de base de datos** en `packages/db/src/schema/courses.ts:64` y `packages/db/src/schema/life-areas.ts:199` (`integer('estimated_minutes')`). No se toca ninguna de las dos. Son otra cosa —la tabla de cursos y la de áreas de vida—, y borrarlas pediría una migración. Esta tarea saca un campo de Zod del frontmatter, nada más.

- [ ] **Step 1: Write the script**

```ts
// scripts/content/entrenamientos-minutaje.ts
/**
 * Recalcula el minutaje de los entrenamientos desde el cuerpo real.
 *
 * Una sola sede: `course.json` — es lo que lee `courses-registry.ts:81`
 * (`minutos: l.duration`), porque el catálogo es eager y los cuerpos perezosos.
 * `estimatedMinutes` sale del frontmatter en este mismo paso.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  contarPalabrasRenderizables,
  derivarSlugDeLeccion,
  minutosDeLectura,
  separarMdx,
} from '@v2/shared';

export interface CambioMinutaje {
  curso: string;
  leccion: string;
  antes: number;
  ahora: number;
}

export function recalcularMinutaje(raiz: string, opciones: { escribir?: boolean } = {}): CambioMinutaje[] {
  const dir = resolve(raiz, 'content/courses');
  const cambios: CambioMinutaje[] = [];

  for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const cursoDir = join(dir, curso.name);
    const rutaIndice = join(cursoDir, 'course.json');
    const indice = JSON.parse(readFileSync(rutaIndice, 'utf-8')) as {
      duration: number;
      lessons: { key: string; duration: number }[];
    };

    for (const leccion of indice.lessons) {
      const slug = derivarSlugDeLeccion(leccion.key);
      const ruta = join(cursoDir, `${slug}.mdx`);
      const { encabezado, cuerpo } = separarMdx(readFileSync(ruta, 'utf-8'));
      const ahora = minutosDeLectura(contarPalabrasRenderizables(cuerpo));
      cambios.push({ curso: curso.name, leccion: slug, antes: leccion.duration, ahora });
      leccion.duration = ahora;

      if (opciones.escribir === true) {
        writeFileSync(ruta, encabezado.replace(/^estimatedMinutes:.*\n/m, '') + cuerpo);
      }
    }

    indice.duration = indice.lessons.reduce((n, l) => n + l.duration, 0);
    if (opciones.escribir === true) writeFileSync(rutaIndice, `${JSON.stringify(indice, null, 2)}\n`);
  }
  return cambios;
}

if (process.argv[1]?.endsWith('entrenamientos-minutaje.ts')) {
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const escribir = process.argv.includes('--escribir');
  const cambios = recalcularMinutaje(raiz, { escribir });
  const antes = cambios.reduce((n, c) => n + c.antes, 0);
  const ahora = cambios.reduce((n, c) => n + c.ahora, 0);
  process.stdout.write(
    `${escribir ? 'escrito' : 'simulacro'}: ${String(antes)} min declarados → ${String(ahora)} min reales (${String(cambios.length)} lecciones)\n`,
  );
}
```

Agregar a `package.json`: `"entrenamientos:minutaje": "tsx scripts/content/entrenamientos-minutaje.ts",`

- [ ] **Step 2: Simulacro primero**

Run: `pnpm entrenamientos:minutaje`
Expected, exacto: `simulacro: 3163 min declarados → 957 min reales (329 lecciones)`.

**Si los dos números no dan exactos, pará y reportá antes de escribir nada.** Se midieron el 2026-08-13 sobre este mismo árbol con las mismas funciones que usa el script. El simulacro existe justamente para que una diferencia se vea antes de tocar 360 archivos.

- [ ] **Step 3: Escribir**

Run: `pnpm entrenamientos:minutaje --escribir`
Expected: `escrito: 3163 min declarados → 957 min reales (329 lecciones)`.

- [ ] **Step 4: Sacar `estimatedMinutes` del schema**

En `packages/shared/src/content/frontmatter.ts`, en `lessonFrontmatterSchema`, borrar la línea `estimatedMinutes: z.number().int().positive().optional(),` y dejar en su lugar el comentario que explica por qué no está:

```ts
  /**
   * No hay minutaje acá: vive sólo en `course.json`, calculado del cuerpo por
   * `entrenamientos:minutaje` (deuda D-053). Duplicarlo fue lo que lo dejó
   * mentir tres años.
   */
  draft: z.boolean().default(false),
```

- [ ] **Step 5: Arreglar el test del registry**

`apps/web/src/lib/__tests__/courses-registry.test.ts:51` ya verifica que la suma de las lecciones sea igual a `duration` del curso — eso sigue pasando. Si algún test fija un valor de minutos concreto, actualizarlo al nuevo.

Run: `pnpm test:unit`
Expected: PASS.

- [ ] **Step 6: Verificar en pantalla — lo hace el orquestador**

`pnpm dev` y abrir `/entrenamientos`, después una lección.
Expected: el catálogo ya no suma 53 h; `EntrenamientoDetail.tsx:99` y `LeccionDetail.tsx:148` muestran minutos de un dígito en la mayoría de las lecciones.

Este paso lo hace el orquestador con el panel del navegador, no el agente. Es la única verificación que demuestra que cambió el número que ve una persona, y el resto de la tarea se puede dar por buena sin ella y estar mal igual: `course.json` es la sede del dato, pero lo que importa es lo que dibuja la página.

- [ ] **Step 7: Commit — lo hace el orquestador, no el agente**

Las rutas, para stagear explícitas. `package.json` va por hunk.

```bash
git add v2/scripts/content/entrenamientos-minutaje.ts v2/packages/shared/src/content/frontmatter.ts v2/content/courses v2/apps/web/src/lib/__tests__/courses-registry.test.ts
git add -p v2/package.json
git commit -m "fix(v2): el minutaje de los entrenamientos se calcula, no se declara (D-053)"
```

---

## Tarea 7: Poda estructural

**Files:**
- Create: `scripts/content/entrenamientos-poda.ts`
- Modify: `package.json`, los `.mdx` afectados

**Interfaces:**
- Consumes: `separarMdx` de la Tarea 1.
- Produces: `podar(mdx: string, meta: { title: string; summary?: string }): { texto: string; acciones: string[] }` — exportada para poder testearla.

**Medido el 2026-08-13, después del corte de la Tarea 5 y del minutaje de la 6.** Cuatro de los números que este plan traía eran de antes del corte y estaban mal:

| Lo que decía el plan | Lo medido |
| --- | --- |
| 1.012 encabezados por debajo de `###` | **1.012 exactos**, en 153 lecciones |
| el `summary` repetido al inicio en **hasta 315** lecciones | **16 lecciones** |
| emojis en **11** lecciones | **5 lecciones, 21 emojis** |
| 13 lecciones con `<svg>` | **12** |
| (no lo decía) | **73 lecciones** repiten el `title` como encabezado |
| (no lo decía) | **13 lecciones usan `#`**, y la regex `#{4,6}` no las toca |
| 18 lecciones con `<table>` | **18** |

El 315 era la cola generada: el relleno arrancaba re-citando el `summary`, y la cola ya no está. Quedan 16 de verdad.

**Los emojis son keycaps numéricos en encabezados**, no decoración: `#### 1⃣ Reconocer Abiertamente`, en 5 lecciones de `fundamentos-pensamiento-comprension-aprendizaje` y `liderazgo-distribuido`. La regex saca `U+20E3` y deja el dígito, así que el resultado mecánico es `### 1 Reconocer Abiertamente`. Eso queda raro. **Decisión: el script saca el keycap, y las ~21 líneas quedan como `### 1. Reconocer Abiertamente`** — con punto, que es la numeración que el autor quiso. Son 5 archivos; se arreglan a mano en esta misma tarea.

**`#` no lo cubre la regex del plan.** `/^#{4,6} /` aplana 4-6 a `###` y deja los 13 `#` intactos, que compiten con el `<h1>` que la página ya pone con el título. Tienen que pasar a `##`. Verificado en el navegador: la página renderiza `h1=1` (el suyo) y `h4=8` en una sola lección, así que esto se ve.

**Hallazgo nuevo, verificado en pantalla: 20 lecciones tienen 153 líneas que renderizan como bloque de código sin querer.** Son líneas con 4 o más espacios de sangría después de una línea en blanco y fuera de una lista, que en Markdown son un bloque indentado. Alguien las sangró para *centrar* un diagrama de flujo vertical, y el resultado es monoespaciado con los asteriscos a la vista:

```
Diagrama del Flujo Energético
            **ENTRADA**
Recursos • Información • Personas • Propósito
            **TRANSFORMACIÓN**
```

Medido en el navegador sobre `diseno-idealizado-sistemas-vivos/leccion/1`: `pre=3`, `code=3`, y `**` literal en el texto renderizado. No es teoría de Markdown, se ve. Los otros casos son peores en otro sentido: `redaccion-de-proyectos-legislativos.mdx` tiene tres artículos de un proyecto de ley (`Art. 2: El presupuesto municipal…`) renderizando como código.

Va al paso manual junto con las tablas y los SVG, porque la decisión es caso por caso: sangrar menos convierte el diagrama en prosa suelta y pierde el centrado, pero al menos el `**` se vuelve negrita. **El default: quitar la sangría y dejar que sea prosa.** Un diagrama que se lee como código no es un diagrama.

- [ ] **Step 1: Write the failing test**

```ts
// scripts/content/__tests__/entrenamientos-poda.test.ts
import { describe, expect, it } from 'vitest';

import { podar } from '../entrenamientos-poda';

describe('podar', () => {
  it('aplana los encabezados por debajo de h3', () => {
    const { texto } = podar('#### Cuarto\n\n##### Quinto\n\n###### Sexto', { title: 'T' });
    expect(texto).toBe('### Cuarto\n\n### Quinto\n\n### Sexto');
  });

  it('borra el encabezado que repite el título', () => {
    const { texto } = podar('## Mi Título\n\nProsa.', { title: 'Mi Título' });
    expect(texto).toBe('Prosa.');
  });

  it('borra la primera línea si repite el summary', () => {
    const { texto } = podar('Resumen exacto.\n\nProsa.', { title: 'T', summary: 'Resumen exacto.' });
    expect(texto).toBe('Prosa.');
  });

  it('saca los emojis y deja el texto', () => {
    expect(podar('Mirá esto 🔥 acá', { title: 'T' }).texto).toBe('Mirá esto acá');
  });

  it('sube h1 a h2: la página ya pone su propio h1 con el título', () => {
    expect(podar('# Uno\n\nProsa.', { title: 'T' }).texto).toBe('## Uno\n\nProsa.');
  });

  it('no toca h2 ni h3', () => {
    const original = '## Dos\n\n### Tres';
    expect(podar(original, { title: 'T' }).texto).toBe(original);
  });

  it('el keycap se va y el dígito queda', () => {
    // `1⃣` es `1` + U+20E3. El dígito no es Extended_Pictographic, así que
    // sobrevive: la numeración del autor no se pierde. Las ~21 líneas así
    // quedan con punto (`### 1. Reconocer`) a mano, en esta misma tarea.
    expect(podar('#### 1⃣ Reconocer', { title: 'T' }).texto).toBe('### 1 Reconocer');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --config scripts/vitest.config.ts scripts/content/__tests__/entrenamientos-poda.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write the script**

```ts
// scripts/content/entrenamientos-poda.ts
/**
 * Poda estructural de los cuerpos (spec Ciclo 1, Decisión 8).
 *
 * 1.012 encabezados por debajo de `###`, el `summary` repetido verbatim al
 * inicio en hasta 315 lecciones, el título repetido como encabezado, y emojis
 * en 11. Las tablas HTML y los SVG con colores de v1 NO se tocan acá: son
 * decisiones caso por caso y van a mano en esta misma tarea.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { separarMdx } from '@v2/shared';

// Sin la bandera `g`: con `g` el `lastIndex` se arrastra entre llamadas y el
// segundo `test()` sobre el mismo texto miente. Para `replace` se clona abajo.
const EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{20E3}]/u;

const normalizar = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

export function podar(
  cuerpo: string,
  meta: { title: string; summary?: string },
): { texto: string; acciones: string[] } {
  const acciones: string[] = [];
  let texto = cuerpo;

  const aplanado = texto.replace(/^#{4,6} /gm, '### ');
  if (aplanado !== texto) {
    acciones.push('encabezados aplanados');
    texto = aplanado;
  }

  // `#` compite con el `<h1>` que la página ya pone con el título de la
  // lección: 13 lecciones tienen dos títulos de nivel uno. Sube a `##`.
  const sinH1 = texto.replace(/^# /gm, '## ');
  if (sinH1 !== texto) {
    acciones.push('h1 bajado a h2');
    texto = sinH1;
  }

  const sinTitulo = texto.replace(
    /^#{1,3} +(.+)$/gm,
    (linea, encabezado: string) => (normalizar(encabezado) === normalizar(meta.title) ? '' : linea),
  );
  if (sinTitulo !== texto) {
    acciones.push('encabezado igual al título borrado');
    texto = sinTitulo;
  }

  if (meta.summary !== undefined) {
    const lineas = texto.trimStart().split('\n');
    // `lineas[0]` es `string | undefined` con `noUncheckedIndexedAccess`, y
    // `lineas.length > 0` no lo estrecha. Se desestructura, que sí lo estrecha.
    const [primera, ...resto] = lineas;
    if (primera !== undefined && normalizar(primera) === normalizar(meta.summary)) {
      acciones.push('summary duplicado borrado');
      texto = resto.join('\n');
    }
  }

  const sinEmoji = texto.replace(new RegExp(EMOJI, 'gu'), '').replace(/ {2,}/g, ' ');
  if (sinEmoji !== texto) {
    acciones.push('emojis borrados');
    texto = sinEmoji;
  }

  return { texto: texto.replace(/\n{3,}/g, '\n\n').trim(), acciones };
}

if (process.argv[1]?.endsWith('entrenamientos-poda.ts')) {
  const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
  const dir = resolve(raiz, 'content/courses');
  const conHtml: string[] = [];
  let tocados = 0;

  for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const cursoDir = join(dir, curso.name);
    for (const archivo of readdirSync(cursoDir).filter((f) => f.endsWith('.mdx'))) {
      const ruta = join(cursoDir, archivo);
      const { encabezado, cuerpo } = separarMdx(readFileSync(ruta, 'utf-8'));
      const title = /^title: *['"]?(.+?)['"]?$/m.exec(encabezado)?.[1] ?? '';
      const summary = /^summary: *['"]?(.+?)['"]?$/m.exec(encabezado)?.[1];
      const { texto, acciones } = podar(cuerpo, { title, summary });
      if (acciones.length > 0) {
        writeFileSync(ruta, `${encabezado}\n${texto}\n`);
        tocados += 1;
      }
      if (/<table|<svg/i.test(texto)) conHtml.push(`${curso.name}/${archivo}`);
    }
  }
  process.stdout.write(`poda: ${String(tocados)} lecciones\n`);
  process.stdout.write(`con <table> o <svg> para revisar a mano:\n${conHtml.join('\n')}\n`);
}
```

Agregar a `package.json`: `"entrenamientos:poda": "tsx scripts/content/entrenamientos-poda.ts",`

- [ ] **Step 4: Run the tests, then the script**

Run: `pnpm vitest run --config scripts/vitest.config.ts scripts/content/__tests__/entrenamientos-poda.test.ts`
Expected: PASS — 7 tests.

Run: `pnpm entrenamientos:poda`
Expected, medido el 2026-08-13: **176 lecciones tocadas** de 329, y la lista de las 30 con `<table>` (18) o `<svg>` (12). Si el número de lecciones difiere mucho de 176, pará: significa que alguna regla está agarrando más de lo que debe.

- [ ] **Step 5: Lo que va a mano, caso por caso**

Tres grupos, y ninguno es mecánico:

**Las 18 con `<table>`:** pasarla a tabla markdown.

**Las 12 con `<svg>`** (no 13; una se fue con el corte de la Tarea 5): reemplazar los colores de v1 por los tokens del sistema (`docs/design-system/README.md`). Están todas en `fundamentos-pensamiento-comprension-aprendizaje` y `niveles-superiores-pensamiento-conciencia`.

**Las 20 con sangría que renderiza como código** (153 líneas): quitarles la sangría. El default es que quede prosa; un diagrama que se lee como código no es un diagrama. Dos casos merecen mirada propia: `diseno-idealizado-sistemas-vivos/el-pulso-energetico-de-todo-sistema.mdx`, que es un diagrama de flujo vertical centrado con espacios, y `diseno-instituciones-queja-propuesta/redaccion-de-proyectos-legislativos.mdx`, que tiene tres artículos de un proyecto de ley (`Art. 2: El presupuesto municipal…`) en monoespaciado. En el segundo, un bloque de cita (`>`) probablemente sea mejor que prosa suelta: es la letra de una norma citada.

**El asset ya existe** — verificado el 2026-08-13: `apps/web/public/course-graphics/hombre-gris/evolucion-pago-estrategico.svg` está (2.100 bytes). Lo que **no** está bien es cómo lo citan: las dos lecciones de `teoria-juegos-argentina-hombre-gris` (`modulo-1` línea 92 y `modulo-3` línea 71) lo referencian con **12 espacios de sangría**, así que el `![...]` cae dentro de un bloque indentado y la imagen no se dibuja: se muestra el markdown crudo. Quitarles la sangría es parte del grupo de arriba.

- [ ] **Step 6: Verificar que el minutaje siguió a la poda**

Run: `pnpm entrenamientos:minutaje --escribir && pnpm test:unit`
Expected: PASS. La poda cambió el conteo de palabras, así que el minutaje se recalcula en el mismo commit.

- [ ] **Step 7: Commit — lo hace el orquestador, no el agente**

Las rutas, para stagear explícitas. `package.json` va por hunk.

```bash
git add v2/scripts/content/entrenamientos-poda.ts v2/scripts/content/__tests__/entrenamientos-poda.test.ts v2/content/courses v2/apps/web/public
git add -p v2/package.json
git commit -m "fix(v2): poda estructural de las lecciones — encabezados, duplicados, emojis, tablas"
```

**Y una verificación en pantalla que no se delega**, porque toda esta tarea es sobre lo que se ve: abrir `diseno-idealizado-sistemas-vivos/leccion/1` y confirmar que ya no hay `<pre>` ni `**` literales, y una de las dos de `teoria-juegos` para confirmar que la imagen se dibuja. En la corrida del 2026-08-13, antes de la poda, esa lección daba `pre=3`, `code=3` y `h4=8`.

---

## Tarea 8: La fuente deja de mentir

**Files:**
- Create: `scripts/content/entrenamientos-limpiar-fuente.ts`
- Modify: `packages/shared/src/content/courses.ts:17-27` (saca `contentFile`), los 31 `course.json`, los 31 `quiz.json`, `packages/shared/tests/courses-content.test.ts:30`
- Delete: `scripts/content/migrate-courses-v1-to-v2.ts`, `scripts/content/verify-courses-migration.ts`

**Interfaces:**
- Consumes: nada.
- Produces: nada de código nuevo para otras tareas.

**Un campo diecinueve, encontrado el 2026-08-13 en la Tarea 7, y esta vez la decisión no es obvia.** El `summary` del frontmatter de lección **no lo renderiza nadie**: `LeccionDetail.tsx` usa `titulo`, `slug` y `minutos`, y `courses-registry.ts` no lo carga. Las 329 lecciones lo declaran y no se ve nunca. Salió a la luz porque la poda borró la primera línea del cuerpo en 16 lecciones que la repetían verbatim, y la pregunta era si eso perdía contenido visible: no lo perdía —eran blurbs de catálogo en tuteo, «Aprende a…», «Explora cómo…», y lo que quedó en su lugar es la primera sección real— pero destapó que el campo está muerto.

**A diferencia de los 18 de abajo, acá hay dos salidas y son las dos defendibles:** borrarlo, o renderizarlo como subtítulo de la lección. Blog y planes ya renderizan el suyo, así que la infraestructura existe y la asimetría es sospechosa. No lo borres por inercia junto con los otros 18: los 18 son campos que nadie quiso nunca, y este es un campo que alguien escribió 329 veces. Si se borra, se borra decidiéndolo.

- [ ] **Step 1: Repetir el grep que autoriza cada borrado**

```bash
for f in seoTitle seoDescription searchSummary ogImageUrl thumbnailUrl indexable lastReviewedAt authorId legacyCourseId legacyLessonId legacyQuizId rekeys videoUrl documentUrl passingScore timeLimit maxAttempts contentFile; do
  echo "$f: $(grep -rl "$f" --include='*.ts' --include='*.tsx' apps packages scripts 2>/dev/null | grep -v dist | tr '\n' ' ')"
done
```

Expected: todos vacíos salvo `contentFile` (schema + los dos migradores + el test) y `passingScore` (schema). Copiar esta salida al mensaje del commit. **Si aparece un lector nuevo, ese campo no se borra.**

- [ ] **Step 2: Write the script**

```ts
// scripts/content/entrenamientos-limpiar-fuente.ts
/**
 * Borra de la fuente los campos sin un solo lector en v2 (Decisión 9).
 *
 * Los 31 `thumbnailUrl`/`ogImageUrl` apuntan a images.unsplash.com, que la CSP
 * prohíbe; `passingScore` promete una nota en una práctica que por diseño no la
 * tiene; `contentFile` apunta a rutas del árbol de v1 en las 329 (D-055).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const MUERTOS_CURSO = [
  'seoTitle',
  'seoDescription',
  'searchSummary',
  'ogImageUrl',
  'thumbnailUrl',
  'indexable',
  'lastReviewedAt',
  'schemaVersion',
  'authorId',
  'legacyCourseId',
  'rekeys',
] as const;
const MUERTOS_LECCION = [
  'seoTitle',
  'seoDescription',
  'searchSummary',
  'indexable',
  'videoUrl',
  'documentUrl',
  'legacyLessonId',
  'contentFile',
] as const;
const MUERTOS_QUIZ = ['passingScore', 'timeLimit', 'maxAttempts', 'legacyQuizId'] as const;
const MUERTOS_PREGUNTA = ['legacyQuestionId'] as const;

const limpiar = (o: Record<string, unknown>, claves: readonly string[]): void => {
  for (const k of claves) delete o[k];
};

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = resolve(raiz, 'content/courses');
let cursos = 0;

for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const cursoDir = join(dir, curso.name);

  const rutaCurso = join(cursoDir, 'course.json');
  const indice = JSON.parse(readFileSync(rutaCurso, 'utf-8')) as Record<string, unknown> & {
    lessons: Record<string, unknown>[];
  };
  limpiar(indice, MUERTOS_CURSO);
  for (const l of indice.lessons) limpiar(l, MUERTOS_LECCION);
  writeFileSync(rutaCurso, `${JSON.stringify(indice, null, 2)}\n`);

  const rutaQuiz = join(cursoDir, 'quiz.json');
  const quiz = JSON.parse(readFileSync(rutaQuiz, 'utf-8')) as Record<string, unknown> & {
    questions: Record<string, unknown>[];
  };
  limpiar(quiz, MUERTOS_QUIZ);
  for (const q of quiz.questions) limpiar(q, MUERTOS_PREGUNTA);
  writeFileSync(rutaQuiz, `${JSON.stringify(quiz, null, 2)}\n`);
  cursos += 1;
}

process.stdout.write(`fuente limpia en ${String(cursos)} cursos\n`);
```

Agregar a `package.json`: `"entrenamientos:limpiar-fuente": "tsx scripts/content/entrenamientos-limpiar-fuente.ts",`

- [ ] **Step 3: Sacar `contentFile` del schema y retirar los migradores**

En `packages/shared/src/content/courses.ts`, en `courseLessonJsonSchema`, borrar `contentFile: z.string().min(1),` y su comentario. En `packages/shared/tests/courses-content.test.ts:30`, borrar la línea `contentFile: 'lessons/00-primera-leccion.md',` del fixture.

```bash
git rm v2/scripts/content/migrate-courses-v1-to-v2.ts v2/scripts/content/verify-courses-migration.ts
```

Su trabajo terminó con la migración del 2026-05-13 (commit `367dbcd`), y eran los únicos lectores de `contentFile`.

- [ ] **Step 4: Correr y verificar**

Run: `pnpm entrenamientos:limpiar-fuente && pnpm type-check && pnpm test:unit && pnpm test:scripts`
Expected: PASS en los cuatro. Si `test:scripts` falla por los migradores borrados, borrar también sus tests si los tienen.

Run: `grep -rc unsplash content/courses/ | grep -v ':0' || echo "sin unsplash"`
Expected: `sin unsplash`.

- [ ] **Step 5: Commit**

```bash
git add v2/scripts/content/entrenamientos-limpiar-fuente.ts v2/packages/shared/src/content/courses.ts v2/packages/shared/tests/courses-content.test.ts v2/content/courses v2/package.json
git commit -m "fix(v2): la fuente de los entrenamientos deja de mentir — 17 campos sin lector, contentFile incluido (D-055)"
```

---

## Tarea 9: El árbitro anti-clon

**Files:**
- Create: `packages/shared/src/content/similitud.ts`, `packages/shared/tests/similitud.test.ts`
- Modify: `packages/shared/src/content/index.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `trigramas(texto: string): Set<string>`, `jaccard(a: Set<string>, b: Set<string>): number`, `sonGemelos(a: string, b: string, umbral?: number): boolean`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/shared/tests/similitud.test.ts
import { describe, expect, it } from 'vitest';

import { jaccard, sonGemelos, trigramas } from '../src/content/similitud';

describe('trigramas', () => {
  it('normaliza tildes, mayúsculas y puntuación', () => {
    expect(trigramas('Água, río')).toEqual(trigramas('agua rio'));
  });
});

describe('jaccard', () => {
  it('da 1 para textos idénticos y 0 para textos sin nada en común', () => {
    expect(jaccard(trigramas('la misma frase'), trigramas('la misma frase'))).toBe(1);
    expect(jaccard(trigramas('perro'), trigramas('kiwi'))).toBe(0);
  });
});

describe('sonGemelos', () => {
  it('marca dos cierres plantillados que sólo cambian una variable', () => {
    const a = 'Para que esta idea no quede en el plano conceptual, conviene traducirla a decisiones observables dentro de tu municipio.';
    const b = 'Para que esta idea no quede en el plano conceptual, conviene traducirla a decisiones observables dentro de tu hogar.';
    expect(sonGemelos(a, b)).toBe(true);
  });

  it('no marca dos cierres distintos sobre el mismo tema', () => {
    const a = 'En 2024 el Congreso trató 12 de los 380 proyectos girados a la comisión de presupuesto.';
    const b = 'La ordenanza 4.512 de Rosario obliga a publicar el presupuesto en formato abierto desde 2019.';
    expect(sonGemelos(a, b)).toBe(false);
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @v2/shared exec vitest run tests/similitud.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write the module**

```ts
// packages/shared/src/content/similitud.ts
/**
 * Similitud de textos por trigramas — el árbitro anti-clon.
 *
 * Existe por una sola razón: 320 lecciones terminaron con el mismo párrafo
 * generado y nada en el build se dio cuenta durante meses. Con esto, dos
 * cierres parecidos rompen el build nombrando las dos lecciones.
 */

/** Umbral por defecto: 0,55. Calibrado contra las dos generaciones de la cola de v1. */
export const UMBRAL_GEMELOS = 0.55;

export function trigramas(texto: string): Set<string> {
  const limpio = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
  const set = new Set<string>();
  for (let i = 0; i + 3 <= limpio.length; i += 1) set.add(limpio.slice(i, i + 3));
  return set;
}

export function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  let comunes = 0;
  for (const t of a) if (b.has(t)) comunes += 1;
  return comunes / (a.size + b.size - comunes);
}

export function sonGemelos(a: string, b: string, umbral: number = UMBRAL_GEMELOS): boolean {
  return jaccard(trigramas(a), trigramas(b)) > umbral;
}
```

- [ ] **Step 4: Export it and run the tests**

Agregar `export * from './similitud.js';` en `index.ts`.

Run: `pnpm --filter @v2/shared exec vitest run tests/similitud.test.ts`
Expected: PASS — 5 tests.

- [ ] **Step 5: Calibrar el umbral contra el corpus real**

```bash
pnpm tsx -e "
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { jaccard, trigramas } from '@v2/shared';
const dir = 'content/courses';
const textos: [string, Set<string>][] = [];
for (const c of readdirSync(dir)) {
  for (const f of readdirSync(join(dir, c)).filter((x) => x.endsWith('.mdx'))) {
    const t = readFileSync(join(dir, c, f), 'utf-8').split('\n---')[1] ?? '';
    textos.push([c + '/' + f, trigramas(t.slice(-700))]);
  }
}
let max = 0, par = '';
for (let i = 0; i < textos.length; i++)
  for (let j = i + 1; j < textos.length; j++) {
    const s = jaccard(textos[i][1], textos[j][1]);
    if (s > max) { max = s; par = textos[i][0] + ' vs ' + textos[j][0]; }
  }
console.log('similitud máxima entre finales:', max.toFixed(3), par);
"
```

Expected: después de la Tarea 5, la similitud máxima entre los finales de dos lecciones debería estar **por debajo de 0,55**. Si queda por encima, hay cola que sobrevivió: volver a la Tarea 5 antes de seguir.

- [ ] **Step 6: Commit**

```bash
git add v2/packages/shared/src/content/similitud.ts v2/packages/shared/tests/similitud.test.ts v2/packages/shared/src/content/index.ts
git commit -m "feat(v2): similitud por trigramas — el árbitro que hace imposible el relleno"
```

---

## Tarea 10: El cierre de tres piezas

**Files:**
- Create: `packages/shared/src/content/cierre.ts`, `packages/shared/tests/cierre.test.ts`
- Modify: `packages/shared/src/content/index.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `type EstadoCierre = 'pendiente' | 'puente' | 'completo'`, `interface Cierre { caso: string | null; palanca: string | null; puente: string | null }`, `parsearCierre(cuerpo: string): Cierre`, `validarCierre(c: Cierre, estado: EstadoCierre, contexto: { slugsValidos: Set<string>; tieneFuentes: boolean; summary?: string }): string[]` (devuelve la lista de errores; vacía es válido).

- [ ] **Step 1: Write the failing test**

```ts
// packages/shared/tests/cierre.test.ts
import { describe, expect, it } from 'vitest';

import { parsearCierre, validarCierre } from '../src/content/cierre';

const CUERPO = `Prosa de la lección.

### El caso
En 2024 la Auditoría General de la Nación publicó 41 informes y el Congreso trató 3. El artículo 85 de la Constitución le da el control externo del sector público, pero el dictamen no obliga a nadie.

### La palanca
Pedí el último informe de la AGN sobre tu municipio por el formulario de acceso a la información pública. Entrá a agn.gob.ar y buscá tu jurisdicción.

### El puente
Esto es el diagnóstico que PLANREP convierte en obligación de respuesta.`;

const CONTEXTO = { slugsValidos: new Set(['PLANREP']), tieneFuentes: true };

describe('parsearCierre', () => {
  it('separa las tres piezas', () => {
    const c = parsearCierre(CUERPO);
    expect(c.caso).toContain('Auditoría General');
    expect(c.palanca).toContain('agn.gob.ar');
    expect(c.puente).toContain('PLANREP');
  });

  it('devuelve null en las piezas que faltan', () => {
    expect(parsearCierre('Sólo prosa.')).toEqual({ caso: null, palanca: null, puente: null });
  });
});

describe('validarCierre', () => {
  it('acepta un cierre completo con fuente, dato y slug válido', () => {
    expect(validarCierre(parsearCierre(CUERPO), 'completo', CONTEXTO)).toEqual([]);
  });

  it('rechaza el caso sin fuente', () => {
    const errores = validarCierre(parsearCierre(CUERPO), 'completo', { ...CONTEXTO, tieneFuentes: false });
    expect(errores.join(' ')).toContain('fuentes');
  });

  it('rechaza un puente que nombra un slug inexistente', () => {
    const errores = validarCierre(parsearCierre(CUERPO), 'completo', {
      ...CONTEXTO,
      slugsValidos: new Set(['PLANEDU']),
    });
    expect(errores.join(' ')).toContain('PLANREP');
  });

  it('rechaza el caso sin un dato ni una norma', () => {
    const flojo = parsearCierre(CUERPO.replace(/En 2024.*no obliga a nadie\./s, 'Es importante entenderlo.'));
    expect(validarCierre(flojo, 'completo', CONTEXTO).join(' ')).toMatch(/dato|norma/);
  });

  it('con estado puente sólo exige el puente', () => {
    const soloPuente = { caso: null, palanca: null, puente: 'Se conecta con PLANREP.' };
    expect(validarCierre(soloPuente, 'puente', CONTEXTO)).toEqual([]);
  });

  it('no exige nada cuando el estado es pendiente', () => {
    expect(validarCierre({ caso: null, palanca: null, puente: null }, 'pendiente', CONTEXTO)).toEqual([]);
  });

  it('rechaza una pieza que repite el summary', () => {
    const errores = validarCierre(parsearCierre(CUERPO), 'completo', {
      ...CONTEXTO,
      summary: 'En 2024 la Auditoría General de la Nación publicó 41 informes y el Congreso trató 3.',
    });
    expect(errores.join(' ')).toContain('summary');
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @v2/shared exec vitest run tests/cierre.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write the module**

```ts
// packages/shared/src/content/cierre.ts
/**
 * El cierre de tres piezas (spec Ciclo 1, Decisión 6).
 *
 * Reemplaza la cola generada de v1. Los encabezados son fijos —eso es un
 * contrato— y el texto es irrepetible: lo garantizan estas validaciones más el
 * árbitro anti-clon de `similitud.ts`.
 */
import { sonGemelos } from './similitud';

export type EstadoCierre = 'pendiente' | 'puente' | 'completo';

export interface Cierre {
  caso: string | null;
  palanca: string | null;
  puente: string | null;
}

const ENCABEZADOS = { caso: 'El caso', palanca: 'La palanca', puente: 'El puente' } as const;

/** Rangos de la Decisión 6. `puente` se mide en líneas, no en palabras. */
export const RANGOS = { caso: [60, 160], palanca: [40, 120], puenteLineas: 3 } as const;

/** Imperativos en voseo con los que puede cerrar «La palanca». */
export const IMPERATIVOS_VOSEO = [
  'pedí', 'entrá', 'buscá', 'anotá', 'llamá', 'escribí', 'mirá', 'fijate', 'andá', 'presentá',
  'compará', 'preguntá', 'sumate', 'armá', 'guardá', 'revisá', 'mandá', 'elegí', 'empezá',
] as const;

/** Organismos y formas normativas que cuentan como evidencia nombrada. */
export const EVIDENCIA_NOMBRADA =
  /\b(ley|decreto|resolución|ordenanza|artículo|expediente|INDEC|AGN|AFIP|ARCA|ANSES|BCRA|SIGEN|Boletín Oficial|Congreso|Corte Suprema)\b/i;

function seccion(cuerpo: string, titulo: string): string | null {
  const re = new RegExp(`^#{2,3} *${titulo} *$`, 'm');
  const m = re.exec(cuerpo);
  if (m === null) return null;
  const desde = m.index + m[0].length;
  const siguiente = /^#{1,6} /m.exec(cuerpo.slice(desde));
  const hasta = siguiente === null ? cuerpo.length : desde + siguiente.index;
  const texto = cuerpo.slice(desde, hasta).trim();
  return texto.length === 0 ? null : texto;
}

export function parsearCierre(cuerpo: string): Cierre {
  return {
    caso: seccion(cuerpo, ENCABEZADOS.caso),
    palanca: seccion(cuerpo, ENCABEZADOS.palanca),
    puente: seccion(cuerpo, ENCABEZADOS.puente),
  };
}

const palabras = (s: string): number => s.split(/\s+/).filter((t) => t.length > 0).length;

export function validarCierre(
  cierre: Cierre,
  estado: EstadoCierre,
  contexto: { slugsValidos: Set<string>; tieneFuentes: boolean; summary?: string },
): string[] {
  if (estado === 'pendiente') return [];
  const errores: string[] = [];

  if (cierre.puente === null) {
    errores.push('falta «El puente», obligatorio en las 329 lecciones');
  } else {
    const lineas = cierre.puente.split('\n').filter((l) => l.trim().length > 0).length;
    if (lineas > RANGOS.puenteLineas) errores.push(`«El puente» tiene ${String(lineas)} líneas; el máximo es 3`);
    const nombrados = [...contexto.slugsValidos].filter((s) => cierre.puente?.includes(s));
    if (nombrados.length === 0) {
      errores.push('«El puente» no nombra ningún PLAN, ensayo o capítulo que exista en el registry');
    }
  }

  if (estado === 'completo') {
    if (cierre.caso === null) {
      errores.push('falta «El caso»');
    } else {
      const n = palabras(cierre.caso);
      if (n < RANGOS.caso[0] || n > RANGOS.caso[1]) {
        errores.push(`«El caso» tiene ${String(n)} palabras; el rango es ${String(RANGOS.caso[0])}–${String(RANGOS.caso[1])}`);
      }
      if (!contexto.tieneFuentes) errores.push('«El caso» exige al menos una entrada en `fuentes:`');
      if (!/\d/.test(cierre.caso) && !EVIDENCIA_NOMBRADA.test(cierre.caso)) {
        errores.push('«El caso» no nombra un dato ni una norma verificable');
      }
    }

    if (cierre.palanca === null) {
      errores.push('falta «La palanca»');
    } else {
      const n = palabras(cierre.palanca);
      if (n < RANGOS.palanca[0] || n > RANGOS.palanca[1]) {
        errores.push(`«La palanca» tiene ${String(n)} palabras; el rango es ${String(RANGOS.palanca[0])}–${String(RANGOS.palanca[1])}`);
      }
      const ultima = cierre.palanca.trimEnd().split('\n').at(-1)?.trim().toLowerCase() ?? '';
      if (!IMPERATIVOS_VOSEO.some((v) => ultima.startsWith(v))) {
        errores.push('«La palanca» no cierra con una línea que arranque con un imperativo en voseo');
      }
    }
  }

  if (contexto.summary !== undefined) {
    for (const [nombre, texto] of Object.entries(cierre)) {
      if (texto !== null && sonGemelos(texto, contexto.summary, 0.7)) {
        errores.push(`«${nombre}» repite el summary de la lección`);
      }
    }
  }

  return errores;
}
```

- [ ] **Step 4: Export it and run the tests**

Agregar `export * from './cierre.js';` en `index.ts`.

Run: `pnpm --filter @v2/shared exec vitest run tests/cierre.test.ts`
Expected: PASS — 9 tests.

- [ ] **Step 5: Commit**

```bash
git add v2/packages/shared/src/content/cierre.ts v2/packages/shared/tests/cierre.test.ts v2/packages/shared/src/content/index.ts
git commit -m "feat(v2): el cierre de tres piezas y sus validaciones"
```

---

## Tarea 11: El contrato nuevo en los schemas

**Files:**
- Modify: `packages/shared/src/content/frontmatter.ts` (lección), `packages/shared/src/content/courses.ts` (curso), `packages/shared/tests/courses-content.test.ts`
- Create: `packages/shared/tests/frontmatter-leccion.test.ts`

**Interfaces:**
- Consumes: `EstadoCierre` (Tarea 10).
- Produces: `lessonFrontmatterSchema` con `cierre`, `fuentes`, `revisarAntesDe`, `planes`, `ensayos`; `courseJsonSchema` con `promesa` y `noCubre`.

- [ ] **Step 1: Write the failing test**

```ts
// packages/shared/tests/frontmatter-leccion.test.ts
import { describe, expect, it } from 'vitest';

import { lessonFrontmatterSchema } from '../src/content/frontmatter';

const BASE = { slug: 'una-leccion', courseSlug: 'un-curso', title: 'Una lección', orderIndex: 1 };

describe('lessonFrontmatterSchema', () => {
  it('por defecto una lección está pendiente y sin puentes', () => {
    const parsed = lessonFrontmatterSchema.parse(BASE);
    expect(parsed.cierre).toBe('pendiente');
    expect(parsed.fuentes).toEqual([]);
    expect(parsed.planes).toEqual([]);
  });

  it('acepta el contrato completo', () => {
    const parsed = lessonFrontmatterSchema.parse({
      ...BASE,
      cierre: 'completo',
      fuentes: [{ url: 'https://www.argentina.gob.ar/agn', titulo: 'AGN', consultada: '2026-08-12' }],
      revisarAntesDe: '2027-02-01',
      planes: ['PLANREP'],
      ensayos: ['conocerse-sin-espejo'],
    });
    expect(parsed.cierre).toBe('completo');
    expect(parsed.fuentes[0].consultada).toBe('2026-08-12');
  });

  it('rechaza estimatedMinutes: el minutaje vive en course.json', () => {
    expect('estimatedMinutes' in lessonFrontmatterSchema.parse({ ...BASE, estimatedMinutes: 9 })).toBe(false);
  });

  it('rechaza una fecha que no sea AAAA-MM-DD', () => {
    expect(() => lessonFrontmatterSchema.parse({ ...BASE, revisarAntesDe: '01/02/2027' })).toThrow();
  });

  it('rechaza una fuente sin fecha de consulta', () => {
    expect(() =>
      lessonFrontmatterSchema.parse({ ...BASE, fuentes: [{ url: 'https://x.ar', titulo: 'X' }] }),
    ).toThrow();
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm --filter @v2/shared exec vitest run tests/frontmatter-leccion.test.ts`
Expected: FAIL — `cierre` no existe en el schema.

- [ ] **Step 3: Extend the lesson schema**

En `packages/shared/src/content/frontmatter.ts`, reemplazar `lessonFrontmatterSchema` por:

```ts
const fechaSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Las fechas van en AAAA-MM-DD.');

export const fuenteSchema = z.object({
  url: z.string().url(),
  titulo: z.string().min(1).max(200),
  /** Cuándo se miró. Sin esto una fuente no es verificable, es decorativa. */
  consultada: fechaSchema,
});
export type Fuente = z.infer<typeof fuenteSchema>;

/**
 * Course lesson frontmatter — content/courses/<course-slug>/<lesson>.mdx.
 *
 * No hay minutaje acá: vive sólo en `course.json`, calculado del cuerpo por
 * `entrenamientos:minutaje` (D-053). Duplicarlo fue lo que lo dejó mentir.
 */
export const lessonFrontmatterSchema = z.object({
  slug: slugSchema,
  courseSlug: slugSchema,
  title: z.string().min(1).max(200),
  summary: z.string().max(500).optional(),
  orderIndex: z.number().int().nonnegative(),
  draft: z.boolean().default(false),
  /** Estado del cierre de tres piezas. `pendiente` es el estado inicial de las 329. */
  cierre: z.enum(['pendiente', 'puente', 'completo']).default('pendiente'),
  fuentes: z.array(fuenteSchema).default([]),
  /** Para contenido perecedero (trámites, categorías, escalas). Vencido avisa, no rompe. */
  revisarAntesDe: fechaSchema.optional(),
  /** Los llena el Ciclo 2. Declarados acá para editar los 329 archivos una sola vez. */
  planes: z.array(z.string().min(1)).default([]),
  ensayos: z.array(slugSchema).default([]),
});
export type LessonFrontmatter = z.infer<typeof lessonFrontmatterSchema>;
```

- [ ] **Step 4: Extend the course schema**

En `packages/shared/src/content/courses.ts`, agregar a `courseJsonSchema`, después de `level`:

```ts
  /** Qué va a poder hacer quien lo termine, en verbos observables (Decisión 10). */
  promesa: z.array(z.string().min(1).max(200)).min(3).max(5).optional(),
  /** Qué este entrenamiento NO cubre. La defensa honesta contra la expectativa inflada. */
  noCubre: z.array(z.string().min(1).max(200)).min(2).max(3).optional(),
```

Van `optional()` porque los 31 cursos los ganan de a uno, en la Tarea 14. La guardia los exige por curso terminado, no el schema.

- [ ] **Step 5: Run all the tests**

Run: `pnpm --filter @v2/shared exec vitest run && pnpm type-check`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add v2/packages/shared/src/content/frontmatter.ts v2/packages/shared/src/content/courses.ts v2/packages/shared/tests
git commit -m "feat(v2): el contrato de lección y de curso — cierre, fuentes, puentes, promesa"
```

---

## Tarea 12: La guardia, y que corra en CI

Descubrimiento a tener presente: **`scripts/build/build-content.ts` no está en ningún `package.json` ni en el CI**, aunque `courses-registry.ts:64` diga «build-content es el que grita». Esta guardia no se apoya en él: es su propio script y su propio paso.

**Files:**
- Create: `scripts/content/entrenamientos-check.ts`, `scripts/content/__tests__/entrenamientos-check.test.ts`
- Modify: `package.json` (`entrenamientos:check` + agregarlo a `verify`), `.github/workflows/v2-ci.yml`

**Interfaces:**
- Consumes: todo lo anterior de `@v2/shared`.
- Produces: `revisarCorpus(raiz: string): string[]` — la lista de errores; vacía es verde.

- [ ] **Step 1: Write the failing test**

```ts
// scripts/content/__tests__/entrenamientos-check.test.ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { revisarCorpus } from '../entrenamientos-check';

function corpus(cuerpo: string, extraFrontmatter = ''): string {
  const raiz = mkdtempSync(join(tmpdir(), 'check-'));
  const curso = join(raiz, 'content', 'courses', 'curso-uno');
  mkdirSync(curso, { recursive: true });
  writeFileSync(
    join(curso, 'course.json'),
    JSON.stringify({
      slug: 'curso-uno',
      title: 'Curso uno',
      description: 'd',
      excerpt: 'e',
      category: 'civica',
      level: 'beginner',
      duration: 1,
      orderIndex: 1,
      isPublished: true,
      isFeatured: false,
      requiresAuth: false,
      quizFile: 'quiz.json',
      lessons: [{ key: '01-leccion-uno', title: 'Lección uno', duration: 1, orderIndex: 1 }],
    }),
  );
  writeFileSync(
    join(curso, 'leccion-uno.mdx'),
    `---\nslug: leccion-uno\ncourseSlug: curso-uno\ntitle: Lección uno\norderIndex: 1\n${extraFrontmatter}---\n\n${cuerpo}\n`,
  );
  return raiz;
}

describe('revisarCorpus', () => {
  it('pasa con una lección pendiente y el minutaje correcto', async () => {
    expect(await revisarCorpus(corpus('Prosa corta.'))).toEqual([]);
  });

  it('grita si reaparece la cola generada', async () => {
    const errores = await revisarCorpus(
      corpus('Prosa.\n\n### Idea fuerza\n\nCuando un aprendizaje se traduce en decisiones mejores, ya está.'),
    );
    expect(errores.join(' ')).toMatch(/cola generada/i);
  });

  it('grita si el minutaje de course.json no coincide con el cuerpo', async () => {
    const errores = await revisarCorpus(corpus('palabra '.repeat(900)));
    expect(errores.join(' ')).toMatch(/minutaje/i);
  });

  it('grita con tuteo de la lista dura', async () => {
    expect((await revisarCorpus(corpus('Si tienes dudas.'))).join(' ')).toMatch(/tuteo/i);
  });

  it('grita con encabezados por debajo de h3', async () => {
    expect((await revisarCorpus(corpus('#### Cuarto nivel'))).join(' ')).toMatch(/encabezado/i);
  });

  it('grita si queda estimatedMinutes en el frontmatter', async () => {
    expect((await revisarCorpus(corpus('Prosa.', 'estimatedMinutes: 9\n'))).join(' ')).toMatch(
      /estimatedMinutes/,
    );
  });
});
```

- [ ] **Step 2: Run it to verify it fails**

Run: `pnpm vitest run --config scripts/vitest.config.ts scripts/content/__tests__/entrenamientos-check.test.ts`
Expected: FAIL.

- [ ] **Step 3: Write the guard**

```ts
// scripts/content/entrenamientos-check.ts
/**
 * Guardia del corpus de entrenamientos. Corre en CI, para siempre.
 *
 * Las doce reglas de la spec (§4). Cada una existe porque algo ya pasó: la cola
 * generada en 320 lecciones, 53 horas anunciadas contra 14 reales, 775 formas de
 * tuteo, 1.012 encabezados de esquema, y campos requeridos que no resuelven.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  contarPalabrasRenderizables,
  derivarSlugDeLeccion,
  detectarCola,
  detectarTuteo,
  jaccard,
  lessonFrontmatterSchema,
  minutosDeLectura,
  parsearCierre,
  trigramas,
  UMBRAL_GEMELOS,
  validarCierre,
} from '@v2/shared';
import { loadContentDir } from '@v2/shared/content/loader';

const PISO_PALABRAS = 600;

/**
 * Todo lo que un puente puede nombrar: PLANes, ensayos, capítulos de la crónica
 * y los propios cursos. Un dominio que no existe se saltea — así el fixture de
 * un test no necesita inventar los cuatro directorios.
 */
function slugsValidos(raiz: string): Set<string> {
  const set = new Set<string>();
  for (const dominio of ['planes', 'ensayos', 'cronica'] as const) {
    const dir = resolve(raiz, 'content', dominio);
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.mdx'))) set.add(basename(f, '.mdx'));
  }
  for (const c of readdirSync(resolve(raiz, 'content/courses'), { withFileTypes: true })) {
    if (c.isDirectory()) set.add(c.name);
  }
  return set;
}

export async function revisarCorpus(raiz: string): Promise<string[]> {
  const errores: string[] = [];
  const dir = resolve(raiz, 'content/courses');
  const validos = slugsValidos(raiz);
  const firmas: { id: string; firma: Set<string> }[] = [];

  for (const curso of readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const cursoDir = join(dir, curso.name);
    const indice = JSON.parse(readFileSync(join(cursoDir, 'course.json'), 'utf-8')) as {
      duration: number;
      promesa?: string[];
      noCubre?: string[];
      lessons: { key: string; duration: number }[];
    };
    const declarados = new Map(
      indice.lessons.map((l) => [derivarSlugDeLeccion(l.key), l.duration] as const),
    );

    // gray-matter + Zod en un solo paso, con el contrato nuevo. Server-only.
    const { ok, errors } = await loadContentDir(cursoDir, lessonFrontmatterSchema);
    for (const e of errors) {
      const detalle = (e.issues ?? []).map((i) => `${i.path}: ${i.message}`).join('; ');
      errores.push(`${curso.name}/${e.file}: ${e.message} ${detalle}`.trim());
    }

    let cursoTerminado = ok.length > 0;
    const vistos = new Set<string>();

    for (const { file, frontmatter, body: cuerpo } of ok) {
      const slug = basename(file, '.mdx');
      const id = `${curso.name}/${slug}`;
      vistos.add(slug);

      // 11 — el minutaje no vive en el frontmatter. Zod lo descarta, así que se
      // busca en el texto crudo: si no, un `estimatedMinutes: 9` olvidado pasa.
      if (/^estimatedMinutes:/m.test(readFileSync(join(cursoDir, file), 'utf-8'))) {
        errores.push(`${id}: estimatedMinutes sigue en el frontmatter`);
      }

      // 13 — el archivo y el índice se conocen
      const declarado = declarados.get(slug);
      if (declarado === undefined) {
        errores.push(`${id}: la lección no tiene entrada en course.json`);
        continue;
      }

      // 1 — la cola no vuelve
      if (detectarCola(cuerpo).motivo !== 'sin-cola') errores.push(`${id}: reapareció la cola generada`);

      // 2 — el minutaje coincide
      const palabras = contarPalabrasRenderizables(cuerpo);
      const minutos = minutosDeLectura(palabras);
      if (declarado !== minutos) {
        errores.push(`${id}: minutaje declarado ${String(declarado)} ≠ ${String(minutos)} real`);
      }

      // 3 — cero tuteo duro
      for (const h of detectarTuteo(cuerpo).filter((x) => x.lista === 'dura')) {
        errores.push(`${id}: tuteo «${h.forma}»`);
      }

      // 4 — profundidad
      if (/^#{4,6} /m.test(cuerpo)) errores.push(`${id}: encabezado por debajo de h3`);

      // 5 — nada repetido del frontmatter
      const primera = cuerpo.trim().split('\n')[0] ?? '';
      if (frontmatter.summary !== undefined && jaccard(trigramas(primera), trigramas(frontmatter.summary)) > 0.7) {
        errores.push(`${id}: el cuerpo abre repitiendo el summary`);
      }
      if (new RegExp(`^#{1,3} +${frontmatter.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} *$`, 'm').test(cuerpo)) {
        errores.push(`${id}: hay un encabezado idéntico al título`);
      }

      // 6, 7, 8 — el cierre
      const cierre = parsearCierre(cuerpo);
      for (const p of validarCierre(cierre, frontmatter.cierre, {
        slugsValidos: validos,
        tieneFuentes: frontmatter.fuentes.length > 0,
        summary: frontmatter.summary,
      })) {
        errores.push(`${id}: ${p}`);
      }
      for (const puente of [...frontmatter.planes, ...frontmatter.ensayos]) {
        if (!validos.has(puente)) errores.push(`${id}: puente a «${puente}», que no existe`);
      }
      if (cierre.puente !== null) {
        firmas.push({
          id,
          firma: trigramas([cierre.caso, cierre.palanca, cierre.puente].filter((x) => x !== null).join(' ')),
        });
      }

      // 11 — emojis y tablas HTML
      if (/\p{Extended_Pictographic}/u.test(cuerpo)) errores.push(`${id}: hay emojis en el cuerpo`);
      if (/<table/i.test(cuerpo)) errores.push(`${id}: hay una tabla en HTML crudo`);

      // 9 — el piso, sólo en cursos terminados
      if (frontmatter.cierre === 'pendiente') cursoTerminado = false;
      else if (palabras < PISO_PALABRAS) {
        errores.push(`${id}: ${String(palabras)} palabras, el piso es ${String(PISO_PALABRAS)}`);
      }

      // 11 — el aviso de vencimiento no rompe
      if (
        frontmatter.revisarAntesDe !== undefined &&
        frontmatter.revisarAntesDe < new Date().toISOString().slice(0, 10)
      ) {
        process.stderr.write(`aviso — ${id}: venció revisarAntesDe (${frontmatter.revisarAntesDe})\n`);
      }
    }

    // 13 — al revés: entradas del índice sin archivo
    for (const slug of declarados.keys()) {
      if (!vistos.has(slug)) errores.push(`${curso.name}/${slug}: está en course.json y no existe el .mdx`);
    }

    const suma = indice.lessons.reduce((n, l) => n + l.duration, 0);
    if (indice.duration !== suma) {
      errores.push(`${curso.name}: duration ${String(indice.duration)} ≠ ${String(suma)} (suma de lecciones)`);
    }

    // 12 — promesa y noCubre en los cursos terminados
    if (cursoTerminado && (indice.promesa === undefined || indice.noCubre === undefined)) {
      errores.push(`${curso.name}: curso terminado sin promesa/noCubre`);
    }
  }

  // 10 — el anti-clon, entre todos los cierres del corpus
  for (let i = 0; i < firmas.length; i += 1) {
    for (let j = i + 1; j < firmas.length; j += 1) {
      const s = jaccard(firmas[i].firma, firmas[j].firma);
      if (s > UMBRAL_GEMELOS) {
        errores.push(`cierres gemelos (${s.toFixed(2)}): ${firmas[i].id} y ${firmas[j].id}`);
      }
    }
  }

  return errores;
}

if (process.argv[1]?.endsWith('entrenamientos-check.ts')) {
  const errores = await revisarCorpus(resolve(dirname(fileURLToPath(import.meta.url)), '../..'));
  if (errores.length > 0) {
    process.stderr.write(`${errores.join('\n')}\n\n${String(errores.length)} problemas en el corpus\n`);
    process.exit(1);
  }
  process.stdout.write('corpus de entrenamientos: en regla\n');
}
```

- [ ] **Step 4: Wire it up**

En `package.json`:

```json
"entrenamientos:check": "tsx scripts/content/entrenamientos-check.ts",
"verify": "pnpm lint && pnpm type-check && pnpm test && pnpm entrenamientos:check && pnpm build",
```

En `.github/workflows/v2-ci.yml`, después del paso «Guardia del índice de planes»:

```yaml
      - name: Guardia del corpus de entrenamientos
        run: pnpm entrenamientos:check
```

- [ ] **Step 5: Run the tests, then the guard against the real corpus**

Run: `pnpm vitest run --config scripts/vitest.config.ts scripts/content/__tests__/entrenamientos-check.test.ts`
Expected: PASS — 6 tests.

Run: `pnpm entrenamientos:check`
Expected: `corpus de entrenamientos: en regla`. Las 329 están en `cierre: pendiente`, así que no se les exige cierre ni piso. **Si grita, arreglá lo que grita antes de seguir: de acá en adelante esta guardia es la ley.**

- [ ] **Step 6: Commit**

```bash
git add v2/scripts/content/entrenamientos-check.ts v2/scripts/content/__tests__/entrenamientos-check.test.ts v2/package.json ../.github/workflows/v2-ci.yml
git commit -m "feat(v2): guardia del corpus de entrenamientos, con anti-clon, en el CI"
```

---

## Tarea 13: El curso piloto, a mano

Antes de largar 30 agentes conviene probar la plantilla y la guardia contra contenido real. El piloto es `accion-comunitaria`: 8 lecciones, categoría `action`, y ya tiene secciones propias de ejercicio en varias — sirve para ejercitar los dos estados, `puente` y `completo`.

**Files:**
- Modify: las 8 `.mdx` de `content/courses/accion-comunitaria/`, su `course.json`

**Interfaces:**
- Consumes: la guardia de la Tarea 12.
- Produces: el patrón que el prompt de la Tarea 14 va a citar como ejemplo.

- [ ] **Step 1: Leer el curso entero**

Run: `wc -w content/courses/accion-comunitaria/*.mdx && cat content/courses/accion-comunitaria/el-arte-de-convocar-mover-gente-sin-manipularla.mdx`

- [ ] **Step 2: Decidir el estado de cada lección**

Para cada una de las 8: si ya tiene una sección propia de ejercicio o caso, va a `puente`; si no, a `completo`. Anotar la decisión antes de escribir.

- [ ] **Step 3: Escribir los cierres**

Para cada lección, en el frontmatter:

```yaml
cierre: completo
fuentes:
  - url: https://www.argentina.gob.ar/justicia/derechofacil/leysimple/asociaciones-civiles
    titulo: Asociaciones civiles — requisitos de constitución
    consultada: 2026-08-12
```

Y al final del cuerpo. Esto es el cierre completo de `el-arte-de-convocar-mover-gente-sin-manipularla.mdx`, escrito de punta a punta — es el molde que va a citar el prompt de la Tarea 14, así que tiene que quedar bien:

```markdown
### El caso

En 2016 el Congreso sancionó la Ley 27.275 de Acceso a la Información Pública:
cualquier persona puede pedirle información a cualquier organismo del Estado
nacional, y el organismo tiene quince días hábiles para contestar, prorrogables
por quince más. No hace falta explicar para qué la querés. La mayoría de las
asambleas que se arman por un reclamo concreto no la usan nunca: piden una
reunión con el funcionario y esperan. La diferencia entre las dos cosas es que
la reunión depende de la voluntad del otro y el pedido no: acá el silencio
también es una respuesta, y se puede llevar a la Justicia.

### La palanca

Antes de convocar a la próxima reunión, conseguí un dato. Elegí el reclamo más
concreto que tenga tu grupo y pedí por escrito el expediente donde está trabado,
en el organismo que corresponda. Una asamblea que arranca con un papel adelante
discute otra cosa que una asamblea que arranca con bronca.
Entrá al sitio de la Agencia de Acceso a la Información Pública y presentá el
pedido esta semana.

### El puente

PLANREP es lo que pasa cuando este pedido deja de depender de la insistencia de
un vecino: la respuesta obligatoria, con plazo y con consecuencia, escrita como
norma.
```

**Antes de dejar la fuente, abrila.** Si la URL exacta cambió, poné la que resuelve: un link roto es una fuente que no existe, y eso es peor que no citar nada.

**Reglas duras:** ninguna pieza repite el `summary`; ningún dato sin fuente verificable con fecha; voseo siempre; sin emojis; encabezados `###`; *La palanca* cierra con imperativo en voseo (acá, «Entrá»); *El puente* nombra algo que existe (acá, `PLANREP`, que está en `content/planes/PLANREP.mdx`).

- [ ] **Step 4: Recalcular minutaje y correr la guardia**

Run: `pnpm entrenamientos:minutaje --escribir && pnpm entrenamientos:check`
Expected: `corpus de entrenamientos: en regla`.

Si grita por el piso de 600 palabras, hay que engordar esa lección: es el trabajo real, no un error de la guardia.

- [ ] **Step 5: Escribir `promesa` y `noCubre` en `course.json`**

```json
"promesa": [
  "Convocar a una primera reunión de vecinos sin depender de un puntero",
  "Distinguir un reclamo de una propuesta y escribir la segunda",
  "Sostener un grupo después de la euforia de la primera semana"
],
"noCubre": ["Asesoramiento legal", "Cómo conseguir financiamiento estatal"]
```

- [ ] **Step 6: Verificar en pantalla y commitear**

Run: `pnpm dev` y abrir `/entrenamientos/accion-comunitaria` y una lección.
Expected: el cierre se lee como parte de la lección, los minutos son creíbles.

```bash
git add v2/content/courses/accion-comunitaria
git commit -m "content(v2): accion-comunitaria — cierres propios, el curso piloto del Ciclo 1"
```

---

## Tarea 14: Los 30 cursos restantes, un agente por curso

**Escala:** 30 agentes. Es más que la guía por defecto de esta sesión (15), y se hace así porque el pedido es explícitamente «un agente por curso». La herramienta limita la concurrencia real a `min(16, núcleos - 2)`, así que corren en dos oleadas y el resto espera en cola. Cada agente escribe **sólo dentro de su propio directorio de curso**, así que no hay conflictos de archivos y **no hacen falta worktrees**.

**Files:**
- Create: `scripts/content/agentes/prompt-curso.md` (el prompt, versionado)
- Modify: los `.mdx` y `course.json` de los 30 cursos restantes

**Interfaces:**
- Consumes: el patrón de la Tarea 13, la guardia de la Tarea 12.
- Produces: por curso, un objeto `{ curso, escritas, pendientes, sinFuente }` que la Tarea 15 usa para el repaso.

- [ ] **Step 1: Versionar el prompt**

Crear `scripts/content/agentes/prompt-curso.md` con el texto exacto que va a recibir cada agente. Se versiona porque es contenido, no andamio: si mañana un cierre está mal, se audita el prompt que lo produjo.

```markdown
# Cierres del curso `{CURSO}`

Sos editor de contenido de El Instante del Hombre Gris. Trabajás **sólo** en
`v2/content/courses/{CURSO}/`. No toques ningún archivo fuera de ese directorio.
**No corras git.** Nunca.

## Qué hay que hacer

Para cada `.mdx` del curso (menos `course.json` y `quiz.json`):

1. Leé la lección entera.
2. Decidí su estado:
   - Si el cuerpo **ya tiene** una sección propia de ejercicio, caso práctico o
     aplicación escrita por el autor → `cierre: puente`. Sólo le agregás *El puente*.
   - Si no → `cierre: completo`. Le agregás las tres piezas.
3. Escribí el cierre al final del cuerpo, con encabezados `###`:

   ### El caso
   60 a 160 palabras. Un hecho argentino **verificable** con un número, una norma
   o un organismo nombrado, que muestre la idea de la lección funcionando o
   fallando en la realidad. Exige fuente (paso 4).

   ### La palanca
   40 a 120 palabras. Qué hace esta semana quien leyó esto, con el organismo, el
   trámite, el lugar o la persona nombrada. La **última línea** arranca con un
   imperativo en voseo (pedí, entrá, buscá, anotá, presentá, escribí, mirá…).

   ### El puente
   Una a tres líneas. Nombrá al menos un PLAN, ensayo, capítulo de la crónica o
   curso que **exista de verdad**. Sacá la lista con:
   `ls v2/content/planes/*.mdx v2/content/ensayos/*.mdx v2/content/cronica/*.mdx`
   y `ls v2/content/courses/`.

4. En el frontmatter, agregá el estado y las fuentes:

   cierre: completo
   fuentes:
     - url: https://…
       titulo: …
       consultada: 2026-08-12

   Y `revisarAntesDe: AAAA-MM-DD` si el dato es perecedero (categorías de
   monotributo, escalas, montos, trámites).

5. Si la lección tiene **menos de 600 palabras** contando el cierre, engordá el
   cuerpo hasta pasar ese piso: más caso argentino concreto, más mecanismo, menos
   generalidad. No rellenes con frases de transición.

6. Cuando termines las lecciones, escribí en `course.json`:
   `"promesa"`: 3 a 5 verbos observables de lo que va a poder hacer quien lo
   termine. `"noCubre"`: 2 o 3 exclusiones honestas.

## Reglas que rompen el build si las violás

- **Rioplatense siempre.** Nunca «tienes», «puedes», «debes», «identifica»,
  «resume». Sí «tenés», «podés», «debés», «identificá», «resumí».
- **Ninguna pieza puede parecerse a la de otra lección.** Hay un validador que
  compara todos los cierres del corpus por trigramas y rompe el build si dos se
  parecen más de 0,55. Escribí cada cierre desde su lección, no desde una fórmula.
- **Ninguna pieza repite el `summary`** de su propia lección.
- **Nada de emojis.** Nada de encabezados `####` o más profundos. Nada de
  `<table>` en HTML.
- **Ningún dato sin fuente.** Y la fuente tiene que existir: verificala con
  WebSearch o WebFetch antes de citarla. Preferí `argentina.gob.ar`, INDEC,
  InfoLeg, Boletín Oficial, sitios provinciales o municipales oficiales.

## Cuando no puedas verificar

Si no encontrás una fuente real para el caso de una lección, **no inventes el
dato**. Dejá esa lección en `cierre: pendiente`, sin cierre, y reportala. Una
lección pendiente es honesta; un número inventado es lo que este ciclo vino a
borrar.

## Qué devolvés

Un objeto JSON con: `curso`, `escritas` (slugs con cierre nuevo), `pendientes`
(slugs que dejaste sin cierre y por qué), `sinFuente` (afirmaciones que quisiste
usar y no pudiste verificar), `engordadas` (slugs que estaban bajo 600 palabras).
```

```bash
git add v2/scripts/content/agentes/prompt-curso.md
git commit -m "docs(v2): el prompt que escribe los cierres, versionado"
```

- [ ] **Step 2: Lanzar el fan-out**

Un `Workflow` con un agente por curso. Los 30 slugs van en `args`; el script no
lee el disco (no puede) y `Math.random`/`Date.now` no existen ahí adentro.

```js
export const meta = {
  name: 'entrenamientos-cierres',
  description: 'Un agente por curso escribe los cierres de tres piezas del Ciclo 1',
  phases: [{ title: 'Escribir', detail: 'un agente por curso, sólo su directorio' }],
}

const CURSOS = args // los 30 slugs, sin accion-comunitaria (piloto, Tarea 13)

const ESQUEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['curso', 'escritas', 'pendientes', 'sinFuente', 'engordadas'],
  properties: {
    curso: { type: 'string' },
    escritas: { type: 'array', items: { type: 'string' } },
    pendientes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['leccion', 'motivo'],
        properties: { leccion: { type: 'string' }, motivo: { type: 'string' } },
      },
    },
    sinFuente: { type: 'array', items: { type: 'string' } },
    engordadas: { type: 'array', items: { type: 'string' } },
  },
}

const PROMPT = (curso) => `Leé v2/scripts/content/agentes/prompt-curso.md y seguilo al pie de la letra para el curso \`${curso}\`. Donde el documento dice {CURSO}, es ${curso}. Ejemplo ya terminado y aprobado: v2/content/courses/accion-comunitaria/ — mirá dos de sus lecciones antes de escribir, para tomar el registro. No toques nada fuera de v2/content/courses/${curso}/. No corras git.`

const resultados = await parallel(
  CURSOS.map((curso) => () =>
    agent(PROMPT(curso), { label: `cierres:${curso}`, phase: 'Escribir', schema: ESQUEMA }),
  ),
)

const vivos = resultados.filter(Boolean)
log(`${vivos.length}/${CURSOS.length} cursos escritos`)
return {
  escritas: vivos.reduce((n, r) => n + r.escritas.length, 0),
  pendientes: vivos.flatMap((r) => r.pendientes.map((p) => `${r.curso}/${p.leccion}: ${p.motivo}`)),
  sinFuente: vivos.flatMap((r) => r.sinFuente),
  engordadas: vivos.reduce((n, r) => n + r.engordadas.length, 0),
}
```

Lanzarlo con `args` = los 30 slugs de `ls content/courses/ | grep -v accion-comunitaria`.

- [ ] **Step 3: Recalcular minutaje y correr la guardia**

Run: `pnpm entrenamientos:minutaje --escribir && pnpm entrenamientos:check 2>&1 | tail -40`
Expected: una lista de problemas — **es lo esperado en la primera pasada**. Los gemelos y los pisos se resuelven en la Tarea 15.

- [ ] **Step 4: Commit por curso**

Un commit por curso, con rutas explícitas (hay sesiones concurrentes en este repo):

```bash
for c in $(ls content/courses/ | grep -v accion-comunitaria); do
  git add "v2/content/courses/$c"
  git commit -m "content(v2): $c — cierres propios del Ciclo 1"
done
```

---

## Tarea 15: Resolver gemelos y pisos

**Files:**
- Modify: las lecciones que la guardia nombre

**Interfaces:**
- Consumes: la salida de `pnpm entrenamientos:check`.
- Produces: la guardia en verde.

- [ ] **Step 1: Juntar la lista de problemas**

Run: `pnpm entrenamientos:check 2>&1 | tee /tmp/check.txt; grep -c gemelos /tmp/check.txt`

- [ ] **Step 2: Reescribir la segunda de cada par de gemelos**

Para cada par `cierres gemelos (0.xx): A y B`, se reescribe **B** (A queda como estaba, para no encadenar reescrituras). Un agente por par, en paralelo, con este prompt:

```
El cierre de v2/content/courses/{B}.mdx se parece demasiado (Jaccard {S}) al de
v2/content/courses/{A}.mdx, y eso rompe la guardia anti-clon.

Leé las dos lecciones. Reescribí SOLO el cierre de {B} para que hable de su
propia lección: otro caso argentino, otra fuente, otra palanca. No toques {A}.
No corras git. Las reglas están en v2/scripts/content/agentes/prompt-curso.md.
Cuando termines, corré `pnpm entrenamientos:check 2>&1 | grep {B}` y no pares
hasta que no salga nada.
```

- [ ] **Step 3: Engordar lo que sigue bajo el piso**

Para cada `N palabras, el piso es 600`: un agente por lección, con el mandato de engordar el cuerpo con caso argentino concreto y mecanismo, no con transiciones.

- [ ] **Step 4: Iterar hasta verde**

Run: `pnpm entrenamientos:minutaje --escribir && pnpm entrenamientos:check`
Expected: `corpus de entrenamientos: en regla`. Repetir los pasos 2 y 3 hasta llegar ahí.

- [ ] **Step 5: Commit**

```bash
git add v2/content/courses
git commit -m "content(v2): resueltos los cierres gemelos y los pisos de palabras"
```

---

## Tarea 16: Cerrar el ciclo

**Files:**
- Modify: `docs/DEUDAS.md` (D-052 a D-055 a resueltas), `scripts/content/entrenamientos-check.ts` (el piso ya no espera), `docs/specs/2026-08-12-entrenamientos-ciclo-1-el-cuerpo.md` (nota de cierre)

- [ ] **Step 1: Verificar que no queda ninguna pendiente**

Run: `grep -rc "cierre: pendiente" content/courses/*/*.mdx | grep -v ':0' || echo "cero pendientes"`
Expected: `cero pendientes`.

- [ ] **Step 2: Endurecer la guardia**

En `scripts/content/entrenamientos-check.ts`, agregar al final del recorrido de cada lección:

```ts
      if (parsed.data.cierre === 'pendiente') {
        errores.push(`${id}: el Ciclo 1 terminó — ninguna lección puede quedar en «pendiente»`);
      }
```

- [ ] **Step 3: La verificación completa**

Run: `pnpm verify`
Expected: PASS de punta a punta, con `entrenamientos:check` incluido.

- [ ] **Step 4: Los números finales, medidos**

Run: `pnpm entrenamientos:reporte && head -12 docs/reportes/2026-08-12-entrenamientos-inventario.md`

Anotar los reales en la spec (sección 5) al lado de los estimados: palabras propias (estimado 245.610), minutos totales (estimado 1.220 = 20,3 h), palabras de cola (0).

- [ ] **Step 5: Marcar las deudas resueltas**

En `docs/DEUDAS.md`, pasar D-052, D-053, D-054 y D-055 a **Resuelta** con la fecha y el commit, en la entrada y en el índice. **D-056 queda abierta**: las fuentes ya están, pero los puentes a los PLANes son el Ciclo 2.

- [ ] **Step 6: Commit**

```bash
git add ../docs/DEUDAS.md v2/scripts/content/entrenamientos-check.ts v2/docs/specs/2026-08-12-entrenamientos-ciclo-1-el-cuerpo.md v2/docs/reportes
git commit -m "chore(v2): cierra el Ciclo 1 de entrenamientos — D-052 a D-055 resueltas"
```

---

## Autorrevisión del plan contra la spec

| Decisión de la spec | Tarea |
|---|---|
| 1 — la cola se borra, no se reescribe | 5 |
| 2 — tres anclas para el corte | 2, 5 |
| 3 — un solo minutaje, calculado | 6 |
| 4 — piso de 600 palabras, curso por curso | 12 (guardia), 14–15 (trabajo) |
| 5 — `cierre:` con tres valores | 11, 13, 14, 16 |
| 6 — plantilla de tres piezas con evidencia | 10, 13, 14 |
| 7 — voseo con dos listas | 4 |
| 8 — poda estructural | 7 |
| 9 — limpieza de la fuente | 8 |
| 10 — `promesa` / `noCubre` | 11 (schema), 13–14 (contenido) |
| 11 — fuentes con fecha y vencimiento que avisa | 11, 12 |
| 12 — lo mecánico primero, con reporte | 3, y el orden entero |
| §4 — las doce guardias | 12 |

Sin huecos. Lo único que el plan agrega a la spec es un descubrimiento de última hora: `build-content.ts` no corre en ningún lado, así que la guardia entra al CI por su cuenta (Tarea 12) en vez de colgarse de él.
