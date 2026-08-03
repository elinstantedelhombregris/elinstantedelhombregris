# PLANPUERTA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recomendado) o superpowers:executing-plans para ejecutar este plan tarea por tarea. Los pasos usan checkbox (`- [ ]`).

**Goal:** Escribir `PLANPUERTA_Argentina_ES.md` — el PLAN de inmigración, ordinal 27, «Vigésimo Octavo Mandato» — con su guardia en CI, derogar la línea de reclutamiento de `PLANVIV:1566`, y llevar el canon de 26 a 27.

**Architecture:** El documento se organiza por el **Ciclo de Arraigo** (cinco tramos: Búsqueda → Llegada → Primeros Mil Días → Arraigo → Ciudadanía) y no por categorías de visa ni por la operación de fichaje. Once dispositivos. La función objetivo es la permanencia a diez años, no las llegadas. La guardia se escribe entera en la Task 1 y cada tarea posterior le achica la lista de errores.

**Tech Stack:** Markdown (el corpus), TypeScript + `tsx` (guardias), GitHub Actions (CI), MDX (`v2/content/planes/`).

**Spec:** `v2/docs/specs/2026-08-02-planpuerta.md` (commit `c12b2b8`)

---

## Lo que la verificación previa encontró, y la spec no decía

### V-1 · La migración del canon 22→26 **sí** se ejecutó, contra lo que declara el registro de cierre del tramo D

`v2/docs/plans/2026-08-01-tramo-d-planfoco.md:478` declara el tramo E entero como no hecho: «la migración del canon (spec §9), los conteos hardcodeados de 22 en nueve lugares ejecutables… y `strategic-initiatives.ts`».

Medición de hoy:

| Qué | Estado real |
|---|---|
| `PLAN_REGISTRY.yml:10,12` | `thematic_count: 26`, `total_documents: 27`, `last_updated: 2026-08-01` |
| Cabeceras `CANONICAL_ARCHITECTURE` | **178**, todas en `26 thematic + PLANRUTA protocol` |
| `strategic-initiatives.ts` | **26** entradas, incluidas PLANPACTO, PLANARCO, PLANPREGUNTA y PLANFOCO |
| `arquitecto-data.ts:353` | PLANFOCO presente, `ordinal: 26`, con sus aristas `d160`, `d164`, `d165`… |
| `v2/content/planes/` | **27** `.mdx` |

La migración se ejecutó **después** de escribirse ese registro y nunca se volvió a tocar el registro. **Consecuencia para este plan: PLANPUERTA no arranca sobre una migración a medias.** Arranca sobre un 26 consistente y sólo tiene que llevarlo a 27. La Task 12 es mucho más chica de lo que la spec §14 temía.

**Se corrige el registro de cierre del tramo D como parte de la Task 13.** Un registro que declara pendiente algo hecho es peor que uno incompleto: manda al siguiente a rehacer trabajo.

### V-2 · El glosario de `PlanEditor.tsx` quedó en **veintidós** — la trampa anunciada, y es un defecto preexistente

`SocialJusticeHub/client/src/components/arquitecto/PlanEditor.tsx:8`:

```ts
{ term: 'veintidós PLANes (al 23 de abril de 2026)', forbidden: 'dieciséis/quince/diez mandatos', context: 'Conteo canónico del ecosistema — PLANRUTA es meta-plan y no se cuenta' },
```

El canon es 26 desde hace un día y **ese glosario normativo marcaría el conteo correcto como violación.** No es daño que introduzca este tramo: ya está roto. Igual `arquitecto-data.ts:2`, cuyo comentario de cabecera dice «Extracted from 22 PLANes + support documents (April 2026)».

Los dos van a **27** en la Task 12, y el defecto se anota en `docs/DEUDAS.md` como encontrado-y-resuelto — encontrado el 2026-08-02, preexistente desde la migración a 26.

### V-3 · El agujero de `paths` del CI es real, y ya fue tapado a mano una vez

`.github/workflows/socialjusticehub-ci.yml:9-13` lleva una línea explícita para `v2/docs/specs/2026-07-26-cuatro-planes-nuevos.md`, con este comentario:

> *«La guardia de PLANARCO resuelve `spec:190` contra este archivo, que es la única entrada de `DOCUMENTOS_CITABLES` que NO vive en `Iniciativas Estratégicas/`. Sin esta línea, correrle las líneas a la spec rompe la guardia sin que CI llegue a correrla.»*

La guardia de PLANPUERTA va a citar `v2/docs/specs/2026-08-02-planpuerta.md`. **Hay que agregar ese path a las dos listas —`push` y `pull_request`— o se reabre el mismo agujero.** Es la Task 13 y no se puede olvidar.

### V-4 · Hay cinco guardias, no una, y una es de alcance general

`verificar-planpacto`, `verificar-planarco`, `verificar-planpregunta`, `verificar-planfoco` y `verificar-remisiones` — esta última valida **685 citas `ARCHIVO:línea` del corpus entero**. Tocar PLANVIV la pone a prueba. Se corren **todas**, no sólo la propia.

### V-5 · La fila de PLANVIV **no se borra: se deroga in situ** — y la aritmética de la tabla cascadea

`PLANVIV:1561-1567` es una tabla de cuatro fuentes con fila TOTAL. Borrar la fila `:1566` corre las líneas y rompe remisiones. La Global Constraint 7 del tramo D lo prohíbe, y el precedente de cómo hacerlo bien está en `PLANCUL:387`: **reescribir en el lugar como fila derogada con nota fechada, misma cantidad de líneas.**

Y hay cascada aritmética que la spec no calculó:

| Línea | Hoy | Después |
|---|---|---|
| `:1566` | 5.000-10.000 · USD 10-20M | **derogada** · cero |
| `:1567` TOTAL | **55.000-78.000** · USD 160-250M | **50.000-68.000** · **USD 150-230M** |
| `:1569` prosa | «El rango inferior (**55.000**) queda **25.000** corto del objetivo de 80.000» | «(**50.000**) queda **30.000** corto» |

Las tres se tocan **in situ y en la misma cantidad de líneas**. La cuenta que las sostiene: 30.000-40.000 (UOCRA, `:1563`) + 5.000-8.000 (El Refugio, `:1564`) + 15.000-20.000 (certificación rápida, `:1565`) = **50.000-68.000**; y 0 + 50-80M + 100-150M = **USD 150-230M**.

**La brecha se agranda y se declara, no se disimula.** `:1571` mitiga bajando la demanda efectiva de 80.000 a ~65.000: contra 50.000-68.000 disponibles, el extremo bajo sigue 15.000 corto. Eso es la deuda de la spec §8.1 y va escrita en el documento de PLANPUERTA con esa cifra.

### V-6 · Una remisión se puede romper sin que el número cambie — y este tramo reescribe tres líneas en el lugar

