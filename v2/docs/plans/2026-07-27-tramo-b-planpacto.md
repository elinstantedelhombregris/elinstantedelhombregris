# Tramo B — PLANPACTO — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Escribir `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md` — el documento del vigésimo tercer PLAN de ¡BASTA!, el pacto fiscal — con sus once arreglos obligatorios aplicados y la Escalera de Garantías que los otros tres PLANes nuevos necesitan para poder costearse.

**Architecture:** Una guardia ejecutable (`scripts/verificar-planpacto.ts`) declara qué secciones tiene que tener el documento, qué cifras canónicas tiene que citar y qué strings tiene prohibidos. Cada tarea de contenido **primero extiende la guardia** —que pasa a fallar— y después escribe las secciones que la hacen pasar. Es red-green sobre prosa: lo mecánico lo verifica el script, lo editorial lo verifica la revisión.

**Tech Stack:** TypeScript + tsx (script one-shot, se corre a mano y en CI), Markdown.

## Global Constraints

- **Spec de referencia:** `v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md`, sección 3 (PLANPACTO) y sección 2 (la aritmética del Techo, que es la autoridad numérica). Toda decisión ambigua se resuelve ahí.
- **El taller es el destino.** El documento se escribe en `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md`. **La ruta tiene espacio y acento: entrecomillala siempre en bash.** La edición derivada de `v2/content/planes/` NO se toca en este tramo: se deriva por script en el tramo E.
- **Este tramo no carga el PLAN en ningún registro.** No se toca `arquitecto-data.ts`, ni `strategic-initiatives.ts`, ni `PLAN_REGISTRY.yml`, ni `EXPECTED_PLAN_COUNT`, ni ningún conteo de 22. El documento existe en el taller y nada más lo conoce todavía. Eso es el tramo E.
- **Ordinal 23, y el H2 del cuerpo dice «Vigésimo Cuarto Mandato».** El orden de creación y el estratégico están desfasados en uno desde PLANRUTA: PLANMOV ya es «Vigésimo Tercer Mandato» con ordinal 22. Escribir «Vigésimo Tercero» sería un choque directo.
- **Español rioplatense (voseo) con acentuación correcta.**
- **Cuando «usá la cifra verbatim» choca con «no repitas la tesis», gana no repetir.** Si una cifra ya
  vive intacta en el preámbulo o en la tesis, la sección posterior la referencia o la nombra de otro
  modo, en vez de reponerla. Lo que no se puede es **cambiarla**.
- **Ninguna sección repite más de una cláusula de la tesis.** Donde la tesis afirmó, la sección **muestra**. El diagnóstico es la evidencia debajo del resumen, no el resumen otra vez: un lector que llega leyendo en orden tiene que sentir que avanza, no que le cobran dos veces. El registro del corpus: tercera persona para diagnóstico y diseño; el «vos» se reserva para la Promesa pública. Preferencia fuerte por futuro perifrástico («va a morir») sobre futuro simple («morirá») — preferencia, no prohibición: los documentos del corpus usan futuro simple entre 5 y 12 veces cada uno. Números biográficos en letras, números de política pública en cifras.
- **Cifras canónicas que el documento NO puede contradecir** (verificadas cuatro veces en el tramo A, fijadas por `SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts`):
  - Pisos constitucionales reclamados por los 22: **7,82–9,41% del PBI**, punto medio 8,62%.
  - Piso único que PLANPACTO propone: **2,40%**, expresado como 7–8% del gasto primario consolidado, **bruto y sustitutivo**.
  - La Escalera **conserva** 2,40% exacto en ocho escalones: 0,25 · 0,50 · 0,45 · 0,50 · 0,25 · 0,20 · 0,15 · 0,10.
  - Gate de spin-off: PLANPACTO 5,64x–5,24x contra PLANREP. Es el único de los cuatro nuevos que supera el umbral de tamaño.
  - Presupuesto propio: USD 500–700M/año en régimen; 1.400–1.500M/año en transición; 12.400–22.000M a quince años.
  - Presión fiscal consolidada que administra: USD 145.000–160.000M/año (29–32% del PBI, sobre un PBI de referencia de USD 500.000M).
- **Strings prohibidos** (cada uno tiene una razón, y están en la guardia):
  - `Procurement OS` — cero ocurrencias en `PLANDIG_Argentina_ES.md`; existe sólo en `SOURCE_OF_FUNDS_LEDGER.md` como F12, clase `future_return`. El dispositivo cuya regla es «ningún retorno futuro es fuente disponible» no puede construirse sobre uno.
  - `vota por Mesa Civil` / `votado por Mesa Civil` / `votada por Mesa Civil` — `PLANMESA:16` dice consulta **no vinculante**, y el art. 75 inc. 8 CN le da el presupuesto al Congreso.
  - `6,0% del PBI` y `3,5% del PBI` como piso propuesto — son las dos versiones anteriores, ambas descartadas.
  - `5,45-6,25%` / `5,45–6,25%` afirmado en presente como la suma de pisos — es la cifra vieja de 12 agencias. Sí puede aparecer citada como lo que el corpus declaraba antes.
- **Verificación antes de cada commit:** `npx tsx scripts/verificar-planpacto.ts` desde `SocialJusticeHub/`. **No corras `npm run verify`** — incluye un build de minutos.
- **Commits:** el repo raíz no usa commitlint. Formato de `../CLAUDE.md`: `Add [name] [type] — [context]`, `Fix [issue]: [detail]`. Un commit por tarea.
- **Cuidado con la concurrencia.** Otra sesión trabaja sobre `main` en este mismo working tree. Antes de cada commit corré `git status --porcelain` y **agregá al índice sólo tus archivos por nombre**; si ves borrados o modificaciones que no hiciste vos, no los toques y dejalos anotados en el reporte.

## File Structure

**Crear**

| Archivo | Responsabilidad |
|---|---|
| `SocialJusticeHub/scripts/verificar-planpacto.ts` | La guardia: secciones esperadas en orden, cifras canónicas presentes, strings prohibidos ausentes, marcadores de pendiente ausentes al cierre. |
| `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md` | El documento. Objetivo: 900–1.200 líneas, la escala de PLANMEMORIA (900), PLANTALLER (940), PLANCUIDADO (911). |

**Modificar**

| Archivo | Cambio |
|---|---|
| `Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md` | La fila de PLANPACTO: tres attack paths con mitigación, owner, fallback e indicador. |
| `.github/workflows/socialjusticehub-ci.yml` | La guardia corre en CI. |

**El modelo a imitar:** `Iniciativas Estratégicas/PLANMEMORIA_Argentina_ES.md` (900 líneas, 19 secciones H2). Es el documento más cercano en escala y el más reciente. Abrilo antes de escribir cada tarea y copiá su forma, no su contenido.

---

## El documento, de una sola mirada

Las diecinueve secciones, en orden, con la tarea que escribe cada una:

| # | Sección | Tarea |
|---|---|---|
| — | Cabecera (blockquote) + H1 + «Vigésimo Cuarto Mandato» + versión + portada ASCII | 1 |
| 1 | `## PREÁMBULO — {título}` | 2 |
| 2 | `## TESIS CENTRAL` | 2 |
| 3 | `## SECCIÓN 0: LAS OCHO FALLAS DEL RÉGIMEN FISCAL ARGENTINO` | 3 |
| 4 | `## SECCIÓN 1: LA CRISIS — {frase}` | 3 |
| 5 | `## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES` | 3 |
| 6 | `## SECCIÓN 3: LA SOLUCIÓN — ARQUITECTURA DE LOS ONCE DISPOSITIVOS` | 4 |
| 7 | `## SECCIÓN 4: LA ESCALERA Y EL TECHO` | 4 |
| 8 | `## SECCIÓN 5: LO QUE SE COBRA` | 5 |
| 9 | `## SECCIÓN 6: LO QUE SE REPARTE` | 6 |
| 10 | `## SECCIÓN 7: EL CONSEJO FEDERAL FISCAL (CFF)` | 6 |
| 11 | `## INTEGRACIÓN CON EL MARCO ¡BASTA!` | 6 |
| 12 | `## SECCIÓN 8: MODELO ECONÓMICO Y FISCAL` | 7 |
| 13 | `## SECCIÓN 9: RIESGOS Y RESPUESTAS` | 7 |
| 14 | `## SECCIÓN 10: EL MAPA DE PERDEDORES` | 7 |
| 15 | `## SECCIÓN 11: HOJA DE RUTA` | 7 |
| 16 | `## SECCIÓN 12: TABLERO NACIONAL FISCAL` | 8 |
| 17 | `## SECCIÓN 14: DIMENSIÓN FEDERAL` | 8 |
| 18 | `## SECCIÓN 15: VISIÓN 2040` | 8 |
| 19 | `## SECCIÓN 16: PROTOCOLO DE FALLA` | 8 |
| 20 | `## CIERRE` | 8 |

