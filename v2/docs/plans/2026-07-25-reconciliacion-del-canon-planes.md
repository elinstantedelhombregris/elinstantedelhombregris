# Reconciliación del canon de planes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que `/planes` sirva los 23 documentos reales del corpus (46.234 líneas) en vez de los 23 stubs de 20 líneas, con el índice mostrando los dos registros de título y el lector plegando la ficha del expediente.

**Architecture:** Un script one-shot deriva `v2/content/planes/*.mdx` desde `Iniciativas Estratégicas/PLAN*_Argentina_ES.md`, y emite además un índice generado con solo el frontmatter. El registry del cliente se parte en dos: índice eager (KB) para todos los conteos, cuerpos lazy (`import()` por plan) para el lector. La salida del script se commitea y se revisa a ojo; en runtime no hay ningún parser adivinando.

**Tech Stack:** TypeScript, tsx (scripts), Vite `import.meta.glob`, React 18 + wouter, vitest + @testing-library/react, marked, size-limit.

## Global Constraints

- **Spec de referencia:** `docs/specs/2026-07-25-reconciliacion-del-canon-planes.md`. Toda decisión ambigua se resuelve ahí.
- **Cero prosa nueva del implementador.** `title` y `nombreInstitucional` se transcriben de la portada del documento; `summary` se copia verbatim de `SocialJusticeHub/shared/strategic-initiatives.ts`; `orderIndex` sale del `ordinal` de `SocialJusticeHub/shared/arquitecto-data.ts`.
- **Ningún literal `22` en JSX.** Todo conteo visible se interpola desde `PLAN_COUNT`, que se deriva del registry.
- **Español rioplatense** en todo texto visible y en los comentarios de código nuevo (el repo v2 comenta en español).
- **`Iniciativas Estratégicas/` es el taller y `v2/content/planes/` la edición derivada.** Ninguna tarea escribe en el taller como efecto de la migración: la derivación va siempre taller → edición, nunca al revés. La única excepción es la Task 9, que corrige acentuación *en el taller* y después re-deriva — y va en su propio commit por eso mismo.
- **Marcador literal de la ficha:** `## Ficha del expediente` — string exacto, único por documento.
- **Presupuesto de bundle:** `pnpm size` impone 250 KB gzip a la home. `PLAN_REGISTRY` entra en ese chunk vía `landing-data.ts`, así que los cuerpos NO pueden ser eager.
- **Commits:** conventional commits (commitlint activo). Alcance `content`, `web` o `scripts`.

## File Structure

**Crear**

| Archivo | Responsabilidad |
|---|---|
| `scripts/content/split-documento-plan.ts` | Partir un documento del corpus en cabecera / cuerpo / parches. Función pura, sin I/O. |
| `scripts/content/__tests__/split-documento-plan.test.ts` | Unit tests de la función + invariantes sobre los 23 documentos reales. |
| `scripts/content/extraer-fuentes-planes.ts` | One-shot: lee el corpus + los dos módulos de v1 y emite la tabla de fuentes. |
| `scripts/content/planes-sources.ts` | **Generado una vez, después de propiedad humana.** Los 23 registros de frontmatter. |
| `scripts/content/__tests__/planes-sources.test.ts` | Canon de la tabla: 23 entradas, códigos únicos, ordinales contiguos, archivos fuente existentes. |
| `scripts/content/migrate-planes-v1-to-v2.ts` | Emite los 23 `.mdx` y el índice generado. |
| `scripts/content/verify-planes-index.ts` | Guardia de CI: re-deriva el índice desde el frontmatter y lo compara con el commiteado. |
| `apps/web/src/lib/planes-index.generated.ts` | Índice eager (solo frontmatter). |

**Modificar**

| Archivo | Cambio |
|---|---|
| `package.json` | devDeps `tsx` y `vitest`; scripts `planes:migrar`, `planes:check`, `test:scripts`. |
| `../.github/workflows/v2-ci.yml` | Pasos de guardia del índice y tests de scripts. |
| `apps/web/src/lib/plans-registry.ts` | Índice desde el generado; cuerpo lazy vía `cargarCuerpoPlan`. |
| `apps/web/src/pages/Planes/sections/IndicePlanes.tsx` | Nombre institucional en el pliegue. |
| `apps/web/src/pages/PlanDetail.tsx` | Cuerpo asíncrono + ficha plegada. |
| `apps/web/src/pages/Planes/__tests__/IndicePlanes.test.tsx` | Códigos y orden reales. |
| `apps/web/src/pages/__tests__/PlanDetail.test.tsx` | Códigos reales + carga asíncrona + ficha. |
| `apps/web/src/index.css` | La ficha se imprime abierta. |
| `content/planes/*.mdx` | Los 23 stubs se reemplazan por los 23 derivados. |

`apps/web/src/pages/__tests__/Planes.test.tsx` **no se toca**: no nombra ningún código, solo interpola `PLAN_COUNT`.

---

### Task 1: Infraestructura para correr y testear los scripts

Hoy `tsx` y `vitest` no resuelven desde la raíz de `v2` (`pnpm exec tsx --version` → `Command "tsx" not found`), y `scripts/vitest.config.ts` existe pero nada lo invoca. Sin esto ninguna tarea siguiente se puede correr.

**Files:**
- Modify: `package.json` (raíz de `v2`)
- Modify: `scripts/vitest.config.ts`
- Modify: `../.github/workflows/v2-ci.yml`

**Interfaces:**
- Consumes: nada.
- Produces: los comandos `pnpm planes:migrar`, `pnpm planes:check`, `pnpm test:scripts`.

- [ ] **Step 1: Agregar las devDependencies**

En `package.json`, dentro de `devDependencies`, agregar (manteniendo el orden alfabético):

```json
    "tsx": "^4.19.2",
    "vitest": "^2.1.8"
```

- [ ] **Step 2: Agregar los scripts**

En `package.json`, dentro de `scripts`, agregar después de `"test:e2e"`:

```json
    "test:scripts": "vitest run --config scripts/vitest.config.ts",
    "planes:migrar": "tsx scripts/content/migrate-planes-v1-to-v2.ts",
    "planes:check": "tsx scripts/content/verify-planes-index.ts",
```

Y cambiar la línea de `"test"` para que incluya los scripts:

```json
    "test": "pnpm test:unit && pnpm test:scripts && pnpm test:integration",
```

- [ ] **Step 3: Instalar**

Run: `pnpm install`
Expected: instala `tsx` y `vitest` en la raíz; `pnpm-lock.yaml` se actualiza.

- [ ] **Step 4: Verificar que ambos binarios resuelven**

Run: `pnpm exec tsx --version && pnpm exec vitest --version`
Expected: dos números de versión, sin `Command not found`.

- [ ] **Step 5: Anclar el `root` del config de scripts**

`scripts/vitest.config.ts` no declara `root`, y Vitest lo hace default a `process.cwd()` — no al directorio del config. Como `pnpm test:scripts` corre siempre con `cwd = v2/`, su `include: ['content/__tests__/**/*.test.ts']` se resuelve contra `v2/content/__tests__/**`, que no existe, y no encuentra ningún test.

En `scripts/vitest.config.ts`, agregar la resolución de `root` con el mismo idioma que ya usa el repo (`fileURLToPath(new URL(...))`), más un comentario de una línea explicando por qué es explícito. El string del script `test:scripts` no cambia: el arreglo va en el config.

- [ ] **Step 5b: Verificar que el runner de scripts encuentra los tests**

Run: `pnpm test:scripts`
Expected: corre `scripts/content/__tests__/html-to-md.test.ts` (16 tests) y pasa. **No** debe decir `No test files found` — si lo dice, el `root` quedó mal.

- [ ] **Step 6: Cablear CI**

En `../.github/workflows/v2-ci.yml`, en el job `build-and-test`, después del paso `Unit tests`, insertar:

```yaml
      - name: Script tests
        run: pnpm test:scripts
```

**Solo ese paso.** El de `pnpm planes:check` se cablea en la Task 5, que es donde nace `verify-planes-index.ts`: wirearlo acá dejaría CI en rojo durante cuatro tareas.

- [ ] **Step 7: Commit**

```bash
git add v2/package.json v2/pnpm-lock.yaml v2/scripts/vitest.config.ts .github/workflows/v2-ci.yml
git commit -m "chore(v2): tsx y vitest en la raíz + runner de tests de scripts"
```