Lección 2 del tramo D: `verificar-remisiones.ts` **detecta corrimientos, no reescrituras**. Las tres líneas de V-5 se reescriben en el lugar, así que el barrido de remisiones va a dar verde aunque una cita textual de esas filas haya dejado de ser cierta. **Hay que buscar además la cita textual**: `grep -rn "55.000-78.000\|160-250M\|5.000-10.000"` sobre el corpus antes y después.

---

## Global Constraints

Aplican a todas las tareas. Violarlas es motivo de rechazo de la tarea, no de nota al pie.

1. **Toda cifra tiene domicilio o se declara.** Si sale del corpus va con `ARCHIVO:línea` en la misma oración. Si no sale del corpus, se declara con una de las cuatro ramas: **supuesto de trabajo**, **decisión de diseño de este documento**, **hueco declarado**, **restricción heredada**.
2. **`wc -w` crudo** es la única unidad de conteo de palabras. Sin normalizaciones privadas.
3. **Castellano rioplatense**, voseo. `solo` sin tilde. Números biográficos en letras, números de política en cifras. **¡BASTA! siempre con los dos signos de exclamación.**
4. **La restricción del fundador es absoluta y se verifica: el PLAN no crea poder de expulsión.** La guardia prohíbe los verbos de expulsión atribuidos a PLANPUERTA o a ANAR en forma afirmativa, y **deja pasar las formas negadas**, que son las que el documento necesita escribir. Se hereda el mecanismo `RECHAZO` + `exigeActor` de `verificar-planfoco.ts` — la lección 3 del tramo D: *un prohibido escrito contra el reclamo se dispara sobre el rechazo*, y este documento rechaza mecanismos por nombre en cada página.
5. **La metáfora inmunológica está prohibida.** El órgano es **la piel**. Ningún pasaje puede tratar al que llega como patógeno, infección, contagio, cuerpo extraño o amenaza biológica. Es la decisión 9 del registro de la spec y la guardia la vigila.
6. **Ninguna remisión a un archivo que no existe.** Y ninguna remisión `PLANPUERTA:línea` desde ningún lado hasta que el archivo esté escrito.
7. **Sin piso constitucional.** PLANPUERTA no agrega escalón a la Escalera de PLANPACTO. La guardia lo verifica contra `SocialJusticeHub/tests/unit/pisos-constitucionales.test.ts`.
8. **Toda edición de documento ajeno conserva el conteo de líneas o se anexa al final.** Sin excepción — es la lección 1 del tramo D, que con esa regla pasó de ocho remisiones rotas a cero.
9. **Un commit por tarea**, y al índice se agregan **sólo los archivos propios por nombre**. Nunca `git add -A` (hay sesiones concurrentes en este repo).

---

## Cifras canónicas — con domicilio

La guardia verifica que cada una aparezca con su ancla en la misma oración, al menos la primera vez.

| Cifra | Domicilio | Qué es |
|---|---|---|
| 29,9% nacidos en el extranjero (1914) | `censo.gob.ar` — Tercer Censo Nacional | el máximo histórico; **la cifra de la SECCIÓN 1** |
| 4,2% nacidos en el extranjero (2022) | `censo.gob.ar` — Censo 2022 | el mínimo del siglo |
| 65,9% de los inmigrantes es de países limítrofes | `censo.gob.ar` — Censo 2022 | **por qué B+C y no denunciar el tratado** |
| Ley 25.903 · Acuerdo de Residencia MERCOSUR (2002), vigente desde 28/07/2009 | `argentina.gob.ar` / spec `:§3.1` | la puerta que no se toca |
| Ley 25.871 art. 23 — categoría «nacionalidad MERCOSUR» | spec `:§3.1` | el derecho por nacionalidad |
| Ley 4.144 (22/11/1902 – 1958), expulsión sin juicio previo, 56 años | spec `:§6.3` | **el precedente que ordena todos los límites** |
| ~80% se fue a los seis meses · 12,5% a largo plazo · tracción → 5× | spec `:§4` | Start-Up Chile |
| 500.000 → 395.000 para 2025 (−21%); ~60% dijo «demasiados», primera vez desde 2000 | spec `:§4` | Canadá |
| 11.285 → ~41.000 (+264%), exención 50% / 60% con hijos menores | spec `:§5 D7` | Italia, régimen *impatriati* |
| NHR derogado 1/1/2025 → IFICI | spec `:§6.2 III.1` | Portugal: toda golden visa deriva a rentista |
| Lista de Salvaguardia de la OMS 2023 — **55 países** | spec `:§6.2 III.2` | el Techo de Origen |
| 5.000-10.000 trabajadores regionales · USD 10-20M | `PLANVIV:1566` | **lo que este PLAN deroga** |
| 50.000-68.000 · USD 150-230M | `PLANVIV:1567` (post-derogación) | el total corregido |
| 15.000 de brecha en el extremo bajo | `PLANVIV:1571` + V-5 | **la deuda declarada** |
| USD 26.350-73.000M a 15-20 años | `PRESUPUESTO_CONSOLIDADO_BASTA.md:33` (fila PLAN24CN) | dónde salen los lotes |
| USD 80.000-120.000M a 15 años | `PRESUPUESTO_CONSOLIDADO_BASTA.md:37` (fila PLANVIV) | el contraste de escala |
| ~3,5 millones de empleados públicos | `PLANREP:87` (TABLA 1) | por qué existe la Regla de Subsidiariedad |
| acceso pleno sin verificar estatus migratorio; no se comparte con Migraciones | `PLANJUS:2366` | el compromiso que se hereda |
| derechos migratorios de reunificación | `PLANCUIDADO:318` | de dónde sale el Compadrazgo de Llegada |
| Agencia del Litio del Cono Sur con Bolivia y Chile | `PLANGEO:425` | por qué no se denuncia MERCOSUR |
| adopción municipal de la Red Soberana | `PLANGEO:1151` | ídem |
| «fábrica de emigrantes» subsidiada | `PLANREP:2182` | el problema inverso que este PLAN cierra |

---

## Strings prohibidos

La guardia los busca **por oración**, no por línea, con `salvoSi` cuando la forma negada es legítima.

| Patrón | Por qué | Salvo si |
|---|---|---|
| `PLANPUERTA:` + dígitos | remisión a líneas propias desde afuera; cita fabricada | — |
| `expulsa`/`expulsión`/`deportar`/`deportación` atribuido a PLANPUERTA o ANAR, afirmativo | **el PLAN no crea poder de expulsión** (GC-4) | la oración lo niega, o atribuye la facultad al derecho penal vigente |
| `sistema inmune`/`inmunológic*`/`patógeno`/`contagio`/`infección`/`cuerpo extraño` | la metáfora prohibida (GC-5) | la oración la rechaza explícitamente |
| `golden visa`/`visa dorada`/`residencia por inversión`, afirmativo | prohibición III.1 | la oración lo prohíbe o lo critica |
| `denunciar`/`renegociar` + MERCOSUR, afirmativo | decisión 3: no se toca | la oración lo descarta |
| `cupo`/`cuota` por nacionalidad como criterio de **entrada** | B+C: lo selectivo es el Paquete, nunca la entrada | la oración lo aplica al **Techo de Origen** (que limita a quién *buscamos*, no quién entra) |
| `Ministerio de Migraciones`/`ANAR absorbe` | ANAR no absorbe Migraciones (decisión 8) | la oración lo niega |
| `Vigésimo Séptimo Mandato` | ése es PLANFOCO; éste es el **Vigésimo Octavo** | — |
| `26 thematic` en la cabecera de este documento | el canon es 27 desde este tramo | — |
| `piso constitucional` afirmativo para PLANPUERTA | no tiene, y no lo pide | la oración lo niega |
| `5.000-10.000` trabajadores regionales sin marca de derogación | la línea está derogada | la oración cita `PLANVIV:1566` y la declara derogada |
| `55.000-78.000` / `160-250M` | totales viejos de `PLANVIV:1567` (**V-5**) | la oración los declara históricos |
| `ideales` como causal de pérdida de residencia | acto sí, idea nunca (GC-4, spec §6.3) | la oración lo aplica al **Paquete**, no a la residencia |