Los saltos de numeración (no hay SECCIÓN 13) imitan al corpus, que los tiene: PLANMEMORIA salta de la 12 a la 14.

---

### Task 1: La guardia y la cabecera del documento

**Files:**
- Create: `SocialJusticeHub/scripts/verificar-planpacto.ts`
- Create: `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md`

**Interfaces:**
- Consumes: nada.
- Produces: el comando `npx tsx scripts/verificar-planpacto.ts` (exit 0/1) y las constantes `SECCIONES_ESPERADAS`, `CIFRAS_CANONICAS`, `PROHIBIDOS` que las tareas 2 a 8 extienden.

- [ ] **Step 1: Escribir la guardia**

Crear `SocialJusticeHub/scripts/verificar-planpacto.ts`:

```ts
/**
 * Guardia del documento de PLANPACTO.
 *
 * Run: npx tsx scripts/verificar-planpacto.ts
 *
 * Verifica lo MECÁNICO y nada más: que estén las secciones esperadas y en
 * orden, que las cifras canónicas del tramo A aparezcan, que los strings
 * prohibidos no aparezcan, y que no queden marcadores de pendiente.
 *
 * La voz, el argumento y la prosa NO se verifican acá: eso lo mira la
 * revisión. Una guardia que pretende juzgar prosa da falsa tranquilidad.
 *
 * Cada tarea del plan agrega sus secciones a SECCIONES_ESPERADAS antes de
 * escribirlas: primero la guardia falla, después el documento la hace pasar.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const DOC = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md');

/** Los H2 que el documento tiene que tener, en este orden. Las tareas lo extienden. */
const SECCIONES_ESPERADAS: string[] = [
  '## Vigésimo Cuarto Mandato del Proyecto ¡BASTA!',
];

/**
 * Cifras verificadas en el tramo A que el documento no puede contradecir.
 * Fuente: v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md sección 2, y
 * SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts.
 */
const CIFRAS_CANONICAS: { valor: string; porQue: string }[] = [];

/** Strings que no pueden aparecer, con el motivo de cada uno. */
const PROHIBIDOS: { patron: RegExp; porQue: string }[] = [
  {
    patron: /Procurement OS/i,
    porQue:
      'cero ocurrencias en PLANDIG_Argentina_ES.md; existe sólo en SOURCE_OF_FUNDS_LEDGER.md como F12, clase future_return',
  },
  {
    patron: /vot(a|ada|ado)s? por (la )?Mesa Civil/i,
    porQue: 'PLANMESA:16 dice consulta no vinculante, y el art. 75 inc. 8 CN le da el presupuesto al Congreso',
  },
  { patron: /6,0% del PBI/, porQue: 'versión descartada del piso único; el piso es 2,40%' },
  { patron: /3,5% del PBI/, porQue: 'versión descartada del piso único; el piso es 2,40%' },
  {
    patron: /«PENDIENTE»|\{PENDIENTE\}|TODO:/,
    porQue: 'marcador de borrador: el documento se commitea sin secciones a medio escribir',
  },
];

function main(): void {
  let raw: string;
  try {
    raw = readFileSync(DOC, 'utf8');
  } catch {
    console.error(`No existe el documento: ${DOC}`);
    process.exit(1);
  }

  const errores: string[] = [];
  const lineas = raw.split('\n');

  // 1) Las secciones esperadas, presentes y en orden.
  let cursor = -1;
  for (const seccion of SECCIONES_ESPERADAS) {
    const i = lineas.findIndex((l, j) => j > cursor && l.trim() === seccion);
    if (i === -1) {
      const existeFuraDeOrden = lineas.some((l) => l.trim() === seccion);
      errores.push(
        existeFuraDeOrden
          ? `«${seccion}» está, pero fuera de orden (se esperaba después de la anterior)`
          : `falta la sección «${seccion}»`,
      );
      continue;
    }
    cursor = i;
  }

  // 2) Las cifras canónicas.
  for (const { valor, porQue } of CIFRAS_CANONICAS) {
    if (!raw.includes(valor)) errores.push(`falta la cifra canónica «${valor}» — ${porQue}`);
  }

  // 3) Los prohibidos.
  for (const { patron, porQue } of PROHIBIDOS) {
    const m = patron.exec(raw);
    if (m) {
      const nLinea = raw.slice(0, m.index).split('\n').length;
      errores.push(`línea ${String(nLinea)}: «${m[0]}» está prohibido — ${porQue}`);
    }
  }

  // 4) La cabecera de auditoría, una sola vez y al principio.
  const cabeceras = lineas.filter((l) => l.startsWith('> **CANONICAL_ARCHITECTURE:**')).length;
  if (cabeceras !== 1) {
    errores.push(`se esperaba 1 línea CANONICAL_ARCHITECTURE en la cabecera, hay ${String(cabeceras)}`);
  }

  if (errores.length > 0) {
    console.error(`La guardia de PLANPACTO encontró ${String(errores.length)} problema(s):\n`);
    for (const e of errores) console.error(`  · ${e}`);
    process.exit(1);
  }

  console.log(
    `PLANPACTO OK: ${String(SECCIONES_ESPERADAS.length)} secciones, ` +
      `${String(CIFRAS_CANONICAS.length)} cifras canónicas, ${String(lineas.length)} líneas.`,
  );
}

main();
```

- [ ] **Step 2: Correr la guardia para verificar que falla**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: `No existe el documento: …/PLANPACTO_Argentina_ES.md`, exit 1.

- [ ] **Step 3: Leer el modelo antes de escribir**

Run: `sed -n '1,60p' "Iniciativas Estratégicas/PLANMEMORIA_Argentina_ES.md"`

Mirá tres cosas y copiá su forma exacta: el blockquote de cabecera (qué claves lleva y en qué orden), el H1 + el H2 del mandato + la línea de versión, y la portada dentro del code fence (cuántas líneas, cómo se alinea, dónde va el código del PLAN).

- [ ] **Step 4: Escribir la cabecera, el H1 y la portada**

Crear `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md` con, en este orden:

**(a) El blockquote de cabecera.** Mismas claves que PLANMEMORIA, con estos valores:
- `REVISION_PROFUNDA:` — no aplica todavía, este documento nace después del playbook. Poné `pendiente — documento nuevo del 2026-07-27`.
- `CANONICAL_ARCHITECTURE:` — **`26 thematic + PLANRUTA protocol`**, y una frase que diga que PLANPACTO es el ordinal 23 de esos 26. Ojo: los otros 22 documentos todavía dicen 22; se re-derivan en el tramo E. Éste nace con el número nuevo.
- `REGISTRY:` — `ver PLAN_REGISTRY.yml` (que todavía dice `thematic_count: 22`; el tramo E lo corrige).
- `ACTA DE HABILITACIÓN:` — `ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md`. Es la clave nueva y es importante: este PLAN existe porque un acta lo habilitó, y el documento lo dice de entrada.
- `Tranche assignment:` — `tranche-1 tardío para la Fase 0; tranche-2 y tranche-3 para las Fases 1 y 2`.
- `Presupuesto canónico:` — `USD 500-700M/año en régimen; 1.400-1.500M/año en transición; 12.400-22.000M a quince años`.
- `Instrumento legal:` — `ley-convenio del art. 75 inc. 2 CN para la Fase 2; decreto y convenio de adhesión para la Fase 0`.
- `Principios aplicados (no negociables):` — copiá los de PLANMEMORIA y agregá: **la Fase 0 no requiere ley-convenio ni reforma constitucional; el PLAN vale aunque la Fase 2 no llegue nunca**.

**(b)** `# PLANPACTO — Plan Nacional de Pacto Fiscal, Reparto Federal y Escalera de Garantías` (H1).

**(c)** `## Vigésimo Cuarto Mandato del Proyecto ¡BASTA!` — exacto, con esa numeración. Ver Global Constraints.

**(d)** `### Versión 1.0 — Julio 2026`