---

### Task 2: Partir un documento del corpus en tres

La función pura que separa cabecera de auditoría, cuerpo editorial y parches post-auditoría. Los 23 documentos no son homogéneos: **PLANDIG abre con la portada ASCII y tiene un `---` en la línea 32 antes de su cabecera** (así que "cortar en el primer `---`" está mal), **PLANRUTA abre con `# PLANRUTA — Protocolo Nacional…`** y su cabecera termina en la línea 13, y **PLANMOV** tiene como primer `## ` un `## Vigésimo Tercer Mandato del Proyecto ¡BASTA!` en vez de un preámbulo.

**Files:**
- Create: `scripts/content/split-documento-plan.ts`
- Test: `scripts/content/__tests__/split-documento-plan.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `partirDocumentoPlan(raw: string): DocumentoPartido` con `DocumentoPartido = { cabecera: string; cuerpo: string; parches: string }`. Lo usa Task 4.

- [ ] **Step 1: Escribir el test que falla**

Crear `scripts/content/__tests__/split-documento-plan.test.ts`:

```ts
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { partirDocumentoPlan } from '../split-documento-plan';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const CORPUS = resolve(SCRIPT_DIR, '../../../../Iniciativas Estratégicas');

const archivosCorpus = readdirSync(CORPUS).filter(
  (f) => f.startsWith('PLAN') && f.endsWith('_Argentina_ES.md'),
);

