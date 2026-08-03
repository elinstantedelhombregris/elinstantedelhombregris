# PLANSUS — Marcos de Atracción: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar a `PLANSUS_Argentina_ES.md` el bloque MARCOS DE ATRACCIÓN (S28–S31) y las siete ediciones forzadas que la spec declara, con una guardia mecánica en CI que impida que el bloque se degrade.

**Architecture:** El documento se escribe **guardia primero**. La Task 1 crea `verificar-plansus.ts` sobre el documento tal como está hoy y lo deja en verde: esa es la red de seguridad. Cada tarea posterior agrega su expectativa a la guardia (rojo), escribe la prosa (verde), y commitea. Es el ciclo TDD del repositorio, y es como se construyeron PLANARCO, PLANPACTO, PLANPREGUNTA, PLANFOCO y PLANPUERTA.

**Tech Stack:** Markdown (el documento), TypeScript + `tsx` (la guardia), GitHub Actions (CI). Sin dependencias nuevas.

**Spec:** `v2/docs/specs/2026-08-03-plansus-marcos-de-atraccion.md` — leerla entera antes de la Task 1.

---

## Global Constraints

- **Idioma:** español rioplatense, voseo. «vos», «mirá», «pará». Es la voz del documento existente; leer el PREÁMBULO y S23 antes de escribir una línea.
- **`¡BASTA!` siempre con signos de exclamación**, nunca «BASTA» pelado.
- **Cero cifras inventadas.** Toda cifra nueva va con su fuente **en la misma oración** («cifra con domicilio»). Si no hay fuente, se escribe como rango declarado incierto o no se escribe. La guardia lo verifica.
- **Nada de universales negativos** —«ninguno», «nadie», «ningún país»— salvo que se puedan defender con fuente citada en la misma oración. Es la regla que la spec de PLANPUERTA §16.bis dejó escrita después de que la misma forma se cayera tres veces.
- **El fisco se llama ARCA**, no AFIP. La AFIP fue disuelta en octubre de 2024. PLANSUS hoy no nombra a ninguno de los dos; el bloque nuevo lo va a nombrar por primera vez y tiene que nombrarlo bien.
- **Toda edición por script va con `assert` de presencia y unicidad.** Un `str.replace()` silencioso que no matcheó sale en verde. Una lista opt-in incompleta sale en verde. Las dos cosas ya pasaron en este repositorio.
- **Ruta de commit explícita** en cada `git add`. Hay sesiones concurrentes sobre este repositorio (deuda D-010); un `git add -A` se lleva trabajo ajeno.
- **Defecto preexistente conocido:** el documento **no tiene SECCIÓN 19** — salta de S18 a S20. No lo rompiste vos. Se registra como deuda en la Task 11 y **no se renumera**, porque renumerar corre todas las líneas del documento.

---

## Mapa de archivos

| Archivo | Responsabilidad | Tareas |
|---|---|---|
| `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` | El documento. Única fuente de verdad del contenido | 2–9 |
| `SocialJusticeHub/scripts/verificar-plansus.ts` | Guardia mecánica: secciones, epígrafes, subsecciones correlativas, cifras con domicilio, prohibidos, piso | 1–9 |
| `.github/workflows/socialjusticehub-ci.yml` | Enganche de la guardia en CI | 1 |
| `SocialJusticeHub/client/public/docs/PLANSUS_Argentina_ES.md` | Copia servida al front | 10 |
| `SocialJusticeHub/shared/arquitecto-data.ts` | Aristas `requires`/`provides` del grafo | 10 |
| `Iniciativas Estratégicas/DEPENDENCY_GRAPH.yml` | Grafo canónico de dependencias | 10 |
| `docs/DEUDAS.md` | Registro de deficiencias | 11 |

**Por qué no hay riesgo de corrimiento de líneas:** se verificó que el corpus tiene **cero** remisiones con formato `PLANSUS:línea` (`grep -rn "PLANSUS:[0-9]"` sobre `*.md`, `*.ts`, `*.yml`, excluyendo `node_modules` → 0 resultados). Insertar secciones en PLANSUS no puede romper el modo de falla que en el tramo D rompió ocho remisiones de PLANARCO. Igual se corre `verificar-remisiones.ts` en la Task 11, porque la ausencia se verifica, no se asume.

---

## Task 1: La guardia, en verde sobre el documento actual

Antes de tocar una coma. Si la guardia no puede describir el documento que ya existe, no sirve para custodiar el que viene.

**Files:**
- Create: `SocialJusticeHub/scripts/verificar-plansus.ts`
- Modify: `.github/workflows/socialjusticehub-ci.yml`

**Interfaces:**
- Produces: `SECCIONES_ESPERADAS: string[]`, `CIFRAS_CANONICAS: {cifra, domicilio}[]`, `PROHIBIDOS: {patron, excepcion?}[]` — exportados. Las tareas 2 a 9 los consumen agregando entradas.

- [ ] **Step 1: Escribir la guardia con las 30 cabeceras H2 actuales**

Crear `SocialJusticeHub/scripts/verificar-plansus.ts`:

```typescript
/**
 * Guardia del documento de PLANSUS.
 *
 * Run: npx tsx scripts/verificar-plansus.ts
 *
 * Verifica lo MECÁNICO y nada más: que estén las secciones esperadas y en
 * orden, que las subsecciones del bloque nuevo sean correlativas, que las
 * cifras canónicas aparezcan CON SU DOMICILIO en la misma oración, que los
 * prohibidos no aparezcan, y que el piso declarado coincida con el canon.
 *
 * La voz y el argumento NO se verifican acá. Una guardia que pretende juzgar
 * prosa da falsa tranquilidad.
 *
 * ── DOCTRINA HEREDADA ───────────────────────────────────────────────────────
 *   1. default seguro + opt-out explícito, verificado EN LAS DOS DIRECCIONES;
 *   2. descubrimiento automático — un chequeo que no encuentra ninguna
 *      ocurrencia válida de una entrada sin opt-out es un ERROR, no un pase;
 *   3. si el ancla no es única, el chequeo NO corre y lo dice;
 *   4. patrón y excepción miden la misma unidad (la ORACIÓN, no la línea).
 *
 * ── LO PROPIO DE ESTE PLAN ──────────────────────────────────────────────────
 * La afirmación que sostiene la arquitectura del bloque S28-S31 es un universal
 * negativo defendible: «ningún análisis forense determinó una muerte por
 * intoxicación aguda de ayahuasca». Es verdadera y está sostenida por ICEERS,
 * y por eso NO se prohíbe: se exige que aparezca con su domicilio y con su
 * denominador en la misma oración. Un prohibido que castiga la afirmación
 * sostenida y deja pasar la suelta está al revés.
 *
 * ── DEFECTO PREEXISTENTE ────────────────────────────────────────────────────
 * El documento no tiene SECCIÓN 19: salta de S18 a S20. Es anterior a este
 * trabajo, está registrado en docs/DEUDAS.md, y por eso la correlatividad de
 * H2 NO se verifica sobre las secciones viejas — solo sobre el bloque nuevo.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '../..');
const DOC = resolve(REPO_ROOT, 'Iniciativas Estratégicas/PLANSUS_Argentina_ES.md');
/** Única fuente canónica de los pisos declarados. PLANSUS declara 0,10% del PBI. */
const CANON_PISOS = resolve(SCRIPT_DIR, '../tests/unit/pisos-constitucionales.test.ts');

/** Los H2 que el documento tiene que tener, en este orden. */
export const SECCIONES_ESPERADAS: string[] = [
  '## PREÁMBULO — EL DERECHO A LA SOBERANÍA SOBRE TU PROPIA CONCIENCIA',
  '## SECCIÓN 1: LA CRISIS — LA PROHIBICIÓN QUE ENRIQUECE AL NARCO Y ENCARCELA AL POBRE',
  '## SECCIÓN 2: LECCIONES DEL MUNDO — QUIÉN LO HIZO Y QUÉ APRENDIMOS',
  '## SECCIÓN 3: EL INGREDIENTE — POR QUÉ UN ARGENTINO ELEGIRÍA PLANSUS',
  '## SECCIÓN 4: CAMBIO DE PARADIGMA — DE LA PROHIBICIÓN A LA SOBERANÍA',
  '## SECCIÓN 5: LAS CUATRO VÍAS — ARQUITECTURA DE LICENCIAMIENTO',
  '## SECCIÓN 6: EL PUENTE — TRANSICIÓN DEL MERCADO NEGRO AL MERCADO BLANCO',
  '## SECCIÓN 7: LA LIBERACIÓN — PRESOS DE LA PROHIBICIÓN',
  '## SECCIÓN 8: ESTRATEGIA INTERNACIONAL — LA DOCTRINA DE LA SOBERANÍA BIOQUÍMICA',
  '## SECCIÓN 9: LA ECONOMÍA BLANCA — DIVERSIFICACIÓN DE LA MATRIZ PRODUCTIVA',
  '## SECCIÓN 10: ARQUITECTURA INSTITUCIONAL — ANSUS',
  '## SECCIÓN 11: PROTECCIÓN DE MENORES — LA LÍNEA QUE NO SE CRUZA',
  '## SECCIÓN 12: MARCO LEGAL — LO QUE SE DERRUMBA Y LO QUE SE CONSTRUYE',
  '## SECCIÓN 13: MARCO PRESUPUESTARIO Y ROI — CADA PESO INVERTIDO VUELVE MULTIPLICADO',
  '## SECCIÓN 14: DIMENSIÓN FEDERAL — 24 PROVINCIAS, UNA SOBERANÍA',
  '## SECCIÓN 15: ANÁLISIS DE RIESGO — LO QUE PUEDE SALIR MAL Y CÓMO LO ENFRENTAMOS',
  '## SECCIÓN 16: RESPUESTA A CRÍTICAS — LAS PREGUNTAS QUE VAN A HACER',
  '## SECCIÓN 17: ESTRATEGIA DE COMUNICACIÓN — CÓMO SE CUENTA ESTA HISTORIA',
  '## SECCIÓN 18: HOJA DE RUTA — CASCADA CONTROLADA (5 AÑOS)',
  // No hay SECCIÓN 19. Defecto preexistente, docs/DEUDAS.md. No se renumera.
  '## SECCIÓN 20: VISIÓN 2040 — LA ARGENTINA DONDE LA CONCIENCIA ES LIBRE',
  '## MARCOS OPERATIVOS — INFRAESTRUCTURA PARA LA IMPLEMENTACIÓN',
  '## SECCIÓN 21: INFRAESTRUCTURA FINANCIERA — BANCA, PAGOS Y SEGUROS',
  '## SECCIÓN 22: SEGURIDAD EN LA TRANSICIÓN — PROTOCOLO OPERATIVO',
  '## SECCIÓN 23: CONDUCCIÓN BAJO INFLUENCIA — MARCO LEGAL Y PROTOCOLO',
  '## SECCIÓN 24: PUENTE SANITARIO — LA SALUD NO ESPERA A PLANSALUD',
  '## SECCIÓN 25: ECONOMÍA LEGAL — PRECIOS, EMPLEO Y CAPACITACIÓN',
  '## SECCIÓN 26: TERRITORIO Y AMBIENTE — DÓNDE SE CULTIVA, DÓNDE SE VENDE, CÓMO SE CUIDA',
  '## SECCIÓN 27: PROPIEDAD INTELECTUAL Y PROTECCIÓN DEL CONOCIMIENTO',
  '## INTEGRACIÓN CON EL MARCO ¡BASTA!',
  '## Parche post-auditoría 2026-04-26',
];

/**
 * Cifras que no pueden aparecer huérfanas. `domicilio` es la fuente que tiene
 * que estar en la MISMA ORACIÓN. Se llenan en las tareas 3 a 9.
 */
export const CIFRAS_CANONICAS: { cifra: string; domicilio: string[]; desc: string }[] = [];

/**
 * Strings prohibidos. `excepcion` habilita la forma legítima: si el patrón
 * aparece en una oración que TAMBIÉN contiene la excepción, no cuenta.
 */
export const PROHIBIDOS: { patron: string; excepcion?: string; porque: string }[] = [];

/** Corta el cuerpo en oraciones. Unidad de medida de cifras y prohibidos. */
function oraciones(raw: string): string[] {
  return raw
    .split('\n')
    .flatMap((l) => l.split(/(?<=[.:;!?])\s+/))
    .map((s) => s.trim())
    .filter(Boolean);
}

function verificarSecciones(lineas: string[]): string[] {
  const errores: string[] = [];
  const h2 = lineas.filter((l) => l.startsWith('## '));
  for (const esperada of SECCIONES_ESPERADAS) {
    const n = h2.filter((l) => l.trim() === esperada).length;
    if (n === 0) errores.push(`falta la sección: ${esperada}`);
    if (n > 1) errores.push(`sección duplicada (${String(n)}x): ${esperada}`);
  }
  // Orden: los índices de las esperadas dentro del documento tienen que subir.
  const indices = SECCIONES_ESPERADAS.map((s) => h2.findIndex((l) => l.trim() === s));
  for (let i = 1; i < indices.length; i++) {
    const prev = indices[i - 1];
    const cur = indices[i];
    if (prev === undefined || cur === undefined) continue;
    if (prev !== -1 && cur !== -1 && cur < prev) {
      errores.push(`fuera de orden: «${String(SECCIONES_ESPERADAS[i])}» aparece antes que la anterior`);
    }
  }
  return errores;
}

function verificarCifras(raw: string): string[] {
  const errores: string[] = [];
  const oras = oraciones(raw);
  for (const { cifra, domicilio, desc } of CIFRAS_CANONICAS) {
    const conCifra = oras.filter((o) => o.includes(cifra));
    // Doctrina 2: cero ocurrencias es ERROR, no pase.
    if (conCifra.length === 0) {
      errores.push(`la cifra canónica «${cifra}» (${desc}) no aparece en ninguna parte`);
      continue;
    }
    for (const o of conCifra) {
      if (!domicilio.some((d) => o.includes(d))) {
        errores.push(`cifra «${cifra}» sin domicilio (${domicilio.join(' | ')}) en: «${o.slice(0, 110)}…»`);
      }
    }
  }
  return errores;
}

function verificarProhibidos(raw: string): string[] {
  const errores: string[] = [];
  const oras = oraciones(raw);
  for (const { patron, excepcion, porque } of PROHIBIDOS) {
    for (const o of oras) {
      if (!o.includes(patron)) continue;
      if (excepcion !== undefined && o.includes(excepcion)) continue;
      errores.push(`prohibido «${patron}» (${porque}) en: «${o.slice(0, 110)}…»`);
    }
  }
  return errores;
}

/**
 * El piso de PLANSUS es 0,10% del PBI y su única fuente canónica es el test de
 * pisos. Se verifica en forma AFIRMATIVA: si el canon deja de declararlo, o lo
 * declara distinto, la guardia falla — porque S30 del documento razona sobre
 * ese número contra la Escalera de PLANPACTO.
 */
function verificarPiso(): string[] {
  let canon: string;
  try {
    canon = readFileSync(CANON_PISOS, 'utf8');
  } catch {
    return [`no se pudo leer el canon de pisos: ${CANON_PISOS}`];
  }
  const m = /PLANSUS:\s*\{\s*floor:\s*'([^']+)'/.exec(canon);
  if (m === null) return ['PLANSUS no figura en el canon de pisos y el documento razona sobre su piso'];
  if (m[1] !== '0.10% PBI') {
    return [`el canon declara el piso de PLANSUS en «${String(m[1])}» y el documento asume «0.10% PBI»`];
  }
  return [];
}

function main(): void {
  let raw: string;
  try {
    raw = readFileSync(DOC, 'utf8');
  } catch {
    console.error(`No existe el documento: ${DOC}`);
    process.exit(1);
  }

  const lineas = raw.split('\n');
  const errores: string[] = [
    ...verificarSecciones(lineas),
    ...verificarCifras(raw),
    ...verificarProhibidos(raw),
    ...verificarPiso(),
  ];

  if (errores.length > 0) {
    console.error(`La guardia de PLANSUS encontró ${String(errores.length)} problema(s):\n`);
    for (const e of errores) console.error(`  · ${e}`);
    process.exit(1);
  }

  const palabras = raw.split(/\s+/).filter(Boolean).length;
  console.log(
    `PLANSUS OK: ${String(SECCIONES_ESPERADAS.length)} secciones, ` +
      `${String(CIFRAS_CANONICAS.length)} cifras con domicilio, ` +
      `${String(PROHIBIDOS.length)} prohibidos, ${String(lineas.length)} líneas, ` +
      `${String(palabras)} palabras. Piso 0,10% PBI verificado contra el canon.`,
  );
}

/** Se corre sola cuando la invocan directo, y NO cuando alguien la importa. */
if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
```