---

## File Structure

```
Iniciativas Estratégicas/
  PLANPUERTA_Argentina_ES.md            # NUEVO — el documento
  PLANVIV_Argentina_ES.md               # MOD — :1566 derogada, :1567 y :1569 recalculados (in situ, mismo conteo)
  PLAN_REGISTRY.yml                     # MOD — 26→27, entrada nueva, freeze_excepciones
  ACTA_EXCEPCION_FREEZE_2026-08-02.md   # NUEVO — el acta de habilitación
  READINESS_GATES_ADVERSARIAL.md        # MOD — bloque PLANPUERTA con tres attack paths
  PRESUPUESTO_CONSOLIDADO_BASTA.md      # MOD — fila PLANPUERTA (anexo a la tabla)

SocialJusticeHub/
  scripts/verificar-planpuerta.ts       # NUEVO — la guardia del documento
  shared/strategic-initiatives.ts       # MOD — entrada 27
  shared/arquitecto-data.ts             # MOD — nodo 27 + aristas; comentario :2 a 27
  client/src/components/arquitecto/PlanEditor.tsx  # MOD — glosario a 27 (V-2)
  client/public/docs/PLANPUERTA_Argentina_ES.md    # NUEVO — copia servida

v2/
  content/planes/PLANPUERTA.mdx         # NUEVO — MDX con frontmatter
  docs/plans/2026-08-01-tramo-d-planfoco.md  # MOD — corregir el registro de cierre (V-1)

docs/DEUDAS.md                          # MOD — el defecto V-2, encontrado y resuelto
.github/workflows/socialjusticehub-ci.yml    # MOD — guardia nueva + path de la spec (V-3)
```

---

## Presupuesto de palabras

Objetivo total: **21.000-24.000 palabras.**

Calibrado contra el corpus por **forma**, no por tamaño — lección 4 del tramo D. PLANFOCO cerró en 25.631 con 26 secciones siendo el de menor presupuesto administrado; PLANPUERTA tiene 25 secciones y **menos presupuesto todavía** (clase S contra la banda de PLANFOCO), pero su SECCIÓN 9 —el Marco de la Puerta— es la más densa del documento y no se recorta. Referencias: PLANCUL 11.136, PLANMESA 15.871, PLANFOCO 25.631, PLANPACTO 26.541, PLANPREGUNTA 29.242, PLANARCO 34.440.

| Sección | Palabras |
|---|---|
| Cabecera + portada | 700-820 |
| PREÁMBULO | 1.400-1.750 |
| TESIS CENTRAL | 500-650 |
| SECCIÓN 0 — las siete fallas | 1.800-2.200 |
| SECCIÓN 1 — la crisis (29,9% → 4,2%) | 800-1.000 |
| SECCIÓN 2 — precedentes internacionales | 1.100-1.400 |
| SECCIÓN 3 — arquitectura de los once dispositivos | 900-1.150 |
| SECCIÓN 4 — Tramo 1, La Búsqueda | 1.400-1.750 |
| SECCIÓN 5 — Tramo 2, La Llegada | 1.300-1.600 |
| SECCIÓN 6 — Tramo 3, Los Primeros Mil Días | 1.600-1.950 |
| SECCIÓN 7 — Tramo 4, El Arraigo | 700-900 |
| SECCIÓN 8 — Tramo 5, La Ciudadanía | 600-800 |
| **SECCIÓN 9 — El Marco de la Puerta** | **2.000-2.400** |
| SECCIÓN 10 — lo que este PLAN tiene prohibido | 800-1.000 |
| SECCIÓN 11 — ANAR | 800-1.000 |
| INTEGRACIÓN CON EL MARCO ¡BASTA! | 700-900 |
| SECCIÓN 12 — modelo económico | 1.200-1.500 |
| SECCIÓN 13 — riesgos y respuestas | 500-700 |
| SECCIÓN 14 — mapa de perdedores | 450-620 |
| SECCIÓN 15 — hoja de ruta | 400-550 |
| SECCIÓN 16 — Tablero de Arraigo | 350-500 |
| SECCIÓN 17 — dimensión federal | 380-520 |
| SECCIÓN 18 — visión 2040 | 330-470 |
| SECCIÓN 19 — protocolo de falla | 430-580 |
| CIERRE | 400-600 |

**Si una sección queda corta, se agrega contenido verificado o se corrige el rango con la medición escrita. Nunca se rellena.**

---

## Tasks

> **Desvío declarado respecto del red-green por tarea.** La guardia de la Task 1 se escribe **entera** —las 25 secciones, las 22 cifras canónicas y los 13 prohibidos— en vez de crecer tarea por tarea. Arranca reportando ~50 problemas y cada tarea achica la lista. Es el mismo rojo-verde con una sola vuelta de edición del script en lugar de trece. Se pierde ver *qué chequeo nuevo* puso rojo en cada tarea; se gana que ningún chequeo quede sin escribir por olvido. El intercambio se declara acá y no se descubre después.

---

### Task 1 — La guardia y el esqueleto

**Files:**
- Create: `SocialJusticeHub/scripts/verificar-planpuerta.ts`
- Create: `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md`
- Read: `SocialJusticeHub/scripts/verificar-planfoco.ts` (se hereda la maquinaria)

**Interfaces:**
- Produces: `verificar-planpuerta.ts` ejecutable con `npx tsx scripts/verificar-planpuerta.ts` desde `SocialJusticeHub/`, exit 0 en verde y exit 1 con lista de errores en rojo. Constantes exportadas para las tareas siguientes: `SECCIONES_ESPERADAS: string[]`, `CIFRAS_CANONICAS`, `PROHIBIDOS`.

- [ ] **Paso 1: Leer la guardia modelo.** Leer `SocialJusticeHub/scripts/verificar-planfoco.ts` entero. Se copia la maquinaria, no se reinventa: lectura del doc, chequeo de H2 en orden, epígrafes con default «tiene uno» y opt-out verificado en las dos direcciones, subsecciones con auto-descubrimiento, cifras con ancla en la misma oración, prohibidos por oración con `salvoSi`, `RECHAZO` y `exigeActor`.