**(e) La portada ASCII** en code fence, con la forma de la de PLANMEMORIA: el título evocativo en mayúsculas arriba, línea en blanco, el nombre institucional, línea en blanco, el código. El título evocativo es, exacto:

```
PAGÁS TODA TU VIDA
Y NUNCA TE DIERON EL RECIBO
```

- [ ] **Step 5: Correr la guardia**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: `PLANPACTO OK: 1 secciones, 0 cifras canónicas, N líneas.`

- [ ] **Step 6: Commit**

```bash
git status --porcelain
git add SocialJusticeHub/scripts/verificar-planpacto.ts "Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md"
git commit -m "Add PLANPACTO — cabecera, portada y la guardia del documento

El vigésimo tercer PLAN de ¡BASTA! arranca con su guardia: las secciones
esperadas en orden, las cifras canónicas del tramo A, y los strings que
tiene prohibidos con el motivo de cada uno.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 2: El preámbulo y la tesis central

Es la tarea que fija la voz de todo el documento. Las cinco siguientes la imitan.

**Files:**
- Modify: `SocialJusticeHub/scripts/verificar-planpacto.ts`
- Modify: `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md`

**Interfaces:**
- Consumes: la guardia y la cabecera de Task 1.
- Produces: el registro de voz que las tareas 3 a 8 continúan, y la persona del preámbulo, que el CIERRE de la Task 8 retoma.

- [ ] **Step 1: Extender la guardia**

En `SECCIONES_ESPERADAS`, después de la entrada del mandato, agregar:

```ts
  '## PREÁMBULO — EL RECIBO QUE NUNCA LLEGÓ',
  '## TESIS CENTRAL',
```

Y en `CIFRAS_CANONICAS`, agregar las tres que la tesis tiene que citar:

```ts
  { valor: '7,82', porQue: 'extremo bajo de los pisos que los 22 reclaman, % del PBI' },
  { valor: '9,41', porQue: 'extremo alto de los pisos que los 22 reclaman, % del PBI' },
  { valor: '2,40', porQue: 'el piso único que PLANPACTO propone, % del gasto primario consolidado' },
```

- [ ] **Step 2: Correr la guardia para verificar que falla**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: FAIL con cinco problemas — dos secciones faltantes y tres cifras canónicas faltantes.

- [ ] **Step 3: Escribir el PREÁMBULO**

`## PREÁMBULO — EL RECIBO QUE NUNCA LLEGÓ`, 1.000–1.500 palabras. Cinco piezas obligatorias, en este orden:

**(a) Una persona real, con nombre, edad exacta, localidad y oficio.** Es la convención más fuerte del corpus: todo documento abre con un rostro, y la escala entra después. Inventá a esa persona —el corpus lo hace— y que sea alguien que paga impuestos sin saber cuánto: un monotributista, una comerciante de barrio, un laburante en relación de dependencia. Que el lector pueda calcular con ella cuánto paga de verdad: el IVA incorporado en lo que compra, las cargas del recibo de sueldo, las tasas municipales, el impuesto inflacionario. **Los números de su vida van en letras** («ochenta y cuatro mil pesos»), los de política pública en cifras.

**(b) La escala, después del rostro.** Cuántas personas más están en la misma situación, y la presión fiscal consolidada: **USD 145.000–160.000M al año, 29–32% del PBI**.

**(c) El párrafo del Hombre Gris.** Va casi idéntico en los 23 documentos; copialo de `PLANMEMORIA_Argentina_ES.md` (buscá «Hay una filosofía que atraviesa») y agregale el párrafo propio de este PLAN: **el Hombre Gris de PLANPACTO despierta cuando pide el recibo.** Cuando deja de aceptar que la plata que pone desaparezca en un sistema que nadie le explicó y que nadie puede auditar.

**(d) La vuelta a la persona,** en el registro condicional que usa PLANMEMORIA («Si América, a los sesenta años, hubiera podido…»): qué pasaría si esa persona pudiera abrir su Recibo del Estado y ver adónde fue cada peso.

**(e) El párrafo de humildad epistémica,** que cierra el preámbulo. Copiá la forma de PLANMEMORIA («Todo lo que PLANXXX propone es la *primera mejor alternativa* basada en la mejor evidencia disponible en 2026. No es un plan perfecto — es un plan honesto…») adaptada al pacto fiscal.

- [ ] **Step 4: Escribir la TESIS CENTRAL**

`## TESIS CENTRAL`, 1.000–1.700 palabras en uno o dos párrafos largos —el corpus los escribe densos, sin subtítulos— con estos elementos obligatorios:

- **La tesis, textual de la spec:** Argentina discutió cuarenta años cuánto gastar y no discutió nunca quién paga ni cómo se reparte. La Ley 23.548 se sancionó con vigencia declarada de dos años y lleva treinta y ocho. El artículo 75 inciso 2 es el mandato constitucional incumplido más largo de la república. **PLANPACTO no es una reforma tributaria: es el acuerdo previo a cualquier reforma tributaria.**
- **La premisa de diseño idealizado:** qué cobraríamos, a quién, y con qué regla llegaría cada peso a cada jurisdicción sin que nadie tuviera que pedirlo. Y la segunda, que nadie se hizo: si todos los derechos que queremos garantizar reclaman su propio piso, ¿cuántos pisos entran antes de que el Estado deje de poder decidir algo?
- **El hallazgo que funda el PLAN, con las cifras exactas:** los pisos que los 22 PLANes reclaman por escrito suman **7,82–9,41% del PBI**, no el 5,45–6,25% que el propio corpus declaraba sobre una tabla de doce agencias escrita antes de que existieran los PLANes 17 a 22. **Que el proyecto no supiera cuánto estaba pidiendo es el mejor argumento a favor de tener un PLAN que lleve la cuenta.**
- **Los once dispositivos, nombrados en una sola pasada** (el corpus los enumera en la tesis y los desarrolla después): la Escalera y el Techo, el Recibo del Estado, el Libro Mayor Abierto, la Poda, el IVA que Vuelve, LA MASA, la sustitución de Ingresos Brutos, la Fórmula Abierta, el Giro Diario, el Auxilio Ciego, la Deuda con Nombre y el Tercer Piso.
- **El CFF** (Consejo Federal Fiscal) como el órgano que lo administra.
- **La declaración que ordena todo el documento:** la Fase 0 no le pide permiso a nadie, y **el PLAN vale la pena aunque la Fase 2 no llegue nunca**.

- [ ] **Step 5: Correr la guardia**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: `PLANPACTO OK: 3 secciones, 3 cifras canónicas, N líneas.`

- [ ] **Step 6: Commit**

```bash
git status --porcelain
git add SocialJusticeHub/scripts/verificar-planpacto.ts "Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md"
git commit -m "Add PLANPACTO — preámbulo y tesis central

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 3: El diagnóstico — las ocho fallas, la crisis y los precedentes

**Files:**
- Modify: `SocialJusticeHub/scripts/verificar-planpacto.ts`
- Modify: `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md`

**Interfaces:**
- Consumes: la voz de Task 2.
- Produces: los hechos que las secciones de solución (Tasks 4 a 6) responden una por una.

- [ ] **Step 1: Extender la guardia**

En `SECCIONES_ESPERADAS`, agregar al final:

```ts
  '## SECCIÓN 0: LAS OCHO FALLAS DEL RÉGIMEN FISCAL ARGENTINO',
  '## SECCIÓN 1: LA CRISIS — LA PLATA SE REPARTE CON UNA LEY QUE VENCIÓ EN 1990',
  '## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES',
```

- [ ] **Step 2: Correr la guardia para verificar que falla**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: FAIL con tres secciones faltantes.

- [ ] **Step 3: Escribir la SECCIÓN 0 — las ocho fallas**

1.000–2.150 palabras, con ocho subsecciones `###`, una por falla. Cada una abre nombrando la falla y cierra con el dato. **Estas son las ocho, con sus cifras — usalas verbatim:**

