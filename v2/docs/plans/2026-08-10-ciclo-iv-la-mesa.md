# Ciclo IV — La Mesa · Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Escribir y publicar el cuarto ciclo de siete ensayos de la serie del Hombre Gris — la familia como Capa Cero del sistema — desde el spec `v2/docs/specs/2026-08-10-ciclo-iv-la-mesa.md`.

**Architecture:** Los ensayos se escriben como Markdown plano en `Ensayos/la-mesa/NN-slug.md` (H1 título, H2 subtítulo, secciones en romanos, `## Cartografía` al pie), que es la fuente de verdad. Un verificador en `v2/scripts/content/` corre sobre esa carpeta y falla mientras el ciclo esté incompleto o fuera de restricciones. Recién cuando los siete pasan, se publican: `v2/content/ensayos/<slug>.mdx` con frontmatter, copia byte-idéntica en `v2/content-txt/ensayos/<slug>.txt`, y alta del ciclo en la biblioteca de v2.

**Tech Stack:** Markdown / MDX · TypeScript (tsx) para los verificadores · Vitest · pnpm workspace en `v2/`.

## Global Constraints

Estas reglas valen para los siete ensayos. Los requisitos de cada tarea las incluyen implícitamente.

- **Idioma:** castellano rioplatense. Vos, mirá, pará. Nada de tuteo peninsular.
- **Largo:** 2.500–3.000 palabras de cuerpo por ensayo. El verificador acepta la banda 2.400–3.200 y falla fuera de ella.
- **Estructura:** `# Título` (H1), `## Subtítulo` (H2, una línea), secciones `## I.` `## II.` … en romanos, y `## Cartografía` como última sección.
- **Dispositivos obligatorios en cada ensayo** (no los verifica el script, los verifica el revisor): un espejo argentino concreto; una *parte hermosa* — el pasaje donde el autor deja de demostrar y dice lo que cree; y *el movimiento* — qué hacés el lunes. Van integrados en secciones con nombre propio, como en los Ciclos II y III, no como títulos literales en inglés.
- **Definición no negociable:** la familia se define por función —quién sostiene a quién—, nunca por sangre, domicilio ni papel. Se establece en el ensayo 1 y ningún ensayo posterior la renegocia.
- **La bisagra:** el filo va afuera, la palanca queda adentro. *Le sacaron las condiciones, y aun así la casa es la última superficie donde una persona todavía decide sin pedir permiso.* Se enuncia explícita en el ensayo 4 y sostiene los siete.
- **Tics prohibidos desde el borrador** (el verificador los busca y falla): "quiero ser honesto", "quiero ser claro acá", "dejame decirlo limpio", "escuchá con atención"; cierre de párrafo con "el hombre gris" en posición rítmica repetida; cualquier resto de scaffolding metodológico ("Decision headline", "Key assumptions", "Proof metrics", "Top 5 failure modes"); "TODO" y "TBD".
- **Sin ancla de calendario.** El tercer domingo de agosto puede aparecer como escena adentro de un ensayo; no fecha el ciclo ni lo gobierna.
- **Frontmatter de publicación:** `series: la-mesa`, `orderIndex: 1..7`, `form` ausente (default `ensayo`) — **ninguno de los siete lleva `form: acta`**; `acta` queda reservado para el Acta de la Interdependencia.
- **`readingMinutes` = round(palabras / 200)**, que es la convención observada en el corpus (2.479 → 12; 2.297 → 11; 4.550 → 21).
- **Commits:** Conventional Commits con scope, como pide `v2/CLAUDE.md` — `feat(ensayos):` para los ensayos y el contenido, `feat(web):` para la biblioteca. Rutas explícitas siempre (`git add <ruta>`), nunca `git add -A` ni `git add .` — hay sesiones concurrentes en este repo (D-010). Rama `main`.

---

## Mapa de archivos

**Se crean:**

| Archivo | Responsabilidad |
|---|---|
| `Ensayos/la-mesa/01-la-capa-cero.md` | Ensayo 1 — qué es una familia |
| `Ensayos/la-mesa/02-lo-que-el-chico-mira.md` | Ensayo 2 — la transmisión por testigo |
| `Ensayos/la-mesa/03-la-grieta-se-aprende-en-la-cocina.md` | Ensayo 3 — la reparación (keystone) |
| `Ensayos/la-mesa/04-la-silla-vacia.md` | Ensayo 4 — el vaciamiento y la bisagra |
| `Ensayos/la-mesa/05-las-lecciones-que-no-hacen-falta.md` | Ensayo 5 — criar |
| `Ensayos/la-mesa/06-ensenar-a-morir.md` | Ensayo 6 — despedir |
| `Ensayos/la-mesa/07-la-mesa.md` | Ensayo 7 — la carta y el acuerdo |
| `v2/scripts/content/verificar-ciclo-la-mesa.ts` | Guardián de restricciones sobre `Ensayos/la-mesa/` |
| `v2/scripts/content/__tests__/verificar-ciclo-la-mesa.test.ts` | Unit tests del guardián, sobre fixtures en memoria |
| `v2/scripts/content/verify-ensayos-la-mesa.ts` | Verbatim check fuente → MDX (clon de `verify-ensayos-interdependencia.ts`) |
| `v2/content/ensayos/<slug>.mdx` ×7 | Publicación |
| `v2/content-txt/ensayos/<slug>.txt` ×7 | Copia byte-idéntica del `.mdx` |

**Se modifican:**

| Archivo | Cambio |
|---|---|
| `Ensayos/00-ORDEN-DE-LECTURA.md` | De tres ciclos a cuatro |
| `v2/content-txt/ensayos/00-ORDEN-DE-LECTURA.txt` | Ídem, en el formato ASCII de ese archivo |
| `v2/apps/web/src/pages/Biblioteca/biblioteca-data.ts` | Entrada `la-mesa` en `ROTULOS` |
| `v2/apps/web/src/lib/__tests__/ensayos-registry.test.ts` | `EXPECTED_SERIES` a cuatro; `toHaveLength(21)` → `28` |

**No se tocan:** los tres ciclos existentes, los documentos de PLANes, `form` union del registry, `ensayos-registry.ts`.

---

## Task 1: El guardián del ciclo

Se escribe primero y falla en rojo hasta que los siete ensayos existan. Cada tarea de ensayo termina corriéndolo.

**Files:**
- Create: `v2/scripts/content/verificar-ciclo-la-mesa.ts`
- Test: `v2/scripts/content/__tests__/verificar-ciclo-la-mesa.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces: `export interface Hallazgo { archivo: string; regla: string; detalle: string }` y `export function auditar(docs: { archivo: string; raw: string }[], planesConocidos: Set<string>, ensayosConocidos: Set<string>): Hallazgo[]`. Las tareas 2–8 consumen el binario, no la función.

- [ ] **Step 1: Escribir el test que falla**

Crear `v2/scripts/content/__tests__/verificar-ciclo-la-mesa.test.ts`:

```ts
import { describe, expect, it } from 'vitest';

import { auditar } from '../verificar-ciclo-la-mesa';

const PLANES = new Set(['PLANCUIDADO', 'PLANARCO']);
const ENSAYOS = new Set(['06-amor-sin-apego.md', '01-la-capa-cero.md']);

function doc(cuerpo: string, palabras = 2600): string {
  const relleno = Array.from({ length: palabras }, (_, i) => `palabra${String(i)}`).join(' ');
  return [
    '# Un título',
    '',
    '## Un subtítulo',
    '',
    '## I. Primera',
    '',
    relleno,
    '',
    '## II. Segunda',
    '',
    '## III. Tercera',
    '',
    '## IV. Cuarta',
    '',
    cuerpo,
    '',
  ].join('\n');
}