- [ ] **Paso 2: Escribir la guardia con las cuatro reglas de doctrina heredadas.**

```ts
/**
 * Guardia del documento de PLANPUERTA.
 *
 * Run: npx tsx scripts/verificar-planpuerta.ts
 *
 * ── DOCTRINA HEREDADA DE LOS TRAMOS C, D Y E ────────────────────────────────
 *   1. default seguro + opt-out explícito, verificado EN LAS DOS DIRECCIONES;
 *   2. descubrimiento automático — un chequeo que no encuentra ninguna
 *      ocurrencia válida de una entrada sin opt-out es un error, no un pase;
 *   3. si el ancla no es única, el chequeo NO corre y lo dice;
 *   4. patrón y excepción miden la misma unidad (la oración, no la línea).
 *
 * ── LO PROPIO DE ESTE PLAN ──────────────────────────────────────────────────
 * Dos restricciones absolutas que la guardia vigila en forma AFIRMATIVA CON
 * RECHAZO, porque el documento tiene que poder escribir «PLANPUERTA no expulsa»
 * y «no es el sistema inmune» sin ponerse rojo:
 *   (a) el PLAN no crea poder de expulsión — ni para sí ni para ANAR;
 *   (b) la metáfora inmunológica está prohibida: el órgano es la piel.
 * Un prohibido que castiga la renuncia y deja pasar el reclamo está al revés.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const DOC = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md');
/** El documento ajeno donde se deroga la fila de reclutamiento. Lo lee la Task 11. */
const PLANVIV = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANVIV_Argentina_ES.md');
/** Única fuente canónica de los pisos declarados. PLANPUERTA no puede aparecer ahí. */
const CANON_PISOS = resolve(SCRIPT_DIR, '../tests/unit/pisos-constitucionales.test.ts');
/** La spec. Se cita desde el documento; por eso entra a los paths del CI (V-3). */
const SPEC = resolve(REPO_ROOT, 'v2/docs/specs/2026-08-02-planpuerta.md');

/** El H2 del mandato. PLANPUERTA es el ordinal 27 y el mandato VIGÉSIMO OCTAVO. */
const H2_MANDATO = '## Vigésimo Octavo Mandato del Proyecto ¡BASTA!';

/** Los H2 que el documento tiene que tener, en este orden. */
export const SECCIONES_ESPERADAS: string[] = [
  H2_MANDATO,
  '## PREÁMBULO — EL MÉDICO QUE MANEJA',
  '## TESIS CENTRAL',
  '## SECCIÓN 0: LAS SIETE FALLAS DE LA POLÍTICA MIGRATORIA ARGENTINA',
  '## SECCIÓN 1: LA CRISIS — DE UNO DE CADA TRES A UNO DE CADA VEINTICUATRO',
  '## SECCIÓN 2: PRECEDENTES INTERNACIONALES',
  '## SECCIÓN 3: LA SOLUCIÓN — ARQUITECTURA DE LOS ONCE DISPOSITIVOS',
  '## SECCIÓN 4: TRAMO 1 — LA BÚSQUEDA',
  '## SECCIÓN 5: TRAMO 2 — LA LLEGADA',
  '## SECCIÓN 6: TRAMO 3 — LOS PRIMEROS MIL DÍAS',
  '## SECCIÓN 7: TRAMO 4 — EL ARRAIGO',
  '## SECCIÓN 8: TRAMO 5 — LA CIUDADANÍA',
  '## SECCIÓN 9: EL MARCO DE LA PUERTA',
  '## SECCIÓN 10: LO QUE ESTE PLAN TIENE PROHIBIDO',
  '## SECCIÓN 11: LA AGENCIA NACIONAL DE ARRAIGO (ANAR)',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
  '## SECCIÓN 12: MODELO ECONÓMICO',
  '## SECCIÓN 13: RIESGOS Y RESPUESTAS',
  '## SECCIÓN 14: EL MAPA DE PERDEDORES',
  '## SECCIÓN 15: HOJA DE RUTA',
  '## SECCIÓN 16: TABLERO DE ARRAIGO',
  '## SECCIÓN 17: DIMENSIÓN FEDERAL',
  '## SECCIÓN 18: VISIÓN 2040',
  '## SECCIÓN 19: PROTOCOLO DE FALLA',
  '## CIERRE',
];
```

- [ ] **Paso 3: Cargar las 22 cifras canónicas y los 13 prohibidos** de las dos tablas de este plan, con la misma forma que usa `verificar-planfoco.ts` (`{ patron, ancla, salvoSi? }` y `{ patron, porQue, salvoSi?, RECHAZO?, exigeActor? }`). Los dos prohibidos propios —expulsión y metáfora inmunológica— usan `RECHAZO` (negación en cualquier parte de la oración) más `exigeActor` (sólo dispara si la oración nombra a PLANPUERTA, ANAR o el Estado), porque el documento rechaza esos mecanismos por nombre en cada página.

- [ ] **Paso 4: Verificar que no hay piso constitucional.** El chequeo lee `CANON_PISOS` y falla si el string `PLANPUERTA` aparece ahí.

- [ ] **Paso 5: Crear el documento con `cat > … <<'EOF'`** — cabecera de metadatos, H1 `# PLANPUERTA — Plan Nacional de Arraigo, Búsqueda de Talento y Poblamiento`, `## Vigésimo Octavo Mandato del Proyecto ¡BASTA!`, versión, portada ASCII con el título evocativo *«Nadie deja su casa por una exención impositiva.»*
  - La cabecera lleva `> **CANONICAL_ARCHITECTURE:** 27 thematic + PLANRUTA protocol — este PLAN es **uno** de los 27, sin split.`
  - La cabecera escribe el **total de quince años** (USD 450-900M) y remite a la SECCIÓN 12 para el desglose. No estrena un número anual antes de derivarlo.
  - La cabecera escribe entera la habilitación: PLANPUERTA **no se puede medir** con el gate de la regla 3 porque nunca tuvo huésped — `COVERAGE_GAPS_ASSIGNMENTS.md` no le asignó la inmigración a nadie. No es que falle el gate: no lo alcanza. Mismo argumento que `ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md:31`.