- [ ] **Step 2: Correr la guardia — tiene que dar VERDE**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

Esperado: `PLANSUS OK: 30 secciones, 0 cifras con domicilio, 0 prohibidos, 2134 líneas, … Piso 0,10% PBI verificado contra el canon.`

Si sale rojo por una cabecera, **corregí la lista, no el documento**: la Task 1 describe lo que hay, no lo cambia.

- [ ] **Step 3: Probar que la guardia sabe fallar**

Renombrá temporalmente una cabecera del documento (por ejemplo `## SECCIÓN 27:` → `## SECCIÓN 27X:`), corré la guardia, confirmá que sale `falta la sección: ## SECCIÓN 27: …`, y **revertí con `git checkout`**. Una guardia que nunca se vio fallar no es una guardia.

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts; git checkout -- "../Iniciativas Estratégicas/PLANSUS_Argentina_ES.md"
```

- [ ] **Step 4: Engancharla en CI**

En `.github/workflows/socialjusticehub-ci.yml`, al lado de las otras guardias (cerca de la línea 68, después de `verificar-planfoco.ts`), agregar:

```yaml
      - name: Guardia PLANSUS
        run: npx tsx scripts/verificar-plansus.ts
```

Y agregar a los `paths:` del disparador del workflow, si no están ya cubiertos:

```yaml
      - 'Iniciativas Estratégicas/PLANSUS_Argentina_ES.md'
      - 'v2/docs/specs/2026-08-03-plansus-marcos-de-atraccion.md'
```

- [ ] **Step 5: Commit**

```bash
git add SocialJusticeHub/scripts/verificar-plansus.ts .github/workflows/socialjusticehub-ci.yml
git commit -m "Add la guardia de PLANSUS — verde sobre el documento actual

Red de seguridad antes de tocar el documento: 30 cabeceras H2, cifras con
domicilio, prohibidos y el piso de 0,10% verificado contra el canon.

La correlatividad de H2 no se verifica sobre las secciones viejas porque el
documento no tiene SECCION 19 — defecto preexistente que se registra aparte
y que no se renumera, porque renumerar corre todas las lineas."
```

---

## Task 2: El candado ceremonial y el sub-carril de no residentes (E2, E3)

Las dos ediciones más chicas y las que más sostienen. Van juntas porque tocan secciones contiguas y se revisan de una.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` (S5.1 ~línea 489, S5.2 tabla ~líneas 495-504)
- Modify: `SocialJusticeHub/scripts/verificar-plansus.ts`

**Interfaces:**
- Consumes: `PROHIBIDOS` de la Task 1.
- Produces: las anclas de texto `atestación no es transferible` y `Sub-carril de no residentes`, que la Task 4 (S29) cita.

- [ ] **Step 1: Agregar la expectativa a la guardia (va a fallar)**

En `verificar-plansus.ts`, agregar una función nueva y sumarla a `main()`:

```typescript
/**
 * Los dos candados de la Task 2. Se verifican en forma AFIRMATIVA porque son
 * cláusulas cuya AUSENCIA es el defecto — un prohibido no serviría.
 */
const CANDADOS: { ancla: string; desc: string }[] = [
  { ancla: 'atestación comunitaria no es transferible', desc: 'E2: cierra el paraguas de la exención ceremonial (spec §4.4)' },
  { ancla: 'Sub-carril de no residentes', desc: 'E3: el extranjero entra por la Vía Terapéutica (spec §5, S29)' },
];

function verificarCandados(raw: string): string[] {
  return CANDADOS.filter(({ ancla }) => !raw.includes(ancla)).map(
    ({ ancla, desc }) => `falta el candado «${ancla}» — ${desc}`,
  );
}
```

Y en `main()`, dentro del array `errores`, agregar `...verificarCandados(raw),`.

- [ ] **Step 2: Correr la guardia — tiene que fallar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

Esperado: FALLA con `falta el candado «atestación comunitaria no es transferible»` y `falta el candado «Sub-carril de no residentes»`.

- [ ] **Step 3: Escribir E2 — el candado ceremonial**

En S5.1, **después** del párrafo que termina en «Las reconoce. Y retira al Estado de un espacio donde nunca debió meterse.» (~línea 489), agregar un párrafo nuevo:

Contenido obligatorio, en la voz del documento:
- La **atestación comunitaria no es transferible** y no se alquila.
- Un operador comercial no indígena que no pueda producirla **se licencia por la Vía Terapéutica**: médico, espacio habilitado, impuesto.
- El porqué, dicho sin eufemismo: la exención ceremonial existe para reconocer una práctica ancestral, no para darle cobertura fiscal a la industria del retiro. Es exactamente por ahí que se deformó el turismo de ayahuasca en Perú.
- El límite del Estado, explícito: esto **no** le dice a ninguna comunidad a quién puede recibir. Regula quién puede invocar la atestación de otro.

- [ ] **Step 4: Escribir E3 — el sub-carril de no residentes**

En la tabla de S5.2 (Vía Terapéutica), agregar una fila al final:

```markdown
| **Sub-carril de no residentes** | El visitante extranjero entra por acá y solo por acá, con admisión clínica única previa al viaje (Sección 29). La exención ceremonial no le alcanza: tributa cualquiera sea la habitación a la que vaya |
```

- [ ] **Step 5: Correr la guardia — tiene que pasar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

Esperado: `PLANSUS OK: 30 secciones, …`

- [ ] **Step 6: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSUS_Argentina_ES.md" SocialJusticeHub/scripts/verificar-plansus.ts
git commit -m "Fix los dos huecos de la Seccion 5 — el candado ceremonial y el extranjero

La atestacion comunitaria no es transferible ni se alquila: es el candado que
impide que la industria del retiro comercial use la exencion de la Via
Ceremonial de paraguas, que es como se deformo el turismo en Peru. Y no le
dice a ninguna comunidad a quien recibir — regula quien invoca la atestacion
ajena.

La Via Terapeutica estaba escrita entera para pacientes argentinos con PMO.
Ahora tiene el sub-carril por donde entra el que viene de afuera."
```

---

## Task 3: SECCIÓN 28 — El Registro

La sección de tesis. Va primera del bloque porque reencuadra lo que sigue, igual que S4 fija el paradigma antes de que S5 despliegue la maquinaria.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` (insertar después de `## SECCIÓN 27: …`, antes de `## INTEGRACIÓN CON EL MARCO ¡BASTA!`)
- Modify: `SocialJusticeHub/scripts/verificar-plansus.ts`

**Interfaces:**
- Consumes: `SECCIONES_ESPERADAS`, `CIFRAS_CANONICAS` de la Task 1.
- Produces: el ancla `Registro Nacional de Resultados Terapéuticos`, que las tareas 4, 5 y 9 citan.

- [ ] **Step 1: Agregar las expectativas a la guardia (va a fallar)**

En `SECCIONES_ESPERADAS`, insertar **antes** de `'## INTEGRACIÓN CON EL MARCO ¡BASTA!'`:

```typescript
  '## MARCOS DE ATRACCIÓN — CÓMO EL MUNDO LLEGA A LA ARGENTINA',
  '## SECCIÓN 28: EL REGISTRO — LA EVIDENCIA COMO ACTIVO NACIONAL',
```

Y agregar a `CIFRAS_CANONICAS`:

```typescript
  { cifra: '2023', domicilio: ['Australia', 'Oregon'], desc: 'el reloj competitivo: Australia y Oregon abrieron en 2023' },
```

- [ ] **Step 2: Correr la guardia — tiene que fallar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

Esperado: FALLA con `falta la sección: ## MARCOS DE ATRACCIÓN — …` y `falta la sección: ## SECCIÓN 28: …`.

- [ ] **Step 3: Escribir la cabecera del bloque y la S28**

Insertar después del final de S27 y antes de `## INTEGRACIÓN CON EL MARCO ¡BASTA!`.

**Cabecera del bloque** — un separador `---`, el H2 `## MARCOS DE ATRACCIÓN — CÓMO EL MUNDO LLEGA A LA ARGENTINA`, y dos o tres párrafos de entrada que digan:
- Qué distingue este bloque del de MARCOS OPERATIVOS: aquel construye la implementación puertas adentro; este es cómo llega el mundo.
- **El reloj.** Australia legalizó terapia psicodélica con MDMA y psilocibina en 2023; Oregon abrió su programa el mismo año (S2.9 y S2.7 ya lo registran). La ventana para ser sede y no ser un mercado más tiene fecha de vencimiento, y el documento hasta acá no extrajo la consecuencia.
- La secuencia clínica → laboratorio → fábrica, y que está ordenada por cuánta macro argentina necesita arreglada cada tramo. La clínica es la única que se puede empezar sin resolver antes el problema monetario.

**S28**, con epígrafe entre `>` como todas las secciones del documento, y estas subsecciones H3 correlativas:

| H3 | Contenido obligatorio |
|---|---|
| `### 28.1 El activo que nadie más puede construir` | La investigación psicodélica está limitada por tamaño de muestra: los ensayos que S2.11 ya cita trabajan con decenas de sujetos. Oregon tiene un estado, Australia un carril angosto, Suiza excepciones caso por caso. Hace falta legalidad a escala nacional **y** volumen, y eso solo lo tiene un país que legalizó entero |
| `### 28.2 Qué es el Registro` | Registro Nacional de Resultados Terapéuticos. Instrumentos validados, medición basal y a 1 semana, 1 mes, 3 meses y 12 meses. **El seguimiento clínico y la captura del dato son el mismo mecanismo**: el visitante que se va necesita integración por razones médicas, y ese protocolo es el que llena el Registro |
| `### 28.3 Consentimiento` | Granular, revocable, con opción de participar sin identificación. El dato es de la persona antes que del Estado |
| `### 28.4 Soberanía del dato` | Fideicomiso público bajo ley argentina. **No se vende, no se exporta como base, no se licencia en propiedad — se da acceso.** Gratuito para investigación pública argentina, arancelado para uso comercial, escalonado por tamaño del solicitante |
| `### 28.5 Lo que se lleva quien usa el Registro` | Coautoría argentina obligatoria en toda publicación derivada. Participación en patentes que lo usen como evidencia de respaldo. Extiende S27 (Nagoya, conocimiento tradicional) |
| `### 28.6 Gobernanza` | ANSUS + ANMAT + CONICET + un comité de personas tratadas **con voto, no consultivo** |
| `### 28.7 Por qué esto también es el seguro contra el enclave` | Si el activo fuera tierra o mano de obra barata, el capital vendría, extraería y se iría. Un registro público bajo ley argentina **no se lleva en un contenedor** |

Remisión conceptual explícita a **PLANPREGUNTA** (ordinal 25, el PLAN del conocimiento).

**Prohibido en esta sección:** cualquier cifra de tamaño de mercado, empleo o recaudación. No hay fuente todavía (spec §10.1). Si hace falta magnitud, se escribe la relación cualitativa.

- [ ] **Step 4: Correr la guardia — tiene que pasar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

Esperado: `PLANSUS OK: 32 secciones, 1 cifras con domicilio, …`

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSUS_Argentina_ES.md" SocialJusticeHub/scripts/verificar-plansus.ts
git commit -m "Add la SECCION 28 de PLANSUS — el Registro, y el bloque que lo contiene

El activo argentino no son las sustancias, que va a tener medio mundo en diez
anios: es la evidencia. Legalidad a escala nacional mas volumen es la
combinacion que ninguna jurisdiccion tiene hoy, y es la unica que produce un
registro longitudinal que ninguna biotech puede comprar en otro lado.

El seguimiento clinico del visitante que se va y la captura del dato son el
mismo mecanismo: una inversion, dos resultados. Y el Registro es el seguro
contra el enclave, porque un registro bajo ley argentina no se lleva en un
contenedor."
```

---

## Task 4: SECCIÓN 29 — La Puerta Clínica

La sección operativa del bloque, y la que carga el riesgo reputacional del PLAN entero.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` (después de S28)
- Modify: `SocialJusticeHub/scripts/verificar-plansus.ts`

**Interfaces:**
- Consumes: el ancla `Registro Nacional de Resultados Terapéuticos` (Task 3), los candados (Task 2).
- Produces: el ancla `admisión clínica única`, que las tareas 7 y 8 citan.