1. **La ley transitoria que lleva treinta y ocho años.** Ley 23.548, enero de 1988, sancionada con vigencia declarada de dos años y nunca reemplazada.
2. **El mandato constitucional incumplido más largo de la república.** La reforma de 1994 ordenó sancionar una nueva ley-convenio antes de finalizar 1996 y crear un organismo fiscal federal de control. Treinta años de incumplimiento del art. 75 inc. 2 y de la Disposición Transitoria Sexta.
3. **La presión fiscal que castiga producir.** 29–32% del PBI consolidado (≈ USD 145.000–160.000M sobre un PBI de referencia de USD 500.000M), recaudada con instrumentos que penalizan formalizarse y exportar.
4. **El depósito de tributos que nadie limpió.** ~155 tributos vigentes entre los tres niveles; alrededor de diez explican más del 90% de la recaudación. *(Declarar que es estimación de consenso de consultoras fiscales, no dato oficial auditado — el corpus marca sus estimaciones.)*
5. **Ingresos Brutos: el impuesto más distorsivo y el que sostiene la autonomía provincial.** ≈ 75–80% de la recaudación propia provincial, ≈ 4,0–4,5% del PBI (≈ USD 20.000–22.500M/año). Todo el corpus ¡BASTA! promete bajarlo y **ninguno dice con qué se reemplaza**. Esta falla es la que la Sección 5 tiene que resolver.
6. **Los pisos que nadie sumó.** **Diecisiete de los veintidós PLANes** reclaman piso constitucional por escrito en su propio documento, cada uno con su argumento y cada uno defendible por separado. Nadie los había sumado nunca. Sumados dan **7,82–9,41% del PBI**, y el corpus declaraba 5,45–6,25% sobre una tabla de doce agencias. Nombralo como lo que es: **el proyecto no sabía cuánto estaba pidiendo.**
7. **El instrumento que convierte una transferencia en un favor.** Los Aportes del Tesoro Nacional no fueron diseñados, criticados ni reemplazados por ningún PLAN: cero menciones de «ATN» o «Aportes del Tesoro Nacional» en las 46.234 líneas del taller.
8. **El corpus le habla a una agencia que cambió de nombre en 2024.** AFIP aparece 45 veces en 9 PLANes; ARCA, cero veces como agencia. No es cosmético: revela que ningún PLAN trató a la administración tributaria como objeto de diseño.

- [ ] **Step 4: Escribir la SECCIÓN 1 — la crisis**

`## SECCIÓN 1: LA CRISIS — LA PLATA SE REPARTE CON UNA LEY QUE VENCIÓ EN 1990`, 500–1.200 palabras. Qué le pasa a una provincia real bajo el régimen actual: coeficientes heredados de 1988 que no siguen a la población, transferencias discrecionales que llegan por gestión y no por regla, y el efecto sobre la persona del preámbulo. Cerrá con el costo de no hacer nada.

- [ ] **Step 5: Escribir la SECCIÓN 2 — precedentes**

`## SECCIÓN 2: PRECEDENTES INTERNACIONALES Y LOCALES`, 350–1.100 palabras. Qué probaron otros y qué se probó acá. Candidatos a desarrollar, con lo bueno y lo malo de cada uno: la ecualización fiscal canadiense y australiana (fórmula pública, comisión técnica independiente); el modelo alemán de reparto entre Länder; el HST canadiense como modelo de sustitución de un impuesto provincial en cascada por participación en una base ancha —**es el modelo que la Sección 5 usa para Ingresos Brutos, así que desarrollalo bien**—; y los intentos locales: los pactos fiscales de 1992, 1993 y el Consenso Fiscal 2017–2021, con **por qué fracasaron cada uno**. Ese fracaso es el antecedente que este PLAN hereda y tiene que contestar.

- [ ] **Step 6: Correr la guardia**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: `PLANPACTO OK: 6 secciones, 3 cifras canónicas, N líneas.`

- [ ] **Step 7: Commit**

```bash
git status --porcelain
git add SocialJusticeHub/scripts/verificar-planpacto.ts "Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md"
git commit -m "Add PLANPACTO — las ocho fallas, la crisis y los precedentes

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 4: La arquitectura y la Escalera de Garantías

Es el corazón del PLAN, y la sección que los otros tres PLANes nuevos necesitan para poder costearse. Aplica los arreglos 1, 2, 3, 10 y 11 de la spec.

**Files:**
- Modify: `SocialJusticeHub/scripts/verificar-planpacto.ts`
- Modify: `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md`

**Interfaces:**
- Consumes: la falla 6 de la Task 3.
- Produces: la Escalera y el Techo A/B, que la Sección 8 (Task 7) costea y a la que PLANARCO remite en el tramo C.

- [ ] **Step 1: Extender la guardia**

En `SECCIONES_ESPERADAS`, agregar al final:

```ts
  '## SECCIÓN 3: LA SOLUCIÓN — ARQUITECTURA DE LOS ONCE DISPOSITIVOS',
  '## SECCIÓN 4: LA ESCALERA Y EL TECHO',
```

En `CIFRAS_CANONICAS`, agregar:

```ts
  { valor: '8,62', porQue: 'punto medio de los pisos reclamados, % del PBI' },
  { valor: 'sustituye', porQue: 'el piso único es sustitutivo: sin esa palabra la lectura aditiva es legítima' },