- [ ] **Paso 6: Correr la guardia y verificar que arranca en rojo con la lista completa.**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-planpuerta.ts`
Expected: exit 1, ~50 errores — 24 secciones faltantes + las cifras sin aparecer. **Si arranca en verde, la guardia está mal escrita.**

- [ ] **Paso 7: Verificar el rango de la cabecera.**

Run: `cd "Iniciativas Estratégicas" && wc -w PLANPUERTA_Argentina_ES.md`
Expected: 700-820

- [ ] **Paso 8: Commit.**

```bash
git add SocialJusticeHub/scripts/verificar-planpuerta.ts "Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md"
git commit -m "Add la guardia de PLANPUERTA y el esqueleto — arranca en rojo con 50 problemas, como corresponde"
```

---

### Task 2 — PREÁMBULO y TESIS CENTRAL

**Files:**
- Modify: `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md`

- [ ] **La cara del preámbulo: un médico venezolano que maneja para una app en Rosario.** Nombre propio, edad, especialidad concreta, año de llegada. Llegó con título, con residencia hecha, con años de guardia encima — y hace cuatro años que no ejerce porque la revalidación no termina nunca. **Es la elección deliberada del documento: PLANPUERTA no empieza por los que faltan sino por los que ya están y estamos desperdiciando.** El país no tiene un problema de captación antes que un problema de aprovechamiento.
- [ ] Tres hilos de anillo, que vuelven en el CIERRE: **el expediente de revalidación** que suma años sin resolverse (el hilo de D11); **la puerta de un vecino que se abrió** el primer mes y que es la razón por la que se quedó pese a todo (el hilo del Compadrazgo de Llegada, D6); y **el hijo que nació acá y es argentino** (el hilo del límite II.5, la condicionalidad que no se hereda).
- [ ] Las dos cifras de la SECCIÓN 1 se anuncian en el preámbulo sin desarrollarse: **29,9% en 1914, 4,2% en 2022**, con domicilio `censo.gob.ar` la primera vez.
- [ ] **TESIS CENTRAL:** la Argentina no cerró la puerta con una ley — dejó de ser un lugar al que valía la pena venir; el problema es la oferta y no la frontera. Se mide por permanencia a diez años, la única métrica que no se puede falsear con marketing. Y sale a buscar: como un director técnico arma un plantel, con la lista escrita por los otros veintiséis PLANes y con un techo moral que ningún país se puso todavía.
- [ ] **Nombrar la piel en la tesis y rechazar la metáfora inmunológica por su nombre**, una sola vez y para siempre: un país sin piel no se defiende, no siente.
- [ ] Verificar rangos (PREÁMBULO 1.400-1.750; TESIS 500-650) y guardia. Commit.

---

### Task 3 — SECCIÓN 0, SECCIÓN 1 y SECCIÓN 2

**Files:**
- Modify: `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md`

- [ ] **SECCIÓN 0 — las siete fallas**, con la forma de `PLANPACTO` SECCIÓN 0 (que mide 1.954 palabras y es el modelo que el corpus manda imitar). Las siete: (1) no hay política de atracción, sólo de trámite; (2) el que llega con título no puede ejercer; (3) el Estado gastó plata en reclutar mano de obra barata en vez de formar (`PLANVIV:1566`); (4) la diáspora no tiene camino de vuelta (`PLANREP:2182`); (5) nadie mide si el que llegó se quedó; (6) la única política migratoria con nombre propio de la historia argentina fue una ley de expulsión sin juicio (Ley 4.144); (7) el corpus ¡BASTA! mismo llegó a veintiséis PLANes sin escribir uno.
- [ ] **SECCIÓN 1 — la crisis.** 29,9% (1914) → 4,2% (2022), con el 65,9% de limítrofes. El argumento: en el mismo siglo en que el país dejó de recibir gente dejó de crecer, y la flecha causal se discute pero la correlación no. **No sobreafirmar la causalidad** — se declara como correlación y se nombra la discusión.
- [ ] **SECCIÓN 2 — precedentes**, los cinco con su lección: Start-Up Chile (retención, no captación), Canadá (el freno llega tarde), Italia (*impatriati*, el instrumento fiscal sí mueve), Portugal (NHR → IFICI, toda golden visa deriva a rentista), OMS (la lista de salvaguardia que nadie respeta). **Cada uno con la cifra y el domicilio en la misma oración.**
- [ ] Declarar en el propio texto que la verificación externa de los cinco precedentes queda **pendiente de gate**, como hizo PLANFOCO.
- [ ] Verificar rangos y guardia. Commit.

---

### Task 4 — SECCIÓN 3 (arquitectura) y SECCIÓN 4 (Tramo 1)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md`

- [ ] **SECCIÓN 3** presenta los cinco tramos y los once dispositivos en tabla, y argumenta la elección de columna vertebral: **por qué el ciclo de vida del que llega y no la categoría de visa.** Todos los sistemas migratorios del mundo se organizan por categoría; ninguno por ciclo. Una estructura por categorías de persona fabrica castas — es el Ataque 1 convertido en índice.
- [ ] **SECCIÓN 4 — Tramo 1.** D1 Lista de Faltantes (la escriben los otros veintiséis PLANes; regla de hierro: nada entra sin PLAN que la pida, presupuesto asignado y veto de subsidiariedad levantado). D2 Cuerpo de Scouts (la diáspora primero; **funciona sin Estado desde el día uno**; el DT no publica un aviso, sale a ver jugar). D3 Ventana de Pases con sus dos frenos — Techo de Origen y freno de infraestructura **por fórmula publicada, nunca por discrecionalidad de un funcionario**.
- [ ] La Regla de Subsidiariedad se enuncia acá con su cita: `PLANREP:87` da ~3,5 millones de empleados públicos en reconversión, y sin esta regla el PLAN es indefendible frente a *«traen extranjeros y a mí me echan»*.
- [ ] Verificar rangos y guardia. Commit.

---

### Task 5 — SECCIÓN 5 (Tramo 2) y SECCIÓN 6 (Tramo 3)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md`

- [ ] **SECCIÓN 5 — Tramo 2.** D4 Las Tres Puertas (de Derecho — MERCOSUR, `Ley 25.903`, no se toca y se explica por qué con `PLANGEO:425`; de Invitación; del Regreso). D5 El Contrato de Puerta — **el dispositivo que convierte «salir si se desconsideran los ideales» en mecanismo legítimo**: se revoca contra lo que la persona firmó, nunca contra un ideal interpretado por un funcionario. D6 **El Compadrazgo de Llegada** — NO «Padrinazgo»: `PLANMESA:88` usa esa palabra una sola vez y en sentido peyorativo, y `PLANARCO:574` ya resolvió el problema usando el **Compadrazgo** tipificado en `PLANCUIDADO:307`. Se reusa esa figura, no se inventa una nueva. Sin Estado.
- [ ] **SECCIÓN 6 — Tramo 3.** D7 El Paquete en tres piezas con su condición de conservación cada una: tierra con obligación de uso (lotes de PLAN24CN, `PRESUPUESTO_CONSOLIDADO_BASTA.md:33`; *no comprás la entrada, la pagás con trabajo*), exención temporal (modelo italiano con su cifra), silla en la Mesa antes de la ciudadanía. D8 La Regla del Problema Pago, derivada del hallazgo de Chile. **D11 La Revalidación por Desempeño** — la restricción que ata todo el PLAN; no se le saca al colegio la facultad de habilitar, se le cambia la evidencia con la que habilita.
- [ ] D11 vuelve explícitamente sobre el médico del preámbulo. El hilo se cierra acá, no en el CIERRE.
- [ ] Verificar rangos y guardia. Commit.

---

### Task 6 — SECCIÓN 7 (Tramo 4) y SECCIÓN 8 (Tramo 5)