describe('partirDocumentoPlan', () => {
  it('separa la cabecera de auditoría del cuerpo', () => {
    const raw = [
      '> **REVISION_PROFUNDA:** completed 2026-04-28',
      '>',
      '> **Presupuesto canónico:** 1.8B/año',
      '',
      '---',
      '',
      '## PREÁMBULO',
      '',
      'Texto del plan.',
    ].join('\n');

    const { cabecera, cuerpo, parches } = partirDocumentoPlan(raw);

    expect(cabecera).toContain('REVISION_PROFUNDA');
    expect(cabecera).toContain('Presupuesto canónico');
    expect(cuerpo).toContain('## PREÁMBULO');
    expect(cuerpo).not.toContain('REVISION_PROFUNDA');
    expect(parches).toBe('');
  });

  it('encuentra la cabecera aunque el documento abra con la portada ASCII (caso PLANDIG)', () => {
    const raw = [
      '```',
      'TENEMOS LOS DATOS',
      '```',
      '',
      '---',
      '',
      '> **REVISION_PROFUNDA:** completed 2026-04-28',
      '',
      '## PREÁMBULO',
      '',
      'Texto.',
    ].join('\n');

    const { cabecera, cuerpo } = partirDocumentoPlan(raw);

    expect(cabecera).toContain('REVISION_PROFUNDA');
    expect(cuerpo).toContain('TENEMOS LOS DATOS');
    expect(cuerpo).toContain('## PREÁMBULO');
    expect(cuerpo).not.toContain('REVISION_PROFUNDA');
  });

  it('corta los parches post-auditoría desde su heading hasta el final', () => {
    const raw = [
      '> **LAST_AUDIT:** 2026-04-26',
      '',
      '## PREÁMBULO',
      '',
      'Texto.',
      '',
      '## Interconexiones críticas con PLANMOV y PLANTER (post-auditoría 2026-04-26)',
      '',
      'Parche uno.',
      '',
      '## Parche post-auditoría 2026-04-26',
      '',
      'Parche dos.',
    ].join('\n');

    const { cuerpo, parches } = partirDocumentoPlan(raw);

    expect(cuerpo).toContain('## PREÁMBULO');
    expect(cuerpo).not.toContain('Parche uno.');
    expect(parches).toContain('Interconexiones críticas');
    expect(parches).toContain('Parche uno.');
    expect(parches).toContain('Parche dos.');
  });

  it('tolera un documento sin parches', () => {
    const raw = ['> **LAST_AUDIT:** 2026-04-26', '', '## PREÁMBULO', '', 'Texto.'].join('\n');
    expect(partirDocumentoPlan(raw).parches).toBe('');
  });

  it('tolera un documento sin cabecera de auditoría', () => {
    const raw = ['# PLANX', '', 'Texto.'].join('\n');
    const { cabecera, cuerpo } = partirDocumentoPlan(raw);
    expect(cabecera).toBe('');
    expect(cuerpo).toContain('# PLANX');
  });

  it('no pierde ni duplica contenido: los 23 documentos conservan todas sus líneas no vacías', () => {
    const noVacias = (s: string) =>
      s
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l !== '');

    for (const archivo of archivosCorpus) {
      const raw = readFileSync(resolve(CORPUS, archivo), 'utf8');
      const { cabecera, cuerpo, parches } = partirDocumentoPlan(raw);

      const original = [...noVacias(raw)].sort();
      const partido = [...noVacias(cabecera), ...noVacias(cuerpo), ...noVacias(parches)].sort();

      expect(partido, `${archivo}: el split perdió o duplicó líneas`).toEqual(original);
    }
  });

  it('los 23 documentos reales del corpus se parten con cuerpo no vacío', () => {
    expect(archivosCorpus).toHaveLength(23);

    for (const archivo of archivosCorpus) {
      const raw = readFileSync(resolve(CORPUS, archivo), 'utf8');
      const { cabecera, cuerpo, parches } = partirDocumentoPlan(raw);

      expect(cuerpo.length, `${archivo}: cuerpo vacío`).toBeGreaterThan(500);
      expect(cabecera + parches, `${archivo}: ni cabecera ni parches`).not.toBe('');
      expect(cuerpo, `${archivo}: quedó jerga de auditoría en el cuerpo`).not.toContain(
        'REVISION_PROFUNDA',
      );
    }
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `pnpm test:scripts`
Expected: FAIL — `Failed to resolve import "../split-documento-plan"`.

- [ ] **Step 3: Escribir la implementación**

Crear `scripts/content/split-documento-plan.ts`:

```ts
/**
 * Parte un documento del corpus (`Iniciativas Estratégicas/PLAN*_Argentina_ES.md`)
 * en sus tres capas. Función pura: sin I/O, para poder testearla contra los 23
 * documentos reales sin efectos.
 *
 * El corpus NO es homogéneo. Casos verificados 2026-07-25:
 *  - PLANDIG abre con la portada ASCII y tiene un `---` en la línea 32, ANTES de
 *    su cabecera de auditoría: cortar en el primer `---` parte mal el documento.
 *  - PLANRUTA abre con un H1 y su cabecera termina en la línea 13.
 *  - PLANMOV no tiene `## PREÁMBULO`; su primer H2 es «Vigésimo Tercer Mandato».
 * Por eso la cabecera se busca como «el primer bloque contiguo de líneas `>`»
 * y no por posición.
 */

export interface DocumentoPartido {
  /** Blockquote de auditoría del arranque. '' si el documento no tiene. */
  cabecera: string;
  /** El documento como se lee: portada + preámbulo + secciones. */
  cuerpo: string;
  /** Parches post-auditoría del final. '' si el documento no tiene. */
  parches: string;
}

/** Dentro de cuántas líneas del arranque se acepta la cabecera de auditoría. */
const VENTANA_CABECERA = 80;

const RE_PARCHE = /^##\s+.*(post-auditor|parche|interconexiones)/i;

function esLineaCita(linea: string): boolean {
  return linea.startsWith('>');
}

export function partirDocumentoPlan(raw: string): DocumentoPartido {
  const lineas = raw.split('\n');

  // 1) Parches: desde el primer heading de parche hasta el final.
  let inicioParches = lineas.length;
  for (let i = 0; i < lineas.length; i++) {
    if (RE_PARCHE.test(lineas[i] ?? '')) {
      inicioParches = i;
      break;
    }
  }
  const parches = lineas.slice(inicioParches).join('\n').trim();

  // 2) Cabecera: el primer bloque contiguo de líneas `>` dentro de la ventana.
  const limite = Math.min(VENTANA_CABECERA, inicioParches);
  let inicioCabecera = -1;
  for (let i = 0; i < limite; i++) {
    if (esLineaCita(lineas[i] ?? '')) {
      inicioCabecera = i;
      break;
    }
  }

  let finCabecera = -1;
  if (inicioCabecera !== -1) {
    finCabecera = inicioCabecera;
    for (let i = inicioCabecera; i < inicioParches; i++) {
      const linea = lineas[i] ?? '';
      if (esLineaCita(linea)) {
        finCabecera = i;
        continue;
      }
      // Una línea en blanco entre dos citas no corta el bloque.
      if (linea.trim() === '' && esLineaCita(lineas[i + 1] ?? '')) continue;
      break;
    }
  }

  const cabecera =
    inicioCabecera === -1 ? '' : lineas.slice(inicioCabecera, finCabecera + 1).join('\n').trim();

  // 3) Cuerpo: todo lo demás, con el hueco de la cabecera cerrado.
  const antes = inicioCabecera === -1 ? [] : lineas.slice(0, inicioCabecera);
  const despues =
    inicioCabecera === -1
      ? lineas.slice(0, inicioParches)
      : lineas.slice(finCabecera + 1, inicioParches);

  // Cerramos solo la costura donde se sacó la cabecera: recortamos líneas en
  // blanco sobrantes en cada punta y unimos con un único blanco de por medio.
  // Nunca tocamos el resto del cuerpo — un regex global sobre todo el texto
  // borra separadores `---` que son estructura real del documento, no
  // artefactos del corte.
  while (antes.length > 0 && (antes[antes.length - 1] ?? '').trim() === '') antes.pop();
  while (despues.length > 0 && (despues[0] ?? '').trim() === '') despues.shift();

  const cuerpo =
    antes.length > 0 && despues.length > 0
      ? [...antes, '', ...despues].join('\n').trim()
      : [...antes, ...despues].join('\n').trim();

  return { cabecera, cuerpo, parches };
}
```

**Nada de regexes sobre el cuerpo entero.** La primera versión de esta función colapsaba `\n{3,}` y `---`/`---` adyacentes en todo el texto, y eso borra contenido: PLANRUTA usa `---` · blanco · `---` como divisor real de sección en 10 lugares, y los perdía los 10. La limpieza toca la costura y nada más.

- [ ] **Step 4: Correr el test para verificar que pasa**

Run: `pnpm test:scripts`
Expected: PASS — los 6 tests, incluido el que recorre los 23 documentos reales.

- [ ] **Step 5: Commit**

```bash
git add v2/scripts/content/split-documento-plan.ts v2/scripts/content/__tests__/split-documento-plan.test.ts
git commit -m "feat(scripts): partir los documentos del corpus en cabecera, cuerpo y parches"
```

---

### Task 3: La tabla de fuentes de los 23 planes

Un extractor one-shot lee la portada de cada documento, `strategic-initiatives.ts` y `arquitecto-data.ts`, y emite `planes-sources.ts`. Ese archivo **se commitea y pasa a ser de propiedad humana**: el extractor es andamio para no transcribir 23 fichas a mano, no una dependencia permanente.

Ambos módulos de v1 son importables directo (`strategic-initiatives.ts` no importa nada; `arquitecto-data.ts` solo importa tipos de su hermano).

**Files:**
- Create: `scripts/content/extraer-fuentes-planes.ts`
- Create: `scripts/content/planes-sources.ts` (salida del anterior, después editada a mano)
- Test: `scripts/content/__tests__/planes-sources.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `PLANES_SOURCES: FuentePlan[]` con
  `FuentePlan = { code: string; slug: string; title: string; nombreInstitucional: string; summary: string; orderIndex: number; isMeta: boolean; archivoFuente: string }`.
  Lo usa Task 4.

- [ ] **Step 1: Escribir el extractor**

Crear `scripts/content/extraer-fuentes-planes.ts`:

```ts
/**
 * One-shot: arma la tabla de fuentes de los 23 planes.
 *
 * Run: pnpm tsx scripts/content/extraer-fuentes-planes.ts
 *
 * Salida: scripts/content/planes-sources.ts — que después se REVISA Y SE CORRIGE
 * A MANO. La extracción de títulos desde la portada ASCII es heurística; el
 * archivo emitido es un borrador, no una autoridad.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PLAN_NODES } from '../../../SocialJusticeHub/shared/arquitecto-data';
import { STRATEGIC_INITIATIVES } from '../../../SocialJusticeHub/shared/strategic-initiatives';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const CORPUS = resolve(REPO_ROOT, 'Iniciativas Estratégicas');
const SALIDA = resolve(SCRIPT_DIR, 'planes-sources.ts');

/** PLANRUTA es meta: no está en PLAN_NODES ni en STRATEGIC_INITIATIVES. */
const SUMMARY_PLANRUTA =
  'PLANRUTA es el meta-plan: cómo se arranca la ejecución de los otros 22, cómo se activa la red sin esperar permiso, cómo se sostiene el cambio en momentos de crisis. No es un plan más; es el manual de cómo arrancar todo.';

interface Portada {
  title: string;
  nombreInstitucional: string;
}

/**
 * La portada vive en el primer code fence. Sus primeras líneas son el título
 * evocativo (una o más, hasta la primera línea en blanco); la primera línea
 * posterior que arranca con «Plan Nacional» es el nombre institucional, que
 * puede continuar en la línea siguiente.
 */
function leerPortada(raw: string): Portada {
  const lineas = raw.split('\n');
  const apertura = lineas.findIndex((l) => l.startsWith('```'));
  if (apertura === -1) return { title: '', nombreInstitucional: '' };

  const cierre = lineas.findIndex((l, i) => i > apertura && l.startsWith('```'));
  const portada = lineas.slice(apertura + 1, cierre === -1 ? undefined : cierre);

  const evocativo: string[] = [];
  for (const linea of portada) {
    if (linea.trim() === '') break;
    evocativo.push(linea.trim());
  }

  const iInstitucional = portada.findIndex((l) => l.trim().startsWith('Plan Nacional'));
  let institucional = '';
  if (iInstitucional !== -1) {
    institucional = portada[iInstitucional]?.trim() ?? '';
    const siguiente = portada[iInstitucional + 1]?.trim() ?? '';
    // Nombres largos que siguen en la línea de abajo (caso PLANGEO: «y Plataforma…»).
    if (siguiente !== '' && !/^PLAN[A-Z0-9]*$/.test(siguiente) && siguiente.startsWith('y ')) {
      institucional = `${institucional} ${siguiente}`;
    }
  }

  return {
    title: evocativo.join(' ').replace(/\s+/g, ' ').trim(),
    nombreInstitucional: institucional,
  };
}

function main(): void {
  const archivos = readdirSync(CORPUS)
    .filter((f) => f.startsWith('PLAN') && f.endsWith('_Argentina_ES.md'))
    .sort();

  const filas = archivos.map((archivo) => {
    const code = archivo.replace('_Argentina_ES.md', '');
    const raw = readFileSync(resolve(CORPUS, archivo), 'utf8');
    const { title, nombreInstitucional } = leerPortada(raw);

    const isMeta = code === 'PLANRUTA';
    const nodo = PLAN_NODES.find((p) => p.id === code);
    const iniciativa = STRATEGIC_INITIATIVES.find((i) => i.title === code);

    if (!isMeta && !nodo) throw new Error(`${code}: sin ordinal en arquitecto-data.ts`);
    if (!isMeta && !iniciativa) throw new Error(`${code}: sin summary en strategic-initiatives.ts`);

    return {
      code,
      slug: code.toLowerCase(),
      title,
      nombreInstitucional,
      summary: isMeta ? SUMMARY_PLANRUTA : (iniciativa?.summary ?? ''),
      orderIndex: isMeta ? 0 : (nodo?.ordinal ?? 99),
      isMeta,
      archivoFuente: archivo,
    };
  });

  filas.sort((a, b) => a.orderIndex - b.orderIndex);

  const cuerpo = filas
    .map(
      (f) => `  {
    code: '${f.code}',
    slug: '${f.slug}',
    title: ${JSON.stringify(f.title)},
    nombreInstitucional: ${JSON.stringify(f.nombreInstitucional)},
    summary: ${JSON.stringify(f.summary)},
    orderIndex: ${String(f.orderIndex)},
    isMeta: ${String(f.isMeta)},
    archivoFuente: '${f.archivoFuente}',
  },`,
    )
    .join('\n');

  writeFileSync(
    SALIDA,
    `/**
 * Frontmatter de los 23 planes del canon.
 *
 * Borrador emitido por scripts/content/extraer-fuentes-planes.ts y DESPUÉS
 * CORREGIDO A MANO. Esta tabla es la autoridad: el extractor no se vuelve a
 * correr sin revisar el diff línea por línea.
 *
 * Procedencia — title y nombreInstitucional: portada del documento del corpus.
 * summary: SocialJusticeHub/shared/strategic-initiatives.ts (PLANRUTA: stub v2).
 * orderIndex: ordinal de SocialJusticeHub/shared/arquitecto-data.ts.
 */

export interface FuentePlan {
  code: string;
  slug: string;
  /** Título evocativo de la portada — el que ve el índice cerrado. */
  title: string;
  /** «Plan Nacional de…» — el que aparece en el pliegue. */
  nombreInstitucional: string;
  summary: string;
  orderIndex: number;
  isMeta: boolean;
  /** Nombre del archivo en «Iniciativas Estratégicas/». */
  archivoFuente: string;
}

export const PLANES_SOURCES: readonly FuentePlan[] = [
${cuerpo}
];
`,
    'utf8',
  );

  console.log(`planes-sources.ts emitido con ${String(filas.length)} entradas.`);
}

main();
```

- [ ] **Step 2: Correr el extractor**

Run: `pnpm tsx scripts/content/extraer-fuentes-planes.ts`
Expected: `planes-sources.ts emitido con 23 entradas.`

- [ ] **Step 3: Revisar la salida a mano — este paso NO es opcional**

Abrir `scripts/content/planes-sources.ts` y verificar entrada por entrada:

1. `title` — que sea el título evocativo completo y legible como una frase. Casos conocidos que hay que mirar: `PLANJUS` («La justicia que tenemos no es la justicia que merecemos»), `PLANSAL` («La fábrica de enfermos» — de una sola línea), `PLANMOV` («No se delibera si no se puede llegar / No hay república sin poder circular» — dos frases, decidir si van unidas o se corta en la primera).
2. `nombreInstitucional` — que empiece con «Plan Nacional de» y no arrastre la línea del código. Mirar `PLANGEO`, cuyo nombre sigue en la línea de abajo («y Plataforma de Soberanía Exportable»).
3. `orderIndex` — 1 a 22 sin huecos, `PLANRUTA` en 0.
4. `summary` — que sea prosa completa, sin cortes.

Corregir a mano lo que haga falta. **A partir de acá el extractor no se vuelve a correr.**

- [ ] **Step 4: Escribir el test de canon de la tabla**

Crear `scripts/content/__tests__/planes-sources.test.ts`:

```ts
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { PLANES_SOURCES } from '../planes-sources';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const CORPUS = resolve(SCRIPT_DIR, '../../../../Iniciativas Estratégicas');

describe('PLANES_SOURCES (canon de la tabla de fuentes)', () => {
  it('tiene 23 entradas: 22 temáticas + 1 meta', () => {
    expect(PLANES_SOURCES).toHaveLength(23);
    expect(PLANES_SOURCES.filter((p) => p.isMeta)).toHaveLength(1);
    expect(PLANES_SOURCES.filter((p) => !p.isMeta)).toHaveLength(22);
  });

  it('el meta es PLANRUTA y va en orderIndex 0', () => {
    const meta = PLANES_SOURCES.find((p) => p.isMeta);
    expect(meta?.code).toBe('PLANRUTA');
    expect(meta?.orderIndex).toBe(0);
  });

  it('los ordinales temáticos son 1..22 sin huecos ni repetidos', () => {
    const ordinales = PLANES_SOURCES.filter((p) => !p.isMeta)
      .map((p) => p.orderIndex)
      .sort((a, b) => a - b);
    expect(ordinales).toEqual(Array.from({ length: 22 }, (_, i) => i + 1));
  });

  it('códigos y slugs únicos, y el slug es el código en minúscula', () => {
    expect(new Set(PLANES_SOURCES.map((p) => p.code)).size).toBe(23);
    expect(new Set(PLANES_SOURCES.map((p) => p.slug)).size).toBe(23);
    for (const p of PLANES_SOURCES) {
      expect(p.slug).toBe(p.code.toLowerCase());
    }
  });

  it('ningún campo de texto queda vacío', () => {
    for (const p of PLANES_SOURCES) {
      expect(p.title.length, `${p.code}: title vacío`).toBeGreaterThan(0);
      expect(
        p.nombreInstitucional.length,
        `${p.code}: nombreInstitucional vacío`,
      ).toBeGreaterThan(0);
      expect(p.summary.length, `${p.code}: summary vacío`).toBeGreaterThan(40);
    }
  });

  it('cada archivo fuente existe en el corpus', () => {
    for (const p of PLANES_SOURCES) {
      expect(existsSync(resolve(CORPUS, p.archivoFuente)), `${p.code}: falta ${p.archivoFuente}`).toBe(
        true,
      );
    }
  });
});
```

- [ ] **Step 5: Correr los tests**

Run: `pnpm test:scripts`
Expected: PASS — 6 tests de canon + los de Task 2.

- [ ] **Step 6: Commit**

```bash
git add v2/scripts/content/extraer-fuentes-planes.ts v2/scripts/content/planes-sources.ts v2/scripts/content/__tests__/planes-sources.test.ts
git commit -m "feat(scripts): tabla de fuentes de los 23 planes del canon"
```

---

### Task 4: La migración — emitir los 23 MDX y el índice

**Files:**
- Create: `scripts/content/migrate-planes-v1-to-v2.ts`
- Create: `apps/web/src/lib/planes-index.generated.ts` (salida)
- Modify: `content/planes/*.mdx` (los 23 stubs se reemplazan)

**Interfaces:**
- Consumes: `partirDocumentoPlan` (Task 2), `PLANES_SOURCES` (Task 3).
- Produces: `PLANES_INDEX: readonly EntradaIndicePlan[]` en `apps/web/src/lib/planes-index.generated.ts`, con
  `EntradaIndicePlan = { slug, code, title, nombreInstitucional, summary, orderIndex, isMeta }`. Lo usa Task 6.
  Y los 23 archivos `content/planes/<CODE>.mdx`.

- [ ] **Step 1: Escribir el script de migración**

Crear `scripts/content/migrate-planes-v1-to-v2.ts`:

```ts
/**
 * Deriva la edición publicada de los planes desde el taller.
 *
 * Run: pnpm planes:migrar
 *
 * Lee «Iniciativas Estratégicas/PLAN*_Argentina_ES.md», parte cada documento
 * (ver split-documento-plan.ts) y emite:
 *   - content/planes/<CODE>.mdx — frontmatter + cuerpo editorial + ficha
 *   - apps/web/src/lib/planes-index.generated.ts — solo el frontmatter
 *
 * Destructivo por diseño: borra todo .mdx de content/planes/ que no esté en
 * PLANES_SOURCES (los 23 stubs de arranque). El diff se revisa antes de commitear.
 */
import { readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PLANES_SOURCES } from './planes-sources';
import { partirDocumentoPlan } from './split-documento-plan';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const CORPUS = resolve(REPO_ROOT, 'Iniciativas Estratégicas');
const SALIDA_MDX = resolve(V2_ROOT, 'content/planes');
const SALIDA_INDICE = resolve(V2_ROOT, 'apps/web/src/lib/planes-index.generated.ts');

export const MARCADOR_FICHA = '## Ficha del expediente';

/** Escapa comillas simples para el frontmatter YAML entre comillas simples. */
function yamlSingle(valor: string): string {
  return `'${valor.replace(/'/g, "''")}'`;
}

function componerMdx(fuente: (typeof PLANES_SOURCES)[number]): string {
  const raw = readFileSync(resolve(CORPUS, fuente.archivoFuente), 'utf8');
  const { cabecera, cuerpo, parches } = partirDocumentoPlan(raw);

  const ficha = [cabecera, parches].filter((s) => s !== '').join('\n\n');

  const frontmatter = [
    '---',
    `slug: ${fuente.slug}`,
    `code: ${fuente.code}`,
    `title: ${yamlSingle(fuente.title)}`,
    `nombreInstitucional: ${yamlSingle(fuente.nombreInstitucional)}`,
    `summary: ${yamlSingle(fuente.summary)}`,
    `orderIndex: ${String(fuente.orderIndex)}`,
    `isMeta: ${String(fuente.isMeta)}`,
    'draft: false',
    '---',
  ].join('\n');

  return `${frontmatter}\n\n${cuerpo}\n\n${MARCADOR_FICHA}\n\n${ficha}\n`;
}

function main(): void {
  const esperados = new Set(PLANES_SOURCES.map((p) => `${p.code}.mdx`));

  // 1) Barrer los stubs que no pertenecen al canon.
  for (const archivo of readdirSync(SALIDA_MDX)) {
    if (archivo.endsWith('.mdx') && !esperados.has(archivo)) {
      rmSync(resolve(SALIDA_MDX, archivo));
      console.log(`borrado (fuera del canon): ${archivo}`);
    }
  }

  // 2) Emitir los 23.
  for (const fuente of PLANES_SOURCES) {
    writeFileSync(resolve(SALIDA_MDX, `${fuente.code}.mdx`), componerMdx(fuente), 'utf8');
  }

  // 3) Emitir el índice.
  const filas = PLANES_SOURCES.map(
    (p) => `  {
    slug: '${p.slug}',
    code: '${p.code}',
    title: ${JSON.stringify(p.title)},
    nombreInstitucional: ${JSON.stringify(p.nombreInstitucional)},
    summary: ${JSON.stringify(p.summary)},
    orderIndex: ${String(p.orderIndex)},
    isMeta: ${String(p.isMeta)},
  },`,
  ).join('\n');

  writeFileSync(
    SALIDA_INDICE,
    `/**
 * GENERADO — no editar a mano. Correr \`pnpm planes:migrar\`.
 *
 * Solo el frontmatter de los 23 planes: es lo único que entra eager al bundle.
 * Los cuerpos (5,1 MB) se cargan por \`import()\` desde plans-registry.ts.
 */

export interface EntradaIndicePlan {
  slug: string;
  code: string;
  title: string;
  nombreInstitucional: string;
  summary: string;
  orderIndex: number;
  isMeta: boolean;
}

export const PLANES_INDEX: readonly EntradaIndicePlan[] = [
${filas}
];
`,
    'utf8',
  );

  console.log(`${String(PLANES_SOURCES.length)} planes emitidos + índice generado.`);
}

main();
```

- [ ] **Step 2: Correr la migración**

Run: `pnpm planes:migrar`
Expected: 14 líneas `borrado (fuera del canon): …` (PLANAMB, PLANBAR, PLANBIO, PLANCIE, PLANCOM, PLANCON, PLANCRI, PLANCUI, PLANENE, PLANGEN, PLANINS, PLANTIE, PLANTRA, PLANVEJ) y `23 planes emitidos + índice generado.`

- [ ] **Step 3: Verificar el resultado a ojo**

Run: `ls v2/content/planes | wc -l && wc -l v2/content/planes/*.mdx | tail -1`
Expected: `23` archivos y del orden de 46.000 líneas en total (contra las 584 de los stubs).

Abrir `v2/content/planes/PLANDIG.mdx`, `PLANRUTA.mdx` y `PLANMOV.mdx` — los tres casos raros — y confirmar que:
- el frontmatter tiene los 8 campos y ningún valor quedó vacío,
- el cuerpo arranca con la portada o el H1 del documento, sin jerga de auditoría,
- hay exactamente un `## Ficha del expediente` y debajo está el bloque de auditoría.

- [ ] **Step 4: Verificar el marcador en los 23**

Run: `grep -c "^## Ficha del expediente" v2/content/planes/*.mdx | grep -v ":1$" || echo "OK: exactamente uno en cada archivo"`
Expected: `OK: exactamente uno en cada archivo`

- [ ] **Step 5: Commit**

```bash
git add v2/scripts/content/migrate-planes-v1-to-v2.ts v2/apps/web/src/lib/planes-index.generated.ts v2/content/planes
git commit -m "feat(content): los 23 documentos reales del canon reemplazan a los stubs"
```

---

### Task 5: La guardia del índice

Si alguien edita `planes-index.generated.ts` a mano, o edita el frontmatter de un `.mdx` sin regenerar, CI tiene que fallar.

**Files:**
- Create: `scripts/content/verify-planes-index.ts`

**Interfaces:**
- Consumes: `PLANES_INDEX` (Task 4), los `.mdx` de `content/planes/`.
- Produces: exit code 0 / 1, más el paso de CI que esta misma tarea cablea.

- [ ] **Step 1: Escribir la guardia**

Crear `scripts/content/verify-planes-index.ts`:

```ts
/**
 * Guardia de CI: el índice generado tiene que coincidir con el frontmatter de
 * los .mdx. Corre en v2-ci.yml como `pnpm planes:check`.
 *
 * Run: pnpm planes:check
 */
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { PLANES_INDEX } from '../../apps/web/src/lib/planes-index.generated';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const MDX_DIR = resolve(V2_ROOT, 'content/planes');

const CAMPOS_TEXTO = ['slug', 'code', 'title', 'nombreInstitucional', 'summary'] as const;

function leerFrontmatter(raw: string): Record<string, string> {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  if (!match) return {};
  const fm: Record<string, string> = {};
  for (const linea of (match[1] ?? '').split('\n')) {
    const m = /^([a-zA-Z0-9_]+)\s*:\s*(.*?)\s*$/.exec(linea);
    if (!m?.[1]) continue;
    let valor = m[2] ?? '';
    if (valor.startsWith("'") && valor.endsWith("'")) {
      valor = valor.slice(1, -1).replace(/''/g, "'");
    }
    fm[m[1]] = valor;
  }
  return fm;
}

function main(): void {
  const errores: string[] = [];

  const archivos = readdirSync(MDX_DIR).filter((f) => f.endsWith('.mdx'));
  if (archivos.length !== PLANES_INDEX.length) {
    errores.push(
      `El índice tiene ${String(PLANES_INDEX.length)} entradas y content/planes tiene ${String(archivos.length)} archivos.`,
    );
  }

  const meta = PLANES_INDEX.filter((p) => p.isMeta);
  const tematicos = PLANES_INDEX.filter((p) => !p.isMeta);
  if (meta.length !== 1) errores.push(`Se esperaba 1 plan meta, hay ${String(meta.length)}.`);
  if (tematicos.length !== 22) {
    errores.push(`Se esperaban 22 planes temáticos, hay ${String(tematicos.length)}.`);
  }

  for (const entrada of PLANES_INDEX) {
    const ruta = resolve(MDX_DIR, `${entrada.code}.mdx`);
    let raw: string;
    try {
      raw = readFileSync(ruta, 'utf8');
    } catch {
      errores.push(`${entrada.code}: falta content/planes/${entrada.code}.mdx`);
      continue;
    }

    const fm = leerFrontmatter(raw);
    for (const campo of CAMPOS_TEXTO) {
      if (fm[campo] !== entrada[campo]) {
        errores.push(
          `${entrada.code}.${campo}: el .mdx dice ${JSON.stringify(fm[campo])} y el índice ${JSON.stringify(entrada[campo])}`,
        );
      }
    }
    if (fm.orderIndex !== String(entrada.orderIndex)) {
      errores.push(`${entrada.code}.orderIndex: .mdx=${fm.orderIndex ?? '—'} índice=${String(entrada.orderIndex)}`);
    }
    if (fm.isMeta !== String(entrada.isMeta)) {
      errores.push(`${entrada.code}.isMeta: .mdx=${fm.isMeta ?? '—'} índice=${String(entrada.isMeta)}`);
    }

    const marcadores = raw.split('\n').filter((l) => l === '## Ficha del expediente').length;
    if (marcadores !== 1) {
      errores.push(`${entrada.code}: ${String(marcadores)} marcadores «## Ficha del expediente», se esperaba 1`);
    }
  }

  if (errores.length > 0) {
    console.error('El índice de planes no coincide con el contenido:\n');
    for (const e of errores) console.error(`  · ${e}`);
    console.error('\nCorré `pnpm planes:migrar` y revisá el diff.');
    process.exit(1);
  }

  console.log(`Índice de planes OK: ${String(PLANES_INDEX.length)} entradas coinciden con content/planes/.`);
}

main();
```

- [ ] **Step 2: Verificar que pasa con el contenido correcto**

Run: `pnpm planes:check`
Expected: `Índice de planes OK: 23 entradas coinciden con content/planes/.`, exit 0.

- [ ] **Step 3: Verificar que falla cuando hay drift**

Run:
```bash
cd v2 && sed -i.bak "s/^title: /title: XX /" content/planes/PLANJUS.mdx && pnpm planes:check; echo "exit=$?"; mv content/planes/PLANJUS.mdx.bak content/planes/PLANJUS.mdx
```
Expected: imprime `· PLANJUS.title: el .mdx dice … y el índice …` y `exit=1`. El `mv` final restaura el archivo.

- [ ] **Step 4: Confirmar que quedó restaurado**

Run: `cd v2 && pnpm planes:check && git status --porcelain content/planes`
Expected: `Índice de planes OK: 23 entradas…` y salida vacía de `git status`.

- [ ] **Step 5: Cablear la guardia en CI**

Recién ahora que el script existe. En `../.github/workflows/v2-ci.yml`, en el job `build-and-test`, después del paso `Script tests`, insertar:

```yaml
      - name: Guardia del índice de planes
        run: pnpm planes:check
```

- [ ] **Step 6: Commit**

```bash
git add v2/scripts/content/verify-planes-index.ts ../.github/workflows/v2-ci.yml
git commit -m "feat(scripts): guardia de CI para el índice de planes"
```

---

### Task 6: Registry partido y lector asíncrono con ficha plegada

Hoy `plans-registry.ts` hace `import.meta.glob(..., { eager: true })` sobre `content/planes/*.mdx`, y `landing-data.ts` lo importa, así que el corpus entero caería en el chunk de la home (presupuesto: 250 KB gzip).

**Registry y lector van en la misma tarea a propósito:** sacarle `body` a `PlanRegistryEntry` rompe la compilación de `PlanDetail.tsx` en el acto. Separarlos dejaría un commit que no compila, y un revisor no puede aprobar uno sin el otro.

**Files:**
- Modify: `apps/web/src/lib/plans-registry.ts`
- Modify: `apps/web/src/pages/PlanDetail.tsx`
- Modify: `apps/web/src/index.css`
- Modify: `.size-limit.json`
- Test: `apps/web/src/lib/__tests__/plans-registry.test.ts` (crear)
- Test: `apps/web/src/pages/__tests__/PlanDetail.test.tsx`

**Interfaces:**
- Consumes: `PLANES_INDEX` (Task 4).
- Produces:
  - `PlanRegistryEntry = { slug, code, title, nombreInstitucional, summary, orderIndex, isMeta }` — **sin `body`**.
  - `PLAN_REGISTRY: readonly PlanRegistryEntry[]` ordenado por `orderIndex`.
  - `findPlanByCode(code: string): PlanRegistryEntry | undefined`
  - `findPlanBySlug(slug: string): PlanRegistryEntry | undefined`
  - `cargarCuerpoPlan(code: string): Promise<PlanCuerpo>` con `PlanCuerpo = { cuerpo: string; ficha: string }`.
  `PlanRegistryEntry.nombreInstitucional` lo usa Task 7.

- [ ] **Step 1: Escribir el test que falla**

Crear `apps/web/src/lib/__tests__/plans-registry.test.ts` (misma carpeta y convención que `ensayos-registry.test.ts`, `cronica-registry.test.ts`, etc.):

```ts
import { describe, expect, it } from 'vitest';

import {
  cargarCuerpoPlan,
  findPlanByCode,
  findPlanBySlug,
  PLAN_REGISTRY,
} from '~/lib/plans-registry';

describe('plans-registry (canon + carga diferida)', () => {
  it('canon: 22 temáticos + 1 meta', () => {
    expect(PLAN_REGISTRY.filter((p) => !p.isMeta)).toHaveLength(22);
    expect(PLAN_REGISTRY.filter((p) => p.isMeta)).toHaveLength(1);
  });

  it('viene ordenado por orderIndex y el primero temático es el ordinal 1', () => {
    const ordenes = PLAN_REGISTRY.map((p) => p.orderIndex);
    expect([...ordenes].sort((a, b) => a - b)).toEqual(ordenes);
    expect(PLAN_REGISTRY[0]?.code).toBe('PLANRUTA');
    expect(PLAN_REGISTRY.filter((p) => !p.isMeta)[0]?.code).toBe('PLANJUS');
  });

  it('cada entrada trae los dos registros de título', () => {
    for (const plan of PLAN_REGISTRY) {
      expect(plan.title.length, `${plan.code}: sin título evocativo`).toBeGreaterThan(0);
      expect(
        plan.nombreInstitucional.startsWith('Plan Nacional'),
        `${plan.code}: nombreInstitucional = ${plan.nombreInstitucional}`,
      ).toBe(true);
    }
  });

  it('la entrada del índice NO trae el cuerpo', () => {
    expect(PLAN_REGISTRY[0]).not.toHaveProperty('body');
  });

  it('findPlanByCode y findPlanBySlug encuentran el mismo plan', () => {
    expect(findPlanByCode('planjus')?.code).toBe('PLANJUS');
    expect(findPlanBySlug('planjus')?.code).toBe('PLANJUS');
    expect(findPlanBySlug('planvej')).toBeUndefined();
  });

  it('cargarCuerpoPlan separa cuerpo y ficha', async () => {
    const { cuerpo, ficha } = await cargarCuerpoPlan('PLANJUS');

    expect(cuerpo.length).toBeGreaterThan(1000);
    expect(cuerpo).not.toContain('Ficha del expediente');
    expect(cuerpo).not.toContain('REVISION_PROFUNDA');
    expect(ficha).toContain('REVISION_PROFUNDA');
  });

  it('cargarCuerpoPlan rechaza un código que no existe', async () => {
    await expect(cargarCuerpoPlan('PLANVEJ')).rejects.toThrow(/PLANVEJ/);
  });
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `pnpm --filter @v2/web test:unit src/lib/__tests__/plans-registry.test.ts`
Expected: FAIL — `cargarCuerpoPlan` no está exportado.

- [ ] **Step 3: Reescribir el registry**

Reemplazar el contenido completo de `apps/web/src/lib/plans-registry.ts` por:

```ts
/**
 * Registry de los planes, partido en dos por peso.
 *
 * El índice (frontmatter de los 23) es eager: lo consumen la landing, La idea y
 * La prueba, y son pocos KB. Los cuerpos suman 5,1 MB, así que se cargan con un
 * `import()` por plan — solo el documento que el visitante abrió.
 */
import { PLANES_INDEX } from './planes-index.generated';
import { stripFrontmatter } from './markdown';

export interface PlanRegistryEntry {
  /** Slug en minúscula usado en la URL (ej. «planjus»). */
  slug: string;
  /** Código en mayúscula como está en el frontmatter («PLANJUS»). */
  code: string;
  /** Título evocativo de la portada del documento. */
  title: string;
  /** Nombre institucional («Plan Nacional de…»). */
  nombreInstitucional: string;
  summary: string;
  orderIndex: number;
  isMeta: boolean;
}

export const PLAN_REGISTRY: readonly PlanRegistryEntry[] = [...PLANES_INDEX].sort(
  (a, b) => a.orderIndex - b.orderIndex,
);

export function findPlanByCode(code: string): PlanRegistryEntry | undefined {
  const upper = code.toUpperCase();
  return PLAN_REGISTRY.find((p) => p.code === upper);
}

export function findPlanBySlug(slug: string): PlanRegistryEntry | undefined {
  const lower = slug.toLowerCase();
  return PLAN_REGISTRY.find((p) => p.slug === lower);
}

/** El H2 literal que separa el documento de su aparato de producción. */
const MARCADOR_FICHA = '## Ficha del expediente';

const cuerpos = import.meta.glob<string>('../../../../content/planes/*.mdx', {
  query: '?raw',
  import: 'default',
});

export interface PlanCuerpo {
  /** El documento como se lee. */
  cuerpo: string;
  /** Cabecera de auditoría + parches, para el pliegue. '' si no hay. */
  ficha: string;
}

export async function cargarCuerpoPlan(code: string): Promise<PlanCuerpo> {
  const cargar = cuerpos[`../../../../content/planes/${code.toUpperCase()}.mdx`];
  if (!cargar) throw new Error(`No hay documento para ${code}`);

  const raw = stripFrontmatter(await cargar());
  const corte = raw.indexOf(MARCADOR_FICHA);
  if (corte === -1) return { cuerpo: raw, ficha: '' };

  return {
    cuerpo: raw.slice(0, corte).trim(),
    ficha: raw.slice(corte + MARCADOR_FICHA.length).trim(),
  };
}
```

- [ ] **Step 4: Correr el test para verificar que pasa**

Run: `pnpm --filter @v2/web test:unit src/lib/__tests__/plans-registry.test.ts`
Expected: PASS — 7 tests.

- [ ] **Step 5: Confirmar qué consumidores rompió el cambio**

Run: `pnpm type-check`
Expected: falla SOLO en `apps/web/src/pages/PlanDetail.tsx` (`plan.body` ya no existe). `landing-data.ts`, `la-idea-data.ts` y `la-prueba-data.ts` NO deben fallar: solo usan `isMeta`, `slug`, `code`, `title`, `summary`.

Si falla alguno de esos tres, pará: significa que usaban `body` y hay que replantear antes de seguir.

- [ ] **Step 6: Actualizar los tests del lector a los códigos reales**

En `apps/web/src/pages/__tests__/PlanDetail.test.tsx`, reemplazar cada aparición del código `PLANSAL` por `PLANJUS` y cada `plansal` de ruta por `planjus`. Las aserciones afectadas son `'PLANSAL · prueba, no doctrina'` → `'PLANJUS · prueba, no doctrina'`; `` `La prueba · expediente 01/${PLAN_COUNT}` `` ya interpola y no cambia de forma.

Como el cuerpo pasa a ser asíncrono, toda aserción sobre el texto del documento cambia de `screen.getByText` a `await screen.findByText`, y su `it` se declara `async`.

(`Planes.test.tsx` no nombra ningún código — solo usa `PLAN_COUNT` — así que no se toca.)

- [ ] **Step 7: Escribir los tests nuevos de carga y ficha**

Agregar al `describe` de `PlanDetail.test.tsx`:

```tsx
  it('muestra el cuerpo del documento después de cargarlo, y la ficha aparte', async () => {
    window.history.pushState({}, '', '/planes/planjus');
    render(<PlanDetail />);

    // El aviso de carga primero.
    expect(screen.getByText('Abriendo el expediente…')).toBeInTheDocument();

    // Después el documento.
    const ficha = await screen.findByText(
      'Ficha del expediente — presupuesto, instrumento legal, tranche, gates',
    );
    expect(ficha).toBeInTheDocument();

    // La ficha entra plegada.
    const details = ficha.closest('details');
    expect(details).not.toBeNull();
    expect(details?.open).toBe(false);
  });

  it('el 404 no intenta cargar ningún cuerpo', () => {
    window.history.pushState({}, '', '/planes/planvej');
    render(<PlanDetail />);

    expect(screen.getByText('Ese plan no está.')).toBeInTheDocument();
    expect(screen.queryByText('Abriendo el expediente…')).not.toBeInTheDocument();
  });
```

- [ ] **Step 8: Correr los tests del lector para verificar que fallan**

Run: `pnpm --filter @v2/web test:unit src/pages/__tests__/PlanDetail.test.tsx`
Expected: FAIL — `Unable to find an element with the text: Abriendo el expediente…`.

- [ ] **Step 9: Reescribir PlanDetail**

En `apps/web/src/pages/PlanDetail.tsx`, cambiar el bloque de imports del arranque por:

```tsx
import { useEffect, useState } from 'react';
import { Link, useRoute } from 'wouter';

import { MdxPapel } from '~/components/papel/MdxPapel';
import { BotonPapel, Kicker, Sello } from '~/components/papel/primitives';
import { cargarCuerpoPlan, findPlanBySlug, type PlanCuerpo } from '~/lib/plans-registry';
import { expedienteDe, PLAN_COUNT } from '~/pages/Planes/la-prueba-data';
```

Agregar, entre `ExpedienteExtraviado` y `PlanDetail`, el componente nuevo:

```tsx
/**
 * El cuerpo del documento llega por `import()` — son hasta 4.473 líneas por
 * plan y no pueden viajar en el bundle. La ficha del expediente (cabecera de
 * auditoría + parches) entra plegada: es aparato de producción, no lectura.
 */
function CuerpoDelPlan({ code }: { code: string }) {
  const [contenido, setContenido] = useState<PlanCuerpo | null>(null);

  useEffect(() => {
    let vigente = true;
    void cargarCuerpoPlan(code).then((c) => {
      if (vigente) setContenido(c);
    });
    return () => {
      vigente = false;
    };
  }, [code]);

  if (!contenido) {
    return (
      <p className="font-space text-tinta-30 py-16 text-center text-[13px] uppercase tracking-[0.12em]">
        Abriendo el expediente…
      </p>
    );
  }

  return (
    <>
      <MdxPapel raw={contenido.cuerpo} />

      {contenido.ficha === '' ? null : (
        <details className="border-papel-borde mt-12 border-t pt-6 print:mt-8">
          <summary className="font-space text-tinta-50 hover:text-tinta cursor-pointer text-[11px] uppercase tracking-[0.12em]">
            Ficha del expediente — presupuesto, instrumento legal, tranche, gates
          </summary>
          <div className="mt-6">
            <MdxPapel raw={contenido.ficha} />
          </div>
        </details>
      )}
    </>
  );
}
```

Y dentro del `<article>`, reemplazar la línea:

```tsx
          <MdxPapel raw={plan.body} />
```

por:

```tsx
          <CuerpoDelPlan code={plan.code} />
```

Todo lo demás del archivo — el sello EJEMPLO, la edición impresa, el backlink, el pie y `ExpedienteExtraviado` — queda igual.

- [ ] **Step 10: Hacer que la ficha se imprima abierta**

En `apps/web/src/index.css`, dentro del bloque `@media print`, agregar:

```css
  /* La ficha del expediente se pliega en pantalla pero se imprime entera. */
  .edicion-impresa details > div {
    display: block !important;
  }
  .edicion-impresa details > summary {
    list-style: none;
  }
```

- [ ] **Step 11: Correr toda la suite de web**

Run: `pnpm --filter @v2/web test:unit`
Expected: PASS — incluidos los 7 tests de `plans-registry` y los del lector.

- [ ] **Step 12: Type-check, build y presupuesto de bundle**

Run: `pnpm type-check && pnpm build && pnpm size`
Expected: los tres verdes.

**Ojo: `pnpm size` solo no alcanza.** Medido antes de esta tarea, con el corpus entero eager, el build emite `dist/assets/plans-registry-*.js` de **5.220 kB (1.844 kB gzip)** y `pnpm size` **pasa igual**, reportando 166,91 kB — sus globs son `index-*`, `react-*` y `Home-*`, y ese chunk no cae en ninguno. El presupuesto es ciego justo donde importa.

Así que la verificación real de esta tarea es el tamaño del chunk del registry en la salida del build:

- Antes: `plans-registry-*.js` ≈ 5.220 kB.
- Después: unos pocos KB, y los cuerpos aparecen como chunks propios, uno por plan, que solo se piden al abrir el documento.

Y para que la regresión no pueda volver en silencio, agregar a `.size-limit.json` una entrada nueva:

```json
  {
    "name": "plans registry (gzipped)",
    "path": "apps/web/dist/assets/plans-registry-*.js",
    "limit": "20 KB",
    "gzip": true
  }
```

- [ ] **Step 13: Commit**

```bash
git add v2/apps/web/src/lib/plans-registry.ts v2/apps/web/src/lib/__tests__/plans-registry.test.ts v2/apps/web/src/pages/PlanDetail.tsx v2/apps/web/src/pages/__tests__/PlanDetail.test.tsx v2/apps/web/src/index.css
git commit -m "refactor(web): registry con cuerpos lazy y lector con ficha del expediente plegada"
```

---

### Task 7: El índice con los dos registros de título

**Files:**
- Modify: `apps/web/src/pages/Planes/sections/IndicePlanes.tsx`
- Test: `apps/web/src/pages/Planes/__tests__/IndicePlanes.test.tsx`

**Interfaces:**
- Consumes: `PlanRegistryEntry` con `nombreInstitucional` (Task 6).
- Produces: nada que consuman otras tareas.

- [ ] **Step 1: Actualizar el test — códigos reales y el registro institucional**

En `apps/web/src/pages/Planes/__tests__/IndicePlanes.test.tsx`:

Reemplazar las dos constantes de fixture del arranque:

```tsx
const plansal = PLANES.find((p) => p.code === 'PLANSAL');
const planedu = PLANES.find((p) => p.code === 'PLANEDU');

if (!plansal || !planedu) {
  throw new Error('Fixture inválida: PLANSAL/PLANEDU deben existir en el registry para este test.');
}
```

por:

```tsx
const planjus = PLANES.find((p) => p.code === 'PLANJUS');
const planrep = PLANES.find((p) => p.code === 'PLANREP');

if (!planjus || !planrep) {
  throw new Error('Fixture inválida: PLANJUS/PLANREP deben existir en el registry para este test.');
}
```

En el test `'renderiza 23 filas cerradas; la primera es 01 + PLANSAL…'`, cambiar el nombre a `'…la primera es 01 + PLANJUS…'` y las dos aserciones de contenido:

```tsx
    expect(filas[0]).toHaveTextContent('01');
    expect(filas[0]).toHaveTextContent('PLANJUS');
```

En el test de apertura única, reemplazar cada `plansal` por `planjus`, cada `planedu` por `planrep`, cada literal `'PLANSAL'` por `'PLANJUS'`, cada `'PLANEDU'` por `'PLANREP'`, y el href esperado `'/planes/plansal'` por `'/planes/planjus'`. Lo mismo en el test de cerrar la fila.

Agregar al final del `describe` el test nuevo:

```tsx
  it('el pliegue muestra el nombre institucional además del título evocativo', () => {
    render(<IndicePlanes />);

    const fila = screen.getByText('PLANJUS').closest('button');
    if (!fila) throw new Error('fila PLANJUS no encontrada');

    // Cerrada: solo el evocativo.
    expect(screen.getByText(planjus.title)).toBeInTheDocument();
    expect(screen.queryByText(planjus.nombreInstitucional)).not.toBeInTheDocument();

    fireEvent.click(fila);

    // Abierta: los dos registros.
    expect(screen.getByText(planjus.title)).toBeInTheDocument();
    expect(screen.getByText(planjus.nombreInstitucional)).toBeInTheDocument();
  });
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `pnpm --filter @v2/web test:unit src/pages/Planes/__tests__/IndicePlanes.test.tsx`
Expected: FAIL en el test nuevo — `Unable to find an element with the text: Plan Nacional de Justicia Popular…`.

- [ ] **Step 3: Agregar el nombre institucional al pliegue**

En `apps/web/src/pages/Planes/sections/IndicePlanes.tsx`, dentro de `fila`, reemplazar el bloque del summary:

```tsx
      {plan.summary ? (
        <p className="text-tinta-90 mb-3 max-w-[720px] text-base leading-relaxed [text-wrap:pretty]">
          {plan.summary}
        </p>
      ) : null}
```

por:

```tsx
      <p className="font-space text-tinta-50 mb-2 text-[11px] uppercase tracking-[0.12em]">
        {plan.nombreInstitucional}
      </p>
      {plan.summary ? (
        <p className="text-tinta-90 mb-3 max-w-[720px] text-base leading-relaxed [text-wrap:pretty]">
          {plan.summary}
        </p>
      ) : null}
```

- [ ] **Step 4: Correr los tests para verificar que pasan**

Run: `pnpm --filter @v2/web test:unit src/pages/Planes/`
Expected: PASS — los 7 tests de `IndicePlanes`.

- [ ] **Step 5: Commit**

```bash
git add v2/apps/web/src/pages/Planes
git commit -m "feat(web): el índice de La prueba muestra el nombre institucional en el pliegue"
```

---

### Task 8: Verificación en el navegador

Los tests no ven un documento de 4.473 líneas renderizado. Este paso mide lo que la spec marcó como riesgo.

**Files:** ninguno (verificación).

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: nada.

- [ ] **Step 1: Levantar el dev server**

Usar la herramienta de preview con `{name: "v2-web"}` — ya está definido en `.claude/launch.json` (puerto 5273). No usar Bash para levantar el server.

- [ ] **Step 2: Revisar el índice**

Navegar a `/planes`. Verificar:
- 23 filas: 22 bajo «Los 22 planes · tocá para abrir» + PLANRUTA bajo «El plan meta».
- La fila 01 es PLANJUS con su título evocativo.
- Al abrir una fila aparecen el nombre institucional (mono, chico) y el summary.

- [ ] **Step 3: Revisar el documento más pesado**

Navegar a `/planes/planagua` (4.473 líneas, el peor caso). Verificar:
- Aparece «Abriendo el expediente…» y después el documento.
- El scroll no se traba y la página responde.
- Al final está el `<details>` cerrado con el rótulo de la ficha; al abrirlo se ve el bloque de auditoría.

Medir: `read_network_requests` para confirmar que el chunk del cuerpo se pidió recién al entrar a la ruta, no en la home.

- [ ] **Step 4: Revisar los tres casos raros**

Navegar a `/planes/plandig`, `/planes/planruta` y `/planes/planmov`. En los tres, confirmar que el documento arranca por su portada o su H1 — sin `REVISION_PROFUNDA` ni `CANONICAL_ARCHITECTURE` arriba de todo.

- [ ] **Step 5: Revisar la consola**

Run: `read_console_messages` con `onlyErrors: true`
Expected: sin errores.

- [ ] **Step 6: Sacar la captura de prueba**

Screenshot de `/planes` y de `/planes/planagua` con la ficha abierta.

---

### Task 9: Normalizar la acentuación del corpus

Tramos del corpus están sin acentuar («Redefinicion», «acompanamiento», «Reconversion» — 17 casos solo en PLANSAL). Va al final, en su propio commit, para que el diff sea revisable sin mezclarse con la migración.

**Files:**
- Modify: `../Iniciativas Estratégicas/PLAN*_Argentina_ES.md` (el taller — es la fuente)
- Modify: `content/planes/*.mdx` (re-derivados)

**Interfaces:**
- Consumes: todo lo anterior.
- Produces: nada.

- [ ] **Step 1: Inventariar los casos**

Run:
```bash
cd "/Users/juanb/Desktop/ElInstantedelHombreGris/Iniciativas Estratégicas" && grep -oh "\b[A-Za-zÁÉÍÓÚÑáéíóúñ]*\(cion\|cionar\|sion\)\b" PLAN*_Argentina_ES.md | sort | uniq -c | sort -rn | head -40
```
Expected: la lista de palabras terminadas en `-cion`/`-sion` sin tilde, con su frecuencia.

- [ ] **Step 2: Corregir en el taller**

Aplicar las correcciones sobre `Iniciativas Estratégicas/PLAN*_Argentina_ES.md`, **no** sobre `content/planes/` — el taller es la fuente. Corregir solo acentuación; no tocar redacción.

Ojo: las portadas ASCII de varios documentos están íntegramente sin acentos (es una decisión de diseño del documento). Corregir **solo el cuerpo**, dejando las portadas como están, salvo que el resto de la portada del mismo documento sí lleve acentos.

- [ ] **Step 3: Re-derivar la edición**

Run: `cd v2 && pnpm planes:migrar && pnpm planes:check`
Expected: `23 planes emitidos + índice generado.` y `Índice de planes OK: 23 entradas…`

- [ ] **Step 4: Revisar el diff**

Run: `git diff --stat v2/content/planes "Iniciativas Estratégicas"`
Expected: cambios solo en caracteres acentuados; ninguna línea agregada o borrada.

- [ ] **Step 5: Correr todo**

Run: `cd v2 && pnpm verify && pnpm test:scripts && pnpm planes:check`
Expected: todo verde.

- [ ] **Step 6: Commit**

```bash
git add "Iniciativas Estratégicas" v2/content/planes
git commit -m "fix(content): normalizar acentuación en los documentos del corpus"
```

---

## Lo que queda anotado y no se hace acá

- **`apps/web/src/pages/UnaRutaParaArgentina/sections/PlanesGrid.tsx`** tiene los 22 códigos de stub hardcodeados. Después de este plan queda contradiciendo a `/planes`. Su reconciliación es de su propia fase (port v1 de v2), no de este tramo.
- **PLANMOV** se titula «Vigésimo Tercer Mandato del Proyecto ¡BASTA!» mientras `arquitecto-data.ts` le asigna `ordinal: 22`. Es una discrepancia de contenido: se reporta al autor, no se corrige acá.
- **Redirects de los 14 slugs muertos** — descartados por D7 de la spec (v2 no está en producción). Si el sitio se publica antes de ejecutar este plan, revisar esa decisión.
- **El Arquitecto** — tramo B, spec aparte.