describe('auditar', () => {
  it('acepta un ensayo bien formado', () => {
    const raw = doc('Cierre.\n\n## Cartografía\n\nPLANCUIDADO y `06-amor-sin-apego.md`.');
    expect(auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS)).toEqual([]);
  });

  it('falla si falta la sección Cartografía', () => {
    const raw = doc('Cierre sin cartografía.');
    const hallazgos = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS);
    expect(hallazgos.map((h) => h.regla)).toContain('cartografia-ausente');
  });

  it('falla fuera de la banda de palabras', () => {
    const raw = doc('Corto.\n\n## Cartografía\n\nPLANARCO.', 200);
    const hallazgos = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS);
    expect(hallazgos.map((h) => h.regla)).toContain('largo-fuera-de-banda');
  });

  it('falla ante un tic de la lista negra', () => {
    const raw = doc('Quiero ser honesto acá: no.\n\n## Cartografía\n\nPLANARCO.');
    const hallazgos = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS);
    expect(hallazgos.map((h) => h.regla)).toContain('tic-prohibido');
  });

  it('falla si la cartografía cita un PLAN o un ensayo inexistente', () => {
    const raw = doc('Cierre.\n\n## Cartografía\n\nPLANFANTASMA y `99-no-existe.md`.');
    const reglas = auditar([{ archivo: '01-la-capa-cero.md', raw }], PLANES, ENSAYOS).map((h) => h.regla);
    expect(reglas).toContain('plan-inexistente');
    expect(reglas).toContain('ensayo-inexistente');
  });

  it('falla si el H1 o el H2 faltan, o si hay menos de cuatro secciones romanas', () => {
    const sinH1 = '## Sólo subtítulo\n\n## Cartografía\n\nPLANARCO.';
    const reglas = auditar([{ archivo: '01-la-capa-cero.md', raw: sinH1 }], PLANES, ENSAYOS).map((h) => h.regla);
    expect(reglas).toContain('encabezado-invalido');
    expect(reglas).toContain('secciones-insuficientes');
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `cd v2 && pnpm test:scripts -- verificar-ciclo-la-mesa`
Expected: FAIL — `Failed to resolve import "../verificar-ciclo-la-mesa"`.

- [ ] **Step 3: Escribir el verificador**

Crear `v2/scripts/content/verificar-ciclo-la-mesa.ts`:

```ts
/**
 * Guardián del Ciclo IV — La Mesa. Corre sobre Ensayos/la-mesa/*.md y falla
 * mientras el ciclo esté incompleto o fuera de las restricciones del spec
 * (v2/docs/specs/2026-08-10-ciclo-iv-la-mesa.md).
 *
 * Verifica lo que se puede verificar por texto: forma, largo, tics, y que la
 * Cartografía no cite nada que no exista. Los dispositivos de autor —espejo
 * argentino, la parte hermosa, el movimiento— los verifica el revisor humano,
 * no este script: no hay grep honesto para ellos.
 *
 * Run: ./apps/api/node_modules/.bin/tsx scripts/content/verificar-ciclo-la-mesa.ts
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const V2_ROOT = resolve(SCRIPT_DIR, '../..');
const REPO_ROOT = resolve(V2_ROOT, '..');
const SRC_DIR = resolve(REPO_ROOT, 'Ensayos/la-mesa');
const ENSAYOS_ROOT = resolve(REPO_ROOT, 'Ensayos');
const PLANES_DIR = resolve(V2_ROOT, 'content/planes');

const MIN_PALABRAS = 2400;
const MAX_PALABRAS = 3200;
const MIN_SECCIONES = 4;
const ESPERADOS = 7;

const TICS: readonly { patron: RegExp; nombre: string }[] = [
  { patron: /quiero ser honesto/i, nombre: 'quiero ser honesto' },
  { patron: /quiero ser claro acá/i, nombre: 'quiero ser claro acá' },
  { patron: /dejame decirlo limpio/i, nombre: 'dejame decirlo limpio' },
  { patron: /escuchá con atención/i, nombre: 'escuchá con atención' },
  { patron: /\bel hombre gris\.\s*$/im, nombre: 'párrafo cerrado con "el hombre gris."' },
  { patron: /decision headline/i, nombre: 'scaffolding: decision headline' },
  { patron: /key assumptions/i, nombre: 'scaffolding: key assumptions' },
  { patron: /proof metrics/i, nombre: 'scaffolding: proof metrics' },
  { patron: /top 5 failure modes/i, nombre: 'scaffolding: top 5 failure modes' },
  { patron: /\bTODO\b|\bTBD\b/, nombre: 'marcador TODO/TBD' },
];

export interface Hallazgo {
  archivo: string;
  regla: string;
  detalle: string;
}

const ROMANO = /^## (I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)\.\s/;

export function auditar(
  docs: { archivo: string; raw: string }[],
  planesConocidos: Set<string>,
  ensayosConocidos: Set<string>,
): Hallazgo[] {
  const hallazgos: Hallazgo[] = [];
  const push = (archivo: string, regla: string, detalle: string): void => {
    hallazgos.push({ archivo, regla, detalle });
  };

  for (const { archivo, raw } of docs) {
    const lineas = raw.split('\n');
    const primera = lineas.find((l) => l.trim() !== '') ?? '';
    const tieneH1 = primera.startsWith('# ');
    const restoTrasH1 = tieneH1 ? lineas.slice(lineas.indexOf(primera) + 1) : [];
    const segunda = restoTrasH1.find((l) => l.trim() !== '') ?? '';
    const tieneH2 = segunda.startsWith('## ') && !ROMANO.test(segunda);
    if (!tieneH1 || !tieneH2) {
      push(archivo, 'encabezado-invalido', 'falta el H1 de título o el H2 de subtítulo');
    }

    const secciones = lineas.filter((l) => ROMANO.test(l)).length;
    if (secciones < MIN_SECCIONES) {
      push(archivo, 'secciones-insuficientes', `${String(secciones)} secciones romanas, mínimo ${String(MIN_SECCIONES)}`);
    }

    const idxCarto = raw.indexOf('\n## Cartografía');
    if (idxCarto < 0) {
      push(archivo, 'cartografia-ausente', 'no hay sección "## Cartografía"');
    }

    const cuerpo = tieneH1 ? raw.slice(raw.indexOf(primera) + primera.length) : raw;
    const palabras = cuerpo.split(/\s+/).filter((w) => w.length > 0).length;
    if (palabras < MIN_PALABRAS || palabras > MAX_PALABRAS) {
      push(
        archivo,
        'largo-fuera-de-banda',
        `${String(palabras)} palabras (banda ${String(MIN_PALABRAS)}–${String(MAX_PALABRAS)})`,
      );
    }

    for (const { patron, nombre } of TICS) {
      if (patron.test(raw)) push(archivo, 'tic-prohibido', nombre);
    }

    if (idxCarto >= 0) {
      const carto = raw.slice(idxCarto);
      for (const m of carto.matchAll(/\bPLAN[A-Z0-9]{2,}\b/g)) {
        if (!planesConocidos.has(m[0])) push(archivo, 'plan-inexistente', m[0]);
      }
      for (const m of carto.matchAll(/\b\d{2}-[a-z0-9-]+\.md\b/g)) {
        if (!ensayosConocidos.has(m[0])) push(archivo, 'ensayo-inexistente', m[0]);
      }
    }
  }

  return hallazgos;
}

function listarPlanes(): Set<string> {
  if (!existsSync(PLANES_DIR)) return new Set();
  return new Set(readdirSync(PLANES_DIR).filter((f) => f.endsWith('.mdx')).map((f) => f.replace(/\.mdx$/, '')));
}

function listarEnsayos(): Set<string> {
  const nombres = new Set<string>();
  const visitar = (dir: string): void => {
    for (const entrada of readdirSync(dir, { withFileTypes: true })) {
      if (entrada.isDirectory()) visitar(resolve(dir, entrada.name));
      else if (entrada.name.endsWith('.md')) nombres.add(entrada.name);
    }
  };
  visitar(ENSAYOS_ROOT);
  return nombres;
}

function main(): void {
  if (!existsSync(SRC_DIR)) {
    process.stderr.write(`✗ no existe ${SRC_DIR}\n`);
    process.exit(1);
  }
  const archivos = readdirSync(SRC_DIR).filter((f) => /^0[1-7]-[a-z0-9-]+\.md$/.test(f)).sort();
  const docs = archivos.map((archivo) => ({ archivo, raw: readFileSync(resolve(SRC_DIR, archivo), 'utf-8') }));
  const hallazgos = auditar(docs, listarPlanes(), listarEnsayos());

  for (const h of hallazgos) process.stderr.write(`✗ ${h.archivo} — ${h.regla}: ${h.detalle}\n`);
  process.stdout.write(`${String(archivos.length)}/${String(ESPERADOS)} ensayos · ${String(hallazgos.length)} hallazgos\n`);

  if (hallazgos.length > 0) process.exit(1);
  if (archivos.length !== ESPERADOS) {
    process.stderr.write(`✗ ciclo incompleto: faltan ${String(ESPERADOS - archivos.length)} ensayos\n`);
    process.exit(1);
  }
  process.stdout.write('✓ el ciclo pasa el guardián\n');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main();
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `cd v2 && pnpm test:scripts -- verificar-ciclo-la-mesa`
Expected: PASS, 6 tests.

- [ ] **Step 5: Correr el guardián contra el repo y verificar que falla en rojo**

Run: `cd v2 && mkdir -p ../Ensayos/la-mesa && ./apps/api/node_modules/.bin/tsx scripts/content/verificar-ciclo-la-mesa.ts`
Expected: `0/7 ensayos · 0 hallazgos` + `✗ ciclo incompleto: faltan 7 ensayos`, exit 1. Ese rojo es el estado inicial correcto.

- [ ] **Step 6: Lint y type-check**

Run: `cd v2 && pnpm lint:scripts && pnpm type-check:scripts`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add v2/scripts/content/verificar-ciclo-la-mesa.ts v2/scripts/content/__tests__/verificar-ciclo-la-mesa.test.ts
git commit -m "feat(ensayos): guardián del Ciclo IV — forma, largo, tics y cartografía viva"
```

---

## Tasks 2–8: los siete ensayos

Cada una de las siete tareas trae sus cinco pasos completos: releer, escribir, correr el guardián,
revisión de autor y commit. Lo que cambia entre tareas es el contenido del ensayo, que va entero
en cada ficha.

---

### Task 2: Ensayo 1 — La Capa Cero

**Files:**
- Create: `Ensayos/la-mesa/01-la-capa-cero.md`

**Interfaces:**
- Consumes: `04-arquitectura.md` (Capa Uno, "cincuenta a quinientas familias"); `01-que-es-una-nacion.md` (el método del camino negativo y las realidades de acuerdo).
- Produces, y los seis siguientes lo dan por establecido: la definición funcional (quién sostiene a quién); el corolario de la casa que no termina en la puerta; el corolario de las casas rotas; el término **Capa Cero**.

**Título:** `# La Capa Cero`
**Subtítulo:** `## Sobre la unidad que la arquitectura contó sin abrir`

**Esqueleto:**

- **I.** El ladrillo que nadie abrió. La arquitectura de la serie cuenta "cincuenta a quinientas familias" como su unidad de Capa Uno, y en veintiún ensayos nadie abrió una familia. Abre el ciclo declarando el hueco.
- **II.** El camino negativo, como en `01-que-es-una-nacion.md`. La familia **no es la sangre** — medio país cría hijos que no engendró y engendró hijos que no cría. **No es el domicilio** — el hermano en Madrid sigue siendo familia; el que duerme al lado a veces no. **No es el papel** — el Estado registra vínculos con años de retraso sobre la realidad, y a veces nunca.
- **III.** Lo que queda: la obligación de sostén, sostenida. Un acuerdo del mismo material que la nación del Ciclo III, en escala de tres a diez personas — y por eso mismo revocable, y por eso mismo real.
- **IV.** La casa no termina en la puerta. El hermano que cuida, el tío que acompaña, el abuelo que educa, la vecina, el padrino, la maestra, el entrenador del club. **No como excepción: como prueba de la definición.** Si la familia fuera sangre, estos no contarían, y todos sabemos que cuentan más que muchos que sí son sangre.
- **V.** Las casas rotas. Una casa rota bien no transmite peor que una casa entera mal. Se dice acá, temprano, para que los seis ensayos siguientes no se lean como reproche a la mitad del país.
- **VI.** La Capa Cero. La única capa de gobierno que ya existe, funciona sin presupuesto, y no la diseñó nadie. Acá va **la parte hermosa**: que la única institución argentina que nunca dejó de funcionar —ni en el 76, ni en el 89, ni en el 2001, ni en la pandemia— no tiene edificio, ni sigla, ni presupuesto, ni ley que la haya inventado. Y **el movimiento**: escribí la lista real de tu Capa Cero, los nombres de los que te sostienen y los que sostenés — no los que te tocan por apellido, los que están efectivamente en el flujo. Casi seguro sobra alguien y falta alguien.
- **Cartografía.**

**Espejo argentino:** la abuela que sostuvo tres generaciones sin figurar en ninguna estadística; el tío que fue más padre que el padre; la familia que se volvió binacional por WhatsApp.

**Promesa al ensayo 2:** si la familia es una función, ¿cómo ejecuta esa función?

**Cartografía:** PLANCUIDADO · `04-arquitectura.md` · `01-que-es-una-nacion.md`

- [ ] **Step 1: Releer el contexto.** El spec `v2/docs/specs/2026-08-10-ciclo-iv-la-mesa.md`, la ficha de arriba, y `07-acta-de-la-interdependencia.md`, el cierre del Ciclo III — este ensayo abre después de él: la promesa que dejó abierta es la primera línea de trabajo.

- [ ] **Step 2: Escribir el ensayo completo** en `Ensayos/la-mesa/01-la-capa-cero.md`, con el esqueleto de secciones de arriba y las Global Constraints de la cabecera del plan.

- [ ] **Step 3: Correr el guardián**

Run: `cd v2 && ./apps/api/node_modules/.bin/tsx scripts/content/verificar-ciclo-la-mesa.ts`
Expected: ningún hallazgo con `01-la-capa-cero.md` en la primera columna. Seguirá fallando con `✗ ciclo incompleto` hasta que existan los siete — eso es correcto y no se arregla bajando `ESPERADOS`.

- [ ] **Step 4: Revisión de autor, a mano.** Cinco preguntas: ¿hay un espejo argentino concreto y no genérico? ¿hay una parte hermosa, donde el autor deja de demostrar y dice lo que cree? ¿el movimiento es algo que se hace un lunes en una cocina, y no una fundación? ¿la última sección deja abierta la promesa al ensayo siguiente? ¿repite alguna escena ya usada en un ensayo anterior del ciclo? Si alguna falla, se corrige antes de commitear.

- [ ] **Step 5: Commit**

```bash
git add Ensayos/la-mesa/01-la-capa-cero.md
git commit -m "feat(ensayos): Ciclo IV 1/7 — La Capa Cero, la familia definida por función"
```

---

### Task 3: Ensayo 2 — Lo que el chico mira cuando nadie cree que mira

**Files:**
- Create: `Ensayos/la-mesa/02-lo-que-el-chico-mira.md`

**Interfaces:**
- Consumes: la definición funcional del ensayo 1; `01-fabrica-obediencia.md` (la educación como fábrica de obediencia).
- Produces: el mecanismo de transmisión por testigo, del que dependen los ensayos 3, 4 y 6; y la frase *no le podés enseñar a tu hijo un país que vos no estás viviendo*, que el ensayo 7 vuelve a usar.

**Título:** `# Lo que el chico mira cuando nadie cree que mira`
**Subtítulo:** `## Sobre el currículum que ninguna casa sabe que está dictando`

**Esqueleto:**

- **I.** Dos currículums. El declarado —los valores que se enuncian, los retos, los consejos de sobremesa— y el real. Ninguna casa eligió el segundo y todas lo dictan.
- **II.** Qué registra un chico. No evalúa argumentos: no tiene con qué. Registra conducta, que es lo único que puede registrar. Cómo se habla del que no está en la mesa. Si se paga lo que se debe. Si se cumplen las promesas chicas. Cómo se trata al que trae el café. Qué se hace cuando nadie mira y no hay costo.
- **III.** La sección más incómoda: **no le podés enseñar a tu hijo un país que vos no estás viviendo.** Toda la arquitectura de ¡BASTA! depende de esa frase. Un padre que le explica la república a su hijo y arregla el trámite por abajo enseñó una sola de las dos cosas, y no fue la que dijo.
- **IV.** El chico como ciudadano hoy, no mañana. La retórica argentina de la infancia habla siempre del futuro. Un chico que sólo es futuro aprende que la ciudadanía se recibe con la edad en vez de ejercerse — que es exactamente el hábito que `02-democracia.md` diagnostica en los adultos, treinta años más tarde.
- **V.** **La parte hermosa:** el mecanismo funciona igual de bien al derecho. La misma máquina que reproduce la mezquindad reproduce, sin discurso y sin esfuerzo, al que cumple lo que promete. **El movimiento:** una semana anotando —sin corregirte— lo que un chico de tu casa te vio hacer. No lo que le dijiste.
- **Cartografía.**

**Espejo argentino:** la casa donde no se habla de plata y el chico igual sabe todo; los tres modos de hablar de un argentino según quién esté escuchando; el "no le digas a tu mamá" como primera clase de política nacional.

**Promesa al ensayo 3:** si transmite por testigo, ¿qué es lo que este país viene atestiguando?

**Cartografía:** PLANEDU · PLANFOCO · `01-fabrica-obediencia.md` · `02-democracia.md` · `01-la-capa-cero.md`

- [ ] **Step 1: Releer el contexto.** El spec `v2/docs/specs/2026-08-10-ciclo-iv-la-mesa.md`, la ficha de arriba, y `01-la-capa-cero.md` entero, no sólo su ficha: la promesa que dejó abierta es la primera línea de trabajo.

- [ ] **Step 2: Escribir el ensayo completo** en `Ensayos/la-mesa/02-lo-que-el-chico-mira.md`, con el esqueleto de secciones de arriba y las Global Constraints de la cabecera del plan.

- [ ] **Step 3: Correr el guardián**

Run: `cd v2 && ./apps/api/node_modules/.bin/tsx scripts/content/verificar-ciclo-la-mesa.ts`
Expected: ningún hallazgo con `02-lo-que-el-chico-mira.md` en la primera columna. Seguirá fallando con `✗ ciclo incompleto` hasta que existan los siete — eso es correcto y no se arregla bajando `ESPERADOS`.

- [ ] **Step 4: Revisión de autor, a mano.** Cinco preguntas: ¿hay un espejo argentino concreto y no genérico? ¿hay una parte hermosa, donde el autor deja de demostrar y dice lo que cree? ¿el movimiento es algo que se hace un lunes en una cocina, y no una fundación? ¿la última sección deja abierta la promesa al ensayo siguiente? ¿repite alguna escena ya usada en un ensayo anterior del ciclo? Si alguna falla, se corrige antes de commitear.

- [ ] **Step 5: Commit**

```bash
git add Ensayos/la-mesa/02-lo-que-el-chico-mira.md
git commit -m "feat(ensayos): Ciclo IV 2/7 — Lo que el chico mira, la transmisión por testigo"
```

---

### Task 4: Ensayo 3 — La grieta se aprende en la cocina

Es la keystone del ciclo. Si sólo un ensayo sale perfecto, tiene que ser éste.

**Files:**
- Create: `Ensayos/la-mesa/03-la-grieta-se-aprende-en-la-cocina.md`

**Interfaces:**
- Consumes: el mecanismo del ensayo 2; `04-libertad-de-lo-conocido.md`, que abrió la tesis de la grieta heredada y la dejó sin mecanismo.
- Produces: **la reparación** como el músculo único del ciclo. El ensayo 6 la retoma en forma terminal y el 7 la ejecuta en las dos direcciones del tiempo. El nombre y la definición de la operación se fijan acá.

**Título:** `# La grieta se aprende en la cocina`
**Subtítulo:** `## Sobre cómo terminan las peleas, y sobre lo que aprende el que mira`

**Esqueleto:**

- **I.** El chico no aprende del conflicto. Aprende de **cómo termina** el conflicto.
- **II.** Los tres finales, y qué enseña cada uno. **La ruptura:** el desacuerdo disuelve el vínculo. **El silencio que se hace costumbre:** el desacuerdo es innombrable — mismo resultado por otra vía; una casa sin conflicto visible no enseña paz. **La reparación explícita:** dos personas se pelearon, se dijeron cosas, y siguen acá. Sólo la tercera se aprende mirando, y sólo si ocurre delante del chico.
- **III.** El salto de escala — el aporte del ensayo a toda la serie. Setenta años de grieta no son el producto de una ideología: son el resultado agregado de millones de peleas que nadie reparó delante de un chico. Termina lo que `04-libertad-de-lo-conocido.md` abrió.
- **IV.** El contraargumento, **obligatorio** (dispositivo de `03-poder.md`, sección "El argumento contra el argumento"). Hay vínculos que deben romperse, y una casa que repara todo enseña a tolerar lo intolerable. La distinción que salva el ensayo: **se repara el vínculo, no el daño; y hay daños que disuelven el vínculo.** Sin esta sección el ensayo es peligroso y no se publica.
- **V.** **La parte hermosa:** la reparación es más barata que la ruptura y no requiere que nadie tenga razón. **El movimiento:** peleate delante de ellos, y reparalo delante de ellos — la reparación en privado educa a nadie.
- **Cartografía.**

**Restricción de escritura, explícita en el spec §4.3:** este ensayo **no reparte culpa**. Diagnostica lo que se transmitió y le entrega la pregunta de la responsabilidad al ensayo 4, que es donde el filo va afuera. Si el 3 empieza a acusar a la casa, el 4 se queda sin trabajo y el ciclo entero se vuelve reproche.

**Espejo argentino:** el asado donde no se habla de política "para no pelear"; la familia partida en 2008 por el campo, en 2015 por el voto, y que nunca lo nombró; el grupo de WhatsApp del que alguien se fue.

**Promesa al ensayo 4:** si la casa enseñó a romper, ¿quién le sacó lo que hacía falta para enseñar a reparar?

**Cartografía:** PLANMESA · `04-libertad-de-lo-conocido.md` · `07-sensibilidad-como-infraestructura.md` · `06-la-practica-del-tejido.md` · `02-lo-que-el-chico-mira.md`

- [ ] **Step 1: Releer el contexto.** El spec `v2/docs/specs/2026-08-10-ciclo-iv-la-mesa.md`, la ficha de arriba, y `02-lo-que-el-chico-mira.md` entero, no sólo su ficha: la promesa que dejó abierta es la primera línea de trabajo.

- [ ] **Step 2: Escribir el ensayo completo** en `Ensayos/la-mesa/03-la-grieta-se-aprende-en-la-cocina.md`, con el esqueleto de secciones de arriba y las Global Constraints de la cabecera del plan.

- [ ] **Step 3: Correr el guardián**

Run: `cd v2 && ./apps/api/node_modules/.bin/tsx scripts/content/verificar-ciclo-la-mesa.ts`
Expected: ningún hallazgo con `03-la-grieta-se-aprende-en-la-cocina.md` en la primera columna. Seguirá fallando con `✗ ciclo incompleto` hasta que existan los siete — eso es correcto y no se arregla bajando `ESPERADOS`.

- [ ] **Step 4: Revisión de autor, a mano.** Cinco preguntas: ¿hay un espejo argentino concreto y no genérico? ¿hay una parte hermosa, donde el autor deja de demostrar y dice lo que cree? ¿el movimiento es algo que se hace un lunes en una cocina, y no una fundación? ¿la última sección deja abierta la promesa al ensayo siguiente? ¿repite alguna escena ya usada en un ensayo anterior del ciclo? Si alguna falla, se corrige antes de commitear.

- [ ] **Step 5: Commit**

```bash
git add Ensayos/la-mesa/03-la-grieta-se-aprende-en-la-cocina.md
git commit -m "feat(ensayos): Ciclo IV 3/7 — La grieta se aprende en la cocina, la reparación"
```

---

### Task 5: Ensayo 4 — La silla vacía

**Files:**
- Create: `Ensayos/la-mesa/04-la-silla-vacia.md`

**Interfaces:**
- Consumes: el diagnóstico sin culpa del ensayo 3; `03-miedo-y-devenir.md` (la economía del miedo); `05-soberania.md` (el hombre del 60 a las seis de la mañana).
- Produces: **la bisagra del ciclo**, enunciada literalmente acá y asumida por los ensayos 5, 6 y 7.

**Título:** `# La silla vacía`
**Subtítulo:** `## Sobre las horas que le sacaron a la casa, y sobre lo que se sentó en su lugar`

**Esqueleto:**

- **I.** No se transmite nada sin adultos sin apuro. El tiempo no es la condición de la transmisión: es su material.
- **II.** La sustracción. Dos changas y hora y media de viaje son una política de crianza que nadie votó con ese nombre. La economía del miedo no le roba plata a los padres: les roba las horas donde la transmisión ocurre. El efecto no aparece en ninguna estadística porque no hay ninguna que lo mida.
- **III.** La herencia material. Cada década el país incendia el patrimonio intergeneracional. Una casa que no puede darle piso a la siguiente transmite, además de lo que quería transmitir, el mensaje de que no hay a dónde ir.
- **IV.** La ocupación. La silla no queda vacía. Hay otro transmisor sentado a la mesa, que no duerme, que conoce al chico mejor que los padres y que no lo quiere. **La pregunta no es si las pantallas son malas: es quién tiene derecho a imprimir a un ser humano antes de que pueda consentir**, y por qué ese derecho se cedió sin discusión a la única parte que no responde ante nadie.
- **V.** **La bisagra, enunciada como tal:** le sacaron las condiciones, y aun así la casa es la última superficie donde una persona todavía decide sin pedir permiso. No se baja la inflación desde una cocina; sí se decide qué se dice en esa cocina, y eso es lo único de la lista que no depende de nadie más. **Sin esta sección los tres ensayos siguientes se leen como reproche.**
- **VI.** **La parte hermosa:** la unidad mínima de transmisión es más chica de lo que se cree — no hacen falta tardes, hacen falta minutos sin apuro, y eso todavía se puede robar. **El movimiento:** una hora por semana blindada, a la misma hora, que no se le vende a nadie. Regularidad antes que intensidad, como en `06-la-practica-del-tejido.md`.
- **Cartografía.**

**Espejo argentino:** el 60 a las seis de la mañana —la misma escena de `05-soberania.md`, ahora mirada desde la casa que ese hombre dejó dormida—; la madre sola con dos trabajos; el domingo como única unidad de tiempo familiar sobreviviente, y todo lo que se le exige a un solo día.

**Promesa al ensayo 5:** si la casa está vaciada, ¿qué se pierde exactamente cuando se pierde criar?

**Cartografía:** PLANMOV · PLANCUIDADO · PLANDIG · PLANFOCO · PLANVIV · PLANPACTO · `03-miedo-y-devenir.md` · `05-soberania.md` · `06-la-practica-del-tejido.md`

- [ ] **Step 1: Releer el contexto.** El spec `v2/docs/specs/2026-08-10-ciclo-iv-la-mesa.md`, la ficha de arriba, y `03-la-grieta-se-aprende-en-la-cocina.md` entero, no sólo su ficha: la promesa que dejó abierta es la primera línea de trabajo.

- [ ] **Step 2: Escribir el ensayo completo** en `Ensayos/la-mesa/04-la-silla-vacia.md`, con el esqueleto de secciones de arriba y las Global Constraints de la cabecera del plan.

- [ ] **Step 3: Correr el guardián**

Run: `cd v2 && ./apps/api/node_modules/.bin/tsx scripts/content/verificar-ciclo-la-mesa.ts`
Expected: ningún hallazgo con `04-la-silla-vacia.md` en la primera columna. Seguirá fallando con `✗ ciclo incompleto` hasta que existan los siete — eso es correcto y no se arregla bajando `ESPERADOS`.

- [ ] **Step 4: Revisión de autor, a mano.** Cinco preguntas: ¿hay un espejo argentino concreto y no genérico? ¿hay una parte hermosa, donde el autor deja de demostrar y dice lo que cree? ¿el movimiento es algo que se hace un lunes en una cocina, y no una fundación? ¿la última sección deja abierta la promesa al ensayo siguiente? ¿repite alguna escena ya usada en un ensayo anterior del ciclo? Si alguna falla, se corrige antes de commitear.

- [ ] **Step 5: Commit**

```bash
git add Ensayos/la-mesa/04-la-silla-vacia.md
git commit -m "feat(ensayos): Ciclo IV 4/7 — La silla vacía, el filo afuera y la palanca adentro"
```

---

### Task 6: Ensayo 5 — Las lecciones que no hacen falta

**Files:**
- Create: `Ensayos/la-mesa/05-las-lecciones-que-no-hacen-falta.md`

**Interfaces:**
- Consumes: el corolario "la casa no termina en la puerta" del ensayo 1; `06-amor-sin-apego.md` (servir sin poseer); `03-poder.md` (el poder como ficción).
- Produces: la aceptación de la propia sustitución, que es la puerta del ensayo 6.

**Título:** `# Las lecciones que no hacen falta`
**Subtítulo:** `## Sobre criar, y sobre lo que la crianza le enseña al que cría`

**Esqueleto:**

- **I.** La declaración que va en la primera página y no se negocia después: **criar no es un deber ni un requisito para una vida buena.** Se puede vivir una experiencia humana entera, hermosa y digna sin hacerlo. El ensayo lo dice temprano para no tener que defenderse tarde.
- **II.** Y sin embargo es un curso raro: entrega lecciones que no son indispensables y que, cuando llegan, empujan a la persona hacia ideales más puros de los que se le habrían ocurrido sola.
- **III–V.** Las lecciones, **como pasajes en prosa, no como lista numerada** — el análisis crítico ya marcó la saturación de enumeraciones en la serie. El futuro deja de ser un concepto y pasa a tener nombre y fiebre a las tres de la mañana. La paciencia deja de ser virtud moral y se vuelve disciplina física. El espejo devuelve al padre que juraste no repetir, y no hay forma de no verlo. El límite del control: criás a alguien que no vas a poder programar — la demostración doméstica de lo que `03-poder.md` argumenta en abstracto. Y la más política de todas: se aprende a pensar en décadas que no vas a ver, la única tecnología doméstica que produce pensamiento largo en un país entrenado para el mes que viene. Es esta última la que le da al ensayo su lugar dentro de la serie.
- **VI.** La cláusula que abre el curso a todos. Como la casa no termina en la puerta, la mayoría de estas lecciones no requieren haber engendrado: el hermano mayor, el tío, la maestra y el que cuida a un padre que envejece cursan la misma materia por otra puerta. **Sin condescendencia y sin consuelo** — es una constatación, no un premio de reposición.
- **VII.** La última lección: aceptar la propia sustitución. **La parte hermosa:** la lección más valiosa del curso es la que enseña a soltar, y la enseña la misma cosa que uno más quiere retener. **El movimiento:** escribí las tres cosas que aprendiste criando —a un hijo, a un hermano, a un sobrino, a un alumno, a un padre viejo— que no habrías aprendido de ningún otro modo. Y ahí el ensayo entrega el bastón.
- **Cartografía.**

**Restricción de escritura:** cero natalismo. Ninguna línea que sugiera deber, deuda con la patria, ni reproche a quien no tuvo hijos. Si una frase se puede leer como "habría que tener más hijos", se reescribe.

**Espejo argentino:** el país que le pregunta a una mujer de treinta y cinco cuándo, y no le pregunta nada al que ya tuvo tres; la familia que se agranda por adopción informal y el papeleo que llega diez años tarde.

**Promesa al ensayo 6:** si criar termina en aceptar la propia sustitución, ¿cómo se sale?

**Cartografía:** PLANARCO · PLANCUIDADO · `06-amor-sin-apego.md` · `03-poder.md` · `01-la-capa-cero.md`

- [ ] **Step 1: Releer el contexto.** El spec `v2/docs/specs/2026-08-10-ciclo-iv-la-mesa.md`, la ficha de arriba, y `04-la-silla-vacia.md` entero, no sólo su ficha: la promesa que dejó abierta es la primera línea de trabajo.

- [ ] **Step 2: Escribir el ensayo completo** en `Ensayos/la-mesa/05-las-lecciones-que-no-hacen-falta.md`, con el esqueleto de secciones de arriba y las Global Constraints de la cabecera del plan.

- [ ] **Step 3: Correr el guardián**

Run: `cd v2 && ./apps/api/node_modules/.bin/tsx scripts/content/verificar-ciclo-la-mesa.ts`
Expected: ningún hallazgo con `05-las-lecciones-que-no-hacen-falta.md` en la primera columna. Seguirá fallando con `✗ ciclo incompleto` hasta que existan los siete — eso es correcto y no se arregla bajando `ESPERADOS`.

- [ ] **Step 4: Revisión de autor, a mano.** Cinco preguntas: ¿hay un espejo argentino concreto y no genérico? ¿hay una parte hermosa, donde el autor deja de demostrar y dice lo que cree? ¿el movimiento es algo que se hace un lunes en una cocina, y no una fundación? ¿la última sección deja abierta la promesa al ensayo siguiente? ¿repite alguna escena ya usada en un ensayo anterior del ciclo? Si alguna falla, se corrige antes de commitear.

- [ ] **Step 5: Commit**

```bash
git add Ensayos/la-mesa/05-las-lecciones-que-no-hacen-falta.md
git commit -m "feat(ensayos): Ciclo IV 5/7 — Las lecciones que no hacen falta"
```

---

### Task 7: Ensayo 6 — Enseñar a morir

**Files:**
- Create: `Ensayos/la-mesa/06-ensenar-a-morir.md`

**Interfaces:**
- Consumes: **la reparación del ensayo 3**, que es su referencia estructural más importante; la sustitución aceptada del ensayo 5.
- Produces: el material del que se hace el ensayo 7 — lo que se salda antes de que se acabe el tiempo.

**Título:** `# Enseñar a morir`
**Subtítulo:** `## Sobre la casa que despide, y sobre los que se fueron como fuente`

**Esqueleto:**

- **I.** La familia enseña a vivir y tiene que enseñar a morir. La casa que no habla de la muerte no produce chicos protegidos: produce adultos que no saben acompañar, no saben despedirse y no saben irse.
- **II.** Los que se fueron como fuente, no como duelo mudo. Qué de un muerto sigue operando en la casa: un oficio, una frase, un modo de tratar a la gente, una receta, una tozudez. **La herencia que no es plata es la única que no se devalúa** — y en este país esa frase tiene un peso literal.
- **III.** El reverso: los silencios se heredan con la misma fidelidad que los relatos, y acá los silencios tienen apellido — el que se fue, el que perdió todo, el que volvió distinto, el que no volvió, el que colaboró. Un chico que crece con un silencio en la casa no crece sin el hecho: crece con el hecho más el miedo a nombrarlo.
- **IV.** Sanar antes. Irse en paz con los demás es la reparación del ensayo 3 sin prórroga posible: la misma operación, ahora con fecha de vencimiento desconocida. **Postergar una reparación es apostar a que va a haber tiempo, y es la única apuesta que una casa hace todos los días sin darse cuenta de que la está haciendo.**
- **V.** Hablar de la muerte. No como preparación morbosa sino como alfabetización: que un chico sepa que los que quiere se van a morir, y que eso se puede decir en voz alta en su casa, es la diferencia entre un adulto que puede acompañar y uno que desaparece cuando alguien se enferma. Un país que no elabora sus muertos está hecho de casas que no elaboran los suyos — **y el espejo argentino se escribe solo, sin necesidad de nombrar ninguna década en particular.**
- **VI.** **La parte hermosa:** la muerte es la única cosa que le pasa a todos y la única sobre la que cada casa decide sola qué se dice. Es soberanía en estado puro y casi nadie la ejerce. **El movimiento:** contá un muerto tuyo, con nombre, delante de alguien que no lo conoció. Y hacé hoy la reparación que estabas dejando para cuando hubiera un momento mejor.
- **Cartografía.**

**Promesa al ensayo 7:** si irse en paz es reparar sin prórroga, ¿qué se escribe mientras todavía hay tiempo?

**Cartografía:** PLANARCO · PLANSAL · PLANMEMORIA · `03-miedo-y-devenir.md` · `03-la-grieta-se-aprende-en-la-cocina.md`

- [ ] **Step 1: Releer el contexto.** El spec `v2/docs/specs/2026-08-10-ciclo-iv-la-mesa.md`, la ficha de arriba, y `05-las-lecciones-que-no-hacen-falta.md` entero, no sólo su ficha: la promesa que dejó abierta es la primera línea de trabajo.

- [ ] **Step 2: Escribir el ensayo completo** en `Ensayos/la-mesa/06-ensenar-a-morir.md`, con el esqueleto de secciones de arriba y las Global Constraints de la cabecera del plan.

- [ ] **Step 3: Correr el guardián**

Run: `cd v2 && ./apps/api/node_modules/.bin/tsx scripts/content/verificar-ciclo-la-mesa.ts`
Expected: ningún hallazgo con `06-ensenar-a-morir.md` en la primera columna. Seguirá fallando con `✗ ciclo incompleto` hasta que existan los siete — eso es correcto y no se arregla bajando `ESPERADOS`.

- [ ] **Step 4: Revisión de autor, a mano.** Cinco preguntas: ¿hay un espejo argentino concreto y no genérico? ¿hay una parte hermosa, donde el autor deja de demostrar y dice lo que cree? ¿el movimiento es algo que se hace un lunes en una cocina, y no una fundación? ¿la última sección deja abierta la promesa al ensayo siguiente? ¿repite alguna escena ya usada en un ensayo anterior del ciclo? Si alguna falla, se corrige antes de commitear.

- [ ] **Step 5: Commit**

```bash
git add Ensayos/la-mesa/06-ensenar-a-morir.md
git commit -m "feat(ensayos): Ciclo IV 6/7 — Enseñar a morir, la reparación sin prórroga"
```

---

### Task 8: Ensayo 7 — La mesa, hacia atrás y hacia adelante

Cierra el ciclo y contiene dos documentos, con precedente en la serie: el Credo va dentro de `06-belleza.md`, el Acta en la sección III de su ensayo.

**Files:**
- Create: `Ensayos/la-mesa/07-la-mesa.md`

**Interfaces:**
- Consumes: los seis ensayos del ciclo; `07-carta.md` (Carta al Nieto) y `07-acta-de-la-interdependencia.md` como formas de referencia.
- Produces: cierre. Después de este ensayo el ciclo pasa el guardián completo y arranca la publicación.

**Título:** `# La mesa, hacia atrás y hacia adelante`
**Subtítulo:** `## Dos textos: uno que salda, uno que abre`

**Esqueleto:**

- **I.** La tesis del cierre: la carta salda hacia atrás, el acuerdo abre hacia adelante, y no se puede firmar el segundo sin haber escrito la primera. Es la reparación del ensayo 3 ejecutada en las dos direcciones del tiempo.
- **II. Carta a los que me criaron.** El documento, entero, en el cuerpo del ensayo. Espejo exacto de `07-carta.md`: aquélla escribe hacia adelante y hacia la niebla; ésta hacia atrás y hacia gente con nombre, viva o muerta. **Su cláusula obligatoria:** el que fue criado por alguien que lastimó, o por nadie, escribe la versión que no se manda — sirve igual, porque el destinatario nunca fue el punto.
- **III. El Acuerdo de la Mesa.** El documento, entero. Corto, firmado entre todos, chicos incluidos. Cláusulas: cómo se pelea acá; cómo se repara y en cuánto tiempo; qué se cuenta de los que no están y qué no se calla; qué hora de la semana no se le vende a nadie; qué se hereda a propósito y qué se corta con nosotros —acá se incrusta el inventario de *lo que dejo*, que nace del ensayo 6—; y quién más está en esta mesa aunque no duerma acá.
- **IV.** La diferencia con el Acta de la Interdependencia, **dicha adentro del documento y no escondida.** El Acta se firma solo, con la conducta de uno. El Acuerdo no se puede firmar solo: es la primera pieza del corpus que obliga a levantar la vista y mirar a alguien. Por eso puede fallar de un modo que las otras no podían — el otro puede no firmar. **Cláusula final:** el que firma solo, firma igual, y el acuerdo queda abierto esperando al resto, sin reproche, como el tejido espera en `07-acta-de-la-interdependencia.md`.
- **V.** El cierre del ciclo y de la serie hasta acá: la unidad más chica de la política argentina es una mesa, y lo que pasa en esa mesa es la política argentina de dentro de treinta años.
- **Cartografía.**

**Cartografía:** PLANCUIDADO · `07-carta.md` · `07-acta-de-la-interdependencia.md` · `06-belleza.md` · los seis del ciclo

- [ ] **Step 1: Releer el contexto.** El spec `v2/docs/specs/2026-08-10-ciclo-iv-la-mesa.md`, la ficha de arriba, y `06-ensenar-a-morir.md` entero, no sólo su ficha: la promesa que dejó abierta es la primera línea de trabajo.

- [ ] **Step 2: Escribir el ensayo completo** en `Ensayos/la-mesa/07-la-mesa.md`, con el esqueleto de secciones de arriba y las Global Constraints de la cabecera del plan.

- [ ] **Step 3: Correr el guardián**

Run: `cd v2 && ./apps/api/node_modules/.bin/tsx scripts/content/verificar-ciclo-la-mesa.ts`
Expected: `7/7 ensayos · 0 hallazgos` + `✓ el ciclo pasa el guardián`, exit 0. **Es la primera vez que el guardián pasa entero.**

- [ ] **Step 4: Revisión de autor, a mano.** Cinco preguntas: ¿hay un espejo argentino concreto y no genérico? ¿hay una parte hermosa, donde el autor deja de demostrar y dice lo que cree? ¿el movimiento es algo que se hace un lunes en una cocina, y no una fundación? ¿la última sección deja abierta la promesa al ensayo siguiente? ¿repite alguna escena ya usada en un ensayo anterior del ciclo? Si alguna falla, se corrige antes de commitear.

- [ ] **Step 5: Commit**

```bash
git add Ensayos/la-mesa/07-la-mesa.md
git commit -m "feat(ensayos): Ciclo IV 7/7 — La mesa, la carta que salda y el acuerdo que abre"
```

---

## Task 9: Pase de coherencia del ciclo

El guardián verifica forma. Esta tarea verifica que los siete sean **un** argumento y no siete.

**Files:**
- Modify: cualquiera de `Ensayos/la-mesa/*.md` según lo que aparezca.

- [ ] **Step 1: Leer los siete seguidos, de una sentada, sin corregir nada.** Anotar sin actuar.

- [ ] **Step 2: Verificar la cadena de promesas.** Cada ensayo tiene que dejar abierta exactamente la pregunta que abre el siguiente:

| De → a | La promesa |
|---|---|
| 1 → 2 | Si la familia es una función, ¿cómo ejecuta esa función? |
| 2 → 3 | Si transmite por testigo, ¿qué es lo que este país viene atestiguando? |
| 3 → 4 | Si la casa enseñó a romper, ¿quién le sacó lo que hacía falta para enseñar a reparar? |
| 4 → 5 | Si la casa está vaciada, ¿qué se pierde exactamente cuando se pierde criar? |
| 5 → 6 | Si criar termina en aceptar la propia sustitución, ¿cómo se sale? |
| 6 → 7 | Si irse en paz es decir el final sin prórroga, ¿qué se escribe mientras todavía hay tiempo? |

- [ ] **Step 3: Verificar el músculo único.** La reparación aparece en el 3 (se define), en el 6 (sin prórroga) y en el 7 (en las dos direcciones). Confirmar que en los tres es **la misma operación con el mismo nombre** y no tres cosas parecidas.

- [ ] **Step 4: Auditoría de repetición.** Buscar ejemplos, escenas y frases usados dos veces en el ciclo. Cada escena vive en un solo ensayo; el que la repite la cede al que la usa mejor.

Run: `cd Ensayos/la-mesa && grep -c "asado\|el 60\|WhatsApp\|abuela" *.md`
Expected: ninguna escena concentrada en más de un archivo salvo cita deliberada.

- [ ] **Step 5: Verificar los cuatro no-negociables** — que ningún ensayo posterior renegocie la definición funcional del 1; que el 3 no reparta culpa; que el 4 enuncie la bisagra literal; que el 5 no tenga una sola línea natalista.

- [ ] **Step 6: Aplicar las correcciones y correr el guardián.**

Run: `cd v2 && ./apps/api/node_modules/.bin/tsx scripts/content/verificar-ciclo-la-mesa.ts`
Expected: `7/7 ensayos · 0 hallazgos` + `✓ el ciclo pasa el guardián`.

- [ ] **Step 7: Commit**

```bash
git add Ensayos/la-mesa/
git commit -m "refactor(ensayos): Ciclo IV — cadena de promesas y músculo único"
```

---

## Task 10: Publicación a v2

**Files:**
- Create: `v2/content/ensayos/{la-capa-cero,lo-que-el-chico-mira,la-grieta-se-aprende-en-la-cocina,la-silla-vacia,las-lecciones-que-no-hacen-falta,ensenar-a-morir,la-mesa}.mdx`
- Create: los siete `.txt` homónimos en `v2/content-txt/ensayos/`
- Create: `v2/scripts/content/verify-ensayos-la-mesa.ts`
- Modify: `Ensayos/00-ORDEN-DE-LECTURA.md`, `v2/content-txt/ensayos/00-ORDEN-DE-LECTURA.txt`

**Interfaces:**
- Consumes: los siete `.md` aprobados.
- Produces: los slugs que la Task 11 da de alta.

- [ ] **Step 1: Escribir el verificador verbatim**

Copiar `v2/scripts/content/verify-ensayos-interdependencia.ts` a `v2/scripts/content/verify-ensayos-la-mesa.ts`. El resto del archivo —parseo de H1/H2, comparación byte a byte del cuerpo, conteo de párrafos— queda **igual**: es exactamente la regla que hace falta acá. Cambian seis líneas, todas conocidas:

```bash
cd v2 && cp scripts/content/verify-ensayos-interdependencia.ts scripts/content/verify-ensayos-la-mesa.ts
```

| Línea del original | Queda |
|---|---|
| `:26` `const SRC_DIR = resolve(REPO_ROOT, 'Ensayos/interdependencia');` | `const SRC_DIR = resolve(REPO_ROOT, 'Ensayos/la-mesa');` |
| `:132` `const seriesOk = series === 'interdependencia';` | `const seriesOk = series === 'la-mesa';` |
| `:136` `...expected "interdependencia"...` | `...expected "la-mesa"...` |
| `:105` `expected exactly 7 interdependencia source files` | `expected exactly 7 la-mesa source files` |
| `:173` `OK — all 7 interdependencia ensayos...` | `OK — all 7 la-mesa ensayos...` |
| `:2`, `:5`, `:7`, `:16` (comentario de cabecera) | mismo texto con `la-mesa` y "fourth cycle" |

- [ ] **Step 2: Correr el verificador y verificar que falla**

Run: `cd v2 && ./apps/api/node_modules/.bin/tsx scripts/content/verify-ensayos-la-mesa.ts`
Expected: FAIL — no existe ningún MDX de la serie todavía.

- [ ] **Step 3: Componer los siete MDX**

Para cada ensayo: frontmatter + el cuerpo **byte-idéntico** al `.md` desde después del H2 de subtítulo. Frontmatter de ejemplo, para el ensayo 1 (los otros seis siguen el mismo molde, con su propio slug, título, subtítulo, summary, `orderIndex` y `readingMinutes`):

```yaml
---
slug: la-capa-cero
title: La Capa Cero
subtitle: Sobre la unidad que la arquitectura contó sin abrir
summary: 'Restale a la familia la sangre, la casa y el papel y queda una función: quién sostiene a quién. La única capa de gobierno que ya existe, funciona sin presupuesto y no la diseñó nadie.'
series: la-mesa
orderIndex: 1
publishedAt: 2026-08-10T00:00:00Z
readingMinutes: 13
tags:
  - familia
  - arquitectura
  - cuidado
draft: false
---
```

Reglas del frontmatter, verificadas contra el corpus existente:
- `summary` entre comillas simples si contiene `:`.
- `tags`: uno a tres, minúsculas, sin acentos, kebab-case. Vocabulario del ciclo: `familia`, `crianza`, `cuidado`, `muerte`, `reparacion`, `grieta`, `tiempo`, `herencia`, `arquitectura`, `argentina`.
- **`form` ausente en los siete.** El default del registry es `'ensayo'` y el test "exactly one acta" tiene que seguir pasando.
- `readingMinutes` = round(palabras del cuerpo / 200).
- `publishedAt` en ISO con `T00:00:00Z`, y **posterior al 9 de julio de 2026** para que el ciclo quede cuarto: `construirCiclos()` ordena por el `publishedAt` más viejo de cada serie.

- [ ] **Step 4: Correr el verificador verbatim y verificar que pasa**

Run: `cd v2 && ./apps/api/node_modules/.bin/tsx scripts/content/verify-ensayos-la-mesa.ts`
Expected: los 7 en verde, cuerpo byte-idéntico y conteo de párrafos igual.

- [ ] **Step 5: Copiar a texto plano**

Los `.txt` son copias byte-idénticas del `.mdx`, frontmatter incluido — verificado con `diff` contra el corpus existente.

```bash
cd v2/content/ensayos
for s in la-capa-cero lo-que-el-chico-mira la-grieta-se-aprende-en-la-cocina la-silla-vacia las-lecciones-que-no-hacen-falta ensenar-a-morir la-mesa; do cp "$s.mdx" "../../content-txt/ensayos/$s.txt"; done
```

- [ ] **Step 6: Verificar la paridad de las copias**

Run: `cd v2 && for s in la-capa-cero lo-que-el-chico-mira la-grieta-se-aprende-en-la-cocina la-silla-vacia las-lecciones-que-no-hacen-falta ensenar-a-morir la-mesa; do diff -q "content/ensayos/$s.mdx" "content-txt/ensayos/$s.txt" || echo "DIFIERE $s"; done`
Expected: sin salida.

- [ ] **Step 7: Actualizar los dos órdenes de lectura**

En `Ensayos/00-ORDEN-DE-LECTURA.md`: el encabezado pasa de "tres ciclos de siete" a cuatro; se agrega la sección "## Ciclo IV — La Mesa" con su tabla de siete filas siguiendo el formato exacto de los otros tres; y en "Si leés uno solo por ciclo" se agrega `**Ciclo IV** → la-mesa/01-la-capa-cero.md`. El párrafo de cierre sobre los últimos de cada ciclo suma `La mesa, hacia atrás y hacia adelante`.

En `v2/content-txt/ensayos/00-ORDEN-DE-LECTURA.txt`: mismo contenido en el formato ASCII de ese archivo — bloque con separadores `───`, ítems `N. slug.txt` + título indentado —, y en el bloque "SI LEÉS UNO SOLO POR CICLO" se agrega la línea `Ciclo IV  → la-capa-cero.txt`, alineada con las tres existentes.

- [ ] **Step 8: Lint, format y type-check**

Run: `cd v2 && pnpm lint:scripts && pnpm type-check:scripts && pnpm format:check`
Expected: sin errores. Si `format:check` marca los MDX, correr `pnpm format` y volver a chequear.

- [ ] **Step 9: Commit**

```bash
git add v2/scripts/content/verify-ensayos-la-mesa.ts v2/content/ensayos/ v2/content-txt/ensayos/ Ensayos/00-ORDEN-DE-LECTURA.md
git commit -m "feat(ensayos): Ciclo IV — 7 MDX, copias en texto plano y órdenes de lectura"
```

---

## Task 11: Alta del ciclo en la biblioteca de v2

Los `.mdx` los descubre el glob del registry solos, pero tres puntos tienen los tres ciclos escritos a mano.

**Files:**
- Modify: `v2/apps/web/src/pages/Biblioteca/biblioteca-data.ts:26-42` (mapa `ROTULOS`)
- Modify: `v2/apps/web/src/lib/__tests__/ensayos-registry.test.ts:5` y `:9`

**Interfaces:**
- Consumes: los siete MDX con `series: la-mesa`.
- Produces: el ciclo visible en `/biblioteca` y en `EnsayoDetail` con romano `IV`, rótulo y descripción.

- [ ] **Step 1: Actualizar los tests al nuevo canon de cuatro ciclos**

Los siete MDX ya existen desde la Task 10, así que estos tests están fallando **ahora mismo** en su forma vieja: `toHaveLength(21)` ve 28, y el assert de series desconocidas ve una serie de más. Correrlos antes de tocarlos para ver ese rojo es opcional; lo que no es opcional es que después de este paso queden verdes por la razón correcta y no por haber aflojado un assert.

En `v2/apps/web/src/lib/__tests__/ensayos-registry.test.ts`:

```ts
const EXPECTED_SERIES = ['primer-ciclo', 'indagaciones', 'interdependencia', 'la-mesa'] as const;
```

y el conteo:

```ts
  it('loads 28 ensayos across the four cycles', () => {
    expect(ENSAYOS).toHaveLength(28);
  });
```

y el nombre del test de ciclos, que dice "three":

```ts
  it('each of the four cycles has exactly 7 ensayos, in order 1..7', () => {
```

y el de series desconocidas, que dice "the three known cycles":

```ts
  it('no series outside the four known cycles', () => {
```

- [ ] **Step 2: Correr los tests**

Run: `cd v2/apps/web && pnpm test:unit -- ensayos-registry`
Expected: **PASS** si la Task 10 quedó bien hecha. Si falla en `toHaveLength(28)` o en el assert de 1..7, el problema está en el frontmatter de los MDX (`series` mal escrito, `orderIndex` repetido o faltante), no en el test — arreglar el MDX.

- [ ] **Step 3: Agregar el rótulo del ciclo**

En `v2/apps/web/src/pages/Biblioteca/biblioteca-data.ts`, dentro del mapa `ROTULOS`, después de la entrada `interdependencia`:

```ts
  'la-mesa': {
    rotulo: 'La Mesa',
    descripcion:
      'La familia como Capa Cero: el ladrillo que la arquitectura contó sin abrir, la reparación que se aprende en una cocina, y lo que una casa enseña a vivir y a morir.',
  },
```

- [ ] **Step 4: Correr la suite de la biblioteca**

Run: `cd v2/apps/web && pnpm test:unit -- Biblioteca`
Expected: PASS. `CICLO_COUNT` pasa a 4 y `ROMANOS[3]` da `'IV'` sin tocar nada más — los tests de `biblioteca-data` y de `IndiceEnsayos` iteran sobre `CICLOS`, no sobre literales.

- [ ] **Step 5: Verificación completa de v2**

Run: `cd v2 && pnpm lint && pnpm type-check && pnpm test`
Expected: todo verde.

- [ ] **Step 6: Verificar en el navegador**

Levantar el dev server y confirmar tres cosas en `/biblioteca`: el ciclo aparece como `Ciclo IV · 7 ensayos · agosto de 2026` con el rótulo "La Mesa"; el índice lista 28 ensayos; y en `/ensayos/la-capa-cero` el pie de navegación dice `Ciclo IV — La Mesa · ensayo 1 de 7`, con el link "anterior" avisando que cruza de ciclo hacia `acta-de-la-interdependencia`.

- [ ] **Step 7: Commit**

```bash
git add v2/apps/web/src/pages/Biblioteca/biblioteca-data.ts v2/apps/web/src/lib/__tests__/ensayos-registry.test.ts
git commit -m "feat(web): alta del Ciclo IV — La Mesa en la biblioteca"
```

---

## Notas de ejecución

- **El guardián falla en rojo desde la Task 1 hasta la Task 8.** Es el estado correcto: mide un ciclo completo. Ninguna tarea intermedia debe "arreglarlo" bajando `ESPERADOS`.
- **Rutas explícitas en todo `git add`.** Hay sesiones concurrentes en este repo (D-010) y el working tree ya trae cambios ajenos en `v2/apps/web/src/` y specs de otra sesión.
- **Un ensayo por tarea, sin excepción.** Escribir dos seguidos es donde se pierde la cadena de promesas y donde se repiten las escenas.
- **Si aparece un defecto que no se arregla en el momento**, anotarlo en `docs/DEUDAS.md` con id correlativo nuevo antes de seguir.