```

- [ ] **Step 2: Correr la guardia para verificar que falla**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: FAIL con cuatro problemas — dos secciones y dos cifras.

- [ ] **Step 3: Escribir la SECCIÓN 3 — arquitectura**

950–1.700 palabras. Los once dispositivos presentados como un sistema, no como una lista: **qué hace cada uno y por qué el conjunto se sostiene**. Agrupalos como los agrupa el documento: los que ordenan (Escalera y Techo), los que muestran (Libro Mayor, Recibo), los que cobran (Poda, IVA que Vuelve, LA MASA, sustitución de IIBB), los que reparten (Fórmula, Giro Diario, Auxilio Ciego, Tercer Piso) y el que ata las manos hacia adelante (Deuda con Nombre).

**Arreglo 11 de la spec, obligatorio:** un solo dispositivo puede ser el número uno, y **es la Escalera**. El Recibo es la puerta —lo primero que la gente ve— pero no el eje. Que el texto no promueva a dos.

- [ ] **Step 4: Escribir la SECCIÓN 4 — la Escalera y el Techo**

Es la sección más importante del documento. Cinco piezas:

**(a) La tabla de los 22 pisos, fila por fila,** encabezada por esta frase exacta (arreglo 3):

> *«Ninguno de los tres números que circulan en nuestros propios papeles es correcto. Que el proyecto no supiera cuánto pedía es el mejor argumento a favor de este PLAN.»*

Los diecisiete PLANes con piso y sus valores salen de `SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts` (tabla `PISOS_SEGUN_EL_TALLER`). **Leelos de ahí y transcribilos, no los recuerdes.** Nombrá también los cinco sin piso: PLANREP, PLANMON, PLAN24CN, PLANGEO, PLANCUL. Total: **7,82–9,41% del PBI**, punto medio 8,62%.

Mencioná las tres cifras en conflicto que el corpus arrastraba —2,45%, 5,45–6,25% y 6,45–8,44%— y que ninguna era la verdadera.

**(b) El Techo, partido en dos (arreglo 1):**
- **Techo A — rigidez total.** 80% del gasto consolidado *con intereses*, bajando un punto por año hasta 70% en el año diez. Es objetivo de convergencia, no disparador.
- **Techo B — afectación nueva.** 7–8% del gasto primario consolidado (≈2,4% del PBI). Es lo único que este PLAN controla, y es donde se aplica el LIFO. **El LIFO nunca se aplica sobre A.**
- Los servicios de deuda salen del numerador de B: los intereses no son gasto primario, y no se puede poner en el numerador algo que el denominador excluye por definición.
- **El agregado se fija por ley.** Es el término indefinido más caro del PLAN: sobre consolidado con intereses da 66,3% hoy, sobre primario sin intereses 63,3%, sobre presupuesto nacional solo 81,6%.

**(c) La cuenta que muestra por qué el 65% no servía.** `R = (P + F) / (G + F)`; como G > P, R crece con F siempre: cada piso empeora el ratio. En el escenario central (P=23,15 · G=34,9) la Argentina ya está en **66,3% con cero pisos ¡BASTA! sancionados**. Y la prueba por el absurdo: para que un piso de 3,5% entrara bajo el 65% haría falta un gasto consolidado de 42,8% del PBI — el nivel argentino de 2015–2023. Decilo con todas las letras: **el Techo del 65% estaba calibrado contra un país que ya no existe.**

**(d) El piso único (arreglo 2): 2,40%,** expresado como **7–8% del gasto primario consolidado**, no en % del PBI. Explicá por qué la unidad importa: en recesión el PBI cae rápido y el gasto es pegajoso, así que un piso en % del PBI baja en pesos justo cuando más se lo necesita. El corpus repite que el piso en % del PBI «se ajusta solo» y lo declara mitigante; **es al revés**, y el documento tiene que decirlo.

**El piso es bruto y sustitutivo, y la palabra «sustituye» tiene que estar escrita.** Sin eso la lectura aditiva es legítima y la pila pasa a **10,22–11,81% del PBI** — los pisos existentes más el piso nuevo, contra cada extremo del rango. (No escribas 12,16%: era el punto medio viejo más el piso viejo, y las dos cifras se corrigieron.) Y las afectaciones específicas van *adentro* del piso, no arriba: si no, la Escalera se llena por la puerta de atrás y el LIFO se vuelve decorativo.

**(e) La Escalera, definida por lo que conserva.** Los ocho escalones y lo que queda en pie en cada uno — **estos ocho valores suman 2,40 exacto, sumalos antes de escribirlos**:

| Escalón | Materia | Conserva |
|---|---|---|
| 1 | Agua y alimento (AGUA + ISV) | 0,25 |
| 2 | Salud de base (SAL: piso inicial, no la meta del 15%) | 0,50 |
| 3 | Educación obligatoria (EDU) | 0,45 |
| 4 | Techo (VIV) | 0,50 |
| 5 | Cuidado y arco (CUIDADO) | 0,25 |
| 6 | Justicia (JUS) | 0,20 |
| 7 | Deliberación y memoria (MESA + MEMORIA) | 0,15 |
| 8 | Seguridad (SEG) | 0,10 |

Debajo de la línea, sin piso, con afectación temporal de hasta ocho años renovable por ley: **DIG, EN, MOV, TER, TALLER, EB y SUS pierden su piso entero.**

Los dos recortes grandes los defiende el propio corpus, y hay que citarlo: de PLANSEG, `PRESUPUESTO_CONSOLIDADO_BASTA.md:162` declara que 1,40–1,45 de su 1,50 es reasignación de gasto **que ya se ejecuta** — blindar plata que ya se gasta no protege nada, sólo consume Techo. De PLANVIV, el propio documento dice que los repagos de la Bastarda Inmobiliaria y los fees del Housing OS cubren el resto.

**No escribas una tabla de recortes por PLAN.** Cuatro de los diecisiete pisos están declarados como rango en su documento —SAL, DIG, JUS y MEMORIA—, y el punto de partida es el punto medio de un rango: itemizar con un valor único por PLAN mezcla bases y produce una suma que cierra por construcción. Si querés dar el orden de magnitud del recorte, dalo como residuo contra los tres extremos: **5,42** contra 7,82, **6,22** contra 8,62, **7,01** contra 9,41.

**(f) Quién decide el orden (arreglo 10).** La Escalera **no se vota por Mesa Civil**: `PLANMESA:16` dice consulta no vinculante y el art. 75 inc. 8 CN le da el presupuesto al Congreso. Escribí el mecanismo real: la Mesa Civil de materia fiscal **delibera y publica dictamen**, el CFF lo eleva, el Congreso sanciona la Ley de Escalera de Garantías, revisable cada ocho años. El dictamen no vinculante que el Congreso ignora **tiene que ser publicado junto con el voto de cada legislador** — que es la forma en que una consulta no vinculante muerde sin usurpar una competencia.

**(g) La Regla de Arco.** El eje intergeneracional entra **adentro** de la Escalera, no como instrumento paralelo: dos reglas de reparto se contradicen en la primera recesión —una comprime por materia, la otra por edad— y no hay árbitro. Dejá escrito que PLANARCO remite acá.

- [ ] **Step 5: Verificar la aritmética a mano antes de correr la guardia**

Run: `python3 -c "print(sum([0.25,0.50,0.45,0.50,0.25,0.20,0.15,0.10]))"`
Expected: `2.4`

Si la tabla que escribiste no da 2,40, corregí la tabla — no el total.

- [ ] **Step 6: Correr la guardia**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: `PLANPACTO OK: 8 secciones, 5 cifras canónicas, N líneas.`

- [ ] **Step 7: Commit**

```bash
git status --porcelain
git add SocialJusticeHub/scripts/verificar-planpacto.ts "Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md"
git commit -m "Add PLANPACTO — la arquitectura y la Escalera de Garantías

El piso único baja a 2,40% del gasto primario consolidado, bruto y
sustitutivo, y el Techo se parte en A (rigidez total) y B (afectación
nueva), que es lo único que el PLAN controla. La Escalera se define por
lo que conserva: ocho escalones que suman 2,40 exacto.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 5: Lo que se cobra

Aplica los arreglos 6, 7 y la parte de recaudación del 8.

**Files:**
- Modify: `SocialJusticeHub/scripts/verificar-planpacto.ts`
- Modify: `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md`

**Interfaces:**
- Consumes: la arquitectura de la Task 4.
- Produces: el Libro Mayor Abierto, al que la Sección 8 (Task 7) le cuelga el costeo del IVA que Vuelve.

- [ ] **Step 1: Extender la guardia**

En `SECCIONES_ESPERADAS`, agregar al final:

```ts
  '## SECCIÓN 5: LO QUE SE COBRA',
```

En `CIFRAS_CANONICAS`, agregar:

```ts
  { valor: 'El Estado es de vidrio y el ciudadano es opaco', porQue: 'la frase que separa el Libro Mayor del Recibo (arreglo 6)' },
```

- [ ] **Step 2: Correr la guardia para verificar que falla**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: FAIL con dos problemas — una sección y una cifra.

- [ ] **Step 3: Escribir la SECCIÓN 5**

Una subsección `###` por dispositivo. Seis dispositivos:

**(a) El Libro Mayor Abierto.** El libro contable de la Nación abierto en vivo: una fuente, un dueño, una fecha, una confianza, y cada peso trazable desde que se cobra hasta que se paga. Toda fuente aparece una sola vez —prohibido el doble conteo entre programas—, con dueño nominado, fecha de disponibilidad y calificación de confianza (alta, media, baja, especulativa). **Ningún retorno futuro puede computarse como fuente disponible para gasto presente.** Alcanza a Nación, 24 jurisdicciones, ~2.300 municipios y a cualquiera con un navegador. Instrumento: reforma de la Ley 24.156 de Administración Financiera + decreto de datos fiscales abiertos por defecto + convenio de adhesión.

**Le cuelgan cinco cosas que tienen que estar nombradas acá y no en otro lado** (arreglo 6): el KPI de trazabilidad, la afectación de retenciones de PLANISV, el 5% del Puente Sanitario, la reasignación de subsidios de PLANEN y el plan de convergencia del Auxilio Ciego.

**(b) El Recibo del Estado.** La factura anual y en vivo del Estado a cada persona: cuánto pagó de verdad y adónde fue cada peso. No las alícuotas nominales — lo efectivamente pagado, incluido el IVA incorporado en el precio, las cargas del recibo de sueldo, las tasas municipales y el impuesto inflacionario. Sin trámite, sin inscripción, sin condición de ingreso ni de formalidad. Instrumento: decreto de creación + convenio de interoperabilidad ARCA-provincias-municipios; **no requiere ley-convenio ni reforma constitucional**.

**Arreglo 6, y es el punto:** el Recibo y el Libro Mayor son **dos dispositivos distintos y no se fusionan**. El Recibo se computa del lado del ciudadano, en su wallet y con sus claves, porque lo contrario invertiría la cláusula central de PLANMON. El Libro Mayor es el registro público del gasto estatal y vive del lado del Estado. La frase que los ordena, y que tiene que estar escrita: ***«El Estado es de vidrio y el ciudadano es opaco.»***

**(c) La Poda.** Un test anual de tres preguntas con umbral numérico publicado, que invierte la carga de la prueba: ahora el impuesto tiene que justificarse. ¿Recauda al menos el 0,1% de la recaudación consolidada de su nivel? ¿Su costo administrativo es menor al 20% de lo que recauda? ¿Su base es distinta de la que ya grava otro tributo del mismo nivel? **El que falla dos de tres caduca.** Alcanza a los ~155 tributos vigentes y a las estructuras de tasas de ~2.300 municipios; meta: no más de 25 tributos en régimen.

**Corrección obligatoria:** la caducidad **no es automática**, es **diferida con ratificación legislativa negativa** — el tributo cae el 1 de enero siguiente salvo que la legislatura lo ratifique expresamente antes. La caducidad automática pura es un cheque en blanco a una planilla de cálculo.