- [ ] **Step 1: Agregar las expectativas a la guardia (va a fallar)**

En `SECCIONES_ESPERADAS`, después de la S28:

```typescript
  '## SECCIÓN 29: LA PUERTA CLÍNICA — EL PACIENTE QUE VIENE DE AFUERA',
```

En `CIFRAS_CANONICAS` — las de ICEERS, que son el sostén empírico de la sección:

```typescript
  { cifra: '58 muertes', domicilio: ['ICEERS'], desc: 'muertes atribuidas a ayahuasca 2010-2022' },
  { cifra: '4 millones', domicilio: ['ICEERS'], desc: 'el denominador — sin esto la cifra de muertes miente' },
```

En `PROHIBIDOS` — el candado de doble filo de la doctrina:

```typescript
  {
    patron: 'AFIP',
    porque: 'la AFIP fue disuelta en octubre de 2024; el fisco se llama ARCA',
  },
  {
    patron: 'muertes por ayahuasca',
    excepcion: 'ICEERS',
    porque: 'la atribución sin fuente es exactamente lo que ICEERS refuta; va con domicilio o no va',
  },
```

- [ ] **Step 2: Correr la guardia — tiene que fallar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

Esperado: FALLA con `falta la sección: ## SECCIÓN 29: …`, más `la cifra canónica «58 muertes» … no aparece en ninguna parte` y lo mismo para `«4 millones»`.

- [ ] **Step 3: Escribir la S29**

Epígrafe entre `>`. Subsecciones H3 correlativas:

| H3 | Contenido obligatorio |
|---|---|
| `### 29.1 Qué mata de verdad, y qué no` | **Los datos de ICEERS, con denominador siempre.** 58 muertes atribuidas a ayahuasca entre 2010 y 2022; solo 34 con consumo verificado; 9 autopsias públicas y ninguna la atribuye a la sustancia; ningún análisis forense determinó jamás una muerte por intoxicación aguda. Contra un denominador de ~4 millones de personas que la tomaron alguna vez, ~820.000 solo en 2019. Y después las causas **efectivamente** identificadas: envenenamiento por tabaco (4 confirmados, la más frecuente — **no es la sustancia del titular**), infarto (2), escopolamina y 5-MeO-DMT sintético, hiponatremia (1), ahogamientos y accidentes por lapsos de supervisión, homicidios (8, solo 2 con el agresor bajo efectos), y suicidios (14 vinculados por prensa, 1 con consumo reciente confirmado). Más el factor agravante: los incidentes ocurren lejos de atención médica |
| `### 29.2 Los cuatro controles` | Uno por causa. (1) **Se licencia el protocolo completo, no la molécula**: la licencia declara todo lo que se administra —purgas, rapé, kambó, hidratación— y administrar algo no declarado es revocación inmediata. (2) Tamizaje cardiovascular, psiquiátrico y de medicación, **remoto y anticipado**, porque la reconciliación de medicación exige ventana de lavado de semanas: ocurre antes de que la persona compre el pasaje. (3) Supervisión continua con ratio declarado, personal despierto y sobrio durante la sesión y el descenso. (4) **Distancia máxima declarada a atención crítica**, verificada en la habilitación |
| `### 29.3 La ventaja que no se puede copiar` | Salta, Jujuy, Córdoba, Mendoza y Patagonia tienen hospital de complejidad a distancia razonable; la Amazonia, estructuralmente, no. Argentina puede ofrecer la ceremonia con terapia intensiva cerca **y puede auditarlo**. Es una promesa que un destino de bienestar no puede hacer |
| `### 29.4 La admisión clínica única` | Todo no residente pasa por **una sola admisión clínica**, sea terapéutica o ceremonial. Después hay muchas habitaciones. **El Estado no toca la ceremonia: toca al visitante antes de que llegue.** S5.1 queda intacta — la soberanía comunitaria sobre el protocolo no se toca; la responsabilidad del Estado sobre la salud de quien pisa su territorio nunca se cedió |
| `### 29.5 Certificación de centros` | Tres niveles: clínico (Vía Terapéutica), comunitario receptivo (Vía Ceremonial que **optó** por recibir), y centro de integración |
| `### 29.6 Seguro y responsabilidad del no residente` | Responsabilidad civil transfronteriza. Engancha con S21.3, que tiene el marco asegurador doméstico y le falta esta pata |
| `### 29.7 La integración que cruza la frontera` | Teleseguimiento obligatorio a 1 semana, 1 mes y 3 meses; convenio de derivación con profesional en el país de origen cuando exista. Es lo mismo que alimenta el Registro de S28 |
| `### 29.8 Cuando sale mal` | Protocolo de evento adverso: escalamiento, repatriación médica, notificación consular, y **protocolo de prensa**. Escrito antes del primer incidente, con la lógica declarada de S23 — que nos ataquen, pero que no nos encuentren improvisando |
| `### 29.9 Régimen fiscal del visitante` | La exención de la Vía Ceremonial **no alcanza al no residente**: quien viene de afuera tributa, vaya donde vaya. Recauda **ARCA** |
| `### 29.10 Posicionamiento` | No se compite por precio contra Costa Rica. Se compite por credibilidad auditable contra Suiza, a una fracción del precio |

**Hueco declarado en el propio texto:** el visitante que vuelve a una jurisdicción donde su tratamiento es delito (spec §10.3). Se escribe como pregunta abierta, no se finge resuelto.

- [ ] **Step 4: Correr la guardia — tiene que pasar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

Esperado: `PLANSUS OK: 33 secciones, 3 cifras con domicilio, 2 prohibidos, …`

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSUS_Argentina_ES.md" SocialJusticeHub/scripts/verificar-plansus.ts
git commit -m "Add la SECCION 29 de PLANSUS — la puerta clinica, y lo que de verdad mata

ICEERS reviso 58 muertes atribuidas a ayahuasca entre 2010 y 2022 y ningun
analisis forense determino jamas una muerte por intoxicacion aguda, sobre un
denominador de cuatro millones de personas. Lo que si mata: envenenamiento
por tabaco, infarto, sustancias no declaradas, hiponatremia, lapsos de
supervision y homicidio.

De ahi salen cuatro controles en vez de uno generico, y la ventaja argentina
que la version anterior no veia: distancia a terapia intensiva. La Amazonia,
estructuralmente, no la tiene.

Y la puerta unica resuelve la tension ceremonial sin que el Estado vuelva a
meterse donde PLANSUS acaba de sacarlo: no toca la ceremonia, toca al
visitante antes de que llegue."
```

---

## Task 5: SECCIÓN 30 — El Régimen de Atracción

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` (después de S29)
- Modify: `SocialJusticeHub/scripts/verificar-plansus.ts`

**Interfaces:**
- Consumes: el ancla `Registro Nacional de Resultados Terapéuticos` (Task 3).
- Produces: el ancla `acuerdos de nivel de servicio`, que la Task 9 cita en la hoja de ruta.

- [ ] **Step 1: Agregar las expectativas a la guardia (va a fallar)**

En `SECCIONES_ESPERADAS`, después de la S29:

```typescript
  '## SECCIÓN 30: EL RÉGIMEN DE ATRACCIÓN — CAPITAL, EMPRESAS Y EL PROBLEMA ARGENTINO',
```

En `CIFRAS_CANONICAS`:

```typescript
  { cifra: '0,10% del PBI', domicilio: ['piso', 'Escalera', 'PLANPACTO'], desc: 'el piso de PLANSUS contra la Escalera de PLANPACTO' },
  { cifra: '2,40%', domicilio: ['PLANPACTO', 'Escalera'], desc: 'lo que la Escalera conserva del gasto primario consolidado' },
```

- [ ] **Step 2: Correr la guardia — tiene que fallar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

Esperado: FALLA con `falta la sección: ## SECCIÓN 30: …` y las dos cifras sin aparecer.

- [ ] **Step 3: Escribir la S30**

Epígrafe entre `>`. Arranca reconociendo que **la ley de drogas no es el cuello de botella**. Subsecciones H3:

| H3 | Contenido obligatorio |
|---|---|
| `### 30.1 Qué necesita de verdad una empresa para venir` | En orden, y el orden importa: previsibilidad regulatoria, estabilidad de reglas con plazo cierto, repatriación de utilidades, y **recién después** incentivo fiscal. La mayoría de los regímenes argentinos empiezan por el último |
| `### 30.2 El producto real: el tiempo` | **Acuerdos de nivel de servicio vinculantes de ANSUS y ANMAT.** En biotech la moneda es el tiempo, no el impuesto: un dictamen en plazo cierto con penalidad por incumplimiento vale más que una exención. Y es lo único de la lista de 30.1 que PLANSUS puede entregar por sí mismo, sin depender de nadie |
| `### 30.3 Régimen de estabilidad sectorial` | Plazo cierto, **con obligaciones**: transferencia tecnológica, copropiedad local, coautoría, participación en patentes. Sin obligaciones es un regalo, no un régimen |
| `### 30.4 El enclave, dicho de frente` | El capital que viene, extrae y se va. Las contramedidas de 30.3, más el argumento estructural de S28.7: el activo es un registro bajo ley argentina y no se lleva en un contenedor |
| `### 30.5 Las compuertas que PLANSUS no controla` | La tabla de la spec §2: **la clínica** no tiene bloqueante externo y se puede empezar con el cepo puesto; **el laboratorio** depende de PLANPACTO; **la fábrica** depende de PLANMON. Se declaran como compuertas con la misma mecánica de S18, y se dice que el bloque vale igual si nunca se abren, porque la clínica es autónoma por diseño |
| `### 30.6 Lo que PLANSUS pide y lo que devuelve` | PLANSUS reclama **0,10% del PBI** — el piso más chico del canon, empatado con PLANEB y PLANISV, contra 0,50–1,50% de PLANSAL. La Escalera de PLANPACTO conserva **2,40%** del gasto primario consolidado y los pisos declarados del corpus suman 7,82–9,41% del PBI. La formulación es «pide el piso más chico y es el que más rápido lo devuelve», **no** «no pide piso» — eso sería falso y el canon lo desmiente en una línea |

- [ ] **Step 4: Correr la guardia — tiene que pasar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

Esperado: `PLANSUS OK: 34 secciones, 5 cifras con domicilio, …`

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSUS_Argentina_ES.md" SocialJusticeHub/scripts/verificar-plansus.ts
git commit -m "Add la SECCION 30 de PLANSUS — el capital, y el problema que no es la ley de drogas

La seccion honesta: nadie muda un pipeline de patentes a un pais donde las
reglas cambian cada eleccion, y nadie inmoviliza capital donde no puede sacar
la utilidad. El cuello de botella es la macro, no la prohibicion.

Lo unico que PLANSUS puede entregar solo es tiempo: acuerdos de nivel de
servicio vinculantes de ANSUS y ANMAT. En biotech un dictamen en plazo cierto
vale mas que una exencion.

Y el piso queda dicho bien: 0,10% del PBI, el mas chico del canon, contra el
2,40% que conserva la Escalera. Pide el piso mas chico y es el que mas rapido
lo devuelve — no 'no pide piso', que es falso."
```

---

## Task 6: SECCIÓN 31 — El Talento

Corta a propósito. Extiende S25.3 en vez de duplicarla.

**Decisión pendiente de la spec §10.7:** si al escribirla queda por debajo de ~400 palabras y sin tabla propia, **pliegala como `### 30.7` en vez de sección propia** y sacá la entrada de `SECCIONES_ESPERADAS`. Anotá cuál elegiste en el mensaje de commit.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` (después de S30)
- Modify: `SocialJusticeHub/scripts/verificar-plansus.ts`

- [ ] **Step 1: Agregar la expectativa a la guardia (va a fallar)**

```typescript
  '## SECCIÓN 31: EL TALENTO — QUIÉN VIENE, QUIÉN VUELVE',
```

- [ ] **Step 2: Correr la guardia — tiene que fallar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

Esperado: FALLA con `falta la sección: ## SECCIÓN 31: …`

- [ ] **Step 3: Escribir la S31**

Epígrafe entre `>`. Tres bloques, sin subsecciones numeradas si queda corta:
- **Visa de investigador** y **visa de paciente de corta estadía**, atadas a la admisión clínica única de S29.4.
- **Programa de retorno** para investigadores argentinos en el exterior. S9.2 ya dice que Argentina «tiene neurocientíficos de clase mundial y les paga sueldos de miseria» — esta sección es la contracara operativa de esa frase.
- Remisión a **PLANPUERTA** (ordinal 27), cuya función objetivo es **el arraigo y no las llegadas**: es exactamente el criterio correcto acá, porque se buscan investigadores que se queden, no que pasen. Y extiende el pipeline de S25.3 en vez de duplicarlo — decirlo explícito.

- [ ] **Step 4: Correr la guardia — tiene que pasar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSUS_Argentina_ES.md" SocialJusticeHub/scripts/verificar-plansus.ts
git commit -m "Add la SECCION 31 de PLANSUS — el talento, con arraigo como criterio

La Seccion 9.2 dice que el pais tiene neurocientificos de clase mundial y les
paga sueldos de miseria. Esta es la contracara operativa: visa de
investigador, visa de paciente, y programa de retorno.

El criterio lo presta PLANPUERTA: se mide por arraigo y no por llegadas. Acá
es exactamente lo que corresponde — se buscan investigadores que se queden,
no que pasen."
```

---

## Task 7: E1 — Reescribir S9.4

Sin esto, dos secciones del mismo documento describen dos industrias distintas.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` (S9.4, líneas ~861-870)
- Modify: `SocialJusticeHub/scripts/verificar-plansus.ts`

- [ ] **Step 1: Agregar el prohibido a la guardia (va a fallar)**

En `PROHIBIDOS`:

```typescript
  {
    patron: 'Cannabis + vino',
    porque: 'S9.4 quedaba con marco de bienestar; S29 volvió la puerta médica (E1)',
  },
```

- [ ] **Step 2: Correr la guardia — tiene que fallar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

Esperado: FALLA con `prohibido «Cannabis + vino» … en: «- **Cannabis + vino** en Mendoza…»`

- [ ] **Step 3: Reescribir S9.4**