**Files:**
- Modify: `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md`

- [ ] **SECCIÓN 7 — Tramo 4.** D9 El Tablero de Arraigo se presenta acá como dispositivo (el detalle de indicadores va a la SECCIÓN 16). El número que ningún país publica. Y la consolidación del título de la tierra a plena propiedad al cumplirse la obligación de uso.
- [ ] **SECCIÓN 8 — Tramo 5.** D10 Ciudadanía por aporte verificado, atada al Libro de Cuidado y la Credencial de Materia. Prohibición explícita de venta de residencia, con el caso portugués como prueba.
- [ ] Verificar rangos y guardia. Commit.

---

### Task 7 — SECCIÓN 9 (El Marco) y SECCIÓN 10 (lo prohibido)

> **Es la tarea más importante del tramo.** Si el documento falla, falla acá.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md`

- [ ] **La Ley 4.144 se cuenta entera y con fecha:** 22 de noviembre de 1902, iniciativa de Miguel Cané, expulsión de cualquier extranjero sin juicio previo, tres días para irse, detención hasta el embarque, **56 años de vigencia**, derogada en 1958. Y se dice lo incómodo: **nadie la escribió pensando en perseguir** — la escribieron pensando exactamente lo que este PLAN quiere decir. La distancia entre esa frase y 56 años de deportaciones sin juez es de una sola palabra mal definida.
- [ ] **La regla única, destacada:** se puede condicionar la permanencia a lo que alguien hace; nunca a lo que piensa, cree, dice o vota.
- [ ] **Los tres conjuntos completos y taxativos** — I (cuatro exigencias al que entra), II (seis prohibiciones que el Estado se pone a sí mismo, con la irretroactividad absoluta y la no herencia de la condicionalidad), III (cuatro que el PLAN se pone a sí mismo, con el Techo de Origen sobre la lista de la OMS y la cláusula anti-casta).
- [ ] **El Techo de Origen se argumenta, no se enuncia:** importar médicos de Bolivia y Paraguay es hacerle a Bolivia lo que Europa y Estados Unidos nos hicieron. Un proyecto anti-extractivo que se financia extrayendo capital humano de países más pobres es incoherente en su propia lógica. **PLANPUERTA sería el primero del mundo en ponerse ese techo por ley y publicarlo.**
- [ ] **SECCIÓN 10:** la puerta revoca el Paquete, no expulsa. `PLANPUERTA no crea ni un gramo de poder de expulsión nuevo` va escrito con esas palabras. Y el argumento de por qué la defensa «pero le pusimos un juez» no alcanza: los gobiernos futuros le sacan el juez; la única defensa robusta es no crear la facultad.
- [ ] Verificar rangos (SECCIÓN 9: 2.000-2.400 — es la más densa y no se recorta) y guardia. Commit.

---

### Task 8 — SECCIÓN 11 (ANAR) e INTEGRACIÓN

**Files:**
- Modify: `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md`

- [ ] **SECCIÓN 11 — ANAR.** Se llama por la función objetivo, no por el trámite. **No absorbe la Dirección Nacional de Migraciones: el que ficha no es el que controla.** Poderes taxativos, los cuatro enumerados, sin una sola facultad de expulsión, control ni sanción sobre personas. La separación es un límite estructural: es lo que impide que un gobierno futuro convierta ANAR en la 4.144 con otro nombre.
- [ ] **INTEGRACIÓN:** las dos tablas de la spec §8.3 y §8.4, más el acoplamiento estrella con PLAN24CN (población para veinticuatro ciudades ↔ tierra a costo marginal cero) y **lo que el PLAN explícitamente NO hace**: bajar impuestos es PLANPACTO, y el llamado a la recepción social queda como hueco declarado hacia PLANFOCO o PLANCUL.
- [ ] Verificar rangos y guardia. Commit.

---

### Task 9 — SECCIÓN 12: modelo económico

**Files:**
- Modify: `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md`

- [ ] La tabla de componentes con las tres distinciones que hacen al PLAN barato: **la tierra es asignación dentro de PLAN24CN y no gasto nuevo**; **la exención es renuncia fiscal y no gasto**, contabilizada en PLANPACTO como gasto tributario bajo su techo; **la llegada es civil y cuesta cero**.
- [ ] Total USD 450-900M a quince años, clase S, **sin piso constitucional** — dicho en forma negada para no disparar el prohibido.
- [ ] El contraste de escala con su domicilio: `PRESUPUESTO_CONSOLIDADO_BASTA.md:37` da PLANVIV en 80.000-120.000M y `:33` da PLAN24CN en 26.350-73.000M. Y el argumento: **un PLAN de inmigración que necesita decenas de miles de millones ya se equivocó de diseño — si hay que pagarle a la gente para que venga, no viene por el país y se va apenas alguien pague más.**
- [ ] La tabla con-Estado / sin-Estado por tramo, con el hallazgo: los tramos 1 y 2, que deciden si el fichaje llega y sobrevive el primer año, son casi enteramente sin Estado.
- [ ] Verificar rangos y guardia. Commit.

---

### Task 10 — SECCIONES 13-19 y CIERRE

**Files:**
- Modify: `Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md`

- [ ] **13 riesgos** — los diez de la spec §12, con «Dubái con asado» primero y nombrado así, y las tres defensas estructurales (camino a ciudadanía con fecha, estatus nunca atado a un empleador, Paquete alcanzable por quien ya está acá). **14 mapa de perdedores** — los cinco, con los colegios profesionales primero y nombrados por mecanismo, no por institución concreta. **15 hoja de ruta** — las cinco fases, con la Fase 0 sin permiso y la regla de secuencia destacada: *el Marco se sanciona antes que cualquier incentivo, sin excepción*. **16 tablero** — los nueve indicadores, con permanencia como rector y la alarma máxima del sistema (una sola revocación por causal fuera de la lista taxativa). **17 federal**. **18 visión 2040**, donde va el piso constitucional que este PLAN no pide hoy. **19 protocolo de falla**. **CIERRE**, que vuelve al médico de Rosario y a los tres hilos.
- [ ] El tablero no puede ser publicidad con tipografía de datos: **publica también lo que salió mal, con la misma prominencia.**
- [ ] Verificar rangos y guardia. **La guardia tiene que pasar a verde en esta tarea.** Commit.

---

### Task 11 — La derogación en PLANVIV, y la guardia de remisiones

**Files:**
- Modify: `Iniciativas Estratégicas/PLANVIV_Argentina_ES.md:1566,1567,1569`

- [ ] **Paso 1: Línea de base.** Correr la guardia de remisiones **antes de tocar nada** y guardar la salida.

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-remisiones.ts > /tmp/remisiones-antes.txt; echo "exit=$?"`
Expected: exit 0, ~685 citas resueltas.

- [ ] **Paso 2: Buscar las citas textuales** de las tres líneas que se van a reescribir (**V-6** — la guardia detecta corrimientos, no reescrituras).