**(d) El IVA que Vuelve.** Tasa única sobre base ancha, sin exenciones por producto —que en la práctica subsidian más al que más consume—, con devolución automática y semanal a la wallet de los hogares bajo un umbral, calculada sobre una canasta de referencia por composición del hogar. Salida gradual entre el quinto y el sexto decil, no salto, para no crear trampa de ingreso.

**Arreglo 7, obligatorio:** **el dispositivo está costeado y la cifra va escrita.** ~7,5M de hogares × USD 31–52/mes = **USD 2.800–4.700M/año (0,55–0,95% del PBI)**, que es cuatro a siete veces el presupuesto declarado del PLAN entero. Esa plata sale del Libro Mayor con fuente nominada. Y la devolución **arranca en la Fase 1, el primer viernes de 2029** — no en 2032, que es cuando hoy llegaría el primer beneficio concreto a una persona real.

**(e) LA MASA.** La regla antifuga: **toda especie tributaria nueva nace coparticipable**, salvo que una ley con mayoría agravada la declare de asignación específica y con plazo. Es el dispositivo que impide que el reparto se vacíe por arriba inventando tributos que no entran a la masa. Escribí acá también las **detracciones pre-coparticipación**, que no tienen una sola ocurrencia en las 46.234 líneas del taller: qué se detrae hoy antes de repartir, y qué detracciones sobreviven y con qué límite. Sin esto, la Fórmula Abierta reparte con precisión quirúrgica una masa que se vacía arriba.

**(f) La sustitución de Ingresos Brutos.** Es 4,0–4,5% del PBI y la autonomía fiscal de 24 jurisdicciones: no cabe en una oración subordinada. Escribí las cuatro cosas que hoy faltan:
- **De dónde sale** — participación provincial en la base ancha de consumo, con sobretasa provincial visible en el ticket, sobre el modelo HST canadiense que la Sección 2 desarrolló.
- **Adónde va** — qué jurisdicción cobra qué, y cómo se resuelve el conflicto entre origen y destino.
- **Qué pasa con la Comisión Arbitral** —hoy con cero menciones en el taller— que pasa a ser **sala técnica del CFF**.
- **Qué pierde cada provincia en el camino**, y en cuánto tiempo se recompone.

- [ ] **Step 4: Correr la guardia**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: `PLANPACTO OK: 9 secciones, 6 cifras canónicas, N líneas.`

- [ ] **Step 5: Commit**

```bash
git status --porcelain
git add SocialJusticeHub/scripts/verificar-planpacto.ts "Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md"
git commit -m "Add PLANPACTO — lo que se cobra

Libro Mayor y Recibo quedan separados: el Estado es de vidrio y el
ciudadano es opaco. El IVA que Vuelve entra costeado y adelantado a 2029.
Y se escribe lo que faltaba: LA MASA, las detracciones pre-coparticipación
y la sustitución de Ingresos Brutos completa.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 6: Lo que se reparte, y el Consejo Federal Fiscal

Aplica el arreglo 9 y la parte de reparto del 8.

**Files:**
- Modify: `SocialJusticeHub/scripts/verificar-planpacto.ts`
- Modify: `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md`

**Interfaces:**
- Consumes: LA MASA y las detracciones de la Task 5 — la Fórmula reparte lo que esos dos dispositivos definen.
- Produces: el CFF, que la hoja de ruta (Task 7) constituye en la Fase 0.

- [ ] **Step 1: Extender la guardia**

En `SECCIONES_ESPERADAS`, agregar al final:

```ts
  '## SECCIÓN 6: LO QUE SE REPARTE',
  '## SECCIÓN 7: EL CONSEJO FEDERAL FISCAL (CFF)',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
```

- [ ] **Step 2: Correr la guardia para verificar que falla**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: FAIL con tres secciones faltantes.

- [ ] **Step 3: Escribir la SECCIÓN 6 — lo que se reparte**

Una subsección `###` por dispositivo. Cinco dispositivos:

**(a) La Fórmula Abierta.** El reemplazo de la coparticipación: pública, auditable y corrible por cualquiera. Reparte **por habitante efectivamente residente**, corregida por tres coeficientes que se publican mes a mes:
- **Costo de Llegada** — cuánto cuesta de verdad prestar un servicio en esa geografía (densidad, dispersión, distancia al nodo logístico). Llegar a un chico en Santa Victoria Este no cuesta lo mismo que llegar a uno en Caballito.
- **Brecha** — distancia de esa jurisdicción respecto de la meta nacional en la materia.
- **Esfuerzo Propio** — cuánto recauda con lo que tiene, para que la fórmula no premie al que no cobra.

**Dos cosas que hoy faltan y son el ataque más obvio:**
- **El dueño y la auditoría del padrón.** El que cuenta cobra por lo que cuenta. Escribí quién produce el padrón, quién lo audita, cada cuánto, y qué pasa cuando una jurisdicción lo impugna.
- **La gobernanza de los coeficientes.** El código abierto resuelve la *verificación*, no la *elección*: que la fórmula sea corrible por cualquiera no dice quién elige los pesos. Escribí ese procedimiento.

**Aplicá al incremento, no al stock** — es lo que hace políticamente viable la convergencia y lo que permite que el Fondo de Compensación se apague solo.

**(b) El Giro Diario.** Cada peso recaudado se parte en el acto y llega a su jurisdicción en menos de veinticuatro horas, sin resolución administrativa de por medio. El Ejecutivo nacional puede auditar ese flujo; **no puede retenerlo, demorarlo, condicionarlo ni compensarlo**. Corre sobre el riel de PLANMON.

**Arreglo 9:** invertí la cuenta única. **ARCA recauda *dentro* de la cuenta del CFF, y la Nación cobra última del mismo acto.** No es un detalle de plomería: es la diferencia entre un reparto que se ejecuta y uno que se pide.

Escribí también lo que esto desarma: retener coparticipación deja de ser una jugada disponible contra una provincia, que es el principal vector de ataque que `PLANRUTA` modela.

**(c) El Auxilio Ciego.** Reemplaza a los ATN. El fondo conserva el mismo porcentaje de la masa que hoy tiene asignado, pero **sólo se abre por gatillo objetivo definido de antemano**: catástrofe declarada, caída de recaudación propia provincial mayor al 15% interanual real, emergencia sanitaria. Lo resuelve un panel sorteado en 72 horas.

**Usá la forma canónica del sorteo de PLANJUS** (`PLANJUS §400`: sorteo puro), no un panel inventado. No puede usarse para gasto corriente ordinario ni para cerrar déficits estructurales.

**(d) El Tercer Piso.** La Fórmula baja hasta el municipio con los mismos tres coeficientes y el mismo Giro Diario, y ninguna provincia puede girar menos que ese piso. A cambio, las mil y pico de tasas municipales se reducen a dos. Alcanza a ~2.300 municipios, con equipamiento y capacitación provistos los primeros ocho años.

**La captura de plusvalía se reparte por origen de la obra que creó el valor.** Hoy la reclaman PLAN24CN, PLANVIV y el municipio a la vez — adentro del PLAN cuya primera regla es *una fuente, un dueño*.

**(e) La Deuda con Nombre.** Ningún bono sin activo identificado, sin plazo menor a la vida útil de ese activo, y sin la firma de un panel de los que la van a pagar. Cada emisión que cruce el próximo período electoral lleva una **Ficha de Deuda escrita en castellano de vecino**: cuánto, para qué activo, quién la paga, en qué años, y qué pasa si no se paga. Se prohíbe deuda para gasto corriente, con una sola válvula: emergencia declarada por mayoría agravada, plazo máximo de veinticuatro meses, liquidación obligatoria al vencimiento. Alcanza también a los avales y garantías implícitas.

**Verificá que no quede más laxa que los principios 4 y 5 de PLANMON.** Abrí `PLANMON_Argentina_ES.md`, leelos, y si este dispositivo es más permisivo, alinealo.

- [ ] **Step 4: Escribir la SECCIÓN 7 — el CFF**

`## SECCIÓN 7: EL CONSEJO FEDERAL FISCAL (CFF)`. Es el organismo fiscal federal que el art. 75 inc. 2 CN ordenó crear en 1994 y que nunca se creó — decilo así, porque es su mejor argumento de legitimidad.

Cubrí: composición (con representación de las 24 jurisdicciones y de la Nación, y cómo se evita que la Nación tenga mayoría propia), la Comisión Arbitral incorporada como sala técnica, qué decide y qué sólo audita, cómo se lo financia sin que dependa del presupuesto de quien tiene que controlar, su presupuesto propio (**USD 500–700M/año en régimen**, que es 0,10–0,14% del PBI), y qué pasa con él si la Fase 2 no llega.