Reemplazar el cuerpo de `### 9.4 Pilar 4: Turismo de Conciencia` conservando el H3. Cambios obligatorios:
- El encuadre pasa de bienestar a **médico**: el visitante es paciente, no turista, y entra por la admisión clínica única de S29.4.
- **Sale** el ítem de cannabis con vino en Mendoza. Es el que ancla la lectura de fiesta, que es exactamente la trampa holandesa que S2.5 ya describe.
- Los retiros del Norte **se mantienen**, con la corrección de E2: las comunidades son cofacilitadoras y copropietarias, la atestación no es transferible, y el visitante extranjero tributa.
- Se conserva el rango de precio existente (USD 3.000–15.000 por semana) **solo si ya tenía fuente en el documento**; si no la tenía, se declara como rango estimado sin fuente.
- Remisión explícita a S29 para todo lo operativo. S9.4 describe el pilar productivo; S29 describe la puerta.

- [ ] **Step 4: Correr la guardia — tiene que pasar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSUS_Argentina_ES.md" SocialJusticeHub/scripts/verificar-plansus.ts
git commit -m "Fix la Seccion 9.4 — el turismo deja de ser bienestar y pasa a ser medicina

Con la Seccion 29 escrita, la 9.4 describia otra industria: retiros con marco
de bienestar y cannabis con vino en Mendoza. Ese item es el que ancla la
lectura de fiesta — la trampa holandesa que la propia Seccion 2.5 describe — y
si el pais se lee asi, la pharma seria no viene y el tramo B muere.

Los retiros del Norte quedan, con las comunidades como copropietarias y con la
atestacion no transferible."
```

---

## Task 8: E4, E5, E6 — Cifras, riesgos y críticas

Las tres ediciones que meten el bloque nuevo dentro de la maquinaria existente en vez de dejarlo aparte.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` (S13.2 ~línea 1139, S15 ~línea 1199, S16 ~línea 1232)

- [ ] **Step 1: E4 — la fila de turismo en S13.2**

En la TABLA 13.2, la fila `Turismo de conciencia expandida` cambia de base: ya no es turismo de bienestar sino tratamiento médico de no residentes. **No inventar números nuevos.** Renombrar la fila a `Tratamiento de no residentes (Sección 29)` y, si las cifras existentes no tienen fuente en el documento, marcarlas explícitamente como estimación sin fuente en la nota al pie de la tabla. Recalcular la fila TOTAL si cambia algún valor.

- [ ] **Step 2: E5 — tres filas nuevas en la matriz de riesgo de S15**

Agregar, con el mismo formato de columnas que ya tiene la tabla:

| Riesgo | Probabilidad | Mitigación |
|---|---|---|
| Muerte de un visitante extranjero | Baja por caso, alta en impacto | Los cuatro controles de S29.2 + protocolo de evento adverso y de prensa de S29.8, escritos antes del primer incidente |
| Captura del Registro por un actor externo | Media | Fideicomiso público no licenciable en propiedad, coautoría obligatoria (S28.4, S28.5) |
| Enclave: el capital extrae y se va | Media-alta | Obligaciones del régimen de S30.3 + el activo no es transportable (S28.7) |

- [ ] **Step 3: E6 — dos Q&A nuevas en S16**

Con el formato de pregunta y respuesta que la sección ya usa:

- **«¿Esto no es turismo de drogas?»** — Se responde con el denominador de S29.1: ICEERS revisó 58 muertes atribuidas a ayahuasca entre 2010 y 2022 y ningún análisis forense determinó una muerte por intoxicación aguda, sobre ~4 millones de personas. Y con la diferencia de arquitectura: la puerta es clínica, hay médico responsable, y el visitante entra por la Vía Terapéutica y no por la exención ceremonial.
- **«¿No están vendiendo el país?»** — Se responde con S28.4 y S30.3: el Registro es de un fideicomiso público bajo ley argentina, no se vende ni se exporta como base; y el régimen de estabilidad tiene obligaciones de transferencia, copropiedad y coautoría. Vender el país sería dar la exención sin la obligación.

- [ ] **Step 4: Correr la guardia — tiene que pasar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSUS_Argentina_ES.md"
git commit -m "Fix la 13.2, la 15 y la 16 — el bloque nuevo entra a la maquinaria vieja

El riesgo nuevo va a la matriz que ya existe y no a una propia, y las dos
criticas garantizadas se responden donde el documento ya responde criticas.

La fila de turismo de la 13.2 cambio de base al cambiar el modelo: ya no es
bienestar, es tratamiento de no residentes. Las cifras que no tenian fuente
quedan marcadas como estimacion, no maquilladas."
```

---

## Task 9: E7 — El Registro arranca en la Pre-Fase

La decisión de secuencia más importante del bloque. Si el Registro arranca después, se pierde el dato desde la primera sesión legal y el activo nace mutilado.

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` (S18, Pre-Fase «Los Cimientos», ~línea 1321)
- Modify: `SocialJusticeHub/scripts/verificar-plansus.ts`

- [ ] **Step 1: Agregar el chequeo de secuencia a la guardia (va a fallar)**

```typescript
/**
 * E7: el Registro tiene que estar nombrado DENTRO de la Pre-Fase de S18, no
 * después. Se mide por posición: el índice de la primera mención del Registro
 * en la hoja de ruta tiene que caer entre el H3 de la Pre-Fase y el de Fase 1.
 */
function verificarRegistroEnPreFase(lineas: string[]): string[] {
  const iPre = lineas.findIndex((l) => l.startsWith('### Pre-Fase'));
  const iF1 = lineas.findIndex((l) => l.startsWith('### Fase 1'));
  if (iPre === -1 || iF1 === -1) return ['no se encontraron los H3 de Pre-Fase y Fase 1 en S18'];
  if (iF1 < iPre) return ['la Fase 1 aparece antes que la Pre-Fase en S18'];
  const bloque = lineas.slice(iPre, iF1).join('\n');
  return bloque.includes('Registro')
    ? []
    : ['E7: la Pre-Fase de S18 no nombra el Registro — el activo nacería sin el dato de las primeras sesiones'];
}
```

Y sumar `...verificarRegistroEnPreFase(lineas),` a `main()`.

- [ ] **Step 2: Correr la guardia — tiene que fallar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

Esperado: FALLA con `E7: la Pre-Fase de S18 no nombra el Registro…`

- [ ] **Step 3: Escribir E7**

En la Pre-Fase «Los Cimientos» (meses -12 a 0) de S18, agregar los entregables del bloque nuevo:
- **Registro Nacional de Resultados Terapéuticos operativo antes de la primera sesión legal**: instrumentos elegidos, arquitectura de consentimiento aprobada, fideicomiso constituido. La razón, dicha explícita: el dato de las primeras sesiones no se puede recuperar después.
- Norma de certificación de centros receptivos (S29.5) y protocolo de admisión clínica única (S29.4) publicados antes de la Fase 1.
- Acuerdos de nivel de servicio de ANSUS y ANMAT (S30.2) definidos, aunque todavía sin contraparte.

Y en Fase 1 y Fase 2, ubicar lo que corresponde: apertura de la puerta clínica en Fase 1; compuertas de laboratorio y fábrica en Fase 2 y 3, **condicionadas a PLANPACTO y PLANMON** según S30.5.

- [ ] **Step 4: Correr la guardia — tiene que pasar**

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts
```

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSUS_Argentina_ES.md" SocialJusticeHub/scripts/verificar-plansus.ts
git commit -m "Fix la hoja de ruta — el Registro arranca en la Pre-Fase, no despues

Es la decision de secuencia mas importante del bloque: el dato de las primeras
sesiones legales no se puede recuperar despues. Si el Registro arranca en la
Fase 1, el activo nace mutilado y nadie se entera hasta que lo necesite.

La guardia lo mide por posicion, no por presencia: el Registro tiene que estar
nombrado entre el H3 de la Pre-Fase y el de la Fase 1."
```