Run: `grep -rn "55.000-78.000\|160-250M\|5.000-10.000" "Iniciativas Estratégicas" SocialJusticeHub/shared SocialJusticeHub/scripts`
Expected: anotar cada hit. Los que citen los valores viejos se actualizan en esta misma tarea.

- [ ] **Paso 3: Derogar `:1566` in situ, en una sola línea**, con el formato de nota fechada que el tramo D dejó en `PLANCUL:387`:

```
| ~~**Trabajadores de la construcción regionales**~~ | **—** | **Derogada el 2026-08-02 por PLANPUERTA.** La línea preveía formalizar 5.000-10.000 trabajadores de Bolivia, Paraguay y Perú con visas vinculadas a proyectos. Se deroga bajo la Regla de Subsidiariedad: no se ficha afuera lo que se puede formar adentro dentro de la ventana del proyecto. **No es una restricción migratoria** — esos trabajadores entran por derecho propio por el Acuerdo de Residencia del MERCOSUR (Ley 25.903); lo que termina es el gasto público en reclutarlos. La demanda se cubre con formación: ver la brecha declarada abajo. | ~~USD 10-20M~~ **cero** |
```

- [ ] **Paso 4: Recalcular la fila TOTAL `:1567`** — una sola línea, misma posición:

```
| **TOTAL 2031 (tranche-2)** | **50.000-68.000** | *Corregido el 2026-08-02 tras la derogación de la fila anterior.* | **USD 150-230M adicional** |
```

La cuenta: 30.000-40.000 (`:1563`) + 5.000-8.000 (`:1564`) + 15.000-20.000 (`:1565`) = 50.000-68.000. Y 0 + 50-80M + 100-150M = USD 150-230M.

- [ ] **Paso 5: Corregir la prosa de `:1569`** — misma cantidad de líneas, y **la brecha se agranda y se declara**:

```
**¿Alcanza?** El rango inferior (50.000) queda 30.000 corto del objetivo de 80.000 — cinco mil más que antes de la derogación del 2026-08-02, y la diferencia se asume a cambio de no subsidiar la importación de mano de obra. Hay dos mitigaciones:
```

- [ ] **Paso 6: Verificar el conteo de líneas.** El archivo tiene que tener exactamente la misma cantidad de líneas que antes.

Run: `git diff --numstat "Iniciativas Estratégicas/PLANVIV_Argentina_ES.md"`
Expected: `3	3	Iniciativas Estratégicas/PLANVIV_Argentina_ES.md` — tres agregadas, tres borradas. **Si no son iguales, la tarea no está hecha.**

- [ ] **Paso 7: Correr la guardia de remisiones de nuevo y comparar.**

Run: `cd SocialJusticeHub && npx tsx scripts/verificar-remisiones.ts > /tmp/remisiones-despues.txt; diff /tmp/remisiones-antes.txt /tmp/remisiones-despues.txt`
Expected: sin diferencias. **Cero remisiones nuevas rotas, o la tarea no está hecha.**

- [ ] **Paso 8: Correr todas las guardias.**

Run: `cd SocialJusticeHub && for g in planpacto planarco planpregunta planfoco planpuerta; do echo "== $g"; npx tsx scripts/verificar-$g.ts || echo "ROJO"; done`
Expected: las cinco en verde.

- [ ] **Paso 9: Commit.**

```bash
git add "Iniciativas Estratégicas/PLANVIV_Argentina_ES.md"
git commit -m "Fix PLANVIV: se deroga la fila que importaba obreros en vez de formarlos, y la tabla se recalcula"
```

---

### Task 12 — El acta, el registro, y la migración del canon 26 → 27

**Files:**
- Create: `Iniciativas Estratégicas/ACTA_EXCEPCION_FREEZE_2026-08-02.md`
- Modify: `Iniciativas Estratégicas/PLAN_REGISTRY.yml:10,12` + entrada nueva
- Modify: `Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md` (fila nueva)
- Modify: `SocialJusticeHub/shared/strategic-initiatives.ts`
- Modify: `SocialJusticeHub/shared/arquitecto-data.ts:2` + nodo + aristas
- Modify: `SocialJusticeHub/client/src/components/arquitecto/PlanEditor.tsx:8`
- Create: `SocialJusticeHub/client/public/docs/PLANPUERTA_Argentina_ES.md`
- Create: `v2/content/planes/PLANPUERTA.mdx`
- Modify: `docs/DEUDAS.md`

- [ ] **Paso 1: El acta.** `ACTA_EXCEPCION_FREEZE_2026-08-02.md`, con la forma de `ACTA_LEVANTAMIENTO_FREEZE_2026-07-26.md`. El argumento entero: la regla 3 **no aplica** porque `COVERAGE_GAPS_ASSIGNMENTS.md` nunca le asignó la inmigración a ningún huésped. Incluir la evidencia reproducible:

```bash
grep -ric "migra\|inmigra\|extranjer\|refugiad" "Iniciativas Estratégicas/COVERAGE_GAPS_ASSIGNMENTS.md"
```
Expected: `0`

- [ ] **Paso 2: `PLAN_REGISTRY.yml`** — `thematic_count: 27`, `total_documents: 28`, `freeze_excepciones` suma `PLANPUERTA`, `freeze_excepciones_acta` pasa a listar las dos actas, `last_updated: 2026-08-02`, y entrada nueva:

```yaml
  - code: PLANPUERTA
    title: Arraigo, Búsqueda de Talento y Poblamiento
    version: 2026-08
    status: current
    phase: tranche-2
    mission_matrix: Ámbar
    budget_class: S
    public_visibility: ambos
    owner: TBD-PEO-asignar
    dependencies: [PLAN24CN, PLANREP, PLANEDU, PLANPACTO, PLANMESA, PLANEB, PLANRUTA]
    legal_instruments:
      - Marco de la Puerta (ley — se sanciona antes que cualquier incentivo)
      - Estatuto de la ANAR
    last_updated: 2026-08-02
```