- [ ] **Step 5: Escribir INTEGRACIÓN CON EL MARCO ¡BASTA!**

270–415 palabras. Cómo se integra con cada PLAN, en el registro del corpus (una pasada larga, con los códigos en negrita). Las que no pueden faltar, porque son las aristas críticas del grafo:

- **PLANMON** — el Giro Diario liquida sobre el riel del Pulso. **Declará modo degradado**: qué pasa si PLANMON no llega a tiempo.
- **PLANDIG** — interoperabilidad de ARCA con las 24 administraciones. **Declará modo degradado.**
- **PLANVIV y PLANCUIDADO** — sus pisos (2,00% y 0,45%) dejan de ser reclamos propios y pasan a ser escalones de la Escalera: pierden exclusividad y ganan orden.
- **PLANRUTA** — el Giro Diario desarma su principal vector de ataque modelado. **Esta arista va en prosa, no como arista del grafo**: PLANRUTA no es nodo de `PLAN_NODES` y declararla rompería la validación con ERROR.
- **PLANARCO** — la Regla de Arco entra como eje intergeneracional adentro de la Escalera. Es el par recíproco más importante del diseño y tiene que estar declarado en los dos documentos.
- **PLANMESA** — dictamen no vinculante sobre la Escalera, publicado junto con el voto de cada legislador.
- **PLANJUS** — la forma canónica del sorteo para el panel del Auxilio Ciego.
- **PLANISV** — la afectación de retenciones cuelga del Libro Mayor. Ojo con la cifra: `PLANISV:1744` da 0,004–0,013% del PBI, no 0,08–0,19% — estaba sobrestimada unas quince veces, y corrige a favor.

- [ ] **Step 6: Correr la guardia**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: `PLANPACTO OK: 12 secciones, 6 cifras canónicas, N líneas.`

- [ ] **Step 7: Commit**

```bash
git status --porcelain
git add SocialJusticeHub/scripts/verificar-planpacto.ts "Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md"
git commit -m "Add PLANPACTO — lo que se reparte, el CFF y la integración

ARCA recauda dentro de la cuenta del CFF y la Nación cobra última del
mismo acto. La Fórmula gana dueño de padrón y gobernanza de coeficientes,
que era el ataque más obvio.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 7: La hoja de ruta, el modelo económico y los perdedores

Aplica los arreglos 4, 5 y la parte de riesgos del 8.

**Files:**
- Modify: `SocialJusticeHub/scripts/verificar-planpacto.ts`
- Modify: `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md`
- Modify: `Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md`

**Interfaces:**
- Consumes: todos los dispositivos de las Tasks 4 a 6.
- Produces: la fila de PLANPACTO en `READINESS_GATES_ADVERSARIAL.md`, que es vinculante para promoción de tranche.

- [ ] **Step 1: Extender la guardia**

En `SECCIONES_ESPERADAS`, agregar al final:

```ts
  '## SECCIÓN 8: MODELO ECONÓMICO Y FISCAL',
  '## SECCIÓN 9: RIESGOS Y RESPUESTAS',
  '## SECCIÓN 10: EL MAPA DE PERDEDORES',
  '## SECCIÓN 11: HOJA DE RUTA',
```

En `CIFRAS_CANONICAS`, agregar:

```ts
  { valor: 'RIGI', porQue: 'el régimen que congela por 30 años la estructura que el PLAN reescribe; no se nombraba nunca' },
```

- [ ] **Step 2: Correr la guardia para verificar que falla**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: FAIL con cinco problemas — cuatro secciones y una cifra.

- [ ] **Step 3: Escribir la SECCIÓN 8 — modelo económico y fiscal**

180–520 palabras. El presupuesto del PLAN: **USD 500–700M/año en régimen (0,10–0,14% del PBI, declarando que el PBI de referencia es USD 500.000M), 1.400–1.500M/año en transición por el Fondo de Compensación, 12.400–22.000M a quince años.**

Y la distinción que hay que hacer explícita: **lo que administra no es su presupuesto — es la presión fiscal consolidada de USD 145.000–160.000M/año.** Es la partida más grande que cualquier PLAN de ¡BASTA! toca, y el documento no puede dejarlo implícito.

Colgá acá el costeo del IVA que Vuelve (USD 2.800–4.700M/año) con su fuente nominada en el Libro Mayor, y clasificá cada partida según las clases de `SOURCE_OF_FUNDS_LEDGER.md` — abrí ese archivo y usá sus clases reales, no inventes una taxonomía.

- [ ] **Step 4: Escribir la SECCIÓN 9 — riesgos y respuestas**

370–690 palabras. Los riesgos con su respuesta, en tabla o en subsecciones. Los que no pueden faltar:

- **Las 24 ratificaciones que el país no juntó en treinta años.** La respuesta es estructural, no retórica: **el PLAN vale aunque la Fase 2 no llegue.**
- **«Este es el cuarto pacto fiscal y los tres anteriores fracasaron.»** Es la objeción más fuerte que
  existe contra este PLAN. La Sección 2 la planteó al escribir el fracaso de 1992, 1993 y el Consenso
  2017–2021, y **ninguna otra sección la contesta**. Contestala acá, y contestala por diferencia
  mecánica, no por optimismo: qué tiene este diseño que aquellos tres no tenían. Los candidatos
  honestos ya están en el documento — la Fórmula corriendo veinticuatro meses en modo sombra antes de
  tener efecto legal, el Giro Diario que saca al Ejecutivo del medio, la adhesión con caja desde el
  día uno, y una Fase 0 que no depende de que nadie ratifique nada. **Si alguno de esos tres pactos
  ya tenía la característica que invocás, no la invoques.**
- **La licuación del piso.** Un piso que se puede licuar sin derogar una ley está muerto y no lo sabe.
- **La captura del padrón.**
- **La reversión por decreto de la Fase 0.**
- **La compatibilidad con regímenes de estabilidad fiscal, y el RIGI en particular** — que congela por treinta años la estructura que este PLAN reescribe y **no se nombra ni una vez en el corpus**. Escribí qué pasa con los proyectos ya adheridos, si hay riesgo ISDS, y cuál es la posición del PLAN. No lo resuelvas de más: declarar el conflicto y su vía de tratamiento es suficiente y es honesto.

- [ ] **Step 5: Escribir la SECCIÓN 10 — el mapa de perdedores**

Es una sección propia porque este PLAN tiene más perdedores identificables que ningún otro, y un PLAN que no los nombra no está listo. Como mínimo:
- Los **gremios de las 25 administraciones tributarias** (nacional + 24 jurisdicciones), que hoy no están en ningún mapa del corpus.
- Los **consejos profesionales de ciencias económicas**, cuya facturación depende de la complejidad que la Poda elimina.
- Las **provincias que hoy reciben por encima de lo que la Fórmula les daría** — nombrá el mecanismo de transición, no el listado.
- Los **intermediarios políticos de los ATN**.
- Los **municipios que viven de tasas sin servicio detrás**.

Para cada uno: qué pierde, en qué plazo, y qué se le ofrece a cambio. Un mapa de perdedores sin oferta es una lista de enemigos.

- [ ] **Step 6: Escribir la SECCIÓN 11 — hoja de ruta**

240–350 palabras. Las cuatro fases:

- **Fase 0 — El espejo (2027–2028).** **Arreglo 4: está partida en dos.** El **núcleo unilateral** —Libro Mayor Abierto sobre e-SIDIF por decreto, y la mitad nacional del Recibo con lo que ARCA ya sabe— no le pide permiso a nadie y se ejecuta con las facultades que el Ejecutivo ya tiene. La **fase cooperativa** —las adhesiones provinciales, el Recibo completo— se declara **falible**: puede no conseguirse, y el PLAN lo dice.
- **Arreglo 5: la Fase 0 va blindada contra su propia reversibilidad.** Adhesión con caja desde el día uno (que adherir pague, para que desadherir cueste), convenio que subsiste sin la Nación, y feed de datos por ley con obligación de espejo.
- **Fase 1 — El acuerdo (2029–2031).** La Fórmula corre **veinticuatro meses en modo sombra**: se publica todos los meses cuánto recibiría cada jurisdicción, sin efecto legal. Es lo que convierte la negociación de un salto a ciegas en una verificación. Y el IVA que Vuelve arranca el primer viernes de 2029.
- **Fase 2 — El giro (2032–2035).** Ley-convenio sancionada y ratificada, Giro Diario en producción, sustitución de Ingresos Brutos.
- **Fase 3 — La convergencia (2036–2042).** La Fórmula aplicada al incremento converge alrededor del año doce, y el Fondo de Compensación se apaga solo.

**El corte Fase 0 / Fase 2 va en el cuerpo del documento, no en una nota al pie.**

- [ ] **Step 7: Escribir la fila de READINESS_GATES_ADVERSARIAL.md**

Abrí `Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md`, mirá el formato de las filas existentes, y agregá la de PLANPACTO con sus **tres attack paths, cada uno con mitigación, owner, fallback budget e indicador**. Los tres candidatos, en orden de probabilidad: la no-ratificación de la ley-convenio, la reversión por decreto de la Fase 0, y la captura del padrón.

- [ ] **Step 8: Agregar la clave de attack paths a la cabecera del documento**

Recién ahora existe la sección de PLANPACTO en `READINESS_GATES_ADVERSARIAL.md`, así que la cabecera
del documento puede referenciarla sin mentir. En el blockquote de `PLANPACTO_Argentina_ES.md`, agregar
la clave con la misma redacción que usa PLANMEMORIA:

> **Top-3 attack paths con mitigación, owner, fallback budget e indicador:** ver `READINESS_GATES_ADVERSARIAL.md` sección PLANPACTO. Vinculante para promoción de tranche.

La Task 1 la omitió a propósito porque la sección no existía todavía: esa clave afirma «vinculante
para promoción de tranche», y afirmarlo sin sección detrás sería falso.

- [ ] **Step 9: Correr la guardia**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: `PLANPACTO OK: 16 secciones, 7 cifras canónicas, N líneas.`

- [ ] **Step 10: Commit**

```bash
git status --porcelain
git add SocialJusticeHub/scripts/verificar-planpacto.ts "Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md" "Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md"
git commit -m "Add PLANPACTO — hoja de ruta, modelo económico y mapa de perdedores