---

## Task 10: Integración con el corpus

**Files:**
- Modify: `Iniciativas Estratégicas/PLANSUS_Argentina_ES.md` (bloque `## INTEGRACIÓN CON EL MARCO ¡BASTA!`, ~línea 2074)
- Modify: `SocialJusticeHub/shared/arquitecto-data.ts`
- Modify: `Iniciativas Estratégicas/DEPENDENCY_GRAPH.yml`
- Modify: `SocialJusticeHub/client/public/docs/PLANSUS_Argentina_ES.md`

- [ ] **Step 1: Actualizar el bloque de integración del propio documento**

En `## INTEGRACIÓN CON EL MARCO ¡BASTA!`, en «Lo que PLANSUS necesita de otros» agregar PLANMON (salida del cepo, compuerta de la fábrica), PLANPACTO (estabilidad, compuerta del laboratorio) y PLANPUERTA (régimen migratorio, S31). En «Lo que PLANSUS aporta» agregar el Registro como activo de conocimiento para PLANPREGUNTA, y divisas y empleo territorial.

- [ ] **Step 2: Agregar las aristas al grafo**

En `SocialJusticeHub/shared/arquitecto-data.ts`, en la entrada de PLANSUS, agregar a `requires` las claves de PLANMON, PLANPACTO y PLANPUERTA, y a `provides` la de PLANPREGUNTA — **usando exactamente el formato de `kind` que ya usan las entradas vecinas**. Leé dos entradas cercanas antes de escribir la tuya.

Lo mismo en `Iniciativas Estratégicas/DEPENDENCY_GRAPH.yml`, siguiendo el formato del archivo.

- [ ] **Step 3: Copiar el documento al front**

```bash
cd "/Users/juanb/Desktop/ElInstantedelHombreGris" && cp "Iniciativas Estratégicas/PLANSUS_Argentina_ES.md" SocialJusticeHub/client/public/docs/PLANSUS_Argentina_ES.md && diff -q "Iniciativas Estratégicas/PLANSUS_Argentina_ES.md" SocialJusticeHub/client/public/docs/PLANSUS_Argentina_ES.md && echo "copia idéntica"
```

Esperado: `copia idéntica`

- [ ] **Step 4: Verificar tipos y rutas**

```bash
cd SocialJusticeHub && npm run check && npm run check:routes
```

Esperado: ambos en verde. Si `npm run check` falla en `arquitecto-data.ts`, el `kind` que escribiste no existe en el tipo — mirá la definición, no fuerces un cast.

- [ ] **Step 5: Commit**

```bash
git add "Iniciativas Estratégicas/PLANSUS_Argentina_ES.md" "Iniciativas Estratégicas/DEPENDENCY_GRAPH.yml" SocialJusticeHub/shared/arquitecto-data.ts SocialJusticeHub/client/public/docs/PLANSUS_Argentina_ES.md
git commit -m "Add las aristas nuevas de PLANSUS al grafo y sincroniza la copia del front

PLANSUS pasa a requerir PLANMON y PLANPACTO — son las compuertas del
laboratorio y de la fabrica, declaradas en la Seccion 30.5 — y PLANPUERTA para
el talento. Y aporta el Registro a PLANPREGUNTA, que es donde ese activo tiene
su casa conceptual."
```

---

## Task 11: Verificación final y deudas

**Files:**
- Modify: `docs/DEUDAS.md`

- [ ] **Step 1: Correr TODAS las guardias, no solo la propia**

Es la lección explícita del tramo D: editar un documento corre sus líneas y rompe remisiones ajenas, y lo encuentra la guardia de otro.

```bash
cd SocialJusticeHub && npx tsx scripts/verificar-plansus.ts && npx tsx scripts/verificar-remisiones.ts && npx tsx scripts/verificar-planpacto.ts && npx tsx scripts/verificar-planarco.ts && npx tsx scripts/verificar-planpregunta.ts && npx tsx scripts/verificar-planfoco.ts && npx tsx scripts/verificar-planpuerta.ts
```

Esperado: las siete en verde. Si `verificar-remisiones.ts` falla, **una remisión ajena se rompió** — arreglala antes de seguir, no la anotes como deuda.

- [ ] **Step 2: Correr los tests y el build**

```bash
cd SocialJusticeHub && npm run verify
```

Esperado: verde.

- [ ] **Step 3: Registrar las dos deudas**

En `docs/DEUDAS.md`, con id correlativo nuevo (mirá el último usado antes de elegir):

1. **PLANSUS no tiene SECCIÓN 19.** Salta de S18 a S20. Preexistente a este trabajo. No se renumera porque renumerar corre todas las líneas del documento y el costo supera al beneficio; queda registrado para que nadie lo lea como pérdida de contenido.
2. **Las cifras de las secciones 28 a 31 no tienen fuente externa.** El bloque se escribió sin inventar números; los rangos de mercado, empleo y recaudación quedaron fuera a propósito (spec §10.1). Pendientes: tamaño del mercado global de turismo terapéutico, costo comparado de ensayo clínico Argentina vs. EE.UU./UE, y plazos actuales de dictamen de ANMAT — que son la base del acuerdo de nivel de servicio de S30.2.

- [ ] **Step 4: Commit**

```bash
git add docs/DEUDAS.md
git commit -m "Add dos deudas de PLANSUS — la SECCION 19 que no existe y las cifras sin fuente

El documento salta de la 18 a la 20 desde antes de este trabajo. No se
renumera: correr todas las lineas cuesta mas de lo que arregla.

Y el bloque nuevo se escribio sin inventar un solo numero. Lo que falta esta
listado con nombre para que se busque con fuente, no para que se rellene."
```

---

## Self-review de este plan

**Cobertura de la spec:** §4.2 los cuatro controles → Task 4. §4.3 puerta única → Task 4. §4.4 candado ceremonial → Task 2. §5 S28→Task 3, S29→Task 4, S30→Task 5, S31→Task 6. §6 E1→Task 7, E2/E3→Task 2, E4/E5/E6→Task 8, E7→Task 9. §7 integración → Task 10. §2 compuertas y piso → Task 5 (S30.5, S30.6). §10.1 cifras sin inventar → constraint global + Task 11. §11 ARCA → prohibido en Task 4.

**Sin cobertura, a propósito:** §10.2 (instrumentos clínicos del Registro), §10.3 (visitante que vuelve a jurisdicción prohibicionista — se escribe como hueco declarado en Task 4), §10.4 (reciprocidad regulatoria), §10.5 (articulación con el PMO), §10.6 (reconciliación presupuestaria). Los cinco quedan declarados en el documento o en DEUDAS, no resueltos.

**Consistencia de nombres:** `SECCIONES_ESPERADAS`, `CIFRAS_CANONICAS`, `PROHIBIDOS`, `CANDADOS`, `verificarSecciones`, `verificarCifras`, `verificarProhibidos`, `verificarPiso`, `verificarCandados`, `verificarRegistroEnPreFase` — mismos nombres en la Task 1 que los definió y en las 2, 4, 7 y 9 que los extienden.