- [ ] **Paso 3: `strategic-initiatives.ts`** — entrada 27 con `category: 'instituciones'`, `missionSlug: 'instituciones-y-futuro'`, `secondaryMissionSlug: 'territorio-legible'`, `documentFile: 'PLANPUERTA_Argentina_ES.md'`, `pullQuote: 'Nadie deja su casa por una exención impositiva.'`, y los tres KPI del Tablero (permanencia a diez años, Índice de Segunda Puerta, tiempo mediano de revalidación).
- [ ] **Paso 4: `arquitecto-data.ts`** — nodo `id: 'PLANPUERTA'`, `ordinal: 27`, `agency: 'ANAR'`, `organMetaphor` la piel, `budgetLow: 450`, `budgetHigh: 900`, `constitutionalFloor: null`. Aristas `requires` hacia PLANPACTO, PLAN24CN, PLANREP, PLANEDU, PLANMESA, PLANDIG; `provides` hacia PLAN24CN, PLANREP, PLANPREGUNTA, PLANGEO.
- [ ] **Paso 5: Los dos conteos que quedaron en veintidós (V-2).** `arquitecto-data.ts:2` («Extracted from 22 PLANes») y `PlanEditor.tsx:8` (`term: 'veintidós PLANes (al 23 de abril de 2026)'`) pasan a **veintisiete**, con la fecha de este tramo.
- [ ] **Paso 6: `docs/DEUDAS.md`** — id correlativo nuevo: el glosario normativo de `PlanEditor.tsx` quedó desactualizado en la migración a 26 y habría marcado el conteo correcto como violación; encontrado el 2026-08-02, resuelto en el mismo commit. **Se anota aunque se resuelva** — el registro de por qué las cosas son como son es el punto.
- [ ] **Paso 7: Copia servida y MDX.** `client/public/docs/PLANPUERTA_Argentina_ES.md` (copia idéntica) y `v2/content/planes/PLANPUERTA.mdx` con frontmatter `slug: planpuerta`, `code: PLANPUERTA`, `orderIndex: 27`, `isMeta: false`, `draft: false`, y el `summary` derivado de la tesis. Regenerar el índice si `planes-index.generated.ts` no se regenera solo.
- [ ] **Paso 8: `PRESUPUESTO_CONSOLIDADO_BASTA.md`** — fila nueva **anexada**, nunca insertada en el medio (GC-8).
- [ ] **Paso 9: Verificar.**

Run: `cd SocialJusticeHub && npm run check && npm run check:routes && npm run test:unit`
Expected: los tres en verde.

- [ ] **Paso 10: Commit.**

```bash
git add "Iniciativas Estratégicas/ACTA_EXCEPCION_FREEZE_2026-08-02.md" "Iniciativas Estratégicas/PLAN_REGISTRY.yml" "Iniciativas Estratégicas/PRESUPUESTO_CONSOLIDADO_BASTA.md" SocialJusticeHub/shared/strategic-initiatives.ts SocialJusticeHub/shared/arquitecto-data.ts SocialJusticeHub/client/src/components/arquitecto/PlanEditor.tsx SocialJusticeHub/client/public/docs/PLANPUERTA_Argentina_ES.md v2/content/planes/PLANPUERTA.mdx docs/DEUDAS.md
git commit -m "Add el canon 27: el acta, el registro, el nodo del grafo, y los dos conteos que seguían en veintidós"
```

---

### Task 13 — Attack paths, CI y cierre

**Files:**
- Modify: `Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md`
- Modify: `.github/workflows/socialjusticehub-ci.yml`
- Modify: `v2/docs/plans/2026-08-01-tramo-d-planfoco.md` (corregir el registro — **V-1**)
- Modify: `v2/docs/plans/2026-08-02-planpuerta.md` (este archivo — registro de cierre)

- [ ] **Paso 1: `READINESS_GATES_ADVERSARIAL.md`** — bloque `### PLANPUERTA` con la nota de habilitación y **tres attack paths**: (1) **el Paquete se convierte en casta** — un gobierno que ensancha la brecha entre invitado y residente MERCOSUR hasta volverla estructural, que es el riesgo terminal del diseño; (2) **la revocación se usa como castigo político** — el Contrato de Puerta redactado con compromisos tan vagos que revocarlo equivale a expulsar, que es la 4.144 entrando por la ventana del contrato en vez de por la de la ley; (3) **el freno de infraestructura se desactiva por decreto** en un año electoral, y llega el backlash canadiense con quince años de retraso y sin marcha atrás.

- [ ] **Paso 2: CI — la guardia nueva.** En `.github/workflows/socialjusticehub-ci.yml`, después del paso `Guardia de PLANFOCO`:

```yaml
      - name: Guardia de PLANPUERTA
        run: npx tsx scripts/verificar-planpuerta.ts
```

- [ ] **Paso 3: CI — el agujero de `paths` (V-3).** Agregar `- "v2/docs/specs/2026-08-02-planpuerta.md"` a **las dos** listas de `paths`, la de `push` y la de `pull_request`, con comentario explicando por qué (la guardia lo resuelve como `DOCUMENTOS_CITABLES` y no vive en `Iniciativas Estratégicas/`). **Verificar que los dos bloques quedaron modificados:**

Run: `grep -c "2026-08-02-planpuerta.md" .github/workflows/socialjusticehub-ci.yml`
Expected: `2`

- [ ] **Paso 4: Corregir el registro de cierre del tramo D (V-1).** En `v2/docs/plans/2026-08-01-tramo-d-planfoco.md:478`, nota fechada: la migración del canon **sí** se ejecutó después de escribirse ese registro, con la medición que lo prueba (178 cabeceras en 26, `strategic-initiatives.ts` con 26 entradas, `arquitecto-data.ts:353` con PLANFOCO ordinal 26). **Anexo o reescritura in situ, nunca inserción** (GC-8).

- [ ] **Paso 5: Verificación final.**

Run: `cd SocialJusticeHub && npm run check && npm run check:routes && npm run test:unit && for g in planpacto planarco planpregunta planfoco planpuerta remisiones; do npx tsx scripts/verificar-$g.ts || exit 1; done`
Expected: todo verde.

- [ ] **Paso 6: Medir.**

Run: `wc -w "Iniciativas Estratégicas/PLANPUERTA_Argentina_ES.md"`
Expected: 21.000-24.000. Anotar el total real.

- [ ] **Paso 7: Escribir el Registro de cierre** al final de este plan: mediciones finales, qué se corrigió de la spec y con qué medición, y las lecciones para el tramo siguiente. **Si alguna cifra de la spec resultó falsa al escribirla, se corrige acá con la medición escrita — nunca se rellena para alcanzar un número que nadie derivó de nada.**

- [ ] **Paso 8: Commit.**

```bash
git add "Iniciativas Estratégicas/READINESS_GATES_ADVERSARIAL.md" .github/workflows/socialjusticehub-ci.yml v2/docs/plans/2026-08-01-tramo-d-planfoco.md v2/docs/plans/2026-08-02-planpuerta.md
git commit -m "Add los attack paths de PLANPUERTA, la guardia en CI, y el registro del tramo D corregido"
```

---

## Lo que este plan NO hace, con nombre

- **El hueco más serio de la spec (§16.2): cómo accede al Paquete el ~1,9M de residentes MERCOSUR que ya está acá.** La cláusula anti-casta lo cubre en principio; el mecanismo concreto no existe y este tramo no lo inventa. Se escribe en el documento **como hueco declarado**, no se tapa con una frase.
- **La política de asilo y refugio.** `PLANJUS:2367` la toca en el acceso a la justicia. PLANPUERTA la declara y no la absorbe.
- **La meta poblacional numérica.** Se resuelve con el dato de la Fase 0, no antes.
- **La recepción social** — el llamado a la gentileza. Hueco declarado hacia PLANFOCO o PLANCUL.
- **La verificación externa de los cinco precedentes internacionales** de la SECCIÓN 2, declarada en el propio documento como pendiente de gate.
- **La generalización de la verificación de citas textuales** (lección 2 del tramo D). Sigue siendo trabajo pendiente de alcance general; este tramo la hace a mano en la Task 11 Paso 2.