La Fase 0 se parte en núcleo unilateral y fase cooperativa declarada
falible, y va blindada contra su propia reversibilidad. Entran el RIGI y
los gremios de las 25 administraciones tributarias, que no estaban en
ningún mapa del corpus.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 8: La integración, el tablero y el cierre

**Files:**
- Modify: `SocialJusticeHub/scripts/verificar-planpacto.ts`
- Modify: `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md`

**Interfaces:**
- Consumes: el documento entero.
- Produces: el documento completo, listo para el tramo E (que lo carga en los registros y lo deriva a `v2/content/planes/`).

- [ ] **Step 1: Extender la guardia**

En `SECCIONES_ESPERADAS`, agregar al final:

```ts
  '## SECCIÓN 12: TABLERO NACIONAL FISCAL',
  '## SECCIÓN 14: DIMENSIÓN FEDERAL',
  '## SECCIÓN 15: VISIÓN 2040',
  '## SECCIÓN 16: PROTOCOLO DE FALLA',
  '## CIERRE',
```

- [ ] **Step 2: Correr la guardia para verificar que falla**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: FAIL con cinco secciones faltantes.

- [ ] **Step 3: Escribir el TABLERO NACIONAL FISCAL**

90–250 palabras. Qué publica en tiempo real y con qué frecuencia. Como mínimo: la masa recaudada y repartida del día, el coeficiente vigente de cada jurisdicción, la posición contra el Techo A y el Techo B, el estado de cada escalón de la Escalera, y los tributos que están por caer en la próxima Poda.

**Para cada indicador, escribí cómo se lo falsea sin mentir.** Un tablero sin esa columna es una superficie de manipulación.

- [ ] **Step 4: Escribir DIMENSIÓN FEDERAL**

80–230 palabras. Qué cambia para una provincia chica, para una grande, para CABA y para un municipio del interior profundo. Concreto, no abstracto.

- [ ] **Step 5: Escribir VISIÓN 2040**

175–230 palabras. Cómo se ve el país con esto andando quince años. **La autarquía del CFF y su piso propio van acá**, no en el régimen inicial: son visión, no compromiso operativo.

- [ ] **Step 6: Escribir PROTOCOLO DE FALLA**

130–270 palabras. Qué se hace si el PLAN falla, por cada modo de falla nombrado en la Sección 9. Y la declaración que ordena todo: **si la Fase 2 no llega nunca, qué queda en pie** — el Libro Mayor, el Recibo nacional, la Poda y el IVA que Vuelve, que son los cuatro que no dependen de la ley-convenio.

- [ ] **Step 7: Escribir el CIERRE**

260–380 palabras. **Volvé a la persona del preámbulo por nombre.** Es la convención del corpus: el documento cierra donde abrió, con la misma persona, quince años después, con el recibo en la mano. Sin épica de más — el corpus cierra sobrio.

- [ ] **Step 8: Correr la guardia**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts`
Expected: `PLANPACTO OK: 21 secciones, 7 cifras canónicas, N líneas.`

- [ ] **Step 9: Verificar la escala del documento**

Run: `wc -l "Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md"`
Expected: entre 900 y 1.200 líneas. Si quedó por debajo de 800, alguna sección quedó corta contra su rango declarado — volvé a la que menos tenga.

- [ ] **Step 10: Commit**

```bash
git status --porcelain
git add SocialJusticeHub/scripts/verificar-planpacto.ts "Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md"
git commit -m "Add PLANPACTO — integración, tablero, visión y cierre

El documento queda completo: 21 secciones, la guardia en verde.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

### Task 9: La guardia entra en CI

**Files:**
- Modify: `.github/workflows/socialjusticehub-ci.yml`

**Interfaces:**
- Consumes: la guardia de la Task 1, ya completa.
- Produces: nada. Es el cierre del tramo.

- [ ] **Step 1: Cablear la guardia**

En `.github/workflows/socialjusticehub-ci.yml`, después del paso `Unit tests` (que el tramo A agregó), insertar un paso `Guardia de PLANPACTO` que corra `npx tsx scripts/verificar-planpacto.ts`. Seguí el estilo de los pasos vecinos.

Verificá también que el workflow se dispare con cambios en `Iniciativas Estratégicas/**`: si sus `paths` sólo cubren `SocialJusticeHub/**`, la guardia no va a correr cuando alguien edite el documento, que es justamente cuando hace falta. Si falta, agregalo.

- [ ] **Step 2: Verificar que la guardia falla cuando el documento se rompe**

Run:
```bash
cd SocialJusticeHub && cp "../Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md" /tmp/pp.bak && sed -i.tmp 's/## CIERRE/## FINAL/' "../Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md" && npx tsx scripts/verificar-planpacto.ts; echo "exit=$?"; cp /tmp/pp.bak "../Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md"
```
Expected: imprime `falta la sección «## CIERRE»` y `exit=1`. El `cp` final restaura el documento.

- [ ] **Step 3: Confirmar que quedó restaurado**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts && git status --porcelain "../Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md"`
Expected: la guardia en verde y `git status` sin salida para ese archivo. Borrá también el `.tmp` que dejó `sed` si quedó.

- [ ] **Step 4: Commit**

```bash
git status --porcelain
git add .github/workflows/socialjusticehub-ci.yml
git commit -m "Add guardia de PLANPACTO a CI

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
```

---

## Cierre del tramo

- [ ] **Verificación final**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpacto.ts && npm run check && npm run test:unit`
Expected: los tres verdes. El documento es Markdown y no afecta a tsc ni a los tests, pero si algo se rompió conviene saberlo antes de cerrar.

- [ ] **Confirmar que el tramo no tocó ningún registro**

Run: `git diff --stat <primer-commit-del-tramo>~1..HEAD -- SocialJusticeHub/shared v2/apps v2/content "Iniciativas Estratégicas/PLAN_REGISTRY.yml"`
Expected: **salida vacía.** Este tramo escribe un documento y una guardia; cargar el PLAN en los registros es el tramo E. Si aparece algo, se coló trabajo de otro tramo.

Al terminar: `Iniciativas Estratégicas/PLANPACTO_Argentina_ES.md` existe, tiene sus 21 secciones, cita las cifras que el tramo A verificó, no contiene ninguno de los strings prohibidos, y una guardia en CI lo mantiene así. **El tramo C (PLANARCO) puede empezar** — ya tiene la Escalera a la que remitir.
